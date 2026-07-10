import { type ReactElement, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'

import {
  type VtuberCharacterRenderStatus,
  type VtuberCharacterConfig,
  type VtuberDisplayState,
  type VtuberMotionKey,
  type VtuberThreeMotionLibrary,
} from './types'

type ThreeDCharacterProps = {
  character: VtuberCharacterConfig
  danceTriggerId?: number
  displayState: VtuberDisplayState
  greetingSpeechTriggerId?: number
  motionKey?: VtuberMotionKey | null
  onBubbleAnchorChange?: (anchor: ThreeDScreenAnchor | null) => void
  onHelpWaveStart?: () => void
  motionTriggerId?: number
  onRenderStatusChange?: (status: VtuberCharacterRenderStatus) => void
  statusLabel: string
}

type RenderStatus = VtuberCharacterRenderStatus
type ThreeDScreenAnchor = {
  left: number
  top: number
}
type LoadedThreeDAnimationClip = {
  assetKey?: string
  clip: THREE.AnimationClip
}
type LoadedThreeDModel = {
  object: THREE.Object3D
  animationClips: LoadedThreeDAnimationClip[]
}
type NamedAnimationAction = {
  action: THREE.AnimationAction
  assetKey?: string
  normalizedName: string
}
type BlendCurve = 'linear' | 'smoothstep' | 'smootherstep'
type AutoMotionPhase =
  | 'not-started'
  | 'intro'
  | 'stand-idle'
  | 'solo'
  | 'sit-enter'
  | 'sit-enter-to-idle'
  | 'sit-idle'
  | 'sit-exit'
  | 'sit-exit-dance'
  | 'sit-exit-help-wave'
  | 'help-wave'
  | 'manual'
type AutoMotionRuntime = {
  endsAt: number
  lastSoloKey?: string
  lastStandIdleKey?: string
  nextAt: number
  phase: AutoMotionPhase
  soloQueue?: string[]
}
type RootMotionRestPose = {
  armature?: THREE.Vector3
  hips?: THREE.Vector3
  root?: THREE.Vector3
}
type FootAnchorState = {
  leftFoot?: THREE.Object3D
  rightFoot?: THREE.Object3D
  targetCenter: THREE.Vector3 | null
  tempCenter: THREE.Vector3
  tempFootPosition: THREE.Vector3
}
type MotionTransitionSpec = {
  blendDurationSeconds: number
  curve: BlendCurve
  fromAssetKey: string
  markerSeconds?: number
  poseMatch?: {
    boneNames: string[]
    samples: number
    searchEndRatio: number
    searchStartRatio: number
  }
  toAssetKey: string
}
type ActiveMotionBlend = {
  anchorFeet: boolean
  curve: BlendCurve
  duration: number
  fromAction: THREE.AnimationAction
  phaseAfterComplete: AutoMotionPhase
  startedAt: number
  toAction: THREE.AnimationAction
}
type ThreeDLightProfile = {
  fillIntensity: number
  hemisphereIntensity: number
  keyIntensity: number
  shadowOpacity: number
}
type ThreeDFrameProfile = {
  cameraPadding: number
  cameraYOffsetRatio: number
  targetHeight: number
}
type AdjustableThreeMaterial = THREE.Material & {
  clearcoat?: number
  envMapIntensity?: number
  metalness?: number
  roughness?: number
  sheen?: number
  specularIntensity?: number
}
type ProceduralMotion = {
  key: VtuberMotionKey
  startedAt: number
}
type ProceduralMotionFrame = {
  isDone: boolean
  positionX: number
  positionY: number
  positionZ: number
  rotationX: number
  rotationY: number
  rotationZ: number
}

const MOTION_CLIP_CANDIDATES: Record<VtuberMotionKey, string[]> = {
  idle: ['idle'],
  wave: ['wave', 'hello', 'greeting'],
  point: ['point', 'present', 'tapbody'],
  nod: ['nod', 'yes', 'agree'],
  'shake-head': ['shakehead', 'no', 'deny'],
  'hook-blocked': ['depressedfullturnleft', 'confused', 'shakehead'],
  'search-miss': ['talkwithlefthandraised', 'handraised', 'question'],
  'guide-success': ['talkwithlefthandonhip', 'handonhip', 'point'],
  'cart-add': ['scheminghandrub', 'scheming', 'cart'],
}

const PROCEDURAL_MOTION_DURATION_SECONDS: Record<VtuberMotionKey, number> = {
  idle: 0,
  wave: 1.35,
  point: 1.1,
  nod: 0.9,
  'shake-head': 0.95,
  'hook-blocked': 1.1,
  'search-miss': 1.2,
  'guide-success': 1.1,
  'cart-add': 1.2,
}
const THREE_ASSET_KEYS_BY_MOTION: Partial<Record<VtuberMotionKey, string[]>> = {
  wave: ['eventWave'],
  point: ['talkHandOnHip', 'eventConfident'],
  nod: ['eventAgree'],
  'shake-head': ['eventConfused'],
  'hook-blocked': ['eventConfused'],
  'search-miss': ['talkHandRaised'],
  'guide-success': ['talkHandOnHip', 'eventConfident'],
  'cart-add': ['eventSecretDeal'],
}
const AUTO_STAND_IDLE_MIN_SECONDS = 7
const AUTO_STAND_IDLE_MAX_SECONDS = 13
const AUTO_SIT_CHANCE = 0.28
const AUTO_SOLO_CHANCE = 0.1
const ACTION_FADE_SECONDS = 0.35
const AUTO_ACTION_FADE_SECONDS = 0.65
const MANUAL_ACTION_FADE_SECONDS = 0.32
const FAST_REACTION_FADE_SECONDS = 0.18
const AUTO_TRANSITION_LEAD_SECONDS = 0.85
const IDLE_TIME_SCALE = 0.4
const HELP_REQUEST_TIME_SCALE = 3
const HELP_REQUEST_WAVE_TIME_SCALE = 2
const HELP_REQUEST_SIT_EXIT_COMPLETE_AT_SECONDS = 2.7
const LONG_IDLE_KEY = 'standIdleLong'
const SOLO_DANCE_DEFAULT_TARGET_PEAK_BPM = 120
const SOLO_DANCE_TIME_SCALE_MIN = 0.5
const SOLO_DANCE_TIME_SCALE_MAX = 1.8
const SOLO_DANCE_HAND_PEAK_BPM_BY_ASSET_KEY: Record<string, number> = {
  soloGroovyWalk: 71.3,
  soloHipHopDance: 189.5,
  soloHipHopDance1: 75,
  soloHipHopDance2: 200,
  soloHipHopDance3: 189.5,
  soloHipHopDance4: 116.1,
}
const SOLO_DANCE_TARGET_PEAK_BPM_BY_ASSET_KEY: Record<string, number> = {
  soloGroovyWalk: 60,
  soloHipHopDance1: 60,
}
const SOLO_DANCE_TIME_SCALE_BY_ASSET_KEY: Record<string, number> = {
  soloHipHopDance1: 0.4,
}
const THREE_BUBBLE_ANCHOR_EMIT_INTERVAL_SECONDS = 0.24
const THREE_BUBBLE_ANCHOR_LEFT_OFFSET_PX = 132
const THREE_BUBBLE_ANCHOR_TOP_OFFSET_PX = 106
const THREE_BUBBLE_ANCHOR_DEAD_ZONE_X_PX = 96
const THREE_BUBBLE_ANCHOR_DEAD_ZONE_Y_PX = 64
const THREE_BUBBLE_VIEWPORT_MARGIN_PX = 8
const THREE_CHARACTER_CAMERA_PADDING = 1.85
const DEFAULT_THREE_FRAME_PROFILE: ThreeDFrameProfile = {
  cameraPadding: THREE_CHARACTER_CAMERA_PADDING,
  cameraYOffsetRatio: 0.16,
  targetHeight: 230,
}
const THREE_FRAME_PROFILE_BY_CHARACTER_ID: Record<string, Partial<ThreeDFrameProfile>> = {}
const DEFAULT_THREE_LIGHT_PROFILE: ThreeDLightProfile = {
  fillIntensity: 0.78,
  hemisphereIntensity: 1.55,
  keyIntensity: 2.15,
  shadowOpacity: 0.1,
}
const THREE_LIGHT_PROFILE_BY_CHARACTER_ID: Record<string, Partial<ThreeDLightProfile>> = {
  manase: {
    fillIntensity: 0,
    hemisphereIntensity: 0.06,
    keyIntensity: 0.12,
    shadowOpacity: 0.012,
  },
  hiena: {
    fillIntensity: 0,
    hemisphereIntensity: 0.06,
    keyIntensity: 0.12,
    shadowOpacity: 0.012,
  },
  rikane: {
    fillIntensity: 0,
    hemisphereIntensity: 0.06,
    keyIntensity: 0.12,
    shadowOpacity: 0.012,
  },
}
// If authored sync markers exist later, markerSeconds can replace pose matching.
const SIT_ENTER_TO_IDLE_TRANSITION: MotionTransitionSpec = {
  blendDurationSeconds: 1,
  curve: 'smootherstep',
  fromAssetKey: 'sitEnter',
  poseMatch: {
    boneNames: [
      'hips',
      'spine',
      'spine1',
      'spine2',
      'head',
      'leftupleg',
      'rightupleg',
      'leftleg',
      'rightleg',
      'leftfoot',
      'rightfoot',
    ],
    samples: 48,
    searchEndRatio: 0.98,
    searchStartRatio: 0.45,
  },
  toAssetKey: 'sitIdle',
}

function emptyAutoMotionRuntime(): AutoMotionRuntime {
  return {
    endsAt: 0,
    nextAt: 0,
    phase: 'not-started',
  }
}

function randomDelay(minSeconds: number, maxSeconds: number): number {
  return minSeconds + Math.random() * (maxSeconds - minSeconds)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function transitionLeadSeconds(durationSeconds: number): number {
  if (durationSeconds <= 0.5) {
    return 0
  }

  return clamp(durationSeconds * 0.22, 0.25, AUTO_TRANSITION_LEAD_SECONDS)
}

function transitionHandoffDelay(durationSeconds: number): number {
  return Math.max(durationSeconds - transitionLeadSeconds(durationSeconds), 0.2)
}

function lightProfileForCharacter(characterId: string): ThreeDLightProfile {
  return {
    ...DEFAULT_THREE_LIGHT_PROFILE,
    ...THREE_LIGHT_PROFILE_BY_CHARACTER_ID[characterId],
  }
}

function frameProfileForCharacter(characterId: string): ThreeDFrameProfile {
  return {
    ...DEFAULT_THREE_FRAME_PROFILE,
    ...THREE_FRAME_PROFILE_BY_CHARACTER_ID[characterId],
  }
}

function getSoloDanceTimeScale(assetKey: string): number {
  const fixedTimeScale = SOLO_DANCE_TIME_SCALE_BY_ASSET_KEY[assetKey]

  if (fixedTimeScale && fixedTimeScale > 0) {
    return fixedTimeScale
  }

  const measuredPeakBpm = SOLO_DANCE_HAND_PEAK_BPM_BY_ASSET_KEY[assetKey]
  const targetPeakBpm =
    SOLO_DANCE_TARGET_PEAK_BPM_BY_ASSET_KEY[assetKey] ??
    SOLO_DANCE_DEFAULT_TARGET_PEAK_BPM

  if (!measuredPeakBpm || measuredPeakBpm <= 0) {
    return 1
  }

  return clamp(
    targetPeakBpm / measuredPeakBpm,
    SOLO_DANCE_TIME_SCALE_MIN,
    SOLO_DANCE_TIME_SCALE_MAX,
  )
}

function smootherStep(value: number): number {
  const t = clamp(value, 0, 1)
  return t * t * t * (t * (t * 6 - 15) + 10)
}

function smoothStep(value: number): number {
  const t = clamp(value, 0, 1)
  return t * t * (3 - 2 * t)
}

function applyBlendCurve(value: number, curve: BlendCurve): number {
  if (curve === 'smootherstep') {
    return smootherStep(value)
  }

  if (curve === 'smoothstep') {
    return smoothStep(value)
  }

  return clamp(value, 0, 1)
}

function pickWeightedMotionKey(
  keys: string[],
  options: { blockedKey?: string } = {},
): string | null {
  const candidates = options.blockedKey
    ? keys.filter((key) => key !== options.blockedKey)
    : keys

  if (candidates.length === 0) {
    return null
  }

  return candidates[Math.floor(Math.random() * candidates.length)] ?? candidates[0]
}

function shuffleMotionKeys(keys: string[], lastKey?: string): string[] {
  const shuffledKeys = [...keys]

  for (let index = shuffledKeys.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const currentKey = shuffledKeys[index]
    shuffledKeys[index] = shuffledKeys[swapIndex] as string
    shuffledKeys[swapIndex] = currentKey as string
  }

  if (shuffledKeys.length > 1 && shuffledKeys[0] === lastKey) {
    const swapIndex = shuffledKeys.findIndex((key) => key !== lastKey)

    if (swapIndex > 0) {
      const firstKey = shuffledKeys[0]
      shuffledKeys[0] = shuffledKeys[swapIndex] as string
      shuffledKeys[swapIndex] = firstKey as string
    }
  }

  return shuffledKeys
}

function canUseWebGL(): boolean {
  const canvas = document.createElement('canvas')
  return Boolean(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
}

function disposeObject(root: THREE.Object3D) {
  root.traverse((node) => {
    const mesh = node as THREE.Mesh
    mesh.geometry?.dispose()

    const material = mesh.material
    if (Array.isArray(material)) {
      material.forEach((entry) => entry.dispose())
    } else {
      material?.dispose()
    }
  })
}

function isGlbModelUrl(modelUrl: string): boolean {
  return modelUrl.split('?', 1)[0].toLowerCase().endsWith('.glb')
}

async function loadThreeDModel(
  modelUrl: string,
  textureUrl?: string,
  motionLibrary?: VtuberThreeMotionLibrary,
): Promise<LoadedThreeDModel> {
  if (isGlbModelUrl(modelUrl)) {
    const loader = new GLTFLoader()
    loader.setMeshoptDecoder(MeshoptDecoder)
    const gltf = await loader.loadAsync(modelUrl)
    const externalAnimationClips = motionLibrary
      ? await loadExternalAnimationClips(loader, motionLibrary)
      : []
    return {
      object: gltf.scene,
      animationClips: [
        ...gltf.animations.map((clip) => ({ clip })),
        ...externalAnimationClips,
      ],
    }
  }

  const [object, texture] = await Promise.all([
    new FBXLoader().loadAsync(modelUrl),
    textureUrl
      ? new THREE.TextureLoader().loadAsync(textureUrl)
      : Promise.resolve(null),
  ])

  applyTexture(object, texture)
  return {
    object,
    animationClips: object.animations.map((clip) => ({ clip })),
  }
}

async function loadExternalAnimationClips(
  loader: GLTFLoader,
  motionLibrary: VtuberThreeMotionLibrary,
): Promise<LoadedThreeDAnimationClip[]> {
  const entries = await Promise.all(
    Object.entries(motionLibrary.clips).map(async ([assetKey, url]) => {
      const gltf = await loader.loadAsync(url)
      return gltf.animations.map((clip) => ({ assetKey, clip }))
    }),
  )

  return entries.flat()
}

function frameObject(
  object: THREE.Object3D,
  camera: THREE.PerspectiveCamera,
  profile: ThreeDFrameProfile = DEFAULT_THREE_FRAME_PROFILE,
): { targetY: number } {
  const box = new THREE.Box3().setFromObject(object)
  const size = box.getSize(new THREE.Vector3())
  const scale = size.y > 0 ? profile.targetHeight / size.y : 1

  object.scale.setScalar(scale)

  const scaledBox = new THREE.Box3().setFromObject(object)
  const scaledCenter = scaledBox.getCenter(new THREE.Vector3())
  object.position.set(-scaledCenter.x, -scaledBox.min.y, -scaledCenter.z)

  const finalBox = new THREE.Box3().setFromObject(object)
  const finalSize = finalBox.getSize(new THREE.Vector3())
  const finalCenter = finalBox.getCenter(new THREE.Vector3())
  const cameraDistance =
    (finalSize.y * profile.cameraPadding) /
    (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)))

  camera.position.set(0, finalCenter.y + finalSize.y * profile.cameraYOffsetRatio, cameraDistance)
  camera.lookAt(new THREE.Vector3(0, finalCenter.y, 0))

  return { targetY: finalCenter.y }
}

function resolveCharacterBubbleAnchor(
  object: THREE.Object3D,
  camera: THREE.PerspectiveCamera,
  canvas: HTMLCanvasElement,
): ThreeDScreenAnchor | null {
  object.updateMatrixWorld(true)

  const box = new THREE.Box3().setFromObject(object)
  if (box.isEmpty()) {
    return null
  }

  const size = box.getSize(new THREE.Vector3())
  const target = new THREE.Vector3(
    box.min.x + size.x * 0.48,
    box.max.y - size.y * 0.08,
    box.getCenter(new THREE.Vector3()).z,
  )
  target.project(camera)

  if (!Number.isFinite(target.x) || !Number.isFinite(target.y)) {
    return null
  }

  const rect = canvas.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) {
    return null
  }

  const projectedX = rect.left + (target.x * 0.5 + 0.5) * rect.width
  const projectedY = rect.top + (-target.y * 0.5 + 0.5) * rect.height

  return {
    left: Math.round(projectedX - THREE_BUBBLE_ANCHOR_LEFT_OFFSET_PX),
    top: Math.round(Math.max(
      THREE_BUBBLE_VIEWPORT_MARGIN_PX,
      projectedY - THREE_BUBBLE_ANCHOR_TOP_OFFSET_PX,
    )),
  }
}

