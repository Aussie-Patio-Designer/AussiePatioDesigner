"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

interface ArchitecturalDrawingsProps {
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

export default function ArchitecturalDrawings({
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
}: ArchitecturalDrawingsProps) {
  const [activeView, setActiveView] = useState("plan")

  // Convert mm to meters for display
  const lengthM = length / 1000
  const widthM = width / 1000
  const heightM = height / 1000
  const overhangM = overhangSize / 1000

  // Calculate roof dimensions
  const pitchRad = (roofPitch * Math.PI) / 180
  const roofRise = roofType === "Gable" ? (widthM / 2) * Math.tan(pitchRad) : widthM * Math.tan(pitchRad)
  const peakHeight = heightM + roofRise

  // Calculate overhang extensions
  const frontOverhang = overhangSides.includes("Front") ? overhangM : 0
  const backOverhang = overhangSides.includes("Back") ? overhangM : 0
  const leftOverhang = overhangSides.includes("Left") ? overhangM : 0
  const rightOverhang = overhangSides.includes("Right") ? overhangM : 0

  const totalLength = lengthM + frontOverhang + backOverhang
  const totalWidth = widthM + leftOverhang + rightOverhang

  // Professional drawing scale and dimensions
  const scale = 120 // pixels per meter for better detail
  const margin = 100
  const dimOffset = 60
  const titleBlockHeight = 120

  // Professional line weights (SVG stroke-width)
  const lineWeights = {
    heavy: 3, // Cut lines, outline
    medium: 2, // Visible edges
    light: 1, // Hidden lines, hatching
    veryLight: 0.5, // Grid, construction lines
  }

  // Professional Plan View Component
  const PlanView = () => {
    const viewWidth = totalLength * scale + margin * 2 + dimOffset * 2
    const viewHeight = totalWidth * scale + margin * 2 + dimOffset * 2 + titleBlockHeight

    return (
      <div className="bg-white border-2 border-gray-800 rounded-lg overflow-hidden">
        {/* Title Block */}
        <div className="bg-gray-50 border-b-2 border-gray-800 p-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <h3 className="text-lg font-bold">PLAN VIEW - ROOF LAYOUT</h3>
              <p className="text-sm">Scale: 1:{Math.round(1000 / scale)}</p>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold">GAZEBO STRUCTURE</h2>
              <p className="text-sm">DRAWING NO: GA-001</p>
            </div>
            <div className="text-right text-xs">
              <p>Date: {new Date().toLocaleDateString()}</p>
              <p>Drawn: v0 CAD</p>
              <p>Checked: Auto</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center p-4">
          <svg width={viewWidth} height={viewHeight - titleBlockHeight} className="border border-gray-300">
            {/* Professional grid background */}
            <defs>
              <pattern id="majorGrid" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#e0e0e0" strokeWidth={lineWeights.veryLight} />
              </pattern>
              <pattern id="minorGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f5f5f5" strokeWidth={lineWeights.veryLight} />
              </pattern>

              {/* Professional hatching patterns */}
              <pattern id="steelHatch" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="8" stroke="#666" strokeWidth="0.5" />
              </pattern>

              <pattern id="concreteHatch" patternUnits="userSpaceOnUse" width="12" height="12">
                <circle cx="6" cy="6" r="1" fill="#999" />
                <circle cx="2" cy="2" r="0.5" fill="#999" />
                <circle cx="10" cy="10" r="0.5" fill="#999" />
              </pattern>
            </defs>

            <rect width="100%" height="100%" fill="url(#minorGrid)" />
            <rect width="100%" height="100%" fill="url(#majorGrid)" />

            {/* Main roof outline - Heavy line weight */}
            <rect
              x={margin + dimOffset}
              y={margin + dimOffset}
              width={totalLength * scale}
              height={totalWidth * scale}
              fill="none"
              stroke="#000"
              strokeWidth={lineWeights.heavy}
            />

            {/* Gazebo structure outline - Medium line weight */}
            <rect
              x={margin + dimOffset + frontOverhang * scale}
              y={margin + dimOffset + leftOverhang * scale}
              width={lengthM * scale}
              height={widthM * scale}
              fill="none"
              stroke="#000"
              strokeWidth={lineWeights.medium}
              strokeDasharray="10,5"
            />

            {/* Steel posts with professional symbols */}
            {Array.from({ length: Math.ceil(lengthM / 3) + 1 }, (_, i) => {
              const x = margin + dimOffset + frontOverhang * scale + (i * lengthM * scale) / Math.ceil(lengthM / 3)
              return [
                // Front posts
                <g key={`post-front-${i}`}>
                  <rect
                    x={x - 4}
                    y={margin + dimOffset + leftOverhang * scale - 4}
                    width="8"
                    height="8"
                    fill="url(#steelHatch)"
                    stroke="#000"
                    strokeWidth={lineWeights.medium}
                  />
                  <text
                    x={x}
                    y={margin + dimOffset + leftOverhang * scale - 10}
                    textAnchor="middle"
                    className="text-xs font-mono"
                  >
                    P{i + 1}
                  </text>
                </g>,
                // Back posts
                <g key={`post-back-${i}`}>
                  <rect
                    x={x - 4}
                    y={margin + dimOffset + leftOverhang * scale + widthM * scale - 4}
                    width="8"
                    height="8"
                    fill="url(#steelHatch)"
                    stroke="#000"
                    strokeWidth={lineWeights.medium}
                  />
                  <text
                    x={x}
                    y={margin + dimOffset + leftOverhang * scale + widthM * scale + 20}
                    textAnchor="middle"
                    className="text-xs font-mono"
                  >
                    P{i + 1 + Math.ceil(lengthM / 3) + 1}
                  </text>
                </g>,
              ]
            })}

            {/* Ridge line for Gable with proper line type */}
            {roofType === "Gable" && (
              <g>
                <line
                  x1={margin + dimOffset}
                  y1={margin + dimOffset + (totalWidth * scale) / 2}
                  x2={margin + dimOffset + totalLength * scale}
                  y2={margin + dimOffset + (totalWidth * scale) / 2}
                  stroke="#ff0000"
                  strokeWidth={lineWeights.medium}
                  strokeDasharray="15,5,5,5"
                />
                <text
                  x={margin + dimOffset + (totalLength * scale) / 2}
                  y={margin + dimOffset + (totalWidth * scale) / 2 - 10}
                  textAnchor="middle"
                  className="text-xs font-bold fill-red-600"
                >
                  RIDGE LINE
                </text>
              </g>
            )}

            {/* Professional roof cladding direction indicators */}
            {Array.from({ length: Math.floor(totalLength / 0.6) }, (_, i) => (
              <line
                key={`cladding-${i}`}
                x1={margin + dimOffset + i * 0.6 * scale}
                y1={margin + dimOffset + 10}
                x2={margin + dimOffset + i * 0.6 * scale}
                y2={margin + dimOffset + totalWidth * scale - 10}
                stroke="#ccc"
                strokeWidth={lineWeights.veryLight}
              />
            ))}

            {/* Professional dimension lines with extension lines */}
            <g className="dimensions">
              {/* Total length dimension */}
              <g>
                {/* Extension lines */}
                <line
                  x1={margin + dimOffset}
                  y1={margin + dimOffset - 15}
                  x2={margin + dimOffset}
                  y2={margin + dimOffset - 45}
                  stroke="#000"
                  strokeWidth={lineWeights.light}
                />
                <line
                  x1={margin + dimOffset + totalLength * scale}
                  y1={margin + dimOffset - 15}
                  x2={margin + dimOffset + totalLength * scale}
                  y2={margin + dimOffset - 45}
                  stroke="#000"
                  strokeWidth={lineWeights.light}
                />

                {/* Dimension line */}
                <line
                  x1={margin + dimOffset}
                  y1={margin + dimOffset - 30}
                  x2={margin + dimOffset + totalLength * scale}
                  y2={margin + dimOffset - 30}
                  stroke="#000"
                  strokeWidth={lineWeights.light}
                />

                {/* Arrow heads */}
                <polygon
                  points={`${margin + dimOffset},${margin + dimOffset - 30} ${margin + dimOffset + 8},${margin + dimOffset - 26} ${margin + dimOffset + 8},${margin + dimOffset - 34}`}
                  fill="#000"
                />
                <polygon
                  points={`${margin + dimOffset + totalLength * scale},${margin + dimOffset - 30} ${margin + dimOffset + totalLength * scale - 8},${margin + dimOffset - 26} ${margin + dimOffset + totalLength * scale - 8},${margin + dimOffset - 34}`}
                  fill="#000"
                />

                {/* Dimension text */}
                <text
                  x={margin + dimOffset + (totalLength * scale) / 2}
                  y={margin + dimOffset - 35}
                  textAnchor="middle"
                  className="text-sm font-bold"
                >
                  {totalLength.toFixed(3)}m
                </text>
              </g>

              {/* Gazebo length dimension */}
              <g>
                <line
                  x1={margin + dimOffset + frontOverhang * scale}
                  y1={margin + dimOffset - 55}
                  x2={margin + dimOffset + frontOverhang * scale + lengthM * scale}
                  y2={margin + dimOffset - 55}
                  stroke="#000"
                  strokeWidth={lineWeights.light}
                />
                <text
                  x={margin + dimOffset + frontOverhang * scale + (lengthM * scale) / 2}
                  y={margin + dimOffset - 60}
                  textAnchor="middle"
                  className="text-sm"
                >
                  {lengthM.toFixed(3)}m
                </text>
              </g>

              {/* Width dimensions */}
              <g>
                {/* Extension lines */}
                <line
                  x1={margin + dimOffset - 15}
                  y1={margin + dimOffset}
                  x2={margin + dimOffset - 45}
                  y2={margin + dimOffset}
                  stroke="#000"
                  strokeWidth={lineWeights.light}
                />
                <line
                  x1={margin + dimOffset - 15}
                  y1={margin + dimOffset + totalWidth * scale}
                  x2={margin + dimOffset - 45}
                  y2={margin + dimOffset + totalWidth * scale}
                  stroke="#000"
                  strokeWidth={lineWeights.light}
                />

                {/* Dimension line */}
                <line
                  x1={margin + dimOffset - 30}
                  y1={margin + dimOffset}
                  x2={margin + dimOffset - 30}
                  y2={margin + dimOffset + totalWidth * scale}
                  stroke="#000"
                  strokeWidth={lineWeights.light}
                />

                {/* Arrow heads */}
                <polygon
                  points={`${margin + dimOffset - 30},${margin + dimOffset} ${margin + dimOffset - 26},${margin + dimOffset + 8} ${margin + dimOffset - 34},${margin + dimOffset + 8}`}
                  fill="#000"
                />
                <polygon
                  points={`${margin + dimOffset - 30},${margin + dimOffset + totalWidth * scale} ${margin + dimOffset - 26},${margin + dimOffset + totalWidth * scale - 8} ${margin + dimOffset - 34},${margin + dimOffset + totalWidth * scale - 8}`}
                  fill="#000"
                />

                {/* Dimension text */}
                <text
                  x={margin + dimOffset - 35}
                  y={margin + dimOffset + (totalWidth * scale) / 2}
                  textAnchor="middle"
                  className="text-sm font-bold"
                  transform={`rotate(-90 ${margin + dimOffset - 35} ${margin + dimOffset + (totalWidth * scale) / 2})`}
                >
                  {totalWidth.toFixed(3)}m
                </text>
              </g>
            </g>

            {/* Professional labels and annotations */}
            <g className="annotations">
              <text x={margin + dimOffset + 15} y={margin + dimOffset + 25} className="text-sm font-bold">
                ROOF STRUCTURE
              </text>
              <text x={margin + dimOffset + 15} y={margin + dimOffset + 40} className="text-xs">
                {roofCladding} CLADDING
              </text>

              <text
                x={margin + dimOffset + frontOverhang * scale + 15}
                y={margin + dimOffset + leftOverhang * scale + 25}
                className="text-sm"
              >
                GAZEBO STRUCTURE
              </text>
              <text
                x={margin + dimOffset + frontOverhang * scale + 15}
                y={margin + dimOffset + leftOverhang * scale + 40}
                className="text-xs"
              >
                89x89 SHS POSTS
              </text>
            </g>

            {/* Professional north arrow */}
            <g transform={`translate(${viewWidth - 80}, 80)`}>
              <circle cx="0" cy="0" r="35" fill="none" stroke="#000" strokeWidth={lineWeights.medium} />
              <polygon points="0,-25 -8,15 0,10 8,15" fill="#000" />
              <text x="0" y="45" textAnchor="middle" className="text-lg font-bold">
                N
              </text>
              <text x="0" y="-45" textAnchor="middle" className="text-xs">
                MAGNETIC
              </text>
            </g>

            {/* Drawing notes */}
            <g transform={`translate(${margin}, ${viewHeight - titleBlockHeight - 100})`}>
              <text x="0" y="0" className="text-sm font-bold">
                NOTES:
              </text>
              <text x="0" y="20" className="text-xs">
                1. ALL DIMENSIONS IN METRES UNLESS NOTED
              </text>
              <text x="0" y="35" className="text-xs">
                2. VERIFY ALL DIMENSIONS ON SITE
              </text>
              <text x="0" y="50" className="text-xs">
                3. POSTS: 89x89mm SHS, BEAMS: 150x89mm RHS
              </text>
            </g>
          </svg>
        </div>
      </div>
    )
  }

  // Professional Front Elevation Component
  const FrontElevation = () => {
    const viewWidth = totalLength * scale + margin * 2 + dimOffset * 2
    const viewHeight = peakHeight * scale + margin * 2 + dimOffset * 2 + titleBlockHeight

    return (
      <div className="bg-white border-2 border-gray-800 rounded-lg overflow-hidden">
        {/* Title Block */}
        <div className="bg-gray-50 border-b-2 border-gray-800 p-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <h3 className="text-lg font-bold">FRONT ELEVATION</h3>
              <p className="text-sm">Scale: 1:{Math.round(1000 / scale)}</p>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold">GAZEBO STRUCTURE</h2>
              <p className="text-sm">DRAWING NO: GA-002</p>
            </div>
            <div className="text-right text-xs">
              <p>Date: {new Date().toLocaleDateString()}</p>
              <p>Drawn: v0 CAD</p>
              <p>Checked: Auto</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center p-4">
          <svg width={viewWidth} height={viewHeight - titleBlockHeight} className="border border-gray-300">
            <defs>
              <pattern id="groundHatch" patternUnits="userSpaceOnUse" width="16" height="8">
                <line x1="0" y1="0" x2="16" y2="0" stroke="#8B4513" strokeWidth="2" />
                <line x1="0" y1="4" x2="16" y2="4" stroke="#A0522D" strokeWidth="1" />
              </pattern>
            </defs>

            {/* Professional grid */}
            <rect width="100%" height="100%" fill="url(#minorGrid)" />
            <rect width="100%" height="100%" fill="url(#majorGrid)" />

            {/* Ground line with hatching */}
            <rect
              x={margin}
              y={viewHeight - titleBlockHeight - margin - dimOffset}
              width={viewWidth - margin * 2}
              height="20"
              fill="url(#groundHatch)"
              stroke="#000"
              strokeWidth={lineWeights.heavy}
            />

            {/* Steel posts with professional representation */}
            {Array.from({ length: Math.ceil(lengthM / 3) + 1 }, (_, i) => {
              const x = margin + dimOffset + frontOverhang * scale + (i * lengthM * scale) / Math.ceil(lengthM / 3)
              return (
                <g key={`post-elev-${i}`}>
                  <rect
                    x={x - 6}
                    y={viewHeight - titleBlockHeight - margin - dimOffset - heightM * scale}
                    width="12"
                    height={heightM * scale}
                    fill="url(#steelHatch)"
                    stroke="#000"
                    strokeWidth={lineWeights.medium}
                  />
                  {/* Post designation */}
                  <text
                    x={x}
                    y={viewHeight - titleBlockHeight - margin - dimOffset + 25}
                    textAnchor="middle"
                    className="text-xs font-mono"
                  >
                    89x89 SHS
                  </text>
                </g>
              )
            })}

            {/* Professional roof outline */}
            {roofType === "Gable" ? (
              <g>
                <polygon
                  points={`
                    ${margin + dimOffset},${viewHeight - titleBlockHeight - margin - dimOffset - heightM * scale}
                    ${margin + dimOffset + (totalLength * scale) / 2},${viewHeight - titleBlockHeight - margin - dimOffset - peakHeight * scale}
                    ${margin + dimOffset + totalLength * scale},${viewHeight - titleBlockHeight - margin - dimOffset - heightM * scale}
                  `}
                  fill="none"
                  stroke="#000"
                  strokeWidth={lineWeights.heavy}
                />

                {/* Roof cladding hatching */}
                {Array.from({ length: Math.floor(totalLength / 0.6) }, (_, i) => (
                  <line
                    key={`roof-hatch-${i}`}
                    x1={margin + dimOffset + i * 0.6 * scale}
                    y1={viewHeight - titleBlockHeight - margin - dimOffset - heightM * scale}
                    x2={margin + dimOffset + i * 0.6 * scale + (roofRise * scale * 0.6) / (totalLength / 2)}
                    y2={
                      viewHeight -
                      titleBlockHeight -
                      margin -
                      dimOffset -
                      peakHeight * scale +
                      (roofRise * scale * 0.6) / (totalLength / 2)
                    }
                    stroke="#666"
                    strokeWidth={lineWeights.veryLight}
                  />
                ))}
              </g>
            ) : (
              <g>
                <polygon
                  points={`
                    ${margin + dimOffset},${viewHeight - titleBlockHeight - margin - dimOffset - peakHeight * scale}
                    ${margin + dimOffset + totalLength * scale},${viewHeight - titleBlockHeight - margin - dimOffset - heightM * scale}
                    ${margin + dimOffset + totalLength * scale},${viewHeight - titleBlockHeight - margin - dimOffset - heightM * scale}
                    ${margin + dimOffset},${viewHeight - titleBlockHeight - margin - dimOffset - peakHeight * scale}
                  `}
                  fill="none"
                  stroke="#000"
                  strokeWidth={lineWeights.heavy}
                />
              </g>
            )}

            {/* Professional dimensions */}
            <g className="dimensions">
              {/* Total length dimension */}
              <g>
                <line
                  x1={margin + dimOffset}
                  y1={viewHeight - titleBlockHeight - margin - dimOffset + 40}
                  x2={margin + dimOffset + totalLength * scale}
                  y2={viewHeight - titleBlockHeight - margin - dimOffset + 40}
                  stroke="#000"
                  strokeWidth={lineWeights.light}
                />
                <text
                  x={margin + dimOffset + (totalLength * scale) / 2}
                  y={viewHeight - titleBlockHeight - margin - dimOffset + 55}
                  textAnchor="middle"
                  className="text-sm font-bold"
                >
                  {totalLength.toFixed(3)}m
                </text>
              </g>

              {/* Height dimensions */}
              <g>
                {/* Eave height */}
                <line
                  x1={margin + dimOffset - 40}
                  y1={viewHeight - titleBlockHeight - margin - dimOffset}
                  x2={margin + dimOffset - 40}
                  y2={viewHeight - titleBlockHeight - margin - dimOffset - heightM * scale}
                  stroke="#000"
                  strokeWidth={lineWeights.light}
                />
                <text
                  x={margin + dimOffset - 50}
                  y={viewHeight - titleBlockHeight - margin - dimOffset - (heightM * scale) / 2}
                  textAnchor="middle"
                  className="text-sm font-bold"
                  transform={`rotate(-90 ${margin + dimOffset - 50} ${viewHeight - titleBlockHeight - margin - dimOffset - (heightM * scale) / 2})`}
                >
                  {heightM.toFixed(3)}m EAVE
                </text>

                {/* Peak height */}
                <line
                  x1={margin + dimOffset - 70}
                  y1={viewHeight - titleBlockHeight - margin - dimOffset}
                  x2={margin + dimOffset - 70}
                  y2={viewHeight - titleBlockHeight - margin - dimOffset - peakHeight * scale}
                  stroke="#ff0000"
                  strokeWidth={lineWeights.light}
                />
                <text
                  x={margin + dimOffset - 80}
                  y={viewHeight - titleBlockHeight - margin - dimOffset - (peakHeight * scale) / 2}
                  textAnchor="middle"
                  className="text-sm font-bold text-red-600"
                  transform={`rotate(-90 ${margin + dimOffset - 80} ${viewHeight - titleBlockHeight - margin - dimOffset - (peakHeight * scale) / 2})`}
                >
                  {peakHeight.toFixed(3)}m PEAK
                </text>
              </g>
            </g>

            {/* Professional annotations */}
            <g className="annotations">
              <text
                x={margin + dimOffset + 10}
                y={viewHeight - titleBlockHeight - margin - dimOffset - 10}
                className="text-sm"
              >
                FINISHED GROUND LEVEL
              </text>
              <text
                x={margin + dimOffset + (totalLength * scale) / 2}
                y={viewHeight - titleBlockHeight - margin - dimOffset - peakHeight * scale - 20}
                textAnchor="middle"
                className="text-sm font-bold"
              >
                {roofPitch}° ROOF PITCH - {roofCladding} CLADDING
              </text>
            </g>

            {/* Material legend */}
            <g transform={`translate(${viewWidth - 200}, ${margin + 20})`}>
              <text x="0" y="0" className="text-sm font-bold">
                MATERIALS:
              </text>
              <rect x="0" y="10" width="20" height="15" fill="url(#steelHatch)" stroke="#000" strokeWidth="1" />
              <text x="25" y="22" className="text-xs">
                STEEL FRAME
              </text>
              <line x1="0" y1="35" x2="20" y2="35" stroke="#666" strokeWidth="1" />
              <text x="25" y="39" className="text-xs">
                ROOF CLADDING
              </text>
            </g>
          </svg>
        </div>
      </div>
    )
  }

  // Professional Side Elevation Component
  const SideElevation = () => {
    const viewWidth = totalWidth * scale + margin * 2 + dimOffset * 2
    const viewHeight = peakHeight * scale + margin * 2 + dimOffset * 2 + titleBlockHeight

    return (
      <div className="bg-white border-2 border-gray-800 rounded-lg overflow-hidden">
        {/* Title Block */}
        <div className="bg-gray-50 border-b-2 border-gray-800 p-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <h3 className="text-lg font-bold">SIDE ELEVATION</h3>
              <p className="text-sm">Scale: 1:{Math.round(1000 / scale)}</p>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold">GAZEBO STRUCTURE</h2>
              <p className="text-sm">DRAWING NO: GA-003</p>
            </div>
            <div className="text-right text-xs">
              <p>Date: {new Date().toLocaleDateString()}</p>
              <p>Drawn: v0 CAD</p>
              <p>Checked: Auto</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center p-4">
          <svg width={viewWidth} height={viewHeight - titleBlockHeight} className="border border-gray-300">
            {/* Professional grid */}
            <rect width="100%" height="100%" fill="url(#minorGrid)" />
            <rect width="100%" height="100%" fill="url(#majorGrid)" />

            {/* Ground line */}
            <rect
              x={margin}
              y={viewHeight - titleBlockHeight - margin - dimOffset}
              width={viewWidth - margin * 2}
              height="20"
              fill="url(#groundHatch)"
              stroke="#000"
              strokeWidth={lineWeights.heavy}
            />

            {/* Posts */}
            <rect
              x={margin + dimOffset + leftOverhang * scale - 6}
              y={viewHeight - titleBlockHeight - margin - dimOffset - heightM * scale}
              width="12"
              height={heightM * scale}
              fill="url(#steelHatch)"
              stroke="#000"
              strokeWidth={lineWeights.medium}
            />
            <rect
              x={margin + dimOffset + leftOverhang * scale + widthM * scale - 6}
              y={viewHeight - titleBlockHeight - margin - dimOffset - heightM * scale}
              width="12"
              height={heightM * scale}
              fill="url(#steelHatch)"
              stroke="#000"
              strokeWidth={lineWeights.medium}
            />

            {/* Roof outline based on type */}
            {roofType === "Gable" ? (
              <polygon
                points={`
                  ${margin + dimOffset},${viewHeight - titleBlockHeight - margin - dimOffset - heightM * scale}
                  ${margin + dimOffset + (totalWidth * scale) / 2},${viewHeight - titleBlockHeight - margin - dimOffset - peakHeight * scale}
                  ${margin + dimOffset + totalWidth * scale},${viewHeight - titleBlockHeight - margin - dimOffset - heightM * scale}
                `}
                fill="none"
                stroke="#000"
                strokeWidth={lineWeights.heavy}
              />
            ) : (
              <polygon
                points={`
                  ${margin + dimOffset},${viewHeight - titleBlockHeight - margin - dimOffset - peakHeight * scale}
                  ${margin + dimOffset + totalWidth * scale},${viewHeight - titleBlockHeight - margin - dimOffset - heightM * scale}
                `}
                fill="none"
                stroke="#000"
                strokeWidth={lineWeights.heavy}
              />
            )}

            {/* Professional dimensions */}
            <g className="dimensions">
              {/* Total width */}
              <line
                x1={margin + dimOffset}
                y1={viewHeight - titleBlockHeight - margin - dimOffset + 40}
                x2={margin + dimOffset + totalWidth * scale}
                y2={viewHeight - titleBlockHeight - margin - dimOffset + 40}
                stroke="#000"
                strokeWidth={lineWeights.light}
              />
              <text
                x={margin + dimOffset + (totalWidth * scale) / 2}
                y={viewHeight - titleBlockHeight - margin - dimOffset + 55}
                textAnchor="middle"
                className="text-sm font-bold"
              >
                {totalWidth.toFixed(3)}m
              </text>

              {/* Height dimension */}
              <line
                x1={margin + dimOffset - 40}
                y1={viewHeight - titleBlockHeight - margin - dimOffset}
                x2={margin + dimOffset - 40}
                y2={viewHeight - titleBlockHeight - margin - dimOffset - heightM * scale}
                stroke="#000"
                strokeWidth={lineWeights.light}
              />
              <text
                x={margin + dimOffset - 50}
                y={viewHeight - titleBlockHeight - margin - dimOffset - (heightM * scale) / 2}
                textAnchor="middle"
                className="text-sm font-bold"
                transform={`rotate(-90 ${margin + dimOffset - 50} ${viewHeight - titleBlockHeight - margin - dimOffset - (heightM * scale) / 2})`}
              >
                {heightM.toFixed(3)}m
              </text>
            </g>
          </svg>
        </div>
      </div>
    )
  }

  // Professional Specifications Table
  const SpecificationsTable = () => (
    <div className="bg-white border-2 border-gray-800 rounded-lg overflow-hidden">
      {/* Title Block */}
      <div className="bg-gray-50 border-b-2 border-gray-800 p-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <h3 className="text-lg font-bold">SPECIFICATIONS</h3>
            <p className="text-sm">Technical Data Sheet</p>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold">GAZEBO STRUCTURE</h2>
            <p className="text-sm">DRAWING NO: GA-004</p>
          </div>
          <div className="text-right text-xs">
            <p>Date: {new Date().toLocaleDateString()}</p>
            <p>Drawn: v0 CAD</p>
            <p>Checked: Auto</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h4 className="font-bold mb-4 text-lg border-b-2 border-gray-300 pb-2">STRUCTURAL SPECIFICATIONS</h4>
            <table className="w-full text-sm border border-gray-300">
              <tbody>
                <tr className="border-b border-gray-300">
                  <td className="py-2 px-3 bg-gray-100 font-medium border-r border-gray-300">Roof Type:</td>
                  <td className="py-2 px-3 font-bold">{roofType}</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="py-2 px-3 bg-gray-100 font-medium border-r border-gray-300">Roof Pitch:</td>
                  <td className="py-2 px-3 font-bold">{roofPitch}°</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="py-2 px-3 bg-gray-100 font-medium border-r border-gray-300">Eave Height:</td>
                  <td className="py-2 px-3 font-bold">{heightM.toFixed(3)}m</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="py-2 px-3 bg-gray-100 font-medium border-r border-gray-300">Peak Height:</td>
                  <td className="py-2 px-3 font-bold">{peakHeight.toFixed(3)}m</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="py-2 px-3 bg-gray-100 font-medium border-r border-gray-300">Floor Area:</td>
                  <td className="py-2 px-3 font-bold">{(lengthM * widthM).toFixed(1)}m²</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 bg-gray-100 font-medium border-r border-gray-300">Total Roof Area:</td>
                  <td className="py-2 px-3 font-bold">{(totalLength * totalWidth).toFixed(1)}m²</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-lg border-b-2 border-gray-300 pb-2">MATERIALS & FINISHES</h4>
            <table className="w-full text-sm border border-gray-300">
              <tbody>
                <tr className="border-b border-gray-300">
                  <td className="py-2 px-3 bg-gray-100 font-medium border-r border-gray-300">Roof Cladding:</td>
                  <td className="py-2 px-3 font-bold">{roofCladding}</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="py-2 px-3 bg-gray-100 font-medium border-r border-gray-300">Roof Color:</td>
                  <td className="py-2 px-3 font-bold">{roofColor}</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="py-2 px-3 bg-gray-100 font-medium border-r border-gray-300">Frame Color:</td>
                  <td className="py-2 px-3 font-bold">{postBeamColor}</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="py-2 px-3 bg-gray-100 font-medium border-r border-gray-300">Posts:</td>
                  <td className="py-2 px-3 font-bold">89x89mm SHS</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="py-2 px-3 bg-gray-100 font-medium border-r border-gray-300">Beams:</td>
                  <td className="py-2 px-3 font-bold">150x89mm RHS</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 bg-gray-100 font-medium border-r border-gray-300">Finish:</td>
                  <td className="py-2 px-3 font-bold">Hot Dip Galvanised</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {hasOverhang && (
          <div className="mt-8">
            <h4 className="font-bold mb-4 text-lg border-b-2 border-gray-300 pb-2">OVERHANG DETAILS</h4>
            <table className="w-full text-sm border border-gray-300">
              <tbody>
                <tr className="border-b border-gray-300">
                  <td className="py-2 px-3 bg-gray-100 font-medium border-r border-gray-300">Overhang Size:</td>
                  <td className="py-2 px-3 font-bold">{overhangM.toFixed(3)}m</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 bg-gray-100 font-medium border-r border-gray-300">Overhang Sides:</td>
                  <td className="py-2 px-3 font-bold">{overhangSides.join(", ")}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8 p-4 bg-gray-50 border border-gray-300 rounded">
          <h4 className="font-bold mb-2">DESIGN NOTES:</h4>
          <ul className="text-sm space-y-1">
            <li>• All structural steel to comply with AS/NZS 3600</li>
            <li>• Roof cladding to comply with AS 1562.1</li>
            <li>• All dimensions to be verified on site</li>
            <li>• Design loads: Wind Region B, Terrain Category 3</li>
            <li>• Maximum post spacing: 3.0m centres</li>
          </ul>
        </div>
      </div>
    </div>
  )

  return (
    <div className="h-full w-full bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold mb-2">ARCHITECTURAL DRAWINGS</h2>
          <p className="text-gray-600">Professional Technical Documentation</p>
        </div>

        <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="plan" className="font-semibold">
              Plan View
            </TabsTrigger>
            <TabsTrigger value="front" className="font-semibold">
              Front Elevation
            </TabsTrigger>
            <TabsTrigger value="side" className="font-semibold">
              Side Elevation
            </TabsTrigger>
            <TabsTrigger value="specs" className="font-semibold">
              Specifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plan" className="mt-6">
            <PlanView />
          </TabsContent>

          <TabsContent value="front" className="mt-6">
            <FrontElevation />
          </TabsContent>

          <TabsContent value="side" className="mt-6">
            <SideElevation />
          </TabsContent>

          <TabsContent value="specs" className="mt-6">
            <SpecificationsTable />
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center space-x-4">
          <Button
            onClick={() => window.print()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2"
          >
            🖨️ Print Drawings
          </Button>
          <Button variant="outline" className="font-semibold px-6 py-2">
            📧 Email Drawings
          </Button>
          <Button variant="outline" className="font-semibold px-6 py-2">
            💾 Download PDF
          </Button>
        </div>
      </div>
    </div>
  )
}
