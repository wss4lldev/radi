import { drawKiraFront } from "@/characters/kira"
import { ellipsePath, linePath, paintFill, paintLine, paintShape, type Context } from "@/characters/paint"
import { drawRadiBack, type BackArms } from "@/characters/radiBack"
import { drawBatMark, drawRadi, drawStarSparkle, OUTLINE_WIDTH, paintTube, RAINBOW, SKIN, WHITE, type Point, type RadiLook } from "@/characters/radi"
import { batmanRadiLook, bookwormRadiLook, unicornRadiLook } from "@/characters/radiConcepts"
import { drawRadiSide } from "@/characters/radiSide"
import { onLayersReleased, paintCachedLayer } from "@/scenes/layerCache"
import { easeOut, easeOutBack, mix, mixPoint, comicBubbleWidth, paintComicBubble, paintIris, radiScale, stageProgress } from "@/scenes/openingScene"

const OUTLINE = "#2b1d1a"
const WALL = "#f6e2bc"
const WOOD = "#e0a15a"
const WOOD_DARK = "#8d4e24"
const RUG = "#e25b86"
const NIGHT = "#241848"
const PLASTER = "#f3d7a2"
const WOOD_LIGHT = "#f4c47e"
const SHELF_BACK = "#3d1c0a"
const SHELF_SIDE = "#5a2a10"
const GOLD = "#ffd86b"
const BOOK_COLORS = ["#ff3b5c", "#ffcf3f", "#20d0c4", "#7b5cff", "#4fdc6b", "#ff8a2a", "#ff5fc4", "#2f7bff", "#b04dff", "#00b8ff", "#ff6a3d", "#c6f03a", "#ff9ec7", "#14b88f", "#ffe066", "#e0287a"] as const
const SPINE_MARKS = ["stripe", "dot", "band", "gold", "label", "plain"] as const
const SHELF_ROWS = 5
const SHELF_THICKNESS = 7
const QUAKE_SECONDS = 1.2
const BRASS = "#d9a441"
const PAINTING_GOLD = "#e2a83a"
const LADDER_RUNGS = 7
const KIRA_PEEK_UNITS = 33
const SAY_START = 6.9
const SAY_END = 10.2
const BUBBLE_POP_SECONDS = 0.4
const BUBBLE_HIDE_SECONDS = 0.3
const SPEECH_LINES = ["I work hard and", "learn a lot too!"] as const
const WALK_TO_LADDER_START = 10.4
const WALK_TO_LADDER_END = 12.2
const CLIMB_UP_END = 14.8
const REACH_END = 15.4
const PULL_END = 16
const CLIMB_DOWN_START = 16.2
const CLIMB_DOWN_END = 18.2
const WALK_BACK_START = 18.7
const TURN_SECONDS = 0.4
const WALK_BACK_END = 20.4
const SIT_END = 21
const OPEN_START = 21.05
const OPEN_END = 21.2
const QUIZ_START = 21.7
const QUIZ_POP_SECONDS = 0.45
const PAGE_TURN_SECONDS = 3
const PAGE_TURN_FLIP_SECONDS = 0.55
const SKIP_HOPS = 6

const skipSteps = (sceneSeconds: number, start: number, end: number) => {
  const stride = easeOut(stageProgress(sceneSeconds, start, end))
  if (stride <= 0) return null
  return stride * SKIP_HOPS
}

export const libraryWalkSteps = (sceneSeconds: number) => {
  if (sceneSeconds >= WALK_BACK_START) return skipSteps(sceneSeconds, WALK_BACK_START, WALK_BACK_END)
  if (sceneSeconds >= WALK_TO_LADDER_START) return skipSteps(sceneSeconds, WALK_TO_LADDER_START, WALK_TO_LADDER_END)
  return null
}

const TOP_RUNG = 2
const READING_BOOK = "#7b5cff"
const PAGE = "#fffaf0"
const CHEST_HAND: Point = [6, -32]
const REACH_HAND: Point = [16, -60]
const PEEK_HANDS: readonly [Point, Point] = [[-11, -40], [11, -39]]
const HOLD_HANDS: readonly [Point, Point] = [[-8, -30], [8, -28]]
const READ_HANDS: readonly [Point, Point] = [[-12, -24], [12, -24]]
const CAPTAIN_CHOICES = [
  { id: "nemo", letter: "A", name: "Captain Nemo" },
  { id: "america", letter: "B", name: "Captain America" },
  { id: "janeway", letter: "C", name: "Captain Janeway" },
] as const

const JOKE_CHOICES = [
  { id: "furmidable", letter: "A", name: "Fur-midable disaster" },
  { id: "catastrophe", letter: "B", name: "Cat-astrophe" },
  { id: "purplexing", letter: "C", name: "Purr-plexing situation" },
] as const

const JOKE_QUESTION_LINES = [
  "My roommate Blake was coughing up",
  "hairballs all night. We thought it was a…",
] as const

const FINAL_CHOICES = [
  { id: "batman", letter: "A", name: "Batman" },
  { id: "unicorn", letter: "B", name: "Unicorn" },
  { id: "boring", letter: "C", name: "Boring" },
] as const

const FINAL_QUESTION_LINES = [
  "If you could be anything",
  "what would you be?",
] as const

export type CaptainChoice = (typeof CAPTAIN_CHOICES)[number]["id"]
export type JokeChoice = (typeof JOKE_CHOICES)[number]["id"]
export type FinalChoice = (typeof FINAL_CHOICES)[number]["id"]
export type LibraryQuizPhase = "captain" | "joke" | "final"
export type QuizChoiceLayout = { choice: string; centerX: number; centerY: number; width: number; height: number; fontSize: number }

type QuizChoiceRow = { id: string; letter: string; name: string }
type QuizCardConfig = { choices: readonly QuizChoiceRow[]; questionLines: readonly string[]; headerRatio: number }
const CEILING_VANISH = 3
const CEILING_BEAMS = [1.12, 1.3] as const

const FALL_START = 0.4
export const LIBRARY_LANDING_SECONDS = 1.85
export const LIBRARY_FALL_START = FALL_START
const FALL_END = LIBRARY_LANDING_SECONDS
const SHAKE_SECONDS = 0.45
const SHAKE_STRENGTH = 11
const FLASH_SECONDS = 0.2
const IRIS_IN_END = 0.7

const CRASH_LOOK: RadiLook = { ...bookwormRadiLook, expression: "surprised" }
const GET_UP_START = 2.7
const GET_UP_END = 4.1
const CLEAN_SWEEP_SECONDS = 0.85
const CLEAN_SWEEPS = 3
const BACK_HANDS: readonly [Point, Point] = [[-14, -48], [14, -48]]
const KNEE_HANDS: readonly [Point, Point] = [[-11, -26], [11, -26]]
const SIDE_HANDS: readonly [Point, Point] = [[-14, -27], [14, -27]]
const CROUCH_LIFT = 5
const ARM_SEGMENT = 9
const SHOULDER_X = 8.5
const SHOULDER_Y = -42.5

export const easeInOut = (amount: number) => amount * amount * (3 - 2 * amount)

const elbowBendFor = ([handX, handY]: Point, side: number) => {
  const reach = Math.hypot(handX - side * SHOULDER_X, handY - SHOULDER_Y)
  return Math.sqrt(Math.max(0, ARM_SEGMENT ** 2 - (reach / 2) ** 2))
}

const naturalElbows = (hands: readonly [Point, Point]): readonly [number, number] => [elbowBendFor(hands[0], -1), elbowBendFor(hands[1], 1)]

export const mixHands = (from: readonly [Point, Point], to: readonly [Point, Point], amount: number): readonly [Point, Point] => [
  mixPoint(from[0], to[0], amount),
  mixPoint(from[1], to[1], amount),
]

const cleaningPose = (sceneSeconds: number) => {
  const sweep = (sceneSeconds - GET_UP_END) / CLEAN_SWEEP_SECONDS
  if (sweep < 0 || sweep >= CLEAN_SWEEPS) return { hands: SIDE_HANDS, brush: null, puff: 0 }
  const sweepIndex = Math.floor(sweep)
  const sweepT = sweep - sweepIndex
  const brushingLeft = sweepIndex % 2 === 0
  const across = sweepT < 0.7 ? sweepT / 0.7 : (1 - sweepT) / 0.3
  const brush = mixPoint(brushingLeft ? [-15, -38] : [15, -38], [0, -30], easeOut(Math.min(1, across)))
  return {
    hands: (brushingLeft ? [brush, SIDE_HANDS[1]] : [SIDE_HANDS[0], brush]) as readonly [Point, Point],
    brush,
    puff: Math.sin(Math.min(sweepT, 1) * Math.PI),
  }
}

const libraryLayout = (width: number, height: number) => ({
  scale: radiScale(width, height) * 1.15,
  floorY: height * 0.9,
  ceilingY: height * 0.16,
  landingX: width * 0.52,
})

type SpineMark = (typeof SPINE_MARKS)[number]
type ShelfOrnament = "plant" | "clock" | "none"

export const seededRandom = (index: number, salt: number) => {
  const wave = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453
  return wave - Math.floor(wave)
}

const quakeWobble = (sinceImpact: number, seed: number) => {
  if (sinceImpact < 0 || sinceImpact > QUAKE_SECONDS) return 0
  return (1 - sinceImpact / QUAKE_SECONDS) ** 2 * Math.sin(sinceImpact * 34 + seed)
}

type BookDraw = { key: string; restX: number; restY: number; lift: number; tilt: number; halfWidth: number; halfHeight: number; lineWidth: number; body: (context: Context) => void }
type PaintBook = (context: Context, book: BookDraw) => void
type ShelfPiece = { key: string; left: number; top: number; right: number; bottom: number; draw: (context: Context) => void }
type ShelfPainter = { book: PaintBook; piece: (context: Context, piece: ShelfPiece) => void }

const paintBookVector: PaintBook = (context, { restX, restY, lift, tilt, lineWidth, body }) => {
  context.save()
  context.translate(restX, restY - lift)
  context.rotate(tilt)
  context.lineWidth = lineWidth
  body(context)
  context.restore()
}

const SPRITE_PAD = 4
type ShelfSprite = { canvas: HTMLCanvasElement; originX: number; originY: number; scale: number }
const shelfSprites = new Map<string, ShelfSprite>()
let spriteLayout = ""
let warmedSteps = 0
const WARM_MILLISECONDS_PER_FRAME = 4
let warmDeadline = Infinity
let isWarmStepUnfinished = false
let spriteScratch: Context | null = null
onLayersReleased("library", () => {
  shelfSprites.clear()
  spriteLayout = ""
})

const spriteKey = (context: Context, key: string) => `${key} ${context.strokeStyle} ${context.lineWidth} ${context.lineJoin} ${context.lineCap}`

const buildShelfSprite = (context: Context, key: string, anchorX: number, anchorY: number, minX: number, minY: number, maxX: number, maxY: number, draw: (layer: Context) => void) => {
  if (shelfSprites.has(key)) return
  if (performance.now() > warmDeadline) {
    isWarmStepUnfinished = true
    return
  }
  const { a, b, c, d, e, f } = context.getTransform()
  const scale = Math.hypot(a, b)
  const deviceX = a * anchorX + c * anchorY + e
  const deviceY = b * anchorX + d * anchorY + f
  const originX = Math.ceil((SPRITE_PAD - minX) * scale) + deviceX - Math.floor(deviceX)
  const originY = Math.ceil((SPRITE_PAD - minY) * scale) + deviceY - Math.floor(deviceY)
  const canvas = document.createElement("canvas")
  canvas.width = Math.ceil(originX + (maxX + SPRITE_PAD) * scale)
  canvas.height = Math.ceil(originY + (maxY + SPRITE_PAD) * scale)
  const layer = canvas.getContext("2d")
  if (!layer) return
  layer.setTransform(scale, 0, 0, scale, originX - scale * anchorX, originY - scale * anchorY)
  layer.strokeStyle = context.strokeStyle
  layer.lineWidth = context.lineWidth
  layer.lineJoin = context.lineJoin
  layer.lineCap = context.lineCap
  draw(layer)
  shelfSprites.set(key, { canvas, originX, originY, scale })
}

const drawShelfSprite = (context: Context, { canvas, originX, originY, scale }: ShelfSprite, anchorX: number, anchorY: number) =>
  context.drawImage(canvas, anchorX - originX / scale, anchorY - originY / scale, canvas.width / scale, canvas.height / scale)

const vectorShelves: ShelfPainter = {
  book: paintBookVector,
  piece: (context, piece) => piece.draw(context),
}

const buildShelves: ShelfPainter = {
  book: (context, book) =>
    buildShelfSprite(context, spriteKey(context, book.key), book.restX, book.restY, -book.halfWidth, -book.halfHeight, book.halfWidth, book.halfHeight, (layer) => {
      layer.translate(book.restX, book.restY)
      layer.lineWidth = book.lineWidth
      book.body(layer)
    }),
  piece: (context, piece) =>
    buildShelfSprite(context, spriteKey(context, piece.key), piece.left, piece.top, 0, 0, piece.right - piece.left, piece.bottom - piece.top, piece.draw),
}

const spriteShelves: ShelfPainter = {
  book: (context, book) => {
    const sprite = shelfSprites.get(spriteKey(context, book.key))
    if (!sprite) {
      paintBookVector(context, book)
      return
    }
    context.save()
    context.translate(book.restX, book.restY - book.lift)
    context.rotate(book.tilt)
    drawShelfSprite(context, sprite, 0, 0)
    context.restore()
  },
  piece: (context, piece) => {
    const sprite = shelfSprites.get(spriteKey(context, piece.key))
    if (sprite) drawShelfSprite(context, sprite, piece.left, piece.top)
    else piece.draw(context)
  },
}

const lyingBookBody = (bookWidth: number, bookHeight: number, color: string) => (context: Context) => {
  const spine = Math.max(2.5, bookHeight * 0.42)
  const pageTop = -bookHeight / 2
  const pageRight = bookWidth / 2 - spine
  paintShape(context, "#f6f0e4", (path) => path.roundRect(-bookWidth / 2, pageTop, bookWidth - spine + 1, bookHeight, 1))
  for (const line of [0.35, 0.65]) {
    const lineY = pageTop + bookHeight * line
    paintLine(context, "rgba(43, 29, 26, 0.35)", 1, linePath(-bookWidth / 2 + 2, lineY, pageRight - 1, lineY))
  }
  paintShape(context, color, (path) => path.roundRect(pageRight - 0.5, pageTop, spine + 0.5, bookHeight, 1))
}

const narrowBookBody = (bookWidth: number, bookHeight: number, color: string) => (context: Context) => {
  const pages = Math.max(2, bookWidth * 0.34)
  paintShape(context, color, (path) => path.roundRect(-bookWidth / 2, -bookHeight / 2, bookWidth, bookHeight, 1.5))
  paintFill(context, "#f6f0e4", (path) => path.rect(bookWidth / 2 - pages, -bookHeight / 2 + 1.2, pages - 0.6, bookHeight - 2.4))
  paintFill(context, "rgba(255, 255, 255, 0.8)", (path) => path.rect(-bookWidth / 2 + 1.2, -bookHeight * 0.22, Math.max(1.5, bookWidth - pages - 2.4), Math.max(1.6, bookHeight * 0.07)))
}

const bookBody = (bookWidth: number, bookHeight: number, color: string, mark: SpineMark) => (context: Context) => {
  paintShape(context, color, (path) => path.roundRect(-bookWidth / 2, -bookHeight / 2, bookWidth, bookHeight, 2), { shade: "rgba(0, 0, 0, 0.22)" })
  paintLine(context, "rgba(255, 255, 255, 0.8)", Math.max(1.2, bookWidth * 0.1), linePath(-bookWidth * 0.28, -bookHeight / 2, -bookWidth * 0.28, bookHeight / 2))
  if (mark === "stripe") paintLine(context, "rgba(255, 255, 255, 0.85)", Math.max(1.4, bookWidth * 0.14), linePath(bookWidth * 0.08, -bookHeight * 0.34, bookWidth * 0.08, bookHeight * 0.34))
  if (mark === "dot") paintFill(context, "#fff6c8", ellipsePath(bookWidth * 0.08, -bookHeight * 0.16, Math.max(1.4, bookWidth * 0.16), Math.max(1.4, bookWidth * 0.16)))
  if (mark === "band") paintFill(context, "rgba(255, 255, 255, 0.9)", (path) => path.rect(-bookWidth / 2, -bookHeight * 0.08, bookWidth, Math.max(2, bookHeight * 0.14)))
  if (mark === "gold") {
    for (const bandY of [-0.38, 0.3]) paintFill(context, GOLD, (path) => path.rect(-bookWidth / 2, bookHeight * bandY, bookWidth, Math.max(1.6, bookHeight * 0.06)))
  }
  if (mark === "label") {
    context.lineWidth = 1.2
    paintShape(context, "#fff4dc", (path) => path.roundRect(-bookWidth * 0.32, -bookHeight * 0.22, bookWidth * 0.64, bookHeight * 0.26, 1.5))
  }
}

const drawBook = (context: Context, centerX: number, centerY: number, bookWidth: number, bookHeight: number, color: string, tilt: number, mark: SpineMark) =>
  paintBookVector(context, { key: "", restX: centerX, restY: centerY, lift: 0, tilt, halfWidth: bookWidth / 2, halfHeight: bookHeight / 2, lineWidth: 2, body: bookBody(bookWidth, bookHeight, color, mark) })

