"use client"

import type { UseFormReturn } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"

interface EnvironmentStepProps {
  form: UseFormReturn<any>
  isLandscape?: boolean
}

export default function EnvironmentStep({ form, isLandscape = false }: EnvironmentStepProps) {
  const environmentObjects = [
    { id: "houses", label: "Houses", description: "Add neighboring houses" },
    { id: "trees", label: "Trees", description: "Add landscape trees" },
    { id: "cars", label: "Vehicles", description: "Add parked cars" },
    { id: "fences", label: "Fences", description: "Add property boundaries" },
    { id: "gardens", label: "Garden Beds", description: "Add landscaped areas" },
    { id: "pathways", label: "Pathways", description: "Add walkways" },
  ]

  return (
    <div className={`space-y-${isLandscape ? "3" : "6"}`}>
      {!isLandscape && (
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Environment</h2>
          <p className="text-sm text-gray-600">Add realistic surroundings to your gazebo</p>
        </div>
      )}

      <div className={`space-y-${isLandscape ? "2" : "4"}`}>
        <FormField
          control={form.control}
          name="showEnvironment"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between p-2 border rounded-lg">
              <div className="space-y-0">
                <FormLabel className="text-xs font-medium">Show Environment</FormLabel>
                {!isLandscape && <FormDescription className="text-xs">Display realistic surroundings</FormDescription>}
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        {form.watch("showEnvironment") && (
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="environmentObjects"
              render={() => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">Environment Objects</FormLabel>
                  <div className="grid grid-cols-1 gap-2">
                    {environmentObjects.map((object) => (
                      <FormField
                        key={object.id}
                        control={form.control}
                        name="environmentObjects"
                        render={({ field }) => {
                          return (
                            <FormItem className="flex flex-row items-start space-x-2 space-y-0 p-2 border rounded">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(object.id) || false}
                                  onCheckedChange={(checked) => {
                                    const currentValue = field.value || []
                                    return checked
                                      ? field.onChange([...currentValue, object.id])
                                      : field.onChange(currentValue.filter((value: string) => value !== object.id))
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-0">
                                <FormLabel className="text-xs font-medium">{object.label}</FormLabel>
                                <FormDescription className="text-xs">{object.description}</FormDescription>
                              </div>
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
          </div>
        )}
      </div>
    </div>
  )
}
