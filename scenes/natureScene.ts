import { ellipsePath, paintFill, paintLine, paintShape, type BuildPath, type Context } from "@/characters/paint"
import { drawPartyPerson, type PartyPerson } from "@/characters/partyPerson"
import { drawRadi, drawStarSparkle, type Point } from "@/characters/radi"
import { drawKiraSide } from "@/characters/kira"
import { folkDanceRadiLook, gaidaRadiLook } from "@/characters/radiConcepts"
import { paintSprite, prepareSceneSprites, releaseSceneSprites, type SpriteBounds } from "@/characters/sprites"
import { onLayersReleased } from "@/scenes/layerCache"
import { easeInOut, mixHands, seededRandom } from "@/scenes/libraryScene"
import { bounce, clampToUnit, drawCloud, drawSun, easeOut, easeOutBack, mix, paintComicBubble, paintIris, radiScale, stageProgress } from "@/scenes/openingScene"

type Circle = readonly [number, number, number]
type Cover = "roundTree" | "pine" | "bush"
type Animal = "owl" | "fox" | "bunny" | "hedgehog"
type Hands = readonly [Point, Point]
type HoroPose = { hop: number; footLifts: readonly [number, number]; handBob: number }
type FolkDancer = { slot: number; phase: number; person: PartyPerson }

const OUTLINE = "#2b1d1a"
const WHITE = "#ffffff"
const WALK_UNITS_PER_SECOND = 55
const HOPS_PER_SECOND = 2
const IRIS_IN_END = 0.8
const NOTE_INTERVAL = 0.55
const NOTE_LIFE = 2.6
const NOTE_COLORS = ["#ff5d8f", "#ffd23f", "#4cc9f0", "#9b5de5", "#ff8c42", "#3ddc97"]
const TREE_GREENS = ["#4fb35a", "#62c264", "#3fa34d"]
const FLOWER_COLORS = ["#ff7aa8", WHITE, "#ffd23f", "#b388ff"]
const BUTTERFLY_COLORS = ["#ff9f1c", "#4cc9f0", "#ff5d8f"]
const ROUND_CANOPY: readonly Circle[] = [[0, -95, 32], [-26, -78, 24], [26, -78, 24], [-14, -114, 22], [16, -112, 22]]
const CANOPY_SHINE: readonly Circle[] = [[-12, -110, 9], [-30, -82, 7], [6, -98, 8]]
const BUSH_PUFFS: readonly Circle[] = [[-22, -14, 16], [0, -24, 20], [22, -14, 16]]
const PINE_TIERS = [[-18, 34, 42], [-48, 27, 38], [-74, 19, 34]] as const
const APPLES = [[-18, -80], [10, -88], [22, -72], [-4, -110]] as const
const BUSH_BLOSSOMS = [[-20, -16], [4, -32], [18, -10], [-6, -14]] as const
const COVER_BOUNDS: Record<Cover, SpriteBounds> = { roundTree: [-50, -136, 50, 0], pine: [-42, -97, 42, 0], bush: [-38, -44, 38, 2] }
const GAIDA_HANDS: Hands = [[5.5, -21], [5.5, -29]]
const REST_HANDS: Hands = [[-14, -32], [14, -32]]
const YAY_HANDS: Hands = [[-18, -66], [18, -66]]
const CHANTER_END: Point = [6, -9]
const WALK_END = 14
const STOP_SECONDS = 2
const STOP_END = WALK_END + STOP_SECONDS
const SPOT_HOP_END = STOP_END + 0.4
const WAVE_END = 17.6
const SWIRL_START = 17.7
const SWIRL_FULL = 18.3
const LOOK_SWAP = 18.45
const SWIRL_CLEAR = 18.6
const SWIRL_END = 19.3
const ARMS_DOWN_END = 19.5
const JOIN_HOP_START = 19.5
const JOIN_HOP_END = 20.2
const HANDS_JOIN_END = 20.8
export const HORO_START = HANDS_JOIN_END
export const HORO_DANCE_START = HORO_START - 2
const HORO_DANCE_SECONDS = 40
const HORO_IRIS_START = HORO_DANCE_START + HORO_DANCE_SECONDS - 1
const HORO_IRIS_END = HORO_IRIS_START + 1.3
export const NATURE_SCENE_END = HORO_IRIS_END + 0.3
const ROW_SCALE = 0.92
const DANCER_SPACING = 56
const HELD_HAND_Y = -28
const STEP_UNITS = 14
const FOLK_SLOTS = 3
const SWIRL_PETALS = 36
const ROSE_COLORS = ["#ff4d6d", "#ff8fab", "#c9184a", "#ffc2d1"]
const RIBBON_COLORS = [WHITE, "#2f9e44", "#e03131"]
const FOLK_DANCERS: readonly FolkDancer[] = [
  {
    slot: -3, phase: 0.4,
    person: { skin: "#e8b994", hair: "short", hairColor: "#3b2a20", eyes: "dot", eyeColor: "#3a2814", build: "broad", face: "smile", top: "folkShirt", topColor: WHITE, accentColor: "#d62828", bottom: "folkTrousers", bottomColor: "#2a2a2a", shoes: "tsarvuli", shoeColor: "#8a5a33", extras: ["kalpak", "sash", "mustache"] },
  },
  {
    slot: -2, phase: 1.6,
    person: { skin: "#f8dfcf", hair: "long", hairColor: "#3b2a20", eyes: "lashes", eyeColor: "#4a8fd8", build: "curvy", face: "laugh", top: "sukman", topColor: "#1f2a44", accentColor: "#d62828", bottom: "folkSkirt", bottomColor: "#1f2a44", shoes: "tsarvuli", shoeColor: "#8a5a33", extras: ["flowerCrown", "folkApron", "earrings"] },
  },
  {
    slot: -1, phase: 2.7,
    person: { skin: "#f2c9a8", hair: "curly", hairColor: "#5a3420", eyes: "round", eyeColor: "#4caf6a", build: "slim", face: "laugh", top: "folkShirt", topColor: WHITE, accentColor: "#d62828", bottom: "folkTrousers", bottomColor: "#3a2a20", shoes: "tsarvuli", shoeColor: "#6b4a2e", extras: ["sash"] },
  },
  {
    slot: 1, phase: 0.9,
    person: { skin: "#f3cfb3", hair: "bun", hairColor: "#2a1f1a", eyes: "round", eyeColor: "#8a6a3a", build: "slim", face: "smile", top: "sukman", topColor: "#7a1f2b", accentColor: "#f2c94c", bottom: "folkSkirt", bottomColor: "#7a1f2b", shoes: "tsarvuli", shoeColor: "#8a5a33", extras: ["flowerCrown", "folkApron"] },
  },
  {
    slot: 2, phase: 2.1,
    person: { skin: "#ead0b8", hair: "short", hairColor: "#6b4a2e", eyes: "sleepy", eyeColor: "#6b4a2e", build: "broad", face: "laugh", top: "folkShirt", topColor: WHITE, accentColor: "#1f7a45", bottom: "folkTrousers", bottomColor: "#2a2a2a", shoes: "tsarvuli", shoeColor: "#8a5a33", extras: ["kalpak", "sash", "beard"] },
  },
  {
    slot: 3, phase: 3.2,
    person: { skin: "#f6d7c3", hair: "ponytail", hairColor: "#8a3a1a", eyes: "lashes", eyeColor: "#4a8fd8", build: "curvy", face: "smile", top: "sukman", topColor: "#1f5a3a", accentColor: "#d62828", bottom: "folkSkirt", bottomColor: "#1f5a3a", shoes: "tsarvuli", shoeColor: "#6b4a2e", extras: ["flowerCrown", "folkApron", "handkerchief"] },
  },
]

