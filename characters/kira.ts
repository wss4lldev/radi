import { ellipsePath, linePath, paintFill, paintLine, paintShade, paintShape, type BuildPath, type Context, type DecorateInside } from "@/characters/paint"
import { BLUSH, OUTLINE, OUTLINE_WIDTH, PUPIL, SHADE, TONGUE, WHITE, curvesPath, paintTube } from "@/characters/radi"

const FUR = "#fbfaf6"
const FAR_FUR = "#e4e0d8"
const SPOT = "#2a2522"
const SIDE_SHIFT_UNITS = 7
const DEGREES_PER_RADIAN = 180 / Math.PI

const TREAT = "#d9a066"
const TREAT_IN_MOUTH = { x: 36, y: -45 }
const TREAT_PARTS: BuildPath[] = [
  (path) => path.roundRect(-4.5, -1.6, 9, 3.2, 1.2),
  ...[-1, 1].flatMap((sideX) => [-1, 1].map((sideY) => ellipsePath(sideX * 4.6, sideY * 1.7, 1.9, 1.9))),
]

export type KiraMotion = {
  sit: number
  legSwing: number
  tailWag: number
  headReach: number
  lick: number
  treatInMouth: number
  tongueWind: number
  tonguePhase: number
  showTail: boolean
  spaceHelmet: boolean
}

const drawSpaceHelmet = (context: Context) => {
  paintLine(context, OUTLINE, 1.2, linePath(22, -71, 24, -79))
  paintShape(context, "#e63946", ellipsePath(24.3, -80.5, 2, 2))
  const glass = ellipsePath(21, -52, 25, 20.5)
  paintFill(context, "rgba(190, 225, 255, 0.24)", glass)
  paintLine(context, OUTLINE, OUTLINE_WIDTH * 1.3, glass)
  paintLine(context, "rgba(255, 255, 255, 0.85)", 2, (path) => path.ellipse(21, -52, 20.5, 16.5, 0, Math.PI * 1.12, Math.PI * 1.42))
  paintFill(context, "rgba(255, 255, 255, 0.7)", ellipsePath(37, -40, 1.8, 1.2))
}

export const drawTreat = (context: Context, centerX: number, centerY: number, size: number, angle: number) => {
  if (size <= 0) return
  context.save()
  context.translate(centerX, centerY)
  context.rotate(angle)
  context.scale(size, size)
  for (const treatPart of TREAT_PARTS) paintLine(context, OUTLINE, OUTLINE_WIDTH * 2, treatPart)
  for (const treatPart of TREAT_PARTS) paintFill(context, TREAT, treatPart)
  context.restore()
}
const SPOTS_ON_SIDE_BODY = [[-28, -30, 1.6, 1.4], [-6, -29, 1.3, 1.1], [-22, -34, 1.1, 1], [2, -37, 1.2, 1.1], [-33, -35, 1, 0.9]] as const
const SPOTS_ON_FRONT_CHEST = [[-5, -28, 1.4, 1.2], [6, -22, 1.2, 1], [2, -31, 1, 0.9]] as const

type DrawKira = (context: Context) => void

const drawInUnits = (context: Context, feetX: number, feetY: number, scale: number, drawKira: DrawKira) => {
  context.save()
  context.translate(feetX, feetY)
  context.scale(scale, scale)
  context.lineJoin = "round"
  context.lineCap = "round"
  context.lineWidth = OUTLINE_WIDTH
  context.strokeStyle = OUTLINE
  drawKira(context)
  context.restore()
}

const paintInside = (context: Context, buildPath: BuildPath, decorateInside: DecorateInside) => {
  const path = new Path2D()
  buildPath(path)
  context.save()
  context.clip(path)
  decorateInside(context)
  context.restore()
}

const paintFurShape = (context: Context, fill: string, buildPath: BuildPath, decorateInside?: DecorateInside) =>
  paintShape(context, fill, buildPath, { decorateInside, shade: SHADE })

const drawTongue = (context: Context, centerX: number, topY: number, length = 8, angle = 0) => {
  context.save()
  context.translate(centerX, topY)
  context.rotate(angle)
  paintFurShape(context, TONGUE, (path) => {
    path.moveTo(-3, 0)
    path.quadraticCurveTo(0, -0.8, 3, 0)
    path.quadraticCurveTo(3.6, length * 0.95, 0, length)
    path.quadraticCurveTo(-3.6, length * 0.95, -3, 0)
    path.closePath()
  })
  paintLine(context, OUTLINE, 0.6, linePath(0, 0.8, 0, length * 0.69))
  context.restore()
}

