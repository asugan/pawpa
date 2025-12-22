const toHex = (value: string): string | null => {
  if (!value.startsWith('#')) {
    return null;
  }

  if (value.length === 4) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
  }

  if (value.length === 7) {
    return value;
  }

  return null;
};

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const normalized = toHex(hex);
  if (!normalized) {
    return null;
  }

  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);

  if ([r, g, b].some((channel) => Number.isNaN(channel))) {
    return null;
  }

  return { r, g, b };
};

const getLuminance = (hexColor: string): number | null => {
  const rgb = hexToRgb(hexColor);
  if (!rgb) {
    return null;
  }

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const getReadableTextColor = (
  backgroundColor: string,
  lightColor: string,
  darkColor: string
): string => {
  const luminance = getLuminance(backgroundColor);
  if (luminance === null) {
    return darkColor;
  }

  return luminance > 0.5 ? darkColor : lightColor;
};
