"use client"

import type { UseFormReturn } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ColorSelectionStepProps {
  form: UseFormReturn<any>
  isLandscape?: boolean
}

// Color options - ORIGINAL CORRECT COLORS RESTORED
const roofColors = [
  { value: "SURFMIST / BASALT", label: "SURFMIST / BASALT", color: "#4b4f52" },
  { value: "SURFMIST / CLASSIC CREAM", label: "SURFMIST / CLASSIC CREAM", color: "#f9e9c2" },
  { value: "SURFMIST / DUNE", label: "SURFMIST / DUNE", color: "#a89f91" },
  { value: "SURFMIST / MANOR RED", label: "SURFMIST / MANOR RED", color: "#8B0000" },
  { value: "SURFMIST / PALE EUCALYPT", label: "SURFMIST / PALE EUCALYPT", color: "#8c9c74" },
  { value: "SURFMIST / PAPERBARK", label: "SURFMIST / PAPERBARK", color: "#d3c6a6" },
  { value: "SURFMIST / SHALE GREY", label: "SURFMIST / SHALE GREY", color: "#c1c2be" },
  { value: "SURFMIST / SURFMIST", label: "SURFMIST / SURFMIST", color: "#e4e3dc" },
  { value: "SURFMIST / WOODLAND GREY", label: "SURFMIST / WOODLAND GREY", color: "#4d4f45" },
]

const postBeamColors = [
  { value: "CLASSIC CREAM", label: "CLASSIC CREAM", color: "#f9e9c2" },
  { value: "DUNE", label: "DUNE", color: "#a89f91" },
  { value: "GALVANISED", label: "GALVANISED", color: "#B0B4B8" },
  { value: "MONUMENT", label: "MONUMENT", color: "#3A3A3A" },
  { value: "PAPERBARK", label: "PAPERBARK", color: "#d3c6a6" },
  { value: "DOVER WHITE", label: "DOVER WHITE", color: "#F8F8F4" },
  { value: "WOODLAND GREY", label: "WOODLAND GREY", color: "#4d4f45" },
]

export default function ColorSelectionStep({ form, isLandscape = false }: ColorSelectionStepProps) {
  return (
    <div className={`space-y-${isLandscape ? "3" : "6"}`}>
      {!isLandscape && (
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Color Selection</h2>
          <p className="text-sm text-gray-600">Choose colors for your gazebo</p>
        </div>
      )}

      <div className={`space-y-${isLandscape ? "2" : "4"}`}>
        <FormField
          control={form.control}
          name="roofColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium flex items-center">
                <span className="mr-2">🏠</span>
                Roof Color
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Select roof color" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roofColors.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 rounded border border-gray-300 mr-2"
                          style={{ backgroundColor: color.color }}
                        />
                        <span className="text-xs">{color.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="postBeamColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium flex items-center">
                <span className="mr-2">🏗️</span>
                Frame Color
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Select frame color" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {postBeamColors.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 rounded border border-gray-300 mr-2"
                          style={{ backgroundColor: color.color }}
                        />
                        <span className="text-xs">{color.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
