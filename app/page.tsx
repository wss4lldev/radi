import { FilmCanvas } from "@/components/FilmCanvas"
import { SecretSceneMenu } from "@/components/SceneSelect"

const HomePage = () => {
  return (
    <>
      <FilmCanvas />
      <SecretSceneMenu />
      <div className="film-scroll" />
      <div className="rotate-notice" aria-live="polite">
        <div className="rotate-phone" />
        <p>Turn your phone sideways to watch</p>
      </div>
    </>
  )
}

export default HomePage
