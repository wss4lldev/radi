import { ellipsePath, linePath, paintFill, paintLine, paintShape, type BuildPath, type Context } from "@/characters/paint"
import { drawKiraSide, drawTreat, kiraSideMouthPoint, type KiraMotion } from "@/characters/kira"
import { drawRadi, type Point, type RadiExpression } from "@/characters/radi"
import { everydayRadiLook } from "@/characters/radiConcepts"

const OUTLINE = "#2b1d1a"
const WHITE = "#ffffff"

type Cloud = { x: number; y: number; size: number; speed: number; phase: number }
type Mountain = { x: number; peak: number; halfWidth: number; color: string }
type Building = { x: number; width: number; height: number }

const CLOUDS: Cloud[] = [
  { x: 0.14, y: 0.14, size: 1, speed: 0.22, phase: 0 },
  { x: 0.4, y: 0.08, size: 0.75, speed: 0.3, phase: 1.7 },
  { x: 0.64, y: 0.2, size: 0.9, speed: 0.18, phase: 3.1 },
  { x: 0.3, y: 0.3, size: 0.55, speed: 0.35, phase: 4.4 },
  { x: 0.9, y: 0.34, size: 0.65, speed: 0.26, phase: 2.3 },
]

const CLOUD_PUFFS = [
  [-1.3, 0.25, 0.55],
  [-0.6, -0.2, 0.75],
  [0.35, -0.35, 0.8],
  [1.15, 0.1, 0.6],
  [0.2, 0.3, 0.6],
  [-0.4, 0.35, 0.5],
] as const

const MOUNTAINS: Mountain[] = [
  { x: 0.08, peak: 0.36, halfWidth: 0.2, color: "#8fa5df" },
  { x: 0.33, peak: 0.28, halfWidth: 0.24, color: "#7d95d6" },
  { x: 0.7, peak: 0.34, halfWidth: 0.22, color: "#8fa5df" },
  { x: 0.93, peak: 0.3, halfWidth: 0.2, color: "#7d95d6" },
]

const BUILDINGS: Building[] = [
  { x: 0.46, width: 0.014, height: 0.05 },
  { x: 0.476, width: 0.01, height: 0.08 },
  { x: 0.488, width: 0.016, height: 0.04 },
  { x: 0.506, width: 0.012, height: 0.1 },
  { x: 0.52, width: 0.018, height: 0.06 },
  { x: 0.54, width: 0.01, height: 0.075 },
  { x: 0.552, width: 0.016, height: 0.045 },
  { x: 0.57, width: 0.012, height: 0.065 },
]

const FLOWERS = [
  [0.08, 0.86], [0.13, 0.79], [0.18, 0.93], [0.27, 0.82], [0.38, 0.9], [0.45, 0.96],
  [0.5, 0.85], [0.62, 0.94], [0.71, 0.84], [0.82, 0.9], [0.93, 0.86],
] as const

const FLOWER_COLORS = ["#ff7aa8", WHITE, "#ffd23f"]

const toPath2D = (buildPath: BuildPath) => {
  const path = new Path2D()
  buildPath(path)
  return path
}

const drawSky = (context: Context, width: number, height: number, horizonY: number) => {
  const gradient = context.createLinearGradient(0, 0, 0, horizonY)
  gradient.addColorStop(0, "#3fa9f5")
  gradient.addColorStop(1, "#bfe6ff")
  context.fillStyle = gradient
  context.fillRect(0, 0, width, height)
}

export const drawSun = (context: Context, width: number, height: number, time: number) => {
  const centerX = width * 0.84
  const centerY = height * 0.17
  const radius = Math.min(width, height) * 0.075
  const glow = context.createRadialGradient(centerX, centerY, radius, centerX, centerY, radius * 2.4)
  glow.addColorStop(0, "rgba(255, 236, 150, 0.6)")
  glow.addColorStop(1, "rgba(255, 236, 150, 0)")
  paintFill(context, glow, ellipsePath(centerX, centerY, radius * 2.4, radius * 2.4))
  const raysPath: BuildPath = (path) => {
    for (let ray = 0; ray < 12; ray += 1) {
      const angle = (ray * Math.PI) / 6 + time * 0.15
      const outerRadius = radius * (1.6 + Math.sin(time * 2 + ray) * 0.05)
      linePath(
        centerX + Math.cos(angle) * radius * 1.3,
        centerY + Math.sin(angle) * radius * 1.3,
        centerX + Math.cos(angle) * outerRadius,
        centerY + Math.sin(angle) * outerRadius,
      )(path)
    }
  }
  paintLine(context, OUTLINE, radius * 0.12 + 6, raysPath)
  paintLine(context, "#ffb703", radius * 0.12, raysPath)
  context.lineWidth = 4
  paintShape(context, "#ffd23f", ellipsePath(centerX, centerY, radius, radius))
  for (const side of [-1, 1]) {
    paintFill(context, OUTLINE, ellipsePath(centerX + side * radius * 0.32, centerY - radius * 0.1, radius * 0.07, radius * 0.11))
    paintFill(context, "rgba(255, 110, 140, 0.45)", ellipsePath(centerX + side * radius * 0.55, centerY + radius * 0.2, radius * 0.14, radius * 0.08))
  }
  paintLine(context, OUTLINE, radius * 0.07, (path) => path.arc(centerX, centerY + radius * 0.1, radius * 0.25, Math.PI * 0.15, Math.PI * 0.85))
}

