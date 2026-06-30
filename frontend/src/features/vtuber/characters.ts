import { type VtuberCharacterConfig } from './types'

export const VTUBER_CHARACTERS = {
  cyan: {
    id: 'cyan',
    name: 'Cyan Assistant',
    renderMode: 'three3d',
    modelUrl: '/live2d/cyan/model.model3.json',
    threeModelUrl:
      '/FBX-asset/charactor_motion/Meshy_AI_Bunny_Mage_Final_Quad_biped/Meshy_AI_Bunny_Mage_Final_Quad_biped_Animation_Idle_15_withSkin.fbx',
    threeTextureUrl:
      '/FBX-asset/charactor_motion/Meshy_AI_Bunny_Mage_Final_Quad_biped/Meshy_AI_Bunny_Mage_Final_Quad_biped_texture_0.png',
  },
} as const satisfies Record<string, VtuberCharacterConfig>

export type VtuberCharacterId = keyof typeof VTUBER_CHARACTERS

export const DEFAULT_VTUBER_CHARACTER_ID: VtuberCharacterId = 'cyan'
export const DEFAULT_VTUBER_CHARACTER = VTUBER_CHARACTERS[DEFAULT_VTUBER_CHARACTER_ID]