onLayersReleased("nature", () => releaseSceneSprites("nature"))

const wrapAround = (amount: number, span: number) => ((amount % span) + span) % span

const grownBounds = ([left, top, right, bottom]: SpriteBounds, margin: number): SpriteBounds => [left - margin, top - margin, right + margin, bottom + margin]

const travelUnits = (sceneSeconds: number) => {
  const slowSeconds = clampToUnit((sceneSeconds - WALK_END) / STOP_SECONDS) * STOP_SECONDS
  return WALK_UNITS_PER_SECOND * (Math.min(sceneSeconds, WALK_END) + slowSeconds - slowSeconds ** 2 / (2 * STOP_SECONDS))
}

const GAP_X = travelUnits(STOP_END)
const FIELD_START = GAP_X - 300

const horoUnits = (horoSteps: number) => (Math.floor(horoSteps) + easeInOut(horoSteps - Math.floor(horoSteps))) * STEP_UNITS

const fieldEdge = (width: number, scale: number, parallax: number) => FIELD_START * scale * parallax + width / 2

const forEachTile = (offset: number, spacing: number, width: number, margin: number, drawTile: (index: number, tileX: number) => void) => {
  const firstIndex = Math.floor((offset - margin) / spacing)
  const lastIndex = Math.floor((offset + width + margin) / spacing)
  for (let index = firstIndex; index <= lastIndex; index += 1) drawTile(index, index * spacing - offset)
}

const circlesPath = (circles: readonly Circle[]): BuildPath => (path) => {
  for (const [centerX, centerY, radius] of circles) {
    path.moveTo(centerX + radius, centerY)
    path.arc(centerX, centerY, radius, 0, Math.PI * 2)
  }
}

const paintBlob = (context: Context, fill: string, circles: readonly Circle[], outlineWidth: number) => {
  paintLine(context, OUTLINE, outlineWidth * 2, circlesPath(circles))
  paintFill(context, fill, circlesPath(circles))
}

const wavyBandPath = (width: number, offset: number, topY: number, bottomY: number, amplitude: number, wavelength: number): BuildPath => (path) => {
  path.moveTo(-10, bottomY)
  for (let x = -10; x <= width + 10; x += 10) {
    const wave = ((x + offset) / wavelength) * Math.PI * 2
    path.lineTo(x, topY + (Math.sin(wave) + Math.sin(wave * 2.3 + 1.3) * 0.45) * amplitude)
  }
  path.lineTo(width + 10, bottomY)
  path.closePath()
}

const drawGoldenSky = (context: Context, width: number, height: number, horizonY: number) => {
  const gradient = context.createLinearGradient(0, 0, 0, horizonY)
  gradient.addColorStop(0, "#4fb3f0")
  gradient.addColorStop(0.6, "#a8dcf5")
  gradient.addColorStop(1, "#ffe1a8")
  context.fillStyle = gradient
  context.fillRect(0, 0, width, height)
}

const drawDriftingClouds = (context: Context, width: number, height: number, time: number, camera: number) => {
  const unit = Math.min(width, height) * 0.07
  const spacing = width * 0.42
  forEachTile(camera * 0.04 + time * 10, spacing, width, unit * 3, (index, tileX) => {
    const cloudUnit = unit * (0.55 + seededRandom(index, 3) * 0.45)
    paintSprite(context, `nature:cloud:${index}`, tileX + seededRandom(index, 1) * spacing * 0.5, height * (0.07 + seededRandom(index, 2) * 0.2), grownBounds([-1.9 * cloudUnit, -1.2 * cloudUnit, 1.8 * cloudUnit, 0.9 * cloudUnit], 4), (layer) => drawCloud(layer, 0, 0, cloudUnit))
  })
}

const drawMountain = (context: Context, peakX: number, peakY: number, half: number, baseY: number, color: string, snowTooth: number) => {
  const slope = (baseY - peakY) / half
  const tip = half * 0.1
  const capY = peakY + (baseY - peakY) * 0.26
  const capHalf = ((capY - peakY) / slope) * 1.5
  paintShape(context, color, (path) => {
    path.moveTo(peakX - half, baseY)
    path.lineTo(peakX - tip, peakY + tip * slope)
    path.quadraticCurveTo(peakX, peakY, peakX + tip, peakY + tip * slope)
    path.lineTo(peakX + half, baseY)
    path.closePath()
  }, {
    decorateInside: (mountainContext) => {
      paintFill(mountainContext, "rgba(40, 30, 80, 0.12)", (path) => {
        path.moveTo(peakX, peakY)
        path.lineTo(peakX + half, baseY)
        path.lineTo(peakX + half * 0.15, baseY)
        path.closePath()
      })
      if (snowTooth <= 0) return
      paintFill(mountainContext, WHITE, (path) => {
        path.moveTo(peakX - capHalf, peakY - 10)
        path.lineTo(peakX + capHalf, peakY - 10)
        path.lineTo(peakX + capHalf, capY)
        for (let tooth = 1; tooth <= 6; tooth += 1) path.lineTo(peakX + capHalf - (tooth * capHalf) / 3, capY + (tooth % 2 === 1 ? snowTooth : 0))
        path.closePath()
      })
    },
  })
}