const drawMountains = (context: Context, width: number, height: number, horizonY: number) => {
  const baseY = horizonY + height * 0.05
  context.lineWidth = 3
  for (const { x, peak, halfWidth, color } of MOUNTAINS) {
    const peakX = x * width
    const peakY = peak * height
    const half = halfWidth * width
    const tip = width * 0.025
    const slope = (baseY - peakY) / half
    const snowY = peakY + (baseY - peakY) * 0.28
    const capHalf = ((snowY - peakY) / slope) * 1.5
    paintShape(context, color, (path) => {
      path.moveTo(peakX - half, baseY)
      path.lineTo(peakX - tip, peakY + tip * slope)
      path.quadraticCurveTo(peakX, peakY, peakX + tip, peakY + tip * slope)
      path.lineTo(peakX + half, baseY)
      path.closePath()
    }, {
      decorateInside: (mountainContext) => paintFill(mountainContext, WHITE, (path) => {
        path.moveTo(peakX - capHalf, peakY - 20)
        path.lineTo(peakX + capHalf, peakY - 20)
        path.lineTo(peakX + capHalf, snowY)
        for (let tooth = 1; tooth <= 6; tooth += 1) {
          path.lineTo(peakX + capHalf - (tooth * capHalf) / 3, snowY + (tooth % 2 === 1 ? height * 0.015 : 0))
        }
        path.closePath()
      }),
    })
  }
}

const drawCity = (context: Context, width: number, height: number, horizonY: number) => {
  context.lineWidth = 1.5
  for (const building of BUILDINGS) {
    const left = building.x * width
    const top = horizonY - building.height * height
    const buildingWidth = building.width * width
    paintShape(context, "#b8c6ec", (path) => path.rect(left, top, buildingWidth, horizonY + height * 0.04 - top), {
      decorateInside: (buildingContext) => {
        buildingContext.fillStyle = "#fff3b0"
        for (let windowY = top + 4; windowY < horizonY - 3; windowY += 7) {
          for (let windowX = left + 3; windowX < left + buildingWidth - 3; windowX += 5) buildingContext.fillRect(windowX, windowY, 2, 3)
        }
      },
    })
  }
}

const drawHills = (context: Context, width: number, height: number, horizonY: number) => {
  context.lineWidth = 4
  paintShape(context, "#8ddc6e", (path) => {
    path.moveTo(0, horizonY + height * 0.02)
    path.quadraticCurveTo(width * 0.2, horizonY - height * 0.04, width * 0.45, horizonY + height * 0.01)
    path.quadraticCurveTo(width * 0.7, horizonY + height * 0.05, width, horizonY - height * 0.02)
    path.lineTo(width, height)
    path.lineTo(0, height)
    path.closePath()
  })
  paintShape(context, "#5cc45a", (path) => {
    path.moveTo(0, height * 0.76)
    path.quadraticCurveTo(width * 0.3, height * 0.68, width * 0.6, height * 0.75)
    path.quadraticCurveTo(width * 0.85, height * 0.8, width, height * 0.72)
    path.lineTo(width, height)
    path.lineTo(0, height)
    path.closePath()
  })
}

const drawFlowers = (context: Context, width: number, height: number) => {
  const petalRadius = Math.min(width, height) * 0.008
  context.lineWidth = 1.5
  FLOWERS.forEach(([x, y], index) => {
    const centerX = x * width
    const centerY = y * height
    for (const [offsetX, offsetY] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      paintShape(context, FLOWER_COLORS[index % FLOWER_COLORS.length], ellipsePath(centerX + offsetX * petalRadius, centerY + offsetY * petalRadius, petalRadius, petalRadius))
    }
    paintFill(context, "#ffb703", ellipsePath(centerX, centerY, petalRadius * 0.7, petalRadius * 0.7))
  })
}

export const drawCloud = (context: Context, centerX: number, centerY: number, unit: number) => {
  const cloudShape: BuildPath = (path) => {
    for (const [offsetX, offsetY, radius] of CLOUD_PUFFS) {
      path.moveTo(centerX + (offsetX + radius) * unit, centerY + offsetY * unit)
      path.ellipse(centerX + offsetX * unit, centerY + offsetY * unit, radius * unit, radius * unit, 0, 0, Math.PI * 2)
    }
  }
  paintLine(context, OUTLINE, 6, cloudShape)
  paintFill(context, WHITE, cloudShape)
  context.save()
  context.clip(toPath2D(cloudShape))
  paintFill(context, "#dcecff", ellipsePath(centerX, centerY + unit * 0.8, unit * 2.2, unit * 0.45))
  context.restore()
}

