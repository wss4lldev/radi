const REV_SRC = "/motorcycle-rev.mp3"
const VOLUME = 0.375
const RETRIGGER_MS = 150
const DRIVE_START = 2.5
const ENTRANCE_VOLUME = 1
const ENTRANCE_RATE = 0.75

const seekClip = (clip: HTMLAudioElement, seconds: number) => {
  try {
    if (Math.abs(clip.currentTime - seconds) > 0.02) clip.currentTime = seconds
  } catch {
    return false
  }
  return true
}

export const createEngineRev = () => {
  const drive = new Audio(REV_SRC)
  drive.preload = "auto"
  drive.volume = VOLUME
  let lastVroomAt = 0
  const entrance = new Audio(REV_SRC)
  entrance.preload = "auto"
  entrance.volume = ENTRANCE_VOLUME
  entrance.playbackRate = ENTRANCE_RATE
  let announced = false

  const stopDrive = () => {
    lastVroomAt = 0
    drive.pause()
    seekClip(drive, DRIVE_START)
  }

  const vroom = (boost: number) => {
    const now = performance.now()
    if (now - lastVroomAt < RETRIGGER_MS) return
    lastVroomAt = now
    drive.playbackRate = Math.min(1, 0.8 + boost * 0.05)
    drive.volume = VOLUME
    if (!seekClip(drive, DRIVE_START)) return
    void drive.play().catch(() => {})
  }

  const stopEntrance = () => {
    entrance.pause()
    seekClip(entrance, 0)
  }

  const arrive = () => {
    entrance.volume = ENTRANCE_VOLUME
    if (!seekClip(entrance, 0)) return
    void entrance.play().catch(() => {})
  }

  const syncEntrance = (anywaySeconds: number | null, enterAt: number) => {
    if (anywaySeconds === null || anywaySeconds < enterAt) {
      announced = false
      return
    }
    if (announced) return
    announced = true
    arrive()
  }

  const prime = () => {
    void entrance.play().then(() => {
      if (announced) return
      entrance.pause()
      seekClip(entrance, 0)
    }).catch(() => {})
  }

  const stop = () => {
    stopDrive()
    stopEntrance()
  }

  return { vroom, stop, prime, syncEntrance }
}
