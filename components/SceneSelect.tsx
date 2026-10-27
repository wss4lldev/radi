"use client"

import { useEffect, useRef, useState } from "react"
import { FILM_SCENES } from "@/scenes/filmScenes"
import { useFilmStore } from "@/store/film"

const isSecretCombo = (event: KeyboardEvent) => event.ctrlKey && event.shiftKey && event.code === "KeyS"

export const SecretSceneMenu = () => {
  const selectScene = useFilmStore((state) => state.selectScene)
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isSecretCombo(event)) {
        event.preventDefault()
        setIsOpen((wasOpen) => !wasOpen)
      } else if (event.key === "Escape") {
        setIsOpen(false)
      }
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("pointerdown", onPointerDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("pointerdown", onPointerDown)
    }
  }, [])

  useEffect(() => {
    if (isOpen) menuRef.current?.querySelector("button")?.focus()
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div ref={menuRef} className="secret-scene-menu" role="menu" aria-label="Choose a scene">
      {FILM_SCENES.map(({ id, name }) => (
        <button
          key={id}
          type="button"
          role="menuitem"
          onClick={() => {
            selectScene(id)
            setIsOpen(false)
          }}
        >
          {name}
        </button>
      ))}
    </div>
  )
}

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
