const ONVEILIGE_PROTOCOLLEN = /(javascript:|vbscript:|data:text\/html)/gi
const HTML_TAGS = /<[^>]*>/g
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g

export function sanitiseerTekst(waarde: string): string {
  return waarde
    .replace(ONVEILIGE_PROTOCOLLEN, '')
    .replace(HTML_TAGS, ' ')
    .replace(CONTROL_CHARS, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function sanitiseerBestandsNaam(waarde: string): string {
  const basis = sanitiseerTekst(waarde)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return basis || 'persona'
}