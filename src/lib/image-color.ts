export type Rgb = { r: number; g: number; b: number };

export type ImmersiveTheme = {
  background: string;
  backgroundRgb: Rgb;
  gradientMid: string;
  gradientEnd: string;
  composerBackground: string;
};

const FALLBACK_RGB: Rgb = { r: 10, g: 10, b: 26 };

export const FALLBACK_IMMERSIVE_THEME: ImmersiveTheme = {
  background: "#0a0a1a",
  backgroundRgb: FALLBACK_RGB,
  gradientMid: "rgba(10, 10, 26, 0.6)",
  gradientEnd: "#0a0a1a",
  composerBackground: "rgba(26, 26, 46, 0.83)",
};

function rgbToHex({ r, g, b }: Rgb): string {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function rgbToHsl({ r, g, b }: Rgb): { h: number; s: number; l: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: l * 100 };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  switch (max) {
    case rn:
      h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
      break;
    case gn:
      h = ((bn - rn) / d + 2) / 6;
      break;
    default:
      h = ((rn - gn) / d + 4) / 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb(h: number, s: number, l: number): Rgb {
  const sn = s / 100;
  const ln = l / 100;

  if (sn === 0) {
    const v = Math.round(ln * 255);
    return { r: v, g: v, b: v };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    let tn = t;
    if (tn < 0) tn += 1;
    if (tn > 1) tn -= 1;
    if (tn < 1 / 6) return p + (q - p) * 6 * tn;
    if (tn < 1 / 2) return q;
    if (tn < 2 / 3) return p + (q - p) * (2 / 3 - tn) * 6;
    return p;
  };

  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;

  return {
    r: Math.round(hue2rgb(p, q, h / 360 + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h / 360) * 255),
    b: Math.round(hue2rgb(p, q, h / 360 - 1 / 3) * 255),
  };
}

/**
 * Sample the lower portion of a hero image (weighted toward the bottom edge)
 * to derive a tint that blends naturally into scrollable content.
 */
export function extractAverageColorFromImage(
  image: HTMLImageElement,
  sampleSize = 48
): Rgb {
  const canvas = document.createElement("canvas");
  canvas.width = sampleSize;
  canvas.height = sampleSize;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return FALLBACK_RGB;

  ctx.drawImage(image, 0, 0, sampleSize, sampleSize);
  const { data } = ctx.getImageData(0, 0, sampleSize, sampleSize);

  let r = 0;
  let g = 0;
  let b = 0;
  let totalWeight = 0;

  for (let y = 0; y < sampleSize; y++) {
    for (let x = 0; x < sampleSize; x++) {
      const i = (y * sampleSize + x) * 4;
      if (data[i + 3] < 128) continue;

      const yWeight = 0.35 + (y / sampleSize) * 0.65;
      r += data[i] * yWeight;
      g += data[i + 1] * yWeight;
      b += data[i + 2] * yWeight;
      totalWeight += yWeight;
    }
  }

  if (totalWeight === 0) return FALLBACK_RGB;

  return {
    r: Math.round(r / totalWeight),
    g: Math.round(g / totalWeight),
    b: Math.round(b / totalWeight),
  };
}

/** Darken and slightly desaturate extracted color for readable body backgrounds. */
export function buildImmersiveTheme(source: Rgb): ImmersiveTheme {
  const { h, s } = rgbToHsl(source);

  const bgL = 12;
  const bgS = Math.min(48, Math.max(18, s * 0.7));
  const backgroundRgb = hslToRgb(h, bgS, bgL);

  const composerRgb = hslToRgb(h, bgS * 0.92, Math.min(18, bgL + 5));

  return {
    background: rgbToHex(backgroundRgb),
    backgroundRgb,
    gradientMid: `rgba(${backgroundRgb.r}, ${backgroundRgb.g}, ${backgroundRgb.b}, 0.6)`,
    gradientEnd: rgbToHex(backgroundRgb),
    composerBackground: `rgba(${composerRgb.r}, ${composerRgb.g}, ${composerRgb.b}, 0.83)`,
  };
}
