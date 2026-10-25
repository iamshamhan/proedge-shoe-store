-- Save the customer's WhatsApp contact separately from their phone.
alter table public.orders add column if not exists whatsapp text;
create schema if not exists proedge_private;
create table proedge_private.checkout_requests (
  id uuid primary key, fingerprint text not null, response jsonb not null,
  created_at timestamptz not null default now()
);
alter table proedge_private.checkout_requests enable row level security;
revoke all on proedge_private.checkout_requests from public,anon,authenticated;
create index checkout_requests_created_idx on proedge_private.checkout_requests(created_at);

create or replace function public.place_order(
  p_customer jsonb,
  p_items    jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_customer_name text;
  v_phone        text;
  v_whatsapp     text;
  v_email        text;
  v_address      text;
  v_city         text;
  v_postal_code  text;
  v_notes        text;

  v_item                 jsonb;
  v_requested_product_id uuid;
  v_variant_product_id   uuid;
  v_product_id           uuid;
  v_variant_id           uuid;
  v_variant_resolved     uuid;
  v_colour               text;
  v_size_value           text;
  v_size_system          text;
  v_quantity             integer;
  v_unit_price           integer;
  v_product_name         text;

  v_subtotal     bigint := 0;
  v_line_total   bigint;
  v_delivery_fee integer;
  v_total        bigint;

  v_order_id     uuid;
  v_order_number text;
  v_request_id uuid;
  v_fingerprint text;
  v_cached record;
  v_result jsonb;
  v_lines        jsonb := '[]'::jsonb;

  -- Settings defaults
  v_sale_enabled          boolean := false;
  v_discount_pct          numeric := 0;
  v_delivery_threshold    integer := 30000;
  v_default_fee           integer := 500;
  v_free_delivery_enabled boolean := true;
  v_max_items             integer := 30;
  v_max_qty               integer := 99;
begin
  if jsonb_typeof(p_customer) is distinct from 'object' or jsonb_typeof(p_items) is distinct from 'array'
    or octet_length(p_customer::text)>12000 or octet_length(p_items::text)>30000 then
    raise exception 'ERR_CUSTOMER_INVALID';
  end if;
  v_request_id := nullif(p_customer->>'requestId','')::uuid;
  v_fingerprint := encode(sha256(convert_to((p_customer-'requestId')::text||p_items::text,'UTF8')),'hex');
  if v_request_id is not null then
    perform pg_advisory_xact_lock(hashtextextended(v_request_id::text,0));
    select fingerprint,response into v_cached from proedge_private.checkout_requests where id=v_request_id;
    if found then
      if v_cached.fingerprint <> v_fingerprint then raise exception 'ERR_REQUEST_CHANGED'; end if;
      return v_cached.response;
    end if;
  end if;
  -- Try to load dynamic store settings if table exists
  begin
    select
      coalesce(sale_enabled, false),
      coalesce(sale_discount_percent, 0),
      coalesce(free_delivery_enabled, true),
      coalesce(free_delivery_threshold, 30000),
      coalesce(default_delivery_fee, 500)
    into
      v_sale_enabled,
      v_discount_pct,
      v_free_delivery_enabled,
      v_delivery_threshold,
      v_default_fee
    from public.store_settings
    where id = 'default';
  exception when others then
    null;
  end;

  -- Customer details validation
  v_customer_name := trim(coalesce(p_customer->>'fullName', p_customer->>'customer_name', ''));
  v_phone        := trim(coalesce(p_customer->>'phone', ''));
  v_whatsapp     := nullif(trim(coalesce(p_customer->>'whatsapp', '')), '');
  v_email        := nullif(trim(coalesce(p_customer->>'email', '')), '');
  v_address      := trim(coalesce(p_customer->>'address', ''));
  v_city         := trim(coalesce(p_customer->>'city', ''));
  v_postal_code  := nullif(trim(coalesce(p_customer->>'postalCode', p_customer->>'postal_code', '')), '');
  v_notes        := nullif(trim(coalesce(p_customer->>'notes', '')), '');

  if length(v_customer_name) not between 1 and 200 or v_phone = ''
    or length(v_address) not between 1 and 1000 or length(v_city) not between 1 and 100
    or length(coalesce(v_email,''))>254 or length(coalesce(v_notes,''))>4000
    or length(coalesce(v_postal_code,''))>20 then
    raise exception 'ERR_CUSTOMER_INVALID' using errcode = 'P0001';
  end if;

  if v_phone !~ '^0[0-9]{9}$' then
    raise exception 'ERR_CUSTOMER_INVALID' using errcode = 'P0001';
  end if;

  if v_whatsapp is not null and v_whatsapp !~ '^0[0-9]{9}$' then
    raise exception 'ERR_CUSTOMER_INVALID' using errcode = 'P0001';
  end if;

  if v_email is not null and v_email !~ '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$' then
    raise exception 'ERR_CUSTOMER_INVALID' using errcode = 'P0001';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'ERR_CART_EMPTY' using errcode = 'P0001';
  end if;

  if jsonb_array_length(p_items) > v_max_items then
    raise exception 'ERR_CART_TOO_LARGE' using errcode = 'P0001';
  end if;

  -- Validate each item and calculate totals WITHOUT deducting stock
  for v_item in select jsonb_array_elements(p_items)
  loop
    v_requested_product_id := nullif(coalesce(v_item->>'productId', v_item->>'product_id'), '')::uuid;
    v_quantity             := (v_item->>'quantity')::integer;

    if v_quantity is null or v_quantity < 1 or v_quantity > v_max_qty then
      raise exception 'ERR_INVALID_QTY' using errcode = 'P0001';
    end if;

    -- Variant resolution
    v_variant_id := nullif(coalesce(v_item->>'variantId', v_item->>'variant_id'), '')::uuid;
    if v_variant_id is not null then
      select pv.id, pv.product_id, pv.colour, coalesce(pv.size_system, 'EU'), coalesce(pv.size_value, pv.size::text)
        into v_variant_resolved, v_variant_product_id, v_colour, v_size_system, v_size_value
        from public.product_variants pv
       where pv.id = v_variant_id;

      if v_variant_resolved is null then
        raise exception 'ERR_VARIANT_UNAVAILABLE' using errcode = 'P0001';
      end if;

      if v_requested_product_id is not null and v_requested_product_id <> v_variant_product_id then
        raise exception 'ERR_VARIANT_UNAVAILABLE' using errcode = 'P0001';
      end if;

      v_product_id := v_variant_product_id;
    else
      if v_requested_product_id is null then
        raise exception 'ERR_VARIANT_UNAVAILABLE' using errcode = 'P0001';
      end if;

      v_product_id  := v_requested_product_id;
      v_colour      := trim(coalesce(v_item->>'colour', v_item->>'color', ''));
      v_size_value  := trim(coalesce(v_item->>'sizeValue', v_item->>'size_value', v_item->>'size', ''));
      v_size_system := trim(coalesce(v_item->>'sizeSystem', v_item->>'size_system', 'EU'));

      if v_colour = '' or v_size_value = '' then
        raise exception 'ERR_VARIANT_UNAVAILABLE' using errcode = 'P0001';
      end if;

      select pv.id, pv.colour, coalesce(pv.size_system, 'EU'), coalesce(pv.size_value, pv.size::text)
        into v_variant_resolved, v_colour, v_size_system, v_size_value
        from public.product_variants pv
       where pv.product_id  = v_product_id
         and lower(pv.colour) = lower(v_colour)
         and pv.size_system = v_size_system
         and (pv.size_value = v_size_value or pv.size::text = v_size_value)
       limit 1;

      if v_variant_resolved is null then
        raise exception 'ERR_VARIANT_UNAVAILABLE' using errcode = 'P0001';
      end if;
    end if;

    -- Verify parent product is active and get price
    select p.name, p.price
      into v_product_name, v_unit_price
      from public.products p
     where p.id = v_product_id
       and p.is_active = true;

    if v_product_name is null then
      raise exception 'ERR_PRODUCT_UNAVAILABLE' using errcode = 'P0001';
    end if;
    -- products.price is the same selling price shown in the storefront.


    v_line_total := v_unit_price * v_quantity;
    v_subtotal   := v_subtotal + v_line_total;

    v_lines := v_lines || jsonb_build_object(
      'product_id',   v_product_id,
      'variant_id',   v_variant_resolved,
      'name',         v_product_name,
      'colour',       v_colour,
      'size',         v_size_value,
      'size_system',  v_size_system,
      'size_value',   v_size_value,
      'quantity',     v_quantity,
      'unit_price',   v_unit_price,
      'line_total',   v_line_total
    );
  end loop;

  -- Delivery calculation
  if v_free_delivery_enabled and v_subtotal >= v_delivery_threshold then
    v_delivery_fee := 0;
  else
    v_delivery_fee := v_default_fee;
  end if;

  v_total := v_subtotal + v_delivery_fee;

  -- Limits are enforced here, including for direct API callers.
  perform pg_advisory_xact_lock(hashtextextended('proedge-checkout-rate',0));
  if (select count(*) from public.orders where created_at>now()-interval '1 hour' and phone=v_phone)>=5
    or (select count(*) from public.orders where created_at>now()-interval '1 hour')>=100 then
    raise exception 'ERR_RATE_LIMIT';
  end if;

  -- Generate sequential order number
  v_order_number := 'PROE-'
    || to_char(now(), 'YYMMDD')
    || '-'
    || lpad(nextval('public.orders_seq')::text, 5, '0');

  -- Insert order header (Pending WhatsApp Inquiry)
  insert into public.orders (
    order_number,
    customer_name,
    phone,
    whatsapp,
    email,
    address,
    city,
    postal_code,
    delivery_fee,
    subtotal,
    total,
    notes,
    status
  ) values (
    v_order_number,
    v_customer_name,
    v_phone,
    v_whatsapp,
    v_email,
    v_address,
    v_city,
    v_postal_code,
    v_delivery_fee,
    v_subtotal,
    v_total,
    v_notes,
    'pending'
  )
  returning id into v_order_id;

  -- Insert order items
  for v_item in select jsonb_array_elements(v_lines)
  loop
    insert into public.order_items (
      order_id,
      product_id,
      variant_id,
      product_name,
      colour,
      size,
      size_system,
      size_value,
      quantity,
      unit_price
    ) values (
      v_order_id,
      (v_item->>'product_id')::uuid,
      (v_item->>'variant_id')::uuid,
      v_item->>'name',
      v_item->>'colour',
      v_item->>'size',
      coalesce(v_item->>'size_system', 'EU'),
      coalesce(v_item->>'size_value', v_item->>'size'),
      (v_item->>'quantity')::integer,
      (v_item->>'unit_price')::integer
    );
  end loop;

  v_result := jsonb_build_object(
    'order_id',      v_order_id,
    'order_number',  v_order_number,
    'status',        'pending',
    'subtotal',      v_subtotal,
    'delivery_fee',  v_delivery_fee,
    'total',         v_total,
    'customer', jsonb_build_object(
      'fullName',    v_customer_name,
      'phone',       v_phone,
      'whatsapp',    v_whatsapp,
      'email',       v_email,
      'address',     v_address,
      'city',        v_city,
      'postalCode',  v_postal_code,
      'notes',       v_notes
    ),
    'items', v_lines
  );
  if v_request_id is not null then
    delete from proedge_private.checkout_requests where created_at<now()-interval '7 days';
    insert into proedge_private.checkout_requests(id,fingerprint,response) values(v_request_id,v_fingerprint,v_result);
  end if;
  return v_result;
end;
$$;

revoke all on function public.place_order(jsonb, jsonb) from public;
grant execute on function public.place_order(jsonb, jsonb) to anon, authenticated;
do $$
declare c uuid:=gen_random_uuid(); p uuid:=gen_random_uuid(); v uuid:=gen_random_uuid();
  request_id uuid:=gen_random_uuid(); customer jsonb; items jsonb; a jsonb; b jsonb; n integer;
begin
  begin
    perform set_config('request.jwt.claims','{"role":"anon"}',true);
    insert into public.categories(id,slug,name) values(c,'checkout-test-'||c,'Checkout test');
    insert into public.products(id,category_id,slug,name,price,is_on_sale) values(p,c,'checkout-test-'||p,'Checkout test',10000,false);
    insert into public.product_variants(id,product_id,colour,size_system,size_value,stock) values(v,p,'Black','EU','42',7);
    customer:=jsonb_build_object('requestId',request_id,'fullName','Fixture','phone','0'||floor(100000000+random()*899999999)::text,
      'whatsapp','0770000001','email','fixture@example.com','address','Fixture','city','Fixture');
    items:=jsonb_build_array(jsonb_build_object('productId',p,'variantId',v,'quantity',2,'price',1));
    a:=public.place_order(customer,items);
    b:=public.place_order(customer,items);
    assert a=b,'Retry must return the same receipt';
    assert (a->>'subtotal')::integer=20000,'Price must come from products.price, ignoring supplied prices';
    assert (select count(*) from public.orders where id=(a->>'order_id')::uuid)=1,'Only one order on retry';
    assert (select whatsapp from public.orders where id=(a->>'order_id')::uuid)='0770000001','WhatsApp must persist';
    select stock into n from public.product_variants where id=v;
    assert n=7,'An inquiry must not reserve inventory';
    begin
      perform public.place_order(customer,jsonb_build_array(jsonb_build_object('variantId',v,'quantity',3)));
      raise exception 'Expected request reuse rejection';
    exception when raise_exception then
      if sqlerrm <> 'ERR_REQUEST_CHANGED' then raise; end if;
    end;
    for n in 1..4 loop
      perform public.place_order(jsonb_set(customer,'{requestId}',to_jsonb(gen_random_uuid())),items);
    end loop;
    begin
      perform public.place_order(jsonb_set(customer,'{requestId}',to_jsonb(gen_random_uuid())),items);
      raise exception 'Expected rate limit';
    exception when raise_exception then
      if sqlerrm <> 'ERR_RATE_LIMIT' then raise; end if;
    end;
    assert not has_table_privilege('anon','proedge_private.checkout_requests','SELECT'), 'Receipts must remain private';
    raise exception using errcode='ZX002',message='rollback successful checkout fixtures';
  exception when sqlstate 'ZX002' then null; end;
end; $$;

