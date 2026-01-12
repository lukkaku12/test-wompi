import type { FormValues, FormErrors } from '../store/slices/formSlice'

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'unknown'

const required = (value: string) => value.trim().length > 0

export const detectCardBrand = (cardNumber: string): CardBrand => {
  const digits = cardNumber.replace(/\s+/g, '')

  if (/^4/.test(digits)) {
    return 'visa'
  }

  if (/^3[47]/.test(digits)) {
    return 'amex'
  }

  if (/^(5[1-5])/.test(digits)) {
    return 'mastercard'
  }

  const prefix = Number(digits.slice(0, 4))
  if (prefix >= 2221 && prefix <= 2720) {
    return 'mastercard'
  }

  return 'unknown'
}

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

const isExpiry = (value: string) => /^(0[1-9]|1[0-2])\/\d{2}$/.test(value)

const isCvv = (value: string, brand: CardBrand) => {
  const digitsOnly = /^\d+$/.test(value)
  if (!digitsOnly) {
    return false
  }

  if (brand === 'amex') {
    return value.length === 4
  }

  return value.length === 3
}

const isPhone = (value: string) => /^\d{7,15}$/.test(value)

const isCardNumber = (value: string) => {
  const digits = value.replace(/\s+/g, '')
  return /^\d{15,16}$/.test(digits)
}

// Runs the simple validation rules and returns all errors at once.
export const validateForm = (values: FormValues): FormErrors => {
  const errors: FormErrors = {}
  const brand = detectCardBrand(values.cardNumber)

  if (!required(values.cardName)) {
    errors.cardName = 'This field is required'
  }

  if (!required(values.cardNumber)) {
    errors.cardNumber = 'This field is required'
  } else if (!isCardNumber(values.cardNumber)) {
    errors.cardNumber = 'Enter a valid card number'
  }

  if (!required(values.expiry)) {
    errors.expiry = 'This field is required'
  } else if (!isExpiry(values.expiry)) {
    errors.expiry = 'Enter a valid expiry (MM/YY)'
  }

  if (!required(values.cvv)) {
    errors.cvv = 'This field is required'
  } else if (!isCvv(values.cvv, brand)) {
    errors.cvv =
      brand === 'amex' ? 'CVV must be 4 digits' : 'CVV must be 3 digits'
  }

  if (!required(values.fullName)) {
    errors.fullName = 'This field is required'
  }

  if (!required(values.email)) {
    errors.email = 'This field is required'
  } else if (!isEmail(values.email)) {
    errors.email = 'Enter a valid email'
  }

  if (!required(values.phone)) {
    errors.phone = 'This field is required'
  } else if (!isPhone(values.phone)) {
    errors.phone = 'Enter a valid phone number'
  }

  if (!required(values.address)) {
    errors.address = 'This field is required'
  }

  if (!required(values.city)) {
    errors.city = 'This field is required'
  }

  return errors
}
