<script setup lang="ts">
import type { Stage, TimerKind } from '../../game/types'
import TimerControl from './TimerControl.vue'

defineProps<{
  stage: Stage
  statusText: string
  activeLabel: string
  activeRound: number
  selectedIndices: number[]
  runningTimer: TimerKind | null
  timerOneLeft: string
  timerTwoLeft: string
  isFirstRound: boolean
  manualIndexInput: string
  clueWordInput: string
  decoderInput: string
  interceptorInput: string
  decoderSubmitted: boolean
  interceptorSubmitted: boolean
}>()

const emit = defineEmits<{
  'update:manualIndexInput': [value: string]
  'update:clueWordInput': [value: string]
  'update:decoderInput': [value: string]
  'update:interceptorInput': [value: string]
  pick: []
  applyManual: []
  startTimer: [kind: TimerKind]
  pause: []
  resume: []
  submitClue: []
  submitDecoder: []
  submitInterceptor: []
  confirmReveal: []
}>()
</script>

<template>
  <section class="mb-5 rounded-2xl bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
    <div class="mb-5 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 p-4">
      <div class="text-sm font-medium text-indigo-700">当前阶段</div>
      <div class="mt-1 text-xl font-semibold text-indigo-900">{{ statusText }}</div>
      <div class="mt-2 flex flex-wrap gap-3 text-sm">
        <span>行动方：{{ activeLabel }}</span>
        <span>轮次：第{{ activeRound }}轮</span>
        <span>
          本轮编号：
          <span v-if="selectedIndices.length" class="rounded-xl bg-amber-100 px-2 py-1 font-mono text-amber-800">
            {{ selectedIndices.join(' ') }}
          </span>
          <span v-else>未生成</span>
        </span>
      </div>
    </div>

    <div v-if="stage === 'idle'" class="space-y-3">
      <p class="text-sm text-slate-600">点击后会为{{ activeLabel }}生成本轮3个编号。</p>
      <div class="flex flex-wrap items-end gap-3">
        <button class="w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 sm:w-auto" @click="emit('pick')">
          自动生成3个编号
        </button>
        <label class="text-sm text-slate-700">
          手动输入编号（3个，不重复）
          <input
            :value="manualIndexInput"
            type="text"
            class="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:w-52"
            placeholder="例如：3 1 4"
            @input="emit('update:manualIndexInput', ($event.target as HTMLInputElement).value)"
          />
        </label>
        <button class="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:w-auto" @click="emit('applyManual')">
          使用手动编号
        </button>
      </div>
    </div>

    <div v-else-if="stage === 'numbersGenerated'" class="space-y-3">
      <p class="text-sm text-slate-600">编号已生成。你可以再摇编号或手动覆盖，确认后进入出题阶段。</p>
      <div class="flex flex-wrap items-end gap-3">
        <button class="w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 sm:w-auto" @click="emit('pick')">
          再摇随机编号
        </button>
        <label class="text-sm text-slate-700">
          不满意可改为手动编号
          <input
            :value="manualIndexInput"
            type="text"
            class="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:w-52"
            placeholder="例如：3 1 4"
            @input="emit('update:manualIndexInput', ($event.target as HTMLInputElement).value)"
          />
        </label>
        <button class="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:w-auto" @click="emit('applyManual')">
          覆盖编号
        </button>
      </div>
      <button class="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 sm:w-auto" @click="emit('startTimer', 'timer1')">
        确认编号并进入出题阶段
      </button>
    </div>

    <div v-else-if="stage === 'clue'" class="space-y-3">
      <TimerControl label="出题计时器" :value="timerOneLeft" kind="timer1" :running-timer="runningTimer" @pause="emit('pause')" @resume="emit('resume')" />
      <label class="block text-sm text-slate-700">
        根据编号输入3个词（空格分隔，提交后不显示）
        <input
          :value="clueWordInput"
          type="text"
          class="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          placeholder="例如：门 核弹 昂贵"
          @input="emit('update:clueWordInput', ($event.target as HTMLInputElement).value)"
        />
      </label>
      <button class="w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 sm:w-auto" @click="emit('submitClue')">
        提交出题词
      </button>
    </div>

    <div v-else-if="stage === 'answerReady'" class="space-y-3">
      <p class="text-sm text-slate-600">出题词已提交并隐藏，答题计时器将自动开始。</p>
    </div>

    <div v-else-if="stage === 'answer'" class="space-y-3">
      <TimerControl label="答题计时器" :value="timerTwoLeft" kind="timer2" :running-timer="runningTimer" @pause="emit('pause')" @resume="emit('resume')" />
      <div class="grid gap-3 sm:grid-cols-2">
        <label class="block text-sm text-slate-700">
          解码方数字（3个，空格分隔）
          <input
            :value="decoderInput"
            type="text"
            class="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            placeholder="例如：3 1 4"
            @input="emit('update:decoderInput', ($event.target as HTMLInputElement).value)"
          />
          <button class="mt-2 w-full rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 sm:w-auto" @click="emit('submitDecoder')">
            提交解码方数字
          </button>
          <span v-if="decoderSubmitted" class="ml-2 inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">已提交</span>
        </label>
        <label v-if="!isFirstRound" class="block text-sm text-slate-700">
          截码方数字（3个，空格分隔）
          <input
            :value="interceptorInput"
            type="text"
            class="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            placeholder="例如：1 2 3"
            @input="emit('update:interceptorInput', ($event.target as HTMLInputElement).value)"
          />
          <button class="mt-2 w-full rounded-xl bg-rose-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-rose-700 sm:w-auto" @click="emit('submitInterceptor')">
            提交截码方数字
          </button>
          <span v-if="interceptorSubmitted" class="ml-2 inline-flex rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700">已提交</span>
        </label>
        <div v-else class="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
          第一轮不提交截码方数字。
        </div>
      </div>
    </div>

    <div v-else-if="stage === 'revealed'" class="space-y-3">
      <p class="text-sm text-slate-600">本次答案已公布到当前记录表。确认后进入下一方行动。</p>
      <button class="w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 sm:w-auto" @click="emit('confirmReveal')">
        确定，进入下一方行动
      </button>
    </div>
  </section>
</template>
