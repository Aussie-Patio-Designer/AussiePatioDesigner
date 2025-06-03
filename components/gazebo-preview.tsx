"use client"

import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls, Plane, Environment } from "@react-three/drei"
import { Suspense, useRef, useImperativeHandle, forwardRef, useCallback, useState, useEffect, useMemo } from "react"
import { TextureLoader, RepeatWrapping, BackSide } from "three"
import * as THREE from "three"

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

// Color mapping for 3D preview - EXACT colors from the official Colorbond chart
const getColorFromName = (colorName: string): string => {
  const colorMap: { [key: string]: string } = {
    // Roof colors - ORIGINAL CORRECT COLORS
    "SURFMIST / BASALT": "#4b4f52",
    "SURFMIST / CLASSIC CREAM": "#f9e9c2",
    "SURFMIST / DUNE": "#a89f91",
    "SURFMIST / MANOR RED": "#6A2E1F", // Original deep red
    "SURFMIST / PALE EUCALYPT": "#8c9c74",
    "SURFMIST / PAPERBARK": "#d3c6a6",
    "SURFMIST / SHALE GREY": "#c1c2be",
    "SURFMIST / SURFMIST": "#e4e3dc",
    "SURFMIST / WOODLAND GREY": "#4d4f45",

    // Individual external colors (for roof color parsing)
    BASALT: "#4b4f52",
    "CLASSIC CREAM": "#f9e9c2",
    DUNE: "#a89f91",
    "MANOR RED": "#8B0000", // Original deep red
    "PALE EUCALYPT": "#8c9c74",
    PAPERBARK: "#d3c6a6",
    "SHALE GREY": "#c1c2be",
    SURFMIST: "#e4e3dc",
    "WOODLAND GREY": "#4d4f45",

    // Post/beam colors - ORIGINAL CORRECT COLORS
    "CLASSIC CREAM": "#f9e9c2",
    DUNE: "#a89f91",
    GALVANISED: "#B0B4B8", // Metallic grey
    MONUMENT: "#313233", // Original medium dark grey
    PAPERBARK: "#d3c6a6",
    "DOVER WHITE": "#F8F8F4",
    "WOODLAND GREY": "#4d4f45",

    // Internal/external colors from chart
    Surfmist: "#e4e3dc",
    Basalt: "#4b4f52",
  }

  return colorMap[colorName] || "#CCCCCC"
}

// Enhance colors to make them more distinguishable
const enhanceColorVisibility = (hexColor: string): string => {
  const color = new THREE.Color(hexColor)

  // Increase saturation by 15%
  const hsl = { h: 0, s: 0, l: 0 }
  color.getHSL(hsl)
  hsl.s = Math.min(1, hsl.s * 1.15)

  // Adjust lightness to optimal range (not too dark, not too light)
  if (hsl.l < 0.3) hsl.l = 0.3 // Brighten dark colors
  if (hsl.l > 0.8) hsl.l = 0.8 // Darken light colors

  color.setHSL(hsl.h, hsl.s, hsl.l)
  return "#" + color.getHexString()
}

// Replace the entire CustomSkybox function with this:
function CustomSkybox() {
  const skyMaterial = useMemo(() => {
    // Create a simple gradient using vertex colors
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return null

    canvas.width = 512
    canvas.height = 512

    // Create vertical gradient from light blue to darker blue
    const gradient = ctx.createLinearGradient(0, 0, 0, 512)
    gradient.addColorStop(0, "#c4e0f9") // Light blue at top
    gradient.addColorStop(0.3, "#a7c5e8") // Medium blue
    gradient.addColorStop(0.6, "#87a8d0") // Darker blue
    gradient.addColorStop(1, "#7a99c0") // Darkest blue at bottom

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 512, 512)

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
        <sphereGeometry args={[100, 32, 32]} />
        <primitive object={skyMaterial} attach="material" />
      </mesh>

      {/* Subtle environment for minimal reflections */}
      <Environment background={false} preset="park" intensity={0.2} />

      {/* Minimal clouds */}
      <CloudComponent position={[-25, 18, -35]} args={[2, 1.5]} opacity={0.7} />
      <CloudComponent position={[20, 22, -45]} args={[2.5, 1.8]} opacity={0.7} />
    </>
  )
}

