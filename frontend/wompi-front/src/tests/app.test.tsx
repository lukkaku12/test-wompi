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
    currentStep: 1,
    baseFee: 1500,
    deliveryFee: 3500,
    transactionStatus: 'PENDING',
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
      acceptTerms: false,
      acceptPersonalAuth: false,
    },
    errors: {},
  },
  wompi: {
    acceptanceToken: 'acceptance-token',
    personalAuthToken: 'personal-token',
    acceptancePermalink: 'https://example.com/terms',
    personalAuthPermalink: 'https://example.com/personal',
    acceptanceStatus: 'succeeded',
    tokenStatus: 'succeeded',
    cardToken: 'card-token',
    errorMessage: null,
  },
  transaction: {
    transactionId: 'tx-1',
    pollStatus: 'idle',
    lastStatus: null,
    attempts: 0,
    errorMessage: null,
  },
}

const {
  fetchProductsMock,
  setSelectedProductIdMock,
  setCurrentStepMock,
  setSheetOpenMock,
  setTransactionStatusMock,
  resetCheckoutMock,
  resetFormMock,
  createCardTokenMock,
  resetWompiMock,
  pollTransactionMock,
  resetTransactionMock,
} = vi.hoisted(() => ({
  fetchProductsMock: vi.fn(() => ({ type: 'checkout/fetchProducts' })),
  setSelectedProductIdMock: vi.fn((id: string) => ({
    type: 'checkout/setSelectedProductId',
    payload: id,
  })),
  setCurrentStepMock: vi.fn((step: number) => ({
    type: 'checkout/setCurrentStep',
    payload: step,
  })),
  setSheetOpenMock: vi.fn((isOpen: boolean) => ({
    type: 'form/setSheetOpen',
    payload: isOpen,
  })),
  setTransactionStatusMock: vi.fn((status: string) => ({
    type: 'checkout/setTransactionStatus',
    payload: status,
  })),
  resetCheckoutMock: vi.fn(() => ({ type: 'checkout/resetCheckout' })),
  resetFormMock: vi.fn(() => ({ type: 'form/resetForm' })),
  createCardTokenMock: vi.fn(() => ({ type: 'wompi/createCardToken' })),
  resetWompiMock: vi.fn(() => ({ type: 'wompi/resetWompi' })),
  pollTransactionMock: vi.fn(() => ({ type: 'transaction/poll' })),
  resetTransactionMock: vi.fn(() => ({ type: 'transaction/resetTransaction' })),
}))

vi.mock('../store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: typeof mockState) => unknown) =>
    selector(mockState),
}))

vi.mock('../store/slices/checkoutSlice', () => ({
  fetchProducts: fetchProductsMock,
  setSelectedProductId: setSelectedProductIdMock,
  setCurrentStep: setCurrentStepMock,
  setTransactionStatus: setTransactionStatusMock,
  resetCheckout: resetCheckoutMock,
}))

vi.mock('../store/slices/formSlice', () => ({
  setSheetOpen: setSheetOpenMock,
  resetForm: resetFormMock,
}))

vi.mock('../store/slices/wompiSlice', () => ({
  createCardToken: createCardTokenMock,
  resetWompi: resetWompiMock,
}))

vi.mock('../store/slices/transactionSlice', () => ({
  pollTransaction: pollTransactionMock,
  resetTransaction: resetTransactionMock,
}))

describe('App', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
    fetchProductsMock.mockClear()
    setSelectedProductIdMock.mockClear()
    setCurrentStepMock.mockClear()
    setTransactionStatusMock.mockClear()
    createCardTokenMock.mockClear()
  })

  it('dispatches fetchProducts and shows loading', () => {
    mockState = {
      ...mockState,
      checkout: {
        ...mockState.checkout,
        status: 'loading',
      },
      transaction: {
        ...mockState.transaction,
        pollStatus: 'idle',
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
      ...mockState,
      checkout: {
        ...mockState.checkout,
        status: 'failed',
      },
      transaction: {
        ...mockState.transaction,
        pollStatus: 'idle',
      },
    }

    render(<App />)

    expect(screen.getByText('Unable to load products')).toBeInTheDocument()
  })

  it('renders products and handles selection', async () => {
    mockState = {
      ...mockState,
      checkout: {
        ...mockState.checkout,
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
        selectedProductId: null,
        currentStep: 1,
      },
      transaction: {
        ...mockState.transaction,
        pollStatus: 'idle',
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

  it('moves to the next step when confirming the summary', () => {
    mockState = {
      ...mockState,
      checkout: {
        ...mockState.checkout,
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
        selectedProductId: 'prod-1',
        currentStep: 3,
      },
      transaction: {
        ...mockState.transaction,
        pollStatus: 'idle',
      },
    }

    render(<App />)

    const button = screen.getByRole('button', { name: 'Confirm' })
    button.click()

    expect(createCardTokenMock).toHaveBeenCalled()
    expect(setTransactionStatusMock).toHaveBeenCalledWith('PENDING')
    expect(setCurrentStepMock).toHaveBeenCalledWith(4)
  })

  it('starts polling when the status screen is pending', () => {
    mockState = {
      ...mockState,
      checkout: {
        ...mockState.checkout,
        status: 'succeeded',
        currentStep: 4,
        transactionStatus: 'PENDING',
      },
      transaction: {
        ...mockState.transaction,
        transactionId: 'tx-1',
        pollStatus: 'idle',
      },
    }

    render(<App />)

    expect(pollTransactionMock).toHaveBeenCalledWith({ transactionId: 'tx-1' })
  })
})
