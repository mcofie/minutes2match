// Story-sized share image for a member's personality type (1080×1920), drawn in the browser.
// The bird art is the same pre-rendered illustration the card shows. Text uses the page's own fonts.

const W = 1080
const H = 1920

const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const img = new Image()
  img.decoding = 'async'
  img.onload = () => resolve(img)
  img.onerror = reject
  img.src = src
})

const wrap = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(/\s+/)) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else line = test
  }
  if (line) lines.push(line)
  return lines
}

export interface ShareCardInput {
  artSrc: string          // pre-rendered persona illustration (transparent, bottom already faded)
  name: string            // "The Romantic"
  description: string
  keywords: string[]
  tint: string            // the card's CSS gradient; its hex colours are reused
  host: string            // "minutes2match.com"
}

export const renderPersonaCard = async (input: ShareCardInput): Promise<Blob> => {
  const serif = getComputedStyle(document.querySelector('.font-display') || document.body).fontFamily || 'Georgia, serif'
  const sans = getComputedStyle(document.body).fontFamily || 'system-ui, sans-serif'
  await document.fonts?.ready
  await Promise.all([
    document.fonts?.load(`400 120px ${serif}`),
    document.fonts?.load(`500 44px ${sans}`),
    document.fonts?.load(`600 44px ${sans}`),
  ].filter(Boolean)).catch(() => {})

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // Background: the card's own soft gradient, on the page grey
  const hexes = input.tint.match(/#[0-9a-f]{6}/gi) || ['#f7f7f7', '#ffffff', '#f7f7f7']
  const bg = ctx.createLinearGradient(0, 0, W, H)
  hexes.forEach((c, i) => bg.addColorStop(hexes.length === 1 ? 0 : i / (hexes.length - 1), c))
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Wordmark (the logo file has generous padding; crop to the lettering)
  try {
    const logo = await loadImage('/logo-full.png')
    const sx = logo.naturalWidth * 0.15, sy = logo.naturalHeight * 0.38
    const sw = logo.naturalWidth * 0.7, sh = logo.naturalHeight * 0.24
    const w = 420, h = w * (sh / sw)
    ctx.drawImage(logo, sx, sy, sw, sh, (W - w) / 2, 110, w, h)
  } catch { /* text-only if the logo can't load */ }

  // The bird (pre-rendered, so no SVG filters run on the phone)
  const artW = 640
  const artImg = await loadImage(input.artSrc)
  const artH = Math.round(artW * (artImg.naturalHeight / artImg.naturalWidth))
  ctx.drawImage(artImg, (W - artW) / 2, 200, artW, artH)

  // Words
  ctx.textAlign = 'center'
  ctx.fillStyle = '#6c6862'
  ctx.font = `500 40px ${sans}`
  let y = 200 + artH - 40
  ctx.fillText('My dating type is', W / 2, y)

  ctx.fillStyle = '#393737'
  ctx.font = `400 116px ${serif}`
  y += 128
  ctx.fillText(input.name, W / 2, y)

  ctx.fillStyle = '#4c4a4a'
  ctx.font = `500 42px ${sans}`
  y += 30
  for (const line of wrap(ctx, input.description, 860).slice(0, 4)) {
    y += 60
    ctx.fillText(line, W / 2, y)
  }

  // Keyword pills, centred, wrapping onto two rows at most
  ctx.font = `500 34px ${sans}`
  const pills = input.keywords.slice(0, 5).map(k => k.replace(/^\w/, c => c.toUpperCase()))
  const padX = 30, gap = 16, pillH = 68
  const rows: string[][] = [[]]
  let rowW = 0
  for (const p of pills) {
    const w = ctx.measureText(p).width + padX * 2
    if (rowW + w > 900 && rows[rows.length - 1].length) { rows.push([]); rowW = 0 }
    rows[rows.length - 1].push(p)
    rowW += w + gap
  }
  y += 56
  for (const row of rows.slice(0, 2)) {
    const widths = row.map(p => ctx.measureText(p).width + padX * 2)
    let x = (W - (widths.reduce((a, b) => a + b, 0) + gap * (row.length - 1))) / 2
    row.forEach((p, i) => {
      ctx.fillStyle = 'rgba(255,255,255,0.8)'
      ctx.beginPath()
      ctx.roundRect(x, y, widths[i], pillH, pillH / 2)
      ctx.fill()
      ctx.fillStyle = '#393737'
      ctx.fillText(p, x + widths[i] / 2, y + 45)
      x += widths[i] + gap
    })
    y += pillH + 16
  }

  // Invitation
  ctx.fillStyle = '#393737'
  ctx.font = `400 62px ${serif}`
  ctx.fillText("What's yours?", W / 2, H - 230)
  ctx.fillStyle = '#6c6862'
  ctx.font = `500 38px ${sans}`
  ctx.fillText('Take the free Vibe Check at', W / 2, H - 160)
  ctx.fillStyle = '#ed1c24'
  ctx.font = `600 44px ${sans}`
  ctx.fillText(input.host, W / 2, H - 100)

  // JPEG: the card is opaque, and it encodes far faster (and ~5× smaller) than PNG on phones
  return await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Could not create image'))), 'image/jpeg', 0.9))
}
