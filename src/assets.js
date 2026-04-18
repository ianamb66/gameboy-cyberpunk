export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

export async function loadJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Failed to load JSON ${url}: ${r.status}`);
  return r.json();
}
