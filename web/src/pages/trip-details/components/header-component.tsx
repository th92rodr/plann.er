import { Calendar, MapPin, Settings2 } from 'lucide-react'

import { Button } from '../../../components/button'
import { formatDateRangeWithAbbreviatedMonth } from '../../../lib/date'
import type { Trip } from '../index'

interface HeaderComponentProps {
  trip: Trip | undefined
}

export function HeaderComponent({ trip }: HeaderComponentProps) {
  const formattedDateRange = trip
    ? formatDateRangeWithAbbreviatedMonth(trip.starts_at, trip.ends_at)
    : null

  return (
    <div className="px-4 h-16 rounded-xl bg-zinc-900 shadow-shape flex items-center justify-between">
      <div className="flex items-center gap-2">
        <MapPin className="size-5 text-zinc-400" />
        <span className="text-zinc-100">{trip?.destination}</span>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <Calendar className="size-5 text-zinc-400" />
          <span className="text-zinc-100">{formattedDateRange}</span>
        </div>

        <div className="w-px h-6 bg-zinc-800" />

        <Button type="button" variant="secondary">
          Alterar local/data
          <Settings2 className="size-5" />
        </Button>
      </div>
    </div>
  )
}