const paintSpots = (context: Context, spots: readonly (readonly [number, number, number, number])[]) => {
  for (const [spotX, spotY, radiusX, radiusY] of spots) paintFill(context, SPOT, ellipsePath(spotX, spotY, radiusX, radiusY))
}

const drawLeg = (context: Context, fill: string, buildLeg: BuildPath, pawX: number, pawY: number, pawRadius: number) => {
  paintTube(context, fill, 5, buildLeg, true)
  paintFurShape(context, fill, ellipsePath(pawX, pawY, pawRadius, pawRadius * 0.68))
}

const drawEye = (context: Context, centerX: number, centerY: number) => {
  paintFurShape(context, WHITE, ellipsePath(centerX, centerY, 3.5, 4.3))
  paintFill(context, PUPIL, ellipsePath(centerX + 0.3, centerY + 0.4, 2.7, 3.5))
  paintFill(context, WHITE, ellipsePath(centerX - 0.7, centerY - 1.2, 1, 1.2))
  paintFill(context, WHITE, ellipsePath(centerX + 1.1, centerY + 1.6, 0.5, 0.5))
}

const drawNose = (context: Context, centerX: number, centerY: number, radiusX: number, radiusY: number) => {
  paintFurShape(context, SPOT, ellipsePath(centerX, centerY, radiusX, radiusY))
  paintFill(context, "rgba(255, 255, 255, 0.55)", ellipsePath(centerX - radiusX * 0.35, centerY - radiusY * 0.35, radiusX * 0.3, radiusY * 0.22))
}

const sideBodyPath: BuildPath = (path) => path.roundRect(-36, -40, 42, 16, 8)
const sideSkullPath = ellipsePath(12, -52, 15, 13.5)
const sideMuzzlePath = ellipsePath(28.5, -46.5, 12, 6.2)

const paintTransformed = (context: Context, matrix: DOMMatrix, drawKira: DrawKira) => {
  context.save()
  context.transform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f)
  drawKira(context)
  context.restore()
}

const sittingTilt = (sit: number) =>
  new DOMMatrix().translate(0, sit * 12).translate(-30, -30).rotate(-sit * 0.55 * DEGREES_PER_RADIAN).translate(30, 30)

const sideHeadShift = (tilt: DOMMatrix, headReach: number, lick: number) => {
  const headAnchor = tilt.transformPoint({ x: 8, y: -46 })
  return new DOMMatrix().translate(headAnchor.x - 8 + headReach * 10, headAnchor.y + 46 - headReach * 9 - lick * 3)
}

const drawSideLeg = (context: Context, fill: string, hip: DOMPoint, controlX: number, controlY: number, pawX: number, pawY: number, spotRadius: number) => {
  drawLeg(context, fill, curvesPath([[hip.x, hip.y, controlX, controlY, pawX, pawY]]), pawX + 1.6, pawY + 1.1, 3.3)
  if (spotRadius > 0) paintFill(context, SPOT, ellipsePath((hip.x + controlX * 2 + pawX) / 4, (hip.y + controlY * 2 + pawY) / 4, spotRadius, spotRadius * 0.85))
}

const drawFrontLeg = (context: Context, fill: string, tilt: DOMMatrix, legX: number, swing: number, sit: number, spotRadius = 0) => {
  const hip = tilt.transformPoint({ x: legX, y: -30 })
  const pawX = legX - sit * 4 + swing * 7
  const pawY = -3.5 - Math.max(0, swing) * 4
  drawSideLeg(context, fill, hip, (hip.x + pawX) / 2 + 0.6, (hip.y + pawY) / 2, pawX, pawY, spotRadius)
}

const drawHindLeg = (context: Context, fill: string, tilt: DOMMatrix, legX: number, swing: number, sit: number, spotRadius = 0) => {
  const hip = tilt.transformPoint({ x: legX, y: -30 })
  const standingPawX = legX + 0.6 - swing * 7
  const standingPawY = -3.5 - Math.max(0, -swing) * 4
  drawSideLeg(
    context,
    fill,
    hip,
    legX - 2.2 - swing * 3 + sit * (19.2 + swing * 3),
    -15 + sit * 2,
    standingPawX + sit * (legX + 9 - standingPawX),
    standingPawY + sit * (-3.5 - standingPawY),
    spotRadius,
  )
}

