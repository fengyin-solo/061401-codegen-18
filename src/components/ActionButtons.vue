<script setup lang="ts">
interface Props {
  canGatherWood: boolean
  canGatherStone: boolean
  canHunt: boolean
  canDrink: boolean
  canExplore: boolean
  disabled: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  gatherWood: []
  gatherStone: []
  hunt: []
  drink: []
}>()
</script>

<template>
  <div class="bg-game-card rounded-2xl p-6 border border-game-border shadow-xl">
    <h2 class="text-xl font-bold text-white mb-5 flex items-center gap-2">
      <span>⚡</span>
      <span>行动</span>
    </h2>
    <div class="grid grid-cols-2 gap-3">
      <button
        @click="emit('gatherWood')"
        :disabled="disabled || !canGatherWood"
        :class="[
          'bg-amber-900/40',
          'relative p-4 rounded-xl border border-game-border transition-all duration-200',
          'flex flex-col items-center justify-center gap-2 text-center',
          disabled || !canGatherWood
            ? 'opacity-40 cursor-not-allowed'
            : ['hover:bg-amber-800/60', 'hover:scale-[1.02] hover:shadow-lg cursor-pointer active:scale-[0.98]'],
        ]"
      >
        <span class="text-3xl">🪵</span>
        <span class="text-white font-semibold text-sm">采集木头</span>
        <span class="text-gray-400 text-xs">获得木材，消耗体力</span>
      </button>

      <button
        @click="emit('gatherStone')"
        :disabled="disabled || !canGatherStone"
        :class="[
          'bg-gray-700/40',
          'relative p-4 rounded-xl border border-game-border transition-all duration-200',
          'flex flex-col items-center justify-center gap-2 text-center',
          disabled || !canGatherStone
            ? 'opacity-40 cursor-not-allowed'
            : ['hover:bg-gray-600/60', 'hover:scale-[1.02] hover:shadow-lg cursor-pointer active:scale-[0.98]'],
        ]"
      >
        <span class="text-3xl">🪨</span>
        <span class="text-white font-semibold text-sm">采集石头</span>
        <span class="text-gray-400 text-xs">获得石头，消耗体力</span>
      </button>

      <button
        @click="emit('hunt')"
        :disabled="disabled || !canHunt"
        :class="[
          'bg-red-900/40',
          'relative p-4 rounded-xl border border-game-border transition-all duration-200',
          'flex flex-col items-center justify-center gap-2 text-center',
          disabled || !canHunt
            ? 'opacity-40 cursor-not-allowed'
            : ['hover:bg-red-800/60', 'hover:scale-[1.02] hover:shadow-lg cursor-pointer active:scale-[0.98]'],
        ]"
      >
        <span class="text-3xl">🏹</span>
        <span class="text-white font-semibold text-sm">打猎</span>
        <span class="text-gray-400 text-xs">回复生命，增加饥饿</span>
      </button>

      <button
        @click="emit('drink')"
        :disabled="disabled || !canDrink"
        :class="[
          'bg-blue-900/40',
          'relative p-4 rounded-xl border border-game-border transition-all duration-200',
          'flex flex-col items-center justify-center gap-2 text-center',
          disabled || !canDrink
            ? 'opacity-40 cursor-not-allowed'
            : ['hover:bg-blue-800/60', 'hover:scale-[1.02] hover:shadow-lg cursor-pointer active:scale-[0.98]'],
        ]"
      >
        <span class="text-3xl">💧</span>
        <span class="text-white font-semibold text-sm">喝水</span>
        <span class="text-gray-400 text-xs">减少口渴，消耗木材</span>
      </button>
    </div>

    <div class="mt-3 p-3 rounded-lg bg-emerald-900/20 border border-emerald-700/30">
      <p class="text-emerald-400/80 text-xs text-center">
        🗺️ 在右侧地图上点击未探索区域即可探索新地点
      </p>
    </div>
  </div>
</template>
