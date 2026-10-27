const BREAKS = ["/crash/roof-break-1.ogg", "/crash/roof-break-2.ogg"]
const FALL_SRC = "/crash/falling.ogg"
const BREAK_VOLUME = 0.7
const FALL_VOLUME = 0.45

const rewind = (clip: HTMLAudioElement) => {
  try {
    if (clip.currentTime > 0) clip.currentTime = 0
  } catch {
    return false
  }
  return true
}

export const createLibraryCrash = (fallStart: number, fallEnd: number) => {
  const breaks = BREAKS.map((src) => {
    const clip = new Audio(src)
    clip.preload = "auto"
    clip.volume = BREAK_VOLUME
    return clip
  })
  const falling = new Audio(FALL_SRC)
  falling.preload = "auto"
  falling.volume = FALL_VOLUME
  falling.addEventListener("loadedmetadata", () => {
    falling.loop = falling.duration < fallEnd - fallStart
  })
  let broke = false
  let fallingNow = false

  const playBreaks = () => {
    breaks.forEach((clip, index) => {
      clip.volume = index === 0 ? BREAK_VOLUME : BREAK_VOLUME * 0.8
      clip.playbackRate = index === 0 ? 1 : 0.94
      if (!rewind(clip)) return
      void clip.play().catch(() => {})
    })
  }

  const startFall = () => {
    falling.volume = FALL_VOLUME
    rewind(falling)
    void falling.play().catch(() => {})
  }

  const stopFall = () => {
    fallingNow = false
    if (falling.paused && falling.currentTime === 0) return
    falling.pause()
    rewind(falling)
  }

  const sync = (sceneSeconds: number | null, breakSeconds: number) => {
    if (sceneSeconds === null) {
      broke = false
      stopFall()
      return
    }
    const inFall = sceneSeconds >= fallStart && sceneSeconds < fallEnd
    if (inFall && !fallingNow) {
      fallingNow = true
      startFall()
    }
    if (!inFall && fallingNow) stopFall()
    if (sceneSeconds < breakSeconds) {
      broke = false
      return
    }
    if (!broke && sceneSeconds < breakSeconds + 0.35) playBreaks()
    broke = true
  }

  const stop = () => {
    broke = false
    stopFall()
    breaks.forEach((clip) => {
      clip.pause()
      rewind(clip)
    })
  }

  return { sync, stop }
}
