"use client"

import { Canvas, useThree } from "@react-three/fiber"
import { ContactShadows, Environment, OrbitControls, Plane } from "@react-three/drei"
import { Suspense, useRef, useImperativeHandle, forwardRef, useCallback, useState, useEffect, useMemo } from "react"
import { TextureLoader, BackSide } from "three"
import * as THREE from "three"
import {
  getEnhancedColorHex,
  getMaterialProperties,
  getGutterMaterialProperties,
  getOutletMaterialProperties,
} from "@/lib/colorbond-colors"

type AttachmentMethod = "wall" | "gutter_fascia" | "roof_penetration"

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
  isAttached?: boolean
  attachmentType?: AttachmentMethod
}

export interface GazeboPreviewRef {
  captureScreenshot: () => Promise<string | null>
}

// Simplified skybox with just a light blue color gradient
function SimpleSkybox() {
  // Create a simple gradient using vertex colors
  const skyMaterial = useMemo(() => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return null

    canvas.width = 2
    canvas.height = 2

    // Create vertical gradient from light blue to slightly darker blue
    const gradient = ctx.createLinearGradient(0, 0, 0, 2)
    gradient.addColorStop(0, "#a7d9ff") // Light blue at top
    gradient.addColorStop(1, "#d6eeff") // Very light blue at horizon

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 2, 2)

    const texture = new THREE.CanvasTexture(canvas)
    texture.mapping = THREE.EquirectangularReflectionMapping

    return new THREE.MeshBasicMaterial({
      map: texture,
      side: BackSide,
      toneMapped: false,
    })
  }, [])

  return (
    <>
      {/* Simple gradient sky background */}
      <mesh>
        <sphereGeometry args={[100, 16, 16]} />
        <primitive object={skyMaterial} attach="material" />
      </mesh>

      {/* Subtle environment for minimal reflections */}
      <Environment background={false} preset="city" intensity={0.45} />
    </>
  )
}

