import { ptBR } from 'date-fns/locale'
import { ArrowRight, Calendar, MapPin, Settings2, X } from 'lucide-react'
import { useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'

import { Button } from '../../../components/button'
import { formatDateRangeWithAbbreviatedMonth } from '../../../lib/date'

interface DestinationAndDateStepProps {
  isGuestsInputOpen: boolean
  dateRange: DateRange | undefined
  openGuestsInput: () => void
  closeGuestsInput: () => void
  setDestination: (destination: string) => void
  setDateRange: (range: DateRange | undefined) => void
}

export function DestinationAndDateStep({
  isGuestsInputOpen,
  dateRange,
  openGuestsInput,
  closeGuestsInput,
  setDestination,
  setDateRange,
}: DestinationAndDateStepProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  function openDatePicker() {
    setIsDatePickerOpen(true)
  }

  function closeDatePicker() {
    setIsDatePickerOpen(false)
  }

  const formattedDateRange =
    dateRange?.from && dateRange?.to
      ? formatDateRangeWithAbbreviatedMonth(dateRange.from, dateRange.to)
      : null

  return (
    <div className="h-16 bg-zinc-900 px-4 rounded-xl flex items-center shadow-shape gap-3">
      <div className="flex items-center gap-2 flex-1">
        <MapPin className="size-5 to-zinc-400" />
        <input
          type="text"
          placeholder="Para onde você vai?"
          className="bg-transparent text-lg placeholder-zinc-400 outline-none flex-1"
          disabled={isGuestsInputOpen}
          onChange={event => setDestination(event.target.value)}
        />
      </div>

      <button
        type="button"
        onClick={openDatePicker}
        disabled={isGuestsInputOpen}
        className="flex items-center gap-2 text-left w-[240px]"
      >
        <Calendar className="size-5 to-zinc-400" />
        <span className="text-lg text-zinc-400 w-40 flex-1">{formattedDateRange || 'Quando?'}</span>
      </button>

      {isDatePickerOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="rounded-xl py-5 px-6 shadow-shape bg-zinc-900 space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Selecione as datas</h2>
                <button type="button" onClick={closeDatePicker}>
                  <X className="size-5 text-zinc-400" />
                </button>
              </div>
            </div>

            <DayPicker
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              modifiersStyles={{
                selected: {
                  backgroundColor: '#BEF264',
                  color: '#27272A',
                },
              }}
              locale={ptBR}
            />
          </div>
        </div>
      )}

      <div className="w-px h-6 bg-zinc-800" />

      {isGuestsInputOpen ? (
        <Button type="button" onClick={closeGuestsInput} variant="secondary">
          Alterar local/data
          <Settings2 className="size-5" />
        </Button>
      ) : (
        <Button type="button" onClick={openGuestsInput} variant="primary">
          Continuar
          <ArrowRight className="size-5" />
        </Button>
      )}
    </div>
  )
}