// Add a simple cloud component
function CloudComponent({
  position = [0, 0, 0],
  args = [3, 2],
  opacity = 0.9,
}: { position?: [number, number, number]; args?: [number, number]; opacity?: number }) {
  const [width, height] = args

  return (
    <group position={position}>
      {/* Create a fluffy cloud using multiple overlapping spheres */}
      <mesh>
        <sphereGeometry args={[width * 0.5, 1.8, 1.8]} />
        <meshStandardMaterial color="white" transparent opacity={opacity} />
      </mesh>
      <mesh position={[width * 0.3, -height * 0.1, 0]}>
        <sphereGeometry args={[width * 0.4, 1.5, 1.5]} />
        <meshStandardMaterial color="white" transparent opacity={opacity} />
      </mesh>
      <mesh position={[-width * 0.3, -height * 0.05, 0]}>
        <sphereGeometry args={[width * 0.4, 1.6, 1.6]} />
        <meshStandardMaterial color="white" transparent opacity={opacity} />
      </mesh>
      <mesh position={[0, -height * 0.2, 0]}>
        <sphereGeometry args={[width * 0.5, 1.7, 1.7]} />
        <meshStandardMaterial color="white" transparent opacity={opacity} />
      </mesh>
    </group>
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
        // Enhanced texture settings for the new grass texture
        texture.wrapS = RepeatWrapping
        texture.wrapT = RepeatWrapping
        texture.repeat.set(12, 12) // Adjusted repeat for optimal tiling
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
      return new THREE.MeshLambertMaterial({
        map: grassTexture,
        color: "#ffffff", // Pure white to show texture colors accurately
        roughness: 0.8,
        metalness: 0.0,
      })
    } else {
      // Fallback to simple grass color if texture fails to load
      return new THREE.MeshLambertMaterial({
        color: "#4ade80",
        roughness: 0.8,
        metalness: 0.0,
      })
    }
  }, [grassTexture])

  return (
    <Plane args={[50, 50]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
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
        // Enhanced concrete texture settings
        texture.wrapS = RepeatWrapping
        texture.wrapT = RepeatWrapping
        texture.repeat.set(totalLength * 3, totalWidth * 3) // More detailed tiling
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

// Create a gutter outlet dripper
function GutterOutlet({
  position,
  color,
}: {
  position: [number, number, number]
  color: string
}) {
  return (
    <group position={position}>
      {/* Outlet spout */}
      <mesh position={[0, 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.02, 0.04, 8]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Water drip effect */}
      <mesh position={[0, -0.05, 0]} castShadow>
        <sphereGeometry args={[0.008, 8, 6]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.8} />
      </mesh>
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
  } = props
  // Convert mm to meters for 3D scene
  const scaleLength = length / 1000
  const scaleWidth = width / 1000
  const scaleHeight = height / 1000
  const scaleOverhang = overhangSize / 1000

  // Parse the roof color to get the external color (second part after the slash)
  const roofParts = (roofColor || "SURFMIST / BASALT").split(" / ")
  const externalRoofColor = roofParts.length > 1 ? roofParts[1] : roofParts[0]

  const frameColor = enhanceColorVisibility(getColorFromName(postBeamColor || "MONUMENT"))
  const roofColorHex = enhanceColorVisibility(
    getColorFromName(externalRoofColor) || getColorFromName(roofColor || "SURFMIST / BASALT"),
  )

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

      return new THREE.MeshLambertMaterial({
        map: texture,
        color: roofColorHex,
        emissive: new THREE.Color(roofColorHex).multiplyScalar(0.1), // Slight self-illumination
      })
    } else {
      return new THREE.MeshLambertMaterial({
        color: roofColorHex,
        emissive: new THREE.Color(roofColorHex).multiplyScalar(0.1), // Slight self-illumination
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
      postPositions.push({
        position: [x, 0, -scaleWidth / 2],
        height: roofHighSide,
      })
      // Back edge posts (low side) - normal height
      postPositions.push({
        position: [x, 0, scaleWidth / 2],
        height: scaleHeight,
      })
    } else {
      // Gable roof - all posts same height
      postPositions.push({
        position: [x, 0, -scaleWidth / 2],
        height: scaleHeight,
      })
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
      outletPositions.push([x, roofLowSide - gutterDepth, -totalWidth / 2 - gutterWidth / 2 + 0.01])
    }
  }

  return (
    <group>
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
            color={frameColor}
            metalness={0.2} // Dramatically reduced from 0.8
            roughness={0.8} // Increased from 0.2
            envMapIntensity={0.4} // Dramatically reduced from 1.5
          />
        </mesh>
      ))}

      {/* Horizontal beams - adjusted for skillion */}
      {roofType === "Gable" ? (
        <>
          {/* Gable roof - standard perimeter beams */}
          {[-scaleWidth / 2, scaleWidth / 2].map((z, index) => (
            <mesh key={`beam-fb-${index}`} position={[0, scaleHeight - beamHeight / 2, z]} castShadow>
              <boxGeometry args={[scaleLength, beamHeight, beamWidth]} />
              <meshStandardMaterial
                color={frameColor}
                metalness={0.2} // Dramatically reduced from 0.8
                roughness={0.8} // Increased from 0.2
                envMapIntensity={0.4} // Dramatically reduced from 1.5
              />
            </mesh>
          ))}

          {[-scaleLength / 2, scaleLength / 2].map((x, index) => (
            <mesh key={`beam-lr-${index}`} position={[x, scaleHeight - beamHeight / 2, 0]} castShadow>
              <boxGeometry args={[beamWidth, beamHeight, scaleWidth]} />
              <meshStandardMaterial
                color={frameColor}
                metalness={0.2} // Dramatically reduced from 0.8
                roughness={0.8} // Increased from 0.2
                envMapIntensity={0.4} // Dramatically reduced from 1.5
              />
            </mesh>
          ))}
        </>
      ) : (
        <>
          {/* Skillion roof - sloped beams */}
          {/* Front beam (high side) */}
          <mesh position={[0, roofHighSide - beamHeight / 2, -scaleWidth / 2]} castShadow>
            <boxGeometry args={[scaleLength, beamHeight, beamWidth]} />
            <meshStandardMaterial
              color={frameColor}
              metalness={0.2} // Dramatically reduced from 0.8
              roughness={0.8} // Increased from 0.2
              envMapIntensity={0.4} // Dramatically reduced from 1.5
            />
          </mesh>

          {/* Back beam (low side) */}
          <mesh position={[0, scaleHeight - beamHeight / 2, scaleWidth / 2]} castShadow>
            <boxGeometry args={[scaleLength, beamHeight, beamWidth]} />
            <meshStandardMaterial
              color={frameColor}
              metalness={0.2} // Dramatically reduced from 0.8
              roughness={0.8} // Increased from 0.2
              envMapIntensity={0.4} // Dramatically reduced from 1.5
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
                  color={frameColor}
                  metalness={0.2} // Dramatically reduced from 0.8
                  roughness={0.8} // Increased from 0.2
                  envMapIntensity={0.4} // Dramatically reduced from 1.5
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
                    color={frameColor}
                    metalness={0.2} // Dramatically reduced from 0.8
                    roughness={0.8} // Increased from 0.2
                    envMapIntensity={0.4} // Dramatically reduced from 1.5
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
                    color={frameColor}
                    metalness={0.2} // Dramatically reduced from 0.8
                    roughness={0.8} // Increased from 0.2
                    envMapIntensity={0.4} // Dramatically reduced from 1.5
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
          />

          {/* Right roof plane with 3D cladding profile */}
          <RoofCladdingProfile
            claddingType={roofCladding || "Corrugated"}
            dimensions={[totalLength, totalWidth / 2 / Math.cos(pitchRadians)]}
            position={[0, roofLowSide + roofRise / 2, totalWidth / 4]}
            rotation={[-Math.PI / 2 - -pitchRadians, 0, 0]}
            color={roofColorHex}
          />

          {/* Ridge cap/flashing */}
          <mesh position={[0, roofHighSide + 0.02, 0]} castShadow>
            <boxGeometry args={[totalLength, 0.04, 0.15]} />
            <meshStandardMaterial
              color={roofColorHex}
              metalness={0.1} // Dramatically reduced from 0.8-0.9
              roughness={0.9} // Increased from 0.1-0.2
              envMapIntensity={0.3} // Dramatically reduced from 1.5-2.0
            />
          </mesh>

          {/* Enhanced Gutters - Front and Back */}
          {[-totalWidth / 2 - gutterWidth / 2 + 0.01, totalWidth / 2 + gutterWidth / 2 - 0.01].map((z, index) => (
            <group key={`gutter-fb-${index}`}>
              <mesh position={[0, roofLowSide - gutterDepth / 3, z - gutterWidth / 2 + gutterThickness / 2]} castShadow>
                <boxGeometry args={[totalLength, gutterDepth * 0.6, gutterThickness]} />
                <meshStandardMaterial
                  color={frameColor}
                  metalness={0.1} // Dramatically reduced from 0.8-0.9
                  roughness={0.9} // Increased from 0.1-0.2
                  envMapIntensity={0.3} // Dramatically reduced from 1.5-2.0
                />
              </mesh>
              <mesh position={[0, roofLowSide - gutterDepth + gutterThickness / 2, z]} castShadow>
                <boxGeometry args={[totalLength, gutterThickness, gutterWidth - gutterThickness]} />
                <meshStandardMaterial
                  color={frameColor}
                  metalness={0.1} // Dramatically reduced from 0.8-0.9
                  roughness={0.9} // Increased from 0.1-0.2
                  envMapIntensity={0.3} // Dramatically reduced from 1.5-2.0
                />
              </mesh>
              <mesh
                position={[0, roofLowSide - gutterDepth / 2, z + gutterWidth / 2 - gutterThickness / 2]}
                rotation={[0.1, 0, 0]}
                castShadow
              >
                <boxGeometry args={[totalLength, gutterDepth * 0.4, gutterThickness]} />
                <meshStandardMaterial
                  color={frameColor}
                  metalness={0.1} // Dramatically reduced from 0.8-0.9
                  roughness={0.9} // Increased from 0.1-0.2
                  envMapIntensity={0.3} // Dramatically reduced from 1.5-2.0
                />
              </mesh>
            </group>
          ))}

          {/* Gutter outlets */}
          {outletPositions.map((position, index) => (
            <GutterOutlet key={`outlet-${index}`} position={position} color={frameColor} />
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
                color={frameColor}
                metalness={0.1} // Dramatically reduced from 0.8-0.9
                roughness={0.9} // Increased from 0.1-0.2
                envMapIntensity={0.3} // Dramatically reduced from 1.5-2.0
              />
            </mesh>
            <mesh
              position={[0, roofLowSide - gutterDepth + gutterThickness / 2, totalWidth / 2 + gutterWidth / 2 - 0.01]}
              castShadow
            >
              <boxGeometry args={[totalLength, gutterThickness, gutterWidth - gutterThickness]} />
              <meshStandardMaterial
                color={frameColor}
                metalness={0.1} // Dramatically reduced from 0.8-0.9
                roughness={0.9} // Increased from 0.1-0.2
                envMapIntensity={0.3} // Dramatically reduced from 1.5-2.0
              />
            </mesh>
            <mesh
              position={[0, roofLowSide - gutterDepth / 2, totalWidth / 2 + gutterWidth - gutterThickness / 2]}
              rotation={[0.1, 0, 0]}
              castShadow
            >
              <boxGeometry args={[totalLength, gutterDepth * 0.4, gutterThickness]} />
              <meshStandardMaterial
                color={frameColor}
                metalness={0.1} // Dramatically reduced from 0.8-0.9
                roughness={0.9} // Increased from 0.1-0.2
                envMapIntensity={0.3} // Dramatically reduced from 1.5-2.0
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
                color={frameColor}
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
              <meshStandardMaterial
                color={roofColorHex}
                metalness={0.1} // Dramatically reduced from 0.8-0.9
                roughness={0.9} // Increased from 0.1-0.2
                envMapIntensity={0.3} // Dramatically reduced from 1.5-2.0
              />
            </mesh>
          )}
          {overhangSides.includes("Back") && (
            <mesh position={[0, roofLowSide + 0.01, scaleWidth / 2 + scaleOverhang / 2]} castShadow receiveShadow>
              <boxGeometry args={[scaleLength, 0.025, scaleOverhang]} />
              <meshStandardMaterial
                color={roofColorHex}
                metalness={0.1} // Dramatically reduced from 0.8-0.9
                roughness={0.9} // Increased from 0.1-0.2
                envMapIntensity={0.3} // Dramatically reduced from 1.5-2.0
              />
            </mesh>
          )}
          {overhangSides.includes("Left") && (
            <mesh position={[-(scaleLength / 2 + scaleOverhang / 2), roofLowSide + 0.01, 0]} castShadow receiveShadow>
              <boxGeometry args={[scaleOverhang, 0.025, scaleWidth]} />
              <meshStandardMaterial
                color={roofColorHex}
                metalness={0.1} // Dramatically reduced from 0.8-0.9
                roughness={0.9} // Increased from 0.1-0.2
                envMapIntensity={0.3} // Dramatically reduced from 1.5-2.0
              />
            </mesh>
          )}
          {overhangSides.includes("Right") && (
            <mesh position={[scaleLength / 2 + scaleOverhang / 2, roofLowSide + 0.01, 0]} castShadow receiveShadow>
              <boxGeometry args={[scaleOverhang, 0.025, scaleWidth]} />
              <meshStandardMaterial
                color={roofColorHex}
                metalness={0.1} // Dramatically reduced from 0.8-0.9
                roughness={0.9} // Increased from 0.1-0.2
                envMapIntensity={0.3} // Dramatically reduced from 1.5-2.0
              />
            </mesh>
          )}
        </group>
      )}
    </group>
  )
}

