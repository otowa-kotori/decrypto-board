<script setup lang="ts">
import type { RoundRecord, SideKey } from '../../game/types'

defineProps<{
  mergedRoundCount: number
  sideKeys: SideKey[]
  tableColumns: number[]
  headerWord: (sideKey: SideKey, idx: number) => string
  getRoundRecord: (sideKey: SideKey, round: number) => RoundRecord | undefined
  cellClass: (record: RoundRecord, col: number) => string
}>()
</script>

<template>
  <section class="mb-5 rounded-2xl bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
    <div class="mb-4 flex items-center justify-between gap-2">
      <h2 class="text-base font-semibold tracking-tight text-slate-900">实时记录表</h2>
    </div>
    <div class="overflow-hidden rounded-2xl border border-slate-200">
      <div class="overflow-x-auto">
      <table class="w-full min-w-[860px] table-fixed border-separate border-spacing-0 text-sm">
        <colgroup>
          <col class="w-[11%]" />
          <col v-for="i in 8" :key="i" class="w-[11.125%]" />
        </colgroup>
        <thead>
          <tr class="bg-slate-100">
            <th class="border-b border-r border-slate-200 px-3 py-3 text-left font-semibold text-slate-700" rowspan="2">题目</th>
            <th class="border-b border-r border-slate-200 px-3 py-3 text-center font-semibold text-indigo-700" colspan="4">左侧</th>
            <th class="border-b border-slate-200 px-3 py-3 text-center font-semibold text-blue-700" colspan="4">右侧</th>
          </tr>
          <tr class="bg-white">
            <th v-for="col in tableColumns" :key="`left-head-${col}`" class="border-b border-r border-slate-200 px-3 py-2 text-left font-medium text-slate-500">
              {{ headerWord('left', col - 1) }}
            </th>
            <th v-for="col in tableColumns" :key="`right-head-${col}`" class="border-b border-r border-slate-200 px-3 py-2 text-left font-medium text-slate-500 last:border-r-0">
              {{ headerWord('right', col - 1) }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="mergedRoundCount === 0">
            <td class="bg-white px-3 py-8 text-center text-slate-500" colspan="9">暂无结算结果</td>
          </tr>
          <tr v-for="round in mergedRoundCount" :key="round" class="group bg-white transition-colors hover:bg-indigo-50/30">
            <td class="border-b border-r border-slate-100 bg-slate-50/80 px-3 py-3 font-semibold text-slate-700 group-hover:bg-indigo-50/60">第{{ round }}轮</td>
            <template v-for="sideKey in sideKeys" :key="`${sideKey}-${round}`">
              <td
                v-for="col in tableColumns"
                :key="`${sideKey}-${round}-${col}`"
                class="border-b border-r border-slate-100 px-2 py-2 last:border-r-0"
              >
                <span
                  v-if="getRoundRecord(sideKey, round)?.guesses[col - 1]"
                  class="inline-flex min-h-8 w-full items-center rounded-xl px-2.5 py-1 font-medium"
                  :class="getRoundRecord(sideKey, round) ? cellClass(getRoundRecord(sideKey, round)!, col) || 'text-slate-700' : 'text-slate-700'"
                >
                  {{ getRoundRecord(sideKey, round)?.guesses[col - 1] ?? '' }}
                </span>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
  </section>
</template>
