import type { Metadata } from "next"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Atom,
  BadgeCheck,
  Box,
  Cpu,
  FileText,
  Layers,
  Network,
  ShieldCheck,
  Sparkles,
  Triangle,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Engineering Studio",
  description:
    "Space Gass–style patio and gazebo structural analysis platform: model in 3D, run FEM in WASM, verify to AU/NZ standards, and export full engineering packs.",
}

const valuePillars = [
  {
    title: "Model",
    subtitle: "3D spatial modeller",
    description:
      "Parametric patio footprints, snap-to-grid nodes, automatic rafters and roof mesh generation keep concepts editable and accurate from the first sketch.",
    icon: Box,
  },
  {
    title: "Analyse",
    subtitle: "Matrix-stiffness core",
    description:
      "A Rust FEM engine compiled to WebAssembly solves up to 5,000 DOF with optional P-Δ, sparse factorisation and real-time stability diagnostics.",
    icon: Atom,
  },
  {
    title: "Design",
    subtitle: "AU/NZ code checks",
    description:
      "AS 4100 and AS/NZS 4600 modules evaluate combined actions, deflection envelopes, footing pressures and connection reactions with colour-coded utilisation.",
    icon: ShieldCheck,
  },
  {
    title: "Deliver",
    subtitle: "Reports & exports",
    description:
      "Generate branded PDF packs, CSV take-offs and DXF wireframes complete with disclaimers, schedules and critical check snapshots.",
    icon: FileText,
  },
]

const architectureLayers = [
  {
    label: "Frontend",
    title: "Vite + React experience layer",
    description:
      "Zustand drives the single-page tri-pane layout while Three.js renders the orbit/pan viewport, load overlays and deflection animations.",
    callouts: ["Tailwind CSS theming", "Dark/light & accessibility", "React Hook Form + Zod validation"],
    icon: Layers,
  },
  {
    label: "Solver",
    title: "Rust FEM compiled to WASM",
    description:
      "Deterministic stiffness assembly, sparse LDLᵀ, mass-based self weight, modal-friendly architecture and optional geometric stiffness iteration.",
    callouts: ["Web Worker isolation", "5,000 DOF target", "Golden-file regression tests"],
    icon: Cpu,
  },
  {
    label: "Persistence",
    title: "Offline-first data core",
    description:
      "IndexedDB autosave with schema migrations keeps every edit safe. Import/export JSON lets engineers collaborate without servers.",
    callouts: ["Versioned Project schema", "Crash recovery prompts", "Encryption-ready API contracts"],
    icon: Network,
  },
]

