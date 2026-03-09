const DEFS = {
  S:  { cols: 2, rows: 1 },
  M:  { cols: 2, rows: 2 },
  L:  { cols: 3, rows: 2 },
  XL: { cols: 3, rows: 3 },
}

function pickDef(capacity) {
  if (capacity <= 3) return 'S'
  if (capacity <= 5) return 'M'
  if (capacity <= 8) return 'L'
  return 'XL'
}

export function makeBucketSVG(capacity, id) {
  const R = 12
  const D = R * 2
  const def = DEFS[pickDef(capacity)]
  const cols = def.cols
  const capRows = def.rows
  const W = cols * D
  const bodyH = capRows * D
  const rimY = 2
  const bottomY = rimY + bodyH
  const rimX0 = 0
  const rimX1 = W
  const outerPoly = `${rimX0},${rimY} ${rimX1},${rimY} ${rimX1},${bottomY} ${rimX0},${bottomY}`
  const inset = 2
  const innerPoly = `${rimX0 + inset},${rimY + inset} ${rimX1 - inset},${rimY + inset} ${rimX1 - inset},${bottomY - inset} ${rimX0 + inset},${bottomY - inset}`
  const totalCells = cols * capRows

  const innerApples = []
  let placed = 0
  for (let row = capRows - 1; row >= 0 && placed < Math.min(capacity, totalCells); row--) {
    for (let col = 0; col < cols && placed < Math.min(capacity, totalCells); col++) {
      innerApples.push({ x: rimX0 + col * D + R, y: rimY + row * D, R, k: `${id}-in-${placed}` })
      placed++
    }
  }

  const heapApples = []
  const overflow = Math.max(0, capacity - totalCells)
  let heapH = 0
  if (overflow > 0) {
    let remaining = overflow
    let hrow = 0
    let currentCols = cols
    while (remaining > 0) {
      const inRow = Math.min(remaining, currentCols)
      const offsetX = (cols - inRow) * R
      for (let c = 0; c < inRow; c++) {
        heapApples.push({
          x: rimX0 + offsetX + c * D + R,
          y: rimY - (hrow + 1) * D,
          R,
          k: `${id}-heap-${hrow}-${c}`,
        })
      }
      heapH += D
      remaining -= inRow
      hrow++
      currentCols = Math.max(1, currentCols - 1)
    }
  }

  return {
    id, capacity,
    svgW: W, svgH: rimY + bodyH, heapH,
    outerPoly, innerPoly,
    rimX0, rimX1, rimY,
    innerApples, heapApples,
  }
}

let _uid = 0

export function buildBuckets(total, bucketSize) {
  _uid++
  let uid = _uid * 1000
  const buckets = []
  let remaining = total
  while (remaining > 0) {
    const take = Math.min(bucketSize, remaining)
    buckets.push(makeBucketSVG(take, uid++))
    remaining -= take
  }
  return buckets
}

export function bucketSceneLayout(n) {
  if (n === 0) return []
  if (n <= 3) return [n]
  if (n === 4) return [2, 2]
  if (n === 5) return [3, 2]
  if (n === 6) return [3, 3]
  if (n === 7) return [3, 3, 1]
  if (n === 8) return [3, 3, 2]
  if (n === 9) return [3, 3, 3]
  const rows = []
  let rem = n
  while (rem > 0) { rows.unshift(Math.min(3, rem)); rem -= 3 }
  return rows
}
