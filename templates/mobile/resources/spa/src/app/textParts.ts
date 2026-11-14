/**
 * How many SMS parts a text takes (the composer's counter): 160 characters in one part, 153 per part when split, as long
 * as every character is in the GSM 03.38 alphabet; any other character (an emoji, a curly quote) makes the whole text
 * UCS-2: 70 in one part, 67 per part. The extension table's characters (€ [ ] { } \ ~ ^ |) take two places.
 */
const GSM = '@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà'
const GSM_EXT = '^{}\\[~]|€'
const gsm = new Set([...GSM])
const ext = new Set([...GSM_EXT])

export interface TextParts {
  /** Characters typed (as the person counts them). */
  chars: number
  parts: number
  /** Room left in the last part. */
  left: number
  unicode: boolean
}

export function textParts(text: string): TextParts {
  const chars = [...text]
  const unicode = chars.some((c) => !gsm.has(c) && !ext.has(c))
  const units = unicode ? text.length : chars.reduce((n, c) => n + (ext.has(c) ? 2 : 1), 0)
  const single = unicode ? 70 : 160
  const multi = unicode ? 67 : 153
  if (units === 0) return { chars: 0, parts: 0, left: single, unicode }
  const parts = units <= single ? 1 : Math.ceil(units / multi)
  const left = (parts === 1 ? single : parts * multi) - units
  return { chars: chars.length, parts, left, unicode }
}
