export function sanitizeNumberInput(value: string | number): number {
  const sanitizedValue =
    typeof value === 'string'
      ? value.replace(/\s+/g, '').replace(/,/g, '.')
      : value;
  return parseFloat(sanitizedValue as string) || 0;
}
