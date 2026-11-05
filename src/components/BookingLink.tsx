'use client'

import Link from 'next/link'
import { createPortal } from 'react-dom'
import { useEffect, useState, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from 'react'
import { getBookingHref, isSalonkeeBookingConfigured, type BookingMode } from '@/lib/booking'
import { useLanguage } from '@/lib/language-context'

interface BookingLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  children: ReactNode
  fallbackHref?: string
}

export default function BookingLink({ children, fallbackHref, ...props }: BookingLinkProps) {
  const { locale, t } = useLanguage()
  const salonkeeHref = getBookingHref(locale, fallbackHref)
  const localHref = fallbackHref || `/${locale}/booking`
  const [bookingMode, setBookingMode] = useState<BookingMode>(
    isSalonkeeBookingConfigured() ? 'choice' : 'website',
  )
  const [isChoiceOpen, setIsChoiceOpen] = useState(false)

  useEffect(() => {
    let mounted = true
    fetch('/api/settings')
      .then((response) => response.json())
      .then((data) => {
        const mode = data.settings?.bookingMode
        if (mounted && ['choice', 'website', 'salonkee'].includes(mode)) {
          setBookingMode(mode)
        }
      })
      .catch((error) => console.error('Erreur chargement mode de réservation:', error))

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!isChoiceOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsChoiceOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isChoiceOpen])

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isSalonkeeBookingConfigured() || bookingMode === 'website') {
      props.onClick?.(event)
      return
    }

    props.onClick?.(event)
    if (event.defaultPrevented) return

    if (bookingMode === 'salonkee') return

    event.preventDefault()
    setIsChoiceOpen(true)
  }

  const linkProps = {
    ...props,
    href: bookingMode === 'salonkee' ? salonkeeHref : localHref,
    onClick: handleClick,
  }

  return (
    <>
      {isSalonkeeBookingConfigured() && bookingMode !== 'website' ? (
        <a {...linkProps}>{children}</a>
      ) : (
        <Link href={localHref} {...props}>
          {children}
        </Link>
      )}
      {isChoiceOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setIsChoiceOpen(false)
            }}
          >
            <div
              className="w-full max-w-md rounded-2xl border border-white/10 bg-primary p-6 text-white shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="booking-choice-title"
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h2 id="booking-choice-title" className="text-xl font-bold">
                    {t.booking.choiceTitle}
                  </h2>
                  <p className="mt-2 text-sm text-white/65">{t.booking.choiceDescription}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsChoiceOpen(false)}
                  className="rounded-lg px-2 py-1 text-2xl leading-none text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label={t.booking.closeChoice}
                >
                  ×
                </button>
              </div>

              <div className="grid gap-3">
                <a
                  href={localHref}
                  onClick={() => setIsChoiceOpen(false)}
                  className="rounded-xl bg-accent px-4 py-3 text-center font-bold text-primary transition-colors hover:bg-orange-300"
                >
                  {t.booking.choiceWebsite}
                </a>
                <a
                  href={salonkeeHref}
                  onClick={() => setIsChoiceOpen(false)}
                  className="rounded-xl border border-white/20 px-4 py-3 text-center font-semibold transition-colors hover:bg-white/10"
                >
                  {t.booking.choiceSalonkee}
                </a>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