const moduleHighlights = [
  {
    id: "modelling",
    title: "3D Structural Modelling",
    summary: "Rapidly sculpt patios, gazebos and pergolas with precision tools.",
    bullets: [
      "Footprints ranging from rectangles to multi-bay polygons and complex roof profiles.",
      "Member library covering SHS/RHS/CHS posts, UB beams, C/Z purlins with editable section properties.",
      "Supports with fixed, pinned, semi-rigid and spring definitions plus eccentricities and rigid links.",
      "Auto-mitred connections, grouping, keyboard shortcuts and context-aware inspectors for frictionless editing.",
    ],
  },
  {
    id: "loads",
    title: "Loads & Combinations",
    summary: "Map every action with clarity and control.",
    bullets: [
      "Dead, live and directional wind load cases with graphical assignment of nodal, line and area loads.",
      "Terrain, region and height-driven wind pressure helper producing editable coefficients for power users.",
      "Self-weight toggles, load pattern visual overlays and AS/NZS 1170 combination editor with serviceability + ultimate envelopes.",
    ],
  },
  {
    id: "analysis",
    title: "Analysis & Solver",
    summary: "Space Gass–style results instantly in the browser.",
    bullets: [
      "True 6 DOF frame analysis with stiffness assembly, load mapping to roof meshes and rapid re-solves on edit.",
      "Optional P-Δ effects, mechanism detection, instability diagnostics and utilisation heatmaps in the viewport.",
      "Result tables for reactions, axial/shear/moment envelopes, deflections and member criticalities.",
    ],
  },
  {
    id: "design",
    title: "Design Checks",
    summary: "Confidence in hot and cold-formed steel members.",
    bullets: [
      "AS 4100 combined action checks with lateral torsional buckling, serviceability and fatigue placeholders.",
      "AS/NZS 4600 effective width, local/distortional buckling and bearing verification for C/Z sections.",
      "Footing sizing and bearing checks (AS 3600 / AS 2870 simplified) plus base plate and hold-down concept design.",
    ],
  },
  {
    id: "ux",
    title: "Interface & Collaboration",
    summary: "Polished workflows for every designer.",
    bullets: [
      "Tri-pane layout with resizable panels, keyboard shortcuts, undo/redo and contextual tutorials.",
      "Dark/light themes, colour-blind safe palettes, ARIA-labelled controls and responsive touch interactions.",
      "Autosave with recover prompts, sample project gallery and onboarding flows for rapid adoption.",
    ],
  },
  {
    id: "reporting",
    title: "Reporting & Export",
    summary: "Shareable outputs straight from the browser.",
    bullets: [
      "PDF pack generator featuring summary, geometry snapshots, member schedules and utilisation breakdowns.",
      "CSV bill of materials with cut lengths, coatings and IDs plus DXF/DWG-lite geometry export.",
      "Embedded disclaimers, revision history and optional encrypted API hooks for cloud sync.",
    ],
  },
]

const workflow = [
  {
    phase: "01",
    title: "Capture project brief",
    detail:
      "Start from a template or import JSON. Define site metadata, roof form, spans, and regional wind classification. Autosave engages immediately.",
  },
  {
    phase: "02",
    title: "Model + load in 3D",
    detail:
      "Snap nodes, stretch bays and auto-populate rafters and purlins. Assign gravity, live and wind actions through graphical tools with instant load previews.",
  },
  {
    phase: "03",
    title: "Run solver & design checks",
    detail:
      "Web Worker triggers the WASM FEM core. Results flow back to tables, heatmaps and utilisation gauges with optional code check explanations.",
  },
  {
    phase: "04",
    title: "Review & export",
    detail:
      "Filter failures, iterate member sizes, then produce PDF/CSV/DXF exports complete with disclaimers ready for engineer sign-off.",
  },
]

const dataModelSnippet = `type Node = {
  id: string
  x: number
  y: number
  z: number
  restraints: { ux: boolean; uy: boolean; uz: boolean; rx: boolean; ry: boolean; rz: boolean }
  spring?: { kx?: number; ky?: number; kz?: number; krx?: number; kry?: number; krz?: number }
}

type Member = {
  id: string
  iNodeId: string
  jNodeId: string
  sectionId: string
  materialId: string
  releases?: { i?: { mx?: boolean; my?: boolean; mz?: boolean }; j?: { mx?: boolean; my?: boolean; mz?: boolean } }
  eccentricity?: { i?: { ex?: number; ey?: number; ez?: number }; j?: { ex?: number; ey?: number; ez?: number } }
}

type Section = {
  id: string
  shape: "RHS" | "SHS" | "UB" | "Z" | "C" | "CHS"
  dims: Record<string, number>
  properties: { A: number; Ix: number; Iy: number; J: number; Zx: number; Zy: number; rx: number; ry: number }
}

type Material = {
  id: string
  name: string
  type: "steel" | "aluminium" | "timber"
  E: number
  G: number
  density: number
  Fy: number
  Fu?: number
}

type LoadCase = {
  id: string
  name: string
  type: "G" | "Q" | "W"
  direction?: "N" | "S" | "E" | "W"
}

type Combination = {
  id: string
  name: string
  factors: Array<{ caseId: string; gamma: number }>
}

type Result = {
  nodalDisplacements: Record<string, number[]>
  memberEndForces: Record<string, number[]>
  envelopes?: Record<string, number[]>
  reactions?: Record<string, number[]>
  utilisation?: Record<string, number>
}

type Project = {
  meta: Record<string, any>
  nodes: Node[]
  members: Member[]
  sections: Section[]
  materials: Material[]
  loadCases: LoadCase[]
  loads: any[]
  combinations: Combination[]
  results?: Result
  settings?: Record<string, any>
}`

