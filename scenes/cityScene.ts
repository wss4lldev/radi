import { ellipsePath, linePath, paintFill, paintLine, paintShape, type BuildPath, type Context } from "@/characters/paint"
import { SHADE, SILVER, curvesPath, drawRadi, drawSunglasses, type Point } from "@/characters/radi"
import { popArtRadiLook } from "@/characters/radiConcepts"
import { drawKiraSide } from "@/characters/kira"
import { drawRadiSide } from "@/characters/radiSide"
import { clipToClubDoor, clubDoorCenterY, clubDoorWidth, clubDoorX, clubLeftX, clubPlacement, drawClubBuilding, drawClubLights, partyColor, type ClubPlacement } from "@/scenes/nightClub"
import { paintCachedLayer } from "@/scenes/layerCache"
import { drawEveningSky, drawMoonAndStars, drawNightShade, drawSettingSun, eveningLight } from "@/scenes/nightfall"
import { drawSceneryBack, drawSceneryFront, drawScenerySky } from "@/scenes/roadTrip"
import {
  clampToUnit,
  drawClouds,
  easeOut,
  easeOutBack,
  mix,
  mixPoint,
  comicBubbleWidth,
  paintComicBubble,
  paintIris,
  radiScale,
  stageProgress,
  type BubbleButtonLayout,
} from "@/scenes/openingScene"

const OUTLINE = "#2b1d1a"
const BENCH = "#c98b52"
const SIDEWALK = "#efe9df"
const SHADOW = "rgba(0, 0, 0, 0.15)"
const PERSON_SHADE = "rgba(70, 80, 140, 0.32)"
const BUILDINGS_BASE = 0.54
const BACK_WALK_BOTTOM = 0.6
const ROAD_BOTTOM = 0.84
const IRIS_IN_START = 0.2
const IRIS_IN_END = 1.2
const BUBBLE_POP_START = 1.3
const BUBBLE_POP_END = 1.7
const ANYWAY_BUBBLE_HIDE_END = 0.25
const JUMP_OFF_START = 0.3
const JUMP_OFF_END = 0.9
const LANDING_END = 1.15
const GLASSES_POP_START = 1.3
const GLASSES_ON_START = 1.5
const GLASSES_ON_END = 2.1
const HAND_DOWN_END = 2.5
const COOL_BUBBLE_START = 2.6
const COOL_BUBBLE_END = 3
const JUMP_FORWARD_UNITS = 40
const JUMP_HEIGHT_UNITS = 26
const FORWARD_SCALE = 1.1
const GLASSES_HAND_OFFSET: Point = [14, 24]
const SITTING_HANDS: readonly [Point, Point] = [[-17, -25], [17, -25]]
const STANDING_HANDS: readonly [Point, Point] = [[-14, -33], [14, -33]]
const DRIVING_HAND: Point = [16, -35]
const CAR_RED = "#e8262e"
const CAR_DARK = "#3a1214"
const CAR_GROUND = 0.8
const CAR_WHEEL_RADIUS = 16
const CAR_WHEEL_XS = [-72, 70]
const CAR_SEAT: Point = [-6, -17]
export const CAR_ENTER_START = 3.4
export const CAR_ENTRANCE_SOUND = CAR_ENTER_START - 1
const CAR_ENTER_END = 4.6
const CAR_BRAKE_END = 4.9
const COOL_BUBBLE_HIDE_END = CAR_ENTER_END + 0.25
const FLIP_CROUCH_START = 4.9
const FLIP_START = 5.1
const FLIP_END = 6
const SEAT_SETTLE_END = 6.25
const FLIP_HEIGHT_UNITS = 90
const ZHUPKI_BUBBLE_START = 6.4
const ZHUPKI_BUBBLE_END = 6.8
const EXHAUST_PUFFS = 10
const CAR_MUSIC_NOTES = ["♪", "♫", "♬", "♩", "♪", "♫"]
const EXHAUST_PIPE_X = -117
const EXHAUST_PIPE_Y = -15.5
export const KIRA_POP_PROGRESS = 0.5
const KIRA_LEAP_END = 0.35
const KIRA_SETTLE_END = 0.7
const KIRA_LEAP_Y = -46
export const KIRA_WOOF_START = 0.25
const KIRA_WOOF_END = 1.9
const KIRA_TRUNK_X = -68
const KIRA_SEAT_Y = -24
const KIRA_HIDDEN_Y = 40
const KIRA_CLIP_Y = -12
const KIRA_SCALE = 0.85
const DRIVE_LENGTH_WIDTHS = 21
const DRIVE_STOP_START = 0.95
const CENTERING_WIDTHS = 0.6
const ZHUPKI_HIDE_WIDTHS = 0.3
export const DRIVE_READY_SECONDS = ZHUPKI_BUBBLE_END
export const DRIVE_CRUISE_SECONDS = 30
export const DRIVE_MAX_BOOST = 4
const SPEED_BAR_TOP = 16
const SPEED_BAR_MARGIN = 16

export type DriveState = { progress: number; speed: number; kiraSeconds: number | null; arrivalSeconds: number | null }

const CLUB_CENTER_X = 0.84
const CLUB_BASE = 0.83
const ROAD_END_GROUND = "#ffc4e1"
const RADI_LANDING_UNITS = 140
export const RADI_EXIT_START = 0.8
const RADI_EXIT_END = 1.5
const RADI_WALK_END = 3.1
const RADI_ENTER_END = 3.9

export const cityWalkSteps = (arrivalSeconds: number | null, anywaySeconds: number | null) => {
  if (anywaySeconds === null && arrivalSeconds === null) return null
  const landing = anywaySeconds !== null && anywaySeconds >= JUMP_OFF_END ? 1 : 0
  if (arrivalSeconds === null) return landing
  const walk = stageProgress(arrivalSeconds, RADI_EXIT_END, RADI_WALK_END)
  if (walk <= 0) return landing
  const enter = stageProgress(arrivalSeconds, RADI_WALK_END, RADI_ENTER_END)
  return landing + (walk < 1 ? walk : 1 + enter) * 4
}

