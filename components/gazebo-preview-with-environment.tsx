"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Plane, Environment } from "@react-three/drei"
import { Suspense, useRef, useImperativeHandle, forwardRef } from "react"
import { ProceduralHouse, Tree, Car, Fence, GardenBed } from "./3d-objects/house-model"

interface GazeboPreviewProps {
  length: number
  width: number
  height: number
  roofType: "Gable" | "Skillion"
  roofPitch: number
  hasOverhang: boolean
  overhangSides: string[]
  overhangSize: number
  roofColor?: string
  postBeamColor?: string
  showEnvironment?: boolean
}

// Your existing gazebo structure component (keeping it the same)
function GazeboStructure(props: GazeboPreviewProps) {
  // ... (keep your existing gazebo structure code)
  return <group>{/* Your existing gazebo code */}</group>
}

// Environment objects component
function EnvironmentObjects() {
  return (
    <group>
      {/* House in the background */}
      <ProceduralHouse position={[-15, 0, -10]} scale={1.5} rotation={[0, Math.PI / 4, 0]} />

      {/* Another house */}
      <ProceduralHouse position={[12, 0, -8]} scale={1.2} rotation={[0, -Math.PI / 6, 0]} />

      {/* Trees scattered around */}
      <Tree position={[-8, 0, 5]} scale={1.2} />
      <Tree position={[10, 0, 8]} scale={0.8} />
      <Tree position={[-12, 0, -15]} scale={1.5} />
      <Tree position={[15, 0, -12]} scale={1.1} />
      <Tree position={[8, 0, -15]} scale={0.9} />

      {/* Cars parked nearby */}
      <Car position={[-10, 0, 2]} scale={1} rotation={[0, Math.PI / 2, 0]} />
      <Car position={[8, 0, -5]} scale={1} rotation={[0, -Math.PI / 3, 0]} />

      {/* Fences */}
      <Fence startPosition={[-20, 0, -5]} endPosition={[-20, 0, 15]} height={1.5} posts={8} />

      <Fence startPosition={[15, 0, -20]} endPosition={[20, 0, -5]} height={1.2} posts={6} />

      {/* Garden beds */}
      <GardenBed position={[-5, 0, 8]} size={[4, 2]} />
      <GardenBed position={[6, 0, 10]} size={[3, 3]} />

      {/* Pathway */}
      <mesh position={[0, 0.01, 15]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3, 20]} />
        <meshStandardMaterial color="#696969" />
      </mesh>
    </group>
  )
}

// Enhanced preview component with environment toggle
const GazeboPreviewWithEnvironment = forwardRef<any, GazeboPreviewProps>((props, ref) => {
  const sceneRef = useRef(null)
  const { showEnvironment = true, ...gazeboProps } = props

  // Expose the takeScreenshot method to parent components
  useImperativeHandle(ref, () => ({
    takeScreenshot: () => {
      if (sceneRef.current) {
        return sceneRef.current.takeScreenshot()
      }
      return null
    },
  }))

  return (
    <div className="h-full w-full">
      <Suspense fallback={<div>Loading 3D scene...</div>}>
        <Canvas
          camera={{
            position: [12, 8, 12],
            fov: 50,
          }}
          shadows
        >
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[20, 20, 10]}
            intensity={1.2}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={100}
            shadow-camera-left={-50}
            shadow-camera-right={50}
            shadow-camera-top={50}
            shadow-camera-bottom={-50}
          />

          {/* Sky environment */}
          <Environment preset="sunset" background />

          {/* Ground plane */}
          <Plane args={[100, 100]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
            <meshLambertMaterial color="#4ade80" />
          </Plane>

          {/* Your gazebo */}
          <GazeboStructure {...gazeboProps} />

          {/* Environment objects */}
          {showEnvironment && <EnvironmentObjects />}

          {/* Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={6}
            maxDistance={50}
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 2.1}
            target={[0, 2, 0]}
          />
        </Canvas>
      </Suspense>
    </div>
  )
})

export default GazeboPreviewWithEnvironment
