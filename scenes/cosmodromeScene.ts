import { ellipsePath, linePath, paintFill, paintLine, paintShape, type BuildPath, type Context } from "@/characters/paint"
import { drawKiraFront, drawKiraSide } from "@/characters/kira"
import { type PartyPose } from "@/characters/partyPerson"
import { drawRadi, drawStarSparkle, RAINBOW, type Point, type RadiExpression } from "@/characters/radi"
import { astronautRadiLook, sunnyRadiLook, unicornRadiLook } from "@/characters/radiConcepts"
import { drawShadesDudeFront } from "@/characters/shadesDude"
import { easeInOut, seededRandom } from "@/scenes/libraryScene"
import { bounce, clampToUnit, drawCloud, easeOut, easeOutBack, heartPath, mix, mixPoint, paintComicBubble, paintIris, radiScale, stageProgress, type BubbleButtonLayout } from "@/scenes/openingScene"

type Dish = { x: number; size: number; tilt: number; phase: number }
type Block = readonly [number, number, number]

const OUTLINE = "#2b1d1a"
const WHITE = "#ffffff"
const METAL = "#c9cfe0"
const DARK_METAL = "#8e94a3"
const LIT_WINDOW = "#ffe38a"
const DARK_WINDOW = "#7d84a8"
const IRIS_IN_END = 0.8
const SKIP_END = 4.2
const HOP_COUNT = 9
const TURN_END = SKIP_END + 0.45
const BUBBLE_POP_END = TURN_END + 0.35
const STAR_COUNT = 60
const BUBBLE_LINES = ["So much to do,", "so much to do!"] as const
const RESTING_BOUNCE = { lift: 0, stretchY: 1 }
const RESTING_HANDS: readonly [Point, Point] = [[-14, -33], [14, -33]]
const THINKING_HANDS: readonly [Point, Point] = [[14, -37], [11, -48]]
const THINKING_ELBOWS: readonly [number, number] = [0.3, -2.5]
const CLASPED_HANDS: readonly [Point, Point] = [[-4, -38], [4, -38]]
const RADI_BUBBLE_HIDE_START = 7.4
const RADI_BUBBLE_HIDE_END = 7.7
const DUDE_WALK_START = 7.2
const DUDE_WALK_END = 11
const DUDE_STEPS_PER_SECOND = 2.3
const DUDE_SIZE = 1.25
const DUDE_STOP_UNITS = 50
const CAKE_HANDS: readonly [Point, Point] = [[-16, -23], [16, -23]]
const NOTICE_START = 8.4
const NOTICE_END = 8.9
const KISS_START = 11.4
const KISS_CONTACT = 11.8
const KISS_LEAVE = 12.4
const KISS_END = 12.8
const HEART_SECONDS = 1.6
const KISS_HEARTS = [[-14, 30, 0.8], [0, 45, 1], [14, 34, 0.85], [-6, 55, 0.6], [9, 60, 0.65]] as const
export const WISH_START = 13
const WISH_POP_END = WISH_START + 0.35
const WISH_LINES = ["Happy birthday,", "Radi!"] as const
const WISH_CLOSE_SECONDS = 0.3
const KISS_LEAN = 0.14
const RADI_FEET = 0.88
const BLOW_START = 0.4
const BLOW_END = 1.5
const SNUFF_TIMES = [0.75, 0.95, 1.15] as const
const CANDLE_XS = [-5, 0, 5] as const
const CANDLE_COLORS = ["#4cc9f0", "#ffd23f", "#ff5d8f"] as const
const EXCITED_HOPS_START = 1.8
const EXCITED_HOPS = 2
const EXCITED_HOP_SECONDS = 0.32
export const SMOKE_START = 2.4
const SMOKE_FULL = 2.9
export const SUIT_AT = 3.1
const SMOKE_CLEAR = 3.4
const SMOKE_END = 4.1
const CHEER_END = 4.4
const SKIP_RIGHT_START = 4.8
const SKIP_RIGHT_END = 9
const SKIP_RIGHT_HOPS = 10
const PAN_START = 5
const PAN_END = 9.4
const PAN_WIDTHS = 0.8
const RADI_END_X = 0.33
const ROCKET_X = 0.7
const CHEER_HANDS: readonly [Point, Point] = [[-18, -68], [18, -68]]
const SMOKE_TINTS = [
  { shadow: "150, 160, 190", body: "226, 232, 245", light: "255, 255, 255" },
  { shadow: "140, 110, 190", body: "205, 180, 245", light: "240, 228, 255" },
  { shadow: "120, 170, 210", body: "190, 228, 255", light: "236, 248, 255" },
] as const
const TRANSFORM_PUFFS = Array.from({ length: 16 }, (_, index) => ({
  angle: (index / 16) * Math.PI * 2 + seededRandom(index, 91),
  reach: mix(8, 34, seededRandom(index, 92)),
  size: mix(20, 34, seededRandom(index, 93)),
  delay: seededRandom(index, 94) * 0.2,
}))
const LAUNCH_PUFFS = Array.from({ length: 18 }, (_, index) => ({
  side: index % 2 === 0 ? -1 : 1,
  offset: index / 18,
  spread: mix(55, 95, seededRandom(index, 101)),
  lift: mix(10, 26, seededRandom(index, 102)),
  size: mix(12, 20, seededRandom(index, 103)),
  isBehind: index % 3 === 0,
}))
const BURST_STARS = 12
const DOOR_HALF = 7
const DOOR_TOP = -46
const DOOR_BOTTOM = -22
const RAMP_FOOT_X = -64
const EXCLAIM_HOP_START = 9.2
const EXCLAIM_HOP_END = 9.6
const EXCLAIM_POP_END = 9.75
const EXCLAIM_HIDE_START = 11.2
const EXCLAIM_HIDE_END = 11.5
const EXCLAIM_LINES = ["Wow!", "A real rocket!"] as const
const WOW_HANDS: readonly [Point, Point] = [[-20, -60], [20, -60]]
const DOOR_OPEN_START = 10.2
const DOOR_OPEN_END = 10.8
const RAMP_OUT_START = 10.5
const RAMP_OUT_END = 11.2
const RAMP_WALK_START = 11.5
const RAMP_WALK_END = 12.7
const RAMP_WALK_HOPS = 3
const CLIMB_START = 12.7
const CLIMB_END = 14.1
const CLIMB_HOPS = 5
const ENTER_START = 14.1
const ENTER_END = 14.7
const KIRA_RUN_START = 13.6
const KIRA_RUN_END = 15
const KIRA_RUN_STRIDES = 6
const KIRA_CLIMB_END = 16.4
const KIRA_CLIMB_STRIDES = 3
const KIRA_ENTER_END = 16.8
export const KIRA_COSMO_WOOF = KIRA_RUN_START + 0.5
const DOOR_CLOSE_START = 17
const DOOR_CLOSE_END = 17.6
const CENTER_START = DOOR_CLOSE_START
const CENTER_END = CENTER_START + 1.5
export const IGNITION_START = CENTER_END + 0.4
export const LIFTOFF = IGNITION_START + 1.6
export const ENGINE_FADE_START = LIFTOFF + 6
export const ENGINE_FADE_END = LIFTOFF + 9
const ACCEL_SECONDS = 4
const DECEL_SHARE = 0.25
const FLIGHT_HEIGHTS = 16
export const DEFAULT_FLIGHT_SECONDS = 60
const END_IRIS_START = 44
const END_IRIS_HOLD = 0.6
const WINDOW_Y = -74
const WINDOW_RADIUS = 10
const WINDOW_KIRA_SIZE = 0.3
const END_IRIS_FOCUS = 1.8
const END_IRIS_CLOSE = 0.4
const WINDOW_KIRA_SLIDE = 0.7
const WINDOW_KIRA_START_X = -16
const ENDING_TEXT = "HAPPY BIRTHDAY!"
const ENDING_MAX_WIDTH = 0.92
const ENDING_FADE_IN = 0.4
const ENDING_ASSEMBLE_START = 2
const ENDING_LETTER_GAP = 0.09
const ENDING_FLIGHT = 0.6
const ENDING_DIM_COLOR = "#3d3a5c"
const ENDING_UNICORN_AT = ENDING_ASSEMBLE_START + (ENDING_TEXT.length - 1) * ENDING_LETTER_GAP + ENDING_FLIGHT + 0.2
export const ENDING_MENU_AT = LIFTOFF + END_IRIS_START + END_IRIS_FOCUS + END_IRIS_HOLD + END_IRIS_CLOSE + ENDING_UNICORN_AT
const ENDING_DANCE_BEATS_PER_SECOND = 2.2
const ENDING_SPARKLES = Array.from({ length: 7 }, (_, index) => [(index / 7) * Math.PI * 2, mix(48, 70, seededRandom(index, 191))] as const)
const CAMERA_LOCK = 0.05
const ZOOM_START = 1.5
const ZOOM_END = 4
const FLIGHT_ZOOM = 0.5
const ROCKET_MIDDLE = 66
const CLOUDS_FROM = 1.5
const CLOUDS_TO = 10
const CLOUD_BANK_COUNT = 30
const SPACE_FROM = 3
const SPACE_TO = 12
const EARTH_FROM = 10.5
const EARTH_RISE = 4
const SPACE_STARS = 90
const SUN_X = 0.12
const SUN_RAYS = 14
const LENS_FLARES = [
  [0.3, 0.45, "255, 200, 120", 0.16],
  [0.5, 0.22, "120, 200, 255", 0.2],
  [0.7, 0.9, "200, 140, 255", 0.08],
  [0.85, 0.35, "120, 255, 200", 0.14],
  [1.15, 0.6, "255, 150, 200", 0.1],
] as const
const SKY_STAGES: readonly (readonly [number, readonly string[]])[] = [
  [0, ["#23245e", "#563691", "#ae6890", "#ff9e7a"]],
  [1.5, ["#2b2d78", "#6b3d9e", "#d0609a", "#ffb36b"]],
  [3.5, ["#3a4fa8", "#9a5cc4", "#ff7eb6", "#ffd27a"]],
  [5.5, ["#1f5fae", "#3f8fd0", "#7fd1e8", "#ffe0a8"]],
  [7.5, ["#14306f", "#1f63a0", "#2fa4b8", "#7fe0c8"]],
  [9.5, ["#0e1140", "#2a1d6b", "#53308f", "#8e4fb0"]],
  [12, ["#03020c", "#090620", "#140c38", "#24124d"]],
]
const NEBULA_CLOUDS = [
  [0.18, 0.25, 0.32, "155, 93, 229"],
  [0.78, 0.18, 0.28, "255, 93, 143"],
  [0.62, 0.6, 0.34, "76, 201, 240"],
  [0.3, 0.7, 0.24, "255, 159, 28"],
] as const
type FlybyKind = "plane" | "starship" | "satellite" | "asteroids"
const FLYBYS: readonly { kind: FlybyKind; from: number; to: number; startX: number; endX: number; size: number; tilt: number }[] = [
  { kind: "plane", from: 1, to: 2.6, startX: 1.2, endX: -0.2, size: 1.6, tilt: 0.05 },
  { kind: "starship", from: 5.8, to: 7.2, startX: -0.3, endX: 1.3, size: 1.5, tilt: 0.08 },
  { kind: "satellite", from: 10.8, to: 12.6, startX: 1.15, endX: -0.15, size: 1.4, tilt: 0 },
  { kind: "asteroids", from: 8.2, to: 9.8, startX: 1.2, endX: -0.25, size: 1.5, tilt: 0 },
]
const ASTEROIDS = [[0, 0, 1.6, 0.6], [-34, 22, 1, -0.9], [28, -26, 0.8, 1.2], [-12, -38, 0.55, -1.5]] as const
const SUNRISE_GLOWS = [
  [0.12, 0.8, 0.7, 0.28, "255, 210, 120", 0.55, 0],
  [0.34, 0.86, 0.9, 0.22, "255, 150, 120", 0.4, 1.4],
  [0.05, 0.68, 0.45, 0.3, "255, 120, 170", 0.3, 2.6],
  [0.58, 0.9, 0.8, 0.18, "255, 190, 150", 0.3, 3.9],
  [0.22, 0.62, 0.55, 0.16, "255, 230, 170", 0.25, 5.1],
] as const
const AURORA_RIBBONS = [
  [0.22, 0.035, "61, 220, 151", 0],
  [0.3, 0.04, "76, 201, 240", 1.7],
  [0.16, 0.03, "155, 93, 229", 3.1],
] as const
const SPEED_LINES = 14
const LIFT_SMOKE_PUFFS = 18
const LIFT_SMOKE_REACH = 260
const LIFT_SMOKE_FADE_START = 3
const LIFT_SMOKE_FADE_END = 5
const FIRE_TINT = { shadow: "200, 90, 40", body: "255, 160, 80", light: "255, 232, 160" }
const CLOUD_BANKS = Array.from({ length: CLOUD_BANK_COUNT }, (_, index) => ({
  x: seededRandom(index, 111),
  altitude: mix(CLOUDS_FROM, CLOUDS_TO, index / CLOUD_BANK_COUNT + seededRandom(index, 112) * 0.03),
  size: mix(0.8, 1.7, seededRandom(index, 113)),
  isFront: index % 3 === 0,
}))
const EXPLOSION_PUFFS = Array.from({ length: 28 }, (_, index) => ({
  side: index % 2 === 0 ? -1 : 1,
  reach: mix(20, 230, seededRandom(index, 121)),
  lift: mix(4, 46, seededRandom(index, 122)),
  size: mix(20, 42, seededRandom(index, 123)),
  delay: seededRandom(index, 124) * 0.5,
}))
const FAR_BLOCKS: readonly Block[] = [
  [0, 0.05, 0.05], [0.04, 0.03, 0.08], [0.11, 0.06, 0.04], [0.19, 0.04, 0.07], [0.3, 0.05, 0.05], [0.37, 0.03, 0.09],
  [0.46, 0.07, 0.04], [0.52, 0.03, 0.07], [0.62, 0.06, 0.06], [0.69, 0.04, 0.1], [0.78, 0.05, 0.05], [0.86, 0.04, 0.08], [0.93, 0.07, 0.05],
]
const DISHES: Dish[] = [
  { x: 0.035, size: 1.3, tilt: -0.5, phase: 0 },
  { x: 0.665, size: 1, tilt: 0.45, phase: 1.3 },
  { x: 0.52, size: 0.6, tilt: -0.35, phase: 2.6 },
]