const drawMountainRange = (context: Context, width: number, height: number, offset: number, spacing: number, baseY: number, lowestPeak: number, highestPeak: number, color: string, salt: number, hasSnow: boolean) => {
  context.lineWidth = 3
  forEachTile(offset, spacing, width, spacing * 1.5, (index, tileX) => {
    const peakX = tileX + seededRandom(index, salt) * spacing * 0.4
    const peakY = baseY - height * mix(lowestPeak, highestPeak, seededRandom(index, salt + 1))
    const half = spacing * (0.8 + seededRandom(index, salt + 2) * 0.35)
    paintSprite(context, `nature:mountain${salt}:${index}`, peakX, peakY, grownBounds([-half, 0, half, baseY - peakY], 4), (layer) => drawMountain(layer, 0, 0, half, baseY - peakY, color, hasSnow ? height * 0.012 : 0))
  })
}

const coverFor = (index: number): Cover => {
  const pick = seededRandom(index, 11)
  return pick < 0.35 ? "roundTree" : pick < 0.6 ? "pine" : "bush"
}

const animalFor = (index: number, cover: Cover): Animal | null => {
  if (seededRandom(index, 12) > 0.65) return null
  const isFirstPick = seededRandom(index, 13) < 0.5
  if (cover === "roundTree") return isFirstPick ? "owl" : "fox"
  if (cover === "pine") return "fox"
  return isFirstPick ? "bunny" : "hedgehog"
}

const peekAmount = (screenX: number, width: number) => {
  const fromCenter = screenX - width / 2
  return easeInOut(clampToUnit((width * 0.38 - fromCenter) / (width * 0.12))) * easeInOut(clampToUnit((fromCenter + width * 0.3) / (width * 0.1)))
}

const drawCritterEyes = (context: Context, spacing: number, eyeY: number, size: number, lookSide: number, isBlinking: boolean) => {
  for (const side of [-1, 1]) {
    const eyeX = side * spacing
    if (isBlinking) {
      paintLine(context, OUTLINE, size * 0.5, (path) => path.arc(eyeX, eyeY - size * 0.3, size * 0.8, Math.PI * 0.2, Math.PI * 0.8))
      continue
    }
    paintFill(context, OUTLINE, ellipsePath(eyeX + lookSide * size * 0.3, eyeY, size * 0.8, size))
    paintFill(context, WHITE, ellipsePath(eyeX + lookSide * size * 0.3 - size * 0.25, eyeY - size * 0.4, size * 0.28, size * 0.28))
  }
}

const drawOwl = (context: Context, lookSide: number, isBlinking: boolean) => {
  paintShape(context, "#9c6b4a", (path) => {
    path.moveTo(-11, -6)
    path.lineTo(-10, -17)
    path.lineTo(-5, -11)
    path.quadraticCurveTo(0, -13, 5, -11)
    path.lineTo(10, -17)
    path.lineTo(11, -6)
    path.quadraticCurveTo(14, 8, 0, 14)
    path.quadraticCurveTo(-14, 8, -11, -6)
    path.closePath()
  })
  paintFill(context, "#e8cfa8", ellipsePath(0, 6, 7, 6))
  for (const side of [-1, 1]) paintShape(context, WHITE, ellipsePath(side * 5, -4, 4.6, 4.6))
  drawCritterEyes(context, 5, -4, 2.2, lookSide, isBlinking)
  paintShape(context, "#ffb703", (path) => {
    path.moveTo(-1.8, 0)
    path.lineTo(1.8, 0)
    path.lineTo(0, 3)
    path.closePath()
  })
}

const drawFox = (context: Context, lookSide: number, isBlinking: boolean) => {
  for (const side of [-1, 1]) {
    paintShape(context, "#f08a3c", (path) => {
      path.moveTo(side * 3, -6)
      path.lineTo(side * 9, -18)
      path.lineTo(side * 10, -4)
      path.closePath()
    })
    paintFill(context, "#5a2d16", (path) => {
      path.moveTo(side * 5, -7)
      path.lineTo(side * 8.6, -14.5)
      path.lineTo(side * 8.8, -6)
      path.closePath()
    })
  }
  paintShape(context, "#f08a3c", ellipsePath(0, 0, 10.5, 8.5))
  paintShape(context, WHITE, (path) => {
    path.moveTo(-8, 2)
    path.quadraticCurveTo(0, -2, 8, 2)
    path.quadraticCurveTo(4, 8.5, 0, 8.5)
    path.quadraticCurveTo(-4, 8.5, -8, 2)
    path.closePath()
  })
  drawCritterEyes(context, 4.2, -2, 1.6, lookSide, isBlinking)
  paintFill(context, OUTLINE, ellipsePath(0, 3, 1.8, 1.3))
}

const drawBunny = (context: Context, lookSide: number, isBlinking: boolean, time: number) => {
  for (const side of [-1, 1]) {
    context.save()
    context.translate(side * 4, -6)
    context.rotate(side * 0.12 + (side === 1 ? Math.sin(time * 5) * 0.12 : 0))
    paintShape(context, "#f4efe9", ellipsePath(0, -9, 3, 9.5))
    paintFill(context, "#ffb3c7", ellipsePath(0, -9, 1.4, 6.5))
    context.restore()
  }
  paintShape(context, "#f4efe9", ellipsePath(0, 0, 9.5, 8))
  drawCritterEyes(context, 3.8, -1.5, 1.5, lookSide, isBlinking)
  paintFill(context, "#ff7aa8", ellipsePath(0, 2.5, 1.5, 1.1))
  for (const side of [-1, 1]) {
    paintFill(context, "rgba(255, 120, 160, 0.35)", ellipsePath(side * 6, 3, 2, 1.3))
    paintLine(context, OUTLINE, 0.5, (path) => {
      path.moveTo(side * 3, 3.2)
      path.lineTo(side * 9, 2.4)
      path.moveTo(side * 3, 4)
      path.lineTo(side * 8.6, 4.6)
    })
  }
}

