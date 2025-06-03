// Centralized Colorbond Color System - SINGLE SOURCE OF TRUTH
// All color logic and definitions are contained in this file

export interface ColorDefinition {
  value: string
  label: string
  color: string
  category?: string
  description?: string
  metalness?: number
  roughness?: number
  popular?: boolean
}

export interface MaterialProperties {
  color: string
  metalness: number
  roughness: number
  envMapIntensity: number
}

// OFFICIAL COLORBOND COLORS - Single source of truth
export const COLORBOND_ROOF_COLORS: ColorDefinition[] = [
  {
    value: "SURFMIST / BASALT",
    label: "SURFMIST / BASALT",
    color: "#4b4f52",
    category: "popular",
    description: "Classic charcoal grey combination",
    popular: true,
  },
  {
    value: "SURFMIST / CLASSIC CREAM",
    label: "SURFMIST / CLASSIC CREAM",
    color: "#f9e9c2",
    category: "popular",
    description: "Warm cream finish",
    popular: true,
  },
  {
    value: "SURFMIST / DUNE",
    label: "SURFMIST / DUNE",
    color: "#a89f91",
    category: "popular",
    description: "Natural beige tone",
    popular: true,
  },
  {
    value: "SURFMIST / MANOR RED",
    label: "SURFMIST / MANOR RED",
    color: "#6A2E1F",
    category: "feature",
    description: "Rich burgundy red",
    popular: false,
  },
  {
    value: "SURFMIST / PALE EUCALYPT",
    label: "SURFMIST / PALE EUCALYPT",
    color: "#8c9c74",
    category: "natural",
    description: "Soft green-grey",
    popular: false,
  },
  {
    value: "SURFMIST / PAPERBARK",
    label: "SURFMIST / PAPERBARK",
    color: "#d3c6a6",
    category: "natural",
    description: "Light natural brown",
    popular: false,
  },
  {
    value: "SURFMIST / SHALE GREY",
    label: "SURFMIST / SHALE GREY",
    color: "#c1c2be",
    category: "neutral",
    description: "Light grey finish",
    popular: false,
  },
  {
    value: "SURFMIST / SURFMIST",
    label: "SURFMIST / SURFMIST",
    color: "#e4e3dc",
    category: "neutral",
    description: "Off-white classic",
    popular: true,
  },
  {
    value: "SURFMIST / WOODLAND GREY",
    label: "SURFMIST / WOODLAND GREY",
    color: "#4d4f45",
    category: "popular",
    description: "Deep forest grey",
    popular: true,
  },
]

export const COLORBOND_FRAME_COLORS: ColorDefinition[] = [
  {
    value: "CLASSIC CREAM",
    label: "CLASSIC CREAM",
    color: "#f9e9c2",
    category: "popular",
    description: "Warm cream finish",
    metalness: 0.2,
    roughness: 0.8,
    popular: true,
  },
  {
    value: "DUNE",
    label: "DUNE",
    color: "#a89f91",
    category: "popular",
    description: "Natural beige tone",
    metalness: 0.2,
    roughness: 0.8,
    popular: true,
  },
  {
    value: "GALVANISED",
    label: "GALVANISED",
    color: "#B0B4B8",
    category: "metal",
    description: "Metallic zinc finish",
    metalness: 0.7,
    roughness: 0.3,
    popular: true,
  },
  {
    value: "MONUMENT",
    label: "MONUMENT",
    color: "#313233",
    category: "popular",
    description: "Deep charcoal grey",
    metalness: 0.2,
    roughness: 0.8,
    popular: true,
  },
  {
    value: "PAPERBARK",
    label: "PAPERBARK",
    color: "#d3c6a6",
    category: "natural",
    description: "Light natural brown",
    metalness: 0.2,
    roughness: 0.8,
    popular: false,
  },
  {
    value: "DOVER WHITE",
    label: "DOVER WHITE",
    color: "#F8F8F4",
    category: "neutral",
    description: "Clean white finish",
    metalness: 0.1,
    roughness: 0.9,
    popular: true,
  },
  {
    value: "WOODLAND GREY",
    label: "WOODLAND GREY",
    color: "#4d4f45",
    category: "popular",
    description: "Deep forest grey",
    metalness: 0.2,
    roughness: 0.8,
    popular: true,
  },
]

