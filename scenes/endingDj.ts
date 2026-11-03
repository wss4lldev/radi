import { BEAT_HISTORY } from "@/audio/outroWave"
import { type Context } from "@/characters/paint"
import { RAINBOW, type Point } from "@/characters/radi"
import { DJ_PANEL, DJ_RECORD_X, drawDjDeck, drawDjPanel, drawKiraDj, kiraDjShoulder, type SpeakerShades } from "@/scenes/clubScene"
import { rainbowGradient, type OutroPlayback } from "@/scenes/endingKaraoke"
import { easeInOut } from "@/scenes/libraryScene"
import { clampToUnit, mix, mixPoint } from "@/scenes/openingScene"

const DJ_SIZE = 0.9
const DJ_MAX_WIDTH = 0.42
const DJ_BOOTH_UNITS = 154
const RADI_HALF_UNITS = 40
const STAGE_GAP_UNITS = 30
const KIRA_SINK = 6
const PAW_X = DJ_RECORD_X - 6
const PAW_Y = -32 - KIRA_SINK
const PAW_SCRATCH_RATE = 7
const PAW_SCRATCH_REACH = 5
const PAW_TAP_LIFT = 4
const CHEER_FIRST = 10
const CHEER_EVERY = 8.5
const CHEER_SECONDS = 3
const CHEER_RAISE = 0.3
const UPPER_ARM = 12
const UPPER_ARM_ANGLE = -0.45
const FOREARM = 12
const FOREARM_REST_TILT = 0.45
const FOREARM_PUMP_TILT = 0.1
const SPEAKER_SHADES: SpeakerShades = ["#4a4170", "#7a70b0", "#2a2440"]
const SCREEN_INSET = 3
const SCREEN_COLOR = "#0d0a18"
const WAVE_MIN_RANGE = 0.12
const WAVE_PUNCH = 1.5
const KICK_FRAMES = 14
const KICK_BASELINE_FROM = 4
const KICK_BASELINE_TO = 24
const KICK_GAIN = 2
const KICK_STRETCH = 0.6
const KICK_SHAKE = 0.008

const kickStrength = (history: readonly number[], range: number, age: number) => {
  const baseline = history.slice(age + KICK_BASELINE_FROM, age + KICK_BASELINE_TO)
  if (baseline.length === 0) return 0
  const average = baseline.reduce((sum, level) => sum + level, 0) / baseline.length
  return clampToUnit(((history[age] - average) / range) * KICK_GAIN)
}

const readBeats = (history: readonly number[]) => {
  const quietest = Math.min(...history, 1)
  const range = Math.max(Math.max(...history, 0) - quietest, WAVE_MIN_RANGE)
  const kicks = Array.from({ length: KICK_FRAMES }, (_, age) => kickStrength(history, range, age) * (1 - age / KICK_FRAMES) ** 2)
  const kickAge = kicks.reduce((strongest, kick, age) => (kick > kicks[strongest] ? age : strongest), 0)
  return { levels: history.map((level) => ((level - quietest) / range) ** WAVE_PUNCH), kick: kicks[kickAge], kickAge }
}

type Beats = ReturnType<typeof readBeats>

const drawSoundWave = (context: Context, screenX: number, screenY: number, span: number, reach: number, { levels, kick, kickAge }: Beats, seconds: number) => {
  const shake = span * KICK_SHAKE * kick
  const centerX = screenX + Math.sin(seconds * 97) * shake
  const centerY = screenY + Math.cos(seconds * 83) * shake
  const barGap = span / 2 / BEAT_HISTORY
  const beatColor = RAINBOW[Math.floor(seconds * 4) % RAINBOW.length]
  context.save()
  context.globalAlpha = kick * 0.45
  context.translate(centerX, centerY)
  context.scale(1, 0.35)
  const bloom = context.createRadialGradient(0, 0, 0, 0, 0, span * 0.6)
  bloom.addColorStop(0, beatColor)
  bloom.addColorStop(1, `${beatColor}00`)
  context.fillStyle = bloom
  context.fillRect(-span * 0.6, -span * 0.6, span * 1.2, span * 1.2)
  context.restore()
  const ringProgress = kickAge / KICK_FRAMES
  const ringRadius = mix(span * 0.1, span * 0.6, ringProgress)
  context.save()
  context.globalAlpha = kick
  context.lineWidth = Math.max(1.5, reach * 0.08 * (1 - ringProgress))
  context.strokeStyle = beatColor
  context.beginPath()
  context.ellipse(centerX, centerY, ringRadius, ringRadius * 0.3, 0, 0, Math.PI * 2)
  context.stroke()
  context.restore()
  context.save()
  context.lineCap = "round"
  context.beginPath()
  context.moveTo(centerX - span / 2, centerY)
  context.lineTo(centerX + span / 2, centerY)
  levels.forEach((level, index) => {
    const barHeight = reach * (0.06 + 0.94 * level) * (1 - index / BEAT_HISTORY) * (1 + kick * KICK_STRETCH)
    for (const side of [-1, 1]) {
      const x = centerX + side * (index + 0.5) * barGap
      context.moveTo(x, centerY - barHeight)
      context.lineTo(x, centerY + barHeight)
    }
  })
  context.shadowColor = beatColor
  context.shadowBlur = reach * (0.3 + kick * 2.5)
  context.lineWidth = Math.max(1, barGap * 0.55)
  context.strokeStyle = rainbowGradient(context, centerX - span / 2, span)
  context.stroke()
  context.globalAlpha = kick * 0.85
  context.shadowBlur = 0
  context.strokeStyle = "#ffffff"
  context.stroke()
  context.restore()
}

