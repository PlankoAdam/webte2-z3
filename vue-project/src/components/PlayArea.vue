<script setup>
import * as pixi from 'pixi.js'
import { onMounted, ref } from 'vue'
import Player from './game/Player'
import { io } from 'socket.io-client'
import Opponent from './game/Opponent'
import GameOverModal from './GameOverModal.vue'
// import { Layer } from '@pixi/layers'

const pixiCanvas = ref(null)
let lost = ref(false)

const gameWidth = 600
const gameHeight = 600

let pointerInside = false
let pointerCoords = { x: 0, y: 0 }

const app = new pixi.Application()

// let areaLayer = new Layer()
// let trailLayer = new Layer()
// let playerLayer = new Layer()

onMounted(async () => {
  await app.init({
    width: gameWidth,
    height: gameHeight,
    backgroundColor: 0xffffff,
    antialias: true
  })

  // app.stage.addChild(areaLayer)
  // app.stage.addChild(trailLayer)
  // app.stage.addChild(playerLayer)

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
    if (pointerInside && player) {
      player.followPointer(pointerCoords, delta.deltaTime)
    }
  })
  app.ticker.start()
})

let player = new Player(
  4,
  Math.random() * gameWidth,
  Math.random() * gameHeight,
  30,
  Math.random() * 16777215
)

app.stage.addChild(player.area)
app.stage.addChild(player.trail)
player.trail.zIndex = 10
app.stage.addChild(player)
player.zIndex = 20

let otherPlayers = []
let playerId = null

const socket = io('ws://localhost:8080')

socket.on('connected', (id) => {
  playerId = id
  player.socket = socket
  socket.emit('player_joined', {
    id: playerId,
    coords: player.getRoundedPos(),
    color: player.color,
    trail: player.trailPoints,
    area: player.areaOuterPoints.toArray()
  })

  player.setUpdateFunc((pl) => {
    socket.emit('update', {
      id: playerId,
      coords: pl.getRoundedPos(),
      color: pl.color,
      trail: pl.trailPoints,
      area: pl.areaOuterPoints.toArray()
    })
    const plPos = pl.getRoundedPos()
    if (player.trail.containsPoint(plPos)) {
      gameOver(socket, playerId)
    }
  })

  socket.on('player_joined', (players) => {
    players.forEach((pl) => {
      if (pl.id == playerId) return
      if (otherPlayers.find((opl) => opl.id == pl.id)) return

      let newPlayer = new Opponent(pl.id, pl.coords, pl.color)
      otherPlayers.push(newPlayer)
      app.stage.addChild(newPlayer.area)
      app.stage.addChild(newPlayer.trail)
      newPlayer.trail.zIndex = 10
      app.stage.addChild(newPlayer)
      newPlayer.zIndex = 20

      newPlayer.update(pl)
    })

    if (player) {
      player.otherPlayers = otherPlayers
    }
  })

  socket.on('update', (playerData) => {
    let updatedPlayer = otherPlayers.find((pl) => pl.id == playerData.id)
    if (updatedPlayer) {
      updatedPlayer.update(playerData)
      if (player && player.trail.containsPoint(updatedPlayer.getRoundedPos())) {
        gameOver(socket, playerId)
      }
    }
  })

  socket.on('overtake', (playerData) => {
    if (playerData.id == playerId) {
      player.updateArea(playerData.area)
      otherPlayers.forEach((opl) => {
        if (opl.area.containsPoint(player.getRoundedPos())) {
          gameOver(socket, playerId)
        }
      })
    } else {
      let opl = otherPlayers.find((pl) => pl.id == playerData.id)
      if (opl) {
        opl.update(playerData)
      }
    }
  })

  socket.on('disconnected', (id) => {
    let disconnectedPlayer = otherPlayers.find((pl) => pl.id == id)
    app.stage.removeChild(disconnectedPlayer.trail)
    app.stage.removeChild(disconnectedPlayer.area)
    app.stage.removeChild(disconnectedPlayer)

    otherPlayers = otherPlayers.filter((pl) => pl.id != id)
  })
})

function gameOver(socket, id) {
  socket.emit('lose', id)
  app.stage.removeChild(player)
  app.stage.removeChild(player.trail)
  app.stage.removeChild(player.area)
  player = null
  lost.value = true
}
</script>

<template>
  <div>
    <GameOverModal v-if="lost"></GameOverModal>
    <div ref="pixiCanvas"></div>
  </div>
</template>
