export type SideKey = 'left' | 'right'
export type Stage = 'idle' | 'numbersGenerated' | 'clue' | 'answerReady' | 'answer' | 'revealed'
export type NumberSubmitter = 'decoder' | 'interceptor'
export type TimerKind = 'timer1' | 'timer2'

export interface RoundRecord {
  round: number
  guesses: string[]
  selected: number[]
  allyNumbers: number[]
  enemyNumbers: number[] | null
}

export interface SideState {
  label: string
  words: string[]
  setupInput: string
  selectedIndices: number[]
  manualIndexInput: string
  roundWordInput: string
  pendingRoundWords: string[]
  allyNumberInput: string
  enemyNumberInput: string
  submittedAllyNumbers: number[] | null
  submittedEnemyNumbers: number[] | null
  records: RoundRecord[]
  timerOneLeft: number
  timerTwoLeft: number
}

export interface GameState {
  sides: Record<SideKey, SideState>
  hideHeaderWords: boolean
  activeSide: SideKey
  setupComplete: boolean
  stage: Stage
  scoreLimit: number
  timerOneDuration: number
  timerTwoDuration: number
}

export interface PersistedSideState {
  words: string[]
  setupInput: string
  selectedIndices: number[]
  manualIndexInput: string
  roundWordInput: string
  pendingRoundWords: string[]
  allyNumberInput: string
  enemyNumberInput: string
  submittedAllyNumbers: number[] | null
  submittedEnemyNumbers: number[] | null
  records: RoundRecord[]
}

export interface PersistedGameState {
  sides: Record<SideKey, PersistedSideState>
  hideHeaderWords: boolean
  activeSide: SideKey
  setupComplete: boolean
  stage: Stage
  scoreLimit: number
  timerOneDuration: number
  timerTwoDuration: number
}

export interface ScoreRow {
  sideKey: SideKey
  label: string
  decodeWrong: number
  interceptCorrect: number
}

export const sideKeys: SideKey[] = ['left', 'right']
export const tableColumns = [1, 2, 3, 4]
