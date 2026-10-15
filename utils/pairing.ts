/**
 * Weekly pairing: choose which eligible pairs to introduce so each person gets at most one match.
 *
 * Taking the best-scoring pair first ("greedy") can strand people: pairing A with B at 90 may leave
 * C and D, who each only fit A or B, with nobody. This starts from the greedy pick and then improves
 * it with local swaps until nothing helps:
 *   - re-pair two couples (A-B, C-D → A-D, C-B or A-C, B-D)
 *   - break one couple to pair both people with someone unmatched (A-B + X, Y → A-X, B-Y)
 * A change is kept when it matches more people, or the same number with a higher total.
 *
 * Each candidate pair carries a `weight` (its score, plus any priority boost). Pure function: no I/O.
 */

export interface CandidatePair<T = any> {
  a: string
  b: string
  /** What the pairing maximises: the match score, plus any boost (e.g. for people who missed last week) */
  weight: number
  data?: T
}

const pairKey = (x: string, y: string) => (x < y ? `${x}|${y}` : `${y}|${x}`)

export const choosePairs = <T>(candidates: CandidatePair<T>[], options: { maxRounds?: number } = {}): CandidatePair<T>[] => {
  const byKey = new Map<string, CandidatePair<T>>()
  for (const c of candidates) {
    if (c.a === c.b) continue
    const key = pairKey(c.a, c.b)
    const existing = byKey.get(key)
    if (!existing || c.weight > existing.weight) byKey.set(key, c)
  }
  const edge = (x: string, y: string) => byKey.get(pairKey(x, y))

  // 1. Greedy start
  const sorted = [...byKey.values()].sort((p, q) => q.weight - p.weight)
  const partner = new Map<string, string>()
  for (const c of sorted) {
    if (partner.has(c.a) || partner.has(c.b)) continue
    partner.set(c.a, c.b)
    partner.set(c.b, c.a)
  }

  const people = [...new Set(sorted.flatMap(c => [c.a, c.b]))]
  const couples = () => {
    const seen = new Set<string>()
    const list: [string, string][] = []
    for (const [x, y] of partner) {
      if (seen.has(x)) continue
      seen.add(x)
      seen.add(y)
      list.push([x, y])
    }
    return list
  }
  const setPair = (x: string, y: string) => { partner.set(x, y); partner.set(y, x) }

  // 2. Local improvement
  const maxRounds = options.maxRounds ?? 50
  for (let round = 0; round < maxRounds; round++) {
    let improved = false

    // Break a couple to match two unmatched people (more people matched always wins)
    const unmatched = people.filter(p => !partner.has(p))
    if (unmatched.length >= 2) {
      for (const [a, b] of couples()) {
        if (partner.get(a) !== b) continue
        const free = people.filter(p => !partner.has(p))
        let done = false
        for (const x of free) {
          if (done) break
          for (const y of free) {
            if (x === y) continue
            if (edge(a, x) && edge(b, y)) {
              partner.delete(a); partner.delete(b)
              setPair(a, x); setPair(b, y)
              improved = true
              done = true
              break
            }
          }
        }
      }
    }

    // Swap partners between two couples when the total goes up
    const list = couples()
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const [a, b] = list[i]
        const [c, d] = list[j]
        if (partner.get(a) !== b || partner.get(c) !== d) continue
        const current = (edge(a, b)?.weight ?? 0) + (edge(c, d)?.weight ?? 0)
        const options: [string, string, string, string][] = [[a, d, c, b], [a, c, b, d]]
        for (const [p1, p2, p3, p4] of options) {
          const e1 = edge(p1, p2)
          const e2 = edge(p3, p4)
          if (e1 && e2 && e1.weight + e2.weight > current + 1e-9) {
            setPair(p1, p2)
            setPair(p3, p4)
            list[i] = [p1, p2]
            list[j] = [p3, p4]
            improved = true
            break
          }
        }
      }
    }

    // Re-pair someone with an unmatched person they fit better (A-B + X → A-X when A-X beats A-B)
    for (const [a, b] of couples()) {
      if (partner.get(a) !== b) continue
      const current = edge(a, b)?.weight ?? 0
      for (const x of people.filter(p => !partner.has(p))) {
        for (const [keep, drop] of [[a, b], [b, a]] as const) {
          const e = edge(keep, x)
          if (e && e.weight > current + 1e-9) {
            partner.delete(drop)
            setPair(keep, x)
            improved = true
            break
          }
        }
        if (partner.get(a) !== b) break
      }
    }

    if (!improved) break
  }

  return couples().map(([x, y]) => edge(x, y)!).filter(Boolean)
}

/** Priority for members who opted in last week but weren't matched: added to each pair they're in */
export const MISSED_LAST_WEEK_BOOST = 5