// MASTER COLOR LOOKUP - includes all individual colors for parsing
const MASTER_COLOR_MAP: Record<string, string> = {
  // Roof combinations
  "SURFMIST / BASALT": "#4b4f52",
  "SURFMIST / CLASSIC CREAM": "#f9e9c2",
  "SURFMIST / DUNE": "#a89f91",
  "SURFMIST / MANOR RED": "#6A2E1F",
  "SURFMIST / PALE EUCALYPT": "#8c9c74",
  "SURFMIST / PAPERBARK": "#d3c6a6",
  "SURFMIST / SHALE GREY": "#c1c2be",
  "SURFMIST / SURFMIST": "#e4e3dc",
  "SURFMIST / WOODLAND GREY": "#4d4f45",

  // Individual colors (for parsing and fallbacks)
  BASALT: "#4b4f52",
  "CLASSIC CREAM": "#f9e9c2",
  DUNE: "#a89f91",
  "MANOR RED": "#6A2E1F",
  "PALE EUCALYPT": "#8c9c74",
  PAPERBARK: "#d3c6a6",
  "SHALE GREY": "#c1c2be",
  SURFMIST: "#e4e3dc",
  "WOODLAND GREY": "#4d4f45",
  GALVANISED: "#B0B4B8",
  MONUMENT: "#313233",
  "DOVER WHITE": "#F8F8F4",

  // Legacy/alternative names
  Surfmist: "#e4e3dc",
  Basalt: "#4b4f52",
}

// BEAM/GUTTER MATERIAL PROPERTIES - Centralized here
export const BEAM_MATERIAL_PROPERTIES: Record<string, MaterialProperties> = {
  // Standard beam materials
  DEFAULT: {
    color: getColorHex("MONUMENT"),
    metalness: 0.2,
    roughness: 0.8,
    envMapIntensity: 0.4,
  },
  GALVANISED: {
    color: getColorHex("GALVANISED"),
    metalness: 0.7,
    roughness: 0.3,
    envMapIntensity: 0.6,
  },
  // Gutter materials
  GUTTER: {
    color: getColorHex("MONUMENT"),
    metalness: 0.1,
    roughness: 0.9,
    envMapIntensity: 0.3,
  },
  // Outlet materials
  OUTLET: {
    color: getColorHex("MONUMENT"),
    metalness: 0.3,
    roughness: 0.7,
    envMapIntensity: 0.4,
  },
}

// UTILITY FUNCTIONS - All color logic centralized here

/**
 * Get hex color from any color name or value
 */
export function getColorHex(colorValue: string): string {
  if (!colorValue) return "#CCCCCC"

  // Direct lookup
  if (MASTER_COLOR_MAP[colorValue]) {
    return MASTER_COLOR_MAP[colorValue]
  }

  // Case-insensitive lookup
  const normalizedValue = colorValue.toUpperCase()
  if (MASTER_COLOR_MAP[normalizedValue]) {
    return MASTER_COLOR_MAP[normalizedValue]
  }

  // Parse roof combinations (e.g., "SURFMIST / MANOR RED" -> "MANOR RED")
  if (colorValue.includes(" / ")) {
    const parts = colorValue.split(" / ")
    const externalColor = parts[1] || parts[0]
    if (MASTER_COLOR_MAP[externalColor]) {
      return MASTER_COLOR_MAP[externalColor]
    }
  }

  // Fallback
  return "#CCCCCC"
}

/**
 * Get enhanced color with better visibility for 3D rendering
 */
export function getEnhancedColorHex(colorValue: string): string {
  const baseHex = getColorHex(colorValue)

  // Convert to RGB for manipulation
  const r = Number.parseInt(baseHex.slice(1, 3), 16)
  const g = Number.parseInt(baseHex.slice(3, 5), 16)
  const b = Number.parseInt(baseHex.slice(5, 7), 16)

  // Convert to HSL for better color manipulation
  const max = Math.max(r, g, b) / 255
  const min = Math.min(r, g, b) / 255
  const diff = max - min

  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min)

    switch (max) {
      case r / 255:
        h = ((g - b) / 255 / diff + (g < b ? 6 : 0)) / 6
        break
      case g / 255:
        h = ((b - r) / 255 / diff + 2) / 6
        break
      case b / 255:
        h = ((r - g) / 255 / diff + 4) / 6
        break
    }
  }

  // Enhance saturation and adjust lightness
  const enhancedS = Math.min(1, s * 1.15)
  const enhancedL = l < 0.3 ? 0.3 : l > 0.8 ? 0.8 : l

  // Convert back to RGB
  const c = (1 - Math.abs(2 * enhancedL - 1)) * enhancedS
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1))
  const m = enhancedL - c / 2

  let rNew = 0,
    gNew = 0,
    bNew = 0

  if (h < 1 / 6) {
    rNew = c
    gNew = x
    bNew = 0
  } else if (h < 2 / 6) {
    rNew = x
    gNew = c
    bNew = 0
  } else if (h < 3 / 6) {
    rNew = 0
    gNew = c
    bNew = x
  } else if (h < 4 / 6) {
    rNew = 0
    gNew = x
    bNew = c
  } else if (h < 5 / 6) {
    rNew = x
    gNew = 0
    bNew = c
  } else {
    rNew = c
    gNew = 0
    bNew = x
  }

  const finalR = Math.round((rNew + m) * 255)
  const finalG = Math.round((gNew + m) * 255)
  const finalB = Math.round((bNew + m) * 255)

  return `#${finalR.toString(16).padStart(2, "0")}${finalG.toString(16).padStart(2, "0")}${finalB.toString(16).padStart(2, "0")}`
}