const KIRA_JUMP_START = 1.7
const KIRA_JUMP_END = 2.3
const KIRA_RUN_END = 3.7
const SCENE_IRIS_START = 3.9
const SCENE_IRIS_END = 5.2
export const CITY_SCENE_END = SCENE_IRIS_END
const ARRIVING_LOOK = {
  ...popArtRadiLook,
  expression: "grin" as const,
  pose: "wave" as const,
  extras: [...popArtRadiLook.extras, "sunglasses" as const],
}

const carBodyPath: BuildPath = (path) => {
  path.moveTo(-112, -12)
  path.lineTo(-116, -36)
  path.quadraticCurveTo(-104, -46, -78, -47)
  path.lineTo(-34, -46)
  path.lineTo(-26, -44)
  path.lineTo(46, -44)
  path.quadraticCurveTo(84, -38, 114, -26)
  path.quadraticCurveTo(121, -21, 117, -13)
  path.lineTo(110, -10)
  path.lineTo(-106, -10)
  path.closePath()
}

const carHeadlightPath: BuildPath = (path) => {
  path.moveTo(95, -32)
  path.lineTo(113, -25.5)
  path.lineTo(111, -22)
  path.lineTo(93, -28.5)
  path.closePath()
}

const carWindshieldPath: BuildPath = (path) => {
  path.moveTo(22, -44)
  path.lineTo(46, -44)
  path.lineTo(30, -66)
  path.lineTo(24, -66)
  path.closePath()
}

type CityBuilding = { x: number; width: number; height: number; color: string; hasDoor: boolean }
type Walker = { phase: number; speed: number; size: number }

const CITY_BUILDINGS: CityBuilding[] = [
  { x: -0.01, width: 0.12, height: 0.3, color: "#ff9fb2", hasDoor: true },
  { x: 0.11, width: 0.1, height: 0.4, color: "#ffd166", hasDoor: false },
  { x: 0.21, width: 0.13, height: 0.26, color: "#8ecae6", hasDoor: true },
  { x: 0.34, width: 0.09, height: 0.36, color: "#cdb4db", hasDoor: false },
  { x: 0.43, width: 0.12, height: 0.3, color: "#95d5b2", hasDoor: true },
  { x: 0.55, width: 0.09, height: 0.42, color: "#ffadad", hasDoor: false },
  { x: 0.64, width: 0.13, height: 0.28, color: "#a0c4ff", hasDoor: true },
  { x: 0.77, width: 0.09, height: 0.37, color: "#ffd6a5", hasDoor: false },
  { x: 0.86, width: 0.15, height: 0.31, color: "#bde0fe", hasDoor: true },
]

const TREE_POSITIONS = [0.06, 0.29, 0.52, 0.74, 0.95]

const WALKERS: Walker[] = [
  { phase: 0, speed: 0.035, size: 1 },
  { phase: 0.35, speed: -0.03, size: 0.9 },
  { phase: 0.6, speed: 0.025, size: 1.05 },
  { phase: 0.85, speed: -0.04, size: 0.95 },
]

const BENCH_PARTS: BuildPath[] = [
  (path) => path.roundRect(-31.5, -47, 3, 30, 1),
  (path) => path.roundRect(28.5, -47, 3, 30, 1),
  (path) => path.roundRect(-36, -47, 72, 5, 2),
  (path) => path.roundRect(-36, -39, 72, 5, 2),
  (path) => path.roundRect(-31, -20, 3, 25, 1),
  (path) => path.roundRect(28, -20, 3, 25, 1),
  (path) => path.roundRect(-38, -24, 76, 5, 2),
]

const drawBuildings = (context: Context, width: number, height: number) => {
  const baseY = height * BUILDINGS_BASE
  const windowWidth = Math.max(6, width * 0.016)
  const windowHeight = Math.max(8, height * 0.03)
  context.lineWidth = 3
  CITY_BUILDINGS.forEach(({ x, width: widthRatio, height: heightRatio, color, hasDoor }, buildingIndex) => {
    const left = x * width
    const buildingWidth = widthRatio * width
    const top = baseY - heightRatio * height
    paintShape(context, color, (path) => path.rect(left, top, buildingWidth, baseY - top), {
      decorateInside: (buildingContext) => {
        paintFill(buildingContext, "rgba(0, 0, 0, 0.12)", (path) => path.rect(left, top, buildingWidth, height * 0.015))
        const columns = Math.max(2, Math.floor(buildingWidth / (windowWidth * 2)))
        const gapX = (buildingWidth - columns * windowWidth) / (columns + 1)
        buildingContext.lineWidth = 2
        for (let windowY = top + height * 0.035; windowY < baseY - windowHeight * (hasDoor ? 2.6 : 1.6); windowY += windowHeight * 1.9) {
          for (let column = 0; column < columns; column += 1) {
            const isLit = (buildingIndex + column + Math.round(windowY)) % 4 === 0
            paintShape(buildingContext, isLit ? "#fff3b0" : "#e8f6ff", (path) => path.roundRect(left + gapX + column * (windowWidth + gapX), windowY, windowWidth, windowHeight, 2))
          }
        }
        if (hasDoor) {
          const doorWidth = windowWidth * 1.6
          paintShape(buildingContext, "#8a5a32", (path) => path.roundRect(left + (buildingWidth - doorWidth) / 2, baseY - windowHeight * 2.2, doorWidth, windowHeight * 2.4, [doorWidth / 2, doorWidth / 2, 0, 0]))
        }
      },
    })
  })
}

const drawSidewalk = (context: Context, width: number, top: number, bottom: number, tileWidth: number) => {
  context.lineWidth = 3
  paintShape(context, SIDEWALK, (path) => path.rect(-4, top, width + 8, bottom - top))
  for (let tileX = tileWidth; tileX < width; tileX += tileWidth) paintLine(context, "rgba(43, 29, 26, 0.18)", 2, linePath(tileX, top, tileX, bottom))
}