const drawHedgehog = (context: Context, isBlinking: boolean) => {
  paintShape(context, "#7a5236", (path) => {
    path.moveTo(-13, 6)
    for (let spike = 0; spike <= 12; spike += 1) {
      const angle = Math.PI + (spike / 12) * Math.PI
      const reach = spike % 2 === 0 ? 12 : 16
      path.lineTo(Math.cos(angle) * reach, 6 + Math.sin(angle) * reach)
    }
    path.closePath()
  })
  paintShape(context, "#e7c9a0", (path) => {
    path.moveTo(4, 6)
    path.quadraticCurveTo(4, -4, 10, -3)
    path.quadraticCurveTo(15, -1, 17, 3)
    path.quadraticCurveTo(12, 7, 4, 6)
    path.closePath()
  })
  paintFill(context, OUTLINE, ellipsePath(17, 2.6, 1.6, 1.4))
  if (isBlinking) paintLine(context, OUTLINE, 0.8, (path) => path.arc(10.5, 0, 1.4, Math.PI * 0.1, Math.PI * 0.9))
  else paintFill(context, OUTLINE, ellipsePath(10.5, 0, 1.3, 1.6))
}

const drawPeekingAnimal = (context: Context, animal: Animal, cover: Cover, peek: number, lookSide: number, time: number) => {
  const isBlinking = Math.sin(time * 1.7) > 0.95
  context.save()
  if (animal === "owl") {
    context.translate(0, mix(-100, -138, peek))
    drawOwl(context, lookSide, isBlinking)
  } else if (animal === "fox") {
    context.translate(lookSide * mix(0, cover === "pine" ? 36 : 14, peek), -14)
    drawFox(context, lookSide, isBlinking)
  } else if (animal === "bunny") {
    context.translate(-4, mix(-6, -50, peek))
    drawBunny(context, lookSide, isBlinking, time)
  } else {
    context.translate(lookSide * mix(14, 42, peek), -8)
    context.scale(lookSide, 1)
    drawHedgehog(context, isBlinking)
  }
  context.restore()
}

const drawRoundTree = (context: Context, green: string, outlineWidth: number, hasFruit: boolean) => {
  paintShape(context, "#9a6a3f", (path) => {
    path.moveTo(-7, 0)
    path.quadraticCurveTo(-4, -35, -6, -72)
    path.lineTo(6, -72)
    path.quadraticCurveTo(4, -35, 7, 0)
    path.closePath()
  })
  paintBlob(context, green, ROUND_CANOPY, outlineWidth)
  paintFill(context, "rgba(255, 255, 255, 0.18)", circlesPath(CANOPY_SHINE))
  if (hasFruit) for (const [appleX, appleY] of APPLES) paintShape(context, "#ff4d4d", ellipsePath(appleX, appleY, 3.2, 3.2))
}

const drawPine = (context: Context) => {
  paintShape(context, "#8a5a33", (path) => path.rect(-5, -22, 10, 22))
  for (const [tierY, half, tierHeight] of PINE_TIERS) {
    paintShape(context, "#2f8f5b", (path) => {
      path.moveTo(-half, tierY)
      path.quadraticCurveTo(0, tierY + 6, half, tierY)
      path.lineTo(2, tierY - tierHeight)
      path.quadraticCurveTo(0, tierY - tierHeight - 3, -2, tierY - tierHeight)
      path.closePath()
    })
  }
}

const drawBush = (context: Context, outlineWidth: number, hasBlossoms: boolean) => {
  paintBlob(context, "#56b84f", BUSH_PUFFS, outlineWidth)
  paintFill(context, "rgba(255, 255, 255, 0.16)", ellipsePath(-6, -32, 9, 5))
  if (hasBlossoms) for (const [blossomX, blossomY] of BUSH_BLOSSOMS) paintShape(context, "#ff9ec4", ellipsePath(blossomX, blossomY, 2.6, 2.6))
}

const drawWoodland = (context: Context, width: number, height: number, time: number, camera: number, scale: number) => {
  const baseY = height * 0.755
  const spacing = 150 * scale
  const treesEnd = fieldEdge(width, scale, 0.55)
  forEachTile(camera * 0.55, spacing, width, 80 * scale, (index, tileX) => {
    if (index * spacing > treesEnd) return
    const coverX = tileX + seededRandom(index, 10) * spacing * 0.45
    const size = scale * (0.7 + seededRandom(index, 14) * 0.3)
    const cover = coverFor(index)
    const animal = animalFor(index, cover)
    const peek = animal ? peekAmount(coverX, width) : 0
    const outlineWidth = 3 / size
    const hasExtras = seededRandom(index, 15) < 0.45
    context.save()
    context.translate(coverX, baseY)
    context.scale(size, size)
    context.lineWidth = outlineWidth
    if (animal && peek > 0.02) drawPeekingAnimal(context, animal, cover, peek, coverX > width / 2 ? -1 : 1, time + index * 1.3)
    paintSprite(context, `nature:tree:${index}`, 0, 0, grownBounds(COVER_BOUNDS[cover], outlineWidth * 2), (layer) => {
      if (cover === "roundTree") drawRoundTree(layer, TREE_GREENS[index % TREE_GREENS.length], outlineWidth, hasExtras)
      else if (cover === "pine") drawPine(layer)
      else drawBush(layer, outlineWidth, hasExtras)
    })
    context.restore()
  })
}

const drawTrail = (context: Context, width: number, camera: number, topY: number, bottomY: number, wobble: number) => {
  const wave = (x: number, phase: number) => Math.sin((x + camera) / 260 + phase) * wobble
  context.lineWidth = 3
  paintShape(context, "#ecd59a", (path) => {
    path.moveTo(-10, topY + wave(-10, 0))
    for (let x = 0; x <= width + 10; x += 10) path.lineTo(x, topY + wave(x, 0))
    for (let x = width + 10; x >= -10; x -= 10) path.lineTo(x, bottomY + wave(x, 2))
    path.closePath()
  })
}