function applyTexture(root: THREE.Object3D, texture: THREE.Texture | null) {
  if (texture) {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.flipY = true
  }

  root.traverse((node) => {
    const mesh = node as THREE.Mesh
    if (!mesh.isMesh) {
      return
    }

    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.frustumCulled = false

    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    materials.filter(Boolean).forEach((material) => {
      if (texture && !material.map) {
        material.map = texture
      }
      material.needsUpdate = true
    })
  })
}

function reduceGlossForCharacter(root: THREE.Object3D, characterId: string) {
  if (characterId !== 'hiena') {
    return
  }

  root.traverse((node) => {
    const mesh = node as THREE.Mesh
    if (!mesh.isMesh || !mesh.material) {
      return
    }

    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    materials.filter(Boolean).forEach((material) => {
      const adjustableMaterial = material as AdjustableThreeMaterial

      if ('roughness' in adjustableMaterial) {
        adjustableMaterial.roughness = Math.max(adjustableMaterial.roughness ?? 0, 0.96)
      }

      if ('metalness' in adjustableMaterial) {
        adjustableMaterial.metalness = 0
      }

      if ('specularIntensity' in adjustableMaterial) {
        adjustableMaterial.specularIntensity = 0.04
      }

      if ('clearcoat' in adjustableMaterial) {
        adjustableMaterial.clearcoat = 0
      }

      if ('sheen' in adjustableMaterial) {
        adjustableMaterial.sheen = 0
      }

      if ('envMapIntensity' in adjustableMaterial) {
        adjustableMaterial.envMapIntensity = 0.08
      }

      adjustableMaterial.needsUpdate = true
    })
  })
}

