import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { describe, expect, it, vi } from 'vitest'
import CheckoutFormSheet from '../components/CheckoutFormSheet'
import formReducer from '../store/slices/formSlice'

const renderSheet = (onClose = () => {}) => {
  const store = configureStore({
    reducer: {
      form: formReducer,
    },
  })

  render(
    <Provider store={store}>
      <CheckoutFormSheet isOpen onClose={onClose} />
    </Provider>,
  )

  return store
}

describe('CheckoutFormSheet', () => {
  it('shows validation errors when continuing with empty fields', () => {
    renderSheet()

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
    const onClose = vi.fn()
    renderSheet(onClose)

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(onClose).toHaveBeenCalled()
  })
})
