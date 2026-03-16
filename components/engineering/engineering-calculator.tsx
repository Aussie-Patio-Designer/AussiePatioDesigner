"use client"

import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const WIND_REGION_SPEED = { A: 30, B: 35, C: 45, D: 50 } as const
const TERRAIN_MULTIPLIER = { open: 0.9, suburban: 1, sheltered: 1.05 } as const
const IMPORTANCE_FACTOR = { normal: 1, essential: 1.1 } as const
const ROOF_MASS = { "deck-steel": 0.12, "insulated-panel": 0.18, "glass-roof": 0.24 } as const
const LIVE_LOADS = {
  maintenance: { label: "Maintenance only (0.15 kPa)", pressure: 0.15 },
  patio: { label: "Standard patio roof (0.25 kPa)", pressure: 0.25 },
  balcony: { label: "Balcony / assembly (0.50 kPa)", pressure: 0.5 },
} as const

const STEEL_GRADE_FY = 350
const PHI_BENDING = 0.9
const PHI_AXIAL = 0.85

type SteelSection = { name: string; area: number; sectionModulus: number }

const BEAM_SECTIONS: SteelSection[] = [
  { name: "RHS 75×50×2.5", area: 562, sectionModulus: 31_000 },
  { name: "RHS 100×50×2.5", area: 686, sectionModulus: 45_000 },
  { name: "RHS 125×65×3.0", area: 1_020, sectionModulus: 82_000 },
  { name: "RHS 150×75×4.0", area: 1_790, sectionModulus: 170_000 },
  { name: "RHS 200×100×5.0", area: 3_070, sectionModulus: 360_000 },
]

const COLUMN_SECTIONS: SteelSection[] = [
  { name: "SHS 65×65×2.5", area: 594, sectionModulus: 28_000 },
  { name: "SHS 75×75×3.0", area: 840, sectionModulus: 43_000 },
  { name: "SHS 89×89×3.5", area: 1_160, sectionModulus: 66_000 },
  { name: "SHS 100×100×4.0", area: 1_520, sectionModulus: 92_000 },
  { name: "SHS 125×125×4.0", area: 1_910, sectionModulus: 142_000 },
]

type Inputs = {
  span: number
  length: number
  baySpacing: number
  rafterSpacing: number
  windRegion: keyof typeof WIND_REGION_SPEED
  terrain: keyof typeof TERRAIN_MULTIPLIER
  importance: keyof typeof IMPORTANCE_FACTOR
  roofSystem: keyof typeof ROOF_MASS
  liveLoad: keyof typeof LIVE_LOADS
}

const formatNumber = (value: number, digits = 2) => (Number.isFinite(value) ? value.toFixed(digits) : "-")

const pickByModulus = (required: number) => BEAM_SECTIONS.find((s) => s.sectionModulus >= required) ?? BEAM_SECTIONS.at(-1)!
const pickByArea = (required: number) => COLUMN_SECTIONS.find((s) => s.area >= required) ?? COLUMN_SECTIONS.at(-1)!

