import { useEffect } from 'react'

const SUFFIX = 'Unboxing Store'

export function useTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${SUFFIX}` : `${SUFFIX} | Unlock Happiness`
  }, [title])
}
