import type React from "react"
import { getColorHex } from "@/lib/colorbond-colors"

interface GazeboDiagramProps {
  roofColor?: string
  postBeamColor?: string
}

const GazeboDiagram: React.FC<GazeboDiagramProps> = ({ roofColor, postBeamColor }) => {
  return (
    <svg width="300" height="200" viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Roof */}
      <path d="M50 50 L150 20 L250 50" stroke="black" strokeWidth="3" />
      <path d="M50 50 L150 50 L250 50" stroke="black" strokeWidth="3" />
      <path d="M60 55 L150 25 L240 55" fill={getColorHex(roofColor || "SURFMIST / BASALT")} />

      {/* Posts */}
      <rect x="60" y="60" width="10" height="100" fill={getColorHex(postBeamColor || "MONUMENT")} />
      <rect x="230" y="60" width="10" height="100" fill={getColorHex(postBeamColor || "MONUMENT")} />

      {/* Beams */}
      <rect x="60" y="60" width="180" height="10" fill={getColorHex(postBeamColor || "MONUMENT")} />

      {/* Base */}
      <rect x="50" y="160" width="200" height="30" fill="lightgrey" />
    </svg>
  )
}

export default GazeboDiagram
