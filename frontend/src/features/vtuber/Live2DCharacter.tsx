import { type ReactElement, useEffect, useRef, useState } from 'react'
import * as PIXI from 'pixi.js'

import {
  type VtuberCharacterRenderStatus,
  type VtuberCharacterConfig,
  type VtuberDisplayState,
  type VtuberMotionKey,
} from './types'

const CUBISM_CORE_SCRIPT_URL = '/live2d/runtime/live2dcubismcore.min.js'
const MODEL_STAGE_FILL_RATIO = 1.06
const MODEL_BOTTOM_ANCHOR_Y = 0.92
const MODEL_BASELINE_RATIO = 0.96

const EXPRESSION_BY_STATE: Partial<Record<VtuberDisplayState, string[]>> = {
  thinking: ['question', 'surprise'],
  speaking: ['blush', 'smirk_left', 'smirk_right'],
  error: ['tears', 'black_face'],
}

const MOTION_BY_STATE: Partial<Record<VtuberDisplayState, string[]>> = {
  ready: ['Idle'],
  thinking: ['TapBody', 'MenuClick'],
  speaking: ['TapBody', 'MenuClick'],
}

const MOTION_BY_KEY: Record<VtuberMotionKey, string[]> = {
  idle: ['Idle'],
  wave: ['wave', 'Wave', 'Greeting', 'TapBody'],
  point: ['point', 'Point', 'TapBody', 'MenuClick'],
  nod: ['nod', 'Nod', 'Yes', 'TapBody'],
  'shake-head': ['shake_head', 'shake-head', 'ShakeHead', 'No', 'TapBody'],
}

type Live2DModelModule = typeof import('pixi-live2d-display/cubism4')
type Live2DModelInstance = Awaited<ReturnType<Live2DModelModule['Live2DModel']['from']>>
type MotionPriorityModule = Live2DModelModule['MotionPriority']

type Live2DCharacterProps = {
  character: VtuberCharacterConfig
  displayState: VtuberDisplayState
  motionKey?: VtuberMotionKey | null
  motionTriggerId?: number
  onRenderStatusChange?: (status: VtuberCharacterRenderStatus) => void
  statusLabel: string
}

type RenderStatus = VtuberCharacterRenderStatus

declare global {
  interface Window {
    Live2DCubismCore?: unknown
    PIXI?: typeof PIXI
  }
}

let cubismCorePromise: Promise<void> | null = null

function canUseWebGL(): boolean {
  const canvas = document.createElement('canvas')
  return Boolean(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
}

function loadCubismCore(): Promise<void> {
  if (window.Live2DCubismCore) {
    return Promise.resolve()
  }

  if (cubismCorePromise) {
    return cubismCorePromise
  }

  cubismCorePromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${CUBISM_CORE_SCRIPT_URL}"]`,
    )

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true })
      existingScript.addEventListener(
        'error',
        () => reject(new Error('Cubism Core failed to load.')),
        { once: true },
      )
      return
    }

    const script = document.createElement('script')
    script.src = CUBISM_CORE_SCRIPT_URL
    script.async = true
    script.addEventListener('load', () => resolve(), { once: true })
    script.addEventListener(
      'error',
      () => reject(new Error('Cubism Core is missing.')),
      { once: true },
    )
    document.head.append(script)
  })

  return cubismCorePromise
}

function fitModelToStage(model: Live2DModelInstance, width: number, height: number) {
  if (width <= 0 || height <= 0 || !model.internalModel) {
    return
  }

  const modelWidth = model.internalModel.width || model.width || width
  const modelHeight = model.internalModel.height || model.height || height
  const scale = Math.min(width / modelWidth, height / modelHeight) * MODEL_STAGE_FILL_RATIO

  model.anchor.set(0.5, MODEL_BOTTOM_ANCHOR_Y)
  model.scale.set(scale)
  model.position.set(width / 2, height * MODEL_BASELINE_RATIO)
}

async function applyFirstExpression(model: Live2DModelInstance, names: string[]) {
  for (const name of names) {
    try {
      if (await model.expression(name)) {
        return true
      }
    } catch {
      // Different character models may not provide the same expression names.
    }
  }

  return false
}

async function applyFirstMotion(
  model: Live2DModelInstance,
  groups: string[],
  MotionPriority: MotionPriorityModule,
  force = false,
) {
  const priority = force ? MotionPriority.FORCE : MotionPriority.NORMAL

  for (const group of groups) {
    try {
      if (await model.motion(group, undefined, priority)) {
        return true
      }
    } catch {
      // Missing motion groups are expected when characters use different models.
    }
  }

  return false
}

