<script setup lang="ts">
interface Props {
  leftInput: string
  rightInput: string
}

defineProps<Props>()

const emit = defineEmits<{
  'update:leftInput': [value: string]
  'update:rightInput': [value: string]
  save: []
}>()
</script>

<template>
  <section class="mb-5 rounded-2xl bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
    <h2 class="mb-4 text-base font-semibold tracking-tight text-slate-900">开局设置</h2>
    <div class="grid gap-3 lg:grid-cols-2">
      <label class="text-sm text-slate-700">
        左侧4个词（空格分隔）
        <input
          :value="leftInput"
          type="text"
          class="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          placeholder="例如：蘑菇 天平 钥匙 消费"
          @input="emit('update:leftInput', ($event.target as HTMLInputElement).value)"
        />
      </label>
      <label class="text-sm text-slate-700">
        右侧4个词（空格分隔）
        <input
          :value="rightInput"
          type="text"
          class="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          placeholder="例如：苹果 齿轮 影子 泡沫"
          @input="emit('update:rightInput', ($event.target as HTMLInputElement).value)"
        />
      </label>
    </div>
    <button
      class="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 sm:w-auto"
      @click="emit('save')"
    >
      保存并开始游戏
    </button>
  </section>
</template>
