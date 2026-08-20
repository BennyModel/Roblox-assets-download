export function extractNumericId(input: string): number | undefined {
  const trimmed = input.trim();
  if (/^\d+$/.test(trimmed)) return Number(trimmed);

  const urlIdPatterns = [
    /\/(?:catalog|library|marketplace|bundles|avatar-shop|store)\/(\d+)/i,
    /[?&](?:id|assetId|bundleId)=([0-9]+)/i,
    /rbxassetid:\/\/([0-9]+)/i,
  ];

  for (const pattern of urlIdPatterns) {
    const match = trimmed.match(pattern);
    if (match) return Number(match[1]);
  }

  const anyNumber = trimmed.match(/\d{3,}/);
  return anyNumber ? Number(anyNumber[0]) : undefined;
}

export function looksLikeBundle(input: string): boolean {
  return /\/bundles?\//i.test(input) || /[?&]bundleId=/i.test(input);
}
