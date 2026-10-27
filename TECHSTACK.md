# Tech stack

Frontend only, for now. The film, the chapters, and the pictures all live in the browser. A backend can be added later if the project needs one. Until then, nothing is fetched from a server.

## Pieces

| Piece | Role |
| --- | --- |
| Next.js | The site. One page, and the React UI around the film. |
| TypeScript | The language for the app, the chapter data, and the drawing code. |
| Canvas 2D | The movie. One full-screen canvas draws her, the world, and each chapter. |
| Zustand | The client store. The canvas and the chapter marker both read it. |
| CSS | The chrome around the film: the chapter marker, short titles, and the scroll hint. |
| Comic Sans MS | The font for chapter names and the short text on screen. |
| Local data | The chapters themselves. Names, order, colors, and where each one sits in the scroll. Stored in the project, not in a database. |

## Next.js

Next.js is the app, written in TypeScript. The visit is one long page. React draws the parts that are UI: the chapter marker, short text, and the scroll hint. The animation is drawn on the canvas.

## Canvas

One 2D canvas stays fixed and fills the window. The page below it is tall so there is room to scroll. Scroll position picks the moment, and the canvas draws that moment.

Moving down the page plays the film forward. Moving up rewinds it. The drawing updates with the scroll, not on a timer.

Simple chibi shapes, flat colors, and outlines are drawn in code with the Canvas 2D API. When a motion needs real drawn frames, such as a drive cycle or a flight cycle, those frames live in the project as a sprite sheet and are painted onto the canvas.

## Scroll

The page uses native scroll. A tall page gives the film its length. Scroll position maps to a frame, the store keeps that progress, and the canvas redraws. Choosing a chapter on the side marker scrolls the page to that stretch.

## Zustand

Zustand is the store. It holds the data the whole page needs. The canvas reads it while it draws. The chapter marker reads it to show where you are. Both stay in sync because they share one store.

What it keeps:

- **Chapters.** The list: name, order, color, and the stretch of scroll each chapter owns.
- **Progress.** How far through the film the scroll is.
- **Active chapter.** Which chapter that progress falls inside. The side marker uses this.
- **Later.** A sound on/off flag, once sound exists. It stays off until then.

Progress can change many times a second while someone scrolls. The store updates that number without rebuilding the whole page. The canvas redraws. React updates the marker when the active chapter changes.

Chapter content is plain data in the project. Adding a chapter means adding an entry and the drawing for it. No API call.

## CSS and type

Plain CSS styles the marker, the titles, and the scroll hint. Comic Sans MS is the typeface for those, and for any words drawn on the canvas. Use the stack `"Comic Sans MS", "Comic Sans", cursive`, so a machine without Comic Sans still gets a casual face. The site does not load a font file.

## No backend yet

There is no server, database, or login. All of the story is shipped with the frontend.

If a backend shows up later, it should feed the same store. The canvas and the marker keep reading the store, so the film does not have to be rewritten to gain a server.

## Later

- **Web Audio**, for sound, once the pictures are in place. The store already has a place for the on/off flag.
- **Vercel**, to host the frontend when the site goes online.