export default function EngineeringCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    span: 4.8,
    length: 8,
    baySpacing: 3,
    rafterSpacing: 1,
    windRegion: "B",
    terrain: "suburban",
    importance: "normal",
    roofSystem: "deck-steel",
    liveLoad: "patio",
  })

  const results = useMemo(() => {
    const area = inputs.span * inputs.length
    const regionalWind = WIND_REGION_SPEED[inputs.windRegion] * TERRAIN_MULTIPLIER[inputs.terrain]
    const designWind = regionalWind * IMPORTANCE_FACTOR[inputs.importance]

    const windPressure = 0.0006 * designWind ** 2
    const roofDeadLoad = ROOF_MASS[inputs.roofSystem]
    const liveLoad = LIVE_LOADS[inputs.liveLoad].pressure

    const ultimatePressure = 1.2 * roofDeadLoad + 1.5 * liveLoad + 1.2 * windPressure
    const upliftPressure = Math.max(0, 0.9 * windPressure - 0.9 * roofDeadLoad)

    const beamTribWidth = Math.max(0.6, Math.min(inputs.baySpacing, inputs.length / 2))
    const beamUniformLoad = ultimatePressure * beamTribWidth

    const ultimateMoment = (beamUniformLoad * inputs.span ** 2) / 8
    const requiredSectionModulus = (ultimateMoment * 1_000_000) / (PHI_BENDING * STEEL_GRADE_FY)
    const beamSection = pickByModulus(requiredSectionModulus)

    const roofWeight = (roofDeadLoad + liveLoad) * area
    const totalUplift = upliftPressure * area
    const baseReactionCompression = Math.max(0, (roofWeight + ultimatePressure * area) / 4)
    const baseReactionUplift = Math.max(0, totalUplift / 4)

    const requiredColumnArea = (baseReactionCompression * 1_000) / (PHI_AXIAL * STEEL_GRADE_FY)
    const columnSection = pickByArea(requiredColumnArea)

    return {
      windPressure,
      ultimatePressure,
      upliftPressure,
      beamUniformLoad,
      requiredSectionModulus,
      beamSection,
      ultimateMoment,
      requiredColumnArea,
      columnSection,
      baseReactionCompression,
      baseReactionUplift,
      roofWeight,
      totalUplift,
    }
  }, [inputs])

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Design inputs</CardTitle>
          <CardDescription>Indicative values only. Confirm with a certified structural engineer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Span (m)</Label>
            <Input type="number" value={inputs.span} onChange={(e) => setInputs((p) => ({ ...p, span: Number(e.target.value) || 0 }))} />
          </div>
          <div className="space-y-2">
            <Label>Length (m)</Label>
            <Input type="number" value={inputs.length} onChange={(e) => setInputs((p) => ({ ...p, length: Number(e.target.value) || 0 }))} />
          </div>
          <div className="space-y-2">
            <Label>Bay spacing (m)</Label>
            <Input type="number" value={inputs.baySpacing} onChange={(e) => setInputs((p) => ({ ...p, baySpacing: Number(e.target.value) || 0 }))} />
          </div>
          <div className="space-y-2">
            <Label>Rafter spacing (m)</Label>
            <Input type="number" value={inputs.rafterSpacing} onChange={(e) => setInputs((p) => ({ ...p, rafterSpacing: Number(e.target.value) || 0 }))} />
          </div>

          <div className="space-y-2">
            <Label>Wind region</Label>
            <Select value={inputs.windRegion} onValueChange={(value: Inputs["windRegion"]) => setInputs((p) => ({ ...p, windRegion: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{Object.keys(WIND_REGION_SPEED).map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Terrain</Label>
            <Select value={inputs.terrain} onValueChange={(value: Inputs["terrain"]) => setInputs((p) => ({ ...p, terrain: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="suburban">Suburban</SelectItem>
                <SelectItem value="sheltered">Sheltered</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Importance</Label>
            <Select value={inputs.importance} onValueChange={(value: Inputs["importance"]) => setInputs((p) => ({ ...p, importance: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="essential">Essential</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Roof system</Label>
            <Select value={inputs.roofSystem} onValueChange={(value: Inputs["roofSystem"]) => setInputs((p) => ({ ...p, roofSystem: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="deck-steel">Deck steel</SelectItem>
                <SelectItem value="insulated-panel">Insulated panel</SelectItem>
                <SelectItem value="glass-roof">Glass roof</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Live load</Label>
            <Select value={inputs.liveLoad} onValueChange={(value: Inputs["liveLoad"]) => setInputs((p) => ({ ...p, liveLoad: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(LIVE_LOADS).map(([key, option]) => (
                  <SelectItem key={key} value={key}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Indicative output</CardTitle>
          <CardDescription>For concept and quoting guidance only.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Wind: {formatNumber(results.windPressure, 3)} kPa</Badge>
            <Badge variant="secondary">Ultimate: {formatNumber(results.ultimatePressure, 3)} kPa</Badge>
            <Badge variant="secondary">Uplift: {formatNumber(results.upliftPressure, 3)} kPa</Badge>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Check</TableHead>
                <TableHead>Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow><TableCell>Recommended beam</TableCell><TableCell>{results.beamSection.name}</TableCell></TableRow>
              <TableRow><TableCell>Required section modulus</TableCell><TableCell>{formatNumber(results.requiredSectionModulus, 0)} mm³</TableCell></TableRow>
              <TableRow><TableCell>Ultimate moment</TableCell><TableCell>{formatNumber(results.ultimateMoment, 2)} kNm</TableCell></TableRow>
              <TableRow><TableCell>Recommended column</TableCell><TableCell>{results.columnSection.name}</TableCell></TableRow>
              <TableRow><TableCell>Required column area</TableCell><TableCell>{formatNumber(results.requiredColumnArea, 0)} mm²</TableCell></TableRow>
              <TableRow><TableCell>Base compression / post</TableCell><TableCell>{formatNumber(results.baseReactionCompression, 2)} kN</TableCell></TableRow>
              <TableRow><TableCell>Base uplift / post</TableCell><TableCell>{formatNumber(results.baseReactionUplift, 2)} kN</TableCell></TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