const drawSideBodyAndHead = (context: Context, tilt: DOMMatrix, headShift: DOMMatrix) => {
  const neckStart = tilt.transformPoint({ x: 0, y: -34 })
  const neckEnd = headShift.transformPoint({ x: 8, y: -46 })
  const neckPath = linePath(neckStart.x, neckStart.y, neckEnd.x, neckEnd.y)
  paintLine(context, OUTLINE, 10 + OUTLINE_WIDTH * 2, neckPath)
  paintTransformed(context, tilt, (bodyContext) => paintLine(bodyContext, OUTLINE, OUTLINE_WIDTH * 2, sideBodyPath))
  paintTransformed(context, headShift, (headContext) => {
    for (const headPath of [sideSkullPath, sideMuzzlePath]) paintLine(headContext, OUTLINE, OUTLINE_WIDTH * 2, headPath)
  })
  paintLine(context, FUR, 10, neckPath)
  paintTransformed(context, tilt, (bodyContext) => {
    paintFill(bodyContext, FUR, sideBodyPath)
    paintShade(bodyContext, SHADE, sideBodyPath)
    paintInside(bodyContext, sideBodyPath, (insideContext) => {
      paintFill(insideContext, SPOT, ellipsePath(-15, -40.5, 10, 5.5))
      paintSpots(insideContext, SPOTS_ON_SIDE_BODY)
    })
  })
  paintTransformed(context, headShift, (headContext) => {
    for (const headPath of [sideSkullPath, sideMuzzlePath]) {
      paintFill(headContext, FUR, headPath)
      paintShade(headContext, SHADE, headPath)
    }
    paintSpots(headContext, [[31, -45, 0.5, 0.5], [33.5, -46.5, 0.5, 0.5], [29, -47.5, 0.5, 0.5], [14.5, -62.5, 1.3, 1.1]])
  })
}

export const drawKiraSide = (
  context: Context,
  feetX: number,
  feetY: number,
  scale: number,
  { sit = 0, legSwing = 0, tailWag = 0, headReach = 0, lick = 0, treatInMouth = 0, tongueWind = 0, tonguePhase = 0, showTail = true, spaceHelmet = false }: Partial<KiraMotion> = {},
) => {
  const tongueSwing = tongueWind * (1.1 + 0.25 * Math.sin(tonguePhase))
  const tilt = sittingTilt(sit)
  const headShift = sideHeadShift(tilt, headReach, lick)
  const wagTilt = tilt.multiply(new DOMMatrix().translate(-35, -36).rotate(tailWag * DEGREES_PER_RADIAN).translate(35, 36))
  drawInUnits(context, feetX - SIDE_SHIFT_UNITS * scale, feetY, scale, (kiraContext) => {
    drawHindLeg(kiraContext, FAR_FUR, tilt, -27, legSwing * 0.7, sit)
    drawFrontLeg(kiraContext, FAR_FUR, tilt, 1, legSwing * 0.7, sit)
    drawHindLeg(kiraContext, FUR, tilt, -31, legSwing, sit, 1.2)
    drawFrontLeg(kiraContext, FUR, tilt, -3, legSwing, sit, 1)
    if (showTail) {
      paintTransformed(kiraContext, wagTilt, (tailContext) => paintFurShape(tailContext, FUR, (path) => {
        path.moveTo(-35, -38.5)
        path.quadraticCurveTo(-42, -40.5, -48.5, -48)
        path.quadraticCurveTo(-42, -37, -35.5, -33.5)
        path.closePath()
      }))
    }
    drawSideBodyAndHead(kiraContext, tilt, headShift)
    paintTransformed(kiraContext, headShift, (headContext) => {
      paintFurShape(headContext, SPOT, (path) => {
        path.moveTo(8, -63)
        path.quadraticCurveTo(-1, -64, -0.5, -52)
        path.quadraticCurveTo(0, -45.5, 4, -46.5)
        path.quadraticCurveTo(7.5, -54, 11, -61)
        path.closePath()
      })
      drawEye(headContext, 18, -54.5)
      paintFill(headContext, BLUSH, ellipsePath(20, -47.5, 2.6, 1.6))
      drawNose(headContext, 39.5, -48.8, 2.6, 2.1)
      drawTongue(headContext, 33, -43.6, 8 + lick * 7 + Math.abs(tongueWind) * 5, tongueSwing - lick * 1.2)
      paintLine(headContext, OUTLINE, 0.9, curvesPath([[38.5, -45.5, 33, -41.5, 26, -43.5]]))
      drawTreat(headContext, TREAT_IN_MOUTH.x, TREAT_IN_MOUTH.y, treatInMouth, 0)
      if (spaceHelmet) drawSpaceHelmet(headContext)
    })
  })
}

