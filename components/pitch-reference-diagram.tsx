"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function PitchReferenceDiagram() {
  const [pitchAngle, setPitchAngle] = useState(15)

  // Calculate complementary angle (from vertical)
  const complementaryAngle = 90 - pitchAngle

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Roof Pitch Reference</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Tabs defaultValue="15" className="w-full" onValueChange={(value) => setPitchAngle(Number(value))}>
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="10">10°</TabsTrigger>
              <TabsTrigger value="15">15°</TabsTrigger>
              <TabsTrigger value="20">20°</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="relative h-[200px] w-full border rounded-md bg-slate-50">
          {/* Ground line */}
          <div className="absolute bottom-10 left-0 w-full h-[2px] bg-gray-400"></div>

          {/* Vertical reference line */}
          <div className="absolute bottom-10 left-20 w-[2px] h-[150px] bg-gray-400"></div>

          {/* Horizontal reference line */}
          <div className="absolute bottom-10 left-20 w-[150px] h-[2px] bg-blue-500"></div>

          {/* Roof line */}
          <div
            className="absolute bottom-10 left-20 w-[150px] h-[2px] bg-red-500 origin-left"
            style={{ transform: `rotate(-${pitchAngle}deg)` }}
          ></div>

          {/* Angle labels */}
          <div className="absolute bottom-16 left-24 text-xs text-blue-600 font-medium">0° (Horizontal Reference)</div>

          <div
            className="absolute text-xs text-red-600 font-medium"
            style={{
              bottom: `${10 + Math.sin((pitchAngle * Math.PI) / 180) * 75}px`,
              left: `${20 + Math.cos((pitchAngle * Math.PI) / 180) * 75}px`,
            }}
          >
            {pitchAngle}° from horizontal
          </div>

          <div
            className="absolute text-xs text-gray-600 font-medium"
            style={{
              bottom: `${85}px`,
              left: `${15}px`,
            }}
          >
            {complementaryAngle}° from vertical
          </div>

          {/* Angle arc */}
          <svg className="absolute bottom-10 left-20" width="40" height="40" viewBox="0 0 40 40">
            <path
              d={`M 0 0 A 20 20 0 0 0 ${20 * Math.cos((pitchAngle * Math.PI) / 180)} ${-20 * Math.sin((pitchAngle * Math.PI) / 180)}`}
              fill="none"
              stroke="#ef4444"
              strokeWidth="1.5"
            />
          </svg>

          {/* Legend */}
          <div className="absolute top-2 right-2 text-xs space-y-1">
            <div className="flex items-center">
              <div className="w-3 h-[2px] bg-blue-500 mr-1"></div>
              <span>Horizontal (0°)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-[2px] bg-red-500 mr-1"></div>
              <span>Roof Pitch ({pitchAngle}°)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-[2px] bg-gray-400 mr-1"></div>
              <span>Vertical (90°)</span>
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            In Australian building codes, roof pitch is always measured from the horizontal plane (0°). A 15° pitch
            means the roof rises 15° from horizontal, which is equivalent to 75° from vertical.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
