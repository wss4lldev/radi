import { ellipsePath, linePath, paintFill, paintLine, paintShape, type Context } from "@/characters/paint"
import { OUTLINE, OUTLINE_WIDTH, SILVER, drawRadi, type Point, type RadiLook } from "@/characters/radi"
import { drawKiraFront } from "@/characters/kira"
import { drawPartyPerson, type PartyPerson, type PartyPose } from "@/characters/partyPerson"
import { nightClubRadiLook } from "@/characters/radiConcepts"
import { prepareSceneSprites, releaseSceneSprites } from "@/characters/sprites"
import { drawExhaust } from "@/scenes/cityScene"
import { onLayersReleased } from "@/scenes/layerCache"
import { partyColor } from "@/scenes/nightClub"
import { easeOut, easeOutBack, mix, mixPoint, comicBubbleWidth, paintComicBubble, paintIris, radiScale, stageProgress, type BubbleButtonLayout } from "@/scenes/openingScene"

type PartyMove = "handsUp" | "pump" | "sway" | "drink" | "shuffle"
type Dancer = { x: number; isFront: boolean; person: PartyPerson; move: PartyMove; phase: number }
type RadiHands = readonly [Point, Point]

const IRIS_IN_END = 1.2
const WALK_IN_END = 1.15

export const clubWalkSteps = (clubSeconds: number) => {
  const walkIn = stageProgress(clubSeconds, 0, WALK_IN_END)
  if (walkIn <= 0) return null
  return walkIn * 4
}

const FUN_BUBBLE_START = 1.5
const FUN_BUBBLE_END = 5.1
const DANCE_START = 5.1
const OPEN_EYES_START = 10
const EXTRA_DANCE_SECONDS = 25
const DANCE_STOP_START = 12.8 + EXTRA_DANCE_SECONDS
const DANCE_STOP_END = 13.2 + EXTRA_DANCE_SECONDS
const ONLY_DANCE_BUBBLE_START = 13.2 + EXTRA_DANCE_SECONDS
const ONLY_DANCE_BUBBLE_END = 16.3 + EXTRA_DANCE_SECONDS
const BUBBLE_POP_SECONDS = 0.4
const BUBBLE_HIDE_SECONDS = 0.3
const FUN_BUBBLE_HOLD = FUN_BUBBLE_END - BUBBLE_HIDE_SECONDS
const FUN_BUBBLE_TEXT_OFFSET = -0.7
const LETS_DANCE_BUTTON_OFFSET = 1.3
const FIST_RAISE_START = 16.3 + EXTRA_DANCE_SECONDS
const FIST_RAISE_END = 16.7 + EXTRA_DANCE_SECONDS
export const LAUNCH_START = 17 + EXTRA_DANCE_SECONDS
const LAUNCH_END = 18.2 + EXTRA_DANCE_SECONDS
const LAUNCH_KICK_SECONDS = 0.25
const CROWD_AMAZED_START = 16.4 + EXTRA_DANCE_SECONDS
const CROWD_AMAZED_END = 17 + EXTRA_DANCE_SECONDS
const SHOCKWAVE_COUNT = 3
const SHOCKWAVE_GAP = 0.12
const SHOCKWAVE_SECONDS = 0.6
const DEBRIS_COUNT = 14
const DEBRIS_SECONDS = 1.2
const SONIC_BOOM_START = 17.7 + EXTRA_DANCE_SECONDS
const SONIC_BOOM_SECONDS = 0.45
const SHAKE_SECONDS = 0.6
const SHAKE_STRENGTH = 12
const FLASH_SECONDS = 0.35
const IRIS_OUT_START = 18.5 + EXTRA_DANCE_SECONDS
const IRIS_OUT_END = 19.8 + EXTRA_DANCE_SECONDS

export const CLUB_SCENE_END = IRIS_OUT_END

export const playedClubSeconds = (sceneSeconds: number, letsDanceSeconds: number | null) =>
  letsDanceSeconds === null ? Math.min(sceneSeconds, FUN_BUBBLE_HOLD) : FUN_BUBBLE_HOLD + letsDanceSeconds

export type SpecialMoveKind = 0 | 1
export type SpecialMove = { kind: SpecialMoveKind; seconds: number }
export const SPECIAL_MOVE_SECONDS: Record<SpecialMoveKind, number> = { 0: 3.2, 1: 1.7 }
const SPECIAL_MOVE_WAVE = 0.36
const SMOOTH_MOVES_START = DANCE_START + 10
const SMOOTH_MOVES_END = DANCE_STOP_START - 3.4
const PARTY_ARMS_UP: RadiHands = [[-19, -62], [19, -62]]
const RADI_ARMS_UP: RadiHands = [[-17, -58], [17, -58]]
const BODY_HEIGHT = 95

export const isSmoothMovesOpen = (sceneSeconds: number, letsDanceSeconds: number | null) => {
  if (letsDanceSeconds === null) return false
  const clubSeconds = playedClubSeconds(sceneSeconds, letsDanceSeconds)
  return clubSeconds >= SMOOTH_MOVES_START && clubSeconds < SMOOTH_MOVES_END
}

type MoveFrame = { shiftX: number; lift: number; flip: number; lean: number; arms: number; slide: number }
const STILL_FRAME: MoveFrame = { shiftX: 0, lift: 0, flip: 0, lean: 0, arms: 0, slide: 0 }
const MOONWALK_STOPS = [0, -1, 1, 0] as const

const smoothStep = (amount: number) => amount * amount * (3 - 2 * amount)