export const drawClouds = (context: Context, width: number, height: number, time: number) => {
  const baseUnit = Math.min(width, height) * 0.07
  for (const cloud of CLOUDS) {
    const driftX = Math.sin(time * cloud.speed + cloud.phase) * width * 0.03
    drawCloud(context, cloud.x * width + driftX, cloud.y * height, baseUnit * cloud.size)
  }
}

const drawBird = (context: Context, width: number, height: number, time: number) => {
  const size = Math.min(width, height) * 0.025
  const travel = width + size * 10
  const birdX = ((time * width * 0.06 + width * 0.3) % travel) - size * 5
  const birdY = height * 0.26 + Math.sin(time * 1.3) * height * 0.02
  const wingTipY = birdY + Math.sin(time * 9) * size * 0.5
  paintLine(context, OUTLINE, size * 0.28, (path) => {
    path.moveTo(birdX - size, wingTipY)
    path.quadraticCurveTo(birdX - size * 0.45, birdY - size * 0.45, birdX, birdY)
    path.quadraticCurveTo(birdX + size * 0.45, birdY - size * 0.45, birdX + size, wingTipY)
  })
}

export const paintComicBubble = (context: Context, bubbleParts: BuildPath[], outlineWidth: number, lines: readonly [string, string], centerX: number, centerY: number, fontSize: number) => {
  context.save()
  context.translate(outlineWidth * 1.2, outlineWidth * 1.2)
  for (const bubblePart of bubbleParts) paintFill(context, "rgba(0, 0, 0, 0.18)", bubblePart)
  context.restore()
  for (const bubblePart of bubbleParts) paintLine(context, OUTLINE, outlineWidth * 2, bubblePart)
  for (const bubblePart of bubbleParts) paintFill(context, WHITE, bubblePart)
  context.font = `${fontSize}px "Comic Sans MS", "Comic Sans", "Comic Neue", cursive`
  context.textAlign = "center"
  context.textBaseline = "middle"
  context.fillStyle = OUTLINE
  context.fillText(lines[0], centerX, centerY - fontSize * 0.6)
  context.fillText(lines[1], centerX, centerY + fontSize * 0.6)
}

const BUBBLE_FULL_SIZE_HEIGHT = 800

export const comicBubbleWidth = (width: number, height: number, widthShare: number, maxWidth: number) =>
  Math.min(width * widthShare, maxWidth * Math.min(1, height / BUBBLE_FULL_SIZE_HEIGHT))

const scrollHintGeometry = (width: number, height: number, time: number) => {
  const bubbleWidth = comicBubbleWidth(width, height, 0.72, 560)
  return {
    bubbleWidth,
    bubbleHeight: bubbleWidth * 0.42,
    centerX: width / 2,
    centerY: height * 0.38 + Math.sin(time * 1.6) * height * 0.008,
  }
}

export const startButtonLayout = (width: number, height: number, time: number): BubbleButtonLayout => {
  const { bubbleWidth, centerX, centerY } = scrollHintGeometry(width, height, time)
  return { centerX, centerY, width: bubbleWidth * 0.86, fontSize: Math.max(16, bubbleWidth * 0.055) }
}

const drawScrollHintBubble = (context: Context, width: number, height: number, time: number, opacity: number, scrollOpen: boolean) => {
  if (opacity <= 0) return
  const { bubbleWidth, bubbleHeight, centerX, centerY } = scrollHintGeometry(width, height, time)
  const outlineWidth = Math.max(4, bubbleWidth * 0.012)
  const lines: readonly [string, string] = scrollOpen ? ["Scroll down", "to meet me!"] : ["", ""]
  context.save()
  context.globalAlpha = opacity
  paintComicBubble(context, [ellipsePath(centerX, centerY, bubbleWidth / 2, bubbleHeight / 2)], outlineWidth, lines, centerX, centerY, bubbleWidth * 0.09)
  context.restore()
}

