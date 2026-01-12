import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  clearErrors,
  clearFieldError,
  setErrors,
  setField,
} from '../store/slices/formSlice'
import { detectCardBrand, validateForm } from '../utils/validators'

type CheckoutFormSheetProps = {
  isOpen: boolean
  onClose: () => void
}

const CheckoutFormSheet = ({ isOpen, onClose }: CheckoutFormSheetProps) => {
  const dispatch = useAppDispatch()
  const { values, errors } = useAppSelector((state) => state.form)
  const brand = detectCardBrand(values.cardNumber)

  if (!isOpen) {
    return null
  }

  const handleClose = () => {
    dispatch(clearErrors())
    onClose()
  }

  const handleChange =
    (field: keyof typeof values) =>
    (event: { target: { value: string } }) => {
      dispatch(setField({ field, value: event.target.value }))

      if (errors[field]) {
        dispatch(clearFieldError(field))
      }
    }

  const handleContinue = () => {
    // Run all validations and surface the errors in the UI.
    const validationErrors = validateForm(values)
    dispatch(setErrors(validationErrors))
  }

  const brandLabel =
    brand === 'visa' ? 'Visa' : brand === 'mastercard' ? 'Mastercard' : 'Amex'

  return (
    <div className="sheet">
      <button
        className="sheet-overlay"
        type="button"
        onClick={handleClose}
        aria-label="Close form"
      />
      <div className="sheet-panel" role="dialog" aria-modal="true">
        <header className="sheet-header">
          <div>
            <p className="sheet-kicker">Step 2</p>
            <h2 className="sheet-title">Checkout details</h2>
            <p className="sheet-subtitle">
              Add your card and delivery information below.
            </p>
          </div>
          <button className="sheet-close" type="button" onClick={handleClose}>
            Close
          </button>
        </header>

        <form className="sheet-form" onSubmit={(event) => event.preventDefault()}>
          <section className="sheet-section">
            <h3 className="sheet-section-title">Card details</h3>

            <div className="field">
              <label htmlFor="cardName">Name on card</label>
              <input
                id="cardName"
                type="text"
                value={values.cardName}
                onChange={handleChange('cardName')}
              />
              {errors.cardName && (
                <p className="field-error">{errors.cardName}</p>
              )}
            </div>

            <div className="field">
              <label htmlFor="cardNumber">Card number</label>
              <input
                id="cardNumber"
                type="text"
                inputMode="numeric"
                placeholder="0000 0000 0000 0000"
                value={values.cardNumber}
                onChange={handleChange('cardNumber')}
              />
              {values.cardNumber && brand !== 'unknown' && (
                <p className="field-hint">Detected: {brandLabel}</p>
              )}
              {errors.cardNumber && (
                <p className="field-error">{errors.cardNumber}</p>
              )}
            </div>

            <div className="field field--row">
              <div>
                <label htmlFor="expiry">Expiry</label>
                <input
                  id="expiry"
                  type="text"
                  placeholder="MM/YY"
                  value={values.expiry}
                  onChange={handleChange('expiry')}
                />
                {errors.expiry && <p className="field-error">{errors.expiry}</p>}
              </div>
              <div>
                <label htmlFor="cvv">CVV</label>
                <input
                  id="cvv"
                  type="text"
                  inputMode="numeric"
                  placeholder={brand === 'amex' ? '0000' : '000'}
                  value={values.cvv}
                  onChange={handleChange('cvv')}
                />
                {errors.cvv && <p className="field-error">{errors.cvv}</p>}
              </div>
            </div>
          </section>

          <section className="sheet-section">
            <h3 className="sheet-section-title">Delivery details</h3>

            <div className="field">
              <label htmlFor="fullName">Full name</label>
              <input
                id="fullName"
                type="text"
                value={values.fullName}
                onChange={handleChange('fullName')}
              />
              {errors.fullName && (
                <p className="field-error">{errors.fullName}</p>
              )}
            </div>

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={values.email}
                onChange={handleChange('email')}
              />
              {errors.email && <p className="field-error">{errors.email}</p>}
            </div>

            <div className="field">
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                value={values.phone}
                onChange={handleChange('phone')}
              />
              {errors.phone && <p className="field-error">{errors.phone}</p>}
            </div>

            <div className="field">
              <label htmlFor="address">Address</label>
              <input
                id="address"
                type="text"
                value={values.address}
                onChange={handleChange('address')}
              />
              {errors.address && (
                <p className="field-error">{errors.address}</p>
              )}
            </div>

            <div className="field field--row">
              <div>
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  type="text"
                  value={values.city}
                  onChange={handleChange('city')}
                />
                {errors.city && <p className="field-error">{errors.city}</p>}
              </div>
              <div>
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  rows={3}
                  value={values.notes}
                  onChange={handleChange('notes')}
                />
              </div>
            </div>
          </section>

          <div className="sheet-actions">
            <button className="sheet-continue" type="button" onClick={handleContinue}>
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CheckoutFormSheet
