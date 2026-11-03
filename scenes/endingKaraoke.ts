import { type Context } from "@/characters/paint"
import { OUTLINE, RAINBOW } from "@/characters/radi"
import { BEAT_HISTORY } from "@/audio/outroWave"
import { OUTRO_LYRICS, type LyricLine } from "@/scenes/endingLyrics"
import { clampToUnit, mix } from "@/scenes/openingScene"

export type OutroPlayback = { songIndex: number; seconds: number; beatHistory: readonly number[] | null }

const FONT_STACK = `"Comic Sans MS", "Comic Sans", "Comic Neue", cursive`
const LYRIC_Y = 0.36
const LYRIC_MAX_WIDTH = 0.9
const LINE_LEAD = 1.2
const LINE_LINGER = 0.4
const LINE_FADE = 0.3
const WORD_MAX_FILL = 0.9
const BALL_HOP = 0.45
const BALL_SIZE = 0.24
const BALL_TRAIL = 5
const BALL_TRAIL_STEP = 0.035
const KARAOKE_RISE = 0.6
const WAVE_Y = 0.47
const WAVE_WIDTH = 0.3
const WAVE_HEIGHT = 0.04
const WAVE_MIN_RANGE = 0.12
const WAVE_PUNCH = 1.5
const KICK_FRAMES = 14
const KICK_BASELINE_FROM = 4
const KICK_BASELINE_TO = 24
const KICK_GAIN = 2
const KICK_STRETCH = 0.6
const DIM_FILL = "#5a5680"
const KARAOKE_SONG = OUTRO_LYRICS.findIndex((lines) => lines.length > 0)

export const karaokeRise = (outro: OutroPlayback | null) => {
  if (!outro || outro.songIndex < KARAOKE_SONG) return 0
  if (outro.songIndex > KARAOKE_SONG) return 1
  return clampToUnit((outro.seconds - Math.max(0, OUTRO_LYRICS[KARAOKE_SONG][0].words[0][0] - LINE_LEAD)) / KARAOKE_RISE)
}

const wordStart = (line: LyricLine, index: number) => line.words[index][0]

const rainbowGradient = (context: Context, left: number, span: number) => {
  const gradient = context.createLinearGradient(left, 0, left + span, 0)
  RAINBOW.forEach((color, index) => gradient.addColorStop(index / (RAINBOW.length - 1), color))
  return gradient
}

const visibleLineIndex = (lines: readonly LyricLine[], seconds: number) => {
  const startedIndex = lines.reduce((found, line, index) => (line.words[0][0] <= seconds ? index : found), -1)
  if (startedIndex >= 0 && seconds < lines[startedIndex].end + LINE_LINGER) return startedIndex
  const upcoming = lines[startedIndex + 1]
  return upcoming && upcoming.words[0][0] - seconds <= LINE_LEAD ? startedIndex + 1 : -1
}

const layoutLine = (context: Context, line: LyricLine, width: number, baseFontSize: number) => {
  const text = line.words.map(([, word]) => word).join(" ")
  context.font = `bold ${baseFontSize}px ${FONT_STACK}`
  const fontSize = Math.min(baseFontSize, (baseFontSize * width * LYRIC_MAX_WIDTH) / context.measureText(text).width)
  context.font = `bold ${fontSize}px ${FONT_STACK}`
  const spaceWidth = context.measureText(" ").width
  const wordWidths = line.words.map(([, word]) => context.measureText(word).width)
  const totalWidth = wordWidths.reduce((sum, wordWidth) => sum + wordWidth, 0) + spaceWidth * (line.words.length - 1)
  const left = width / 2 - totalWidth / 2
  const wordLefts = wordWidths.map((_, index) => left + wordWidths.slice(0, index).reduce((sum, wordWidth) => sum + wordWidth + spaceWidth, 0))
  return { text, fontSize, left, totalWidth, wordLefts, wordWidths }
}

type LineLayout = ReturnType<typeof layoutLine>

