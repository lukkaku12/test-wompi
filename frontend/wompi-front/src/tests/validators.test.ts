import { describe, expect, it } from 'vitest'
import { detectCardBrand, validateForm } from '../utils/validators'
import type { FormValues } from '../store/slices/formSlice'

const baseValues: FormValues = {
  cardName: '',
  cardNumber: '',
  expiry: '',
  cvv: '',
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  notes: '',
  acceptTerms: false,
  acceptPersonalAuth: false,
}

describe('validators', () => {
  it('detects card brands', () => {
    expect(detectCardBrand('4111 1111 1111 1111')).toBe('visa')
    expect(detectCardBrand('5555 5555 5555 4444')).toBe('mastercard')
    expect(detectCardBrand('378282246310005')).toBe('amex')
    expect(detectCardBrand('123')).toBe('unknown')
  })

  it('returns errors for empty required fields', () => {
    const errors = validateForm(baseValues)
    expect(errors.cardName).toBe('This field is required')
    expect(errors.email).toBe('This field is required')
    expect(errors.city).toBe('This field is required')
  })

  it('accepts a valid payload', () => {
    const values: FormValues = {
      ...baseValues,
      cardName: 'Jane Doe',
      cardNumber: '4111111111111111',
      expiry: '12/29',
      cvv: '123',
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      phone: '3001234567',
      address: 'Street 123',
      city: 'Bogota',
      notes: 'Leave at door',
      acceptTerms: true,
      acceptPersonalAuth: true,
    }

    const errors = validateForm(values)
    expect(Object.keys(errors).length).toBe(0)
  })
})
