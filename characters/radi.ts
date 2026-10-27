import { ellipsePath, linePath, paintFill, paintLine, paintShade, paintShape, type BuildPath, type Context, type DecorateInside } from "@/characters/paint"
import { paintSprite, snapToSubpixel, type SpriteBounds } from "@/characters/sprites"

export const OUTLINE = "#2b1d1a"
export const OUTLINE_WIDTH = 1.6
export const SKIN = "#f5cfb0"
export const HAIR = "#b8873e"
export const HAIR_HIGHLIGHT = "#f0d088"
export const HAIR_STRAND = "rgba(110, 62, 18, 0.45)"
export const EYE = "#5e4425"
export const PUPIL = "#2a1a0f"
export const BLUSH = "rgba(255, 110, 140, 0.45)"
export const MOUTH = "#8a2a2a"
export const TONGUE = "#ff7f9a"
export const WHITE = "#ffffff"
export const DENIM = "#5b8fc9"
export const WOOD = "#6b3f22"
export const BLACK_FABRIC = "#1d1d1d"
const KALPAK_FUR = "#1f1d22"
export const HIGH_TOP_RED = "#e23b3b"
export const TSARVULI_LEATHER = "#8a5a32"
const WOOL_WRAP = "#f4efe4"
const GOLD = "#e8c547"
export const SILVER = "#d5d9de"
export const FOLK_YELLOW = "#f2cf3a"
const LEAF_GREEN = "#3f9b4f"
export const UNICORN_GOLD = "#ffd86b"
export const UNICORN_LILAC = "#c9a8ff"
const HORN_SPIRAL = "#f0a83a"
const EAR_PINK = "#ffb3d9"
export const RAINBOW = ["#ff5f7e", "#ffa94d", "#ffe066", "#69db7c", "#4dabf7", "#b197fc"] as const
export const SHADE = "rgba(90, 40, 30, 0.22)"
const ASTRONAUT_TRIM = "#ff8c42"
const ASTRONAUT_GLOVE = "#4d7cc9"
const SIDES = [-1, 1] as const

type RadiPattern = "sun" | "mandala" | "flowers" | "comic" | "tieDye" | "folk" | "lace" | "sukman" | "tropical"
type RadiExtra =
  | "denimJacket"
  | "headphones"
  | "pendant"
  | "bandana"
  | "sunglasses"
  | "readingGlasses"
  | "kalpak"
  | "gaida"
  | "heartNecklace"
  | "apron"
  | "pafti"
  | "puffSleeves"
  | "hairFlower"
  | "batman"
  | "unicorn"
  | "astronaut"
export type RadiHair = "ponytail" | "sideTail" | "loose" | "tucked" | "braid" | "bun" | "bob"
export type RadiExpression = "grin" | "tongue" | "puff" | "surprised" | "angry" | "thinking"
type RadiPose = "wave" | "peace" | "hold"
export type RadiShoes = "sneakers" | "highTops" | "tsarvuli" | "partyHeels" | "folkFlats" | "boots" | "hooves"
type DrawShoe = (context: Context, side: number, isPolished: boolean) => void
type RadiTop = { color: string; pattern?: RadiPattern }
export type RadiBottom = { kind: "skirt" | "shorts"; color: string; pattern?: RadiPattern }
type CurveLine = readonly [number, number, number, number, number, number]
export type Point = readonly [number, number]
type RadiHands = readonly [Point, Point]

type PerSide = readonly [number, number]

export type RadiMotion = {
  faceTurn: number
  legLifts: PerSide
  kneeBends: PerSide
  hands: RadiHands
  elbowBends: PerSide
  hideLegs?: boolean
  headTilt?: number
}

export type RadiColors = { skin: string; hair: string; hairHighlight: string; eye: string; iris: string }

const RADI_COLORS: RadiColors = { skin: SKIN, hair: HAIR, hairHighlight: HAIR_HIGHLIGHT, eye: EYE, iris: "#9a7444" }
let activeColors = RADI_COLORS

export type RadiLook = {
  colors?: RadiColors
  hair: RadiHair
  expression: RadiExpression
  pose: RadiPose
  top: RadiTop
  bottom: RadiBottom
  extras: RadiExtra[]
  shoes?: RadiShoes
  polished?: boolean
}

export const shadeIf = (isPolished: boolean) => (isPolished ? { shade: SHADE } : {})

export const curvesPath = (curves: readonly CurveLine[]): BuildPath => (path) => {
  for (const [startX, startY, controlX, controlY, endX, endY] of curves) {
    path.moveTo(startX, startY)
    path.quadraticCurveTo(controlX, controlY, endX, endY)
  }
}

export const paintTube = (context: Context, color: string, thickness: number, buildPath: BuildPath, isPolished = false) => {
  paintLine(context, OUTLINE, thickness + OUTLINE_WIDTH * 2, buildPath)
  paintLine(context, color, thickness, buildPath)
  if (isPolished) {
    context.save()
    context.translate(thickness * 0.2, thickness * 0.2)
    paintLine(context, SHADE, thickness * 0.35, buildPath)
    context.restore()
  }
}

const patternPainters: Record<RadiPattern, DecorateInside> = {
  sun: (context) => {
    paintFill(context, WHITE, ellipsePath(0, -38, 2.1, 2.1))
    for (let ray = 0; ray < 8; ray += 1) {
      const angle = (ray * Math.PI) / 4
      paintLine(context, WHITE, 0.8, linePath(Math.cos(angle) * 3.2, -38 + Math.sin(angle) * 3.2, Math.cos(angle) * 4.6, -38 + Math.sin(angle) * 4.6))
    }
  },
  mandala: (context) => {
    for (const radius of [3, 6]) paintLine(context, WHITE, 0.6, ellipsePath(0, -39, radius, radius))
    for (let ray = 0; ray < 12; ray += 1) {
      const angle = (ray * Math.PI) / 6
      paintLine(context, WHITE, 0.6, linePath(Math.cos(angle) * 3, -39 + Math.sin(angle) * 3, Math.cos(angle) * 6, -39 + Math.sin(angle) * 6))
    }
    for (let dot = 0; dot < 8; dot += 1) {
      const angle = (dot * Math.PI) / 4
      paintFill(context, WHITE, ellipsePath(Math.cos(angle) * 7.5, -39 + Math.sin(angle) * 7.5, 0.6, 0.6))
    }
  },
  flowers: (context) => {
    for (let row = 0; row < 4; row += 1) {
      for (let column = 0; column < 10; column += 1) {
        const centerX = -27 + column * 6 + (row % 2) * 3
        const centerY = -30 + row * 4.5
        for (const [offsetX, offsetY] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          paintFill(context, "#ff7aa8", ellipsePath(centerX + offsetX, centerY + offsetY, 0.9, 0.9))
        }
        paintFill(context, "#ffd23f", ellipsePath(centerX, centerY, 0.7, 0.7))
      }
    }
  },
  comic: (context) => {
    const cellColors = ["#ffe066", "#ff8fab", "#8ecae6", "#ff5d5d", WHITE]
    const cellSize = 7
    for (let row = 0; row < 9; row += 1) {
      for (let column = 0; column < 9; column += 1) {
        const cellX = -30 + column * cellSize
        const cellY = -60 + row * cellSize
        context.fillStyle = cellColors[(column + row * 2) % cellColors.length]
        context.fillRect(cellX, cellY, cellSize, cellSize)
        paintLine(context, OUTLINE, 0.5, (path) => path.rect(cellX, cellY, cellSize, cellSize))
      }
    }
  },
  tieDye: (context) => {
    const blobs = [
      [-6, -44, "#ff5fa2"],
      [6, -38, "#7b5cff"],
      [-4, -33, "#ffd23f"],
      [7, -47, "#3ec7e0"],
      [-9, -38, "#58d68d"],
    ] as const
    context.globalAlpha = 0.75
    for (const [blobX, blobY, color] of blobs) paintFill(context, color, ellipsePath(blobX, blobY, 5, 4))
  },
  folk: (context) => {
    for (const rowY of [-44, -38, -32]) {
      paintLine(context, WHITE, 0.6, (path) => {
        path.moveTo(-12, rowY)
        for (let zigzagX = -10; zigzagX <= 12; zigzagX += 2) path.lineTo(zigzagX, rowY + (zigzagX % 4 === 0 ? -1.2 : 1.2))
      })
    }
  },
  lace: (context) => {
    paintFill(context, activeColors.skin, (path) => {
      path.moveTo(-10, -50)
      path.lineTo(10, -50)
      path.lineTo(10, -46)
      path.lineTo(6, -46)
      path.lineTo(0, -38)
      path.lineTo(-6, -46)
      path.lineTo(-10, -46)
      path.closePath()
    })
    for (const side of SIDES) paintLine(context, BLACK_FABRIC, 0.9, linePath(side * 6, -50, side * 6, -46))
    paintLine(context, BLACK_FABRIC, 1.4, (path) => {
      path.moveTo(-10, -46)
      path.lineTo(-6, -46)
      path.lineTo(0, -38)
      path.lineTo(6, -46)
      path.lineTo(10, -46)
    })
    for (let step = 1; step < 6; step += 1) {
      for (const side of SIDES) paintFill(context, BLACK_FABRIC, ellipsePath(side * (6 - step), -45 + step * 1.33, 0.7, 0.7))
    }
    paintFill(context, BLACK_FABRIC, (path) => path.rect(-16, -33.5, 32, 3))
    for (let dotX = -15; dotX <= 15; dotX += 2) paintFill(context, "rgba(255, 255, 255, 0.3)", ellipsePath(dotX, -32, 0.5, 0.5))
    paintLine(context, BLACK_FABRIC, 2, curvesPath([[-16, -18.6, 0, -15.6, 16, -18.6]]))
  },
  tropical: (context) => {
    const blooms = [
      [-6, -27, "#c45cff"],
      [1, -23, "#ff5f9a"],
      [7, -28, "#7a4dff"],
      [-1, -30, "#ff8ad4"],
      [5, -21, "#3ec6c6"],
    ] as const
    for (const [bloomX, bloomY, color] of blooms) {
      for (const [offsetX, offsetY] of [[1.4, 0], [-1.4, 0], [0, 1.3], [0, -1.3]] as const) {
        paintFill(context, color, ellipsePath(bloomX + offsetX, bloomY + offsetY, 1.35, 1.05))
      }
      paintFill(context, "#ffe07a", ellipsePath(bloomX, bloomY, 0.7, 0.7))
    }
    paintFill(context, "#2f8f5a", ellipsePath(-8, -25, 2.4, 1))
    paintFill(context, "#3aaa6a", ellipsePath(8.2, -26, 2.1, 0.9))
  },
  sukman: (context) => {
    paintFill(context, WHITE, ellipsePath(0, -49.5, 6.5, 4))
    for (const side of SIDES) {
      paintLine(context, GOLD, 0.7, curvesPath([
        [side * 5, -44, side * 6, -38.5, side * 4.5, -33],
        [side * 5.4, -41, side * 7.4, -42, side * 7.6, -39.8],
        [side * 5.3, -37, side * 3, -38, side * 2.6, -35.8],
        [side * 11, -26, side * 12.5, -22.5, side * 11.5, -19.5],
        [side * 11.6, -23.5, side * 13.6, -24, side * 14, -22],
      ]))
    }
    paintLine(context, BLACK_FABRIC, 1.6, curvesPath([[-16, -19.8, 0, -16.8, 16, -19.8]]))
    paintLine(context, WHITE, 1.4, curvesPath([[-16, -18.2, 0, -15.2, 16, -18.2]]))
  },
}