const WALK_END = 0.75
const TURN_END = 0.85
const GREETING_END = 0.93
export const WAVE_START = 0.95
const HOP_COUNT = 12
const RESTING_BOUNCE = { lift: 0, stretchY: 1 }
const MEETING_BUBBLE_SECONDS = 0.4
const KIRA_RUN_START = 0.6
const KIRA_RUN_END = 2.6
const KIRA_SIT_END = 3
const KIRA_STRIDES = 7
const LICK_START = 3.3
const BUBBLE_HIDE_END = 3.55
const LICK_CONTACT = 3.7
const LICK_SECONDS = 0.5
const LICK_END = LICK_CONTACT + LICK_SECONDS * 3
const REACH_BACK_END = LICK_END + 0.4
const TOSS_START = 5.9
const TOSS_WINDUP_END = 6.2
const TOSS_RELEASE = 6.4
const TOSS_HEIGHT = 110
const TOSS_HAND_LOW: Point = [17, -31]
const TOSS_HAND_HIGH: Point = [24, -60]
const KIRA_STAND_START = 6.5
const KIRA_STAND_END = 6.85
const JUMP_START = 7
const JUMP_END = 7.9
const CATCH_TIME = (JUMP_START + JUMP_END) / 2
const CHEW_SECONDS = 1 / 3
const EAT_END = JUMP_END + CHEW_SECONDS * 3
const KIRA_HOP_SECONDS = 0.45
const HAPPY_HOPS_START = EAT_END + 0.2
const HAPPY_HOPS_END = HAPPY_HOPS_START + KIRA_HOP_SECONDS * 6
const RUN_RIGHT_START = HAPPY_HOPS_END + 0.2
const RUN_RIGHT_END = RUN_RIGHT_START + 1.2
const RUN_RIGHT_STRIDES = 4
const SQUAT_START = RUN_RIGHT_END + 0.2
const SQUAT_END = SQUAT_START + 0.4
const POOP_DROP_START = SQUAT_END + 0.1
const POOP_DROP_END = POOP_DROP_START + 0.35
const POOP_STAND_START = POOP_DROP_END + 0.6
const POOP_STAND_END = POOP_STAND_START + 0.4
const POOP_BEHIND_UNITS = 46
const SURPRISE_START = POOP_DROP_START + 0.1
const ANGRY_START = POOP_DROP_END + 0.5
const ESCAPE_START = POOP_STAND_END + 0.1
const ESCAPE_END = ESCAPE_START + 1.7
const ESCAPE_STRIDES = 6
const CHASE_START = ESCAPE_START + 0.3
const CHASE_END = CHASE_START + 2.2
const CHASE_HOP_COUNT = 8
const IRIS_START = CHASE_END + 0.4
const IRIS_FOCUS_END = IRIS_START + 1.8
const IRIS_CLOSE_START = IRIS_FOCUS_END + 0.6
const IRIS_CLOSE_END = IRIS_CLOSE_START + 0.4
const HAPPY_HEARTS = [[-18, 110, 0.8], [0, 120, 1], [18, 110, 0.8]] as const

type BubbleText = { lines: readonly [string, string]; heightRatio: number; textRatio: number }
const GREETING_BUBBLE: BubbleText = { lines: ["Hello,", "I'm Radi!"], heightRatio: 1, textRatio: -0.18 }
const MEETING_BUBBLE: BubbleText = { lines: ["Give me", "a minute!"], heightRatio: 0.7, textRatio: 0 }

export const KIRA_SCENE_END = IRIS_CLOSE_END + 0.5

export type BubbleButtonLayout = { centerX: number; centerY: number; width: number; fontSize: number } | null

export const clampToUnit = (amount: number) => Math.min(1, Math.max(0, amount))
export const stageProgress = (progress: number, start: number, end: number) => clampToUnit((progress - start) / (end - start))
export const easeOut = (amount: number) => 1 - (1 - amount) ** 2
export const easeOutBack = (amount: number) => 1 + 2.7 * (amount - 1) ** 3 + 1.7 * (amount - 1) ** 2
export const mix = (from: number, to: number, amount: number) => from + (to - from) * amount

export const bounce = (phase: number) => {
  const arc = Math.sin(phase * Math.PI)
  const contact = Math.max(0, 1 - arc * 3)
  return {
    lift: 4 * phase * (1 - phase),
    stretchY: 1 + 0.12 * Math.abs(Math.cos(phase * Math.PI)) * (1 - contact) - 0.2 * contact,
  }
}

const isMoving = (stage: number) => stage > 0 && stage < 1

const gallopSteps = (seconds: number, start: number, end: number, strides: number) => easeOut(stageProgress(seconds, start, end)) * strides * 2

export const openingWalkSteps = (progress: number, meetingSeconds: number | null) => {
  if (meetingSeconds !== null) {
    const chase = stageProgress(meetingSeconds, CHASE_START, CHASE_END)
    if (chase <= 0) return null
    return chase * CHASE_HOP_COUNT
  }
  const walk = easeOut(stageProgress(progress, 0, WALK_END))
  if (walk <= 0) return null
  return walk * HOP_COUNT
}

export const kiraWalkSteps = (meetingSeconds: number | null) => {
  if (meetingSeconds === null || meetingSeconds <= KIRA_RUN_START) return null
  const happyHops = meetingSeconds < HAPPY_HOPS_START ? 0 : Math.min(6, (meetingSeconds - HAPPY_HOPS_START) / KIRA_HOP_SECONDS)
  return gallopSteps(meetingSeconds, KIRA_RUN_START, KIRA_RUN_END, KIRA_STRIDES) + happyHops + gallopSteps(meetingSeconds, RUN_RIGHT_START, RUN_RIGHT_END, RUN_RIGHT_STRIDES) + gallopSteps(meetingSeconds, ESCAPE_START, ESCAPE_END, ESCAPE_STRIDES)
}