const specialMoveFrame = (move: SpecialMove | null, delay: number, reach: number, jump: number): MoveFrame => {
  if (!move) return STILL_FRAME
  const progress = stageProgress(move.seconds - delay, 0, SPECIAL_MOVE_SECONDS[move.kind] - SPECIAL_MOVE_WAVE)
  if (progress <= 0 || progress >= 1) return STILL_FRAME
  const swell = Math.sin(progress * Math.PI)
  if (move.kind === 0) {
    const legs = progress * 3
    const leg = Math.min(2, Math.floor(legs))
    const along = smoothStep(legs - leg)
    const from = MOONWALK_STOPS[leg]
    const to = MOONWALK_STOPS[leg + 1]
    return { ...STILL_FRAME, shiftX: mix(from, to, along) * reach, lean: -Math.sign(to - from) * 0.1 * Math.sin(along * Math.PI), slide: Math.sin(move.seconds * 14) * swell }
  }
  return { ...STILL_FRAME, lift: swell * jump, flip: -smoothStep(progress) * Math.PI * 2, arms: swell }
}

const withMoveFrame = (context: Context, frame: MoveFrame, centerX: number, feetY: number, bodyHeight: number, draw: () => void) => {
  if (frame === STILL_FRAME) {
    draw()
    return
  }
  context.save()
  context.translate(centerX + frame.shiftX, feetY - frame.lift)
  context.rotate(frame.lean)
  context.translate(0, -bodyHeight / 2)
  context.rotate(frame.flip)
  context.translate(0, bodyHeight / 2)
  context.translate(-centerX, -feetY)
  draw()
  context.restore()
}


const GROOVE_RATE = Math.PI * 2
const MOVE_SECONDS = 2
const MOVE_BLEND = 0.2
const DANCE_SPEED_START = 1
const DANCE_SPEED_STEP = 0.08
const DANCE_SPEED_EVERY = 3
const DANCE_SPEED_HOLD = 30
const FLOOR_TOP = 0.56
const FLOOR_ROWS = 7
const FLOOR_COLUMNS = 12
const LIGHT_SPECKS = 40
const BEAM_COUNT = 8
const RESTING_HANDS: RadiHands = [[-14, -32], [14, -32]]
const SUPERHERO_HANDS: RadiHands = [[-15, -34], [27, -64]]
const AMAZED_HANDS: readonly RadiHands[] = [[[-19, -56], [19, -56]], [[-14, -32], [22, -68]]]
const DJ_DESK_TOP = 0.32
const DJ_SCALE = 0.6
const KIRA_DJ_AT = 27
const KIRA_DJ_PUFF_LEAD = 0.4
const KIRA_DJ_SIZE = 1.3
const KIRA_DJ_RAISE = 8
const DJ_SWAP_PUFFS = Array.from({ length: 12 }, (_, index) => [(index / 12) * Math.PI * 2, 18 + (index % 3) * 8, 14 + (index % 4) * 3, ["255, 111, 181", "155, 93, 229", "255, 255, 255"][index % 3]] as const)
const DANCERS: readonly Dancer[] = [
  {
    x: 0.07, isFront: false, move: "handsUp", phase: 0.3,
    person: { skin: "#f2c9a8", hair: "short", hairColor: "#3b2a20", eyes: "dot", eyeColor: "#3a2814", build: "slim", face: "smile", top: "tee", topColor: "#ffffff", accentColor: "#ff3fa4", bottom: "jeans", bottomColor: "#3d5a8a", shoes: "sneakers", shoeColor: "#e63946", extras: ["stubble"] },
  },
  {
    x: 0.2, isFront: false, move: "sway", phase: 1.4,
    person: { skin: "#f8dfcf", hair: "long", hairColor: "#e8c77a", eyes: "lashes", eyeColor: "#4a8fd8", build: "curvy", face: "laugh", top: "tank", topColor: "#d4af37", accentColor: "#fff4b0", bottom: "skirt", bottomColor: "#d4af37", shoes: "heels", shoeColor: "#1d1d1d", extras: ["sequins", "earrings"] },
  },
  {
    x: 0.34, isFront: false, move: "pump", phase: 2.2,
    person: { skin: "#e8b994", hair: "buzz", hairColor: "#2a1f1a", eyes: "dot", eyeColor: "#3a2814", build: "broad", face: "vibing", top: "hoodie", topColor: "#3a3a3a", accentColor: "#ff8c1a", bottom: "jeans", bottomColor: "#22304a", shoes: "sneakers", shoeColor: "#ff8c1a", extras: ["cap"] },
  },
  {
    x: 0.66, isFront: false, move: "handsUp", phase: 0.9,
    person: { skin: "#f3cfb3", hair: "ponytail", hairColor: "#5a3420", eyes: "round", eyeColor: "#4caf6a", build: "slim", face: "smile", top: "crop", topColor: "#ff3fa4", accentColor: "#ffffff", bottom: "skirt", bottomColor: "#1d1d1d", shoes: "sneakers", shoeColor: "#ffffff", extras: ["earrings"] },
  },
  {
    x: 0.8, isFront: false, move: "shuffle", phase: 2.8,
    person: { skin: "#ead0b8", hair: "bald", hairColor: "#8a8a8a", eyes: "sleepy", eyeColor: "#6b4a2e", build: "broad", face: "laugh", top: "blazer", topColor: "#2a3a6a", accentColor: "#ffffff", bottom: "jeans", bottomColor: "#1d1d1d", shoes: "loafers", shoeColor: "#5a3420", extras: ["mustache"] },
  },
  {
    x: 0.93, isFront: false, move: "sway", phase: 1.9,
    person: { skin: "#f6d7c3", hair: "curly", hairColor: "#8a3a1a", eyes: "round", eyeColor: "#8a6a3a", build: "curvy", face: "smile", top: "tee", topColor: "#50c878", accentColor: "#ffe23f", bottom: "shorts", bottomColor: "#3d5a8a", shoes: "sneakers", shoeColor: "#ffffff", extras: [] },
  },
  {
    x: 0.1, isFront: true, move: "pump", phase: 0.6,
    person: { skin: "#f6d7c3", hair: "mohawk", hairColor: "#2a1f1a", eyes: "dot", eyeColor: "#3a2814", build: "slim", face: "laugh", top: "tank", topColor: "#1d1d1d", accentColor: "#3fd0ff", bottom: "jeans", bottomColor: "#2a2a2a", shoes: "boots", shoeColor: "#1d1d1d", extras: ["chain"] },
  },
  {
    x: 0.27, isFront: true, move: "handsUp", phase: 2.5,
    person: { skin: "#f8dfcf", hair: "bob", hairColor: "#ff6fae", eyes: "lashes", eyeColor: "#8a9aac", build: "slim", face: "vibing", top: "tank", topColor: "#3fd0ff", accentColor: "#ffffff", bottom: "skirt", bottomColor: "#3fd0ff", shoes: "heels", shoeColor: "#ffffff", extras: ["sequins", "earrings"] },
  },
  {
    x: 0.73, isFront: true, move: "drink", phase: 1.1,
    person: { skin: "#f2c9a8", hair: "short", hairColor: "#c9a46a", eyes: "round", eyeColor: "#4a8fd8", build: "broad", face: "smile", top: "shirt", topColor: "#3fa7d6", accentColor: "#ffffff", bottom: "jeans", bottomColor: "#3d5a8a", shoes: "loafers", shoeColor: "#1d1d1d", extras: ["beard", "drink"] },
  },
  {
    x: 0.9, isFront: true, move: "sway", phase: 3.1,
    person: { skin: "#d9a77c", hair: "bun", hairColor: "#2a1f1a", eyes: "sleepy", eyeColor: "#6b4a2e", build: "curvy", face: "laugh", top: "crop", topColor: "#8f5bff", accentColor: "#ff3fa4", bottom: "jeans", bottomColor: "#e8e8f0", shoes: "heels", shoeColor: "#d4af37", extras: ["sunglasses", "earrings"] },
  },
]