const isMoving = (stage: number) => stage > 0 && stage < 1
const settle = (stage: number) => Math.min(1, stage * 6, (1 - stage) * 6)
const settledStretch = (stretchY: number, stage: number) => 1 + (stretchY - 1) * settle(stage)
const easeOutSoft = (amount: number) => mix(amount, easeOut(amount), amount)
const skipProgress = (sceneSeconds: number) => easeOut(stageProgress(sceneSeconds, IRIS_IN_END * 0.5, SKIP_END))
const skipRightProgress = (wishSeconds: number | null) => (wishSeconds === null ? 0 : easeInOut(stageProgress(wishSeconds, SKIP_RIGHT_START, SKIP_RIGHT_END)))
const excitedHops = (wishSeconds: number | null) => (wishSeconds === null ? 0 : clampToUnit((wishSeconds - EXCITED_HOPS_START) / (EXCITED_HOP_SECONDS * EXCITED_HOPS)) * EXCITED_HOPS)
const cameraX = (width: number, wishSeconds: number | null) =>
  wishSeconds === null
    ? 0
    : width * (PAN_WIDTHS * easeInOut(stageProgress(wishSeconds, PAN_START, PAN_END)) + (ROCKET_X - 0.5) * easeInOut(stageProgress(wishSeconds, CENTER_START, CENTER_END)))
const radiWorldX = (width: number, scale: number, sceneSeconds: number, wishSeconds: number | null) =>
  mix(mix(-45 * scale, width / 2, skipProgress(sceneSeconds)), width * (PAN_WIDTHS + RADI_END_X), skipRightProgress(wishSeconds))

export const dudeWalkSteps = (sceneSeconds: number) =>
  sceneSeconds < DUDE_WALK_START ? null : (Math.min(sceneSeconds, DUDE_WALK_END) - DUDE_WALK_START) * DUDE_STEPS_PER_SECOND

const boardingStages = (wishSeconds: number | null) => {
  const wish = wishSeconds ?? -1
  return {
    exclaimHop: stageProgress(wish, EXCLAIM_HOP_START, EXCLAIM_HOP_END),
    toRamp: easeInOut(stageProgress(wish, RAMP_WALK_START, RAMP_WALK_END)),
    climb: stageProgress(wish, CLIMB_START, CLIMB_END),
    enter: stageProgress(wish, ENTER_START, ENTER_END),
  }
}

export const cosmodromeWalkSteps = (sceneSeconds: number, wishSeconds: number | null) => {
  const skip = skipProgress(sceneSeconds)
  if (skip <= 0) return null
  const { exclaimHop, toRamp, climb } = boardingStages(wishSeconds)
  return skip * HOP_COUNT + excitedHops(wishSeconds) + skipRightProgress(wishSeconds) * SKIP_RIGHT_HOPS + exclaimHop + toRamp * RAMP_WALK_HOPS + climb * CLIMB_HOPS
}

const mixColor = (from: string, to: string, amount: number) => {
  const channel = (hex: string, index: number) => parseInt(hex.slice(1 + index * 2, 3 + index * 2), 16)
  const mixed = [0, 1, 2].map((index) => Math.round(mix(channel(from, index), channel(to, index), amount)))
  return `rgb(${mixed.join(", ")})`
}

const skyColorsAt = (altitude: number) => {
  const nextIndex = SKY_STAGES.findIndex(([stageAltitude]) => stageAltitude > altitude)
  if (nextIndex === -1) return SKY_STAGES[SKY_STAGES.length - 1][1]
  if (nextIndex === 0) return SKY_STAGES[0][1]
  const [fromAltitude, fromColors] = SKY_STAGES[nextIndex - 1]
  const [toAltitude, toColors] = SKY_STAGES[nextIndex]
  const blend = easeInOut((altitude - fromAltitude) / (toAltitude - fromAltitude))
  return fromColors.map((color, index) => mixColor(color, toColors[index], blend))
}

const daylightAt = (altitude: number) => easeInOut(clampToUnit((altitude - 2.5) / 2)) * (1 - easeInOut(clampToUnit((altitude - 7) / 2.5)))

const drawSky = (context: Context, width: number, height: number, horizonY: number, time: number, altitude: number, space: number, camY: number) => {
  const [top, middle, low, horizon] = skyColorsAt(altitude)
  const gradient = context.createLinearGradient(0, 0, 0, Math.max(horizonY, Math.min(height, horizonY + camY)))
  gradient.addColorStop(0, top)
  gradient.addColorStop(0.4, middle)
  gradient.addColorStop(0.75, low)
  gradient.addColorStop(1, horizon)
  context.fillStyle = gradient
  context.fillRect(0, 0, width, height)
  const nightness = 1 - daylightAt(altitude)
  const starSize = Math.min(width, height) * 0.004
  for (let star = 0; star < STAR_COUNT; star += 1) {
    const twinkle = 0.5 + 0.5 * Math.sin(time * (1.5 + seededRandom(star, 3) * 2) + star)
    context.globalAlpha = (0.35 + twinkle * 0.65) * nightness
    const starX = seededRandom(star, 1) * width
    const starY = seededRandom(star, 2) ** 1.6 * horizonY * 0.7
    paintFill(context, WHITE, ellipsePath(starX, starY, starSize * (0.6 + twinkle * 0.5), starSize * (0.6 + twinkle * 0.5)))
  }
  for (let star = 0; star < SPACE_STARS * space; star += 1) {
    const twinkle = 0.5 + 0.5 * Math.sin(time * (1.2 + seededRandom(star, 6) * 2) + star)
    context.globalAlpha = space * (0.4 + twinkle * 0.6)
    const starX = seededRandom(star, 4) * width
    const starY = (seededRandom(star, 5) * height + camY * 0.03) % height
    const size = starSize * (0.5 + seededRandom(star, 7) * 0.9)
    paintFill(context, star % 7 === 0 ? "#ffe9a8" : WHITE, ellipsePath(starX, starY, size, size))
  }
  context.globalAlpha = 1
}

const drawNebula = (context: Context, width: number, height: number, space: number, time: number) => {
  if (space <= 0) return
  for (const [x, y, size, color] of NEBULA_CLOUDS) {
    const centerX = (x + Math.sin(time * 0.05 + x * 9) * 0.02) * width
    const centerY = y * height
    const radius = size * Math.max(width, height)
    const glow = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
    glow.addColorStop(0, `rgba(${color}, ${0.32 * space})`)
    glow.addColorStop(0.5, `rgba(${color}, ${0.12 * space})`)
    glow.addColorStop(1, `rgba(${color}, 0)`)
    paintFill(context, glow, ellipsePath(centerX, centerY, radius, radius * 0.7))
  }
}

const drawShootingStars = (context: Context, width: number, height: number, space: number, time: number) => {
  if (space < 0.6) return
  for (let streak = 0; streak < 3; streak += 1) {
    const cycle = time / 4.5 + streak / 3
    const life = cycle % 1
    if (life > 0.18) continue
    const seed = Math.floor(cycle)
    const run = life / 0.18
    const startX = seededRandom(seed, 141 + streak) * width
    const startY = seededRandom(seed, 151 + streak) * height * 0.5
    const headX = startX + run * width * 0.25
    const headY = startY + run * height * 0.12
    const fade = Math.sin(run * Math.PI) * space
    paintLine(context, `rgba(255, 255, 255, ${0.8 * fade})`, 2, linePath(headX - width * 0.06, headY - height * 0.03, headX, headY))
    paintFill(context, `rgba(255, 255, 255, ${fade})`, ellipsePath(headX, headY, 2.5, 2.5))
  }
}

const drawSunrise = (context: Context, width: number, height: number, altitude: number, time: number) => {
  const daylight = daylightAt(altitude)
  if (daylight <= 0) return
  const lift = easeOut(clampToUnit((altitude - 2.5) / 6))
  const band = context.createLinearGradient(0, height, 0, height * 0.35)
  band.addColorStop(0, `rgba(255, 196, 120, ${0.45 * daylight})`)
  band.addColorStop(0.5, `rgba(255, 140, 150, ${0.2 * daylight})`)
  band.addColorStop(1, "rgba(255, 140, 150, 0)")
  context.fillStyle = band
  context.fillRect(0, 0, width, height)
  for (const [x, y, stretchX, stretchY, color, strength, drift] of SUNRISE_GLOWS) {
    const centerX = (x + Math.sin(time * 0.07 + drift) * 0.03) * width
    const centerY = height * (y + (1 - lift) * 0.25)
    const radius = Math.min(width, height) * stretchY
    context.save()
    context.translate(centerX, centerY)
    context.scale(stretchX / stretchY, 1)
    context.rotate(Math.sin(time * 0.05 + drift) * 0.15)
    const glow = context.createRadialGradient(0, 0, 0, 0, 0, radius)
    glow.addColorStop(0, `rgba(${color}, ${strength * daylight})`)
    glow.addColorStop(0.55, `rgba(${color}, ${strength * 0.35 * daylight})`)
    glow.addColorStop(1, `rgba(${color}, 0)`)
    paintFill(context, glow, ellipsePath(0, 0, radius, radius))
    context.restore()
  }
}

const drawAurora = (context: Context, width: number, height: number, altitude: number, time: number) => {
  const strength = easeInOut(clampToUnit((altitude - 6) / 1.5)) * (1 - easeInOut(clampToUnit((altitude - 10.5) / 2)))
  if (strength <= 0) return
  AURORA_RIBBONS.forEach(([baseY, amplitude, color, phase], index) => {
    paintLine(context, `rgba(${color}, ${0.3 * strength})`, height * 0.05, (path) => {
      for (let step = 0; step <= 24; step += 1) {
        const x = (step / 24) * width
        const y = height * (baseY + Math.sin(step * 0.55 + time * 0.6 + phase) * amplitude + Math.sin(step * 0.2 + time * 0.25 + index) * amplitude * 0.6)
        if (step === 0) path.moveTo(x, y)
        else path.lineTo(x, y)
      }
    })
  })
}

const drawSunBehindEarth = (context: Context, sunX: number, sunY: number, sunRadius: number, width: number, time: number, rise: number) => {
  const glow = context.createRadialGradient(sunX, sunY, sunRadius * 0.5, sunX, sunY, sunRadius * 7)
  glow.addColorStop(0, `rgba(255, 244, 214, ${0.85 * rise})`)
  glow.addColorStop(0.25, `rgba(255, 190, 110, ${0.35 * rise})`)
  glow.addColorStop(1, "rgba(255, 160, 90, 0)")
  paintFill(context, glow, ellipsePath(sunX, sunY, sunRadius * 7, sunRadius * 7))
  for (let ray = 0; ray < SUN_RAYS; ray += 1) {
    const angle = (ray / SUN_RAYS) * Math.PI * 2 + time * 0.05
    const length = sunRadius * (3.5 + 1.8 * Math.sin(time * 1.3 + ray * 2.1))
    const spread = 0.05
    paintFill(context, `rgba(255, 240, 200, ${0.16 * rise})`, (path) => {
      path.moveTo(sunX + Math.cos(angle - spread) * sunRadius, sunY + Math.sin(angle - spread) * sunRadius)
      path.lineTo(sunX + Math.cos(angle) * length, sunY + Math.sin(angle) * length)
      path.lineTo(sunX + Math.cos(angle + spread) * sunRadius, sunY + Math.sin(angle + spread) * sunRadius)
      path.closePath()
    })
  }
  const streak = context.createLinearGradient(sunX - width * 0.4, 0, sunX + width * 0.4, 0)
  streak.addColorStop(0, "rgba(255, 255, 255, 0)")
  streak.addColorStop(0.5, `rgba(255, 255, 255, ${0.6 * rise})`)
  streak.addColorStop(1, "rgba(255, 255, 255, 0)")
  paintFill(context, streak, ellipsePath(sunX, sunY, width * 0.4, sunRadius * 0.12))
  const disk = context.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius)
  disk.addColorStop(0, `rgba(255, 255, 255, ${rise})`)
  disk.addColorStop(0.6, `rgba(255, 246, 200, ${rise})`)
  disk.addColorStop(1, `rgba(255, 210, 63, ${rise})`)
  paintFill(context, disk, ellipsePath(sunX, sunY, sunRadius, sunRadius))
}

const drawSunlitRim = (context: Context, centerX: number, centerY: number, radius: number, sunX: number, sunY: number, width: number, height: number, rise: number) => {
  const light = context.createRadialGradient(sunX, sunY, 0, sunX, sunY, width * 0.55)
  light.addColorStop(0, `rgba(255, 246, 220, ${rise})`)
  light.addColorStop(0.4, `rgba(255, 200, 120, ${0.55 * rise})`)
  light.addColorStop(1, "rgba(255, 200, 120, 0)")
  context.save()
  context.strokeStyle = light
  context.lineWidth = height * 0.014
  context.beginPath()
  context.arc(centerX, centerY, radius + height * 0.004, 0, Math.PI * 2)
  context.stroke()
  context.restore()
}

const drawLensFlare = (context: Context, sunX: number, sunY: number, sunRadius: number, width: number, height: number, time: number, rise: number) => {
  for (const [along, size, color, strength] of LENS_FLARES) {
    const flareX = mix(sunX, width / 2, along)
    const flareY = mix(sunY, height / 2, along)
    const flicker = 0.85 + 0.15 * Math.sin(time * 2 + along * 7)
    paintFill(context, `rgba(${color}, ${strength * rise * flicker})`, ellipsePath(flareX, flareY, sunRadius * size, sunRadius * size))
  }
}