const drawPlant = (context: Context, centerX: number, shelfY: number) => {
  paintShape(context, "#e07a3d", (path) => {
    path.moveTo(centerX - 7, shelfY)
    path.lineTo(centerX + 7, shelfY)
    path.lineTo(centerX + 5, shelfY - 8)
    path.lineTo(centerX - 5, shelfY - 8)
    path.closePath()
  })
  paintFill(context, "#3aaa6a", ellipsePath(centerX - 6, shelfY - 14, 7, 5))
  paintFill(context, "#2f8f4e", ellipsePath(centerX + 5, shelfY - 13, 6, 4.5))
  paintFill(context, "#67d36a", ellipsePath(centerX, shelfY - 18, 5, 6))
}

const drawClock = (context: Context, centerX: number, centerY: number) => {
  paintShape(context, "#fff8ea", ellipsePath(centerX, centerY, 9, 9))
  paintLine(context, OUTLINE, 1.4, linePath(centerX, centerY, centerX, centerY - 5))
  paintLine(context, OUTLINE, 1.4, linePath(centerX, centerY, centerX + 4, centerY + 1))
}

const bookColor = (bookIndex: number, salt: number) => BOOK_COLORS[Math.floor(seededRandom(bookIndex, salt) * BOOK_COLORS.length)] ?? BOOK_COLORS[0]

const drawCaseFrame = (context: Context, left: number, top: number, right: number, bottom: number) => {
  const caseWidth = right - left
  paintShape(context, WOOD_DARK, (path) => path.roundRect(left, top, caseWidth, bottom - top, 6))
  paintLine(context, "rgba(255, 214, 160, 0.45)", 2.5, linePath(left + 4, top + 6, left + 4, bottom - 8))
  paintLine(context, "rgba(40, 16, 4, 0.45)", 2.5, linePath(right - 4, top + 6, right - 4, bottom - 8))
  paintShape(context, WOOD_DARK, (path) => path.roundRect(left - 4, top - 6, caseWidth + 8, 8, 2))
  paintShape(context, WOOD, (path) => path.roundRect(left - 9, top - 16, caseWidth + 18, 11, 3))
  paintLine(context, WOOD_LIGHT, 2, linePath(left - 5, top - 13, right + 5, top - 13))
  paintShape(context, WOOD, (path) => path.roundRect(left - 5, bottom - 13, caseWidth + 10, 13, 3))
  paintLine(context, WOOD_LIGHT, 2, linePath(left - 1, bottom - 10, right + 1, bottom - 10))
}

const drawCubby = (context: Context, innerLeft: number, innerRight: number, cubbyTop: number, shelfY: number) => {
  const depth = Math.min(9, (innerRight - innerLeft) * 0.06)
  paintFill(context, SHELF_BACK, (path) => path.rect(innerLeft, cubbyTop, innerRight - innerLeft, shelfY - cubbyTop))
  paintFill(context, SHELF_SIDE, (path) => {
    path.moveTo(innerLeft, cubbyTop)
    path.lineTo(innerLeft + depth, cubbyTop + depth)
    path.lineTo(innerLeft + depth, shelfY)
    path.lineTo(innerLeft, shelfY)
    path.closePath()
  })
  const shadow = context.createLinearGradient(0, cubbyTop, 0, cubbyTop + 14)
  shadow.addColorStop(0, "rgba(0, 0, 0, 0.45)")
  shadow.addColorStop(1, "rgba(0, 0, 0, 0)")
  paintFill(context, shadow, (path) => path.rect(innerLeft, cubbyTop, innerRight - innerLeft, 14))
}

const drawShelfBooks = (context: Context, startX: number, endX: number, cubbyTop: number, shelfY: number, firstBook: number, sinceImpact: number, paintBook: PaintBook) => {
  let bookX = startX
  let packedUntil = startX
  let bookIndex = firstBook
  while (bookX < endX - 8) {
    const roll = seededRandom(bookIndex, 11)
    const jiggle = quakeWobble(sinceImpact, bookIndex * 1.7)
    const bounce = Math.abs(jiggle) * 4
    if (roll < 0.06) {
      bookX += 7
    } else if (roll < 0.16) {
      const naturalWidth = Math.min(mix(18, 26, seededRandom(bookIndex, 13)), endX - bookX)
      let openIndex = bookIndex
      let nextX = bookX
      while (nextX < endX - 8 && seededRandom(openIndex + 1, 11) < 0.06) {
        openIndex += 1
        nextX += 7
      }
      const followingRoll = seededRandom(openIndex + 1, 11)
      const followingWidth = followingRoll < 0.16 ? mix(18, 26, seededRandom(openIndex + 1, 13)) : mix(7, 15, seededRandom(openIndex + 1, 16) ** 1.5)
      const followingFits = nextX < endX - 8 && nextX + followingWidth <= endX
      const stackEnd = followingFits ? nextX - 3 : endX - 2
      const openSpan = stackEnd - packedUntil
      const flatWidth = openSpan >= 8 ? openSpan : naturalWidth
      const stackStart = openSpan >= 8 ? packedUntil : bookX
      const flatHeight = 7
      const layers = 2 + Math.floor(seededRandom(bookIndex, 14) * 3)
      for (let layer = 0; layer < layers; layer += 1) {
        const restX = stackStart + flatWidth / 2 + (layer % 2) * 1.5
        const restY = shelfY - flatHeight / 2 - layer * (flatHeight + 1)
        const layerWidth = flatWidth - layer * 2
        const color = bookColor(bookIndex + layer, 18)
        paintBook(context, {
          key: `lying ${restX} ${restY} ${layerWidth} ${color}`,
          restX,
          restY,
          lift: bounce * (1 + layer * 0.4),
          tilt: jiggle * 0.05,
          halfWidth: layerWidth / 2,
          halfHeight: flatHeight / 2,
          lineWidth: 1.5,
          body: lyingBookBody(layerWidth, flatHeight, color),
        })
      }
      bookX = stackStart + flatWidth + 3
      packedUntil = bookX
      bookIndex = openIndex
    } else {
      const bookHeight = (shelfY - cubbyTop - 6) * mix(0.6, 0.95, seededRandom(bookIndex, 15))
      const bookWidth = mix(7, 15, seededRandom(bookIndex, 16) ** 1.5)
      if (bookX + bookWidth > endX) break
      const leaning = roll > 0.92
      const mark = SPINE_MARKS[Math.floor(seededRandom(bookIndex, 17) * SPINE_MARKS.length)] ?? "plain"
      const bookCenterX = bookX + bookWidth / 2 + (leaning ? bookHeight * 0.12 : 0)
      const bookRestY = shelfY - bookHeight / 2
      const bookTilt = (leaning ? 0.25 : 0) + jiggle * 0.08
      const bookColorHere = bookColor(bookIndex, 12)
      const isNarrow = bookWidth < 11
      paintBook(context, {
        key: `${isNarrow ? "narrow" : mark} ${bookCenterX} ${bookRestY} ${bookWidth} ${bookHeight} ${bookColorHere}`,
        restX: bookCenterX,
        restY: bookRestY,
        lift: bounce,
        tilt: bookTilt,
        halfWidth: bookWidth / 2,
        halfHeight: bookHeight / 2,
        lineWidth: isNarrow ? 1.5 : 2,
        body: isNarrow ? narrowBookBody(bookWidth, bookHeight, bookColorHere) : bookBody(bookWidth, bookHeight, bookColorHere, mark),
      })
      bookX += bookWidth + (leaning ? bookHeight * 0.25 : 1.5)
      packedUntil = bookX
    }
    bookIndex += 1
  }
}

type Bookcase = { left: number; top: number; right: number; bottom: number; ornament: ShelfOrnament }

const roomBookcases = (width: number, height: number, floorY: number): Bookcase[] => [
  { left: width * 0.2, top: height * 0.34, right: width * 0.38, bottom: floorY, ornament: "plant" },
  { left: width * 0.66, top: height * 0.34, right: width * 0.84, bottom: floorY, ornament: "clock" },
]

const sideBookcases = (width: number, ceilingY: number, floorY: number): Bookcase[] => [
  { left: 12, top: ceilingY - 6, right: width * 0.2, bottom: floorY + 8, ornament: "none" },
  { left: width * 0.8, top: ceilingY - 6, right: width - 12, bottom: floorY + 8, ornament: "none" },
]

const warmShelfSprites = (context: Context, width: number, height: number, floorY: number, ceilingY: number, sinceImpact: number) => {
  const { a, b, c, d, e, f } = context.getTransform()
  const layout = [width, height, a, b, c, d, e, f].join(" ")
  if (layout !== spriteLayout) {
    shelfSprites.clear()
    spriteLayout = layout
    warmedSteps = 0
  }
  const ladder = ladderPlacement(width, height, floorY)
  const warmSteps: ((scratch: Context) => void)[] = [
    ...[...roomBookcases(width, height, floorY), ...sideBookcases(width, ceilingY, floorY)].map((bookcase) => (scratch: Context) => drawBookcase(scratch, bookcase, sinceImpact, buildShelves)),
    (scratch) => drawLadder(scratch, ladder.left, floorY, ladder.top, sinceImpact, buildShelves),
    (scratch) => drawPainting(scratch, paintingPlacement(width, height), sinceImpact, buildShelves),
  ]
  const warmStep = warmSteps[warmedSteps]
  if (!warmStep) return
  if (!spriteScratch) {
    const scratch = document.createElement("canvas")
    scratch.width = 1
    scratch.height = 1
    spriteScratch = scratch.getContext("2d")
  }
  if (!spriteScratch) return
  spriteScratch.setTransform(a, b, c, d, e, f)
  spriteScratch.strokeStyle = context.strokeStyle
  spriteScratch.lineWidth = context.lineWidth
  spriteScratch.lineJoin = context.lineJoin
  spriteScratch.lineCap = context.lineCap
  warmDeadline = performance.now() + WARM_MILLISECONDS_PER_FRAME
  isWarmStepUnfinished = false
  warmStep(spriteScratch)
  warmDeadline = Infinity
  if (!isWarmStepUnfinished) warmedSteps += 1
}

const drawBookcase = (context: Context, { left, top, right, bottom, ornament }: Bookcase, sinceImpact: number, shelves: ShelfPainter) => {
  const sway = quakeWobble(sinceImpact, left * 0.013)
  const centerX = (left + right) / 2
  context.save()
  context.translate(centerX + sway * 3, bottom)
  context.rotate(sway * 0.02)
  context.translate(-centerX, -bottom)
  shelves.piece(context, { key: `frame ${left} ${top} ${right} ${bottom}`, left: left - 9, top: top - 16, right: right + 9, bottom, draw: (layer) => drawCaseFrame(layer, left, top, right, bottom) })
  const innerLeft = left + 10
  const innerRight = right - 10
  const innerTop = top + 8
  const innerBottom = bottom - 14
  const caseSeed = Math.round(left / 10)
  for (let row = 0; row < SHELF_ROWS; row += 1) {
    const cubbyTop = mix(innerTop, innerBottom, row / SHELF_ROWS)
    const shelfY = mix(innerTop, innerBottom, (row + 1) / SHELF_ROWS) - SHELF_THICKNESS
    const ornamentHere = ornament === "plant" && row === 0 ? "plant" : ornament === "clock" && row === 1 ? "clock" : "none"
    const ornamentLift = Math.abs(quakeWobble(sinceImpact, row * 2.3)) * 3
    shelves.piece(context, { key: `cubby ${innerLeft} ${cubbyTop} ${innerRight} ${shelfY}`, left: innerLeft, top: cubbyTop, right: innerRight, bottom: shelfY, draw: (layer) => drawCubby(layer, innerLeft, innerRight, cubbyTop, shelfY) })
    drawShelfBooks(context, innerLeft + 3, ornamentHere === "none" ? innerRight : innerRight - 24, cubbyTop, shelfY, caseSeed + row * 13, sinceImpact, shelves.book)
    if (ornamentHere === "plant") drawPlant(context, innerRight - 12, shelfY - ornamentLift)
    if (ornamentHere === "clock") drawClock(context, innerRight - 12, shelfY - 12 - ornamentLift)
    shelves.piece(context, {
      key: `plank ${innerLeft} ${innerRight} ${shelfY}`,
      left: innerLeft - 3,
      top: shelfY,
      right: innerRight + 3,
      bottom: shelfY + SHELF_THICKNESS,
      draw: (layer) => {
        paintShape(layer, WOOD, (path) => path.rect(innerLeft - 3, shelfY, innerRight - innerLeft + 6, SHELF_THICKNESS))
        paintLine(layer, WOOD_LIGHT, 1.6, linePath(innerLeft - 1, shelfY + 2, innerRight + 1, shelfY + 2))
      },
    })
  }
  context.restore()
}

type LadderPlacement = { left: number; top: number; footY: number }

const ladderPlacement = (width: number, height: number, floorY: number): LadderPlacement => ({ left: width * 0.75, top: height * 0.36, footY: floorY - 8 })

const ladderRungY = (top: number, footY: number, rung: number) => mix(top + 14, footY - 16, rung / (LADDER_RUNGS - 1))

const ladderCenterX = ({ left, top, footY }: LadderPlacement, y: number) => mix(left + 15, left + 3, (y - top) / (footY - top))

const drawLadder = (context: Context, left: number, floorY: number, top: number, sinceImpact: number, shelves: ShelfPainter) => {
  const railY = top - 8
  const footY = floorY - 8
  const topRails = [left, left + 30] as const
  const footRails = [left - 18, left + 24] as const
  const railXAt = (side: 0 | 1, y: number) => mix(topRails[side], footRails[side], (y - top) / (footY - top))
  paintLine(context, OUTLINE, 6.5, linePath(left - 60, railY, left + 90, railY))
  paintLine(context, BRASS, 3.5, linePath(left - 60, railY, left + 90, railY))
  for (const bracketX of [left - 50, left + 80]) paintShape(context, BRASS, (path) => path.roundRect(bracketX - 3, railY - 7, 6, 13, 2))
  context.save()
  context.translate(left + 15, railY)
  context.rotate(quakeWobble(sinceImpact, 2.9) * 0.025)
  context.translate(-(left + 15), -railY)
  shelves.piece(context, {
    key: `ladder ${left} ${top} ${floorY}`,
    left: left - 23,
    top: top - 15,
    right: left + 40,
    bottom: floorY,
    draw: (layer) => {
      layer.lineWidth = 2.5
      for (let rung = 0; rung < LADDER_RUNGS; rung += 1) {
        const rungY = ladderRungY(top, footY, rung)
        const rungLeft = railXAt(0, rungY)
        const rungRight = railXAt(1, rungY)
        paintShape(layer, WOOD, (path) => path.roundRect(rungLeft, rungY - 3, rungRight - rungLeft, 6, 2))
        paintLine(layer, "rgba(90, 42, 16, 0.6)", 1.5, linePath(rungLeft + 2, rungY + 1.5, rungRight - 2, rungY + 1.5))
        if (rung === 3) drawBook(layer, (rungLeft + rungRight) / 2, rungY - 6, 20, 6, BOOK_COLORS[3], 0, "gold")
      }
      for (const side of [0, 1] as const) {
        const topX = topRails[side]
        const footX = footRails[side]
        paintShape(layer, WOOD_DARK, (path) => {
          path.moveTo(topX - 3.5, top)
          path.lineTo(topX + 3.5, top)
          path.lineTo(footX + 4, footY)
          path.lineTo(footX - 4, footY)
          path.closePath()
        })
        paintLine(layer, WOOD_LIGHT, 1.5, linePath(topX - 1, top + 4, footX - 1.5, footY - 4))
        const hookPath = (path: Path2D) => {
          path.moveTo(topX, top + 2)
          path.lineTo(topX, railY - 2)
          path.arc(topX + 5, railY - 2, 5, Math.PI, 0)
        }
        paintLine(layer, OUTLINE, 5, hookPath)
        paintLine(layer, BRASS, 2.5, hookPath)
        paintShape(layer, BRASS, ellipsePath(footX, floorY - 5, 5, 5))
        paintFill(layer, OUTLINE, ellipsePath(footX, floorY - 5, 1.6, 1.6))
      }
    },
  })
  context.restore()
}

const drawPaintingScene = (context: Context, left: number, top: number, sceneWidth: number, sceneHeight: number) => {
  const sky = context.createLinearGradient(0, top, 0, top + sceneHeight)
  sky.addColorStop(0, "#7cc8ff")
  sky.addColorStop(1, "#ffe3b0")
  paintFill(context, sky, (path) => path.rect(left, top, sceneWidth, sceneHeight))
  paintShape(context, "#ffcf3f", ellipsePath(left + sceneWidth * 0.76, top + sceneHeight * 0.3, sceneHeight * 0.13, sceneHeight * 0.13))
  for (const [puffX, puffY, puffSize] of [[0.22, 0.26, 0.09], [0.3, 0.22, 0.11], [0.38, 0.27, 0.08]] as const) {
    paintFill(context, "#ffffff", ellipsePath(left + sceneWidth * puffX, top + sceneHeight * puffY, sceneHeight * puffSize * 1.4, sceneHeight * puffSize))
  }
  paintShape(context, "#7ccf6a", ellipsePath(left + sceneWidth * 0.25, top + sceneHeight * 1.05, sceneWidth * 0.5, sceneHeight * 0.45))
  paintShape(context, "#3fae5a", ellipsePath(left + sceneWidth * 0.82, top + sceneHeight * 1.12, sceneWidth * 0.55, sceneHeight * 0.45))
  paintLine(context, WOOD_DARK, 3, linePath(left + sceneWidth * 0.62, top + sceneHeight * 0.78, left + sceneWidth * 0.62, top + sceneHeight * 0.58))
  paintShape(context, "#2f8f4e", ellipsePath(left + sceneWidth * 0.62, top + sceneHeight * 0.52, sceneHeight * 0.12, sceneHeight * 0.12))
  const kiraScale = (sceneWidth * 0.24) / 48
  context.save()
  context.translate(left + sceneWidth * 0.84, top + sceneHeight)
  context.rotate(-0.18)
  drawKiraFront(context, 0, KIRA_PEEK_UNITS * kiraScale, kiraScale)
  context.restore()
}