function RoofCladdingProfile({
  claddingType,
  dimensions,
  position,
  rotation,
  color,
}: {
  claddingType: string
  dimensions: [number, number]
  position: [number, number, number]
  rotation: [number, number, number]
  color: string
}) {
  const [length, width] = dimensions

  // Create a slightly darker shade for shadows and a lighter shade for highlights
  const darkerColor = new THREE.Color(color).multiplyScalar(0.85).getHexString()
  const lighterColor = new THREE.Color(color).multiplyScalar(1.15).getHexString()

  const profileWidth = 0.076 // 76mm pitch
  const profileHeight = 0.017 // 17mm rib height
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

  // Create corrugated geometry using useMemo for performance
  const corrugatedGeometry = useMemo(() => {
    if (claddingType !== "Corrugated") return null

    const vertices = []
    const indices = []
    const normals = []
    const uvs = []

    const widthSegments = Math.max(8, Math.ceil(width * 5))
    const lengthSegments = numProfiles * 4 // 4 segments per corrugation

    // Create vertices
    for (let i = 0; i <= lengthSegments; i++) {
      const x = -length / 2 + (i / lengthSegments) * length
      const corrugationPhase = (i / lengthSegments) * numProfiles * 2 * Math.PI

      for (let j = 0; j <= widthSegments; j++) {
        const y = -width / 2 + (j / widthSegments) * width
        const z = Math.sin(corrugationPhase) * (profileHeight / 2)

        vertices.push(x, y, z)

        // Calculate normal
        const nx = Math.cos(corrugationPhase) * (profileHeight / 2) * ((2 * Math.PI * numProfiles) / length)
        const ny = 0
        const nz = 1
        const normalLength = Math.sqrt(nx * nx + ny * ny + nz * nz)
        normals.push(nx / normalLength, ny / normalLength, nz / normalLength)

        uvs.push(i / lengthSegments, j / widthSegments)
      }
    }

    // Create faces
    for (let i = 0; i < lengthSegments; i++) {
      for (let j = 0; j < widthSegments; j++) {
        const a = i * (widthSegments + 1) + j
        const b = i * (widthSegments + 1) + j + 1
        const c = (i + 1) * (widthSegments + 1) + j + 1
        const d = (i + 1) * (widthSegments + 1) + j

        indices.push(a, b, d)
        indices.push(b, c, d)
      }
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3))
    geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3))
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2))
    geometry.setIndex(indices)
    geometry.computeVertexNormals()

    return geometry
  }, [length, width, numProfiles, claddingType])

  if (claddingType === "Corrugated") {
    return (
      <group position={position} rotation={rotation}>
        {/* Base sheet */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[length, width, profileThickness]} />
          <meshLambertMaterial color={color} />
        </mesh>

        {/* Corrugated surface */}
        <mesh castShadow receiveShadow geometry={corrugatedGeometry}>
          <meshLambertMaterial color={color} side={THREE.DoubleSide} />
        </mesh>
      </group>
    )
  } else if (claddingType === "Trimclad") {
    return (
      <group position={position} rotation={rotation}>
        {/* Base sheet */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[length, width, profileThickness]} />
          <meshLambertMaterial color={color} />
        </mesh>

        {/* Simplified Trimclad ribs - no crossing materials */}
        {Array.from({ length: Math.max(1, Math.floor(length / profileWidthTrimclad)) }, (_, i) => {
          const ribX = -length / 2 + (i + 0.5) * (length / Math.max(1, Math.floor(length / profileWidthTrimclad)))

          // Only render if rib is well within boundaries
          if (Math.abs(ribX) > length / 2 - ribWidth) {
            return null
          }

          return (
            <mesh key={`trimclad-rib-${i}`} position={[ribX, 0, profileHeightTrimclad / 2]} castShadow>
              <boxGeometry args={[ribWidth * 0.8, width, profileHeightTrimclad]} />
              <meshLambertMaterial color={`#${lighterColor}`} />
            </mesh>
          )
        }).filter(Boolean)}
      </group>
    )
  }

  // Fallback to simple flat sheet
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={[length, width, 0.0006]} />
      <meshLambertMaterial color={color} />
    </mesh>
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
      console.log("Taking screenshot...")
      // Render the scene
      gl.render(scene, camera)

      // Get the canvas data URL
      const dataUrl = gl.domElement.toDataURL("image/png")
      console.log("Screenshot captured successfully, data URL length:", dataUrl.length)

      return dataUrl
    } catch (error) {
      console.error("Error taking screenshot:", error)
      return null
    }
  }, [gl, scene, camera])

  // Expose the takeScreenshot method to parent components
  useImperativeHandle(ref, () => ({
    takeScreenshot,
  }))

  return null
})