// Update the GrassGround function to use the new grass texture
function GrassGround() {
  const [grassTexture, setGrassTexture] = useState(null)

  useEffect(() => {
    const loader = new TextureLoader()
    loader.load(
      "/textures/grass-texture-background.jpg", // Using your new grass texture
      (texture) => {
        // Enhanced texture settings for tiling
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        texture.repeat.set(12, 12) // Increased from 8x8 to 12x12 for wider area
        texture.anisotropy = 16 // Maximum anisotropy for crisp textures
        texture.colorSpace = THREE.SRGBColorSpace
        setGrassTexture(texture)
      },
      undefined,
      (error) => {
        console.warn("Grass texture failed to load, using fallback color")
        setGrassTexture(null)
      },
    )
  }, [])

  // Create realistic grass material
  const grassMaterial = useMemo(() => {
    if (grassTexture) {
      return new THREE.MeshStandardMaterial({
        map: grassTexture,
        color: "#ffffff",
        roughness: 0.8,
        metalness: 0.0,
      })
    } else {
      return new THREE.MeshStandardMaterial({
        color: "#4ade80",
        roughness: 0.8,
        metalness: 0.0,
      })
    }
  }, [grassTexture])

  return (
    <Plane args={[80, 80]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <primitive object={grassMaterial} attach="material" />
    </Plane>
  )
}

// Update the ConcreteArea function for realistic concrete
function ConcreteArea({
  length,
  width,
  hasOverhang,
  overhangSides,
  overhangSize,
}: {
  length: number
  width: number
  hasOverhang: boolean
  overhangSides: string[]
  overhangSize: number
}) {
  const [concreteTexture, setConcreteTexture] = useState(null)

  // Convert mm to meters
  const scaleLength = length / 1000
  const scaleWidth = width / 1000
  const scaleOverhang = overhangSize / 1000

  // Calculate overhang extensions
  const overhangExtensions = {
    front: overhangSides.includes("Front") ? scaleOverhang : 0,
    back: overhangSides.includes("Back") ? scaleOverhang : 0,
    left: overhangSides.includes("Left") ? scaleOverhang : 0,
    right: overhangSides.includes("Right") ? scaleOverhang : 0,
  }

  // Add 1000mm (1m) buffer around the gazebo
  const buffer = 1.0
  const totalLength = scaleLength + overhangExtensions.front + overhangExtensions.back + buffer * 2
  const totalWidth = scaleWidth + overhangExtensions.left + overhangExtensions.right + buffer * 2

  useEffect(() => {
    const loader = new TextureLoader()
    loader.load(
      "/textures/concrete-texture.jpg",
      (texture) => {
        // Enhanced concrete texture settings for tiling
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        texture.repeat.set(6, 6) // Increased from 3x3 to 6x6 for smaller tiles
        texture.anisotropy = 16
        texture.colorSpace = THREE.SRGBColorSpace
        setConcreteTexture(texture)
      },
      undefined,
      (error) => {
        console.warn("Concrete texture failed to load, using fallback color")
        setConcreteTexture(null)
      },
    )
  }, [totalLength, totalWidth])

  return (
    <Plane args={[totalLength, totalWidth]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
      <meshStandardMaterial
        map={concreteTexture}
        color={concreteTexture ? "#ffffff" : "#c0c0c0"}
        roughness={0.9}
        metalness={0.1}
      />
    </Plane>
  )
}

function ConcretePad({ position, size }: { position: [number, number, number]; size: [number, number, number] }) {
  return (
    <mesh position={[position[0], -0.1, position[2]]} receiveShadow>
      <boxGeometry args={[size[0], 0.2, size[2]]} />
      <meshStandardMaterial color="#C0C0C0" />
    </mesh>
  )
}

function HouseAttachment({
  gazeboLength,
  gazeboWidth,
  gazeboHeight,
  roofHighSide,
  attachmentType,
}: {
  gazeboLength: number
  gazeboWidth: number
  gazeboHeight: number
  roofHighSide: number
  attachmentType: AttachmentMethod
}) {
  const houseDepth = 3.2
  const houseHeight = Math.max(roofHighSide + 0.6, 3.0)
  const slabThickness = 0.14
  const wallCenterZ = -gazeboWidth / 2 - houseDepth / 2 + 0.02
  const frontWallZ = -gazeboWidth / 2 + 0.02
  const windowBase = 1.0
  const windowHeight = 1.1
  const windowWidth = 1.2
  const roofAngle = Math.PI / 9
  const roofThickness = 0.18
  const gutterColor = "#94a3b8"
  const connectionHeight = Math.max(gazeboHeight, Math.min(roofHighSide, houseHeight - 0.2))
  const highlightHeight = Math.max(0.2, Math.min(0.6, connectionHeight - 0.2))
  const highlightY = connectionHeight - highlightHeight / 2

  return (
    <group>
      {/* Concrete slab under the sample house */}
      <mesh position={[0, slabThickness / 2 - 0.05, wallCenterZ]} receiveShadow>
        <boxGeometry args={[gazeboLength + 4, slabThickness, houseDepth]} />
        <meshStandardMaterial color="#d1d5db" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* House body */}
      <mesh position={[0, houseHeight / 2, wallCenterZ]} castShadow receiveShadow>
        <boxGeometry args={[gazeboLength + 4, houseHeight, houseDepth]} />
        <meshStandardMaterial color="#f5f3f0" roughness={0.9} metalness={0.05} />
      </mesh>

      {/* Simple window band for context */}
      {Array.from({ length: 3 }).map((_, index) => {
        const spacing = (gazeboLength + 2) / 4
        const x = -((gazeboLength + 2) / 2) + spacing * (index + 1)
        return (
          <mesh key={`house-window-${index}`} position={[x, windowBase + windowHeight / 2, frontWallZ - 0.05]} castShadow>
            <boxGeometry args={[windowWidth, windowHeight, 0.08]} />
            <meshStandardMaterial
              color="#9ca3af"
              roughness={0.4}
              metalness={0.5}
              emissive="#1f2937"
              emissiveIntensity={0.08}
            />
          </mesh>
        )
      })}

      {/* Wall attachment highlight */}
      {attachmentType === "wall" && (
        <mesh position={[0, highlightY, frontWallZ - 0.03]} castShadow>
          <boxGeometry args={[gazeboLength + 0.8, highlightHeight, 0.06]} />
          <meshStandardMaterial color="#cbd5f5" roughness={0.5} metalness={0.3} />
        </mesh>
      )}

      {/* Gutter / fascia connection */}
      {attachmentType === "gutter_fascia" && (
        <group>
          <mesh position={[0, connectionHeight + 0.05, frontWallZ - 0.25]} castShadow>
            <boxGeometry args={[gazeboLength + 3.2, 0.08, 0.5]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.6} metalness={0.2} />
          </mesh>
          <mesh position={[0, connectionHeight + 0.12, frontWallZ - 0.45]} castShadow>
            <boxGeometry args={[gazeboLength + 3.2, 0.12, 0.12]} />
            <meshStandardMaterial color={gutterColor} roughness={0.4} metalness={0.4} />
          </mesh>
          <mesh position={[gazeboLength / 2 - 1, connectionHeight - 0.6, frontWallZ - 0.45]} castShadow>
            <boxGeometry args={[0.15, 1.2, 0.12]} />
            <meshStandardMaterial color={gutterColor} roughness={0.4} metalness={0.4} />
          </mesh>
        </group>
      )}

      {/* Roof penetration detail */}
      {attachmentType === "roof_penetration" && (
        <group>
          <mesh
            position={[0, houseHeight + roofThickness / 2, wallCenterZ - houseDepth / 4]}
            rotation={[roofAngle, 0, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[gazeboLength + 4.5, roofThickness, houseDepth + 1.2]} />
            <meshStandardMaterial color="#cbd5f5" roughness={0.35} metalness={0.4} />
          </mesh>
          <mesh position={[0, houseHeight + 0.7, frontWallZ - 0.3]} castShadow>
            <boxGeometry args={[0.6, 0.5, 0.6]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.5} metalness={0.3} />
          </mesh>
          <mesh position={[0, connectionHeight + 0.08, frontWallZ - 0.12]} castShadow>
            <boxGeometry args={[gazeboLength + 0.8, 0.16, 0.2]} />
            <meshStandardMaterial color="#475569" roughness={0.5} metalness={0.3} />
          </mesh>
        </group>
      )}
    </group>
  )
}

// Create a gutter outlet dripper
function GutterOutlet({
  position,
  color,
}: {
  position: [number, number, number]
  color: string
}) {
  // Use centralized material properties for outlets
  const outletMaterial = getOutletMaterialProperties(color)

  return (
    <group position={position}>
      {/* Outlet spout */}
      <mesh position={[0, 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.02, 0.04, 8]} />
        <meshStandardMaterial
          color={outletMaterial.color}
          metalness={outletMaterial.metalness}
          roughness={outletMaterial.roughness}
          envMapIntensity={outletMaterial.envMapIntensity}
        />
      </mesh>

      {/* Water drip effect */}
      <mesh position={[0, -0.05, 0]} castShadow>
        <sphereGeometry args={[0.008, 8, 6]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.8} />
      </mesh>
    </group>
  )
}

// Logo decals component to place branding around the gazebo
function LogoDecals({ gazeboLength, gazeboWidth }: { gazeboLength: number; gazeboWidth: number }) {
  const [logoTexture, setLogoTexture] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    const loader = new TextureLoader()
    loader.load(
      "/images/aussie-patio-designer-logo.png",
      (texture) => {
        texture.wrapS = THREE.ClampToEdgeWrapping
        texture.wrapT = THREE.ClampToEdgeWrapping
        texture.colorSpace = THREE.SRGBColorSpace
        setLogoTexture(texture)
      },
      undefined,
      (error) => {
        console.warn("Logo texture failed to load:", error)
      },
    )
  }, [])

  if (!logoTexture) return null

  // Convert mm to meters and calculate positions around the gazebo
  const scaleLength = gazeboLength / 1000
  const scaleWidth = gazeboWidth / 1000
  const logoSize = 2.5 // 2.5m x 2.5m logos for better visibility
  const distance = 3.5 // Back to 3.5m from gazebo edge

  // Position all 4 logos to be visible from the ISO camera view [-8, 6, -8]
  // All logos lay completely flat like grass texture decals
  const logoPositions = [
    // Front logo (directly in front - negative Z) - rotated 180 degrees around Y-axis + 90 degrees on X
    {
      position: [0, 0.02, -(scaleWidth / 2 + distance)],
      rotation: [Math.PI / 2, Math.PI, 0], // 90 degree X rotation + 180 degree Y rotation
    },
    // Back logo (directly behind - positive Z) - rotated 180 degrees vertically
    {
      position: [0, 0.02, scaleWidth / 2 + distance],
      rotation: [-Math.PI / 2, 0, 0], // Removed the 180 degree Z rotation
    },
    // Left logo (directly to the left - negative X)
    {
      position: [-(scaleLength / 2 + distance), 0.02, 0],
      rotation: [-Math.PI / 2, 0, -Math.PI / 2], // 90 degree X rotation + 270 degree Z rotation
    },
    // Right logo (directly to the right - positive X)
    {
      position: [scaleLength / 2 + distance, 0.02, 0],
      rotation: [(3 * Math.PI) / 2, 0, Math.PI / 2], // 270 degree X rotation + 90 degree Z rotation
    },
  ]

  return (
    <group>
      {logoPositions.map((logo, index) => (
        <mesh
          key={`logo-${index}`}
          position={logo.position as [number, number, number]}
          rotation={logo.rotation as [number, number, number]}
          receiveShadow
        >
          <planeGeometry args={[logoSize, logoSize]} />
          <meshStandardMaterial
            map={logoTexture}
            transparent
            alphaTest={0.1}
            roughness={0.8}
            metalness={0.0}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}

function GazeboStructure(props: GazeboPreviewProps) {
  const {
    length,
    width,
    height,
    roofType,
    roofPitch,
    roofCladding,
    hasOverhang,
    overhangSides,
    overhangSize,
    roofColor,
    postBeamColor,
    isAttached = false,
    attachmentType,
  } = props

  // Convert mm to meters for 3D scene
  const scaleLength = length / 1000
  const scaleWidth = width / 1000
  const scaleHeight = height / 1000
  const scaleOverhang = overhangSize / 1000
  const resolvedAttachmentType: AttachmentMethod = attachmentType ?? "wall"

  // Use centralized color system - NO LOCAL COLOR LOGIC
  const frameMaterial = getMaterialProperties(postBeamColor || "MONUMENT")
  const gutterMaterial = getGutterMaterialProperties(postBeamColor || "MONUMENT")
  const roofColorHex = getEnhancedColorHex(roofColor || "SURFMIST / BASALT")

  // Enhanced roof texture creation with dynamic color (back to procedural)
  const createRoofTexture = useCallback((claddingType: string, color: string) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return null

    canvas.width = 512
    canvas.height = 512

    // Parse color to RGB for better manipulation
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result
        ? {
            r: Number.parseInt(result[1], 16),
            g: Number.parseInt(result[2], 16),
            b: Number.parseInt(result[3], 16),
          }
        : { r: 128, g: 128, b: 128 }
    }

    const baseColor = hexToRgb(color)
    const darkerColor = `rgb(${Math.max(0, baseColor.r - 40)}, ${Math.max(0, baseColor.g - 40)}, ${Math.max(0, baseColor.b - 40)})`
    const lighterColor = `rgb(${Math.min(255, baseColor.r + 40)}, ${Math.min(255, baseColor.g + 40)}, ${Math.min(255, baseColor.b + 40)})`

    // Base color fill
    ctx.fillStyle = color
    ctx.fillRect(0, 0, 512, 512)

    // Add realistic texture based on cladding type
    switch (claddingType) {
      case "Corrugated":
        // Create realistic corrugated waves with proper shading
        for (let i = 0; i < 512; i += 24) {
          // Create gradient for corrugated valley and peak
          const gradient = ctx.createLinearGradient(i, 0, i + 24, 0)
          gradient.addColorStop(0, darkerColor)
          gradient.addColorStop(0.25, color)
          gradient.addColorStop(0.5, lighterColor)
          gradient.addColorStop(0.75, color)
          gradient.addColorStop(1, darkerColor)

          ctx.fillStyle = gradient
          ctx.fillRect(i, 0, 24, 512)

          // Add corrugated ridge lines
          ctx.strokeStyle = lighterColor
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(i + 12, 0)
          ctx.lineTo(i + 12, 512)
          ctx.stroke()

          // Add valley lines
          ctx.strokeStyle = darkerColor
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(i, 0)
          ctx.lineTo(i, 512)
          ctx.moveTo(i + 24, 0)
          ctx.lineTo(i + 24, 512)
          ctx.stroke()
        }
        break

      case "Trimclad":
        // Create trapezoidal Trimclad pattern with proper shading
        for (let i = 0; i < 512; i += 40) {
          // Flat top section
          const topGradient = ctx.createLinearGradient(i + 8, 0, i + 32, 0)
          topGradient.addColorStop(0, color)
          topGradient.addColorStop(0.5, lighterColor)
          topGradient.addColorStop(1, color)

          ctx.fillStyle = topGradient
          ctx.fillRect(i + 8, 0, 24, 512)

          // Angled sides (darker)
          ctx.fillStyle = darkerColor
          ctx.fillRect(i, 0, 8, 512)
          ctx.fillRect(i + 32, 0, 8, 512)

          // Ridge highlights
          ctx.strokeStyle = lighterColor
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(i + 20, 0)
          ctx.lineTo(i + 20, 512)
          ctx.stroke()

          // Edge definition
          ctx.strokeStyle = darkerColor
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(i + 8, 0)
          ctx.lineTo(i + 8, 512)
          ctx.moveTo(i + 32, 0)
          ctx.lineTo(i + 32, 512)
          ctx.stroke()
        }
        break

      default:
        break
    }

    return canvas
  }, [])

  // Create roof material that updates when color or cladding changes
  const roofTexture = useMemo(() => {
    return createRoofTexture(roofCladding || "Corrugated", roofColorHex)
  }, [roofCladding, roofColorHex, createRoofTexture])

  const roofMaterial = useMemo(() => {
    if (roofTexture) {
      const texture = new THREE.CanvasTexture(roofTexture)
      texture.wrapS = THREE.RepeatWrapping
      texture.wrapT = THREE.RepeatWrapping
      texture.repeat.set(6, 6)

      return new THREE.MeshStandardMaterial({
        map: texture,
        color: roofColorHex,
        emissive: new THREE.Color(roofColorHex).multiplyScalar(0.1),
        roughness: 0.9,
        metalness: 0.1,
      })
    } else {
      return new THREE.MeshStandardMaterial({
        color: roofColorHex,
        emissive: new THREE.Color(roofColorHex).multiplyScalar(0.1),
        roughness: 0.9,
        metalness: 0.1,
      })
    }
  }, [roofTexture, roofColorHex])

  // Steel frame dimensions (SHS/RHS standard sizes)
  const postSize = 0.089 // 89x89mm SHS posts
  const beamWidth = 0.15
  const beamHeight = 0.089

  // Calculate post spacing (max 3m between posts) - ONLY PERIMETER POSTS
  const maxSpacing = 3.0
  const postsPerLength = Math.max(2, Math.ceil(scaleLength / maxSpacing) + 1)
  const postsPerWidth = 2 // Only corner posts - no central posts across width

  const lengthSpacing = scaleLength / (postsPerLength - 1)

  // Roof calculations for post heights
  const pitchRadians = (roofPitch * Math.PI) / 180
  const roofLowSide = scaleHeight
  let roofRise = 0

  if (roofType === "Gable") {
    roofRise = (scaleWidth / 2) * Math.tan(pitchRadians)
  } else {
    roofRise = scaleWidth * Math.tan(pitchRadians)
  }

  const roofHighSide = roofLowSide + roofRise

  // Generate post positions with variable heights for skillion
  const postPositions: { position: [number, number, number]; height: number }[] = []

  for (let i = 0; i < postsPerLength; i++) {
    const x = -scaleLength / 2 + i * lengthSpacing

    if (roofType === "Skillion") {
      // Front edge posts (high side) - extend to roof height
      if (!isAttached) {
        postPositions.push({
          position: [x, 0, -scaleWidth / 2],
          height: roofHighSide,
        })
      }
      // Back edge posts (low side) - normal height
      postPositions.push({
        position: [x, 0, scaleWidth / 2],
        height: scaleHeight,
      })
    } else {
      // Gable roof - all posts same height
      if (!isAttached) {
        postPositions.push({
          position: [x, 0, -scaleWidth / 2],
          height: scaleHeight,
        })
      }
      postPositions.push({
        position: [x, 0, scaleWidth / 2],
        height: scaleHeight,
      })
    }
  }

  // Calculate overhang extensions
  const overhangExtensions = {
    front: overhangSides.includes("Front") ? scaleOverhang : 0,
    back: overhangSides.includes("Back") ? scaleOverhang : 0,
    left: overhangSides.includes("Left") ? scaleOverhang : 0,
    right: overhangSides.includes("Right") ? scaleOverhang : 0,
  }

  const totalLength = scaleLength + overhangExtensions.front + overhangExtensions.back
  const totalWidth = scaleWidth + overhangExtensions.left + overhangExtensions.right

  // Enhanced gutter dimensions
  const gutterWidth = 0.15
  const gutterDepth = 0.12
  const gutterThickness = 0.015

  // Calculate gutter outlet positions - conditional based on roof type
  const outletSpacing = 6.0
  const numOutlets = Math.max(2, Math.ceil(totalLength / outletSpacing))
  const outletPositions: [number, number, number][] = []

  if (roofType === "Gable") {
    // Gable roof - outlets on both front and back gutters
    for (let i = 0; i < numOutlets; i++) {
      const x = -totalLength / 2 + (i * totalLength) / (numOutlets - 1)
      // Back gutter outlets
      outletPositions.push([x, roofLowSide - gutterDepth, totalWidth / 2 + gutterWidth / 2 - 0.01])
      // Front gutter outlets
      if (!isAttached) {
        outletPositions.push([x, roofLowSide - gutterDepth, -totalWidth / 2 - gutterWidth / 2 + 0.01])
      }
    }
  }

  return (
    <group>
      {isAttached && (
        <HouseAttachment
          gazeboLength={scaleLength}
          gazeboWidth={scaleWidth}
          gazeboHeight={scaleHeight}
          roofHighSide={roofHighSide}
          attachmentType={resolvedAttachmentType}
        />
      )}

      <ConcreteArea
        length={length}
        width={width}
        hasOverhang={hasOverhang}
        overhangSides={overhangSides}
        overhangSize={overhangSize}
      />
      {/* Concrete pad footings */}
      {postPositions.map((post, index) => (
        <ConcretePad key={`footing-${index}`} position={post.position} size={[0.4, 0.2, 0.4]} />
      ))}

      {/* Steel posts with variable heights for skillion */}
      {postPositions.map((post, index) => (
        <mesh key={`post-${index}`} position={[post.position[0], post.height / 2, post.position[2]]} castShadow>
          <boxGeometry args={[postSize, post.height, postSize]} />
          <meshStandardMaterial
            color={frameMaterial.color}
            metalness={frameMaterial.metalness}
            roughness={frameMaterial.roughness}
            envMapIntensity={frameMaterial.envMapIntensity}
          />
        </mesh>
      ))}

      {/* Ledger connection when attached */}
      {isAttached && (
        <mesh
          position={[0, (roofType === "Skillion" ? roofHighSide : scaleHeight) - 0.06, -scaleWidth / 2 - 0.04]}
          castShadow
        >
          <boxGeometry args={[scaleLength + 0.2, 0.12, 0.08]} />
          <meshStandardMaterial
            color={frameMaterial.color}
            metalness={frameMaterial.metalness}
            roughness={frameMaterial.roughness}
            envMapIntensity={frameMaterial.envMapIntensity}
          />
        </mesh>
      )}

      {/* Horizontal beams - adjusted for skillion */}
      {roofType === "Gable" ? (
        <>
          {/* Gable roof - standard perimeter beams */}
          {(isAttached ? [scaleWidth / 2] : [-scaleWidth / 2, scaleWidth / 2]).map((z, index) => (
            <mesh key={`beam-fb-${index}`} position={[0, scaleHeight - beamHeight / 2, z]} castShadow>
              <boxGeometry args={[scaleLength, beamHeight, beamWidth]} />
              <meshStandardMaterial
                color={frameMaterial.color}
                metalness={frameMaterial.metalness}
                roughness={frameMaterial.roughness}
                envMapIntensity={frameMaterial.envMapIntensity}
              />
            </mesh>
          ))}

          {[-scaleLength / 2, scaleLength / 2].map((x, index) => (
            <mesh key={`beam-lr-${index}`} position={[x, scaleHeight - beamHeight / 2, 0]} castShadow>
              <boxGeometry args={[beamWidth, beamHeight, scaleWidth]} />
              <meshStandardMaterial
                color={frameMaterial.color}
                metalness={frameMaterial.metalness}
                roughness={frameMaterial.roughness}
                envMapIntensity={frameMaterial.envMapIntensity}
              />
            </mesh>
          ))}
        </>
      ) : (
        <>
          {/* Skillion roof - sloped beams */}
          {/* Front beam (high side) */}
          {!isAttached && (
            <mesh position={[0, roofHighSide - beamHeight / 2, -scaleWidth / 2]} castShadow>
              <boxGeometry args={[scaleLength, beamHeight, beamWidth]} />
              <meshStandardMaterial
                color={frameMaterial.color}
                metalness={frameMaterial.metalness}
                roughness={frameMaterial.roughness}
                envMapIntensity={frameMaterial.envMapIntensity}
              />
            </mesh>
          )}

          {/* Back beam (low side) */}
          <mesh position={[0, scaleHeight - beamHeight / 2, scaleWidth / 2]} castShadow>
            <boxGeometry args={[scaleLength, beamHeight, beamWidth]} />
            <meshStandardMaterial
              color={frameMaterial.color}
              metalness={frameMaterial.metalness}
              roughness={frameMaterial.roughness}
              envMapIntensity={frameMaterial.envMapIntensity}
            />
          </mesh>

          {/* Side beams - sloped to follow roof line */}
          {[-scaleLength / 2, scaleLength / 2].map((x, index) => {
            const beamCenterY = (roofHighSide + scaleHeight) / 2 - beamHeight / 2
            const beamAngle = Math.atan2(roofRise, scaleWidth)
            const beamLength = Math.sqrt(scaleWidth * scaleWidth + roofRise * roofRise)

            return (
              <mesh key={`beam-lr-${index}`} position={[x, beamCenterY, 0]} rotation={[beamAngle, 0, 0]} castShadow>
                <boxGeometry args={[beamWidth, beamHeight, beamLength]} />
                <meshStandardMaterial
                  color={frameMaterial.color}
                  metalness={frameMaterial.metalness}
                  roughness={frameMaterial.roughness}
                  envMapIntensity={frameMaterial.envMapIntensity}
                />
              </mesh>
            )
          })}
        </>
      )}

      {/* Internal beams for structural support - ONLY ALONG LENGTH */}
      {postsPerLength > 2 && (
        <>
          {Array.from({ length: postsPerLength - 2 }, (_, i) => {
            const x = -scaleLength / 2 + (i + 1) * lengthSpacing

            if (roofType === "Gable") {
              return (
                <mesh key={`internal-beam-${i}`} position={[x, scaleHeight - beamHeight / 2, 0]} castShadow>
                  <boxGeometry args={[beamWidth, beamHeight, scaleWidth]} />
                  <meshStandardMaterial
                    color={frameMaterial.color}
                    metalness={frameMaterial.metalness}
                    roughness={frameMaterial.roughness}
                    envMapIntensity={frameMaterial.envMapIntensity}
                  />
                </mesh>
              )
            } else {
              // Skillion - sloped internal beam
              const beamCenterY = (roofHighSide + scaleHeight) / 2 - beamHeight / 2
              const beamAngle = Math.atan2(roofRise, scaleWidth)
              const beamLength = Math.sqrt(scaleWidth * scaleWidth + roofRise * roofRise)

              return (
                <mesh key={`internal-beam-${i}`} position={[x, beamCenterY, 0]} rotation={[beamAngle, 0, 0]} castShadow>
                  <boxGeometry args={[beamWidth, beamHeight, beamLength]} />
                  <meshStandardMaterial
                    color={frameMaterial.color}
                    metalness={frameMaterial.metalness}
                    roughness={frameMaterial.roughness}
                    envMapIntensity={frameMaterial.envMapIntensity}
                  />
                </mesh>
              )
            }
          })}
        </>
      )}

      {/* Enhanced Roof structure with 3D profiles (back to procedural) */}
      {roofType === "Gable" ? (
        <group>
          {/* Left roof plane with 3D cladding profile */}
          <RoofCladdingProfile
            claddingType={roofCladding || "Corrugated"}
            dimensions={[totalLength, totalWidth / 2 / Math.cos(pitchRadians)]}
            position={[0, roofLowSide + roofRise / 2, -totalWidth / 4]}
            rotation={[-Math.PI / 2 + -pitchRadians, 0, 0]}
            color={roofColorHex}
            underneathColor="#e4e3dc" // Always SURFMIST underneath
          />

          {/* Right roof plane with 3D cladding profile */}
          <RoofCladdingProfile
            claddingType={roofCladding || "Corrugated"}
            dimensions={[totalLength, totalWidth / 2 / Math.cos(pitchRadians)]}
            position={[0, roofLowSide + roofRise / 2, totalWidth / 4]}
            rotation={[-Math.PI / 2 - -pitchRadians, 0, 0]}
            color={roofColorHex}
            underneathColor="#e4e3dc" // Always SURFMIST underneath
          />

          {/* Ridge cap/flashing */}
          <mesh position={[0, roofHighSide + 0.02, 0]} castShadow>
            <boxGeometry args={[totalLength, 0.04, 0.15]} />
            <meshStandardMaterial color={roofColorHex} metalness={0.1} roughness={0.9} envMapIntensity={0.3} />
          </mesh>

          {/* Enhanced Gutters - Front and Back */}
          {(
            isAttached
              ? [totalWidth / 2 + gutterWidth / 2 - 0.01]
              : [-totalWidth / 2 - gutterWidth / 2 + 0.01, totalWidth / 2 + gutterWidth / 2 - 0.01]
          ).map((z, index) => (
            <group key={`gutter-fb-${index}`}>
              <mesh position={[0, roofLowSide - gutterDepth / 3, z - gutterWidth / 2 + gutterThickness / 2]} castShadow>
                <boxGeometry args={[totalLength, gutterDepth * 0.6, gutterThickness]} />
                <meshStandardMaterial
                  color={gutterMaterial.color}
                  metalness={gutterMaterial.metalness}
                  roughness={gutterMaterial.roughness}
                  envMapIntensity={gutterMaterial.envMapIntensity}
                />
              </mesh>
              <mesh position={[0, roofLowSide - gutterDepth + gutterThickness / 2, z]} castShadow>
                <boxGeometry args={[totalLength, gutterThickness, gutterWidth - gutterThickness]} />
                <meshStandardMaterial
                  color={gutterMaterial.color}
                  metalness={gutterMaterial.metalness}
                  roughness={gutterMaterial.roughness}
                  envMapIntensity={gutterMaterial.envMapIntensity}
                />
              </mesh>
              <mesh
                position={[0, roofLowSide - gutterDepth / 2, z + gutterWidth / 2 - gutterThickness / 2]}
                rotation={[0.1, 0, 0]}
                castShadow
              >
                <boxGeometry args={[totalLength, gutterDepth * 0.4, gutterThickness]} />
                <meshStandardMaterial
                  color={gutterMaterial.color}
                  metalness={gutterMaterial.metalness}
                  roughness={gutterMaterial.roughness}
                  envMapIntensity={gutterMaterial.envMapIntensity}
                />
              </mesh>
            </group>
          ))}

          {/* Gutter outlets */}
          {outletPositions.map((position, index) => (
            <GutterOutlet key={`outlet-${index}`} position={position} color={postBeamColor || "MONUMENT"} />
          ))}
        </group>
      ) : (
        /* Skillion roof with 3D profiles */
        <group>
          {/* Main roof plane with 3D cladding profile */}
          <RoofCladdingProfile
            claddingType={roofCladding || "Corrugated"}
            dimensions={[totalLength, totalWidth / Math.cos(pitchRadians)]}
            position={[0, roofLowSide + roofRise / 2, 0]}
            rotation={[-Math.PI / 2 - -pitchRadians, 0, 0]}
            color={roofColorHex}
            underneathColor="#e4e3dc" // Always SURFMIST underneath
          />

          {/* Single gutter on low side (back) only */}
          <group>
            <mesh
              position={[
                0,
                roofLowSide - gutterDepth / 3,
                totalWidth / 2 + gutterWidth / 2 - gutterWidth / 2 + gutterThickness / 2,
              ]}
              castShadow
            >
              <boxGeometry args={[totalLength, gutterDepth * 0.6, gutterThickness]} />
              <meshStandardMaterial
                color={gutterMaterial.color}
                metalness={gutterMaterial.metalness}
                roughness={gutterMaterial.roughness}
                envMapIntensity={gutterMaterial.envMapIntensity}
              />
            </mesh>
            <mesh
              position={[0, roofLowSide - gutterDepth + gutterThickness / 2, totalWidth / 2 + gutterWidth / 2 - 0.01]}
              castShadow
            >
              <boxGeometry args={[totalLength, gutterThickness, gutterWidth - gutterThickness]} />
              <meshStandardMaterial
                color={gutterMaterial.color}
                metalness={gutterMaterial.metalness}
                roughness={gutterMaterial.roughness}
                envMapIntensity={gutterMaterial.envMapIntensity}
              />
            </mesh>
            <mesh
              position={[0, roofLowSide - gutterDepth / 2, totalWidth / 2 + gutterWidth - gutterThickness / 2]}
              rotation={[0.1, 0, 0]}
              castShadow
            >
              <boxGeometry args={[totalLength, gutterDepth * 0.4, gutterThickness]} />
              <meshStandardMaterial
                color={gutterMaterial.color}
                metalness={gutterMaterial.metalness}
                roughness={gutterMaterial.roughness}
                envMapIntensity={gutterMaterial.envMapIntensity}
              />
            </mesh>
          </group>

          {/* Gutter outlets - only on low side (back) */}
          {Array.from({ length: numOutlets }, (_, i) => {
            const x = -totalLength / 2 + (i * totalLength) / (numOutlets - 1)
            return (
              <GutterOutlet
                key={`outlet-skillion-${i}`}
                position={[x, roofLowSide - gutterDepth, totalWidth / 2 + gutterWidth / 2 - 0.01]}
                color={postBeamColor || "MONUMENT"}
              />
            )
          })}
        </group>
      )}

      {/* Overhang extensions */}
      {hasOverhang && (
        <group>
          {overhangSides.includes("Front") && (
            <mesh position={[0, roofLowSide + 0.01, -(scaleWidth / 2 + scaleOverhang / 2)]} castShadow receiveShadow>
              <boxGeometry args={[scaleLength, 0.025, scaleOverhang]} />
              <meshStandardMaterial color={roofColorHex} metalness={0.1} roughness={0.9} envMapIntensity={0.3} />
            </mesh>
          )}
          {overhangSides.includes("Back") && (
            <mesh position={[0, roofLowSide + 0.01, scaleWidth / 2 + scaleOverhang / 2]} castShadow receiveShadow>
              <boxGeometry args={[scaleLength, 0.025, scaleOverhang]} />
              <meshStandardMaterial color={roofColorHex} metalness={0.1} roughness={0.9} envMapIntensity={0.3} />
            </mesh>
          )}
          {overhangSides.includes("Left") && (
            <mesh position={[-(scaleLength / 2 + scaleOverhang / 2), roofLowSide + 0.01, 0]} castShadow receiveShadow>
              <boxGeometry args={[scaleOverhang, 0.025, scaleWidth]} />
              <meshStandardMaterial color={roofColorHex} metalness={0.1} roughness={0.9} envMapIntensity={0.3} />
            </mesh>
          )}
          {overhangSides.includes("Right") && (
            <mesh position={[scaleLength / 2 + scaleOverhang / 2, roofLowSide + 0.01, 0]} castShadow receiveShadow>
              <boxGeometry args={[scaleOverhang, 0.025, scaleWidth]} />
              <meshStandardMaterial color={roofColorHex} metalness={0.1} roughness={0.9} envMapIntensity={0.3} />
            </mesh>
          )}
        </group>
      )}

      {/* Logo decals around the gazebo */}
      <LogoDecals gazeboLength={length} gazeboWidth={width} />
    </group>
  )
}

function RoofCladdingProfile({
  claddingType,
  dimensions,
  position,
  rotation,
  color,
  underneathColor = "#e4e3dc", // Default to SURFMIST
}: {
  claddingType: string
  dimensions: [number, number]
  position: [number, number, number]
  rotation: [number, number, number]
  color: string
  underneathColor?: string
}) {
  const [length, width] = dimensions

  // Create a slightly darker shade for shadows and a lighter shade for highlights
  const darkerColor = new THREE.Color(color).multiplyScalar(0.85).getHexString()
  const lighterColor = new THREE.Color(color).multiplyScalar(1.15).getHexString()

  const profileWidth = 0.076 // 76mm pitch
  const profileHeight = 0.025 // Increased from 0.017 to 0.025 for more pronounced curves
  const profileThickness = 0.0006 // 0.6mm sheet thickness
  const profileWidthTrimclad = 0.19 // 190mm rib spacing
  const profileHeightTrimclad = 0.029 // 29mm rib height
  const panWidth = 0.127 // 127mm flat pan width
  const ribWidth = 0.063 // 63mm rib width

  // Calculate number of profiles more conservatively to avoid edge overflow
  const numProfiles =
    claddingType === "Corrugated"
      ? Math.floor((length - 0.1) / profileWidth) // Leave 0.1m margin
      : Math.floor((length - 0.2) / profileWidthTrimclad) // Leave 0.2m margin for Trimclad

  const actualLength = claddingType === "Corrugated" ? numProfiles * profileWidth : numProfiles * profileWidthTrimclad

  const startOffset = (length - actualLength) / 2

  // Enhanced corrugated geometry with smoother, more pronounced curves
  const corrugatedGeometry = useMemo(() => {
    if (claddingType !== "Corrugated") return null

    const vertices = []
    const indices = []
    const normals = []
    const uvs = []

    // Increased segments for smoother curves
    const widthSegments = Math.max(12, Math.ceil(width * 8)) // Increased from 8 to 12
    const lengthSegments = numProfiles * 8 // Increased from 4 to 8 segments per corrugation for smoother curves

    // Create vertices with enhanced sinusoidal wave pattern
    for (let i = 0; i <= lengthSegments; i++) {
      const x = -length / 2 + (i / lengthSegments) * length
      const corrugationPhase = (i / lengthSegments) * numProfiles * 2 * Math.PI

      for (let j = 0; j <= widthSegments; j++) {
        const y = -width / 2 + (j / widthSegments) * width

        // Enhanced sinusoidal curve with smoother transitions
        // Using a combination of sine and cosine for more realistic corrugation shape
        const primaryWave = Math.sin(corrugationPhase)
        const secondaryWave = Math.sin(corrugationPhase * 2) * 0.1 // Add subtle secondary wave
        const z = (primaryWave + secondaryWave) * (profileHeight / 2)

        vertices.push(x, y, z)

        // Calculate enhanced normal for better lighting
        const dzdx = Math.cos(corrugationPhase) * (profileHeight / 2) * ((2 * Math.PI * numProfiles) / length)
        const dzdy = 0
        const normal = new THREE.Vector3(-dzdx, -dzdy, 1).normalize()

        normals.push(normal.x, normal.y, normal.z)
        uvs.push(i / lengthSegments, j / widthSegments)
      }
    }

    // Create faces with proper winding
    for (let i = 0; i < lengthSegments; i++) {
      for (let j = 0; j < widthSegments; j++) {
        const a = i * (widthSegments + 1) + j
        const b = i * (widthSegments + 1) + j + 1
        const c = (i + 1) * (widthSegments + 1) + j + 1
        const d = (i + 1) * (widthSegments + 1) + j

        // Create triangles with proper normals
        indices.push(a, b, d)
        indices.push(b, c, d)
      }
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3))
    geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3))
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2))
    geometry.setIndex(indices)

    // Compute vertex normals for smooth shading
    geometry.computeVertexNormals()

    return geometry
  }, [length, width, numProfiles, claddingType, profileHeight])

  if (claddingType === "Corrugated") {
    return (
      <group position={position} rotation={rotation}>
        {/* Top surface - user selected color */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[length, width, profileThickness]} />
          <meshStandardMaterial color={color} roughness={0.9} metalness={0.1} />
        </mesh>

        {/* Bottom surface - always SURFMIST */}
        <mesh castShadow receiveShadow position={[0, 0, -profileThickness * 2]}>
          <boxGeometry args={[length, width, profileThickness]} />
          <meshStandardMaterial color={underneathColor} roughness={0.9} metalness={0.1} />
        </mesh>

        {/* Enhanced corrugated surface with smooth curves - top side only */}
        <mesh castShadow receiveShadow geometry={corrugatedGeometry}>
          <meshStandardMaterial color={color} metalness={0.1} roughness={0.8} envMapIntensity={0.3} />
        </mesh>

        {/* Corrugated surface underneath - SURFMIST color */}
        <mesh castShadow receiveShadow geometry={corrugatedGeometry} position={[0, 0, -profileThickness * 3]}>
          <meshStandardMaterial color={underneathColor} metalness={0.1} roughness={0.8} envMapIntensity={0.3} />
        </mesh>
      </group>
    )
  } else if (claddingType === "Trimclad") {
    return (
      <group position={position} rotation={rotation}>
        {/* Top surface - user selected color */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[length, width, profileThickness]} />
          <meshStandardMaterial color={color} roughness={0.9} metalness={0.1} />
        </mesh>

        {/* Bottom surface - always SURFMIST */}
        <mesh castShadow receiveShadow position={[0, 0, -profileThickness * 2]}>
          <boxGeometry args={[length, width, profileThickness]} />
          <meshStandardMaterial color={underneathColor} roughness={0.9} metalness={0.1} />
        </mesh>

        {/* Trimclad ribs on top */}
        {Array.from({ length: Math.max(1, Math.floor(length / profileWidthTrimclad)) }, (_, i) => {
          const ribX = -length / 2 + (i + 0.5) * (length / Math.max(1, Math.floor(length / profileWidthTrimclad)))

          if (Math.abs(ribX) > length / 2 - ribWidth) {
            return null
          }

          return (
            <mesh key={`trimclad-rib-top-${i}`} position={[ribX, 0, profileHeightTrimclad / 2]} castShadow>
              <boxGeometry args={[ribWidth * 0.8, width, profileHeightTrimclad]} />
              <meshStandardMaterial color={`#${lighterColor}`} roughness={0.8} metalness={0.1} />
            </mesh>
          )
        }).filter(Boolean)}

        {/* Trimclad ribs on bottom - SURFMIST color */}
        {Array.from({ length: Math.max(1, Math.floor(length / profileWidthTrimclad)) }, (_, i) => {
          const ribX = -length / 2 + (i + 0.5) * (length / Math.max(1, Math.floor(length / profileWidthTrimclad)))

          if (Math.abs(ribX) > length / 2 - ribWidth) {
            return null
          }

          return (
            <mesh
              key={`trimclad-rib-bottom-${i}`}
              position={[ribX, 0, -profileHeightTrimclad / 2 - profileThickness * 2]}
              castShadow
            >
              <boxGeometry args={[ribWidth * 0.8, width, profileHeightTrimclad]} />
              <meshStandardMaterial color={underneathColor} roughness={0.8} metalness={0.1} />
            </mesh>
          )
        }).filter(Boolean)}
      </group>
    )
  }

  // Fallback to simple flat sheet with top and bottom surfaces
  return (
    <group position={position} rotation={rotation}>
      {/* Top surface */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[length, width, 0.0006]} />
        <meshStandardMaterial color={color} roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Bottom surface - SURFMIST */}
      <mesh castShadow receiveShadow position={[0, 0, -0.0012]}>
        <boxGeometry args={[length, width, 0.0006]} />
        <meshStandardMaterial color={underneathColor} roughness={0.9} metalness={0.1} />
      </mesh>
    </group>
  )
}

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

