import * as pixi from 'pixi.js'
import LinkedList from './LinkedList'
import { roundPoint } from './utils'

export default class Opponent extends pixi.Graphics {
  constructor(id, coords, color) {
    super()
      .circle(0, 0, 10, 10)
      .fill(color)
      .stroke({ width: 3, color: (color & 0xeeeeee) >> 1 })

    this.id = id

    this.setPos(coords.x, coords.y)
    this.color = color

    this.trailPoints = []
    this.areaPoints = []

    this.trail = new pixi.Graphics()
    this.area = new pixi.Graphics()
  }

  update(data) {
    this.setPos(data.coords.x, data.coords.y)

    this.trailPoints = data.trail
    this.drawTrail()

    this.areaPoints = data.area
    this.drawArea()
  }

  setPos(x, y) {
    this.position.set(x, y)
  }

  drawTrail() {
    if (this.trailPoints.length < 1) {
      this.trail.clear()
      return
    }
    this.trail.clear().moveTo(this.trailPoints[0].x, this.trailPoints[0].y)
    this.trailPoints.forEach((p) => {
      this.trail.lineTo(p.x, p.y)
    })
    this.trail.stroke({ width: 10, color: this.color, join: 'round' })
  }

  drawArea() {
    if (this.areaPoints.length < 1) return
    this.area.clear().roundShape(this.areaPoints, 5).fill(this.color)
  }

  carveArea(oppTrailPoints, oppArea) {
    if (oppTrailPoints.length == 0) return false
    let insideTrailPoints = oppTrailPoints.filter((e) => {
      return this.area.containsPoint(e)
    })
    if (insideTrailPoints.length == 0 || this.areaPoints.length == 0) return false

    let areaLL = new LinkedList()
    this.areaPoints.forEach((e) => {
      areaLL.append(e)
    })

    let beginNode = areaLL.findClosest(insideTrailPoints[0])
    let endNode = areaLL.findClosest(insideTrailPoints[insideTrailPoints.length - 1])

    const res = this.compareArea(
      oppArea,
      areaLL,
      insideTrailPoints[0],
      insideTrailPoints[insideTrailPoints.length - 1],
      insideTrailPoints
    )

    if (res) {
      areaLL.appendArray(beginNode, endNode, insideTrailPoints)
    } else {
      areaLL.appendArray(endNode, beginNode, insideTrailPoints.reverse())
    }

    this.areaPoints = areaLL.toArray()
    // this.drawArea()
    return true
  }

  compareArea(oppArea, areaLL, trailBeginPoint, trailEndPoint, insideTrailPoints) {
    // let g = new pixi.Graphics()
    let cAreaLL = areaLL.deepCopy()
    let beginNode = cAreaLL.findClosest(trailBeginPoint)
    let endNode = cAreaLL.findClosest(trailEndPoint)

    cAreaLL.appendArray(beginNode, endNode, insideTrailPoints)
    // g.clear().roundShape(cAreaLL.toArray(), 5).fill(0)

    const arr = cAreaLL.toArray()
    let notInShape = 0
    for (let i = 0; i < arr.length; i++) {
      if (!oppArea.containsPoint(arr[i])) notInShape++
    }
    if (notInShape > insideTrailPoints.length + 2) return true
    else return false
  }

  getRoundedPos() {
    return roundPoint({ x: this.position.x, y: this.position.y })
  }
}
