import { ellipsePath, linePath, paintFill, paintLine, paintShape, type BuildPath, type Context } from "@/characters/paint"
import { OUTLINE, OUTLINE_WIDTH, WHITE, paintTube, type Point } from "@/characters/radi"
import { paintSprite, snapToSubpixel, type SpriteBounds } from "@/characters/sprites"

type PartyHair = "short" | "buzz" | "long" | "curly" | "bob" | "bun" | "ponytail" | "mohawk" | "bald"
type PartyEyes = "dot" | "round" | "sleepy" | "lashes"
type PartyTop = "tee" | "tank" | "shirt" | "crop" | "hoodie" | "blazer" | "folkShirt" | "sukman"
type PartyBottom = "jeans" | "shorts" | "skirt" | "folkTrousers" | "folkSkirt"
type PartyShoes = "sneakers" | "boots" | "heels" | "loafers" | "tsarvuli"
type PartyBuild = "slim" | "broad" | "curvy" | "chubby"
type PartyFace = "smile" | "laugh" | "vibing" | "amazed" | "kiss"
type PartyExtra = "beard" | "stubble" | "mustache" | "glasses" | "sunglasses" | "cap" | "earrings" | "chain" | "drink" | "sequins" | "kalpak" | "flowerCrown" | "sash" | "folkApron" | "handkerchief"
type BuildShape = { torso: number; hip: number; leg: number; stance: number }
type Limb = { start: Point; joint: Point; end: Point }
type PaintPart = (part: string, bounds: SpriteBounds, drawPart: (partContext: Context) => void) => void

export type PartyPerson = {
  skin: string
  hair: PartyHair
  hairColor: string
  eyes: PartyEyes
  eyeColor: string
  build: PartyBuild
  face: PartyFace
  top: PartyTop
  topColor: string
  accentColor: string
  bottom: PartyBottom
  bottomColor: string
  shoes: PartyShoes
  shoeColor: string
  extras: PartyExtra[]
}

export type PartyPose = { hands: readonly [Point, Point]; bounce: number; sway: number; headTilt: number; footLifts: readonly [number, number]; lookUp: number }

const SIDES = [-1, 1] as const
const BUILDS: Record<PartyBuild, BuildShape> = {
  slim: { torso: 8.5, hip: 8.5, leg: 6, stance: 5 },
  broad: { torso: 10.5, hip: 10, leg: 6, stance: 5 },
  curvy: { torso: 9, hip: 10.5, leg: 6, stance: 5 },
  chubby: { torso: 17.5, hip: 16, leg: 10, stance: 8 },
}
const TORSO_TOP = -49
const TORSO_BOTTOM = -30
const HIP_TOP = -32
const SHOULDER_Y = -42.5
const NECK_Y = -46
const EYE_Y = -63
const ARM_SEGMENT = 12
const LEG_SEGMENT = 8
const GOLD = "#f2c94c"
const LONG_SLEEVE_TOPS: readonly PartyTop[] = ["shirt", "hoodie", "blazer", "folkShirt", "sukman"]
const FOLK_RED = "#d62828"
const FUR = "#2a1f1a"
const HAIR_BACK_BOUNDS: SpriteBounds = [-36, -112, 36, -24]
const BODY_BOUNDS: SpriteBounds = [-26, -56, 26, -6]
const HEAD_BOUNDS: SpriteBounds = [-30, -116, 36, -28]
const SHOE_BOUNDS: SpriteBounds = [-7, -17, 9, 3]
const CROWN_FLOWERS = [[-19, -80, "#ff4d6d"], [-13, -88, WHITE], [-6, -92, "#ffd23f"], [1, -93.5, "#ff4d6d"], [8, -92, WHITE], [14.5, -88, "#ffd23f"], [19.5, -80, "#ff4d6d"]] as const

const hasExtra = (person: PartyPerson, extra: PartyExtra) => person.extras.includes(extra)

const pointAlong = ([fromX, fromY]: Point, [toX, toY]: Point, amount: number): Point => [fromX + (toX - fromX) * amount, fromY + (toY - fromY) * amount]

