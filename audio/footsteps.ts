const CLIPS = ["/footsteps/softstep000.ogg", "/footsteps/softstep001.ogg", "/footsteps/softstep002.ogg", "/footsteps/softstep003.ogg"]
const VOLUME = 0.425

export const createFootsteps = (rateScale = 1) => {
  const clips = CLIPS.map((src) => {
    const clip = new Audio(src)
    clip.preload = "auto"
    clip.volume = VOLUME
    return clip
  })
  let clipIndex = 0
  let landedStep: number | null = null

  const playStep = () => {
    const clip = clips[clipIndex % clips.length]
    const rate = (clipIndex % 2 === 0 ? 0.96 : 1.05) * rateScale
    clipIndex += 1
    clip.playbackRate = rate
    clip.volume = VOLUME
    try {
      if (clip.currentTime > 0) clip.currentTime = 0
    } catch {
      return
    }
    void clip.play().catch(() => {})
  }

  const sync = (steps: number | null) => {
    if (steps === null) {
      landedStep = null
      return
    }
    const landed = Math.floor(steps)
    if (landedStep === null) {
      landedStep = landed
      return
    }
    const crossedSteps = Math.abs(landed - landedStep)
    if (crossedSteps > 0) {
      const plays = Math.min(crossedSteps, 2)
      for (let index = 0; index < plays; index += 1) playStep()
    }
    landedStep = landed
  }

  const stop = () => {
    landedStep = null
    clips.forEach((clip) => clip.pause())
  }

  return { sync, stop }
}
