import { computed, reactive, watch } from 'vue'
import { useRoundTimer } from './useRoundTimer'
import { clearGameState, loadGameState, saveGameState } from '../game/persistence'
import { computeScoreRows, isExactCodeMatch } from '../game/scoring'
import {
  applyManualIndices,
  applySetupWords,
  confirmReveal,
  isWordsReady,
  pickThreeIndices,
  resetRoundInputs,
  resetSide,
  resetTimerLeft,
  revealRound,
  submitDecoderNumbers,
  submitInterceptorNumbers,
  submitRoundWords,
} from '../game/gameMachine'
import { sideKeys, tableColumns } from '../game/types'
import type {
  GameState,
  NumberSubmitter,
  PersistedGameState,
  PersistedSideState,
  RoundRecord,
  SideKey,
  SideState,
  TimerKind,
} from '../game/types'

const STORAGE_KEY = 'decrypto-game-state'

function createSide(label: string, timerOneDuration: number, timerTwoDuration: number): SideState {
  return {
    label,
    words: ['', '', '', ''],
    setupInput: '',
    selectedIndices: [],
    manualIndexInput: '',
    roundWordInput: '',
    pendingRoundWords: [],
    allyNumberInput: '',
    enemyNumberInput: '',
    submittedAllyNumbers: null,
    submittedEnemyNumbers: null,
    records: [],
    timerOneLeft: timerOneDuration,
    timerTwoLeft: timerTwoDuration,
  }
}

function createInitialState(): GameState {
  const scoreLimit = 2
  const timerOneDuration = 180
  const timerTwoDuration = 300
  return {
    sides: {
      left: createSide('左侧', timerOneDuration, timerTwoDuration),
      right: createSide('右侧', timerOneDuration, timerTwoDuration),
    },
    hideHeaderWords: true,
    activeSide: 'left',
    setupComplete: false,
    stage: 'idle',
    scoreLimit,
    timerOneDuration,
    timerTwoDuration,
  }
}

function sideForStorage(side: SideState): PersistedSideState {
  return {
    words: side.words,
    setupInput: side.setupInput,
    selectedIndices: side.selectedIndices,
    manualIndexInput: side.manualIndexInput,
    roundWordInput: side.roundWordInput,
    pendingRoundWords: side.pendingRoundWords,
    allyNumberInput: side.allyNumberInput,
    enemyNumberInput: side.enemyNumberInput,
    submittedAllyNumbers: side.submittedAllyNumbers,
    submittedEnemyNumbers: side.submittedEnemyNumbers,
    records: side.records,
  }
}

function restoreSide(side: SideState, saved: PersistedSideState, timer1: number, timer2: number): void {
  side.words = saved.words
  side.setupInput = saved.setupInput
  side.selectedIndices = saved.selectedIndices
  side.manualIndexInput = saved.manualIndexInput ?? ''
  side.roundWordInput = saved.roundWordInput
  side.pendingRoundWords = saved.pendingRoundWords
  side.allyNumberInput = saved.allyNumberInput
  side.enemyNumberInput = saved.enemyNumberInput
  side.submittedAllyNumbers = saved.submittedAllyNumbers
  side.submittedEnemyNumbers = saved.submittedEnemyNumbers
  side.records = saved.records
  side.timerOneLeft = timer1
  side.timerTwoLeft = timer2
}