// Component to capture screenshot
const SceneCapture = forwardRef<any, any>((props, ref) => {
  const { gl, scene, camera } = useThree()

  // Method to take screenshot
  const takeScreenshot = useCallback(() => {
    try {
      console.log("🎬 Taking screenshot - renderer info:", {
        domElement: !!gl.domElement,
        width: gl.domElement.width,
        height: gl.domElement.height,
        preserveDrawingBuffer: gl.preserveDrawingBuffer,
      })

      // Force a render to ensure the scene is up to date
      gl.render(scene, camera)

      // Wait a frame to ensure rendering is complete
      return new Promise<string | null>((resolve) => {
        requestAnimationFrame(() => {
          try {
            // Get the canvas and convert to data URL
            const canvas = gl.domElement
            console.log("📸 Canvas info:", {
              width: canvas.width,
              height: canvas.height,
              nodeName: canvas.nodeName,
            })

            // Set crossOrigin to avoid CORS issues
            const dataUrl = canvas.toDataURL("image/png", 0.9)

            if (dataUrl && dataUrl.length > 100) {
              console.log("✅ Screenshot captured successfully, size:", dataUrl.length, "characters")
              console.log("📸 Data URL preview:", dataUrl.substring(0, 50) + "...")
              resolve(dataUrl)
            } else {
              console.error("❌ Screenshot capture failed - empty or invalid data URL")
              resolve(null)
            }
          } catch (error) {
            console.error("❌ Error converting canvas to data URL:", error)
            resolve(null)
          }
        })
      })
    } catch (error) {
      console.error("❌ Error in takeScreenshot:", error)
      return Promise.resolve(null)
    }
  }, [gl, scene, camera])

  useImperativeHandle(ref, () => ({
    takeScreenshot,
  }))

  return null
})

