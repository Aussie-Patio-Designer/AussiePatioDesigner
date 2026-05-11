"use client"

import { useMemo } from "react"
import * as THREE from "three"

export type EnvironmentVisibility = {
  house: boolean
  pool: boolean
  shed: boolean
  trees: boolean
  fences: boolean
  furniture: boolean
  gardenBeds: boolean
  clothesline: boolean
  driveway: boolean
}

export const defaultEnvironmentVisibility: EnvironmentVisibility = {
  house: true,
  pool: true,
  shed: true,
  trees: true,
  fences: true,
  furniture: true,
  gardenBeds: true,
  clothesline: true,
  driveway: true,
}

// ─────────────────────────────────────────────
// REALISTIC AUSTRALIAN HOUSE
// ─────────────────────────────────────────────
export function RealisticHouse({
  position = [-2, 0, -8] as [number, number, number],
  rotation = [0, Math.PI / 12, 0] as [number, number, number],
  scale = 1,
}: {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
}) {
  const wallColor = "#f0ebe3"
  const trimColor = "#e8e1d5"
  const roofColor = "#3d3f42"
  const windowColor = "#6ba3c7"
  const doorColor = "#5a3a28"
  const gutterColor = "#7a7d82"

  const houseWidth = 10 * scale
  const houseDepth = 8 * scale
  const wallHeight = 2.8 * scale
  const roofPeakExtra = 1.6 * scale
  const slabThickness = 0.15 * scale

  return (
    <group position={position} rotation={rotation}>
      {/* Concrete slab */}
      <mesh position={[0, slabThickness / 2 - 0.01, 0]} receiveShadow castShadow>
        <boxGeometry args={[houseWidth + 0.4, slabThickness, houseDepth + 0.4]} />
        <meshStandardMaterial color="#c8c3bb" roughness={0.9} metalness={0.05} />
      </mesh>

      {/* Main walls */}
      <mesh position={[0, wallHeight / 2 + slabThickness, 0]} castShadow receiveShadow>
        <boxGeometry args={[houseWidth, wallHeight, houseDepth]} />
        <meshStandardMaterial color={wallColor} roughness={0.85} metalness={0.02} />
      </mesh>

      {/* Roof – gable along width */}
      <RoofShape
        width={houseWidth + 0.6}
        depth={houseDepth + 0.6}
        peakHeight={roofPeakExtra}
        baseY={wallHeight + slabThickness}
        color={roofColor}
        scale={scale}
      />

      {/* Gutter strips */}
      {[-1, 1].map((side, i) => (
        <mesh
          key={`gutter-${i}`}
          position={[0, wallHeight + slabThickness - 0.05, (side * (houseDepth + 0.6)) / 2]}
          castShadow
        >
          <boxGeometry args={[houseWidth + 0.8, 0.1, 0.12]} />
          <meshStandardMaterial color={gutterColor} roughness={0.4} metalness={0.5} />
        </mesh>
      ))}

      {/* Front windows (3 evenly spaced) */}
      {[-3, 0, 3].map((xOff, i) => (
        <WindowUnit
          key={`fw-${i}`}
          position={[xOff * scale, wallHeight * 0.55 + slabThickness, houseDepth / 2 + 0.01]}
          width={1.2 * scale}
          height={1.3 * scale}
          frameColor={trimColor}
          glassColor={windowColor}
          side="front"
        />
      ))}

      {/* Side windows */}
      {[-2, 2].map((zOff, i) => (
        <WindowUnit
          key={`sw-${i}`}
          position={[houseWidth / 2 + 0.01, wallHeight * 0.55 + slabThickness, zOff * scale]}
          width={1.0 * scale}
          height={1.1 * scale}
          frameColor={trimColor}
          glassColor={windowColor}
          side="side"
        />
      ))}

      {/* Front door */}
      <mesh position={[0, 1.05 * scale + slabThickness, houseDepth / 2 + 0.02]} castShadow>
        <boxGeometry args={[0.95 * scale, 2.1 * scale, 0.08]} />
        <meshStandardMaterial color={doorColor} roughness={0.7} metalness={0.1} />
      </mesh>
      {/* Door handle */}
      <mesh position={[0.3 * scale, 1.05 * scale + slabThickness, houseDepth / 2 + 0.07]}>
        <sphereGeometry args={[0.03 * scale, 8, 6]} />
        <meshStandardMaterial color="#b8a080" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Verandah posts near patio side */}
      {[-3.5, -1.5, 1.5, 3.5].map((xOff, i) => (
        <mesh
          key={`vpost-${i}`}
          position={[xOff * scale, wallHeight / 2 + slabThickness, houseDepth / 2 + 1.2 * scale]}
          castShadow
        >
          <boxGeometry args={[0.09 * scale, wallHeight, 0.09 * scale]} />
          <meshStandardMaterial color={trimColor} roughness={0.6} metalness={0.15} />
        </mesh>
      ))}

      {/* Verandah roof (flat overhang) */}
      <mesh
        position={[0, wallHeight + slabThickness - 0.15, houseDepth / 2 + 0.7 * scale]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[houseWidth + 0.4, 0.08, 1.6 * scale]} />
        <meshStandardMaterial color={roofColor} roughness={0.5} metalness={0.3} />
      </mesh>
    </group>
  )
}

