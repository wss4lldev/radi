import { create } from "zustand"
import type { FilmSceneId } from "@/scenes/filmScenes"

export type Chapter = {
  id: string
  name: string
  order: number
  color: string
  start: number
  end: number
}

type FilmState = {
  chapters: Chapter[]
  progress: number
  activeChapterId: string | null
  soundOn: boolean
  isShowingConcepts: boolean
  sceneSelection: { sceneId: FilmSceneId } | null
  setProgress: (progress: number) => void
  toggleConcepts: () => void
  selectScene: (sceneId: FilmSceneId) => void
}

const findActiveChapterId = (chapters: Chapter[], progress: number) => {
  const ordered = [...chapters].sort((chapter, laterChapter) => chapter.order - laterChapter.order)
  const match = ordered.find((chapter, index) => {
    const isLast = index === ordered.length - 1
    return progress >= chapter.start && (isLast ? progress <= chapter.end : progress < chapter.end)
  })
  return match?.id ?? null
}

export const useFilmStore = create<FilmState>((set) => ({
  chapters: [],
  progress: 0,
  activeChapterId: null,
  soundOn: false,
  isShowingConcepts: false,
  setProgress: (progress) =>
    set((state) => ({
      progress,
      activeChapterId: findActiveChapterId(state.chapters, progress),
    })),
  toggleConcepts: () => set((state) => ({ isShowingConcepts: !state.isShowingConcepts })),
  sceneSelection: null,
  selectScene: (sceneId) => set({ sceneSelection: { sceneId }, isShowingConcepts: false }),
}))
