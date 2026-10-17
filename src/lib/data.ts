export interface OpeningHours {
  monday: { open: string; close: string; closed: boolean }
  tuesday: { open: string; close: string; closed: boolean }
  wednesday: { open: string; close: string; closed: boolean }
  thursday: { open: string; close: string; closed: boolean }
  friday: { open: string; close: string; closed: boolean }
  saturday: { open: string; close: string; closed: boolean }
  sunday: { open: string; close: string; closed: boolean }
}

export const openingHours: OpeningHours = {
  monday: { open: '09:30', close: '19:00', closed: false },
  tuesday: { open: '09:30', close: '19:00', closed: false },
  wednesday: { open: '09:30', close: '19:00', closed: false },
  thursday: { open: '09:30', close: '19:00', closed: false },
  friday: { open: '09:30', close: '19:00', closed: false },
  saturday: { open: '09:30', close: '19:00', closed: false },
  sunday: { open: '', close: '', closed: true },
}

export const services = [
  {
    id: 'coupe-homme',
    name: 'Coupe Homme',
    description: 'Coupe classique ou moderne, finition nette.',
    nameEn: "Men's haircut",
    descriptionEn: 'Classic or modern cut with a clean finish.',
    price: 17,
    duration: 30,
  },
  {
    id: 'barbe-coupe',
    name: 'Barbe + Coupe',
    description: 'Une coupe et une barbe soignées.',
    nameEn: 'Haircut + beard',
    descriptionEn: 'A clean haircut with a well-groomed beard.',
    price: 25,
    duration: 60,
  },
  {
    id: 'barbe-seulement',
    name: 'Taille de barbe',
    description: 'Taille et contours de barbe.',
    nameEn: 'Beard trim',
    descriptionEn: 'Beard trim and clean contours.',
    price: 10,
    duration: 30,
  },
  {
    id: 'coupe-enfant',
    name: 'Coupe Enfant',
    description: 'Une coupe simple et adaptée aux enfants.',
    nameEn: "Children's haircut",
    descriptionEn: 'A simple cut adapted for children.',
    price: 15,
    duration: 30,
  },
  {
    id: 'coupe-senior',
    name: 'Coupe Senior',
    description: 'Une coupe confortable et soignée, adaptée aux cheveux seniors.',
    nameEn: 'Senior haircut',
    descriptionEn: 'A comfortable, well-groomed cut adapted for seniors.',
    price: 15,
    duration: 30,
  },
]

export function isOpenNow(): boolean {
  const now = new Date()
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const dayName = days[now.getDay()] as keyof OpeningHours
  const currentHour = now.getHours().toString().padStart(2, '0')
  const currentMinute = now.getMinutes().toString().padStart(2, '0')
  const currentTime = `${currentHour}:${currentMinute}`

  const dayHours = openingHours[dayName]
  if (dayHours.closed) return false

  return currentTime >= dayHours.open && currentTime <= dayHours.close
}