onLayersReleased("club", () => releaseSceneSprites("club"))

const SMILING_RADI_LOOK: RadiLook = { ...nightClubRadiLook, expression: "grin" }

const DJ_LOOK: RadiLook = {
  pose: "wave",
  polished: true,
  colors: { skin: "#6e4126", hair: "#1f1a17", hairHighlight: "#4a3f38", eye: "#3a2814", iris: "#6b4a2e" },
  hair: "tucked",
  expression: "grin",
  top: { color: "#2a2440", pattern: "comic" },
  bottom: { kind: "shorts", color: "#1d1d1d" },
  extras: ["headphones", "sunglasses"],
  shoes: "sneakers",
}

const drawClubRoom = (context: Context, width: number, height: number, time: number) => {
  const wall = context.createLinearGradient(0, 0, 0, height * FLOOR_TOP)
  wall.addColorStop(0, "#0d0626")
  wall.addColorStop(1, "#3a1a6b")
  context.fillStyle = wall
  context.fillRect(0, 0, width, height * FLOOR_TOP)
  for (let stripIndex = 0; stripIndex < 2; stripIndex += 1) {
    const stripY = height * (0.3 + stripIndex * 0.08)
    paintLine(context, partyColor(stripIndex * 2, time, 0.35), 10, linePath(0, stripY, width, stripY))
    paintLine(context, partyColor(stripIndex * 2, time, 0.9), 3, linePath(0, stripY, width, stripY))
  }
}

const drawDanceFloor = (context: Context, width: number, height: number, time: number) => {
  const floorTop = height * FLOOR_TOP
  const vanishY = floorTop - height * 0.25
  context.fillStyle = "#140a2e"
  context.fillRect(0, floorTop, width, height - floorTop)
  const rowEdges = Array.from({ length: FLOOR_ROWS + 1 }, (_, rowIndex) => floorTop + (height - floorTop) * (rowIndex / FLOOR_ROWS) ** 1.6)
  const columnX = (columnEdge: number, rowY: number) => width / 2 + (columnEdge * width * 0.125 * (rowY - vanishY)) / (height - vanishY)
  for (let rowIndex = 0; rowIndex < FLOOR_ROWS; rowIndex += 1) {
    const topY = rowEdges[rowIndex]
    const bottomY = rowEdges[rowIndex + 1]
    for (let columnIndex = -FLOOR_COLUMNS; columnIndex < FLOOR_COLUMNS; columnIndex += 1) {
      const tileIndex = Math.abs(rowIndex * 3 + columnIndex * 2)
      const flash = 0.25 + 0.45 * ((tileIndex + Math.floor(time * 2)) % 3 === 0 ? 1 : 0)
      paintFill(context, partyColor(tileIndex, time, flash), (path) => {
        path.moveTo(columnX(columnIndex, topY), topY)
        path.lineTo(columnX(columnIndex + 1, topY), topY)
        path.lineTo(columnX(columnIndex + 1, bottomY), bottomY)
        path.lineTo(columnX(columnIndex, bottomY), bottomY)
        path.closePath()
      })
    }
  }
}

const drawDiscoBall = (context: Context, width: number, height: number, time: number) => {
  const ballX = width / 2
  const ballY = height * 0.09
  const radius = Math.min(width, height) * 0.04
  context.save()
  context.lineWidth = 2
  context.strokeStyle = OUTLINE
  paintLine(context, SILVER, 2, linePath(ballX, 0, ballX, ballY - radius))
  paintShape(context, SILVER, ellipsePath(ballX, ballY, radius, radius), {
    decorateInside: (insideContext) => {
      const facetSize = radius / 3
      const spin = (time * facetSize * 2) % (facetSize * 2)
      for (let facetY = ballY - radius; facetY < ballY + radius; facetY += facetSize) {
        for (let facetX = ballX - radius - facetSize * 2 + spin; facetX < ballX + radius; facetX += facetSize * 2) {
          const isShifted = Math.round((facetY - ballY) / facetSize) % 2 === 0
          insideContext.fillStyle = "rgba(255, 255, 255, 0.75)"
          insideContext.fillRect(facetX + (isShifted ? facetSize : 0), facetY, facetSize * 0.8, facetSize * 0.8)
        }
      }
    },
  })
  context.restore()
  return { ballX, ballY }
}

