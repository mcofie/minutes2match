// Profile photos are stored full size (often 0.3–1.5 MB). Supabase can resize on the fly, so ask for
// the size we actually draw (doubled for sharp screens): a 64px avatar downloads ~10 KB instead of ~1 MB.
// Anything that isn't a Supabase public storage URL is returned as it is.
export const avatarUrl = (url?: string | null, size = 96, height = size): string => {
  if (!url) return ''
  if (!url.includes('/storage/v1/object/public/')) return url
  const [base] = url.split('?')
  return `${base.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/')}?width=${Math.round(size * 2)}&height=${Math.round(height * 2)}&resize=cover&quality=70`
}
