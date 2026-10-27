import { ellipsePath, linePath, paintFill, paintLine, paintShade, paintShape, type BuildPath, type Context } from "@/characters/paint"
import {
  BLACK_FABRIC,
  BLUSH,
  DENIM,
  EYE,
  FOLK_YELLOW,
  HAIR,
  HAIR_HIGHLIGHT,
  HAIR_STRAND,
  HIGH_TOP_RED,
  LEG_COVERS,
  MOUTH,
  OUTLINE,
  OUTLINE_WIDTH,
  PUPIL,
  SHADE,
  SILVER,
  SKIN,
  TONGUE,
  TSARVULI_LEATHER,
  UNICORN_GOLD,
  UNICORN_LILAC,
  WHITE,
  WOOD,
  createIrisGradient,
  curvesPath,
  decorationFor,
  drawHairFlower,
  drawBatMark,
  drawKalpak,
  drawStarSparkle,
  drawTorso,
  drawUnicornEar,
  drawUnicornHorn,
  paintRainbowStreaks,
  paintRainbowTail,
  paintTube,
  shadeIf,
  type Point,
  type RadiBottom,
  type RadiExpression,
  type RadiHair,
  type RadiLook,
  type RadiShoes,
} from "@/characters/radi"

type DrawSideShoe = (context: Context, legX: number, isPolished: boolean) => void
export type HairWind = { strength: number; phase: number }
type BendPoint = (x: number, y: number) => readonly [number, number]
type HairCurve = readonly [number, number, number, number, number, number]

const straightHair: BendPoint = (x, y) => [x, y]

const clampToUnit = (amount: number) => Math.min(1, Math.max(0, amount))

const windBentHair = ({ strength, phase }: HairWind): BendPoint => (x, y) => {
  const fall = clampToUnit((y + 82) / 42)
  const reach = fall * clampToUnit((-x - 4) / 22) * strength
  return [x - reach * 26, y - reach * 14 + Math.sin(phase - fall * 3) * 3 * reach]
}

const bendCurves = (curves: readonly HairCurve[], bend: BendPoint) =>
  curves.map(([startX, startY, controlX, controlY, endX, endY]) => [...bend(startX, startY), ...bend(controlX, controlY), ...bend(endX, endY)] as const)

const SIDE_PONYTAIL_LOCKS = [
  [-19, -88, -52, -98, -23, -78],
  [-20, -87, -56, -82, -22, -76.5],
  [-21, -86, -52, -66, -20, -77],
] as const

const SIDE_BRAID_LINKS = [
  [-20.5, -58, 3.4],
  [-21, -53.6, 3.3],
  [-19.8, -49.2, 3.1],
  [-17.8, -45, 2.9],
  [-15.3, -41.2, 2.7],
  [-12.8, -37.8, 2.5],
] as const

const sideHeadPath: BuildPath = (path) => {
  path.moveTo(-2, -93)
  path.bezierCurveTo(14, -93, 23, -83, 23, -70)
  path.quadraticCurveTo(25.2, -64.5, 23, -61.5)
  path.bezierCurveTo(22.5, -54, 18, -46, 10, -44.2)
  path.quadraticCurveTo(6, -43.4, 2, -45)
  path.bezierCurveTo(-6, -48, -12, -52, -16, -56)
  path.bezierCurveTo(-21, -60, -23, -64, -23, -70)
  path.bezierCurveTo(-23, -84, -14, -93, -2, -93)
  path.closePath()
}

const sideHairCapPath: BuildPath = (path) => {
  path.moveTo(20.5, -78)
  path.bezierCurveTo(19, -101, -19, -103, -24.5, -78)
  path.quadraticCurveTo(-26, -62, -19, -52)
  path.quadraticCurveTo(-11, -58, -8, -66)
  path.quadraticCurveTo(-4, -73, 4, -74)
  path.quadraticCurveTo(14, -75, 20.5, -78)
  path.closePath()
}

