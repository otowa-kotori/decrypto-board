<script setup lang="ts">
import type { ScoreRow } from '../../game/types'

defineProps<{
  scoreRows: ScoreRow[]
  scoreLimit: number
}>()
</script>

<template>
  <section class="mb-5 rounded-2xl bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
    <div class="mb-4 flex items-center justify-between gap-2">
      <h2 class="text-base font-semibold tracking-tight text-slate-900">计分表</h2>
    </div>
    <div class="overflow-hidden rounded-2xl border border-slate-200">
      <table class="w-full table-fixed border-separate border-spacing-0 text-sm">
        <colgroup>
          <col class="w-[30%]" />
          <col class="w-[35%]" />
          <col class="w-[35%]" />
        </colgroup>
        <thead>
          <tr class="bg-slate-100">
            <th class="border-b border-r border-slate-200 px-3 py-3 text-left font-semibold text-slate-700">阵营</th>
            <th class="border-b border-r border-slate-200 px-3 py-3 text-left font-semibold text-slate-700">解码错误</th>
            <th class="border-b border-slate-200 px-3 py-3 text-left font-semibold text-slate-700">截码命中</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in scoreRows" :key="row.sideKey" class="group bg-white transition-colors hover:bg-indigo-50/30">
            <td class="border-b border-r border-slate-100 bg-slate-50/80 px-3 py-3 font-semibold text-slate-700 group-hover:bg-indigo-50/60">
              {{ row.label }}
            </td>
            <td class="border-b border-r border-slate-100 px-2 py-3 sm:px-3">
              <div class="flex flex-wrap items-center gap-1">
                <span
                  v-for="i in scoreLimit"
                  :key="`decode-${row.sideKey}-${i}`"
                  class="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ring-1 sm:h-7 sm:w-7 sm:text-sm"
                  :class="i <= row.decodeWrong ? 'bg-rose-50 text-rose-700 ring-rose-200' : 'bg-slate-50 text-slate-300 ring-slate-200'"
                >
                  ✕
                </span>
                <span v-if="row.decodeWrong > scoreLimit" class="text-xs font-semibold text-rose-700">
                  +{{ row.decodeWrong - scoreLimit }}
                </span>
              </div>
            </td>
            <td class="border-b border-slate-100 px-2 py-3 sm:px-3">
              <div class="flex flex-wrap items-center gap-1">
                <span
                  v-for="i in scoreLimit"
                  :key="`intercept-${row.sideKey}-${i}`"
                  class="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ring-1 sm:h-7 sm:w-7 sm:text-sm"
                  :class="i <= row.interceptCorrect ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-slate-50 text-slate-300 ring-slate-200'"
                >
                  ◆
                </span>
                <span v-if="row.interceptCorrect > scoreLimit" class="text-xs font-semibold text-emerald-700">
                  +{{ row.interceptCorrect - scoreLimit }}
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
