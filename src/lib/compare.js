import { createContext, useContext } from 'react'

export const MAX_COMPARE = 4

export const CompareContext = createContext(null)

export function useCompare() {
  const ctx = useContext(CompareContext)
  if (!ctx) throw new Error('useCompare harus dipakai di dalam <CompareProvider>')
  return ctx
}
