import * as pixi from 'pixi.js'
// import { distance, normalize2DVect } from './utils.js'

export default class Player extends pixi.Graphics {
  constructor(moveSpeed, initX, initY) {
    super().circle(0, 0, 10, 10).fill(0xffffff)
    this.moveSpeed = moveSpeed
    this.acceleration = { x: 0, y: 0 }
    this.setPos(initX, initY)
  }

  setPos(x, y) {
    this.position.set(x, y)
  }

  followPointer(pointerCoords, timeDelta) {
    // const screenWidth = this.parent.hitArea.width
    // const screenHeight = this.parent.hitArea.height
    // if (
    //   screenWidth > pointerCoords.x ||
    //   pointerCoords.x > 0 ||
    //   screenHeight > pointerCoords.y ||
    //   pointerCoords.y > 0
    // ) {
    const toMouseDirection = {
      x: pointerCoords.x - this.x,
      y: pointerCoords.y - this.y
    }

    const angleToMouse = Math.atan2(toMouseDirection.x, toMouseDirection.y)
    // const dist = distance(pointerCoords, this.position)
    // const playerSpeed = this.moveSpeed

    // const rotationAngle = Math.atan2(toMouseDirection.y, toMouseDirection.x) + Math.PI / 2
    // this.rotation = rotationAngle

    this.acceleration = {
      x: Math.sin(angleToMouse) * this.moveSpeed,
      y: Math.cos(angleToMouse) * this.moveSpeed
    }

    // this.acceleration = normalize2DVect(this.acceleration)
    // }

    // console.log(this.position.x)
    this.x += this.acceleration.x * timeDelta
    this.y += this.acceleration.y * timeDelta
  }
}
