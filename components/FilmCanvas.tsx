"use client"

import { useEffect, useRef } from "react"
import { drawRadiConcepts } from "@/characters/radiConcepts"
import { anywayButtonLayout, CAR_ENTRANCE_SOUND, cityWalkSteps, CITY_SCENE_END, drawCityScene, DRIVE_CRUISE_SECONDS, DRIVE_MAX_BOOST, DRIVE_READY_SECONDS, KIRA_POP_PROGRESS, KIRA_WOOF_START, RADI_EXIT_START } from "@/scenes/cityScene"
import { CLUB_SCENE_END, clubWalkSteps, drawClubScene, isSmoothMovesOpen, LAUNCH_START, letsDanceButtonLayout, playedClubSeconds, smoothMovesButtonLayout, SPECIAL_MOVE_SECONDS, type SpecialMoveKind } from "@/scenes/clubScene"
import { FILM_SCENES } from "@/scenes/filmScenes"
import { activeQuickTime, drawRocketQuickTime, isInGoodWindow, missedQuickTime, QUICK_TIME_KEYS, quickTimeStarts, quickTimeThrill, type QuickTimeResult } from "@/scenes/rocketQuickTime"
import {
  drawLibraryScene,
  libraryWalkSteps,
  LIBRARY_EXIT_END,
  LIBRARY_FALL_START,
  LIBRARY_HERO_REVEAL,
  LIBRARY_LANDING_SECONDS,
  libraryQuizChoiceLayouts,
  libraryRoofBreakSeconds,
  QUIZ_ADVANCE_AFTER_WRONG,
  RIGHT_CHEER_SECONDS,
  CHEER_MOVE_SECONDS,
  type CaptainChoice,
  type FinalChoice,
  type JokeChoice,
  type LibraryQuizPhase,
} from "@/scenes/libraryScene"
import { cosmodromeKiraSteps, cosmodromeWalkSteps, DEFAULT_FLIGHT_SECONDS, drawCosmodromeScene, dudeWalkSteps, ENDING_MENU_AT, ENGINE_FADE_END, ENGINE_FADE_START, IGNITION_START, KIRA_COSMO_WOOF, LIFTOFF, SMOKE_START, SUIT_AT, WISH_START, wishButtonLayout } from "@/scenes/cosmodromeScene"
import { releaseLayersExcept } from "@/scenes/layerCache"
import { drawNatureScene, HORO_DANCE_START, HORO_START, NATURE_SCENE_END } from "@/scenes/natureScene"
import { drawOpeningScene, greetingButtonLayout, kiraWalkSteps, KIRA_SCENE_END, openingWalkSteps, startButtonLayout, WAVE_START, type BubbleButtonLayout } from "@/scenes/openingScene"
import { createBackgroundPlaylist } from "@/audio/backgroundPlaylist"
import { createEngineRev } from "@/audio/engineRev"
import { createKiraWoof } from "@/audio/kiraWoof"
import { createFootsteps } from "@/audio/footsteps"
import { createHeroReveal } from "@/audio/heroReveal"
import { createLibraryCrash } from "@/audio/libraryCrash"
import { createRocketLaunch } from "@/audio/rocketLaunch"
import { createQuickTimeBoost } from "@/audio/quickTimeBoost"
import { createSpaceReveal } from "@/audio/spaceReveal"
import { SceneSelect } from "@/components/SceneSelect"
import { useFilmStore } from "@/store/film"

const resizeCanvas = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) => {
  const ratio = window.devicePixelRatio || 1
  canvas.width = Math.floor(window.innerWidth * ratio)
  canvas.height = Math.floor(window.innerHeight * ratio)
  context.setTransform(ratio, 0, 0, ratio, 0, 0)
}

const scrollableHeight = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight)

const readScrollProgress = () => {
  const scrollHeight = scrollableHeight()
  if (scrollHeight <= 0) return 0
  return Math.min(1, Math.max(0, window.scrollY / scrollHeight))
}

const scrollYForProgress = (progress: number) => scrollableHeight() * progress

const DRIVE_BOOST_PER_PIXEL = 0.006
const HORO_STEPS_PER_PIXEL = 0.006
const HORO_IDLE_STEPS_PER_SECOND = 1.6
const WHEEL_LINE_PIXELS = 16
const OUTRO_CROSSFADE_SECONDS = 3

type LockableOrientation = ScreenOrientation & { lock?: (orientation: "landscape") => Promise<void> }

const lockLandscape = async () => {
  if (!window.matchMedia("(pointer: coarse)").matches || !document.documentElement.requestFullscreen) return
  try {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen({ navigationUI: "hide" })
    await (screen.orientation as LockableOrientation).lock?.("landscape")
  } catch {}
}

const startOver = () => {
  window.history.scrollRestoration = "manual"
  window.scrollTo(0, 0)
  window.location.reload()
}

const placedButtons = new WeakMap<HTMLElement, string>()

const isPlacedAlready = (element: HTMLElement, placement: string) => {
  if (placedButtons.get(element) === placement) return true
  placedButtons.set(element, placement)
  return false
}

const placeQuizButton = (button: HTMLButtonElement, layout: { centerX: number; centerY: number; width: number; height: number } | null, chosen: boolean) => {
  if (isPlacedAlready(button, layout ? `${layout.centerX} ${layout.centerY} ${layout.width} ${layout.height} ${chosen}` : `hidden ${chosen}`)) return
  button.dataset.visible = String(layout !== null)
  button.dataset.chosen = String(chosen)
  button.tabIndex = layout ? 0 : -1
  if (!layout) return
  button.style.left = `${layout.centerX}px`
  button.style.top = `${layout.centerY}px`
  button.style.width = `${layout.width}px`
  button.style.height = `${layout.height}px`
}

const placeBubbleButton = (button: HTMLButtonElement, layout: BubbleButtonLayout) => {
  const placement = layout ? `${layout.centerX} ${layout.centerY} ${layout.width} ${layout.fontSize}` : "hidden"
  if (isPlacedAlready(button, placement) && button.dataset.visible === String(layout !== null)) return
  button.dataset.visible = String(layout !== null)
  button.tabIndex = layout ? 0 : -1
  if (!layout) return
  button.style.left = `${layout.centerX}px`
  button.style.top = `${layout.centerY}px`
  button.style.width = `${layout.width}px`
  button.style.fontSize = `${layout.fontSize}px`
}