function resetExpression(model: Live2DModelInstance) {
  model.internalModel?.motionManager.expressionManager?.resetExpression()
}

function Live2DCharacter({
  character,
  displayState,
  motionKey = null,
  motionTriggerId = 0,
  onRenderStatusChange,
  statusLabel,
}: Live2DCharacterProps): ReactElement {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const appRef = useRef<PIXI.Application | null>(null)
  const modelRef = useRef<Live2DModelInstance | null>(null)
  const priorityRef = useRef<MotionPriorityModule | null>(null)
  const [renderStatus, setRenderStatus] = useState<RenderStatus>('loading')

  useEffect(() => {
    let isDisposed = false
    let resizeObserver: ResizeObserver | null = null

    async function createRenderer() {
      const container = containerRef.current

      if (!container || !canUseWebGL()) {
        setRenderStatus('fallback')
        return
      }

      try {
        setRenderStatus('loading')
        await loadCubismCore()
        window.PIXI = PIXI

        const { Live2DModel, MotionPriority } = await import(
          'pixi-live2d-display/cubism4'
        )

        if (isDisposed) {
          return
        }

        priorityRef.current = MotionPriority
        const app = new PIXI.Application({
          backgroundAlpha: 0,
          antialias: true,
          autoDensity: true,
          resolution: window.devicePixelRatio || 1,
        })
        appRef.current = app
        app.view.classList.add('vtuber-live2d-canvas')
        container.append(app.view)

        const model = await Live2DModel.from(character.modelUrl, {
          autoInteract: false,
          autoUpdate: true,
        })

        if (isDisposed) {
          model.destroy({ children: true, texture: true, baseTexture: true })
          return
        }

        modelRef.current = model
        app.stage.addChild(model)

        const resize = () => {
          const { width, height } = container.getBoundingClientRect()
          app.renderer.resize(Math.max(1, width), Math.max(1, height))
          fitModelToStage(model, width, height)
        }

        resize()
        resizeObserver = new ResizeObserver(resize)
        resizeObserver.observe(container)
        setRenderStatus('ready')
      } catch {
        if (!isDisposed) {
          setRenderStatus('fallback')
        }
      }
    }

    void createRenderer()

    return () => {
      isDisposed = true
      resizeObserver?.disconnect()
      modelRef.current?.destroy({ children: true, texture: true, baseTexture: true })
      modelRef.current = null
      appRef.current?.destroy(true, { children: true, texture: true, baseTexture: true })
      appRef.current = null
      priorityRef.current = null
    }
  }, [character.modelUrl])

  useEffect(() => {
    onRenderStatusChange?.(renderStatus)
  }, [onRenderStatusChange, renderStatus])

  useEffect(() => {
    const model = modelRef.current
    const MotionPriority = priorityRef.current

    if (!model || !MotionPriority || renderStatus !== 'ready') {
      return
    }

    if (displayState === 'ready') {
      resetExpression(model)
    }

    const expressions = EXPRESSION_BY_STATE[displayState] ?? []
    const motions = MOTION_BY_STATE[displayState] ?? []
    const live2dModel = model
    const motionPriority = MotionPriority

    async function applyDisplayState() {
      const didApplyExpression = await applyFirstExpression(live2dModel, expressions)

      if (!didApplyExpression || displayState !== 'error') {
        await applyFirstMotion(live2dModel, motions, motionPriority)
      }
    }

    void applyDisplayState()
  }, [displayState, renderStatus])

  useEffect(() => {
    const model = modelRef.current
    const MotionPriority = priorityRef.current

    if (
      !model ||
      !MotionPriority ||
      renderStatus !== 'ready' ||
      !motionKey ||
      motionTriggerId === 0
    ) {
      return
    }

    const motions = MOTION_BY_KEY[motionKey]
    if (motions.length === 0) {
      return
    }

    void applyFirstMotion(model, motions, MotionPriority, motionKey !== 'idle')
  }, [motionKey, motionTriggerId, renderStatus])

  return (
    <div
      className="vtuber-live2d"
      data-render-status={renderStatus}
      data-motion-key={motionKey ?? undefined}
      aria-label={`${character.name} Live2D 캐릭터`}
    >
      <div ref={containerRef} className="vtuber-live2d-container" aria-hidden="true" />
      <span className="vtuber-status">{statusLabel}</span>
    </div>
  )
}

export default Live2DCharacter
