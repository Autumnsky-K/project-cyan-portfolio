import {
  type VtuberCharacterConfig,
  type VtuberCharacterOption,
} from './types'

const MANASE_THREE_ROOT = '/vtuber/3d/Manase_Meshy_AI_biped'
const HIENA_THREE_ROOT = '/vtuber/3d/Hiena_Meshy_AI_idol_3_hologram_quad_biped'
const RIKANE_THREE_ROOT = '/vtuber/3d/Rikane10_Meshy_AI_dj_1_autumn_3d_biped'

const animationUrl = (root: string, fileName: string) => `${root}/animations/${fileName}`
const manaseAnimationUrl = (fileName: string) => animationUrl(MANASE_THREE_ROOT, fileName)
const hienaAnimationUrl = (fileName: string) => animationUrl(HIENA_THREE_ROOT, fileName)
const rikaneAnimationUrl = (fileName: string) => animationUrl(RIKANE_THREE_ROOT, fileName)

export const VTUBER_CHARACTERS = {
  manase: {
    id: 'manase',
    name: 'Manase',
    renderMode: 'three3d',
    modelUrl: '/live2d/cyan/model.model3.json',
    threeModelUrl: `${MANASE_THREE_ROOT}/base_with_skin.glb`,
    threeMotionLibrary: {
      clips: {
        standIdleLong: manaseAnimationUrl('Manase_1_Meshy_AI_biped_Animation_Idle_15.glb'),
        standIdleShort: manaseAnimationUrl('Manase_1_Meshy_AI_biped_Animation_Idle_9.glb'),
        soloGroovyWalk: manaseAnimationUrl('Manase_2_Meshy_AI_biped_Animation_Groovy_Walk.glb'),
        soloHipHopDance: manaseAnimationUrl('Manase_2_Meshy_AI_biped_Animation_Hip_Hop_Dance.glb'),
        soloHipHopDance1: manaseAnimationUrl('Manase_2_Meshy_AI_biped_Animation_Hip_Hop_Dance_1.glb'),
        soloHipHopDance2: manaseAnimationUrl('Manase_2_Meshy_AI_biped_Animation_Hip_Hop_Dance_2.glb'),
        soloHipHopDance3: manaseAnimationUrl('Manase_2_Meshy_AI_biped_Animation_Hip_Hop_Dance_3.glb'),
        soloHipHopDance4: manaseAnimationUrl('Manase_2_Meshy_AI_biped_Animation_Hip_Hop_Dance_4.glb'),
        sitEnter: manaseAnimationUrl('Manase_3-1_Meshy_AI_biped_Animation_Stand_to_Sit_Transition_M.glb'),
        sitIdle: manaseAnimationUrl('Manase_3-2_Meshy_AI_biped_Animation_Chair_Sit_Idle_M.glb'),
        sitExit: manaseAnimationUrl('Manase_3-3_Meshy_AI_biped_Animation_Sit_to_Stand_Transition_M.glb'),
        talkHandOnHip: manaseAnimationUrl('Manase_4_Meshy_AI_biped_Animation_Talk_with_Left_Hand_on_Hip.glb'),
        talkHandRaised: manaseAnimationUrl('Manase_4_Meshy_AI_biped_Animation_Talk_with_Left_Hand_Raised.glb'),
        eventAgree: manaseAnimationUrl('Manase_5_Meshy_AI_biped_Animation_Agree_Gesture.glb'),
        eventConfused: manaseAnimationUrl('Manase_5_Meshy_AI_biped_Animation_Depressed_Full_Turn_Left.glb'),
        eventConfident: manaseAnimationUrl('Manase_5_Meshy_AI_biped_Animation_Hand_on_Hip_Gesture.glb'),
        eventSecretDeal: manaseAnimationUrl('Manase_5_Meshy_AI_biped_Animation_Scheming_Hand_Rub.glb'),
        eventWave: manaseAnimationUrl('Manase_5_Meshy_AI_biped_Animation_Wave_One_Hand.glb'),
      },
      auto: {
        helpRequest: 'eventWave',
        standIdle: [
          'standIdleShort',
          'standIdleShort',
          'standIdleShort',
          'standIdleShort',
          'standIdleShort',
          'standIdleLong',
        ],
        solo: [
          'soloGroovyWalk',
          'soloHipHopDance',
          'soloHipHopDance1',
          'soloHipHopDance2',
          'soloHipHopDance3',
          'soloHipHopDance4',
        ],
        sit: {
          enter: 'sitEnter',
          idle: 'sitIdle',
          exit: 'sitExit',
        },
      },
    },
  },
  hiena: {
    id: 'hiena',
    name: 'Hiena',
    renderMode: 'three3d',
    modelUrl: '/live2d/cyan/model.model3.json',
    threeModelUrl: `${HIENA_THREE_ROOT}/base_with_skin.glb`,
    threeMotionLibrary: {
      clips: {
        introVault: hienaAnimationUrl('Hiena_0_Meshy_AI_idol_3_hologram_quad_biped_Animation_Vault_and_Land.glb'),
        standIdleLong: hienaAnimationUrl('Hiena_1_Meshy_AI_idol_3_hologram_quad_biped_Animation_Idle_15.glb'),
        standIdleShort: hienaAnimationUrl('Hiena_1_Meshy_AI_idol_3_hologram_quad_biped_Animation_Idle_9.glb'),
        soloCallGesture: hienaAnimationUrl('Hiena_2_Meshy_AI_idol_3_hologram_quad_biped_Animation_Call_Gesture.glb'),
        soloGroovyWalk: hienaAnimationUrl('Hiena_2_Meshy_AI_idol_3_hologram_quad_biped_Animation_Groovy_Walk.glb'),
        soloHappyJump: hienaAnimationUrl('Hiena_2_Meshy_AI_idol_3_hologram_quad_biped_Animation_Happy_jump_f.glb'),
        soloHipHopDance: hienaAnimationUrl('Hiena_2_Meshy_AI_idol_3_hologram_quad_biped_Animation_Hip_Hop_Dance.glb'),
        soloOmgGroove: hienaAnimationUrl('Hiena_2_Meshy_AI_idol_3_hologram_quad_biped_Animation_OMG_Groove.glb'),
        soloPodBabyGroove: hienaAnimationUrl('Hiena_2_Meshy_AI_idol_3_hologram_quad_biped_Animation_Pod_Baby_Groove.glb'),
        soloYouGroove: hienaAnimationUrl('Hiena_2_Meshy_AI_idol_3_hologram_quad_biped_Animation_You_Groove.glb'),
        sitCrossLegged: hienaAnimationUrl('Hiena_3-2_Meshy_AI_idol_3_hologram_quad_biped_Animation_Sit_Cross_Legged.glb'),
        talkHandOnHip: hienaAnimationUrl('Hiena_4_Meshy_AI_idol_3_hologram_quad_biped_Animation_Talk_with_Right_Hand_Open.glb'),
        talkHandRaised: hienaAnimationUrl('Hiena_4_Meshy_AI_idol_3_hologram_quad_biped_Animation_Talk_with_Hands_Open.glb'),
        eventAgree: hienaAnimationUrl('Hiena_5_Meshy_AI_idol_3_hologram_quad_biped_Animation_Agree_Gesture.glb'),
        eventConfused: hienaAnimationUrl('Hiena_5_Meshy_AI_idol_3_hologram_quad_biped_Animation_OMG_Groove.glb'),
        eventConfident: hienaAnimationUrl('Hiena_5_Meshy_AI_idol_3_hologram_quad_biped_Animation_Victory_Fist_Pump.glb'),
        eventSecretDeal: hienaAnimationUrl('Hiena_2_Meshy_AI_idol_3_hologram_quad_biped_Animation_Call_Gesture.glb'),
        eventWave: hienaAnimationUrl('Hiena_5_Meshy_AI_idol_3_hologram_quad_biped_Animation_Victory_Fist_Pump.glb'),
      },
      auto: {
        helpRequest: 'eventWave',
        intro: 'introVault',
        standIdle: [
          'standIdleShort',
          'standIdleShort',
          'standIdleShort',
          'standIdleShort',
          'standIdleLong',
        ],
        solo: [
          'soloGroovyWalk',
          'soloHipHopDance',
          'soloPodBabyGroove',
          'soloYouGroove',
          'soloCallGesture',
          'soloOmgGroove',
          'soloHappyJump',
        ],
      },
    },
  },
  rikane: {
    id: 'rikane',
    name: 'Rikane',
    renderMode: 'three3d',
    modelUrl: '/live2d/cyan/model.model3.json',
    threeModelUrl: `${RIKANE_THREE_ROOT}/base_with_skin.glb`,
    threeMotionLibrary: {
      clips: {
        standIdleShort: rikaneAnimationUrl('Rikane_1_Meshy_AI_dj_1_autumn_3d_biped_Animation_Idle_9.glb'),
        soloArmCircleShuffle: rikaneAnimationUrl('Rikane_2_Meshy_AI_dj_1_autumn_3d_biped_Animation_Arm_Circle_Shuffle.glb'),
        soloBubbleDance: rikaneAnimationUrl('Rikane_2_Meshy_AI_dj_1_autumn_3d_biped_Animation_Bubble_Dance.glb'),
        soloCherishPopDance: rikaneAnimationUrl('Rikane_2_Meshy_AI_dj_1_autumn_3d_biped_Animation_Cherish_Pop_Dance.glb'),
        soloDenimPopDance: rikaneAnimationUrl('Rikane_2_Meshy_AI_dj_1_autumn_3d_biped_Animation_Denim_Pop_Dance.glb'),
        soloGroovyWalk: rikaneAnimationUrl('Rikane_2_Meshy_AI_dj_1_autumn_3d_biped_Animation_Groovy_Walk.glb'),
        soloHipHopDance: rikaneAnimationUrl('Rikane_2_Meshy_AI_dj_1_autumn_3d_biped_Animation_Hip_Hop_Dance.glb'),
        soloHipHopDance2: rikaneAnimationUrl('Rikane_2_Meshy_AI_dj_1_autumn_3d_biped_Animation_Hip_Hop_Dance_2.glb'),
        soloPodBabyGroove: rikaneAnimationUrl('Rikane_2_Meshy_AI_dj_1_autumn_3d_biped_Animation_Pod_Baby_Groove.glb'),
        soloPopDance: rikaneAnimationUrl('Rikane_2_Meshy_AI_dj_1_autumn_3d_biped_Animation_Pop_Dance_LSA2.glb'),
        soloYouGroove: rikaneAnimationUrl('Rikane_2_Meshy_AI_dj_1_autumn_3d_biped_Animation_You_Groove.glb'),
        talkHandOnHip: rikaneAnimationUrl('Rikane_4_Meshy_AI_dj_1_autumn_3d_biped_Animation_Talk_with_Right_Hand_Open.glb'),
        talkHandRaised: rikaneAnimationUrl('Rikane_4_Meshy_AI_dj_1_autumn_3d_biped_Animation_Talk_with_Hands_Open.glb'),
        eventAgree: rikaneAnimationUrl('Rikane_5_Meshy_AI_dj_1_autumn_3d_biped_Animation_Agree_Gesture.glb'),
        eventConfused: rikaneAnimationUrl('Rikane_5_Meshy_AI_dj_1_autumn_3d_biped_Animation_Not_Your_Mom.glb'),
        eventConfident: rikaneAnimationUrl('Rikane_5_Meshy_AI_dj_1_autumn_3d_biped_Animation_Agree_Gesture.glb'),
        eventSecretDeal: rikaneAnimationUrl('Rikane_2_Meshy_AI_dj_1_autumn_3d_biped_Animation_Arm_Circle_Shuffle.glb'),
        eventWave: rikaneAnimationUrl('Rikane_5_Meshy_AI_dj_1_autumn_3d_biped_Animation_Agree_Gesture.glb'),
      },
      auto: {
        helpRequest: 'eventWave',
        standIdle: [
          'standIdleShort',
          'standIdleShort',
          'standIdleShort',
          'standIdleShort',
        ],
        solo: [
          'soloGroovyWalk',
          'soloHipHopDance',
          'soloHipHopDance2',
          'soloBubbleDance',
          'soloDenimPopDance',
          'soloCherishPopDance',
          'soloPodBabyGroove',
          'soloPopDance',
          'soloYouGroove',
          'soloArmCircleShuffle',
        ],
      },
    },
  },
} as const satisfies Record<string, VtuberCharacterConfig>

export type VtuberCharacterId = keyof typeof VTUBER_CHARACTERS

export const VTUBER_CHARACTER_OPTIONS = [
  { colorLabel: '네온 보라색', id: 'manase', name: 'Manase' },
  { colorLabel: '선명한 노란색', id: 'hiena', name: 'Hiena' },
  { colorLabel: '선명한 주황색', id: 'rikane', name: 'Rikane 10K' },
] as const satisfies readonly VtuberCharacterOption[]

export const DEFAULT_VTUBER_CHARACTER_ID: VtuberCharacterId = 'manase'
export const DEFAULT_VTUBER_CHARACTER = VTUBER_CHARACTERS[DEFAULT_VTUBER_CHARACTER_ID]
