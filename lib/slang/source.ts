const WIKTIONARY_BASE = "https://en.wiktionary.org/wiki/";

export const LICENSE_NAME = "CC BY-SA 4.0";
export const LICENSE_URL = "https://creativecommons.org/licenses/by-sa/4.0/";

export function wiktionaryUrl(expression: string): string {
  return WIKTIONARY_BASE + encodeURIComponent(expression.replace(/ /g, "_"));
}
