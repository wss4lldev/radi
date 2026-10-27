export type Context = CanvasRenderingContext2D
export type Fill = string | CanvasGradient
export type BuildPath = (path: Path2D) => void
export type DecorateInside = (context: Context) => void
type ShapeOptions = { decorateInside?: DecorateInside; shade?: string }

const SHADE_SHIFT = 1.4

export const ellipsePath = (centerX: number, centerY: number, radiusX: number, radiusY: number): BuildPath => (path) =>
  path.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2)

export const linePath = (fromX: number, fromY: number, toX: number, toY: number): BuildPath => (path) => {
  path.moveTo(fromX, fromY)
  path.lineTo(toX, toY)
}

export const paintShade = (context: Context, shade: string, buildPath: BuildPath) => {
  const path = new Path2D()
  buildPath(path)
  shadePath(context, shade, path)
}

const shadePath = (context: Context, shade: string, path: Path2D) => {
  const outsideShiftedShape = new Path2D()
  outsideShiftedShape.rect(-1000, -1000, 2000, 2000)
  outsideShiftedShape.addPath(path)
  context.save()
  context.clip(path)
  context.translate(-SHADE_SHIFT, -SHADE_SHIFT)
  context.fillStyle = shade
  context.fill(outsideShiftedShape, "evenodd")
  context.restore()
}

export const paintShape = (context: Context, fill: Fill, buildPath: BuildPath, { decorateInside, shade }: ShapeOptions = {}) => {
  const path = new Path2D()
  buildPath(path)
  context.fillStyle = fill
  context.fill(path)
  if (decorateInside) {
    context.save()
    context.clip(path)
    decorateInside(context)
    context.restore()
  }
  if (shade) shadePath(context, shade, path)
  context.stroke(path)
}

export const paintFill = (context: Context, fill: Fill, buildPath: BuildPath) => {
  const path = new Path2D()
  buildPath(path)
  context.fillStyle = fill
  context.fill(path)
}

export const paintLine = (context: Context, color: string, thickness: number, buildPath: BuildPath) => {
  const path = new Path2D()
  buildPath(path)
  context.save()
  context.strokeStyle = color
  context.lineWidth = thickness
  context.stroke(path)
  context.restore()
}