const drawRoad = (context: Context, width: number, height: number, camera: number) => {
  const top = height * BACK_WALK_BOTTOM
  const bottom = height * ROAD_BOTTOM
  context.lineWidth = 3
  paintShape(context, "#6d7a8c", (path) => path.rect(-4, top, width + 8, bottom - top))
  const dashWidth = width * 0.05
  const dashHeight = Math.max(6, height * 0.01)
  context.fillStyle = "#ffffff"
  for (let dashX = dashWidth * 0.5 - (camera % (dashWidth * 2)); dashX < width; dashX += dashWidth * 2) context.fillRect(dashX, (top + bottom - dashHeight) / 2, dashWidth, dashHeight)
}

const drawWalker = (context: Context, centerX: number, feetY: number, size: number, step: number, facing: number) => {
  const swing = Math.sin(step) * size * 0.18
  context.save()
  context.translate(centerX, feetY)
  context.scale(facing, 1)
  paintLine(context, PERSON_SHADE, size * 0.12, (path) => {
    path.moveTo(-swing, 0)
    path.lineTo(0, -size * 0.42)
    path.lineTo(swing, 0)
  })
  paintLine(context, PERSON_SHADE, size * 0.1, (path) => {
    path.moveTo(swing * 0.8, -size * 0.5)
    path.lineTo(0, -size * 0.72)
    path.lineTo(-swing * 0.8, -size * 0.5)
  })
  paintFill(context, PERSON_SHADE, (path) => path.roundRect(-size * 0.13, -size * 0.8, size * 0.26, size * 0.42, size * 0.1))
  paintFill(context, PERSON_SHADE, ellipsePath(size * 0.02, -size * 0.92, size * 0.12, size * 0.12))
  context.restore()
}

const drawWalkers = (context: Context, width: number, height: number, time: number) => {
  const feetY = height * (BUILDINGS_BASE + 0.045)
  for (const { phase, speed, size } of WALKERS) {
    const travel = (((phase + time * speed) % 1.2) + 1.2) % 1.2
    drawWalker(context, (travel - 0.1) * width, feetY, height * 0.1 * size, time * 7 + phase * 10, Math.sign(speed))
  }
}

const drawTrees = (context: Context, width: number, height: number) => {
  const groundY = height * (BUILDINGS_BASE + 0.05)
  const crownRadius = height * 0.04
  context.lineWidth = 3
  for (const treeX of TREE_POSITIONS) {
    const centerX = treeX * width
    paintShape(context, "#8a5a32", (path) => path.roundRect(centerX - crownRadius * 0.18, groundY - crownRadius * 2.4, crownRadius * 0.36, crownRadius * 2.4, 3))
    const crown: BuildPath = (path) => {
      for (const [offsetX, offsetY] of [[-0.6, 0], [0.6, 0], [0, -0.55]]) {
        path.moveTo(centerX + (offsetX + 1) * crownRadius, groundY - crownRadius * (2.6 - offsetY))
        path.ellipse(centerX + offsetX * crownRadius, groundY - crownRadius * (2.6 - offsetY), crownRadius, crownRadius, 0, 0, Math.PI * 2)
      }
    }
    paintLine(context, OUTLINE, 6, crown)
    paintFill(context, "#5cc45a", crown)
    paintFill(context, "rgba(255, 255, 255, 0.25)", ellipsePath(centerX - crownRadius * 0.5, groundY - crownRadius * 3.3, crownRadius * 0.35, crownRadius * 0.22))
  }
}

const benchRadiPosition = (width: number, height: number) => {
  const scale = radiScale(width, height)
  return { scale, radiX: Math.max(width * 0.22, 45 * scale), groundY: height * 0.95, feetY: height * 0.95 - 5 * scale }
}

const landedRadiPosition = (width: number, height: number) => {
  const { scale, radiX, groundY } = benchRadiPosition(width, height)
  return { scale: scale * FORWARD_SCALE, radiX: radiX + JUMP_FORWARD_UNITS * scale, feetY: groundY }
}

const carPlacement = (width: number, height: number, anywaySeconds: number) => {
  const { scale } = benchRadiPosition(width, height)
  const parkedX = landedRadiPosition(width, height).radiX - CAR_SEAT[0] * scale
  const enter = stageProgress(anywaySeconds, CAR_ENTER_START, CAR_ENTER_END)
  const carX = mix(-140 * scale, parkedX, easeOut(enter))
  return {
    scale,
    carX,
    groundY: height * CAR_GROUND,
    wheelTurn: carX / (CAR_WHEEL_RADIUS * scale),
    pitch: Math.sin(stageProgress(anywaySeconds, CAR_ENTER_END, CAR_BRAKE_END) * Math.PI) * 0.04,
  }
}

const carSeatPosition = (width: number, height: number) => {
  const { scale, groundY } = carPlacement(width, height, CAR_ENTER_END)
  return { scale, radiX: landedRadiPosition(width, height).radiX, feetY: groundY + CAR_SEAT[1] * scale }
}

const flipProgress = (anywaySeconds: number) => stageProgress(anywaySeconds, FLIP_START, FLIP_END)

const driveView = (width: number, height: number, drive: DriveState | null) => {
  if (!drive) return { camera: 0, carShift: 0, distance: 0, exhaust: 0, wind: 0, gauge: 0 }
  const stopping = Math.max(0, drive.progress - DRIVE_STOP_START)
  const moving = clampToUnit(drive.speed) * (1 - stopping / (1 - DRIVE_STOP_START))
  const travel = drive.progress - stopping ** 2 / (2 * (1 - DRIVE_STOP_START))
  const distance = travel * DRIVE_LENGTH_WIDTHS * width
  const centering = clampToUnit(distance / (width * CENTERING_WIDTHS))
  const parkedX = carPlacement(width, height, CAR_ENTER_END).carX
  const carShift = (width / 2 - parkedX) * centering * centering * (3 - 2 * centering)
  return {
    camera: distance - carShift,
    carShift,
    distance,
    exhaust: clampToUnit(0.1 + (drive.speed - 1) * 0.35) * moving,
    wind: clampToUnit(0.5 + (drive.speed - 1) * 0.2) * moving,
    gauge: clampToUnit(drive.speed / (1 + DRIVE_MAX_BOOST)) * (1 - stopping / (1 - DRIVE_STOP_START)),
  }
}