export default function EngineeringPage() {
  return (
    <main className="flex min-h-screen w-full flex-col gap-20 bg-slate-950 pb-24 text-slate-100">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.25),_transparent_60%)]" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-24 pt-24 sm:px-6 lg:px-8">
          <Badge className="w-fit bg-sky-500/20 text-sky-100">Space Gass–style patio engineering</Badge>
          <div className="grid gap-10 lg:grid-cols-[3fr,2fr] lg:items-end">
            <div className="space-y-6">
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Build, analyse and certify complex outdoor structures entirely in the browser.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-200">
                The Engineering Studio merges intuitive modelling with a deterministic WebAssembly solver and Australian design
                codes. Model pergolas, patios and gazebos, run finite element analysis, evaluate compliance and deliver reports
                without leaving your tab.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-500/40 px-4 py-1">
                  <Sparkles className="h-4 w-4 text-sky-300" /> WASM FEM core
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-500/40 px-4 py-1">
                  <BadgeCheck className="h-4 w-4 text-sky-300" /> AS 4100 / AS/NZS 4600
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-500/40 px-4 py-1">
                  <Triangle className="h-4 w-4 text-sky-300" /> Wind helpers to AS/NZS 1170
                </span>
              </div>
            </div>
            <Card className="border border-slate-800 bg-slate-900/60 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-slate-100">Promise to engineers</CardTitle>
                <CardDescription className="text-slate-400">
                  Deliver production-ready patio designs with clarity, audit trails and uncompromised performance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li>• Deterministic solver with golden-file regression testing.</li>
                  <li>• Comprehensive audit logs and autosave for recoverable workflows.</li>
                  <li>• Clear disclaimers: preliminary guidance only until Form 15/16 sign-off.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {valuePillars.map((pillar) => (
            <Card key={pillar.title} className="border border-slate-800 bg-slate-900/70">
              <CardHeader className="flex h-full flex-col gap-3">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs uppercase tracking-[0.2em]">{pillar.subtitle}</span>
                  <pillar.icon className="h-5 w-5 text-sky-300" />
                </div>
                <CardTitle className="text-xl text-white">{pillar.title}</CardTitle>
                <CardDescription className="text-sm text-slate-300">{pillar.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="Frontend" className="w-full">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <Badge className="w-fit bg-slate-800 text-slate-200">Architecture</Badge>
              <h2 className="text-3xl font-semibold text-white">Layered stack for responsive performance</h2>
              <p className="max-w-2xl text-base text-slate-300">
                A modular monorepo keeps the user interface, solver core, wind helpers and report generator isolated yet coordinated.
                Swap modules, extend standards and integrate cloud sync without disrupting the deterministic core.
              </p>
            </div>
            <TabsList className="bg-slate-900/70">
              {architectureLayers.map((layer) => (
                <TabsTrigger key={layer.label} value={layer.label} className="data-[state=active]:bg-sky-500/20">
                  {layer.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {architectureLayers.map((layer) => (
            <TabsContent
              key={layer.label}
              value={layer.label}
              className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/40 px-3 py-1 text-xs uppercase tracking-[0.2em] text-sky-200">
                    <layer.icon className="h-4 w-4" /> {layer.label}
                  </div>
                  <h3 className="text-2xl font-semibold text-white">{layer.title}</h3>
                  <p className="max-w-2xl text-sm leading-7 text-slate-300">{layer.description}</p>
                </div>
                <div className="grid gap-3 text-sm text-slate-200">
                  {layer.callouts.map((callout) => (
                    <span
                      key={callout}
                      className="inline-flex items-center justify-between rounded-lg border border-sky-500/30 bg-slate-900 px-4 py-2"
                    >
                      {callout}
                    </span>
                  ))}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>

      <section className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 space-y-4">
          <Badge className="w-fit bg-slate-800 text-slate-200">Modules</Badge>
          <h2 className="text-3xl font-semibold text-white">Everything you need for compliant patio engineering</h2>
          <p className="max-w-2xl text-base text-slate-300">
            Each module is designed for extension—swap material libraries, tune load combinations or add new design standards while
            keeping validations and solver contracts intact.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {moduleHighlights.map((module) => (
            <Card key={module.id} className="h-full border border-slate-800 bg-slate-900/70">
              <CardHeader className="space-y-2">
                <CardTitle className="text-2xl text-white">{module.title}</CardTitle>
                <CardDescription className="text-sm text-slate-300">{module.summary}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-300">
                  {module.bullets.map((bullet) => (
                    <li key={bullet}>• {bullet}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
          <Card className="h-full border border-slate-800 bg-slate-900/70">
            <CardHeader>
              <Badge className="w-fit bg-slate-800 text-slate-200">Workflow</Badge>
              <CardTitle className="text-2xl text-white">A guided engineering pipeline</CardTitle>
              <CardDescription className="text-sm text-slate-300">
                From intake to export, each stage keeps the engineer informed with context-sensitive helpers, validation and undo/redo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {workflow.map((step) => (
                <div key={step.phase} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-sky-300">Phase {step.phase}</span>
                    <Separator className="w-10 bg-slate-700" />
                  </div>
                  <h4 className="mt-2 text-lg font-semibold text-white">{step.title}</h4>
                  <p className="text-sm text-slate-300">{step.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border border-slate-800 bg-slate-900/70">
            <CardHeader>
              <Badge className="w-fit bg-slate-800 text-slate-200">Data contracts</Badge>
              <CardTitle className="text-2xl text-white">Strong typing for collaboration</CardTitle>
              <CardDescription className="text-sm text-slate-300">
                Typescript-first models ensure compatibility between autosave, WASM bindings, design checks and reporting pipelines.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <pre className="text-xs leading-relaxed text-slate-200">
                  <code>{dataModelSnippet}</code>
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8">
          <div className="grid gap-8 lg:grid-cols-[2fr,1fr] lg:items-center">
            <div className="space-y-4">
              <Badge className="w-fit bg-slate-800 text-slate-200">Disclaimers & Safety</Badge>
              <h2 className="text-3xl font-semibold text-white">Designed for transparency and compliance</h2>
              <p className="text-base text-slate-300">
                All outputs are clearly marked as preliminary. Engineers retain full control over material selections, load combinations and
                manual overrides before certification. Autosave, crash recovery and audit logs safeguard professional responsibility.
              </p>
            </div>
            <Card className="border border-slate-800 bg-slate-950/80">
              <CardHeader>
                <CardTitle className="text-lg text-white">Ready to explore?</CardTitle>
                <CardDescription className="text-sm text-slate-300">
                  Load a sample patio, experiment with load cases and experience Space Gass–grade feedback entirely in the browser.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="sample-projects">
                    <AccordionTrigger className="text-sm text-slate-200">Sample projects included</AccordionTrigger>
                    <AccordionContent className="text-sm text-slate-300">
                      • 3×3 m flat-roof patio with four posts.
                      <br />• 6×4 m gable gazebo featuring SHS posts, RHS beams and C-purlins.
                      <br />• Editable templates for butterfly, skillion and multi-bay structures.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="support">
                    <AccordionTrigger className="text-sm text-slate-200">Support for your workflows</AccordionTrigger>
                    <AccordionContent className="text-sm text-slate-300">
                      Contextual tooltips, onboarding tutorials and embedded knowledge base articles streamline the transition from
                      legacy desktop tools.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  )
}