const drawEarth = (context: Context, width: number, height: number, altitude: number, time: number) => {
  const rise = easeOut(clampToUnit((altitude - EARTH_FROM) / EARTH_RISE))
  if (rise <= 0) return
  const radius = width * 1.1
  const centerX = width / 2
  const centerY = height + radius - height * 0.3 * rise
  const sunRadius = Math.min(width, height) * 0.07
  const sunX = width * SUN_X
  const sunY = centerY - Math.sqrt(radius ** 2 - (sunX - centerX) ** 2) + sunRadius * 0.1
  drawSunBehindEarth(context, sunX, sunY, sunRadius, width, time, rise)
  paintLine(context, "rgba(120, 190, 255, 0.35)", height * 0.05, ellipsePath(centerX, centerY, radius + height * 0.02, radius + height * 0.02))
  context.lineWidth = 4
  paintShape(context, "#2f7fd8", ellipsePath(centerX, centerY, radius, radius), {
    decorateInside: (earthContext) => {
      const top = centerY - radius
      for (const [landX, landY, landWidth, landHeight] of [[0.15, 0.04, 0.16, 0.05], [0.48, 0.02, 0.22, 0.06], [0.82, 0.05, 0.14, 0.04], [0.32, 0.12, 0.12, 0.05]] as const) {
        paintFill(earthContext, "#4fb35a", ellipsePath(width * landX, top + height * landY, width * landWidth, height * landHeight))
      }
      for (const [cloudX, cloudY, cloudWidth] of [[0.25, 0.03, 0.1], [0.6, 0.07, 0.14], [0.9, 0.02, 0.08]] as const) {
        paintFill(earthContext, "rgba(255, 255, 255, 0.75)", ellipsePath(width * cloudX, top + height * cloudY, width * cloudWidth, height * 0.012))
      }
      paintFill(earthContext, "rgba(255, 255, 255, 0.18)", ellipsePath(centerX, top + height * 0.01, radius * 0.9, height * 0.02))
    },
  })
  drawSunlitRim(context, centerX, centerY, radius, sunX, sunY, width, height, rise)
  drawLensFlare(context, sunX, sunY, sunRadius, width, height, time, rise)
}

const drawPlane = (context: Context, time: number) => {
  const isOn = Math.sin(time * 6) > 0.3
  paintShape(context, "#b9c1d6", (path) => {
    path.moveTo(-2, 2)
    path.lineTo(8, 2)
    path.lineTo(26, -12)
    path.lineTo(21, -12)
    path.closePath()
  })
  paintShape(context, "#b9c1d6", (path) => {
    path.moveTo(38, -1)
    path.lineTo(44, -1)
    path.lineTo(50, -6)
    path.lineTo(47, -6)
    path.closePath()
  })
  paintShape(context, "#e63946", (path) => {
    path.moveTo(36, -3)
    path.lineTo(46, -3)
    path.lineTo(52, -19)
    path.lineTo(46, -19)
    path.closePath()
  })
  paintShape(context, WHITE, (path) => {
    path.moveTo(-38, 1)
    path.quadraticCurveTo(-38, -4, -30, -4.5)
    path.lineTo(40, -4.5)
    path.quadraticCurveTo(50, -4, 52, -1.5)
    path.lineTo(44, 3.5)
    path.lineTo(-30, 4.5)
    path.quadraticCurveTo(-37, 4.5, -38, 1)
    path.closePath()
  }, {
    decorateInside: (bodyContext) => {
      paintFill(bodyContext, "#2f6fd6", (path) => path.rect(-40, 1.2, 95, 1.4))
      paintFill(bodyContext, "rgba(40, 60, 100, 0.12)", (path) => path.rect(-40, 2.6, 95, 4))
      for (let windowX = -22; windowX <= 36; windowX += 3.2) paintFill(bodyContext, "#2b4a7a", (path) => path.roundRect(windowX, -2.2, 1.6, 1.8, 0.6))
      paintFill(bodyContext, "#2b4a7a", (path) => {
        path.moveTo(-35, -1.2)
        path.lineTo(-30.5, -2.6)
        path.lineTo(-27.5, -2.6)
        path.lineTo(-27.5, -0.8)
        path.closePath()
      })
    },
  })
  paintShape(context, "#c9cfe0", (path) => {
    path.moveTo(-4, 1)
    path.lineTo(7, 1)
    path.lineTo(24, 11)
    path.lineTo(19, 11)
    path.closePath()
  })
  paintShape(context, "#8e94a3", (path) => path.roundRect(4, 4, 9, 3.6, 1.8))
  paintFill(context, OUTLINE, ellipsePath(4.2, 5.8, 0.9, 1.5))
  paintFill(context, isOn ? "#3ddc97" : "#1f6b4a", ellipsePath(24, 11, 1.2, 1.2))
  paintFill(context, isOn ? "#ff2d2d" : "#7a1f1f", ellipsePath(52, -19, 1.2, 1.2))
  if (!isOn) return
  paintFill(context, "rgba(255, 255, 255, 0.9)", ellipsePath(26, -12, 1, 1))
}

const HULL = "#eef1f8"
const HULL_SHADE = "#c9cfe0"
const HULL_DARK = "#9aa3b8"
const NACELLES = [
  { y: -21, color: HULL_SHADE, isFar: true },
  { y: -16, color: HULL, isFar: false },
] as const

const drawNacelle = (context: Context, y: number, color: string, glow: number, isFar: boolean) => {
  paintShape(context, color, (path) => path.roundRect(-74, y - 3.6, 50, 7.2, 3.6), {
    decorateInside: (nacelleContext) => {
      paintFill(nacelleContext, `rgba(76, 201, 240, ${glow * (isFar ? 0.55 : 0.9)})`, (path) => path.roundRect(-68, y - 1, 38, 2.4, 1.2))
      paintFill(nacelleContext, "rgba(43, 29, 26, 0.12)", (path) => path.rect(-74, y + 1.8, 50, 2))
    },
  })
  paintFill(context, `rgba(255, 90, 60, ${0.35 * glow})`, ellipsePath(-24, y, 7, 6))
  paintShape(context, isFar ? "#d9503f" : "#ff5d3f", ellipsePath(-24, y, 3.8, 3.6), {
    decorateInside: (capContext) => paintFill(capContext, `rgba(255, 220, 160, ${glow})`, ellipsePath(-23, y - 1, 1.8, 1.5)),
  })
}

const drawStarship = (context: Context, time: number) => {
  const glow = 0.7 + 0.3 * Math.sin(time * 8)
  for (const { y } of NACELLES) {
    for (let streak = 0; streak < 3; streak += 1) {
      const streakY = y - 2.4 + streak * 2.4
      paintLine(context, `rgba(150, 220, 255, ${0.55 - streak * 0.12})`, 1.4, linePath(-78 - streak * 6, streakY, -130 - streak * 14, streakY))
    }
  }
  paintShape(context, HULL_SHADE, (path) => {
    path.moveTo(-34, 6)
    path.lineTo(-29, 6)
    path.lineTo(-38, -14)
    path.lineTo(-43, -14)
    path.closePath()
  })
  drawNacelle(context, NACELLES[0].y, NACELLES[0].color, glow, NACELLES[0].isFar)
  paintShape(context, HULL, (path) => {
    path.moveTo(-26, 6)
    path.lineTo(-20, 6)
    path.lineTo(-30, -13)
    path.lineTo(-36, -13)
    path.closePath()
  })
  drawNacelle(context, NACELLES[1].y, NACELLES[1].color, glow, NACELLES[1].isFar)
  paintShape(context, HULL, (path) => {
    path.moveTo(-2, -4)
    path.lineTo(9, -4)
    path.lineTo(-1, 8)
    path.lineTo(-11, 8)
    path.closePath()
  })
  paintShape(context, HULL, (path) => {
    path.moveTo(-44, 5)
    path.lineTo(-2, 5)
    path.quadraticCurveTo(7, 5, 8, 11.5)
    path.quadraticCurveTo(7, 18, -2, 18)
    path.lineTo(-40, 18)
    path.quadraticCurveTo(-46, 17, -46, 11.5)
    path.quadraticCurveTo(-46, 5, -44, 5)
    path.closePath()
  }, {
    decorateInside: (hullContext) => {
      paintFill(hullContext, HULL_SHADE, (path) => path.rect(-46, 13.5, 56, 5))
      for (let port = 0; port < 6; port += 1) paintFill(hullContext, "#ffe38a", ellipsePath(-36 + port * 6, 9.5, 1, 1))
    },
  })
  paintFill(context, `rgba(255, 170, 60, ${0.4 * glow})`, ellipsePath(7, 11.5, 6, 6))
  paintShape(context, "#ff9f1c", ellipsePath(7, 11.5, 3.4, 3.4), {
    decorateInside: (dishContext) => paintFill(dishContext, `rgba(255, 240, 190, ${glow})`, ellipsePath(7.6, 10.8, 1.6, 1.6)),
  })
  paintShape(context, HULL_SHADE, (path) => path.ellipse(18, -4, 30, 6.5, 0, 0, Math.PI))
  paintShape(context, HULL, ellipsePath(18, -6.5, 30, 6.2), {
    decorateInside: (saucerContext) => {
      paintFill(saucerContext, HULL_SHADE, ellipsePath(18, -8.5, 17, 2.8))
      for (let port = 0; port < 9; port += 1) paintFill(saucerContext, "#ffe38a", ellipsePath(-3 + port * 5.2, -3.6, 0.9, 0.9))
    },
  })
  paintShape(context, HULL, (path) => path.ellipse(18, -11, 8, 4.2, 0, Math.PI, Math.PI * 2))
  paintShape(context, HULL_DARK, (path) => path.ellipse(18, -14.6, 3, 1.6, 0, Math.PI, Math.PI * 2))
  paintFill(context, `rgba(120, 210, 255, ${glow})`, (path) => path.roundRect(21, -13.4, 3.4, 1.4, 0.7))
}

const drawSatellite = (context: Context, time: number) => {
  context.rotate(time * 0.25)
  paintLine(context, OUTLINE, 1.6, linePath(-24, 0, 24, 0))
  for (const side of [-1, 1]) {
    paintShape(context, "#2f5fb3", (path) => path.rect(side === -1 ? -40 : 12, -6, 28, 12), {
      decorateInside: (panelContext) => {
        for (let gridX = -40; gridX <= 40; gridX += 5) paintLine(panelContext, "#6fa3ff", 0.6, linePath(gridX, -6, gridX, 6))
        paintLine(panelContext, "#6fa3ff", 0.6, linePath(-40, 0, 40, 0))
      },
    })
  }
  paintShape(context, "#e9b949", (path) => path.roundRect(-7, -7, 14, 14, 2), {
    decorateInside: (bodyContext) => {
      for (let foil = -6; foil <= 6; foil += 3) paintLine(bodyContext, "#c98f1c", 0.6, linePath(-7, foil, 7, foil + 2))
    },
  })
  paintLine(context, OUTLINE, 1, linePath(0, 7, 0, 13))
  paintShape(context, WHITE, (path) => path.ellipse(0, 15, 6, 2.6, 0, 0, Math.PI))
  paintLine(context, OUTLINE, 1, linePath(0, -7, 2, -15))
  paintFill(context, "#e63946", ellipsePath(2, -15.5, 1.3, 1.3))
}

const asteroidPath = (seed: number): BuildPath => (path) => {
  for (let point = 0; point < 10; point += 1) {
    const angle = (point / 10) * Math.PI * 2
    const radius = 10 * mix(0.75, 1.15, seededRandom(point, seed))
    if (point === 0) path.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius)
    else path.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius)
  }
  path.closePath()
}

const drawAsteroids = (context: Context, time: number) => {
  ASTEROIDS.forEach(([offsetX, offsetY, size, spin], index) => {
    context.save()
    context.translate(offsetX, offsetY)
    context.rotate(time * spin)
    context.scale(size, size)
    context.lineWidth /= size
    paintShape(context, index % 2 === 0 ? "#8a7f78" : "#a0928a", asteroidPath(181 + index), {
      shade: "rgba(40, 20, 20, 0.25)",
      decorateInside: (rockContext) => {
        for (const [craterX, craterY, craterSize] of [[-3, -2, 2.4], [3.5, 2.5, 1.8], [1, -5, 1.3]] as const) paintFill(rockContext, "rgba(60, 40, 35, 0.35)", ellipsePath(craterX, craterY, craterSize, craterSize * 0.8))
      },
    })
    context.restore()
  })
}

const FLYBY_DRAWINGS: Record<FlybyKind, (context: Context, time: number) => void> = {
  plane: drawPlane,
  starship: drawStarship,
  satellite: drawSatellite,
  asteroids: drawAsteroids,
}

const drawFlybys = (context: Context, width: number, height: number, altitude: number, time: number) => {
  const unit = Math.min(width, height) * 0.004
  for (const { kind, from, to, startX, endX, size, tilt } of FLYBYS) {
    const pass = (altitude - from) / (to - from)
    if (pass <= 0 || pass >= 1) continue
    const scale = unit * size
    context.save()
    context.translate(mix(startX, endX, pass) * width, mix(-0.15, 1.15, pass) * height + Math.sin(time * 2) * scale * 2)
    context.rotate(tilt)
    context.scale(scale, scale)
    context.lineWidth = 2.4 / scale
    context.strokeStyle = OUTLINE
    FLYBY_DRAWINGS[kind](context, time)
    context.restore()
  }
}

const drawCloudBanks = (context: Context, width: number, height: number, horizonY: number, camY: number, isFront: boolean) => {
  const unit = Math.min(width, height) * 0.09
  for (const bank of CLOUD_BANKS) {
    if (bank.isFront !== isFront) continue
    const cloudY = horizonY - bank.altitude * height + camY
    if (cloudY < -unit * 3 || cloudY > height + unit * 3) continue
    context.globalAlpha = isFront ? 0.9 : 0.75
    drawCloud(context, bank.x * width, cloudY, unit * bank.size * (isFront ? 1.3 : 1))
  }
  context.globalAlpha = 1
}

const drawSpeedLines = (context: Context, width: number, height: number, camY: number, speed: number, space: number) => {
  const strength = clampToUnit(speed) * (1 - space)
  if (strength <= 0) return
  for (let line = 0; line < SPEED_LINES; line += 1) {
    const lineX = seededRandom(line, 131) * width
    const lineY = (seededRandom(line, 132) * height * 1.3 + camY * 1.6) % (height * 1.3) - height * 0.15
    paintLine(context, `rgba(255, 255, 255, ${0.45 * strength})`, 2, linePath(lineX, lineY, lineX, lineY + height * 0.12))
  }
}

const CULL_PAD = 8

const isSpanOnScreen = (context: Context, left: number, right: number) => {
  const { a, b, c, e } = context.getTransform()
  if (b !== 0 || c !== 0) return true
  const screenLeft = Math.min(a * (left - CULL_PAD), a * (right + CULL_PAD)) + e
  const screenRight = Math.max(a * (left - CULL_PAD), a * (right + CULL_PAD)) + e
  return screenRight >= 0 && screenLeft <= context.canvas.width
}

const drawFarSkyline = (context: Context, width: number, height: number, horizonY: number) => {
  context.lineWidth = 2
  for (const [x, blockWidth, blockHeight] of FAR_BLOCKS) {
    if (!isSpanOnScreen(context, x * width, (x + blockWidth) * width)) continue
    paintShape(context, "#b08ac0", (path) => path.rect(x * width, horizonY - blockHeight * height, blockWidth * width, blockHeight * height + 4))
  }
}

