import { type Context } from "@/characters/paint"
import { OUTLINE, RAINBOW } from "@/characters/radi"
import { OUTRO_LYRICS, type LyricLine } from "@/scenes/endingLyrics"
import { clampToUnit, mix } from "@/scenes/openingScene"

export type OutroPlayback = { songIndex: number; seconds: number; beatHistory: readonly number[] | null }

const FONT_STACK = `"Comic Sans MS", "Comic Sans", "Comic Neue", cursive`
const LYRIC_Y = 0.45
const LYRIC_MAX_WIDTH = 0.9
const LINE_LEAD = 1.2
const LINE_LINGER = 0.4
const LINE_FADE = 0.3
const WORD_MAX_FILL = 0.9
const WORD_SHAKE_SECONDS = 0.18
const WORD_SHAKE_SIZE = 0.05
const BALL_HOP = 0.45
const BALL_SIZE = 0.24
const BALL_TRAIL = 5
const BALL_TRAIL_STEP = 0.035
const KARAOKE_RISE = 0.6
const DIM_FILL = "#5a5680"
const KARAOKE_SONG = OUTRO_LYRICS.findIndex((lines) => lines.length > 0)

export const karaokeRise = (outro: OutroPlayback | null) => {
  if (!outro || outro.songIndex < KARAOKE_SONG) return 0
  if (outro.songIndex > KARAOKE_SONG) return 1
  return clampToUnit((outro.seconds - Math.max(0, OUTRO_LYRICS[KARAOKE_SONG][0].words[0][0] - LINE_LEAD)) / KARAOKE_RISE)
}

const wordStart = (line: LyricLine, index: number) => line.words[index][0]

export const rainbowGradient = (context: Context, left: number, span: number) => {
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
  return { fontSize, left, totalWidth, wordLefts, wordWidths }
}

type LineLayout = ReturnType<typeof layoutLine>

const sungX = (line: LyricLine, layout: LineLayout, seconds: number) =>
  line.words.reduce((reached, [start], index) => {
    const fillEnd = Math.min(index + 1 < line.words.length ? wordStart(line, index + 1) : line.end, start + WORD_MAX_FILL)
    const sung = clampToUnit((seconds - start) / Math.max(0.05, fillEnd - start))
    return sung > 0 ? layout.wordLefts[index] + layout.wordWidths[index] * sung : reached
  }, layout.left)

const wordShake = (sinceLanding: number, fontSize: number) => {
  if (sinceLanding < 0 || sinceLanding >= WORD_SHAKE_SECONDS) return [0, 0] as const
  const amount = (1 - sinceLanding / WORD_SHAKE_SECONDS) * fontSize * WORD_SHAKE_SIZE
  return [Math.sin(sinceLanding * 90) * amount, Math.cos(sinceLanding * 70) * amount] as const
}

const paintLineText = (context: Context, line: LyricLine, layout: LineLayout, spots: readonly (readonly [number, number])[], fill: string | CanvasGradient, glow = 0) => {
  context.font = `bold ${layout.fontSize}px ${FONT_STACK}`
  context.lineWidth = layout.fontSize * 0.14
  context.strokeStyle = OUTLINE
  line.words.forEach(([, word], index) => context.strokeText(word, ...spots[index]))
  context.fillStyle = fill
  context.shadowBlur = glow
  line.words.forEach(([, word], index) => context.fillText(word, ...spots[index]))
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

export const drawEndingKaraoke = (context: Context, width: number, height: number, outro: OutroPlayback | null) => {
  const appear = karaokeRise(outro)
  if (!outro || appear <= 0) return
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
  const spots = line.words.map(([start], index) => {
    const [shakeX, shakeY] = wordShake(seconds - start, layout.fontSize)
    return [layout.wordLefts[index] + shakeX, y + shakeY] as const
  })
  paintLineText(context, line, layout, spots, DIM_FILL)
  const sungRight = sungX(line, layout, seconds)
  if (sungRight > layout.left) {
    context.save()
    context.beginPath()
    context.rect(layout.left - layout.fontSize, y - layout.fontSize, sungRight - layout.left + layout.fontSize, layout.fontSize * 2)
    context.clip()
    context.shadowColor = "rgba(255, 255, 255, 0.6)"
    paintLineText(context, line, layout, spots, rainbowGradient(context, layout.left, layout.totalWidth), layout.fontSize * 0.4)
    context.restore()
  }
  drawBall(context, line, layout, y, seconds)
  context.restore()
}
