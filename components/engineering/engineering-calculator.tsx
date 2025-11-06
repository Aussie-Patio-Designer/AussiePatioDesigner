"use client"

import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const WIND_REGION_SPEED: Record<string, number> = {
  A: 30,
  B: 35,
  C: 45,
  D: 50,
}

const TERRAIN_MULTIPLIER: Record<string, number> = {
  open: 0.9,
  suburban: 1,
  sheltered: 1.05,
}

const IMPORTANCE_FACTOR: Record<string, number> = {
  normal: 1,
  essential: 1.1,
}

const ROOF_MASS: Record<string, number> = {
  "deck-steel": 0.12,
  "insulated-panel": 0.18,
  "glass-roof": 0.24,
}

const LIVE_LOADS: Record<string, { label: string; pressure: number }> = {
  maintenance: { label: "Maintenance only (0.15 kPa)", pressure: 0.15 },
  patio: { label: "Standard patio roof (0.25 kPa)", pressure: 0.25 },
  balcony: { label: "Balcony / assembly (0.50 kPa)", pressure: 0.5 },
}

const STEEL_GRADE_FY = 350 // MPa (G350)
const PHI_BENDING = 0.9
const PHI_AXIAL = 0.85
const E_STEEL = 200_000 // MPa

const massPerMetre = (area: number) => area * 0.00785

type SteelSection = {
  name: string
  depth: number
  width: number
  thickness: number
  area: number // mm^2
  sectionModulus: number // mm^3
}

const BEAM_SECTIONS: SteelSection[] = [
  { name: "RHS 75×50×2.5", depth: 75, width: 50, thickness: 2.5, area: 562, sectionModulus: 31_000 },
  { name: "RHS 100×50×2.5", depth: 100, width: 50, thickness: 2.5, area: 686, sectionModulus: 45_000 },
  { name: "RHS 125×65×3.0", depth: 125, width: 65, thickness: 3, area: 1_020, sectionModulus: 82_000 },
  { name: "RHS 150×50×3.0", depth: 150, width: 50, thickness: 3, area: 1_100, sectionModulus: 96_000 },
  { name: "RHS 150×75×4.0", depth: 150, width: 75, thickness: 4, area: 1_790, sectionModulus: 170_000 },
  { name: "RHS 200×100×5.0", depth: 200, width: 100, thickness: 5, area: 3_070, sectionModulus: 360_000 },
  { name: "RHS 250×125×6.0", depth: 250, width: 125, thickness: 6, area: 4_850, sectionModulus: 610_000 },
]

const RAFTER_SECTIONS: SteelSection[] = [
  { name: "RHS 65×35×2.0", depth: 65, width: 35, thickness: 2, area: 370, sectionModulus: 18_000 },
  { name: "RHS 75×50×2.0", depth: 75, width: 50, thickness: 2, area: 470, sectionModulus: 26_000 },
  { name: "RHS 75×50×2.5", depth: 75, width: 50, thickness: 2.5, area: 562, sectionModulus: 31_000 },
  { name: "RHS 100×50×2.5", depth: 100, width: 50, thickness: 2.5, area: 686, sectionModulus: 45_000 },
  { name: "RHS 100×50×3.0", depth: 100, width: 50, thickness: 3, area: 808, sectionModulus: 53_000 },
  { name: "RHS 125×65×3.0", depth: 125, width: 65, thickness: 3, area: 1_020, sectionModulus: 82_000 },
]

