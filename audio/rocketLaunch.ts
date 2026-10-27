const ENGINE_SRC = "/launch/rocket-engine.wav"
const MAX_VOLUME = 0.65

const rewind = (clip: HTMLAudioElement) => {
  try {
    if (clip.currentTime > 0) clip.currentTime = 0
  } catch {
    return false
  }
  return true
}

const clampToUnit = (amount: number) => Math.min(1, Math.max(0, amount))

export const createRocketLaunch = (ignitionAt: number, liftoffAt: number, fadeStart: number, fadeEnd: number) => {
  const engine = new Audio(ENGINE_SRC)
  engine.preload = "auto"
  engine.loop = true
  engine.volume = 0
  engine.preservesPitch = false
  let isRoaring = false

  const silence = () => {
    isRoaring = false
    if (engine.paused && engine.currentTime === 0) return
    engine.pause()
    rewind(engine)
  }

  const sync = (launchSeconds: number | null) => {
    if (launchSeconds === null || launchSeconds < ignitionAt || launchSeconds >= fadeEnd) {
      silence()
      return
    }
    const buildUp = clampToUnit((launchSeconds - ignitionAt) / (liftoffAt - ignitionAt))
    const blast = clampToUnit((launchSeconds - liftoffAt) / 0.6)
    const fade = 1 - clampToUnit((launchSeconds - fadeStart) / (fadeEnd - fadeStart))
    engine.volume = MAX_VOLUME * (0.35 + buildUp * 0.35 + blast * 0.3) * fade
    engine.playbackRate = 0.6 + buildUp * 0.15 + blast * 0.25
    if (isRoaring) return
    isRoaring = true
    rewind(engine)
    void engine.play().catch(() => {})
  }

  return { sync, stop: silence }
}
