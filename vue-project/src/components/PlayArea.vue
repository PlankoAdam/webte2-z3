<script setup>
import * as pixi from 'pixi.js'
import { onMounted, ref } from 'vue'
import Player from './game/Player'
import { io } from 'socket.io-client'
import Opponent from './game/Opponent'

const pixiCanvas = ref(null)

const gameWidth = 600
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
    if (pointerInside) {
      player.followPointer(pointerCoords, delta.deltaTime)
    }
  })
  app.ticker.start()
})

const player = new Player(
  4,
  Math.random() * gameWidth,
  Math.random() * gameHeight,
  30,
  Math.random() * 16777215
)
app.stage.addChild(player.area)
app.stage.addChild(player.trail)
app.stage.addChild(player)

let otherPlayers = []
let playerId = null

const socket = io('ws://localhost:8080')

socket.on('connected', (id) => {
  playerId = id
  console.log(playerId)
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
  })

  socket.on('player_joined', (players) => {
    players.forEach((pl) => {
      if (pl.id == playerId) return
      if (otherPlayers.find((opl) => opl.id == pl.id)) return

      let newPlayer = new Opponent(pl.id, pl.coords, pl.color)
      otherPlayers.push(newPlayer)
      app.stage.addChild(newPlayer.trail)
      app.stage.addChild(newPlayer.area)
      app.stage.addChild(newPlayer)

      newPlayer.update(pl)
    })
    console.log('plyrs on srvr')
    console.log(players)

    console.log('plyrs on client')
    console.log(otherPlayers)
  })

  socket.on('update', (playerData) => {
    let updatedPlayer = otherPlayers.find((pl) => pl.id == playerData.id)
    if (updatedPlayer) {
      updatedPlayer.update(playerData)
    }
  })

  socket.on('disconnected', (id) => {
    console.log('disconn id')
    console.log(id)

    let disconnectedPlayer = otherPlayers.find((pl) => pl.id == id)
    app.stage.removeChild(disconnectedPlayer.trail)
    app.stage.removeChild(disconnectedPlayer.area)
    app.stage.removeChild(disconnectedPlayer)

    otherPlayers = otherPlayers.filter((pl) => pl.id != id)
  })
})
</script>

<template>
  <div>
    <div ref="pixiCanvas"></div>
  </div>
</template>