function RoofShape({
  width,
  depth,
  peakHeight,
  baseY,
  color,
  scale: _scale,
}: {
  width: number
  depth: number
  peakHeight: number
  baseY: number
  color: string
  scale: number
}) {
  const roofGeo = useMemo(() => {
    const hw = width / 2
    const hd = depth / 2
    const vertices = new Float32Array([
      -hw, 0, -hd,
      hw, 0, -hd,
      0, peakHeight, -hd,
      -hw, 0, hd,
      hw, 0, hd,
      0, peakHeight, hd,
    ])
    const indices = [
      0, 1, 2,
      3, 5, 4,
      0, 3, 1,
      1, 3, 4,
      1, 4, 2,
      2, 4, 5,
      2, 5, 0,
      0, 5, 3,
    ]
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(vertices, 3))
    geo.setIndex(indices)
    geo.computeVertexNormals()
    return geo
  }, [width, depth, peakHeight])

  return (
    <mesh geometry={roofGeo} position={[0, baseY, 0]} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={0.55} metalness={0.2} side={THREE.DoubleSide} />
    </mesh>
  )
}

function WindowUnit({
  position,
  width,
  height,
  frameColor,
  glassColor,
  side,
}: {
  position: [number, number, number]
  width: number
  height: number
  frameColor: string
  glassColor: string
  side: "front" | "side"
}) {
  const rot: [number, number, number] = side === "side" ? [0, Math.PI / 2, 0] : [0, 0, 0]
  return (
    <group position={position} rotation={rot}>
      {/* Frame */}
      <mesh castShadow>
        <boxGeometry args={[width + 0.06, height + 0.06, 0.06]} />
        <meshStandardMaterial color={frameColor} roughness={0.6} metalness={0.1} />
      </mesh>
      {/* Glass */}
      <mesh position={[0, 0, 0.01]}>
        <boxGeometry args={[width - 0.04, height - 0.04, 0.02]} />
        <meshStandardMaterial
          color={glassColor}
          roughness={0.15}
          metalness={0.6}
          transparent
          opacity={0.55}
          envMapIntensity={1.2}
        />
      </mesh>
      {/* Cross mullion */}
      <mesh position={[0, 0, 0.025]}>
        <boxGeometry args={[0.025, height - 0.06, 0.01]} />
        <meshStandardMaterial color={frameColor} roughness={0.5} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.02, 0.025]}>
        <boxGeometry args={[width - 0.06, 0.025, 0.01]} />
        <meshStandardMaterial color={frameColor} roughness={0.5} metalness={0.1} />
      </mesh>
    </group>
  )
}

