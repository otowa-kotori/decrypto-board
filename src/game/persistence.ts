import type { PersistedGameState } from './types'

export function loadGameState(storageKey: string): PersistedGameState | null {
  const raw = window.localStorage.getItem(storageKey)
  if (!raw) return null

  try {
    return JSON.parse(raw) as PersistedGameState
  } catch {
    window.localStorage.removeItem(storageKey)
    return null
  }
}

export function saveGameState(storageKey: string, state: PersistedGameState): void {
  window.localStorage.setItem(storageKey, JSON.stringify(state))
}

export function clearGameState(storageKey: string): void {
  window.localStorage.removeItem(storageKey)
}