// Update the main Canvas component with better lighting and rendering
const GazeboPreview = forwardRef<any, GazeboPreviewProps>((props, ref) => {
  const sceneRef = useRef(null)

  // Expose the takeScreenshot method to parent components
  useImperativeHandle(ref, () => ({
    takeScreenshot: () => {
      if (sceneRef.current) {
        return sceneRef.current.takeScreenshot()
      }
      console.warn("Scene ref not available for screenshot")
      return null
    },
  }))

  return (
    <div className="h-full w-full">
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          camera={{
            position: [8, 6, 8],
            fov: 50,
          }}
          shadows
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
            stencil: false,
            depth: true,
          }}
          onCreated={({ gl }) => {
            gl.shadowMap.enabled = true
            gl.shadowMap.type = THREE.PCFSoftShadowMap
            gl.toneMapping = THREE.ACESFilmicToneMapping
            gl.toneMappingExposure = 1.2
            gl.outputColorSpace = THREE.SRGBColorSpace
          }}
        >
          <SceneCapture ref={sceneRef} />
          <CustomSkybox />

          {/* Reduced intensity ambient light for better base colors */}
          <ambientLight intensity={0.6} color="#ffffff" />

          {/* Main sun light - dramatically reduced intensity and repositioned */}
          <directionalLight
            position={[5, 10, 5]} // Changed from [15, 20, 10]
            intensity={0.9} // Dramatically reduced from 1.8
            color="#f8f8f8" // Slightly warmer light
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={50}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
            shadow-bias={-0.0001}
          />

          {/* Fill light for better color visibility */}
          <directionalLight position={[-5, 8, -3]} intensity={0.4} color="#e0e8ff" />

          {/* Increased ground reflection for better visibility underneath */}
          <hemisphereLight skyColor="#a7c5ff" groundColor="#d2c4a5" intensity={0.7} />

          <GazeboStructure {...props} />
          <GrassGround />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={4}
            maxDistance={20}
            minPolarAngle={Math.PI / 6} // Prevent viewing from directly below
            maxPolarAngle={Math.PI / 2.5} // Prevent viewing from directly above
            target={[0, 2, 0]}
            enableDamping={true}
            dampingFactor={0.05}
            rotateSpeed={0.7} // Slower rotation for better control
          />
        </Canvas>
      </Suspense>
    </div>
  )
})

export default GazeboPreview