const sungX = (line: LyricLine, layout: LineLayout, seconds: number) =>
  line.words.reduce((reached, [start], index) => {
    const fillEnd = Math.min(index + 1 < line.words.length ? wordStart(line, index + 1) : line.end, start + WORD_MAX_FILL)
    const sung = clampToUnit((seconds - start) / Math.max(0.05, fillEnd - start))
    return sung > 0 ? layout.wordLefts[index] + layout.wordWidths[index] * sung : reached
  }, layout.left)

const paintLineText = (context: Context, layout: LineLayout, y: number, fill: string | CanvasGradient) => {
  context.font = `bold ${layout.fontSize}px ${FONT_STACK}`
  context.lineWidth = layout.fontSize * 0.14
  context.strokeStyle = OUTLINE
  context.strokeText(layout.text, layout.left, y)
  context.fillStyle = fill
  context.fillText(layout.text, layout.left, y)
}

const ballPosition = (line: LyricLine, layout: LineLayout, y: number, radius: number, seconds: number) => {
  const centers = layout.wordLefts.map((wordLeft, index) => wordLeft + layout.wordWidths[index] / 2)
  const landedIndex = line.words.reduce((found, [start], index) => (start <= seconds ? index : found), -1)
  const fromX = landedIndex < 0 ? layout.left - layout.fontSize : centers[landedIndex]
  const toIndex = Math.min(landedIndex + 1, line.words.length - 1)
  const landAt = wordStart(line, toIndex)
  const hopStart = landedIndex < 0 ? landAt - BALL_HOP : Math.max(wordStart(line, landedIndex), landAt - BALL_HOP)
  const hop = landedIndex === line.words.length - 1 ? 1 : clampToUnit((seconds - hopStart) / Math.max(0.05, landAt - hopStart))
  const sinceLanding = landedIndex < 0 ? 1 : seconds - wordStart(line, landedIndex)
  const squash = 1 + 0.35 * (1 - clampToUnit(sinceLanding / 0.15)) * (hop === 0 || hop === 1 ? 1 : 0)
  const restY = y - layout.fontSize * 0.62 - radius
  return {
    x: mix(fromX, centers[toIndex], hop),
    y: restY - Math.sin(Math.PI * hop) * layout.fontSize * 0.55 + radius * (1 - 1 / squash),
    squash,
  }
}

const drawBall = (context: Context, line: LyricLine, layout: LineLayout, y: number, seconds: number) => {
  const radius = layout.fontSize * BALL_SIZE
  const colorStep = Math.floor(seconds * 8)
  const baseAlpha = context.globalAlpha
  for (let trail = BALL_TRAIL; trail > 0; trail -= 1) {
    const ghost = ballPosition(line, layout, y, radius, seconds - trail * BALL_TRAIL_STEP)
    const fade = 1 - trail / (BALL_TRAIL + 1)
    context.beginPath()
    context.arc(ghost.x, ghost.y, radius * fade, 0, Math.PI * 2)
    context.fillStyle = RAINBOW[(colorStep + trail) % RAINBOW.length]
    context.globalAlpha = baseAlpha * fade
    context.fill()
  }
  context.globalAlpha = baseAlpha
  const ball = ballPosition(line, layout, y, radius, seconds)
  const spin = context.createConicGradient(seconds * 6, 0, 0)
  RAINBOW.forEach((color, index) => spin.addColorStop(index / RAINBOW.length, color))
  spin.addColorStop(1, RAINBOW[0])
  context.save()
  context.translate(ball.x, ball.y)
  context.scale(ball.squash, 1 / ball.squash)
  context.beginPath()
  context.arc(0, 0, radius, 0, Math.PI * 2)
  context.shadowColor = RAINBOW[colorStep % RAINBOW.length]
  context.shadowBlur = radius * 2.5
  context.fillStyle = spin
  context.fill()
  context.shadowBlur = 0
  context.lineWidth = radius * 0.22
  context.strokeStyle = OUTLINE
  context.stroke()
  context.beginPath()
  context.ellipse(-radius * 0.35, -radius * 0.38, radius * 0.3, radius * 0.2, -0.6, 0, Math.PI * 2)
  context.fillStyle = "rgba(255, 255, 255, 0.85)"
  context.fill()
  context.restore()
}