export const FilmCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const startButtonRef = useRef<HTMLButtonElement>(null)
  const moreButtonRef = useRef<HTMLButtonElement>(null)
  const anywayButtonRef = useRef<HTMLButtonElement>(null)
  const letsDanceButtonRef = useRef<HTMLButtonElement>(null)
  const wishButtonRef = useRef<HTMLButtonElement>(null)
  const smoothMovesButtonRef = useRef<HTMLButtonElement>(null)
  const endingMenuRef = useRef<HTMLDivElement>(null)
  const nemoButtonRef = useRef<HTMLButtonElement>(null)
  const americaButtonRef = useRef<HTMLButtonElement>(null)
  const janewayButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (!canvas || !context) return

    let animationFrameId = 0
    let shownProgress = readScrollProgress()
    let previousTimeMilliseconds: number | null = null
    let meetingStartMilliseconds: number | null = null
    let anywayStartMilliseconds: number | null = null
    let latestAnywaySeconds: number | null = null
    let driveProgress: number | null = null
    let driveSpeed = 0
    let driveBoost = 0
    let songFadeDirection: "in" | "out" | null = null
    let songFadeStartedAt: number | null = null
    const driveSong = new Audio("/song1.mp3")
    const stopDriveSong = () => {
      driveSong.volume = 0
      driveSong.pause()
      if (driveSong.currentTime > 0) driveSong.currentTime = 0
      driveSong.volume = 1
      songFadeDirection = null
      songFadeStartedAt = null
    }
    const fadeSong = (timeMilliseconds: number) => {
      if (songFadeDirection === null || songFadeStartedAt === null) return
      const fadeUnit = Math.min(1, Math.max(0, (timeMilliseconds - songFadeStartedAt) / 2000))
      const fade = fadeUnit * fadeUnit * (3 - 2 * fadeUnit)
      driveSong.volume = songFadeDirection === "in" ? fade : 1 - fade
      if (songFadeDirection === "out" && fadeUnit >= 1) stopDriveSong()
    }
    let danceFadeDirection: "in" | "out" | null = null
    let danceFadeStartedAt: number | null = null
    const danceSong = new Audio("/song2.mp3")
    const stopDanceSong = () => {
      danceSong.volume = 0
      danceSong.pause()
      if (danceSong.currentTime > 0) danceSong.currentTime = 0
      danceSong.volume = 1
      danceFadeDirection = null
      danceFadeStartedAt = null
    }
    const fadeDanceSong = (timeMilliseconds: number) => {
      if (danceFadeDirection === null || danceFadeStartedAt === null) return
      const fadeUnit = Math.min(1, Math.max(0, (timeMilliseconds - danceFadeStartedAt) / (danceFadeDirection === "in" ? 1000 : 3000)))
      const fade = fadeUnit * fadeUnit * (3 - 2 * fadeUnit)
      danceSong.volume = danceFadeDirection === "in" ? fade : 1 - fade
      if (danceFadeDirection === "out" && fadeUnit >= 1) stopDanceSong()
    }
    const horoFadeMilliseconds = 2000
    let horoFadeDirection: "in" | "out" | null = null
    let horoFadeStartedAt: number | null = null
    let horoSongStarted = false
    const horoSong = new Audio("/horo.webm")
    const stopHoroSong = () => {
      horoSong.volume = 0
      horoSong.pause()
      if (horoSong.currentTime > 0) horoSong.currentTime = 0
      horoSong.volume = 1
      horoFadeDirection = null
      horoFadeStartedAt = null
    }
    const fadeHoroSong = (timeMilliseconds: number) => {
      if (horoFadeDirection === null || horoFadeStartedAt === null) return
      const fadeUnit = Math.min(1, Math.max(0, (timeMilliseconds - horoFadeStartedAt) / horoFadeMilliseconds))
      const fade = fadeUnit * fadeUnit * (3 - 2 * fadeUnit)
      horoSong.volume = horoFadeDirection === "in" ? fade : 1 - fade
      if (horoFadeDirection === "out" && fadeUnit >= 1) stopHoroSong()
    }
    let horoDanceStarted = false
    let horoDanceFadeStartedAt: number | null = null
    const endSong = new Audio("/endsong.mp3")
    endSong.preload = "auto"
    let endSongStarted = false
    const outroSongs = ["/song1.mp3", "/song2.mp3"].map((src) => {
      const song = new Audio(src)
      song.preload = "auto"
      return song
    })
    const outroChain = [endSong, ...outroSongs]
    let outroIndex = 0
    const stopEndSong = () => {
      endSongStarted = false
      outroIndex = 0
      for (const song of outroChain) {
        song.pause()
        song.volume = 1
        if (song.currentTime > 0) song.currentTime = 0
      }
    }
    const crossfadeOutro = () => {
      if (!endSongStarted) return
      const current = outroChain[outroIndex]
      const next = outroChain[outroIndex + 1]
      if (next && Number.isFinite(current.duration) && current.currentTime >= current.duration - OUTRO_CROSSFADE_SECONDS) {
        outroIndex += 1
        next.volume = 0
        next.currentTime = 0
        void next.play().catch(() => {})
      }
      outroChain.forEach((song, index) => {
        if (song.paused || !Number.isFinite(song.duration)) return
        const fadeIn = index === 0 ? 1 : song.currentTime / OUTRO_CROSSFADE_SECONDS
        const fadeOut = (song.duration - song.currentTime) / OUTRO_CROSSFADE_SECONDS
        song.volume = Math.min(1, Math.max(0, Math.min(fadeIn, fadeOut)))
      })
    }
    const resetToStart = () => {
      if (endSongStarted) startOver()
    }
    const lastOutroSong = outroChain[outroChain.length - 1]
    lastOutroSong.addEventListener("ended", resetToStart)
    const horoDanceSong = new Audio("/horodance.webm")
    const stopHoroDanceSong = () => {
      horoDanceSong.volume = 0
      horoDanceSong.pause()
      if (horoDanceSong.currentTime > 0) horoDanceSong.currentTime = 0
      horoDanceSong.volume = 1
      horoDanceFadeStartedAt = null
    }
    const fadeHoroDanceSong = (timeMilliseconds: number) => {
      if (horoDanceFadeStartedAt === null) return
      const fadeUnit = Math.min(1, Math.max(0, (timeMilliseconds - horoDanceFadeStartedAt) / horoFadeMilliseconds))
      const fade = fadeUnit * fadeUnit * (3 - 2 * fadeUnit)
      horoDanceSong.volume = 1 - fade
      if (fadeUnit >= 1) stopHoroDanceSong()
    }
    const backgroundPlaylist = createBackgroundPlaylist()
    const footsteps = createFootsteps()
    const kiraFootsteps = createFootsteps()
    const dudeFootsteps = createFootsteps(0.8)
    const engineRev = createEngineRev()
    const kiraWoof = createKiraWoof()
    const cosmodromeWoof = createKiraWoof()
    const rocketLaunch = createRocketLaunch(IGNITION_START, LIFTOFF, ENGINE_FADE_START, ENGINE_FADE_END)
    const quickTimeBoost = createQuickTimeBoost()
    const spaceReveal = createSpaceReveal(SMOKE_START, SUIT_AT)
    const libraryCrash = createLibraryCrash(LIBRARY_FALL_START, LIBRARY_LANDING_SECONDS)
    const heroReveal = createHeroReveal(LIBRARY_HERO_REVEAL)
    let arrivalStartMilliseconds: number | null = null
    let kiraStartMilliseconds: number | null = null
    let clubStartMilliseconds: number | null = null
    let letsDanceStartMilliseconds: number | null = null
    let libraryStartMilliseconds: number | null = null
    let libraryQuizPhase: LibraryQuizPhase = "captain"
    let captainChoice: CaptainChoice | null = null
    let hoveredCaptain: CaptainChoice | null = null
    let jokeChoice: JokeChoice | null = null
    let hoveredJoke: JokeChoice | null = null
    let finalChoice: FinalChoice | null = null
    let hoveredFinal: FinalChoice | null = null
    let jokeQuizStartSeconds: number | null = null
    let finalQuizStartSeconds: number | null = null
    let wrongStartMilliseconds: number | null = null
    let cheerStartMilliseconds: number | null = null
    let cheerQuestionStarted = false
    let exitStartMilliseconds: number | null = null
    let boringShakeStartMilliseconds: number | null = null
    let natureStartMilliseconds: number | null = null
    let cosmodromeStartMilliseconds: number | null = null
    let wishStartMilliseconds: number | null = null
    let smoothMovesPresses = 0
    let specialMoveKind: SpecialMoveKind = 0
    let specialMoveStartMilliseconds: number | null = null
    let isSmoothMovesShown = false
    let quickTimeSeconds: number | null = null
    let quickTimeStartList: readonly number[] = []
    let quickTimeResults: (QuickTimeResult | null)[] = QUICK_TIME_KEYS.map(() => null)
    let horoTargetSteps = 0
    let horoSteps = 0
    let horoIdleSteps = 0
    let hasScrolledHoro = false
    let pinnedScrollY: number | null = null
    let lastTouchY: number | null = null
    let scrollOpen = false
    let scrollFloorProgress = 0
    const drawFrame = (timeMilliseconds: number) => {
      const elapsedSeconds = previousTimeMilliseconds === null ? 0 : (timeMilliseconds - previousTimeMilliseconds) / 1000
      previousTimeMilliseconds = timeMilliseconds
      const { progress: targetProgress, isShowingConcepts } = useFilmStore.getState()
      shownProgress += (targetProgress - shownProgress) * (1 - Math.exp(-elapsedSeconds * 6))
      if (scrollFloorProgress > 0) shownProgress = Math.max(shownProgress, scrollFloorProgress)
      const greetingLayout = greetingButtonLayout(window.innerWidth, window.innerHeight, shownProgress)
      if (!greetingLayout && scrollFloorProgress === 0) {
        meetingStartMilliseconds = null
        clubStartMilliseconds = null
        libraryStartMilliseconds = null
        natureStartMilliseconds = null
        cosmodromeStartMilliseconds = null
      }
      const meetingSeconds = meetingStartMilliseconds === null ? null : Math.max(0, timeMilliseconds - meetingStartMilliseconds) / 1000
      const citySeconds = meetingSeconds !== null && meetingSeconds >= KIRA_SCENE_END ? meetingSeconds - KIRA_SCENE_END : null
      if (citySeconds === null) anywayStartMilliseconds = null
      const anywaySeconds = anywayStartMilliseconds === null ? null : Math.max(0, timeMilliseconds - anywayStartMilliseconds) / 1000
      latestAnywaySeconds = isShowingConcepts ? null : anywaySeconds
      if (anywaySeconds === null) {
        if (driveProgress !== null) {
          stopDriveSong()
          engineRev.stop()
        }
        driveProgress = null
        driveSpeed = 0
        driveBoost = 0
        arrivalStartMilliseconds = null
        kiraStartMilliseconds = null
      }
      if (driveProgress !== null) {
        driveSpeed += (1 + driveBoost - driveSpeed) * (1 - Math.exp(-elapsedSeconds * 4))
        driveProgress = Math.min(1, driveProgress + (driveSpeed * elapsedSeconds) / DRIVE_CRUISE_SECONDS)
        driveBoost *= Math.exp(-elapsedSeconds * 4)
        if (driveProgress >= KIRA_POP_PROGRESS) kiraStartMilliseconds ??= timeMilliseconds
        if (driveProgress >= 1) {
          arrivalStartMilliseconds ??= timeMilliseconds
          engineRev.stop()
        }
      }
      const secondsSince = (startMilliseconds: number | null) => (startMilliseconds === null ? null : Math.max(0, timeMilliseconds - startMilliseconds) / 1000)
      const drive = driveProgress === null
        ? null
        : { progress: driveProgress, speed: driveSpeed, kiraSeconds: secondsSince(kiraStartMilliseconds), arrivalSeconds: secondsSince(arrivalStartMilliseconds) }
      if (songFadeDirection === "in" && !driveSong.paused && drive?.arrivalSeconds != null && drive.arrivalSeconds >= RADI_EXIT_START) {
        songFadeDirection = "out"
        songFadeStartedAt = timeMilliseconds
      }
      fadeSong(timeMilliseconds)
      if (drive?.arrivalSeconds != null && drive.arrivalSeconds >= CITY_SCENE_END) clubStartMilliseconds ??= timeMilliseconds
      const clubSeconds = secondsSince(clubStartMilliseconds)
      if (clubSeconds === null) letsDanceStartMilliseconds = null
      const letsDanceSeconds = secondsSince(letsDanceStartMilliseconds)
      if (letsDanceSeconds === null) {
        smoothMovesPresses = 0
        specialMoveStartMilliseconds = null
      }
      let specialMoveSeconds = secondsSince(specialMoveStartMilliseconds)
      if (specialMoveSeconds !== null && specialMoveSeconds >= SPECIAL_MOVE_SECONDS[specialMoveKind]) {
        specialMoveStartMilliseconds = null
        specialMoveSeconds = null
      }
      const specialMove = specialMoveSeconds === null ? null : { kind: specialMoveKind, seconds: specialMoveSeconds }
      const playedClub = clubSeconds === null ? null : playedClubSeconds(clubSeconds, letsDanceSeconds)
      if (playedClub !== null && playedClub >= CLUB_SCENE_END) libraryStartMilliseconds ??= timeMilliseconds
      if (letsDanceStartMilliseconds === null) {
        if (!danceSong.paused || danceFadeStartedAt !== null) stopDanceSong()
      } else if (playedClub !== null && playedClub >= LAUNCH_START && danceFadeDirection === "in" && !danceSong.paused) {
        danceFadeDirection = "out"
        danceFadeStartedAt = timeMilliseconds
      }
      fadeDanceSong(timeMilliseconds)
      const librarySeconds = secondsSince(libraryStartMilliseconds)
      const exitSeconds = secondsSince(exitStartMilliseconds)
      if (librarySeconds !== null && exitSeconds !== null && exitSeconds >= LIBRARY_EXIT_END) natureStartMilliseconds ??= timeMilliseconds
      const natureSeconds = secondsSince(natureStartMilliseconds)
      if (natureSeconds !== null && natureSeconds >= NATURE_SCENE_END) cosmodromeStartMilliseconds ??= timeMilliseconds
      const cosmodromeSeconds = secondsSince(cosmodromeStartMilliseconds)
      if (cosmodromeSeconds === null) wishStartMilliseconds = null
      const wishSeconds = secondsSince(wishStartMilliseconds)
      const hasLiftedOff = !isShowingConcepts && cosmodromeSeconds !== null && wishSeconds !== null && wishSeconds >= LIFTOFF
      if (!hasLiftedOff && endSongStarted) stopEndSong()
      if (hasLiftedOff && !endSongStarted) {
        endSongStarted = true
        endSong.currentTime = 0
        void endSong.play().catch(() => {})
      }
      crossfadeOutro()
      const flightDuration = Number.isFinite(endSong.duration) ? endSong.duration : DEFAULT_FLIGHT_SECONDS
      quickTimeSeconds = hasLiftedOff ? wishSeconds : null
      if (quickTimeSeconds === null) {
        if (quickTimeResults.some((result) => result !== null)) quickTimeResults = QUICK_TIME_KEYS.map(() => null)
      } else {
        const seconds = quickTimeSeconds
        quickTimeStartList = quickTimeStarts(flightDuration)
        quickTimeStartList.forEach((start, index) => {
          if (quickTimeResults[index] === null && missedQuickTime(seconds, start)) quickTimeResults[index] = { hit: false, atSeconds: seconds }
        })
      }
      const thrill = quickTimeThrill(quickTimeSeconds, quickTimeResults)
      if (natureSeconds === null) {
        horoSongStarted = false
        horoDanceStarted = false
        if (!horoSong.paused || horoFadeStartedAt !== null) stopHoroSong()
        if (!horoDanceSong.paused || horoDanceFadeStartedAt !== null) stopHoroDanceSong()
        horoTargetSteps = 0
        horoSteps = 0
        horoIdleSteps = 0
        hasScrolledHoro = false
      } else if (!horoSongStarted) {
        horoSongStarted = true
        horoFadeDirection = "in"
        horoFadeStartedAt = timeMilliseconds
        horoSong.volume = 0
        horoSong.currentTime = 0
        void horoSong.play().catch(() => {})
      } else if (horoFadeDirection === "in" && Number.isFinite(horoSong.duration) && horoSong.currentTime >= horoSong.duration - horoFadeMilliseconds / 1000) {
        horoFadeDirection = "out"
        horoFadeStartedAt = timeMilliseconds
      }
      fadeHoroSong(timeMilliseconds)
      if (natureSeconds !== null && natureSeconds >= HORO_DANCE_START && !horoDanceStarted) {
        horoDanceStarted = true
        horoDanceSong.volume = 1
        horoDanceSong.currentTime = 0
        void horoDanceSong.play().catch(() => {})
      } else if (horoDanceStarted && !horoDanceSong.paused && horoDanceFadeStartedAt === null && Number.isFinite(horoDanceSong.duration) && horoDanceSong.currentTime >= horoDanceSong.duration - horoFadeMilliseconds / 1000) {
        horoDanceFadeStartedAt = timeMilliseconds
      }
      fadeHoroDanceSong(timeMilliseconds)
      const hasLeftTheCar = drive?.arrivalSeconds != null && drive.arrivalSeconds >= RADI_EXIT_START
      const hasLandedInLibrary = librarySeconds !== null && librarySeconds >= LIBRARY_LANDING_SECONDS
      const hasExitedAsHero = exitStartMilliseconds !== null && (finalChoice === "batman" || finalChoice === "unicorn")
      const holdBackground = (natureSeconds !== null && cosmodromeSeconds === null) || hasExitedAsHero || (!hasLandedInLibrary && (hasLeftTheCar || clubSeconds !== null || librarySeconds !== null))
      backgroundPlaylist.update(timeMilliseconds, songFadeDirection !== null || danceFadeDirection !== null || endSongStarted || holdBackground)
      pinnedScrollY = !isShowingConcepts && cosmodromeSeconds === null && natureSeconds !== null && natureSeconds >= HORO_START ? (pinnedScrollY ?? window.scrollY) : null
      horoSteps += (horoTargetSteps - horoSteps) * (1 - Math.exp(-elapsedSeconds * 5))
      if (pinnedScrollY !== null) horoIdleSteps += elapsedSeconds * HORO_IDLE_STEPS_PER_SECOND * Math.max(0, 1 - Math.abs(horoTargetSteps - horoSteps) * 4)
      const shakingBoring = libraryQuizPhase === "final" && boringShakeStartMilliseconds !== null && timeMilliseconds - boringShakeStartMilliseconds < 1000 && finalChoice === null
      if (isShowingConcepts) {
        context.fillStyle = "#000000"
        context.fillRect(0, 0, window.innerWidth, window.innerHeight)
        drawRadiConcepts(context, window.innerWidth, window.innerHeight)
      } else if (cosmodromeSeconds !== null) {
        drawCosmodromeScene(context, window.innerWidth, window.innerHeight, timeMilliseconds / 1000, cosmodromeSeconds, wishSeconds, flightDuration, thrill)
        drawRocketQuickTime(context, window.innerWidth, window.innerHeight, quickTimeSeconds, quickTimeStartList, quickTimeResults, flightDuration)
      } else if (natureSeconds !== null) {
        drawNatureScene(context, window.innerWidth, window.innerHeight, timeMilliseconds / 1000, natureSeconds, horoSteps, horoSteps + horoIdleSteps, !hasScrolledHoro)
      } else if (librarySeconds !== null) {
        const wrongSeconds = secondsSince(wrongStartMilliseconds)
        if (wrongSeconds !== null && wrongSeconds >= QUIZ_ADVANCE_AFTER_WRONG) {
          if (libraryQuizPhase === "captain") {
            libraryQuizPhase = "joke"
            jokeQuizStartSeconds = librarySeconds
            wrongStartMilliseconds = null
            captainChoice = null
            hoveredCaptain = null
          } else if (libraryQuizPhase === "joke") {
            libraryQuizPhase = "final"
            finalQuizStartSeconds = librarySeconds
            wrongStartMilliseconds = null
            jokeChoice = null
            hoveredJoke = null
          }
        }
        let cheerSeconds = secondsSince(cheerStartMilliseconds)
        if (cheerSeconds !== null && cheerSeconds >= RIGHT_CHEER_SECONDS && !cheerQuestionStarted) {
          cheerQuestionStarted = true
          if (libraryQuizPhase === "captain") startJokeQuiz(librarySeconds)
          else if (libraryQuizPhase === "joke") startFinalQuiz(librarySeconds)
        }
        if (cheerSeconds !== null && cheerSeconds >= RIGHT_CHEER_SECONDS + CHEER_MOVE_SECONDS) {
          cheerStartMilliseconds = null
          cheerQuestionStarted = false
          cheerSeconds = null
        }
        drawLibraryScene(
          context,
          window.innerWidth,
          window.innerHeight,
          timeMilliseconds / 1000,
          librarySeconds,
          libraryQuizPhase,
          captainChoice,
          hoveredCaptain,
          jokeChoice,
          hoveredJoke,
          secondsSince(wrongStartMilliseconds),
          jokeQuizStartSeconds,
          finalQuizStartSeconds,
          cheerSeconds,
          shakingBoring ? "boring" : finalChoice,
          hoveredFinal,
          exitSeconds,
          secondsSince(boringShakeStartMilliseconds),
        )
      } else if (clubSeconds !== null) {
        drawClubScene(context, window.innerWidth, window.innerHeight, timeMilliseconds / 1000, clubSeconds, letsDanceSeconds, specialMove)
      } else if (citySeconds !== null) {
        drawCityScene(context, window.innerWidth, window.innerHeight, timeMilliseconds / 1000, citySeconds, anywaySeconds, drive)
      } else {
        drawOpeningScene(context, window.innerWidth, window.innerHeight, timeMilliseconds / 1000, shownProgress, meetingSeconds, scrollOpen)
      }
      releaseLayersExcept(isShowingConcepts ? null : cosmodromeSeconds !== null ? "cosmodrome" : natureSeconds !== null ? "nature" : librarySeconds !== null ? "library" : clubSeconds !== null ? "club" : citySeconds !== null ? "city" : "opening")
      const onOpening = !isShowingConcepts && meetingSeconds === null && citySeconds === null && clubSeconds === null && librarySeconds === null && natureSeconds === null && cosmodromeSeconds === null
      const startLayout = scrollOpen || !onOpening ? null : startButtonLayout(window.innerWidth, window.innerHeight, timeMilliseconds / 1000)
      if (startButtonRef.current) placeBubbleButton(startButtonRef.current, startLayout)
      const moreLayout = isShowingConcepts || meetingSeconds !== null ? null : greetingLayout
      const anywayLayout = isShowingConcepts || citySeconds === null || clubSeconds !== null || librarySeconds !== null || natureSeconds !== null || cosmodromeSeconds !== null ? null : anywayButtonLayout(window.innerWidth, window.innerHeight, citySeconds, anywaySeconds)
      if (moreButtonRef.current) placeBubbleButton(moreButtonRef.current, moreLayout)
      if (anywayButtonRef.current) placeBubbleButton(anywayButtonRef.current, anywayLayout)
      const letsDanceLayout = isShowingConcepts || clubSeconds === null ? null : letsDanceButtonLayout(window.innerWidth, window.innerHeight, clubSeconds, letsDanceSeconds)
      if (letsDanceButtonRef.current) placeBubbleButton(letsDanceButtonRef.current, letsDanceLayout)
      const wishLayout = isShowingConcepts || cosmodromeSeconds === null ? null : wishButtonLayout(window.innerWidth, window.innerHeight, cosmodromeSeconds, wishSeconds)
      if (wishButtonRef.current) placeBubbleButton(wishButtonRef.current, wishLayout)
      isSmoothMovesShown = !isShowingConcepts && clubSeconds !== null && librarySeconds === null && natureSeconds === null && cosmodromeSeconds === null && isSmoothMovesOpen(clubSeconds, letsDanceSeconds)
      const smoothMovesButton = smoothMovesButtonRef.current
      if (smoothMovesButton) placeBubbleButton(smoothMovesButton, isSmoothMovesShown ? smoothMovesButtonLayout(window.innerWidth, window.innerHeight) : null)
      if (smoothMovesButton && smoothMovesButton.dataset.busy !== String(specialMove !== null)) smoothMovesButton.dataset.busy = String(specialMove !== null)
      const showEndingMenu = !isShowingConcepts && cosmodromeSeconds !== null && wishSeconds !== null && wishSeconds >= ENDING_MENU_AT
      if (endingMenuRef.current && endingMenuRef.current.dataset.visible !== String(showEndingMenu)) endingMenuRef.current.dataset.visible = String(showEndingMenu)
      if (librarySeconds === null) {
        libraryQuizPhase = "captain"
        captainChoice = null
        hoveredCaptain = null
        jokeChoice = null
        hoveredJoke = null
        finalChoice = null
        hoveredFinal = null
        jokeQuizStartSeconds = null
        finalQuizStartSeconds = null
        wrongStartMilliseconds = null
        cheerStartMilliseconds = null
        cheerQuestionStarted = false
        exitStartMilliseconds = null
        boringShakeStartMilliseconds = null
      }
      const wrongSeconds = librarySeconds === null ? null : secondsSince(wrongStartMilliseconds)
      const cheering = librarySeconds !== null && cheerStartMilliseconds !== null
      const quizLayouts = isShowingConcepts || librarySeconds === null || cheering || finalChoice !== null
        ? null
        : libraryQuizChoiceLayouts(window.innerWidth, window.innerHeight, libraryQuizPhase, librarySeconds, wrongSeconds, jokeQuizStartSeconds, finalQuizStartSeconds)
      const quizButtons = [nemoButtonRef.current, americaButtonRef.current, janewayButtonRef.current]
      const quizChoices = libraryQuizPhase === "captain"
        ? (["nemo", "america", "janeway"] as const)
        : libraryQuizPhase === "joke"
          ? (["furmidable", "catastrophe", "purplexing"] as const)
          : (["batman", "unicorn", "boring"] as const)
      const chosenQuiz = libraryQuizPhase === "captain" ? captainChoice : libraryQuizPhase === "joke" ? jokeChoice : shakingBoring ? "boring" : finalChoice
      quizButtons.forEach((button, index) => {
        if (!button) return
        const choice = quizChoices?.[index] ?? null
        placeQuizButton(button, quizLayouts?.[index] ?? null, choice !== null && chosenQuiz === choice)
      })
      const walkSteps = isShowingConcepts
        ? null
        : cosmodromeSeconds !== null
          ? cosmodromeWalkSteps(cosmodromeSeconds, wishSeconds)
          : natureSeconds !== null
            ? null
            : librarySeconds !== null
              ? libraryWalkSteps(librarySeconds)
              : playedClub !== null
                ? clubWalkSteps(playedClub)
                : citySeconds !== null
                  ? cityWalkSteps(drive?.arrivalSeconds ?? null, anywaySeconds)
                  : openingWalkSteps(shownProgress, meetingSeconds)
      footsteps.sync(walkSteps)
      kiraFootsteps.sync(isShowingConcepts ? null : cosmodromeSeconds !== null ? cosmodromeKiraSteps(wishSeconds) : kiraWalkSteps(meetingSeconds))
      dudeFootsteps.sync(isShowingConcepts || cosmodromeSeconds === null ? null : dudeWalkSteps(cosmodromeSeconds))
      engineRev.syncEntrance(citySeconds === null ? null : anywaySeconds, CAR_ENTRANCE_SOUND)
      kiraWoof.sync(drive?.kiraSeconds ?? null, KIRA_WOOF_START)
      cosmodromeWoof.sync(isShowingConcepts || cosmodromeSeconds === null ? null : wishSeconds, KIRA_COSMO_WOOF)
      rocketLaunch.sync(isShowingConcepts || cosmodromeSeconds === null ? null : wishSeconds)
      quickTimeBoost.sync(thrill.boost)
      spaceReveal.sync(isShowingConcepts || cosmodromeSeconds === null ? null : wishSeconds)
      libraryCrash.sync(isShowingConcepts ? null : librarySeconds, libraryRoofBreakSeconds(window.innerWidth, window.innerHeight))
      heroReveal.sync(
        librarySeconds === null ? null : exitSeconds,
        finalChoice === "batman" || finalChoice === "unicorn" ? finalChoice : null,
      )
      animationFrameId = requestAnimationFrame(drawFrame)
    }
    const openScroll = () => {
      if (scrollOpen) return
      scrollOpen = true
      document.documentElement.dataset.scrollOpen = "true"
      if (startButtonRef.current) startButtonRef.current.dataset.visible = "false"
      backgroundPlaylist.nudge()
      void lockLandscape()
    }
    const startMeetingKira = () => {
      meetingStartMilliseconds = performance.now()
      scrollFloorProgress = WAVE_START
    }
    const startCoolRadi = () => {
      anywayStartMilliseconds = performance.now()
      engineRev.prime()
      driveSong.muted = true
      void driveSong.play().then(() => {
        if (driveProgress !== null) return
        driveSong.pause()
        driveSong.currentTime = 0
        driveSong.muted = false
      }).catch(() => {
        driveSong.muted = false
      })
    }
    const doSmoothMoves = () => {
      if (!isSmoothMovesShown || specialMoveStartMilliseconds !== null) return
      specialMoveKind = (smoothMovesPresses % 2) as SpecialMoveKind
      smoothMovesPresses += 1
      specialMoveStartMilliseconds = performance.now()
    }
    const makeWish = () => {
      wishStartMilliseconds ??= performance.now()
      spaceReveal.prime()
    }
    const startDancing = () => {
      if (letsDanceStartMilliseconds !== null) return
      letsDanceStartMilliseconds = performance.now()
      danceFadeDirection = "in"
      danceFadeStartedAt = performance.now()
      danceSong.volume = 0
      danceSong.currentTime = 0
      void danceSong.play().catch(() => {})
    }
    const pressGas = (scrollPixels: number) => {
      if (scrollPixels <= 0 || latestAnywaySeconds === null || latestAnywaySeconds < DRIVE_READY_SECONDS) return
      const startingDrive = driveProgress === null
      driveProgress ??= 0
      if (startingDrive) {
        driveSong.muted = false
        driveSong.volume = 0
        driveSong.currentTime = 0
        songFadeDirection = "in"
        songFadeStartedAt = performance.now()
        void driveSong.play().catch(() => {})
      }
      driveBoost = Math.min(DRIVE_MAX_BOOST, driveBoost + scrollPixels * DRIVE_BOOST_PER_PIXEL)
      if (driveProgress < 1) engineRev.vroom(driveBoost)
    }
    const stepHoro = (scrollPixels: number) => {
      if (pinnedScrollY === null) return
      horoTargetSteps += scrollPixels * HORO_STEPS_PER_PIXEL
      hasScrolledHoro = true
    }
    const scrollFloorY = () => scrollYForProgress(scrollFloorProgress)
    const aboveScrollFloor = () => scrollFloorProgress > 0 && window.scrollY < scrollFloorY() - 0.5
    const blockUpwardScroll = () => scrollFloorProgress > 0 && window.scrollY <= scrollFloorY() + 1
    const onWheel = (event: WheelEvent) => {
      backgroundPlaylist.nudge()
      const wheelPixels = event.deltaMode === WheelEvent.DOM_DELTA_PIXEL ? event.deltaY : event.deltaY * WHEEL_LINE_PIXELS
      if (wheelPixels < 0 && blockUpwardScroll()) event.preventDefault()
      pressGas(wheelPixels)
      stepHoro(wheelPixels)
    }
    const onTouchStart = (event: TouchEvent) => {
      lastTouchY = event.touches[0]?.clientY ?? null
    }
    const onTouchMove = (event: TouchEvent) => {
      const touchY = event.touches[0]?.clientY
      if (touchY === undefined) return
      backgroundPlaylist.nudge()
      if (lastTouchY !== null) {
        const touchPixels = lastTouchY - touchY
        if (touchPixels < 0 && blockUpwardScroll()) event.preventDefault()
        pressGas(touchPixels)
        stepHoro(touchPixels)
      }
      lastTouchY = touchY
    }
    const unsubscribeFromScenes = useFilmStore.subscribe(({ sceneSelection }, previousState) => {
      if (!sceneSelection || sceneSelection === previousState.sceneSelection) return
      const chosenScene = FILM_SCENES.find(({ id }) => id === sceneSelection.sceneId)
      const startSeconds = chosenScene?.meetingStartSeconds ?? null
      scrollFloorProgress = startSeconds === null ? 0 : WAVE_START
      window.scrollTo({ top: startSeconds === null ? 0 : document.documentElement.scrollHeight, behavior: "instant" })
      updateProgress()
      shownProgress = useFilmStore.getState().progress
      meetingStartMilliseconds = startSeconds === null ? null : performance.now() - startSeconds * 1000
      anywayStartMilliseconds = null
      clubStartMilliseconds = sceneSelection.sceneId === "nightClub" ? performance.now() : null
      libraryStartMilliseconds = sceneSelection.sceneId === "library" ? performance.now() : null
      natureStartMilliseconds = sceneSelection.sceneId === "nature" ? performance.now() : null
      const isRocketLaunch = sceneSelection.sceneId === "rocketLaunch"
      cosmodromeStartMilliseconds = sceneSelection.sceneId === "cosmodrome" ? performance.now() : isRocketLaunch ? performance.now() - (WISH_START + LIFTOFF) * 1000 : null
      wishStartMilliseconds = isRocketLaunch ? performance.now() - LIFTOFF * 1000 : null
      horoTargetSteps = 0
      horoSteps = 0
      horoIdleSteps = 0
      hasScrolledHoro = false
      pinnedScrollY = null
      libraryQuizPhase = "captain"
      captainChoice = null
      hoveredCaptain = null
      jokeChoice = null
      hoveredJoke = null
      finalChoice = null
      hoveredFinal = null
      jokeQuizStartSeconds = null
      finalQuizStartSeconds = null
      wrongStartMilliseconds = null
      cheerStartMilliseconds = null
      cheerQuestionStarted = false
      exitStartMilliseconds = null
      boringShakeStartMilliseconds = null
      letsDanceStartMilliseconds = null
      smoothMovesPresses = 0
      specialMoveStartMilliseconds = null
    })
    const updateProgress = () => {
      useFilmStore.getState().setProgress(readScrollProgress())
    }
    const onScroll = () => {
      if (!scrollOpen) {
        if (window.scrollY !== 0) window.scrollTo(0, 0)
        return
      }
      if (pinnedScrollY !== null) {
        if (window.scrollY !== pinnedScrollY) window.scrollTo(0, pinnedScrollY)
        return
      }
      if (aboveScrollFloor()) {
        window.scrollTo(0, scrollFloorY())
        useFilmStore.getState().setProgress(scrollFloorProgress)
        return
      }
      backgroundPlaylist.nudge()
      updateProgress()
    }
    const onKeyDown = (event: KeyboardEvent) => {
      backgroundPlaylist.nudge()
      const scrollingUp = event.key === "ArrowUp" || event.key === "PageUp" || event.key === "Home" || (event.key === " " && event.shiftKey)
      if (scrollingUp && (event.key === "Home" ? scrollFloorProgress > 0 : blockUpwardScroll())) event.preventDefault()
      pressQuickTime(event)
    }
    const pressQuickTime = (event: KeyboardEvent) => {
      if (quickTimeSeconds === null || wishStartMilliseconds === null || event.repeat) return
      const key = event.key.toUpperCase()
      if (!QUICK_TIME_KEYS.some((quickTimeKey) => quickTimeKey === key)) return
      const seconds = (performance.now() - wishStartMilliseconds) / 1000
      const index = activeQuickTime(seconds, quickTimeStartList)
      if (index === -1 || quickTimeResults[index] !== null) return
      quickTimeResults[index] = { hit: key === QUICK_TIME_KEYS[index] && isInGoodWindow(seconds, quickTimeStartList[index]), atSeconds: seconds }
    }
    const onResize = () => {
      resizeCanvas(canvas, context)
      updateProgress()
    }

    resizeCanvas(canvas, context)
    updateProgress()
    animationFrameId = requestAnimationFrame(drawFrame)
    window.addEventListener("resize", onResize)
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("wheel", onWheel, { passive: false })
    window.addEventListener("touchstart", onTouchStart, { passive: true })
    window.addEventListener("touchmove", onTouchMove, { passive: false })
    window.addEventListener("pointerdown", backgroundPlaylist.nudge, true)
    window.addEventListener("keydown", onKeyDown, true)
    const startButton = startButtonRef.current
    startButton?.addEventListener("pointerdown", backgroundPlaylist.nudge)
    startButton?.addEventListener("click", openScroll)
    const moreButton = moreButtonRef.current
    moreButton?.addEventListener("click", startMeetingKira)
    const anywayButton = anywayButtonRef.current
    anywayButton?.addEventListener("click", startCoolRadi)
    const letsDanceButton = letsDanceButtonRef.current
    letsDanceButton?.addEventListener("click", startDancing)
    const wishButton = wishButtonRef.current
    wishButton?.addEventListener("click", makeWish)
    const smoothMovesButton = smoothMovesButtonRef.current
    smoothMovesButton?.addEventListener("click", doSmoothMoves)
    const startJokeQuiz = (librarySeconds: number) => {
      libraryQuizPhase = "joke"
      jokeQuizStartSeconds = librarySeconds
      captainChoice = null
      hoveredCaptain = null
    }
    const startFinalQuiz = (librarySeconds: number) => {
      libraryQuizPhase = "final"
      finalQuizStartSeconds = librarySeconds
      jokeChoice = null
      hoveredJoke = null
    }
    const chooseCaptain = (choice: CaptainChoice) => {
      if (libraryQuizPhase !== "captain" || wrongStartMilliseconds !== null || cheerStartMilliseconds !== null) return
      captainChoice = choice
      if (choice === "janeway") {
        cheerStartMilliseconds = performance.now()
        cheerQuestionStarted = false
        return
      }
      wrongStartMilliseconds = performance.now()
    }
    const chooseJoke = (choice: JokeChoice) => {
      if (libraryQuizPhase !== "joke" || wrongStartMilliseconds !== null || cheerStartMilliseconds !== null) return
      jokeChoice = choice
      if (choice === "catastrophe") {
        cheerStartMilliseconds = performance.now()
        cheerQuestionStarted = false
        return
      }
      wrongStartMilliseconds = performance.now()
    }
    const chooseFinal = (choice: FinalChoice) => {
      if (libraryQuizPhase !== "final" || cheerStartMilliseconds !== null) return
      if (choice === "boring") {
        if (finalChoice !== null) return
        boringShakeStartMilliseconds = performance.now()
        return
      }
      if (finalChoice !== null || wrongStartMilliseconds !== null) return
      finalChoice = choice
      exitStartMilliseconds = performance.now()
      heroReveal.prime()
    }
    const chooseQuizA = () => {
      if (libraryQuizPhase === "captain") chooseCaptain("nemo")
      else if (libraryQuizPhase === "joke") chooseJoke("furmidable")
      else if (libraryQuizPhase === "final") chooseFinal("batman")
    }
    const chooseQuizB = () => {
      if (libraryQuizPhase === "captain") chooseCaptain("america")
      else if (libraryQuizPhase === "joke") chooseJoke("catastrophe")
      else if (libraryQuizPhase === "final") chooseFinal("unicorn")
    }
    const chooseQuizC = () => {
      if (libraryQuizPhase === "captain") chooseCaptain("janeway")
      else if (libraryQuizPhase === "joke") chooseJoke("purplexing")
      else if (libraryQuizPhase === "final") chooseFinal("boring")
    }
    const nemoButton = nemoButtonRef.current
    const americaButton = americaButtonRef.current
    const janewayButton = janewayButtonRef.current
    const hoverQuizA = () => {
      if (libraryQuizPhase === "captain") hoveredCaptain = "nemo"
      else if (libraryQuizPhase === "joke") hoveredJoke = "furmidable"
      else if (libraryQuizPhase === "final") hoveredFinal = "batman"
    }
    const hoverQuizB = () => {
      if (libraryQuizPhase === "captain") hoveredCaptain = "america"
      else if (libraryQuizPhase === "joke") hoveredJoke = "catastrophe"
      else if (libraryQuizPhase === "final") hoveredFinal = "unicorn"
    }
    const hoverQuizC = () => {
      if (libraryQuizPhase === "captain") hoveredCaptain = "janeway"
      else if (libraryQuizPhase === "joke") hoveredJoke = "purplexing"
      else if (libraryQuizPhase === "final") hoveredFinal = "boring"
    }
    const clearQuizHover = () => {
      hoveredCaptain = null
      hoveredJoke = null
      hoveredFinal = null
    }
    nemoButton?.addEventListener("click", chooseQuizA)
    americaButton?.addEventListener("click", chooseQuizB)
    janewayButton?.addEventListener("click", chooseQuizC)
    nemoButton?.addEventListener("mouseenter", hoverQuizA)
    americaButton?.addEventListener("mouseenter", hoverQuizB)
    janewayButton?.addEventListener("mouseenter", hoverQuizC)
    nemoButton?.addEventListener("mouseleave", clearQuizHover)
    americaButton?.addEventListener("mouseleave", clearQuizHover)
    janewayButton?.addEventListener("mouseleave", clearQuizHover)
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", onResize)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("wheel", onWheel)
      window.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("pointerdown", backgroundPlaylist.nudge, true)
      window.removeEventListener("keydown", onKeyDown, true)
      delete document.documentElement.dataset.scrollOpen
      startButton?.removeEventListener("pointerdown", backgroundPlaylist.nudge)
      startButton?.removeEventListener("click", openScroll)
      moreButton?.removeEventListener("click", startMeetingKira)
      anywayButton?.removeEventListener("click", startCoolRadi)
      letsDanceButton?.removeEventListener("click", startDancing)
      wishButton?.removeEventListener("click", makeWish)
      smoothMovesButton?.removeEventListener("click", doSmoothMoves)
      nemoButton?.removeEventListener("click", chooseQuizA)
      americaButton?.removeEventListener("click", chooseQuizB)
      janewayButton?.removeEventListener("click", chooseQuizC)
      nemoButton?.removeEventListener("mouseenter", hoverQuizA)
      americaButton?.removeEventListener("mouseenter", hoverQuizB)
      janewayButton?.removeEventListener("mouseenter", hoverQuizC)
      nemoButton?.removeEventListener("mouseleave", clearQuizHover)
      americaButton?.removeEventListener("mouseleave", clearQuizHover)
      janewayButton?.removeEventListener("mouseleave", clearQuizHover)
      unsubscribeFromScenes()
      stopDriveSong()
      stopDanceSong()
      stopHoroSong()
      stopHoroDanceSong()
      stopEndSong()
      lastOutroSong.removeEventListener("ended", resetToStart)
      backgroundPlaylist.stop()
      footsteps.stop()
      kiraFootsteps.stop()
      dudeFootsteps.stop()
      engineRev.stop()
      kiraWoof.stop()
      cosmodromeWoof.stop()
      rocketLaunch.stop()
      quickTimeBoost.stop()
      spaceReveal.stop()
      libraryCrash.stop()
      heroReveal.stop()
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} />
      <button ref={startButtonRef} type="button" className="more-button start-button" data-visible="false" tabIndex={-1}>
        Let's get started
      </button>
      <button ref={moreButtonRef} type="button" className="more-button" data-visible="false" tabIndex={-1}>
        {"Don't you want to know more about me?"}
      </button>
      <button ref={anywayButtonRef} type="button" className="more-button" data-visible="false" tabIndex={-1}>
        Anyway...
      </button>
      <button ref={letsDanceButtonRef} type="button" className="more-button" data-visible="false" tabIndex={-1}>
        {"Let's dance!"}
      </button>
      <button ref={wishButtonRef} type="button" className="more-button" data-visible="false" tabIndex={-1}>
        Make a wish
      </button>
      <button ref={smoothMovesButtonRef} type="button" className="smooth-moves-button" data-visible="false" data-busy="false" tabIndex={-1}>
        Smooth moves
      </button>
      <div ref={endingMenuRef} className="ending-menu" data-visible="false">
        <button type="button" className="ending-button" onClick={startOver}>
          Start over
        </button>
        <SceneSelect className="scene-select ending-scene-select" />
      </div>
      <button ref={nemoButtonRef} type="button" className="quiz-answer" data-visible="false" tabIndex={-1} aria-label="Answer A" />
      <button ref={americaButtonRef} type="button" className="quiz-answer" data-visible="false" tabIndex={-1} aria-label="Answer B" />
      <button ref={janewayButtonRef} type="button" className="quiz-answer" data-visible="false" tabIndex={-1} aria-label="Answer C" />
    </>
  )
}