export const decorationFor = (pattern?: RadiPattern) => (pattern ? patternPainters[pattern] : undefined)

const HAIR_STREAKS: readonly CurveLine[] = [
  [-14, -86, -15, -90, -10, -92.5],
  [-2, -87, -3, -91, 1, -93.5],
  [10, -86, 12, -90, 7, -92.5],
]

const POLISHED_HAIR_STRANDS: readonly CurveLine[] = [
  [-18, -80, -20, -88, -14, -93],
  [-6, -84, -8, -90, -4, -94],
  [5, -84, 4, -90, 8, -93.5],
  [16, -81, 19, -88, 13, -92],
]

const PONYTAIL_LOCKS = [
  [17.6, -86.2, 51.2, -100, 22.4, -77.8],
  [20, -86.8, 56, -82, 20, -77.2],
  [22.4, -86.2, 51.2, -64, 17.6, -77.8],
] as const

const BRAID_LINKS: readonly Point[] = [[-26, -67], [-25.5, -62.5], [-24, -58], [-21.5, -54], [-18, -50.5], [-14, -47.5], [-10, -45], [-7, -41.5], [-5.5, -37.5]]

const HAND_POSITIONS: Record<RadiPose, RadiHands> = {
  wave: [[-14, -32], [27, -57]],
  peace: [[-14, -32], [26, -58]],
  hold: [[5.5, -21], [5.5, -29]],
}

const hairFrontPath = (hair: RadiHair): BuildPath => (path) => {
  if (hair === "bob") {
    path.moveTo(-26, -51)
    path.quadraticCurveTo(-30, -62, -27, -72)
    path.bezierCurveTo(-30, -103, 30, -103, 27, -72)
    path.quadraticCurveTo(30, -62, 26, -51)
    path.quadraticCurveTo(23, -50, 20.5, -54)
    path.quadraticCurveTo(21.5, -66, 16, -76)
    path.quadraticCurveTo(4, -77, -9, -86)
    path.quadraticCurveTo(-18, -82, -20.5, -70)
    path.quadraticCurveTo(-21.5, -60, -20.5, -54)
    path.quadraticCurveTo(-23, -50, -26, -51)
  } else if (hair === "loose") {
    path.moveTo(-26, -60)
    path.bezierCurveTo(-32, -106, 32, -106, 26, -60)
    path.quadraticCurveTo(22, -70, 19, -79)
    path.quadraticCurveTo(2, -80, -14, -70)
    path.quadraticCurveTo(-18, -76, -20, -74)
    path.quadraticCurveTo(-21, -66, -26, -60)
  } else {
    path.moveTo(-25.5, -68)
    path.bezierCurveTo(-32, -103, 32, -103, 25.5, -68)
    path.quadraticCurveTo(22, -80, 10, -83)
    path.quadraticCurveTo(0, -85, -10, -83)
    path.quadraticCurveTo(-22, -80, -25.5, -68)
  }
  path.closePath()
}

const bumpyEdgeTo = (path: Path2D, [fromX, fromY]: Point, [toX, toY]: Point, bumps: number, bumpSize: number) => {
  const length = Math.hypot(toX - fromX, toY - fromY)
  const normalX = (toY - fromY) / length
  const normalY = -(toX - fromX) / length
  for (let bump = 0; bump < bumps; bump += 1) {
    const middleProgress = (bump + 0.5) / bumps
    const endProgress = (bump + 1) / bumps
    path.quadraticCurveTo(
      fromX + (toX - fromX) * middleProgress + normalX * bumpSize,
      fromY + (toY - fromY) * middleProgress + normalY * bumpSize,
      fromX + (toX - fromX) * endProgress,
      fromY + (toY - fromY) * endProgress,
    )
  }
}

const kalpakPath: BuildPath = (path) => {
  path.moveTo(-25, -80)
  bumpyEdgeTo(path, [-25, -80], [-27, -113], 6, 1.6)
  bumpyEdgeTo(path, [-27, -113], [0, -117], 5, 1.6)
  bumpyEdgeTo(path, [0, -117], [27, -113], 5, 1.6)
  bumpyEdgeTo(path, [27, -113], [25, -80], 6, 1.6)
  path.quadraticCurveTo(0, -75.5, -25, -80)
  path.closePath()
}

const facePath: BuildPath = (path) => {
  path.ellipse(0, -70, 23, 23, 0, Math.PI, Math.PI * 2)
  path.bezierCurveTo(23, -56, 11, -44, 0, -44)
  path.bezierCurveTo(-11, -44, -23, -56, -23, -70)
  path.closePath()
}