const drawLightBeams = (context: Context, width: number, height: number, time: number, ballX: number, ballY: number) => {
  const beamLength = Math.hypot(width, height)
  for (let beamIndex = 0; beamIndex < BEAM_COUNT; beamIndex += 1) {
    const angle = Math.PI / 2 + Math.sin(time * 0.8 + beamIndex * 1.3) * 1.1
    const spread = 0.06
    paintFill(context, partyColor(beamIndex, time, 0.16), (path) => {
      path.moveTo(ballX, ballY)
      path.lineTo(ballX + Math.cos(angle - spread) * beamLength, ballY + Math.sin(angle - spread) * beamLength)
      path.lineTo(ballX + Math.cos(angle + spread) * beamLength, ballY + Math.sin(angle + spread) * beamLength)
      path.closePath()
    })
  }
  for (let speckIndex = 0; speckIndex < LIGHT_SPECKS; speckIndex += 1) {
    const angle = speckIndex * 2.4 + time * 0.4
    const reach = (0.15 + ((speckIndex * 0.37) % 1) * 0.85) * Math.max(width, height) * 0.6
    const speckX = ballX + Math.cos(angle) * reach
    const speckY = ballY + Math.abs(Math.sin(angle)) * reach * 0.8
    paintFill(context, `rgba(255, 255, 255, ${0.35 + 0.35 * Math.sin(time * 3 + speckIndex)})`, ellipsePath(speckX, speckY, 2.5, 2.5))
  }
}

const danceHands = (move: number, groove: number): RadiHands => {
  if (move === 0) return [[-22, -62 + Math.sin(groove * 2) * 5], [22, -62 - Math.sin(groove * 2) * 5]]
  if (move === 1) return Math.sin(groove) > 0 ? [[-14, -30], [28, -66]] : [[-14, -30], [20, -24]]
  return [[-16 + Math.sin(groove) * 12, -42], [16 + Math.sin(groove) * 12, -42]]
}

const mixHands = (from: RadiHands, to: RadiHands, amount: number): RadiHands => [mixPoint(from[0], to[0], amount), mixPoint(from[1], to[1], amount)]

const dancePlaybackSeconds = (sinceEyes: number) => {
  const holdElapsed = Math.max(0, DANCE_SPEED_HOLD - OPEN_EYES_START)
  const played = Math.min(sinceEyes, holdElapsed)
  const steps = Math.floor(played / DANCE_SPEED_EVERY)
  const partial = played - steps * DANCE_SPEED_EVERY
  const completed = (steps * DANCE_SPEED_START + (DANCE_SPEED_STEP * steps * (steps - 1)) / 2) * DANCE_SPEED_EVERY
  const untilHold = completed + (DANCE_SPEED_START + steps * DANCE_SPEED_STEP) * partial
  return untilHold + Math.max(0, sinceEyes - holdElapsed) * (DANCE_SPEED_START + steps * DANCE_SPEED_STEP)
}

const danceMotionSeconds = (clubSeconds: number) => {
  const sinceEyes = clubSeconds - OPEN_EYES_START
  if (sinceEyes <= 0) return clubSeconds - DANCE_START
  return OPEN_EYES_START - DANCE_START + dancePlaybackSeconds(sinceEyes)
}

const danceGrooveTime = (time: number, clubSeconds: number) => {
  const sinceEyes = clubSeconds - OPEN_EYES_START
  if (sinceEyes <= 0) return time
  return time - sinceEyes + dancePlaybackSeconds(sinceEyes)
}

const radiDanceMotion = (danceSeconds: number, energy: number) => {
  const groove = danceSeconds * GROOVE_RATE
  const movePosition = danceSeconds / MOVE_SECONDS
  const move = Math.floor(movePosition) % 3
  const blend = stageProgress(movePosition % 1, 1 - MOVE_BLEND, 1)
  const [fromHands, toHands] = [danceHands(move, groove), danceHands((move + 1) % 3, groove)]
  const kick = Math.sin(groove) * energy
  return {
    hop: Math.abs(kick) * 5,
    motion: {
      faceTurn: Math.sin(groove * 0.5) * 0.4 * energy,
      legLifts: [Math.max(0, kick) * 6, Math.max(0, -kick) * 6] as const,
      kneeBends: [Math.max(0, kick) * 3, Math.max(0, -kick) * 3] as const,
      hands: mixHands(RESTING_HANDS, mixHands(fromHands, toHands, blend), stageProgress(danceSeconds, 0, MOVE_BLEND) * energy),
    },
  }
}

const bubblePopScale = (clubSeconds: number, start: number, end: number) =>
  easeOutBack(stageProgress(clubSeconds, start, start + BUBBLE_POP_SECONDS)) * (1 - stageProgress(clubSeconds, end - BUBBLE_HIDE_SECONDS, end))

const LAUNCH_CURVE = 2.5
const launchHeight = (clubSeconds: number, feetY: number, scale: number) => {
  const distance = feetY + 20 * scale
  const coast = Math.max(0, clubSeconds - LAUNCH_END) * (LAUNCH_CURVE / (LAUNCH_END - LAUNCH_START))
  return (stageProgress(clubSeconds, LAUNCH_START, LAUNCH_END) ** LAUNCH_CURVE + coast) * distance
}

const drawPowerAura = (context: Context, radiX: number, feetY: number, scale: number, time: number, glow: number) => {
  if (glow <= 0) return
  const centerY = feetY - 50 * scale
  const radius = 75 * scale * (1 + Math.sin(time * 20) * 0.08)
  const aura = context.createRadialGradient(radiX, centerY, 0, radiX, centerY, radius)
  aura.addColorStop(0, `rgba(255, 255, 220, ${0.55 * glow})`)
  aura.addColorStop(0.5, `rgba(255, 120, 200, ${0.25 * glow})`)
  aura.addColorStop(1, "rgba(255, 120, 200, 0)")
  paintFill(context, aura, ellipsePath(radiX, centerY, radius, radius))
}