const drawPebbles = (context: Context, width: number, camera: number, topY: number, bottomY: number, scale: number) => {
  const spacing = 70 * scale
  context.lineWidth = 1.5
  forEachTile(camera, spacing, width, 20, (index, tileX) => {
    const pebbleX = tileX + seededRandom(index, 40) * spacing
    const pebbleY = mix(topY + 8, bottomY - 8, seededRandom(index, 41))
    const size = (1.6 + seededRandom(index, 42) * 1.6) * scale
    paintSprite(context, `nature:pebble:${index}`, pebbleX, pebbleY, grownBounds([-size * 1.4, -size, size * 1.4, size], 2), (layer) => paintShape(layer, "#c9ae73", ellipsePath(0, 0, size * 1.4, size)))
  })
}

const drawTuft = (context: Context, baseX: number, baseY: number, unit: number, color: string) => {
  paintLine(context, color, unit * 1.1, (path) => {
    path.moveTo(baseX - unit * 2, baseY)
    path.quadraticCurveTo(baseX - unit * 2.5, baseY - unit * 3, baseX - unit * 4, baseY - unit * 5.5)
    path.moveTo(baseX, baseY)
    path.quadraticCurveTo(baseX + unit * 0.5, baseY - unit * 4.5, baseX - unit * 0.5, baseY - unit * 7.5)
    path.moveTo(baseX + unit * 2, baseY)
    path.quadraticCurveTo(baseX + unit * 3, baseY - unit * 3, baseX + unit * 4.5, baseY - unit * 5)
  })
}

const tuftBounds = (unit: number) => grownBounds([-4 * unit, -7.5 * unit, 4.5 * unit, 0], unit * 0.6 + 1)

const drawMeadowFlower = (context: Context, baseX: number, baseY: number, unit: number, color: string) => {
  const headY = baseY - unit * 5
  paintLine(context, "#3d9a3a", unit * 0.8, (path) => {
    path.moveTo(baseX, baseY)
    path.quadraticCurveTo(baseX + unit, baseY - unit * 2.5, baseX, headY)
  })
  context.lineWidth = Math.max(1, unit * 0.45)
  for (let petal = 0; petal < 5; petal += 1) {
    const angle = (petal / 5) * Math.PI * 2
    paintShape(context, color, ellipsePath(baseX + Math.cos(angle) * unit * 1.3, headY + Math.sin(angle) * unit * 1.3, unit * 1.1, unit * 1.1))
  }
  paintFill(context, "#ffb703", ellipsePath(baseX, headY, unit * 0.9, unit * 0.9))
}

const drawMeadowDetails = (context: Context, width: number, height: number, camera: number, scale: number, trailTop: number, trailBottom: number) => {
  const spacing = 38 * scale
  const backTop = height * 0.775
  const fieldStart = fieldEdge(width, scale, 1)
  forEachTile(camera, spacing, width, 40, (index, tileX) => {
    const isFront = seededRandom(index, 21) < 0.5
    const spotY = isFront ? mix(trailBottom + 14, height - 6, seededRandom(index, 22)) : mix(backTop, trailTop - 6, seededRandom(index, 22))
    const unit = scale * mix(0.7, 1.4, (spotY - backTop) / (height - backTop))
    const spotX = tileX + seededRandom(index, 20) * spacing
    if (seededRandom(index, 23) < (index * spacing > fieldStart ? 0.65 : 0.35)) {
      paintSprite(context, `nature:flower:${index}`, spotX, spotY, grownBounds([-2.4 * unit, -7.4 * unit, 2.4 * unit, 0], Math.max(1, unit * 0.45) + 1), (layer) => drawMeadowFlower(layer, 0, 0, unit, FLOWER_COLORS[index % FLOWER_COLORS.length]))
    } else {
      paintSprite(context, `nature:tuft:${index}`, spotX, spotY, tuftBounds(unit), (layer) => drawTuft(layer, 0, 0, unit, "#3d9a3a"))
    }
  })
}

const drawFrontGrass = (context: Context, width: number, height: number, camera: number, scale: number) => {
  const spacing = 90 * scale
  forEachTile(camera * 1.25, spacing, width, 60 * scale, (index, tileX) => {
    if (seededRandom(index, 50) < 0.4) return
    const unit = scale * (2.2 + seededRandom(index, 52))
    paintSprite(context, `nature:grass:${index}`, tileX + seededRandom(index, 51) * spacing, height + 6, tuftBounds(unit), (layer) => drawTuft(layer, 0, 0, unit, "#358f35"))
  })
}

const drawButterflies = (context: Context, width: number, height: number, time: number, camera: number, scale: number, inFront: boolean) => {
  const span = width + 200
  BUTTERFLY_COLORS.forEach((color, index) => {
    const fliesInFront = color === "#ff5d8f"
    if (fliesInFront !== inFront) return
    const butterflyX = wrapAround((index * span) / 3 - camera * 0.85 + time * 25 + Math.sin(time * 0.9 + index * 2) * 40, span) - 100
    const butterflyY = height * (0.62 + index * 0.05) + Math.sin(time * 1.6 + index) * height * 0.04
    const flap = 0.25 + Math.abs(Math.sin(time * 12 + index)) * 0.75
    const size = scale * 4
    context.save()
    context.translate(butterflyX, butterflyY)
    context.rotate(Math.sin(time * 2 + index) * 0.2)
    context.scale(size, size)
    context.lineWidth = 1.5 / size
    for (const side of [-1, 1]) {
      context.save()
      context.scale(side * flap, 1)
      paintShape(context, color, ellipsePath(1.7, -1, 1.7, 1.4))
      paintShape(context, color, ellipsePath(1.2, 1, 1.1, 0.9))
      context.restore()
    }
    paintLine(context, OUTLINE, 0.6, (path) => {
      path.moveTo(0, -1.6)
      path.lineTo(0, 1.8)
    })
    context.restore()
  })
}