const drawGround = (context: Context, width: number, height: number, horizonY: number, camX: number) => {
  const seamSpacing = width * 0.12
  const seamShift = -(camX % seamSpacing)
  context.lineWidth = 4
  paintShape(context, "#d9a95f", (path) => {
    path.moveTo(-width, horizonY)
    path.lineTo(width * 2, horizonY)
    path.lineTo(width * 2, height + 10)
    path.lineTo(-width, height + 10)
    path.closePath()
  })
  const padTop = height * 0.74
  paintShape(context, "#b9bec8", (path) => path.rect(-width, padTop, width * 3, height - padTop + 10), {
    decorateInside: (padContext) => {
      for (let seamX = -width + seamShift; seamX < width * 2; seamX += seamSpacing) {
        paintLine(padContext, "#9ea4b0", 2, linePath(seamX, padTop, seamX + (seamX - width / 2) * 0.35, height))
      }
      paintLine(padContext, "#9ea4b0", 2, linePath(-width, height * 0.8, width * 2, height * 0.8))
      paintLine(padContext, "#9ea4b0", 2, linePath(-width, height * 0.93, width * 2, height * 0.93))
      padContext.setLineDash([width * 0.03, width * 0.02])
      padContext.lineDashOffset = camX
      paintLine(padContext, "#ffd23f", height * 0.008, linePath(-width, height * 0.755, width * 2, height * 0.755))
      padContext.setLineDash([])
      padContext.lineDashOffset = 0
    },
  })
}

const drawWindowRows = (context: Context, left: number, top: number, blockWidth: number, blockHeight: number, columns: number, rows: number, time: number, seed: number) => {
  const cellWidth = blockWidth / columns
  const cellHeight = blockHeight / rows
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const index = row * columns + column
      const isLit = Math.sin(time * 0.6 + seededRandom(index, seed) * 20) > -0.3
      context.fillStyle = isLit ? LIT_WINDOW : DARK_WINDOW
      context.fillRect(left + cellWidth * (column + 0.25), top + cellHeight * (row + 0.25), cellWidth * 0.5, cellHeight * 0.5)
    }
  }
}

const drawBlinkingLight = (context: Context, x: number, y: number, radius: number, time: number, phase: number) => {
  const isOn = Math.sin(time * 4 + phase) > 0
  context.lineWidth = 2
  paintShape(context, isOn ? "#ff2d2d" : "#7a1f1f", ellipsePath(x, y, radius, radius))
  if (isOn) paintFill(context, "rgba(255, 60, 60, 0.3)", ellipsePath(x, y, radius * 2.6, radius * 2.6))
}

const drawControlBuilding = (context: Context, width: number, height: number, horizonY: number, time: number) => {
  const left = width * 0.07
  const blockWidth = width * 0.08
  const top = horizonY - height * 0.065
  context.lineWidth = 3
  paintShape(context, "#e8e4f0", (path) => path.rect(left, top, blockWidth, horizonY - top + 2), {
    decorateInside: (buildingContext) => drawWindowRows(buildingContext, left, top + (horizonY - top) * 0.2, blockWidth, (horizonY - top) * 0.6, 5, 2, time, 1),
  })
  paintShape(context, METAL, (path) => path.ellipse(left + blockWidth * 0.3, top, blockWidth * 0.14, blockWidth * 0.14, 0, Math.PI, Math.PI * 2))
}

const drawHangar = (context: Context, width: number, height: number, horizonY: number) => {
  const left = width * 0.215
  const blockWidth = width * 0.095
  const top = horizonY - height * 0.17
  const blockHeight = horizonY - top
  context.lineWidth = 3
  paintShape(context, "#dfe3ee", (path) => path.rect(left, top, blockWidth, blockHeight + 2), {
    decorateInside: (hangarContext) => {
      paintFill(hangarContext, "#4dabf7", (path) => path.rect(left, top + blockHeight * 0.06, blockWidth, blockHeight * 0.08))
      const doorLeft = left + blockWidth * 0.2
      const doorWidth = blockWidth * 0.6
      const doorTop = top + blockHeight * 0.25
      paintFill(hangarContext, "#aab3c8", (path) => path.rect(doorLeft, doorTop, doorWidth, blockHeight))
      for (let stripe = 1; stripe < 6; stripe += 1) paintLine(hangarContext, DARK_METAL, 1.5, linePath(doorLeft + (doorWidth * stripe) / 6, doorTop, doorLeft + (doorWidth * stripe) / 6, horizonY))
    },
  })
  paintLine(context, OUTLINE, 2, (path) => path.rect(left + blockWidth * 0.2, top + blockHeight * 0.25, blockWidth * 0.6, blockHeight * 0.75))
}

const drawTowerBlock = (context: Context, width: number, height: number, horizonY: number, time: number) => {
  const left = width * 0.41
  const blockWidth = width * 0.035
  const top = horizonY - height * 0.2
  context.lineWidth = 3
  paintLine(context, OUTLINE, 2, linePath(left + blockWidth / 2, top, left + blockWidth / 2, top - height * 0.05))
  paintShape(context, "#f1e6d6", (path) => path.rect(left, top, blockWidth, horizonY - top + 2), {
    decorateInside: (towerContext) => drawWindowRows(towerContext, left, top + height * 0.01, blockWidth, horizonY - top - height * 0.02, 2, 7, time, 2),
  })
  drawBlinkingLight(context, left + blockWidth / 2, top - height * 0.05, Math.max(2.5, height * 0.006), time, 0)
}

const drawFuelTanks = (context: Context, width: number, height: number, horizonY: number) => {
  const radius = Math.min(width, height) * 0.035
  for (const tankX of [width * 0.565, width * 0.565 + radius * 2.4]) {
    const centerY = horizonY - radius * 2
    context.lineWidth = 3
    for (const side of [-1, 1]) paintLine(context, OUTLINE, 2.5, linePath(tankX + side * radius * 0.6, centerY, tankX + side * radius * 0.8, horizonY + 2))
    paintShape(context, WHITE, ellipsePath(tankX, centerY, radius, radius), {
      decorateInside: (tankContext) => paintFill(tankContext, "#e63946", (path) => path.rect(tankX - radius, centerY - radius * 0.12, radius * 2, radius * 0.24)),
      shade: "rgba(90, 40, 30, 0.18)",
    })
  }
}

const drawLongBuilding = (context: Context, width: number, height: number, horizonY: number, time: number) => {
  const left = width * 0.72
  const blockWidth = width * 0.13
  const top = horizonY - height * 0.06
  context.lineWidth = 3
  paintShape(context, "#e4d9f2", (path) => path.rect(left, top, blockWidth, horizonY - top + 2), {
    decorateInside: (buildingContext) => drawWindowRows(buildingContext, left, top + (horizonY - top) * 0.2, blockWidth, (horizonY - top) * 0.55, 9, 1, time, 3),
  })
  drawDish(context, left + blockWidth * 0.75, top, Math.min(width, height) * 0.0022, 0.5, time, 4)
}

const drawWaterTower = (context: Context, width: number, height: number, horizonY: number) => {
  const centerX = width * 0.885
  const tankWidth = width * 0.03
  const tankBottom = horizonY - height * 0.08
  context.lineWidth = 3
  for (const side of [-1, 1]) paintLine(context, OUTLINE, 2.5, linePath(centerX + side * tankWidth * 0.3, tankBottom, centerX + side * tankWidth * 0.45, horizonY + 2))
  paintLine(context, OUTLINE, 1.5, linePath(centerX - tankWidth * 0.36, tankBottom + height * 0.04, centerX + tankWidth * 0.36, tankBottom + height * 0.04))
  paintShape(context, "#7cc8ff", (path) => path.roundRect(centerX - tankWidth / 2, tankBottom - height * 0.045, tankWidth, height * 0.045, 4))
  paintShape(context, "#e63946", (path) => {
    path.moveTo(centerX - tankWidth * 0.55, tankBottom - height * 0.045)
    path.lineTo(centerX, tankBottom - height * 0.065)
    path.lineTo(centerX + tankWidth * 0.55, tankBottom - height * 0.045)
    path.closePath()
  })
}

const DISH_REACH = 28

const drawDish = (context: Context, baseX: number, baseY: number, unit: number, tilt: number, time: number, phase: number) => {
  context.save()
  context.translate(baseX, baseY)
  context.scale(unit, unit)
  context.lineWidth = 2.5 / unit
  paintShape(context, DARK_METAL, (path) => {
    path.moveTo(-7, 0)
    path.lineTo(7, 0)
    path.lineTo(4, -5)
    path.lineTo(-4, -5)
    path.closePath()
  })
  paintShape(context, METAL, (path) => path.rect(-2, -22, 4, 17))
  context.translate(0, -22)
  context.rotate(tilt + Math.sin(time * 0.4 + phase) * 0.12)
  paintShape(context, METAL, (path) => {
    path.moveTo(-15, -9)
    path.quadraticCurveTo(0, 8, 15, -9)
    path.closePath()
  })
  paintShape(context, "#f4f6fb", ellipsePath(0, -9, 15, 4.5), {
    decorateInside: (dishContext) => paintFill(dishContext, "#dfe5f0", ellipsePath(0, -8, 10, 2.6)),
  })
  for (const side of [-1, 1]) paintLine(context, OUTLINE, 1, linePath(side * 11, -9, 0, -24))
  paintShape(context, "#e63946", ellipsePath(0, -24, 2.2, 2.2))
  context.restore()
}

const drawTiled = (context: Context, width: number, shiftX: number, drawTile: () => void) => {
  for (let tile = -1; tile < 3; tile += 1) {
    context.save()
    context.translate(tile * width - shiftX, 0)
    drawTile()
    context.restore()
  }
}

const drawCosmodrome = (context: Context, width: number, height: number, horizonY: number, time: number, camX: number) => {
  const unit = Math.min(width, height) * 0.0042
  drawTiled(context, width, camX * 0.3, () => drawFarSkyline(context, width, height, horizonY))
  drawGround(context, width, height, horizonY, camX)
  const tankRadius = Math.min(width, height) * 0.035
  const lightGlow = Math.max(2.5, height * 0.006) * 2.6
  const roofDishReach = Math.min(width, height) * 0.0022 * DISH_REACH
  drawTiled(context, width, camX * 0.6, () => {
    if (isSpanOnScreen(context, width * 0.07, width * 0.15)) drawControlBuilding(context, width, height, horizonY, time)
    if (isSpanOnScreen(context, width * 0.215, width * 0.31)) drawHangar(context, width, height, horizonY)
    if (isSpanOnScreen(context, Math.min(width * 0.41, width * 0.4275 - lightGlow), Math.max(width * 0.445, width * 0.4275 + lightGlow))) drawTowerBlock(context, width, height, horizonY, time)
    if (isSpanOnScreen(context, width * 0.565 - tankRadius, width * 0.565 + tankRadius * 3.4)) drawFuelTanks(context, width, height, horizonY)
    if (isSpanOnScreen(context, width * 0.72, Math.max(width * 0.85, width * 0.8175 + roofDishReach))) drawLongBuilding(context, width, height, horizonY, time)
    if (isSpanOnScreen(context, width * 0.8685, width * 0.9015)) drawWaterTower(context, width, height, horizonY)
    for (const dish of DISHES) {
      const reach = unit * dish.size * DISH_REACH
      if (isSpanOnScreen(context, dish.x * width - reach, dish.x * width + reach)) drawDish(context, dish.x * width, horizonY + 2, unit * dish.size, dish.tilt, time, dish.phase)
    }
  })
}

const drawBubble = (context: Context, centerX: number, centerY: number, bubbleWidth: number, bubbleHeight: number, popScale: number, lines: readonly [string, string], textY = 0) => {
  if (popScale <= 0) return
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
  ], Math.max(3, bubbleWidth * 0.012), lines, 0, textY, bubbleWidth * 0.095)
  context.restore()
}

const bubbleWidthFor = (width: number) => Math.min(width * 0.4, 360)

const drawRadiBubble = (context: Context, width: number, radiX: number, feetY: number, scale: number, sceneSeconds: number) => {
  const bubbleWidth = bubbleWidthFor(width)
  const pop = easeOutBack(stageProgress(sceneSeconds, TURN_END, BUBBLE_POP_END)) * (1 - easeOut(stageProgress(sceneSeconds, RADI_BUBBLE_HIDE_START, RADI_BUBBLE_HIDE_END)))
  drawBubble(context, Math.min(width - bubbleWidth / 2 - 12, radiX + 44 * scale + bubbleWidth / 2), feetY - 118 * scale, bubbleWidth, bubbleWidth * 0.6, pop, BUBBLE_LINES)
}

const drawExclaimBubble = (context: Context, width: number, radiX: number, feetY: number, scale: number, wishSeconds: number | null) => {
  if (wishSeconds === null) return
  const bubbleWidth = bubbleWidthFor(width) * 0.85
  const pop = easeOutBack(stageProgress(wishSeconds, EXCLAIM_HOP_START + 0.15, EXCLAIM_POP_END)) * (1 - easeOut(stageProgress(wishSeconds, EXCLAIM_HIDE_START, EXCLAIM_HIDE_END)))
  drawBubble(context, Math.min(width - bubbleWidth / 2 - 12, radiX + 44 * scale + bubbleWidth / 2), feetY - 125 * scale, bubbleWidth, bubbleWidth * 0.6, pop, EXCLAIM_LINES)
}

const wishBubbleGeometry = (width: number, height: number) => {
  const scale = radiScale(width, height)
  const feetY = height * RADI_FEET
  const radiX = width / 2
  const bubbleWidth = bubbleWidthFor(width)
  const bubbleHeight = bubbleWidth * 0.65
  return {
    bubbleWidth,
    bubbleHeight,
    centerX: Math.min(width - bubbleWidth / 2 - 12, radiX + DUDE_STOP_UNITS * scale + 20 * scale + bubbleWidth * 0.4),
    centerY: Math.max(bubbleHeight / 2 + 12, feetY - 150 * scale - bubbleHeight * 0.2),
  }
}

export const wishButtonLayout = (width: number, height: number, sceneSeconds: number, wishSeconds: number | null): BubbleButtonLayout => {
  if (sceneSeconds < WISH_POP_END || wishSeconds !== null) return null
  const { bubbleWidth, bubbleHeight, centerX, centerY } = wishBubbleGeometry(width, height)
  return { centerX, centerY: centerY + bubbleHeight * 0.17, width: bubbleWidth * 0.7, fontSize: Math.max(14, bubbleWidth * 0.1) }
}

