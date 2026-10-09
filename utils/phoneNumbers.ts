// Phone number helpers for the countries we operate in (Ghana, Kenya).
// Forms keep the country code and the local number separately; these helpers
// parse typed/pasted input, validate it and build the +E.164 number.

export type PhoneCountryCode = '+233' | '+254'

export interface PhoneCountry {
  code: PhoneCountryCode
  flag: string
  name: string
  /** Example local number, used as the input placeholder */
  example: string
  /** Valid local mobile number (no leading 0) */
  pattern: RegExp
}

export const PHONE_COUNTRIES: PhoneCountry[] = [
  // Ghana mobile numbers: 9 digits starting with 2 or 5 (e.g. 24, 20, 55, 59)
  { code: '+233', flag: '🇬🇭', name: 'Ghana', example: '24 123 4567', pattern: /^[25]\d{8}$/ },
  // Kenya mobile numbers: 9 digits starting with 7 or 1 (e.g. 712, 110)
  { code: '+254', flag: '🇰🇪', name: 'Kenya', example: '712 345 678', pattern: /^[17]\d{8}$/ },
]

export const getPhoneCountry = (code: PhoneCountryCode) =>
  PHONE_COUNTRIES.find(c => c.code === code) ?? PHONE_COUNTRIES[0]!

/**
 * Splits typed or pasted input into a country and local digits.
 * Keeps `current` unless the input carries a country code (+233…, 00254…, 233XXXXXXXXX).
 * The local part keeps a leading 0 if typed, so the field doesn't jump while typing.
 */
export function parsePhoneInput(raw: string, current: PhoneCountryCode): { country: PhoneCountryCode; local: string } {
  const trimmed = raw.trim()
  let digits = trimmed.replace(/\D/g, '')
  const hasIntlPrefix = trimmed.startsWith('+') || trimmed.startsWith('00')
  if (trimmed.startsWith('00')) digits = digits.slice(2)

  let country = current
  for (const c of PHONE_COUNTRIES) {
    const cc = c.code.slice(1)
    if (digits.startsWith(cc) && (hasIntlPrefix || digits.length >= 12)) {
      country = c.code
      digits = digits.slice(cc.length)
      break
    }
  }

  return { country, local: digits.slice(0, 10) }
}

/** Local digits without the trunk 0 (0244123456 -> 244123456) */
export const stripTrunkZero = (local: string) => local.replace(/\D/g, '').replace(/^0+/, '')

export const isValidLocalPhone = (local: string, country: PhoneCountryCode) =>
  getPhoneCountry(country).pattern.test(stripTrunkZero(local))

export const toE164 = (local: string, country: PhoneCountryCode) => `${country}${stripTrunkZero(local)}`
