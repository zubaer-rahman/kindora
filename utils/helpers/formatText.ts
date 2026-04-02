export function formatText(...texts: (string | undefined)[]): string {
  if (texts.length === 0) return "";

  const formattedTexts = texts
    .filter((text) => text && text.trim() !== "")
    .map((text) => {
      if (!text) return "";
      return text
        .split("_")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");
    });

  return formattedTexts.join(", ");
}

export function formatLocation(area?: string, state?: string): string {
  const formattedArea = area ? formatText(area) : "";
  const formattedState = state ? formatText(state) : "";

  if (formattedArea && formattedState) {
    return `${formattedArea}, ${formattedState}`;
  }

  return formattedArea || formattedState || "";
}

export function formatSingleText(text?: string): string {
  if (!text) return "";
  return formatText(text);
}
