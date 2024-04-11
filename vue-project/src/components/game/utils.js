export function distance(p1, p2) {
  const a = p1.x - p2.x
  const b = p1.y - p2.y

  return Math.hypot(a, b)
}

export function normalize2DVect(v) {
  const len = distance({ x: 0, y: 0 }, v)
  if (len === 0) return v
  return { x: v.x / len, y: v.y / len }
}

export function roundPoint(p) {
  return { x: Math.round(p.x), y: Math.round(p.y) }
}

export function polygonArea(vertices) {
  // Check if there are at least 3 vertices
  if (vertices.length < 3) {
    return 'Error: Polygon must have at least 3 vertices'
  }

  let area = 0
  for (let i = 0; i < vertices.length; i++) {
    const j = (i + 1) % vertices.length // Index of the next vertex, wrapping around
    area += vertices[i].x * vertices[j].y - vertices[j].x * vertices[i].y
  }
  return Math.abs(area) / 2
}