const sideLooseHairPath = (bend: BendPoint): BuildPath => (path) => {
  path.moveTo(23.8, -76.5)
  path.bezierCurveTo(21, -100, -19, -104, ...bend(-25, -80))
  path.bezierCurveTo(...bend(-28, -66), ...bend(-29, -52), ...bend(-27, -40))
  path.quadraticCurveTo(...bend(-23, -37.5), ...bend(-20, -40.5))
  path.quadraticCurveTo(...bend(-17, -37), ...bend(-13, -40))
  path.quadraticCurveTo(...bend(-10, -38), ...bend(-8.5, -41.5))
  path.bezierCurveTo(...bend(-11, -50), ...bend(-9, -60), ...bend(-7, -66))
  path.quadraticCurveTo(-3, -72.5, 5, -73.5)
  path.lineTo(9, -74.8)
  path.lineTo(12, -76.8)
  path.lineTo(15.5, -74.8)
  path.lineTo(18.5, -77)
  path.lineTo(21.5, -75)
  path.closePath()
}

const sideBobHairPath: BuildPath = (path) => {
  path.moveTo(21, -78)
  path.bezierCurveTo(20, -101, -20, -103, -25, -78)
  path.quadraticCurveTo(-28, -62, -22, -50)
  path.quadraticCurveTo(-10, -47, 3, -50)
  path.quadraticCurveTo(-2, -62, 4, -73)
  path.quadraticCurveTo(12, -76, 21, -78)
  path.closePath()
}

const drawSideHairBack = (context: Context, hair: RadiHair, isPolished: boolean) => {
  if (hair === "bob") return
  if (hair === "bun") {
    paintShape(context, HAIR, ellipsePath(-10, -96, 7.5, 6.5), shadeIf(isPolished))
    return
  }
  if (hair === "ponytail") {
    const lockPaths = SIDE_PONYTAIL_LOCKS.map(([baseStartX, baseStartY, tipX, tipY, baseEndX, baseEndY]): BuildPath => (path) => {
      path.moveTo(baseStartX, baseStartY)
      path.lineTo(tipX, tipY)
      path.lineTo(baseEndX, baseEndY)
      path.closePath()
    })
    for (const lockPath of lockPaths) paintLine(context, OUTLINE, OUTLINE_WIDTH * 2, lockPath)
    for (const lockPath of lockPaths) {
      paintFill(context, HAIR, lockPath)
      if (isPolished) paintShade(context, SHADE, lockPath)
    }
    paintLine(context, HAIR_HIGHLIGHT, 1.2, linePath(-27, -83, -42, -82))
    return
  }
  if (hair === "braid") {
    const braidPaths: BuildPath[] = [
      ...SIDE_BRAID_LINKS.map(([linkX, linkY, radius], index): BuildPath => (path) =>
        path.ellipse(linkX, linkY, radius * 0.95, radius * 1.1, index % 2 === 0 ? 0.35 : -0.35, 0, Math.PI * 2)),
      (path) => {
        path.moveTo(-13.6, -35.6)
        path.quadraticCurveTo(-13, -31.5, -9.5, -29.5)
        path.quadraticCurveTo(-10.6, -32.5, -10, -35.8)
        path.closePath()
      },
    ]
    for (const braidPath of braidPaths) paintLine(context, OUTLINE, OUTLINE_WIDTH * 2, braidPath)
    for (const braidPath of braidPaths) {
      paintFill(context, HAIR, braidPath)
      if (isPolished) paintShade(context, SHADE, braidPath)
    }
    paintLine(context, OUTLINE, 0.6, curvesPath(SIDE_BRAID_LINKS.map(([linkX, linkY, radius], index) => {
      const [startDrop, endDrop] = index % 2 === 0 ? [0.2, 1.1] : [1.1, 0.2]
      return [linkX - radius * 0.85, linkY + radius * startDrop, linkX, linkY + radius * 0.9, linkX + radius * 0.85, linkY + radius * endDrop] as const
    })))
    if (isPolished) {
      paintLine(context, HAIR_HIGHLIGHT, 0.7, curvesPath(SIDE_BRAID_LINKS.map(([linkX, linkY, radius]) => [linkX - radius * 0.6, linkY - radius * 0.3, linkX - radius * 0.3, linkY - radius * 0.8, linkX + radius * 0.2, linkY - radius * 0.8] as const)))
    }
    paintShape(context, BLACK_FABRIC, (path) => path.ellipse(-11.9, -35.6, 2.3, 1.3, -0.5, 0, Math.PI * 2))
  }
}