const settle = (stage: number) => Math.min(1, stage * 6, (1 - stage) * 6)
const settledStretch = (stretchY: number, stage: number) => 1 + (stretchY - 1) * settle(stage)

export const radiScale = (width: number, height: number) => Math.min(height * 0.34, width * 0.75) / 125
const radiFeetY = (height: number) => height * 0.88

const greetingBubbleGeometry = (width: number, height: number, radiX: number, feetY: number, scale: number) => {
  const bubbleWidth = comicBubbleWidth(width, height, 0.38, 340)
  return {
    bubbleWidth,
    bubbleHeight: bubbleWidth * 0.7,
    centerX: Math.min(width - bubbleWidth / 2 - 12, radiX + 44 * scale + bubbleWidth / 2),
    centerY: feetY - 112 * scale,
  }
}

export const greetingButtonLayout = (width: number, height: number, progress: number): BubbleButtonLayout => {
  if (progress < WAVE_START) return null
  const { bubbleWidth, bubbleHeight, centerX, centerY } = greetingBubbleGeometry(width, height, width / 2, radiFeetY(height), radiScale(width, height))
  return { centerX, centerY: centerY + bubbleHeight * 0.2, width: bubbleWidth * 0.72, fontSize: Math.max(11, bubbleWidth * 0.065) }
}

const drawGreetingBubble = (context: Context, width: number, height: number, radiX: number, feetY: number, scale: number, popScale: number, { lines, heightRatio, textRatio }: BubbleText) => {
  if (popScale <= 0) return
  const geometry = greetingBubbleGeometry(width, height, radiX, feetY, scale)
  const { bubbleWidth, centerX, centerY } = geometry
  const bubbleHeight = geometry.bubbleHeight * heightRatio
  context.save()
  context.translate(centerX, centerY)
  context.scale(popScale, popScale)
  paintComicBubble(context, [
    ellipsePath(0, 0, bubbleWidth / 2, bubbleHeight / 2),
    (path) => {
      path.moveTo(-bubbleWidth * 0.3, bubbleHeight * 0.25)
      path.lineTo(-bubbleWidth * 0.52, bubbleHeight * 0.55)
      path.lineTo(-bubbleWidth * 0.15, bubbleHeight * 0.38)
      path.closePath()
    },
  ], Math.max(3, bubbleWidth * 0.012), lines, 0, bubbleHeight * textRatio, bubbleWidth * 0.12)
  context.restore()
}

type KiraPlacement = { kiraX: number; lift: number; pitch: number; facing: number; poopX: number; motion: Partial<KiraMotion> }

const gallopAt = (run: number, strideCount: number) => {
  const phase = easeOut(run) * strideCount * Math.PI * 2
  const amount = isMoving(run) ? settle(run) : 0
  return { amount, lift: Math.abs(Math.sin(phase)) * 5 * amount, pitch: Math.sin(phase + 1) * 0.06 * amount, legSwing: Math.sin(phase) * amount }
}

const placeKira = (width: number, radiX: number, scale: number, time: number, meetingSeconds: number): KiraPlacement => {
  const run = stageProgress(meetingSeconds, KIRA_RUN_START, KIRA_RUN_END)
  const runRight = stageProgress(meetingSeconds, RUN_RIGHT_START, RUN_RIGHT_END)
  const gallop = gallopAt(run, KIRA_STRIDES)
  const rightGallop = gallopAt(runRight, RUN_RIGHT_STRIDES)
  const escape = stageProgress(meetingSeconds, ESCAPE_START, ESCAPE_END)
  const escapeGallop = gallopAt(escape, ESCAPE_STRIDES)
  const reach = easeOut(stageProgress(meetingSeconds, LICK_START, LICK_CONTACT)) * (1 - easeOut(stageProgress(meetingSeconds, LICK_END, REACH_BACK_END)))
  const lickSeconds = meetingSeconds - LICK_CONTACT
  const lick = lickSeconds > 0 && meetingSeconds < LICK_END ? Math.sin((lickSeconds / LICK_SECONDS) * Math.PI) ** 2 : 0
  const jump = stageProgress(meetingSeconds, JUMP_START, JUMP_END)
  const jumpArc = Math.sin(jump * Math.PI)
  const chew = meetingSeconds > JUMP_END && meetingSeconds < EAT_END ? Math.sin(((meetingSeconds - JUMP_END) / CHEW_SECONDS) * Math.PI) ** 2 : 0
  const isHopping = meetingSeconds >= HAPPY_HOPS_START && meetingSeconds < HAPPY_HOPS_END
  const hop = ((meetingSeconds - HAPPY_HOPS_START) / KIRA_HOP_SECONDS) % 1
  const hopArc = isHopping ? 4 * hop * (1 - hop) : 0
  const hopSwing = isHopping ? Math.sin(hop * Math.PI * 2) : 0
  const squat = easeOut(stageProgress(meetingSeconds, SQUAT_START, SQUAT_END)) * (1 - easeOut(stageProgress(meetingSeconds, POOP_STAND_START, POOP_STAND_END)))
  const besideRadiX = mix(width + 60 * scale, radiX + 55 * scale, easeOut(run)) + (jumpArc * 10 - reach * 4) * scale
  const poopX = mix(besideRadiX, Math.min(radiX + 145 * scale, width - 45 * scale), easeOut(runRight))
  return {
    kiraX: mix(poopX, width + 100 * scale, escape ** 2),
    lift: gallop.lift + rightGallop.lift + escapeGallop.lift + 4 * jump * (1 - jump) * 40 + hopArc * 14,
    pitch: gallop.pitch + rightGallop.pitch + escapeGallop.pitch - jumpArc * 0.35 - hopSwing * 0.12,
    facing: meetingSeconds >= RUN_RIGHT_START ? 1 : -1,
    poopX,
    motion: {
      sit: easeOut(stageProgress(meetingSeconds, KIRA_RUN_END, KIRA_SIT_END)) * (1 - easeOut(stageProgress(meetingSeconds, KIRA_STAND_START, KIRA_STAND_END))) + squat * 0.55,
      legSwing: gallop.legSwing + rightGallop.legSwing + escapeGallop.legSwing + jumpArc * 0.8 + hopSwing * 0.6,
      tailWag: mix(Math.sin(time * 14) * (gallop.amount + rightGallop.amount + escapeGallop.amount > 0 ? 0.15 : 0.35), 0.5, squat),
      headReach: reach + jumpArc + chew * 0.25,
      lick,
      treatInMouth: meetingSeconds >= CATCH_TIME && meetingSeconds < EAT_END ? 1 - Math.floor(stageProgress(meetingSeconds, CATCH_TIME + 0.3, EAT_END) * 3) / 3 : 0,
    },
  }
}

