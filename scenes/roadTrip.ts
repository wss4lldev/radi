import { ellipsePath, linePath, paintFill, paintLine, paintShape, type BuildPath, type Context } from "@/characters/paint"
import { OUTLINE } from "@/characters/radi"
import { clampToUnit } from "@/scenes/openingScene"

type DrawFar = (context: Context, width: number, height: number, horizonY: number, offset: number) => void
type DrawProp = (context: Context, x: number, groundY: number, size: number, index: number) => void

type Biome = {
  start: number
  skyTop: string
  skyBottom: string
  backGround: string
  frontGround: string
  pebble: string
  drawFar?: DrawFar
  drawProp?: DrawProp
  propSpacing?: number
}

const FAR_PARALLAX = 0.3
const FRONT_PARALLAX = 1.25
const GROUND_BLEND = 0.06
const PROP_GROUND = 0.595
const PEBBLE_SPACING = 0.07

const paintTubes = (context: Context, color: string, thickness: number, paths: BuildPath[]) => {
  for (const path of paths) paintLine(context, OUTLINE, thickness + 5, path)
  for (const path of paths) paintLine(context, color, thickness, path)
}

const hillBandPath = (width: number, baseY: number, offset: number, rise: number, amplitude: number, waveLength: number): BuildPath => (path) => {
  path.moveTo(-4, baseY + 4)
  for (let x = -4; x <= width + 8; x += 8) {
    const wave = Math.sin((x + offset) / waveLength) + 0.5 * Math.sin((x + offset) / (waveLength * 0.43) + 1)
    path.lineTo(x, baseY - rise - amplitude * wave)
  }
  path.lineTo(width + 8, baseY + 4)
  path.closePath()
}

const repeatAcross = (width: number, offset: number, period: number, drawAt: (x: number, index: number) => void) => {
  const firstIndex = Math.floor(offset / period) - 1
  for (let index = firstIndex; index * period - offset < width + period; index += 1) drawAt(index * period - offset, ((index % 3) + 3) % 3)
}

const drawFieldsFar: DrawFar = (context, width, height, horizonY, offset) => {
  paintShape(context, "#a6dc7c", hillBandPath(width, horizonY, offset * 0.6, height * 0.09, height * 0.025, width * 0.09))
  paintShape(context, "#8fd16a", hillBandPath(width, horizonY, offset, height * 0.04, height * 0.02, width * 0.06))
}

const drawMountainsFar: DrawFar = (context, width, height, horizonY, offset) => {
  repeatAcross(width, offset, width * 0.3, (peakX, variant) => {
    const peakHeight = height * (0.18 + variant * 0.05)
    const halfWidth = width * 0.22
    const peakY = horizonY - peakHeight
    paintShape(context, variant === 1 ? "#9a8fc8" : "#8a7fb8", (path) => {
      path.moveTo(peakX - halfWidth, horizonY + 4)
      path.lineTo(peakX, peakY)
      path.lineTo(peakX + halfWidth, horizonY + 4)
      path.closePath()
    })
    const capDrop = peakHeight * 0.28
    const capWidth = (halfWidth * capDrop) / (peakHeight + 4)
    paintShape(context, "#ffffff", (path) => {
      path.moveTo(peakX, peakY)
      path.lineTo(peakX + capWidth, peakY + capDrop)
      path.lineTo(peakX + capWidth * 0.4, peakY + capDrop * 0.75)
      path.lineTo(peakX, peakY + capDrop)
      path.lineTo(peakX - capWidth * 0.4, peakY + capDrop * 0.75)
      path.lineTo(peakX - capWidth, peakY + capDrop)
      path.closePath()
    })
  })
  paintShape(context, "#7fbf6a", hillBandPath(width, horizonY, offset * 1.4, height * 0.025, height * 0.012, width * 0.05))
}