const drawSideHairFront = (context: Context, hair: RadiHair, isPolished: boolean, bend: BendPoint) => {
  const isLoose = hair === "loose"
  const isBob = hair === "bob"
  paintShape(context, HAIR, isLoose ? sideLooseHairPath(bend) : isBob ? sideBobHairPath : sideHairCapPath, shadeIf(isPolished))
  if (isBob) {
    paintLine(context, HAIR_HIGHLIGHT, 1.4, curvesPath([[10, -86, 6, -92, -2, -94], [-8, -88, -14, -90, -19, -84], [-20, -74, -23, -64, -20, -56]]))
    if (isPolished) paintLine(context, HAIR_STRAND, 0.6, curvesPath([[4, -78, 10, -80, 18, -80], [-12, -80, -20, -84, -22, -72], [-10, -74, -14, -62, -12, -52]]))
    return
  }
  paintLine(context, HAIR_HIGHLIGHT, 1.4, curvesPath([[10, -86, 6, -92, -2, -94], [-8, -88, -14, -90, -19, -84]]))
  if (isLoose) paintLine(context, HAIR_HIGHLIGHT, 1.2, curvesPath(bendCurves([[-21, -74, -26, -60, -23, -46]], bend)))
  if (isPolished) paintLine(context, HAIR_STRAND, 0.6, curvesPath([[16, -80, 12, -90, 2, -95], [-12, -80, -20, -84, -22, -72]]))
  if (isPolished && isLoose) paintLine(context, HAIR_STRAND, 0.7, curvesPath(bendCurves([[-15, -62, -17, -52, -14, -43], [-24, -60, -26, -50, -24, -42]], bend)))
  if (hair === "sideTail") {
    paintShape(context, HAIR, (path) => {
      path.moveTo(-2, -90)
      path.bezierCurveTo(-14, -94, -26, -80, -24, -62)
      path.quadraticCurveTo(-23, -48, -28, -38)
      path.quadraticCurveTo(-16, -44, -16, -58)
      path.bezierCurveTo(-16, -72, -10, -84, -5, -86)
      path.closePath()
    }, shadeIf(isPolished))
    paintLine(context, HAIR_HIGHLIGHT, 1.2, curvesPath([[-9, -89, -20, -84, -20, -64]]))
  }
  const tieCenter = hair === "sideTail" ? [-3.5, -88.5] : hair === "ponytail" ? [-22, -83] : null
  if (tieCenter) {
    paintShape(context, "#ff5fa2", ellipsePath(tieCenter[0], tieCenter[1], 2.6, 3))
    if (isPolished) paintFill(context, "rgba(255, 255, 255, 0.6)", ellipsePath(tieCenter[0] - 0.8, tieCenter[1] - 1.2, 0.7, 0.9))
  }
}