const paintingPlacement = (width: number, height: number) => ({ centerX: width * 0.52, centerY: height * 0.31, paintingWidth: Math.min(width * 0.16, height * 0.26) })

const drawPainting = (context: Context, { centerX, centerY, paintingWidth }: ReturnType<typeof paintingPlacement>, sinceImpact: number, shelves: ShelfPainter) => {
  const paintingHeight = paintingWidth * 0.72
  const left = centerX - paintingWidth / 2
  const top = centerY - paintingHeight / 2
  const nailY = top - paintingHeight * 0.18
  const frame = paintingWidth * 0.08
  const canvasPath = new Path2D()
  canvasPath.rect(left + frame, top + frame, paintingWidth - frame * 2, paintingHeight - frame * 2)
  context.save()
  context.translate(centerX, nailY)
  context.rotate(quakeWobble(sinceImpact, 0.7) * 0.07)
  context.translate(-centerX, -nailY)
  shelves.piece(context, {
    key: `painting ${centerX} ${centerY} ${paintingWidth}`,
    left: left - frame * 0.4,
    top: nailY - 3,
    right: left + paintingWidth + frame * 0.4 + 6,
    bottom: top + paintingHeight + 8,
    draw: (layer) => {
      layer.lineWidth = 2
      paintLine(layer, OUTLINE, 1.5, (path) => {
        path.moveTo(centerX - paintingWidth * 0.3, top + frame * 0.5)
        path.lineTo(centerX, nailY)
        path.lineTo(centerX + paintingWidth * 0.3, top + frame * 0.5)
      })
      paintFill(layer, "rgba(60, 30, 10, 0.18)", (path) => path.roundRect(left + 6, top + 8, paintingWidth, paintingHeight, 6))
      paintShape(layer, PAINTING_GOLD, (path) => path.roundRect(left, top, paintingWidth, paintingHeight, 6))
      paintLine(layer, GOLD, 2, (path) => path.roundRect(left + 4, top + 4, paintingWidth - 8, paintingHeight - 8, 4))
      layer.save()
      layer.clip(canvasPath)
      drawPaintingScene(layer, left + frame, top + frame, paintingWidth - frame * 2, paintingHeight - frame * 2)
      layer.restore()
      paintLine(layer, OUTLINE, 2, (path) => path.addPath(canvasPath))
      for (const [cornerX, cornerY] of [[left, top], [left + paintingWidth, top], [left, top + paintingHeight], [left + paintingWidth, top + paintingHeight]] as const) {
        paintShape(layer, GOLD, ellipsePath(cornerX, cornerY, frame * 0.4, frame * 0.4))
      }
      paintShape(layer, "#a8a8a8", ellipsePath(centerX, nailY, 3, 3))
    },
  })
  context.restore()
}

const drawRoom = (context: Context, width: number, height: number, floorY: number, ceilingY: number, sinceImpact: number, shelves: ShelfPainter) => {
  context.fillStyle = WALL
  context.fillRect(0, 0, width, height)
  const ceilingShadow = context.createLinearGradient(0, ceilingY, 0, ceilingY + 26)
  ceilingShadow.addColorStop(0, "rgba(90, 45, 18, 0.25)")
  ceilingShadow.addColorStop(1, "rgba(90, 45, 18, 0)")
  paintFill(context, ceilingShadow, (path) => path.rect(0, ceilingY, width, 26))
  paintFill(context, "#f1d3a4", (path) => path.rect(0, floorY, width, height - floorY))
  paintLine(context, OUTLINE, 3, linePath(0, floorY, width, floorY))
  for (let plank = 0; plank < 8; plank += 1) {
    const plankX = (width / 8) * plank
    paintLine(context, "rgba(120, 64, 28, 0.35)", 2, linePath(plankX, floorY, plankX + 30, height))
  }
  paintShape(context, RUG, ellipsePath(width * 0.52, floorY + 4, width * 0.14, height * 0.035))
  for (const bookcase of roomBookcases(width, height, floorY)) drawBookcase(context, bookcase, sinceImpact, shelves)
  drawPainting(context, paintingPlacement(width, height), sinceImpact, shelves)
}

const HOLE_EDGE = [1, 0.74, 1.12, 0.9, 0.62, 1.08, 0.82, 1.18, 0.7, 0.96, 1.1, 0.66, 1.04, 0.86, 1.16, 0.72, 0.98, 0.8, 1.14, 0.68, 1.06, 0.88, 0.76, 1.12] as const

const HOLE_CENTER_Y = 0.5
const HOLE_INSIDE = "#5e2d12"

const holePlacement = (width: number, ceilingY: number, holeOpen: number) => ({
  holeX: width * 0.52,
  holeY: ceilingY * HOLE_CENTER_Y,
  radiusX: Math.min(width * 0.12, ceilingY * 1.5) * holeOpen,
  radiusY: ceilingY * 0.38 * holeOpen,
})

const clipToCeiling = (context: Context, width: number, ceilingY: number) => {
  const band = new Path2D()
  band.rect(0, 0, width, ceilingY)
  context.clip(band)
}

const crashMotion = (sceneSeconds: number, floorY: number, scale: number) => {
  const fall = stageProgress(sceneSeconds, FALL_START, FALL_END)
  const feetY = mix(-40 * scale, floorY, fall ** 1.15)
  const tumble = (1 - easeOut(fall)) * Math.PI * -2.15
  const landed = easeOut(stageProgress(sceneSeconds, FALL_END - 0.4, FALL_END))
  const getUp = stageProgress(sceneSeconds, GET_UP_START, GET_UP_END)
  const sitUp = easeInOut(stageProgress(getUp, 0, 0.5))
  const stand = easeInOut(stageProgress(getUp, 0.45, 1))
  return {
    fall,
    feetY,
    spin: tumble + landed * mix(mix(-Math.PI / 2, -0.3, sitUp), 0, stand),
    landed,
    sitUp,
    stand,
    crouch: Math.min(easeOut(stageProgress(getUp, 0.15, 0.45)), 1 - stand),
    lie: landed * (1 - sitUp),
    lowestY: feetY + Math.max(0, -Math.cos(tumble)) * 100 * scale,
  }
}

const ceilingBreak = (headY: number, ceilingY: number) => ({
  cracks: stageProgress(headY, ceilingY - 280, ceilingY - 20),
  holeOpen: easeOut(stageProgress(headY, ceilingY - 50, ceilingY + 260)),
  travel: Math.max(0, headY - (ceilingY - 50)),
})

const findBreakStartSeconds = (floorY: number, scale: number, ceilingY: number) => {
  for (let seconds = FALL_START; seconds < FALL_END; seconds += 0.01) {
    if (ceilingBreak(crashMotion(seconds, floorY, scale).lowestY, ceilingY).travel > 0) return seconds
  }
  return FALL_END
}

let foundBreakStart = { floorY: NaN, scale: NaN, ceilingY: NaN, seconds: FALL_END }

const breakStartSeconds = (floorY: number, scale: number, ceilingY: number) => {
  if (foundBreakStart.floorY !== floorY || foundBreakStart.scale !== scale || foundBreakStart.ceilingY !== ceilingY) {
    foundBreakStart = { floorY, scale, ceilingY, seconds: findBreakStartSeconds(floorY, scale, ceilingY) }
  }
  return foundBreakStart.seconds
}

export const libraryRoofBreakSeconds = (width: number, height: number) => {
  const { floorY, ceilingY, scale } = libraryLayout(width, height)
  return breakStartSeconds(floorY, scale, ceilingY)
}

const traceHole = (path: Path2D, holeX: number, holeY: number, radiusX: number, radiusY: number) => {
  HOLE_EDGE.forEach((reach, index) => {
    const angle = ((index + ((index % 3) - 1) * 0.18) / HOLE_EDGE.length) * Math.PI * 2 - Math.PI / 2
    const x = holeX + Math.cos(angle) * radiusX * reach
    const y = holeY + Math.sin(angle) * radiusY * reach
    if (index === 0) path.moveTo(x, y)
    else path.lineTo(x, y)
  })
  path.closePath()
}

const ceilingCover = (width: number, ceilingY: number, holeOpen: number) => {
  const ceiling = new Path2D()
  ceiling.rect(0, 0, width, ceilingY)
  if (holeOpen > 0.02) {
    const { holeX, holeY, radiusX, radiusY } = holePlacement(width, ceilingY, holeOpen)
    traceHole(ceiling, holeX, holeY, radiusX, radiusY)
  }
  return ceiling
}

const drawCeilingBoards = (context: Context, width: number, ceilingY: number, holeOpen: number) => {
  context.save()
  clipToCeiling(context, width, ceilingY)
  context.clip(ceilingCover(width, ceilingY, holeOpen), "evenodd")
  const vanishX = width / 2
  const vanishY = ceilingY * CEILING_VANISH
  const spread = vanishY / (vanishY - ceilingY)
  const shade = context.createLinearGradient(0, 0, 0, ceilingY)
  shade.addColorStop(0, "#5e2d12")
  shade.addColorStop(1, "#a0602e")
  context.fillStyle = shade
  context.fillRect(0, 0, width, ceilingY)
  const boardGap = width / 16
  for (let board = -8; board <= 8; board += 1) {
    const backX = vanishX + board * boardGap
    const frontX = vanishX + board * boardGap * spread
    paintLine(context, "rgba(40, 16, 4, 0.55)", 2, linePath(frontX, 0, backX, ceilingY))
    paintLine(context, "rgba(255, 214, 160, 0.25)", 1.5, linePath(frontX + 3, 0, backX + 2, ceilingY))
  }
  for (const depth of CEILING_BEAMS) {
    const beamY = vanishY * (1 - 1 / depth)
    const beamHeight = (ceilingY * 0.16) / depth
    paintShape(context, WOOD_DARK, (path) => path.rect(-4, beamY, width + 8, beamHeight))
    paintFill(context, WOOD, (path) => path.rect(-4, beamY + beamHeight * 0.55, width + 8, beamHeight * 0.45))
    paintLine(context, WOOD_LIGHT, 1.5, linePath(0, beamY + beamHeight * 0.6, width, beamY + beamHeight * 0.6))
  }
  paintShape(context, WOOD, (path) => path.rect(-4, ceilingY - 12, width + 8, 8))
  paintShape(context, WOOD_DARK, (path) => path.rect(-4, ceilingY - 5, width + 8, 5))
  paintLine(context, WOOD_LIGHT, 1.5, linePath(0, ceilingY - 10, width, ceilingY - 10))
  context.restore()
}

const NIGHT_STARS = [
  { x: 0.32, y: -0.28, size: 1 },
  { x: -0.08, y: -0.42, size: 0.62 },
  { x: 0.46, y: 0.08, size: 0.55 },
  { x: 0.12, y: 0.34, size: 0.78 },
  { x: -0.42, y: 0.22, size: 0.5 },
  { x: 0.38, y: 0.4, size: 0.42 },
  { x: -0.22, y: 0.46, size: 0.66 },
] as const

const drawSparkle = (context: Context, centerX: number, centerY: number, size: number, spin: number) => {
  context.save()
  context.translate(centerX, centerY)
  context.rotate(spin)
  paintShape(context, "#fff8dc", (path) => {
    path.moveTo(0, -size)
    path.lineTo(size * 0.18, -size * 0.18)
    path.lineTo(size, 0)
    path.lineTo(size * 0.18, size * 0.18)
    path.lineTo(0, size)
    path.lineTo(-size * 0.18, size * 0.18)
    path.lineTo(-size, 0)
    path.lineTo(-size * 0.18, -size * 0.18)
    path.closePath()
  })
  paintFill(context, "#ffffff", ellipsePath(0, 0, size * 0.16, size * 0.16))
  context.restore()
}

const drawMoon = (context: Context, centerX: number, centerY: number, radius: number) => {
  const glow = context.createRadialGradient(centerX, centerY, radius * 0.2, centerX, centerY, radius * 2.2)
  glow.addColorStop(0, "rgba(255, 244, 196, 0.55)")
  glow.addColorStop(1, "rgba(255, 244, 196, 0)")
  paintFill(context, glow, ellipsePath(centerX, centerY, radius * 2.2, radius * 2.2))
  context.lineWidth = Math.max(2, radius * 0.08)
  paintShape(context, "#fff3c4", ellipsePath(centerX, centerY, radius, radius))
  paintFill(context, "#f3e2a4", ellipsePath(centerX - radius * 0.35, centerY - radius * 0.15, radius * 0.22, radius * 0.16))
  paintFill(context, "#f6e7b0", ellipsePath(centerX + radius * 0.28, centerY + radius * 0.32, radius * 0.14, radius * 0.1))
  for (const side of [-1, 1]) {
    paintFill(context, OUTLINE, ellipsePath(centerX + side * radius * 0.32, centerY - radius * 0.08, radius * 0.07, radius * 0.1))
    paintFill(context, "rgba(255, 170, 150, 0.55)", ellipsePath(centerX + side * radius * 0.52, centerY + radius * 0.22, radius * 0.14, radius * 0.08))
  }
  paintLine(context, OUTLINE, Math.max(1.4, radius * 0.07), (path) => path.arc(centerX, centerY + radius * 0.12, radius * 0.28, Math.PI * 0.15, Math.PI * 0.85))
}

const drawNightHole = (context: Context, width: number, ceilingY: number, holeOpen: number, time: number) => {
  if (holeOpen <= 0.02) return
  const { holeX, holeY, radiusX, radiusY } = holePlacement(width, ceilingY, holeOpen)
  const depth = ceilingY * 0.14 * holeOpen
  const hole = new Path2D()
  traceHole(hole, holeX, holeY, radiusX, radiusY)
  const woodLayer = new Path2D()
  traceHole(woodLayer, holeX, holeY + depth * 0.35, radiusX * 0.97, radiusY * 0.95)
  const sky = new Path2D()
  traceHole(sky, holeX, holeY + depth, radiusX * 0.93, radiusY * 0.88)
  context.save()
  clipToCeiling(context, width, ceilingY)
  context.clip(hole)
  context.fillStyle = PLASTER
  context.fill(hole)
  context.fillStyle = HOLE_INSIDE
  context.fill(woodLayer)
  context.fillStyle = NIGHT
  context.fill(sky)
  paintLine(context, OUTLINE, 2, (path) => path.addPath(sky))
  context.clip(sky)
  const moonRadius = Math.min(radiusX, radiusY) * 0.45
  drawMoon(context, holeX - radiusX * 0.3, holeY + depth * 0.5, moonRadius)
  NIGHT_STARS.forEach((star, index) => {
    const twinkle = 0.82 + Math.sin(time * 2.4 + index) * 0.18
    drawSparkle(context, holeX + star.x * radiusX, holeY + depth * 0.5 + star.y * radiusY, Math.max(6, moonRadius * 0.36 * star.size) * twinkle, index * 0.4)
  })
  context.restore()
}

const drawCeilingCracks = (context: Context, width: number, ceilingY: number, cracks: number) => {
  if (cracks <= 0) return
  context.save()
  context.clip(ceilingCover(width, ceilingY, 0))
  const { holeX, holeY } = holePlacement(width, ceilingY, 1)
  for (const crack of [{ angle: -0.6, length: 46 }, { angle: 0.35, length: 38 }, { angle: 1.1, length: 28 }, { angle: 2.5, length: 42 }, { angle: 3.5, length: 34 }] as const) {
    const reach = crack.length * cracks
    const bend = crack.angle + 0.35
    paintLine(context, OUTLINE, 2.6, (path) => {
      path.moveTo(holeX, holeY)
      path.quadraticCurveTo(
        holeX + Math.cos(bend) * reach * 0.55,
        holeY + Math.sin(bend) * reach * 0.4,
        holeX + Math.cos(crack.angle) * reach,
        holeY + Math.sin(crack.angle) * reach * 0.7,
      )
    })
  }
  context.restore()
}

const drawHoleRim = (context: Context, width: number, ceilingY: number, holeOpen: number) => {
  if (holeOpen <= 0.04) return
  const { holeX, holeY, radiusX, radiusY } = holePlacement(width, ceilingY, holeOpen)
  const hole = new Path2D()
  traceHole(hole, holeX, holeY, radiusX, radiusY)
  context.save()
  clipToCeiling(context, width, ceilingY)
  context.lineJoin = "round"
  context.lineWidth = 9
  context.strokeStyle = PLASTER
  context.stroke(hole)
  context.lineWidth = 3
  context.strokeStyle = OUTLINE
  context.stroke(hole)
  for (const crack of RIM_CRACKS) {
    const reach = crack.length * holeOpen
    const startX = holeX + Math.cos(crack.angle) * radiusX * 1.05
    const startY = holeY + Math.sin(crack.angle) * radiusY * 1.05
    const midX = startX + Math.cos(crack.angle) * reach * 0.5
    const midY = startY + Math.sin(crack.angle) * reach * 0.3
    const branchAngle = crack.angle + crack.branch
    paintLine(context, OUTLINE, 2.4, (path) => {
      path.moveTo(startX, startY)
      path.lineTo(midX, midY)
      path.lineTo(startX + Math.cos(crack.angle + 0.15) * reach, startY + Math.sin(crack.angle + 0.15) * reach * 0.6)
    })
    paintLine(context, OUTLINE, 1.8, linePath(midX, midY, midX + Math.cos(branchAngle) * reach * 0.45, midY + Math.sin(branchAngle) * reach * 0.3))
  }
  context.restore()
}

