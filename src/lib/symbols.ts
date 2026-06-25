export function isBseCode(code: string): boolean {
  return /^\d+$/.test(code.trim());
}

export function toYahooSymbol(code: string): string {
  const normalized = code.trim().toUpperCase();
  return isBseCode(normalized) ? `${normalized}.BO` : `${normalized}.NS`;
}

export function toGoogleSymbol(code: string): string {
  const normalized = code.trim().toUpperCase();
  return isBseCode(normalized) ? `${normalized}:BOM` : `${normalized}:NSE`;
}

export function getExchangeLabel(code: string): "NSE" | "BSE" {
  return isBseCode(code) ? "BSE" : "NSE";
}