function collectRootMotionRestPose(object: THREE.Object3D): RootMotionRestPose {
  const restPose: RootMotionRestPose = {
    root: object.position.clone(),
  }

  object.traverse((node) => {
    const normalizedName = normalizeMotionName(node.name)

    if (!restPose.hips && normalizedName.includes('hips')) {
      restPose.hips = node.position.clone()
    }

    if (!restPose.armature && normalizedName.includes('armature')) {
      restPose.armature = node.position.clone()
    }
  })

  return restPose
}

function createFootAnchorState(object: THREE.Object3D): FootAnchorState {
  const state: FootAnchorState = {
    targetCenter: null,
    tempCenter: new THREE.Vector3(),
    tempFootPosition: new THREE.Vector3(),
  }

  object.traverse((node) => {
    const normalizedName = normalizeMotionName(node.name)

    if (!state.leftFoot && normalizedName === 'leftfoot') {
      state.leftFoot = node
    }

    if (!state.rightFoot && normalizedName === 'rightfoot') {
      state.rightFoot = node
    }
  })

  return state
}

function getFootAnchorCenter(state: FootAnchorState): THREE.Vector3 | null {
  const feet = [state.leftFoot, state.rightFoot].filter(Boolean) as THREE.Object3D[]

  if (feet.length === 0) {
    return null
  }

  state.tempCenter.set(0, 0, 0)
  feet.forEach((foot) => {
    state.tempCenter.add(foot.getWorldPosition(state.tempFootPosition))
  })
  state.tempCenter.multiplyScalar(1 / feet.length)

  return state.tempCenter
}

function captureFootAnchor(state: FootAnchorState | null) {
  if (!state) {
    return
  }

  const center = getFootAnchorCenter(state)
  state.targetCenter = center ? center.clone() : null
}

function clearFootAnchor(state: FootAnchorState | null) {
  if (state) {
    state.targetCenter = null
  }
}

function applyFootAnchor(model: THREE.Object3D, state: FootAnchorState | null) {
  if (!state?.targetCenter) {
    return
  }

  model.updateMatrixWorld(true)
  const center = getFootAnchorCenter(state)

  if (!center) {
    return
  }

  model.position.x += state.targetCenter.x - center.x
  model.position.z += state.targetCenter.z - center.z
}

function extractAnimationTrackTargetName(trackName: string): string {
  const propertySeparatorIndex = trackName.lastIndexOf('.')
  const targetName =
    propertySeparatorIndex >= 0 ? trackName.slice(0, propertySeparatorIndex) : trackName
  const boneMatch = targetName.match(/\[([^\]]+)\]$/)

  return boneMatch?.[1] ?? targetName
}

function getPositionTrackTargetKind(trackName: string): 'hips' | 'root' | 'bone' {
  const normalizedTargetName = normalizeMotionName(extractAnimationTrackTargetName(trackName))

  if (normalizedTargetName.includes('hips')) {
    return 'hips'
  }

  if (
    normalizedTargetName.includes('armature') ||
    normalizedTargetName === 'root' ||
    normalizedTargetName.endsWith('root')
  ) {
    return 'root'
  }

  return 'bone'
}

function pinPositionTrackToRest(
  track: THREE.KeyframeTrack,
  restPosition: THREE.Vector3,
  preserveY: boolean,
): THREE.KeyframeTrack {
  const normalizedTrack = track.clone()
  const values = normalizedTrack.values as Float32Array

  for (let index = 0; index + 2 < values.length; index += 3) {
    values[index] = restPosition.x
    if (!preserveY) {
      values[index + 1] = restPosition.y
    }
    values[index + 2] = restPosition.z
  }

  return normalizedTrack
}

