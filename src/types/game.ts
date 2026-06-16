export interface GameState {
  health: number
  hunger: number
  thirst: number
  wood: number
  stone: number
  turn: number
  isGameOver: boolean
  logs: LogEntry[]
  exploredLocations: string[]
  currentLocationId: string | null
}

export interface LogEntry {
  id: number
  text: string
  type: 'action' | 'event' | 'system' | 'good' | 'bad' | 'map'
  turn: number
}

export interface RandomEvent {
  id: string
  text: string
  type: 'good' | 'bad' | 'neutral'
  effects: {
    health?: number
    hunger?: number
    thirst?: number
    wood?: number
    stone?: number
  }
  requireExplored?: string[]
  exploredBonus?: {
    text: string
    effects: {
      health?: number
      hunger?: number
      thirst?: number
      wood?: number
      stone?: number
    }
  }
}

export type ActionType = 'gatherWood' | 'gatherStone' | 'hunt' | 'drink' | 'explore'

export interface ActionEffect {
  health?: number
  hunger?: number
  thirst?: number
  wood?: number
  stone?: number
}

export interface MapLocation {
  id: string
  name: string
  icon: string
  description: string
  row: number
  col: number
  terrain: 'forest' | 'mountain' | 'river' | 'cave' | 'plain' | 'swamp' | 'ruins'
  effects: ActionEffect
  hint: string
}
