export function formatText(...texts: (string | undefined)[]): string {
  if (texts.length === 0) return '';

  const formattedTexts = texts
    .filter((text) => text && text.trim() !== '')
    .map((text) => {
      if (!text) return '';
      return text
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    });

  return formattedTexts.join(', ');
}