const drawHairBack = (context: Context, hair: RadiHair, isPolished: boolean) => {
  if (hair === "braid") drawBraid(context, isPolished)
  if (hair === "tucked" || hair === "braid") return
  if (hair === "bun") {
    paintShape(context, activeColors.hair, ellipsePath(0, -97, 8, 6.5), shadeIf(isPolished))
    if (isPolished) paintLine(context, HAIR_STRAND, 0.7, curvesPath([[-5, -99, 0, -103, 5, -99]]))
    return
  }
  if (hair === "bob") {
    paintShape(context, activeColors.hair, (path) => {
      path.moveTo(-25, -76)
      path.quadraticCurveTo(-28, -60, -22, -50)
      path.quadraticCurveTo(0, -46, 22, -50)
      path.quadraticCurveTo(28, -60, 25, -76)
      path.closePath()
    }, shadeIf(isPolished))
    return
  }
  if (hair === "loose") {
    paintShape(context, activeColors.hair, (path) => {
      path.moveTo(-27, -72)
      path.quadraticCurveTo(-31, -48, -22, -36)
      path.quadraticCurveTo(-11, -32, 0, -36)
      path.quadraticCurveTo(11, -32, 22, -36)
      path.quadraticCurveTo(31, -48, 27, -72)
      path.closePath()
    }, shadeIf(isPolished))
    if (isPolished) paintLine(context, HAIR_STRAND, 0.7, curvesPath([[-24, -62, -27, -50, -20, -40], [24, -62, 27, -50, 20, -40]]))
    return
  }
  if (hair === "sideTail") {
    paintShape(context, activeColors.hair, (path) => {
      path.moveTo(17, -90)
      path.bezierCurveTo(38, -94, 46, -74, 40, -56)
      path.quadraticCurveTo(36, -44, 42, -34)
      path.quadraticCurveTo(30, -42, 30, -58)
      path.bezierCurveTo(30, -72, 26, -80, 21, -78)
      path.closePath()
    }, shadeIf(isPolished))
    paintLine(context, activeColors.hairHighlight, 1.2, curvesPath([[27, -86, 40, -80, 36, -60]]))
    if (isPolished) paintLine(context, HAIR_STRAND, 0.7, curvesPath([[31, -80, 39, -70, 35, -50]]))
    return
  }
  const lockPaths = PONYTAIL_LOCKS.map(([baseStartX, baseStartY, tipX, tipY, baseEndX, baseEndY]): BuildPath => (path) => {
    path.moveTo(baseStartX, baseStartY)
    path.lineTo(tipX, tipY)
    path.lineTo(baseEndX, baseEndY)
    path.closePath()
  })
  for (const lockPath of lockPaths) paintLine(context, OUTLINE, OUTLINE_WIDTH * 2, lockPath)
  for (const lockPath of lockPaths) {
    paintFill(context, activeColors.hair, lockPath)
    if (isPolished) paintShade(context, SHADE, lockPath)
  }
  paintLine(context, activeColors.hairHighlight, 1.2, linePath(27, -83, 42, -82))
}

const shoePainters: Record<RadiShoes, DrawShoe> = {
  sneakers: (context, side, isPolished) => {
    const shoeX = side * 6
    paintShape(context, WHITE, ellipsePath(shoeX, -3, 5.5, 3.5), {
      ...shadeIf(isPolished),
      decorateInside: isPolished ? (shoeContext) => paintFill(shoeContext, "#ddd6cf", (path) => path.rect(shoeX - 6, -1.4, 12, 3)) : undefined,
    })
    if (isPolished) {
      paintLine(context, OUTLINE, 0.6, linePath(shoeX - 1.6, -5.3, shoeX + 1.6, -3.7))
      paintLine(context, OUTLINE, 0.6, linePath(shoeX + 1.6, -5.3, shoeX - 1.6, -3.7))
    } else {
      paintLine(context, OUTLINE, 0.8, linePath(shoeX - 2, -4.5, shoeX + 2, -4.5))
    }
  },
  highTops: (context, side, isPolished) => {
    const shoeX = side * 6
    const legX = side * 5
    paintShape(context, HIGH_TOP_RED, (path) => path.roundRect(legX - 3.5, -10, 7, 8, 2), shadeIf(isPolished))
    for (const laceY of [-9, -7.2]) paintLine(context, WHITE, 0.7, linePath(legX - 1.2, laceY, legX + 1.2, laceY))
    paintShape(context, WHITE, ellipsePath(side * 7.3, -8, 1.1, 1.1))
    paintShape(context, HIGH_TOP_RED, ellipsePath(shoeX, -3, 5.5, 3.5), {
      ...shadeIf(isPolished),
      decorateInside: (shoeContext) => {
        paintFill(shoeContext, WHITE, (path) => path.rect(shoeX - 6, -1.6, 12, 3))
        paintFill(shoeContext, WHITE, ellipsePath(shoeX, -2, 3.2, 1.8))
      },
    })
  },
  tsarvuli: (context, side, isPolished) => {
    const shoeX = side * 6
    const legX = side * 5
    for (const crossY of [-15, -10]) {
      paintLine(context, OUTLINE, 0.9, linePath(legX - 3, crossY - 2.5, legX + 3, crossY + 2.5))
      paintLine(context, OUTLINE, 0.9, linePath(legX + 3, crossY - 2.5, legX - 3, crossY + 2.5))
    }
    paintShape(context, TSARVULI_LEATHER, ellipsePath(shoeX, -3, 5.8, 3.4), {
      ...shadeIf(isPolished),
      decorateInside: isPolished ? (shoeContext) => paintFill(shoeContext, "rgba(255, 255, 255, 0.2)", ellipsePath(shoeX - 2, -4.6, 1.5, 0.7)) : undefined,
    })
    paintLine(context, OUTLINE, 0.6, curvesPath([
      [shoeX - 3, -4.8, shoeX - 2.6, -3.6, shoeX - 2.2, -2.6],
      [shoeX, -5.2, shoeX, -3.9, shoeX, -2.6],
      [shoeX + 3, -4.8, shoeX + 2.6, -3.6, shoeX + 2.2, -2.6],
    ]))
    paintShape(context, "#e0453a", ellipsePath(shoeX, -6, 1.3, 1.3))
  },
  partyHeels: (context, side, isPolished) => {
    const shoeX = side * 6
    const legX = side * 5
    paintTube(context, BLACK_FABRIC, 0.9, linePath(legX - 3, -7.5, legX + 3, -7.5), isPolished)
    paintShape(context, BLACK_FABRIC, ellipsePath(shoeX, -3, 5.2, 3.3), shadeIf(isPolished))
    paintFill(context, "rgba(255, 255, 255, 0.45)", ellipsePath(shoeX - 2, -4.4, 1.6, 0.7))
    for (const [sparkleX, sparkleY] of [[1.5, -4], [3, -2.5], [-0.5, -2]]) {
      paintFill(context, SILVER, ellipsePath(shoeX + side * sparkleX, sparkleY, 0.45, 0.45))
    }
  },
  folkFlats: (context, side, isPolished) => {
    const shoeX = side * 6
    const legX = side * 5
    paintShape(context, BLACK_FABRIC, ellipsePath(shoeX, -3, 5.5, 3.3), shadeIf(isPolished))
    paintFill(context, "rgba(255, 255, 255, 0.35)", ellipsePath(shoeX - 2, -4.2, 1.6, 0.7))
    paintTube(context, BLACK_FABRIC, 0.9, linePath(legX - 3, -6.5, legX + 3, -6.5), isPolished)
    paintFill(context, SILVER, ellipsePath(side * 7.3, -6.5, 0.6, 0.6))
  },
  boots: (context, side, isPolished) => {
    const shoeX = side * 6
    const legX = side * 5
    paintShape(context, BLACK_FABRIC, (path) => path.roundRect(legX - 3.6, -10, 7.2, 8, 2), shadeIf(isPolished))
    paintShape(context, BLACK_FABRIC, ellipsePath(shoeX, -3, 5.6, 3.5), {
      ...shadeIf(isPolished),
      decorateInside: isPolished ? (shoeContext) => paintFill(shoeContext, "rgba(255, 255, 255, 0.16)", ellipsePath(shoeX - 2, -4.4, 1.5, 0.7)) : undefined,
    })
  },
  hooves: (context, side, isPolished) => {
    const shoeX = side * 6
    paintShape(context, UNICORN_GOLD, (path) => path.roundRect(shoeX - 5, -6, 10, 6, 2.4), {
      ...shadeIf(isPolished),
      decorateInside: isPolished ? (hoofContext) => paintFill(hoofContext, "rgba(255, 255, 255, 0.5)", ellipsePath(shoeX - 2, -4.4, 1.5, 0.7)) : undefined,
    })
    paintLine(context, OUTLINE, 0.7, linePath(shoeX, -3.6, shoeX, 0))
    paintShape(context, UNICORN_LILAC, ellipsePath(side * 5, -6.4, 4.6, 2.4), shadeIf(isPolished))
  },
}

export const LEG_COVERS: Partial<Record<RadiShoes, string>> = { tsarvuli: WOOL_WRAP, folkFlats: WHITE, boots: BLACK_FABRIC, hooves: WHITE }

const drawLegs = (context: Context, shoes: RadiShoes, legLifts: PerSide, kneeBends: PerSide, isPolished: boolean, legColor = LEG_COVERS[shoes] ?? activeColors.skin, hipY = -19) => {
  SIDES.forEach((side, index) => {
    const legX = side * 5
    const lift = legLifts[index]
    const kneeY = -12.5 - lift * 0.5
    const kneeBend = kneeY < hipY ? Math.min(kneeBends[index], 5) : kneeBends[index]
    paintTube(context, legColor, 6, (path) => {
      path.moveTo(legX, hipY - lift * 0.5)
      path.lineTo(legX + side * kneeBend, kneeY)
      path.lineTo(legX, -6 - lift)
    }, isPolished)
    context.save()
    context.translate(0, -lift)
    shoePainters[shoes](context, side, isPolished)
    context.restore()
  })
}