const jointBetween = ([fromX, fromY]: Point, [toX, toY]: Point, segment: number, side: number): Point => {
  const distance = Math.hypot(toX - fromX, toY - fromY) || 1
  const fullReach = Math.sqrt(Math.max(0, segment ** 2 - (distance / 2) ** 2))
  const reach = Math.min(fullReach, distance * 0.55)
  const outward = side * (fromY - toY) >= 0 ? 1 : -1
  return [(fromX + toX) / 2 + ((fromY - toY) / distance) * reach * outward, (fromY + toY) / 2 + ((toX - fromX) / distance) * reach * outward]
}

const limbPath = (from: Point, joint: Point, to: Point): BuildPath => (path) => {
  path.moveTo(...from)
  path.lineTo(...joint)
  path.lineTo(...to)
}

const headPath: BuildPath = (path) => {
  path.ellipse(0, -68, 22, 24, 0, Math.PI, Math.PI * 2)
  path.bezierCurveTo(22, -54, 12, -45, 0, -45)
  path.bezierCurveTo(-12, -45, -22, -54, -22, -68)
  path.closePath()
}

const sweptHairPath: BuildPath = (path) => {
  path.moveTo(-22.5, -62)
  path.quadraticCurveTo(-25, -97, 0, -95)
  path.quadraticCurveTo(25, -97, 22.5, -62)
  path.quadraticCurveTo(20, -80, 9, -80)
  path.quadraticCurveTo(-6, -76, -22.5, -62)
  path.closePath()
}

const middlePartHairPath: BuildPath = (path) => {
  path.moveTo(-22.5, -60)
  path.quadraticCurveTo(-25, -97, 0, -95)
  path.quadraticCurveTo(25, -97, 22.5, -60)
  path.quadraticCurveTo(16, -80, 1, -82)
  path.quadraticCurveTo(-16, -80, -22.5, -60)
  path.closePath()
}

const buzzHairPath: BuildPath = (path) => {
  path.moveTo(-21.8, -72)
  path.quadraticCurveTo(-23, -94, 0, -93.5)
  path.quadraticCurveTo(23, -94, 21.8, -72)
  path.quadraticCurveTo(0, -84, -21.8, -72)
  path.closePath()
}

const beardPath: BuildPath = (path) => {
  path.moveTo(-21.5, -64)
  path.quadraticCurveTo(-20, -44, 0, -43)
  path.quadraticCurveTo(20, -44, 21.5, -64)
  path.quadraticCurveTo(14, -54, 0, -55)
  path.quadraticCurveTo(-14, -54, -21.5, -64)
  path.closePath()
}

const shoePainters: Record<PartyShoes, (context: Context, color: string) => void> = {
  sneakers: (context, color) => {
    paintShape(context, color, (path) => path.roundRect(-5, -6.5, 11, 6, 2.5))
    paintLine(context, WHITE, 1.4, linePath(-4.5, -1.6, 5.5, -1.6))
    paintLine(context, OUTLINE, 0.6, linePath(-1, -5, 2, -5))
  },
  boots: (context, color) => {
    paintShape(context, color, (path) => {
      path.moveTo(-3.8, -8)
      path.lineTo(3.8, -8)
      path.lineTo(3.8, -5)
      path.quadraticCurveTo(6.5, -5, 6.5, -1)
      path.lineTo(-4.2, -1)
      path.closePath()
    })
  },
  heels: (context, color) => {
    paintShape(context, color, (path) => {
      path.moveTo(-3.5, -6)
      path.quadraticCurveTo(4, -6, 5.5, -2)
      path.lineTo(-3.5, -2)
      path.closePath()
    })
    paintLine(context, OUTLINE, 1.4, linePath(-3, -2.5, -3, 0.5))
  },
  loafers: (context, color) => {
    paintShape(context, color, ellipsePath(1, -2.8, 5.5, 2.9))
    paintLine(context, GOLD, 0.9, linePath(0, -4.6, 3, -4.6))
  },
  tsarvuli: (context, color) => {
    for (const strapY of [-12, -8.5]) {
      paintLine(context, OUTLINE, 0.8, linePath(-3, strapY - 2, 3, strapY + 1.5))
      paintLine(context, OUTLINE, 0.8, linePath(3, strapY - 2, -3, strapY + 1.5))
    }
    paintShape(context, color, ellipsePath(1, -2.8, 5.8, 3))
    paintFill(context, FOLK_RED, ellipsePath(1, -5.4, 1.2, 1.2))
  },
}