const COLUMN_SECTIONS: SteelSection[] = [
  { name: "SHS 65×65×2.5", depth: 65, width: 65, thickness: 2.5, area: 594, sectionModulus: 28_000 },
  { name: "SHS 75×75×3.0", depth: 75, width: 75, thickness: 3, area: 840, sectionModulus: 43_000 },
  { name: "SHS 89×89×3.5", depth: 89, width: 89, thickness: 3.5, area: 1_160, sectionModulus: 66_000 },
  { name: "SHS 100×100×4.0", depth: 100, width: 100, thickness: 4, area: 1_520, sectionModulus: 92_000 },
  { name: "SHS 125×125×4.0", depth: 125, width: 125, thickness: 4, area: 1_910, sectionModulus: 142_000 },
  { name: "SHS 150×150×5.0", depth: 150, width: 150, thickness: 5, area: 3_170, sectionModulus: 260_000 },
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

type MemberResult = {
  section: SteelSection
  requiredSectionModulus: number
  utilisation: number
  ultimateMoment: number
  serviceDeflection: number
  deflectionLimit: number
}

type ColumnResult = {
  section: SteelSection
  requiredArea: number
  axialLoad: number
  uplift: number
  utilisation: number
}

const formatNumber = (value: number, fractionDigits = 2) =>
  Number.isFinite(value) ? value.toFixed(fractionDigits) : "-"

const pickSectionByModulus = (sections: SteelSection[], required: number) => {
  const match = sections.find((section) => section.sectionModulus >= required)
  return match ?? sections[sections.length - 1]
}

const pickSectionByArea = (sections: SteelSection[], required: number) => {
  const match = sections.find((section) => section.area >= required)
  return match ?? sections[sections.length - 1]
}

const computeDeflection = (
  span: number,
  uniformLoad: number,
  section: SteelSection
) => {
  const spanMm = span * 1_000
  const w = uniformLoad // kN/m == N/mm
  const i = section.sectionModulus * (section.depth / 2)
  if (!i) return 0

  return (5 * w * Math.pow(spanMm, 4)) / (384 * E_STEEL * i)
}

const describeUtilisation = (utilisation: number) =>
  `${Math.round(utilisation * 100)}% capacity`

const describeBasePlate = (axial: number) => {
  if (axial < 8) return "10 mm plate with 2 × M12 chemset anchors"
  if (axial < 14) return "12 mm plate with 2 × M16 chemset anchors"
  if (axial < 22) return "16 mm plate with 4 × M16 chemset anchors"
  return "20 mm plate with 4 × M20 chemset anchors"
}

const describeHoldDown = (uplift: number) => {
  if (uplift <= 0) return "Standard base plate and grout pad"
  if (uplift < 6) return "M16 threaded rod with epoxy anchorage"
  if (uplift < 12) return "Twin M16 hold-down rods to edge thickening"
  return "Cast-in M20 hold-down cage with 25 MPa concrete"
}

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
    const baseWind = WIND_REGION_SPEED[inputs.windRegion]
    const terrainFactor = TERRAIN_MULTIPLIER[inputs.terrain]
    const importanceFactor = IMPORTANCE_FACTOR[inputs.importance]

    const regionalWind = baseWind * terrainFactor
    const designWind = regionalWind * importanceFactor
    const netWindPressure = 0.6 * Math.pow(designWind, 2) * 0.001 // kPa

    const deadPressure = ROOF_MASS[inputs.roofSystem]
    const livePressure = LIVE_LOADS[inputs.liveLoad].pressure

    const servicePressure = deadPressure + livePressure
    const ultimateRoofPressure = 1.2 * deadPressure + 1.5 * livePressure

    const rafterSpan = inputs.span
    const beamSpan = inputs.length

    const rafterUltimateLoad = ultimateRoofPressure * inputs.rafterSpacing
    const rafterServiceLoad = servicePressure * inputs.rafterSpacing
    const beamUltimateLoad = ultimateRoofPressure * inputs.span
    const beamServiceLoad = servicePressure * inputs.span

    const rafterMoment = (rafterUltimateLoad * Math.pow(rafterSpan, 2)) / 8
    const beamMoment = (beamUltimateLoad * Math.pow(beamSpan, 2)) / 8

    const requiredZRafter =
      (rafterMoment * 1_000_000) / (PHI_BENDING * STEEL_GRADE_FY)
    const requiredZBeam =
      (beamMoment * 1_000_000) / (PHI_BENDING * STEEL_GRADE_FY)

    const selectedRafter = pickSectionByModulus(RAFTER_SECTIONS, requiredZRafter)
    const selectedBeam = pickSectionByModulus(BEAM_SECTIONS, requiredZBeam)

    const rafterUtilisation = requiredZRafter / selectedRafter.sectionModulus
    const beamUtilisation = requiredZBeam / selectedBeam.sectionModulus

    const rafterDeflection = computeDeflection(
      rafterSpan,
      rafterServiceLoad,
      selectedRafter
    )
    const beamDeflection = computeDeflection(
      beamSpan,
      beamServiceLoad,
      selectedBeam
    )
    const rafterLimit = (rafterSpan * 1_000) / 200
    const beamLimit = (beamSpan * 1_000) / 250

    const columnTributaryArea = inputs.span * inputs.baySpacing
    const columnDead = 1.2 * deadPressure * columnTributaryArea
    const columnLive = 1.5 * livePressure * columnTributaryArea
    const columnAxial = columnDead + columnLive
    const columnRequiredArea =
      (columnAxial * 1_000) / (PHI_AXIAL * STEEL_GRADE_FY)

    const selectedColumn = pickSectionByArea(COLUMN_SECTIONS, columnRequiredArea)
    const columnUtilisation = columnRequiredArea / selectedColumn.area

    const upliftPerColumn = Math.max(
      netWindPressure * columnTributaryArea - deadPressure * columnTributaryArea,
      0
    )

    const basePlate = describeBasePlate(columnAxial)
    const holdDown = describeHoldDown(upliftPerColumn)

    return {
      area,
      regionalWind,
      designWind,
      netWindPressure,
      deadPressure,
      livePressure,
      servicePressure,
      ultimateRoofPressure,
      rafter: {
        section: selectedRafter,
        requiredSectionModulus: requiredZRafter,
        utilisation: rafterUtilisation,
        ultimateMoment: rafterMoment,
        serviceDeflection: rafterDeflection,
        deflectionLimit: rafterLimit,
      } satisfies MemberResult,
      beam: {
        section: selectedBeam,
        requiredSectionModulus: requiredZBeam,
        utilisation: beamUtilisation,
        ultimateMoment: beamMoment,
        serviceDeflection: beamDeflection,
        deflectionLimit: beamLimit,
      } satisfies MemberResult,
      column: {
        section: selectedColumn,
        requiredArea: columnRequiredArea,
        axialLoad: columnAxial,
        uplift: upliftPerColumn,
        utilisation: columnUtilisation,
      } satisfies ColumnResult,
      basePlate,
      holdDown,
    }
  }, [inputs])

  const updateNumberField = (field: keyof Inputs) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = parseFloat(event.target.value)
      setInputs((prev) => ({
        ...prev,
        [field]: Number.isFinite(nextValue) ? nextValue : 0,
      }))
    }

  const updateSelectField = <K extends keyof Inputs>(field: K) =>
    (value: Inputs[K]) => {
      setInputs((prev) => ({
        ...prev,
        [field]: value,
      }))
    }

  const describeSection = (section: SteelSection) =>
    `${section.name} · t${section.thickness} · ${formatNumber(massPerMetre(section.area), 2)} kg/m`

  return (
    <div className="space-y-10">
      <Card className="border-primary/30 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-sky-50 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-3xl font-semibold">
              Steel frame design study
            </CardTitle>
            <Badge className="bg-sky-500/20 text-sky-100">
              G350 steel · φ<sub>b</sub> = 0.9 · φ<sub>c</sub> = 0.85
            </Badge>
          </div>
          <CardDescription className="text-sky-100">
            Define the geometry and load environment to run a quick structural sizing
            check for rafters, primary beams and columns using RHS/SHS steel members.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-8 lg:grid-cols-[1.05fr,1fr]">
          <div className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="span">Projection span (m)</Label>
              <Input
                id="span"
                type="number"
                min={2}
                step={0.1}
                value={inputs.span}
                onChange={updateNumberField("span")}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="length">Patio length (m)</Label>
              <Input
                id="length"
                type="number"
                min={3}
                step={0.1}
                value={inputs.length}
                onChange={updateNumberField("length")}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="baySpacing">Column bay spacing (m)</Label>
              <Input
                id="baySpacing"
                type="number"
                min={2}
                step={0.1}
                value={inputs.baySpacing}
                onChange={updateNumberField("baySpacing")}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="rafterSpacing">Rafter spacing (m)</Label>
              <Input
                id="rafterSpacing"
                type="number"
                min={0.6}
                step={0.1}
                value={inputs.rafterSpacing}
                onChange={updateNumberField("rafterSpacing")}
              />
            </div>
          </div>
          <div className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="windRegion">Wind region</Label>
              <Select
                value={inputs.windRegion}
                onValueChange={updateSelectField("windRegion")}
              >
                <SelectTrigger id="windRegion" className="bg-slate-900/60">
                  <SelectValue placeholder="Select wind region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Region A · inland</SelectItem>
                  <SelectItem value="B">Region B · coastal</SelectItem>
                  <SelectItem value="C">Region C · cyclonic</SelectItem>
                  <SelectItem value="D">Region D · severe cyclonic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="terrain">Terrain exposure</Label>
              <Select
                value={inputs.terrain}
                onValueChange={updateSelectField("terrain")}
              >
                <SelectTrigger id="terrain" className="bg-slate-900/60">
                  <SelectValue placeholder="Select terrain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open · coastal plain / airfield</SelectItem>
                  <SelectItem value="suburban">Suburban · typical housing</SelectItem>
                  <SelectItem value="sheltered">Sheltered · dense urban</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="importance">Building importance</Label>
              <Select
                value={inputs.importance}
                onValueChange={updateSelectField("importance")}
              >
                <SelectTrigger id="importance" className="bg-slate-900/60">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal occupancy (Importance 2)</SelectItem>
                  <SelectItem value="essential">Essential (Importance 3)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="roofSystem">Roof system</Label>
              <Select
                value={inputs.roofSystem}
                onValueChange={updateSelectField("roofSystem")}
              >
                <SelectTrigger id="roofSystem" className="bg-slate-900/60">
                  <SelectValue placeholder="Select roof system" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deck-steel">Single skin steel deck</SelectItem>
                  <SelectItem value="insulated-panel">Insulated panel (EPS/PUR)</SelectItem>
                  <SelectItem value="glass-roof">Laminated glass roof</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="liveLoad">Live load category</Label>
              <Select
                value={inputs.liveLoad}
                onValueChange={updateSelectField("liveLoad")}
              >
                <SelectTrigger id="liveLoad" className="bg-slate-900/60">
                  <SelectValue placeholder="Select live load" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LIVE_LOADS).map(([key, option]) => (
                    <SelectItem key={key} value={key}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Load environment summary</CardTitle>
            <CardDescription>
              Derived pressures for the nominated wind region and roof system. Wind
              speeds follow AS/NZS 1170 methods with simplified multipliers.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm leading-6">
            <div className="grid gap-1">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Plan area
              </span>
              <span className="text-lg font-semibold">{formatNumber(results.area)} m²</span>
              <p className="text-muted-foreground">
                Length × projection span used as the tributary roof surface.
              </p>
            </div>
            <div className="grid gap-1">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Design wind speeds
              </span>
              <span className="text-lg font-semibold">
                V<sub>R</sub> {formatNumber(results.regionalWind, 1)} m/s · V<sub>des</sub>{" "}
                {formatNumber(results.designWind, 1)} m/s
              </span>
              <p className="text-muted-foreground">
                Regional speed with terrain category {inputs.terrain} and importance
                factor {inputs.importance} applied.
              </p>
            </div>
            <div className="grid gap-1">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Net ultimate wind pressure
              </span>
              <span className="text-lg font-semibold">
                {formatNumber(results.netWindPressure)} kPa
              </span>
              <p className="text-muted-foreground">
                Applied as uplift to columns and primary beams for hold-down checks.
              </p>
            </div>
            <div className="grid gap-1">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Roof pressures
              </span>
              <span className="text-lg font-semibold">
                G = {formatNumber(results.deadPressure)} kPa · Q =
                {formatNumber(results.livePressure)} kPa
              </span>
              <p className="text-muted-foreground">
                Service combination G + Q = {formatNumber(results.servicePressure)} kPa ·
                Ultimate 1.2G + 1.5Q = {formatNumber(results.ultimateRoofPressure)} kPa.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Foundation and hold-down guidance</CardTitle>
            <CardDescription>
              Preliminary reaction forces per column for footing and anchorage design.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm leading-6">
            <div className="grid gap-1">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Ultimate axial per column
              </span>
              <span className="text-lg font-semibold">
                {formatNumber(results.column.axialLoad)} kN
              </span>
              <p className="text-muted-foreground">
                Based on tributary area {formatNumber(inputs.span)} m ×
                {" "}
                {formatNumber(inputs.baySpacing)} m using 1.2G + 1.5Q.
              </p>
            </div>
            <div className="grid gap-1">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Net uplift per column
              </span>
              <span className="text-lg font-semibold">
                {formatNumber(results.column.uplift)} kN
              </span>
              <p className="text-muted-foreground">
                Wind suction minus roof dead load. Use this to size hold-downs.
              </p>
            </div>
            <div className="grid gap-1">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Base plate recommendation
              </span>
              <span className="text-lg font-semibold">{results.basePlate}</span>
            </div>
            <div className="grid gap-1">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Hold-down guidance
              </span>
              <span className="text-lg font-semibold">{results.holdDown}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Steel member selection</CardTitle>
          <CardDescription>
            Capacity ratios reference φM<sub>s</sub> = φ · Z · f<sub>y</sub>. Deflection is
            checked under service load. Upgrade members when utilisation exceeds 85% for
            enhanced robustness.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Recommended section</TableHead>
                <TableHead>Ultimate demand</TableHead>
                <TableHead>Utilisation</TableHead>
                <TableHead>Service deflection</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Rafters</TableCell>
                <TableCell>{describeSection(results.rafter.section)}</TableCell>
                <TableCell>
                  M<sub>u</sub> = {formatNumber(results.rafter.ultimateMoment)} kN·m
                </TableCell>
                <TableCell>{describeUtilisation(results.rafter.utilisation)}</TableCell>
                <TableCell>
                  δ = {formatNumber(results.rafter.serviceDeflection)} mm · L/200
                  limit {formatNumber(results.rafter.deflectionLimit)} mm
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Primary beam</TableCell>
                <TableCell>{describeSection(results.beam.section)}</TableCell>
                <TableCell>
                  M<sub>u</sub> = {formatNumber(results.beam.ultimateMoment)} kN·m
                </TableCell>
                <TableCell>{describeUtilisation(results.beam.utilisation)}</TableCell>
                <TableCell>
                  δ = {formatNumber(results.beam.serviceDeflection)} mm · L/250
                  limit {formatNumber(results.beam.deflectionLimit)} mm
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Columns</TableCell>
                <TableCell>{describeSection(results.column.section)}</TableCell>
                <TableCell>
                  N<sub>u</sub> = {formatNumber(results.column.axialLoad)} kN
                </TableCell>
                <TableCell>{describeUtilisation(results.column.utilisation)}</TableCell>
                <TableCell>
                  Uplift check {formatNumber(results.column.uplift)} kN
                </TableCell>
              </TableRow>
            </TableBody>
            <TableCaption>
              All members assume G350 cold-formed steel with a design yield strength of
              350 MPa. Adopt corrosion protection to AS/NZS 2312 and verify against
              local authority requirements before issue.
            </TableCaption>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-dashed border-slate-300 bg-slate-50">
        <CardHeader>
          <CardTitle>Certification pathway</CardTitle>
          <CardDescription>
            Export these results to our RPEQ team for detailed finite element checks,
            connection schedules and signed Form 15/16 deliverables.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm leading-6 text-slate-600">
          <p>
            This tool mirrors the load paths we check in SpaceGass for patio frames. It
            is calibrated for single-storey attached patios constructed entirely from
            RHS/SHS steel. Apply engineering judgement for unusual geometries, high
            importance levels or site-specific shielding.
          </p>
          <p>
            Submit architectural drawings together with these preliminary member sizes
            so the engineering team can run full limit state combinations, lateral
            stability analysis and detailed connection design prior to certification.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