/**
 * Get material properties for 3D rendering
 */
export function getMaterialProperties(colorValue: string): MaterialProperties {
  // Special case for beam materials
  if (colorValue === "GALVANISED") {
    return BEAM_MATERIAL_PROPERTIES.GALVANISED
  }

  const frameColor = COLORBOND_FRAME_COLORS.find((c) => c.value === colorValue)

  if (frameColor) {
    return {
      color: getEnhancedColorHex(colorValue),
      metalness: frameColor.metalness || 0.2,
      roughness: frameColor.roughness || 0.8,
      envMapIntensity: frameColor.metalness === 0.7 ? 0.6 : 0.4, // Higher for galvanised
    }
  }

  // Default material properties for roof colors
  return {
    color: getEnhancedColorHex(colorValue),
    metalness: 0.1,
    roughness: 0.9,
    envMapIntensity: 0.3,
  }
}

/**
 * Get gutter material properties
 */
export function getGutterMaterialProperties(colorValue: string): MaterialProperties {
  // Start with the base material properties for the color
  const baseMaterial = getMaterialProperties(colorValue)

  // Adjust for gutter-specific properties
  return {
    color: baseMaterial.color,
    metalness: 0.1, // Gutters are less metallic
    roughness: 0.9, // Gutters are rougher
    envMapIntensity: 0.3, // Less reflective
  }
}

/**
 * Get outlet material properties
 */
export function getOutletMaterialProperties(colorValue: string): MaterialProperties {
  // Start with the base material properties for the color
  const baseMaterial = getMaterialProperties(colorValue)

  // Adjust for outlet-specific properties
  return {
    color: baseMaterial.color,
    metalness: 0.3, // Outlets are more metallic than gutters
    roughness: 0.7, // Outlets are smoother than gutters
    envMapIntensity: 0.4, // More reflective than gutters
  }
}

/**
 * Get color definition by value
 */
export function getColorDefinition(colorValue: string): ColorDefinition | null {
  const roofColor = COLORBOND_ROOF_COLORS.find((c) => c.value === colorValue)
  if (roofColor) return roofColor

  const frameColor = COLORBOND_FRAME_COLORS.find((c) => c.value === colorValue)
  if (frameColor) return frameColor

  return null
}

/**
 * Get popular color combinations
 */
export function getPopularRoofColors(): ColorDefinition[] {
  return COLORBOND_ROOF_COLORS.filter((color) => color.popular)
}

export function getPopularFrameColors(): ColorDefinition[] {
  return COLORBOND_FRAME_COLORS.filter((color) => color.popular)
}

/**
 * Get recommended color combinations
 */
export function getRecommendedCombinations(): Array<{ roof: string; frame: string; description: string }> {
  return [
    {
      roof: "SURFMIST / BASALT",
      frame: "MONUMENT",
      description: "Classic modern combination",
    },
    {
      roof: "SURFMIST / CLASSIC CREAM",
      frame: "CLASSIC CREAM",
      description: "Warm traditional look",
    },
    {
      roof: "SURFMIST / DUNE",
      frame: "DUNE",
      description: "Natural earth tones",
    },
    {
      roof: "SURFMIST / WOODLAND GREY",
      frame: "WOODLAND GREY",
      description: "Contemporary forest theme",
    },
    {
      roof: "SURFMIST / MANOR RED",
      frame: "MONUMENT",
      description: "Bold heritage style",
    },
  ]
}

// EXPORT ARRAYS FOR COMPONENTS
export const roofColors = COLORBOND_ROOF_COLORS
export const frameColors = COLORBOND_FRAME_COLORS

// LEGACY COMPATIBILITY FUNCTIONS
export function getColorFromName(colorName: string): string {
  return getColorHex(colorName)
}

export function getEnhancedColorFromName(colorName: string): { color: string } {
  return { color: getEnhancedColorHex(colorName) }
}