// ─────────────────────────────────────────────
// REALISTIC SWIMMING POOL
// ─────────────────────────────────────────────
export function SwimmingPool({
  position = [8, 0, 5] as [number, number, number],
  rotation = [0, -0.15, 0] as [number, number, number],
}: {
  position?: [number, number, number]
  rotation?: [number, number, number]
}) {
  const poolLength = 6
  const poolWidth = 3
  const poolDepth = 1.4
  const copingWidth = 0.25
  const waterLevel = poolDepth - 0.12

  const waterMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#0284c7",
        roughness: 0.05,
        metalness: 0.1,
        transparent: true,
        opacity: 0.86,
        transmission: 0.3,
        thickness: 1.0,
        ior: 1.33,
        envMapIntensity: 2.0,
      }),
    [],
  )

  return (
    <group position={position} rotation={rotation}>
      {/* Pool shell */}
      <mesh position={[0, -poolDepth / 2, 0]} receiveShadow>
        <boxGeometry args={[poolLength, poolDepth, poolWidth]} />
        <meshStandardMaterial color="#c2dce8" roughness={0.3} metalness={0.05} side={THREE.BackSide} />
      </mesh>

      {/* Pool tile lining (interior bottom) */}
      <mesh position={[0, -poolDepth + 0.02, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[poolLength - 0.1, poolWidth - 0.1]} />
        <meshStandardMaterial color="#7fc5d9" roughness={0.25} metalness={0.05} />
      </mesh>

      {/* Water surface */}
      <mesh position={[0, -poolDepth + waterLevel, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[poolLength - 0.08, poolWidth - 0.08]} />
        <primitive object={waterMaterial} attach="material" />
      </mesh>

      {/* Coping stones around pool edge */}
      {/* Long sides */}
      {[-1, 1].map((side, i) => (
        <mesh
          key={`coping-l-${i}`}
          position={[0, 0.04, (side * (poolWidth + copingWidth)) / 2]}
          receiveShadow
          castShadow
        >
          <boxGeometry args={[poolLength + copingWidth * 2, 0.08, copingWidth]} />
          <meshStandardMaterial color="#e8e1d5" roughness={0.7} metalness={0.05} />
        </mesh>
      ))}
      {/* Short sides */}
      {[-1, 1].map((side, i) => (
        <mesh
          key={`coping-s-${i}`}
          position={[(side * (poolLength + copingWidth)) / 2, 0.04, 0]}
          receiveShadow
          castShadow
        >
          <boxGeometry args={[copingWidth, 0.08, poolWidth + copingWidth * 2]} />
          <meshStandardMaterial color="#e8e1d5" roughness={0.7} metalness={0.05} />
        </mesh>
      ))}

      {/* Pool decking area */}
      <mesh position={[0, 0.01, poolWidth / 2 + copingWidth + 0.8]} receiveShadow>
        <boxGeometry args={[poolLength + 1.5, 0.04, 1.8]} />
        <meshStandardMaterial color="#b5957a" roughness={0.75} metalness={0.05} />
      </mesh>

      {/* Pool ladder */}
      <group position={[poolLength / 2 - 0.5, 0, -poolWidth / 2 + 0.3]}>
        {[-0.15, 0.15].map((xOff, i) => (
          <mesh key={`rail-${i}`} position={[xOff, -0.3, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 1.0, 8]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.7} roughness={0.25} />
          </mesh>
        ))}
        {[0, -0.25, -0.5].map((yOff, i) => (
          <mesh key={`step-${i}`} position={[0, yOff, 0]} castShadow>
            <boxGeometry args={[0.3, 0.02, 0.06]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.7} roughness={0.25} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// ─────────────────────────────────────────────
// GARDEN SHED
// ─────────────────────────────────────────────
export function GardenShed({
  position = [-10, 0, 6] as [number, number, number],
  rotation = [0, 0.3, 0] as [number, number, number],
}: {
  position?: [number, number, number]
  rotation?: [number, number, number]
}) {
  const shedW = 2.4
  const shedD = 3.0
  const shedH = 2.2
  const roofPeak = 0.5
  const shedColor = "#8b7d6b"
  const roofColor = "#5a5e5f"

  return (
    <group position={position} rotation={rotation}>
      {/* Concrete pad */}
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[shedW + 0.3, 0.08, shedD + 0.3]} />
        <meshStandardMaterial color="#c0bbb4" roughness={0.85} metalness={0.05} />
      </mesh>

      {/* Walls */}
      <mesh position={[0, shedH / 2 + 0.08, 0]} castShadow receiveShadow>
        <boxGeometry args={[shedW, shedH, shedD]} />
        <meshStandardMaterial color={shedColor} roughness={0.75} metalness={0.25} />
      </mesh>

      {/* Corrugated wall texture strips */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh
          key={`strip-${i}`}
          position={[0, 0.35 + i * (shedH / 8), shedD / 2 + 0.005]}
          castShadow
        >
          <boxGeometry args={[shedW - 0.04, 0.015, 0.01]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? "#7d7063" : shedColor}
            roughness={0.6}
            metalness={0.3}
          />
        </mesh>
      ))}

      {/* Gable roof */}
      <mesh
        position={[0, shedH + 0.08 + roofPeak / 2, -shedD * 0.25]}
        rotation={[Math.atan2(roofPeak, shedD / 2), 0, 0]}
        castShadow
      >
        <boxGeometry args={[shedW + 0.2, 0.04, shedD / 2 / Math.cos(Math.atan2(roofPeak, shedD / 2)) + 0.1]} />
        <meshStandardMaterial color={roofColor} roughness={0.5} metalness={0.35} />
      </mesh>
      <mesh
        position={[0, shedH + 0.08 + roofPeak / 2, shedD * 0.25]}
        rotation={[-Math.atan2(roofPeak, shedD / 2), 0, 0]}
        castShadow
      >
        <boxGeometry args={[shedW + 0.2, 0.04, shedD / 2 / Math.cos(Math.atan2(roofPeak, shedD / 2)) + 0.1]} />
        <meshStandardMaterial color={roofColor} roughness={0.5} metalness={0.35} />
      </mesh>

      {/* Door */}
      <mesh position={[0, shedH * 0.45 + 0.08, shedD / 2 + 0.015]} castShadow>
        <boxGeometry args={[1.0, shedH * 0.85, 0.04]} />
        <meshStandardMaterial color="#6b5d4f" roughness={0.7} metalness={0.2} />
      </mesh>
      {/* Door handle */}
      <mesh position={[0.35, shedH * 0.45 + 0.08, shedD / 2 + 0.05]}>
        <boxGeometry args={[0.08, 0.03, 0.03]} />
        <meshStandardMaterial color="#999" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  )
}

// ─────────────────────────────────────────────
// EUCALYPTUS / BOTTLEBRUSH TREE
// ─────────────────────────────────────────────
export function AustralianTree({
  position = [0, 0, 0] as [number, number, number],
  scale = 1,
  variant = 0,
}: {
  position?: [number, number, number]
  scale?: number
  variant?: number
}) {
  const trunkHeight = (2.5 + variant * 0.5) * scale
  const trunkRadius = 0.12 * scale
  const canopyRadius = (1.8 + variant * 0.4) * scale

  // Slightly different greens for variety
  const greens = ["#4a7a3e", "#3d6b35", "#567f48", "#3a5e30"]
  const canopyColor = greens[variant % greens.length]
  const trunkColor = variant % 2 === 0 ? "#8b7355" : "#7a6548"

  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, trunkHeight / 2, 0]} castShadow>
        <cylinderGeometry args={[trunkRadius * 0.7, trunkRadius, trunkHeight, 8]} />
        <meshStandardMaterial color={trunkColor} roughness={0.9} metalness={0.0} />
      </mesh>

      {/* Main canopy – layered spheres for organic shape */}
      <mesh position={[0, trunkHeight + canopyRadius * 0.5, 0]} castShadow>
        <sphereGeometry args={[canopyRadius, 12, 10]} />
        <meshStandardMaterial color={canopyColor} roughness={0.85} metalness={0.0} />
      </mesh>
      <mesh
        position={[canopyRadius * 0.3, trunkHeight + canopyRadius * 0.8, canopyRadius * 0.2]}
        castShadow
      >
        <sphereGeometry args={[canopyRadius * 0.7, 10, 8]} />
        <meshStandardMaterial color={canopyColor} roughness={0.85} metalness={0.0} />
      </mesh>
      <mesh
        position={[-canopyRadius * 0.35, trunkHeight + canopyRadius * 0.35, -canopyRadius * 0.15]}
        castShadow
      >
        <sphereGeometry args={[canopyRadius * 0.65, 10, 8]} />
        <meshStandardMaterial color={canopyColor} roughness={0.85} metalness={0.0} />
      </mesh>
    </group>
  )
}

