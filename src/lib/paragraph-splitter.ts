const PARAGRAPH_SPLIT_PATTERN = /\n\s*\n/;

export function splitParagraphs(text: string): string[] {
  return text.split(PARAGRAPH_SPLIT_PATTERN).filter((p) => p.trim().length > 0);
}