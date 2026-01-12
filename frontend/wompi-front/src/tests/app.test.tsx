import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import App from '../App'

const mockDispatch = vi.fn()
let mockState = {
  checkout: {
    products: [],
    status: 'idle',
    errorMessage: null as string | null,
    selectedProductId: null as string | null,
  },
  form: {
    isSheetOpen: false,
    values: {
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
    },
    errors: {},
  },
}

const { fetchProductsMock, setSelectedProductIdMock } = vi.hoisted(() => ({
  fetchProductsMock: vi.fn(() => ({ type: 'checkout/fetchProducts' })),
  setSelectedProductIdMock: vi.fn((id: string) => ({
    type: 'checkout/setSelectedProductId',
    payload: id,
  })),
}))

vi.mock('../store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: typeof mockState) => unknown) =>
    selector(mockState),
}))

vi.mock('../store/slices/checkoutSlice', () => ({
  fetchProducts: fetchProductsMock,
  setSelectedProductId: setSelectedProductIdMock,
}))

describe('App', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
    fetchProductsMock.mockClear()
    setSelectedProductIdMock.mockClear()
  })

  it('dispatches fetchProducts and shows loading', () => {
    mockState = {
      checkout: {
        products: [],
        status: 'loading',
        errorMessage: null,
        selectedProductId: null,
      },
      form: {
        isSheetOpen: false,
        values: {
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
        },
        errors: {},
      },
    }

    render(<App />)

    expect(fetchProductsMock).toHaveBeenCalled()
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'checkout/fetchProducts',
    })
    expect(screen.getByText('Loading products...')).toBeInTheDocument()
  })

  it('shows an error message when the fetch fails', () => {
    mockState = {
      checkout: {
        products: [],
        status: 'failed',
        errorMessage: null,
        selectedProductId: null,
      },
      form: {
        isSheetOpen: false,
        values: {
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
        },
        errors: {},
      },
    }

    render(<App />)

    expect(
      screen.getByText('Unable to load products'),
    ).toBeInTheDocument()
  })

  it('renders products and handles selection', async () => {
    mockState = {
      checkout: {
        products: [
          {
            id: 'prod-1',
            name: 'Pour Over Kit',
            description: 'A simple kit for home brewing.',
            price: 56000,
            availableUnits: 4,
          },
        ],
        status: 'succeeded',
        errorMessage: null,
        selectedProductId: null,
      },
      form: {
        isSheetOpen: false,
        values: {
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
        },
        errors: {},
      },
    }

    render(<App />)

    expect(screen.getByText('Pour Over Kit')).toBeInTheDocument()

    const button = screen.getByRole('button', { name: 'Select product' })
    button.click()

    expect(setSelectedProductIdMock).toHaveBeenCalledWith('prod-1')
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'checkout/setSelectedProductId',
      payload: 'prod-1',
    })
  })
})
