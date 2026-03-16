import type { Metadata } from "next"
import { CheckCircle2 } from "lucide-react"

import EngineeringCalculator from "@/components/engineering/engineering-calculator"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Engineering Studio",
  description:
    "Preliminary patio and gazebo engineering workspace with indicative loads, member sizing, and export-ready structural summaries.",
}

const featureCards = [
  {
    title: "Steel-first modelling",
    description:
      "Optimise RHS/SHS rafters, beams and posts with quick checks that mirror real-world patio engineering workflows.",
  },
  {
    title: "Wind + gravity assumptions",
    description:
      "Apply regional wind intent and gravity effects to estimate reactions and uplift before formal certification.",
  },
  {
    title: "Certification handover",
    description:
      "Generate a clear engineering summary to share with the certifying engineer for Form 15/16 workflows.",
  },
]

export default function EngineeringPage() {
  return (
    <main className="flex min-h-screen w-full flex-col gap-16 bg-slate-950 pb-20 text-slate-100">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_55%)]" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-16 pt-24 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <Badge className="w-fit bg-sky-500/20 text-sky-100">Engineering studio</Badge>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Structural intelligence for patio design and quoting
            </h1>
            <p className="text-lg leading-8 text-slate-200">
              Use this page to run fast preliminary engineering checks before certification. It helps align quoting, detailing and
              constructability while keeping your final certifier workflow efficient.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featureCards.map((feature) => (
              <Card key={feature.title} className="border border-slate-800 bg-slate-900/70 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-lg text-white">{feature.title}</CardTitle>
                  <CardDescription className="text-slate-300">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-800 bg-white/95 p-8 shadow-2xl backdrop-blur">
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Interactive engineering calculator</h2>
              <p className="text-base text-slate-600">
                Adjust spans and load assumptions to get indicative member sizing and reactions. Final sign-off must still come from
                your certified structural engineer.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-slate-900/90 px-4 py-3 text-slate-200 shadow-lg">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              <div className="text-sm leading-5">
                <p className="font-semibold">Preliminary guidance only</p>
                <p className="text-slate-300">Use this output to prepare briefs and accelerate formal certification.</p>
              </div>
            </div>
          </div>
          <CardContent className="p-0">
            <EngineeringCalculator />
          </CardContent>
        </div>
      </section>
    </main>
  )
}
