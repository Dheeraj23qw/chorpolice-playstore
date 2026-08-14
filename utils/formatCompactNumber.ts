export const formatCompactNumber = (value: number): string => {
  if (value >= 1_000_000) {
    const abbreviated = value / 1_000_000;
    return `${abbreviated % 1 === 0 ? abbreviated.toFixed(0) : abbreviated.toFixed(1)}M`;
  }

  if (value >= 1_000) {
    const abbreviated = value / 1_000;
    return `${abbreviated % 1 === 0 ? abbreviated.toFixed(0) : abbreviated.toFixed(1)}k`;
  }

  return value.toString();
};
