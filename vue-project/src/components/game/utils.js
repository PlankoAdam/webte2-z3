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
