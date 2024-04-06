class Node {
  constructor(x, y) {
    this.data = { x, y }
    this.next = null
  }
}

export default class LinkedList {
  constructor() {
    this.head = null
    this.tail = null
  }

  append(p) {
    const newNode = new Node(p.x, p.y)
    if (!this.head) {
      this.head = this.tail = newNode
      return
    }
    this.tail.next = newNode
    this.tail = newNode
    this.tail.next = this.head
  }

  findClosest(p) {
    let closest = null
    let minDistance = Infinity
    let current = this.head

    do {
      const distance = Math.sqrt(
        Math.pow(current.data.x - p.x, 2) + Math.pow(current.data.y - p.y, 2)
      )
      if (distance < minDistance) {
        closest = current
        minDistance = distance
      }
      current = current.next
    } while (current !== this.head)

    return closest
  }

  toArray() {
    const result = []
    let current = this.head
    do {
      result.push(current.data)
      current = current.next
    } while (current !== this.head)
    return result
  }

  appendArray(startNode, endNode, array) {
    if (!startNode.next || startNode === endNode || array.length == 0) {
      return
    }

    let newNode = null,
      prevNode = null
    for (const item of array) {
      newNode = new Node(item.x, item.y)
      if (prevNode) {
        prevNode.next = newNode
      } else {
        startNode.next = newNode
      }
      prevNode = newNode
    }

    prevNode.next = endNode

    this.head = endNode
    this.tail = prevNode
  }

  deepCopy() {
    let newList = new LinkedList()

    let current = this.head
    do {
      newList.append(current.data)
      current = current.next
    } while (current !== this.head)

    return newList
  }
}