const drawDesertFar: DrawFar = (context, width, height, horizonY, offset) => {
  repeatAcross(width, offset, width * 0.42, (mesaX, variant) => {
    const mesaHeight = height * (0.08 + variant * 0.03)
    const topHalf = width * (0.05 + variant * 0.02)
    paintShape(context, "#e07a45", (path) => {
      path.moveTo(mesaX - topHalf - height * 0.06, horizonY + 4)
      path.lineTo(mesaX - topHalf, horizonY - mesaHeight)
      path.lineTo(mesaX + topHalf, horizonY - mesaHeight)
      path.lineTo(mesaX + topHalf + height * 0.06, horizonY + 4)
      path.closePath()
    }, {
      decorateInside: (mesaContext) => paintFill(mesaContext, "rgba(150, 50, 20, 0.25)", (path) => path.rect(mesaX - width * 0.2, horizonY - mesaHeight * 0.55, width * 0.4, mesaHeight * 0.15)),
    })
  })
  paintShape(context, "#f5c26b", hillBandPath(width, horizonY, offset * 1.3, height * 0.02, height * 0.015, width * 0.08))
}

const drawBeachFar: DrawFar = (context, width, height, horizonY, offset) => {
  const seaTop = horizonY - height * 0.09
  paintShape(context, "#3db7e4", (path) => path.rect(-4, seaTop, width + 8, horizonY - seaTop + 4))
  repeatAcross(width, offset * 1.5, width * 0.12, (waveX, variant) => {
    const waveY = seaTop + height * (0.025 + variant * 0.02)
    paintLine(context, "rgba(255, 255, 255, 0.8)", 2.5, (path) => {
      path.moveTo(waveX, waveY)
      path.quadraticCurveTo(waveX + width * 0.015, waveY - height * 0.01, waveX + width * 0.03, waveY)
    })
  })
  repeatAcross(width, offset * 0.5, width * 0.8, (boatX) => {
    const waterY = seaTop + height * 0.02
    paintShape(context, "#ffffff", (path) => {
      path.moveTo(boatX, waterY - height * 0.075)
      path.lineTo(boatX + width * 0.025, waterY - height * 0.012)
      path.lineTo(boatX, waterY - height * 0.012)
      path.closePath()
    })
    paintShape(context, "#e8262e", (path) => {
      path.moveTo(boatX - width * 0.025, waterY - height * 0.012)
      path.lineTo(boatX + width * 0.035, waterY - height * 0.012)
      path.lineTo(boatX + width * 0.025, waterY)
      path.lineTo(boatX - width * 0.018, waterY)
      path.closePath()
    })
  })
}

const drawCandyFar: DrawFar = (context, width, height, horizonY, offset) => {
  paintShape(context, "#ff9ed2", hillBandPath(width, horizonY, offset, height * 0.06, height * 0.025, width * 0.07))
  paintShape(context, "#ffc4e1", hillBandPath(width, horizonY, offset * 1.5, height * 0.025, height * 0.015, width * 0.05))
}

const drawFieldsProp: DrawProp = (context, x, groundY, size, index) => {
  if (index % 2 === 0) {
    const radius = size * 0.28
    paintShape(context, "#f2c94c", ellipsePath(x, groundY - radius, radius * 1.1, radius), {
      decorateInside: (baleContext) => paintLine(baleContext, "#c99a2e", 2, (path) => {
        path.arc(x, groundY - radius, radius * 0.6, 0, Math.PI * 1.6)
        path.moveTo(x + radius * 0.3, groundY - radius)
        path.arc(x, groundY - radius, radius * 0.3, 0, Math.PI * 1.6)
      }),
    })
    return
  }
  const flowerY = groundY - size * 0.85
  paintTubes(context, "#3e8e41", size * 0.05, [linePath(x, groundY, x, flowerY)])
  paintShape(context, "#3e8e41", (path) => path.ellipse(x + size * 0.09, groundY - size * 0.35, size * 0.1, size * 0.04, -0.5, 0, Math.PI * 2))
  for (let petal = 0; petal < 8; petal += 1) {
    const angle = (petal * Math.PI) / 4
    paintShape(context, "#ffd23a", ellipsePath(x + Math.cos(angle) * size * 0.11, flowerY + Math.sin(angle) * size * 0.11, size * 0.07, size * 0.07))
  }
  paintShape(context, "#7a4a1e", ellipsePath(x, flowerY, size * 0.09, size * 0.09))
}