const eachLimb = (limbs: readonly Limb[], buildLimb: (limb: Limb) => BuildPath): BuildPath => (path) => {
  for (const limb of limbs) buildLimb(limb)(path)
}

const drawLegs = (context: Context, person: PartyPerson, { leg, stance }: BuildShape, pose: PartyPose, paintPart: PaintPart) => {
  const legs = SIDES.map((side, index): Limb => {
    const hip: Point = [side * stance + pose.sway, -22 + pose.bounce]
    const foot: Point = [side * (stance + 1), -5 - (leg - 6) - pose.footLifts[index]]
    return { start: hip, joint: jointBetween(hip, foot, LEG_SEGMENT - (leg - 6) / 2, side), end: foot }
  })
  const legColor = person.bottom === "jeans" || person.bottom === "folkTrousers" ? person.bottomColor : person.bottom === "folkSkirt" ? WHITE : person.skin
  paintTube(context, legColor, leg, eachLimb(legs, ({ start, joint, end }) => limbPath(start, joint, end)))
  if (person.bottom === "shorts") paintTube(context, person.bottomColor, leg + 1.5, eachLimb(legs, ({ start, joint }) => linePath(...start, ...pointAlong(start, joint, 0.8))))
  if (person.shoes === "boots") paintTube(context, person.shoeColor, leg + 2, eachLimb(legs, ({ joint, end }) => linePath(...joint, ...end)))
  SIDES.forEach((side, index) => {
    context.save()
    context.translate(side * (stance + 1), -pose.footLifts[index])
    context.scale((side * leg) / 6, leg / 6)
    context.lineWidth = (OUTLINE_WIDTH * 6) / leg
    paintPart("shoe", SHOE_BOUNDS, (shoeContext) => shoePainters[person.shoes](shoeContext, person.shoeColor))
    context.restore()
  })
}

const drawBottom = (context: Context, person: PartyPerson, { hip }: BuildShape) => {
  if (person.bottom === "folkSkirt") {
    paintShape(context, person.bottomColor, (path) => {
      path.moveTo(-hip, HIP_TOP)
      path.lineTo(hip, HIP_TOP)
      path.lineTo(hip + 6, -11)
      path.quadraticCurveTo(0, -9, -hip - 6, -11)
      path.closePath()
    }, {
      decorateInside: (skirtContext) => {
        paintFill(skirtContext, person.accentColor, (path) => path.rect(-hip - 8, -16, hip * 2 + 16, 4))
        for (let dotX = -hip - 4; dotX <= hip + 4; dotX += 3.5) paintFill(skirtContext, WHITE, ellipsePath(dotX, -14, 0.7, 0.7))
      },
    })
    return
  }
  if (person.bottom !== "skirt") {
    paintShape(context, person.bottomColor, (path) => path.roundRect(-hip, HIP_TOP, hip * 2, 10, 3))
    return
  }
  paintShape(context, person.bottomColor, (path) => {
    path.moveTo(-hip, HIP_TOP)
    path.lineTo(hip, HIP_TOP)
    path.lineTo(hip + 5, -19)
    path.quadraticCurveTo(0, -17, -hip - 5, -19)
    path.closePath()
  })
  for (const pleatX of [-4, 0, 4]) paintLine(context, OUTLINE, 0.6, linePath(pleatX, HIP_TOP + 3, pleatX * 1.4, -19))
}

