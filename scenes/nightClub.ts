import { ellipsePath, paintFill, paintLine, paintShape, type BuildPath, type Context, type DecorateInside } from "@/characters/paint"
import { OUTLINE, SILVER } from "@/characters/radi"

type ClubPoint = readonly [number, number]
type ClubWindow = { shape: "circle" | "triangle" | "diamond"; x: number; y: number; size: number }
type ClubBlock = { color: string; pivot: ClubPoint; tilt: number; outline: BuildPath; pattern: DecorateInside; windows: ClubWindow[] }

export type ClubPlacement = { centerX: number; baseY: number; unit: number }

const PARTY_COLORS = [
  [255, 63, 164],
  [63, 240, 255],
  [255, 226, 63],
  [143, 91, 255],
  [80, 255, 120],
] as const
const CLUB_HEIGHT_UNITS = 120
const CLUB_HEIGHT_RATIO = 0.8
const CLUB_LEFT_UNITS = -40
const DOOR_X_UNITS = 8
const DOOR_TOP_UNITS = -46
const DOOR_HALF_WIDTH_UNITS = 13
const DISCO_BALL: ClubPoint = [4, -118]
const DISCO_RADIUS = 6
const BEAM_COUNT = 6
const NOTE_COUNT = 3

const polygonPath = (points: readonly ClubPoint[]): BuildPath => (path) => {
  points.forEach(([x, y], index) => (index === 0 ? path.moveTo(x, y) : path.lineTo(x, y)))
  path.closePath()
}

const doorPath: BuildPath = (path) => {
  path.moveTo(DOOR_X_UNITS - DOOR_HALF_WIDTH_UNITS, 0)
  path.lineTo(DOOR_X_UNITS - DOOR_HALF_WIDTH_UNITS, DOOR_TOP_UNITS + DOOR_HALF_WIDTH_UNITS)
  path.arc(DOOR_X_UNITS, DOOR_TOP_UNITS + DOOR_HALF_WIDTH_UNITS, DOOR_HALF_WIDTH_UNITS, Math.PI, 0)
  path.lineTo(DOOR_X_UNITS + DOOR_HALF_WIDTH_UNITS, 0)
  path.closePath()
}

const signPath: BuildPath = (path) => path.roundRect(-62, -56, 34, 14, 3)

const CLUB_BLOCKS: ClubBlock[] = [
  {
    color: "#ff3fa4",
    pivot: [0, 0],
    tilt: 0,
    outline: polygonPath([[-40, 0], [42, 0], [37, -34], [-35, -29]]),
    pattern: (blockContext) => {
      paintLine(blockContext, "#ffe23f", 1.2, (path) => {
        path.moveTo(-46, -25)
        for (let step = 0; step <= 16; step += 1) path.lineTo(-46 + step * 6, step % 2 === 0 ? -25 : -29)
      })
      for (let dotX = -36; dotX <= 40; dotX += 9) for (const dotY of [-6, -14]) paintFill(blockContext, "rgba(255, 255, 255, 0.35)", ellipsePath(dotX, dotY, 1.6, 1.6))
    },
    windows: [{ shape: "circle", x: -24, y: -17, size: 5 }, { shape: "circle", x: 27, y: -18, size: 5 }],
  },
  {
    color: "#3fd0ff",
    pivot: [0, -30],
    tilt: -0.09,
    outline: polygonPath([[-31, -29], [34, -33], [40, -66], [-27, -61]]),
    pattern: (blockContext) => {
      for (let stripeX = -70; stripeX <= 50; stripeX += 9) paintLine(blockContext, "rgba(255, 255, 255, 0.3)", 1.6, (path) => {
        path.moveTo(stripeX, -25)
        path.lineTo(stripeX + 22, -70)
      })
    },
    windows: [{ shape: "triangle", x: -15, y: -45, size: 6 }, { shape: "triangle", x: 5, y: -47, size: 6 }, { shape: "triangle", x: 25, y: -50, size: 6 }],
  },
  {
    color: "#ffe23f",
    pivot: [4, -63],
    tilt: 0.13,
    outline: polygonPath([[-23, -62], [31, -66], [24, -91], [-17, -87]]),
    pattern: (blockContext) => {
      for (let dotY = -88; dotY <= -62; dotY += 7) {
        for (let dotX = -24; dotX <= 32; dotX += 7) paintFill(blockContext, "#ff8c1a", ellipsePath(dotX + ((dotY / 7) % 2) * 3.5, dotY, 1.6, 1.6))
      }
    },
    windows: [{ shape: "diamond", x: -5, y: -76, size: 5 }, { shape: "diamond", x: 14, y: -78, size: 5 }],
  },
  {
    color: "#8f5bff",
    pivot: [4, -89],
    tilt: -0.07,
    outline: (path) => {
      path.moveTo(-14, -88)
      path.bezierCurveTo(-20, -101, -2, -104, 4, DISCO_BALL[1] + DISCO_RADIUS)
      path.bezierCurveTo(10, -104, 28, -101, 22, -88)
      path.closePath()
    },
    pattern: (blockContext) => {
      for (const stripeX of [-6, 4, 14]) paintLine(blockContext, "#b38cff", 1.2, (path) => {
        path.moveTo(stripeX, -86)
        path.quadraticCurveTo(stripeX + (4 - stripeX) * 0.3, -100, 4, -112)
      })
    },
    windows: [],
  },
]

