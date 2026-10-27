import type { Context } from "@/characters/paint"

export type SpriteBounds = readonly [left: number, top: number, right: number, bottom: number]
type Sprite = { canvas: HTMLCanvasElement; layer: Context; scale: number }

const SPRITE_PAD_PIXELS = 2
const SUBPIXEL_STEPS = 4
const MAX_SPRITES = 1200
// Tilted sprites are resampled when pasted, so they are drawn sharper to stay crisp.
const ROTATED_DETAIL = 2
const sprites = new Map<string, Sprite>()

const forgetSprite = (key: string, { canvas }: Sprite) => {
  canvas.width = 0
  canvas.height = 0
  sprites.delete(key)
}

const sceneLayouts = new Map<string, string>()

export const releaseSceneSprites = (scene: string) => {
  for (const [key, sprite] of sprites) {
    if (key.startsWith(`${scene}:`)) forgetSprite(key, sprite)
  }
  sceneLayouts.delete(scene)
}

export const prepareSceneSprites = (scene: string, layout: string) => {
  if (sceneLayouts.get(scene) === layout) return
  releaseSceneSprites(scene)
  sceneLayouts.set(scene, layout)
}

const toSubpixel = (deviceValue: number) => Math.round(deviceValue * SUBPIXEL_STEPS) / SUBPIXEL_STEPS

export const snapToSubpixel = (context: Context, x: number, y: number): readonly [number, number] => {
  const { a, b, c, d, e, f } = context.getTransform()
  if (b !== 0 || c !== 0 || a === 0 || d === 0) return [x, y]
  return [x + (toSubpixel(a * x + e) - (a * x + e)) / a, y + (toSubpixel(d * y + f) - (d * y + f)) / d]
}

const isLayerLost = (layer: Context) => (layer as Context & { isContextLost?: () => boolean }).isContextLost?.() === true

const buildSprite = (context: Context, scale: number, [left, top, right, bottom]: SpriteBounds, shiftX: number, shiftY: number, draw: (layer: Context) => void): Sprite | null => {
  const canvas = document.createElement("canvas")
  canvas.width = Math.ceil((right - left) * scale) + SPRITE_PAD_PIXELS * 2 + 1
  canvas.height = Math.ceil((bottom - top) * scale) + SPRITE_PAD_PIXELS * 2 + 1
  const layer = canvas.getContext("2d")
  if (!layer) return null
  layer.setTransform(scale, 0, 0, scale, SPRITE_PAD_PIXELS + shiftX - left * scale, SPRITE_PAD_PIXELS + shiftY - top * scale)
  layer.strokeStyle = context.strokeStyle
  layer.lineWidth = context.lineWidth
  layer.lineJoin = context.lineJoin
  layer.lineCap = context.lineCap
  draw(layer)
  return { canvas, layer, scale }
}

const placeOnGrid = (deviceStart: number, direction: number) => {
  const place = toSubpixel(deviceStart) * direction
  return { origin: Math.floor(place) * direction, shift: place - Math.floor(place) }
}

export const paintSprite = (context: Context, key: string, anchorX: number, anchorY: number, bounds: SpriteBounds, draw: (layer: Context) => void) => {
  const { a, b, c, d, e, f } = context.getTransform()
  const isGridAligned = b === 0 && c === 0 && Math.abs(a) === Math.abs(d)
  const scale = Math.round(Math.hypot(a, b) * 1000) / 1000 * (isGridAligned ? 1 : ROTATED_DETAIL)
  const left = anchorX + bounds[0] - SPRITE_PAD_PIXELS / scale
  const top = anchorY + bounds[1] - SPRITE_PAD_PIXELS / scale
  const column = isGridAligned ? placeOnGrid(a * left + e, Math.sign(a)) : { origin: 0, shift: 0 }
  const row = isGridAligned ? placeOnGrid(d * top + f, Math.sign(d)) : { origin: 0, shift: 0 }
  const fullKey = `${key} ${scale} ${column.shift} ${row.shift} ${context.strokeStyle} ${context.lineWidth} ${context.lineJoin} ${context.lineCap}`
  let sprite = sprites.get(fullKey)
  if (sprite) sprites.delete(fullKey)
  if (!sprite || isLayerLost(sprite.layer)) {
    sprite = buildSprite(context, scale, bounds, column.shift, row.shift, draw) ?? undefined
    if (!sprite) {
      context.save()
      context.translate(anchorX, anchorY)
      draw(context)
      context.restore()
      return
    }
    const oldest = sprites.entries().next().value
    if (oldest && sprites.size >= MAX_SPRITES) forgetSprite(oldest[0], oldest[1])
  }
  sprites.set(fullKey, sprite)
  if (isGridAligned) {
    context.save()
    context.setTransform(Math.sign(a), 0, 0, Math.sign(d), column.origin, row.origin)
    context.drawImage(sprite.canvas, 0, 0)
    context.restore()
    return
  }
  context.drawImage(sprite.canvas, left, top, sprite.canvas.width / sprite.scale, sprite.canvas.height / sprite.scale)
}