export const kiraSideMouthPoint = ({ sit = 0, headReach = 0, lick = 0 }: Partial<KiraMotion>) => {
  const mouth = sideHeadShift(sittingTilt(sit), headReach, lick).transformPoint(TREAT_IN_MOUTH)
  return { x: mouth.x - SIDE_SHIFT_UNITS, y: mouth.y }
}

const frontSkullPath = ellipsePath(0, -52, 17, 14.5)
const frontMuzzlePath = ellipsePath(0, -43, 10, 8)

const frontEarPath = (side: number): BuildPath => (path) => {
  path.moveTo(side * 11, -63)
  path.quadraticCurveTo(side * 24, -64, side * 22.5, -50)
  path.quadraticCurveTo(side * 21.5, -42, side * 16.5, -43.5)
  path.quadraticCurveTo(side * 14, -53, side * 6.5, -62)
  path.closePath()
}

export const drawKiraFront = (context: Context, feetX: number, feetY: number, scale: number) => {
  drawInUnits(context, feetX, feetY, scale, (kiraContext) => {
    paintFurShape(kiraContext, FUR, (path) => {
      path.moveTo(7, -29)
      path.quadraticCurveTo(14, -32, 19, -41)
      path.quadraticCurveTo(14.5, -27, 8, -24)
      path.closePath()
    })
    for (const side of [-1, 1]) drawLeg(kiraContext, FAR_FUR, linePath(side * 9.5, -22, side * 10, -3.5), side * 10, -2.4, 3.2)
    paintFurShape(kiraContext, FUR, ellipsePath(0, -26, 11.5, 10.5), (chestContext) => paintSpots(chestContext, SPOTS_ON_FRONT_CHEST))
    for (const side of [-1, 1]) drawLeg(kiraContext, FUR, linePath(side * 5, -24, side * 5.5, -3.5), side * 5.5, -2.4, 3.6)
    paintSpots(kiraContext, [[-5.2, -13, 1.1, 1], [5.6, -9, 1, 0.9]])

    for (const headPath of [frontSkullPath, frontMuzzlePath]) paintLine(kiraContext, OUTLINE, OUTLINE_WIDTH * 2, headPath)
    paintFill(kiraContext, FUR, frontSkullPath)
    paintShade(kiraContext, SHADE, frontSkullPath)
    paintInside(kiraContext, frontSkullPath, (skullContext) => {
      paintFill(skullContext, SPOT, ellipsePath(-7.5, -53, 6.5, 6))
      paintFill(skullContext, SPOT, ellipsePath(6, -61, 1.6, 1.3))
    })
    paintFill(kiraContext, FUR, frontMuzzlePath)
    paintShade(kiraContext, SHADE, frontMuzzlePath)
    for (const side of [-1, 1]) paintFurShape(kiraContext, SPOT, frontEarPath(side))

    for (const side of [-1, 1]) {
      drawEye(kiraContext, side * 7.5, -53)
      paintFill(kiraContext, BLUSH, ellipsePath(side * 12, -46.5, 2.8, 1.7))
      paintSpots(kiraContext, [[side * 4.5, -44, 0.5, 0.5], [side * 6, -42.5, 0.45, 0.45]])
    }
    drawNose(kiraContext, 0, -46.8, 3.2, 2.3)
    drawTongue(kiraContext, 0, -42.4)
    paintLine(kiraContext, OUTLINE, 0.9, curvesPath([[0, -44.5, -0.5, -42, -3.8, -42.6], [0, -44.5, 0.5, -42, 3.8, -42.6]]))
  })
}