export const endingStage = (width: number, radiScale: number) => {
  const djScale = Math.min(radiScale * DJ_SIZE, (width * DJ_MAX_WIDTH) / DJ_BOOTH_UNITS)
  const boothHalf = (DJ_BOOTH_UNITS / 2) * djScale
  const halfGap = (STAGE_GAP_UNITS / 2) * radiScale
  return { djScale, boothHalf, radiX: width / 2 - boothHalf - halfGap, boothX: width / 2 + RADI_HALF_UNITS * radiScale + halfGap }
}

type EndingStage = ReturnType<typeof endingStage>

export const drawEndingDj = (context: Context, width: number, { djScale, boothHalf, boothX }: EndingStage, feetY: number, outro: OutroPlayback | null, rise: number) => {
  if (!outro || rise <= 0) return
  const centerX = mix(width + boothHalf, boothX, easeInOut(rise))
  const beats = readBeats(outro.beatHistory ?? [])
  const cheerTime = (outro.seconds - CHEER_FIRST) % CHEER_EVERY
  const cheer = easeInOut(Math.min(clampToUnit(cheerTime / CHEER_RAISE), clampToUnit((CHEER_SECONDS - cheerTime) / CHEER_RAISE)))
  drawDjDeck(context, centerX, feetY, djScale, outro.seconds, beats.kick, SPEAKER_SHADES)
  const shoulder = kiraDjShoulder(1, beats.kick)
  const deckPaw: Point = [PAW_X + Math.sin(outro.seconds * 2.3) * 2, PAW_Y - beats.kick * PAW_TAP_LIFT]
  const raisedElbow: Point = [shoulder[0] + Math.cos(UPPER_ARM_ANGLE) * UPPER_ARM, shoulder[1] + Math.sin(UPPER_ARM_ANGLE) * UPPER_ARM]
  const forearmAngle = -Math.PI / 2 + mix(FOREARM_REST_TILT, FOREARM_PUMP_TILT, beats.kick)
  const raisedPaw: Point = [raisedElbow[0] + Math.cos(forearmAngle) * FOREARM, raisedElbow[1] + Math.sin(forearmAngle) * FOREARM]
  drawKiraDj(context, centerX, feetY + KIRA_SINK * djScale, djScale, outro.seconds, beats.kick, [
    { paw: [-PAW_X + Math.sin(outro.seconds * PAW_SCRATCH_RATE) * PAW_SCRATCH_REACH, PAW_Y] },
    { elbow: mixPoint(mixPoint(shoulder, deckPaw, 0.5), raisedElbow, cheer), paw: mixPoint(deckPaw, raisedPaw, cheer) },
  ])
  drawDjPanel(context, centerX, feetY, djScale, outro.seconds)
  const screenLeft = centerX + (DJ_PANEL.left + SCREEN_INSET) * djScale
  const screenTop = feetY + (DJ_PANEL.top + SCREEN_INSET) * djScale
  const screenWidth = (DJ_PANEL.width - SCREEN_INSET * 2) * djScale
  const screenHeight = (DJ_PANEL.height - SCREEN_INSET * 2) * djScale
  context.save()
  context.beginPath()
  context.roundRect(screenLeft, screenTop, screenWidth, screenHeight, 2 * djScale)
  context.fillStyle = SCREEN_COLOR
  context.fill()
  context.clip()
  drawSoundWave(context, screenLeft + screenWidth / 2, screenTop + screenHeight / 2, screenWidth * 0.9, screenHeight * 0.4, beats, outro.seconds)
  context.restore()
}