export function useGameEngine() {
  const state = reactive<GameState>(createInitialState())
  const active = computed(() => state.sides[state.activeSide])
  const activeRound = computed(() => active.value.records.length + 1)
  const isFirstRound = computed(() => activeRound.value === 1)
  const mergedRoundCount = computed(() =>
    Math.max(state.sides.left.records.length, state.sides.right.records.length),
  )

  const { runningTimer, start, pause, resume, stop } = useRoundTimer((kind) => {
    const side = active.value
    const field = kind === 'timer1' ? 'timerOneLeft' : 'timerTwoLeft'
    if (side[field] > 0) {
      side[field] -= 1
      return
    }
    stop()
  })

  const statusText = computed(() => {
    if (!state.setupComplete) return '开局设置：输入双方4个题目词'
    if (state.stage === 'numbersGenerated') return '编号确认阶段：可再摇或手动改编号'
    if (state.stage === 'clue') return '出题阶段：根据编号输入3个词'
    if (state.stage === 'answerReady') return '已提交出题词，正在启动答题计时器'
    if (state.stage === 'answer') return '解答阶段：解码方与截码方分别提交数字'
    if (state.stage === 'revealed') return '答案公布阶段'
    return '待开始'
  })

  const scoreRows = computed(() => computeScoreRows(state))

  const persistedState = computed<PersistedGameState>(() => ({
    sides: {
      left: sideForStorage(state.sides.left),
      right: sideForStorage(state.sides.right),
    },
    hideHeaderWords: state.hideHeaderWords,
    activeSide: state.activeSide,
    setupComplete: state.setupComplete,
    stage: state.stage,
    scoreLimit: state.scoreLimit,
    timerOneDuration: state.timerOneDuration,
    timerTwoDuration: state.timerTwoDuration,
  }))

  function loadPersistedState(): void {
    const saved = loadGameState(STORAGE_KEY)
    if (!saved) return

    state.timerOneDuration = saved.timerOneDuration ?? 180
    state.timerTwoDuration = saved.timerTwoDuration ?? 300
    restoreSide(state.sides.left, saved.sides.left, state.timerOneDuration, state.timerTwoDuration)
    restoreSide(state.sides.right, saved.sides.right, state.timerOneDuration, state.timerTwoDuration)
    state.hideHeaderWords = saved.hideHeaderWords ?? true
    state.activeSide = saved.activeSide ?? 'left'
    state.setupComplete = saved.setupComplete ?? false
    state.stage = saved.stage ?? 'idle'
    state.scoreLimit = saved.scoreLimit ?? 2
  }

  loadPersistedState()

  watch(
    persistedState,
    (value) => {
      saveGameState(STORAGE_KEY, value)
    },
    { deep: true },
  )

  function formatTime(seconds: number): string {
    const s = Math.max(0, seconds)
    const mm = String(Math.floor(s / 60)).padStart(2, '0')
    const ss = String(s % 60).padStart(2, '0')
    return `${mm}:${ss}`
  }

  function parseNumbers(input: string): number[] {
    return input
      .trim()
      .split(/\s+/)
      .map((v) => Number(v))
      .filter((n) => Number.isInteger(n) && n >= 1 && n <= 4)
  }

  function parseStrictNumbers(input: string): number[] | null {
    const tokens = input.trim().split(/\s+/).filter(Boolean)
    if (tokens.some((token) => !/^[1-4]$/.test(token))) return null
    return tokens.map((token) => Number(token))
  }

  function minutesToSeconds(minutes: number): number {
    return Math.max(1, Math.round(minutes * 60))
  }

  function secondsToMinutes(seconds: number): number {
    return Number((seconds / 60).toFixed(2))
  }

  function headerWord(sideKey: SideKey, idx: number): string {
    if (!state.hideHeaderWords) return state.sides[sideKey].words[idx] || `词${idx + 1}`
    return `词${idx + 1}`
  }

  function cellClass(record: RoundRecord, col: number): string {
    const word = record.guesses[col - 1]
    if (!word) return ''
    const position = record.selected.indexOf(col)
    if (position === -1) return ''
    return record.allyNumbers[position] === col
      ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
      : 'bg-rose-50 text-rose-800 ring-1 ring-rose-200'
  }

  function getRoundRecord(sideKey: SideKey, round: number): RoundRecord | undefined {
    return state.sides[sideKey].records[round - 1]
  }

  function startTimer(kind: TimerKind): void {
    if (kind === 'timer1' && active.value.selectedIndices.length !== 3) {
      window.alert('请先生成本轮3个编号')
      return
    }
    if (kind === 'timer2' && active.value.pendingRoundWords.length !== 3) {
      window.alert('请先提交出题阶段的3个词')
      return
    }

    state.stage = kind === 'timer1' ? 'clue' : 'answer'
    if (kind === 'timer1' && active.value.timerOneLeft <= 0) resetTimerLeft(state, active.value, 'timer1')
    if (kind === 'timer2' && active.value.timerTwoLeft <= 0) resetTimerLeft(state, active.value, 'timer2')
    start(kind)
  }

  function pauseTimer(): void {
    pause()
  }

  function resumeTimer(): void {
    if (state.stage === 'clue') resume('timer1')
    if (state.stage === 'answer') resume('timer2')
  }

  function randomPick(): number[] {
    const pool = [1, 2, 3, 4]
    const picked: number[] = []
    while (picked.length < 3) {
      const pos = Math.floor(Math.random() * pool.length)
      picked.push(pool[pos])
      pool.splice(pos, 1)
    }
    return picked
  }

  function pickIndices(): void {
    if (!state.setupComplete) {
      window.alert('请先完成开局设置')
      return
    }
    if (!isWordsReady(state, state.activeSide)) {
      window.alert('请先为当前方设置4个词（空格分隔）')
      return
    }
    pickThreeIndices(state, randomPick())
  }

  function applyManualRoundIndices(): void {
    if (!state.setupComplete) {
      window.alert('请先完成开局设置')
      return
    }

    const indices = parseStrictNumbers(active.value.manualIndexInput)
    if (!indices) {
      window.alert('编号只能输入 1~4 的数字，空格分隔')
      return
    }
    const unique = new Set(indices)
    if (indices.length !== 3 || unique.size !== 3) {
      window.alert('请手动输入 3 个不重复编号，范围 1~4，空格分隔')
      return
    }
    applyManualIndices(state, indices)
  }

  function saveSetup(): void {
    const leftWords = state.sides.left.setupInput.trim().split(/\s+/).filter(Boolean)
    const rightWords = state.sides.right.setupInput.trim().split(/\s+/).filter(Boolean)
    if (leftWords.length !== 4 || rightWords.length !== 4) {
      window.alert('左右双方都需要输入4个词，空格分隔')
      return
    }
    applySetupWords(state, leftWords, rightWords)
  }

  function submitClueWords(): void {
    if (active.value.selectedIndices.length !== 3) {
      window.alert('请先生成本轮3个编号')
      return
    }
    const tokens = active.value.roundWordInput.trim().split(/\s+/).filter(Boolean)
    if (tokens.length !== 3) {
      window.alert('请用空格输入 3 个词，例如：门 核弹 昂贵')
      return
    }
    stop()
    submitRoundWords(state, tokens)
    startTimer('timer2')
  }

  function submitNumbers(submitter: NumberSubmitter): void {
    const input = submitter === 'decoder' ? active.value.allyNumberInput : active.value.enemyNumberInput
    const numbers = parseNumbers(input)
    if (numbers.length !== 3) {
      window.alert('请输入 3 个数字，范围 1~4，空格分隔')
      return
    }

    if (submitter === 'decoder') submitDecoderNumbers(state, numbers)
    else {
      if (isFirstRound.value) return
      submitInterceptorNumbers(state, numbers)
    }

    if (active.value.submittedAllyNumbers && (isFirstRound.value || active.value.submittedEnemyNumbers)) {
      if (active.value.pendingRoundWords.length !== 3) {
        window.alert('请先完成计时1词输入并提交')
        return
      }
      revealRound(state, isFirstRound.value)
      stop()
    }
  }

  function confirmRoundReveal(): void {
    confirmReveal(state)
    stop()
  }

  function setTimerDuration(kind: TimerKind, minutes: number): void {
    const seconds = minutesToSeconds(minutes)
    if (kind === 'timer1') {
      state.timerOneDuration = seconds
      if (runningTimer.value !== 'timer1') {
        state.sides.left.timerOneLeft = seconds
        state.sides.right.timerOneLeft = seconds
      }
    } else {
      state.timerTwoDuration = seconds
      if (runningTimer.value !== 'timer2') {
        state.sides.left.timerTwoLeft = seconds
        state.sides.right.timerTwoLeft = seconds
      }
    }
  }

  function resetGame(): void {
    if (!window.confirm('确定要重置游戏吗？当前记录和本地保存都会清空。')) return
    stop()
    clearGameState(STORAGE_KEY)
    resetSide(state, state.sides.left)
    resetSide(state, state.sides.right)
    state.hideHeaderWords = true
    state.activeSide = 'left'
    state.setupComplete = false
    state.stage = 'idle'
  }

  function updateScoreLimit(event: Event): void {
    const value = Number((event.target as HTMLInputElement).valueAsNumber)
    if (!Number.isFinite(value)) return
    state.scoreLimit = Math.max(1, Math.min(10, Math.round(value)))
  }

  function updateTimerOneDuration(event: Event): void {
    setTimerDuration('timer1', (event.target as HTMLInputElement).valueAsNumber)
  }

  function updateTimerTwoDuration(event: Event): void {
    setTimerDuration('timer2', (event.target as HTMLInputElement).valueAsNumber)
  }

  return {
    state,
    active,
    activeRound,
    isFirstRound,
    mergedRoundCount,
    statusText,
    scoreRows,
    scoreLimit: computed(() => state.scoreLimit),
    runningTimer,
    sideKeys,
    tableColumns,
    formatTime,
    headerWord,
    cellClass,
    getRoundRecord,
    secondsToMinutes,
    updateTimerOneDuration,
    updateTimerTwoDuration,
    updateScoreLimit,
    pickIndices,
    applyManualRoundIndices,
    startTimer,
    pauseTimer,
    resumeTimer,
    saveSetup,
    submitClueWords,
    submitNumbers,
    confirmRoundReveal,
    resetGame,
    isExactCodeMatch,
    resetRoundInputs,
  }
}
