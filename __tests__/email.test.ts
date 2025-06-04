import { describe, it, expect, vi } from 'vitest'

// Mock external modules used in lib/email.ts so we can import it without dependencies
vi.mock('resend', () => ({ Resend: class {} }))
vi.mock('../lib/database', () => ({ createInquiry: vi.fn(), initializeDatabase: vi.fn() }))
vi.mock('../lib/blob-storage', () => ({ uploadScreenshot: vi.fn() }))
vi.mock('../lib/env-config', () => ({ getEnvConfig: vi.fn(() => ({ })) }))

import { validateInquiryData } from '../lib/email'

const baseValid = {
  customerName: 'John Doe',
  siteAddress: '123 Example Street, Testville',
  customerEmail: 'john@example.com',
  customerPhone: '0123456789',
  roofType: 'Gable',
  roofCladding: 'Colorbond Cladding',
  roofPitch: 15,
  length: 5000,
  width: 4000,
  height: 2500,
  hasOverhang: false,
  overhangSides: [],
  overhangSize: 0,
  roofColor: 'Blue',
  postBeamColor: 'White',
} as const

describe('validateInquiryData', () => {
  it('returns valid when all data is correct', () => {
    const result = validateInquiryData({ ...baseValid })
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('returns errors for invalid basic fields', () => {
    const invalid = {
      ...baseValid,
      customerName: 'J',
      customerEmail: 'bad',
      customerPhone: '123',
      siteAddress: 'short',
    }
    const result = validateInquiryData(invalid)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Customer name is required and must be at least 2 characters')
    expect(result.errors).toContain('Valid customer email is required')
    expect(result.errors).toContain('Phone number is required and must be at least 10 digits')
    expect(result.errors).toContain('Site address is required and must be at least 10 characters')
  })

  it('returns errors for dimension limits', () => {
    const invalid = {
      ...baseValid,
      length: 500,
      width: 25000,
      height: 6000,
    }
    const result = validateInquiryData(invalid)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Length must be between 1000mm and 20000mm')
    expect(result.errors).toContain('Width must be between 1000mm and 20000mm')
    expect(result.errors).toContain('Height must be between 1000mm and 5000mm')
  })
})