function normalizeThreeDAnimationClip(
  clip: THREE.AnimationClip,
  restPose: RootMotionRestPose,
): THREE.AnimationClip {
  const tracks = clip.tracks.flatMap((track) => {
    if (track.name.endsWith('.scale')) {
      return []
    }

    if (track.name.endsWith('.position')) {
      const targetKind = getPositionTrackTargetKind(track.name)

      if (targetKind === 'hips' && restPose.hips) {
        return [pinPositionTrackToRest(track, restPose.hips, true)]
      }

      if (targetKind === 'root') {
        const restPosition = restPose.armature ?? restPose.root

        if (restPosition) {
          return [pinPositionTrackToRest(track, restPosition, false)]
        }
      }

      return []
    }

    return [track.clone()]
  })

  return new THREE.AnimationClip(clip.name, clip.duration, tracks)
}

function trackTargetKey(trackName: string): string {
  return normalizeMotionName(extractAnimationTrackTargetName(trackName))
}

function findClipTrack(
  clip: THREE.AnimationClip,
  boneName: string,
  propertyName: 'position' | 'quaternion',
): THREE.KeyframeTrack | null {
  const normalizedBoneName = normalizeMotionName(boneName)

  return clip.tracks.find((track) =>
    track.name.endsWith(`.${propertyName}`) &&
    trackTargetKey(track.name) === normalizedBoneName,
  ) ?? null
}

function keyframeInterval(times: ArrayLike<number>, time: number): {
  alpha: number
  leftIndex: number
  rightIndex: number
} {
  if (times.length <= 1 || time <= Number(times[0] ?? 0)) {
    return { alpha: 0, leftIndex: 0, rightIndex: 0 }
  }

  const lastIndex = times.length - 1
  if (time >= Number(times[lastIndex] ?? 0)) {
    return { alpha: 0, leftIndex: lastIndex, rightIndex: lastIndex }
  }

  for (let index = 0; index < lastIndex; index += 1) {
    const leftTime = Number(times[index] ?? 0)
    const rightTime = Number(times[index + 1] ?? leftTime)

    if (time >= leftTime && time <= rightTime) {
      const span = Math.max(rightTime - leftTime, Number.EPSILON)
      return {
        alpha: clamp((time - leftTime) / span, 0, 1),
        leftIndex: index,
        rightIndex: index + 1,
      }
    }
  }

  return { alpha: 0, leftIndex: lastIndex, rightIndex: lastIndex }
}

function sampleQuaternionTrack(
  track: THREE.KeyframeTrack | null,
  time: number,
  target: THREE.Quaternion,
): THREE.Quaternion | null {
  if (!track) {
    return null
  }

  const { alpha, leftIndex, rightIndex } = keyframeInterval(track.times, time)
  const values = track.values as ArrayLike<number>
  const leftOffset = leftIndex * 4
  const rightOffset = rightIndex * 4
  const left = new THREE.Quaternion(
    Number(values[leftOffset] ?? 0),
    Number(values[leftOffset + 1] ?? 0),
    Number(values[leftOffset + 2] ?? 0),
    Number(values[leftOffset + 3] ?? 1),
  )
  const right = new THREE.Quaternion(
    Number(values[rightOffset] ?? 0),
    Number(values[rightOffset + 1] ?? 0),
    Number(values[rightOffset + 2] ?? 0),
    Number(values[rightOffset + 3] ?? 1),
  )

  return target.copy(left).slerp(right, alpha).normalize()
}

function sampleVectorTrack(
  track: THREE.KeyframeTrack | null,
  time: number,
  target: THREE.Vector3,
): THREE.Vector3 | null {
  if (!track) {
    return null
  }

  const { alpha, leftIndex, rightIndex } = keyframeInterval(track.times, time)
  const values = track.values as ArrayLike<number>
  const leftOffset = leftIndex * 3
  const rightOffset = rightIndex * 3
  const left = new THREE.Vector3(
    Number(values[leftOffset] ?? 0),
    Number(values[leftOffset + 1] ?? 0),
    Number(values[leftOffset + 2] ?? 0),
  )
  const right = new THREE.Vector3(
    Number(values[rightOffset] ?? 0),
    Number(values[rightOffset + 1] ?? 0),
    Number(values[rightOffset + 2] ?? 0),
  )

  return target.copy(left).lerp(right, alpha)
}

function poseMatchBoneWeight(boneName: string): number {
  const normalizedName = normalizeMotionName(boneName)

  if (normalizedName.includes('hips')) {
    return 3
  }

  if (normalizedName.includes('upleg')) {
    return 2.4
  }

  if (normalizedName.includes('leg')) {
    return 1.8
  }

  if (normalizedName.includes('foot')) {
    return 1.4
  }

  if (normalizedName.includes('head')) {
    return 1.5
  }

  if (normalizedName.includes('spine')) {
    return 1.2
  }

  return 1
}

function poseMatchScore(
  fromClip: THREE.AnimationClip,
  toClip: THREE.AnimationClip,
  fromSeconds: number,
  boneNames: string[],
): number {
  const fromQuaternion = new THREE.Quaternion()
  const toQuaternion = new THREE.Quaternion()
  const fromVector = new THREE.Vector3()
  const toVector = new THREE.Vector3()

  return boneNames.reduce((score, boneName) => {
    const weight = poseMatchBoneWeight(boneName)
    const fromRotation = sampleQuaternionTrack(
      findClipTrack(fromClip, boneName, 'quaternion'),
      fromSeconds,
      fromQuaternion,
    )
    const toRotation = sampleQuaternionTrack(
      findClipTrack(toClip, boneName, 'quaternion'),
      0,
      toQuaternion,
    )
    let nextScore = score

    if (fromRotation && toRotation) {
      const angle = fromRotation.angleTo(toRotation)
      nextScore += angle * angle * weight
    }

    const fromPosition = sampleVectorTrack(
      findClipTrack(fromClip, boneName, 'position'),
      fromSeconds,
      fromVector,
    )
    const toPosition = sampleVectorTrack(
      findClipTrack(toClip, boneName, 'position'),
      0,
      toVector,
    )

    if (fromPosition && toPosition) {
      nextScore += fromPosition.distanceToSquared(toPosition) * 0.001 * weight
    }

    return nextScore
  }, 0)
}

function findPoseMatchedTransitionSeconds(
  fromClip: THREE.AnimationClip,
  toClip: THREE.AnimationClip,
  spec: MotionTransitionSpec,
): number {
  if (typeof spec.markerSeconds === 'number' && Number.isFinite(spec.markerSeconds)) {
    return clamp(spec.markerSeconds, 0, fromClip.duration)
  }

  const poseMatch = spec.poseMatch
  if (!poseMatch || poseMatch.samples <= 0) {
    return Math.max(0, fromClip.duration - spec.blendDurationSeconds)
  }

  const searchStart = clamp(fromClip.duration * poseMatch.searchStartRatio, 0, fromClip.duration)
  const searchEnd = clamp(fromClip.duration * poseMatch.searchEndRatio, searchStart, fromClip.duration)
  let bestSeconds = searchEnd
  let bestScore = Number.POSITIVE_INFINITY

  for (let index = 0; index <= poseMatch.samples; index += 1) {
    const sampleRatio = index / poseMatch.samples
    const sampleSeconds = searchStart + (searchEnd - searchStart) * sampleRatio
    const score = poseMatchScore(fromClip, toClip, sampleSeconds, poseMatch.boneNames)

    if (score < bestScore) {
      bestScore = score
      bestSeconds = sampleSeconds
    }
  }

  return bestSeconds
}

function normalizeMotionName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function findAnimationAction(
  actions: NamedAnimationAction[],
  motionKey: VtuberMotionKey,
): THREE.AnimationAction | null {
  const candidateNames = MOTION_CLIP_CANDIDATES[motionKey].map(normalizeMotionName)

  return (
    actions.find((entry) => candidateNames.includes(entry.normalizedName)) ??
    actions.find((entry) =>
      candidateNames.some((candidateName) =>
        candidateName.length > 2 && entry.normalizedName.includes(candidateName),
      ),
    )
  )?.action ?? null
}

function findAnimationActionByAssetKey(
  actions: NamedAnimationAction[],
  assetKey: string,
): THREE.AnimationAction | null {
  return actions.find((entry) => entry.assetKey === assetKey)?.action ?? null
}

