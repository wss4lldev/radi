import type { MetadataRoute } from "next"

const manifest = (): MetadataRoute.Manifest => ({
  name: "Cartoonie",
  short_name: "Cartoonie",
  description: "A long animated movie that plays as you scroll.",
  start_url: "/",
  display: "fullscreen",
  orientation: "landscape",
  background_color: "#000000",
  theme_color: "#000000",
  icons: [
    { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
    { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
  ],
})

export default manifest
