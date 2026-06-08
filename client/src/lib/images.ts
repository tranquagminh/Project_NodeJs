const PEXELS_POOL = [
  'https://images.pexels.com/photos/8007173/pexels-photo-8007173.jpeg',
  'https://images.pexels.com/photos/8007421/pexels-photo-8007421.jpeg',
  'https://images.pexels.com/photos/10544231/pexels-photo-10544231.jpeg',
  'https://images.pexels.com/photos/19902436/pexels-photo-19902436.jpeg',
  'https://images.pexels.com/photos/35300321/pexels-photo-35300321.jpeg',
];

function hashSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function resolveProductImage(url: string, slug?: string, size = 'w=400&h=440'): string {
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    return `${url}?auto=compress&cs=tinysrgb&${size}&fit=crop`;
  }
  const fallback = PEXELS_POOL[hashSlug(slug ?? url) % PEXELS_POOL.length];
  return `${fallback}?auto=compress&cs=tinysrgb&${size}&fit=crop`;
}

export function getProductMainImage(
  images: { url: string; isMain: boolean }[],
  slug: string,
  size?: string,
): string {
  const main = images.find((i) => i.isMain) ?? images[0];
  return resolveProductImage(main?.url ?? '', slug, size);
}