// ─────────────────────────────────────────────
// COLOURBOND FENCE
// ─────────────────────────────────────────────
export function ColourbondFence({
  start = [-15, 0, -12] as [number, number, number],
  end = [15, 0, -12] as [number, number, number],
  height = 1.8,
  color = "#3e4a47",
}: {
  start?: [number, number, number]
  end?: [number, number, number]
  height?: number
  color?: string
}) {
  const dx = end[0] - start[0]
  const dz = end[2] - start[2]
  const length = Math.sqrt(dx * dx + dz * dz)
  const angle = Math.atan2(dx, dz)
  const midX = (start[0] + end[0]) / 2
  const midZ = (start[2] + end[2]) / 2
  const postSpacing = 2.4
  const numPosts = Math.ceil(length / postSpacing) + 1

  return (
    <group>
      {/* Fence panels */}
      <mesh
        position={[midX, height / 2, midZ]}
        rotation={[0, angle, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.02, height, length]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.3} />
      </mesh>

      {/* Fence posts */}
      {Array.from({ length: numPosts }, (_, i) => {
        const t = i / (numPosts - 1)
        const px = start[0] + dx * t
        const pz = start[2] + dz * t
        return (
          <mesh key={`fp-${i}`} position={[px, height / 2, pz]} castShadow>
            <boxGeometry args={[0.065, height + 0.05, 0.065]} />
            <meshStandardMaterial color="#2c2e33" roughness={0.5} metalness={0.4} />
          </mesh>
        )
      })}

      {/* Top rail */}
      <mesh
        position={[midX, height, midZ]}
        rotation={[0, angle, 0]}
        castShadow
      >
        <boxGeometry args={[0.04, 0.04, length]} />
        <meshStandardMaterial color="#2c2e33" roughness={0.5} metalness={0.4} />
      </mesh>
    </group>
  )
}

