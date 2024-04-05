<script setup>
import * as pixi from 'pixi.js'
import { onMounted, ref } from 'vue'
import Player from './game/Player'

const pixiCanvas = ref(null)

const gameWidth = 800
const gameHeight = 600

let pointerInside = false
let pointerCoords = { x: 0, y: 0 }

const app = new pixi.Application()

onMounted(async () => {
  await app.init({ width: gameWidth, height: gameHeight })
  pixiCanvas.value.appendChild(app.canvas)
  app.stage.hitArea = app.screen
  app.stage.eventMode = 'static'

  app.stage.on('mousemove', (e) => {
    pointerCoords.x = e.global.x
    pointerCoords.y = e.global.y
  })

  app.stage.on('mouseleave', () => {
    pointerInside = false
  })

  app.stage.on('mouseenter', () => {
    pointerInside = true
  })

  app.ticker.add((delta) => {
    // console.log(pointerCoords)
    if (pointerInside) {
      player.followPointer(pointerCoords, delta.deltaTime)
    }
  })
  app.ticker.start()
})

const player = app.stage.addChild(new Player(4, gameWidth / 2, gameHeight / 2))
</script>

<template>
  <div>
    <h1>sifaosiaoisdfopashdf</h1>
    <div ref="pixiCanvas"></div>
  </div>
</template>
