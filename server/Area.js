import * as pixi from "pixi.js";

export default class Player {
  constructor(pos, areaPoints, trailPoints) {
    this.pos = pos;
    this.areaPoints = areaPoints;
    this.trailPoints = trailPoints;

    this.area = new pixi.Graphics();
    // this.trail = new pixi.Graphics();
  }
}