const drawPineProp: DrawProp = (context, x, groundY, size) => {
  paintShape(context, "#8a5a32", (path) => path.roundRect(x - size * 0.05, groundY - size * 0.25, size * 0.1, size * 0.25, 2))
  for (let level = 0; level < 3; level += 1) {
    const baseY = groundY - size * (0.2 + level * 0.25)
    const halfWidth = size * (0.32 - level * 0.07)
    paintShape(context, "#2f8f5b", (path) => {
      path.moveTo(x - halfWidth, baseY)
      path.lineTo(x, baseY - size * 0.42)
      path.lineTo(x + halfWidth, baseY)
      path.closePath()
    })
  }
}

const drawCactusProp: DrawProp = (context, x, groundY, size, index) => {
  if (index % 3 === 2) {
    paintShape(context, "#c7834a", (path) => path.ellipse(x, groundY, size * 0.22, size * 0.14, 0, Math.PI, Math.PI * 2))
    return
  }
  paintTubes(context, "#4caf50", size * 0.16, [
    linePath(x, groundY, x, groundY - size * 0.85),
    (path) => {
      path.moveTo(x, groundY - size * 0.38)
      path.quadraticCurveTo(x - size * 0.24, groundY - size * 0.38, x - size * 0.24, groundY - size * 0.62)
    },
    (path) => {
      path.moveTo(x, groundY - size * 0.52)
      path.quadraticCurveTo(x + size * 0.22, groundY - size * 0.52, x + size * 0.22, groundY - size * 0.74)
    },
  ])
}

const drawPalmProp: DrawProp = (context, x, groundY, size) => {
  const topX = x + size * 0.18
  const topY = groundY - size * 0.95
  paintTubes(context, "#a8743f", size * 0.09, [(path) => {
    path.moveTo(x, groundY)
    path.quadraticCurveTo(x, groundY - size * 0.6, topX, topY)
  }])
  for (const angle of [-2.8, -2.1, -1.4, -0.7, 0]) {
    paintShape(context, "#3fae4f", (path) => path.ellipse(topX + Math.cos(angle) * size * 0.24, topY + Math.sin(angle) * size * 0.1 + size * 0.05, size * 0.27, size * 0.07, angle, 0, Math.PI * 2))
  }
  for (const nutX of [-0.04, 0.04]) paintShape(context, "#7a4a1e", ellipsePath(topX + nutX * size, topY + size * 0.07, size * 0.045, size * 0.045))
}

const drawCandyProp: DrawProp = (context, x, groundY, size, index) => {
  const stickTop = groundY - size * 0.6
  paintTubes(context, "#ffffff", size * 0.05, [linePath(x, groundY, x, stickTop)])
  if (index % 2 === 0) {
    const radius = size * 0.2
    paintShape(context, "#ff5fa2", ellipsePath(x, stickTop - radius * 0.8, radius, radius), {
      decorateInside: (candyContext) => paintLine(candyContext, "#ffffff", size * 0.035, (path) => {
        path.arc(x, stickTop - radius * 0.8, radius * 0.6, 0, Math.PI * 1.5)
        path.moveTo(x + radius * 0.25, stickTop - radius * 0.8)
        path.arc(x, stickTop - radius * 0.8, radius * 0.25, 0, Math.PI * 1.5)
      }),
    })
    return
  }
  const fluff: BuildPath = (path) => {
    for (const [offsetX, offsetY, radius] of [[-0.14, 0, 0.17], [0.14, 0, 0.17], [0, -0.14, 0.2]]) {
      path.moveTo(x + (offsetX + radius) * size, stickTop + (offsetY - 0.1) * size)
      path.ellipse(x + offsetX * size, stickTop + (offsetY - 0.1) * size, radius * size, radius * size, 0, 0, Math.PI * 2)
    }
  }
  paintLine(context, OUTLINE, 5, fluff)
  paintFill(context, "#ffb3de", fluff)
}

const drawWinterFar: DrawFar = (context, width, height, horizonY, offset) => {
  paintShape(context, "#e3eefa", hillBandPath(width, horizonY, offset * 0.6, height * 0.1, height * 0.03, width * 0.1))
  paintShape(context, "#ffffff", hillBandPath(width, horizonY, offset, height * 0.045, height * 0.02, width * 0.06))
}

