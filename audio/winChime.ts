import { tone } from "@/audio/heroReveal"

const WIN_NOTES = [783.99, 987.77, 1174.66, 1567.98]
const NOTE_GAP = 0.07

export const createWinChime = () => {
  let audio: AudioContext | null = null

  const play = () => {
    try {
      const ready = (audio ??= new AudioContext())
      void ready.resume()
      const now = ready.currentTime
      WIN_NOTES.forEach((frequency, index) => {
        const isLast = index === WIN_NOTES.length - 1
        tone(ready, frequency, now + index * NOTE_GAP, isLast ? 0.35 : 0.12, "triangle", 0.08)
        if (isLast) tone(ready, frequency * 2, now + index * NOTE_GAP, 0.25, "sine", 0.03)
      })
    } catch {
      return
    }
  }

  const stop = () => {
    if (audio === null) return
    void audio.close()
    audio = null
  }

  return { play, stop }
}