const drawHangingPlanks = (context: Context, width: number, height: number, ceilingY: number, floorY: number, holeOpen: number, sinceBreak: number) => {
  if (holeOpen <= 0.04) return
  const { holeX, holeY, radiusX, radiusY } = holePlacement(width, ceilingY, holeOpen)
  const hang = easeOut(stageProgress(holeOpen, 0.3, 1))
  for (const plank of HANGING_PLANKS) {
    const hangX = holeX + Math.cos(plank.angle) * radiusX * 0.92
    const hangY = holeY + Math.sin(plank.angle) * radiusY * 0.92
    const landing = plankLanding(plank, hangY, height, floorY)
    const fallTime = Math.min(Math.max(0, sinceBreak - plank.drop), landing)
    const tilt = mix(mix(plank.from, plank.tilt, hang), Math.sign(plank.tilt) * Math.PI / 2, fallTime / landing)
    const anchorY = hangY + 0.5 * DEBRIS_GRAVITY * fallTime ** 2
    drawHangingPlank(context, hangX + plank.drift * fallTime, anchorY, plank.width, ceilingY * plank.length, tilt, plank.color)
  }
}

const RIM_CRACKS = [
  { angle: -0.5, length: 34, branch: 0.5 },
  { angle: 0.3, length: 26, branch: -0.6 },
  { angle: 1.3, length: 22, branch: 0.5 },
  { angle: 2.4, length: 30, branch: -0.5 },
  { angle: 3.3, length: 38, branch: 0.6 },
  { angle: 4.1, length: 24, branch: -0.5 },
  { angle: 5.2, length: 30, branch: 0.5 },
] as const

const HANGING_PLANKS = [
  { angle: -1.95, width: 14, length: 0.55, from: 1.6, tilt: 0.3, color: WOOD, drop: 0.7, drift: -60, rest: 0.35 },
  { angle: -1.2, width: 11, length: 0.42, from: -1.5, tilt: -0.2, color: WOOD_DARK, drop: 1.05, drift: 40, rest: 0.15 },
  { angle: -0.35, width: 9, length: 0.32, from: 1.3, tilt: -0.65, color: WOOD, drop: 0.85, drift: 70, rest: 0.5 },
  { angle: 3.55, width: 10, length: 0.36, from: -1.4, tilt: 0.75, color: WOOD_DARK, drop: 1.25, drift: -50, rest: 0.25 },
] as const

const plankLanding = (plank: (typeof HANGING_PLANKS)[number], hangY: number, height: number, floorY: number) => {
  const restY = mix(floorY + 6, height - 10, plank.rest) - plank.width / 2
  return Math.sqrt((2 * (restY - hangY)) / DEBRIS_GRAVITY)
}

const drawHangingPlank = (context: Context, anchorX: number, anchorY: number, plankWidth: number, plankLength: number, tilt: number, color: string) => {
  context.save()
  context.translate(anchorX, anchorY)
  context.rotate(tilt)
  context.lineWidth = 2.5
  paintShape(context, color, (path) => {
    path.moveTo(-plankWidth / 2, -4)
    path.lineTo(plankWidth / 2, -4)
    path.lineTo(plankWidth / 2, plankLength * 0.78)
    path.lineTo(plankWidth * 0.2, plankLength)
    path.lineTo(-plankWidth * 0.05, plankLength * 0.84)
    path.lineTo(-plankWidth * 0.3, plankLength * 0.94)
    path.lineTo(-plankWidth / 2, plankLength * 0.7)
    path.closePath()
  })
  paintLine(context, "rgba(255, 220, 170, 0.5)", 1.5, linePath(-plankWidth * 0.1, 2, -plankWidth * 0.1, plankLength * 0.65))
  context.restore()
}

const PLASTER_BITS = [PLASTER, "#e9c88c", "#fff1d2"] as const
const DEBRIS_COLORS = { splinter: [WOOD, WOOD_DARK, "#b8702f"], chunk: PLASTER_BITS, crumb: PLASTER_BITS } as const

const DEBRIS_SIZES = { splinter: [16, 30], chunk: [6, 13], crumb: [2, 4.5] } as const

const BREAK_DEBRIS = Array.from({ length: 34 }, (_, index) => {
  const kind = index < 10 ? "splinter" : index < 20 ? "chunk" : "crumb"
  const [smallest, largest] = DEBRIS_SIZES[kind]
  return {
    kind,
    spawn: seededRandom(index, 1) - 0.5,
    direction: mix(-0.1, 1.1, seededRandom(index, 2)) * Math.PI,
    speed: mix(140, 380, seededRandom(index, 3)),
    spin: mix(-9, 9, seededRandom(index, 4)),
    size: mix(smallest, largest, seededRandom(index, 5)),
    delay: seededRandom(index, 6) * 0.22,
    restDepth: seededRandom(index, 7),
    color: DEBRIS_COLORS[kind][index % 3] ?? PLASTER,
  }
})

type DebrisPiece = (typeof BREAK_DEBRIS)[number]

const DEBRIS_GRAVITY = 1500

const drawDebrisPiece = (context: Context, piece: DebrisPiece, pieceX: number, pieceY: number, rotation: number) => {
  const { size } = piece
  if (piece.kind === "crumb") {
    paintFill(context, piece.color, ellipsePath(pieceX, pieceY, size, size))
    return
  }
  context.save()
  context.translate(pieceX, pieceY)
  context.rotate(rotation)
  context.lineWidth = 2
  paintShape(context, piece.color, (path) => {
    if (piece.kind === "splinter") {
      path.moveTo(-size / 2, -size * 0.12)
      path.lineTo(size * 0.3, -size * 0.14)
      path.lineTo(size / 2, 0)
      path.lineTo(size * 0.32, size * 0.12)
      path.lineTo(-size * 0.42, size * 0.14)
      path.lineTo(-size * 0.36, 0)
    } else {
      path.moveTo(-size, -size * 0.5)
      path.lineTo(size * 0.2, -size)
      path.lineTo(size, -size * 0.2)
      path.lineTo(size * 0.6, size * 0.8)
      path.lineTo(-size * 0.7, size * 0.6)
    }
    path.closePath()
  })
  context.restore()
}

const debrisLanding = (piece: DebrisPiece, holeY: number, height: number, floorY: number) => {
  const velocityY = Math.sin(piece.direction) * piece.speed
  const restY = mix(floorY + 2, height - 8, piece.restDepth * 0.7)
  return (-velocityY + Math.sqrt(velocityY ** 2 + 2 * DEBRIS_GRAVITY * (restY - holeY))) / DEBRIS_GRAVITY
}

const drawBreakDebris = (context: Context, width: number, height: number, ceilingY: number, floorY: number, sinceBreak: number) => {
  if (sinceBreak <= 0) return
  const { holeX, holeY, radiusX } = holePlacement(width, ceilingY, 1)
  for (const piece of BREAK_DEBRIS) {
    const flight = sinceBreak - piece.delay
    if (flight <= 0) continue
    const velocityX = Math.cos(piece.direction) * piece.speed
    const velocityY = Math.sin(piece.direction) * piece.speed
    const landing = debrisLanding(piece, holeY, height, floorY)
    const airTime = Math.min(flight, landing)
    const spun = piece.spin * airTime
    const rotation = flight >= landing && piece.kind === "splinter" ? Math.round(spun / Math.PI) * Math.PI : spun
    const pieceX = holeX + piece.spawn * radiusX * 1.5 + velocityX * airTime
    const pieceY = holeY + velocityY * airTime + 0.5 * DEBRIS_GRAVITY * airTime ** 2
    drawDebrisPiece(context, piece, pieceX, pieceY, rotation)
  }
}

const BREAK_PUFFS = [
  { offset: -0.6, drift: 30, size: 1 },
  { offset: -0.2, drift: 55, size: 1.3 },
  { offset: 0.25, drift: 45, size: 1.15 },
  { offset: 0.65, drift: 25, size: 0.9 },
  { offset: 0, drift: 80, size: 1.5 },
  { offset: -0.4, drift: 95, size: 0.8 },
  { offset: 0.45, drift: 100, size: 0.85 },
] as const

const BREAK_DUST_SECONDS = 1.6

const drawBreakDust = (context: Context, width: number, ceilingY: number, sinceBreak: number) => {
  const billow = stageProgress(sinceBreak, 0, BREAK_DUST_SECONDS)
  if (billow <= 0 || billow >= 1) return
  const { holeX, holeY, radiusX, radiusY } = holePlacement(width, ceilingY, 1)
  const grow = easeOut(billow)
  for (const puff of BREAK_PUFFS) {
    const puffRadius = radiusY * puff.size * mix(0.4, 1.3, grow)
    const puffX = holeX + puff.offset * radiusX * mix(0.6, 1.2, grow)
    const puffY = holeY + radiusY * 0.6 + puff.drift * grow * 1.6
    paintFill(context, `rgba(243, 222, 182, ${0.6 * (1 - billow)})`, ellipsePath(puffX, puffY, puffRadius * 1.3, puffRadius))
  }
}

const isRubbleSettled = (width: number, height: number, ceilingY: number, floorY: number, holeOpen: number, sinceBreak: number) => {
  if (!(sinceBreak >= BREAK_DUST_SECONDS)) return false
  const brokenHole = holePlacement(width, ceilingY, 1)
  if (!BREAK_DEBRIS.every((piece) => sinceBreak - piece.delay >= debrisLanding(piece, brokenHole.holeY, height, floorY))) return false
  if (holeOpen <= 0.04) return true
  const { holeY, radiusY } = holePlacement(width, ceilingY, holeOpen)
  return HANGING_PLANKS.every((plank) => sinceBreak - plank.drop >= plankLanding(plank, holeY + Math.sin(plank.angle) * radiusY * 0.92, height, floorY))
}

const BURST_RAYS = 12

const drawBreakBurst = (context: Context, width: number, ceilingY: number, sinceBreak: number) => {
  const burst = stageProgress(sinceBreak, 0, 0.35)
  if (burst <= 0 || burst >= 1) return
  const { holeX, holeY, radiusX } = holePlacement(width, ceilingY, 1)
  const glowRadius = radiusX * 1.6
  const glow = context.createRadialGradient(holeX, holeY, 0, holeX, holeY, glowRadius)
  glow.addColorStop(0, `rgba(255, 250, 225, ${0.8 * (1 - burst)})`)
  glow.addColorStop(1, "rgba(255, 250, 225, 0)")
  paintFill(context, glow, ellipsePath(holeX, holeY, glowRadius, glowRadius))
  const inner = mix(1.1, 1.6, burst)
  const outer = mix(1.4, 2.4, easeOut(burst))
  for (let ray = 0; ray < BURST_RAYS; ray += 1) {
    const angle = (ray / BURST_RAYS) * Math.PI * 2 + 0.2
    const rayX = Math.cos(angle) * radiusX
    const rayY = Math.sin(angle) * radiusX * 0.6
    paintLine(context, OUTLINE, 3 * (1 - burst) + 0.5, linePath(holeX + rayX * inner, holeY + rayY * inner, holeX + rayX * outer, holeY + rayY * outer))
  }
}

const drawDust = (context: Context, landingX: number, floorY: number, sceneSeconds: number) => {
  const puff = stageProgress(sceneSeconds, FALL_END, FALL_END + 0.8)
  if (puff <= 0) return
  for (let cloud = 0; cloud < 4; cloud += 1) {
    const spread = (cloud - 1.5) * 34 * puff
    paintFill(context, `rgba(232, 206, 164, ${0.45 * (1 - puff)})`, ellipsePath(landingX + spread, floorY - 8 - puff * 16, 28 + puff * 40, 10 + puff * 12))
  }
}

const drawCrashRadi = (context: Context, landingX: number, floorY: number, scale: number, time: number, sceneSeconds: number) => {
  const { fall, feetY, spin, landed, sitUp, stand, crouch, lie } = crashMotion(sceneSeconds, floorY, scale)
  const grounded = fall >= 1
  const flail = grounded ? 0 : Math.sin(time * 16)
  const cleaning = grounded && sceneSeconds >= GET_UP_END ? cleaningPose(sceneSeconds) : null
  const fallingHands: readonly [Point, Point] = [[-16 - flail * 4, -52], [16 + flail * 4, -50]]
  const settledHands = mixHands(mixHands(BACK_HANDS, KNEE_HANDS, sitUp), SIDE_HANDS, stand)
  const hands = cleaning ? cleaning.hands : mixHands(fallingHands, settledHands, grounded ? 1 : landed)
  const legBend = CROUCH_LIFT * crouch
  if (fall > 0.62) paintFill(context, "rgba(80, 42, 20, 0.16)", ellipsePath(landingX - lie * 34 * scale, floorY, mix(22, 64, lie) * scale, mix(4, 8, lie) * scale))
  context.save()
  context.translate(landingX, feetY + (legBend - 22 * lie) * scale)
  context.rotate(spin)
  drawRadi(context, stand > 0.82 ? bookwormRadiLook : CRASH_LOOK, 0, 0, scale, {
    faceTurn: grounded ? 0 : flail * 0.2,
    legLifts: grounded ? [legBend, legBend] : [7 + flail * 4, 7 - flail * 4],
    kneeBends: grounded ? [legBend * 0.8, legBend * 0.8] : [3, 3],
    hands,
    elbowBends: naturalElbows(hands),
  })
  if (cleaning?.brush && cleaning.puff > 0.05) {
    const [brushX, brushY] = cleaning.brush
    paintFill(context, `rgba(232, 206, 164, ${0.55 * cleaning.puff})`, ellipsePath(brushX * scale, brushY * scale, 4.2 * scale, 2.4 * scale))
    paintFill(context, `rgba(255, 248, 230, ${0.4 * cleaning.puff})`, ellipsePath((brushX + 8) * scale, (brushY + 6) * scale, 2.6 * scale, 1.6 * scale))
  }
  context.restore()
}

const drawSpeechBubble = (context: Context, width: number, height: number, radiX: number, floorY: number, scale: number, popScale: number) => {
  if (popScale <= 0) return
  const bubbleWidth = comicBubbleWidth(width, height, 0.4, 360)
  const bubbleHeight = bubbleWidth * 0.5
  const centerX = Math.min(width - bubbleWidth / 2 - 12, radiX + bubbleWidth * 0.45)
  const centerY = Math.max(bubbleHeight / 2 + 12, floorY - 125 * scale - bubbleHeight * 0.4)
  const headX = radiX + 12 * scale - centerX
  const headY = floorY - 90 * scale - centerY
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
  ], Math.max(3, bubbleWidth * 0.012), SPEECH_LINES, 0, 0, bubbleWidth * 0.08)
  context.restore()
}

const HELD_BOOK_WIDTH = 14
const HELD_BOOK_HEIGHT = 19
const TOSS_LANDING_BOUNCE = 0.3

const drawHeldBook = (context: Context, centerX: number, centerY: number, scale: number, tilt: number) =>
  drawBook(context, centerX, centerY, HELD_BOOK_WIDTH * scale, HELD_BOOK_HEIGHT * scale, READING_BOOK, tilt, "gold")

const skipBounce = (phase: number) => {
  const arc = Math.sin(phase * Math.PI)
  const contact = Math.max(0, 1 - arc * 3)
  return {
    lift: 4 * phase * (1 - phase),
    stretchY: 1 + 0.12 * Math.abs(Math.cos(phase * Math.PI)) * (1 - contact) - 0.2 * contact,
  }
}

const drawSkippingRadi = (context: Context, fromX: number, toX: number, floorY: number, scale: number, sceneSeconds: number, start: number, end: number, isCarrying: boolean) => {
  const stride = easeOut(stageProgress(sceneSeconds, start, end))
  const radiX = mix(fromX, toX, stride)
  const hopsDone = stride * SKIP_HOPS
  const hopPhase = hopsDone - Math.floor(hopsDone)
  const leadSide = Math.floor(hopsDone) % 2 === 0 ? 1 : -1
  const moving = stride > 0 && stride < 1
  const bounce = moving ? skipBounce(hopPhase) : { lift: 0, stretchY: 1 }
  const settle = Math.min(1, stride * 6, (1 - stride) * 6)
  const lift = bounce.lift * 18
  const stretchY = 1 + (bounce.stretchY - 1) * settle
  const knee = moving ? Math.sin(hopPhase * Math.PI) * 9 : 0
  const armPump = moving ? Math.sin(hopPhase * Math.PI) * leadSide : 0
  const lean = moving ? (0.12 + Math.sin(hopPhase * Math.PI * 2) * 0.05) * settle * Math.sign(toX - fromX) : 0
  const skipHands: readonly [Point, Point] = isCarrying
    ? HOLD_HANDS
    : [[-14 - Math.abs(armPump) * 3, -33 - armPump * 10], [14 + Math.abs(armPump) * 3, -33 + armPump * 10]]
  paintFill(context, "rgba(80, 42, 20, 0.16)", ellipsePath(radiX, floorY, 22 * scale * (1 - lift / 60), 3 * scale))
  context.save()
  context.translate(radiX, floorY - lift * scale)
  context.rotate(lean)
  context.scale(1 / stretchY, stretchY)
  drawRadi(context, bookwormRadiLook, 0, 0, scale, {
    faceTurn: Math.sign(toX - fromX) * 0.35 * settle,
    legLifts: leadSide === 1 ? [knee, knee * 0.2] : [knee * 0.2, knee],
    kneeBends: leadSide === 1 ? [knee * 0.5, knee * 0.1] : [knee * 0.1, knee * 0.5],
    hands: skipHands,
    elbowBends: naturalElbows(skipHands),
  })
  if (isCarrying) drawHeldBook(context, 2 * scale, -31 * scale, scale, 0.08)
  context.restore()
}