const drawTop = (context: Context, person: PartyPerson, { torso }: BuildShape) => {
  const { top, topColor, accentColor, skin } = person
  const torsoHeight = TORSO_BOTTOM - TORSO_TOP
  const sequins = hasExtra(person, "sequins")
    ? (topContext: Context) => {
        for (let sequinY = -48; sequinY < TORSO_BOTTOM; sequinY += 2.5) {
          for (let sequinX = -12; sequinX <= 12; sequinX += 2.5) paintFill(topContext, accentColor, ellipsePath(sequinX + (Math.round(sequinY / 2.5) % 2 === 0 ? 1.25 : 0), sequinY, 0.6, 0.6))
        }
      }
    : undefined
  paintShape(context, skin, (path) => path.roundRect(-torso, TORSO_TOP, torso * 2, torsoHeight, 5))
  if (top === "tank") {
    paintShape(context, topColor, (path) => path.roundRect(-torso, -45, torso * 2, torsoHeight - 4, 4), { decorateInside: sequins })
    for (const side of SIDES) paintLine(context, topColor, 2, linePath(side * (torso - 3), TORSO_TOP + 1, side * (torso - 3), -44))
    return
  }
  if (top === "crop") {
    paintShape(context, topColor, (path) => path.roundRect(-torso, TORSO_TOP, torso * 2, 11, 5), { decorateInside: sequins })
    paintFill(context, OUTLINE, ellipsePath(0, -33, 0.7, 0.9))
    return
  }
  if (top === "sukman") {
    paintShape(context, WHITE, (path) => path.roundRect(-torso, TORSO_TOP, torso * 2, torsoHeight, 5))
    paintShape(context, topColor, (path) => {
      path.moveTo(-torso, TORSO_BOTTOM)
      path.lineTo(-torso, -42)
      path.lineTo(-torso + 3, TORSO_TOP)
      path.lineTo(-4, TORSO_TOP)
      path.lineTo(0, -40)
      path.lineTo(4, TORSO_TOP)
      path.lineTo(torso - 3, TORSO_TOP)
      path.lineTo(torso, -42)
      path.lineTo(torso, TORSO_BOTTOM)
      path.closePath()
    })
    paintLine(context, accentColor, 1.4, (path) => {
      path.moveTo(-4.5, TORSO_TOP + 0.5)
      path.lineTo(0, -39)
      path.lineTo(4.5, TORSO_TOP + 0.5)
    })
    return
  }
  paintShape(context, topColor, (path) => path.roundRect(-torso, TORSO_TOP, torso * 2, torsoHeight, 5), { decorateInside: sequins })
  if (top === "folkShirt") {
    paintLine(context, accentColor, 1.6, (path) => {
      path.moveTo(-5, TORSO_TOP + 0.5)
      path.quadraticCurveTo(0, -45, 5, TORSO_TOP + 0.5)
    })
    paintLine(context, accentColor, 1.2, linePath(0, -45.5, 0, -38))
    for (const [diamondX, diamondY] of [[-5, -36], [5, -36], [0, -33]]) {
      paintFill(context, accentColor, (path) => {
        path.moveTo(diamondX, diamondY - 1.6)
        path.lineTo(diamondX + 1.6, diamondY)
        path.lineTo(diamondX, diamondY + 1.6)
        path.lineTo(diamondX - 1.6, diamondY)
        path.closePath()
      })
    }
  }
  if (top === "tee") {
    paintShape(context, accentColor, (path) => {
      for (let pointIndex = 0; pointIndex < 10; pointIndex += 1) {
        const angle = -Math.PI / 2 + (pointIndex * Math.PI) / 5
        const radius = pointIndex % 2 === 0 ? 4 : 1.8
        path.lineTo(Math.cos(angle) * radius, -39 + Math.sin(angle) * radius)
      }
      path.closePath()
    })
  }
  if (top === "hoodie") {
    paintShape(context, topColor, (path) => path.roundRect(-6, -38, 12, 6, 2))
    for (const side of SIDES) paintLine(context, accentColor, 0.8, linePath(side * 2, -47, side * 2.3, -41))
  }
  if (top === "shirt") {
    for (const side of SIDES) {
      paintShape(context, topColor, (path) => {
        path.moveTo(side * 0.5, -49)
        path.lineTo(side * 6, -49)
        path.lineTo(side * 1.5, -44)
        path.closePath()
      })
    }
    for (const buttonY of [-41, -37, -33]) paintFill(context, accentColor, ellipsePath(0, buttonY, 0.7, 0.7))
  }
  if (top === "blazer") {
    paintShape(context, accentColor, (path) => {
      path.moveTo(-4, TORSO_TOP)
      path.lineTo(4, TORSO_TOP)
      path.lineTo(0, -36)
      path.closePath()
    })
    paintShape(context, OUTLINE, ellipsePath(0, -33.5, 0.9, 0.9))
  }
  if (hasExtra(person, "chain")) {
    paintLine(context, GOLD, 0.9, (path) => {
      path.moveTo(-4, TORSO_TOP)
      path.quadraticCurveTo(0, -39, 4, TORSO_TOP)
    })
  }
}

