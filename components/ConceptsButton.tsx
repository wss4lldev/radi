"use client"

import { useFilmStore } from "@/store/film"

export const ConceptsButton = () => {
  const isShowingConcepts = useFilmStore((state) => state.isShowingConcepts)
  const toggleConcepts = useFilmStore((state) => state.toggleConcepts)

  return (
    <button type="button" className="concepts-button" onClick={toggleConcepts}>
      {isShowingConcepts ? "Back to the film" : "See the concepts"}
    </button>
  )
}
