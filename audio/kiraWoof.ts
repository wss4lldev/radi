const WOOF_SRC = "/kira-woof.mp3"
const VOLUME = 0.85

const rewind = (clip: HTMLAudioElement) => {
  try {
    if (clip.currentTime > 0) clip.currentTime = 0
  } catch {
    return false
  }
  return true
}

export const createKiraWoof = () => {
  const clip = new Audio(WOOF_SRC)
  clip.preload = "auto"
  clip.volume = VOLUME
  let barked = false

  const play = () => {
    clip.volume = VOLUME
    if (!rewind(clip)) return
    void clip.play().catch(() => {})
  }

  const silence = () => {
    if (clip.paused && clip.currentTime === 0) return
    clip.pause()
    rewind(clip)
  }

  const sync = (kiraSeconds: number | null, woofAt: number) => {
    if (kiraSeconds === null || kiraSeconds < woofAt) {
      barked = false
      silence()
      return
    }
    if (barked) return
    barked = true
    play()
  }

  const stop = () => {
    barked = false
    silence()
  }

  return { sync, stop }
}