const horoPose = (horoSteps: number): HoroPose => {
  const stepIndex = Math.floor(horoSteps)
  const stepPhase = horoSteps - stepIndex
  const arc = Math.sin(stepPhase * Math.PI)
  const isKick = wrapAround(stepIndex, 3) === 2
  const footLift = arc * (isKick ? 8 : 4)
  return {
    hop: arc * (isKick ? 4 : 2.5),
    footLifts: wrapAround(stepIndex, 2) === 0 ? [footLift, 0] : [0, footLift],
    handBob: Math.sin(stepPhase * Math.PI * 2) * 1.5,
  }
}

const heldHands = (slot: number, handBob: number, time: number): Hands => [
  slot === -FOLK_SLOTS ? [-16, -34] : [-DANCER_SPACING / 2, HELD_HAND_Y + handBob],
  slot === FOLK_SLOTS ? [22, -66 + Math.sin(time * 6) * 2] : [DANCER_SPACING / 2, HELD_HAND_Y + handBob],
]

const joinAmount = (sceneSeconds: number) => easeInOut(stageProgress(sceneSeconds, JOIN_HOP_END, HANDS_JOIN_END))

const drawFolkDancers = (context: Context, width: number, rowFeetY: number, rowScale: number, time: number, sceneSeconds: number, travel: number, horo: HoroPose) => {
  const waveBack = easeOut(stageProgress(sceneSeconds, SPOT_HOP_END + 0.2, SPOT_HOP_END + 0.5)) * (1 - easeOut(stageProgress(sceneSeconds, WAVE_END, WAVE_END + 0.4)))
  const join = joinAmount(sceneSeconds)
  for (const { slot, person, phase } of FOLK_DANCERS) {
    const dancerX = width / 2 + (GAP_X + slot * DANCER_SPACING - travel) * rowScale
    if (dancerX < -60 * rowScale || dancerX > width + 60 * rowScale) continue
    const wavingHands: Hands = [REST_HANDS[0], [19 + Math.sin(time * 9 + phase) * 4, -62]]
    drawPartyPerson(context, waveBack > 0.5 ? { ...person, face: "laugh" } : person, dancerX, rowFeetY - horo.hop * join * rowScale, rowScale, {
      hands: mixHands(mixHands(REST_HANDS, wavingHands, waveBack), heldHands(slot, horo.handBob, time), join),
      bounce: 0,
      sway: Math.sin(time * 2 + phase) * (1 - join),
      headTilt: Math.sin(time * 1.5 + phase) * 0.06,
      footLifts: [horo.footLifts[0] * join, horo.footLifts[1] * join],
      lookUp: 0,
    }, "nature")
  }
}

const drawBackgroundKira = (context: Context, width: number, height: number, sceneSeconds: number, scale: number) => {
  const kiraScale = scale * 0.55
  const kiraX = width * 0.08 + ((width * 0.84) / 6.2) * sceneSeconds
  if (kiraX > width + 70 * kiraScale) return
  const visible = easeOut(stageProgress(sceneSeconds, 0.2, 0.55))
  if (visible <= 0) return
  const feetY = height * 0.755
  const phase = sceneSeconds * 6
  const lift = Math.abs(Math.sin(phase)) * 4
  context.save()
  context.globalAlpha = visible
  paintFill(context, "rgba(0, 0, 0, 0.15)", ellipsePath(kiraX, feetY, 28 * kiraScale, 2.2 * kiraScale))
  context.translate(kiraX, feetY - lift * kiraScale)
  drawKiraSide(context, 0, 0, kiraScale, {
    legSwing: Math.sin(phase),
    tailWag: Math.sin(sceneSeconds * 8) * 0.35,
    tongueWind: 0.35,
    tonguePhase: sceneSeconds * 6,
  })
  context.restore()
}

const drawNatureRadi = (context: Context, width: number, feetY: number, rowFeetY: number, scale: number, rowScale: number, time: number, sceneSeconds: number, travel: number, horo: HoroPose) => {
  const speed = 1 - clampToUnit((sceneSeconds - WALK_END) / STOP_SECONDS)
  const hopsDone = (travel * HOPS_PER_SECOND) / WALK_UNITS_PER_SECOND
  const hopPhase = hopsDone - Math.floor(hopsDone)
  const leadSide = Math.floor(hopsDone) % 2
  const walkBounce = bounce(hopPhase)
  const stepLift = Math.sin(hopPhase * Math.PI) * 4.5 * speed
  const rowMove = easeInOut(stageProgress(sceneSeconds, JOIN_HOP_START, JOIN_HOP_END))
  const join = joinAmount(sceneSeconds)
  const isPlaying = sceneSeconds < STOP_END
  const spotHop = isPlaying ? 0 : bounce(stageProgress(sceneSeconds, STOP_END, SPOT_HOP_END)).lift * 10
  const joinHop = bounce(stageProgress(sceneSeconds, JOIN_HOP_START, JOIN_HOP_END)).lift * 18
  const lift = walkBounce.lift * 14 * speed + spotHop + joinHop + horo.hop * join
  const stretchY = 1 + (walkBounce.stretchY - 1) * speed
  const lean = (0.08 + Math.sin(hopPhase * Math.PI * 2) * 0.04) * speed
  const radiFeetY = mix(feetY, rowFeetY, rowMove)
  const radiSize = mix(scale, rowScale, rowMove)
  const fingerTap = (offset: number) => (isPlaying ? Math.max(0, Math.sin(time * 11 + offset)) * 1.2 : 0)
  const waveSwing = Math.sin(time * 7) * 6
  const playingHands: Hands = [[GAIDA_HANDS[0][0], GAIDA_HANDS[0][1] - fingerTap(0)], [GAIDA_HANDS[1][0], GAIDA_HANDS[1][1] - fingerTap(2.1)]]
  const wavingHands: Hands = [playingHands[0], [27 + waveSwing, -57 + Math.abs(waveSwing) * 0.4]]
  const hands = mixHands(
    mixHands(
      mixHands(mixHands(playingHands, wavingHands, easeOut(stageProgress(sceneSeconds, SPOT_HOP_END, SPOT_HOP_END + 0.3))), YAY_HANDS, easeOut(stageProgress(sceneSeconds, SWIRL_START, SWIRL_FULL))),
      REST_HANDS,
      easeInOut(stageProgress(sceneSeconds, SWIRL_CLEAR, ARMS_DOWN_END)),
    ),
    heldHands(0, horo.handBob, time),
    join,
  )
  const look = sceneSeconds >= LOOK_SWAP
    ? folkDanceRadiLook
    : { ...gaidaRadiLook, expression: isPlaying ? gaidaRadiLook.expression : sceneSeconds < SPOT_HOP_END ? "surprised" as const : "grin" as const }
  paintFill(context, "rgba(0, 0, 0, 0.15)", ellipsePath(width / 2, radiFeetY, 22 * radiSize * (1 - lift / 60), 3 * radiSize))
  context.save()
  context.translate(width / 2, radiFeetY - lift * radiSize)
  context.rotate(lean)
  context.scale(1 / stretchY, stretchY)
  drawRadi(context, look, 0, 0, radiSize, {
    faceTurn: 0.6 * speed,
    legLifts: [(leadSide === 0 ? stepLift : 0) + horo.footLifts[0] * join, (leadSide === 1 ? stepLift : 0) + horo.footLifts[1] * join],
    hands,
    headTilt: Math.sin(time * 2.4) * 0.05,
  }, speed === 0 && (rowMove === 0 || rowMove === 1) ? "nature" : undefined)
  context.restore()
  const chanterX = (CHANTER_END[0] * radiSize) / stretchY
  const chanterY = CHANTER_END[1] * radiSize * stretchY
  return {
    emitX: width / 2 + chanterX * Math.cos(lean) - chanterY * Math.sin(lean),
    emitY: radiFeetY - lift * radiSize + chanterX * Math.sin(lean) + chanterY * Math.cos(lean),
  }
}

