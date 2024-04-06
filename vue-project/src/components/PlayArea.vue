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
  await app.init({
    width: gameWidth,
    height: gameHeight,
    backgroundColor: 0xffffff,
    antialias: true
  })
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

const player = new Player(4, 300, 300, 30, 0x00ffff)
app.stage.addChild(player.area)
app.stage.addChild(player.trail)
app.stage.addChild(player)
</script>

<template>
  <div>
    <div ref="pixiCanvas"></div>
  </div>
</template>
