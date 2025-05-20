// utils/formatDate.js
import { format, parseISO, isValid } from 'date-fns'

/**
 * Formats a date string or Date object to a readable format (e.g., "May 18, 2025").
 * Falls back gracefully if input is invalid.
 * @param {string|Date} dateInput
 * @param {string} dateFormat (optional, default: "MMM d, yyyy")
 * @returns {string}
 */
export default function formatDate(dateInput, dateFormat = 'MMM d, yyyy') {
  let dateObj
  if (!dateInput) return ''
  if (typeof dateInput === 'string') {
    dateObj = parseISO(dateInput)
  } else if (dateInput instanceof Date) {
    dateObj = dateInput
  } else {
    return ''
  }
  if (!isValid(dateObj)) return ''
  return format(dateObj, dateFormat)
}
