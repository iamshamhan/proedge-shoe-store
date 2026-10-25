const LOCAL_IMAGES = new Set([
  "photo-1542291026-7eec264c27ff",
  "photo-1511556532299-8f662fc26c06",
  "photo-1560769629-975ec94e6a86",
  "photo-1595950653106-6c9ebd614d3a",
  "photo-1544717305-2782549b5136",
  "photo-1584735935682-2f2b69dff9d2",
  "photo-1576091160550-2173dba999ef",
  "photo-1584308666744-24d5c474f2ae",
  "photo-1579338559194-a162d19bf842",
  "photo-1552346154-21d32810aba3",
  "photo-1519861531473-9200262188bf",
  "photo-1546519638-68e109498ffc",
  "photo-1574629810360-7efbbe195018",
  "photo-1552674605-db6ffd4facb5",
  "photo-1608231387042-66d1773070a5",
  "photo-1606107557195-0e29a4b5b4aa",
  "photo-1525966222134-fcfa99b8ae77",
  "photo-1515955656352-a1fa3ffcd111",
  "photo-1539185441755-769473a23570",
  "photo-1551107696-a4b0c5a0d9a2",
  "photo-1575537302964-96cd47c06b1b"
]);

export function localImage(url: string): string {
  if (!url.includes('images.unsplash.com')) return url;
  try {
    const id = new URL(url).pathname.slice(1);
    return LOCAL_IMAGES.has(id) ? '/images/catalog/' + id + '.webp' : '/product-placeholder.svg';
  } catch { return '/product-placeholder.svg'; }
}
