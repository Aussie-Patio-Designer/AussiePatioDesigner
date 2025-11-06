"use client"

import { useMemo, useState } from "react"

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

const ROOF_TYPE_FACTOR: Record<string, number> = {
  skillion: 1,
  gable: 1.05,
  hip: 0.95,
}

const ROOF_MASS: Record<string, number> = {
  "single-skin": 0.12,
  insulated: 0.18,
}

type Inputs = {
  span: number
  width: number
  roofPitch: number
  postSpacing: number
  windRegion: keyof typeof WIND_REGION_SPEED
  terrain: keyof typeof TERRAIN_MULTIPLIER
  importance: keyof typeof IMPORTANCE_FACTOR
  roofType: keyof typeof ROOF_TYPE_FACTOR
  roofSystem: keyof typeof ROOF_MASS
}

const formatNumber = (value: number, fractionDigits = 2) =>
  Number.isFinite(value) ? value.toFixed(fractionDigits) : "-"

const describeBeam = (span: number, pressure: number) => {
  if (!span || !pressure) return "90×45mm F7 treated pine"

  const demand = span * pressure

  if (demand < 18) return "90×45mm F7 treated pine"
  if (demand < 28) return "120×45mm F7 treated pine"
  if (demand < 36) return "140×45mm F7 treated pine"
  if (demand < 45) return "190×45mm F7 treated pine"
  return "240×45mm LVL or RHS equivalent"
}

const describeFooting = (uplift: number, spacing: number) => {
  if (!uplift || !spacing) return "300mm ø x 600mm deep with N12 starter"

  const factored = uplift / spacing

  if (factored < 4) return "300mm ø x 600mm deep with N12 starter"
  if (factored < 6) return "350mm ø x 750mm deep with N16 starter"
  if (factored < 9) return "400mm ø x 900mm deep with N16 starter"
  return "450mm ø x 1000mm deep with N20 starter"
}

