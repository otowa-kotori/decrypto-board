import type { GameState, SideKey, SideState, TimerKind } from './types'

export function isWordsReady(state: GameState, sideKey: SideKey): boolean {
  return state.sides[sideKey].words.every((w) => w.trim().length > 0)
}

export function resetTimerLeft(state: GameState, side: SideState, kind: TimerKind): void {
  if (kind === 'timer1') side.timerOneLeft = state.timerOneDuration
  else side.timerTwoLeft = state.timerTwoDuration
}

export function resetRoundInputs(state: GameState, side: SideState): void {
  side.pendingRoundWords = []
  side.roundWordInput = ''
  side.allyNumberInput = ''
  side.enemyNumberInput = ''
  side.submittedAllyNumbers = null
  side.submittedEnemyNumbers = null
  resetTimerLeft(state, side, 'timer1')
  resetTimerLeft(state, side, 'timer2')
}

export function applySetupWords(state: GameState, leftWords: string[], rightWords: string[]): void {
  state.sides.left.words = leftWords
  state.sides.right.words = rightWords
  state.setupComplete = true
  state.activeSide = 'left'
  state.stage = 'idle'
}

export function pickThreeIndices(state: GameState, picked: number[]): void {
  const side = state.sides[state.activeSide]
  side.selectedIndices.splice(0, side.selectedIndices.length, ...picked)
  side.manualIndexInput = ''
  resetRoundInputs(state, side)
  state.stage = 'numbersGenerated'
}

export function applyManualIndices(state: GameState, indices: number[]): void {
  const side = state.sides[state.activeSide]
  resetRoundInputs(state, side)
  side.selectedIndices.splice(0, side.selectedIndices.length, ...indices)
  side.manualIndexInput = ''
  state.stage = 'numbersGenerated'
}

export function submitRoundWords(state: GameState, tokens: string[]): void {
  const side = state.sides[state.activeSide]
  side.pendingRoundWords = tokens
  side.roundWordInput = ''
  state.stage = 'answerReady'
}

export function submitDecoderNumbers(state: GameState, numbers: number[]): void {
  const side = state.sides[state.activeSide]
  side.submittedAllyNumbers = numbers
  side.allyNumberInput = ''
}

export function submitInterceptorNumbers(state: GameState, numbers: number[]): void {
  const side = state.sides[state.activeSide]
  side.submittedEnemyNumbers = numbers
  side.enemyNumberInput = ''
}

export function revealRound(state: GameState, isFirstRound: boolean): void {
  const side = state.sides[state.activeSide]
  const guesses = ['', '', '', '']
  side.selectedIndices.forEach((idx, i) => {
    guesses[idx - 1] = side.pendingRoundWords[i] ?? ''
  })

  side.records.push({
    round: side.records.length + 1,
    guesses,
    selected: [...side.selectedIndices],
    allyNumbers: side.submittedAllyNumbers ?? [],
    enemyNumbers: isFirstRound ? null : side.submittedEnemyNumbers,
  })

  side.pendingRoundWords = []
  side.selectedIndices = []
  side.allyNumberInput = ''
  side.enemyNumberInput = ''
  side.submittedAllyNumbers = null
  side.submittedEnemyNumbers = null
  state.stage = 'revealed'
}

export function confirmReveal(state: GameState): void {
  const nextSide: SideKey = state.activeSide === 'left' ? 'right' : 'left'
  state.activeSide = nextSide
  state.stage = 'idle'

  const next = state.sides[nextSide]
  resetTimerLeft(state, next, 'timer1')
  resetTimerLeft(state, next, 'timer2')
  next.selectedIndices = []
  next.roundWordInput = ''
  next.pendingRoundWords = []
  next.allyNumberInput = ''
  next.enemyNumberInput = ''
  next.submittedAllyNumbers = null
  next.submittedEnemyNumbers = null
}

export function resetSide(state: GameState, side: SideState): void {
  side.words = ['', '', '', '']
  side.setupInput = ''
  side.selectedIndices = []
  side.manualIndexInput = ''
  side.roundWordInput = ''
  side.pendingRoundWords = []
  side.allyNumberInput = ''
  side.enemyNumberInput = ''
  side.submittedAllyNumbers = null
  side.submittedEnemyNumbers = null
  side.records = []
  resetTimerLeft(state, side, 'timer1')
  resetTimerLeft(state, side, 'timer2')
}