const drawClubRadi = (context: Context, radiX: number, feetY: number, scale: number, time: number, clubSeconds: number, move: MoveFrame) => {
  const isSmiling = clubSeconds < FUN_BUBBLE_END || clubSeconds >= OPEN_EYES_START
  const look = isSmiling ? SMILING_RADI_LOOK : nightClubRadiLook
  if (clubSeconds < DANCE_START) {
    const isWalkingIn = clubSeconds < WALK_IN_END
    const stride = isWalkingIn ? Math.sin(stageProgress(clubSeconds, 0, WALK_IN_END) * Math.PI * 4) : 0
    const leadingLift = Math.max(0, stride) * 8
    const trailingLift = Math.max(0, -stride) * 8
    drawRadi(context, look, radiX, feetY, scale, {
      faceTurn: isWalkingIn ? 0.4 : Math.sin(time * 1.5) * 0.15,
      hands: isWalkingIn ? [[-15, -31 - trailingLift], [15, -31 - leadingLift]] : RESTING_HANDS,
      legLifts: [leadingLift, trailingLift],
      kneeBends: [leadingLift * 0.7, trailingLift * 0.7],
    }, "club")
    return
  }
  const { hop, motion } = radiDanceMotion(danceMotionSeconds(clubSeconds), 1 - stageProgress(clubSeconds, DANCE_STOP_START, DANCE_STOP_END))
  const hands = mixHands(mixHands(motion.hands, SUPERHERO_HANDS, stageProgress(clubSeconds, FIST_RAISE_START, FIST_RAISE_END)), RADI_ARMS_UP, move.arms)
  const legLifts = [motion.legLifts[0] + Math.max(0, move.slide) * 5, motion.legLifts[1] + Math.max(0, -move.slide) * 5] as const
  const hasLaunched = clubSeconds >= LAUNCH_START
  const crouch = hasLaunched ? 0 : stageProgress(clubSeconds, FIST_RAISE_END, LAUNCH_START)
  const stretch = hasLaunched ? 0.12 + 0.25 * (1 - stageProgress(clubSeconds, LAUNCH_START, LAUNCH_START + LAUNCH_KICK_SECONDS)) : 0
  const bodyFeetY = feetY - hop * scale - launchHeight(clubSeconds, feetY, scale)
  drawPowerAura(context, radiX, bodyFeetY, scale, time, hasLaunched ? 1 : crouch * 0.8)
  context.save()
  context.translate(radiX, bodyFeetY)
  context.scale(1 + crouch * 0.12 - stretch * 0.5, 1 - crouch * 0.18 + stretch)
  drawRadi(context, look, 0, 0, scale, { ...motion, legLifts, kneeBends: [motion.kneeBends[0] + crouch * 3, motion.kneeBends[1] + crouch * 3], hands }, crouch === 0 && stretch === 0 ? "club" : undefined)
  context.restore()
}

const drawTakeoff = (context: Context, radiX: number, feetY: number, scale: number, time: number, clubSeconds: number) => {
  const sinceLaunch = clubSeconds - LAUNCH_START
  if (sinceLaunch < 0) return
  for (let ringIndex = 0; ringIndex < SHOCKWAVE_COUNT; ringIndex += 1) {
    const wave = stageProgress(sinceLaunch, ringIndex * SHOCKWAVE_GAP, ringIndex * SHOCKWAVE_GAP + SHOCKWAVE_SECONDS)
    if (wave <= 0 || wave >= 1) continue
    paintLine(context, `rgba(255, 255, 255, ${1 - wave})`, (4 - ringIndex) * scale, ellipsePath(radiX, feetY, (20 + wave * 110) * scale, (6 + wave * 26) * scale))
  }
  if (sinceLaunch < DEBRIS_SECONDS) {
    for (let pieceIndex = 0; pieceIndex < DEBRIS_COUNT; pieceIndex += 1) {
      const angle = Math.PI * (1.08 + (pieceIndex / (DEBRIS_COUNT - 1)) * 0.84)
      const speed = 70 + ((pieceIndex * 37) % 60)
      const pieceSize = (3 + (pieceIndex % 3)) * scale
      context.save()
      context.translate(radiX + Math.cos(angle) * speed * sinceLaunch * scale, feetY + (Math.sin(angle) * speed * sinceLaunch + 160 * sinceLaunch ** 2) * scale)
      context.rotate(sinceLaunch * (8 + pieceIndex))
      context.globalAlpha = 1 - sinceLaunch / DEBRIS_SECONDS
      paintFill(context, partyColor(pieceIndex, time, 1), (path) => path.rect(-pieceSize / 2, -pieceSize / 2, pieceSize, pieceSize))
      context.restore()
    }
  }
  const boom = stageProgress(clubSeconds, SONIC_BOOM_START, SONIC_BOOM_START + SONIC_BOOM_SECONDS)
  if (boom > 0 && boom < 1) {
    const boomY = feetY - launchHeight(SONIC_BOOM_START, feetY, scale) - 40 * scale
    paintLine(context, `rgba(255, 255, 255, ${0.9 * (1 - boom)})`, 3 * scale, ellipsePath(radiX, boomY, (25 + boom * 80) * scale, (8 + boom * 22) * scale))
  }
  context.save()
  context.translate(radiX, feetY - launchHeight(clubSeconds, feetY, scale))
  context.rotate(-Math.PI / 2)
  context.scale(scale, scale)
  drawExhaust(context, time, 1)
  context.restore()
}

const partyHands = (move: PartyMove, groove: number): PartyPose["hands"] => {
  const beat = Math.sin(groove)
  if (move === "handsUp") return [[-19 - Math.sin(groove * 2) * 2, -62], [19 + Math.sin(groove * 2) * 2, -62]]
  if (move === "pump") return [[-12, -52 - Math.max(0, beat) * 12], [14, -30]]
  if (move === "sway") return [[-8 + beat * 7, -36], [8 + beat * 7, -36]]
  if (move === "drink") return [[-20, -58 + Math.sin(groove * 2) * 4], [18, -32 - Math.max(0, beat) * 3]]
  return [[-15, -30 + beat * 4], [15, -30 - beat * 4]]
}

