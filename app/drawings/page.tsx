"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import ArchitecturalDrawings from "@/components/architectural-drawings"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

function DrawingsContent() {
  const searchParams = useSearchParams()

  // Get parameters from URL or use defaults
  const length = Number(searchParams.get("length")) || 3000
  const width = Number(searchParams.get("width")) || 3000
  const height = Number(searchParams.get("height")) || 2400
  const roofType = (searchParams.get("roofType") as "Gable" | "Skillion") || "Gable"
  const roofPitch = Number(searchParams.get("roofPitch")) || 15
  const roofCladding = (searchParams.get("roofCladding") as "Corrugated" | "Trimclad") || "Corrugated"
  const roofColor = searchParams.get("roofColor") || "SURFMIST / BASALT"
  const postBeamColor = searchParams.get("postBeamColor") || "MONUMENT"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Designer
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Technical Drawings</h1>
                <p className="text-sm text-gray-600">Professional architectural drawings for your gazebo design</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white">
                🖨️ Print
              </Button>
              <Button variant="outline">📧 Email</Button>
              <Button variant="outline">💾 Download PDF</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Drawings Content */}
      <div className="py-6">
        <ArchitecturalDrawings
          length={length}
          width={width}
          height={height}
          roofType={roofType}
          roofPitch={roofPitch}
          roofCladding={roofCladding}
          hasOverhang={false}
          overhangSides={[]}
          overhangSize={0}
          roofColor={roofColor}
          postBeamColor={postBeamColor}
        />
      </div>

      {/* Design Summary */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-bold mb-4">Design Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Dimensions:</span>
              <p className="font-bold">
                {(length / 1000).toFixed(1)}m × {(width / 1000).toFixed(1)}m × {(height / 1000).toFixed(1)}m
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Roof Type:</span>
              <p className="font-bold">
                {roofType} ({roofPitch}°)
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Cladding:</span>
              <p className="font-bold">{roofCladding}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Colors:</span>
              <p className="font-bold">
                {roofColor} / {postBeamColor}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <p className="text-sm text-gray-600">
              <strong>Ready to proceed?</strong> These drawings show your exact specifications.
              <Link href="/" className="text-blue-600 hover:underline ml-1">
                Return to the designer to submit an inquiry
              </Link>{" "}
              and get a professional quote.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DrawingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading technical drawings...</p>
          </div>
        </div>
      }
    >
      <DrawingsContent />
    </Suspense>
  )
}