// ─────────────────────────────────────────────
// OUTDOOR BBQ / TABLE SETTING
// ─────────────────────────────────────────────
export function OutdoorFurniture({
  position = [0, 0, 0] as [number, number, number],
  rotation = [0, 0, 0] as [number, number, number],
}: {
  position?: [number, number, number]
  rotation?: [number, number, number]
}) {
  const tableHeight = 0.75
  const tableW = 1.6
  const tableD = 0.9

  return (
    <group position={position} rotation={rotation}>
      {/* Table top */}
      <mesh position={[0, tableHeight, 0]} castShadow receiveShadow>
        <boxGeometry args={[tableW, 0.04, tableD]} />
        <meshStandardMaterial color="#a8906e" roughness={0.7} metalness={0.05} />
      </mesh>
      {/* Table legs */}
      {[
        [-tableW / 2 + 0.08, 0, -tableD / 2 + 0.08],
        [tableW / 2 - 0.08, 0, -tableD / 2 + 0.08],
        [-tableW / 2 + 0.08, 0, tableD / 2 - 0.08],
        [tableW / 2 - 0.08, 0, tableD / 2 - 0.08],
      ].map((leg, i) => (
        <mesh key={`tleg-${i}`} position={[leg[0], tableHeight / 2, leg[2]]} castShadow>
          <boxGeometry args={[0.05, tableHeight, 0.05]} />
          <meshStandardMaterial color="#7a6548" roughness={0.6} metalness={0.1} />
        </mesh>
      ))}

      {/* Chairs (2 on each long side) */}
      {[-0.35, 0.35].map((xOff, ci) =>
        [-1, 1].map((side, si) => {
          const chairZ = side * (tableD / 2 + 0.4)
          return (
            <group key={`chair-${ci}-${si}`} position={[xOff, 0, chairZ]}>
              {/* Seat */}
              <mesh position={[0, 0.45, 0]} castShadow>
                <boxGeometry args={[0.45, 0.04, 0.42]} />
                <meshStandardMaterial color="#5c5147" roughness={0.7} metalness={0.1} />
              </mesh>
              {/* Chair legs */}
              {[
                [-0.18, -0.18],
                [0.18, -0.18],
                [-0.18, 0.16],
                [0.18, 0.16],
              ].map((lp, li) => (
                <mesh key={`cl-${li}`} position={[lp[0], 0.22, lp[1]]} castShadow>
                  <boxGeometry args={[0.03, 0.44, 0.03]} />
                  <meshStandardMaterial color="#5c5147" roughness={0.6} metalness={0.1} />
                </mesh>
              ))}
              {/* Backrest */}
              <mesh position={[0, 0.72, side * -0.19]} castShadow>
                <boxGeometry args={[0.42, 0.5, 0.03]} />
                <meshStandardMaterial color="#5c5147" roughness={0.7} metalness={0.1} />
              </mesh>
            </group>
          )
        }),
      )}

      {/* BBQ (standing next to table) */}
      <group position={[tableW / 2 + 0.8, 0, 0]}>
        {/* BBQ body */}
        <mesh position={[0, 0.85, 0]} castShadow>
          <boxGeometry args={[0.7, 0.35, 0.5]} />
          <meshStandardMaterial color="#2c2e33" roughness={0.5} metalness={0.45} />
        </mesh>
        {/* BBQ lid */}
        <mesh position={[0, 1.06, 0]} castShadow>
          <boxGeometry args={[0.72, 0.08, 0.52]} />
          <meshStandardMaterial color="#1e1f22" roughness={0.4} metalness={0.5} />
        </mesh>
        {/* Legs */}
        {[
          [-0.28, -0.2],
          [0.28, -0.2],
          [-0.28, 0.2],
          [0.28, 0.2],
        ].map((lp, i) => (
          <mesh key={`bleg-${i}`} position={[lp[0], 0.34, lp[1]]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.68, 6]} />
            <meshStandardMaterial color="#444" metalness={0.5} roughness={0.4} />
          </mesh>
        ))}
        {/* Shelf */}
        <mesh position={[0, 0.25, 0]} castShadow>
          <boxGeometry args={[0.55, 0.02, 0.35]} />
          <meshStandardMaterial color="#555" metalness={0.4} roughness={0.5} />
        </mesh>
      </group>
    </group>
  )
}

