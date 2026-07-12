import { useEffect, useState } from 'react'
import { dismissError, getErrorMessage, subscribeError } from '@/lib/errors/errorStore'

export function useErrorOverlay(): {
  message: string | null
  dismiss: () => void
} {
  const [message, setMessage] = useState<string | null>(getErrorMessage())

  useEffect(() => subscribeError(setMessage), [])

  return { message, dismiss: dismissError }
}
