import { NextResponse } from 'next/server'

const GOOGLE_PLACES_URL = 'https://places.googleapis.com/v1/places'

export async function GET() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  const placeId = process.env.GOOGLE_PLACE_ID

  if (!apiKey || !placeId) {
    return NextResponse.json(
      { error: 'Google reviews are not configured' },
      { status: 503 }
    )
  }

  try {
    const response = await fetch(`${GOOGLE_PLACES_URL}/${encodeURIComponent(placeId)}`, {
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'displayName,rating,userRatingCount,reviews',
      },
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      console.error('Google Places API error:', response.status, await response.text())
      return NextResponse.json({ error: 'Unable to load Google reviews' }, { status: 502 })
    }

    const place = await response.json()
    const reviews = (place.reviews ?? []).map((review: {
      name?: string
      rating?: number
      publishTime?: string
      relativePublishTimeDescription?: string
      text?: { text?: string }
      authorAttribution?: { displayName?: string; photoUri?: string }
    }) => ({
      id: review.name ?? `${review.authorAttribution?.displayName ?? 'review'}-${review.publishTime ?? ''}`,
      rating: review.rating ?? 0,
      text: review.text?.text ?? '',
      publishTime: review.publishTime ?? null,
      relativePublishTimeDescription: review.relativePublishTimeDescription ?? '',
      authorName: review.authorAttribution?.displayName ?? 'Google user',
      authorPhoto: review.authorAttribution?.photoUri ?? null,
    }))

    return NextResponse.json({
      name: place.displayName?.text ?? 'Tarek Salon',
      rating: place.rating ?? null,
      userRatingCount: place.userRatingCount ?? 0,
      reviews,
    })
  } catch (error) {
    console.error('Google reviews request failed:', error)
    return NextResponse.json({ error: 'Unable to load Google reviews' }, { status: 502 })
  }
}
