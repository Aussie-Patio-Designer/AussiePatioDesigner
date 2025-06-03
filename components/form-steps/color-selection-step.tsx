"use client"

import type { UseFormReturn } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { roofColors, frameColors } from "@/lib/colorbond-colors"

interface ColorSelectionStepProps {
  form: UseFormReturn<any>
  isLandscape?: boolean
}

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
                  {frameColors.map((color) => (
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
