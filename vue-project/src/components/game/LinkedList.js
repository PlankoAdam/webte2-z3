class Node {
  constructor(x, y) {
    this.data = { x, y }
    // this.prev = null
    this.next = null
  }
}

export default class LinkedList {
  constructor() {
    this.head = null
    this.tail = null
  }

  // Add a new node to the end of the list
  append(p) {
    const newNode = new Node(p.x, p.y)
    if (!this.head) {
      this.head = this.tail = newNode
      return
    }
    this.tail.next = newNode
    // newNode.prev = this.tail
    this.tail = newNode
    this.tail.next = this.head
  }

  // Find the node closest to a given coordinate (x, y)
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
      // console.log(result.length)
    } while (current !== this.head)
    return result
  }

  appendArray(startNode, endNode, array) {
    // Handle cases where startNode or endNode are null (empty list)
    if (!startNode.next || startNode === endNode || array.length == 0) {
      return
    }

    // Create new nodes from the array
    let newNode = null,
      prevNode = null
    for (const item of array) {
      newNode = new Node(item.x, item.y)
      if (prevNode) {
        prevNode.next = newNode
      } else {
        // Connect the first new node to startNode (if replacing from the beginning)
        startNode.next = newNode
      }
      // newNode.prev = prevNode
      prevNode = newNode
    }

    // Connect the last new node to endNode
    prevNode.next = endNode
    // endNode.prev = prevNode

    this.head = startNode
    // this.tail = startNode.prev
    this.tail.next = this.head
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