const climbPose = (progress: number, levels: readonly number[]) => {
  const steps = levels.length - 1
  const stepIndex = Math.min(steps - 1, Math.floor(progress * steps))
  const stepT = progress * steps - stepIndex
  const lift = Math.sin(stepT * Math.PI)
  const leadsLeft = stepIndex % 2 === 0
  return {
    feetY: mix(levels[stepIndex] ?? 0, levels[stepIndex + 1] ?? 0, easeInOut(stepT)),
    legLifts: (leadsLeft ? [lift * 9, lift * 1.5] : [lift * 1.5, lift * 9]) as readonly [number, number],
    hands: [
      [PEEK_HANDS[0][0], PEEK_HANDS[0][1] - (leadsLeft ? lift * 2 : 0)],
      [PEEK_HANDS[1][0], PEEK_HANDS[1][1] - (leadsLeft ? 0 : lift * 2)],
    ] as const,
  }
}

const drawClimbingRadi = (context: Context, ladder: LadderPlacement, floorY: number, scale: number, sceneSeconds: number) => {
  const isGoingDown = sceneSeconds >= CLIMB_DOWN_START
  const progress = isGoingDown ? 1 - stageProgress(sceneSeconds, CLIMB_DOWN_START, CLIMB_DOWN_END) : stageProgress(sceneSeconds, WALK_TO_LADDER_END, CLIMB_UP_END)
  const levels = [floorY, ...Array.from({ length: LADDER_RUNGS - TOP_RUNG }, (_, step) => ladderRungY(ladder.top, ladder.footY, LADDER_RUNGS - 1 - step) - 2)]
  const { feetY, legLifts, hands: climbHands } = climbPose(progress, levels)
  const radiX = ladderCenterX(ladder, feetY)
  const reach = easeOut(stageProgress(sceneSeconds, CLIMB_UP_END, REACH_END))
  const pull = easeInOut(stageProgress(sceneSeconds, REACH_END, PULL_END))
  const stretched = mixPoint(mixPoint(climbHands[1], REACH_HAND, reach), PEEK_HANDS[1], pull)
  const reaching = !isGoingDown && reach > 0 && pull < 1
  const hasBook = sceneSeconds >= PULL_END
  const hands: readonly [Point, Point] = [climbHands[0], hasBook ? CHEST_HAND : climbHands[1]]
  const turningAway = easeInOut(stageProgress(sceneSeconds, WALK_TO_LADDER_END, WALK_TO_LADDER_END + TURN_SECONDS))
  const turningBack = 1 - easeInOut(stageProgress(sceneSeconds, CLIMB_DOWN_END, WALK_BACK_START))
  const turn = Math.min(turningAway, turningBack)
  const faceRight = sceneSeconds < CLIMB_DOWN_START
  const motion = {
    legLifts,
    kneeBends: [legLifts[0] * 0.55, legLifts[1] * 0.55] as const,
    hands,
    elbowBends: naturalElbows(hands),
  }
  const backArms: BackArms = {
    behind: [hands[0], reaching ? null : hands[1]],
    reach: reaching ? { side: 1, hand: stretched } : null,
  }
  context.save()
  context.translate(radiX, feetY)
  if (turn < 0.34) {
    drawRadi(context, bookwormRadiLook, 0, 0, scale, motion)
    if (hasBook) drawHeldBook(context, 2 * scale, -31 * scale, scale, 0.08)
  } else if (turn < 0.66) {
    context.scale(faceRight ? 1 : -1, 1)
    drawRadiSide(context, bookwormRadiLook, 0, 0, scale, [8, -48])
  } else {
    drawRadiBack(context, bookwormRadiLook, 0, 0, scale, motion, backArms)
    if (reaching && reach > 0.72 && pull < 0.25) drawHeldBook(context, (stretched[0] + 2) * scale, stretched[1] * scale, scale, 0.2)
  }
  context.restore()
}

const drawSeatedLegs = (context: Context, radiX: number, seatY: number, scale: number, fold: number) => {
  context.save()
  context.translate(radiX, seatY)
  context.scale(scale, scale)
  context.lineWidth = OUTLINE_WIDTH
  const reach = easeOut(fold)
  for (const side of [-1, 1] as const) {
    const hipX = side * 4
    const hipY = -21
    const kneeX = side * mix(5, 10, reach)
    const kneeY = mix(-16, -15, reach)
    const ankleX = mix(side * 5, -side * 3, reach)
    const ankleY = mix(-12, -11, reach)
    paintTube(context, SKIN, 5, linePath(hipX, hipY, kneeX, kneeY), true)
    paintShape(context, SKIN, ellipsePath(kneeX, kneeY, 3.2, 3.2), { shade: "rgba(90, 40, 30, 0.22)" })
    paintTube(context, SKIN, 4.6, linePath(kneeX, kneeY, ankleX, ankleY), true)
    paintShape(context, WHITE, ellipsePath(ankleX, ankleY + 1.2, 3.8, 2.4), { shade: "rgba(90, 40, 30, 0.22)" })
    paintLine(context, OUTLINE, 0.6, linePath(ankleX - 1.1, ankleY, ankleX + 1.1, ankleY + 1))
  }
  context.restore()
}

const drawPage = (context: Context, side: number, pageWidth: number, pageHeight: number, lift: number) => {
  paintShape(context, PAGE, (path) => {
    path.moveTo(0, -pageHeight * 0.42)
    path.lineTo(side * pageWidth * 0.72, -pageHeight * 0.5 - lift)
    path.lineTo(side * pageWidth, pageHeight * 0.58 + lift * 0.2)
    path.lineTo(0, pageHeight * 0.48)
    path.closePath()
  })
  for (let line = 0; line < 4; line += 1) {
    const lineY = -pageHeight * 0.22 + line * pageHeight * 0.16
    paintLine(context, "rgba(43, 29, 26, 0.35)", 1, linePath(side * pageWidth * 0.16, lineY, side * pageWidth * 0.78, lineY + line * 0.4))
  }
}

const drawReadingBook = (context: Context, centerX: number, centerY: number, scale: number, open: number, pageTurn: number) => {
  const pageWidth = 16 * scale
  const pageHeight = 11 * scale
  context.save()
  context.translate(centerX, centerY)
  if (open <= 0) {
    drawHeldBook(context, 0, 0, scale, 0)
  } else {
    const spread = easeOut(open)
    context.scale(1, mix(0.55, 1, spread))
    context.lineWidth = 2
    paintShape(context, READING_BOOK, (path) => {
      path.moveTo(-pageWidth * 0.78 * spread, -pageHeight * 0.56)
      path.lineTo(pageWidth * 0.78 * spread, -pageHeight * 0.56)
      path.lineTo(pageWidth * 1.04 * spread, pageHeight * 0.64)
      path.lineTo(-pageWidth * 1.04 * spread, pageHeight * 0.64)
      path.closePath()
    })
    drawPage(context, -1, pageWidth * spread, pageHeight, 0)
    drawPage(context, 1, pageWidth * spread, pageHeight, 0)
    paintFill(context, "#e8d8b0", (path) => path.rect(-1.2, -pageHeight * 0.42, 2.4, pageHeight * 0.9))
    if (pageTurn > 0 && pageTurn < 1) {
      const flip = Math.cos(pageTurn * Math.PI)
      drawPage(context, flip >= 0 ? 1 : -1, pageWidth * spread * Math.abs(flip), pageHeight, Math.sin(pageTurn * Math.PI) * pageHeight * 0.35)
    }
  }
  context.restore()
}

const drawReadingRadi = (
  context: Context,
  radiX: number,
  floorY: number,
  scale: number,
  sceneSeconds: number,
  quizPhase: LibraryQuizPhase,
  jokeQuizStartSeconds: number | null,
  wrongSeconds: number | null,
  cheerSeconds: number | null,
  boringShakeSeconds: number | null,
) => {
  const sit = stageProgress(sceneSeconds, WALK_BACK_END, SIT_END)
  const crouch = easeOut(stageProgress(sit, 0, 0.38))
  const fold = easeInOut(stageProgress(sit, 0.28, 0.88))
  const settle = easeOut(stageProgress(sit, 0.7, 1))
  const open = stageProgress(sceneSeconds, OPEN_START, OPEN_END)
  const readingSeconds = sceneSeconds - OPEN_END - 0.8
  const pageTurn = readingSeconds > 0 ? (readingSeconds % PAGE_TURN_SECONDS) / PAGE_TURN_FLIP_SECONDS : 0
  const seated = fold > 0.4
  const hands: readonly [Point, Point] = seated
    ? mixHands(HOLD_HANDS, READ_HANDS, settle)
    : mixHands(HOLD_HANDS, [[-10, -24], [10, -22]], crouch)
  const drop = (4 * crouch + 7 * fold) * scale
  const lean = mix(0.1, 0.02, settle) * (seated ? 1 : crouch)
  const [bookX, bookY] = mixPoint([2, -31], [0, -18], seated ? settle : crouch * 0.3)
  paintFill(context, "rgba(80, 42, 20, 0.16)", ellipsePath(radiX, floorY, mix(22, 36, fold) * scale, mix(4, 7, fold) * scale))
  context.save()
  context.translate(radiX, floorY + drop)
  context.rotate(lean)
  const armsUp = cheerSeconds !== null && cheerSeconds < RIGHT_CHEER_SECONDS
  const reactionSeconds = wrongSeconds ?? (boringShakeSeconds !== null && boringShakeSeconds < 1 ? boringShakeSeconds : null)
  const reacting = reactionSeconds !== null && reactionSeconds < 1
  const captainQuizzing = quizPhase === "captain" && sceneSeconds >= QUIZ_START && wrongSeconds === null && !armsUp
  const jokeQuizzing = quizPhase === "joke" && jokeQuizStartSeconds !== null && sceneSeconds >= jokeQuizStartSeconds && wrongSeconds === null && !armsUp
  const quizzing = !reacting && wrongSeconds === null && (captainQuizzing || jokeQuizzing || (quizPhase === "final" && !armsUp))
  const smiling = armsUp
  const headSway = quizzing ? Math.sin(sceneSeconds * 1.3) * 0.42 : 0
  const shake = reacting ? Math.sin(reactionSeconds * 16) * (1 - reactionSeconds) : 0
  const cheer = cheerArmAmount(cheerSeconds)
  const poseHands = cheer > 0 ? mixHands(hands, CHEER_HANDS, cheer) : hands
  const restingElbows = naturalElbows(hands)
  const poseElbows: readonly [number, number] = cheer > 0
    ? [restingElbows[0] * (1 - cheer), restingElbows[1] * (1 - cheer)]
    : restingElbows
  if (shake !== 0) {
    context.translate(0, -74 * scale)
    context.rotate(shake * 0.08)
    context.translate(0, 74 * scale)
  }
  drawRadi(context, smiling || (!reacting && !quizzing && wrongSeconds === null) ? bookwormRadiLook : { ...bookwormRadiLook, expression: "thinking" }, 0, 0, scale, {
    hideLegs: seated,
    faceTurn: reacting ? shake * 0.9 : quizzing ? headSway : open >= 1 ? Math.sin(sceneSeconds * 0.9) * 0.12 : 0,
    legLifts: seated ? [0, 0] : [crouch * 4, crouch * 4],
    kneeBends: seated ? [0, 0] : [crouch * 8, crouch * 8],
    hands: poseHands,
    elbowBends: poseElbows,
  })
  if (fold > 0.32) drawSeatedLegs(context, 0, 0, scale, fold)
  drawReadingBook(context, bookX * scale, bookY * scale, scale, open, pageTurn)
  if (quizzing) {
    const dropX = (9 + headSway * 4) * scale
    const dropY = -82 * scale
    context.save()
    context.lineWidth = Math.max(1.3, 1.5 * scale)
    paintShape(context, "#b9e4ff", (path) => {
      path.moveTo(dropX, dropY - 5.4 * scale)
      path.quadraticCurveTo(dropX + 3.3 * scale, dropY + 1.5 * scale, dropX + 0.4 * scale, dropY + 4.4 * scale)
      path.quadraticCurveTo(dropX - 3.1 * scale, dropY + 1.8 * scale, dropX, dropY - 5.4 * scale)
      path.closePath()
    }, {
      shade: "rgba(36, 92, 150, 0.45)",
      decorateInside: (drop) => {
        paintFill(drop, "#6eb6ea", (path) => {
          path.moveTo(dropX + 0.6 * scale, dropY - 1.5 * scale)
          path.quadraticCurveTo(dropX + 2.7 * scale, dropY + 1.5 * scale, dropX + 0.5 * scale, dropY + 3.8 * scale)
          path.quadraticCurveTo(dropX + 0.2 * scale, dropY + 0.5 * scale, dropX + 0.6 * scale, dropY - 1.5 * scale)
          path.closePath()
        })
        paintFill(drop, "rgba(255, 255, 255, 0.9)", ellipsePath(dropX - 0.9 * scale, dropY - 1.9 * scale, 0.9 * scale, 1.45 * scale))
      },
    })
    context.restore()
  }
  context.restore()
}

const quizCard = (width: number, height: number, { choices, questionLines, headerRatio }: QuizCardConfig) => {
  const { scale, floorY, landingX } = libraryLayout(width, height)
  const headTop = floorY - 96 * scale
  const maxHeight = Math.max(150, headTop - 18)
  let cardWidth = Math.min(width * 0.52, 540)
  const heightRatio = questionLines.length > 1 ? 0.82 : 0.58
  let cardHeight = cardWidth * heightRatio
  if (cardHeight > maxHeight) {
    cardHeight = maxHeight
    cardWidth = cardHeight / heightRatio
  }
  const centerX = Math.min(width - cardWidth / 2 - 16, Math.max(cardWidth / 2 + 16, landingX))
  const centerY = headTop - 14 - cardHeight / 2
  const rowWidth = cardWidth * 0.84
  const rowHeight = cardHeight * 0.14
  const rowGap = cardHeight * 0.03
  const questionSize = cardWidth * 0.05
  const cardTop = centerY - cardHeight / 2
  const answersTop = cardTop + 16 + cardHeight * headerRatio + cardHeight * 0.05
  const answersBottom = cardTop + cardHeight - 16
  const rowsBlockHeight = choices.length > 0 ? choices.length * rowHeight + (choices.length - 1) * rowGap : 0
  const firstRowY = choices.length > 0
    ? answersTop + (answersBottom - answersTop - rowsBlockHeight) / 2 + rowHeight / 2
    : centerY
  return {
    cardWidth,
    cardHeight,
    centerX,
    centerY,
    questionSize,
    headerRatio,
    rows: choices.map((choice, index) => ({
      choice: choice.id,
      letter: choice.letter,
      name: choice.name,
      centerX,
      centerY: firstRowY + index * (rowHeight + rowGap),
      width: rowWidth,
      height: rowHeight,
      fontSize: Math.max(13, cardWidth * 0.042),
    })),
  }
}

const captainCardConfig: QuizCardConfig = {
  choices: CAPTAIN_CHOICES,
  questionLines: ["Who is the best captain?"],
  headerRatio: 0.24,
}

const jokeCardConfig: QuizCardConfig = {
  choices: JOKE_CHOICES,
  questionLines: JOKE_QUESTION_LINES,
  headerRatio: 0.34,
}

const finalCardConfig: QuizCardConfig = {
  choices: FINAL_CHOICES,
  questionLines: FINAL_QUESTION_LINES,
  headerRatio: 0.34,
}

const NEXT_QUESTION_AT = 2
export const QUIZ_ADVANCE_AFTER_WRONG = NEXT_QUESTION_AT + QUIZ_POP_SECONDS
export const CHEER_MOVE_SECONDS = 0.28
export const RIGHT_CHEER_SECONDS = 1.2
const cheerArmAmount = (cheerSeconds: number | null) => {
  if (cheerSeconds === null) return 0
  if (cheerSeconds < CHEER_MOVE_SECONDS) return easeOut(cheerSeconds / CHEER_MOVE_SECONDS)
  if (cheerSeconds < RIGHT_CHEER_SECONDS) return 1
  return 1 - easeOut(Math.min(1, (cheerSeconds - RIGHT_CHEER_SECONDS) / CHEER_MOVE_SECONDS))
}
const cheerHand = (side: number): Point => [
  side * (SHOULDER_X + Math.sin(0.7) * ARM_SEGMENT * 2),
  SHOULDER_Y - Math.cos(0.7) * ARM_SEGMENT * 2,
]
const CHEER_HANDS: readonly [Point, Point] = [cheerHand(-1), cheerHand(1)]

