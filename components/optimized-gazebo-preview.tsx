"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Plane, Environment } from "@react-three/drei"
import { Suspense, useRef, useImperativeHandle, forwardRef, useState, useEffect, useMemo, memo } from "react"
import { TextureLoader, RepeatWrapping } from "three"
import * as THREE from "three"
import dynamic from "next/dynamic"

// Lazy load heavy components
const GazeboStructure = dynamic(() => import("./gazebo-structure"), {
  loading: () => <div>Loading 3D model...</div>,
  ssr: false,
})

interface GazeboPreviewProps {
  length: number
  width: number
  height: number
  roofType: "Gable" | "Skillion"
  roofPitch: number
  roofCladding?: string
  hasOverhang: boolean
  overhangSides: string[]
  overhangSize: number
  roofColor?: string
  postBeamColor?: string
}

// Memoized texture loader with caching
const useOptimizedTexture = (url: string) => {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const loader = new TextureLoader()

    // Use browser cache
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      if (!isMounted) return

      loader.load(
        url,
        (loadedTexture) => {
          if (!isMounted) return

          // Optimize texture settings
          loadedTexture.wrapS = RepeatWrapping
          loadedTexture.wrapT = RepeatWrapping
          loadedTexture.anisotropy = Math.min(16, loadedTexture.image?.naturalWidth / 512 || 4)
          loadedTexture.colorSpace = THREE.SRGBColorSpace
          loadedTexture.generateMipmaps = true
          loadedTexture.minFilter = THREE.LinearMipmapLinearFilter
          loadedTexture.magFilter = THREE.LinearFilter

          setTexture(loadedTexture)
          setLoading(false)
        },
        undefined,
        (err) => {
          if (!isMounted) return
          setError(`Failed to load texture: ${url}`)
          setLoading(false)
        },
      )
    }
    img.onerror = () => {
      if (!isMounted) return
      setError(`Failed to load image: ${url}`)
      setLoading(false)
    }
    img.src = url

    return () => {
      isMounted = false
      if (texture) {
        texture.dispose()
      }
    }
  }, [url])

  return { texture, loading, error }
}

// Memoized ground component
const OptimizedGrassGround = memo(() => {
  const { texture, loading, error } = useOptimizedTexture("/textures/grass-texture-background.jpg")

  const grassMaterial = useMemo(() => {
    if (texture) {
      texture.repeat.set(12, 12)
      return new THREE.MeshLambertMaterial({
        map: texture,
        color: "#ffffff",
      })
    }
    return new THREE.MeshLambertMaterial({
      color: "#4ade80",
    })
  }, [texture])

  if (loading) return null
  if (error) console.warn(error)

  return (
    <Plane args={[50, 50]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <primitive object={grassMaterial} attach="material" />
    </Plane>
  )
})

OptimizedGrassGround.displayName = "OptimizedGrassGround"

// Optimized loading fallback
const LoadingFallback = memo(() => (
  <div className="flex items-center justify-center h-full bg-gradient-to-b from-blue-100 to-green-100">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
      <p className="text-sm text-gray-600">Loading Aussie Patio Designer...</p>
    </div>
  </div>
))

LoadingFallback.displayName = "LoadingFallback"

// Optimized lighting setup
const OptimizedLighting = memo(() => (
  <>
    <ambientLight intensity={0.6} color="#ffffff" />
    <directionalLight
      position={[-5, 10, -5]} // Changed to opposite side
      intensity={0.8} // Slightly reduced for less gloss
      color="#f8f8f8"
      castShadow
      shadow-mapSize-width={1024}
      shadow-mapSize-height={1024}
      shadow-camera-far={50}
      shadow-camera-left={-20}
      shadow-camera-right={20}
      shadow-camera-top={20}
      shadow-camera-bottom={-20}
      shadow-bias={-0.0001}
    />
    <directionalLight position={[5, 8, 3]} intensity={0.3} color="#e0e8ff" />
    <hemisphereLight skyColor="#a7c5ff" groundColor="#d2c4a5" intensity={0.7} />
  </>
))

OptimizedLighting.displayName = "OptimizedLighting"

// Main optimized preview component
const OptimizedGazeboPreview = forwardRef<any, GazeboPreviewProps>((props, ref) => {
  const sceneRef = useRef(null)

  useImperativeHandle(ref, () => ({
    takeScreenshot: () => {
      if (sceneRef.current) {
        return sceneRef.current.takeScreenshot()
      }
      return null
    },
  }))

  // Memoize canvas props for performance
  const canvasProps = useMemo(
    () => ({
      camera: {
        position: [8, 6, -8] as [number, number, number], // Start 90° to the right while keeping the front/house side visible
        fov: 35, // Reduced FOV for more isometric-like view
      },
      shadows: true,
      gl: {
        antialias: true,
        alpha: false,
        powerPreference: "high-performance" as const,
        stencil: false,
        depth: true,
      },
      onCreated: ({ gl }: any) => {
        gl.shadowMap.enabled = true
        gl.shadowMap.type = THREE.PCFSoftShadowMap
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.0 // Reduced from 1.2 for less gloss
        gl.outputColorSpace = THREE.SRGBColorSpace

        // Performance optimizations
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      },
    }),
    [],
  )

  return (
    <div className="h-full w-full">
      <Suspense fallback={<LoadingFallback />}>
        <Canvas {...canvasProps}>
          <OptimizedLighting />
          <Environment background={false} preset="park" intensity={0.2} />

          <Suspense fallback={null}>
            <GazeboStructure {...props} />
            <OptimizedGrassGround />
          </Suspense>

          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={4}
            maxDistance={20}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.5}
            target={[0, 1.5, 0]} // Slightly higher target for better view
            enableDamping={true}
            dampingFactor={0.05}
            rotateSpeed={0.7}
          />
        </Canvas>
      </Suspense>
    </div>
  )
})

OptimizedGazeboPreview.displayName = "OptimizedGazeboPreview"

export default OptimizedGazeboPreview
