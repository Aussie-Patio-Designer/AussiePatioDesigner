"use client"

import { useMemo, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { Environment, OrbitControls, Plane } from "@react-three/drei"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Fence, ProceduralHouse, SwimmingPool, Tree } from "@/components/3d-objects/house-model"

function SimpleGazebo({ length, width, height }: { length: number; width: number; height: number }) {
  const roofHeight = 0.35
  const postThickness = 0.14
  const halfLength = length / 2
  const halfWidth = width / 2

  const posts: [number, number, number][] = [
    [-halfLength, height / 2, -halfWidth],
    [halfLength, height / 2, -halfWidth],
    [-halfLength, height / 2, halfWidth],
    [halfLength, height / 2, halfWidth],
  ]

  return (
    <group>
      <mesh position={[0, -0.03, 0]} receiveShadow>
        <boxGeometry args={[length + 0.6, 0.06, width + 0.6]} />
        <meshStandardMaterial color="#bdbdbd" />
      </mesh>

      {posts.map((position, index) => (
        <mesh key={`post-${index}`} position={position} castShadow>
          <boxGeometry args={[postThickness, height, postThickness]} />
          <meshStandardMaterial color="#2f3542" metalness={0.2} roughness={0.7} />
        </mesh>
      ))}

      <mesh position={[0, height + roofHeight / 2, 0]} castShadow>
        <boxGeometry args={[length + 0.4, roofHeight, width + 0.4]} />
        <meshStandardMaterial color="#f1f2f6" roughness={0.8} />
      </mesh>
    </group>
  )
}

function Surroundings({
  showHouse,
  showPool,
  showFence,
  showTrees,
}: {
  showHouse: boolean
  showPool: boolean
  showFence: boolean
  showTrees: boolean
}) {
  return (
    <>
      {showHouse && <ProceduralHouse position={[-7, 0, -7]} scale={1.7} rotation={[0, Math.PI / 5, 0]} />}

      {showPool && <SwimmingPool position={[7, 0, -3]} size={[6.5, 3.5, 1.3]} />}

      {showFence && (
        <>
          <Fence startPosition={[-11, 0, -9]} endPosition={[-11, 0, 9]} posts={9} height={1.5} />
          <Fence startPosition={[11, 0, -9]} endPosition={[11, 0, 9]} posts={9} height={1.5} />
          <Fence startPosition={[-11, 0, -9]} endPosition={[11, 0, -9]} posts={11} height={1.5} />
          <Fence startPosition={[-11, 0, 9]} endPosition={[11, 0, 9]} posts={11} height={1.5} />
        </>
      )}

      {showTrees && (
        <>
          <Tree position={[-8, 0, 7]} scale={1.2} />
          <Tree position={[-5, 0, 8]} scale={0.9} />
          <Tree position={[8, 0, 7]} scale={1.1} />
          <Tree position={[5, 0, 8]} scale={0.85} />
        </>
      )}
    </>
  )
}

export default function WithHouseDesigner() {
  const [lengthMm, setLengthMm] = useState(6000)
  const [widthMm, setWidthMm] = useState(4000)
  const [heightMm, setHeightMm] = useState(2800)

  const [showHouse, setShowHouse] = useState(true)
  const [showPool, setShowPool] = useState(true)
  const [showFence, setShowFence] = useState(true)
  const [showTrees, setShowTrees] = useState(true)

  const dimensions = useMemo(
    () => ({
      length: lengthMm / 1000,
      width: widthMm / 1000,
      height: heightMm / 1000,
    }),
    [lengthMm, widthMm, heightMm],
  )

  return (
    <div className="grid min-h-screen w-full gap-4 px-4 py-6 lg:grid-cols-[360px_1fr] lg:px-8">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>3D With-House Designer</CardTitle>
          <p className="text-sm text-muted-foreground">
            This is a separate sandbox page so your original designer stays untouched.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Gazebo Length: {lengthMm}mm</Label>
            <Slider value={[lengthMm]} min={3000} max={12000} step={100} onValueChange={([value]) => setLengthMm(value)} />
          </div>

          <div className="space-y-3">
            <Label>Gazebo Width: {widthMm}mm</Label>
            <Slider value={[widthMm]} min={2500} max={8000} step={100} onValueChange={([value]) => setWidthMm(value)} />
          </div>

          <div className="space-y-3">
            <Label>Gazebo Height: {heightMm}mm</Label>
            <Slider value={[heightMm]} min={2400} max={3600} step={50} onValueChange={([value]) => setHeightMm(value)} />
          </div>

          <div className="space-y-3 rounded-lg border p-4">
            <h3 className="text-sm font-semibold">Attachments / Surroundings</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-house">House</Label>
              <Switch id="show-house" checked={showHouse} onCheckedChange={setShowHouse} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-pool">Pool</Label>
              <Switch id="show-pool" checked={showPool} onCheckedChange={setShowPool} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-fence">Fence</Label>
              <Switch id="show-fence" checked={showFence} onCheckedChange={setShowFence} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-trees">Trees</Label>
              <Switch id="show-trees" checked={showTrees} onCheckedChange={setShowTrees} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="min-h-[70vh] overflow-hidden">
        <CardContent className="h-full p-0">
          <div className="h-[70vh] w-full lg:h-full">
            <Canvas camera={{ position: [11, 8, 11], fov: 45 }} shadows>
              <ambientLight intensity={0.5} />
              <directionalLight position={[12, 14, 6]} intensity={1.2} castShadow />
              <Environment preset="sunset" />

              <Plane args={[60, 60]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <meshStandardMaterial color="#7ecf74" />
              </Plane>

              <SimpleGazebo {...dimensions} />
              <Surroundings showHouse={showHouse} showPool={showPool} showFence={showFence} showTrees={showTrees} />

              <OrbitControls enablePan enableZoom enableRotate target={[0, 1.8, 0]} minDistance={5} maxDistance={35} />
            </Canvas>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