const drawBottom = (context: Context, bottom: RadiBottom, isPolished: boolean) => {
  if (bottom.kind === "skirt") {
    paintShape(context, bottom.color, (path) => {
      path.moveTo(-9, -32)
      path.lineTo(9, -32)
      path.lineTo(15, -18)
      path.quadraticCurveTo(0, -15, -15, -18)
      path.closePath()
    }, { ...shadeIf(isPolished), decorateInside: decorationFor(bottom.pattern) })
    return
  }
  paintShape(context, bottom.color, (path) => {
    path.moveTo(-9, -32)
    path.lineTo(9, -32)
    path.lineTo(10.5, -19)
    path.lineTo(1, -19)
    path.lineTo(0, -24)
    path.lineTo(-1, -19)
    path.lineTo(-10.5, -19)
    path.closePath()
  }, { ...shadeIf(isPolished), decorateInside: decorationFor(bottom.pattern) })
}

export const drawTorso = (context: Context, top: RadiTop, isPolished: boolean, halfWidth = 9) => {
  const pattern = decorationFor(top.pattern)
  paintShape(context, top.color, (path) => path.roundRect(-halfWidth, -49, halfWidth * 2, 19, 5), {
    ...shadeIf(isPolished),
    decorateInside: (torsoContext) => {
      if (pattern) {
        torsoContext.save()
        pattern(torsoContext)
        torsoContext.restore()
      }
      if (isPolished) paintFill(torsoContext, SHADE, ellipsePath(0, -47.5, 8, 3))
    },
  })
}

const drawDenimJacket = (context: Context, isPolished: boolean) => {
  for (const side of SIDES) {
    paintShape(context, DENIM, (path) => {
      path.moveTo(side * 9.5, -49)
      path.lineTo(side * 3, -49)
      path.lineTo(side * 4.5, -31)
      path.lineTo(side * 9.5, -31)
      path.closePath()
    }, {
      ...shadeIf(isPolished),
      decorateInside: isPolished
        ? (jacketContext) => {
            jacketContext.setLineDash([0.9, 0.7])
            paintLine(jacketContext, "#f0b25a", 0.5, linePath(side * 4.9, -44, side * 5.8, -32))
          }
        : undefined,
    })
    paintShape(context, DENIM, (path) => {
      path.moveTo(side * 3, -49)
      path.lineTo(side * 7.5, -49)
      path.lineTo(side * 4, -44)
      path.closePath()
    }, shadeIf(isPolished))
    paintLine(context, OUTLINE, 0.6, (path) => path.rect(side * 7 - 1.5, -41, 3, 2.5))
    if (isPolished) paintFill(context, "#d9b25a", ellipsePath(side * 5.6, -37, 0.7, 0.7))
  }
}

const drawPendant = (context: Context, isPolished: boolean) => {
  paintLine(context, OUTLINE, 0.6, (path) => {
    path.moveTo(-5, -48)
    path.lineTo(0, -41)
    path.lineTo(5, -48)
  })
  paintShape(context, "#2ec4b6", ellipsePath(0, -40, 1.8, 2.2))
  if (isPolished) paintFill(context, WHITE, ellipsePath(-0.6, -40.9, 0.5, 0.6))
}

const drawHeartNecklace = (context: Context, isPolished: boolean) => {
  paintLine(context, SILVER, 0.5, (path) => {
    path.moveTo(-6, -46.5)
    path.lineTo(0, -41.5)
    path.lineTo(6, -46.5)
  })
  paintShape(context, SILVER, (path) => {
    path.moveTo(0, -38.6)
    path.bezierCurveTo(-2.6, -40.2, -2, -42.6, 0, -41.4)
    path.bezierCurveTo(2, -42.6, 2.6, -40.2, 0, -38.6)
    path.closePath()
  }, shadeIf(isPolished))
  if (isPolished) paintFill(context, WHITE, ellipsePath(-0.8, -40.9, 0.4, 0.4))
}

const drawApron = (context: Context, isPolished: boolean) => {
  paintShape(context, FOLK_YELLOW, (path) => {
    path.moveTo(-6.5, -31)
    path.lineTo(6.5, -31)
    path.lineTo(8.5, -17.4)
    path.quadraticCurveTo(0, -16, -8.5, -17.4)
    path.closePath()
  }, {
    ...shadeIf(isPolished),
    decorateInside: (apronContext) => {
      for (const stripeY of [-27, -21.5]) {
        paintFill(apronContext, "#8f9a8c", (path) => path.rect(-10, stripeY, 20, 1.5))
        for (const edgeY of [stripeY - 0.4, stripeY + 1.9]) paintLine(apronContext, WHITE, 0.5, linePath(-10, edgeY, 10, edgeY))
      }
    },
  })
}

const drawPafti = (context: Context, isPolished: boolean) => {
  paintShape(context, BLACK_FABRIC, (path) => path.roundRect(-9.5, -33.5, 19, 3, 1), shadeIf(isPolished))
  for (const side of SIDES) {
    paintShape(context, SILVER, ellipsePath(side * 2.6, -32, 2.8, 2.3), {
      ...shadeIf(isPolished),
      decorateInside: (buckleContext) => paintLine(buckleContext, "#8d939b", 0.5, ellipsePath(side * 2.6, -32, 1.4, 1.1)),
    })
  }
}

const drawPuffSleeves = (context: Context, isPolished: boolean) => {
  for (const side of SIDES) {
    paintShape(context, WHITE, ellipsePath(side * 11, -41.9, 3.8, 3.4), shadeIf(isPolished))
    paintShape(context, FOLK_YELLOW, ellipsePath(side * 11, -43.3, 4, 3.5), shadeIf(isPolished))
  }
}

const braidTuftPath: BuildPath = (path) => {
  path.moveTo(-3.4, -34.4)
  path.lineTo(-5.6, -29.5)
  path.lineTo(-7.4, -34.7)
  path.closePath()
}

const drawBraid = (context: Context, isPolished: boolean) => {
  const braidPaths = [...BRAID_LINKS.map(([linkX, linkY]) => ellipsePath(linkX, linkY, 3, 3.2)), braidTuftPath]
  for (const braidPath of braidPaths) paintLine(context, OUTLINE, OUTLINE_WIDTH * 2, braidPath)
  for (const braidPath of braidPaths) {
    paintFill(context, activeColors.hair, braidPath)
    if (isPolished) paintShade(context, SHADE, braidPath)
  }
  paintLine(context, OUTLINE, 0.6, curvesPath(BRAID_LINKS.map(([linkX, linkY]) => [linkX - 2.4, linkY + 1, linkX, linkY + 3, linkX + 2.4, linkY + 1] as const)))
  if (isPolished) {
    paintLine(context, activeColors.hairHighlight, 0.8, curvesPath(BRAID_LINKS.map(([linkX, linkY]) => [linkX - 1.8, linkY - 1, linkX - 1, linkY - 2.2, linkX + 0.2, linkY - 2.4] as const)))
  }
  paintShape(context, BLACK_FABRIC, ellipsePath(-5.4, -34.6, 2.2, 1.4))
}

export const drawHairFlower = (context: Context, isPolished: boolean) => {
  for (const [leafX, leafY] of [[21.5, -89.5], [13.5, -93.5]]) {
    paintShape(context, LEAF_GREEN, (path) => path.ellipse(leafX, leafY, 3.2, 1.4, 0.46, 0, Math.PI * 2), shadeIf(isPolished))
  }
  const petalPaths = Array.from({ length: 5 }, (_, petal) => {
    const angle = (petal * Math.PI * 2) / 5 - Math.PI / 2
    return ellipsePath(17.5 + Math.cos(angle) * 2.2, -91.5 + Math.sin(angle) * 2.2, 1.8, 1.8)
  })
  for (const petalPath of petalPaths) paintLine(context, OUTLINE, OUTLINE_WIDTH * 2, petalPath)
  for (const petalPath of petalPaths) paintFill(context, WHITE, petalPath)
  paintFill(context, "#ffd23f", ellipsePath(17.5, -91.5, 1.2, 1.2))
}

const drawGaida = (context: Context, isPolished: boolean) => {
  paintShape(context, "#efe3c4", ellipsePath(10, -38, 8, 6.5), {
    ...shadeIf(isPolished),
    decorateInside: isPolished
      ? (bagContext) => {
          for (const [furX, furY] of [[6, -41], [10, -37], [13, -40], [8, -34], [13, -35], [10, -42]]) {
            paintLine(bagContext, "#c9b48c", 0.6, curvesPath([[furX, furY, furX + 1, furY - 1.2, furX + 2, furY]]))
          }
        }
      : undefined,
  })
  paintShape(context, WOOD, (path) => path.roundRect(4.5, -36, 3, 26, 1.5), shadeIf(isPolished))
  if (isPolished) for (const holeY of [-31, -26, -21, -16]) paintFill(context, "#2a1608", ellipsePath(6, holeY, 0.6, 0.6))
  paintShape(context, WOOD, ellipsePath(6, -9, 3, 1.6), shadeIf(isPolished))
}

