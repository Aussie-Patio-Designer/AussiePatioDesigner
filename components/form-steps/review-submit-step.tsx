"use client"

import type { UseFormReturn } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface ReviewSubmitStepProps {
  form: UseFormReturn<any>
  isLandscape?: boolean
}

export default function ReviewSubmitStep({ form, isLandscape = false }: ReviewSubmitStepProps) {
  const formValues = form.getValues()

  return (
    <div className={`space-y-${isLandscape ? "2" : "6"}`}>
      {!isLandscape && (
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Review & Submit</h2>
          <p className="text-sm text-gray-600">Review all information before submitting</p>
        </div>
      )}

      <div className={`space-y-${isLandscape ? "2" : "4"}`}>
        <Card className={isLandscape ? "border-0 shadow-none" : ""}>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs flex items-center">
              <span className="mr-2">👤</span>
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs pt-1">
            <dl className="space-y-1">
              <div>
                <dt className="font-medium text-gray-600">Customer Name</dt>
                <dd className="text-gray-900">{formValues.customerName || "Not specified"}</dd>
              </div>
              <Separator className="my-1" />
              <div>
                <dt className="font-medium text-gray-600">Site Address</dt>
                <dd className="text-gray-900 whitespace-pre-line">{formValues.siteAddress || "Not specified"}</dd>
              </div>
              <Separator className="my-1" />
              <div>
                <dt className="font-medium text-gray-600">Customer Email</dt>
                <dd className="text-gray-900">{formValues.customerEmail || "Not specified"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className={isLandscape ? "border-0 shadow-none" : ""}>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs flex items-center">
              <span className="mr-2">⚙️</span>
              Specifications
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs pt-1">
            <dl className="space-y-1">
              <div>
                <dt className="font-medium text-gray-600">Roof Type</dt>
                <dd className="text-gray-900">{formValues.roofType}</dd>
              </div>
              <Separator className="my-1" />
              <div>
                <dt className="font-medium text-gray-600">Roof Pitch</dt>
                <dd className="text-gray-900">{formValues.roofPitch}°</dd>
              </div>
              <Separator className="my-1" />
              <div>
                <dt className="font-medium text-gray-600">Dimensions (mm)</dt>
                <dd className="text-gray-900">
                  {formValues.length} × {formValues.width} × {formValues.height} (L×W×H)
                </dd>
              </div>
              <Separator className="my-1" />
              <div>
                <dt className="font-medium text-gray-600">Roof Material</dt>
                <dd className="text-gray-900">{formValues.roofCladding}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {formValues.hasOverhang && formValues.overhangSides?.length > 0 && (
          <Card className={isLandscape ? "border-0 shadow-none" : ""}>
            <CardHeader className="pb-1">
              <CardTitle className="text-xs flex items-center">
                <span className="mr-2">🔲</span>
                Overhang Details
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs pt-1">
              <dl className="space-y-1">
                <div>
                  <dt className="font-medium text-gray-600">Overhang Sides</dt>
                  <dd className="text-gray-900">{formValues.overhangSides.join(", ")}</dd>
                </div>
                <Separator className="my-1" />
                <div>
                  <dt className="font-medium text-gray-600">Overhang Size</dt>
                  <dd className="text-gray-900">{formValues.overhangSize}mm</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        )}

        <Card className={isLandscape ? "border-0 shadow-none" : ""}>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs flex items-center">
              <span className="mr-2">🎨</span>
              Color Selection
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs pt-1">
            <dl className="space-y-1">
              <div>
                <dt className="font-medium text-gray-600">Roof Color</dt>
                <dd className="text-gray-900">{formValues.roofColor || "Not selected"}</dd>
              </div>
              <Separator className="my-1" />
              <div>
                <dt className="font-medium text-gray-600">Frame Color</dt>
                <dd className="text-gray-900">{formValues.postBeamColor || "Not selected"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