export const drawExhaust = (context: Context, time: number, exhaust: number) => {
  if (exhaust <= 0) return
  for (let puff = 0; puff < EXHAUST_PUFFS; puff += 1) {
    const age = (time * 2.5 + puff / EXHAUST_PUFFS) % 1
    const alpha = exhaust * (1 - age) * 0.9
    const puffPath = ellipsePath(
      -age * (40 + 90 * exhaust),
      -age * 10 + Math.sin(puff * 2.3 + time * 3) * 3 * age,
      3 + age * (8 + 12 * exhaust),
      3 + age * (7 + 10 * exhaust),
    )
    paintFill(context, `rgba(255, 255, 255, ${alpha})`, puffPath)
    paintLine(context, `rgba(43, 29, 26, ${alpha * 0.35})`, 1.5, puffPath)
  }
}

const drawCar = (context: Context, width: number, height: number, time: number, anywaySeconds: number, driveDistance: number, exhaust: number) => {
  if (anywaySeconds < CAR_ENTER_START) return
  const { scale, carX, groundY, wheelTurn, pitch } = carPlacement(width, height, anywaySeconds)
  context.save()
  context.translate(carX, groundY)
  context.scale(scale, scale)
  paintFill(context, SHADOW, ellipsePath(0, 0, 118, 4.5))
  context.save()
  context.translate(EXHAUST_PIPE_X, EXHAUST_PIPE_Y)
  drawExhaust(context, time, exhaust)
  context.restore()
  context.rotate(pitch)
  context.lineWidth = 1.6
  paintShape(context, "#1d1d1d", (path) => path.roundRect(70, -12.5, 50, 3.5, 1.5))
  paintShape(context, CAR_RED, carBodyPath, {
    shade: SHADE,
    decorateInside: (bodyContext) => {
      for (const wheelX of CAR_WHEEL_XS) paintFill(bodyContext, CAR_DARK, ellipsePath(wheelX, -12, CAR_WHEEL_RADIUS + 5, CAR_WHEEL_RADIUS + 5))
      paintFill(bodyContext, "rgba(0, 0, 0, 0.25)", (path) => path.rect(-120, -16, 240, 6))
      paintLine(bodyContext, "rgba(255, 255, 255, 0.6)", 1.6, curvesPath([[-100, -43, 0, -44.5, 70, -40]]))
      paintLine(bodyContext, OUTLINE, 0.9, curvesPath([[-24, -44, -27, -28, -20, -16], [40, -44, 42, -28, 36, -16]]))
    },
  })
  paintShape(context, "#fff3b0", carHeadlightPath)
  paintShape(context, "#ff3b3b", (path) => path.roundRect(-118, -36, 5, 8, 1.5))
  paintShape(context, SILVER, ellipsePath(-113, -15.5, 3.4, 2.4))
  paintLine(context, OUTLINE, 1.6, linePath(11, -51, 22, -44))
  paintLine(context, OUTLINE, 2.2, (path) => path.ellipse(11, -51, 2.6, 7, 0.35, 0, Math.PI * 2))
  paintShape(context, "rgba(190, 230, 255, 0.55)", carWindshieldPath, {
    decorateInside: (glassContext) => paintLine(glassContext, "rgba(255, 255, 255, 0.8)", 1.4, linePath(30, -48, 34, -60)),
  })
  for (const wheelX of CAR_WHEEL_XS) {
    paintShape(context, "#1d1d1d", ellipsePath(wheelX, -CAR_WHEEL_RADIUS, CAR_WHEEL_RADIUS, CAR_WHEEL_RADIUS))
    paintShape(context, SILVER, ellipsePath(wheelX, -CAR_WHEEL_RADIUS, 11, 11))
    paintShape(context, "#ffd23a", (path) => path.roundRect(wheelX + 3, -CAR_WHEEL_RADIUS - 8, 5, 9, 2))
    for (let spoke = 0; spoke < 5; spoke += 1) {
      const angle = wheelTurn + driveDistance / (CAR_WHEEL_RADIUS * scale) + (spoke * Math.PI * 2) / 5
      paintLine(context, OUTLINE, 1.8, linePath(wheelX, -CAR_WHEEL_RADIUS, wheelX + Math.cos(angle) * 10, -CAR_WHEEL_RADIUS + Math.sin(angle) * 10))
    }
    paintShape(context, SILVER, ellipsePath(wheelX, -CAR_WHEEL_RADIUS, 2.4, 2.4))
  }
  context.restore()
}

const drawTrunkKira = (context: Context, width: number, height: number, time: number, kiraSeconds: number, wind: number) => {
  const leap = easeOut(stageProgress(kiraSeconds, 0, KIRA_LEAP_END))
  const settle = easeOutBack(stageProgress(kiraSeconds, KIRA_LEAP_END, KIRA_SETTLE_END))
  const landingSquash = Math.sin(Math.PI * stageProgress(kiraSeconds, KIRA_LEAP_END, KIRA_SETTLE_END)) * 0.15
  const feetY = settle > 0 ? mix(KIRA_LEAP_Y, KIRA_SEAT_Y, settle) : mix(KIRA_HIDDEN_Y, KIRA_LEAP_Y, leap)
  const { scale, carX, groundY } = carPlacement(width, height, CAR_ENTER_END)
  context.save()
  context.translate(carX, groundY)
  context.scale(scale, scale)
  context.beginPath()
  context.rect(-200, -200, 400, 200 + KIRA_CLIP_Y)
  context.clip()
  context.translate(KIRA_TRUNK_X, feetY)
  context.scale(1 + landingSquash, 1 - landingSquash)
  drawKiraSide(context, 0, 0, KIRA_SCALE, {
    sit: 1,
    headReach: 0.25 + 0.25 * Math.sin(time * 2.6),
    tongueWind: wind,
    tonguePhase: time * 14,
    showTail: false,
  })
  context.restore()
}

