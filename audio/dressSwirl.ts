const TWINKLE_NOTES = [587.33, 739.99, 880, 1174.66, 1479.98, 1760]

const bell = (audio: AudioContext, frequency: number, start: number, duration: number, level: number) => {
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.type = "sine"
  osc.frequency.setValueAtTime(frequency, start)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(level, start + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(gain)
  gain.connect(audio.destination)
  osc.start(start)
  osc.stop(start + duration + 0.02)
}

const swish = (audio: AudioContext, start: number, seconds: number) => {
  const samples = Math.floor(audio.sampleRate * seconds)
  const noise = audio.createBuffer(1, samples, audio.sampleRate)
  const channel = noise.getChannelData(0)
  for (let sample = 0; sample < samples; sample += 1) channel[sample] = Math.random() * 2 - 1
  const source = audio.createBufferSource()
  const filter = audio.createBiquadFilter()
  const swirl = audio.createOscillator()
  const swirlDepth = audio.createGain()
  const gain = audio.createGain()
  source.buffer = noise
  filter.type = "bandpass"
  filter.Q.setValueAtTime(6, start)
  filter.frequency.setValueAtTime(500, start)
  filter.frequency.exponentialRampToValueAtTime(4000, start + seconds)
  swirl.frequency.setValueAtTime(9, start)
  swirlDepth.gain.setValueAtTime(400, start)
  swirl.connect(swirlDepth)
  swirlDepth.connect(filter.frequency)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(0.3, start + seconds * 0.8)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + seconds)
  source.connect(filter)
  filter.connect(gain)
  gain.connect(audio.destination)
  source.start(start)
  swirl.start(start)
  swirl.stop(start + seconds)
}

export const createDressSwirl = (swirlAt: number, swapAt: number) => {
  let audio: AudioContext | null = null
  let swirled = false
  let swapped = false

  const context = () => {
    audio ??= new AudioContext()
    return audio
  }

  const prime = () => {
    void context().resume()
  }

  const playSwap = (ready: AudioContext) => {
    const now = ready.currentTime
    TWINKLE_NOTES.forEach((frequency, index) => {
      bell(ready, frequency, now + index * 0.05, 0.5, 0.055)
      bell(ready, frequency * 3.01, now + index * 0.05, 0.15, 0.015)
    })
    bell(ready, 2349.32, now + 0.35, 0.8, 0.03)
  }

  const sync = (natureSeconds: number | null) => {
    if (natureSeconds === null || natureSeconds < swirlAt) {
      swirled = false
      swapped = false
      return
    }
    if (!swirled && natureSeconds > swapAt + 0.5) {
      swirled = true
      swapped = true
      return
    }
    try {
      if (!swirled) {
        swirled = true
        swish(context(), context().currentTime, Math.max(0.3, swapAt - natureSeconds))
      }
      if (!swapped && natureSeconds >= swapAt) {
        swapped = true
        playSwap(context())
      }
    } catch {
      return
    }
  }

  const stop = () => {
    swirled = false
    swapped = false
    if (audio) void audio.close()
    audio = null
  }

  return { prime, sync, stop }
}
