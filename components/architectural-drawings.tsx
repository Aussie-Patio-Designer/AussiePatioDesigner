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
  customerName?: string
  customerPhone?: string
  projectAddress?: string
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
  customerName = "Customer Name",
  customerPhone = "",
  projectAddress = "",
}: ArchitecturalDrawingsProps) {
  const [activeView, setActiveView] = useState("layout")

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
  const scale = 30 // Scale 1:30 as per reference
  const margin = 40
  const titleBlockHeight = 100

  // Professional line weights (SVG stroke-width)
  const lineWeights = {
    heavy: 2, // Cut lines, outline
    medium: 1.5, // Visible edges
    light: 1, // Hidden lines, hatching
    veryLight: 0.5, // Grid, construction lines
  }

  // Common title block component
  const TitleBlock = ({ pageTitle, sheetNumber, totalSheets = 2 }) => (
    <div className="bg-gray-50 border-b-2 border-gray-800 p-4">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <h3 className="text-lg font-bold">{pageTitle}</h3>
          <p className="text-sm">Scale: 1:{scale}</p>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold">AUSSIE PATIO DESIGNER</h2>
          <p className="text-sm">DRAWING NO: AP-{String(sheetNumber).padStart(3, "0")}</p>
        </div>
        <div className="text-right text-xs">
          <p>Date: {new Date().toLocaleDateString()}</p>
          <p>Customer: {customerName}</p>
          <p>
            Sheet {sheetNumber} ⁄ {totalSheets}
          </p>
        </div>
      </div>
    </div>
  )

  // Layout View (All views in one page)
  const LayoutView = () => {
    // Calculate dimensions for the layout view
    const viewWidth = 800
    const viewHeight = 600
    const drawingSize = 300 // Size for each individual drawing

    return (
      <div className="bg-white border-2 border-gray-800 rounded-lg overflow-hidden">
        <TitleBlock pageTitle="QUOTE LAYOUT" sheetNumber={1} />

        <div className="p-4">
          <div className="grid grid-cols-2 gap-6">
            {/* Top Row - Plan View */}
            <div className="col-span-2 border border-gray-300 p-2">
              <h3 className="text-center font-bold mb-2">PLAN VIEW</h3>
              <svg width="100%" height="300" viewBox="0 0 800 300" className="border border-gray-200">
                {/* Main structure outline */}
                <rect
                  x={(800 - totalLength * scale) / 2}
                  y={(300 - totalWidth * scale) / 2}
                  width={totalLength * scale}
                  height={totalWidth * scale}
                  fill="none"
                  stroke="#000"
                  strokeWidth={lineWeights.heavy}
                />

                {/* Posts */}
                {Array.from({ length: Math.ceil(lengthM / 3) + 1 }, (_, i) => {
                  const x =
                    (800 - totalLength * scale) / 2 +
                    frontOverhang * scale +
                    (i * lengthM * scale) / Math.ceil(lengthM / 3)
                  return [
                    // Front posts
                    <rect
                      key={`post-front-${i}`}
                      x={x - 3}
                      y={(300 - totalWidth * scale) / 2 - 3}
                      width="6"
                      height="6"
                      fill="#000"
                      stroke="#000"
                    />,
                    // Back posts
                    <rect
                      key={`post-back-${i}`}
                      x={x - 3}
                      y={(300 - totalWidth * scale) / 2 + totalWidth * scale - 3}
                      width="6"
                      height="6"
                      fill="#000"
                      stroke="#000"
                    />,
                  ]
                })}

                {/* Ridge line for Gable */}
                {roofType === "Gable" && (
                  <line
                    x1={(800 - totalLength * scale) / 2}
                    y1={(300 - totalWidth * scale) / 2 + (totalWidth * scale) / 2}
                    x2={(800 - totalLength * scale) / 2 + totalLength * scale}
                    y2={(300 - totalWidth * scale) / 2 + (totalWidth * scale) / 2}
                    stroke="#ff0000"
                    strokeWidth={lineWeights.medium}
                    strokeDasharray="5,5"
                  />
                )}

                {/* Dimensions */}
                <text x={400} y={(300 - totalWidth * scale) / 2 - 15} textAnchor="middle" className="text-sm font-bold">
                  {Math.round(length)}
                </text>

                <text
                  x={(800 - totalLength * scale) / 2 - 15}
                  y={150}
                  textAnchor="middle"
                  className="text-sm font-bold"
                  transform={`rotate(-90 ${(800 - totalLength * scale) / 2 - 15} 150)`}
                >
                  {Math.round(width)}
                </text>
              </svg>
            </div>

            {/* Bottom Row - Elevations */}
            <div className="border border-gray-300 p-2">
              <h3 className="text-center font-bold mb-2">FRONT</h3>
              <svg width="100%" height="200" viewBox="0 0 400 200" className="border border-gray-200">
                {/* Ground line */}
                <line x1="50" y1="150" x2="350" y2="150" stroke="#000" strokeWidth={lineWeights.medium} />

                {/* Posts */}
                <rect x="80" y="80" width="6" height="70" fill="#000" />
                <rect x="320" y="80" width="6" height="70" fill="#000" />

                {/* Roof */}
                {roofType === "Gable" ? (
                  <polygon points="75,80 200,50 325,80" fill="none" stroke="#000" strokeWidth={lineWeights.heavy} />
                ) : (
                  <polygon
                    points="75,50 325,80 325,80 75,50"
                    fill="none"
                    stroke="#000"
                    strokeWidth={lineWeights.heavy}
                  />
                )}

                {/* Dimensions */}
                <text x="200" y="170" textAnchor="middle" className="text-sm font-bold">
                  {Math.round(width)}
                </text>

                <text x="40" y="100" textAnchor="middle" className="text-sm font-bold">
                  {Math.round(height)}
                </text>

                <text x="200" y="30" textAnchor="middle" className="text-sm font-bold">
                  {roofPitch}°
                </text>
              </svg>
            </div>

            <div className="border border-gray-300 p-2">
              <h3 className="text-center font-bold mb-2">SIDE</h3>
              <svg width="100%" height="200" viewBox="0 0 400 200" className="border border-gray-200">
                {/* Ground line */}
                <line x1="50" y1="150" x2="350" y2="150" stroke="#000" strokeWidth={lineWeights.medium} />

                {/* Posts */}
                <rect x="80" y="80" width="6" height="70" fill="#000" />
                <rect x="320" y="80" width="6" height="70" fill="#000" />

                {/* Roof */}
                {roofType === "Gable" ? (
                  <polygon points="75,80 200,50 325,80" fill="none" stroke="#000" strokeWidth={lineWeights.heavy} />
                ) : (
                  <polygon
                    points="75,50 325,80 325,80 75,50"
                    fill="none"
                    stroke="#000"
                    strokeWidth={lineWeights.heavy}
                  />
                )}

                {/* Dimensions */}
                <text x="200" y="170" textAnchor="middle" className="text-sm font-bold">
                  {Math.round(length)}
                </text>

                <text x="350" y="115" textAnchor="middle" className="text-sm font-bold">
                  {Math.round(height)}
                </text>
              </svg>
            </div>
          </div>

          {/* Project Information */}
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-300 pt-4">
            <div>
              <h4 className="font-bold mb-2">PROJECT DETAILS</h4>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="py-1 font-medium">Dimensions:</td>
                    <td>
                      {lengthM.toFixed(1)}m × {widthM.toFixed(1)}m × {heightM.toFixed(1)}m
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 font-medium">Roof Type:</td>
                    <td>
                      {roofType} ({roofPitch}°)
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 font-medium">Cladding:</td>
                    <td>{roofCladding || "Standard"}</td>
                  </tr>
                  {projectAddress && (
                    <tr>
                      <td className="py-1 font-medium">Site:</td>
                      <td>{projectAddress}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div>
              <h4 className="font-bold mb-2">SPECIFICATIONS</h4>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="py-1 font-medium">Region:</td>
                    <td>B1</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-medium">Terrain Cat:</td>
                    <td>3</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-medium">ULT Wind Speed:</td>
                    <td>42.58</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-medium">Serviceability:</td>
                    <td>29.13</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Elevations View (All elevations with cladding)
  const ElevationsView = () => {
    return (
      <div className="bg-white border-2 border-gray-800 rounded-lg overflow-hidden">
        <TitleBlock pageTitle="ELEVATION W/CLADDING" sheetNumber={2} />

        <div className="p-4">
          <div className="grid grid-cols-2 gap-6">
            {/* Left Elevation */}
            <div className="border border-gray-300 p-2">
              <h3 className="text-center font-bold mb-2">Left</h3>
              <svg width="100%" height="200" viewBox="0 0 400 200" className="border border-gray-200">
                {/* Ground line */}
                <line x1="50" y1="150" x2="350" y2="150" stroke="#000" strokeWidth={lineWeights.medium} />

                {/* Posts */}
                <rect x="80" y="80" width="6" height="70" fill="#000" />
                <rect x="320" y="80" width="6" height="70" fill="#000" />

                {/* Roof with cladding pattern */}
                <defs>
                  <pattern id="roofPattern" patternUnits="userSpaceOnUse" width="10" height="10">
                    <line x1="0" y1="0" x2="10" y2="0" stroke="#888" strokeWidth="0.5" />
                  </pattern>
                </defs>

                {roofType === "Gable" ? (
                  <polygon
                    points="75,80 200,50 325,80"
                    fill="url(#roofPattern)"
                    stroke="#000"
                    strokeWidth={lineWeights.heavy}
                  />
                ) : (
                  <polygon
                    points="75,50 325,80 325,80 75,50"
                    fill="url(#roofPattern)"
                    stroke="#000"
                    strokeWidth={lineWeights.heavy}
                  />
                )}

                {/* Dimensions */}
                <text x="200" y="30" textAnchor="middle" className="text-sm font-bold">
                  {Math.round(height)}
                </text>

                <text x="200" y="170" textAnchor="middle" className="text-sm font-bold">
                  {Math.round(length)}
                </text>

                <text x="350" y="65" textAnchor="middle" className="text-sm font-bold">
                  {roofPitch}°
                </text>
              </svg>
            </div>

            {/* Front Elevation */}
            <div className="border border-gray-300 p-2">
              <h3 className="text-center font-bold mb-2">Front</h3>
              <svg width="100%" height="200" viewBox="0 0 400 200" className="border border-gray-200">
                {/* Ground line */}
                <line x1="50" y1="150" x2="350" y2="150" stroke="#000" strokeWidth={lineWeights.medium} />

                {/* Posts */}
                <rect x="80" y="80" width="6" height="70" fill="#000" />
                <rect x="320" y="80" width="6" height="70" fill="#000" />

                {/* Roof with cladding pattern */}
                {roofType === "Gable" ? (
                  <polygon
                    points="75,80 200,50 325,80"
                    fill="url(#roofPattern)"
                    stroke="#000"
                    strokeWidth={lineWeights.heavy}
                  />
                ) : (
                  <polygon
                    points="75,50 325,80 325,80 75,50"
                    fill="url(#roofPattern)"
                    stroke="#000"
                    strokeWidth={lineWeights.heavy}
                  />
                )}

                {/* Dimensions */}
                <text x="200" y="30" textAnchor="middle" className="text-sm font-bold">
                  {Math.round(height)}
                </text>

                <text x="200" y="170" textAnchor="middle" className="text-sm font-bold">
                  {Math.round(width)}
                </text>

                <text x="350" y="65" textAnchor="middle" className="text-sm font-bold">
                  {roofPitch}°
                </text>
              </svg>
            </div>

            {/* Back Elevation */}
            <div className="border border-gray-300 p-2">
              <h3 className="text-center font-bold mb-2">Back</h3>
              <svg width="100%" height="200" viewBox="0 0 400 200" className="border border-gray-200">
                {/* Ground line */}
                <line x1="50" y1="150" x2="350" y2="150" stroke="#000" strokeWidth={lineWeights.medium} />

                {/* Posts */}
                <rect x="80" y="80" width="6" height="70" fill="#000" />
                <rect x="320" y="80" width="6" height="70" fill="#000" />

                {/* Roof with cladding pattern */}
                {roofType === "Gable" ? (
                  <polygon
                    points="75,80 200,50 325,80"
                    fill="url(#roofPattern)"
                    stroke="#000"
                    strokeWidth={lineWeights.heavy}
                  />
                ) : (
                  <polygon
                    points="75,50 325,80 325,80 75,50"
                    fill="url(#roofPattern)"
                    stroke="#000"
                    strokeWidth={lineWeights.heavy}
                  />
                )}

                {/* Dimensions */}
                <text x="200" y="30" textAnchor="middle" className="text-sm font-bold">
                  {Math.round(height)}
                </text>

                <text x="200" y="170" textAnchor="middle" className="text-sm font-bold">
                  {Math.round(width)}
                </text>
              </svg>
            </div>

            {/* Right Elevation */}
            <div className="border border-gray-300 p-2">
              <h3 className="text-center font-bold mb-2">Right</h3>
              <svg width="100%" height="200" viewBox="0 0 400 200" className="border border-gray-200">
                {/* Ground line */}
                <line x1="50" y1="150" x2="350" y2="150" stroke="#000" strokeWidth={lineWeights.medium} />

                {/* Posts */}
                <rect x="80" y="80" width="6" height="70" fill="#000" />
                <rect x="320" y="80" width="6" height="70" fill="#000" />

                {/* Roof with cladding pattern */}
                {roofType === "Gable" ? (
                  <polygon
                    points="75,80 200,50 325,80"
                    fill="url(#roofPattern)"
                    stroke="#000"
                    strokeWidth={lineWeights.heavy}
                  />
                ) : (
                  <polygon
                    points="75,50 325,80 325,80 75,50"
                    fill="url(#roofPattern)"
                    stroke="#000"
                    strokeWidth={lineWeights.heavy}
                  />
                )}

                {/* Dimensions */}
                <text x="200" y="30" textAnchor="middle" className="text-sm font-bold">
                  {Math.round(height)}
                </text>

                <text x="200" y="170" textAnchor="middle" className="text-sm font-bold">
                  {Math.round(length)}
                </text>
              </svg>
            </div>
          </div>

          {/* Footer with company info */}
          <div className="mt-6 border-t border-gray-300 pt-4 text-center text-sm">
            <p className="font-bold">Aussie Patio Designer</p>
            <p>ABN: 12 345 678 901</p>
            <p>PH: 1300 123 456 | E: info@aussiepatio.com.au</p>
          </div>
        </div>
      </div>
    )
  }

  // Professional Specifications Table
  const SpecificationsTable = () => (
    <div className="bg-white border-2 border-gray-800 rounded-lg overflow-hidden">
      <TitleBlock pageTitle="SPECIFICATIONS" sheetNumber={3} />

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
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="layout" className="font-semibold">
              Quote Layout
            </TabsTrigger>
            <TabsTrigger value="elevations" className="font-semibold">
              Elevations
            </TabsTrigger>
            <TabsTrigger value="specs" className="font-semibold">
              Specifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="layout" className="mt-6">
            <LayoutView />
          </TabsContent>

          <TabsContent value="elevations" className="mt-6">
            <ElevationsView />
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
