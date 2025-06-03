"use client"

import { useEffect } from "react"
import type { UseFormReturn } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface GazeboSpecificationsStepProps {
  form: UseFormReturn<any>
  isLandscape?: boolean
}

export default function GazeboSpecificationsStep({ form, isLandscape = false }: GazeboSpecificationsStepProps) {
  const hasOverhang = form.watch("hasOverhang")
  const overhangSides = form.watch("overhangSides") || []
  const roofType = form.watch("roofType") || "Gable"
  const currentPitch = form.watch("roofPitch")

  const sides = [
    { id: "Front", label: "Front" },
    { id: "Back", label: "Back" },
    { id: "Left", label: "Left" },
    { id: "Right", label: "Right" },
  ]

  // Pitch options based on roof type
  const gablePitchOptions = [
    { value: 10, label: "10°" },
    { value: 15, label: "15°" },
    { value: 20, label: "20°" },
  ]

  const skillionPitchOptions = [
    { value: 2, label: "2°" },
    { value: 3.5, label: "3.5°" },
    { value: 5, label: "5°" },
  ]

  const pitchOptions = roofType === "Gable" ? gablePitchOptions : skillionPitchOptions

  // Handle pitch changes when roof type changes
  useEffect(() => {
    const defaultPitch = roofType === "Gable" ? 10 : 5

    // Validate pitch ranges based on roof type
    if (roofType === "Gable") {
      // Gable: 10-20 degrees
      if (currentPitch < 10 || currentPitch > 20) {
        form.setValue("roofPitch", 10)
      }
    } else {
      // Skillion: 2-5 degrees
      if (currentPitch < 2 || currentPitch > 5) {
        form.setValue("roofPitch", 5)
      }
    }

    // If current pitch is not in available options, set default
    if (!pitchOptions.some((option) => option.value === currentPitch)) {
      form.setValue("roofPitch", defaultPitch)
    }
  }, [roofType, currentPitch, pitchOptions, form])

  return (
    <div className={`space-y-${isLandscape ? "3" : "6"}`}>
      {!isLandscape && (
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Design Configuration</h2>
          <p className="text-sm text-gray-600">Configure your gazebo specifications</p>
        </div>
      )}

      {/* Roof Configuration */}
      <div className={`space-y-${isLandscape ? "2" : "4"}`}>
        <h3 className="font-semibold text-gray-900 flex items-center text-sm">
          <span className="mr-2">🏠</span>
          Roof Configuration
        </h3>

        <FormField
          control={form.control}
          name="roofType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium">Roof Type</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Gable" id="gable" />
                    <Label htmlFor="gable" className="text-xs">
                      Gable (Traditional peaked)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Skillion" id="skillion" />
                    <Label htmlFor="skillion" className="text-xs">
                      Skillion (Single slope)
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="roofCladding"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium">Roof Material</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Insulated Panel" id="insulated" />
                    <Label htmlFor="insulated" className="text-xs">
                      Insulated Panel
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Colorbond Cladding" id="colorbond" />
                    <Label htmlFor="colorbond" className="text-xs">
                      Colorbond Cladding
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="roofPitch"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium">Roof Pitch</FormLabel>
              <FormControl>
                <Tabs
                  value={field.value?.toString() || (roofType === "Gable" ? "15" : "3.5")}
                  className="w-full"
                  onValueChange={(value) => field.onChange(Number.parseFloat(value))}
                >
                  <TabsList className="grid grid-cols-3 w-full h-8">
                    {pitchOptions.map((option) => (
                      <TabsTrigger key={option.value} value={option.value.toString()} className="text-xs">
                        {option.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Dimensions */}
      <div className={`space-y-${isLandscape ? "2" : "4"}`}>
        <h3 className="font-semibold text-gray-900 flex items-center text-sm">
          <span className="mr-2">📏</span>
          Dimensions
        </h3>

        <div className="grid grid-cols-1 gap-2">
          <FormField
            control={form.control}
            name="length"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Length (mm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1000}
                    placeholder="3000"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="h-8 text-sm"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="width"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Width (mm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1000}
                    placeholder="3000"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="h-8 text-sm"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="height"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Eave Height (mm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1000}
                    placeholder="2400"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="h-8 text-sm"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Overhang Options */}
      <div className={`space-y-${isLandscape ? "2" : "4"}`}>
        <h3 className="font-semibold text-gray-900 flex items-center text-sm">
          <span className="mr-2">🔲</span>
          Overhang Options
        </h3>

        <FormField
          control={form.control}
          name="hasOverhang"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between p-2 border rounded-lg">
              <div className="space-y-0">
                <FormLabel className="text-xs font-medium">Add Overhang</FormLabel>
                {!isLandscape && <FormDescription className="text-xs">Extend roof coverage</FormDescription>}
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        {hasOverhang && (
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="overhangSides"
              render={() => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">Overhang Sides</FormLabel>
                  <div className="grid grid-cols-2 gap-1">
                    {sides.map((side) => (
                      <FormField
                        key={side.id}
                        control={form.control}
                        name="overhangSides"
                        render={({ field }) => {
                          return (
                            <FormItem key={side.id} className="flex flex-row items-start space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(side.id) || false}
                                  onCheckedChange={(checked) => {
                                    const currentValue = field.value || []
                                    return checked
                                      ? field.onChange([...currentValue, side.id])
                                      : field.onChange(currentValue.filter((value: string) => value !== side.id))
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-xs font-normal">{side.label}</FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {overhangSides.length > 0 && (
              <FormField
                control={form.control}
                name="overhangSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium">Size: {field.value}mm</FormLabel>
                    <FormControl>
                      <Slider
                        min={0}
                        max={600}
                        step={10}
                        defaultValue={[field.value || 300]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                        className="py-1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
