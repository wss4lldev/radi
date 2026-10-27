# Cartoonie

A long animated movie that plays as you scroll. Cute, chibi, and about one person and the things she likes to do.

## The idea

The site is one continuous story on one page. Scrolling is the play button. As the page moves down, she moves with it: she drives a car, then she flies around the world, and other scenes follow in the same way.

Each thing she likes becomes its own chapter. There are many of them, one after another, so the page is a long trip. Driving and flying are two chapters in that trip, with plenty more before and after them. A chapter lasts for a stretch of scrolling, long enough for a few beats: she starts the thing, does it, and the world moves on to the next one.

## What matters most

1. **Scroll is the story.** The animation is tied to how far down the page you are. Moving the scrollbar forward plays the next moment. Moving it back rewinds. Nothing important happens on a timer while you sit still.

2. **One character, a long list of things she likes.** The whole site is about her. Each chapter is one activity she enjoys. The scroll is long because there are many chapters, and every one of them stays in the same story.

3. **Chapters you can see.** A slim marker sits along the side of the film. It names the chapters and shows which one you are in. Choosing a name jumps the scroll to that part. The story underneath is still one page.

4. **Chibi and cute.** Big head, small body, simple shapes, playful motion. The look stays light and friendly in every scene.

5. **One long take, one full-screen frame.** The picture stays fixed and fills the window. She stays in the frame while the world changes around her. The page underneath is long only so there is room to scroll. Scrolling scrubs that frame forward, like a film strip. Chapters flow into each other, from the car to the sky, as one film.

6. **Motion first.** The drawing and the movement are the site. Text is short and only there to name what she is doing. It can be big and sit inside the picture. The animation carries the story.

7. **Color carries the scene.** Each activity gets a bright, flat background. The whole screen can change color when the activity changes. Shapes use clear dark outlines so they read like a cartoon.

## How a visit feels

- You land on her, still, at the start of the trip.
- You scroll. She gets in a car and drives. The road, the background, and her pose all move with the scroll.
- You keep scrolling. The car gives way to the sky. She flies over the world. Places pass underneath as the scroll continues.
- You keep going. Chapter after chapter, each one another thing she likes. The marker on the side moves with you.
- The trip runs for a while. At the bottom it ends. Scrolling back up plays it in reverse.

## Chapters

The site is a long run of chapters. These are the ones already named. The rest get filled in as her favorite things are chosen. Each chapter is a full-screen stretch with its own color, a few beats of motion, and a name on the side marker.

| Order | Chapter | What you see |
| --- | --- | --- |
| 1 | Sets off | She appears, ready to go |
| 2 | Drives a car | She gets in, the road slides past, she keeps driving |
| 3 | Flies around the world | She leaves the ground, crosses sky and places, and keeps going |
| 4 … many | More things she likes | A new place, a new action, the same character and the same scroll |

## Look

[Planetoño](https://www.planetono.space/) is the reference for how a single scene should feel. That site is 3D. This one is 2D, and it runs much longer, with many more scenes in one scroll. What to take from it:

- The frame fills the screen and stays put. Scroll moves the story inside that frame.
- Color is loud and flat. A scene can be one solid color, then the next scene swaps to another.
- Characters and objects read as cartoons: simple shapes and thick outlines. Type is Comic Sans MS.
- A small hint at the start shows that scrolling plays the film.
- Sound exists there as a toggle. Here, sound can come later. The first version is the pictures only.

[End Speciesism](https://endspeciesism.org/) is the reference for the length and the shape. The look of that site stays there. What we take from it:

- One long journey, split into named chapters, still a single scroll.
- A side marker shows the chapter you are in and can jump you along the film.
- Each chapter holds for a while, with a few small moments inside it, before the next chapter begins.
- The character stays with you. The world around her is what changes.

## Tech direction

The stack lives in `TECHSTACK.md`. Next.js, TypeScript, one full-screen Canvas 2D, Zustand, plain CSS, and Comic Sans MS. The page is one tall scroll. Scroll position picks the frame. One page, one character, many chapters. Sound comes in a later pass.