SceneCapture.displayName = "SceneCapture"

const GazeboPreview = forwardRef<GazeboPreviewRef, GazeboPreviewProps>((props, ref) => {
  const sceneRef = useRef<any>()

  useImperativeHandle(ref, () => ({
    captureScreenshot: async (): Promise<string | null> => {
      console.log("📸 GazeboPreview.captureScreenshot called")
      if (sceneRef.current) {
        console.log("📸 SceneRef available, calling takeScreenshot...")
        const result = await sceneRef.current.takeScreenshot()
        console.log("📸 Screenshot result:", result ? "Success" : "Failed")
        return result
      } else {
        console.error("❌ SceneRef not available")
        return null
      }
    },
  }))

  return (
    <div className="w-full h-full bg-gradient-to-b from-blue-100 to-green-100 rounded-lg overflow-hidden">
      <Canvas
        camera={{
          position: [-8.5, 6.25, -8.5],
          fov: 32,
          near: 0.1,
          far: 120,
        }}
        shadows
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
          preserveDrawingBuffer: true, // Keeps screenshot/export support available.
        }}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true
          gl.shadowMap.type = THREE.PCFSoftShadowMap
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 0.9
          gl.outputColorSpace = THREE.SRGBColorSpace
        }}
      >
        <SceneCapture ref={sceneRef} />

        <Suspense fallback={null}>
          <fog attach="fog" args={["#dbeafe", 35, 90]} />
          <SimpleSkybox />
          <GrassGround />

          {/* Enhanced lighting setup */}
          <ambientLight intensity={0.72} color="#ffffff" />
          {/* Main sun light with higher-resolution soft shadows */}
          <directionalLight
            position={[-6, 11, -5]}
            intensity={0.82}
            color="#fff7ed"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-far={50}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
            shadow-bias={-0.00008}
            shadow-normalBias={0.02}
          />

          {/* Fill light for better color visibility */}
          <directionalLight position={[5, 8, 3]} intensity={0.25} color="#e0e8ff" />
          <hemisphereLight args={["#e0f2fe", "#8f7a56", 0.35]} />

          <GazeboStructure {...props} />

          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={4}
            maxDistance={40} // Increased from 20 to 40 for more zoom out
            minPolarAngle={Math.PI / 12}
            maxPolarAngle={Math.PI / 1.5}
            target={[0, 1.55, 0]}
            enableDamping={true}
            dampingFactor={0.06}
            rotateSpeed={0.65}
          />
        </Suspense>
      </Canvas>
    </div>
  )
})

GazeboPreview.displayName = "GazeboPreview"

export default GazeboPreview
