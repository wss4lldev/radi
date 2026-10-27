"use client"

import { FILM_SCENES } from "@/scenes/filmScenes"
import { useFilmStore } from "@/store/film"

export const SceneSelect = ({ className = "scene-select" }: { className?: string }) => {
  const selectScene = useFilmStore((state) => state.selectScene)

  return (
    <select
      className={className}
      value=""
      aria-label="Choose a scene"
      onChange={(event) => {
        const chosenScene = FILM_SCENES.find(({ id }) => id === event.target.value)
        if (chosenScene) selectScene(chosenScene.id)
      }}
    >
      <option value="" disabled>
        Choose a scene
      </option>
      {FILM_SCENES.map(({ id, name }) => (
        <option key={id} value={id}>
          {name}
        </option>
      ))}
    </select>
  )
}