const drawGaidaBlowpipe = (context: Context, isPolished: boolean) => {
  paintTube(context, WOOD, 1.6, linePath(8, -43, 3, -53.5), isPolished)
}

const drawHead = (context: Context, hair: RadiHair, hasKalpak: boolean, isPolished: boolean) => {
  for (const side of SIDES) paintShape(context, activeColors.skin, ellipsePath(side * 22.5, -66, 4, 5), shadeIf(isPolished))
  paintShape(context, activeColors.skin, facePath, {
    ...shadeIf(isPolished),
    decorateInside: isPolished
      ? (faceContext) => {
          faceContext.translate(0.8, 2.2)
          paintFill(faceContext, SHADE, hairFrontPath(hair))
          if (hasKalpak) paintFill(faceContext, SHADE, kalpakPath)
        }
      : undefined,
  })
}

export const createIrisGradient = (context: Context) => {
  const gradient = context.createLinearGradient(0, -69.5, 0, -58.5)
  gradient.addColorStop(0, "#3a2814")
  gradient.addColorStop(1, activeColors.iris)
  return gradient
}

const drawEye = (context: Context, side: number, isOpen: boolean, isPolished: boolean, gazeY = 0) => {
  const centerX = side * 9
  if (!isOpen) {
    paintLine(context, OUTLINE, 1.6, (path) => {
      path.moveTo(centerX - 4, -63)
      path.quadraticCurveTo(centerX, -69, centerX + 4, -63)
    })
    return
  }
  paintShape(context, isPolished ? createIrisGradient(context) : activeColors.eye, ellipsePath(centerX, -64, 4.2, 5.5), {
    decorateInside: isPolished
      ? (irisContext) => {
          paintFill(irisContext, "rgba(0, 0, 0, 0.25)", ellipsePath(centerX, -69, 5, 2.6))
          paintLine(irisContext, "rgba(255, 230, 170, 0.6)", 0.7, (path) => path.ellipse(centerX, -64, 3, 4.3, 0, Math.PI * 0.2, Math.PI * 0.8))
        }
      : undefined,
  })
  paintFill(context, PUPIL, ellipsePath(centerX + (gazeY === 0 ? 0 : -0.5), -63.2 + gazeY, 2.2, 3))
  paintFill(context, WHITE, ellipsePath(centerX - 1.4, -66.2, 1.5, 1.5))
  paintFill(context, WHITE, ellipsePath(centerX + 1.5, -61.6, 0.7, 0.7))
  if (isPolished) {
    paintFill(context, WHITE, ellipsePath(centerX - 2, -62.6, 0.4, 0.4))
    paintLine(context, OUTLINE, 1.2, (path) => {
      path.moveTo(centerX - 4, -67)
      path.quadraticCurveTo(centerX, -71.2, centerX + 4, -67)
    })
  }
  paintLine(context, OUTLINE, 1.2, linePath(side * 12.5, -67.5, side * 14.5, -69.5))
}

const drawMouth = (context: Context, expression: RadiExpression, isPolished: boolean) => {
  if (expression === "puff") {
    paintShape(context, MOUTH, ellipsePath(2.5, -54, 1.8, 1.8))
    return
  }
  if (expression === "surprised") {
    paintShape(context, MOUTH, ellipsePath(0, -51.5, 3.4, 4.4), {
      decorateInside: (mouthContext) => paintFill(mouthContext, TONGUE, ellipsePath(0, -47.8, 2.8, 1.8)),
    })
    return
  }
  if (expression === "thinking") {
    paintLine(context, OUTLINE, 1.5, (path) => {
      path.moveTo(-4, -52.4)
      path.quadraticCurveTo(-1, -54.2, 1.4, -52.2)
      path.quadraticCurveTo(3.4, -50.6, 4.6, -52.8)
    })
    return
  }
  if (expression === "angry") {
    paintShape(context, MOUTH, (path) => {
      path.moveTo(-5.5, -50)
      path.quadraticCurveTo(0, -57, 5.5, -50)
      path.quadraticCurveTo(0, -52.4, -5.5, -50)
      path.closePath()
    }, {
      decorateInside: (mouthContext) => {
        mouthContext.fillStyle = WHITE
        mouthContext.fillRect(-7, -55.4, 14, 2.4)
      },
    })
    return
  }
  paintShape(context, MOUTH, (path) => {
    path.moveTo(-6, -55)
    path.quadraticCurveTo(0, -54, 6, -55)
    path.quadraticCurveTo(0, -45, -6, -55)
    path.closePath()
  }, {
    decorateInside: (mouthContext) => {
      mouthContext.fillStyle = WHITE
      mouthContext.fillRect(-7, -56, 14, 2.6)
      if (isPolished) paintFill(mouthContext, "rgba(0, 0, 0, 0.2)", (path) => path.rect(-7, -53.4, 14, 0.9))
      paintFill(mouthContext, TONGUE, ellipsePath(0, -50, 3, 1.5))
    },
  })
  if (expression === "tongue") {
    paintShape(context, TONGUE, (path) => path.roundRect(-2.8, -52, 5.6, 6.5, 2.8))
    paintLine(context, OUTLINE, 0.6, linePath(0, -50, 0, -47.5))
  }
}

const drawFace = (context: Context, expression: RadiExpression, isPolished: boolean) => {
  const blushSize = expression === "puff" && !isPolished ? 1.4 : 1
  const isAngry = expression === "angry"
  for (const side of SIDES) {
    drawEye(context, side, !(expression === "tongue" && side === 1), isPolished, expression === "thinking" ? -1.7 : 0)
    if (isAngry) {
      paintFill(context, activeColors.skin, (path) => {
        path.moveTo(side * 4, -66.4)
        path.lineTo(side * 14, -70.2)
        path.lineTo(side * 14, -73)
        path.lineTo(side * 4, -73)
        path.closePath()
      })
      paintLine(context, OUTLINE, 1.2, linePath(side * 4.2, -66.4, side * 13.8, -70.2))
      paintLine(context, OUTLINE, 1.8, linePath(side * 4.5, -69.4, side * 13, -73.4))
    } else {
      const browLift = expression === "surprised" ? 3 : expression === "thinking" ? side * 1.8 : 0
      paintLine(context, activeColors.hair, 1.2, (path) => {
        path.moveTo(side * 6, -72.5 - browLift)
        path.quadraticCurveTo(side * 9, -74.5 - browLift * 1.4, side * 12, -72.5 - browLift)
      })
    }
    paintFill(context, isAngry ? "rgba(240, 60, 60, 0.5)" : BLUSH, ellipsePath(side * 14, -57, 4 * blushSize, 2.4 * blushSize))
    if (isPolished) paintFill(context, "rgba(255, 255, 255, 0.7)", ellipsePath(side * 14 - 1.6, -58, 0.8, 0.6))
  }
  paintLine(context, OUTLINE, 0.8, linePath(0, -59.5, 0.8, -58.5))
  drawMouth(context, expression, isPolished)
  if (isAngry) {
    paintLine(context, HIGH_TOP_RED, 1.3, curvesPath([
      [12.5, -84, 15, -82.5, 15.2, -80],
      [17.5, -85, 17.8, -82.5, 20.2, -82],
      [13, -78.2, 15.6, -78.4, 16.4, -76],
      [18.6, -80.2, 18.4, -77.6, 21, -77.4],
    ]))
  }
}

const glassesPoint = (x: number, y: number, headTilt: number, faceTurn: number): [number, number] => {
  const localX = x + faceTurn * 4
  const dy = y + 42
  const cos = Math.cos(headTilt)
  const sin = Math.sin(headTilt)
  return [localX * cos - dy * sin, -42 + localX * sin + dy * cos]
}

const traceTiltedRoundedRect = (path: Path2D, x: number, y: number, width: number, height: number, radius: number, headTilt: number, faceTurn: number) => {
  const right = x + width
  const bottom = y + height
  const points: [number, number][] = []
  const arc = (centerX: number, centerY: number, start: number, end: number) => {
    for (let step = 0; step <= 5; step += 1) {
      const angle = start + ((end - start) * step) / 5
      points.push(glassesPoint(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius, headTilt, faceTurn))
    }
  }
  arc(right - radius, y + radius, -Math.PI / 2, 0)
  arc(right - radius, bottom - radius, 0, Math.PI / 2)
  arc(x + radius, bottom - radius, Math.PI / 2, Math.PI)
  arc(x + radius, y + radius, Math.PI, Math.PI * 1.5)
  path.moveTo(points[0][0], points[0][1])
  for (let index = 1; index < points.length; index += 1) path.lineTo(points[index][0], points[index][1])
  path.closePath()
}

