/**
 * The cities M2M runs in, for labelling members and splitting stats.
 * A member's city comes from their free-text location via normalizeCity
 * ("Accra, East Legon" and "Westlands" both resolve).
 */
import { ACCRA_AREAS, NAIROBI_AREAS, normalizeCity } from './compatibility'

export type ServedCity = 'accra' | 'nairobi'
export type CityKey = ServedCity | 'other'

export const SERVED_CITIES: { key: ServedCity; label: string; country: string; flag: 'gh' | 'ke' }[] = [
  { key: 'accra', label: 'Accra', country: 'Ghana', flag: 'gh' },
  { key: 'nairobi', label: 'Nairobi', country: 'Kenya', flag: 'ke' }
]

export const memberCity = (location?: string | null): CityKey => {
  const c = normalizeCity(location)
  return c === 'accra' || c === 'nairobi' ? c : 'other'
}

export const memberCityLabel = (location?: string | null): string => {
  const c = memberCity(location)
  return SERVED_CITIES.find(s => s.key === c)?.label || 'Elsewhere'
}

/** Area names that count as a city, for building location filters */
export const cityAreaTerms = (city: ServedCity): string[] => (city === 'accra' ? ACCRA_AREAS : NAIROBI_AREAS)