const petalPath = (size: number): BuildPath => (path) => {
  path.moveTo(0, -size)
  path.quadraticCurveTo(size, -size * 0.2, 0, size)
  path.quadraticCurveTo(-size, -size * 0.2, 0, -size)
  path.closePath()
}

const drawFolkSwirl = (context: Context, width: number, height: number, centerX: number, feetY: number, scale: number, sceneSeconds: number) => {
  if (sceneSeconds < SWIRL_START || sceneSeconds > SWIRL_END) return
  const gather = easeOut(stageProgress(sceneSeconds, SWIRL_START, SWIRL_FULL))
  const burst = easeOut(stageProgress(sceneSeconds, SWIRL_CLEAR, SWIRL_END))
  const strength = gather * (1 - burst)
  const spin = (sceneSeconds - SWIRL_START) * 9
  const bodyY = feetY - 50 * scale
  const glowRadius = 85 * scale
  const glow = context.createRadialGradient(centerX, bodyY, 0, centerX, bodyY, glowRadius)
  glow.addColorStop(0, `rgba(255, 246, 250, ${0.97 * strength})`)
  glow.addColorStop(0.55, `rgba(255, 214, 228, ${0.92 * strength})`)
  glow.addColorStop(1, "rgba(255, 214, 228, 0)")
  paintFill(context, glow, ellipsePath(centerX, bodyY, glowRadius, glowRadius))
  context.save()
  context.globalAlpha = 1 - burst
  RIBBON_COLORS.forEach((color, ribbonIndex) => {
    const ribbon: BuildPath = (path) => {
      for (let step = 0; step <= 24; step += 1) {
        const along = step / 24
        const angle = along * Math.PI * 4 + spin + (ribbonIndex * Math.PI * 2) / 3
        const radius = (24 + along * 10) * scale * (gather + burst * 2)
        path.lineTo(centerX + Math.cos(angle) * radius, feetY - along * 110 * scale)
      }
    }
    paintLine(context, OUTLINE, scale * 2.6, ribbon)
    paintLine(context, color, scale * 1.6, ribbon)
  })
  context.lineWidth = 1.5
  for (let petal = 0; petal < SWIRL_PETALS; petal += 1) {
    const angle = petal * 2.4 + spin * (0.8 + seededRandom(petal, 61) * 0.6)
    const radius = (18 + seededRandom(petal, 62) * 30) * scale * (0.1 + gather * 0.9 + burst * 3)
    const rise = wrapAround(seededRandom(petal, 63) + (sceneSeconds - SWIRL_START) * 0.5, 1)
    const petalX = centerX + Math.cos(angle) * radius
    const petalY = feetY - (8 + rise * 105) * scale
    const size = (2.4 + seededRandom(petal, 64) * 1.6) * scale * (0.75 + Math.sin(angle) * 0.25)
    if (petal % 5 === 0) {
      drawStarSparkle(context, petalX, petalY, size * 1.4, "#ffd23f")
      continue
    }
    context.save()
    context.translate(petalX, petalY)
    context.rotate(angle * 1.3)
    paintShape(context, ROSE_COLORS[petal % ROSE_COLORS.length], petalPath(size))
    context.restore()
  }
  context.restore()
  if (sceneSeconds < LOOK_SWAP) return
  const flash = stageProgress(sceneSeconds, LOOK_SWAP, LOOK_SWAP + 0.4)
  paintFill(context, `rgba(255, 240, 246, ${0.7 * (1 - flash)})`, (path) => path.rect(0, 0, width, height))
  context.save()
  context.globalAlpha = 1 - flash
  paintLine(context, WHITE, 5 * scale * (1 - flash) + 1, ellipsePath(centerX, bodyY, mix(20, 150, easeOut(flash)) * scale, mix(20, 150, easeOut(flash)) * scale))
  context.restore()
}

const drawScrollDanceHint = (context: Context, width: number, height: number, time: number, appear: number) => {
  if (appear <= 0.01) return
  const bubbleWidth = Math.min(width * 0.5, 380)
  const centerX = width / 2
  const centerY = height * 0.22 + Math.sin(time * 1.6) * height * 0.008
  context.save()
  context.translate(centerX, centerY)
  context.scale(appear, appear)
  context.translate(-centerX, -centerY)
  paintComicBubble(context, [ellipsePath(centerX, centerY, bubbleWidth / 2, bubbleWidth * 0.225)], Math.max(4, bubbleWidth * 0.012), ["Scroll to", "dance the horo!"], centerX, centerY, bubbleWidth * 0.085)
  context.restore()
}