const drawReadingGlassTemples = (context: Context, headTilt: number, faceTurn: number) => {
  for (const side of SIDES) {
    const templeStart = glassesPoint(side * 15.2, -67.4, headTilt, faceTurn)
    const templeEnd = glassesPoint(side * 23, -69.2, headTilt, faceTurn)
    paintLine(context, OUTLINE, 1.15, (path) => {
      path.moveTo(templeStart[0], templeStart[1])
      path.lineTo(templeEnd[0], templeEnd[1])
    })
  }
}

export const drawReadingGlasses = (context: Context, headTilt = 0, faceTurn = 0) => {
  for (const side of SIDES) {
    const centerX = side * 9
    paintLine(context, OUTLINE, 1.35, (path) => traceTiltedRoundedRect(path, centerX - 6.2, -70.6, 12.4, 13.2, 4.2, headTilt, faceTurn))
    const shineStart = glassesPoint(centerX - 3.4, -68.8, headTilt, faceTurn)
    const shineBend = glassesPoint(centerX - 1.2, -67.4, headTilt, faceTurn)
    const shineEnd = glassesPoint(centerX + 1.4, -68.6, headTilt, faceTurn)
    paintLine(context, "rgba(255, 255, 255, 0.9)", 0.9, (path) => {
      path.moveTo(shineStart[0], shineStart[1])
      path.quadraticCurveTo(shineBend[0], shineBend[1], shineEnd[0], shineEnd[1])
    })
  }
  const bridgeStart = glassesPoint(-2.8, -66.6, headTilt, faceTurn)
  const bridgeEnd = glassesPoint(2.8, -66.6, headTilt, faceTurn)
  paintLine(context, OUTLINE, 1.35, (path) => {
    path.moveTo(bridgeStart[0], bridgeStart[1])
    path.lineTo(bridgeEnd[0], bridgeEnd[1])
  })
}

export const drawSunglasses = (context: Context) => {
  for (const side of SIDES) {
    paintShape(context, "#2b8cff", (path) => {
      path.moveTo(side * 3.5, -68.5)
      path.lineTo(side * 15.5, -68.5)
      path.quadraticCurveTo(side * 16.5, -58, side * 10, -58.5)
      path.quadraticCurveTo(side * 3, -59, side * 3.5, -68.5)
      path.closePath()
    }, { decorateInside: (lensContext) => paintLine(lensContext, "#bfe4ff", 1.5, linePath(side * 6, -60, side * 13, -68)) })
    paintLine(context, OUTLINE, 1.2, linePath(side * 15.5, -67.5, side * 24, -69))
  }
  paintLine(context, OUTLINE, 1.2, linePath(-3.5, -67, 3.5, -67))
}

const drawHairFront = (context: Context, hair: RadiHair, isPolished: boolean) => {
  paintShape(context, activeColors.hair, hairFrontPath(hair), shadeIf(isPolished))
  if (hair === "bob") {
    paintLine(context, activeColors.hairHighlight, 1.4, curvesPath([
      [-16, -86, -12, -92, -5, -93],
      [3, -91, 9, -93, 14, -89],
      [-24, -74, -26, -64, -24, -56],
    ]))
    if (isPolished) paintLine(context, HAIR_STRAND, 0.6, curvesPath([
      [-6, -86, 4, -84, 13, -79],
      [-2, -90, 8, -88, 18, -82],
      [22, -78, 25, -68, 23, -56],
    ]))
    return
  }
  if (hair === "ponytail" || hair === "sideTail") {
    paintShape(context, "#ff5fa2", ellipsePath(19.5, -87, 2.6, 3))
    if (isPolished) paintFill(context, "rgba(255, 255, 255, 0.6)", ellipsePath(18.7, -88.2, 0.7, 0.9))
  }
  if (isPolished) paintLine(context, HAIR_STRAND, 0.6, curvesPath(POLISHED_HAIR_STRANDS))
  paintLine(context, activeColors.hairHighlight, 1.4, curvesPath(HAIR_STREAKS))
}

const drawBandana = (context: Context, isPolished: boolean) => {
  paintShape(context, BLACK_FABRIC, (path) => {
    path.moveTo(-25.4, -75)
    path.quadraticCurveTo(0, -95, 25.4, -75)
    path.lineTo(24.2, -81)
    path.quadraticCurveTo(0, -100, -24.2, -81)
    path.closePath()
  }, shadeIf(isPolished))
  paintLine(context, WHITE, 0.7, (path) => {
    path.moveTo(-3.5, -89.3)
    path.lineTo(3.5, -89.3)
    path.lineTo(0, -86)
    path.closePath()
  })
  paintFill(context, WHITE, ellipsePath(0, -88.2, 0.6, 0.6))
}

export const drawKalpak = (context: Context, isPolished: boolean) => {
  paintShape(context, KALPAK_FUR, kalpakPath, {
    ...shadeIf(isPolished),
    decorateInside: (hatContext) => {
      paintFill(hatContext, "rgba(255, 255, 255, 0.08)", ellipsePath(-12, -98, 7, 16))
      paintLine(hatContext, "#45424d", 0.7, (path) => {
        for (let row = 0; row < 8; row += 1) {
          for (let column = 0; column < 11; column += 1) {
            const curlX = -25 + column * 5 + (row % 2) * 2.5
            const curlY = -112 + row * 4.3
            path.moveTo(curlX + Math.cos(Math.PI * 0.9) * 1.2, curlY + Math.sin(Math.PI * 0.9) * 1.2)
            path.arc(curlX, curlY, 1.2, Math.PI * 0.9, Math.PI * 2.3)
          }
        }
      })
    },
  })
}

const drawArms = (context: Context, look: RadiLook, hands: RadiHands, elbowBends: PerSide, isPolished: boolean) => {
  const isBatman = look.extras.includes("batman")
  const isAstronaut = look.extras.includes("astronaut")
  const sleeveColor = look.extras.includes("denimJacket") ? DENIM : isBatman || isAstronaut ? look.top.color : activeColors.skin
  const handColor = isBatman ? BLACK_FABRIC : isAstronaut ? ASTRONAUT_GLOVE : activeColors.skin
  SIDES.forEach((side, index) => {
    const [handX, handY] = hands[index]
    const shoulderX = side * 8.5
    const shoulderY = -42.5
    const bendPerUnit = elbowBends[index] / (Math.hypot(handX - shoulderX, handY - shoulderY) || 1)
    const elbowX = (shoulderX + handX) / 2 + side * (handY - shoulderY) * bendPerUnit
    const elbowY = (shoulderY + handY) / 2 - side * (handX - shoulderX) * bendPerUnit
    paintTube(context, sleeveColor, 4.5, (path) => {
      path.moveTo(shoulderX, shoulderY)
      path.lineTo(elbowX, elbowY)
      path.lineTo(handX, handY)
    }, isPolished)
    if (isAstronaut) {
      paintTube(context, ASTRONAUT_TRIM, 4.7, linePath(
        elbowX + (handX - elbowX) * 0.62,
        elbowY + (handY - elbowY) * 0.62,
        elbowX + (handX - elbowX) * 0.74,
        elbowY + (handY - elbowY) * 0.74,
      ), isPolished)
    }
    if (isBatman) {
      paintTube(context, BLACK_FABRIC, 4.7, linePath(
        elbowX + (handX - elbowX) * 0.55,
        elbowY + (handY - elbowY) * 0.55,
        handX,
        handY,
      ), isPolished)
    }
    if (look.pose === "peace" && side === 1) {
      paintTube(context, activeColors.skin, 1.8, linePath(handX, handY, handX - 1.5, handY - 6))
      paintTube(context, activeColors.skin, 1.8, linePath(handX, handY, handX + 2.5, handY - 6))
    }
    paintShape(context, handColor, ellipsePath(handX, handY, 2.8, 2.8), shadeIf(isPolished))
  })
}

const drawHeadphones = (context: Context, isPolished: boolean) => {
  paintTube(context, WHITE, 2, (path) => {
    path.moveTo(-10, -43)
    path.quadraticCurveTo(0, -35, 10, -43)
  }, isPolished)
  for (const side of SIDES) {
    paintShape(context, WHITE, ellipsePath(side * 10.5, -43.5, 3.4, 3.8), shadeIf(isPolished))
    paintFill(context, "#333333", ellipsePath(side * 10.5, -43.5, 1.6, 1.8))
  }
}

const batMarkPath: BuildPath = (path) => {
  path.moveTo(0, -1.15)
  path.lineTo(-0.85, -2.55)
  path.lineTo(-0.45, -0.9)
  path.lineTo(-1.2, -0.4)
  path.lineTo(-4.6, -1.65)
  path.lineTo(-2.65, 0.35)
  path.lineTo(-3.75, 1.3)
  path.lineTo(-0.55, 0.45)
  path.lineTo(0, 1.6)
  path.lineTo(0.55, 0.45)
  path.lineTo(3.75, 1.3)
  path.lineTo(2.65, 0.35)
  path.lineTo(4.6, -1.65)
  path.lineTo(1.2, -0.4)
  path.lineTo(0.45, -0.9)
  path.lineTo(0.85, -2.55)
  path.closePath()
}

