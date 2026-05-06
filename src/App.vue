<script setup lang="ts">
import { computed } from 'vue'
import SetupCard from './components/game/SetupCard.vue'
import StagePanel from './components/game/StagePanel.vue'
import CurrentRecordTable from './components/game/CurrentRecordTable.vue'
import ScoreTable from './components/game/ScoreTable.vue'
import { useGameEngine } from './composables/useGameEngine'

const game = useGameEngine()

const activeManualIndexInput = computed({
  get: () => game.active.value.manualIndexInput,
  set: (value: string) => {
    game.active.value.manualIndexInput = value
  },
})

const activeClueWordInput = computed({
  get: () => game.active.value.roundWordInput,
  set: (value: string) => {
    game.active.value.roundWordInput = value
  },
})

const activeDecoderInput = computed({
  get: () => game.active.value.allyNumberInput,
  set: (value: string) => {
    game.active.value.allyNumberInput = value
  },
})

const activeInterceptorInput = computed({
  get: () => game.active.value.enemyNumberInput,
  set: (value: string) => {
    game.active.value.enemyNumberInput = value
  },
})
</script>

<template>
  <main class="min-h-full bg-gradient-to-b from-slate-50 to-indigo-50/40 text-slate-800">
    <div class="mx-auto max-w-6xl p-4 md:p-6">
      <header class="mb-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 p-5 text-white shadow-sm transition-all duration-200 hover:shadow-md">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h1 class="text-2xl font-bold tracking-tight">截码战回合板</h1>
          <button
            class="rounded-xl border border-white/30 bg-white/10 px-3 py-1.5 text-sm font-medium text-white/90 transition hover:bg-white/20"
            @click="game.resetGame"
          >
            重置游戏
          </button>
        </div>

        <div class="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-indigo-50">
          <div class="flex items-center gap-4">
            <div>
              <span class="font-semibold text-white">当前行动方：</span>{{ game.active.value.label }}
            </div>
            <div>
              <span class="font-semibold text-white">当前轮次：</span>第{{ game.activeRound.value }}轮
            </div>
          </div>
          <label class="flex items-center gap-2">
            <input
              v-model="game.state.hideHeaderWords"
              type="checkbox"
              class="h-4 w-4 rounded border-indigo-200/80 bg-white/90 text-indigo-600 focus:ring-2 focus:ring-indigo-200"
            />
            隐藏题目词
          </label>
        </div>

        <details class="mt-4 rounded-xl border border-white/20 bg-white/10 p-3">
          <summary class="cursor-pointer select-none text-sm font-medium text-indigo-50">游戏设置</summary>
          <div class="mt-3 grid gap-3 md:grid-cols-4">
            <label class="text-sm text-indigo-50">
              出题计时器（分钟）
              <input
                type="number"
                min="0.1"
                step="0.5"
                class="mt-1 w-full rounded-xl border border-indigo-200/80 bg-white/95 px-3 py-2 text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                :value="game.secondsToMinutes(game.state.timerOneDuration)"
                @change="game.updateTimerOneDuration"
              />
            </label>
            <label class="text-sm text-indigo-50">
              答题计时器（分钟）
              <input
                type="number"
                min="0.1"
                step="0.5"
                class="mt-1 w-full rounded-xl border border-indigo-200/80 bg-white/95 px-3 py-2 text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                :value="game.secondsToMinutes(game.state.timerTwoDuration)"
                @change="game.updateTimerTwoDuration"
              />
            </label>
            <label class="text-sm text-indigo-50 md:col-span-2">
              计分符号上限
              <input
                type="number"
                min="1"
                max="10"
                step="1"
                class="mt-1 w-full rounded-xl border border-indigo-200/80 bg-white/95 px-3 py-2 text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                :value="game.scoreLimit.value"
                @change="game.updateScoreLimit"
              />
            </label>
          </div>
        </details>
      </header>

      <SetupCard
        v-if="!game.state.setupComplete"
        :left-input="game.state.sides.left.setupInput"
        :right-input="game.state.sides.right.setupInput"
        @update:left-input="game.state.sides.left.setupInput = $event"
        @update:right-input="game.state.sides.right.setupInput = $event"
        @save="game.saveSetup"
      />

      <CurrentRecordTable
        :merged-round-count="game.mergedRoundCount.value"
        :side-keys="game.sideKeys"
        :table-columns="game.tableColumns"
        :header-word="game.headerWord"
        :get-round-record="game.getRoundRecord"
        :cell-class="game.cellClass"
      />

      <div class="grid gap-5 lg:grid-cols-5 lg:items-start">
        <div :class="game.state.setupComplete ? 'lg:col-span-2' : 'lg:col-span-5'">
          <ScoreTable :score-rows="game.scoreRows.value" :score-limit="game.scoreLimit.value" />
        </div>

        <div v-if="game.state.setupComplete" class="lg:col-span-3">
          <StagePanel
            :stage="game.state.stage"
            :status-text="game.statusText.value"
            :active-label="game.active.value.label"
            :active-round="game.activeRound.value"
            :selected-indices="game.active.value.selectedIndices"
            :running-timer="game.runningTimer.value"
            :timer-one-left="game.formatTime(game.active.value.timerOneLeft)"
            :timer-two-left="game.formatTime(game.active.value.timerTwoLeft)"
            :is-first-round="game.isFirstRound.value"
            :manual-index-input="activeManualIndexInput"
            :clue-word-input="activeClueWordInput"
            :decoder-input="activeDecoderInput"
            :interceptor-input="activeInterceptorInput"
            :decoder-submitted="!!game.active.value.submittedAllyNumbers"
            :interceptor-submitted="!!game.active.value.submittedEnemyNumbers"
            @update:manual-index-input="activeManualIndexInput = $event"
            @update:clue-word-input="activeClueWordInput = $event"
            @update:decoder-input="activeDecoderInput = $event"
            @update:interceptor-input="activeInterceptorInput = $event"
            @pick="game.pickIndices"
            @apply-manual="game.applyManualRoundIndices"
            @start-timer="game.startTimer"
            @pause="game.pauseTimer"
            @resume="game.resumeTimer"
            @submit-clue="game.submitClueWords"
            @submit-decoder="game.submitNumbers('decoder')"
            @submit-interceptor="game.submitNumbers('interceptor')"
            @confirm-reveal="game.confirmRoundReveal"
          />
        </div>
      </div>
    </div>
  </main>
</template>