const drawCarMusic = (context: Context, width: number, height: number, time: number, volume: number) => {
  if (volume <= 0) return
  const { scale, carX, groundY } = carPlacement(width, height, CAR_ENTER_END)
  context.save()
  context.translate(carX, groundY)
  context.scale(scale, scale)
  context.font = '16px "Comic Sans MS", "Comic Sans", "Comic Neue", cursive'
  context.textAlign = "center"
  context.lineWidth = 3
  context.strokeStyle = OUTLINE
  for (let noteIndex = 0; noteIndex < CAR_MUSIC_NOTES.length; noteIndex += 1) {
    const age = (time * 0.5 + noteIndex / CAR_MUSIC_NOTES.length) % 1
    const noteX = 25 - age * 90 + Math.sin(age * 8 + noteIndex) * 6
    const noteY = -70 - age * 70
    context.globalAlpha = Math.sin(Math.PI * age) * volume
    context.fillStyle = partyColor(noteIndex, time, 1)
    context.strokeText(CAR_MUSIC_NOTES[noteIndex], noteX, noteY)
    context.fillText(CAR_MUSIC_NOTES[noteIndex], noteX, noteY)
  }
  context.restore()
}

const drawKiraWoof = (context: Context, width: number, height: number, kiraSeconds: number) => {
  const popScale = easeOutBack(stageProgress(kiraSeconds, KIRA_WOOF_START, KIRA_WOOF_START + 0.25)) * (1 - stageProgress(kiraSeconds, KIRA_WOOF_END - 0.3, KIRA_WOOF_END))
  if (popScale <= 0) return
  const { scale, carX, groundY } = carPlacement(width, height, CAR_ENTER_END)
  context.save()
  context.translate(carX + (KIRA_TRUNK_X - 28) * scale, groundY - 112 * scale)
  context.scale(scale * popScale, scale * popScale)
  context.rotate(-0.15)
  context.lineWidth = 1.6
  context.strokeStyle = OUTLINE
  paintShape(context, "#ffe23f", (path) => {
    for (let spike = 0; spike < 28; spike += 1) {
      const angle = (spike * Math.PI) / 14
      const radius = spike % 2 === 0 ? 24 : 16
      const pointX = Math.cos(angle) * radius * 1.25
      const pointY = Math.sin(angle) * radius
      if (spike === 0) path.moveTo(pointX, pointY)
      else path.lineTo(pointX, pointY)
    }
    path.closePath()
  })
  context.font = 'bold 12px "Comic Sans MS", "Comic Sans", "Comic Neue", cursive'
  context.textAlign = "center"
  context.textBaseline = "middle"
  context.fillStyle = "#e8262e"
  context.fillText("WOOF!", 0, 1)
  context.restore()
}

const drawArrivingRadi = (context: Context, width: number, height: number, time: number, arrivalSeconds: number, carShift: number, club: ClubPlacement) => {
  const enter = stageProgress(arrivalSeconds, RADI_WALK_END, RADI_ENTER_END)
  if (enter >= 1) return
  const exit = stageProgress(arrivalSeconds, RADI_EXIT_START, RADI_EXIT_END)
  const walk = stageProgress(arrivalSeconds, RADI_EXIT_END, RADI_WALK_END)
  const seat = carSeatPosition(width, height)
  const startX = seat.radiX + carShift
  const landX = startX + RADI_LANDING_UNITS * seat.scale
  const isWalking = walk > 0 && enter < 1
  const stride = isWalking ? Math.sin((walk < 1 ? walk : 1 + enter) * Math.PI * 4) : 0
  const doorX = clubDoorX(club)
  const radiX = exit < 1
    ? mix(startX, landX, exit)
    : walk < 1 ? mix(landX, doorX, walk) : mix(doorX, doorX + clubDoorWidth(club) / 2 + 30 * seat.scale, enter)
  const feetY = exit < 1
    ? mix(seat.feetY, club.baseY, exit) - 4 * exit * (1 - exit) * 50 * seat.scale
    : club.baseY - Math.abs(stride) * 4 * seat.scale
  context.save()
  if (enter > 0) clipToClubDoor(context, club)
  drawRadiSide(context, ARRIVING_LOOK, radiX, feetY, seat.scale, isWalking ? [3 - stride * 7, -31] : undefined, undefined, stride)
  context.restore()
}

const drawRoadEnd = (context: Context, width: number, height: number, roadEndX: number) => {
  if (roadEndX >= width) return
  const top = height * BACK_WALK_BOTTOM
  context.lineWidth = 3
  paintShape(context, ROAD_END_GROUND, (path) => path.roundRect(roadEndX, top, width - roadEndX + 8, height * ROAD_BOTTOM - top, [18, 0, 0, 18]))
}

const drawArrivingKira = (context: Context, width: number, height: number, time: number, arrivalSeconds: number, carShift: number) => {
  const jump = stageProgress(arrivalSeconds, KIRA_JUMP_START, KIRA_JUMP_END)
  const run = stageProgress(arrivalSeconds, KIRA_JUMP_END, KIRA_RUN_END)
  const { scale, carX, groundY } = carPlacement(width, height, CAR_ENTER_END)
  const startX = carX + carShift + KIRA_TRUNK_X * scale
  const landX = startX - 40 * scale
  const runGroundY = height * 0.93
  const kiraX = jump < 1 ? mix(startX, landX, jump) : mix(landX, -120 * scale, run)
  const feetY = jump < 1
    ? mix(groundY + KIRA_SEAT_Y * scale, runGroundY, jump) - 4 * jump * (1 - jump) * 50 * scale
    : runGroundY - Math.abs(Math.sin(time * 16)) * 5 * scale
  if (jump >= 1) paintFill(context, SHADOW, ellipsePath(kiraX, runGroundY, 30 * scale, 3 * scale))
  context.save()
  context.translate(kiraX, 0)
  context.scale(-1, 1)
  drawKiraSide(context, 0, feetY, KIRA_SCALE * scale * 1.15, { legSwing: jump < 1 ? 0.6 : Math.sin(time * 16) })
  context.restore()
}

const drawBench = (context: Context, width: number, height: number) => {
  const { scale, radiX, groundY, feetY } = benchRadiPosition(width, height)
  paintFill(context, SHADOW, ellipsePath(radiX, groundY, 40 * scale, 3.5 * scale))
  context.save()
  context.translate(radiX, feetY)
  context.scale(scale, scale)
  context.lineWidth = 1.6
  for (const benchPart of BENCH_PARTS) paintShape(context, BENCH, benchPart)
  context.restore()
}