// ─────────────────────────────────────────────
// GARDEN BED WITH MULCH & PLANTS
// ─────────────────────────────────────────────
export function GardenBed({
  position = [0, 0, 0] as [number, number, number],
  width = 4,
  depth = 1.2,
  rotation = [0, 0, 0] as [number, number, number],
}: {
  position?: [number, number, number]
  width?: number
  depth?: number
  rotation?: [number, number, number]
}) {
  const edgeHeight = 0.2
  const mulchColor = "#5a3e28"

  // Generate random-ish small plant positions
  const plants = useMemo(() => {
    const arr = []
    const numPlants = Math.floor(width * 2.5)
    for (let i = 0; i < numPlants; i++) {
      const px = (Math.sin(i * 3.7 + 1.2) * 0.5 + 0.5) * (width - 0.3) - (width - 0.3) / 2
      const pz = (Math.cos(i * 2.3 + 0.7) * 0.5 + 0.5) * (depth - 0.3) - (depth - 0.3) / 2
      const h = 0.15 + (Math.sin(i * 1.9) * 0.5 + 0.5) * 0.35
      const green = ["#4a7a3e", "#6b9b4e", "#3d6b35", "#2d5a28", "#5a8f42"][i % 5]
      arr.push({ x: px, z: pz, h, color: green })
    }
    return arr
  }, [width, depth])

  return (
    <group position={position} rotation={rotation}>
      {/* Mulch fill */}
      <mesh position={[0, edgeHeight / 2, 0]} receiveShadow>
        <boxGeometry args={[width, edgeHeight, depth]} />
        <meshStandardMaterial color={mulchColor} roughness={0.95} metalness={0.0} />
      </mesh>

      {/* Timber edge */}
      {[
        { pos: [0, edgeHeight / 2, depth / 2] as [number, number, number], size: [width + 0.1, edgeHeight + 0.02, 0.06] as [number, number, number] },
        { pos: [0, edgeHeight / 2, -depth / 2] as [number, number, number], size: [width + 0.1, edgeHeight + 0.02, 0.06] as [number, number, number] },
        { pos: [width / 2, edgeHeight / 2, 0] as [number, number, number], size: [0.06, edgeHeight + 0.02, depth + 0.1] as [number, number, number] },
        { pos: [-width / 2, edgeHeight / 2, 0] as [number, number, number], size: [0.06, edgeHeight + 0.02, depth + 0.1] as [number, number, number] },
      ].map((edge, i) => (
        <mesh key={`edge-${i}`} position={edge.pos} castShadow>
          <boxGeometry args={edge.size} />
          <meshStandardMaterial color="#6b5d4f" roughness={0.8} metalness={0.05} />
        </mesh>
      ))}

      {/* Small plants / shrubs */}
      {plants.map((p, i) => (
        <mesh key={`plant-${i}`} position={[p.x, edgeHeight + p.h / 2, p.z]} castShadow>
          <sphereGeometry args={[p.h * 0.7, 8, 6]} />
          <meshStandardMaterial color={p.color} roughness={0.9} metalness={0.0} />
        </mesh>
      ))}
    </group>
  )
}