const sideShoePainters: Record<RadiShoes, DrawSideShoe> = {
  sneakers: (context, legX, isPolished) => {
    const toeX = legX + 2.5
    paintShape(context, WHITE, ellipsePath(toeX, -3, 6, 3.3), {
      ...shadeIf(isPolished),
      decorateInside: isPolished ? (shoeContext) => paintFill(shoeContext, "#ddd6cf", (path) => path.rect(toeX - 7, -1.4, 14, 3)) : undefined,
    })
    paintLine(context, OUTLINE, 0.6, curvesPath([[toeX - 1.5, -5.4, toeX, -5.9, toeX + 1.5, -5.4], [toeX, -4.6, toeX + 1.5, -5.1, toeX + 3, -4.6]]))
  },
  highTops: (context, legX, isPolished) => {
    const toeX = legX + 2.5
    paintShape(context, HIGH_TOP_RED, (path) => path.roundRect(legX - 3.5, -10, 7, 8, 2), shadeIf(isPolished))
    paintShape(context, WHITE, ellipsePath(legX - 0.5, -7.5, 1.1, 1.1))
    paintShape(context, HIGH_TOP_RED, ellipsePath(toeX, -3, 6, 3.3), {
      ...shadeIf(isPolished),
      decorateInside: (shoeContext) => {
        paintFill(shoeContext, WHITE, (path) => path.rect(toeX - 7, -1.6, 14, 3))
        paintFill(shoeContext, WHITE, ellipsePath(toeX + 4, -2.4, 2.6, 1.8))
      },
    })
  },
  tsarvuli: (context, legX, isPolished) => {
    const toeX = legX + 2.5
    for (const crossY of [-15, -10]) {
      paintLine(context, OUTLINE, 0.9, linePath(legX - 3, crossY - 2.5, legX + 3, crossY + 2.5))
      paintLine(context, OUTLINE, 0.9, linePath(legX + 3, crossY - 2.5, legX - 3, crossY + 2.5))
    }
    paintShape(context, TSARVULI_LEATHER, ellipsePath(toeX, -3, 6.2, 3.3), shadeIf(isPolished))
    paintLine(context, OUTLINE, 0.6, curvesPath([[toeX + 3, -5.2, toeX + 3.8, -4, toeX + 4.4, -2.6]]))
    paintShape(context, "#e0453a", ellipsePath(toeX + 3.5, -5.6, 1.2, 1.2))
  },
  partyHeels: (context, legX, isPolished) => {
    const toeX = legX + 2.5
    paintShape(context, BLACK_FABRIC, (path) => path.rect(legX - 3, -1.8, 1.8, 1.8))
    paintTube(context, BLACK_FABRIC, 0.9, linePath(legX - 3, -7.5, legX + 3, -7.5), isPolished)
    paintShape(context, BLACK_FABRIC, ellipsePath(toeX, -3.4, 5.6, 3), shadeIf(isPolished))
    paintFill(context, "rgba(255, 255, 255, 0.45)", ellipsePath(toeX + 1, -4.6, 1.8, 0.7))
    for (const [sparkleX, sparkleY] of [[2.5, -3.6], [-1, -2.6], [4, -2.2]]) paintFill(context, SILVER, ellipsePath(toeX + sparkleX, sparkleY, 0.45, 0.45))
  },
  folkFlats: (context, legX, isPolished) => {
    const toeX = legX + 2.5
    paintShape(context, BLACK_FABRIC, ellipsePath(toeX, -3, 5.8, 3.1), shadeIf(isPolished))
    paintFill(context, "rgba(255, 255, 255, 0.35)", ellipsePath(toeX + 1, -4.2, 1.8, 0.7))
    paintTube(context, BLACK_FABRIC, 0.9, linePath(legX - 3, -6.5, legX + 3, -6.5), isPolished)
    paintFill(context, SILVER, ellipsePath(legX + 2.4, -6.5, 0.6, 0.6))
  },
  boots: (context, legX, isPolished) => {
    const toeX = legX + 2.5
    paintShape(context, BLACK_FABRIC, (path) => path.roundRect(legX - 3.6, -10, 7.2, 8, 2), shadeIf(isPolished))
    paintShape(context, BLACK_FABRIC, ellipsePath(toeX, -3, 6, 3.3), {
      ...shadeIf(isPolished),
      decorateInside: isPolished ? (shoeContext) => paintFill(shoeContext, "rgba(255, 255, 255, 0.16)", ellipsePath(toeX + 1.5, -4.4, 1.8, 0.7)) : undefined,
    })
  },
  hooves: (context, legX, isPolished) => {
    const toeX = legX + 1.5
    paintShape(context, UNICORN_GOLD, (path) => path.roundRect(toeX - 4.5, -6, 9, 6, 2.4), {
      ...shadeIf(isPolished),
      decorateInside: isPolished ? (hoofContext) => paintFill(hoofContext, "rgba(255, 255, 255, 0.5)", ellipsePath(toeX + 1.5, -4.4, 1.5, 0.7)) : undefined,
    })
    paintShape(context, UNICORN_LILAC, ellipsePath(legX, -6.4, 4.4, 2.4), shadeIf(isPolished))
  },
}

const drawSideLegs = (context: Context, shoes: RadiShoes, isPolished: boolean, stride = 0, legColor = LEG_COVERS[shoes] ?? SKIN, hipY = -19) => {
  ;([-2.5, 2.5] as const).forEach((legX, index) => {
    const swing = stride * (index === 0 ? 1 : -1)
    context.save()
    context.translate(0, -Math.max(0, swing) * 5)
    context.translate(legX, -19)
    context.rotate(swing * 0.42)
    context.translate(-legX, 19)
    paintTube(context, legColor, 6, linePath(legX, hipY, legX, -6), isPolished)
    sideShoePainters[shoes](context, legX, isPolished)
    context.restore()
  })
}