const partyPose = (move: PartyMove, groove: number, amazement: number, amazedHands: RadiHands): PartyPose => {
  const beat = Math.sin(groove) * (1 - amazement)
  return {
    hands: mixHands(partyHands(move, groove), amazedHands, amazement),
    bounce: Math.abs(beat) * 2,
    sway: beat * 2,
    headTilt: Math.sin(groove * 0.5) * 0.12 * (1 - amazement),
    footLifts: [Math.max(0, beat) * 3, Math.max(0, -beat) * 3],
    lookUp: amazement,
  }
}

const drawCrowd = (context: Context, width: number, height: number, time: number, scale: number, isFront: boolean, amazement: number, specialMove: SpecialMove | null) => {
  DANCERS.forEach((dancer, dancerIndex) => {
    if (dancer.isFront !== isFront) return
    const personScale = scale * (isFront ? 1.15 : 0.62)
    const feetX = width * dancer.x
    const feetY = height * (isFront ? 1.08 : 0.66)
    const frame = specialMoveFrame(specialMove, dancer.x * SPECIAL_MOVE_WAVE, width * 0.06, 70 * personScale)
    const dancing = partyPose(dancer.move, time * GROOVE_RATE + dancer.phase, amazement, AMAZED_HANDS[dancerIndex % AMAZED_HANDS.length])
    const pose: PartyPose = frame === STILL_FRAME
      ? dancing
      : { ...dancing, hands: mixHands(dancing.hands, PARTY_ARMS_UP, frame.arms), footLifts: [dancing.footLifts[0] + Math.max(0, frame.slide) * 4, dancing.footLifts[1] + Math.max(0, -frame.slide) * 4] }
    const person: PartyPerson = amazement > 0.5 ? { ...dancer.person, face: "amazed" } : dancer.person
    withMoveFrame(context, frame, feetX, feetY, BODY_HEIGHT * personScale, () => drawPartyPerson(context, person, feetX, feetY, personScale, pose, "club"))
  })
}

const drawKiraDj = (context: Context, centerX: number, feetY: number, djScale: number, time: number, beat: number) => {
  const kiraScale = djScale * KIRA_DJ_SIZE
  const kiraFeetY = feetY - KIRA_DJ_RAISE * djScale - beat * 2.5 * djScale
  context.save()
  context.translate(centerX, kiraFeetY)
  context.rotate(Math.sin(time * GROOVE_RATE) * 0.08)
  context.translate(-centerX, -kiraFeetY)
  drawKiraFront(context, centerX, kiraFeetY, kiraScale)
  context.translate(centerX, kiraFeetY)
  context.scale(kiraScale, kiraScale)
  context.lineJoin = "round"
  context.lineCap = "round"
  context.lineWidth = OUTLINE_WIDTH
  context.strokeStyle = OUTLINE
  const tongueLength = 11 + Math.abs(Math.sin(time * GROOVE_RATE)) * 2
  paintShape(context, "#ff7f9a", (path) => {
    path.moveTo(-3.2, -42.6)
    path.quadraticCurveTo(0, -43.4, 3.2, -42.6)
    path.quadraticCurveTo(3.9, -42.6 + tongueLength * 0.95, 0, -42.6 + tongueLength)
    path.quadraticCurveTo(-3.9, -42.6 + tongueLength * 0.95, -3.2, -42.6)
    path.closePath()
  })
  paintLine(context, OUTLINE, 0.6, linePath(0, -41.8, 0, -42.6 + tongueLength * 0.7))
  for (const side of [-1, 1]) {
    paintShape(context, "#1d1d1d", (path) => path.roundRect(side * 7.5 - 5, -57, 10, 7.5, 2.5), {
      decorateInside: (lensContext) => paintLine(lensContext, "#7fd1ff", 1.2, linePath(side * 7.5 - 3, -51.5, side * 7.5 + 2, -56)),
    })
  }
  paintLine(context, OUTLINE, 1.2, linePath(-2.5, -55, 2.5, -55))
  context.restore()
}

const drawDjSwapPuff = (context: Context, width: number, height: number, scale: number, clubSeconds: number) => {
  const puff = stageProgress(clubSeconds, KIRA_DJ_AT - KIRA_DJ_PUFF_LEAD, KIRA_DJ_AT + KIRA_DJ_PUFF_LEAD)
  if (puff <= 0 || puff >= 1) return
  const djScale = scale * DJ_SCALE
  const centerX = width / 2
  const centerY = height * DJ_DESK_TOP - 30 * djScale
  const swell = Math.sin(puff * Math.PI)
  DJ_SWAP_PUFFS.forEach(([angle, reach, size, color]) => {
    const radius = size * djScale * (0.4 + swell * 0.8)
    const x = centerX + Math.cos(angle) * reach * djScale * (0.5 + puff)
    const y = centerY + Math.sin(angle) * reach * 0.7 * djScale * (0.5 + puff) - puff * 10 * djScale
    paintFill(context, `rgba(${color}, ${0.92 * swell})`, ellipsePath(x, y, radius, radius * 0.85))
    paintFill(context, `rgba(255, 255, 255, ${0.5 * swell})`, ellipsePath(x - radius * 0.3, y - radius * 0.3, radius * 0.35, radius * 0.28))
  })
}