const drawCup = (context: Context, [handX, handY]: Point) => {
  paintShape(context, "#e63946", (path) => {
    path.moveTo(handX - 2.6, handY - 7)
    path.lineTo(handX + 2.6, handY - 7)
    path.lineTo(handX + 1.9, handY + 1.5)
    path.lineTo(handX - 1.9, handY + 1.5)
    path.closePath()
  })
  paintLine(context, WHITE, 0.8, linePath(handX - 2.4, handY - 6, handX + 2.4, handY - 6))
}

const drawHandkerchief = (context: Context, [handX, handY]: Point) => {
  paintShape(context, FOLK_RED, (path) => {
    path.moveTo(handX, handY)
    path.quadraticCurveTo(handX + 7, handY - 5, handX + 12, handY + 1)
    path.quadraticCurveTo(handX + 8, handY + 5, handX + 4, handY + 11)
    path.quadraticCurveTo(handX + 2, handY + 5, handX, handY)
    path.closePath()
  })
}

const drawFolkWaist = (context: Context, person: PartyPerson, { hip }: BuildShape) => {
  if (hasExtra(person, "folkApron")) {
    paintShape(context, person.accentColor, (path) => path.roundRect(-6.5, TORSO_BOTTOM - 1, 13, 18, 2), {
      decorateInside: (apronContext) => {
        for (const [stripeY, stripeColor] of [[-27, FUR], [-22, GOLD], [-17, WHITE]] as const) paintFill(apronContext, stripeColor, (path) => path.rect(-7, stripeY, 14, 2))
      },
    })
  }
  if (hasExtra(person, "sash")) paintShape(context, person.accentColor, (path) => path.roundRect(-hip - 0.5, TORSO_BOTTOM - 3, hip * 2 + 1, 5, 1.5))
}

const drawArms = (context: Context, person: PartyPerson, { torso }: BuildShape, hands: PartyPose["hands"]) => {
  const sleeveColor = person.top === "sukman" ? WHITE : LONG_SLEEVE_TOPS.includes(person.top) ? person.topColor : person.skin
  const isFolkTop = person.top === "folkShirt" || person.top === "sukman"
  const arms = SIDES.map((side, index): Limb => {
    const shoulder: Point = [side * (torso - 0.5), SHOULDER_Y]
    return { start: shoulder, joint: jointBetween(shoulder, hands[index], ARM_SEGMENT, side), end: hands[index] }
  })
  const paintArms = (armsToPaint: readonly Limb[]) => {
    paintTube(context, sleeveColor, 4.5, eachLimb(armsToPaint, ({ start, joint, end }) => limbPath(start, joint, end)))
    if (person.top === "tee") paintTube(context, person.topColor, 6.5, eachLimb(armsToPaint, ({ start, joint }) => linePath(...start, ...pointAlong(start, joint, 0.6))))
    if (isFolkTop) paintTube(context, person.accentColor, 4.6, eachLimb(armsToPaint, ({ joint, end }) => linePath(...pointAlong(joint, end, 0.62), ...pointAlong(joint, end, 0.8))))
    paintShape(context, person.skin, eachLimb(armsToPaint, ({ end: [handX, handY] }) => (path) => {
      path.moveTo(handX + 2.8, handY)
      path.ellipse(handX, handY, 2.8, 2.8, 0, 0, Math.PI * 2)
    }))
  }
  const drawHeldItems = () => {
    if (hasExtra(person, "drink")) drawCup(context, hands[1])
    if (hasExtra(person, "handkerchief")) drawHandkerchief(context, hands[1])
  }
  if (hands[0][0] < -4 && hands[1][0] > 4) {
    drawHeldItems()
    paintArms(arms)
    return
  }
  paintArms([arms[0]])
  drawHeldItems()
  paintArms([arms[1]])
}