const drawSideBottom = (context: Context, bottom: RadiBottom, isPolished: boolean) => {
  paintShape(context, bottom.color, (path) => {
    path.moveTo(-7, -32)
    path.lineTo(7, -32)
    if (bottom.kind === "skirt") {
      path.lineTo(12, -18)
      path.quadraticCurveTo(0, -16, -11, -18)
    } else {
      path.lineTo(8, -19)
      path.lineTo(-8, -19)
    }
    path.closePath()
  }, { ...shadeIf(isPolished), decorateInside: decorationFor(bottom.pattern) })
}

const drawSideEye = (context: Context, isOpen: boolean, isPolished: boolean) => {
  if (!isOpen) {
    paintLine(context, OUTLINE, 1.6, (path) => {
      path.moveTo(11, -63)
      path.quadraticCurveTo(13.5, -68, 16, -63)
    })
    return
  }
  paintShape(context, isPolished ? createIrisGradient(context) : EYE, ellipsePath(13.5, -64, 2.8, 5.2), {
    decorateInside: isPolished ? (irisContext) => paintFill(irisContext, "rgba(0, 0, 0, 0.25)", ellipsePath(13.5, -69, 3.5, 2.6)) : undefined,
  })
  paintFill(context, PUPIL, ellipsePath(14, -63.2, 1.5, 3))
  paintFill(context, WHITE, ellipsePath(12.9, -66.2, 1.1, 1.4))
  paintFill(context, WHITE, ellipsePath(14.6, -61.6, 0.5, 0.6))
  if (isPolished) {
    paintLine(context, OUTLINE, 1.2, (path) => {
      path.moveTo(11, -67)
      path.quadraticCurveTo(13.5, -71, 16, -67.5)
    })
  }
  paintLine(context, OUTLINE, 1.2, linePath(15.6, -67.5, 18, -69.5))
}

const toPath2D = (buildPath: BuildPath) => {
  const path = new Path2D()
  buildPath(path)
  return path
}

const puffedCheekPath = ellipsePath(18, -54, 6, 5)

const drawPuffedCheek = (context: Context) => {
  const outsideHead = new Path2D()
  outsideHead.rect(-60, -130, 120, 140)
  outsideHead.addPath(toPath2D(sideHeadPath))
  context.save()
  context.clip(outsideHead, "evenodd")
  paintLine(context, OUTLINE, OUTLINE_WIDTH * 2, puffedCheekPath)
  context.restore()
  paintFill(context, SKIN, puffedCheekPath)
}

const drawSideMouth = (context: Context, expression: RadiExpression, isPolished: boolean) => {
  if (expression === "puff") {
    paintShape(context, MOUTH, ellipsePath(23.6, -53.5, 1.2, 1.6))
    return
  }
  context.save()
  context.clip(toPath2D(sideHeadPath))
  paintShape(context, MOUTH, (path) => {
    path.moveTo(15.8, -55.2)
    path.quadraticCurveTo(19, -56.2, 25, -56.4)
    path.lineTo(25, -49)
    path.quadraticCurveTo(19, -50.5, 15.8, -55.2)
    path.closePath()
  }, {
    decorateInside: (mouthContext) => {
      paintFill(mouthContext, WHITE, (path) => path.rect(15, -57, 11, 2.3))
      if (isPolished) paintFill(mouthContext, "rgba(0, 0, 0, 0.2)", (path) => path.rect(15, -54.7, 11, 0.7))
      paintFill(mouthContext, TONGUE, ellipsePath(20.5, -50.6, 3, 1.4))
    },
  })
  context.restore()
  context.stroke(toPath2D(sideHeadPath))
  paintLine(context, OUTLINE, 0.8, curvesPath([[15.4, -54.4, 14.6, -55.4, 15.2, -56.4]]))
}

const drawSideHead = (context: Context, expression: RadiExpression, isPolished: boolean) => {
  paintShape(context, SKIN, sideHeadPath, shadeIf(isPolished))
  if (expression === "puff") drawPuffedCheek(context)
  paintShape(context, SKIN, ellipsePath(-3, -64, 3.5, 4.5), shadeIf(isPolished))
  paintLine(context, OUTLINE, 0.7, curvesPath([[-4.5, -66, -2, -65, -3, -62]]))
  drawSideEye(context, expression !== "tongue", isPolished)
  paintLine(context, HAIR, 1.2, curvesPath([[10.5, -72.5, 13.5, -74.5, 16.5, -72.8]]))
  paintFill(context, BLUSH, ellipsePath(13, -56.5, 3.4, 2.4))
  if (isPolished) paintFill(context, "rgba(255, 255, 255, 0.7)", ellipsePath(11.6, -57.5, 0.8, 0.6))
  drawSideMouth(context, expression, isPolished)
}

