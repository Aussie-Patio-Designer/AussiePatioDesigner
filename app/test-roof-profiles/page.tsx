"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import GazeboPreview from "@/components/gazebo-preview"

export default function TestRoofProfiles() {
  const [roofCladding, setRoofCladding] = useState<"Corrugated" | "Trimclad">("Corrugated")
  const [roofType, setRoofType] = useState<"Gable" | "Skillion">("Gable")
  const [roofColor, setRoofColor] = useState("SURFMIST / BASALT")

  // Test configuration for gazebo
  const testConfig = {
    length: 6000, // 6m
    width: 4000, // 4m
    height: 2400, // 2.4m
    roofType,
    roofPitch: 15, // 15 degree pitch
    roofCladding,
    hasOverhang: false,
    overhangSides: [],
    overhangSize: 0,
    roofColor,
    postBeamColor: "MONUMENT",
  }

  const roofColors = [
    "SURFMIST / BASALT",
    "SURFMIST / CLASSIC CREAM",
    "SURFMIST / DUNE",
    "SURFMIST / MANOR RED",
    "SURFMIST / PALE EUCALYPT",
    "SURFMIST / PAPERBARK",
    "SURFMIST / SHALE GREY",
    "SURFMIST / SURFMIST",
    "SURFMIST / WOODLAND GREY",
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Roof Profile Testing</h1>
          <p className="text-gray-600">Test and compare Corrugated vs Trimclad roof cladding profiles</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Test Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Roof Cladding Profile</label>
                  <Select
                    value={roofCladding}
                    onValueChange={(value: "Corrugated" | "Trimclad") => setRoofCladding(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Corrugated">Corrugated</SelectItem>
                      <SelectItem value="Trimclad">Trimclad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Roof Type</label>
                  <Select value={roofType} onValueChange={(value: "Gable" | "Skillion") => setRoofType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Gable">Gable</SelectItem>
                      <SelectItem value="Skillion">Skillion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Roof Color</label>
                  <Select value={roofColor} onValueChange={setRoofColor}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roofColors.map((color) => (
                        <SelectItem key={color} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-2">Profile Specifications</h3>
                  {roofCladding === "Corrugated" ? (
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>• 76mm pitch (center to center)</p>
                      <p>• 17mm rib height</p>
                      <p>• Sinusoidal wave pattern</p>
                      <p>• 0.6mm sheet thickness</p>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>• 190mm rib spacing</p>
                      <p>• 29mm rib height</p>
                      <p>• Trapezoidal profile</p>
                      <p>• 127mm flat pan width</p>
                      <p>• 63mm rib top width</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-2">Test Results</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Geometry Loading</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Material Rendering</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Shadow Casting</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Profile Definition</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 3D Preview */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>3D Profile Preview</CardTitle>
                <p className="text-sm text-gray-600">
                  Current: {roofCladding} profile on {roofType} roof with {roofColor} color
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[600px] bg-gray-100 rounded-lg overflow-hidden">
                  <GazeboPreview {...testConfig} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Profile Comparison */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Profile Comparison</CardTitle>
              <p className="text-sm text-gray-600">Visual differences between Corrugated and Trimclad profiles</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Corrugated Profile</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Characteristics:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Smooth, curved wave pattern</li>
                      <li>• Traditional roofing appearance</li>
                      <li>• Excellent water shedding</li>
                      <li>• Cost-effective option</li>
                      <li>• Suitable for residential and commercial</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Technical Specs:</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Coverage: 762mm effective width</li>
                      <li>• Rib height: 17mm</li>
                      <li>• Material: 0.6mm steel</li>
                      <li>• Finish: Colorbond® steel</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Trimclad Profile</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Characteristics:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Sharp, angular trapezoidal ribs</li>
                      <li>• Modern industrial appearance</li>
                      <li>• High structural strength</li>
                      <li>• Premium aesthetic appeal</li>
                      <li>• Ideal for commercial buildings</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Technical Specs:</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Coverage: 760mm effective width</li>
                      <li>• Rib height: 29mm</li>
                      <li>• Material: 0.6mm steel</li>
                      <li>• Finish: Colorbond® steel</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Instructions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Testing Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Visual Tests</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>1. Switch between profiles</li>
                    <li>2. Check geometry rendering</li>
                    <li>3. Verify color application</li>
                    <li>4. Test shadow casting</li>
                    <li>5. Examine profile definition</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Performance Tests</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>1. Monitor frame rate</li>
                    <li>2. Check loading times</li>
                    <li>3. Test camera controls</li>
                    <li>4. Verify responsiveness</li>
                    <li>5. Check memory usage</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Accuracy Tests</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>1. Measure profile dimensions</li>
                    <li>2. Verify rib spacing</li>
                    <li>3. Check material properties</li>
                    <li>4. Test light interaction</li>
                    <li>5. Validate realistic appearance</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