const drawDjBooth = (context: Context, width: number, height: number, time: number, scale: number, clubSeconds: number, specialMove: SpecialMove | null) => {
  const djScale = scale * DJ_SCALE
  const feetY = height * DJ_DESK_TOP + 28 * djScale
  const beat = Math.abs(Math.sin(time * GROOVE_RATE))
  const inBoothUnits = (drawInBooth: () => void) => {
    context.save()
    context.translate(width / 2, feetY)
    context.scale(djScale, djScale)
    context.lineJoin = "round"
    context.lineWidth = OUTLINE_WIDTH
    context.strokeStyle = OUTLINE
    drawInBooth()
    context.restore()
  }
  inBoothUnits(() => {
    for (const side of [-1, 1]) {
      const speakerX = side * 62
      paintShape(context, "#2a2440", (path) => path.roundRect(speakerX - 15, -66, 30, 72, 3))
      for (const [coneY, coneRadius] of [[-48, 9], [-18, 12]]) {
        const pulsingRadius = coneRadius * (1 + beat * 0.12)
        paintShape(context, "#4a4466", ellipsePath(speakerX, coneY, pulsingRadius, pulsingRadius))
        paintShape(context, "#15121f", ellipsePath(speakerX, coneY, pulsingRadius * 0.45, pulsingRadius * 0.45))
      }
    }
    paintShape(context, "#3a3450", (path) => {
      path.moveTo(-46, -34)
      path.lineTo(46, -34)
      path.lineTo(48, -28)
      path.lineTo(-48, -28)
      path.closePath()
    })
    for (const side of [-1, 1]) {
      const spin = time * 8 * side
      paintShape(context, "#15121f", ellipsePath(side * 24, -31, 11, 2.6))
      paintFill(context, partyColor(side + 1, time, 1), ellipsePath(side * 24, -31, 3, 0.8))
      paintLine(context, "rgba(255, 255, 255, 0.5)", 0.6, linePath(side * 24, -31, side * 24 + Math.cos(spin) * 9, -31 + Math.sin(spin) * 2.1))
    }
  })
  const hype = Math.max(0, Math.sin(time * 1.5))
  const isKiraDj = clubSeconds >= KIRA_DJ_AT
  const djFrame = specialMoveFrame(specialMove, 0.5 * SPECIAL_MOVE_WAVE, 22 * djScale, 50 * djScale)
  withMoveFrame(context, djFrame, width / 2, feetY, BODY_HEIGHT * djScale, () => {
    if (isKiraDj) {
      drawKiraDj(context, width / 2, feetY, djScale, time, beat)
      return
    }
    drawRadi(context, DJ_LOOK, width / 2, feetY - beat * 2 * djScale, djScale, {
      faceTurn: Math.sin(time * Math.PI) * 0.3,
      hands: [mixPoint([-24, -33], [-22, -66 + Math.sin(time * GROOVE_RATE * 2) * 3], hype), [24 + Math.sin(time * 10) * 3, -33]],
    }, "club")
  })
  inBoothUnits(() => {
    paintShape(context, "#2a2440", (path) => path.rect(-48, -28, 96, 34))
    for (let barIndex = 0; barIndex < 12; barIndex += 1) {
      const barHeight = 4 + Math.abs(Math.sin(time * 6 + barIndex * 1.7)) * 18
      paintFill(context, partyColor(barIndex, time, 0.9), (path) => path.rect(-41 + barIndex * 7, 2 - barHeight, 4, barHeight))
    }
    paintLine(context, partyColor(0, time, 0.9), 2.5, linePath(-48, 6, 48, 6))
  })
}

const drawSpotlight = (context: Context, radiX: number, feetY: number, scale: number, time: number) => {
  const pulse = 0.85 + Math.sin(time * GROOVE_RATE) * 0.15
  paintFill(context, `rgba(255, 255, 255, ${0.12 * pulse})`, (path) => {
    path.moveTo(radiX - 10 * scale, 0)
    path.lineTo(radiX + 10 * scale, 0)
    path.lineTo(radiX + 55 * scale, feetY)
    path.lineTo(radiX - 55 * scale, feetY)
    path.closePath()
  })
  paintFill(context, `rgba(255, 255, 255, ${0.35 * pulse})`, ellipsePath(radiX, feetY, 55 * scale, 12 * scale))
}

const clubRadiPosition = (width: number, height: number, clubSeconds = WALK_IN_END) => {
  const scale = radiScale(width, height) * 1.15
  const walkIn = stageProgress(clubSeconds, 0, WALK_IN_END)
  const stride = walkIn < 1 ? Math.sin(walkIn * Math.PI * 4) : 0
  return {
    scale,
    radiX: mix(width * 0.34, width / 2, easeOut(walkIn)),
    feetY: height * 0.84 - Math.abs(stride) * 3 * scale,
  }
}

const radiBubbleGeometry = (width: number, height: number, radiX: number, feetY: number, scale: number) => {
  const bubbleWidth = comicBubbleWidth(width, height, 0.44, 380)
  const bubbleHeight = bubbleWidth * 0.5
  return {
    bubbleWidth,
    bubbleHeight,
    fontSize: bubbleWidth * 0.075,
    centerX: Math.min(width - bubbleWidth / 2 - 12, radiX + bubbleWidth * 0.4),
    centerY: Math.max(bubbleHeight / 2 + 12, feetY - 125 * scale - bubbleHeight * 0.4),
  }
}

const SMOOTH_MOVES_WIDTH_EM = 9.4
const SMOOTH_MOVES_MIN_FONT = 18

export const smoothMovesButtonLayout = (width: number, height: number): BubbleButtonLayout => {
  const djScale = clubRadiPosition(width, height).scale * DJ_SCALE
  const boothFeetY = height * DJ_DESK_TOP + 28 * djScale
  const boothRight = width / 2 + 82 * djScale
  const besideFont = Math.min(34, Math.max(SMOOTH_MOVES_MIN_FONT, width * 0.024), (width - boothRight - 16) / (SMOOTH_MOVES_WIDTH_EM + 0.5))
  if (besideFont >= SMOOTH_MOVES_MIN_FONT) {
    return { centerX: boothRight + besideFont * (0.5 + SMOOTH_MOVES_WIDTH_EM / 2), centerY: boothFeetY - 34 * djScale, width: besideFont * SMOOTH_MOVES_WIDTH_EM, fontSize: besideFont }
  }
  const belowFont = Math.min(26, (width - 32) / SMOOTH_MOVES_WIDTH_EM)
  return { centerX: width / 2, centerY: boothFeetY + 6 * djScale + belowFont * 1.4, width: belowFont * SMOOTH_MOVES_WIDTH_EM, fontSize: belowFont }
}

