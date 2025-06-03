"use client"

import { useRef } from "react"
import type * as THREE from "three"

interface HouseModelProps {
  position?: [number, number, number]
  scale?: number
  rotation?: [number, number, number]
}

// Simple procedural house component
export function ProceduralHouse({ position = [0, 0, 0], scale = 1, rotation = [0, 0, 0] }: HouseModelProps) {
  const groupRef = useRef<THREE.Group>(null)

  return (
    <group ref={groupRef} position={position} scale={scale} rotation={rotation}>
      {/* House base */}
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 2, 3]} />
        <meshStandardMaterial color="#E8D5B7" />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <coneGeometry args={[3, 1.5, 4]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Door */}
      <mesh position={[1.8, 0.5, 0]} castShadow>
        <boxGeometry args={[0.1, 1, 0.8]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* Windows */}
      <mesh position={[1.8, 1.2, -0.8]} castShadow>
        <boxGeometry args={[0.1, 0.6, 0.6]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} />
      </mesh>

      <mesh position={[1.8, 1.2, 0.8]} castShadow>
        <boxGeometry args={[0.1, 0.6, 0.6]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} />
      </mesh>

      {/* Chimney */}
      <mesh position={[-1, 3.2, -0.5]} castShadow>
        <boxGeometry args={[0.4, 1, 0.4]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    </group>
  )
}

// GLTF Model Loader (for external 3D files)
export function GLTFHouse({ position = [0, 0, 0], scale = 1, rotation = [0, 0, 0] }: HouseModelProps) {
  // Uncomment and use this when you have a GLTF file
  // const { scene } = useGLTF('/models/house.gltf')

  // For now, return the procedural house
  return <ProceduralHouse position={position} scale={scale} rotation={rotation} />
}

// Tree component
export function Tree({ position = [0, 0, 0], scale = 1 }: HouseModelProps) {
  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 2, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Leaves */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <sphereGeometry args={[1.2, 8, 6]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
    </group>
  )
}

// Car component
export function Car({ position = [0, 0, 0], scale = 1, rotation = [0, 0, 0] }: HouseModelProps) {
  return (
    <group position={position} scale={scale} rotation={rotation}>
      {/* Car body */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[2, 0.6, 1]} />
        <meshStandardMaterial color="#FF0000" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Car roof */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[1.5, 0.4, 0.8]} />
        <meshStandardMaterial color="#FF0000" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Wheels */}
      {[
        [-0.7, -0.1, 0.6],
        [0.7, -0.1, 0.6],
        [-0.7, -0.1, -0.6],
        [0.7, -0.1, -0.6],
      ].map((pos, index) => (
        <mesh key={index} position={pos as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.1, 8]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      ))}

      {/* Windows */}
      <mesh position={[0.3, 0.9, 0]} castShadow>
        <boxGeometry args={[0.8, 0.3, 0.7]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} />
      </mesh>
    </group>
  )
}