function findAnimationActionForMotionKey(
  actions: NamedAnimationAction[],
  motionKey: VtuberMotionKey,
): THREE.AnimationAction | null {
  const assetKeys = THREE_ASSET_KEYS_BY_MOTION[motionKey]

  if (assetKeys?.length) {
    for (const assetKey of shuffleMotionKeys(assetKeys)) {
      const action = findAnimationActionByAssetKey(actions, assetKey)

      if (action) {
        return action
      }
    }
  }

  return findAnimationAction(actions, motionKey)
}

function fadeOutOtherActions(
  actions: NamedAnimationAction[],
  activeAction: THREE.AnimationAction,
  fadeSeconds = ACTION_FADE_SECONDS,
) {
  actions.forEach((entry) => {
    if (entry.action !== activeAction) {
      entry.action.fadeOut(fadeSeconds)
    }
  })
}

function playAction(
  action: THREE.AnimationAction,
  actions: NamedAnimationAction[],
  mode: 'loop' | 'once',
  options: { fadeSeconds?: number; timeScale?: number } = {},
) {
  const shouldKeepCurrentLoop = mode === 'loop' && action.isRunning()
  const fadeSeconds = options.fadeSeconds ?? ACTION_FADE_SECONDS
  const timeScale = options.timeScale ?? 1

  fadeOutOtherActions(actions, action, fadeSeconds)
  action.enabled = true
  action.clampWhenFinished = mode === 'once'
  action.setEffectiveTimeScale(timeScale)
  action.setLoop(
    mode === 'loop' ? THREE.LoopRepeat : THREE.LoopOnce,
    mode === 'loop' ? Number.POSITIVE_INFINITY : 1,
  )

  if (shouldKeepCurrentLoop) {
    action.setEffectiveWeight(1)
    action.setEffectiveTimeScale(timeScale)
    return
  }

  action.reset()
  action.fadeIn(fadeSeconds)
  action.play()
}

function emptyProceduralMotionFrame(isDone: boolean): ProceduralMotionFrame {
  return {
    isDone,
    positionX: 0,
    positionY: 0,
    positionZ: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
  }
}

function proceduralMotionFrame(
  motionKey: VtuberMotionKey,
  elapsedSeconds: number,
): ProceduralMotionFrame {
  const duration = PROCEDURAL_MOTION_DURATION_SECONDS[motionKey]

  if (duration <= 0 || elapsedSeconds >= duration) {
    return emptyProceduralMotionFrame(true)
  }

  const progress = Math.min(Math.max(elapsedSeconds / duration, 0), 1)
  const envelope = Math.sin(Math.PI * progress)

  if (motionKey === 'wave') {
    return {
      ...emptyProceduralMotionFrame(false),
      positionY: Math.sin(progress * Math.PI * 4) * 2.2 * envelope,
      rotationY: Math.sin(progress * Math.PI * 3) * 0.035 * envelope,
      rotationZ: Math.sin(progress * Math.PI * 6) * 0.07 * envelope,
    }
  }

  if (motionKey === 'point' || motionKey === 'guide-success' || motionKey === 'search-miss') {
    return {
      ...emptyProceduralMotionFrame(false),
      positionX: -2.5 * envelope,
      rotationY: -0.13 * envelope,
      rotationZ: -0.055 * envelope,
    }
  }

  if (motionKey === 'nod' || motionKey === 'cart-add') {
    return {
      ...emptyProceduralMotionFrame(false),
      positionY: -Math.abs(Math.sin(progress * Math.PI * 2)) * 1.4 * envelope,
      rotationX: Math.sin(progress * Math.PI * 4) * 0.075 * envelope,
    }
  }

  if (motionKey === 'shake-head' || motionKey === 'hook-blocked') {
    return {
      ...emptyProceduralMotionFrame(false),
      rotationY: Math.sin(progress * Math.PI * 6) * 0.14 * envelope,
      rotationZ: Math.sin(progress * Math.PI * 6) * 0.025 * envelope,
    }
  }

  return emptyProceduralMotionFrame(true)
}

