import { ellipsePath, paintFill, paintLine, paintShape, type Context } from "@/characters/paint"
import { OUTLINE } from "@/characters/radi"
import { drawSun, easeOut, mix, stageProgress } from "@/scenes/openingScene"

const STAR_COUNT = 45
const STAR_SKY_RATIO = 0.27
const SUN_CENTER_RATIO = 0.17
const SUN_RADIUS_RATIO = 0.075
const MOON_X_RATIO = 0.2
const MOON_Y_RATIO = 0.15

const smoothStep = (amount: number) => amount * amount * (3 - 2 * amount)

const randomAt = (seed: number) => {
  const scrambled = Math.sin(seed * 12.9898) * 43758.5453
  return scrambled - Math.floor(scrambled)
}

export const eveningLight = (driveProgress: number) => ({
  sunDrop: smoothStep(stageProgress(driveProgress, 0.3, 0.7)),
  sunset: Math.sin(Math.PI * stageProgress(driveProgress, 0.3, 0.85)),
  night: stageProgress(driveProgress, 0.6, 0.9),
  moonRise: easeOut(stageProgress(driveProgress, 0.68, 0.95)),
  stars: stageProgress(driveProgress, 0.7, 0.95),
})

export type EveningLight = ReturnType<typeof eveningLight>

const fillSkyGradient = (context: Context, width: number, height: number, horizonY: number, topColor: string, bottomColor: string, alpha: number) => {
  if (alpha <= 0) return
  const sky = context.createLinearGradient(0, 0, 0, horizonY)
  sky.addColorStop(0, topColor)
  sky.addColorStop(1, bottomColor)
  context.globalAlpha = alpha
  context.fillStyle = sky
  context.fillRect(0, 0, width, height)
  context.globalAlpha = 1
}

export const drawEveningSky = (context: Context, width: number, height: number, horizonY: number, { sunset, night }: EveningLight) => {
  fillSkyGradient(context, width, height, horizonY, "#ff7e5f", "#ffb36b", sunset * 0.75)
  fillSkyGradient(context, width, height, horizonY, "#0b1340", "#3a2f6b", night * 0.95)
}

export const drawSettingSun = (context: Context, width: number, height: number, horizonY: number, time: number, { sunDrop, sunset }: EveningLight) => {
  const radius = Math.min(width, height) * SUN_RADIUS_RATIO
  context.save()
  context.translate(0, sunDrop * (horizonY - height * SUN_CENTER_RATIO + radius * 2.5))
  drawSun(context, width, height, time)
  if (sunset > 0) paintFill(context, `rgba(255, 90, 30, ${sunset * 0.45})`, ellipsePath(width * 0.84, height * SUN_CENTER_RATIO, radius, radius))
  context.restore()
}

export const drawNightShade = (context: Context, width: number, height: number, { sunset, night }: EveningLight) => {
  if (sunset > 0) {
    context.fillStyle = `rgba(255, 120, 60, ${sunset * 0.12})`
    context.fillRect(0, 0, width, height)
  }
  if (night > 0) {
    context.fillStyle = `rgba(15, 20, 70, ${night * 0.4})`
    context.fillRect(0, 0, width, height)
  }
}

export const drawMoonAndStars = (context: Context, width: number, height: number, horizonY: number, time: number, { moonRise, stars }: EveningLight) => {
  context.save()
  if (stars > 0) {
    for (let star = 0; star < STAR_COUNT; star += 1) {
      const starX = randomAt(star + 1) * width
      const starY = randomAt(star + 101) * height * STAR_SKY_RATIO
      const size = 1 + randomAt(star + 201) * 2
      context.globalAlpha = stars * (0.6 + 0.4 * Math.sin(time * 3 + star * 1.3))
      paintFill(context, "#fffbe6", ellipsePath(starX, starY, size, size))
      if (size > 2.4) {
        paintLine(context, "#fffbe6", 1.2, (path) => {
          path.moveTo(starX - size * 2.5, starY)
          path.lineTo(starX + size * 2.5, starY)
          path.moveTo(starX, starY - size * 2.5)
          path.lineTo(starX, starY + size * 2.5)
        })
      }
    }
  }
  if (moonRise > 0) {
    const radius = Math.min(width, height) * 0.06
    const moonX = width * MOON_X_RATIO
    const moonY = mix(horizonY - radius, height * MOON_Y_RATIO, moonRise)
    context.globalAlpha = moonRise
    const glow = context.createRadialGradient(moonX, moonY, radius, moonX, moonY, radius * 2.6)
    glow.addColorStop(0, "rgba(255, 246, 200, 0.45)")
    glow.addColorStop(1, "rgba(255, 246, 200, 0)")
    paintFill(context, glow, ellipsePath(moonX, moonY, radius * 2.6, radius * 2.6))
    context.lineWidth = 3
    context.strokeStyle = OUTLINE
    paintShape(context, "#fff6d5", ellipsePath(moonX, moonY, radius, radius), {
      decorateInside: (moonContext) => {
        for (const [craterX, craterY, craterSize] of [[-0.35, -0.2, 0.22], [0.3, 0.25, 0.16], [0.1, -0.45, 0.12]]) {
          paintFill(moonContext, "#efe0a8", ellipsePath(moonX + craterX * radius, moonY + craterY * radius, craterSize * radius, craterSize * radius))
        }
      },
    })
    for (const side of [-1, 1]) {
      paintFill(context, OUTLINE, ellipsePath(moonX + side * radius * 0.32, moonY - radius * 0.1, radius * 0.07, radius * 0.11))
      paintFill(context, "rgba(255, 110, 140, 0.45)", ellipsePath(moonX + side * radius * 0.55, moonY + radius * 0.2, radius * 0.14, radius * 0.08))
    }
    paintLine(context, OUTLINE, radius * 0.07, (path) => path.arc(moonX, moonY + radius * 0.1, radius * 0.25, Math.PI * 0.15, Math.PI * 0.85))
  }
  context.restore()
}
