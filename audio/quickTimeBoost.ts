const BOOST_SRC = "/launch/rocket-engine.wav"
const MAX_VOLUME = 0.8

const rewind = (clip: HTMLAudioElement) => {
  try {
    if (clip.currentTime > 0) clip.currentTime = 0
  } catch {
    return false
  }
  return true
}

export const createQuickTimeBoost = () => {
  const booster = new Audio(BOOST_SRC)
  booster.preload = "auto"
  booster.loop = true
  booster.volume = 0
  booster.preservesPitch = false
  let isBoosting = false

  const silence = () => {
    isBoosting = false
    if (booster.paused && booster.currentTime === 0) return
    booster.pause()
    rewind(booster)
  }

  const sync = (boost: number) => {
    if (boost <= 0) {
      silence()
      return
    }
    booster.volume = MAX_VOLUME * Math.min(1, boost)
    booster.playbackRate = 1.05 + boost * 0.35
    if (isBoosting) return
    isBoosting = true
    rewind(booster)
    void booster.play().catch(() => {})
  }

  return { sync, stop: silence }
}