const drawSideGaida = (context: Context, isPolished: boolean) => {
  paintShape(context, "#efe3c4", ellipsePath(11, -38, 6.5, 6), shadeIf(isPolished))
  paintShape(context, WOOD, (path) => path.roundRect(11.5, -34, 3, 23, 1.5), shadeIf(isPolished))
  if (isPolished) for (const holeY of [-29, -24, -19, -14]) paintFill(context, "#2a1608", ellipsePath(13, holeY, 0.6, 0.6))
  paintShape(context, WOOD, ellipsePath(13, -10.5, 3, 1.6), shadeIf(isPolished))
}

const drawSideExtrasOnBody = (context: Context, look: RadiLook, isPolished: boolean) => {
  const hasExtra = (extra: RadiLook["extras"][number]) => look.extras.includes(extra)
  if (hasExtra("apron")) {
    paintShape(context, FOLK_YELLOW, (path) => {
      path.moveTo(4.5, -31)
      path.lineTo(7, -31)
      path.lineTo(12.3, -17.8)
      path.lineTo(8.5, -17)
      path.closePath()
    }, {
      ...shadeIf(isPolished),
      decorateInside: (apronContext) => {
        for (const stripeY of [-27, -21.5]) paintFill(apronContext, "#8f9a8c", (path) => path.rect(0, stripeY, 15, 1.5))
      },
    })
  }
  if (hasExtra("pafti")) {
    paintShape(context, BLACK_FABRIC, (path) => path.roundRect(-7.5, -33.5, 15, 3, 1), shadeIf(isPolished))
    paintShape(context, SILVER, ellipsePath(6, -32, 2.2, 2.3), shadeIf(isPolished))
  }
  if (hasExtra("denimJacket")) {
    paintShape(context, DENIM, (path) => path.roundRect(-7.5, -49.5, 11.5, 19.5, 5), shadeIf(isPolished))
    paintShape(context, DENIM, (path) => {
      path.moveTo(-2, -49.5)
      path.lineTo(4, -49.5)
      path.lineTo(1, -45)
      path.closePath()
    }, shadeIf(isPolished))
  }
  if (hasExtra("pendant")) {
    paintLine(context, OUTLINE, 0.6, linePath(1, -47.5, 5.5, -41.5))
    paintShape(context, "#2ec4b6", ellipsePath(6, -40.5, 1.5, 2))
  }
  if (hasExtra("heartNecklace")) {
    paintLine(context, SILVER, 0.5, linePath(1, -47.5, 5.8, -42.5))
    paintShape(context, SILVER, (path) => {
      path.moveTo(6.2, -39.4)
      path.bezierCurveTo(4.4, -40.6, 4.8, -42.5, 6.2, -41.6)
      path.bezierCurveTo(7.6, -42.5, 8, -40.6, 6.2, -39.4)
      path.closePath()
    }, shadeIf(isPolished))
  }
  if (hasExtra("gaida")) drawSideGaida(context, isPolished)
}

const drawSideHeadwear = (context: Context, look: RadiLook, isPolished: boolean) => {
  if (look.extras.includes("bandana")) {
    paintTube(context, BLACK_FABRIC, 1.8, curvesPath([[-25, -81, -30, -77, -29, -71], [-24.5, -80.5, -27, -75, -25, -70]]), isPolished)
    paintShape(context, BLACK_FABRIC, (path) => {
      path.moveTo(20.6, -83.2)
      path.quadraticCurveTo(0, -86, -23, -84.5)
      path.lineTo(-25.2, -79.5)
      path.quadraticCurveTo(0, -80.5, 21.8, -78)
      path.closePath()
    }, shadeIf(isPolished))
    paintShape(context, BLACK_FABRIC, ellipsePath(-25, -82, 2.5, 2.2), shadeIf(isPolished))
  }
  if (look.extras.includes("kalpak")) drawKalpak(context, isPolished)
  if (look.extras.includes("hairFlower")) {
    context.save()
    context.translate(-15.5, 0)
    drawHairFlower(context, isPolished)
    context.restore()
  }
}

