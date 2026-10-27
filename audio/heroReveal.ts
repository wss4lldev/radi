const HERO_NOTES = [146.83, 220, 293.66, 349.23, 440]
const UNICORN_NOTES = [523.25, 659.25, 783.99, 1046.5, 1318.5]

const tone = (audio: AudioContext, frequency: number, start: number, duration: number, type: OscillatorType, level: number) => {
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(frequency, start)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(level, start + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(gain)
  gain.connect(audio.destination)
  osc.start(start)
  osc.stop(start + duration + 0.02)
}

export const createHeroReveal = (revealAt: number) => {
  let audio: AudioContext | null = null
  let played = false

  const context = () => {
    audio ??= new AudioContext()
    return audio
  }

  const prime = () => {
    const ready = context()
    void ready.resume()
  }

  const playHero = () => {
    const ready = context()
    const now = ready.currentTime
    HERO_NOTES.forEach((frequency, index) => {
      const start = now + index * 0.13
      tone(ready, frequency, start, 0.2, "square", 0.07)
      tone(ready, frequency / 2, start, 0.22, "triangle", 0.05)
    })
  }

  const playUnicorn = () => {
    const ready = context()
    const now = ready.currentTime
    UNICORN_NOTES.forEach((frequency, index) => {
      const start = now + index * 0.08
      tone(ready, frequency, start, 0.26, "sine", 0.06)
      tone(ready, frequency * 2.01, start, 0.14, "triangle", 0.025)
    })
  }

  const sync = (exitSeconds: number | null, hero: "batman" | "unicorn" | null) => {
    if (exitSeconds === null || hero === null) {
      played = false
      return
    }
    if (played || exitSeconds < revealAt) return
    played = true
    try {
      if (hero === "batman") playHero()
      else playUnicorn()
    } catch {
      return
    }
  }

  const stop = () => {
    played = false
    if (audio === null) return
    void audio.close()
    audio = null
  }

  return { prime, sync, stop }
}
