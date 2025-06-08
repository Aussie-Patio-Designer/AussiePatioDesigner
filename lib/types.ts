export interface CustomerDetails {
  name: string
  email: string
  phone: string
  address: string
  notes?: string
}

export interface GazeboSpecs {
  width: number
  length: number
  height: number
  roofPitch: number
}

export interface ColorSelection {
  roofColor: string
  frameColor: string
}

export interface Environment {
  groundType: string
  skyType: string
}

export interface FormData {
  customerDetails: CustomerDetails
  gazeboSpecs: GazeboSpecs
  colorSelection: ColorSelection
  environment: Environment
  screenshotUrl?: string
}

export interface Agent {
  id: number
  company_name: string
  contact_name: string
  email: string
  phone?: string
  website?: string
  logo_url?: string
  url_slug: string
  status: "active" | "inactive" | "suspended"
  is_premium: boolean
  created_at: string
  updated_at: string
}

export interface Inquiry {
  id: number
  customer_name: string
  customer_email: string
  customer_phone?: string
  customer_address?: string
  gazebo_width: number
  gazebo_length: number
  gazebo_height: number
  roof_pitch: number
  roof_color: string
  frame_color: string
  ground_type: string
  sky_type: string
  screenshot_url?: string
  agent_email?: string
  agent_company?: string
  source_url?: string
  status: "new" | "contacted" | "quoted" | "completed" | "cancelled"
  created_at: string
  updated_at: string
}
