import { ref, computed } from 'vue'
import type { GameState, LogEntry, RandomEvent, ActionType, ActionEffect, MapLocation } from '@/types/game'
import { randomEvents } from '@/data/events'
import { mapLocations } from '@/data/mapLocations'

const STORAGE_KEY_HIGH_SCORE = 'survival_game_high_score'
const STORAGE_KEY_EXPLORED = 'survival_game_explored'
const MAX_STAT = 100

const actionEffects: Record<ActionType, ActionEffect> = {
  gatherWood: {
    health: -5, hunger: 5, thirst: 3, wood: 10, stone: 0 },
  gatherStone: {
    health: -8, hunger: 6, thirst: 4, wood: 0, stone: 8 },
  hunt: {
    health: 15, hunger: -20, thirst: 5, wood: -5, stone: 0 },
  drink: {
    health: 0, hunger: 2, thirst: -25, wood: -3, stone: 0 },
  explore: {
    health: -3, hunger: 4, thirst: 3, wood: 0, stone: 0 },
}

const actionNames: Record<ActionType, string> = {
  gatherWood: '采集木头',
  gatherStone: '采集石头',
  hunt: '打猎',
  drink: '喝水',
  explore: '探索地图',
}

export function useGame() {
  const persistedExplored = loadExploredLocations()

  const state = ref<GameState>({
    health: 80,
    hunger: 30,
    thirst: 30,
    wood: 10,
    stone: 5,
    turn: 0,
    isGameOver: false,
    logs: [],
    exploredLocations: persistedExplored,
    currentLocationId: null,
  })

  const highScore = ref<number>(0)
  let logIdCounter = 0

  const canAct = computed(() => !state.value.isGameOver)

  const unexploredLocations = computed(() => {
    const explored = new Set(state.value.exploredLocations)
    return mapLocations.filter(loc => !explored.has(loc.id))
  })

  const exploredLocationDetails = computed(() => {
    const explored = new Set(state.value.exploredLocations)
    return mapLocations.filter(loc => explored.has(loc.id))
  })

  const explorationProgress = computed(() => {
    return Math.round((state.value.exploredLocations.length / mapLocations.length) * 100)
  })

  function loadHighScore() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HIGH_SCORE)
      if (saved) {
        highScore.value = parseInt(saved, 10) || 0
      }
    } catch (e) {
      highScore.value = 0
    }
  }

  function saveHighScore() {
    if (state.value.turn > highScore.value) {
      highScore.value = state.value.turn
      try {
        localStorage.setItem(STORAGE_KEY_HIGH_SCORE, String(highScore.value))
      } catch (e) {
        // ignore
      }
    }
  }

  function loadExploredLocations(): string[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EXPLORED)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          return parsed.filter((id: string) => mapLocations.some(loc => loc.id === id))
        }
      }
    } catch (e) {
      // ignore
    }
    return []
  }

  function saveExploredLocations() {
    try {
      localStorage.setItem(STORAGE_KEY_EXPLORED, JSON.stringify(state.value.exploredLocations))
    } catch (e) {
      // ignore
    }
  }

  function addLog(text: string, type: LogEntry['type'] = 'action') {
    state.value.logs.unshift({
      id: ++logIdCounter,
      text,
      type,
      turn: state.value.turn,
    })
    if (state.value.logs.length > 50) {
      state.value.logs.pop()
    }
  }

  function clampStat(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value))
  }

  function applyEffects(effects: ActionEffect) {
    if (effects.health !== undefined) {
      state.value.health = clampStat(state.value.health + effects.health, 0, MAX_STAT)
    }
    if (effects.hunger !== undefined) {
      state.value.hunger = clampStat(state.value.hunger + effects.hunger, 0, MAX_STAT)
    }
    if (effects.thirst !== undefined) {
      state.value.thirst = clampStat(state.value.thirst + effects.thirst, 0, MAX_STAT)
    }
    if (effects.wood !== undefined) {
      state.value.wood = Math.max(0, state.value.wood + effects.wood)
    }
    if (effects.stone !== undefined) {
      state.value.stone = Math.max(0, state.value.stone + effects.stone)
    }
  }

  function hasExplored(locationId: string): boolean {
    return state.value.exploredLocations.includes(locationId)
  }

  function getRandomEvent(): RandomEvent {
    const eligibleEvents = randomEvents.filter(event => {
      if (!event.requireExplored || event.requireExplored.length === 0) return true
      return event.requireExplored.some(locId => hasExplored(locId))
    })
    const index = Math.floor(Math.random() * eligibleEvents.length)
    return eligibleEvents[index]
  }

  function applyEventWithExploredBonus(event: RandomEvent) {
    const hasBonus = event.exploredBonus && event.requireExplored?.some(locId => hasExplored(locId))
    if (hasBonus && event.exploredBonus) {
      applyEffects(event.exploredBonus.effects)
      const eventLogType = event.type === 'good' ? 'good' : event.type === 'bad' ? 'bad' : 'event'
      addLog(event.exploredBonus.text, eventLogType)
    } else {
      applyEffects(event.effects)
      const eventLogType = event.type === 'good' ? 'good' : event.type === 'bad' ? 'bad' : 'event'
      addLog(event.text, eventLogType)
    }
  }

  function checkGameOver() {
    if (state.value.health <= 0 || state.value.hunger >= MAX_STAT || state.value.thirst >= MAX_STAT) {
      state.value.isGameOver = true
      saveHighScore()
      addLog('你没能在荒野中生存下来...', 'system')
    }
  }

  function canPerformAction(action: ActionType): boolean {
    if (state.value.isGameOver) return false
    const effects = actionEffects[action]
    if (effects.wood !== undefined && state.value.wood + effects.wood < 0) {
      return false
    }
    if (effects.stone !== undefined && state.value.stone + effects.stone < 0) {
      return false
    }
    if (action === 'explore' && unexploredLocations.value.length === 0) {
      return false
    }
    return true
  }

  function performAction(action: ActionType) {
    if (!canPerformAction(action)) return

    const effects = actionEffects[action]
    applyEffects(effects)
    state.value.turn++

    addLog(`第 ${state.value.turn} 回合：${actionNames[action]}`, 'action')

    const event = getRandomEvent()
    applyEventWithExploredBonus(event)

    checkGameOver()
  }

  function gatherWood() {
    performAction('gatherWood')
  }

  function gatherStone() {
    performAction('gatherStone')
  }

  function hunt() {
    performAction('hunt')
  }

  function drink() {
    performAction('drink')
  }

  function exploreLocation(locationId: string) {
    if (state.value.isGameOver) return
    if (hasExplored(locationId)) return

    const location = mapLocations.find(loc => loc.id === locationId)
    if (!location) return

    const effects = actionEffects.explore
    applyEffects(effects)
    applyEffects(location.effects)

    state.value.exploredLocations.push(locationId)
    state.value.currentLocationId = locationId
    state.value.turn++

    saveExploredLocations()

    addLog(`第 ${state.value.turn} 回合：探索了【${location.name}】`, 'map')
    addLog(`📍 ${location.description}`, 'map')

    const event = getRandomEvent()
    applyEventWithExploredBonus(event)

    checkGameOver()
  }

  function getLocationById(id: string): MapLocation | undefined {
    return mapLocations.find(loc => loc.id === id)
  }

  function restart() {
    state.value = {
      health: 80,
      hunger: 30,
      thirst: 30,
      wood: 10,
      stone: 5,
      turn: 0,
      isGameOver: false,
      logs: [],
      exploredLocations: [...persistedExplored],
      currentLocationId: null,
    }
    logIdCounter = 0

    const exploredCount = persistedExplored.length
    if (exploredCount > 0) {
      addLog('你醒来发现自己身处荒野中，上次探索的记忆依然清晰...', 'system')
      const knownLocations = persistedExplored
        .map(id => mapLocations.find(loc => loc.id === id)?.name)
        .filter(Boolean)
      addLog(`🗺️ 你记得以下区域：${knownLocations.join('、')}`, 'map')
    } else {
      addLog('你醒来发现自己身处荒野中，需要想办法生存下去...', 'system')
    }
  }

  function clearExploredData() {
    state.value.exploredLocations = []
    try {
      localStorage.removeItem(STORAGE_KEY_EXPLORED)
    } catch (e) {
      // ignore
    }
  }

  loadHighScore()

  const exploredCount = persistedExplored.length
  if (exploredCount > 0) {
    addLog('你醒来发现自己身处荒野中，上次探索的记忆依然清晰...', 'system')
    const knownLocations = persistedExplored
      .map(id => mapLocations.find(loc => loc.id === id)?.name)
      .filter(Boolean)
    addLog(`🗺️ 你记得以下区域：${knownLocations.join('、')}`, 'map')
  } else {
    addLog('你醒来发现自己身处荒野中，需要想办法生存下去...', 'system')
  }

  return {
    state,
    highScore,
    canAct,
    canPerformAction,
    gatherWood,
    gatherStone,
    hunt,
    drink,
    exploreLocation,
    restart,
    clearExploredData,
    unexploredLocations,
    exploredLocationDetails,
    explorationProgress,
    mapLocations,
    getLocationById,
  }
}