// Fence component
export function Fence({
  startPosition = [0, 0, 0],
  endPosition = [5, 0, 0],
  height = 1.2,
  posts = 6,
}: {
  startPosition?: [number, number, number]
  endPosition?: [number, number, number]
  height?: number
  posts?: number
}) {
  const fenceLength = Math.sqrt(
    Math.pow(endPosition[0] - startPosition[0], 2) + Math.pow(endPosition[2] - startPosition[2], 2),
  )

  const angle = Math.atan2(endPosition[2] - startPosition[2], endPosition[0] - startPosition[0])

  const centerX = (startPosition[0] + endPosition[0]) / 2
  const centerZ = (startPosition[2] + endPosition[2]) / 2

  return (
    <group position={[centerX, startPosition[1], centerZ]} rotation={[0, angle, 0]}>
      {/* Fence rails */}
      <mesh position={[0, height / 2, 0]} castShadow>
        <boxGeometry args={[fenceLength, 0.1, 0.1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      <mesh position={[0, height / 3, 0]} castShadow>
        <boxGeometry args={[fenceLength, 0.1, 0.1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Fence posts */}
      {Array.from({ length: posts }, (_, i) => {
        const x = -fenceLength / 2 + (i * fenceLength) / (posts - 1)
        return (
          <mesh key={i} position={[x, height / 2, 0]} castShadow>
            <boxGeometry args={[0.1, height, 0.1]} />
            <meshStandardMaterial color="#654321" />
          </mesh>
        )
      })}
    </group>
  )
}

// Garden bed component
export function GardenBed({
  position = [0, 0, 0],
  size = [3, 2],
}: {
  position?: [number, number, number]
  size?: [number, number]
}) {
  return (
    <group position={position}>
      {/* Soil */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[size[0], 0.1, size[1]]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Plants */}
      {Array.from({ length: 8 }, (_, i) => {
        const x = (Math.random() - 0.5) * size[0] * 0.8
        const z = (Math.random() - 0.5) * size[1] * 0.8
        const height = 0.2 + Math.random() * 0.3

        return (
          <mesh key={i} position={[x, height / 2 + 0.1, z]} castShadow>
            <cylinderGeometry args={[0.05, 0.02, height, 6]} />
            <meshStandardMaterial color="#228B22" />
          </mesh>
        )
      })}
    </group>
  )
}

// Swimming Pool component
export function SwimmingPool({
  position = [0, 0, 0],
  size = [8, 4, 1.5],
  poolType = "rectangular",
}: {
  position?: [number, number, number]
  size?: [number, number, number] // length, width, depth
  poolType?: "rectangular" | "kidney" | "circular"
}) {
  const [length, width, depth] = size

  return (
    <group position={position}>
      {/* Pool excavation/hole */}
      <mesh position={[0, -depth / 2, 0]} receiveShadow>
        <boxGeometry args={[length, depth, width]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.8} />
      </mesh>

      {/* Pool coping (edge) */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[length + 0.4, 0.1, width + 0.4]} />
        <meshStandardMaterial color="#D3D3D3" />
      </mesh>

      {/* Pool deck */}
      <mesh position={[0, 0.01, 0]} receiveShadow>
        <boxGeometry args={[length + 2, 0.02, width + 2]} />
        <meshStandardMaterial color="#F5DEB3" />
      </mesh>

      {/* Pool steps */}
      <mesh position={[-length / 2 + 0.5, -0.3, 0]} castShadow>
        <boxGeometry args={[1, 0.6, 1]} />
        <meshStandardMaterial color="#D3D3D3" />
      </mesh>

      {/* Pool equipment */}
      <mesh position={[length / 2 + 1, 0.3, 0]} castShadow>
        <boxGeometry args={[0.8, 0.6, 0.6]} />
        <meshStandardMaterial color="#696969" />
      </mesh>
    </group>
  )
}

// Enhanced House component
export function ModernHouse({
  position = [0, 0, 0],
  scale = 1,
  rotation = [0, 0, 0],
  style = "modern",
}: HouseModelProps & { style?: "modern" | "traditional" | "contemporary" }) {
  const groupRef = useRef<THREE.Group>(null)

  if (style === "modern") {
    return (
      <group ref={groupRef} position={position} scale={scale} rotation={rotation}>
        {/* Main structure */}
        <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[6, 3, 4]} />
          <meshStandardMaterial color="#F5F5F5" />
        </mesh>

        {/* Second floor */}
        <mesh position={[1, 3.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[4, 2, 3]} />
          <meshStandardMaterial color="#E8E8E8" />
        </mesh>

        {/* Flat roof */}
        <mesh position={[0, 3.1, 0]} castShadow>
          <boxGeometry args={[6.2, 0.2, 4.2]} />
          <meshStandardMaterial color="#696969" />
        </mesh>

        {/* Large windows */}
        <mesh position={[2.9, 1.5, 0]} castShadow>
          <boxGeometry args={[0.1, 2, 3]} />
          <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} />
        </mesh>

        {/* Garage */}
        <mesh position={[-2, 1, 1.5]} castShadow receiveShadow>
          <boxGeometry args={[2, 2, 1]} />
          <meshStandardMaterial color="#D3D3D3" />
        </mesh>

        {/* Driveway */}
        <mesh position={[-2, 0.01, 3]} receiveShadow>
          <boxGeometry args={[2, 0.02, 3]} />
          <meshStandardMaterial color="#696969" />
        </mesh>
      </group>
    )
  }

  // Return traditional house as fallback
  return <ProceduralHouse position={position} scale={scale} rotation={rotation} />
}

// Outdoor Entertainment Area
export function OutdoorKitchen({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: {
  position?: [number, number, number]
  rotation?: [number, number, number]
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* BBQ Island */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[2, 1, 0.8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* BBQ Grill */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[1.5, 0.4, 0.6]} />
        <meshStandardMaterial color="#2F4F4F" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Bar stools */}
      {[-0.8, 0, 0.8].map((x, i) => (
        <group key={i} position={[x, 0, -1.2]}>
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.15, 0.6, 8]} />
            <meshStandardMaterial color="#654321" />
          </mesh>
          <mesh position={[0, 0.65, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.2, 0.05, 8]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// GLTF Model Loader (for external files)
export function GLTFModel({
  url,
  position = [0, 0, 0],
  scale = 1,
  rotation = [0, 0, 0],
}: {
  url: string
  position?: [number, number, number]
  scale?: number | [number, number, number]
  rotation?: [number, number, number]
}) {
  // Uncomment when you have GLTF files
  // const { scene } = useGLTF(url)

  // For now, return a placeholder
  return (
    <mesh position={position} rotation={rotation} scale={scale} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#FF69B4" />
    </mesh>
  )
}