const drawWinterProp: DrawProp = (context, x, groundY, size, index) => {
  if (index % 2 === 1) {
    drawPineProp(context, x, groundY, size, index)
    for (let level = 0; level < 3; level += 1) {
      const tipY = groundY - size * (0.62 + level * 0.25)
      paintShape(context, "#ffffff", (path) => {
        path.moveTo(x, tipY)
        path.lineTo(x + size * 0.09, tipY + size * 0.12)
        path.lineTo(x - size * 0.09, tipY + size * 0.12)
        path.closePath()
      })
    }
    return
  }
  for (const [ballY, radius] of [[0.2, 0.2], [0.5, 0.15], [0.73, 0.11]]) paintShape(context, "#ffffff", ellipsePath(x, groundY - size * ballY, size * radius, size * radius))
  paintShape(context, "#ff8c1a", (path) => {
    path.moveTo(x + size * 0.04, groundY - size * 0.74)
    path.lineTo(x + size * 0.17, groundY - size * 0.72)
    path.lineTo(x + size * 0.04, groundY - size * 0.7)
    path.closePath()
  })
  for (const eyeX of [-0.04, 0.03]) paintFill(context, OUTLINE, ellipsePath(x + eyeX * size, groundY - size * 0.77, size * 0.015, size * 0.015))
  paintShape(context, "#1d1d1d", (path) => path.rect(x - size * 0.12, groundY - size * 0.85, size * 0.24, size * 0.03))
  paintShape(context, "#1d1d1d", (path) => path.rect(x - size * 0.07, groundY - size * 0.98, size * 0.14, size * 0.13))
  paintShape(context, "#e8262e", (path) => path.rect(x - size * 0.13, groundY - size * 0.63, size * 0.26, size * 0.04))
}

const drawVolcanoFar: DrawFar = (context, width, height, horizonY, offset) => {
  repeatAcross(width, offset, width * 0.9, (volcanoX) => {
    const topY = horizonY - height * 0.22
    const craterHalf = width * 0.035
    for (const [puffX, puffY, radius] of [[0, 0.05, 0.03], [0.02, 0.1, 0.04], [-0.01, 0.16, 0.05]]) {
      paintShape(context, "rgba(120, 110, 110, 0.85)", ellipsePath(volcanoX + puffX * width, topY - puffY * height, radius * height, radius * height))
    }
    paintShape(context, "#6b4a3a", (path) => {
      path.moveTo(volcanoX - width * 0.2, horizonY + 4)
      path.lineTo(volcanoX - craterHalf, topY)
      path.lineTo(volcanoX + craterHalf, topY)
      path.lineTo(volcanoX + width * 0.2, horizonY + 4)
      path.closePath()
    }, {
      decorateInside: (volcanoContext) => {
        paintFill(volcanoContext, "#ff6a1a", (path) => path.rect(volcanoX - craterHalf, topY - 2, craterHalf * 2, height * 0.012))
        paintLine(volcanoContext, "#ff8c1a", height * 0.012, (path) => {
          path.moveTo(volcanoX - craterHalf * 0.4, topY)
          path.quadraticCurveTo(volcanoX - width * 0.03, topY + height * 0.06, volcanoX - width * 0.06, topY + height * 0.13)
          path.moveTo(volcanoX + craterHalf * 0.5, topY)
          path.quadraticCurveTo(volcanoX + width * 0.02, topY + height * 0.05, volcanoX + width * 0.05, topY + height * 0.1)
        })
      },
    })
  })
  paintShape(context, "#5a3d30", hillBandPath(width, horizonY, offset * 1.4, height * 0.025, height * 0.012, width * 0.05))
}

