const CHIME_NOTES = [392, 523.25, 659.25, 783.99, 1046.5, 1567.98]
const WHOOSH_SECONDS = 1.1

const chime = (audio: AudioContext, frequency: number, start: number, duration: number, level: number) => {
  const osc = audio.createOscillator()
  const wobble = audio.createOscillator()
  const wobbleDepth = audio.createGain()
  const gain = audio.createGain()
  osc.type = "sine"
  osc.frequency.setValueAtTime(frequency, start)
  wobble.frequency.setValueAtTime(7, start)
  wobbleDepth.gain.setValueAtTime(frequency * 0.012, start)
  wobble.connect(wobbleDepth)
  wobbleDepth.connect(osc.frequency)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(level, start + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(gain)
  gain.connect(audio.destination)
  osc.start(start)
  wobble.start(start)
  osc.stop(start + duration + 0.02)
  wobble.stop(start + duration + 0.02)
}

const zap = (audio: AudioContext, start: number) => {
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.type = "sawtooth"
  osc.frequency.setValueAtTime(1800, start)
  osc.frequency.exponentialRampToValueAtTime(180, start + 0.35)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(0.05, start + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.36)
  osc.connect(gain)
  gain.connect(audio.destination)
  osc.start(start)
  osc.stop(start + 0.4)
}

const whoosh = (audio: AudioContext, start: number) => {
  const samples = Math.floor(audio.sampleRate * WHOOSH_SECONDS)
  const noise = audio.createBuffer(1, samples, audio.sampleRate)
  const channel = noise.getChannelData(0)
  for (let sample = 0; sample < samples; sample += 1) channel[sample] = Math.random() * 2 - 1
  const source = audio.createBufferSource()
  const filter = audio.createBiquadFilter()
  const gain = audio.createGain()
  source.buffer = noise
  filter.type = "bandpass"
  filter.Q.setValueAtTime(4, start)
  filter.frequency.setValueAtTime(300, start)
  filter.frequency.exponentialRampToValueAtTime(3200, start + WHOOSH_SECONDS)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(0.35, start + WHOOSH_SECONDS * 0.7)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + WHOOSH_SECONDS)
  source.connect(filter)
  filter.connect(gain)
  gain.connect(audio.destination)
  source.start(start)
}

export const createSpaceReveal = (whooshAt: number, revealAt: number) => {
  let audio: AudioContext | null = null
  let whooshed = false
  let revealed = false

  const context = () => {
    audio ??= new AudioContext()
    return audio
  }

  const prime = () => {
    void context().resume()
  }

  const playReveal = (ready: AudioContext) => {
    const now = ready.currentTime
    zap(ready, now)
    CHIME_NOTES.forEach((frequency, index) => {
      chime(ready, frequency, now + 0.05 + index * 0.06, 0.45, 0.06)
      chime(ready, frequency * 2.005, now + 0.05 + index * 0.06, 0.2, 0.02)
    })
    chime(ready, 2093, now + 0.45, 0.9, 0.035)
  }

  const sync = (wishSeconds: number | null) => {
    if (wishSeconds === null) {
      whooshed = false
      revealed = false
      return
    }
    try {
      if (!whooshed && wishSeconds >= whooshAt) {
        whooshed = true
        whoosh(context(), context().currentTime)
      }
      if (!revealed && wishSeconds >= revealAt) {
        revealed = true
        playReveal(context())
      }
    } catch {
      return
    }
  }

  const stop = () => {
    whooshed = false
    revealed = false
    if (audio) void audio.close()
    audio = null
  }

  return { prime, sync, stop }
}
