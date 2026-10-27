const TRACKS = ["/bgsong2.mp3", "/bgsong3.mp3", "/bgsong1.mp3"]
const VOLUME = 0.2

export const createBackgroundPlaylist = () => {
  let trackIndex = 0
  let held = false
  const audio = new Audio(TRACKS[trackIndex])
  audio.preload = "auto"
  audio.autoplay = true
  audio.volume = VOLUME
  audio.style.position = "fixed"
  audio.style.width = "0"
  audio.style.height = "0"
  audio.style.opacity = "0"
  audio.style.pointerEvents = "none"
  document.body.appendChild(audio)

  const play = () => {
    if (held) return
    audio.volume = VOLUME
    if (!audio.paused) return
    void audio.play().catch(() => {})
  }

  audio.addEventListener("ended", () => {
    trackIndex = (trackIndex + 1) % TRACKS.length
    const nextTrack = TRACKS[trackIndex]
    if (!nextTrack) return
    audio.src = nextTrack
    audio.volume = VOLUME
    if (!held) void audio.play().catch(() => {})
  })

  const update = (_timeMilliseconds: number, suppressed: boolean) => {
    if (suppressed === held) return
    held = suppressed
    if (held) {
      audio.pause()
      return
    }
    play()
  }

  play()

  const stop = () => {
    held = true
    audio.pause()
    audio.remove()
  }

  return { update, nudge: play, stop }
}