const drawVolcanoProp: DrawProp = (context, x, groundY, size, index) => {
  if (index % 3 === 1) {
    paintShape(context, "#4a332a", (path) => path.ellipse(x, groundY, size * 0.2, size * 0.1, 0, Math.PI, Math.PI * 2))
    for (const [puffX, puffY, radius] of [[0, 0.2, 0.07], [0.04, 0.34, 0.09], [-0.02, 0.5, 0.1]]) {
      paintShape(context, "rgba(230, 230, 230, 0.9)", ellipsePath(x + puffX * size, groundY - puffY * size, radius * size, radius * size))
    }
    return
  }
  paintShape(context, "#3d2b25", (path) => path.ellipse(x, groundY, size * 0.28, size * 0.22, 0, Math.PI, Math.PI * 2), {
    decorateInside: (rockContext) => paintLine(rockContext, "#ff7a1a", size * 0.03, (path) => {
      path.moveTo(x - size * 0.15, groundY - size * 0.04)
      path.lineTo(x - size * 0.04, groundY - size * 0.12)
      path.lineTo(x + size * 0.02, groundY - size * 0.06)
      path.lineTo(x + size * 0.14, groundY - size * 0.15)
    }),
  })
}

const drawTulipFar: DrawFar = (context, width, height, horizonY, offset) => {
  paintShape(context, "#9bd67a", hillBandPath(width, horizonY, offset * 0.6, height * 0.04, height * 0.012, width * 0.12))
  repeatAcross(width, offset, width * 0.5, (millX, variant) => {
    const towerHeight = height * 0.14
    const hubY = horizonY - towerHeight
    paintShape(context, "#f4efe6", (path) => {
      path.moveTo(millX - width * 0.025, horizonY + 2)
      path.lineTo(millX - width * 0.014, hubY)
      path.lineTo(millX + width * 0.014, hubY)
      path.lineTo(millX + width * 0.025, horizonY + 2)
      path.closePath()
    })
    paintShape(context, "#c0392b", (path) => {
      path.moveTo(millX - width * 0.02, hubY + 2)
      path.lineTo(millX, hubY - height * 0.03)
      path.lineTo(millX + width * 0.02, hubY + 2)
      path.closePath()
    })
    const bladeLength = height * 0.09
    for (let blade = 0; blade < 4; blade += 1) {
      const angle = variant * 0.4 + (blade * Math.PI) / 2
      paintLine(context, OUTLINE, 3, linePath(millX, hubY, millX + Math.cos(angle) * bladeLength, hubY + Math.sin(angle) * bladeLength))
    }
    paintShape(context, OUTLINE, ellipsePath(millX, hubY, 3, 3))
  })
}

const TULIP_COLORS = ["#ff4d6d", "#ffd23a", "#ff8fc7"]

const drawTulipProp: DrawProp = (context, x, groundY, size, index) => {
  for (const [offsetX, stemHeight, colorShift] of [[-0.1, 0.4, 0], [0, 0.5, 1], [0.1, 0.38, 2]]) {
    const flowerX = x + offsetX * size
    const flowerY = groundY - stemHeight * size
    paintTubes(context, "#3e8e41", size * 0.03, [linePath(flowerX, groundY, flowerX, flowerY)])
    paintShape(context, TULIP_COLORS[(index + colorShift) % TULIP_COLORS.length], (path) => {
      path.moveTo(flowerX - size * 0.05, flowerY - size * 0.1)
      path.lineTo(flowerX - size * 0.025, flowerY - size * 0.06)
      path.lineTo(flowerX, flowerY - size * 0.1)
      path.lineTo(flowerX + size * 0.025, flowerY - size * 0.06)
      path.lineTo(flowerX + size * 0.05, flowerY - size * 0.1)
      path.quadraticCurveTo(flowerX + size * 0.05, flowerY, flowerX, flowerY)
      path.quadraticCurveTo(flowerX - size * 0.05, flowerY, flowerX - size * 0.05, flowerY - size * 0.1)
      path.closePath()
    })
  }
}

