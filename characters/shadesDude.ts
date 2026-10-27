import { ellipsePath, linePath, paintFill, paintLine, paintShape, type BuildPath, type Context } from "@/characters/paint"
import { drawPartyPerson, type PartyPerson, type PartyPose } from "@/characters/partyPerson"
import { OUTLINE, OUTLINE_WIDTH, WHITE, paintTube } from "@/characters/radi"

const SKIN = "#d9a47a"
const FAR_SKIN = "#c08d66"
const HAIR = "#2a1f1a"
const EYE = "#4a2f1d"
const TEE = "#1d1d1d"
const JEANS = "#3f5f8f"
const FAR_JEANS = "#33507a"
const FRAME = "#1d1d1d"
const MOUTH = "#7a2230"
const BUZZ = "rgba(42, 31, 26, 0.32)"
const SIDES = [-1, 1] as const

export const shadesDude: PartyPerson = {
  skin: SKIN,
  hair: "bald",
  hairColor: HAIR,
  eyes: "round",
  eyeColor: EYE,
  build: "chubby",
  face: "laugh",
  top: "tee",
  topColor: TEE,
  accentColor: TEE,
  bottom: "jeans",
  bottomColor: JEANS,
  shoes: "sneakers",
  shoeColor: WHITE,
  extras: [],
}

const NECK_Y = -46
const STANDING: PartyPose ={ hands: [[-23, -29], [23, -29]], bounce: 0, sway: 0, headTilt: 0, footLifts: [0, 0], lookUp: 0 }

const drawInUnits = (context: Context, feetX: number, feetY: number, scale: number, draw: () => void) => {
  context.save()
  context.translate(feetX, feetY)
  context.scale(scale, scale)
  context.lineJoin = "round"
  context.lineCap = "round"
  context.lineWidth = OUTLINE_WIDTH
  context.strokeStyle = OUTLINE
  draw()
  context.restore()
}

const kissingDude: PartyPerson = { ...shadesDude, face: "kiss" }

export const drawShadesDudeFront = (context: Context, feetX: number, feetY: number, scale: number, pose: PartyPose = STANDING, isKissing = false) => {
  drawPartyPerson(context, isKissing ? kissingDude : shadesDude, feetX, feetY, scale, pose)
  drawInUnits(context, feetX, feetY, scale, () => {
    context.translate(pose.sway, pose.bounce + NECK_Y)
    context.rotate(pose.headTilt)
    context.translate(0, -NECK_Y)
    paintFill(context, BUZZ, frontBuzzPath)
    for (const side of SIDES) {
      paintLine(context, SKIN, 2.4, linePath(side * 5, -71, side * 12, -73.5))
      paintLine(context, HAIR, 2.8, (path) => {
        path.moveTo(side * 4.5, -73)
        path.quadraticCurveTo(side * 8.5, -76.5, side * 13, -74)
      })
      paintLine(context, FRAME, 2, (path) => path.roundRect(side * 8.5 - 6, -68, 12, 9.5, 2.5))
      paintLine(context, FRAME, 1.6, linePath(side * 14.5, -65.5, side * 21.5, -66))
    }
    paintLine(context, FRAME, 1.6, linePath(-2.5, -64.5, 2.5, -64.5))
  })
}

const frontBuzzPath: BuildPath = (path) => {
  path.moveTo(-21.5, -70)
  path.quadraticCurveTo(-22.5, -92.5, 0, -91.5)
  path.quadraticCurveTo(22.5, -92.5, 21.5, -70)
  path.quadraticCurveTo(12, -80, 0, -81)
  path.quadraticCurveTo(-12, -80, -21.5, -70)
  path.closePath()
}

const sideBuzzPath: BuildPath = (path) => {
  path.moveTo(16, -80)
  path.quadraticCurveTo(10, -92, -3, -90.5)
  path.quadraticCurveTo(-20, -87, -19.5, -66)
  path.quadraticCurveTo(-10, -74, -5, -69)
  path.quadraticCurveTo(4, -80, 16, -80)
  path.closePath()
}

const sideBellyPath: BuildPath = (path) => {
  path.moveTo(-6, -49)
  path.lineTo(5, -49)
  path.quadraticCurveTo(23, -45, 21, -35)
  path.quadraticCurveTo(19, -28, 6, -29)
  path.lineTo(-6, -30)
  path.quadraticCurveTo(-14, -30, -14, -37)
  path.lineTo(-14, -43)
  path.quadraticCurveTo(-14, -49, -6, -49)
  path.closePath()
}

const drawSideShoe =(context: Context, shoeX: number) => {
  paintShape(context, WHITE, (path) => path.roundRect(shoeX - 7, -10.5, 18, 10, 4))
  paintLine(context, OUTLINE, 0.7, linePath(shoeX - 6, -2.5, shoeX + 10, -2.5))
}

export const drawShadesDudeSide = (context: Context, feetX: number, feetY: number, scale: number) => {
  drawInUnits(context, feetX, feetY, scale, () => {
    paintTube(context, FAR_JEANS, 10, linePath(-4, -22, -5, -9))
    drawSideShoe(context, -5)
    paintTube(context, FAR_SKIN, 4.5, linePath(-2, -42.5, -6, -29))
    paintShape(context, FAR_SKIN, ellipsePath(-6, -29, 2.8, 2.8))
    paintTube(context, JEANS, 10, linePath(2, -22, 3, -9))
    drawSideShoe(context, 3)
    paintShape(context, JEANS, (path) => path.roundRect(-13, -32, 25, 10, 3))
    paintShape(context, TEE, sideBellyPath)

    paintShape(context, SKIN, ellipsePath(21.5, -60, 3, 3.5))
    paintShape(context, SKIN, ellipsePath(1, -68, 21, 23))
    paintFill(context, BUZZ, sideBuzzPath)
    paintShape(context, SKIN, ellipsePath(-3, -64, 3.5, 4.5))
    paintFill(context, "rgba(255, 120, 120, 0.3)", ellipsePath(10, -56, 3.5, 2))
    paintLine(context, HAIR, 2.6, (path) => {
      path.moveTo(10.5, -72.5)
      path.quadraticCurveTo(14.5, -75.5, 18.5, -73)
    })
    paintFill(context, OUTLINE, ellipsePath(15.5, -63, 1.8, 2.4))
    paintFill(context, WHITE, ellipsePath(16.1, -64, 0.6, 0.6))
    paintShape(context, MOUTH, (path) => {
      path.moveTo(13.5, -53.5)
      path.quadraticCurveTo(17, -46.5, 21.5, -53)
      path.closePath()
    })
    paintFill(context, WHITE, (path) => path.rect(15, -53.4, 6, 1.6))
    paintLine(context, FRAME, 1.6, linePath(10, -65, -1, -65))
    paintLine(context, FRAME, 2, (path) => path.roundRect(10.5, -68, 9.5, 9.5, 2.5))

    paintTube(context, SKIN, 5.5, linePath(-1, -42.5, 1, -29))
    paintTube(context, TEE, 7.5, linePath(-1, -42.5, -0.5, -36))
    paintShape(context, SKIN, ellipsePath(1, -29, 3, 3))
  })
}
