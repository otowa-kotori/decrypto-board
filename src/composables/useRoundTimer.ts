import { onBeforeUnmount, ref } from 'vue'
import type { TimerKind } from '../game/types'

export function useRoundTimer(onTick: (kind: TimerKind) => void) {
  const runningTimer = ref<TimerKind | null>(null)
  let timerId: number | null = null

  function stop(): void {
    if (timerId !== null) {
      window.clearInterval(timerId)
      timerId = null
    }
    runningTimer.value = null
  }

  function start(kind: TimerKind): void {
    stop()
    runningTimer.value = kind
    timerId = window.setInterval(() => {
      onTick(kind)
    }, 1000)
  }

  function pause(): void {
    stop()
  }

  function resume(kind: TimerKind): void {
    start(kind)
  }

  onBeforeUnmount(() => {
    stop()
  })

  return {
    runningTimer,
    start,
    pause,
    resume,
    stop,
  }
}