const drawBlossomFar: DrawFar = (context, width, height, horizonY, offset) => {
  repeatAcross(width, offset * 0.6, width * 1.6, (peakX) => {
    const peakY = horizonY - height * 0.24
    const halfWidth = width * 0.3
    const capY = peakY + height * 0.07
    paintShape(context, "#7f9cc9", (path) => {
      path.moveTo(peakX - halfWidth, horizonY + 4)
      path.quadraticCurveTo(peakX - width * 0.08, peakY + height * 0.03, peakX - width * 0.035, peakY)
      path.lineTo(peakX + width * 0.035, peakY)
      path.quadraticCurveTo(peakX + width * 0.08, peakY + height * 0.03, peakX + halfWidth, horizonY + 4)
      path.closePath()
    }, {
      decorateInside: (mountainContext) => paintFill(mountainContext, "#ffffff", (path) => {
        path.moveTo(peakX - width * 0.12, peakY)
        path.lineTo(peakX + width * 0.12, peakY)
        path.lineTo(peakX + width * 0.12, capY)
        for (let wave = 4; wave >= 0; wave -= 1) path.quadraticCurveTo(peakX + width * (wave * 0.024 - 0.048), capY + height * 0.025, peakX + width * (wave * 0.024 - 0.06), capY)
        path.lineTo(peakX - width * 0.12, capY)
        path.closePath()
      }),
    })
  })
  paintShape(context, "#f7b6cf", hillBandPath(width, horizonY, offset, height * 0.03, height * 0.015, width * 0.06))
}

const drawBlossomProp: DrawProp = (context, x, groundY, size, index) => {
  if (index % 3 === 2) {
    for (const postX of [-0.2, 0.2]) paintShape(context, "#e8262e", (path) => path.rect(x + postX * size - size * 0.03, groundY - size * 0.7, size * 0.06, size * 0.7))
    paintShape(context, "#e8262e", (path) => path.rect(x - size * 0.28, groundY - size * 0.6, size * 0.56, size * 0.05))
    paintShape(context, "#1d1d1d", (path) => {
      path.moveTo(x - size * 0.34, groundY - size * 0.8)
      path.quadraticCurveTo(x, groundY - size * 0.72, x + size * 0.34, groundY - size * 0.8)
      path.lineTo(x + size * 0.3, groundY - size * 0.72)
      path.quadraticCurveTo(x, groundY - size * 0.66, x - size * 0.3, groundY - size * 0.72)
      path.closePath()
    })
    return
  }
  paintTubes(context, "#7a4a2e", size * 0.07, [
    linePath(x, groundY, x, groundY - size * 0.55),
    linePath(x, groundY - size * 0.4, x - size * 0.16, groundY - size * 0.6),
    linePath(x, groundY - size * 0.45, x + size * 0.15, groundY - size * 0.62),
  ])
  const crown: BuildPath = (path) => {
    for (const [offsetX, offsetY, radius] of [[-0.18, 0.65, 0.17], [0.18, 0.66, 0.17], [0, 0.78, 0.2], [-0.05, 0.6, 0.15]]) {
      path.moveTo(x + (offsetX + radius) * size, groundY - offsetY * size)
      path.ellipse(x + offsetX * size, groundY - offsetY * size, radius * size, radius * size, 0, 0, Math.PI * 2)
    }
  }
  paintLine(context, OUTLINE, 5, crown)
  paintFill(context, "#ffc0d9", crown)
  for (const [petalX, petalY] of [[-0.2, 0.7], [0.1, 0.85], [0.22, 0.62], [-0.05, 0.6]]) paintFill(context, "#ff7fae", ellipsePath(x + petalX * size, groundY - petalY * size, size * 0.025, size * 0.025))
}

const drawMushroomFar: DrawFar = (context, width, height, horizonY, offset) => {
  paintShape(context, "#b79cf0", hillBandPath(width, horizonY, offset * 0.6, height * 0.09, height * 0.03, width * 0.08))
  paintShape(context, "#9b7fd1", hillBandPath(width, horizonY, offset, height * 0.04, height * 0.02, width * 0.055))
}