const POOP_PARTS: BuildPath[] = [
  ellipsePath(0, -2.6, 6, 2.8),
  ellipsePath(0, -6, 4.5, 2.4),
  ellipsePath(0.4, -9, 3, 2),
  (path) => {
    path.moveTo(-0.6, -10.4)
    path.quadraticCurveTo(1.6, -11.6, 1.2, -13.4)
    path.quadraticCurveTo(3.4, -11, 1.8, -9.6)
    path.closePath()
  },
]

const drawPoop = (context: Context, centerX: number, groundY: number, size: number) => {
  if (size <= 0) return
  context.save()
  context.translate(centerX, groundY)
  context.scale(size, size)
  for (const poopPart of POOP_PARTS) paintLine(context, OUTLINE, 3.2, poopPart)
  for (const poopPart of POOP_PARTS) paintFill(context, "#7a4a26", poopPart)
  paintFill(context, "rgba(255, 255, 255, 0.35)", ellipsePath(-2, -6.6, 1.2, 0.6))
  context.restore()
}

const kiraMatrix = ({ kiraX, lift, pitch, facing }: KiraPlacement, feetY: number, scale: number) =>
  new DOMMatrix().translate(kiraX, feetY - lift * scale).scale(facing, 1).rotate((pitch * 180) / Math.PI)

const drawRunningKira = (context: Context, width: number, radiX: number, feetY: number, scale: number, time: number, meetingSeconds: number) => {
  if (meetingSeconds <= KIRA_RUN_START) return
  const placement = placeKira(width, radiX, scale, time, meetingSeconds)
  const matrix = kiraMatrix(placement, feetY, scale)
  const shadowSize = Math.max(0.4, 1 - placement.lift / 60)
  drawPoop(context, placement.poopX - POOP_BEHIND_UNITS * scale, feetY, scale * easeOutBack(stageProgress(meetingSeconds, POOP_DROP_START, POOP_DROP_END)))
  paintFill(context, "rgba(0, 0, 0, 0.15)", ellipsePath(placement.kiraX - placement.facing * 12 * scale, feetY, 36 * scale * shadowSize, 3 * scale))
  context.save()
  context.transform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f)
  drawKiraSide(context, 0, 0, scale, placement.motion)
  context.restore()
}

const drawTossedTreat = (context: Context, width: number, radiX: number, feetY: number, scale: number, time: number, meetingSeconds: number, hand: Point) => {
  if (meetingSeconds < TOSS_START || meetingSeconds >= CATCH_TIME) return
  const flight = stageProgress(meetingSeconds, TOSS_RELEASE, CATCH_TIME)
  if (flight <= 0) {
    drawTreat(context, radiX + hand[0] * scale, feetY + hand[1] * scale, scale * easeOutBack(stageProgress(meetingSeconds, TOSS_START, TOSS_START + 0.25)), 0.3)
    return
  }
  const catchPlacement = placeKira(width, radiX, scale, time, CATCH_TIME)
  const mouth = kiraSideMouthPoint(catchPlacement.motion)
  const target = kiraMatrix(catchPlacement, feetY, scale).transformPoint({ x: mouth.x * scale, y: mouth.y * scale })
  drawTreat(
    context,
    mix(radiX + TOSS_HAND_HIGH[0] * scale, target.x, flight),
    mix(feetY + TOSS_HAND_HIGH[1] * scale, target.y, flight) - 4 * flight * (1 - flight) * TOSS_HEIGHT * scale,
    scale,
    0.3 + flight * Math.PI * 4,
  )
}