const drawWishBubble = (context: Context, width: number, height: number, sceneSeconds: number, wishSeconds: number | null) => {
  const { bubbleWidth, bubbleHeight, centerX, centerY } = wishBubbleGeometry(width, height)
  const pop = easeOutBack(stageProgress(sceneSeconds, WISH_START, WISH_POP_END)) * (1 - easeOut(clampToUnit((wishSeconds ?? 0) / WISH_CLOSE_SECONDS)))
  drawBubble(context, centerX, centerY, bubbleWidth, bubbleHeight, pop, WISH_LINES, -bubbleHeight * 0.16)
}

const drawCake = (context: Context, time: number, wishSeconds: number | null) => {
  context.lineWidth = 1.4
  paintShape(context, "#e9edf5", ellipsePath(0, -24, 16, 3))
  paintShape(context, "#ff8fab", (path) => path.roundRect(-11, -35, 22, 11, 2.5), {
    decorateInside: (cakeContext) => {
      paintFill(cakeContext, "#ffd6e0", (path) => path.rect(-12, -30.5, 24, 2))
      for (const [sprinkleX, sprinkleY, sprinkleColor] of [[-7, -27, "#4cc9f0"], [-2, -26, "#ffd23f"], [4, -27.5, "#3ddc97"], [8, -26, "#9b5de5"]] as const) {
        paintFill(cakeContext, sprinkleColor, ellipsePath(sprinkleX, sprinkleY, 0.9, 0.6))
      }
    },
  })
  paintShape(context, WHITE, (path) => {
    path.moveTo(-11.5, -33)
    path.lineTo(-11.5, -35.5)
    path.quadraticCurveTo(0, -38, 11.5, -35.5)
    path.lineTo(11.5, -33)
    for (let drip = 0; drip < 5; drip += 1) {
      const dripX = 11.5 - drip * 4.6
      path.quadraticCurveTo(dripX - 1.2, drip % 2 === 0 ? -30 : -31.5, dripX - 2.3, -33)
      path.lineTo(dripX - 4.6, -33)
    }
    path.closePath()
  })
  CANDLE_XS.forEach((candleX, index) => {
    paintShape(context, CANDLE_COLORS[index], (path) => path.rect(candleX - 0.9, -42, 1.8, 6))
    const sinceSnuff = wishSeconds === null ? -1 : wishSeconds - SNUFF_TIMES[index]
    const flame = 1 - clampToUnit(sinceSnuff / 0.12)
    const flicker = (1 + Math.sin(time * 18 + index * 2) * 0.15 + clampToUnit(sinceSnuff + 0.3) * Math.sin(time * 40) * 0.3) * flame
    if (flame > 0) {
      paintFill(context, `rgba(255, 200, 80, ${0.35 * flame})`, ellipsePath(candleX, -44, 2.6, 3))
      paintFill(context, "#ff9f1c", ellipsePath(candleX, -44, 1.2 * flicker, 2 * flicker))
      paintFill(context, "#fff3b0", ellipsePath(candleX, -43.6, 0.5 * flame, 0.9 * flame))
    }
    const wisp = sinceSnuff / 1.2
    if (wisp > 0 && wisp < 1) {
      paintLine(context, `rgba(130, 130, 145, ${0.7 * (1 - wisp)})`, 0.8, (path) => {
        path.moveTo(candleX, -42.5)
        path.quadraticCurveTo(candleX + Math.sin(time * 5 + index) * 2.5, -42.5 - wisp * 6, candleX + Math.sin(time * 3 + index) * 1.5, -43 - wisp * 12)
      })
    }
  })
}

const drawBreath = (context: Context, from: Point, to: Point, scale: number, wishSeconds: number | null) => {
  if (wishSeconds === null || wishSeconds < BLOW_START || wishSeconds > BLOW_END) return
  const strength = Math.min(1, (wishSeconds - BLOW_START) * 6, (BLOW_END - wishSeconds) * 6)
  for (let streak = 0; streak < 3; streak += 1) {
    const along = ((wishSeconds - BLOW_START) * 2.4 + streak / 3) % 1
    const wave = (streak - 1) * 7 * scale
    const point = (amount: number): Point => [mix(from[0], to[0], amount), mix(from[1], to[1], amount) + Math.sin(amount * Math.PI) * wave]
    const start = point(along)
    const end = point(Math.min(1, along + 0.22))
    paintLine(context, `rgba(255, 255, 255, ${0.9 * strength})`, 2.4 * scale, linePath(start[0], start[1], end[0], end[1]))
  }
}

const KISS_PUCKER = 0.25
const dudeKiss = (sceneSeconds: number) => easeInOut(stageProgress(sceneSeconds, KISS_START, KISS_CONTACT)) * (1 - easeInOut(stageProgress(sceneSeconds, KISS_LEAVE, KISS_END)))

const dudeX = (width: number, radiX: number, scale: number, sceneSeconds: number) =>
  mix(width + 50 * scale, radiX + DUDE_STOP_UNITS * scale, easeOutSoft(stageProgress(sceneSeconds, DUDE_WALK_START, DUDE_WALK_END)))

const drawShadesDude = (context: Context, width: number, radiX: number, feetY: number, scale: number, time: number, sceneSeconds: number, wishSeconds: number | null, camX: number) => {
  if (sceneSeconds < DUDE_WALK_START) return
  const walk = stageProgress(sceneSeconds, DUDE_WALK_START, DUDE_WALK_END)
  const walking = isMoving(walk) ? settle(walk) : 0
  const stepPhase = (sceneSeconds - DUDE_WALK_START) * DUDE_STEPS_PER_SECOND * Math.PI
  const step = Math.sin(stepPhase) * walking
  const kiss = dudeKiss(sceneSeconds)
  const x = dudeX(width, radiX, scale, sceneSeconds) - camX
  if (x < -60 * scale) return
  const dudeScale = scale * DUDE_SIZE
  const pose: PartyPose = {
    hands: CAKE_HANDS,
    bounce: -Math.abs(step) * 1.6,
    sway: step * 3.5,
    headTilt: step * 0.07 - kiss * 0.15,
    footLifts: [Math.max(0, step) * 3, Math.max(0, -step) * 3],
    lookUp: 0,
  }
  paintFill(context, "rgba(0, 0, 0, 0.18)", ellipsePath(x, feetY, 30 * dudeScale, 3.5 * dudeScale))
  context.save()
  context.translate(x, feetY)
  context.rotate(-kiss * KISS_LEAN)
  drawShadesDudeFront(context, 0, 0, dudeScale, pose, kiss > KISS_PUCKER)
  context.scale(dudeScale, dudeScale)
  context.translate(pose.sway, pose.bounce)
  context.lineJoin = "round"
  context.lineCap = "round"
  context.strokeStyle = OUTLINE
  drawCake(context, time, wishSeconds)
  context.restore()
}

const cakeCandlesPoint = (width: number, radiX: number, feetY: number, scale: number, sceneSeconds: number): Point => [
  dudeX(width, radiX, scale, sceneSeconds),
  feetY - 44 * scale * DUDE_SIZE,
]

const drawTransformSmoke = (context: Context, centerX: number, centerY: number, scale: number, wishSeconds: number | null) => {
  if (wishSeconds === null || wishSeconds < SMOKE_START || wishSeconds > SMOKE_END + 0.2) return
  const puffs = TRANSFORM_PUFFS.map((puff, index) => {
    const grow = easeOut(stageProgress(wishSeconds, SMOKE_START + puff.delay, SMOKE_FULL + puff.delay))
    const fade = stageProgress(wishSeconds, SMOKE_CLEAR + puff.delay, SMOKE_END + puff.delay)
    const spread = mix(0.35, 1, grow) + fade * 0.6
    const churn = wishSeconds * 2.2 + index
    return {
      x: centerX + (Math.cos(puff.angle) * puff.reach * spread + Math.sin(churn) * 3) * scale,
      y: centerY + (Math.sin(puff.angle) * puff.reach * 0.9 * spread - fade * 34 + Math.cos(churn) * 3) * scale,
      radius: puff.size * scale * mix(0.3, 1, grow) * (1 + fade * 0.35),
      alpha: grow * (1 - fade),
      tint: SMOKE_TINTS[index % SMOKE_TINTS.length],
    }
  })
  for (const puff of puffs) paintFill(context, `rgba(${puff.tint.shadow}, ${puff.alpha})`, ellipsePath(puff.x + 3 * scale, puff.y + 4 * scale, puff.radius, puff.radius * 0.9))
  for (const puff of puffs) paintFill(context, `rgba(${puff.tint.body}, ${puff.alpha})`, ellipsePath(puff.x, puff.y, puff.radius, puff.radius * 0.9))
  for (const puff of puffs) paintFill(context, `rgba(${puff.tint.light}, ${puff.alpha * 0.75})`, ellipsePath(puff.x - puff.radius * 0.3, puff.y - puff.radius * 0.32, puff.radius * 0.42, puff.radius * 0.34))
}

const drawStarBurst = (context: Context, centerX: number, centerY: number, scale: number, time: number, wishSeconds: number | null) => {
  if (wishSeconds === null) return
  const burst = stageProgress(wishSeconds, SUIT_AT, SUIT_AT + 1)
  if (burst <= 0 || burst >= 1) return
  const grow = easeOut(burst)
  context.save()
  context.globalAlpha = 1 - burst ** 2
  ;["#4cc9f0", "#9b5de5", WHITE].forEach((color, band) => {
    const radius = (40 + grow * 95 - band * 6) * scale
    paintLine(context, color, 4 * scale * (1 - burst * 0.6), ellipsePath(centerX, centerY, radius, radius * 0.8))
  })
  for (let star = 0; star < BURST_STARS; star += 1) {
    const angle = (star / BURST_STARS) * Math.PI * 2 + burst * 0.8
    const reach = (30 + grow * 110) * scale
    const twinkle = 0.7 + 0.3 * Math.sin(time * 14 + star)
    drawStarSparkle(context, centerX + Math.cos(angle) * reach, centerY + Math.sin(angle) * reach * 0.8, 6 * scale * twinkle * (1 - burst * 0.5), star % 2 === 0 ? "#ffe066" : WHITE)
  }
  context.restore()
}

const rocketBodyPath: BuildPath = (path) => {
  path.moveTo(-15, 0)
  path.quadraticCurveTo(-23, -55, -15, -95)
  path.quadraticCurveTo(-9, -120, 0, -132)
  path.quadraticCurveTo(9, -120, 15, -95)
  path.quadraticCurveTo(23, -55, 15, 0)
  path.closePath()
}

const drawLaunchTower = (context: Context, time: number) => {
  for (const railX of [30, 46]) paintShape(context, "#ff6b3d", (path) => path.rect(railX - 1.8, -160, 3.6, 160))
  for (let braceY = 0; braceY > -154; braceY -= 14) {
    paintLine(context, "#ff6b3d", 1.6, linePath(30, braceY, 46, braceY - 14))
    paintLine(context, "#ff6b3d", 1.6, linePath(46, braceY, 30, braceY - 14))
  }
  for (const armY of [-108, -60]) paintShape(context, "#ff6b3d", (path) => path.rect(16, armY, 14, 4))
  paintShape(context, "#ff6b3d", (path) => path.rect(26, -165, 24, 5))
  const isOn = Math.sin(time * 4) > 0
  paintShape(context, isOn ? "#ff2d2d" : "#7a1f1f", ellipsePath(38, -169, 2.8, 2.8))
  if (isOn) paintFill(context, "rgba(255, 60, 60, 0.3)", ellipsePath(38, -169, 8, 8))
}

const doorPath: BuildPath = (path) => path.roundRect(-DOOR_HALF, DOOR_TOP, DOOR_HALF * 2, DOOR_BOTTOM - DOOR_TOP, 3)

const drawDoor = (context: Context, open: number) => {
  paintShape(context, "#3a2f55", doorPath, {
    decorateInside: (doorContext) => {
      const glow = doorContext.createRadialGradient(0, DOOR_BOTTOM - 6, 1, 0, DOOR_BOTTOM - 6, 18)
      glow.addColorStop(0, `rgba(255, 226, 140, ${0.9 * open})`)
      glow.addColorStop(1, "rgba(255, 226, 140, 0)")
      paintFill(doorContext, glow, (path) => path.rect(-DOOR_HALF, DOOR_TOP, DOOR_HALF * 2, DOOR_BOTTOM - DOOR_TOP))
      const panelTop = DOOR_TOP - open * (DOOR_BOTTOM - DOOR_TOP)
      paintShape(doorContext, METAL, (path) => path.rect(-DOOR_HALF - 1, panelTop, DOOR_HALF * 2 + 2, DOOR_BOTTOM - DOOR_TOP), {
        decorateInside: (panelContext) => {
          paintLine(panelContext, DARK_METAL, 1, linePath(-DOOR_HALF, panelTop + 8, DOOR_HALF, panelTop + 8))
          paintFill(panelContext, "#ffd23f", ellipsePath(DOOR_HALF - 3, panelTop + 14, 1.2, 1.2))
        },
      })
    },
  })
  paintLine(context, DARK_METAL, 1.6, doorPath)
}