const drawMushroomProp: DrawProp = (context, x, groundY, size, index) => {
  const capColor = index % 2 === 0 ? "#e8262e" : "#3d8bfd"
  const capY = groundY - size * 0.55
  paintShape(context, "#fff3dc", (path) => path.roundRect(x - size * 0.08, capY, size * 0.16, size * 0.55, size * 0.05))
  paintShape(context, capColor, (path) => {
    path.moveTo(x - size * 0.32, capY + size * 0.03)
    path.quadraticCurveTo(x - size * 0.3, capY - size * 0.32, x, capY - size * 0.32)
    path.quadraticCurveTo(x + size * 0.3, capY - size * 0.32, x + size * 0.32, capY + size * 0.03)
    path.closePath()
  }, {
    decorateInside: (capContext) => {
      for (const [spotX, spotY, radius] of [[-0.16, 0.08, 0.05], [0.04, 0.2, 0.06], [0.18, 0.06, 0.04]]) {
        paintFill(capContext, "#ffffff", ellipsePath(x + spotX * size, capY - spotY * size, radius * size, radius * size))
      }
    },
  })
}

const BIOMES: Biome[] = [
  { start: 0, skyTop: "#3fa9f5", skyBottom: "#bfe6ff", backGround: "#efe9df", frontGround: "#efe9df", pebble: "rgba(43, 29, 26, 0.18)" },
  { start: 1, skyTop: "#4fb6f7", skyBottom: "#d6f1ff", backGround: "#7ccf5a", frontGround: "#6cc04c", pebble: "#4e9e36", drawFar: drawFieldsFar, drawProp: drawFieldsProp, propSpacing: 0.16 },
  { start: 3, skyTop: "#5a9fe0", skyBottom: "#cfe3f7", backGround: "#6fae5d", frontGround: "#5f9f4f", pebble: "#8a8a8a", drawFar: drawMountainsFar, drawProp: drawPineProp, propSpacing: 0.14 },
  { start: 5, skyTop: "#ff9f5a", skyBottom: "#ffe3a3", backGround: "#f2c46d", frontGround: "#eab45a", pebble: "#c98e3c", drawFar: drawDesertFar, drawProp: drawCactusProp, propSpacing: 0.2 },
  { start: 7, skyTop: "#2fb8ff", skyBottom: "#b8f0ff", backGround: "#f7dc9a", frontGround: "#f3d184", pebble: "#ffffff", drawFar: drawBeachFar, drawProp: drawPalmProp, propSpacing: 0.3 },
  { start: 9, skyTop: "#8fb8de", skyBottom: "#eef6ff", backGround: "#f4f8ff", frontGround: "#e6eefa", pebble: "#b8c8dc", drawFar: drawWinterFar, drawProp: drawWinterProp, propSpacing: 0.17 },
  { start: 11, skyTop: "#e8705a", skyBottom: "#ffc9a0", backGround: "#7a5a4a", frontGround: "#6a4c3e", pebble: "#ff7a1a", drawFar: drawVolcanoFar, drawProp: drawVolcanoProp, propSpacing: 0.18 },
  { start: 13, skyTop: "#5cb8f5", skyBottom: "#dff3ff", backGround: "#7cc95a", frontGround: "#6cbb4c", pebble: "#ff4d6d", drawFar: drawTulipFar, drawProp: drawTulipProp, propSpacing: 0.1 },
  { start: 15, skyTop: "#9fc4f0", skyBottom: "#ffe6f0", backGround: "#a8d98a", frontGround: "#98cc78", pebble: "#ff9cc2", drawFar: drawBlossomFar, drawProp: drawBlossomProp, propSpacing: 0.22 },
  { start: 17, skyTop: "#6f5bd6", skyBottom: "#e2d4ff", backGround: "#8fcf6a", frontGround: "#7fc05a", pebble: "#fff3dc", drawFar: drawMushroomFar, drawProp: drawMushroomProp, propSpacing: 0.2 },
  { start: 19, skyTop: "#c58cff", skyBottom: "#ffd1ec", backGround: "#ffc4e1", frontGround: "#ffb0d6", pebble: "#ffffff", drawFar: drawCandyFar, drawProp: drawCandyProp, propSpacing: 0.18 },
]

const biomeIndexAt = (worldWidths: number) => BIOMES.reduce((found, biome, index) => (worldWidths >= biome.start ? index : found), 0)

const biomeBlend = (width: number, camera: number) => {
  const centerWidths = (camera + width / 2) / width
  const index = biomeIndexAt(centerWidths)
  const nextBiome = BIOMES[index + 1]
  return { biome: BIOMES[index], nextBiome, blend: nextBiome ? clampToUnit(centerWidths - (nextBiome.start - 1)) : 0 }
}