const drawSideReadingGlasses = (context: Context) => {
  paintLine(context, OUTLINE, 1.35, (path) => path.roundRect(10, -70.2, 8.8, 12.2, 3.6))
  paintLine(context, "rgba(255, 255, 255, 0.9)", 0.8, linePath(11.2, -68.4, 14.4, -67.5))
  paintLine(context, OUTLINE, 1.15, linePath(10, -66.6, -1.5, -65.2))
}

const drawSideSunglasses = (context: Context) => {
  paintLine(context, OUTLINE, 1.2, linePath(9, -67.5, -2, -66))
  paintShape(context, "#2b8cff", (path) => {
    path.moveTo(9, -69)
    path.lineTo(19, -69)
    path.quadraticCurveTo(19.5, -59, 14, -59.5)
    path.quadraticCurveTo(9, -60, 9, -69)
    path.closePath()
  }, { decorateInside: (lensContext) => paintLine(lensContext, "#bfe4ff", 1.5, linePath(11, -61, 17, -68)) })
}

const drawSideBatmanJumpsuit = (context: Context, color: string, isPolished: boolean) => {
  paintShape(context, color, (path) => {
    path.moveTo(-4, -49)
    path.quadraticCurveTo(-9, -49, -7, -42)
    path.lineTo(-6.3, -26)
    path.lineTo(7.4, -26)
    path.lineTo(7.6, -40)
    path.quadraticCurveTo(9, -49, 3, -49)
    path.closePath()
  }, {
    ...shadeIf(isPolished),
    decorateInside: isPolished ? (suitContext) => paintFill(suitContext, SHADE, ellipsePath(1, -47.2, 5, 2.4)) : undefined,
  })
  paintShape(context, BLACK_FABRIC, (path) => {
    path.moveTo(-6.4, -29.5)
    path.lineTo(7.5, -29.5)
    path.lineTo(7.4, -23.6)
    path.quadraticCurveTo(0.6, -21, -6.2, -23.6)
    path.closePath()
  }, shadeIf(isPolished))
}

const drawSideBatmanCape = (context: Context, isPolished: boolean) => {
  paintShape(context, BLACK_FABRIC, (path) => {
    path.moveTo(-2, -46)
    path.quadraticCurveTo(-16, -44, -24, -28)
    path.quadraticCurveTo(-30, -10, -22, 0)
    path.lineTo(-16, -7)
    path.lineTo(-18, 2)
    path.lineTo(-10, -4)
    path.quadraticCurveTo(-4, -18, -2, -32)
    path.quadraticCurveTo(0, -42, -2, -46)
    path.closePath()
  }, shadeIf(isPolished))
}

const drawSideBatmanChest = (context: Context, isPolished: boolean) => {
  paintShape(context, FOLK_YELLOW, ellipsePath(5.4, -40.4, 2.5, 4.2), shadeIf(isPolished))
  drawBatMark(context, 5.6, -40.4, 0.42)
  paintShape(context, FOLK_YELLOW, (path) => path.roundRect(-7.2, -33.6, 14.4, 3.6, 1.2), shadeIf(isPolished))
  paintShape(context, BLACK_FABRIC, ellipsePath(4.6, -31.8, 1.3, 1.3))
}

const drawSideBatmanCowl = (context: Context, isPolished: boolean) => {
  paintShape(context, BLACK_FABRIC, (path) => {
    path.moveTo(17, -59)
    path.quadraticCurveTo(26, -63, 27, -75)
    path.quadraticCurveTo(24, -90, 12, -96)
    path.lineTo(9, -96)
    path.lineTo(5, -114)
    path.lineTo(1, -96)
    path.quadraticCurveTo(-10, -101, -20, -90)
    path.quadraticCurveTo(-27, -78, -26, -66)
    path.quadraticCurveTo(-24, -56, -12, -54)
    path.quadraticCurveTo(2, -59, 17, -59)
    path.closePath()
  }, shadeIf(isPolished))
  paintShape(context, WHITE, (path) => path.ellipse(14.8, -67.2, 5.1, 1.5, -0.85, 0, Math.PI * 2))
}

