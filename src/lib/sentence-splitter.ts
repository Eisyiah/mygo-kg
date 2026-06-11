const SENTENCE_ENDINGS = /([。！？.!?]+[」』"」']*)\s*/g;
const LINE_BREAK = /\n/g;

export function splitSentences(text: string): string[] {
  const cleaned = text.replace(LINE_BREAK, ' ').trim();
  if (!cleaned) return [];

  const sentences: string[] = [];
  let lastIndex = 0;

  const matches = cleaned.matchAll(SENTENCE_ENDINGS);
  for (const match of matches) {
    const end = (match.index ?? 0) + match[0].length;
    const sentence = cleaned.substring(lastIndex, end).trim();
    if (sentence) {
      sentences.push(sentence);
    }
    lastIndex = end;
  }

  const remaining = cleaned.substring(lastIndex).trim();
  if (remaining) {
    sentences.push(remaining);
  }

  return sentences;
}