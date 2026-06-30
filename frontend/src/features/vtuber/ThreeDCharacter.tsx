import { type ReactElement, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'

import {
  type VtuberCharacterConfig,
  type VtuberDisplayState,
} from './types'

type ThreeDCharacterProps = {
  character: VtuberCharacterConfig
  displayState: VtuberDisplayState
  statusLabel: string
}

type RenderStatus = 'loading' | 'ready' | 'fallback'
type LoadedThreeDModel = {
  object: THREE.Object3D
  animations: THREE.AnimationClip[]
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
): Promise<LoadedThreeDModel> {
  if (isGlbModelUrl(modelUrl)) {
    const loader = new GLTFLoader()
    loader.setMeshoptDecoder(MeshoptDecoder)
    const gltf = await loader.loadAsync(modelUrl)
    return {
      object: gltf.scene,
      animations: gltf.animations,
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
    animations: object.animations,
  }
}

function frameObject(
  object: THREE.Object3D,
  camera: THREE.PerspectiveCamera,
): { targetY: number } {
  const box = new THREE.Box3().setFromObject(object)
  const size = box.getSize(new THREE.Vector3())
  const scale = size.y > 0 ? 230 / size.y : 1

  object.scale.setScalar(scale)

  const scaledBox = new THREE.Box3().setFromObject(object)
  const scaledCenter = scaledBox.getCenter(new THREE.Vector3())
  object.position.set(-scaledCenter.x, -scaledBox.min.y, -scaledCenter.z)

  const finalBox = new THREE.Box3().setFromObject(object)
  const finalSize = finalBox.getSize(new THREE.Vector3())
  const finalCenter = finalBox.getCenter(new THREE.Vector3())
  const cameraDistance =
    (finalSize.y * 1.35) /
    (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)))

  camera.position.set(0, finalCenter.y + finalSize.y * 0.16, cameraDistance)
  camera.lookAt(new THREE.Vector3(0, finalCenter.y, 0))

  return { targetY: finalCenter.y }
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

function stateRotation(displayState: VtuberDisplayState, elapsedSeconds: number): number {
  if (displayState === 'thinking') {
    return Math.sin(elapsedSeconds * 2.2) * 0.08
  }
  if (displayState === 'speaking') {
    return Math.sin(elapsedSeconds * 3.5) * 0.05
  }
  if (displayState === 'error') {
    return Math.sin(elapsedSeconds * 5) * 0.03
  }
  return Math.sin(elapsedSeconds * 0.9) * 0.025
}

function ThreeDCharacter({
  character,
  displayState,
  statusLabel,
}: ThreeDCharacterProps): ReactElement {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const modelRef = useRef<THREE.Object3D | null>(null)
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)
  const frameRef = useRef<number | null>(null)
  const displayStateRef = useRef(displayState)
  const [renderStatus, setRenderStatus] = useState<RenderStatus>('loading')

  useEffect(() => {
    displayStateRef.current = displayState
  }, [displayState])

  useEffect(() => {
    let isDisposed = false
    let resizeObserver: ResizeObserver | null = null
    const container = containerRef.current

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

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x7d8795, 2.15)
    scene.add(hemiLight)

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2)
    keyLight.position.set(120, 230, 160)
    keyLight.castShadow = true
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xeaf2ff, 1.2)
    fillLight.position.set(-160, 120, -120)
    scene.add(fillLight)

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(160, 80),
      new THREE.ShadowMaterial({ color: 0x1c2533, opacity: 0.12 }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -1.5
    floor.receiveShadow = true
    scene.add(floor)

    const clock = new THREE.Clock()

    const resize = () => {
      const { width, height } = container.getBoundingClientRect()
      const safeWidth = Math.max(1, Math.floor(width))
      const safeHeight = Math.max(1, Math.floor(height))

      renderer.setSize(safeWidth, safeHeight, false)
      camera.aspect = safeWidth / safeHeight
      camera.updateProjectionMatrix()
    }

    resize()
    resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)

    async function loadModel() {
      try {
        setRenderStatus('loading')

        const { object, animations } = await loadThreeDModel(
          character.threeModelUrl as string,
          character.threeTextureUrl,
        )

        if (isDisposed) {
          disposeObject(object)
          return
        }

        frameObject(object, camera)
        scene.add(object)
        modelRef.current = object

        if (animations[0]) {
          const mixer = new THREE.AnimationMixer(object)
          const action = mixer.clipAction(animations[0])
          action.reset()
          action.play()
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
      const elapsed = clock.elapsedTime
      const model = modelRef.current

      mixerRef.current?.update(delta)

      if (model) {
        model.rotation.y = stateRotation(displayStateRef.current, elapsed)
      }

      renderer.render(scene, camera)
      frameRef.current = window.requestAnimationFrame(animate)
    }

    void loadModel()
    frameRef.current = window.requestAnimationFrame(animate)

    return () => {
      isDisposed = true
      resizeObserver?.disconnect()

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }

      mixerRef.current?.stopAllAction()
      mixerRef.current = null

      if (modelRef.current) {
        scene.remove(modelRef.current)
        disposeObject(modelRef.current)
        modelRef.current = null
      }

      renderer.dispose()
      renderer.domElement.remove()
      rendererRef.current = null
      sceneRef.current = null
      cameraRef.current = null
    }
  }, [character.threeModelUrl, character.threeTextureUrl])

  return (
    <div
      className="vtuber-three"
      data-render-status={renderStatus}
      aria-label={`${character.name} 3D character`}
    >
      <div ref={containerRef} className="vtuber-three-container" aria-hidden="true" />
      <div className="vtuber-avatar" data-display-state={displayState} aria-hidden="true">
        <span className="vtuber-avatar-face" />
        {displayState === 'thinking' || renderStatus === 'loading' ? (
          <span className="vtuber-thinking-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        ) : null}
      </div>
      <span className="vtuber-status">{statusLabel}</span>
    </div>
  )
}

export default ThreeDCharacter