export const smoothMovesButtonTransform = (move: SpecialMove | null, fontSize: number) => {
  const frame = specialMoveFrame(move, 0.5 * SPECIAL_MOVE_WAVE, fontSize * 1.5, fontSize * 2.5)
  if (frame === STILL_FRAME) return ""
  return `translate(${frame.shiftX}px, ${-frame.lift}px) rotate(${frame.lean + frame.flip}rad) skewX(${frame.slide * -8}deg)`
}

export const letsDanceButtonLayout =(width: number, height: number, clubSeconds: number, letsDanceSeconds: number | null): BubbleButtonLayout => {
  if (letsDanceSeconds !== null || clubSeconds < FUN_BUBBLE_START + BUBBLE_POP_SECONDS) return null
  const { scale, radiX, feetY } = clubRadiPosition(width, height)
  const { bubbleWidth, fontSize, centerX, centerY } = radiBubbleGeometry(width, height, radiX, feetY, scale)
  return { centerX, centerY: centerY + fontSize * LETS_DANCE_BUTTON_OFFSET, width: bubbleWidth * 0.6, fontSize }
}

const drawRadiBubble = (context: Context, width: number, height: number, radiX: number, feetY: number, scale: number, popScale: number, lines: readonly [string, string], textOffsetY = 0) => {
  if (popScale <= 0) return
  const { bubbleWidth, bubbleHeight, fontSize, centerX, centerY } = radiBubbleGeometry(width, height, radiX, feetY, scale)
  const headX = radiX + 12 * scale - centerX
  const headY = feetY - 90 * scale - centerY
  context.save()
  context.translate(centerX, centerY)
  context.scale(popScale, popScale)
  paintComicBubble(context, [
    ellipsePath(0, 0, bubbleWidth / 2, bubbleHeight / 2),
    (path) => {
      path.moveTo(-bubbleWidth * 0.3, bubbleHeight * 0.25)
      path.lineTo(headX, headY)
      path.lineTo(-bubbleWidth * 0.14, bubbleHeight * 0.38)
      path.closePath()
    },
  ], Math.max(3, bubbleWidth * 0.012), lines, 0, textOffsetY * fontSize, fontSize)
  context.restore()
}

export const drawClubScene = (context: Context, width: number, height: number, time: number, sceneSeconds: number, letsDanceSeconds: number | null, specialMove: SpecialMove | null = null) => {
  const clubSeconds = playedClubSeconds(sceneSeconds, letsDanceSeconds)
  const { scale, radiX, feetY } = clubRadiPosition(width, height, clubSeconds)
  const sinceLaunch = clubSeconds - LAUNCH_START
  const shake = sinceLaunch >= 0 ? (1 - stageProgress(sinceLaunch, 0, SHAKE_SECONDS)) * SHAKE_STRENGTH : 0
  const flash = sinceLaunch >= 0 ? 0.8 * (1 - stageProgress(sinceLaunch, 0, FLASH_SECONDS)) : 0
  const amazement = stageProgress(clubSeconds, CROWD_AMAZED_START, CROWD_AMAZED_END)
  const grooveTime = danceGrooveTime(time, clubSeconds)
  prepareSceneSprites("club", `${width} ${height}`)
  if (shake > 0) {
    context.fillStyle = "#0d0626"
    context.fillRect(0, 0, width, height)
  }
  context.save()
  context.translate(Math.sin(time * 90) * shake, Math.cos(time * 73) * shake)
  drawClubRoom(context, width, height, grooveTime)
  drawDanceFloor(context, width, height, grooveTime)
  drawDjBooth(context, width, height, grooveTime, scale, clubSeconds, specialMove)
  drawDjSwapPuff(context, width, height, scale, clubSeconds)
  const { ballX, ballY } = drawDiscoBall(context, width, height, grooveTime)
  drawCrowd(context, width, height, grooveTime, scale, false, amazement, specialMove)
  const radiFrame = specialMoveFrame(specialMove, 0.5 * SPECIAL_MOVE_WAVE, width * 0.06, 70 * scale)
  drawSpotlight(context, radiX + radiFrame.shiftX, feetY, scale, grooveTime)
  drawTakeoff(context, radiX, feetY, scale, time, clubSeconds)
  withMoveFrame(context, radiFrame, radiX, feetY, BODY_HEIGHT * scale, () => drawClubRadi(context, radiX, feetY, scale, grooveTime, clubSeconds, radiFrame))
  drawLightBeams(context, width, height, grooveTime, ballX, ballY)
  drawCrowd(context, width, height, grooveTime, scale, true, amazement, specialMove)
  drawRadiBubble(context, width, height, radiX, feetY, scale, bubblePopScale(clubSeconds, FUN_BUBBLE_START, FUN_BUBBLE_END), ["And I like to have fun", "and dance!"], FUN_BUBBLE_TEXT_OFFSET)
  drawRadiBubble(context, width, height, radiX, feetY, scale, bubblePopScale(clubSeconds, ONLY_DANCE_BUBBLE_START, ONLY_DANCE_BUBBLE_END), ["But it's not all", "fun and games..."])
  context.restore()
  if (flash > 0) paintFill(context, `rgba(255, 255, 255, ${flash})`, (path) => path.rect(0, 0, width, height))
  const fullRadius = Math.hypot(width, height)
  const home = clubRadiPosition(width, height)
  const irisCenterY = home.feetY - 60 * scale
  if (clubSeconds < IRIS_IN_END) paintIris(context, width, height, home.radiX, irisCenterY, mix(0, fullRadius, stageProgress(clubSeconds, 0, IRIS_IN_END) ** 2))
  if (clubSeconds > IRIS_OUT_START) paintIris(context, width, height, home.radiX, irisCenterY, mix(fullRadius, 0, stageProgress(clubSeconds, IRIS_OUT_START, IRIS_OUT_END) ** 2))
}