export const drawBatMark = (context: Context, centerX: number, centerY: number, scale: number) => {
  context.save()
  context.translate(centerX, centerY)
  context.scale(scale, scale)
  paintFill(context, OUTLINE, batMarkPath)
  context.restore()
}

const drawBatmanJumpsuit = (context: Context, color: string, isPolished: boolean) => {
  paintShape(context, color, (path) => {
    path.moveTo(-4, -49)
    path.quadraticCurveTo(-12, -49, -9.2, -43)
    path.lineTo(-9.4, -26)
    path.lineTo(9.4, -26)
    path.lineTo(9.2, -43)
    path.quadraticCurveTo(12, -49, 4, -49)
    path.closePath()
  }, {
    ...shadeIf(isPolished),
    decorateInside: isPolished ? (suitContext) => paintFill(suitContext, SHADE, ellipsePath(0, -47.5, 8, 3)) : undefined,
  })
  paintShape(context, BLACK_FABRIC, (path) => {
    path.moveTo(-9.5, -29.5)
    path.lineTo(9.5, -29.5)
    path.lineTo(9.6, -24)
    path.quadraticCurveTo(4.5, -23.4, 1.8, -21)
    path.quadraticCurveTo(0, -20.2, -1.8, -21)
    path.quadraticCurveTo(-4.5, -23.4, -9.6, -24)
    path.closePath()
  }, shadeIf(isPolished))
}

const drawBatmanCape = (context: Context, isPolished: boolean) => {
  paintShape(context, BLACK_FABRIC, (path) => {
    path.moveTo(-9, -47)
    path.quadraticCurveTo(-28, -34, -30, -8)
    path.lineTo(-22, -14)
    path.lineTo(-16, -2)
    path.lineTo(-8, -12)
    path.lineTo(0, -1)
    path.lineTo(8, -12)
    path.lineTo(16, -2)
    path.lineTo(22, -14)
    path.lineTo(30, -8)
    path.quadraticCurveTo(28, -34, 9, -47)
    path.quadraticCurveTo(0, -43, -9, -47)
    path.closePath()
  }, shadeIf(isPolished))
}

const drawBatmanChest = (context: Context, isPolished: boolean) => {
  paintShape(context, FOLK_YELLOW, ellipsePath(0, -40, 7, 5.6), shadeIf(isPolished))
  drawBatMark(context, 0, -40.2, 1.2)
  paintShape(context, FOLK_YELLOW, (path) => path.roundRect(-10.5, -33.4, 21, 4.2, 1.4), shadeIf(isPolished))
  paintShape(context, BLACK_FABRIC, ellipsePath(0, -31.3, 1.7, 1.7))
  for (const pouchX of [-6.2, 6.2]) paintShape(context, BLACK_FABRIC, (path) => path.roundRect(pouchX - 1.3, -33, 2.6, 3.2, 0.6))
}

const drawAstronautBackpack = (context: Context, isPolished: boolean) => {
  paintShape(context, SILVER, (path) => path.roundRect(-13.5, -51, 27, 23, 4), shadeIf(isPolished))
  for (const side of SIDES) paintShape(context, ASTRONAUT_TRIM, (path) => path.roundRect(side * 11 - 2, -48, 4, 6, 1.2))
}

const drawAstronautSuit = (context: Context, color: string, isPolished: boolean) => {
  paintShape(context, color, (path) => {
    path.moveTo(-4, -49)
    path.quadraticCurveTo(-12, -49, -9.6, -43)
    path.lineTo(-10, -24)
    path.lineTo(10, -24)
    path.lineTo(9.6, -43)
    path.quadraticCurveTo(12, -49, 4, -49)
    path.closePath()
  }, {
    ...shadeIf(isPolished),
    decorateInside: isPolished ? (suitContext) => paintFill(suitContext, SHADE, ellipsePath(0, -47.5, 8, 3)) : undefined,
  })
  paintShape(context, SILVER, (path) => path.roundRect(-10.5, -31, 21, 3.6, 1.2), shadeIf(isPolished))
  paintShape(context, ASTRONAUT_TRIM, (path) => path.roundRect(-2.2, -31.4, 4.4, 4.4, 1))
}

const drawAstronautChest = (context: Context, isPolished: boolean) => {
  paintShape(context, SILVER, (path) => path.roundRect(-6, -42, 12, 7.5, 1.6), shadeIf(isPolished))
  for (const [buttonX, buttonColor] of [[-3.4, "#e63946"], [0, "#4cc9f0"], [3.4, FOLK_YELLOW]] as const) {
    paintFill(context, buttonColor, ellipsePath(buttonX, -39.4, 1.2, 1.2))
  }
  paintLine(context, OUTLINE, 0.6, linePath(-3.5, -36.6, 3.5, -36.6))
  paintShape(context, WHITE, (path) => path.rect(-9, -47, 5.4, 3.6), {
    decorateInside: (flagContext) => {
      paintFill(flagContext, "#00966e", (path) => path.rect(-9, -45.8, 5.4, 1.2))
      paintFill(flagContext, "#d62612", (path) => path.rect(-9, -44.6, 5.4, 1.2))
    },
  })
}

const drawAstronautHelmet = (context: Context) => {
  paintShape(context, SILVER, (path) => path.roundRect(-14, -49, 28, 6, 3))
  const glass: BuildPath = (path) => path.ellipse(0, -73, 31, 32, 0, 0, Math.PI * 2)
  paintFill(context, "rgba(190, 225, 255, 0.22)", glass)
  paintLine(context, OUTLINE, OUTLINE_WIDTH * 1.3, glass)
  paintLine(context, "rgba(255, 255, 255, 0.85)", 2.4, (path) => path.arc(0, -73, 26, Math.PI * 1.08, Math.PI * 1.38))
  paintLine(context, "rgba(255, 255, 255, 0.6)", 1.6, (path) => path.arc(0, -73, 26, Math.PI * 1.45, Math.PI * 1.52))
  paintFill(context, "rgba(255, 255, 255, 0.7)", ellipsePath(18, -58, 2.2, 1.4))
}

const drawBatmanCowl = (context: Context, isPolished: boolean) => {
  paintShape(context, BLACK_FABRIC, (path) => {
    path.moveTo(-18, -57)
    path.quadraticCurveTo(-26, -66, -22, -84)
    path.lineTo(-17, -93)
    path.lineTo(-12, -111)
    path.lineTo(-7, -93)
    path.quadraticCurveTo(0, -98, 7, -93)
    path.lineTo(12, -111)
    path.lineTo(17, -93)
    path.lineTo(22, -84)
    path.quadraticCurveTo(26, -66, 18, -57)
    path.quadraticCurveTo(14, -53.5, 8, -58)
    path.quadraticCurveTo(3.2, -56.4, 0, -56)
    path.quadraticCurveTo(-3.2, -56.4, -8, -58)
    path.quadraticCurveTo(-14, -53.5, -18, -57)
    path.closePath()
  }, shadeIf(isPolished))
  for (const side of SIDES) {
    paintShape(context, WHITE, (path) => path.ellipse(side * 9, -65.2, 5.2, 2.15, side * -0.4, 0, Math.PI * 2))
  }
}

export const paintRainbowStreaks = (context: Context, curves: readonly CurveLine[], firstColor = 0) => {
  curves.forEach((curve, index) => paintLine(context, RAINBOW[(firstColor + index) % RAINBOW.length], 2.2, curvesPath([curve])))
}

export const paintRainbowTail = (context: Context, [startX, startY, controlX, controlY, endX, endY]: CurveLine, [stepX, stepY]: Point) => {
  const bands = RAINBOW.map((color, band) => ({
    color,
    path: curvesPath([[startX + stepX * band, startY + stepY * band, controlX + stepX * band, controlY + stepY * band, endX + stepX * band, endY + stepY * band]]),
  }))
  for (const { path } of bands) paintLine(context, OUTLINE, 3.6 + OUTLINE_WIDTH * 2, path)
  for (const { color, path } of bands) paintLine(context, color, 3.6, path)
}

