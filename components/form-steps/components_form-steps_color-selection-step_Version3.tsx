"use client"

import type { UseFormReturn } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { COLORBOND_COLORS } from "../colorbond-colors"

interface ColorSelectionStepProps {
  form: UseFormReturn<any>
  isLandscape?: boolean
}

// Use only colors from central palette
const roofColors = [
  "Surfmist", "Shale Grey", "Basalt", "Dune", "Paperbark", "Woodland Grey", "Monument", "Ironstone", "Deep Ocean", "Manor Red", "Classic Cream", "Cottage Green", "Pale Eucalypt", "Night Sky"
].map(color => ({
  value: color,
  label: color,
  color: COLORBOND_COLORS[color]
}));

const postBeamColors = [
  "Classic Cream", "Paperbark", "Dune", "Woodland Grey", "Monument", "Cottage Green", "Surfmist", "Night Sky"
].map(color => ({
  value: color,
  label: color,
  color: COLORBOND_COLORS[color]
}));

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