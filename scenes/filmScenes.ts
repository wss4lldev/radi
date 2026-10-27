import { KIRA_SCENE_END } from "@/scenes/openingScene"

export const FILM_SCENES = [
  { id: "meetRadi", name: "1. Meet Radi", meetingStartSeconds: null },
  { id: "meetKira", name: "2. Meet Kira", meetingStartSeconds: 0 },
  { id: "cityStreet", name: "3. City Street", meetingStartSeconds: KIRA_SCENE_END },
  { id: "nightClub", name: "4. Night Club", meetingStartSeconds: KIRA_SCENE_END },
  { id: "library", name: "5. Library", meetingStartSeconds: KIRA_SCENE_END },
  { id: "nature", name: "6. Nature Walk", meetingStartSeconds: KIRA_SCENE_END },
  { id: "cosmodrome", name: "7. Cosmodrome", meetingStartSeconds: KIRA_SCENE_END },
  { id: "rocketLaunch", name: "8. Rocket Launch", meetingStartSeconds: KIRA_SCENE_END },
] as const

export type FilmSceneId = (typeof FILM_SCENES)[number]["id"]
