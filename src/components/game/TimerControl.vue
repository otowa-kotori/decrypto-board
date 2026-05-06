<script setup lang="ts">
import type { TimerKind } from '../../game/types'

defineProps<{
  label: string
  value: string
  kind: TimerKind
  runningTimer: TimerKind | null
}>()

const emit = defineEmits<{
  pause: []
  resume: []
}>()
</script>

<template>
  <div class="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
    <div class="text-sm">
      <div class="text-slate-500">{{ label }}</div>
      <div class="font-mono text-2xl font-semibold tracking-wide text-slate-800">{{ value }}</div>
    </div>
    <button
      v-if="runningTimer === kind"
      class="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      @click="emit('pause')"
    >
      暂停
    </button>
    <button
      v-else
      class="rounded-xl bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
      @click="emit('resume')"
    >
      恢复
    </button>
  </div>
</template>
