"use client"

import type React from "react"
import { useRef, useEffect } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader"

import { getColorHex, getMaterialProperties } from "@/lib/colorbond-colors"

interface SimpleGazeboPreviewProps {
  roofColor?: string
  postBeamColor?: string
  width?: number
  height?: number
}

const SimpleGazeboPreview: React.FC<SimpleGazeboPreviewProps> = ({
  roofColor,
  postBeamColor,
  width = 600,
  height = 400,
}) => {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mountRef.current) return

    // === THREE.JS CODE START ===

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xeeeeee)

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000)
    camera.position.set(-6, 4, -6)
    // camera.position.z = 5
    // camera.position.y = 2

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    mountRef.current.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0.6) // soft white light
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9)
    directionalLight.position.set(-10, 10, -5)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 1024
    directionalLight.shadow.mapSize.height = 1024
    directionalLight.shadow.camera.far = 50
    directionalLight.shadow.camera.left = -10
    directionalLight.shadow.camera.right = 10
    directionalLight.shadow.camera.top = 10
    directionalLight.shadow.camera.bottom = -10
    scene.add(directionalLight)

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enablePan = true
    controls.enableZoom = true
    controls.enableRotate = true
    controls.minDistance = 3
    controls.maxDistance = 15
    controls.minPolarAngle = 0
    controls.maxPolarAngle = Math.PI / 2.2
    controls.target.set(0, 1.5, 0)

    // Load GLTF model
    const loader = new GLTFLoader()

    // Optional: Provide a DRACOLoader instance to decode compressed mesh data
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath("/draco/")
    loader.setDRACOLoader(dracoLoader)

    loader.load(
      "/models/simple_gazebo.glb",
      (gltf) => {
        const model = gltf.scene

        // Customize materials
        model.traverse((child: any) => {
          if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true
            if (child.name.includes("Roof")) {
              child.material = new THREE.MeshStandardMaterial({
                color: getColorHex(roofColor || "SURFMIST / BASALT"),
                roughness: 0.8,
                metalness: 0.2,
              })
            } else if (child.name.includes("Post") || child.name.includes("Beam")) {
              const materialProperties = getMaterialProperties(postBeamColor || "MONUMENT")
              child.material = new THREE.MeshStandardMaterial({
                color: materialProperties.color,
                roughness: materialProperties.roughness,
                metalness: materialProperties.metalness,
              })
            } else if (child.name.includes("Base")) {
              child.material = new THREE.MeshStandardMaterial({
                color: 0xcccccc,
                roughness: 0.9,
                metalness: 0.1,
              })
            } else {
              child.material = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                roughness: 0.8,
                metalness: 0.2,
              })
            }
          }
        })

        scene.add(model)
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded")
      },
      (error) => {
        console.error("An error happened", error)
      },
    )

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)

      controls.update() // only required if controls.enableDamping = true, or if controls.autoRotate = true

      renderer.render(scene, camera)
    }

    animate()

    // === THREE.JS CODE END ===

    // Cleanup function
    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [roofColor, postBeamColor, width, height])

  return <div ref={mountRef} style={{ width: "100%", height: "100%", minHeight: "400px" }} />
}

export default SimpleGazeboPreview