export const partyColor = (index: number, time: number, alpha: number) => {
  const [red, green, blue] = PARTY_COLORS[(index + Math.floor(time * 4)) % PARTY_COLORS.length]
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

const windowPath = ({ shape, x, y, size }: ClubWindow): BuildPath => {
  if (shape === "circle") return ellipsePath(x, y, size, size)
  if (shape === "triangle") return polygonPath([[x, y - size], [x + size, y + size * 0.8], [x - size, y + size * 0.8]])
  return polygonPath([[x, y - size], [x + size, y], [x, y + size], [x - size, y]])
}

const withBlock = (context: Context, block: ClubBlock, blockIndex: number, time: number, draw: () => void) => {
  const [pivotX, pivotY] = block.pivot
  context.save()
  context.translate(pivotX, pivotY)
  context.rotate(block.tilt + Math.sin(time * 9 + blockIndex * 2) * 0.012)
  context.translate(-pivotX, -pivotY)
  draw()
  context.restore()
}

const withClub = (context: Context, { centerX, baseY, unit }: ClubPlacement, draw: () => void) => {
  context.save()
  context.translate(centerX, baseY)
  context.scale(unit, unit)
  context.lineWidth = 3 / unit
  context.strokeStyle = OUTLINE
  context.lineJoin = "round"
  draw()
  context.restore()
}

export const clubPlacement = (height: number, centerX: number, baseY: number, time: number): ClubPlacement => ({
  centerX: centerX + Math.sin(time * 45) * 1.5 + Math.sin(time * 31),
  baseY: baseY + Math.sin(time * 53) * 0.8,
  unit: (height * CLUB_HEIGHT_RATIO) / CLUB_HEIGHT_UNITS,
})

export const clubLeftX = ({ centerX, unit }: ClubPlacement) => centerX + CLUB_LEFT_UNITS * unit
export const clubDoorX = ({ centerX, unit }: ClubPlacement) => centerX + DOOR_X_UNITS * unit
export const clubDoorCenterY = ({ baseY, unit }: ClubPlacement) => baseY + (DOOR_TOP_UNITS / 2) * unit
export const clubDoorWidth = ({ unit }: ClubPlacement) => DOOR_HALF_WIDTH_UNITS * 2 * unit

export const clipToClubDoor = (context: Context, { centerX, baseY, unit }: ClubPlacement) => {
  const door = new Path2D()
  doorPath(door)
  context.translate(centerX, baseY)
  context.scale(unit, unit)
  context.clip(door)
  context.scale(1 / unit, 1 / unit)
  context.translate(-centerX, -baseY)
}

export const drawClubBuilding = (context: Context, club: ClubPlacement, time: number) => {
  withClub(context, club, () => {
    CLUB_BLOCKS.forEach((block, blockIndex) => withBlock(context, block, blockIndex, time, () => {
      paintShape(context, block.color, block.outline, { decorateInside: block.pattern })
      for (const clubWindow of block.windows) paintShape(context, "#1a1030", windowPath(clubWindow))
      if (blockIndex === 1) {
        context.save()
        context.translate(-30, -49)
        context.rotate(-0.3)
        context.translate(30, 49)
        paintLine(context, OUTLINE, 0.6, (path) => {
          path.moveTo(-28, -52)
          path.lineTo(-31, -52)
          path.moveTo(-28, -46)
          path.lineTo(-31, -46)
        })
        paintShape(context, "#2a1240", signPath)
        context.restore()
      }
    }))
    paintShape(context, "#120a24", doorPath)
  })
}

export const drawClubLights = (context: Context, club: ClubPlacement, time: number, doorGlow: number) => {
  withClub(context, club, () => {
    CLUB_BLOCKS.forEach((block, blockIndex) => withBlock(context, block, blockIndex, time, () => {
      block.windows.forEach((clubWindow, windowIndex) => paintShape(context, partyColor(blockIndex + windowIndex, time, 1), windowPath(clubWindow)))
      if (blockIndex === 1) {
        context.save()
        context.translate(-30, -49)
        context.rotate(-0.3)
        context.translate(30, 49)
        context.shadowColor = "#ff3fa4"
        context.shadowBlur = 18
        context.font = 'bold 10px "Comic Sans MS", "Comic Sans", "Comic Neue", cursive'
        context.textAlign = "center"
        context.textBaseline = "middle"
        context.fillStyle = Math.sin(time * 6) > -0.7 ? "#ff7fc8" : "#ffffff"
        context.fillText("CLUB", -45, -48.5)
        context.restore()
      }
      if (blockIndex === CLUB_BLOCKS.length - 1) {
        const [ballX, ballY] = DISCO_BALL
        for (let beam = 0; beam < BEAM_COUNT; beam += 1) {
          const angle = -Math.PI / 2 + Math.sin(time * 1.3 + beam * 1.1) * 1.3
          paintFill(context, partyColor(beam, time, 0.25), (path) => {
            path.moveTo(ballX, ballY)
            path.lineTo(ballX + Math.cos(angle - 0.07) * 160, ballY + Math.sin(angle - 0.07) * 160)
            path.lineTo(ballX + Math.cos(angle + 0.07) * 160, ballY + Math.sin(angle + 0.07) * 160)
            path.closePath()
          })
        }
        paintShape(context, SILVER, ellipsePath(ballX, ballY, DISCO_RADIUS, DISCO_RADIUS), {
          decorateInside: (ballContext) => {
            const spin = ((time * 6) % 2) * 2
            for (let facetX = -8; facetX <= 8; facetX += 2) paintLine(ballContext, "rgba(43, 29, 26, 0.35)", 0.2, (path) => {
              path.moveTo(ballX + facetX + spin, ballY - DISCO_RADIUS)
              path.lineTo(ballX + facetX + spin, ballY + DISCO_RADIUS)
            })
            for (let facetY = -6; facetY <= 6; facetY += 2) paintLine(ballContext, "rgba(43, 29, 26, 0.35)", 0.2, (path) => {
              path.moveTo(ballX - DISCO_RADIUS, ballY + facetY)
              path.lineTo(ballX + DISCO_RADIUS, ballY + facetY)
            })
            paintFill(ballContext, "rgba(255, 255, 255, 0.9)", ellipsePath(ballX - 2, ballY - 2, 1.4, 1.4))
          },
        })
        context.font = '9px "Comic Sans MS", "Comic Sans", "Comic Neue", cursive'
        context.textAlign = "center"
        for (let note = 0; note < NOTE_COUNT; note += 1) {
          const age = (time * 0.6 + note / NOTE_COUNT) % 1
          context.fillStyle = partyColor(note, time, 1 - age)
          context.fillText("♪", ballX + (note - 1) * 22 + Math.sin(age * 6) * 3, ballY - 4 - age * 30)
        }
      }
    }))
    if (doorGlow > 0) paintFill(context, `rgba(255, 236, 150, ${doorGlow})`, doorPath)
    context.save()
    context.shadowColor = "#ff3fa4"
    context.shadowBlur = 16
    paintLine(context, "#ff7fc8", 0.7, doorPath)
    context.restore()
  })
}
