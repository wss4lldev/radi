import { ellipsePath, paintFill, paintLine, paintShape, type Context } from "@/characters/paint"
import { CALM_FLIGHT, earthRiseFlightSeconds, LIFTOFF, planePassedFlightSeconds, rocketMiddleOnScreen, type FlightThrill } from "@/scenes/cosmodromeScene"
import { clampToUnit, easeOutBack, mix, stageProgress } from "@/scenes/openingScene"

export const QUICK_TIME_KEYS = ["R", "A", "D", "I"] as const
export type QuickTimeResult = { hit: boolean; atSeconds: number }

const EARTH_LEAD_SECONDS = 1.5
const POP_IN_SECONDS = 0.25
const CLOSE_SECONDS = 1.6
const GOOD_EARLY_SECONDS = 0.6
const GOOD_LATE_SECONDS = 0.45
const RESULT_SECONDS = 0.7
const RING_START_SCALE = 3.4
const KEY_SIZE = 0.09
const OUTLINE = "#2b1d1a"
const KEY_FACE = "#fff6e0"
const KEY_SIDE = "#c9b48f"
const GOOD_GREEN = "#3ddc6a"
const MISS_RED = "#ff4d5e"
const RING_WHITE = "#ffffff"

export const quickTimeStarts = (flightDuration: number) => {
  const lastStart = earthRiseFlightSeconds(flightDuration) - EARTH_LEAD_SECONDS - CLOSE_SECONDS - GOOD_LATE_SECONDS - RESULT_SECONDS
  const firstStart = planePassedFlightSeconds(flightDuration)
  return QUICK_TIME_KEYS.map((_, index) => LIFTOFF + mix(firstStart, lastStart, index / (QUICK_TIME_KEYS.length - 1)))
}

const closesAt = (start: number) => start + CLOSE_SECONDS

export const activeQuickTime = (wishSeconds: number, starts: readonly number[]) =>
  starts.findIndex((start) => wishSeconds >= start && wishSeconds < closesAt(start) + GOOD_LATE_SECONDS)

export const isInGoodWindow = (wishSeconds: number, start: number) =>
  wishSeconds >= closesAt(start) - GOOD_EARLY_SECONDS && wishSeconds < closesAt(start) + GOOD_LATE_SECONDS

export const missedQuickTime = (wishSeconds: number, start: number) => wishSeconds >= closesAt(start) + GOOD_LATE_SECONDS

export const drawRocketQuickTime = (
  context: Context,
  width: number,
  height: number,
  wishSeconds: number | null,
  starts: readonly number[],
  results: readonly (QuickTimeResult | null)[],
  flightDuration: number,
) => {
  if (wishSeconds === null) return
  const keySize = Math.min(width, height) * KEY_SIZE
  const { x: centerX, y: centerY } = rocketMiddleOnScreen(width, height, wishSeconds, flightDuration)
  starts.forEach((start, index) => {
    const result = results[index]
    const sinceResult = result ? wishSeconds - result.atSeconds : 0
    if (wishSeconds < start || sinceResult >= RESULT_SECONDS) return
    const popIn = easeOutBack(stageProgress(wishSeconds, start, start + POP_IN_SECONDS))
    const resultFade = result ? 1 - stageProgress(sinceResult, RESULT_SECONDS * 0.5, RESULT_SECONDS) : 1
    const resultPulse = result ? 1 + 0.25 * Math.sin(clampToUnit(sinceResult / (RESULT_SECONDS * 0.5)) * Math.PI) : 1
    const isGood = isInGoodWindow(wishSeconds, start)
    const resultFlash = result ? Math.floor(sinceResult / 0.09) % 2 === 0 : false
    context.save()
    context.globalAlpha = resultFade
    context.translate(centerX, centerY)
    context.scale(popIn * resultPulse, popIn * resultPulse)
    if (!result) {
      const closing = clampToUnit((wishSeconds - start) / CLOSE_SECONDS)
      const ringRadius = keySize * 0.78 * mix(RING_START_SCALE, 1, closing)
      const ringColor = isGood ? GOOD_GREEN : RING_WHITE
      paintLine(context, "rgba(43, 29, 26, 0.55)", keySize * 0.16, ellipsePath(0, 0, ringRadius, ringRadius))
      paintLine(context, ringColor, keySize * 0.09, ellipsePath(0, 0, ringRadius, ringRadius))
      if (isGood) paintFill(context, "rgba(61, 220, 106, 0.22)", ellipsePath(0, 0, ringRadius, ringRadius))
    }
    const face = result ? (resultFlash ? (result.hit ? GOOD_GREEN : MISS_RED) : KEY_FACE) : KEY_FACE
    const half = keySize / 2
    const depth = keySize * 0.12
    const corner = keySize * 0.18
    context.lineWidth = keySize * 0.06
    context.strokeStyle = OUTLINE
    paintShape(context, KEY_SIDE, (path) => path.roundRect(-half, -half + depth, keySize, keySize, corner))
    paintShape(context, face, (path) => path.roundRect(-half, -half, keySize, keySize - depth * 0.4, corner))
    context.fillStyle = OUTLINE
    context.font = `bold ${keySize * 0.6}px "Comic Sans MS", "Comic Sans", "Comic Neue", cursive`
    context.textAlign = "center"
    context.textBaseline = "middle"
    context.fillText(QUICK_TIME_KEYS[index], 0, -depth * 0.3)
    context.restore()
  })
}

const BOOST_SECONDS = 2.6
const BOOST_RAMP_IN = 0.2
const BOOST_RAMP_OUT = 0.8
const WOBBLE_SECONDS = 1.1
const WOBBLE_RAMP_IN = 0.08
const WOBBLE_RAMP_OUT = 0.5

const envelope = (since: number, total: number, rampIn: number, rampOut: number) =>
  since < 0 || since >= total ? 0 : Math.min(clampToUnit(since / rampIn), clampToUnit((total - since) / rampOut))

const latestResult = (results: readonly (QuickTimeResult | null)[], hit: boolean) =>
  results.reduce<QuickTimeResult | null>((latest, result) => (result && result.hit === hit && (!latest || result.atSeconds > latest.atSeconds) ? result : latest), null)

export const quickTimeThrill = (wishSeconds: number | null, results: readonly (QuickTimeResult | null)[]): FlightThrill => {
  if (wishSeconds === null) return CALM_FLIGHT
  const hit = latestResult(results, true)
  const miss = latestResult(results, false)
  const rushSeconds = hit ? wishSeconds - hit.atSeconds : 0
  return {
    boost: hit ? envelope(rushSeconds, BOOST_SECONDS, BOOST_RAMP_IN, BOOST_RAMP_OUT) : 0,
    rushSeconds,
    wobble: miss ? envelope(wishSeconds - miss.atSeconds, WOBBLE_SECONDS, WOBBLE_RAMP_IN, WOBBLE_RAMP_OUT) : 0,
  }
}
