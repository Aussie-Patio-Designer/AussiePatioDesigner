"use client"

import type { UseFormReturn } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface CustomerDetailsStepProps {
  form: UseFormReturn<any>
  isLandscape?: boolean
}

export default function CustomerDetailsStep({ form, isLandscape = false }: CustomerDetailsStepProps) {
  return (
    <div className={`space-y-${isLandscape ? "3" : "6"}`}>
      {!isLandscape && (
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Customer Details</h2>
          <p className="text-sm text-gray-600">Enter customer information</p>
        </div>
      )}

      <div className={`space-y-${isLandscape ? "2" : "4"}`}>
        <FormField
          control={form.control}
          name="customerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium flex items-center">
                <span className="mr-2">👤</span>
                Customer Name <span className="text-red-500 ml-1">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter customer's full name"
                  {...field}
                  value={field.value || ""}
                  className="h-8 text-sm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="siteAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium flex items-center">
                <span className="mr-2">📍</span>
                Site Address <span className="text-red-500 ml-1">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter installation address..."
                  className={`${isLandscape ? "min-h-[60px]" : "min-h-[80px]"} text-sm`}
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              {!isLandscape && (
                <FormDescription className="text-xs">Include street, suburb, state, and postcode</FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="customerEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium flex items-center">
                <span className="mr-2">📧</span>
                Customer Email <span className="text-red-500 ml-1">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter customer's email address"
                  {...field}
                  value={field.value || ""}
                  className="h-8 text-sm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