const drawHairBack = (context: Context, { hair, hairColor, accentColor }: PartyPerson) => {
  if (hair === "long" || hair === "bob") {
    const endY = hair === "long" ? -30 : -48
    paintShape(context, hairColor, (path) => {
      path.moveTo(-23, -80)
      path.quadraticCurveTo(-31, (endY - 80) / 2, -27, endY)
      path.quadraticCurveTo(0, endY + 4, 27, endY)
      path.quadraticCurveTo(31, (endY - 80) / 2, 23, -80)
      path.closePath()
    })
  }
  if (hair === "ponytail") {
    paintShape(context, hairColor, (path) => {
      path.moveTo(-6, -93)
      path.quadraticCurveTo(32, -102, 30, -60)
      path.quadraticCurveTo(28, -44, 20, -38)
      path.quadraticCurveTo(25, -66, 8, -89)
      path.closePath()
    })
  }
  if (hair === "bun") {
    paintShape(context, hairColor, ellipsePath(0, -99, 10, 8.5))
    paintShape(context, accentColor, (path) => path.roundRect(-7, -93, 14, 3, 1.5))
  }
  if (hair === "curly") {
    for (let curlIndex = 0; curlIndex < 11; curlIndex += 1) {
      const angle = Math.PI * (0.89 + curlIndex * 0.122)
      paintShape(context, hairColor, ellipsePath(Math.cos(angle) * 24, -68 + Math.sin(angle) * 25, 8.5, 8.5))
    }
  }
}

const drawEyes = (context: Context, person: PartyPerson, lookUp: number) => {
  const { eyes, eyeColor, skin, face } = person
  const gazeY = EYE_Y - lookUp * 1.6
  for (const side of SIDES) {
    const eyeX = side * 8.5
    if (face === "vibing") {
      paintLine(context, OUTLINE, 1.5, (path) => {
        path.moveTo(eyeX - 3.5, EYE_Y)
        path.quadraticCurveTo(eyeX, EYE_Y - 4, eyeX + 3.5, EYE_Y)
      })
      continue
    }
    if (eyes === "dot") {
      paintFill(context, OUTLINE, ellipsePath(eyeX, gazeY, 2.2, 2.8))
      paintFill(context, WHITE, ellipsePath(eyeX + 0.8, gazeY - 1.2, 0.8, 0.8))
      continue
    }
    paintShape(context, WHITE, ellipsePath(eyeX, EYE_Y, 4.5, 4.5))
    paintFill(context, eyeColor, ellipsePath(eyeX + 0.5, gazeY + 0.5, 2.8, 2.8))
    paintFill(context, OUTLINE, ellipsePath(eyeX + 0.5, gazeY + 0.5, 1.3, 1.3))
    paintFill(context, WHITE, ellipsePath(eyeX + 1.4, gazeY - 0.6, 0.8, 0.8))
    if (eyes === "sleepy") {
      paintShape(context, skin, (path) => {
        path.moveTo(eyeX - 4.8, EYE_Y - 0.5)
        path.quadraticCurveTo(eyeX, EYE_Y - 7, eyeX + 4.8, EYE_Y - 0.5)
        path.closePath()
      })
    }
    if (eyes === "lashes") {
      for (let lashIndex = 0; lashIndex < 3; lashIndex += 1) {
        paintLine(context, OUTLINE, 0.9, linePath(eyeX + side * (1.5 + lashIndex * 1.3), EYE_Y - 4.2 + lashIndex * 0.6, eyeX + side * (3 + lashIndex * 1.8), EYE_Y - 6.5 + lashIndex * 0.9))
      }
    }
  }
}

