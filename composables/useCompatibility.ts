import { calculateCompatibility, getCompatibilityTier } from '~/utils/compatibility'

export const useCompatibility = () => {
  return {
    calculateCompatibility,
    getCompatibilityTier
  }
}
