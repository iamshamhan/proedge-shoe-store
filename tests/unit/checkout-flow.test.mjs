import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './load-ts.mjs';

function nodes(tree) {
  if (!tree || typeof tree !== 'object') return [];
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  return [tree, ...nodes(tree.props?.children)];
}
function setup(save) {
  const state=[]; let cursor=0; const calls=[]; let cleared=false;
  const jsx=(type,props)=>({type,props});
  const react={
    useState(initial){const i=cursor++; if(!(i in state))state[i]=initial;
      return [state[i],next=>{state[i]=typeof next==='function'?next(state[i]):next;}];},
    useRef(initial){const i=cursor++;if(!(i in state))state[i]={current:initial};return state[i];},
  };
  const item={id:'cart',productId:'product',variantId:'variant',name:'Client name',price:1000,quantity:1,size:'42',color:'Black'};
  const cart=loadTs('src/lib/cart.ts');
  const {CheckoutPage}=loadTs('src/components/checkout/checkout-page.tsx',{
    react:{...react,default:react},'react/jsx-runtime':{jsx,jsxs:jsx},
    'next/link':{default:'a'},'next/image':{default:'img'},'lucide-react':{},
    '@/context/cart-context':{useCart:()=>({items:[item],subtotal:1000,clearCart(){cleared=true;},replaceItems(){}})},
    '@/context/settings-context':{useStoreSettings:()=>({whatsappNumber:'94771234567'})},
    '@/lib/currency':{formatLKR:String},'@/lib/config':{getDeliveryFee:()=>500},
    '@/lib/whatsapp':{generateWhatsAppOrderLink:args=>{calls.push({receipt:args});return 'https://wa.me/fixture';}},
    '@/components/cart/use-cart-availability':{useCartAvailability:()=>({checking:false,error:null})},
    '@/app/checkout/cart-actions':{checkCart:async()=>({items:[item]})},
    '@/lib/cart':cart,'./turnstile':{Turnstile:'challenge'},
    '@/app/checkout/actions':{placeOrder:async(...args)=>{calls.push({args});return save(...args);}},
  });
  const render=()=>{cursor=0;return CheckoutPage();};
  for(const [name,value] of Object.entries({fullName:'Test',phone:'0771234567',address:'Address',city:'Colombo'})){
    nodes(render()).find(n=>n.props?.name===name).props.onChange({target:{name,value}});
  }
  return {render,calls,cleared:()=>cleared,
    challenge:token=>nodes(render()).find(n=>n.type==='challenge').props.onToken(token),
    submit:()=>nodes(render()).find(n=>n.type==='form').props.onSubmit({preventDefault(){}}),
    button:()=>nodes(render()).find(n=>n.type==='button'&&n.props.type==='submit')};
}

test('checkout flow requires a fresh challenge, retains retry ID and only clears a saved cart', async()=>{
  const savedWindow=globalThis.window;const savedStorage=globalThis.sessionStorage;
  const storage=new Map();const opened=[];
  globalThis.sessionStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
  globalThis.window={open:url=>opened.push(url)};
  try{
    let attempt=0;
    const h=setup(async()=>{
      if(++attempt===1)throw new Error('Network interrupted');
      return {success:true,order:{order_number:'RECEIPT',customer:{fullName:'Server customer',phone:'0771234567',address:'Address',city:'Colombo'},
        items:[{name:'Server shoe',size:'42',size_value:'42',colour:'Black',quantity:1,unit_price:2300,line_total:2300}],
        subtotal:2300,delivery_fee:500,total:2800}};
    });
    assert.equal(h.button().props.disabled,true);
    await h.submit();assert.equal(h.calls.length,0);
    h.challenge('token-one');assert.equal(h.button().props.disabled,false);
    h.challenge('');assert.equal(h.button().props.disabled,true);
    h.challenge('token-two');await h.submit();
    assert.equal(h.cleared(),false);assert.equal(h.button().props.disabled,true);
    assert.equal(h.calls[0].args[2],'token-two');
    h.challenge('token-three');await h.submit();
    assert.equal(h.calls[1].args[0].requestId,h.calls[0].args[0].requestId);
    assert.equal(h.calls[1].args[2],'token-three');
    assert.equal(h.calls[2].receipt.total,2800);
    assert.equal(h.calls[2].receipt.items[0].name,'Server shoe');
    assert.equal(h.cleared(),true);assert.deepEqual(opened,['https://wa.me/fixture']);
    assert.equal(storage.size,0);
  }finally{globalThis.window=savedWindow;globalThis.sessionStorage=savedStorage;}
});