// ─────────────────────────────────────────────
// CLOTHESLINE (Aussie classic!)
// ─────────────────────────────────────────────
export function Clothesline({
  position = [-8, 0, 10] as [number, number, number],
}: {
  position?: [number, number, number]
}) {
  const poleHeight = 2.0
  const armLength = 1.5

  return (
    <group position={position}>
      {/* Central pole */}
      <mesh position={[0, poleHeight / 2, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.04, poleHeight, 8]} />
        <meshStandardMaterial color="#b0b0b0" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Arms */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((rot, i) => (
        <mesh
          key={`arm-${i}`}
          position={[Math.sin(rot) * armLength / 2, poleHeight, Math.cos(rot) * armLength / 2]}
          rotation={[0, rot, 0]}
          castShadow
        >
          <boxGeometry args={[0.02, 0.02, armLength]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.5} roughness={0.35} />
        </mesh>
      ))}

      {/* Lines connecting arm ends */}
      {[0.3, 0.6, 0.9, 1.2, 1.5].map((dist, li) => (
        <group key={`line-${li}`}>
          {[0, 1, 2, 3].map((side) => {
            const angle = (side * Math.PI) / 2
            const nextAngle = ((side + 1) * Math.PI) / 2
            const x1 = Math.sin(angle) * dist
            const z1 = Math.cos(angle) * dist
            const x2 = Math.sin(nextAngle) * dist
            const z2 = Math.cos(nextAngle) * dist
            const mx = (x1 + x2) / 2
            const mz = (z1 + z2) / 2
            const len = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2)
            const ang = Math.atan2(x2 - x1, z2 - z1)
            return (
              <mesh key={`wire-${side}`} position={[mx, poleHeight - 0.01, mz]} rotation={[0, ang, 0]}>
                <boxGeometry args={[0.003, 0.003, len]} />
                <meshStandardMaterial color="#999" metalness={0.4} roughness={0.5} />
              </mesh>
            )
          })}
        </group>
      ))}
    </group>
  )
}

// ─────────────────────────────────────────────
// DRIVEWAY
// ─────────────────────────────────────────────
export function Driveway({
  position = [6, 0.005, -10] as [number, number, number],
  rotation = [0, 0.1, 0] as [number, number, number],
}: {
  position?: [number, number, number]
  rotation?: [number, number, number]
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3.5, 12]} />
        <meshStandardMaterial color="#b5b0a8" roughness={0.85} metalness={0.05} />
      </mesh>
      {/* Expansion joints */}
      {[-4, -2, 0, 2, 4].map((zOff, i) => (
        <mesh key={`joint-${i}`} position={[0, 0.002, zOff]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.4, 0.02]} />
          <meshStandardMaterial color="#9a968f" roughness={0.9} metalness={0.0} />
        </mesh>
      ))}
    </group>
  )
}