const drawFace = (context: Context, person: PartyPerson, lookUp: number) => {
  const { skin, hairColor, face } = person
  for (const side of SIDES) paintShape(context, skin, ellipsePath(side * 22, -64, 3.5, 4.5))
  paintShape(context, skin, headPath)
  for (const side of SIDES) {
    if (hasExtra(person, "earrings")) paintLine(context, GOLD, 1.2, ellipsePath(side * 22.5, -56, 2.4, 3))
    paintFill(context, "rgba(255, 120, 120, 0.3)", ellipsePath(side * 13, -56, 3.5, 2))
  }
  if (hasExtra(person, "beard")) paintShape(context, hairColor, beardPath)
  if (hasExtra(person, "stubble")) paintFill(context, "rgba(60, 40, 30, 0.22)", beardPath)
  drawEyes(context, person, lookUp)
  const browLift = face === "amazed" ? 3 : 0
  for (const side of SIDES) paintLine(context, hairColor, 1.6, linePath(side * 5, -71 - browLift, side * 12, (face === "laugh" ? -73.5 : -72) - browLift))
  paintLine(context, OUTLINE, 1, (path) => {
    path.moveTo(0.5, -60)
    path.quadraticCurveTo(-1.5, -57.5, 1, -57)
  })
  if (face === "amazed") {
    paintShape(context, "#7a2230", ellipsePath(0, -51, 3.2, 4.2))
  } else if (face === "kiss") {
    paintShape(context, "#7a2230", ellipsePath(0, -51, 1.1, 1.4))
    for (const side of SIDES) {
      paintLine(context, OUTLINE, 0.9, (path) => {
        path.moveTo(side * 3.6, -53)
        path.quadraticCurveTo(side * 4.6, -51, side * 3.6, -49)
      })
    }
  } else if (face === "laugh") {
    paintShape(context, "#7a2230", (path) => {
      path.moveTo(-6, -53)
      path.quadraticCurveTo(0, -44, 6, -53)
      path.closePath()
    })
    paintFill(context, WHITE, (path) => {
      path.moveTo(-5, -52.7)
      path.lineTo(5, -52.7)
      path.lineTo(4.2, -51)
      path.lineTo(-4.2, -51)
      path.closePath()
    })
  } else {
    paintLine(context, OUTLINE, 1.3, (path) => {
      path.moveTo(-5, -52.5)
      path.quadraticCurveTo(0, -48.5, 5, -52.5)
    })
  }
  if (hasExtra(person, "mustache")) {
    paintShape(context, hairColor, (path) => {
      path.moveTo(-8, -55)
      path.quadraticCurveTo(0, -61, 8, -55)
      path.quadraticCurveTo(0, -57.5, -8, -55)
      path.closePath()
    })
  }
}

const drawHairFront = (context: Context, { hair, hairColor }: PartyPerson) => {
  if (hair === "bald") {
    paintFill(context, "rgba(255, 255, 255, 0.35)", ellipsePath(-8, -86, 6, 3))
    return
  }
  if (hair === "short") paintShape(context, hairColor, sweptHairPath)
  if (hair === "buzz" || hair === "mohawk") paintShape(context, hairColor, buzzHairPath)
  if (hair === "mohawk") {
    paintShape(context, hairColor, (path) => {
      path.moveTo(-6, -90)
      path.lineTo(-8, -104)
      path.lineTo(-3, -97)
      path.lineTo(0, -110)
      path.lineTo(3, -97)
      path.lineTo(8, -104)
      path.lineTo(6, -90)
      path.closePath()
    })
  }
  if (hair === "long" || hair === "bob" || hair === "ponytail" || hair === "bun") paintShape(context, hairColor, middlePartHairPath)
  if (hair === "long" || hair === "bob") {
    const endY = hair === "long" ? -32 : -50
    for (const side of SIDES) {
      paintShape(context, hairColor, (path) => {
        path.moveTo(side * 22.5, -70)
        path.quadraticCurveTo(side * 27, -50, side * 25, endY)
        path.lineTo(side * 19, endY - 2)
        path.quadraticCurveTo(side * 20, -52, side * 18.5, -70)
        path.closePath()
      })
    }
  }
  if (hair === "curly") {
    for (let curlIndex = 0; curlIndex < 5; curlIndex += 1) paintShape(context, hairColor, ellipsePath(-15 + curlIndex * 7.5, -84 + (curlIndex % 2) * 3, 7, 7))
  }
}

