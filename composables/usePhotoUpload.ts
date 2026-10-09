// Profile photo upload, shared by the Vibe Check and /me.
// Every photo is decoded in the browser, turned the right way up, scaled down and saved as JPEG
// before upload, so any phone photo (huge, sideways, PNG, HEIC on Safari) ends up as a small
// image that every browser can show.

const MAX_SIDE = 1280
const QUALITY = 0.85
const MAX_INPUT_BYTES = 25 * 1024 * 1024

export class PhotoError extends Error {}

// Decode with EXIF orientation applied; fall back to <img> where createImageBitmap can't
const decode = async (file: Blob): Promise<CanvasImageSource & { width: number; height: number }> => {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' } as ImageBitmapOptions)
    } catch { /* fall through */ }
  }
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.decoding = 'async'
    img.src = url
    await img.decode()
    return img as any
  } finally {
    URL.revokeObjectURL(url)
  }
}

/** A JPEG no larger than MAX_SIDE on its longest side. Throws PhotoError if the browser can't read it. */
export const preparePhoto = async (file: File): Promise<Blob> => {
  if (!file.type.startsWith('image/') && !/\.(heic|heif)$/i.test(file.name)) {
    throw new PhotoError('Please choose a photo (JPG or PNG).')
  }
  if (file.size > MAX_INPUT_BYTES) throw new PhotoError('That photo is too large. Please choose one under 25 MB.')

  let source: CanvasImageSource & { width: number; height: number }
  try {
    source = await decode(file)
  } catch {
    // Most often an iPhone HEIC photo opened in a browser that can't read HEIC
    throw new PhotoError("We couldn't read that photo. Please choose a JPG or PNG (on iPhone, a screenshot works too).")
  }

  const scale = Math.min(1, MAX_SIDE / Math.max(source.width, source.height))
  const w = Math.max(1, Math.round(source.width * scale))
  const h = Math.max(1, Math.round(source.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new PhotoError("We couldn't process that photo. Please try another.")
  ctx.fillStyle = '#ffffff' // transparent PNGs get a white background, not black
  ctx.fillRect(0, 0, w, h)
  ctx.drawImage(source, 0, 0, w, h)
  if ('close' in source && typeof (source as any).close === 'function') (source as any).close()

  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', QUALITY))
  if (!blob) throw new PhotoError("We couldn't process that photo. Please try another.")
  return blob
}

export const usePhotoUpload = () => {
  const supabase = useSupabaseClient() as any

  /** Prepare, upload to the avatars bucket and save on the profile. Returns the public URL. */
  const uploadProfilePhoto = async (file: File, knownUserId?: string | null): Promise<string> => {
    const blob = await preparePhoto(file)

    let userId = knownUserId || null
    if (!userId) {
      const { data } = await supabase.auth.getSession()
      userId = data?.session?.user?.id || null
    }
    if (!userId) throw new PhotoError('Your session has expired. Please sign in again.')

    const path = `${userId}-${Date.now()}.jpg`
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, blob, { contentType: 'image/jpeg', cacheControl: '31536000', upsert: false })
    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
    const { error: updateError } = await supabase
      .schema('m2m')
      .from('profiles')
      .update({ photo_url: urlData.publicUrl })
      .eq('id', userId)
    if (updateError) throw updateError

    return urlData.publicUrl as string
  }

  return { uploadProfilePhoto }
}