const drawRocketShip = (context: Context, time: number, door: number, kiraSlide: number) => {
  const glow = 0.6 + 0.4 * Math.sin(time * 23) * Math.sin(time * 7)
  paintFill(context, `rgba(255, 170, 60, ${0.45 * glow})`, ellipsePath(0, 12, 16, 5))
  paintShape(context, DARK_METAL, (path) => {
    path.moveTo(-10, 0)
    path.lineTo(10, 0)
    path.lineTo(13, 10)
    path.lineTo(-13, 10)
    path.closePath()
  })
  for (const side of [-1, 1]) {
    paintShape(context, "#e63946", (path) => {
      path.moveTo(side * 17, -42)
      path.quadraticCurveTo(side * 36, -24, side * 35, 8)
      path.lineTo(side * 15, -2)
      path.closePath()
    }, { shade: "rgba(90, 40, 30, 0.18)" })
  }
  paintShape(context, WHITE, rocketBodyPath, {
    decorateInside: (bodyContext) => {
      paintFill(bodyContext, "#e63946", (path) => path.rect(-30, -140, 60, 40))
      paintFill(bodyContext, OUTLINE, (path) => path.rect(-30, -101, 60, 1.4))
      paintFill(bodyContext, "#e63946", (path) => path.rect(-30, -20, 60, 9))
      for (let rivet = -12; rivet <= 12; rivet += 4) paintFill(bodyContext, "#ffd6d6", ellipsePath(rivet, -15.5, 0.8, 0.8))
      paintFill(bodyContext, "rgba(90, 40, 30, 0.12)", (path) => path.rect(7, -140, 20, 150))
    },
  })
  paintShape(context, "#e63946", (path) => path.roundRect(-2.6, -10, 5.2, 18, 2.6))
  drawDoor(context, door)
  paintShape(context, METAL, ellipsePath(0, WINDOW_Y, WINDOW_RADIUS, WINDOW_RADIUS))
  paintShape(context, "#4cc9f0", ellipsePath(0, WINDOW_Y, 7.2, 7.2), {
    decorateInside: (glassContext) => {
      paintFill(glassContext, "#2b8cc4", ellipsePath(2.5, WINDOW_Y + 2.5, 6, 6))
      if (kiraSlide <= 0) return
      drawKiraFront(glassContext, mix(WINDOW_KIRA_START_X, 0, kiraSlide), WINDOW_Y + 52 * WINDOW_KIRA_SIZE + 1, WINDOW_KIRA_SIZE)
      paintFill(glassContext, "rgba(76, 201, 240, 0.22)", ellipsePath(0, WINDOW_Y, 7.2, 7.2))
    },
  })
  paintFill(context, "rgba(255, 255, 255, 0.8)", ellipsePath(-2.6, WINDOW_Y - 3, 2.4, 1.6))
}

const rocketLayout = (width: number, height: number, camX: number) => {
  const unit = height * 0.0054
  const baseX = width * (ROCKET_X + PAN_WIDTHS) - camX
  const baseY = height * 0.79
  return { unit, baseX, baseY, doorBottomY: baseY + DOOR_BOTTOM * unit, rampBottomX: baseX + RAMP_FOOT_X * unit }
}

const doorOpenAmount = (wishSeconds: number | null) =>
  wishSeconds === null ? 0 : easeInOut(stageProgress(wishSeconds, DOOR_OPEN_START, DOOR_OPEN_END)) * (1 - easeInOut(stageProgress(wishSeconds, DOOR_CLOSE_START, DOOR_CLOSE_END)))

const rampAmount = (wishSeconds: number | null) =>
  wishSeconds === null ? 0 : easeOut(stageProgress(wishSeconds, RAMP_OUT_START, RAMP_OUT_END)) * (1 - easeInOut(stageProgress(wishSeconds, DOOR_CLOSE_START, DOOR_CLOSE_END)))

const drawRamp = (context: Context, width: number, height: number, camX: number, wishSeconds: number | null) => {
  const ramp = rampAmount(wishSeconds)
  if (ramp <= 0) return
  const { unit, baseX, doorBottomY } = rocketLayout(width, height, camX)
  const groundY = height * RADI_FEET + 4
  const topLeft: Point = [baseX - DOOR_HALF * unit, doorBottomY]
  const topRight: Point = [baseX + DOOR_HALF * unit, doorBottomY]
  const bottomLeft = mixPoint(topLeft, [baseX + (RAMP_FOOT_X - 20) * unit, groundY], ramp)
  const bottomRight = mixPoint(topRight, [baseX + (RAMP_FOOT_X + 20) * unit, groundY], ramp)
  const railLift = 12 * unit
  context.lineWidth = 3
  paintLine(context, OUTLINE, 4, linePath(bottomLeft[0], bottomLeft[1] - railLift, topLeft[0], topLeft[1] - railLift))
  paintLine(context, METAL, 2, linePath(bottomLeft[0], bottomLeft[1] - railLift, topLeft[0], topLeft[1] - railLift))
  for (let post = 0; post <= 3; post += 1) {
    const [postX, postY] = mixPoint(bottomLeft, topLeft, post / 3)
    paintLine(context, OUTLINE, 2.5, linePath(postX, postY, postX, postY - railLift))
  }
  paintShape(context, METAL, (path) => {
    path.moveTo(...topLeft)
    path.lineTo(...topRight)
    path.lineTo(...bottomRight)
    path.lineTo(...bottomLeft)
    path.closePath()
  })
  for (let step = 1; step < 8; step += 1) {
    const [fromX, fromY] = mixPoint(bottomLeft, topLeft, step / 8)
    const [toX, toY] = mixPoint(bottomRight, topRight, step / 8)
    paintLine(context, DARK_METAL, 1.5, linePath(fromX, fromY, toX, toY))
  }
}

const paintLaunchPuffs = (context: Context, time: number, isBehind: boolean) => {
  for (const puff of LAUNCH_PUFFS) {
    if (puff.isBehind !== isBehind) continue
    const life = (time * 0.32 + puff.offset) % 1
    const x = puff.side * (16 + life * puff.spread)
    const y = 10 - life * puff.lift
    const radius = puff.size * (0.6 + life * 1.1)
    const alpha = Math.sin(life * Math.PI) * 0.95
    const tint = SMOKE_TINTS[0]
    paintFill(context, `rgba(${tint.shadow}, ${alpha})`, ellipsePath(x + 2, y + 3, radius, radius * 0.8))
    paintFill(context, `rgba(${tint.body}, ${alpha})`, ellipsePath(x, y, radius, radius * 0.8))
    paintFill(context, `rgba(${tint.light}, ${alpha * 0.75})`, ellipsePath(x - radius * 0.3, y - radius * 0.3, radius * 0.4, radius * 0.3))
  }
}

type LaunchState = { riseY: number; camY: number; altitude: number; speed: number; flame: number; shake: number; zoom: number }

const flightProfile = (flightSeconds: number, flightDuration: number) => {
  const decelSeconds = flightDuration * DECEL_SHARE
  const cruiseEnd = flightDuration - decelSeconds
  const topSpeed = FLIGHT_HEIGHTS / (flightDuration - ACCEL_SECONDS / 2 - decelSeconds / 2)
  if (flightSeconds < ACCEL_SECONDS) return { rise: (topSpeed * flightSeconds ** 2) / (2 * ACCEL_SECONDS), speedShare: flightSeconds / ACCEL_SECONDS }
  const cruise = topSpeed * (flightSeconds - ACCEL_SECONDS / 2)
  if (flightSeconds < cruiseEnd) return { rise: cruise, speedShare: 1 }
  if (flightSeconds < flightDuration) {
    const braking = flightSeconds - cruiseEnd
    return { rise: cruise - (topSpeed * braking ** 2) / (2 * decelSeconds), speedShare: 1 - braking / decelSeconds }
  }
  return { rise: FLIGHT_HEIGHTS, speedShare: 0 }
}

const flightSecondsAtAltitude = (altitude: number, flightDuration: number) => {
  let low = 0
  let high = flightDuration
  for (let step = 0; step < 30; step += 1) {
    const middle = (low + high) / 2
    if (flightProfile(middle, flightDuration).rise < altitude + CAMERA_LOCK) low = middle
    else high = middle
  }
  return high
}

const PLANE_PASSED_ALTITUDE = FLYBYS.find(({ kind }) => kind === "plane")?.to ?? 0

export const earthRiseFlightSeconds = (flightDuration: number) => flightSecondsAtAltitude(EARTH_FROM, flightDuration)
export const planePassedFlightSeconds = (flightDuration: number) => flightSecondsAtAltitude(PLANE_PASSED_ALTITUDE, flightDuration)

export const rocketMiddleOnScreen = (width: number, height: number, wishSeconds: number | null, flightDuration: number) => {
  const { unit, baseX, baseY } = rocketLayout(width, height, cameraX(width, wishSeconds))
  const launch = launchState(height, wishSeconds, flightDuration)
  return { x: baseX, y: baseY - ROCKET_MIDDLE * unit - launch.riseY + launch.camY }
}

const launchState = (height: number, wishSeconds: number | null, flightDuration: number): LaunchState => {
  const wish = wishSeconds ?? -1
  const flightSeconds = Math.max(0, wish - LIFTOFF)
  const { rise, speedShare } = flightProfile(flightSeconds, flightDuration)
  const riseY = rise * height
  const lock = CAMERA_LOCK * height
  const camY = riseY - lock * (1 - Math.exp(-riseY / lock))
  const altitude = camY / height
  const ignite = easeOut(stageProgress(wish, IGNITION_START, LIFTOFF))
  return {
    riseY,
    camY,
    altitude,
    speed: speedShare,
    flame: ignite * (1 + 0.35 * clampToUnit(flightSeconds / 0.5)),
    shake: easeOut(stageProgress(wish, IGNITION_START, IGNITION_START + 0.6)) * (1 - stageProgress(wish, LIFTOFF + 1.5, LIFTOFF + 3.5)),
    zoom: mix(1, FLIGHT_ZOOM, easeInOut(clampToUnit((flightSeconds - ZOOM_START) / (ZOOM_END - ZOOM_START)))),
  }
}

const flamePath = (halfWidth: number, length: number): BuildPath => (path) => {
  path.moveTo(-halfWidth, 9)
  path.quadraticCurveTo(-halfWidth * 1.15, 9 + length * 0.5, 0, 9 + length)
  path.quadraticCurveTo(halfWidth * 1.15, 9 + length * 0.5, halfWidth, 9)
  path.closePath()
}

const drawRocketFlame = (context: Context, time: number, flame: number) => {
  if (flame <= 0) return
  const flicker = 1 + Math.sin(time * 41) * 0.12 + Math.sin(time * 67) * 0.08
  const length = (18 + 46 * flame) * flicker
  paintFill(context, `rgba(255, 150, 60, ${0.35 * Math.min(1, flame)})`, ellipsePath(0, 9 + length * 0.45, 26 * flame, length * 0.7))
  paintFill(context, "#ff5d2a", flamePath(12, length))
  paintFill(context, "#ffb703", flamePath(8.5, length * 0.75))
  paintFill(context, "#fff3b0", flamePath(4.5, length * 0.45))
}

const paintTintedPuff = (context: Context, tint: { shadow: string; body: string; light: string }, x: number, y: number, radius: number, alpha: number) => {
  paintFill(context, `rgba(${tint.shadow}, ${alpha})`, ellipsePath(x + radius * 0.12, y + radius * 0.15, radius, radius * 0.82))
  paintFill(context, `rgba(${tint.body}, ${alpha})`, ellipsePath(x, y, radius, radius * 0.82))
  paintFill(context, `rgba(${tint.light}, ${alpha * 0.75})`, ellipsePath(x - radius * 0.3, y - radius * 0.3, radius * 0.4, radius * 0.3))
}

const drawLiftSmoke = (context: Context, time: number, rocketY: number, flame: number, flightSeconds: number) => {
  const amount = clampToUnit(flightSeconds / 0.3) * (1 - easeInOut(stageProgress(flightSeconds, LIFT_SMOKE_FADE_START, LIFT_SMOKE_FADE_END)))
  if (amount <= 0) return
  const top = rocketY + 9 + 30 * flame
  const bottom = Math.max(top + 20, Math.min(14, top + LIFT_SMOKE_REACH))
  for (let puff = LIFT_SMOKE_PUFFS - 1; puff >= 0; puff -= 1) {
    const along = clampToUnit(puff / (LIFT_SMOKE_PUFFS - 1) + (seededRandom(puff, 171) - 0.5) * 0.08)
    const sway = (seededRandom(puff, 172) - 0.5) * (8 + along * 30) + Math.sin(time * 1.4 + puff * 2.1) * 3 * along
    const radius = (9 + along * 24) * mix(0.7, 1.3, seededRandom(puff, 173))
    const tint = along < 0.18 ? FIRE_TINT : SMOKE_TINTS[puff % 2 === 0 ? 0 : 2]
    paintTintedPuff(context, tint, sway, mix(top, bottom, along), radius, 0.85 * amount * (1 - along * 0.35))
  }
}

const drawLaunchExplosion = (context: Context, time: number, wishSeconds: number | null) => {
  if (wishSeconds === null || wishSeconds < IGNITION_START) return
  const linger = 1 - stageProgress(wishSeconds, LIFTOFF + 4, LIFTOFF + 8)
  if (linger <= 0) return
  for (const puff of EXPLOSION_PUFFS) {
    const grow = easeOut(stageProgress(wishSeconds, IGNITION_START + puff.delay, IGNITION_START + 1.8 + puff.delay))
    if (grow <= 0) continue
    const drift = (wishSeconds - IGNITION_START) * 4
    const churn = time * 1.6 + puff.reach
    const x = puff.side * (16 + (puff.reach + drift) * grow) + Math.sin(churn) * 3
    const y = 14 - puff.lift * grow + Math.cos(churn) * 2
    const isFiery = puff.reach < 100
    const glow = isFiery ? 0.75 + 0.25 * Math.sin(time * 30 + puff.reach) : 1
    paintTintedPuff(context, isFiery ? FIRE_TINT : SMOKE_TINTS[0], x, y, puff.size * (0.4 + grow * 0.9), Math.min(1, grow * 1.4) * linger * glow)
  }
}

export type FlightThrill = { boost: number; rushSeconds: number; wobble: number }
export const CALM_FLIGHT: FlightThrill = { boost: 0, rushSeconds: 0, wobble: 0 }
const BOOST_FLAME = 0.8
const BOOST_TRAIL_PUFFS = 14
const BOOST_TRAIL_REACH = 230
const RUSH_CLOUDS = 7
const RUSH_LINES = 22
const WOBBLE_TILT = 0.11
const WOBBLE_SWAY = 7

const drawBoostTrail = (context: Context, time: number, boost: number, flame: number) => {
  if (boost <= 0) return
  const top = 12 + 40 * flame
  for (let puff = BOOST_TRAIL_PUFFS - 1; puff >= 0; puff -= 1) {
    const along = (seededRandom(puff, 241) + time * 2.4) % 1
    const sway = (seededRandom(puff, 242) - 0.5) * (6 + along * 34)
    const radius = (7 + along * 22) * mix(0.75, 1.25, seededRandom(puff, 243))
    const tint = along < 0.15 ? FIRE_TINT : SMOKE_TINTS[puff % 2 === 0 ? 0 : 2]
    paintTintedPuff(context, tint, sway, top + along * BOOST_TRAIL_REACH, radius, 0.8 * boost * (1 - along))
  }
}

