import * as pixi from 'pixi.js'
import { distance, roundPoint } from './utils.js'
import LinkedList from './LinkedList.js'

export default class Player extends pixi.Graphics {
  constructor(moveSpeed, initX, initY, initAreaRadius = 50) {
    super().circle(0, 0, 10, 10).fill(0xffffff)
    this.moveSpeed = moveSpeed
    this.acceleration = { x: 0, y: 0 }
    this.setPos(initX, initY)

    const currPos = this.getRoundedPos()
    this.lastPos = currPos

    this.trailPoints = []

    this.area = new pixi.Graphics()
      .circle(currPos.x, currPos.y, initAreaRadius, initAreaRadius)
      .fill(0xffff00)
    this.trail = new pixi.Graphics().moveTo(currPos.x, currPos.y)

    this.prevInArea = true

    this.areaOuterPoints = new LinkedList()

    this.trailBeginPoint = null
    this.trailEndPoint = null

    this.initArea(initAreaRadius)
    console.log(this.areaOuterPoints.head.data)
    console.log(this.areaOuterPoints.tail.next.data)
  }

  setPos(x, y) {
    this.position.set(x, y)
  }

  followPointer(pointerCoords, timeDelta) {
    const toMouseDirection = {
      x: pointerCoords.x - this.x,
      y: pointerCoords.y - this.y
    }

    const angleToMouse = Math.atan2(toMouseDirection.x, toMouseDirection.y)
    this.acceleration = {
      x: Math.sin(angleToMouse) * this.moveSpeed,
      y: Math.cos(angleToMouse) * this.moveSpeed
    }
    this.x += this.acceleration.x * timeDelta
    this.y += this.acceleration.y * timeDelta

    this.updateTrail()
  }

  updateTrail() {
    const currPos = this.getRoundedPos()

    if (distance(this.lastPos, currPos) > 10) {
      // if entering area
      if (this.area.containsPoint(currPos) && !this.prevInArea) {
        this.trail.clear()

        this.trailEndPoint = this.areaOuterPoints.findClosest(currPos)
        console.log('new end point')
        console.log(this.trailEndPoint.data)

        if (this.compareBounds()) {
          console.log('A')
          this.areaOuterPoints.appendArray(
            this.trailBeginPoint,
            this.trailEndPoint,
            this.trailPoints
          )
        } else {
          console.log('B')
          this.areaOuterPoints.appendArray(
            this.trailEndPoint,
            this.trailBeginPoint,
            this.trailPoints.slice().reverse()
          )
        }

        this.fillArea()
        this.trailPoints = []

        if (!this.area.containsPoint(currPos)) {
          this.trailBeginPoint = this.areaOuterPoints.findClosest(currPos)
        }
      } else if (!this.area.containsPoint(currPos)) {
        // if exiting area
        if (this.prevInArea) {
          this.trail.moveTo(currPos.x, currPos.y)
          this.trailPoints.push(this.lastPos)
          // console.log(this.areaOuterPoints.toArray())
          this.trailBeginPoint = this.areaOuterPoints.findClosest(currPos)
          console.log('new begin point')
          console.log(this.trailBeginPoint.data)
        }

        this.trailPoints.push(currPos)
        this.trail.lineTo(currPos.x, currPos.y).stroke({ width: 10, color: 0x00ffff })
      }
      this.prevInArea = this.area.containsPoint(currPos)
      this.lastPos = currPos
    }
  }

  fillArea() {
    console.log(this.areaOuterPoints.toArray())
    this.area.clear().roundShape(this.areaOuterPoints.toArray(), 5).fill(0xffff00)
  }

  getRoundedPos() {
    return roundPoint({ x: this.position.x, y: this.position.y })
  }

  compareBounds() {
    // scenario A
    let g = new pixi.Graphics()
    let copiedList = this.areaOuterPoints.deepCopy()
    let copiedTrailBeginPoint = copiedList.findClosest(this.trailBeginPoint.data)
    let copiedTrailEndPoint = copiedList.findClosest(this.trailEndPoint.data)

    copiedList.appendArray(copiedTrailBeginPoint, copiedTrailEndPoint, this.trailPoints)
    g.clear().roundShape(copiedList.toArray(), 5).fill(0)
    const boundsA = g.bounds

    // scenario B
    g = new pixi.Graphics()
    copiedList = this.areaOuterPoints.deepCopy()
    copiedTrailBeginPoint = copiedList.findClosest(this.trailBeginPoint.data)
    copiedTrailEndPoint = copiedList.findClosest(this.trailEndPoint.data)

    copiedList.appendArray(
      copiedTrailEndPoint,
      copiedTrailBeginPoint,
      this.trailPoints.slice().reverse()
    )
    g.clear().roundShape(copiedList.toArray(), 5).fill(0)
    const boundsB = g.bounds

    const widthA = boundsA.maxX - boundsA.minX
    const heightA = boundsA.maxY - boundsA.minY
    const widthB = boundsB.maxX - boundsB.minX
    const heightB = boundsB.maxY - boundsB.minY

    if (widthA >= widthB && heightA >= heightB) {
      return true
    }
    return false
  }

  initArea(radius) {
    const n = 20

    for (let i = 0; i < n; i++) {
      let newPoint = {
        x: this.getRoundedPos().x + radius * Math.sin((i * 2 * Math.PI) / n),
        y: this.getRoundedPos().y + radius * Math.cos((i * 2 * Math.PI) / n)
      }
      newPoint = roundPoint(newPoint)
      this.areaOuterPoints.append(newPoint)
    }

    this.fillArea()
  }
}