export const drawUnicornHorn = (context: Context, baseX: number, baseY: number, tipX: number, tipY: number, isPolished: boolean) => {
  const length = Math.hypot(tipX - baseX, tipY - baseY)
  context.save()
  context.translate(baseX, baseY)
  context.rotate(Math.atan2(tipX - baseX, baseY - tipY))
  paintShape(context, UNICORN_GOLD, (path) => {
    path.moveTo(-5, 0)
    path.quadraticCurveTo(-3, -length * 0.55, 0, -length)
    path.quadraticCurveTo(3, -length * 0.55, 5, 0)
    path.quadraticCurveTo(0, 1.6, -5, 0)
    path.closePath()
  }, {
    ...shadeIf(isPolished),
    decorateInside: (hornContext) => {
      for (let ring = 1; ring <= 4; ring += 1) {
        const ringY = (-length * ring) / 5
        paintLine(hornContext, HORN_SPIRAL, 1, curvesPath([[-6, ringY + 2.2, 0, ringY + 0.4, 6, ringY - 1.4]]))
      }
      paintLine(hornContext, "rgba(255, 255, 255, 0.8)", 1, linePath(-1.8, -2, -0.6, -length * 0.7))
    },
  })
  context.restore()
}

export const drawUnicornEar = (context: Context, baseX: number, baseY: number, tilt: number, isPolished: boolean) => {
  context.save()
  context.translate(baseX, baseY)
  context.rotate(tilt)
  paintShape(context, WHITE, (path) => {
    path.moveTo(-3.6, 0)
    path.quadraticCurveTo(-3, -7, 0, -11)
    path.quadraticCurveTo(3, -7, 3.6, 0)
    path.closePath()
  }, shadeIf(isPolished))
  paintFill(context, EAR_PINK, (path) => {
    path.moveTo(-1.6, -1)
    path.quadraticCurveTo(-1.3, -5.5, 0, -8)
    path.quadraticCurveTo(1.3, -5.5, 1.6, -1)
    path.closePath()
  })
  context.restore()
}

export const drawStarSparkle = (context: Context, centerX: number, centerY: number, size: number, color: string) => {
  paintFill(context, color, (path) => {
    path.moveTo(centerX, centerY - size)
    path.quadraticCurveTo(centerX, centerY, centerX + size, centerY)
    path.quadraticCurveTo(centerX, centerY, centerX, centerY + size)
    path.quadraticCurveTo(centerX, centerY, centerX - size, centerY)
    path.quadraticCurveTo(centerX, centerY, centerX, centerY - size)
    path.closePath()
  })
}

const drawUnicornBackMane = (context: Context) => paintRainbowStreaks(context, [
  [-25, -70, -29, -52, -23, -39],
  [-21, -58, -24, -46, -17, -38],
  [25, -70, 29, -52, 23, -39],
  [21, -58, 24, -46, 17, -38],
])

const drawUnicornHeadpiece = (context: Context, isPolished: boolean) => {
  paintRainbowStreaks(context, [
    [-21, -68, -23, -82, -15, -90],
    [-10, -77, -10, -88, -3, -93],
    [4, -81, 6, -91, 12, -91],
    [14, -82, 20, -88, 23, -72],
  ], 2)
  for (const side of SIDES) drawUnicornEar(context, side * 15, -91, side * 0.45, isPolished)
  drawUnicornHorn(context, 0, -93, 3, -125, isPolished)
  context.save()
  context.translate(-25.5, -1.5)
  drawHairFlower(context, isPolished)
  context.restore()
  drawStarSparkle(context, -20, -110, 4, WHITE)
  drawStarSparkle(context, 19, -118, 3, UNICORN_GOLD)
  drawStarSparkle(context, 27, -100, 2.4, WHITE)
}

const RADI_HAIR_BACK_BOUNDS: SpriteBounds = [-45, -140, 45, 5]
const RADI_BODY_BOUNDS: SpriteBounds = [-50, -75, 50, 5]
const RADI_HEAD_BOUNDS: SpriteBounds = [-45, -130, 45, -20]
const RADI_HEAD_FRONT_BOUNDS: SpriteBounds = [-50, -150, 50, -10]

export const drawRadi = (context: Context, look: RadiLook, feetX: number, feetY: number, scale: number, motion: Partial<RadiMotion> = {}, spriteScene?: string) => {
  const spriteKey = spriteScene && `${spriteScene}:radi:${JSON.stringify(look)}`
  const paintPart = (part: string, bounds: SpriteBounds, drawPart: (partContext: Context) => void) => {
    if (spriteKey) paintSprite(context, `${spriteKey}:${part}`, 0, 0, bounds, drawPart)
    else drawPart(context)
  }
  const hasExtra = (extra: RadiExtra) => look.extras.includes(extra)
  const isPolished = look.polished === true
  const isBatman = hasExtra("batman")
  const isUnicorn = hasExtra("unicorn")
  const isAstronaut = hasExtra("astronaut")
  const hasSuit = isBatman || isAstronaut
  const { faceTurn = 0, legLifts = [0, 0], kneeBends = [0, 0], hands = HAND_POSITIONS[look.pose], elbowBends = [0, 0], hideLegs = false, headTilt = 0 } = motion
  const drawWithHeadTilt = (drawPiece: () => void) => {
    context.save()
    context.translate(0, -42)
    context.rotate(headTilt)
    context.translate(0, 42)
    drawPiece()
    context.restore()
  }

  activeColors = look.colors ?? RADI_COLORS
  context.save()
  context.translate(...(spriteKey ? snapToSubpixel(context, feetX, feetY) : [feetX, feetY] as const))
  context.scale(scale, scale)
  context.lineJoin = "round"
  context.lineCap = "round"
  context.lineWidth = OUTLINE_WIDTH
  context.strokeStyle = OUTLINE

  if (isUnicorn) paintRainbowTail(context, [8, -30, 32, -42, 31, -18], [-1.8, 2.9])
  if (isBatman) drawBatmanCape(context, isPolished)
  else drawWithHeadTilt(() => paintPart("hairBack", RADI_HAIR_BACK_BOUNDS, (partContext) => {
    drawHairBack(partContext, look.hair, isPolished)
    if (isUnicorn) drawUnicornBackMane(partContext)
  }))
  if (isAstronaut) drawAstronautBackpack(context, isPolished)
  if (!hideLegs) drawLegs(context, look.shoes ?? "sneakers", legLifts, kneeBends, isPolished, hasSuit ? look.top.color : undefined, hasSuit ? -24 : undefined)
  paintPart("body", RADI_BODY_BOUNDS, (partContext) => {
    if (isBatman) drawBatmanJumpsuit(partContext, look.top.color, isPolished)
    if (isAstronaut) drawAstronautSuit(partContext, look.top.color, isPolished)
    if (!hasSuit) {
      drawBottom(partContext, look.bottom, isPolished)
      drawTorso(partContext, look.top, isPolished)
    }
    if (isBatman) drawBatmanChest(partContext, isPolished)
    if (isAstronaut) drawAstronautChest(partContext, isPolished)
    if (hasExtra("apron")) drawApron(partContext, isPolished)
    if (hasExtra("pafti")) drawPafti(partContext, isPolished)
    if (hasExtra("denimJacket")) drawDenimJacket(partContext, isPolished)
    if (hasExtra("pendant")) drawPendant(partContext, isPolished)
    if (hasExtra("heartNecklace")) drawHeartNecklace(partContext, isPolished)
    if (hasExtra("gaida")) drawGaida(partContext, isPolished)
  })
  drawWithHeadTilt(() => {
    paintPart("head", RADI_HEAD_BOUNDS, (partContext) => drawHead(partContext, look.hair, hasExtra("kalpak"), isPolished))
    context.save()
    context.translate(faceTurn * 4, 0)
    paintPart("face", RADI_HEAD_BOUNDS, (partContext) => {
      drawFace(partContext, look.expression, isPolished)
      if (hasExtra("sunglasses")) drawSunglasses(partContext)
    })
    context.restore()
  })
  if (hasExtra("readingGlasses")) drawReadingGlassTemples(context, headTilt, faceTurn)
  drawWithHeadTilt(() => paintPart("headFront", RADI_HEAD_FRONT_BOUNDS, (partContext) => {
    if (isBatman) drawBatmanCowl(partContext, isPolished)
    else drawHairFront(partContext, look.hair, isPolished)
    if (hasExtra("bandana")) drawBandana(partContext, isPolished)
    if (hasExtra("kalpak")) drawKalpak(partContext, isPolished)
    if (hasExtra("hairFlower")) drawHairFlower(partContext, isPolished)
    if (isUnicorn) drawUnicornHeadpiece(partContext, isPolished)
    if (isAstronaut) drawAstronautHelmet(partContext)
  }))
  if (hasExtra("readingGlasses")) drawReadingGlasses(context, headTilt, faceTurn)
  drawArms(context, look, hands, elbowBends, isPolished)
  if (hasExtra("puffSleeves")) drawPuffSleeves(context, isPolished)
  if (hasExtra("headphones")) drawHeadphones(context, isPolished)
  if (hasExtra("gaida")) drawGaidaBlowpipe(context, isPolished)

  context.restore()
  activeColors = RADI_COLORS
}