const drawCityRadi = (context: Context, width: number, height: number, time: number, anywaySeconds: number, wind: number) => {
  const { scale, radiX, groundY, feetY } = benchRadiPosition(width, height)
  const landed = landedRadiPosition(width, height)
  const jump = stageProgress(anywaySeconds, JUMP_OFF_START, JUMP_OFF_END)
  const jumpArc = 4 * jump * (1 - jump)
  const squash = Math.sin(stageProgress(anywaySeconds, JUMP_OFF_END, LANDING_END) * Math.PI) * 0.14
  const glassesPop = easeOutBack(stageProgress(anywaySeconds, GLASSES_POP_START, GLASSES_ON_START))
  const putOn = easeOut(stageProgress(anywaySeconds, GLASSES_ON_START, GLASSES_ON_END))
  const handUp = easeOut(stageProgress(anywaySeconds, GLASSES_POP_START, GLASSES_ON_START)) * (1 - easeOut(stageProgress(anywaySeconds, GLASSES_ON_END, HAND_DOWN_END)))
  const isWearingGlasses = putOn >= 1
  const glassesOffset = mixPoint(GLASSES_HAND_OFFSET, [0, 0], putOn)
  const currentScale = mix(scale, landed.scale, easeOut(jump))
  const currentX = mix(radiX, landed.radiX, jump)
  const currentFeetY = mix(feetY, groundY, jump) - jumpArc * JUMP_HEIGHT_UNITS * scale
  const kick = Math.sin(time * 3) * 1.5 * (1 - jump)
  const crouch = Math.sin(stageProgress(anywaySeconds, FLIP_CROUCH_START, FLIP_START) * Math.PI) * 0.12
  const seatBounce = Math.sin(stageProgress(anywaySeconds, FLIP_END, SEAT_SETTLE_END) * Math.PI) * 0.1
  const flip = flipProgress(anywaySeconds)
  const flipTuck = Math.sin(flip * Math.PI)
  const seatHands = easeOut(stageProgress(anywaySeconds, FLIP_END - 0.2, SEAT_SETTLE_END))
  const seat = carSeatPosition(width, height)
  const tuck = jumpArc * 6 + flipTuck * 10
  const legBase = 1.5 * (1 - jump) + tuck
  const leftHand = mixPoint(SITTING_HANDS[0], STANDING_HANDS[0], jump)
  const rightHand = mixPoint(SITTING_HANDS[1], STANDING_HANDS[1], jump)
  const flipScale = mix(currentScale, seat.scale, flip)
  const flipX = mix(currentX, seat.radiX, flip)
  const flipFeetY = mix(currentFeetY, seat.feetY, flip) - 4 * flip * (1 - flip) * FLIP_HEIGHT_UNITS * scale
  const bodySquash = squash + crouch + seatBounce

  if (jump > 0 && flip < 1) paintFill(context, SHADOW, ellipsePath(currentX, groundY, 22 * currentScale * (1 - jumpArc * 0.3) * (1 - flip), 3 * currentScale))

  context.save()
  context.translate(flipX, flipFeetY)
  context.translate(0, -50 * flipScale)
  context.rotate(-Math.PI * 2 * flip * flip * (3 - 2 * flip))
  context.translate(0, 50 * flipScale)
  context.scale(1 + bodySquash, 1 - bodySquash)
  const look = {
    ...popArtRadiLook,
    expression: "grin" as const,
    pose: "wave" as const,
    extras: isWearingGlasses ? [...popArtRadiLook.extras, "sunglasses" as const] : popArtRadiLook.extras,
  }
  if (flip >= 0.5) {
    drawRadiSide(context, look, 0, 0, flipScale, mixPoint([3, -31], DRIVING_HAND, seatHands), { strength: wind, phase: time * 11 })
  } else {
    drawRadi(context, look, 0, 0, flipScale, {
      faceTurn: 0,
      hands: [
        mixPoint([leftHand[0] - jumpArc * 6, leftHand[1] - jumpArc * 16], [-10, -28], flipTuck),
        mixPoint(mixPoint([rightHand[0] + jumpArc * 6, rightHand[1] - jumpArc * 16], [20 + glassesOffset[0], -64 + glassesOffset[1]], handUp), [10, -28], flipTuck),
      ],
      legLifts: [legBase + kick, legBase - kick],
      kneeBends: [tuck * 0.8, tuck * 0.8],
    })
  }
  if (glassesPop > 0 && !isWearingGlasses) {
    context.scale(flipScale, flipScale)
    context.translate(glassesOffset[0], glassesOffset[1] - 64)
    context.scale(glassesPop, glassesPop)
    context.translate(0, 64)
    context.lineWidth = 1.6
    drawSunglasses(context)
  }
  context.restore()
}

const coolBubbleGeometry = (width: number, height: number) => {
  const { scale, radiX, feetY } = landedRadiPosition(width, height)
  const bubbleWidth = comicBubbleWidth(width, height, 0.4, 360)
  return {
    bubbleWidth,
    bubbleHeight: bubbleWidth * 0.55,
    centerX: Math.min(width - bubbleWidth / 2 - 12, radiX + 40 * scale + bubbleWidth / 2),
    centerY: feetY - 110 * scale,
    headX: radiX + 24 * scale,
    headY: feetY - 80 * scale,
  }
}

const drawCoolBubble = (context: Context, width: number, height: number, popScale: number) => {
  if (popScale <= 0) return
  const { bubbleWidth, bubbleHeight, centerX, centerY, headX, headY } = coolBubbleGeometry(width, height)
  context.save()
  context.translate(centerX, centerY)
  context.scale(popScale, popScale)
  paintComicBubble(context, [
    ellipsePath(0, 0, bubbleWidth / 2, bubbleHeight / 2),
    (path) => {
      path.moveTo(-bubbleWidth * 0.32, bubbleHeight * 0.22)
      path.lineTo(headX - centerX, headY - centerY)
      path.lineTo(-bubbleWidth * 0.18, bubbleHeight * 0.36)
      path.closePath()
    },
  ], Math.max(3, bubbleWidth * 0.012), ["I'm one cool girl", "and I like to go fast!"], 0, 0, bubbleWidth * 0.075)
  context.restore()
}