// ─────────────────────────────────────────────
// FULL ENVIRONMENT COMPOSITION
// ─────────────────────────────────────────────
export function BackyardEnvironment({
  gazeboLength = 3,
  gazeboWidth = 3,
  isAttached = false,
  visibility = defaultEnvironmentVisibility,
}: {
  gazeboLength?: number
  gazeboWidth?: number
  isAttached?: boolean
  visibility?: EnvironmentVisibility
}) {
  // Position objects relative to the gazebo (centred at origin)
  const gl = gazeboLength / 1000
  const gw = gazeboWidth / 1000

  return (
    <group>
      {/* House – behind the gazebo if not attached */}
      {visibility.house && !isAttached && (
        <RealisticHouse
          position={[0, 0, -(gw / 2 + 6)]}
          rotation={[0, 0, 0]}
          scale={0.9}
        />
      )}

      {/* Swimming pool – to the right */}
      {visibility.pool && (
        <SwimmingPool
          position={[gl / 2 + 5, 0, gw / 2 + 1]}
          rotation={[0, -0.1, 0]}
        />
      )}

      {/* Garden shed – back-left corner */}
      {visibility.shed && (
        <GardenShed
          position={[-(gl / 2 + 6), 0, gw / 2 + 4]}
          rotation={[0, 0.25, 0]}
        />
      )}

      {/* Outdoor furniture under/near the patio */}
      {visibility.furniture && (
        <OutdoorFurniture
          position={[0.3, 0, 0.2]}
          rotation={[0, 0.05, 0]}
        />
      )}

      {/* Smaller boundary trees that keep the patio visible. */}
      {visibility.trees && (
        <>
          <AustralianTree position={[-(gl / 2 + 10), 0, gw / 2 + 8]} scale={0.75} variant={0} />
          <AustralianTree position={[gl / 2 + 11, 0, gw / 2 + 8.5]} scale={0.82} variant={1} />
          <AustralianTree position={[gl / 2 + 10.5, 0, -(gw / 2 + 8)]} scale={0.7} variant={2} />
        </>
      )}

      {/* Colourbond fences on boundary */}
      {visibility.fences && (
        <>
      <ColourbondFence
        start={[-(gl / 2 + 14), 0, -(gw / 2 + 10)]}
        end={[gl / 2 + 14, 0, -(gw / 2 + 10)]}
        height={1.8}
        color="#3e4a47"
      />
      <ColourbondFence
        start={[-(gl / 2 + 14), 0, -(gw / 2 + 10)]}
        end={[-(gl / 2 + 14), 0, gw / 2 + 12]}
        height={1.8}
        color="#3e4a47"
      />
      <ColourbondFence
        start={[gl / 2 + 14, 0, -(gw / 2 + 10)]}
        end={[gl / 2 + 14, 0, gw / 2 + 12]}
        height={1.8}
        color="#3e4a47"
      />
      <ColourbondFence
        start={[-(gl / 2 + 14), 0, gw / 2 + 12]}
        end={[gl / 2 + 14, 0, gw / 2 + 12]}
        height={1.8}
        color="#3e4a47"
      />
        </>
      )}

      {/* Garden beds */}
      {visibility.gardenBeds && (
        <>
      <GardenBed
        position={[-(gl / 2 + 2), 0, -(gw / 2 + 3)]}
        width={5}
        depth={1.0}
        rotation={[0, 0.1, 0]}
      />
      <GardenBed
        position={[gl / 2 + 2.5, 0, -(gw / 2 + 4)]}
        width={3.5}
        depth={0.9}
        rotation={[0, -0.15, 0]}
      />
      <GardenBed
        position={[-(gl / 2 + 10), 0, gw / 2 + 2]}
        width={3}
        depth={1.1}
        rotation={[0, Math.PI / 2, 0]}
      />
        </>
      )}

      {/* Clothesline */}
      {visibility.clothesline && <Clothesline position={[-(gl / 2 + 5), 0, gw / 2 + 7]} />}

      {/* Driveway */}
      {visibility.driveway && (
        <Driveway
          position={[gl / 2 + 8, 0.005, -(gw / 2 + 5)]}
          rotation={[0, 0.05, 0]}
        />
      )}
    </group>
  )
}
