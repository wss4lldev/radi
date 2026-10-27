import type { Context } from "@/characters/paint"

const LAYER_STYLE_KEYS = ["fillStyle", "strokeStyle", "lineWidth", "lineJoin", "lineCap"] as const
type LayerStyle = Pick<Context, (typeof LAYER_STYLE_KEYS)[number]>
type CachedLayer = { canvas: HTMLCanvasElement; layer: Context; key: string; leftoverStyle: Partial<LayerStyle> }
const cachedLayers = new Map<string, CachedLayer>()

const readStyle = (context: Context): LayerStyle => ({
  fillStyle: context.fillStyle,
  strokeStyle: context.strokeStyle,
  lineWidth: context.lineWidth,
  lineJoin: context.lineJoin,
  lineCap: context.lineCap,
})

const changedStyle = (before: LayerStyle, after: LayerStyle): Partial<LayerStyle> =>
  Object.fromEntries(LAYER_STYLE_KEYS.filter((key) => before[key] !== after[key]).map((key) => [key, after[key]]))

const hasPlainCompositing = (context: Context) =>
  context.globalAlpha === 1 &&
  context.globalCompositeOperation === "source-over" &&
  (!context.filter || context.filter === "none") &&
  context.shadowBlur === 0 &&
  context.shadowOffsetX === 0 &&
  context.shadowOffsetY === 0 &&
  context.getLineDash().length === 0

const isLayerLost = (layer: Context) => (layer as Context & { isContextLost?: () => boolean }).isContextLost?.() === true

const releaseHooks = new Map<string, () => void>()

export const onLayersReleased = (scene: string, release: () => void) => {
  releaseHooks.set(scene, release)
}

export const releaseLayersExcept = (scene: string | null) => {
  for (const [name, { canvas }] of cachedLayers) {
    if (name.startsWith(`${scene}:`)) continue
    canvas.width = 0
    canvas.height = 0
    cachedLayers.delete(name)
  }
  for (const [hookScene, release] of releaseHooks) {
    if (hookScene !== scene) release()
  }
}

const roundShift = (value: number) => Math.round(value * 1e6) / 1e6

export const paintCachedLayer = (context: Context, name: string, sceneKey: string, drawLayer: (layer: Context) => void, offsetX = 0, offsetY = 0) => {
  if (!hasPlainCompositing(context)) {
    drawLayer(context)
    return
  }
  const transform = context.getTransform()
  const { a, b, c, d } = transform
  const isOffset = offsetX !== 0 || offsetY !== 0
  const e = isOffset ? roundShift(transform.e - (a * offsetX + c * offsetY)) : transform.e
  const f = isOffset ? roundShift(transform.f - (b * offsetX + d * offsetY)) : transform.f
  const { width: pixelWidth, height: pixelHeight } = context.canvas
  const key = [sceneKey, pixelWidth, pixelHeight, a, b, c, d, e, f].join(" ")
  let cached = cachedLayers.get(name)
  if (!cached || cached.key !== key || isLayerLost(cached.layer)) {
    const canvas = cached?.canvas ?? document.createElement("canvas")
    canvas.width = pixelWidth
    canvas.height = pixelHeight
    const layer = canvas.getContext("2d")
    if (!layer) {
      drawLayer(context)
      return
    }
    layer.setTransform(a, b, c, d, e, f)
    const inheritedStyle = readStyle(context)
    Object.assign(layer, inheritedStyle)
    drawLayer(layer)
    cached = { canvas, layer, key, leftoverStyle: changedStyle(inheritedStyle, readStyle(layer)) }
    cachedLayers.set(name, cached)
  }
  context.save()
  context.setTransform(1, 0, 0, 1, 0, 0)
  context.drawImage(cached.canvas, transform.e - e, transform.f - f)
  context.restore()
  Object.assign(context, cached.leftoverStyle)
}
