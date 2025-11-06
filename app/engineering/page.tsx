import type { Metadata } from "next"

import EngineeringCalculator from "@/components/engineering/engineering-calculator"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, DraftingCompass, GaugeCircle, ShieldCheck } from "lucide-react"

export const metadata: Metadata = {
  title: "Engineering",
  description:
    "SpaceGass-style steel patio analysis. Size rafters, beams and columns with wind, live load and hold-down checks before certification.",
}

const features = [
  {
    title: "Steel-first modelling",
    description:
      "Optimise RHS and SHS members with automatic section modulus checks, deflection ratios and axial utilisation.",
    icon: GaugeCircle,
  },
  {
    title: "Wind + gravity combos",
    description:
      "Applies AS/NZS 1170 terrain and importance multipliers to generate ultimate and service load envelopes.",
    icon: DraftingCompass,
  },
  {
    title: "SpaceGass-aligned outputs",
    description:
      "Mirror the load cases and reporting style our engineers use when building the final finite element model.",
    icon: Building2,
  },
  {
    title: "Certification ready",
    description:
      "Deliver a member schedule, base plate concept and hold-down strategy that feeds directly into Form 15/16 deliverables.",
    icon: ShieldCheck,
  },
]

export default function EngineeringPage() {
  return (
    <main className="flex min-h-screen w-full flex-col gap-16 bg-slate-950 pb-20 text-slate-100">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_55%)]" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-16 pt-24 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <span className="inline-flex items-center rounded-full bg-sky-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
              Engineering studio
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Steel structural intelligence for every patio brief
            </h1>
            <p className="text-lg leading-8 text-slate-200">
              Feed in geometry, wind classification and live load intent to obtain indicative
              RHS/SHS member sizes, capacity ratios and hold-down reactions. The workflow mirrors
              our in-house SpaceGass models so you can bridge concept design and certification effortlessly.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="border border-slate-800 bg-slate-900/70 backdrop-blur">
                <CardHeader className="flex flex-row items-start gap-4">
                  <div className="rounded-full bg-sky-500/10 p-2 text-sky-300">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-lg text-white">{feature.title}</CardTitle>
                    <CardDescription className="text-slate-300">{feature.description}</CardDescription>
                  </div>
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
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                Interactive steel engineering console
              </h2>
              <p className="text-base text-slate-600">
                Adjust spans, bay spacing and environmental loads to size RHS/SHS rafters, beams and
                columns instantly. Export the suggested schedule to accelerate certification turnaround.
              </p>
            </div>
          </div>
          <EngineeringCalculator />
        </div>
      </section>
    </main>
  )
}
