import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import CheckoutFormSheet from '../components/CheckoutFormSheet'
import formReducer from '../store/slices/formSlice'
import wompiReducer from '../store/slices/wompiSlice'
import type { WompiState } from '../store/slices/wompiSlice'

const renderSheet = (onClose = () => {}, onContinue = () => {}) => {
  const store = configureStore({
    reducer: {
      form: formReducer,
      wompi: wompiReducer,
    },
    preloadedState: {
      wompi: {
        acceptanceToken: 'acceptance-token',
        personalAuthToken: 'personal-token',
        acceptancePermalink: 'https://example.com/terms',
        personalAuthPermalink: 'https://example.com/personal',
        acceptanceStatus: 'succeeded',
        tokenStatus: 'idle',
        cardToken: null,
        errorMessage: null,
      } as WompiState,
    },
  })

  render(
    <Provider store={store}>
      <CheckoutFormSheet isOpen onClose={onClose} onContinue={onContinue} />
    </Provider>,
  )

  return store
}

describe('CheckoutFormSheet', () => {
  it('shows validation errors when continuing with empty fields', () => {
    renderSheet()

    fireEvent.click(screen.getByLabelText(/terms and conditions/i))
    fireEvent.click(screen.getByLabelText(/personal data policy/i))

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(screen.getAllByText('This field is required').length).toBeGreaterThan(0)
  })

  it('detects the card brand', () => {
    renderSheet()

    fireEvent.change(screen.getByLabelText('Card number'), {
      target: { value: '4111 1111 1111 1111' },
    })

    expect(screen.getByText('Detected: Visa')).toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', () => {
    const onClose = jest.fn()
    renderSheet(onClose)

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(onClose).toHaveBeenCalled()
  })

  it('calls onContinue when the form is valid', () => {
    const onContinue = jest.fn()
    renderSheet(undefined, onContinue)

    fireEvent.change(screen.getByLabelText('Name on card'), {
      target: { value: 'Jane Doe' },
    })
    fireEvent.change(screen.getByLabelText('Card number'), {
      target: { value: '4111 1111 1111 1111' },
    })
    fireEvent.change(screen.getByLabelText('Expiry'), {
      target: { value: '12/29' },
    })
    fireEvent.change(screen.getByLabelText('CVV'), {
      target: { value: '123' },
    })
    fireEvent.change(screen.getByLabelText('Full name'), {
      target: { value: 'Jane Doe' },
    })
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'jane@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Phone'), {
      target: { value: '3001234567' },
    })
    fireEvent.change(screen.getByLabelText('Address'), {
      target: { value: 'Street 123' },
    })
    fireEvent.change(screen.getByLabelText('City'), {
      target: { value: 'Bogota' },
    })
    fireEvent.click(screen.getByLabelText(/terms and conditions/i))
    fireEvent.click(screen.getByLabelText(/personal data policy/i))

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(onContinue).toHaveBeenCalled()
  })
})