export const mixPoint = (from: Point, to: Point, amount: number): Point => [mix(from[0], to[0], amount), mix(from[1], to[1], amount)]

export const heartPath = (size: number): BuildPath => (path) => {
  path.moveTo(0, size * 0.4)
  path.bezierCurveTo(-size * 0.6, 0, -size * 0.55, -size * 0.45, -size * 0.25, -size * 0.45)
  path.bezierCurveTo(-size * 0.08, -size * 0.45, 0, -size * 0.33, 0, -size * 0.22)
  path.bezierCurveTo(0, -size * 0.33, size * 0.08, -size * 0.45, size * 0.25, -size * 0.45)
  path.bezierCurveTo(size * 0.55, -size * 0.45, size * 0.6, 0, 0, size * 0.4)
  path.closePath()
}

const drawHappyHearts = (context: Context, radiX: number, feetY: number, scale: number, time: number, meetingSeconds: number) => {
  HAPPY_HEARTS.forEach(([offsetX, heightUnits, sizeRatio], index) => {
    const popIn = easeOutBack(clampToUnit((meetingSeconds - LICK_CONTACT - index * 0.2) / 0.35))
    const popOut = easeOut(stageProgress(meetingSeconds, TOSS_RELEASE + index * 0.1, TOSS_RELEASE + 0.3 + index * 0.1))
    const pop = popIn * (1 - popOut)
    if (pop <= 0) return
    const size = 16 * sizeRatio * scale * pop * (1 + Math.sin(time * 6 + index) * 0.06)
    context.save()
    context.translate(radiX + offsetX * scale, feetY - (heightUnits + Math.sin(time * 2.5 + index) * 2) * scale)
    context.rotate((index - 1) * 0.25)
    context.lineWidth = 1.6 * scale
    paintShape(context, "#ff4d6d", heartPath(size))
    paintFill(context, "rgba(255, 255, 255, 0.7)", ellipsePath(-size * 0.25, -size * 0.25, size * 0.09, size * 0.06))
    context.restore()
  })
}

const drawIrisOut = (context: Context, width: number, height: number, centerX: number, centerY: number, scale: number, meetingSeconds: number) => {
  if (meetingSeconds < IRIS_START) return
  const focus = 1 - (1 - stageProgress(meetingSeconds, IRIS_START, IRIS_FOCUS_END)) ** 3
  const close = stageProgress(meetingSeconds, IRIS_CLOSE_START, IRIS_CLOSE_END)
  paintIris(context, width, height, centerX, centerY, mix(Math.hypot(width, height), 16 * scale, focus) * (1 - close ** 2))
}

export const paintIris = (context: Context, width: number, height: number, centerX: number, centerY: number, radius: number) => {
  const darkness = new Path2D()
  darkness.rect(0, 0, width, height)
  if (radius > 0) darkness.arc(centerX, centerY, radius, 0, Math.PI * 2)
  context.fillStyle = "#000000"
  context.fill(darkness, "evenodd")
}

const radiExpression = (isMeeting: boolean, meetingSeconds: number): RadiExpression => {
  if (isMeeting && meetingSeconds >= ANGRY_START) return "angry"
  if (isMeeting && meetingSeconds >= SURPRISE_START) return "surprised"
  return everydayRadiLook.expression
}