const drawQuizPanel = (
  context: Context,
  width: number,
  height: number,
  shown: number,
  config: QuizCardConfig,
  showAnswers: boolean,
  choice: string | null,
  hovered: string | null,
) => {
  if (shown <= 0.02) return
  const card = quizCard(width, height, config)
  const headerHeight = card.cardHeight * card.headerRatio
  let questionSize = card.questionSize
  if (config.questionLines.length > 0) {
    const headerInnerWidth = card.cardWidth - 32 - 36
    const headerInnerHeight = Math.max(12, headerHeight - 18)
    context.font = `bold ${questionSize}px "Comic Sans MS", "Comic Sans", "Comic Neue", cursive`
    const longest = Math.max(...config.questionLines.map((line) => context.measureText(line).width))
    if (longest > headerInnerWidth) questionSize *= headerInnerWidth / longest
    const blockHeight = questionSize * (1 + 1.15 * (config.questionLines.length - 1))
    if (blockHeight > headerInnerHeight) questionSize *= headerInnerHeight / blockHeight
  }
  context.save()
  context.translate(card.centerX, card.centerY)
  context.scale(shown, shown)
  context.translate(-card.centerX, -card.centerY)
  const left = card.centerX - card.cardWidth / 2
  const top = card.centerY - card.cardHeight / 2
  context.lineWidth = Math.max(3, card.cardWidth * 0.012)
  paintFill(context, "rgba(0, 0, 0, 0.18)", (path) => path.roundRect(left + 8, top + 8, card.cardWidth, card.cardHeight, 22))
  paintShape(context, "#fff8ea", (path) => path.roundRect(left, top, card.cardWidth, card.cardHeight, 22))
  paintShape(context, "#ffd23f", (path) => path.roundRect(left + 16, top + 16, card.cardWidth - 32, headerHeight, 14))
  if (config.questionLines.length > 0) {
    const fittedGap = questionSize * 1.15
    context.save()
    context.beginPath()
    context.roundRect(left + 16, top + 16, card.cardWidth - 32, headerHeight, 14)
    context.clip()
    context.fillStyle = OUTLINE
    context.font = `bold ${questionSize}px "Comic Sans MS", "Comic Sans", "Comic Neue", cursive`
    context.textAlign = "center"
    context.textBaseline = "middle"
    const questionTop = top + 16 + headerHeight * 0.5 - ((config.questionLines.length - 1) * fittedGap) / 2
    config.questionLines.forEach((line, index) => {
      context.fillText(line, card.centerX, questionTop + index * fittedGap)
    })
    context.restore()
  }
  context.lineWidth = 3
  for (const row of card.rows) {
    const rowLeft = row.centerX - row.width / 2
    const rowTop = row.centerY - row.height / 2
    const rowFill = showAnswers && row.choice === hovered ? "#c8f0b4" : showAnswers && choice === row.choice ? "#ffd23f" : "#fffdf8"
    paintShape(context, rowFill, (path) => path.roundRect(rowLeft, rowTop, row.width, row.height, 12))
    if (!showAnswers) continue
    paintShape(context, "#7b5cff", (path) => path.roundRect(rowLeft + 8, row.centerY - row.height * 0.32, row.height * 0.64, row.height * 0.64, 8))
    context.fillStyle = WHITE
    context.font = `bold ${row.fontSize}px "Comic Sans MS", "Comic Sans", "Comic Neue", cursive`
    context.textAlign = "center"
    context.textBaseline = "middle"
    context.fillText(row.letter, rowLeft + 8 + row.height * 0.32, row.centerY)
    context.fillStyle = OUTLINE
    context.textAlign = "left"
    const nameRoom = row.width - row.height * 1.15
    let nameSize = row.fontSize
    context.font = `bold ${nameSize}px "Comic Sans MS", "Comic Sans", "Comic Neue", cursive`
    const measuredName = context.measureText(row.name).width / Math.max(shown, 0.01)
    if (measuredName > nameRoom) nameSize *= nameRoom / measuredName
    context.font = `bold ${nameSize}px "Comic Sans MS", "Comic Sans", "Comic Neue", cursive`
    context.fillText(row.name, rowLeft + row.height * 0.95, row.centerY)
  }
  context.restore()
}

const drawTimedQuiz = (
  context: Context,
  width: number,
  height: number,
  elapsed: number,
  wrongSeconds: number | null,
  config: QuizCardConfig,
  choice: string | null,
  hovered: string | null,
  cheerSeconds: number | null,
) => {
  const pop = easeOutBack(stageProgress(elapsed, 0, QUIZ_POP_SECONDS))
  const hide = wrongSeconds !== null ? easeOut(stageProgress(wrongSeconds, 0, 0.35)) : cheerSeconds !== null && cheerSeconds < RIGHT_CHEER_SECONDS ? 1 : 0
  drawQuizPanel(context, width, height, pop * (1 - hide), config, true, choice, hovered)
}

export const libraryQuizChoiceLayouts = (
  width: number,
  height: number,
  phase: LibraryQuizPhase,
  sceneSeconds: number,
  wrongSeconds: number | null,
  jokeQuizStartSeconds: number | null,
  finalQuizStartSeconds: number | null = null,
): readonly QuizChoiceLayout[] | null => {
  if (wrongSeconds !== null) return null
  if (phase === "captain") {
    if (sceneSeconds < QUIZ_START + QUIZ_POP_SECONDS) return null
    return quizCard(width, height, captainCardConfig).rows
  }
  if (phase === "joke") {
    if (jokeQuizStartSeconds === null || sceneSeconds < jokeQuizStartSeconds + QUIZ_POP_SECONDS) return null
    return quizCard(width, height, jokeCardConfig).rows
  }
  if (finalQuizStartSeconds === null || sceneSeconds < finalQuizStartSeconds + QUIZ_POP_SECONDS) return null
  return quizCard(width, height, finalCardConfig).rows
}

export const captainChoiceLayouts = (
  width: number,
  height: number,
  sceneSeconds: number,
  wrongSeconds: number | null = null,
): readonly QuizChoiceLayout[] | null =>
  libraryQuizChoiceLayouts(width, height, "captain", sceneSeconds, wrongSeconds, null)

const drawLibraryQuizzes = (
  context: Context,
  width: number,
  height: number,
  sceneSeconds: number,
  phase: LibraryQuizPhase,
  captainChoice: CaptainChoice | null,
  hoveredCaptain: CaptainChoice | null,
  jokeChoice: JokeChoice | null,
  hoveredJoke: JokeChoice | null,
  finalChoice: FinalChoice | null,
  hoveredFinal: FinalChoice | null,
  wrongSeconds: number | null,
  jokeQuizStartSeconds: number | null,
  finalQuizStartSeconds: number | null,
  cheerSeconds: number | null,
) => {
  if (phase === "captain") {
    drawTimedQuiz(context, width, height, sceneSeconds - QUIZ_START, wrongSeconds, captainCardConfig, captainChoice, hoveredCaptain, cheerSeconds)
    return
  }
  if (phase === "joke" && jokeQuizStartSeconds !== null) {
    drawTimedQuiz(context, width, height, sceneSeconds - jokeQuizStartSeconds, wrongSeconds, jokeCardConfig, jokeChoice, hoveredJoke, cheerSeconds)
    return
  }
  if (phase === "final" && finalQuizStartSeconds !== null && finalChoice !== "batman" && finalChoice !== "unicorn") {
    drawTimedQuiz(context, width, height, sceneSeconds - finalQuizStartSeconds, wrongSeconds, finalCardConfig, finalChoice, hoveredFinal, cheerSeconds)
  }
}

const EXIT_BOOK_START = 0.55
const EXIT_BOOK_END = 1.45
const EXIT_SMOKE_START = 1.1
const EXIT_SMOKE_FULL = 1.6
const EXIT_SUIT_AT = 1.9
export const LIBRARY_HERO_REVEAL = EXIT_SUIT_AT
const EXIT_SMOKE_CLEAR = 2.2
const EXIT_SMOKE_END = 2.9
const EXIT_ORBIT_START = 2
const EXIT_ORBIT_LEAVE = 3
const EXIT_AIM_START = 2.9
const BATMAN_FIRE_START = 3.2
const BATMAN_HOOK_BITE = 3.5
const EXIT_LAUNCH = 3.6
const EXIT_ARRIVE = 4.4
const EXIT_RISE_END = 4.75
const EXIT_MOON_END = 5.5
const EXIT_IRIS_START = 5.6
const EXIT_IRIS_FOCUS_END = 6.6
const EXIT_IRIS_CLOSE_START = 7
const EXIT_IRIS_CLOSE_END = 7.4
export const LIBRARY_EXIT_END = EXIT_IRIS_CLOSE_END + 0.3
const EXIT_ANCHOR: Point = [0, -59]
const EXIT_YAY_HANDS: readonly [Point, Point] = [[-18, -68], [18, -68]]
const EXIT_TOSS_HANDS: readonly [Point, Point] = [[-12, -28], [32, -44]]
const EXIT_HERO_HANDS: readonly [Point, Point] = [[-14, -30], [14, -30]]
const BATMAN_REACH_HANDS: readonly [Point, Point] = [[-16, -30], [34, -120]]
const BATMAN_GRIP_HANDS: readonly [Point, Point] = [[-2, -58], [2, -59]]
const UNICORN_CROUCH_HANDS: readonly [Point, Point] = [[-18, -36], [18, -36]]
const UNICORN_FLY_HANDS: readonly [Point, Point] = [[-15, -36], [13, -60]]
const BAT_COLOR = "#1d1730"

const SMOKE_PUFFS = Array.from({ length: 16 }, (_, index) => ({
  angle: (index / 16) * Math.PI * 2 + seededRandom(index, 51),
  reach: mix(8, 34, seededRandom(index, 52)),
  size: mix(20, 34, seededRandom(index, 53)),
  delay: seededRandom(index, 54) * 0.2,
}))

const ORBIT_BATS = Array.from({ length: 9 }, (_, index) => ({
  phase: (index / 9) * Math.PI * 2 + seededRandom(index, 61),
  speed: mix(3, 4.2, seededRandom(index, 62)),
  radiusX: mix(58, 84, seededRandom(index, 63)),
  radiusY: mix(14, 24, seededRandom(index, 64)),
  height: mix(-85, -35, seededRandom(index, 65)),
  target: seededRandom(index, 66) - 0.5,
  delay: index * 0.06,
}))

const ESCAPE_BATS = Array.from({ length: 5 }, (_, index) => ({
  angle: mix(0.25, Math.PI - 0.25, (index + seededRandom(index, 71) * 0.6) / 5),
  speed: mix(260, 420, seededRandom(index, 72)),
  delay: seededRandom(index, 73) * 0.35,
}))

const BITE_CRUMBS = Array.from({ length: 9 }, (_, index) => ({
  direction: mix(0.15, Math.PI - 0.15, seededRandom(index, 81)),
  speed: mix(120, 260, seededRandom(index, 82)),
  size: mix(2, 4.5, seededRandom(index, 83)),
  color: PLASTER_BITS[index % 3] ?? PLASTER,
}))

type OrbitBat = (typeof ORBIT_BATS)[number]

const drawBat = (context: Context, centerX: number, centerY: number, size: number, flap: number) => {
  const tipY = -flap * 0.6
  context.save()
  context.translate(centerX, centerY)
  context.scale(size, size)
  paintFill(context, BAT_COLOR, (path) => {
    for (const side of [-1, 1]) {
      path.moveTo(side * 0.1, -0.12)
      path.quadraticCurveTo(side * 0.5, tipY - 0.2, side, tipY)
      for (let scallop = 1; scallop <= 3; scallop += 1) {
        const fromX = mix(1, 0.1, (scallop - 1) / 3)
        const fromY = mix(tipY, 0.18, (scallop - 1) / 3)
        const toX = mix(1, 0.1, scallop / 3)
        const toY = mix(tipY, 0.18, scallop / 3)
        path.quadraticCurveTo((side * (fromX + toX)) / 2, (fromY + toY) / 2 - 0.14, side * toX, toY)
      }
      path.closePath()
    }
  })
  paintFill(context, BAT_COLOR, ellipsePath(0, 0.04, 0.15, 0.24))
  paintFill(context, BAT_COLOR, ellipsePath(0, -0.2, 0.13, 0.12))
  for (const side of [-1, 1]) {
    paintFill(context, BAT_COLOR, (path) => {
      path.moveTo(side * 0.03, -0.28)
      path.lineTo(side * 0.12, -0.42)
      path.lineTo(side * 0.13, -0.22)
      path.closePath()
    })
    paintFill(context, GOLD, ellipsePath(side * 0.05, -0.21, 0.03, 0.03))
  }
  context.restore()
}

const orbitBatSpot = (bat: OrbitBat, seconds: number, centerX: number, floorY: number, scale: number) => {
  const burst = easeOut(stageProgress(seconds, EXIT_ORBIT_START, EXIT_ORBIT_START + 0.45))
  const angle = bat.phase + (seconds - EXIT_ORBIT_START) * bat.speed
  const depth = Math.sin(angle)
  return {
    x: centerX + Math.cos(angle) * bat.radiusX * scale * burst,
    y: floorY + (bat.height + depth * bat.radiusY * burst + Math.sin(seconds * 4 + bat.phase) * 6) * scale,
    depth,
    size: (10 + depth * 4) * scale * mix(0.3, 1, burst),
  }
}

type DrawFlier = (context: Context, centerX: number, centerY: number, size: number, flap: number, index: number) => void

const drawUnicornFlier: DrawFlier = (context, centerX, centerY, size, flap, index) => {
  const color = RAINBOW[index % RAINBOW.length]
  if (index % 3 === 0) drawHeart(context, centerX, centerY, size * 0.8, color)
  else drawCuteStar(context, centerX, centerY, size * (0.85 + flap * 0.15), color, flap * 0.3)
}

const drawOrbiters = (context: Context, width: number, ceilingY: number, landingX: number, floorY: number, scale: number, seconds: number, isFront: boolean, drawFlier: DrawFlier) => {
  if (seconds < EXIT_ORBIT_START) return
  const { holeX, holeY, radiusX } = holePlacement(width, ceilingY, 1)
  ORBIT_BATS.forEach((bat, index) => {
    const leave = stageProgress(seconds, EXIT_ORBIT_LEAVE + bat.delay, EXIT_ORBIT_LEAVE + 0.75 + bat.delay)
    if (leave >= 1) return
    const spot = orbitBatSpot(bat, seconds, landingX, floorY, scale)
    if ((leave > 0 || spot.depth >= 0) !== isFront) return
    const flight = leave ** 2
    drawFlier(context, mix(spot.x, holeX + bat.target * radiusX, flight), mix(spot.y, holeY, flight), spot.size * (1 - 0.6 * flight), Math.sin(seconds * 26 + bat.phase * 3), index)
  })
}

const drawEscapeBats = (context: Context, holeX: number, holeY: number, scale: number, seconds: number) => {
  for (const bat of ESCAPE_BATS) {
    const flight = seconds - EXIT_RISE_END + 0.15 - bat.delay
    if (flight <= 0 || flight > 1.6) continue
    const batX = holeX + Math.cos(bat.angle) * bat.speed * flight * 1.4
    const batY = holeY + Math.sin(bat.angle) * bat.speed * flight * 0.7 - 150 * flight ** 2
    drawBat(context, batX, batY, mix(4, 13, Math.min(1, flight * 2)) * scale, Math.sin(seconds * 28 + bat.angle * 5))
  }
}

type SmokeTint = { shadow: string; body: string; light: string }

const BAT_SMOKE: readonly SmokeTint[] = [{ shadow: "38, 26, 66", body: "104, 90, 146", light: "178, 166, 214" }]

const UNICORN_GLITTER: readonly SmokeTint[] = [
  { shadow: "214, 92, 160", body: "255, 158, 216", light: "255, 228, 244" },
  { shadow: "140, 104, 220", body: "201, 168, 255", light: "240, 228, 255" },
  { shadow: "70, 178, 160", body: "127, 227, 196", light: "220, 255, 244" },
  { shadow: "220, 170, 60", body: "255, 224, 102", light: "255, 248, 214" },
]

const drawTransformSmoke = (context: Context, centerX: number, centerY: number, scale: number, seconds: number, tints: readonly SmokeTint[]) => {
  if (seconds < EXIT_SMOKE_START || seconds > EXIT_SMOKE_END + 0.2) return
  const puffs = SMOKE_PUFFS.map((puff, index) => {
    const grow = easeOut(stageProgress(seconds, EXIT_SMOKE_START + puff.delay, EXIT_SMOKE_FULL + puff.delay))
    const fade = stageProgress(seconds, EXIT_SMOKE_CLEAR + puff.delay, EXIT_SMOKE_END + puff.delay)
    const spread = mix(0.35, 1, grow) + fade * 0.6
    const churn = seconds * 2.2 + index
    return {
      x: centerX + (Math.cos(puff.angle) * puff.reach * spread + Math.sin(churn) * 3) * scale,
      y: centerY + (Math.sin(puff.angle) * puff.reach * 0.9 * spread - fade * 34 + Math.cos(churn) * 3) * scale,
      radius: puff.size * scale * mix(0.3, 1, grow) * (1 + fade * 0.35),
      alpha: grow * (1 - fade),
      tint: tints[index % tints.length],
    }
  })
  for (const puff of puffs) paintFill(context, `rgba(${puff.tint.shadow}, ${puff.alpha})`, ellipsePath(puff.x + 3 * scale, puff.y + 4 * scale, puff.radius, puff.radius * 0.9))
  for (const puff of puffs) paintFill(context, `rgba(${puff.tint.body}, ${puff.alpha})`, ellipsePath(puff.x, puff.y, puff.radius, puff.radius * 0.9))
  for (const puff of puffs) paintFill(context, `rgba(${puff.tint.light}, ${puff.alpha * 0.75})`, ellipsePath(puff.x - puff.radius * 0.3, puff.y - puff.radius * 0.32, puff.radius * 0.42, puff.radius * 0.34))
}