export default function EngineeringCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    span: 6,
    width: 4,
    roofPitch: 5,
    postSpacing: 3,
    windRegion: "B",
    terrain: "suburban",
    importance: "normal",
    roofType: "skillion",
    roofSystem: "single-skin",
  })

  const results = useMemo(() => {
    const area = inputs.span * inputs.width
    const baseWind = WIND_REGION_SPEED[inputs.windRegion]
    const terrainFactor = TERRAIN_MULTIPLIER[inputs.terrain]
    const importanceFactor = IMPORTANCE_FACTOR[inputs.importance]
    const roofFactor = ROOF_TYPE_FACTOR[inputs.roofType]

    const regionalWind = baseWind * terrainFactor
    const designWind = regionalWind * importanceFactor
    const netPressure = 0.6 * Math.pow(designWind, 2) * roofFactor * 0.001
    const deadLoad = ROOF_MASS[inputs.roofSystem] * area
    const upliftForce = netPressure * area - deadLoad
    const recommendedBeam = describeBeam(inputs.span, netPressure)
    const recommendedFooting = describeFooting(Math.max(upliftForce, 0), inputs.postSpacing)

    return {
      area,
      regionalWind,
      designWind,
      netPressure,
      deadLoad,
      upliftForce,
      recommendedBeam,
      recommendedFooting,
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

  return (
    <div className="space-y-10">
      <Card className="border-primary/20 bg-gradient-to-br from-sky-950 via-slate-900 to-slate-950 text-sky-50 shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-semibold">Engineering quick-study</CardTitle>
          <CardDescription className="text-sky-100">
            Answer a few questions and we will estimate wind pressures, loads and the structural members typically required for a
            compliant Australian patio design.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-8 lg:grid-cols-[1fr,1fr]">
          <div className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="span">Patio span (m)</Label>
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
              <Label htmlFor="width">Patio depth (m)</Label>
              <Input
                id="width"
                type="number"
                min={2}
                step={0.1}
                value={inputs.width}
                onChange={updateNumberField("width")}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="postSpacing">Post spacing (m)</Label>
              <Input
                id="postSpacing"
                type="number"
                min={2}
                step={0.1}
                value={inputs.postSpacing}
                onChange={updateNumberField("postSpacing")}
              />
            </div>
          </div>
          <div className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="windRegion">Wind region</Label>
              <Select value={inputs.windRegion} onValueChange={updateSelectField("windRegion")}>
                <SelectTrigger id="windRegion" className="bg-slate-950/40">
                  <SelectValue placeholder="Select wind region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Region A – inland, non-cyclonic</SelectItem>
                  <SelectItem value="B">Region B – coastal, non-cyclonic</SelectItem>
                  <SelectItem value="C">Region C – cyclonic</SelectItem>
                  <SelectItem value="D">Region D – severe cyclonic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="terrain">Terrain exposure</Label>
              <Select value={inputs.terrain} onValueChange={updateSelectField("terrain")}>
                <SelectTrigger id="terrain" className="bg-slate-950/40">
                  <SelectValue placeholder="Select terrain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open (coastal plain / airfields)</SelectItem>
                  <SelectItem value="suburban">Suburban (typical housing)</SelectItem>
                  <SelectItem value="sheltered">Sheltered (dense urban / behind buildings)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="importance">Usage importance</Label>
              <Select value={inputs.importance} onValueChange={updateSelectField("importance")}>
                <SelectTrigger id="importance" className="bg-slate-950/40">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal (residential / patio)</SelectItem>
                  <SelectItem value="essential">Essential (schools / care facilities)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="roofType">Roof form</Label>
              <Select value={inputs.roofType} onValueChange={updateSelectField("roofType")}>
                <SelectTrigger id="roofType" className="bg-slate-950/40">
                  <SelectValue placeholder="Select roof" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="skillion">Skillion / flat</SelectItem>
                  <SelectItem value="gable">Gable</SelectItem>
                  <SelectItem value="hip">Hip</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="roofSystem">Roof system</Label>
              <Select value={inputs.roofSystem} onValueChange={updateSelectField("roofSystem")}>
                <SelectTrigger id="roofSystem" className="bg-slate-950/40">
                  <SelectValue placeholder="Select roof system" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single-skin">Single skin (Colorbond / poly)</SelectItem>
                  <SelectItem value="insulated">Insulated panel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="roofPitch">Roof pitch (degrees)</Label>
              <Input
                id="roofPitch"
                type="number"
                min={0}
                max={30}
                step={0.5}
                value={inputs.roofPitch}
                onChange={updateNumberField("roofPitch")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Engineering summary</CardTitle>
            <CardDescription>
              Preliminary loads and member sizes for the entered configuration. Always confirm with a licensed structural
              engineer for certification.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm leading-6">
            <div className="grid gap-1">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">Surface area</span>
              <span className="text-lg font-semibold">{formatNumber(results.area)} m²</span>
              <p className="text-muted-foreground">Span × depth footprint used to determine roof area and loading.</p>
            </div>
            <div className="grid gap-1">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">Design wind speeds</span>
              <span className="text-lg font-semibold">
                V<sub>R</sub> {formatNumber(results.regionalWind, 1)} m/s · V<sub>des</sub> {formatNumber(results.designWind, 1)} m/s
              </span>
              <p className="text-muted-foreground">
                Regional basic speed adjusted for terrain ({inputs.terrain}) and importance ({inputs.importance}).
              </p>
            </div>
            <div className="grid gap-1">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">Net uplift pressure</span>
              <span className="text-lg font-semibold">{formatNumber(results.netPressure)} kPa</span>
              <p className="text-muted-foreground">
                Includes roof form influence factor for a {inputs.roofType} roof in Region {inputs.windRegion}.
              </p>
            </div>
            <div className="grid gap-1">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">Factored roof dead load</span>
              <span className="text-lg font-semibold">{formatNumber(results.deadLoad)} kN</span>
              <p className="text-muted-foreground">
                Based on roof system mass of {ROOF_MASS[inputs.roofSystem] * 1000} kg/m² across the full plan area.
              </p>
            </div>
            <div className="grid gap-1">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">Net uplift on frame</span>
              <span className="text-lg font-semibold">{formatNumber(results.upliftForce)} kN</span>
              <p className="text-muted-foreground">
                Positive values indicate uplift to be resisted by rafters, beams and hold-down connections.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Member and footing guidance</CardTitle>
            <CardDescription>
              Use these selections as a starting point for engineering sign-off and quoting.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-sm leading-6">
            <div className="grid gap-1">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">Primary beam</span>
              <span className="text-lg font-semibold">{results.recommendedBeam}</span>
              <p className="text-muted-foreground">
                Sized using span &amp; uplift demand envelope. Substitute with engineered steel if architectural constraints require.
              </p>
            </div>
            <div className="grid gap-1">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">Footings @ {formatNumber(inputs.postSpacing)} m centres</span>
              <span className="text-lg font-semibold">{results.recommendedFooting}</span>
              <p className="text-muted-foreground">
                Increase embedment in poor soils or coastal sands. Include minimum N12 hold-down bars each post.
              </p>
            </div>
            <div className="grid gap-1">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">Rafter spacing suggestion</span>
              <span className="text-lg font-semibold">
                {inputs.roofSystem === "insulated" ? "900mm centres" : "600mm centres"}
              </span>
              <p className="text-muted-foreground">
                Adjust to align with panel joints. Check manufacturer span tables for the selected roof sheet.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-dashed border-slate-300 bg-slate-50">
        <CardHeader>
          <CardTitle>What happens next?</CardTitle>
          <CardDescription>
            Bring these numbers to our structural engineering team. We will finalise connection details, certify drawings and lodge
            documentation with council or private certifiers.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm leading-6 text-slate-600">
          <p>
            This calculator applies AS/NZS 1170 style load combinations for patios in Queensland and Western Australia. It is for
            feasibility and quoting—final certification will reference exact site wind classifications, shielding, terrain
            category, and the nominated supplier span tables.
          </p>
          <p>
            Upload your concept sketch or 3D export to receive a stamped engineering pack including connection schedules, footing
            pier details, and a Form 15/16 as required.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
