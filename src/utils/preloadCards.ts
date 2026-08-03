import { imageUrlByIndex } from "./cardAssets";

export function preloadCardImages() {
  for (let i = 0; i < 78; i++) {
    const img = new Image();
    img.src = imageUrlByIndex(i);
  }
}
