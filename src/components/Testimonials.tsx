'use client'

import { useCallback, useEffect, useState, memo } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Star, RefreshCw, ExternalLink } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

interface GoogleReview {
  id: string
  rating: number
  text: string
  publishTime: string | null
  relativePublishTimeDescription: string
  authorName: string
  authorPhoto: string | null
}

interface GoogleReviewsResponse {
  name: string
  rating: number | null
  userRatingCount: number
  reviews: GoogleReview[]
}

const Testimonials = memo(function Testimonials() {
  const { t } = useLanguage()
  const [reviews, setReviews] = useState<GoogleReviewsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const reviewsPerPage = 4

  const fetchTestimonials = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const googleResponse = await fetch('/api/google-reviews')

      if (googleResponse.ok) {
        const data: GoogleReviewsResponse = await googleResponse.json()
        if (data.reviews.length > 0) {
          setReviews(data)
          setCurrentPage(1)
          return
        }
      }

      // Keep the existing approved testimonials until Google Business is configured.
      const legacyResponse = await fetch('/api/testimonials', { cache: 'no-store' })
      if (!legacyResponse.ok) {
        throw new Error('Failed to fetch testimonials')
      }

      const legacyTestimonials = await legacyResponse.json() as Array<{
        id: string
        rating: number
        message: string
        name: string
        created_at: string
      }>

      setReviews({
        name: 'Tarek Salon',
        rating: legacyTestimonials.length > 0
          ? legacyTestimonials.reduce((total, testimonial) => total + testimonial.rating, 0) / legacyTestimonials.length
          : null,
        userRatingCount: legacyTestimonials.length,
        reviews: legacyTestimonials.map((testimonial) => ({
          id: testimonial.id,
          rating: testimonial.rating,
          text: testimonial.message,
          publishTime: testimonial.created_at,
          relativePublishTimeDescription: '',
          authorName: testimonial.name,
          authorPhoto: null,
        })),
      })
      setCurrentPage(1)
    } catch (err) {
      console.error('Error fetching testimonials:', err)
      setError(t.testimonials.error)
    } finally {
      setIsLoading(false)
    }
  }, [t.testimonials.error])

  useEffect(() => {
    fetchTestimonials()
  }, [fetchTestimonials])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  }

  // Calculate statistics
  const avgRating = reviews?.rating?.toFixed(1) ?? '0.0'
  const totalCount = reviews?.userRatingCount ?? 0
  const totalPages = reviews ? Math.ceil(reviews.reviews.length / reviewsPerPage) : 0
  const visibleReviews = reviews
    ? reviews.reviews.slice((currentPage - 1) * reviewsPerPage, currentPage * reviewsPerPage)
    : []

  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent" />
        <div className="absolute top-1/3 left-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px] opacity-30" />
        <div className="absolute bottom-1/3 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] opacity-20" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-6"
          >
            <span className="w-8 h-px bg-accent" />
            <span className="text-sm font-medium text-white/80">{t.testimonials.badge}</span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
            {t.testimonials.title}{' '}
            <span className="bg-gradient-to-r from-white via-gray-300 to-accent bg-clip-text text-transparent">
              {t.testimonials.titleAccent}
            </span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            {t.testimonials.description}
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        {isLoading ? (
          /* Loading State */
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <RefreshCw className="w-8 h-8 text-accent" />
            </motion.div>
          </div>
        ) : error ? (
          /* Error State */
          <div className="text-center py-20">
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchTestimonials}
              className="mt-4 px-6 py-2 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors"
            >
              {t.testimonials.retry}
            </button>
          </div>
        ) : !reviews || reviews.reviews.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 px-4"
          >
            {/* TODO(contenu): connecter la fiche Google Business pour afficher les vrais avis. */}
            <div className="w-12 h-px bg-accent mb-6 mx-auto" />
            <h3 className="text-2xl font-bold text-white mb-3">
              {t.testimonials.emptyTitle}
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              {t.testimonials.emptyDescription}
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6"
          >
            {visibleReviews.map((review) => {
              return (
                <motion.div
                  key={review.id}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group relative bg-white/[0.03] border border-white/10 rounded-2xl p-5 sm:p-6 hover:border-accent/50 transition-all duration-500 shadow-xl shadow-black/20 overflow-hidden"
                >
                  {/* Background glow on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-accent/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Stars */}
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          viewport={{ once: true }}
                        >
                          <Star size={16} className="fill-accent text-accent" />
                        </motion.div>
                      ))}
                    </div>

                    {/* Review Content */}
                    <p className="text-zinc-300 mb-6 text-sm sm:text-base leading-relaxed line-clamp-4">
                      &ldquo;{review.text}&rdquo;
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl">
                        {review.authorPhoto ? (
                          <img src={review.authorPhoto} alt="" className="w-full h-full rounded-xl object-cover" />
                        ) : (
                          review.authorName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{review.authorName}</p>
                        <p className="text-accent/80 text-xs">{review.relativePublishTimeDescription}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {reviews && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              aria-label="Previous reviews"
              className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-white/10 px-3 text-sm text-gray-300 transition hover:border-accent/50 hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <span className="min-w-20 text-center text-sm text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next reviews"
              className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-white/10 px-3 text-sm text-gray-300 transition hover:border-accent/50 hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 sm:mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-12"
        >
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-accent to-gray-300 bg-clip-text text-transparent">
              {avgRating}/5
            </p>
            <p className="text-gray-400 text-sm mt-1">{t.testimonials.averageRating}</p>
          </div>
          <div className="w-px h-12 bg-white/10 hidden sm:block" />
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-accent to-gray-300 bg-clip-text text-transparent">
              {totalCount}+
            </p>
            <p className="text-gray-400 text-sm mt-1">{t.testimonials.clientReviews}</p>
          </div>
          <div className="w-px h-12 bg-white/10 hidden sm:block" />
          <div className="text-center">
            <a
              href="https://g.page/r/CQIG5Mt4inBSEBM/review"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-accent hover:text-white transition-colors"
            >
              {t.testimonials.viewOnGoogle}
              <ExternalLink size={16} />
            </a>
          </div>
        </motion.div>
      </div>

    </section>
  )
})

export default Testimonials
