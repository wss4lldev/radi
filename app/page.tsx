import { FilmCanvas } from "@/components/FilmCanvas"
import { SceneSelect } from "@/components/SceneSelect"

const HomePage = () => {
  return (
    <>
      <FilmCanvas />
      <SceneSelect />
      <div className="film-scroll" />
      <div className="rotate-notice" aria-live="polite">
        <div className="rotate-phone" />
        <p>Turn your phone sideways to watch</p>
      </div>
    </>
  )
}

export default HomePage