const drawHeadwear = (context: Context, person: PartyPerson) => {
  if (hasExtra(person, "kalpak")) {
    paintShape(context, FUR, (path) => {
      path.moveTo(-20, -79)
      path.lineTo(-17, -105)
      path.quadraticCurveTo(0, -111, 17, -105)
      path.lineTo(20, -79)
      path.quadraticCurveTo(0, -83, -20, -79)
      path.closePath()
    })
    for (const [furX, furY] of [[-10, -98], [0, -101], [10, -97], [-5, -89], [6, -88]]) paintLine(context, "#5a4636", 0.8, (path) => path.arc(furX, furY, 2, Math.PI * 1.1, Math.PI * 1.9))
  }
  if (hasExtra(person, "flowerCrown")) {
    paintLine(context, "#2f9e44", 1.6, (path) => {
      path.moveTo(-21, -76)
      path.quadraticCurveTo(0, -110, 21, -76)
    })
    for (const [flowerX, flowerY, flowerColor] of CROWN_FLOWERS) {
      paintShape(context, flowerColor, ellipsePath(flowerX, flowerY, 3.4, 3.4))
      paintFill(context, flowerColor === "#ffd23f" ? FOLK_RED : "#ffd23f", ellipsePath(flowerX, flowerY, 1.2, 1.2))
    }
  }
  if (hasExtra(person, "cap")) {
    paintShape(context, person.accentColor, (path) => {
      path.moveTo(-23, -74)
      path.quadraticCurveTo(-25, -102, 0, -101)
      path.quadraticCurveTo(25, -102, 23, -74)
      path.closePath()
    })
    paintShape(context, person.accentColor, ellipsePath(6, -74, 28, 4.5))
  }
  if (hasExtra(person, "glasses")) {
    for (const side of SIDES) paintLine(context, OUTLINE, 1.3, ellipsePath(side * 8.5, EYE_Y, 6, 5.5))
    paintLine(context, OUTLINE, 1.3, linePath(-2.5, EYE_Y - 1, 2.5, EYE_Y - 1))
  }
  if (hasExtra(person, "sunglasses")) {
    for (const side of SIDES) {
      paintShape(context, "#1d1d1d", (path) => path.roundRect(side * 8.5 - 6, EYE_Y - 5, 12, 9, 3))
      paintLine(context, "rgba(255, 255, 255, 0.5)", 1, linePath(side * 8.5 - 3.5, EYE_Y - 2, side * 8.5 - 1, EYE_Y - 3.5))
    }
    paintLine(context, OUTLINE, 1.3, linePath(-2.5, EYE_Y - 2, 2.5, EYE_Y - 2))
  }
}

export const drawPartyPerson = (context: Context, person: PartyPerson, feetX: number, feetY: number, scale: number, pose: PartyPose, spriteScene?: string) => {
  const build = BUILDS[person.build]
  const spriteKey = spriteScene && `${spriteScene}:${JSON.stringify(person)}`
  const paintPart: PaintPart = (part, bounds, drawPart) => {
    if (spriteKey) paintSprite(context, `${spriteKey}:${part}`, 0, 0, bounds, drawPart)
    else drawPart(context)
  }
  const withHeadTilt = (drawTilted: () => void) => {
    context.save()
    context.translate(0, NECK_Y)
    context.rotate(pose.headTilt)
    context.translate(0, -NECK_Y)
    drawTilted()
    context.restore()
  }
  context.save()
  context.translate(...(spriteKey ? snapToSubpixel(context, feetX, feetY) : [feetX, feetY] as const))
  context.scale(scale, scale)
  context.lineJoin = "round"
  context.lineCap = "round"
  context.lineWidth = OUTLINE_WIDTH
  context.strokeStyle = OUTLINE
  drawLegs(context, person, build, pose, paintPart)
  context.translate(...(spriteKey ? snapToSubpixel(context, pose.sway, pose.bounce) : [pose.sway, pose.bounce] as const))
  withHeadTilt(() => paintPart("hairBack", HAIR_BACK_BOUNDS, (partContext) => drawHairBack(partContext, person)))
  paintPart("body", BODY_BOUNDS, (partContext) => {
    if (person.top === "hoodie") paintShape(partContext, person.topColor, ellipsePath(0, -47, 15, 6))
    drawBottom(partContext, person, build)
    drawTop(partContext, person, build)
    drawFolkWaist(partContext, person, build)
  })
  withHeadTilt(() => {
    const drawHeadFront = (partContext: Context) => {
      drawFace(partContext, person, pose.lookUp)
      drawHairFront(partContext, person)
      drawHeadwear(partContext, person)
    }
    if (pose.lookUp === 0 || pose.lookUp === 1) paintPart(`head ${pose.lookUp}`, HEAD_BOUNDS, drawHeadFront)
    else drawHeadFront(context)
  })
  drawArms(context, person, build, pose.hands)
  context.restore()
}
