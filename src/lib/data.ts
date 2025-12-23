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
  monday: { open: '09:00', close: '19:00', closed: false },
  tuesday: { open: '09:00', close: '19:00', closed: false },
  wednesday: { open: '09:00', close: '19:00', closed: false },
  thursday: { open: '09:00', close: '20:00', closed: false },
  friday: { open: '09:00', close: '20:00', closed: false },
  saturday: { open: '09:00', close: '18:00', closed: false },
  sunday: { open: '', close: '', closed: true },
}

export const services = [
  {
    id: 'coupe-homme',
    name: 'Coupe Homme',
    description: 'Coupe classique ou moderne avec finition impeccable',
    price: 25,
    duration: 30,
  },
  {
    id: 'barbe-coupe',
    name: 'Barbe + Coupe',
    description: 'Entretien complet de la barbe combiné avec une coupe de cheveux',
    price: 40,
    duration: 60,
  },
  {
    id: 'barbe-seulement',
    name: 'Barbe',
    description: 'Rasage traditionnel et taille de barbe premium',
    price: 20,
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