const anywayBubbleGeometry = (width: number, height: number) => {
  const { scale, radiX, feetY } = benchRadiPosition(width, height)
  const bubbleWidth = comicBubbleWidth(width, height, 0.3, 260)
  const bubbleHeight = bubbleWidth * 0.55
  return {
    bubbleWidth,
    bubbleHeight,
    centerX: Math.max(bubbleWidth / 2 + 12, radiX),
    centerY: feetY - 100 * scale - bubbleHeight / 2 - 18,
    headX: radiX,
    headY: feetY - 98 * scale,
  }
}

const drawAnywayBubble = (context: Context, width: number, height: number, popScale: number) => {
  if (popScale <= 0) return
  const { bubbleWidth, bubbleHeight, centerX, centerY, headX, headY } = anywayBubbleGeometry(width, height)
  context.save()
  context.translate(centerX, centerY)
  context.scale(popScale, popScale)
  paintComicBubble(context, [
    ellipsePath(0, 0, bubbleWidth / 2, bubbleHeight / 2),
    (path) => {
      path.moveTo(-bubbleWidth * 0.1, bubbleHeight * 0.4)
      path.lineTo(headX - centerX, headY - centerY)
      path.lineTo(bubbleWidth * 0.1, bubbleHeight * 0.4)
      path.closePath()
    },
  ], Math.max(3, bubbleWidth * 0.012), ["", ""], 0, 0, bubbleWidth * 0.12)
  context.restore()
}

const drawZhupkiBubble = (context: Context, width: number, height: number, popScale: number) => {
  if (popScale <= 0) return
  const { scale, radiX, feetY } = carSeatPosition(width, height)
  const bubbleWidth = comicBubbleWidth(width, height, 0.36, 320)
  const bubbleHeight = bubbleWidth * 0.55
  const centerX = Math.min(width - bubbleWidth / 2 - 12, radiX + 70 * scale + bubbleWidth / 2)
  const centerY = feetY - 110 * scale
  context.save()
  context.translate(centerX, centerY)
  context.scale(popScale, popScale)
  paintComicBubble(context, [
    ellipsePath(0, 0, bubbleWidth / 2, bubbleHeight / 2),
    (path) => {
      path.moveTo(-bubbleWidth * 0.32, bubbleHeight * 0.22)
      path.lineTo(radiX + 24 * scale - centerX, feetY - 80 * scale - centerY)
      path.lineTo(-bubbleWidth * 0.18, bubbleHeight * 0.36)
      path.closePath()
    },
  ], Math.max(3, bubbleWidth * 0.012), ["Scroll to give it", "жупки"], 0, 0, bubbleWidth * 0.09)
  context.restore()
}

const drawSpeedBar = (context: Context, width: number, gauge: number) => {
  const barWidth = Math.min(220, width * 0.3)
  const barHeight = 18
  const fontSize = 16
  const panelPadding = 10
  const panelWidth = barWidth + panelPadding * 2
  const panelHeight = fontSize + barHeight + panelPadding * 2.6
  const panelX = SPEED_BAR_MARGIN
  const barX = panelX + panelPadding
  const barY = SPEED_BAR_TOP + panelPadding * 1.6 + fontSize
  context.save()
  context.lineWidth = 3
  context.strokeStyle = OUTLINE
  paintShape(context, "#ffffff", (path) => path.roundRect(panelX, SPEED_BAR_TOP, panelWidth, panelHeight, 14))
  context.font = `bold ${fontSize}px "Comic Sans MS", "Comic Sans", "Comic Neue", cursive`
  context.textAlign = "left"
  context.textBaseline = "top"
  context.fillStyle = OUTLINE
  context.fillText("SPEED", barX, SPEED_BAR_TOP + panelPadding * 0.8)
  const trackPath: BuildPath = (path) => path.roundRect(barX, barY, barWidth, barHeight, barHeight / 2)
  const fillColors = context.createLinearGradient(barX, 0, barX + barWidth, 0)
  fillColors.addColorStop(0, "#4cd964")
  fillColors.addColorStop(0.5, "#ffd23a")
  fillColors.addColorStop(1, "#ff3b30")
  paintShape(context, "#e6e1da", trackPath, {
    decorateInside: (trackContext) => {
      paintFill(trackContext, fillColors, (path) => path.rect(barX, barY, barWidth * gauge, barHeight))
      paintFill(trackContext, "rgba(255, 255, 255, 0.45)", (path) => path.rect(barX, barY + 3, barWidth * gauge, barHeight * 0.25))
    },
  })
  context.restore()
}

export const anywayButtonLayout = (width: number, height: number, citySeconds: number, anywaySeconds: number | null): BubbleButtonLayout => {
  if (citySeconds < BUBBLE_POP_END || anywaySeconds !== null) return null
  const { bubbleWidth, centerX, centerY } = anywayBubbleGeometry(width, height)
  return { centerX, centerY, width: bubbleWidth * 0.8, fontSize: Math.max(14, bubbleWidth * 0.14) }
}

