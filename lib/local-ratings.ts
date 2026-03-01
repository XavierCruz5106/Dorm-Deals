export const LOCAL_RATINGS_STORAGE_KEY = "dorm_deals_local_ratings_v1"
export const RATINGS_UPDATED_EVENT = "dorm-deals:ratings-updated"

export type LocalRating = {
  id: string
  itemId: string
  reviewerUserId: string
  revieweeUserId: string
  reviewerName: string
  rating: number
  comment: string | null
  tags: string[]
  createdAt: string
}

function emitRatingsUpdated() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(RATINGS_UPDATED_EVENT))
}

export function readLocalRatings(): LocalRating[] {
  if (typeof window === "undefined") return []

  try {
    const raw = window.localStorage.getItem(LOCAL_RATINGS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as LocalRating[]
  } catch {
    return []
  }
}

export function writeLocalRatings(ratings: LocalRating[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(LOCAL_RATINGS_STORAGE_KEY, JSON.stringify(ratings))
  emitRatingsUpdated()
}

export function getRatingsForUser(revieweeUserId: string) {
  return readLocalRatings()
    .filter((rating) => rating.revieweeUserId === revieweeUserId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getGivenRatingsByUser(reviewerUserId: string) {
  return readLocalRatings()
    .filter((rating) => rating.reviewerUserId === reviewerUserId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getMyRatingForItem(itemId: string, reviewerUserId: string) {
  return readLocalRatings().find(
    (rating) => rating.itemId === itemId && rating.reviewerUserId === reviewerUserId,
  )
}

export function upsertLocalRating(input: Omit<LocalRating, "id" | "createdAt">) {
  const ratings = readLocalRatings()
  const existingIndex = ratings.findIndex(
    (rating) => rating.itemId === input.itemId && rating.reviewerUserId === input.reviewerUserId,
  )

  const next: LocalRating = {
    id: existingIndex >= 0 ? ratings[existingIndex].id : crypto.randomUUID(),
    createdAt: existingIndex >= 0 ? ratings[existingIndex].createdAt : new Date().toISOString(),
    ...input,
  }

  if (existingIndex >= 0) {
    ratings[existingIndex] = next
  } else {
    ratings.push(next)
  }

  writeLocalRatings(ratings)
  return next
}

export function getRatingSummaryForUser(revieweeUserId: string) {
  const ratings = getRatingsForUser(revieweeUserId)
  if (!ratings.length) {
    return { avgRating: 0, ratingCount: 0 }
  }

  const total = ratings.reduce((sum, r) => sum + Number(r.rating || 0), 0)
  const avg = total / ratings.length
  return { avgRating: Number(avg.toFixed(1)), ratingCount: ratings.length }
}