const kickStrength = (history: readonly number[], range: number, age: number) => {
  const baseline = history.slice(age + KICK_BASELINE_FROM, age + KICK_BASELINE_TO)
  if (baseline.length === 0) return 0
  const average = baseline.reduce((sum, level) => sum + level, 0) / baseline.length
  return clampToUnit(((history[age] - average) / range) * KICK_GAIN)
}

const drawSoundWave = (context: Context, width: number, height: number, outro: OutroPlayback, appear: number) => {
  const history = outro.beatHistory ?? []
  const quietest = Math.min(...history, 1)
  const range = Math.max(Math.max(...history, 0) - quietest, WAVE_MIN_RANGE)
  const beats = history.map((level) => ((level - quietest) / range) ** WAVE_PUNCH)
  const kicks = Array.from({ length: KICK_FRAMES }, (_, age) => kickStrength(history, range, age) * (1 - age / KICK_FRAMES) ** 2)
  const kickAge = kicks.reduce((strongest, kick, age) => (kick > kicks[strongest] ? age : strongest), 0)
  const kick = kicks[kickAge]
  const span = width * WAVE_WIDTH
  const centerX = width / 2
  const centerY = height * WAVE_Y
  const reach = Math.min(height * WAVE_HEIGHT, span * 0.2)
  const barGap = span / 2 / BEAT_HISTORY
  const beatColor = RAINBOW[Math.floor(outro.seconds * 4) % RAINBOW.length]
  context.save()
  context.globalAlpha = appear * kick * 0.45
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
  context.globalAlpha = appear * kick
  context.lineWidth = Math.max(1.5, reach * 0.08 * (1 - ringProgress))
  context.strokeStyle = beatColor
  context.beginPath()
  context.ellipse(centerX, centerY, ringRadius, ringRadius * 0.3, 0, 0, Math.PI * 2)
  context.stroke()
  context.restore()
  context.save()
  context.globalAlpha = appear
  context.lineCap = "round"
  context.beginPath()
  context.moveTo(centerX - span / 2, centerY)
  context.lineTo(centerX + span / 2, centerY)
  beats.forEach((beat, index) => {
    const barHeight = reach * (0.06 + 0.94 * beat) * (1 - index / BEAT_HISTORY) * (1 + kick * KICK_STRETCH)
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
  context.globalAlpha = appear * kick * 0.85
  context.shadowColor = "#ffffff"
  context.strokeStyle = "#ffffff"
  context.stroke()
  context.restore()
}

export const drawEndingKaraoke = (context: Context, width: number, height: number, outro: OutroPlayback | null) => {
  const appear = karaokeRise(outro)
  if (!outro || appear <= 0) return
  drawSoundWave(context, width, height, outro, appear)
  const lines = OUTRO_LYRICS[outro.songIndex] ?? []
  const lineIndex = visibleLineIndex(lines, outro.seconds)
  if (lineIndex < 0) return
  const line = lines[lineIndex]
  const seconds = outro.seconds
  const fadeIn = clampToUnit((seconds - (line.words[0][0] - LINE_LEAD)) / LINE_FADE)
  const fadeOut = clampToUnit((line.end + LINE_LINGER - seconds) / LINE_FADE)
  const y = height * LYRIC_Y
  const layout = layoutLine(context, line, width, Math.min(height * 0.05, width * 0.045))
  context.save()
  context.textAlign = "left"
  context.textBaseline = "middle"
  context.lineJoin = "round"
  context.globalAlpha = appear * Math.min(fadeIn, fadeOut)
  paintLineText(context, layout, y, DIM_FILL)
  context.save()
  context.beginPath()
  context.rect(layout.left - layout.fontSize, y - layout.fontSize, sungX(line, layout, seconds) - layout.left + layout.fontSize, layout.fontSize * 2)
  context.clip()
  context.shadowColor = "rgba(255, 255, 255, 0.6)"
  context.shadowBlur = layout.fontSize * 0.4
  paintLineText(context, layout, y, rainbowGradient(context, layout.left, layout.totalWidth))
  context.restore()
  drawBall(context, line, layout, y, seconds)
  context.restore()
}
