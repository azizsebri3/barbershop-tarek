# Copilot Instructions for Elite Services Project

## Project Overview
Elite Services is a modern 2025 showcase website built with Next.js 15, TypeScript, Tailwind CSS, and Framer Motion. 
It features a booking system, pricing page, opening hours display, and smooth animations.

## Technology Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 3.4, Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

## Project Structure
```
src/
  ├── app/
  │   ├── api/bookings/      # Booking API endpoints
  │   ├── booking/           # Booking page
  │   ├── pricing/           # Pricing page
  │   ├── page.tsx           # Home page
  │   ├── layout.tsx         # Root layout
  │   └── globals.css        # Global styles
  ├── components/            # Reusable React components
  │   ├── Header.tsx
  │   ├── Footer.tsx
  │   ├── Hero.tsx
  │   ├── ServiceCard.tsx
  │   ├── BookingForm.tsx
  │   └── OpeningHours.tsx
  └── lib/                   # Utilities
      ├── supabase.ts        # Supabase client
      ├── data.ts            # Site data (services, hours)
      └── email.ts           # Email utilities
```

## Key Features
1. **Responsive Design** - Mobile-first approach
2. **Modern Animations** - Framer Motion for smooth transitions
3. **Booking System** - Complete form with Supabase integration
4. **Pricing Page** - Service comparison and FAQ
5. **Opening Hours** - Dynamic display with real-time status
6. **API Routes** - CRUD operations for bookings

## Important Files
- `INSTALLATION.md` - Step-by-step setup guide (in French)
- `ENVIRONMENT.md` - Environment variables configuration
- `README.md` - Full project documentation
- `.env.local.example` - Environment variables template

## Configuration Steps
1. Install dependencies: `npm install`
2. Set up Supabase project
3. Create bookings table (SQL script in ENVIRONMENT.md)
4. Copy `.env.local.example` to `.env.local`
5. Fill in Supabase credentials
6. Run `npm run dev`

## Development Guidelines
- Use TypeScript for type safety
- Create reusable components
- Keep API routes clean and documented
- Use Tailwind CSS for styling
- Add animations with Framer Motion
- Validate forms on client and server

## Key Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Customization Points
1. **Brand Colors**: Edit `tailwind.config.ts`
2. **Services/Pricing**: Edit `src/lib/data.ts`
3. **Opening Hours**: Edit `src/lib/data.ts`
4. **Company Info**: Update components and data files
5. **Animations**: Modify Framer Motion properties

## Security Considerations
- Keep `.env.local` out of version control (already in .gitignore)
- Use environment variables for sensitive data
- Validate all form inputs
- Use Supabase RLS for database security
- Enable HTTPS in production

## Database Schema
The `bookings` table includes:
- id (UUID primary key)
- name, email, phone (contact info)
- date, time (appointment details)
- service (selected service)
- message (optional notes)
- status (pending/confirmed/cancelled)
- created_at, updated_at (timestamps)

## Deployment Notes
- Deploy to Vercel for optimal Next.js support
- Configure environment variables on hosting platform
- Ensure Supabase project is accessible from production domain
- Set up email service for confirmation emails

## Future Enhancements
- Email confirmation system (SendGrid/Resend)
- Admin dashboard for managing bookings
- Payment integration
- Testimonials/reviews section
- Blog or resources section
- Multi-language support

## Troubleshooting
- If port 3000 is busy: `npm run dev -- -p 3001`
- Clear cache: `rm -rf .next` then `npm run dev`
- Supabase connection issues: verify credentials in `.env.local`
- Build errors: ensure Node.js version is 18+

## Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Supabase Docs](https://supabase.com/docs)
- [React Hook Form](https://react-hook-form.com/)

---

Last Updated: December 2025
Maintained for: Next.js 15+ projects with Supabase
