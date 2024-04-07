import * as pixi from 'pixi.js'

export default class Opponent extends pixi.Graphics {
  constructor(id, coords, color) {
    super()
      .circle(0, 0, 10, 10)
      .fill(color)
      .stroke({ width: 3, color: (color & 0xeeeeee) >> 1 })

    this.id = id

    this.setPos(coords.x, coords.y)
    this.color = color

    this.trail = new pixi.Graphics()
    this.area = new pixi.Graphics()
  }

  update(data) {
    this.setPos(data.coords.x, data.coords.y)
    this.drawTrail(data.trail)
    this.drawArea(data.area)
  }

  setPos(x, y) {
    this.position.set(x, y)
  }

  drawTrail(points) {
    if (points.length < 1) return
    this.trail.clear().moveTo(points[0].x, points[0].y)
    points.forEach((p) => {
      this.trail.lineTo(p.x, p.y)
    })
    this.trail.stroke({ width: 10, color: this.color, join: 'round' })
  }

  drawArea(points) {
    if (points.length < 1) return
    this.area.clear().roundShape(points, 5).fill(this.color)
  }
}
