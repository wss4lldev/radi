const FFT_SIZE = 2048
const BASS_LOW_HZ = 40
const BASS_HIGH_HZ = 150
export const BEAT_HISTORY = 72
const SAMPLE_MILLISECONDS = 1000 / 60

export const createOutroWave = (songs: readonly HTMLAudioElement[]) => {
  const bins = new Uint8Array(FFT_SIZE / 2)
  let analyser: AnalyserNode | null = null
  let hasStarted = false
  let beatHistory: number[] = []
  let lastSampleAt = 0

  const prime = () => {
    if (hasStarted) return
    hasStarted = true
    try {
      const audio = new AudioContext()
      void audio.resume().then(() => {
        const node = audio.createAnalyser()
        node.fftSize = FFT_SIZE
        node.smoothingTimeConstant = 0.5
        node.connect(audio.destination)
        songs.forEach((song) => audio.createMediaElementSource(song).connect(node))
        analyser = node
      }).catch(() => {})
    } catch {
      return
    }
  }

  const bassLevel = (node: AnalyserNode) => {
    node.getByteFrequencyData(bins)
    const hertzPerBin = node.context.sampleRate / node.fftSize
    const bassBins = bins.slice(Math.max(1, Math.round(BASS_LOW_HZ / hertzPerBin)), Math.round(BASS_HIGH_HZ / hertzPerBin) + 1)
    return bassBins.reduce((sum, bin) => sum + bin, 0) / bassBins.length / 255
  }

  const read = (timeMilliseconds: number) => {
    if (!analyser) return null
    const elapsed = timeMilliseconds - lastSampleAt
    const steps = Math.min(BEAT_HISTORY, Math.floor(elapsed / SAMPLE_MILLISECONDS))
    if (steps > 0) {
      const level = bassLevel(analyser)
      beatHistory = [...Array.from({ length: steps }, () => level), ...beatHistory].slice(0, BEAT_HISTORY)
      lastSampleAt = timeMilliseconds - (elapsed % SAMPLE_MILLISECONDS)
    }
    return beatHistory
  }

  return { prime, read }
}
