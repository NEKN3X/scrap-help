function replaceGlossary(text: string, from: string, to: string): string {
  return text.replace(new RegExp(`\\{${from}\\}`, 'g'), to)
}

export function replaceGlossaryTerms(text: string, glossary: Record<string, string>): string {
  return Object.entries(glossary).reduce((acc, [key, value]) =>
    replaceGlossary(acc, key, value), text)
}