const groundGradient = (context: Context, width: number, camera: number, pickColor: (biome: Biome) => string) => {
  const gradient = context.createLinearGradient(0, 0, width, 0)
  BIOMES.forEach((biome, index) => {
    const nextStart = BIOMES[index + 1]?.start ?? Infinity
    gradient.addColorStop(clampToUnit((biome.start * width - camera) / width + GROUND_BLEND), pickColor(biome))
    gradient.addColorStop(clampToUnit((nextStart * width - camera) / width - GROUND_BLEND), pickColor(biome))
  })
  return gradient
}

const paintSky = (context: Context, width: number, height: number, horizonY: number, biome: Biome) => {
  const sky = context.createLinearGradient(0, 0, 0, horizonY)
  sky.addColorStop(0, biome.skyTop)
  sky.addColorStop(1, biome.skyBottom)
  context.fillStyle = sky
  context.fillRect(0, 0, width, height)
}

export const drawScenerySky = (context: Context, width: number, height: number, horizonY: number, camera: number) => {
  const { biome, nextBiome, blend } = biomeBlend(width, camera)
  paintSky(context, width, height, horizonY, biome)
  if (!nextBiome || blend <= 0) return
  context.globalAlpha = blend
  paintSky(context, width, height, horizonY, nextBiome)
  context.globalAlpha = 1
}

export const drawSceneryBack = (context: Context, width: number, height: number, horizonY: number, roadTopY: number, camera: number) => {
  const { biome, nextBiome, blend } = biomeBlend(width, camera)
  context.save()
  context.lineWidth = 3
  context.globalAlpha = 1 - blend
  biome.drawFar?.(context, width, height, horizonY, camera * FAR_PARALLAX)
  if (nextBiome && blend > 0) {
    context.globalAlpha = blend
    nextBiome.drawFar?.(context, width, height, horizonY, camera * FAR_PARALLAX)
  }
  context.globalAlpha = 1
  paintShape(context, groundGradient(context, width, camera, ({ backGround }) => backGround), (path) => path.rect(-4, horizonY, width + 8, roadTopY - horizonY))
  BIOMES.forEach(({ start, drawProp, propSpacing }, biomeIndex) => {
    if (!drawProp || !propSpacing) return
    const startX = start * width - camera
    const endX = (BIOMES[biomeIndex + 1]?.start ?? Infinity) * width - camera
    const spacing = propSpacing * width
    const firstIndex = Math.max(0, Math.floor((-width * 0.2 - startX) / spacing))
    for (let propIndex = firstIndex; ; propIndex += 1) {
      const propX = startX + (propIndex + 0.5) * spacing
      if (propX > Math.min(endX, width * 1.2)) break
      drawProp(context, propX, height * PROP_GROUND, height * 0.15 * (0.85 + 0.075 * ((propIndex * 37) % 5)), propIndex)
    }
  })
  context.restore()
}

export const drawSceneryFront = (context: Context, width: number, height: number, roadBottomY: number, camera: number) => {
  context.save()
  context.lineWidth = 3
  paintShape(context, groundGradient(context, width, camera, ({ frontGround }) => frontGround), (path) => path.rect(-4, roadBottomY, width + 8, height - roadBottomY + 4))
  const frontCamera = camera * FRONT_PARALLAX
  const spacing = width * PEBBLE_SPACING
  for (let pebbleIndex = Math.floor(frontCamera / spacing); pebbleIndex * spacing - frontCamera < width + spacing; pebbleIndex += 1) {
    const pebbleX = pebbleIndex * spacing - frontCamera
    const pebbleColor = BIOMES[biomeIndexAt((pebbleX + camera) / width)].pebble
    const pebbleY = roadBottomY + (height - roadBottomY) * (0.3 + 0.15 * (((pebbleIndex * 7) % 4) + ((pebbleIndex * 3) % 2)))
    paintFill(context, pebbleColor, ellipsePath(pebbleX, pebbleY, height * 0.012, height * 0.006))
  }
  context.restore()
}
