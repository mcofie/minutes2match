// Pre-rendered personality-type illustrations (a painted lovebird with its prop), 640×842 transparent WebP
const PERSONA_TYPES = ['power_player', 'romantic', 'adventurer', 'intellectual', 'social_butterfly', 'homebody']
export const personaArtSrc = (type?: string | null) =>
  `/lovebirds/persona-${PERSONA_TYPES.includes(type || '') ? type : 'social_butterfly'}.webp`
