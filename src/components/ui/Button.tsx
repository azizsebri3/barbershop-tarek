import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

export default function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; variant?: Variant }) {
  const styles: Record<Variant, string> = {
    primary: 'bg-accent text-ink hover:bg-accent-hover',
    secondary: 'border border-white/20 bg-white/5 text-bone hover:border-accent/50 hover:bg-white/10',
    ghost: 'text-zinc-300 hover:text-bone',
  }

  return (
    <button className={`min-h-11 rounded-full px-6 py-3 font-semibold transition-colors ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