const drawBoostRush = (context: Context, width: number, height: number, thrill: FlightThrill, space: number) => {
  if (thrill.boost <= 0) return
  const travel = thrill.rushSeconds * height * 2.6
  const lineSpan = height * 1.4
  for (let line = 0; line < RUSH_LINES; line += 1) {
    const lineX = seededRandom(line, 251) * width
    const lineY = (seededRandom(line, 252) * lineSpan + travel * 1.5) % lineSpan - height * 0.2
    paintLine(context, `rgba(255, 255, 255, ${0.6 * thrill.boost})`, 2.5, linePath(lineX, lineY, lineX, lineY + height * 0.2))
  }
  const cloudAlpha = thrill.boost * (1 - space * 0.75)
  if (cloudAlpha <= 0) return
  const unit = Math.min(width, height) * 0.08
  const cloudSpan = height + unit * 8
  context.globalAlpha = cloudAlpha
  for (let cloud = 0; cloud < RUSH_CLOUDS; cloud += 1) {
    const side = cloud % 2 === 0 ? -1 : 1
    const cloudX = width / 2 + side * width * mix(0.18, 0.45, seededRandom(cloud, 253))
    const cloudY = (seededRandom(cloud, 254) * cloudSpan + travel) % cloudSpan - unit * 4
    drawCloud(context, cloudX, cloudY, unit * mix(0.8, 1.4, seededRandom(cloud, 255)))
  }
  context.globalAlpha = 1
}

const drawLaunchRocket = (context: Context, width: number, height: number, time: number, camX: number, wishSeconds: number | null, launch: LaunchState, thrill: FlightThrill) => {
  const { unit, baseX, baseY } = rocketLayout(width, height, camX)
  if (baseX - 60 * unit > width) return
  const rocketY = -launch.riseY / unit
  context.save()
  context.translate(baseX, baseY)
  context.scale(unit, unit)
  context.lineWidth = 3 / unit
  context.strokeStyle = OUTLINE
  drawLaunchTower(context, time)
  paintLaunchPuffs(context, time, true)
  context.save()
  const flightSeconds = (wishSeconds ?? -1) - LIFTOFF
  drawLiftSmoke(context, time, rocketY, launch.flame, flightSeconds)
  const calm = stageProgress(flightSeconds, END_IRIS_START + END_IRIS_FOCUS * 0.5, END_IRIS_START + END_IRIS_FOCUS)
  const tremble = (1 + launch.flame * 1.5) * (1 - calm)
  const wobbleSway = thrill.wobble * (Math.sin(time * 7) + Math.sin(time * 17) * 0.4) * WOBBLE_SWAY
  context.translate((Math.sin(time * 47) * 0.9 + Math.sin(time * 31) * 0.6) * tremble + wobbleSway, rocketY + Math.sin(time * 53) * 0.5 * tremble)
  if (thrill.wobble > 0) {
    context.translate(0, -ROCKET_MIDDLE)
    context.rotate(thrill.wobble * (Math.sin(time * 9) + Math.sin(time * 23) * 0.45) * WOBBLE_TILT)
    context.translate(0, ROCKET_MIDDLE)
  }
  const sputter = 1 - thrill.wobble * 0.4 * (0.5 + 0.5 * Math.sin(time * 29))
  const flame = launch.flame * (1 + BOOST_FLAME * thrill.boost) * sputter
  drawBoostTrail(context, time, thrill.boost, flame)
  drawRocketFlame(context, time, flame)
  context.lineWidth = 3 / unit
  drawRocketShip(context, time, doorOpenAmount(wishSeconds), easeOutBack(stageProgress(flightSeconds, END_IRIS_START, END_IRIS_START + WINDOW_KIRA_SLIDE)))
  context.restore()
  paintShape(context, "#9ea4b0", (path) => path.rect(-52, 12, 110, (height - baseY) / unit), {
    decorateInside: (platformContext) => {
      paintFill(platformContext, "#ffd23f", (path) => path.rect(-60, 12, 130, 5))
      for (let stripe = -60; stripe < 70; stripe += 8) {
        paintFill(platformContext, OUTLINE, (path) => {
          path.moveTo(stripe, 12)
          path.lineTo(stripe + 4, 12)
          path.lineTo(stripe, 17)
          path.lineTo(stripe - 4, 17)
          path.closePath()
        })
      }
    },
  })
  paintLaunchPuffs(context, time, false)
  drawLaunchExplosion(context, time, wishSeconds)
  context.restore()
  drawRamp(context, width, height, camX, wishSeconds)
}

const kiraStages = (wishSeconds: number | null) => {
  const wish = wishSeconds ?? -1
  return {
    run: stageProgress(wish, KIRA_RUN_START, KIRA_RUN_END),
    climb: stageProgress(wish, KIRA_RUN_END, KIRA_CLIMB_END),
    enter: stageProgress(wish, KIRA_CLIMB_END, KIRA_ENTER_END),
  }
}

export const cosmodromeKiraSteps = (wishSeconds: number | null) => {
  const { run, climb, enter } = kiraStages(wishSeconds)
  if (run <= 0 || enter >= 1) return null
  return run * KIRA_RUN_STRIDES * 2 + climb * KIRA_CLIMB_STRIDES * 2
}

const drawBoardingKira = (context: Context, width: number, height: number, baseScale: number, time: number, wishSeconds: number | null, camX: number) => {
  const { run, climb, enter } = kiraStages(wishSeconds)
  if (run <= 0 || enter >= 1) return
  const layout = rocketLayout(width, height, camX)
  const groundY = height * RADI_FEET
  const doorSize = ((DOOR_BOTTOM - DOOR_TOP - 3) * layout.unit) / (125 * baseScale)
  const scale = baseScale * mix(1, doorSize, climb) * mix(1, 0.75, enter)
  const x = mix(mix(-70 * baseScale, layout.rampBottomX, run), layout.baseX, climb)
  const feet = mix(groundY, layout.doorBottomY, climb)
  const slope = Math.atan2(layout.doorBottomY - groundY, layout.baseX - layout.rampBottomX)
  const onRamp = Math.min(1, climb * 8, (1 - climb) * 8)
  const amount = Math.min(1, run * 8) * (1 - enter)
  const phase = (run * KIRA_RUN_STRIDES + climb * KIRA_CLIMB_STRIDES) * Math.PI * 2
  const lift = Math.abs(Math.sin(phase)) * 5 * amount
  context.save()
  context.globalAlpha = 1 - enter
  if (enter > 0) {
    context.beginPath()
    context.rect(layout.baseX - DOOR_HALF * layout.unit, layout.baseY + DOOR_TOP * layout.unit, DOOR_HALF * 2 * layout.unit, (DOOR_BOTTOM - DOOR_TOP) * layout.unit)
    context.clip()
  } else {
    paintFill(context, "rgba(0, 0, 0, 0.15)", ellipsePath(x - 12 * scale, feet, 36 * scale * Math.max(0.4, 1 - lift / 60), 3 * scale))
  }
  context.translate(x, feet - lift * scale)
  context.rotate(slope * onRamp + Math.sin(phase + 1) * 0.06 * amount)
  drawKiraSide(context, 0, 0, scale, { legSwing: Math.sin(phase) * amount, tailWag: Math.sin(time * 14) * 0.15, spaceHelmet: true })
  context.restore()
}

const drawKissSmack = (context: Context, radiX: number, feetY: number, scale: number, sceneSeconds: number) => {
  const smack = stageProgress(sceneSeconds, KISS_CONTACT, KISS_CONTACT + 0.7)
  if (smack <= 0 || smack >= 1) return
  const size = 10 * scale * easeOutBack(clampToUnit(smack * 4)) * (1 - easeOut(stageProgress(smack, 0.6, 1)))
  context.save()
  context.translate(radiX + 20 * scale, feetY - (62 + smack * 8) * scale)
  context.rotate(0.3)
  context.lineWidth = 1.4 * scale
  paintShape(context, "#ff4d8d", heartPath(size))
  context.restore()
}

const drawKissHearts = (context: Context, radiX: number, feetY: number, scale: number, time: number, sceneSeconds: number) => {
  const sinceKiss = sceneSeconds - KISS_CONTACT
  if (sinceKiss < 0 || sinceKiss > HEART_SECONDS + 0.5) return
  const middleX = radiX + DUDE_STOP_UNITS * 0.45 * scale
  KISS_HEARTS.forEach(([offsetX, rise, sizeRatio], index) => {
    const life = clampToUnit((sinceKiss - index * 0.12) / HEART_SECONDS)
    if (life <= 0 || life >= 1) return
    const pop = easeOutBack(clampToUnit(life * 5)) * (1 - easeOut(stageProgress(life, 0.75, 1)))
    const size = 15 * sizeRatio * scale * pop
    context.save()
    context.translate(middleX + (offsetX + Math.sin(time * 4 + index) * 3) * scale, feetY - (115 + rise * life) * scale)
    context.rotate(Math.sin(time * 3 + index) * 0.25)
    context.lineWidth = 1.6 * scale
    paintShape(context, index % 2 === 0 ? "#ff4d6d" : "#ff8fab", heartPath(size))
    paintFill(context, "rgba(255, 255, 255, 0.7)", ellipsePath(-size * 0.25, -size * 0.25, size * 0.09, size * 0.06))
    context.restore()
  })
}

const radiExpression = (thinking: number, sceneSeconds: number, wishSeconds: number | null): RadiExpression => {
  if (wishSeconds !== null) {
    if (wishSeconds >= BLOW_START && wishSeconds < BLOW_END) return "puff"
    if (wishSeconds >= EXCLAIM_HOP_START && wishSeconds < EXCLAIM_HOP_START + 0.6) return "surprised"
    return sunnyRadiLook.expression
  }
  if (sceneSeconds >= NOTICE_START && sceneSeconds < NOTICE_START + 1.2) return "surprised"
  if (thinking > 0.5 && sceneSeconds < NOTICE_START) return "thinking"
  return sunnyRadiLook.expression
}

const hopMotion = (hopsDone: number, isHopping: boolean) => {
  const hopPhase = hopsDone - Math.floor(hopsDone)
  return {
    hopPhase,
    leadSide: Math.floor(hopsDone) % 2 === 0 ? 1 : -1,
    hop: isHopping ? bounce(hopPhase) : RESTING_BOUNCE,
  }
}

const drawSkippingRadi = (context: Context, width: number, height: number, baseScale: number, time: number, sceneSeconds: number, wishSeconds: number | null, camX: number, onlyFaceAndBody = false) => {
  const { exclaimHop, toRamp, climb, enter } = boardingStages(wishSeconds)
  if (enter >= 1) return
  const layout = rocketLayout(width, height, camX)
  const doorSize = ((DOOR_BOTTOM - DOOR_TOP - 3) * layout.unit) / (125 * baseScale)
  const scale = baseScale * mix(1, doorSize, climb) * mix(1, 0.75, enter)
  const feetY = mix(height * RADI_FEET, layout.doorBottomY, climb)
  const skip = skipProgress(sceneSeconds)
  const skipRight = skipRightProgress(wishSeconds)
  const strides = [
    [skipRight, SKIP_RIGHT_HOPS],
    [toRamp, RAMP_WALK_HOPS],
    [climb, CLIMB_HOPS],
  ] as const
  const [stride, strideHops] = strides.find(([amount]) => isMoving(amount)) ?? [skip, HOP_COUNT]
  const isStriding = isMoving(stride)
  const excited = excitedHops(wishSeconds)
  const isHoppingExcitedly = excited > 0 && excited < EXCITED_HOPS
  const turn = stageProgress(sceneSeconds, SKIP_END, TURN_END)
  const radiX = mix(mix(radiWorldX(width, baseScale, sceneSeconds, wishSeconds) - camX, layout.rampBottomX, toRamp), layout.baseX, climb)
  const { hopPhase, leadSide, hop: walkBounce } = hopMotion(stride * strideHops, isStriding)
  const excitedBounce = hopMotion(excited, isHoppingExcitedly).hop
  const exclaimBounce = isMoving(exclaimHop) ? bounce(exclaimHop) : RESTING_BOUNCE
  const turnBounce = isMoving(turn) ? bounce(turn) : RESTING_BOUNCE
  const lift = walkBounce.lift * 18 + turnBounce.lift * 24 + excitedBounce.lift * 14 + exclaimBounce.lift * 22
  const stretchY = settledStretch(walkBounce.stretchY, stride) * settledStretch(turnBounce.stretchY, turn) * excitedBounce.stretchY * exclaimBounce.stretchY
  const knee = isStriding ? Math.sin(hopPhase * Math.PI) * 9 : 0
  const tuck = turnBounce.lift * 6 + excitedBounce.lift * 5
  const armPump = isStriding ? Math.sin(hopPhase * Math.PI) * leadSide : 0
  const notice = easeOut(stageProgress(sceneSeconds, NOTICE_START, NOTICE_END))
  const thinking = easeOut(stageProgress(sceneSeconds, TURN_END, BUBBLE_POP_END)) * (1 - notice)
  const chinTap = Math.max(0, Math.sin(time * 2.2)) * 1.2 * thinking
  const wish = wishSeconds ?? -1
  const blow = Math.min(clampToUnit((wish - BLOW_START) / 0.25), clampToUnit((BLOW_END - wish) / 0.25))
  const cheer = easeOut(stageProgress(wish, SMOKE_CLEAR, SMOKE_CLEAR + 0.3)) * (1 - easeOut(stageProgress(wish, CHEER_END, CHEER_END + 0.3)))
  const run = clampToUnit((wish - SKIP_RIGHT_START) / 0.3)
  const wow = easeOut(stageProgress(wish, EXCLAIM_HOP_START, EXCLAIM_HOP_START + 0.3)) * (1 - easeOut(stageProgress(wish, RAMP_WALK_START - 0.3, RAMP_WALK_START)))
  const wiggle = Math.sin(time * 9) * 2 * wow
  const lean = isStriding
    ? (0.12 + Math.sin(hopPhase * Math.PI * 2) * 0.05) * settle(stride)
    : Math.sin(time * 1.2) * 0.03 * thinking + blow * 0.07
  const skippingHands: readonly [Point, Point] = [
    [RESTING_HANDS[0][0] - Math.abs(armPump) * 3, RESTING_HANDS[0][1] - armPump * 10],
    [RESTING_HANDS[1][0] + Math.abs(armPump) * 3, RESTING_HANDS[1][1] + armPump * 10],
  ]
  const standingHands: readonly [Point, Point] = [
    mixPoint(mixPoint(skippingHands[0], THINKING_HANDS[0], thinking), CLASPED_HANDS[0], notice),
    mixPoint(mixPoint(skippingHands[1], [THINKING_HANDS[1][0], THINKING_HANDS[1][1] + chinTap], thinking), CLASPED_HANDS[1], notice),
  ]
  const hands: readonly [Point, Point] = [
    mixPoint(mixPoint(mixPoint(standingHands[0], skippingHands[0], run), CHEER_HANDS[0], cheer), [WOW_HANDS[0][0] - wiggle, WOW_HANDS[0][1] + wiggle], wow),
    mixPoint(mixPoint(mixPoint(standingHands[1], skippingHands[1], run), CHEER_HANDS[1], cheer), [WOW_HANDS[1][0] + wiggle, WOW_HANDS[1][1] - wiggle], wow),
  ]
  const look = wish >= SUIT_AT ? astronautRadiLook : sunnyRadiLook
  const towardDude = notice * 0.55 * (1 - cheer) * (1 - run)

  context.save()
  context.globalAlpha = 1 - enter
  if (enter > 0) {
    context.beginPath()
    context.rect(layout.baseX - DOOR_HALF * layout.unit, layout.baseY + DOOR_TOP * layout.unit, DOOR_HALF * 2 * layout.unit, (DOOR_BOTTOM - DOOR_TOP) * layout.unit)
    context.clip()
  }
  if (!onlyFaceAndBody && enter <= 0) paintFill(context, "rgba(0, 0, 0, 0.18)", ellipsePath(radiX, feetY, 22 * scale * (1 - lift / 60), 3 * scale))
  context.translate(radiX, feetY - lift * scale)
  context.rotate(lean)
  context.scale(1 / stretchY, stretchY)
  if (onlyFaceAndBody) {
    const faceAndBody = new Path2D()
    faceAndBody.ellipse(0, -70 * scale, 25 * scale, 27 * scale, 0, 0, Math.PI * 2)
    faceAndBody.rect(-18 * scale, -46 * scale, 36 * scale, 50 * scale)
    context.clip(faceAndBody)
  }
  drawRadi(context, { ...look, expression: radiExpression(thinking, sceneSeconds, wishSeconds) }, 0, 0, scale, {
    faceTurn: 1 - easeOut(turn) + Math.sin(time * 0.9) * 0.15 * thinking + towardDude + run * 0.85 - wow * 0.55 + clampToUnit((wish - RAMP_WALK_START) / 0.2) * 0.15,
    headTilt: 0.12 * thinking + 0.14 * dudeKiss(sceneSeconds),
    legLifts: leadSide === 1 ? [knee + tuck, knee * 0.2 + tuck] : [knee * 0.2 + tuck, knee + tuck],
    kneeBends: leadSide === 1 ? [knee * 0.5 + tuck * 0.8, knee * 0.1 + tuck * 0.8] : [knee * 0.1 + tuck * 0.8, knee * 0.5 + tuck * 0.8],
    elbowBends: [THINKING_ELBOWS[0] * thinking, THINKING_ELBOWS[1] * thinking],
    hands,
  })
  context.restore()
  context.restore()
}

