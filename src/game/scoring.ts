import type { GameState, RoundRecord, ScoreRow, SideKey } from './types'
import { sideKeys } from './types'

export function isExactCodeMatch(target: number[], guess: number[]): boolean {
  return target.length === guess.length && target.every((value, index) => guess[index] === value)
}

export function computePendingInterceptorScore(state: GameState, sideKey: SideKey): number {
  if (state.stage !== 'answer') return 0

  const clueGiver = state.activeSide
  const interceptor: SideKey = clueGiver === 'left' ? 'right' : 'left'
  if (sideKey !== interceptor) return 0

  const clueSide = state.sides[clueGiver]
  const isClueSideFirstRound = clueSide.records.length === 0
  if (isClueSideFirstRound || !clueSide.submittedEnemyNumbers) return 0

  return isExactCodeMatch(clueSide.selectedIndices, clueSide.submittedEnemyNumbers) ? 1 : 0
}

function roundDecodeWrong(record: RoundRecord): number {
  return isExactCodeMatch(record.selected, record.allyNumbers) ? 0 : 1
}

function roundInterceptCorrect(record: RoundRecord): number {
  if (!record.enemyNumbers) return 0
  return isExactCodeMatch(record.selected, record.enemyNumbers) ? 1 : 0
}

export function computeScoreRows(state: GameState): ScoreRow[] {
  return sideKeys.map((sideKey) => {
    const ownRecords = state.sides[sideKey].records
    const opponentKey: SideKey = sideKey === 'left' ? 'right' : 'left'
    const opponentRecords = state.sides[opponentKey].records
    const revealedInterceptCorrect = opponentRecords.reduce((total, record) => total + roundInterceptCorrect(record), 0)

    return {
      sideKey,
      label: state.sides[sideKey].label,
      decodeWrong: ownRecords.reduce((total, record) => total + roundDecodeWrong(record), 0),
      interceptCorrect: revealedInterceptCorrect + computePendingInterceptorScore(state, sideKey),
    }
  })
}
