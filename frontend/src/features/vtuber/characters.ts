import { type VtuberCharacterConfig } from './types'

export const VTUBER_CHARACTERS = {
  cyan: {
    id: 'cyan',
    name: 'Cyan Assistant',
    renderMode: 'three3d',
    modelUrl: '/live2d/cyan/model.model3.json',
    threeModelUrl: '/vtuber/3d/meshy-idle-15-webp1024.glb',
  },
} as const satisfies Record<string, VtuberCharacterConfig>

export type VtuberCharacterId = keyof typeof VTUBER_CHARACTERS

export const DEFAULT_VTUBER_CHARACTER_ID: VtuberCharacterId = 'cyan'
export const DEFAULT_VTUBER_CHARACTER = VTUBER_CHARACTERS[DEFAULT_VTUBER_CHARACTER_ID]