const drawGrappleLine = (context: Context, [fromX, fromY]: Point, [toX, toY]: Point, wave: number, waves: number, phase: number, scale: number) => {
  const length = Math.hypot(toX - fromX, toY - fromY) || 1
  const normalX = -(toY - fromY) / length
  const normalY = (toX - fromX) / length
  const rope = (path: Path2D) => {
    for (let step = 0; step <= 18; step += 1) {
      const along = step / 18
      const offset = wave * Math.sin(along * Math.PI) * Math.sin(along * Math.PI * waves + phase)
      const ropeX = mix(fromX, toX, along) + normalX * offset
      const ropeY = mix(fromY, toY, along) + normalY * offset
      if (step === 0) path.moveTo(ropeX, ropeY)
      else path.lineTo(ropeX, ropeY)
    }
  }
  paintLine(context, "#1a1a1a", Math.max(4.5, 2.6 * scale), rope)
  paintLine(context, "#f2cf3a", Math.max(1.7, 0.95 * scale), rope)
}

const drawGrapnel = (context: Context, hookX: number, hookY: number, angle: number, scale: number) => {
  context.save()
  context.translate(hookX, hookY)
  context.rotate(angle)
  for (const prong of [-1, 0, 1]) {
    paintLine(context, OUTLINE, Math.max(2.4, 1.3 * scale), (path) => {
      path.moveTo(0, 0)
      path.quadraticCurveTo(5 * scale, prong * 5 * scale, 7 * scale, prong * 2 * scale)
    })
  }
  context.lineWidth = Math.max(1.6, scale)
  paintShape(context, "#55556a", ellipsePath(0, 0, 2.6 * scale, 2.6 * scale))
  context.restore()
}

const drawHookBite = (context: Context, holeX: number, holeY: number, scale: number, seconds: number) => {
  const sinceBite = seconds - BATMAN_HOOK_BITE
  if (sinceBite < 0 || sinceBite > 0.7) return
  const spark = 1 - stageProgress(sinceBite, 0, 0.28)
  if (spark > 0) {
    for (let mark = 0; mark < 6; mark += 1) {
      const angle = mark * (Math.PI / 3) + 0.4
      const near = 8 * scale
      const far = (8 + 16 * spark) * scale
      paintLine(context, "#f2cf3a", 2, linePath(holeX + Math.cos(angle) * near, holeY + Math.sin(angle) * near, holeX + Math.cos(angle) * far, holeY + Math.sin(angle) * far))
    }
  }
  for (const crumb of BITE_CRUMBS) {
    const crumbX = holeX + Math.cos(crumb.direction) * crumb.speed * sinceBite
    const crumbY = holeY + Math.sin(crumb.direction) * crumb.speed * sinceBite + 0.5 * DEBRIS_GRAVITY * sinceBite ** 2
    paintFill(context, crumb.color, ellipsePath(crumbX, crumbY, crumb.size, crumb.size))
  }
}

const drawZipStreaks = (context: Context, [gripX, gripY]: Point, [alongX, alongY]: Point, speed: number, seconds: number, scale: number) => {
  if (speed <= 0.05) return
  for (let streak = 0; streak < 9; streak += 1) {
    const side = (seededRandom(streak, 91) - 0.5) * 70 * scale
    const behind = (((seededRandom(streak, 92) + seconds * 5) % 1) * 140 + 10) * scale
    const length = (24 + seededRandom(streak, 93) * 30) * scale * speed
    const startX = gripX - alongY * side - alongX * behind
    const startY = gripY + alongX * side - alongY * behind
    paintLine(context, `rgba(43, 29, 26, ${0.7 * speed})`, 2.2, linePath(startX, startY, startX - alongX * length, startY - alongY * length))
  }
}

const drawLaunchDust = (context: Context, landingX: number, floorY: number, scale: number, seconds: number) => {
  const puff = stageProgress(seconds, EXIT_LAUNCH, EXIT_LAUNCH + 0.7)
  if (puff <= 0 || puff >= 1) return
  const grow = easeOut(puff)
  for (let cloud = 0; cloud < 5; cloud += 1) {
    const spread = (cloud - 2) * 22 * scale * grow
    paintFill(context, `rgba(232, 206, 164, ${0.6 * (1 - puff)})`, ellipsePath(landingX + spread, floorY - (6 + grow * 10) * scale, (14 + grow * 24) * scale, (6 + grow * 8) * scale))
  }
}

const drawMoonCrossing = (context: Context, width: number, ceilingY: number, seconds: number) => {
  const cross = stageProgress(seconds, EXIT_RISE_END, EXIT_MOON_END)
  if (cross <= 0 || cross >= 1) return
  const { holeX, holeY, radiusX, radiusY } = holePlacement(width, ceilingY, 1)
  const depth = ceilingY * 0.14
  const moonRadius = Math.min(radiusX, radiusY) * 0.45
  const moonX = holeX - radiusX * 0.3
  const moonY = holeY + depth * 0.5
  const sky = new Path2D()
  traceHole(sky, holeX, holeY + depth, radiusX * 0.93, radiusY * 0.88)
  context.save()
  context.clip(sky)
  context.translate(mix(moonX - moonRadius * 1.8, moonX + moonRadius * 2.2, cross), moonY + moonRadius * (mix(0.9, -1.1, cross) + Math.sin(cross * Math.PI * 3) * 0.15))
  context.rotate(-0.35)
  context.scale(1, mix(0.55, 1, Math.abs(Math.sin(seconds * 22))))
  drawBatMark(context, 0, 0, moonRadius * 0.18)
  context.restore()
}

const LAUNCH_STARS = Array.from({ length: 10 }, (_, index) => ({
  angle: (index / 10) * Math.PI * 2 + seededRandom(index, 101),
  speed: mix(120, 220, seededRandom(index, 102)),
  size: mix(5, 9, seededRandom(index, 103)),
}))

const SHOWER_STARS = Array.from({ length: 14 }, (_, index) => ({
  spread: seededRandom(index, 111) - 0.5,
  drift: mix(-60, 60, seededRandom(index, 112)),
  fall: mix(110, 200, seededRandom(index, 113)),
  delay: seededRandom(index, 114) * 0.9,
  size: mix(4, 8, seededRandom(index, 115)),
}))

const drawCuteStar = (context: Context, centerX: number, centerY: number, size: number, color: string, spin: number) => {
  context.save()
  context.translate(centerX, centerY)
  context.rotate(spin)
  context.lineWidth = Math.max(1.5, size * 0.16)
  paintShape(context, color, (path) => {
    for (let point = 0; point < 10; point += 1) {
      const angle = (point / 10) * Math.PI * 2 - Math.PI / 2
      const reach = point % 2 === 0 ? size : size * 0.48
      if (point === 0) path.moveTo(Math.cos(angle) * reach, Math.sin(angle) * reach)
      else path.lineTo(Math.cos(angle) * reach, Math.sin(angle) * reach)
    }
    path.closePath()
  })
  paintFill(context, "rgba(255, 255, 255, 0.75)", ellipsePath(-size * 0.18, -size * 0.2, size * 0.16, size * 0.12))
  context.restore()
}

const drawHeart = (context: Context, centerX: number, centerY: number, size: number, color: string) => {
  context.save()
  context.translate(centerX, centerY)
  context.lineWidth = Math.max(1.5, size * 0.16)
  paintShape(context, color, (path) => {
    path.moveTo(0, size * 0.85)
    path.bezierCurveTo(-size * 1.3, 0, -size * 0.7, -size * 0.95, 0, -size * 0.35)
    path.bezierCurveTo(size * 0.7, -size * 0.95, size * 1.3, 0, 0, size * 0.85)
    path.closePath()
  })
  paintFill(context, "rgba(255, 255, 255, 0.75)", ellipsePath(-size * 0.4, -size * 0.3, size * 0.16, size * 0.12))
  context.restore()
}

const drawRainbowBurst = (context: Context, centerX: number, centerY: number, scale: number, seconds: number) => {
  const burst = stageProgress(seconds, EXIT_SUIT_AT, EXIT_SUIT_AT + 0.9)
  if (burst <= 0 || burst >= 1) return
  const grow = easeOut(burst)
  context.save()
  context.globalAlpha = 1 - burst
  RAINBOW.forEach((color, band) => {
    const radius = (40 + grow * 90 - band * 5) * scale
    paintLine(context, color, 4.5 * scale * (1 - burst * 0.6), ellipsePath(centerX, centerY, radius, radius * 0.8))
  })
  context.restore()
}

const unicornFlightPoint = ([startX, startY]: Point, [endX, endY]: Point, width: number, scale: number, time: number): Point => {
  const eased = easeInOut(time)
  const rest = 1 - eased
  const controls: readonly Point[] = [[startX, startY], [startX + width * 0.26, startY - 40 * scale], [endX - width * 0.3, endY + 140 * scale], [endX, endY]]
  const weights = [rest ** 3, 3 * rest ** 2 * eased, 3 * rest * eased ** 2, eased ** 3]
  return [
    controls.reduce((sum, [controlX], index) => sum + controlX * weights[index], 0),
    controls.reduce((sum, [, controlY], index) => sum + controlY * weights[index], 0),
  ]
}

const drawRainbowTrail = (context: Context, flightAt: (time: number) => Point, seconds: number, scale: number) => {
  const head = stageProgress(seconds, EXIT_LAUNCH, EXIT_ARRIVE)
  const tail = stageProgress(seconds - 0.5, EXIT_LAUNCH, EXIT_ARRIVE)
  if (head <= tail) return
  const samples = Array.from({ length: 24 }, (_, step) => {
    const along = step / 23
    const [sampleX, sampleY] = flightAt(mix(tail, head, along))
    return { sampleX, sampleY, along }
  })
  const bandWidth = 3.2 * scale
  RAINBOW.forEach((color, band) => {
    paintLine(context, color, bandWidth * 1.15, (path) => {
      samples.forEach(({ sampleX, sampleY, along }, index) => {
        const next = samples[Math.min(index + 1, samples.length - 1)]
        const previous = samples[Math.max(index - 1, 0)]
        const directionX = next.sampleX - previous.sampleX
        const directionY = next.sampleY - previous.sampleY
        const length = Math.hypot(directionX, directionY) || 1
        const offset = (band - (RAINBOW.length - 1) / 2) * bandWidth * along
        const bandX = sampleX - (directionY / length) * offset
        const bandY = sampleY + (directionX / length) * offset
        if (index === 0) path.moveTo(bandX, bandY)
        else path.lineTo(bandX, bandY)
      })
    })
  })
  samples.forEach(({ sampleX, sampleY }, index) => {
    if (index % 4 === 1) drawStarSparkle(context, sampleX, sampleY + 10 * scale, 3 * scale * (0.6 + 0.4 * Math.sin(seconds * 12 + index)), WHITE)
  })
}

const drawLaunchStars = (context: Context, centerX: number, floorY: number, scale: number, seconds: number) => {
  const since = seconds - EXIT_LAUNCH
  if (since < 0 || since > 0.8) return
  const fade = since / 0.8
  LAUNCH_STARS.forEach((star, index) => {
    const reach = star.speed * easeOut(fade) * scale * 0.5
    drawCuteStar(context, centerX + Math.cos(star.angle) * reach, floorY - 10 * scale + Math.sin(star.angle) * reach * 0.5, star.size * scale * 0.6 * (1 - fade), RAINBOW[index % RAINBOW.length], since * 6)
  })
}

const drawStarShower = (context: Context, holeX: number, holeY: number, radiusX: number, floorY: number, scale: number, seconds: number) => {
  SHOWER_STARS.forEach((star, index) => {
    const since = seconds - EXIT_RISE_END + 0.1 - star.delay
    if (since <= 0) return
    const starY = holeY + star.fall * since * scale * 0.6
    if (starY > floorY) return
    const starX = holeX + star.spread * radiusX * 1.6 + Math.sin(since * 3 + index) * star.drift * 0.3 + star.drift * since * 0.3
    const twinkle = 0.8 + Math.sin(seconds * 9 + index) * 0.2
    drawCuteStar(context, starX, starY, star.size * scale * 0.6 * twinkle, RAINBOW[index % RAINBOW.length], since * 2)
  })
}

const drawSkyRainbow = (context: Context, width: number, ceilingY: number, seconds: number) => {
  const reveal = easeInOut(stageProgress(seconds, EXIT_RISE_END - 0.1, EXIT_MOON_END))
  if (reveal <= 0) return
  const { holeX, holeY, radiusX, radiusY } = holePlacement(width, ceilingY, 1)
  const depth = ceilingY * 0.14
  const sky = new Path2D()
  traceHole(sky, holeX, holeY + depth, radiusX * 0.93, radiusY * 0.88)
  const centerX = holeX + radiusX * 0.25
  const centerY = holeY + depth + radiusY * 0.9
  const band = radiusY * 0.09
  context.save()
  context.clip(sky)
  RAINBOW.forEach((color, index) => {
    paintLine(context, color, band * 1.1, (path) => path.arc(centerX, centerY, radiusY * 1.15 - index * band, Math.PI, Math.PI * (1 + reveal)))
  })
  context.restore()
}

const clipBelowCeilingOpening = (context: Context, width: number, height: number, ceilingY: number) => {
  const { holeX, holeY, radiusX, radiusY } = holePlacement(width, ceilingY, 1)
  const visible = new Path2D()
  visible.rect(0, holeY, width, height - holeY)
  traceHole(visible, holeX, holeY, radiusX, radiusY)
  context.clip(visible)
}

type ExitHero = "batman" | "unicorn"

const exitShake = (seconds: number | null, hero: ExitHero | null) => {
  if (seconds === null || hero === null) return 0
  const bite = hero === "batman" && seconds >= BATMAN_HOOK_BITE ? 1 - stageProgress(seconds, BATMAN_HOOK_BITE, BATMAN_HOOK_BITE + 0.25) : 0
  const launch = seconds >= EXIT_LAUNCH ? 1 - stageProgress(seconds, EXIT_LAUNCH, EXIT_LAUNCH + 0.3) : 0
  return Math.max(bite * 5, launch * (hero === "batman" ? 4 : 2.5))
}

const drawExitBackdrop = (context: Context, width: number, height: number, floorY: number, landingX: number, scale: number, seconds: number, hero: ExitHero) => {
  const { ceilingY } = libraryLayout(width, height)
  drawOrbiters(context, width, ceilingY, landingX, floorY, scale, seconds, false, hero === "batman" ? drawBat : drawUnicornFlier)
  if (hero === "batman") drawMoonCrossing(context, width, ceilingY, seconds)
  else drawSkyRainbow(context, width, ceilingY, seconds)
}