export const drawCosmodromeScene = (context: Context, width: number, height: number, time: number, sceneSeconds: number, wishSeconds: number | null, flightDuration: number, thrill: FlightThrill = CALM_FLIGHT) => {
  const horizonY = height * 0.62
  const feetY = height * RADI_FEET
  const scale = radiScale(width, height)
  const camX = cameraX(width, wishSeconds)
  const launch = launchState(height, wishSeconds, flightDuration)
  const space = easeInOut(clampToUnit((launch.altitude - SPACE_FROM) / (SPACE_TO - SPACE_FROM)))
  context.lineJoin = "round"
  context.lineCap = "round"
  context.strokeStyle = OUTLINE
  context.save()
  const shake = launch.shake + thrill.wobble * 0.35
  context.translate(Math.sin(time * 61) * 7 * shake, Math.cos(time * 57) * 5 * shake)
  drawSky(context, width, height, horizonY, time, launch.altitude, space, launch.camY)
  drawNebula(context, width, height, space, time)
  drawShootingStars(context, width, height, space, time)
  drawSunrise(context, width, height, launch.altitude, time)
  drawAurora(context, width, height, launch.altitude, time)
  drawEarth(context, width, height, launch.altitude, time)
  drawCloudBanks(context, width, height, horizonY, launch.camY, false)
  drawFlybys(context, width, height, launch.altitude, time)
  context.save()
  context.translate(0, launch.camY)
  if (launch.zoom < 1) {
    const { unit, baseX, baseY } = rocketLayout(width, height, camX)
    const focusY = baseY - ROCKET_MIDDLE * unit - launch.riseY
    context.translate(baseX, focusY)
    context.scale(launch.zoom, launch.zoom)
    context.translate(-baseX, -focusY)
  }
  drawCosmodrome(context, width, height, horizonY, time, camX)
  drawLaunchRocket(context, width, height, time, camX, wishSeconds, launch, thrill)
  const radiX = radiWorldX(width, scale, sceneSeconds, wishSeconds) - camX
  const standingX = width / 2
  const isNearDude = sceneSeconds >= DUDE_WALK_START && (wishSeconds === null || wishSeconds < SUIT_AT)
  if (isNearDude) drawSkippingRadi(context, width, height, scale, time, sceneSeconds, wishSeconds, camX)
  drawShadesDude(context, width, standingX, feetY, scale, time, sceneSeconds, wishSeconds, camX)
  drawSkippingRadi(context, width, height, scale, time, sceneSeconds, wishSeconds, camX, isNearDude)
  drawBoardingKira(context, width, height, scale, time, wishSeconds, camX)
  const [candlesX, candlesY] = cakeCandlesPoint(width, standingX, feetY, scale, sceneSeconds)
  drawBreath(context, [radiX + 12 * scale, feetY - 54 * scale], [candlesX - camX, candlesY], scale, wishSeconds)
  drawKissSmack(context, radiX, feetY, scale, sceneSeconds)
  drawKissHearts(context, radiX, feetY, scale, time, sceneSeconds)
  drawRadiBubble(context, width, radiX, feetY, scale, sceneSeconds)
  drawWishBubble(context, width, height, sceneSeconds, wishSeconds)
  drawExclaimBubble(context, width, radiX, feetY, scale, wishSeconds)
  drawTransformSmoke(context, radiX, feetY - 55 * scale, scale, wishSeconds)
  drawStarBurst(context, radiX, feetY - 60 * scale, scale, time, wishSeconds)
  context.restore()
  drawCloudBanks(context, width, height, horizonY, launch.camY, true)
  drawSpeedLines(context, width, height, launch.camY, launch.speed, space)
  drawBoostRush(context, width, height, thrill, space)
  const wish = wishSeconds ?? -1
  const flash = 0.55 * (1 - stageProgress(wish, LIFTOFF, LIFTOFF + 0.7)) * (wish >= LIFTOFF ? 1 : 0) + 0.25 * (1 - stageProgress(wish, IGNITION_START, IGNITION_START + 0.4)) * (wish >= IGNITION_START ? 1 : 0)
  if (flash > 0) {
    context.fillStyle = `rgba(255, 214, 150, ${flash})`
    context.fillRect(-20, -20, width + 40, height + 40)
  }
  context.restore()
  if (sceneSeconds < IRIS_IN_END) paintIris(context, width, height, width / 2, feetY - 60 * scale, Math.hypot(width, height) * clampToUnit(sceneSeconds / IRIS_IN_END) ** 2)
  drawEndingIris(context, width, height, camX, launch, wish - LIFTOFF)
}

const drawEndingIris = (context: Context, width: number, height: number, camX: number, launch: LaunchState, flightSeconds: number) => {
  if (flightSeconds < END_IRIS_START) return
  const { unit, baseX, baseY } = rocketLayout(width, height, camX)
  const focusY = baseY - ROCKET_MIDDLE * unit - launch.riseY + launch.camY
  const windowY = focusY + (WINDOW_Y + ROCKET_MIDDLE) * unit * launch.zoom
  const focus = 1 - (1 - stageProgress(flightSeconds, END_IRIS_START, END_IRIS_START + END_IRIS_FOCUS)) ** 3
  const closeStart = END_IRIS_START + END_IRIS_FOCUS + END_IRIS_HOLD
  const close = stageProgress(flightSeconds, closeStart, closeStart + END_IRIS_CLOSE)
  const windowRadius = WINDOW_RADIUS * unit * launch.zoom
  paintIris(context, width, height, baseX, windowY, mix(Math.hypot(width, height), windowRadius, focus) * (1 - close ** 2))
  drawEndingTitle(context, width, height, flightSeconds - closeStart - END_IRIS_CLOSE)
  drawEndingUnicorn(context, width, height, flightSeconds - closeStart - END_IRIS_CLOSE)
}

const drawEndingTitle = (context: Context, width: number, height: number, sinceBlack: number) => {
  if (sinceBlack <= 0) return
  const letters = [...ENDING_TEXT]
  let fontSize = Math.min(width * 0.085, height * 0.14)
  context.font = `bold ${fontSize}px "Comic Sans MS", "Comic Sans", cursive`
  const naturalWidth = context.measureText(ENDING_TEXT).width
  if (naturalWidth > width * ENDING_MAX_WIDTH) fontSize *= (width * ENDING_MAX_WIDTH) / naturalWidth
  context.font = `bold ${fontSize}px "Comic Sans MS", "Comic Sans", cursive`
  context.textBaseline = "middle"
  context.textAlign = "center"
  context.lineJoin = "round"
  context.lineWidth = fontSize * 0.12
  const widths = letters.map((letter) => context.measureText(letter).width)
  const totalWidth = widths.reduce((sum, letterWidth) => sum + letterWidth, 0)
  let slotX = width / 2 - totalWidth / 2
  letters.forEach((letter, index) => {
    const targetX = slotX + widths[index] / 2
    slotX += widths[index]
    if (letter === " ") return
    const targetY = height / 2
    const landAt = ENDING_ASSEMBLE_START + index * ENDING_LETTER_GAP + ENDING_FLIGHT
    const flight = stageProgress(sinceBlack, landAt - ENDING_FLIGHT, landAt)
    const lit = stageProgress(sinceBlack, landAt - 0.05, landAt + 0.2)
    const beat = sinceBlack * 7 + index * 0.9
    const dance = 1 - easeOut(flight)
    const hop = Math.abs(Math.sin(beat)) * fontSize * 0.8
    const scatterX = mix(0.1, 0.9, seededRandom(index, 161)) * width + Math.cos(beat * 0.5) * fontSize * 0.9 + Math.sin(sinceBlack * 1.3 + index) * width * 0.04
    const scatterY = mix(0.2, 0.85, seededRandom(index, 162)) * height - hop + Math.sin(beat * 0.25) * fontSize * 0.3
    const x = mix(scatterX, targetX, easeOutBack(flight))
    const y = mix(scatterY, targetY, easeOutBack(flight))
    const shakeX = Math.sin(sinceBlack * 19 + index * 2.3) * fontSize * 0.02 * lit
    const shakeY = Math.cos(sinceBlack * 23 + index * 1.7) * fontSize * 0.028 * lit
    const rotation = Math.sin(beat) * 0.8 * dance + Math.sin(sinceBlack * 4 + index) * 0.07 * lit
    const squash = 1 + Math.max(0, Math.cos(beat * 2)) * 0.3 * dance
    const color = RAINBOW[Math.floor(index + sinceBlack * 3) % RAINBOW.length]
    context.save()
    context.globalAlpha = clampToUnit(sinceBlack / ENDING_FADE_IN)
    context.translate(x + shakeX, y + shakeY)
    context.rotate(rotation)
    context.scale(1 / squash, squash)
    const burst = stageProgress(sinceBlack, landAt, landAt + 0.45)
    if (burst > 0 && burst < 1) paintLine(context, `rgba(255, 255, 255, ${0.8 * (1 - burst)})`, fontSize * 0.05, ellipsePath(0, 0, fontSize * (0.3 + burst * 0.7), fontSize * (0.3 + burst * 0.7)))
    context.strokeStyle = OUTLINE
    context.strokeText(letter, 0, 0)
    context.shadowColor = color
    context.shadowBlur = fontSize * 0.45 * lit
    context.fillStyle = mixColor(ENDING_DIM_COLOR, color, lit)
    context.fillText(letter, 0, 0)
    context.restore()
  })
}

const drawEndingUnicorn = (context: Context, width: number, height: number, sinceBlack: number) => {
  const sinceEntrance = sinceBlack - ENDING_UNICORN_AT
  if (sinceEntrance <= 0) return
  const pop = easeOutBack(clampToUnit(sinceEntrance / 0.45))
  const feetY = height * 0.95
  const scale = Math.min((height * 0.33) / 125, (width * 0.5) / 125)
  const beat = sinceEntrance * ENDING_DANCE_BEATS_PER_SECOND
  const hopPhase = beat - Math.floor(beat)
  const { lift, stretchY } = bounce(hopPhase)
  const swing = Math.sin(beat * Math.PI)
  const leadSide = Math.floor(beat) % 2 === 0 ? 1 : -1
  const highHand: Point = [26, -64 + Math.sin(sinceEntrance * 9) * 3]
  const lowHand: Point = [17, -36 + swing * 4]
  const hands: readonly [Point, Point] = leadSide === 1
    ? [[-lowHand[0], lowHand[1]], highHand]
    : [[-highHand[0], highHand[1]], lowHand]
  ENDING_SPARKLES.forEach(([angle, reach], index) => {
    const twinkle = Math.max(0, Math.sin(sinceEntrance * 5 + index * 1.7))
    if (twinkle <= 0) return
    const sparkleX = width / 2 + Math.cos(angle + sinceEntrance * 0.6) * reach * scale
    const sparkleY = feetY - 60 * scale + Math.sin(angle + sinceEntrance * 0.6) * reach * 0.8 * scale
    drawStarSparkle(context, sparkleX, sparkleY, 6 * scale * twinkle * pop, RAINBOW[index % RAINBOW.length])
  })
  context.save()
  context.translate(width / 2, feetY - lift * 12 * scale)
  context.rotate(swing * 0.07)
  context.scale(pop / stretchY, pop * stretchY)
  drawRadi(context, unicornRadiLook, 0, 0, scale, {
    faceTurn: Math.sin(beat * Math.PI * 0.5) * 0.4,
    legLifts: leadSide === 1 ? [lift * 6, 0] : [0, lift * 6],
    kneeBends: leadSide === 1 ? [lift * 4, 0] : [0, lift * 4],
    hands,
  })
  context.restore()
}