const drawSkippingRadi = (context: Context, width: number, height: number, time: number, progress: number, meetingSeconds: number | null) => {
  const scale = radiScale(width, height)
  const feetY = radiFeetY(height)
  const isMeeting = meetingSeconds !== null
  const sceneSeconds = meetingSeconds ?? 0
  const standingX = width / 2
  const walk = easeOut(stageProgress(progress, 0, WALK_END))
  const turn = stageProgress(progress, WALK_END, TURN_END)
  const chase = isMeeting ? stageProgress(sceneSeconds, CHASE_START, CHASE_END) : 0
  const isChasing = chase > 0
  const stride = isChasing ? chase : walk
  const radiX = isChasing ? mix(standingX, width + 80 * scale, chase ** 2) : mix(-45 * scale, standingX, walk)

  const hopsDone = stride * (isChasing ? CHASE_HOP_COUNT : HOP_COUNT)
  const hopPhase = hopsDone - Math.floor(hopsDone)
  const leadSide = Math.floor(hopsDone) % 2 === 0 ? 1 : -1
  const walkBounce = isMoving(stride) ? bounce(hopPhase) : RESTING_BOUNCE
  const turnBounce = isMoving(turn) ? bounce(turn) : RESTING_BOUNCE
  const lift = walkBounce.lift * 18 + turnBounce.lift * 24
  const stretchY = settledStretch(walkBounce.stretchY, stride) * settledStretch(turnBounce.stretchY, turn)

  const knee = isMoving(stride) ? Math.sin(hopPhase * Math.PI) * 9 : 0
  const tuck = turnBounce.lift * 6
  const armPump = isMoving(stride) ? Math.sin(hopPhase * Math.PI) * leadSide : 0
  const cheer = turnBounce.lift * 14
  const meetingBubble = clampToUnit(sceneSeconds / MEETING_BUBBLE_SECONDS)
  const tossWeight = easeOut(stageProgress(sceneSeconds, TOSS_START, TOSS_WINDUP_END)) * (1 - easeOut(stageProgress(sceneSeconds, TOSS_RELEASE + 0.1, TOSS_RELEASE + 0.6)))
  const tossHand = mixPoint(TOSS_HAND_LOW, TOSS_HAND_HIGH, easeOut(stageProgress(sceneSeconds, TOSS_WINDUP_END, TOSS_RELEASE)))
  const raise = easeOut(stageProgress(progress, GREETING_END, WAVE_START)) * (1 - easeOut(meetingBubble))
  const isWaving = progress >= WAVE_START
  const waveSwing = isWaving ? Math.sin(time * 7) * 6 : 0
  const lean = isMoving(stride)
    ? (0.12 + Math.sin(hopPhase * Math.PI * 2) * 0.05) * settle(stride)
    : isWaving ? Math.sin(time * 3.5) * 0.04 * raise : 0
  const leftHand: Point = [-14 - Math.abs(armPump) * 3 - cheer * 0.5, -33 - armPump * 10 - cheer]
  const rightHand = mixPoint(
    [mix(14 + Math.abs(armPump) * 3 + cheer * 0.5, 27 + waveSwing, raise), mix(-33 + armPump * 10 - cheer, -57 + Math.abs(waveSwing) * 0.4, raise)],
    tossHand,
    tossWeight,
  )

  paintFill(context, "rgba(0, 0, 0, 0.15)", ellipsePath(radiX, feetY, 22 * scale * (1 - lift / 60), 3 * scale))
  context.save()
  context.translate(radiX, feetY - lift * scale)
  context.rotate(lean)
  context.scale(1 / stretchY, stretchY)
  drawRadi(context, { ...everydayRadiLook, expression: radiExpression(isMeeting, sceneSeconds) }, 0, 0, scale, {
    faceTurn: isChasing ? easeOut(clampToUnit(chase * 5)) : 1 - easeOut(turn),
    legLifts: leadSide === 1 ? [knee + tuck, knee * 0.2 + tuck] : [knee * 0.2 + tuck, knee + tuck],
    kneeBends: leadSide === 1 ? [knee * 0.5 + tuck * 0.8, knee * 0.1 + tuck * 0.8] : [knee * 0.1 + tuck * 0.8, knee * 0.5 + tuck * 0.8],
    elbowBends: [0, mix(0, -3 + waveSwing * 0.4, raise)],
    hands: [leftHand, rightHand],
  })
  context.restore()
  if (isMeeting) {
    drawRunningKira(context, width, standingX, feetY, scale, time, sceneSeconds)
    drawTossedTreat(context, width, standingX, feetY, scale, time, sceneSeconds, rightHand)
    drawHappyHearts(context, radiX, feetY, scale, time, sceneSeconds)
  }
  drawGreetingBubble(
    context,
    width,
    height,
    radiX,
    feetY,
    scale,
    isMeeting
      ? easeOutBack(meetingBubble) * (1 - easeOut(stageProgress(sceneSeconds, LICK_START, BUBBLE_HIDE_END)))
      : easeOutBack(stageProgress(progress, TURN_END, GREETING_END)),
    isMeeting ? MEETING_BUBBLE : GREETING_BUBBLE,
  )
  if (isMeeting) {
    const poopX = placeKira(width, standingX, scale, time, sceneSeconds).poopX - POOP_BEHIND_UNITS * scale
    drawIrisOut(context, width, height, poopX, feetY - 7 * scale, scale, sceneSeconds)
  }
}

export const drawOpeningScene = (context: Context, width: number, height: number, time: number, progress: number, meetingSeconds: number | null, scrollOpen: boolean) => {
  const horizonY = height * 0.6
  context.lineJoin = "round"
  context.lineCap = "round"
  context.strokeStyle = OUTLINE
  drawSky(context, width, height, horizonY)
  drawSun(context, width, height, time)
  drawMountains(context, width, height, horizonY)
  drawCity(context, width, height, horizonY)
  drawHills(context, width, height, horizonY)
  drawFlowers(context, width, height)
  drawClouds(context, width, height, time)
  drawBird(context, width, height, time)
  drawScrollHintBubble(context, width, height, time, scrollOpen ? 1 - stageProgress(progress, 0, 0.08) : 1, scrollOpen)
  drawSkippingRadi(context, width, height, time, progress, meetingSeconds)
}
