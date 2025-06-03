"use client"

import { Suspense, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import GazeboDiagram from "./gazebo-diagram"

interface SimpleGazeboPreviewProps {
  length: number
  width: number
  height: number
  roofType: "Gable" | "Skillion"
  roofPitch: number
  roofColor?: string
  postBeamColor?: string
}

// Color mapping function
const getColorFromName = (colorName: string): string => {
  const colorMap: { [key: string]: string } = {
    "SURFMIST / BASALT": "#737578",
    "SURFMIST / CLASSIC CREAM": "#F0E9C6",
    "SURFMIST / DUNE": "#C9C2B0",
    "SURFMIST / MANOR RED": "#8B4B4B",
    "SURFMIST / WOODLAND GREY": "#5E6365",
    "CLASSIC CREAM": "#F0E9C6",
    DUNE: "#C9C2B0",
    MONUMENT: "#4A4D52",
    "DOVER WHITE": "#FFFFFF",
    "WOODLAND GREY": "#5E6365",
  }
  return colorMap[colorName] || "#CCCCCC"
}

// Simple ground component
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshLambertMaterial color="#4ade80" />
    </mesh>
  )
}

// Simple gazebo structure
function SimpleGazeboStructure({
  length,
  width,
  height,
  roofType,
  roofPitch,
  roofColor,
  postBeamColor,
}: SimpleGazeboPreviewProps) {
  // Convert mm to meters
  const scaleLength = length / 1000
  const scaleWidth = width / 1000
  const scaleHeight = height / 1000

  const frameColor = getColorFromName(postBeamColor || "MONUMENT")
  const roofColorHex = getColorFromName(roofColor || "SURFMIST / BASALT")

  // Calculate roof dimensions
  const pitchRadians = (roofPitch * Math.PI) / 180
  const roofRise =
    roofType === "Gable" ? (scaleWidth / 2) * Math.tan(pitchRadians) : scaleWidth * Math.tan(pitchRadians)

  return (
    <group>
      {/* Corner posts */}
      {[
        [-scaleLength / 2, scaleHeight / 2, -scaleWidth / 2],
        [scaleLength / 2, scaleHeight / 2, -scaleWidth / 2],
        [-scaleLength / 2, scaleHeight / 2, scaleWidth / 2],
        [scaleLength / 2, scaleHeight / 2, scaleWidth / 2],
      ].map((position, index) => (
        <mesh key={index} position={position as [number, number, number]} castShadow>
          <boxGeometry args={[0.1, scaleHeight, 0.1]} />
          <meshStandardMaterial color={frameColor} />
        </mesh>
      ))}

      {/* Roof beams */}
      <mesh position={[0, scaleHeight - 0.05, -scaleWidth / 2]} castShadow>
        <boxGeometry args={[scaleLength, 0.1, 0.15]} />
        <meshStandardMaterial color={frameColor} />
      </mesh>
      <mesh position={[0, scaleHeight - 0.05, scaleWidth / 2]} castShadow>
        <boxGeometry args={[scaleLength, 0.1, 0.15]} />
        <meshStandardMaterial color={frameColor} />
      </mesh>
      <mesh position={[-scaleLength / 2, scaleHeight - 0.05, 0]} castShadow>
        <boxGeometry args={[0.15, 0.1, scaleWidth]} />
        <meshStandardMaterial color={frameColor} />
      </mesh>
      <mesh position={[scaleLength / 2, scaleHeight - 0.05, 0]} castShadow>
        <boxGeometry args={[0.15, 0.1, scaleWidth]} />
        <meshStandardMaterial color={frameColor} />
      </mesh>

      {/* Roof */}
      {roofType === "Gable" ? (
        <group>
          {/* Left roof plane */}
          <mesh
            position={[0, scaleHeight + roofRise / 2, -scaleWidth / 4]}
            rotation={[-pitchRadians, 0, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[scaleLength, scaleWidth / 2 / Math.cos(pitchRadians), 0.02]} />
            <meshStandardMaterial color={roofColorHex} />
          </mesh>
          {/* Right roof plane */}
          <mesh
            position={[0, scaleHeight + roofRise / 2, scaleWidth / 4]}
            rotation={[pitchRadians, 0, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[scaleLength, scaleWidth / 2 / Math.cos(pitchRadians), 0.02]} />
            <meshStandardMaterial color={roofColorHex} />
          </mesh>
        </group>
      ) : (
        /* Skillion roof */
        <mesh position={[0, scaleHeight + roofRise / 2, 0]} rotation={[-pitchRadians, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[scaleLength, scaleWidth / Math.cos(pitchRadians), 0.02]} />
          <meshStandardMaterial color={roofColorHex} />
        </mesh>
      )}
    </group>
  )
}

// Loading fallback
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full bg-gradient-to-b from-blue-100 to-green-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">Loading 3D preview...</p>
      </div>
    </div>
  )
}

export default function SimpleGazeboPreview(props: SimpleGazeboPreviewProps) {
  const [view3D, setView3D] = useState(true)

  return (
    <div className="h-full w-full relative">
      {/* View toggle button */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => setView3D(!view3D)}
          className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg text-sm font-medium hover:bg-white transition-colors"
        >
          {view3D ? "2D View" : "3D View"}
        </button>
      </div>

      {view3D ? (
        <Suspense fallback={<LoadingFallback />}>
          <Canvas
            camera={{
              position: [6, 4, 6],
              fov: 50,
            }}
            shadows
          >
            {/* Simple lighting */}
            <ambientLight intensity={0.6} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={1}
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
              shadow-camera-far={50}
              shadow-camera-left={-10}
              shadow-camera-right={10}
              shadow-camera-top={10}
              shadow-camera-bottom={-10}
            />

            {/* Scene objects */}
            <Ground />
            <SimpleGazeboStructure {...props} />

            {/* Controls */}
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={3}
              maxDistance={15}
              minPolarAngle={0}
              maxPolarAngle={Math.PI / 2.2}
              target={[0, 1, 0]}
            />
          </Canvas>
        </Suspense>
      ) : (
        <GazeboDiagram {...props} />
      )}

      {/* Measurements overlay - only show in 3D view */}
      {view3D && (
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-[200px]">
          <h3 className="font-semibold text-gray-900 mb-2 text-sm">Measurements</h3>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Eave Height:</span>
              <span className="font-semibold">{(props.height / 1000).toFixed(1)}m</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Peak Height:</span>
              <span className="font-semibold">
                {(() => {
                  const width = props.width / 1000
                  const height = props.height / 1000
                  const pitchRad = (props.roofPitch * Math.PI) / 180
                  const rise =
                    props.roofType === "Gable" ? (width / 2) * Math.tan(pitchRad) : width * Math.tan(pitchRad)
                  return (height + rise).toFixed(1) + "m"
                })()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Dimensions:</span>
              <span className="font-semibold">
                {(props.length / 1000).toFixed(1)} × {(props.width / 1000).toFixed(1)}m
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Floor Area:</span>
              <span className="font-semibold">{((props.length * props.width) / 1000000).toFixed(1)}m²</span>
            </div>
          </div>
        </div>
      )}

      {/* Controls hint - only show in 3D view */}
      {view3D && (
        <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-3 py-2 rounded-lg">
          <p>🖱️ Drag to rotate • 🔍 Scroll to zoom • 📱 Pinch to zoom</p>
        </div>
      )}
    </div>
  )
}
