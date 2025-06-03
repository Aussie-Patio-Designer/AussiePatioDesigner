"use client"

interface GazeboDiagramProps {
  length: number
  width: number
  height: number
  roofType: "Gable" | "Skillion"
  roofPitch: number
  roofColor?: string
  postBeamColor?: string
}

export default function GazeboDiagram({
  length,
  width,
  height,
  roofType,
  roofPitch,
  roofColor,
  postBeamColor,
}: GazeboDiagramProps) {
  // Convert to meters for display
  const lengthM = (length / 1000).toFixed(1)
  const widthM = (width / 1000).toFixed(1)
  const heightM = (height / 1000).toFixed(1)

  // Calculate peak height
  const pitchRad = (roofPitch * Math.PI) / 180
  const rise = roofType === "Gable" ? (width / 2000) * Math.tan(pitchRad) : (width / 1000) * Math.tan(pitchRad)
  const peakHeight = (height / 1000 + rise).toFixed(1)

  // Simple color mapping
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

  const frameColor = getColorFromName(postBeamColor || "MONUMENT")
  const roofColorHex = getColorFromName(roofColor || "SURFMIST / BASALT")

  return (
    <div className="h-full w-full bg-gradient-to-b from-blue-100 to-green-100 p-4 flex flex-col items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Gazebo Design</h3>

        {/* Side view diagram */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Side View</h4>
          <svg viewBox="0 0 300 200" className="w-full h-32 border rounded">
            {/* Ground line */}
            <line x1="50" y1="180" x2="250" y2="180" stroke="#8B7355" strokeWidth="3" />

            {/* Posts */}
            <rect x="60" y="120" width="8" height="60" fill={frameColor} />
            <rect x="232" y="120" width="8" height="60" fill={frameColor} />

            {/* Roof */}
            {roofType === "Gable" ? (
              <polygon
                points="50,120 150,80 250,120 240,120 150,90 60,120"
                fill={roofColorHex}
                stroke={frameColor}
                strokeWidth="2"
              />
            ) : (
              <polygon points="50,120 250,100 240,100 60,120" fill={roofColorHex} stroke={frameColor} strokeWidth="2" />
            )}

            {/* Dimensions */}
            <text x="150" y="195" textAnchor="middle" className="text-xs fill-gray-600">
              {lengthM}m
            </text>
            <text x="30" y="150" textAnchor="middle" className="text-xs fill-gray-600">
              {heightM}m
            </text>
            {roofType === "Gable" && (
              <text x="150" y="70" textAnchor="middle" className="text-xs fill-gray-600">
                {peakHeight}m
              </text>
            )}
          </svg>
        </div>

        {/* Top view diagram */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Top View</h4>
          <svg viewBox="0 0 300 200" className="w-full h-32 border rounded">
            {/* Roof outline */}
            <rect x="75" y="75" width="150" height="100" fill={roofColorHex} stroke={frameColor} strokeWidth="3" />

            {/* Posts */}
            <circle cx="85" cy="85" r="4" fill={frameColor} />
            <circle cx="215" cy="85" r="4" fill={frameColor} />
            <circle cx="85" cy="165" r="4" fill={frameColor} />
            <circle cx="215" cy="165" r="4" fill={frameColor} />

            {/* Dimensions */}
            <text x="150" y="65" textAnchor="middle" className="text-xs fill-gray-600">
              {lengthM}m
            </text>
            <text x="60" y="130" textAnchor="middle" className="text-xs fill-gray-600" transform="rotate(-90 60 130)">
              {widthM}m
            </text>
          </svg>
        </div>

        {/* Specifications */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Roof Type:</span>
            <span className="font-medium">{roofType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Roof Pitch:</span>
            <span className="font-medium">{roofPitch}°</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Floor Area:</span>
            <span className="font-medium">{((length * width) / 1000000).toFixed(1)}m²</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Roof Color:</span>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded border" style={{ backgroundColor: roofColorHex }}></div>
              <span className="font-medium text-xs">{roofColor?.split(" / ")[1] || "Default"}</span>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Frame Color:</span>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded border" style={{ backgroundColor: frameColor }}></div>
              <span className="font-medium text-xs">{postBeamColor || "Default"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Switch to 3D button */}
      <button
        onClick={() => {
          // This could toggle between 2D and 3D views
          console.log("Switch to 3D view")
        }}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
      >
        View in 3D
      </button>
    </div>
  )
}