function ThreeDCharacter({
  character,
  danceTriggerId = 0,
  displayState,
  greetingSpeechTriggerId = 0,
  motionKey = null,
  onBubbleAnchorChange,
  onHelpWaveStart,
  motionTriggerId = 0,
  onRenderStatusChange,
  statusLabel,
}: ThreeDCharacterProps): ReactElement {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const modelRef = useRef<THREE.Object3D | null>(null)
  const modelBasePositionRef = useRef<THREE.Vector3 | null>(null)
  const footAnchorRef = useRef<FootAnchorState | null>(null)
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)
  const animationActionsRef = useRef<NamedAnimationAction[]>([])
  const activeMotionBlendRef = useRef<ActiveMotionBlend | null>(null)
  const autoMotionRuntimeRef = useRef<AutoMotionRuntime>(emptyAutoMotionRuntime())
  const frameRef = useRef<number | null>(null)
  const displayStateRef = useRef(displayState)
  const handledDanceTriggerIdRef = useRef(0)
  const lastBubbleAnchorEmitAtRef = useRef(0)
  const lastBubbleAnchorRef = useRef<ThreeDScreenAnchor | null>(null)
  const manualMotionUntilRef = useRef(0)
  const onBubbleAnchorChangeRef = useRef(onBubbleAnchorChange)
  const onHelpWaveStartRef = useRef(onHelpWaveStart)
  const proceduralMotionRef = useRef<ProceduralMotion | null>(null)
  const handledGreetingSpeechTriggerIdRef = useRef(0)
  const requestedDanceTriggerIdRef = useRef(0)
  const [renderStatus, setRenderStatus] = useState<RenderStatus>('loading')

  useEffect(() => {
    displayStateRef.current = displayState
  }, [displayState])

  useEffect(() => {
    onBubbleAnchorChangeRef.current = onBubbleAnchorChange
  }, [onBubbleAnchorChange])

  useEffect(() => {
    onHelpWaveStartRef.current = onHelpWaveStart
  }, [onHelpWaveStart])

  useEffect(() => {
    onRenderStatusChange?.(renderStatus)
  }, [onRenderStatusChange, renderStatus])

  useEffect(() => {
    if (danceTriggerId > 0) {
      requestedDanceTriggerIdRef.current = danceTriggerId
    }
  }, [danceTriggerId])

  useEffect(() => {
    if (!motionKey || motionTriggerId === 0 || renderStatus !== 'ready') {
      return
    }

    activeMotionBlendRef.current = null

    if (motionKey === 'idle') {
      proceduralMotionRef.current = null
      manualMotionUntilRef.current = 0
      return
    }

    const action = findAnimationActionForMotionKey(animationActionsRef.current, motionKey)
    if (action) {
      playAction(action, animationActionsRef.current, 'once', {
        fadeSeconds: MANUAL_ACTION_FADE_SECONDS,
      })
      proceduralMotionRef.current = null
      const now = window.performance.now() / 1000
      const durationSeconds = Math.max(action.getClip().duration, 0.8)
      const handoffAt = now + transitionHandoffDelay(durationSeconds)
      manualMotionUntilRef.current = handoffAt
      autoMotionRuntimeRef.current = {
        ...autoMotionRuntimeRef.current,
        endsAt: now + durationSeconds,
        nextAt: handoffAt,
        phase: 'manual',
      }
      return
    }

    const now = window.performance.now() / 1000
    const durationSeconds = PROCEDURAL_MOTION_DURATION_SECONDS[motionKey]
    const handoffAt = now + transitionHandoffDelay(durationSeconds)
    manualMotionUntilRef.current = handoffAt
    autoMotionRuntimeRef.current = {
      ...autoMotionRuntimeRef.current,
      endsAt: now + durationSeconds,
      nextAt: handoffAt,
      phase: 'manual',
    }
    proceduralMotionRef.current = {
      key: motionKey,
      startedAt: now,
    }
  }, [motionKey, motionTriggerId, renderStatus])

  useEffect(() => {
    if (
      greetingSpeechTriggerId === 0 ||
      greetingSpeechTriggerId <= handledGreetingSpeechTriggerIdRef.current ||
      renderStatus !== 'ready'
    ) {
      return
    }

    handledGreetingSpeechTriggerIdRef.current = greetingSpeechTriggerId
    activeMotionBlendRef.current = null
    const action =
      findAnimationActionByAssetKey(animationActionsRef.current, 'talkHandOnHip') ??
      findAnimationActionByAssetKey(animationActionsRef.current, 'talkHandRaised') ??
      findAnimationActionForMotionKey(animationActionsRef.current, 'guide-success')

    if (!action) {
      return
    }

    playAction(action, animationActionsRef.current, 'once', {
      fadeSeconds: MANUAL_ACTION_FADE_SECONDS,
    })
    proceduralMotionRef.current = null
    const now = window.performance.now() / 1000
    const durationSeconds = Math.max(action.getClip().duration, 0.8)
    const handoffAt = now + transitionHandoffDelay(durationSeconds)
    manualMotionUntilRef.current = handoffAt
    autoMotionRuntimeRef.current = {
      ...autoMotionRuntimeRef.current,
      endsAt: now + durationSeconds,
      nextAt: handoffAt,
      phase: 'manual',
    }
  }, [greetingSpeechTriggerId, renderStatus])

  useEffect(() => {
    let isDisposed = false
    let resizeObserver: ResizeObserver | null = null
    const container = containerRef.current
    autoMotionRuntimeRef.current = emptyAutoMotionRuntime()
    manualMotionUntilRef.current = 0

    if (!container || !character.threeModelUrl || !canUseWebGL()) {
      setRenderStatus('fallback')
      return undefined
    }

    const scene = new THREE.Scene()
    scene.background = null
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 2000)
    camera.position.set(0, 120, 260)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      premultipliedAlpha: false,
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.domElement.classList.add('vtuber-three-canvas')
    rendererRef.current = renderer
    container.append(renderer.domElement)

    const lightProfile = lightProfileForCharacter(character.id)
    const hemiLight = new THREE.HemisphereLight(
      0xffffff,
      0x7d8795,
      lightProfile.hemisphereIntensity,
    )
    scene.add(hemiLight)

    const keyLight = new THREE.DirectionalLight(0xffffff, lightProfile.keyIntensity)
    keyLight.position.set(120, 230, 160)
    keyLight.castShadow = true
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xeaf2ff, lightProfile.fillIntensity)
    fillLight.position.set(-160, 120, -120)
    scene.add(fillLight)

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(160, 80),
      new THREE.ShadowMaterial({ color: 0x1c2533, opacity: lightProfile.shadowOpacity }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -1.5
    floor.receiveShadow = true
    scene.add(floor)

    const clock = new THREE.Clock()
    const autoMotionConfig = character.threeMotionLibrary?.auto

    function emitCharacterBubbleAnchor(model: THREE.Object3D, now: number) {
      if (
        now - lastBubbleAnchorEmitAtRef.current <
        THREE_BUBBLE_ANCHOR_EMIT_INTERVAL_SECONDS
      ) {
        return
      }

      lastBubbleAnchorEmitAtRef.current = now

      const nextAnchor = resolveCharacterBubbleAnchor(model, camera, renderer.domElement)
      const previousAnchor = lastBubbleAnchorRef.current

      if (
        previousAnchor &&
        nextAnchor &&
        Math.abs(previousAnchor.left - nextAnchor.left) < THREE_BUBBLE_ANCHOR_DEAD_ZONE_X_PX &&
        Math.abs(previousAnchor.top - nextAnchor.top) < THREE_BUBBLE_ANCHOR_DEAD_ZONE_Y_PX
      ) {
        return
      }

      lastBubbleAnchorRef.current = nextAnchor
      onBubbleAnchorChangeRef.current?.(nextAnchor)
    }

    function playConfiguredAutoMotion(
      assetKey: string,
      mode: 'loop' | 'once',
      options: { anchorFeet?: boolean; fadeSeconds?: number; timeScale?: number } = {},
    ): THREE.AnimationAction | null {
      const action = findAnimationActionByAssetKey(animationActionsRef.current, assetKey)
      if (!action) {
        return null
      }

      activeMotionBlendRef.current = null
      playAction(action, animationActionsRef.current, mode, {
        fadeSeconds: options.fadeSeconds ?? AUTO_ACTION_FADE_SECONDS,
        timeScale: options.timeScale,
      })

      if (options.anchorFeet) {
        modelRef.current?.updateMatrixWorld(true)
        captureFootAnchor(footAnchorRef.current)
      } else {
        clearFootAnchor(footAnchorRef.current)
      }

      return action
    }

    function startConfiguredBlendTransition(
      spec: MotionTransitionSpec,
      now: number,
      options: { anchorFeet?: boolean; toTimeScale?: number } = {},
    ): number | null {
      const fromAction = findAnimationActionByAssetKey(
        animationActionsRef.current,
        spec.fromAssetKey,
      )
      const toAction = findAnimationActionByAssetKey(
        animationActionsRef.current,
        spec.toAssetKey,
      )

      if (!fromAction || !toAction) {
        return null
      }

      const remainingClipSeconds = Math.max(fromAction.getClip().duration - fromAction.time, 0)
      const blendDuration = clamp(
        Math.min(spec.blendDurationSeconds, remainingClipSeconds),
        0.25,
        spec.blendDurationSeconds,
      )

      animationActionsRef.current.forEach((entry) => {
        if (entry.action !== fromAction && entry.action !== toAction) {
          entry.action.fadeOut(ACTION_FADE_SECONDS)
        }
      })

      fromAction.enabled = true
      fromAction.setEffectiveWeight(1)
      toAction.reset()
      toAction.enabled = true
      toAction.clampWhenFinished = false
      toAction.setEffectiveTimeScale(options.toTimeScale ?? 1)
      toAction.setLoop(THREE.LoopRepeat, Number.POSITIVE_INFINITY)
      toAction.setEffectiveWeight(0)
      toAction.play()

      activeMotionBlendRef.current = {
        anchorFeet: options.anchorFeet === true,
        curve: spec.curve,
        duration: blendDuration,
        fromAction,
        phaseAfterComplete: 'sit-idle',
        startedAt: now,
        toAction,
      }

      if (options.anchorFeet) {
        modelRef.current?.updateMatrixWorld(true)
        captureFootAnchor(footAnchorRef.current)
      } else {
        clearFootAnchor(footAnchorRef.current)
      }

      return blendDuration
    }

    function updateActiveMotionBlend(now: number) {
      const blend = activeMotionBlendRef.current

      if (!blend) {
        return
      }

      const progress = clamp((now - blend.startedAt) / blend.duration, 0, 1)
      const toWeight = applyBlendCurve(progress, blend.curve)
      blend.fromAction.setEffectiveWeight(1 - toWeight)
      blend.toAction.setEffectiveWeight(toWeight)

      if (progress < 1) {
        return
      }

      blend.fromAction.stop()
      blend.toAction.enabled = true
      blend.toAction.setEffectiveWeight(1)
      activeMotionBlendRef.current = null

      if (autoMotionRuntimeRef.current.phase === 'sit-enter-to-idle') {
        autoMotionRuntimeRef.current = {
          ...autoMotionRuntimeRef.current,
          endsAt: 0,
          nextAt: Number.POSITIVE_INFINITY,
          phase: blend.phaseAfterComplete,
        }
      }
    }

    function sitEnterToIdleTransitionSpec(): MotionTransitionSpec | null {
      if (!autoMotionConfig?.sit) {
        return null
      }

      return {
        ...SIT_ENTER_TO_IDLE_TRANSITION,
        fromAssetKey: autoMotionConfig.sit.enter,
        toAssetKey: autoMotionConfig.sit.idle,
      }
    }

    function playSitEnterAutoMotion(now: number): boolean {
      if (!autoMotionConfig?.sit) {
        return false
      }

      const transitionSpec = sitEnterToIdleTransitionSpec()
      const action = playConfiguredAutoMotion(autoMotionConfig.sit.enter, 'once', {
        anchorFeet: true,
      })
      const toAction = findAnimationActionByAssetKey(
        animationActionsRef.current,
        autoMotionConfig.sit.idle,
      )

      if (!action) {
        return false
      }

      const matchedClipSeconds = toAction && transitionSpec
        ? findPoseMatchedTransitionSeconds(
          action.getClip(),
          toAction.getClip(),
          transitionSpec,
        )
        : Math.max(0, action.getClip().duration - 1)
      const transitionStartClipSeconds = clamp(
        matchedClipSeconds - (transitionSpec?.blendDurationSeconds ?? 1) * 0.25,
        0,
        Math.max(action.getClip().duration - 0.25, 0),
      )

      autoMotionRuntimeRef.current = {
        ...autoMotionRuntimeRef.current,
        endsAt: now + Math.max(action.getClip().duration, 0.25),
        nextAt: now + transitionStartClipSeconds,
        phase: 'sit-enter',
      }

      return true
    }

    function playStandingIdle(now: number) {
      if (!autoMotionConfig?.standIdle.length) {
        return
      }

      const runtime = autoMotionRuntimeRef.current
      const blockedStandIdleKey =
        runtime.lastStandIdleKey === LONG_IDLE_KEY ? LONG_IDLE_KEY : undefined
      const assetKey = pickWeightedMotionKey(autoMotionConfig.standIdle, {
        ...(blockedStandIdleKey ? { blockedKey: blockedStandIdleKey } : {}),
      })
      const timeScale = assetKey === LONG_IDLE_KEY ? 1 : IDLE_TIME_SCALE
      const mode = assetKey === LONG_IDLE_KEY ? 'once' : 'loop'
      const action = assetKey
        ? playConfiguredAutoMotion(assetKey, mode, {
          anchorFeet: true,
          fadeSeconds: AUTO_ACTION_FADE_SECONDS,
          timeScale,
        })
        : null
      if (!assetKey || !action) {
        return
      }

      autoMotionRuntimeRef.current = {
        ...runtime,
        endsAt: 0,
        lastStandIdleKey: assetKey,
        nextAt: assetKey === LONG_IDLE_KEY
          ? now + transitionHandoffDelay(Math.max(action.getClip().duration / timeScale, 0.25))
          : now + randomDelay(AUTO_STAND_IDLE_MIN_SECONDS, AUTO_STAND_IDLE_MAX_SECONDS),
        phase: 'stand-idle',
        soloQueue: undefined,
      }
    }

    function playOneShotAutoMotion(
      assetKey: string,
      phase: AutoMotionPhase,
      now: number,
      options: {
        anchorFeet?: boolean
        completeAtClipSeconds?: number
        fadeSeconds?: number
        timeScale?: number
      } = {},
    ): boolean {
      const action = playConfiguredAutoMotion(assetKey, 'once', options)
      if (!action) {
        return false
      }

      const timeScale = options.timeScale && options.timeScale > 0
        ? options.timeScale
        : 1
      const clipDuration = options.completeAtClipSeconds &&
        options.completeAtClipSeconds > 0
        ? Math.min(options.completeAtClipSeconds, action.getClip().duration)
        : action.getClip().duration
      const durationSeconds = Math.max(clipDuration / timeScale, 0.25)
      autoMotionRuntimeRef.current = {
        ...autoMotionRuntimeRef.current,
        endsAt: now + durationSeconds,
        nextAt: now + transitionHandoffDelay(durationSeconds),
        phase,
      }
      return true
    }

    function playSoloAutoMotion(now: number, soloQueue: string[]): boolean {
      if (!autoMotionConfig?.solo.length) {
        return false
      }

      const runtime = autoMotionRuntimeRef.current
      const [soloKey, ...remainingSoloQueue] = soloQueue

      if (!soloKey) {
        return false
      }

      const timeScale = getSoloDanceTimeScale(soloKey)
      const action = playConfiguredAutoMotion(soloKey, 'once', {
        fadeSeconds: AUTO_ACTION_FADE_SECONDS,
        timeScale,
      })
      if (!action) {
        return false
      }

      const durationSeconds = Math.max(action.getClip().duration / timeScale, 0.8)
      autoMotionRuntimeRef.current = {
        ...runtime,
        endsAt: now + durationSeconds,
        lastSoloKey: soloKey,
        nextAt: now + transitionHandoffDelay(durationSeconds),
        phase: 'solo',
        soloQueue: remainingSoloQueue,
      }
      return true
    }

    function requestHelpWaveFromSit(now: number) {
      if (
        !autoMotionConfig?.sit ||
        autoMotionRuntimeRef.current.phase !== 'sit-idle'
      ) {
        return
      }

      if (
        playOneShotAutoMotion(
          autoMotionConfig.sit.exit,
          'sit-exit-help-wave',
          now,
          {
            anchorFeet: true,
            completeAtClipSeconds: HELP_REQUEST_SIT_EXIT_COMPLETE_AT_SECONDS,
            fadeSeconds: FAST_REACTION_FADE_SECONDS,
            timeScale: HELP_REQUEST_TIME_SCALE,
          },
        )
      ) {
        return
      }

      if (
        autoMotionConfig.helpRequest &&
        playOneShotAutoMotion(autoMotionConfig.helpRequest, 'help-wave', now, {
          fadeSeconds: FAST_REACTION_FADE_SECONDS,
          timeScale: HELP_REQUEST_WAVE_TIME_SCALE,
        })
      ) {
        onHelpWaveStartRef.current?.()
        return
      }

      playStandingIdle(now)
    }

    function startTriggeredSoloDance(now: number): boolean {
      if (!autoMotionConfig?.solo.length) {
        return false
      }

      const runtime = autoMotionRuntimeRef.current
      const isSitting =
        runtime.phase === 'sit-idle' ||
        runtime.phase === 'sit-enter' ||
        runtime.phase === 'sit-enter-to-idle'

      activeMotionBlendRef.current = null
      manualMotionUntilRef.current = 0
      proceduralMotionRef.current = null

      if (isSitting && autoMotionConfig.sit) {
        return playOneShotAutoMotion(
          autoMotionConfig.sit.exit,
          'sit-exit-dance',
          now,
          {
            anchorFeet: true,
            fadeSeconds: FAST_REACTION_FADE_SECONDS,
            timeScale: HELP_REQUEST_TIME_SCALE,
          },
        )
      }

      return playSoloAutoMotion(
        now,
        shuffleMotionKeys(autoMotionConfig.solo, runtime.lastSoloKey),
      )
    }

    function handleDocumentClick() {
      requestHelpWaveFromSit(window.performance.now() / 1000)
    }

    function advanceAutoMotion(now: number) {
      if (!autoMotionConfig) {
        return
      }

      if (requestedDanceTriggerIdRef.current > handledDanceTriggerIdRef.current) {
        handledDanceTriggerIdRef.current = requestedDanceTriggerIdRef.current
        if (startTriggeredSoloDance(now)) {
          return
        }
      }

      if (manualMotionUntilRef.current > now) {
        return
      }

      const runtime = autoMotionRuntimeRef.current

      if (runtime.phase === 'not-started') {
        if (
          autoMotionConfig.intro &&
          playOneShotAutoMotion(autoMotionConfig.intro, 'intro', now)
        ) {
          return
        }
        playStandingIdle(now)
        return
      }

      if (runtime.phase === 'manual') {
        if (now >= runtime.nextAt) {
          playStandingIdle(now)
        }
        return
      }

      if (runtime.phase === 'intro') {
        if (now >= runtime.nextAt) {
          playStandingIdle(now)
        }
        return
      }

      if (runtime.phase === 'solo') {
        if (now < runtime.nextAt) {
          return
        }

        if (runtime.soloQueue?.length && playSoloAutoMotion(now, runtime.soloQueue)) {
          return
        }

        if (autoMotionConfig.sit && playSitEnterAutoMotion(now)) {
          return
        }

        playStandingIdle(now)
        return
      }

      if (runtime.phase === 'stand-idle') {
        if (now < runtime.nextAt) {
          return
        }

        if (
          autoMotionConfig.solo.length > 0 &&
          Math.random() < AUTO_SOLO_CHANCE &&
          playSoloAutoMotion(
            now,
            shuffleMotionKeys(autoMotionConfig.solo, runtime.lastSoloKey),
          )
        ) {
          return
        }

        const shouldSit = Boolean(autoMotionConfig.sit) && Math.random() < AUTO_SIT_CHANCE
        if (shouldSit && autoMotionConfig.sit && playSitEnterAutoMotion(now)) {
          return
        }

        playStandingIdle(now)
        return
      }

      if (runtime.phase === 'sit-enter') {
        if (!autoMotionConfig.sit) {
          playStandingIdle(now)
          return
        }

        if (now < runtime.nextAt) {
          return
        }

        const transitionSpec = sitEnterToIdleTransitionSpec()
        const blendDuration = transitionSpec
          ? startConfiguredBlendTransition(
            transitionSpec,
            now,
            {
              anchorFeet: true,
              toTimeScale: IDLE_TIME_SCALE,
            },
          )
          : null

        if (blendDuration !== null) {
          autoMotionRuntimeRef.current = {
            ...runtime,
            endsAt: now + blendDuration,
            nextAt: Number.POSITIVE_INFINITY,
            phase: 'sit-enter-to-idle',
          }
          return
        }

        if (now < runtime.endsAt) {
          return
        }

        playStandingIdle(now)
        return
      }

      if (runtime.phase === 'sit-enter-to-idle') {
        return
      }

      if (runtime.phase === 'sit-idle') {
        return
      }

      if (runtime.phase === 'sit-exit' && now >= runtime.nextAt) {
        playStandingIdle(now)
      }

      if (runtime.phase === 'sit-exit-dance' && now >= runtime.nextAt) {
        if (
          playSoloAutoMotion(
            now,
            shuffleMotionKeys(autoMotionConfig.solo, runtime.lastSoloKey),
          )
        ) {
          return
        }

        playStandingIdle(now)
        return
      }

      if (runtime.phase === 'sit-exit-help-wave' && now >= runtime.nextAt) {
        if (
          autoMotionConfig.helpRequest &&
          playOneShotAutoMotion(autoMotionConfig.helpRequest, 'help-wave', now, {
            fadeSeconds: FAST_REACTION_FADE_SECONDS,
            timeScale: HELP_REQUEST_WAVE_TIME_SCALE,
          })
        ) {
          onHelpWaveStartRef.current?.()
          return
        }

        playStandingIdle(now)
        return
      }

      if (runtime.phase === 'help-wave' && now >= runtime.nextAt) {
        playStandingIdle(now)
      }
    }

    document.addEventListener('click', handleDocumentClick, true)

    const resize = () => {
      const { width, height } = container.getBoundingClientRect()
      const safeWidth = Math.max(1, Math.floor(width))
      const safeHeight = Math.max(1, Math.floor(height))

      renderer.setSize(safeWidth, safeHeight, false)
      camera.aspect = safeWidth / safeHeight
      camera.updateProjectionMatrix()
      lastBubbleAnchorEmitAtRef.current = 0
    }

    resize()
    resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)

    async function loadModel() {
      try {
        setRenderStatus('loading')

        const { object, animationClips } = await loadThreeDModel(
          character.threeModelUrl as string,
          character.threeTextureUrl,
          character.threeMotionLibrary,
        )

        if (isDisposed) {
          disposeObject(object)
          return
        }

        reduceGlossForCharacter(object, character.id)
        frameObject(object, camera, frameProfileForCharacter(character.id))
        scene.add(object)
        modelRef.current = object
        modelBasePositionRef.current = object.position.clone()
        footAnchorRef.current = createFootAnchorState(object)

        if (animationClips[0]) {
          const restPose = collectRootMotionRestPose(object)
          const mixer = new THREE.AnimationMixer(object)
          animationActionsRef.current = animationClips.map(({ assetKey, clip }) => ({
            action: mixer.clipAction(normalizeThreeDAnimationClip(clip, restPose)),
            assetKey,
            normalizedName: normalizeMotionName(clip.name),
          }))
          const action = animationActionsRef.current[0]?.action
          if (action && !character.threeMotionLibrary?.auto) {
            action.reset()
            action.play()
          }
          mixerRef.current = mixer
        }

        setRenderStatus('ready')
      } catch {
        if (!isDisposed) {
          setRenderStatus('fallback')
        }
      }
    }

    const animate = () => {
      const delta = clock.getDelta()
      const model = modelRef.current
      const now = window.performance.now() / 1000

      mixerRef.current?.update(delta)
      advanceAutoMotion(now)
      updateActiveMotionBlend(now)

      if (model) {
        const activeMotion = proceduralMotionRef.current
        const motionFrame = activeMotion
          ? proceduralMotionFrame(
            activeMotion.key,
            window.performance.now() / 1000 - activeMotion.startedAt,
          )
          : null

        if (motionFrame?.isDone) {
          proceduralMotionRef.current = null
        }

        const basePosition = modelBasePositionRef.current
        const activeFrame = motionFrame && !motionFrame.isDone ? motionFrame : null
        model.rotation.x = activeFrame?.rotationX ?? 0
        model.rotation.y = activeFrame?.rotationY ?? 0
        model.rotation.z = activeFrame?.rotationZ ?? 0

        if (basePosition) {
          model.position.set(
            basePosition.x + (activeFrame?.positionX ?? 0),
            basePosition.y + (activeFrame?.positionY ?? 0),
            basePosition.z + (activeFrame?.positionZ ?? 0),
          )
        }

        applyFootAnchor(model, footAnchorRef.current)
        emitCharacterBubbleAnchor(model, now)
      }

      renderer.render(scene, camera)
      frameRef.current = window.requestAnimationFrame(animate)
    }

    void loadModel()
    frameRef.current = window.requestAnimationFrame(animate)

    return () => {
      isDisposed = true
      resizeObserver?.disconnect()
      document.removeEventListener('click', handleDocumentClick, true)

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }

      mixerRef.current?.stopAllAction()
      mixerRef.current = null
      animationActionsRef.current = []
      activeMotionBlendRef.current = null
      autoMotionRuntimeRef.current = emptyAutoMotionRuntime()
      manualMotionUntilRef.current = 0
      proceduralMotionRef.current = null

      if (modelRef.current) {
        scene.remove(modelRef.current)
        disposeObject(modelRef.current)
        modelRef.current = null
      }
      modelBasePositionRef.current = null
      footAnchorRef.current = null
      lastBubbleAnchorRef.current = null
      lastBubbleAnchorEmitAtRef.current = 0
      onBubbleAnchorChangeRef.current?.(null)

      renderer.dispose()
      renderer.domElement.remove()
      rendererRef.current = null
      sceneRef.current = null
      cameraRef.current = null
    }
  }, [character.id, character.threeModelUrl, character.threeMotionLibrary, character.threeTextureUrl])

  return (
    <div
      className="vtuber-three"
      data-render-status={renderStatus}
      data-motion-key={motionKey ?? undefined}
      aria-label={`${character.name} 3D 캐릭터`}
    >
      <div ref={containerRef} className="vtuber-three-container" aria-hidden="true" />
      <span className="vtuber-status">{statusLabel}</span>
    </div>
  )
}

export default ThreeDCharacter
