import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatDateRangeWithFullMonth(start: Date | string, end: Date | string): string {
  const month = format(start, 'LLLL', { locale: ptBR })
  return formatDateRange(start, end, month)
}

export function formatDateRangeWithAbbreviatedMonth(
  start: Date | string,
  end: Date | string
): string {
  const month = format(start, 'LLL', { locale: ptBR })
  return formatDateRange(start, end, month)
}

function formatDateRange(start: Date | string, end: Date | string, month: string): string {
  const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1)

  const s = format(start, 'd', { locale: ptBR })
  const e = format(end, 'd', { locale: ptBR })

  return s
    .concat(' de ')
    .concat(capitalizedMonth)
    .concat(' até ')
    .concat(e)
    .concat(' de ')
    .concat(capitalizedMonth)
}
