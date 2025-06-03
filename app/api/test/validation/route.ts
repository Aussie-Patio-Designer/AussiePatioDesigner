import { type NextRequest, NextResponse } from "next/server"

// Import the validation function from email.ts
function validateInquiryData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Required fields validation
  if (!data.customerName || data.customerName.trim().length < 2) {
    errors.push("Customer name is required and must be at least 2 characters")
  }

  if (!data.customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.customerEmail)) {
    errors.push("Valid customer email is required")
  }

  if (!data.siteAddress || data.siteAddress.trim().length < 10) {
    errors.push("Site address is required and must be at least 10 characters")
  }

  // Numeric validations
  if (!data.length || data.length < 1000 || data.length > 20000) {
    errors.push("Length must be between 1000mm and 20000mm")
  }

  if (!data.width || data.width < 1000 || data.width > 20000) {
    errors.push("Width must be between 1000mm and 20000mm")
  }

  if (!data.height || data.height < 1000 || data.height > 5000) {
    errors.push("Height must be between 1000mm and 5000mm")
  }

  // Enum validations
  if (!["Gable", "Skillion"].includes(data.roofType)) {
    errors.push("Roof type must be either Gable or Skillion")
  }

  if (!["Insulated Panel", "Colorbond Cladding"].includes(data.roofCladding)) {
    errors.push("Roof cladding must be either Insulated Panel or Colorbond Cladding")
  }

  // Color validations
  if (!data.roofColor) {
    errors.push("Roof color must be selected")
  }

  if (!data.postBeamColor) {
    errors.push("Frame color must be selected")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const validation = validateInquiryData(data)

    return NextResponse.json({
      valid: validation.valid,
      errors: validation.errors,
      message: validation.valid ? "Validation passed" : "Validation failed",
    })
  } catch (error) {
    return NextResponse.json({
      valid: false,
      errors: ["Failed to parse request data"],
      message: "Error during validation test",
    })
  }
}