const drawSideUnicornHeadpiece = (context: Context, isPolished: boolean) => {
  paintRainbowStreaks(context, [
    [10, -92, 2, -98, -8, -95],
    [-12, -92, -22, -86, -25, -66],
    [-16, -78, -22, -62, -20, -44],
    [-10, -70, -13, -56, -12, -44],
  ], 2)
  drawUnicornEar(context, -8, -95, -0.5, isPolished)
  drawUnicornHorn(context, 6, -96, 14, -124, isPolished)
  context.save()
  context.translate(-18.5, -5.5)
  drawHairFlower(context, isPolished)
  context.restore()
  drawStarSparkle(context, -16, -112, 4, WHITE)
  drawStarSparkle(context, 22, -114, 3, UNICORN_GOLD)
  drawStarSparkle(context, 28, -96, 2.4, WHITE)
}

const drawSideArm = (context: Context, look: RadiLook, isPolished: boolean, hand?: Point) => {
  const isHolding = look.pose === "hold"
  const isBatman = look.extras.includes("batman")
  const [handX, handY] = hand ?? (isHolding ? [10, -35] : [3, -31])
  const armColor = look.extras.includes("denimJacket") ? DENIM : isBatman ? look.top.color : SKIN
  paintTube(context, armColor, 4.5, linePath(0, -41.5, handX, handY), isPolished)
  if (isBatman) paintTube(context, BLACK_FABRIC, 4.7, linePath(handX * 0.58, -41.5 + (handY + 41.5) * 0.58, handX, handY), isPolished)
  paintShape(context, isBatman ? BLACK_FABRIC : SKIN, ellipsePath(handX, handY, 2.8, 2.8), shadeIf(isPolished))
  if (look.extras.includes("puffSleeves")) {
    paintShape(context, WHITE, ellipsePath(0, -39.9, 3.8, 3.4), shadeIf(isPolished))
    paintShape(context, FOLK_YELLOW, ellipsePath(0, -41.3, 4, 3.5), shadeIf(isPolished))
  }
  if (look.extras.includes("gaida")) paintTube(context, WOOD, 1.6, linePath(23, -52.5, 13, -43), isPolished)
}

export const drawRadiSide = (context: Context, look: RadiLook, feetX: number, feetY: number, scale: number, hand?: Point, hairWind?: HairWind, stride = 0) => {
  const isPolished = look.polished === true
  const isBatman = look.extras.includes("batman")
  const isUnicorn = look.extras.includes("unicorn")
  context.save()
  context.translate(feetX, feetY)
  context.scale(scale, scale)
  context.lineJoin = "round"
  context.lineCap = "round"
  context.lineWidth = OUTLINE_WIDTH
  context.strokeStyle = OUTLINE

  if (isUnicorn) paintRainbowTail(context, [-5, -28, -30, -40, -30, -14], [1.8, 2.9])
  if (isBatman) drawSideBatmanCape(context, isPolished)
  else drawSideHairBack(context, look.hair, isPolished)
  if (isBatman) {
    drawSideLegs(context, look.shoes ?? "sneakers", isPolished, stride, look.top.color, -24)
    drawSideBatmanJumpsuit(context, look.top.color, isPolished)
  } else {
    drawSideLegs(context, look.shoes ?? "sneakers", isPolished, stride)
    drawSideBottom(context, look.bottom, isPolished)
    drawTorso(context, look.top.pattern === "sun" ? { ...look.top, pattern: undefined } : look.top, isPolished, 7)
  }
  drawSideExtrasOnBody(context, look, isPolished)
  if (isBatman) drawSideBatmanChest(context, isPolished)
  drawSideHead(context, look.expression, isPolished)
  if (isBatman) drawSideBatmanCowl(context, isPolished)
  else drawSideHairFront(context, look.hair, isPolished, hairWind && hairWind.strength > 0 ? windBentHair(hairWind) : straightHair)
  drawSideHeadwear(context, look, isPolished)
  if (isUnicorn) drawSideUnicornHeadpiece(context, isPolished)
  if (look.extras.includes("sunglasses")) drawSideSunglasses(context)
  if (look.extras.includes("readingGlasses")) drawSideReadingGlasses(context)
  drawSideArm(context, look, isPolished, hand)

  context.restore()
}