const drawHeroExit = (
  context: Context,
  width: number,
  height: number,
  floorY: number,
  landingX: number,
  scale: number,
  seconds: number,
  hero: ExitHero,
) => {
  const isBatman = hero === "batman"
  const { ceilingY } = libraryLayout(width, height)
  const { holeX, holeY, radiusX, radiusY } = holePlacement(width, ceilingY, 1)
  const hook: Point = [holeX, holeY]
  const stand = easeInOut(stageProgress(seconds, EXIT_SMOKE_START, EXIT_SMOKE_START + 0.28))
  const bounce = seconds < EXIT_SMOKE_START ? Math.abs(Math.sin((seconds * Math.PI * 2) / 0.34)) * 9 * scale : 0
  const crouch = easeOut(stageProgress(seconds, EXIT_AIM_START, isBatman ? BATMAN_FIRE_START : EXIT_LAUNCH - 0.1)) * (1 - easeOut(stageProgress(seconds, EXIT_LAUNCH - 0.06, EXIT_LAUNCH + 0.08)))
  const legBend = CROUCH_LIFT * 1.4 * crouch
  const zipTime = stageProgress(seconds, EXIT_LAUNCH, EXIT_ARRIVE)
  const zip = isBatman ? zipTime ** 2.2 : easeInOut(zipTime)
  const speed = isBatman ? zipTime ** 1.2 * (1 - stageProgress(seconds, EXIT_ARRIVE - 0.05, EXIT_ARRIVE + 0.12)) : Math.sin(zipTime * Math.PI)
  const rise = easeInOut(stageProgress(seconds, EXIT_ARRIVE, EXIT_RISE_END))
  const launch: Point = [landingX, floorY - bounce + (EXIT_ANCHOR[1] + 11 * (1 - stand) + legBend) * scale]
  const flightAt = (time: number): Point => (isBatman ? mixPoint(launch, hook, time ** 2.2) : unicornFlightPoint(launch, hook, width, scale, time))
  const anchor = rise > 0 ? mixPoint(hook, [holeX, holeY - radiusY * 0.8], rise) : flightAt(zipTime)
  const bodyScale = scale * mix(1, 0.8, zip) * mix(1, 0.35, rise)
  const flying = stageProgress(seconds, EXIT_LAUNCH, EXIT_LAUNCH + 0.15) * (1 - stageProgress(seconds, EXIT_ARRIVE - 0.15, EXIT_ARRIVE))
  const [aheadX, aheadY] = flightAt(Math.min(1, zipTime + 0.02))
  const swing = isBatman
    ? Math.sin((seconds - EXIT_LAUNCH) * 10) * 0.28 * (1 - zipTime) * stageProgress(seconds, EXIT_LAUNCH, EXIT_LAUNCH + 0.1)
    : Math.max(-1.1, Math.min(1.1, Math.atan2(aheadX - anchor[0], anchor[1] - aheadY))) * flying
  const stretch = isBatman ? 1 + 0.3 * speed - 0.18 * Math.sin(stageProgress(seconds, EXIT_ARRIVE - 0.02, EXIT_ARRIVE + 0.16) * Math.PI) : 1 + 0.15 * speed
  const sideStretch = stretch ** -0.6
  const bookFly = easeOut(stageProgress(seconds, EXIT_BOOK_START, EXIT_BOOK_END))
  const yay = easeOut(stageProgress(seconds, 0, 0.22))
  const toss = easeOut(stageProgress(seconds, EXIT_BOOK_START, EXIT_BOOK_START + 0.32))
  const heroPose = easeOut(stageProgress(seconds, EXIT_SMOKE_FULL, EXIT_SMOKE_FULL + 0.3))
  const reach = easeInOut(stageProgress(seconds, EXIT_AIM_START, EXIT_AIM_START + 0.3))
  const grip = easeOut(stageProgress(seconds, EXIT_LAUNCH, EXIT_LAUNCH + 0.12))
  const recoil = isBatman && seconds >= BATMAN_FIRE_START ? 1 - stageProgress(seconds, BATMAN_FIRE_START, BATMAN_FIRE_START + 0.18) : 0
  const posed = mixHands(mixHands(mixHands(mixHands(READ_HANDS, EXIT_YAY_HANDS, yay), EXIT_TOSS_HANDS, toss), EXIT_HERO_HANDS, heroPose), isBatman ? BATMAN_REACH_HANDS : UNICORN_CROUCH_HANDS, reach)
  const aimed: readonly [Point, Point] = [posed[0], [posed[1][0] - recoil * 4, posed[1][1] + recoil * 10]]
  const hands = mixHands(aimed, isBatman ? BATMAN_GRIP_HANDS : UNICORN_FLY_HANDS, grip)
  const toWorld = ([localX, localY]: Point): Point => {
    const offsetX = (localX - EXIT_ANCHOR[0]) * bodyScale * sideStretch
    const offsetY = (localY - EXIT_ANCHOR[1]) * bodyScale * stretch
    return [anchor[0] + offsetX * Math.cos(swing) - offsetY * Math.sin(swing), anchor[1] + offsetX * Math.sin(swing) + offsetY * Math.cos(swing)]
  }
  const look = { ...(seconds < EXIT_SUIT_AT ? bookwormRadiLook : isBatman ? batmanRadiLook : unicornRadiLook), expression: "grin" as const }
  const dangle = Math.sin(seconds * (isBatman ? 18 : 14)) * (isBatman ? 3 : 1.5) * grip
  const [trailingLift, leadLift] = isBatman ? [3, 3] : [7, 2]
  const drawTossedBook = () => {
    if (bookFly <= 0) return
    const releaseBounce = Math.abs(Math.sin((EXIT_BOOK_START * Math.PI * 2) / 0.34)) * 9 * scale
    const flight = stageProgress(seconds, EXIT_BOOK_START, EXIT_BOOK_END)
    const landed = stageProgress(seconds, EXIT_BOOK_END, EXIT_BOOK_END + TOSS_LANDING_BOUNCE)
    const thud = Math.sin(landed * Math.PI) * (1 - landed) * 8 * scale
    const flyX = mix(landingX, width * 0.68, flight)
    const flyY = mix(floorY - releaseBounce - 7 * scale, floorY - (HELD_BOOK_WIDTH / 2) * scale, flight) - Math.sin(flight * Math.PI) * 120 * scale - thud
    if (flight < 0.92) {
      paintLine(context, OUTLINE, 2.2, linePath(flyX - 16 * scale, flyY + 4 * scale, flyX - 42 * scale, flyY + 14 * scale))
      paintLine(context, OUTLINE, 2.2, linePath(flyX - 12 * scale, flyY - 10 * scale, flyX - 36 * scale, flyY - 2 * scale))
    }
    context.save()
    context.translate(flyX, flyY)
    context.rotate(flight * Math.PI * 2.5)
    drawReadingBook(context, 0, 0, scale, 1 - easeOut(Math.min(1, bookFly * 2.5)), 0)
    context.restore()
  }
  const zipLength = Math.hypot(hook[0] - launch[0], hook[1] - launch[1]) || 1
  const alongZip: Point = [(hook[0] - launch[0]) / zipLength, (hook[1] - launch[1]) / zipLength]
  if (seconds < EXIT_RISE_END) {
    const [feetX, feetY] = toWorld([0, 0])
    const lift = stageProgress(floorY - feetY, 0, floorY - holeY)
    paintFill(context, "rgba(80, 42, 20, 0.16)", ellipsePath(feetX, floorY, mix(36, 8, lift) * scale, mix(7, 2, lift) * scale))
  context.save()
    clipBelowCeilingOpening(context, width, height, ceilingY)
    if (isBatman) drawZipStreaks(context, anchor, alongZip, speed, seconds, scale)
    else drawRainbowTrail(context, flightAt, seconds, scale)
    context.translate(anchor[0], anchor[1])
    context.rotate(swing)
    context.scale(sideStretch, stretch)
    context.translate(-EXIT_ANCHOR[0] * bodyScale, -EXIT_ANCHOR[1] * bodyScale)
    drawRadi(context, look, 0, 0, bodyScale, {
      hideLegs: seconds < EXIT_SUIT_AT,
      hands,
      elbowBends: naturalElbows(hands),
      legLifts: [legBend + dangle + trailingLift * grip, legBend - dangle + leadLift * grip],
      kneeBends: [legBend * 0.8 + 2 * grip, legBend * 0.8 + 2 * grip],
    })
    if (stand < 0.92 && seconds < EXIT_SMOKE_START + 0.24) drawSeatedLegs(context, 0, 0, bodyScale, 1 - stand)
  if (bookFly <= 0) drawReadingBook(context, 0, -18 * bodyScale, bodyScale, 1, 0)
  context.restore()
  }
  drawTransformSmoke(context, landingX, floorY - 50 * scale, scale, seconds, isBatman ? BAT_SMOKE : UNICORN_GLITTER)
  if (!isBatman) {
    drawRainbowBurst(context, landingX, floorY - 50 * scale, scale, seconds)
    drawLaunchStars(context, landingX, floorY, scale, seconds)
    drawOrbiters(context, width, ceilingY, landingX, floorY, scale, seconds, true, drawUnicornFlier)
    drawStarShower(context, holeX, holeY, radiusX, floorY, scale, seconds)
    drawTossedBook()
    return
  }
  if (seconds >= BATMAN_FIRE_START && seconds < EXIT_ARRIVE) {
    const ropeFrom = toWorld(hands[1])
    const shot = easeOut(stageProgress(seconds, BATMAN_FIRE_START, BATMAN_HOOK_BITE))
    const sinceBite = seconds - BATMAN_HOOK_BITE
    const tip = mixPoint(ropeFrom, hook, shot)
    if (sinceBite < 0) drawGrappleLine(context, ropeFrom, tip, 8 * scale * (1 - shot), 3, -seconds * 30, scale)
    else drawGrappleLine(context, ropeFrom, hook, 10 * scale * Math.sin(sinceBite * 48) * Math.exp(-sinceBite * 7), 0, Math.PI / 2, scale)
    drawGrapnel(context, tip[0], tip[1], sinceBite < 0 ? Math.atan2(tip[1] - ropeFrom[1], tip[0] - ropeFrom[0]) : Math.atan2(alongZip[1], alongZip[0]), scale)
  }
  drawHookBite(context, holeX, holeY, scale, seconds)
  drawLaunchDust(context, landingX, floorY, scale, seconds)
  drawOrbiters(context, width, ceilingY, landingX, floorY, scale, seconds, true, drawBat)
  drawEscapeBats(context, holeX, holeY, scale, seconds)
  drawTossedBook()
}

const drawLibraryRadi = (
  context: Context,
  width: number,
  height: number,
  floorY: number,
  landingX: number,
  scale: number,
  time: number,
  sceneSeconds: number,
  quizPhase: LibraryQuizPhase,
  jokeQuizStartSeconds: number | null,
  wrongSeconds: number | null,
  cheerSeconds: number | null,
  exitSeconds: number | null,
  exitHero: ExitHero | null,
  boringShakeSeconds: number | null,
) => {
  const ladder = ladderPlacement(width, height, floorY)
  const ladderX = ladderCenterX(ladder, floorY)
  if (sceneSeconds < WALK_TO_LADDER_START) drawCrashRadi(context, landingX, floorY, scale, time, sceneSeconds)
  else if (sceneSeconds < WALK_TO_LADDER_END) drawSkippingRadi(context, landingX, ladderX, floorY, scale, sceneSeconds, WALK_TO_LADDER_START, WALK_TO_LADDER_END, false)
  else if (sceneSeconds < WALK_BACK_START) drawClimbingRadi(context, ladder, floorY, scale, sceneSeconds)
  else if (sceneSeconds < WALK_BACK_END) drawSkippingRadi(context, ladderX, landingX, floorY, scale, sceneSeconds, WALK_BACK_START, WALK_BACK_END, true)
  else if (exitSeconds !== null && exitHero !== null) drawExitBackdrop(context, width, height, floorY, landingX, scale, exitSeconds, exitHero)
  else drawReadingRadi(context, landingX, floorY, scale, sceneSeconds, quizPhase, jokeQuizStartSeconds, wrongSeconds, cheerSeconds, boringShakeSeconds)
}

export const drawLibraryScene = (
  context: Context,
  width: number,
  height: number,
  time: number,
  sceneSeconds: number,
  quizPhase: LibraryQuizPhase = "captain",
  captainChoice: CaptainChoice | null = null,
  hoveredCaptain: CaptainChoice | null = null,
  jokeChoice: JokeChoice | null = null,
  hoveredJoke: JokeChoice | null = null,
  wrongSeconds: number | null = null,
  jokeQuizStartSeconds: number | null = null,
  finalQuizStartSeconds: number | null = null,
  cheerSeconds: number | null = null,
  finalChoice: FinalChoice | null = null,
  hoveredFinal: FinalChoice | null = null,
  exitSeconds: number | null = null,
  boringShakeSeconds: number | null = null,
) => {
  const { scale, floorY, ceilingY, landingX } = libraryLayout(width, height)
  const exitHero = finalChoice === "batman" || finalChoice === "unicorn" ? finalChoice : null
  const sinceImpact = sceneSeconds - FALL_END
  const { lowestY } = crashMotion(sceneSeconds, floorY, scale)
  const breaking = ceilingBreak(lowestY, ceilingY)
  const sinceBreak = sceneSeconds - breakStartSeconds(floorY, scale, ceilingY)
  const breakShake = breaking.travel > 0 && breaking.travel < 130 ? (1 - breaking.travel / 130) * 8 : 0
  const shake = Math.max(sinceImpact >= 0 ? (1 - stageProgress(sinceImpact, 0, SHAKE_SECONDS)) * SHAKE_STRENGTH : 0, breakShake, exitShake(exitSeconds, exitHero))
  const flash = sinceImpact >= 0 ? 0.55 * (1 - stageProgress(sinceImpact, 0, FLASH_SECONDS)) : 0
  context.lineJoin = "round"
  context.lineCap = "round"
  context.lineWidth = 3
  context.strokeStyle = OUTLINE
  context.save()
  const shakeX = Math.sin(time * 80) * shake
  const shakeY = Math.cos(time * 66) * shake * 0.6
  context.translate(shakeX, shakeY)
  const isRoomStill = shake === 0 && (sinceImpact < 0 || sinceImpact > QUAKE_SECONDS)
  const ladder = ladderPlacement(width, height, floorY)
  const shelves = isRoomStill ? vectorShelves : spriteShelves
  if (isRoomStill) {
    paintCachedLayer(context, "library:room", `${width} ${height}`, (layer) => {
      drawRoom(layer, width, height, floorY, ceilingY, sinceImpact, shelves)
      drawLadder(layer, ladder.left, floorY, ladder.top, sinceImpact, shelves)
    })
    warmShelfSprites(context, width, height, floorY, ceilingY, sinceImpact)
    drawNightHole(context, width, ceilingY, breaking.holeOpen, time)
  } else {
    drawRoom(context, width, height, floorY, ceilingY, sinceImpact, shelves)
    drawNightHole(context, width, ceilingY, breaking.holeOpen, time)
    drawLadder(context, ladder.left, floorY, ladder.top, sinceImpact, shelves)
  }
  drawLibraryRadi(context, width, height, floorY, landingX, scale, time, sceneSeconds, quizPhase, jokeQuizStartSeconds, wrongSeconds, cheerSeconds, exitSeconds, exitHero, boringShakeSeconds)
  const drawCeiling = (layer: Context) => {
    drawCeilingBoards(layer, width, ceilingY, breaking.holeOpen)
    drawCeilingCracks(layer, width, ceilingY, breaking.holeOpen < 0.55 ? breaking.cracks : 0)
    drawHoleRim(layer, width, ceilingY, breaking.holeOpen)
  }
  const drawFallingRubble = (layer: Context) => {
    drawHangingPlanks(layer, width, height, ceilingY, floorY, breaking.holeOpen, sinceBreak)
    drawBreakBurst(layer, width, ceilingY, sinceBreak)
    drawBreakDust(layer, width, ceilingY, sinceBreak)
    drawBreakDebris(layer, width, height, ceilingY, floorY, sinceBreak)
  }
  const drawRubble = (layer: Context) => {
    drawCeiling(layer)
    drawFallingRubble(layer)
  }
  const drawSideBookcases = (layer: Context) => {
    for (const bookcase of sideBookcases(width, ceilingY, floorY)) drawBookcase(layer, bookcase, sinceImpact, shelves)
  }
  const ceilingKey = `${width} ${height} ${breaking.holeOpen} ${breaking.cracks}`
  if (isRoomStill && isRubbleSettled(width, height, ceilingY, floorY, breaking.holeOpen, sinceBreak)) {
    paintCachedLayer(context, "library:rubble", `settled ${ceilingKey}`, drawRubble)
  } else {
    if (sceneSeconds >= FALL_END) paintCachedLayer(context, "library:rubble", `ceiling ${ceilingKey}`, drawCeiling, shakeX, shakeY)
    else drawCeiling(context)
    drawFallingRubble(context)
  }
  if (isRoomStill) paintCachedLayer(context, "library:sidecases", `${width} ${height}`, drawSideBookcases)
  else drawSideBookcases(context)
  if (exitSeconds !== null && exitHero !== null && sceneSeconds >= WALK_BACK_END) drawHeroExit(context, width, height, floorY, landingX, scale, exitSeconds, exitHero)
  drawDust(context, landingX, floorY, sceneSeconds)
  drawSpeechBubble(context, width, height, landingX, floorY, scale, easeOutBack(stageProgress(sceneSeconds, SAY_START, SAY_START + BUBBLE_POP_SECONDS)) * (1 - stageProgress(sceneSeconds, SAY_END - BUBBLE_HIDE_SECONDS, SAY_END)))
  drawLibraryQuizzes(
    context,
    width,
    height,
    sceneSeconds,
    quizPhase,
    captainChoice,
    hoveredCaptain,
    jokeChoice,
    hoveredJoke,
    finalChoice,
    hoveredFinal,
    wrongSeconds,
    jokeQuizStartSeconds,
    finalQuizStartSeconds,
    cheerSeconds,
  )
  if (sinceImpact >= 0 && sinceImpact < 0.5) {
    const ring = stageProgress(sinceImpact, 0, 0.5)
    context.save()
    context.globalAlpha = 1 - ring
    paintLine(context, "#fff6e4", 4, ellipsePath(landingX, floorY, mix(12, 70, ring) * scale, mix(4, 14, ring) * scale))
    context.restore()
  }
  context.restore()
  if (flash > 0) paintFill(context, `rgba(255, 248, 230, ${flash})`, (path) => path.rect(0, 0, width, height))
  const fullRadius = Math.hypot(width, height)
  if (sceneSeconds < IRIS_IN_END) paintIris(context, width, height, landingX, floorY - 70 * scale, mix(0, fullRadius, stageProgress(sceneSeconds, 0, IRIS_IN_END) ** 2))
  if (exitSeconds !== null && exitHero !== null && exitSeconds >= EXIT_IRIS_START) {
    const { holeX, holeY, radiusX } = holePlacement(width, ceilingY, 1)
    const focus = 1 - (1 - stageProgress(exitSeconds, EXIT_IRIS_START, EXIT_IRIS_FOCUS_END)) ** 3
    const close = stageProgress(exitSeconds, EXIT_IRIS_CLOSE_START, EXIT_IRIS_CLOSE_END)
    paintIris(context, width, height, holeX, holeY, mix(fullRadius, radiusX * 1.15, focus) * (1 - close ** 2))
  }
}
