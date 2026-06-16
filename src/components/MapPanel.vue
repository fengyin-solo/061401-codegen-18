<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MapLocation } from '@/types/game'
import { MAP_ROWS, MAP_COLS } from '@/data/mapLocations'

interface Props {
  mapLocations: MapLocation[]
  exploredLocations: string[]
  currentLocationId: string | null
  explorationProgress: number
  disabled: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  explore: [locationId: string]
}>()

const hoveredLocation = ref<MapLocation | null>(null)

const grid = computed(() => {
  const g: (MapLocation | null)[][] = []
  for (let r = 0; r < MAP_ROWS; r++) {
    const row: (MapLocation | null)[] = []
    for (let c = 0; c < MAP_COLS; c++) {
      const loc = props.mapLocations.find(l => l.row === r && l.col === c) || null
      row.push(loc)
    }
    g.push(row)
  }
  return g
})

function isExplored(locationId: string): boolean {
  return props.exploredLocations.includes(locationId)
}

function isCurrent(locationId: string): boolean {
  return props.currentLocationId === locationId
}

function getTerrainBg(terrain: MapLocation['terrain'], explored: boolean): string {
  if (!explored) return 'bg-gray-800/60'
  switch (terrain) {
    case 'forest': return 'bg-green-900/50'
    case 'mountain': return 'bg-stone-800/50'
    case 'river': return 'bg-blue-900/50'
    case 'cave': return 'bg-gray-900/60'
    case 'plain': return 'bg-emerald-900/40'
    case 'swamp': return 'bg-lime-900/40'
    case 'ruins': return 'bg-amber-900/40'
    default: return 'bg-gray-800/60'
  }
}

function getTerrainBorder(terrain: MapLocation['terrain'], explored: boolean): string {
  if (!explored) return 'border-gray-700/40'
  switch (terrain) {
    case 'forest': return 'border-green-600/50'
    case 'mountain': return 'border-stone-500/50'
    case 'river': return 'border-blue-500/50'
    case 'cave': return 'border-gray-500/50'
    case 'plain': return 'border-emerald-500/50'
    case 'swamp': return 'border-lime-500/50'
    case 'ruins': return 'border-amber-500/50'
    default: return 'border-gray-700/40'
  }
}

function handleClick(location: MapLocation) {
  if (props.disabled) return
  if (isExplored(location.id)) return
  emit('explore', location.id)
}
</script>

<template>
  <div class="bg-game-card rounded-2xl p-6 border border-game-border shadow-xl">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold text-white flex items-center gap-2">
        <span>🗺️</span>
        <span>探索地图</span>
      </h2>
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-400">探索进度</span>
        <div class="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
            :style="{ width: `${explorationProgress}%` }"
          ></div>
        </div>
        <span class="text-sm font-bold text-emerald-400 tabular-nums">{{ explorationProgress }}%</span>
      </div>
    </div>

    <div class="grid gap-1.5" :style="{ gridTemplateColumns: `repeat(${MAP_COLS}, 1fr)` }">
      <template v-for="(row, rowIndex) in grid" :key="rowIndex">
        <div
          v-for="(cell, colIndex) in row"
          :key="`${rowIndex}-${colIndex}`"
          class="relative aspect-square rounded-lg border transition-all duration-300 flex items-center justify-center"
          :class="[
            getTerrainBg(cell?.terrain ?? 'plain', cell ? isExplored(cell.id) : false),
            getTerrainBorder(cell?.terrain ?? 'plain', cell ? isExplored(cell.id) : false),
            cell && !isExplored(cell.id) && !disabled
              ? 'cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-green-500/20 hover:border-green-400/60'
              : '',
            cell && isCurrent(cell.id) ? 'ring-2 ring-yellow-400/70' : '',
            !cell ? 'opacity-30' : '',
          ]"
          @click="cell ? handleClick(cell) : undefined"
          @mouseenter="hoveredLocation = cell"
          @mouseleave="hoveredLocation = null"
        >
          <template v-if="cell">
            <div v-if="isExplored(cell.id)" class="flex flex-col items-center gap-0.5">
              <span class="text-lg leading-none">{{ cell.icon }}</span>
              <span class="text-[9px] text-gray-300 leading-none text-center truncate w-full px-0.5">{{ cell.name }}</span>
            </div>
            <div v-else class="flex flex-col items-center gap-0.5">
              <span class="text-lg leading-none opacity-60">❓</span>
              <span class="text-[9px] text-gray-500 leading-none">未探索</span>
            </div>
            <div
              v-if="isCurrent(cell.id)"
              class="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse-soft"
            ></div>
            <div
              v-if="isExplored(cell.id)"
              class="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-green-400 rounded-full"
            ></div>
          </template>
        </div>
      </template>
    </div>

    <div
      v-if="hoveredLocation"
      class="mt-3 p-3 rounded-lg bg-gray-800/60 border border-gray-700/50 min-h-[60px] transition-all duration-200"
    >
      <div class="flex items-center gap-2 mb-1">
        <span class="text-base">{{ hoveredLocation.icon }}</span>
        <span class="text-white font-semibold text-sm">{{ hoveredLocation.name }}</span>
        <span
          v-if="isExplored(hoveredLocation.id)"
          class="text-xs px-1.5 py-0.5 rounded bg-green-900/50 text-green-400 border border-green-700/50"
        >
          已探索
        </span>
        <span
          v-else
          class="text-xs px-1.5 py-0.5 rounded bg-gray-700/50 text-gray-400 border border-gray-600/50"
        >
          未探索
        </span>
      </div>
      <p class="text-gray-400 text-xs leading-relaxed">
        {{ isExplored(hoveredLocation.id) ? hoveredLocation.description : '这片区域还未被探索，潜藏着未知的风险与机遇...' }}
      </p>
      <p v-if="isExplored(hoveredLocation.id)" class="text-emerald-400/80 text-xs mt-1">
        💡 {{ hoveredLocation.hint }}
      </p>
    </div>
    <div
      v-else
      class="mt-3 p-3 rounded-lg bg-gray-800/30 border border-gray-700/30 min-h-[60px] flex items-center justify-center"
    >
      <p class="text-gray-500 text-xs">悬停在地图格子上查看详情，点击未探索区域进行探索</p>
    </div>
  </div>
</template>