const noteHeadPath = (centerX: number, centerY: number): BuildPath => (path) => path.ellipse(centerX, centerY, 1.15, 0.85, -0.4, 0, Math.PI * 2)

const drawNote = (context: Context, color: string, isPair: boolean) => {
  const stems: BuildPath = isPair
    ? (path) => {
        path.moveTo(1, -0.3)
        path.lineTo(1, -3.6)
        path.lineTo(3.6, -4.2)
        path.lineTo(3.6, -0.9)
      }
    : (path) => {
        path.moveTo(1, -0.3)
        path.lineTo(1, -3.6)
        path.quadraticCurveTo(2.6, -2.9, 2.4, -1.4)
      }
  paintLine(context, OUTLINE, 0.75, stems)
  paintLine(context, color, 0.35, stems)
  context.lineWidth = 0.25
  paintShape(context, color, noteHeadPath(0, 0))
  if (isPair) paintShape(context, color, noteHeadPath(2.6, -0.6))
}

const drawMusicNotes = (context: Context, emitX: number, emitY: number, scale: number, sceneSeconds: number) => {
  const newestNote = Math.floor(Math.min(sceneSeconds, STOP_END) / NOTE_INTERVAL)
  const oldestNote = Math.max(0, Math.ceil((sceneSeconds - NOTE_LIFE) / NOTE_INTERVAL))
  for (let note = oldestNote; note <= newestNote; note += 1) {
    const age = sceneSeconds - note * NOTE_INTERVAL
    const pop = easeOutBack(clampToUnit(age / 0.35))
    if (pop <= 0.01) continue
    const side = seededRandom(note, 31) < 0.5 ? 1 : -1
    const spread = (1 - (1 - age / NOTE_LIFE) ** 2) * (30 + seededRandom(note, 32) * 60) * side
    const drift = -age * WALK_UNITS_PER_SECOND * 0.3
    const rise = 26 + seededRandom(note, 34) * 22
    const size = scale * (2.6 + seededRandom(note, 33) * 1.2) * pop
    context.save()
    context.globalAlpha = 1 - stageProgress(age, NOTE_LIFE - 0.7, NOTE_LIFE)
    context.translate(emitX + (spread + drift + Math.sin(age * 4 + note) * 6) * scale, emitY - (age * rise + Math.sin(age * 2.2 + note) * 4) * scale)
    context.rotate(Math.sin(age * 3 + note) * 0.35)
    context.scale(size, size)
    drawNote(context, NOTE_COLORS[note % NOTE_COLORS.length], note % 3 === 0)
    context.restore()
  }
}

export const drawNatureScene = (context: Context, width: number, height: number, time: number, sceneSeconds: number, horoSteps: number, horoDanceSteps: number, showScrollHint: boolean) => {
  prepareSceneSprites("nature", `${width} ${height}`)
  const scale = radiScale(width, height)
  const rowScale = scale * ROW_SCALE
  const horizonY = height * 0.56
  const feetY = height * 0.86
  const rowFeetY = height * 0.81
  const radiX = width / 2
  const travel = travelUnits(sceneSeconds)
  const camera = (travel + horoUnits(horoSteps)) * scale
  const horo = horoPose(horoDanceSteps)
  const trailTop = feetY - height * 0.035
  const trailBottom = feetY + height * 0.05
  context.lineJoin = "round"
  context.lineCap = "round"
  context.strokeStyle = OUTLINE
  drawGoldenSky(context, width, height, horizonY)
  drawSun(context, width, height, time)
  drawDriftingClouds(context, width, height, time, camera)
  drawMountainRange(context, width, height, camera * 0.05, width * 0.3, horizonY + height * 0.05, 0.2, 0.32, "#a99be0", 1, true)
  drawMountainRange(context, width, height, camera * 0.1, width * 0.36, horizonY + height * 0.06, 0.1, 0.18, "#74b9a5", 5, false)
  context.lineWidth = 4
  paintShape(context, "#a8e07e", wavyBandPath(width, camera * 0.22, horizonY + height * 0.03, height + 10, height * 0.03, width * 0.8))
  paintShape(context, "#8fd56c", wavyBandPath(width, camera * 0.35, horizonY + height * 0.1, height + 10, height * 0.025, width * 0.55))
  drawWoodland(context, width, height, time, camera, scale)
  const meadowGradient = context.createLinearGradient(0, height * 0.74, 0, height)
  meadowGradient.addColorStop(0, "#86d861")
  meadowGradient.addColorStop(1, "#4fae45")
  paintShape(context, meadowGradient, wavyBandPath(width, camera, height * 0.745, height + 10, height * 0.006, width * 0.5))
  drawBackgroundKira(context, width, height, sceneSeconds, scale)
  drawButterflies(context, width, height, time, camera, scale, false)
  drawTrail(context, width, camera, trailTop, trailBottom, height * 0.008)
  drawPebbles(context, width, camera, trailTop, trailBottom, scale)
  drawMeadowDetails(context, width, height, camera, scale, trailTop, trailBottom)
  drawFolkDancers(context, width, rowFeetY, rowScale, time, sceneSeconds, travel, horo)
  const { emitX, emitY } = drawNatureRadi(context, width, feetY, rowFeetY, scale, rowScale, time, sceneSeconds, travel, horo)
  drawButterflies(context, width, height, time, camera, scale, true)
  drawMusicNotes(context, emitX, emitY, scale, sceneSeconds)
  drawFolkSwirl(context, width, height, radiX, feetY, scale, sceneSeconds)
  drawFrontGrass(context, width, height, camera, scale)
  drawScrollDanceHint(context, width, height, time, showScrollHint ? easeOutBack(stageProgress(sceneSeconds, HORO_START, HORO_START + 0.4)) : 0)
  const fullRadius = Math.hypot(width, height)
  if (sceneSeconds < IRIS_IN_END) paintIris(context, width, height, radiX, feetY - 60 * scale, fullRadius * stageProgress(sceneSeconds, 0, IRIS_IN_END) ** 2)
  if (sceneSeconds > HORO_IRIS_START) paintIris(context, width, height, radiX, feetY - 60 * scale, mix(fullRadius, 0, stageProgress(sceneSeconds, HORO_IRIS_START, HORO_IRIS_END) ** 2))
}