export const drawCityScene = (
  context: Context,
  width: number,
  height: number,
  time: number,
  citySeconds: number,
  anywaySeconds: number | null,
  drive: DriveState | null,
) => {
  const actionSeconds = anywaySeconds ?? -1
  const { camera, carShift, distance, exhaust, wind, gauge } = driveView(width, height, drive)
  const isCityVisible = camera < width + 8
  const drawWithCamera = (draw: () => void) => {
    context.save()
    context.translate(-camera, 0)
    draw()
    context.restore()
  }
  const drawWithCar = (draw: () => void) => {
    context.save()
    context.translate(carShift, 0)
    draw()
    context.restore()
  }
  context.lineJoin = "round"
  context.lineCap = "round"
  context.strokeStyle = OUTLINE
  const light = eveningLight(drive?.progress ?? 0)
  drawScenerySky(context, width, height, height * BUILDINGS_BASE, camera)
  drawEveningSky(context, width, height, height * BUILDINGS_BASE, light)
  drawSettingSun(context, width, height, height * BUILDINGS_BASE, time, light)
  context.globalAlpha = 1 - light.night * 0.6
  drawClouds(context, width, height, time)
  context.globalAlpha = 1
  const arrivalSeconds = drive?.arrivalSeconds ?? null
  const kiraSeconds = drive?.kiraSeconds ?? null
  const club = drive
    ? clubPlacement(height, driveView(width, height, { progress: 1, speed: 0, kiraSeconds: null, arrivalSeconds: null }).camera - camera + width * CLUB_CENTER_X, height * CLUB_BASE, time)
    : null
  const isClubVisible = club !== null && clubLeftX(club) < width + 8
  const withCamera = (layer: Context, draw: () => void) => {
    layer.save()
    layer.translate(-camera, 0)
    draw()
    layer.restore()
  }
  const drawStreetBack = (layer: Context) => {
    drawSceneryBack(layer, width, height, height * BUILDINGS_BASE, height * BACK_WALK_BOTTOM, camera)
    if (isCityVisible) {
      withCamera(layer, () => {
        drawBuildings(layer, width, height)
        drawSidewalk(layer, width, height * BUILDINGS_BASE, height * BACK_WALK_BOTTOM, width * 0.06)
      })
    }
  }
  const drawStreetFront = (layer: Context) => {
    if (isCityVisible) withCamera(layer, () => drawTrees(layer, width, height))
    drawRoad(layer, width, height, camera)
    if (club && isClubVisible) drawRoadEnd(layer, width, height, clubLeftX(club) - 10 * club.unit)
    drawSceneryFront(layer, width, height, height * ROAD_BOTTOM, camera)
    if (isCityVisible) withCamera(layer, () => drawSidewalk(layer, width, height * ROAD_BOTTOM, height + 4, width * 0.1))
  }
  const isCameraStill = drive === null || drive.progress >= 1
  if (isCameraStill) paintCachedLayer(context, "city:back", `${width} ${height} ${camera}`, drawStreetBack)
  else drawStreetBack(context)
  if (isCityVisible) withCamera(context, () => drawWalkers(context, width, height, time))
  if (isCameraStill && !isClubVisible) paintCachedLayer(context, "city:front", `${width} ${height} ${camera}`, drawStreetFront)
  else drawStreetFront(context)
  if (club && isClubVisible) drawClubBuilding(context, club, time)
  drawNightShade(context, width, height, light)
  drawMoonAndStars(context, width, height, height * BUILDINGS_BASE, time, light)
  if (club && isClubVisible) {
    drawClubLights(context, club, time, arrivalSeconds === null ? 0 : Math.sin(Math.PI * stageProgress(arrivalSeconds, RADI_WALK_END - 0.3, RADI_ENTER_END + 0.3)))
  }
  const isRadiOut = arrivalSeconds !== null && arrivalSeconds >= RADI_EXIT_START
  const isKiraOut = arrivalSeconds !== null && arrivalSeconds >= KIRA_JUMP_START
  const drawRadiLayer = () => drawWithCar(() => drawCityRadi(context, width, height, time, actionSeconds, wind))
  const drawCarLayer = () => drawWithCar(() => drawCar(context, width, height, time, actionSeconds, distance, exhaust))
  const drawBenchLayer = () => {
    if (isCityVisible) drawWithCamera(() => drawBench(context, width, height))
  }
  if (flipProgress(actionSeconds) > 0.8) {
    const isRadiInFront = isRadiOut && arrivalSeconds >= (RADI_EXIT_START + RADI_EXIT_END) / 2
    if (isRadiOut && club && !isRadiInFront) drawArrivingRadi(context, width, height, time, arrivalSeconds, carShift, club)
    if (!isRadiOut) drawRadiLayer()
    if (!isKiraOut && kiraSeconds !== null) drawWithCar(() => drawTrunkKira(context, width, height, time, kiraSeconds, wind))
    drawCarLayer()
    drawBenchLayer()
    if (drive) drawWithCar(() => drawCarMusic(context, width, height, time, 1 - stageProgress(arrivalSeconds ?? 0, 0, RADI_EXIT_START)))
    if (kiraSeconds !== null) drawWithCar(() => drawKiraWoof(context, width, height, kiraSeconds))
    if (isRadiInFront && club) drawArrivingRadi(context, width, height, time, arrivalSeconds, carShift, club)
    if (isKiraOut) drawArrivingKira(context, width, height, time, arrivalSeconds, carShift)
  } else {
    drawCarLayer()
    drawBenchLayer()
    drawRadiLayer()
  }
  drawAnywayBubble(
    context,
    width,
    height,
    easeOutBack(stageProgress(citySeconds, BUBBLE_POP_START, BUBBLE_POP_END)) * (1 - easeOut(stageProgress(actionSeconds, 0, ANYWAY_BUBBLE_HIDE_END))),
  )
  drawCoolBubble(
    context,
    width,
    height,
    easeOutBack(stageProgress(actionSeconds, COOL_BUBBLE_START, COOL_BUBBLE_END)) * (1 - easeOut(stageProgress(actionSeconds, CAR_ENTER_END, COOL_BUBBLE_HIDE_END))),
  )
  drawWithCar(() => drawZhupkiBubble(
    context,
    width,
    height,
    easeOutBack(stageProgress(actionSeconds, ZHUPKI_BUBBLE_START, ZHUPKI_BUBBLE_END)) * (1 - easeOut(clampToUnit(distance / (width * ZHUPKI_HIDE_WIDTHS)))),
  ))
  if (drive && arrivalSeconds === null) drawSpeedBar(context, width, gauge)
  const { radiX, feetY, scale } = benchRadiPosition(width, height)
  const irisIn = easeOut(stageProgress(citySeconds, IRIS_IN_START, IRIS_IN_END)) ** 2
  if (irisIn < 1) paintIris(context, width, height, radiX, feetY - 60 * scale, mix(0, Math.hypot(width, height), irisIn))
  if (club && arrivalSeconds !== null && arrivalSeconds >= SCENE_IRIS_START) {
    const irisOut = stageProgress(arrivalSeconds, SCENE_IRIS_START, SCENE_IRIS_END) ** 2
    paintIris(context, width, height, clubDoorX(club), clubDoorCenterY(club), mix(Math.hypot(width, height), 0, irisOut))
  }
}
