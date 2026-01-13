import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import App from '../App'

const mockDispatch = jest.fn()
let mockState: any = {
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

jest.mock('../store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: typeof mockState) => unknown) =>
    selector(mockState),
}))

jest.mock('../store/slices/checkoutSlice', () => ({
  fetchProducts: jest.fn(),
  setSelectedProductId: jest.fn(),
  setCurrentStep: jest.fn(),
  setTransactionStatus: jest.fn(),
  resetCheckout: jest.fn(),
}))

jest.mock('../store/slices/formSlice', () => ({
  setSheetOpen: jest.fn(),
  resetForm: jest.fn(),
}))

jest.mock('../store/slices/wompiSlice', () => ({
  createCardToken: jest.fn(),
  resetWompi: jest.fn(),
}))

jest.mock('../store/slices/transactionSlice', () => ({
  pollTransaction: jest.fn(),
  createTransactionThunk: jest.fn(),
  payTransactionThunk: jest.fn(),
  recoverTransactionThunk: jest.fn(),
  resetTransaction: jest.fn(),
}))

jest.mock('../components/CheckoutFormSheet', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, onContinue }: any) =>
    isOpen ? (
      <div>
        <button type="button" onClick={onClose}>
          Close sheet
        </button>
        <button type="button" onClick={onContinue}>
          Continue sheet
        </button>
      </div>
    ) : null,
}))

const checkoutSlice = require('../store/slices/checkoutSlice')
const formSlice = require('../store/slices/formSlice')
const wompiSlice = require('../store/slices/wompiSlice')
const transactionSlice = require('../store/slices/transactionSlice')

describe('App', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
    mockDispatch.mockImplementation((action) => {
      if (action?.type === 'wompi/createCardToken') {
        return { unwrap: () => Promise.resolve({ cardToken: 'card-token' }) }
      }
      if (action?.type === 'transaction/pay') {
        return { unwrap: () => Promise.resolve({ status: 'PENDING' }) }
      }
      if (action?.type === 'transaction/poll') {
        return { unwrap: () => Promise.resolve({ status: 'PENDING' }) }
      }
      if (action?.type === 'transaction/recover') {
        return { unwrap: () => Promise.resolve({ status: 'PENDING' }) }
      }
      if (action?.type === 'transaction/create') {
        return { unwrap: () => Promise.resolve({ status: 'PENDING' }) }
      }
      return action
    })

    // reset mocks
    checkoutSlice.fetchProducts.mockClear()
    checkoutSlice.setSelectedProductId.mockClear()
    checkoutSlice.setCurrentStep.mockClear()
    checkoutSlice.setTransactionStatus.mockClear()
    checkoutSlice.resetCheckout.mockClear()

    formSlice.setSheetOpen.mockClear()
    formSlice.resetForm.mockClear()

    wompiSlice.createCardToken.mockClear()
    wompiSlice.resetWompi.mockClear()

    transactionSlice.pollTransaction.mockClear()
    transactionSlice.createTransactionThunk.mockClear()
    transactionSlice.payTransactionThunk.mockClear()
    transactionSlice.recoverTransactionThunk.mockClear()
    transactionSlice.resetTransaction.mockClear()

    // action creator implementations (so dispatch receives a predictable action)
    checkoutSlice.fetchProducts.mockImplementation(() => ({ type: 'checkout/fetchProducts' }))
    checkoutSlice.setSelectedProductId.mockImplementation((id: string) => ({
      type: 'checkout/setSelectedProductId',
      payload: id,
    }))
    checkoutSlice.setCurrentStep.mockImplementation((step: number) => ({
      type: 'checkout/setCurrentStep',
      payload: step,
    }))
    checkoutSlice.setTransactionStatus.mockImplementation((status: string) => ({
      type: 'checkout/setTransactionStatus',
      payload: status,
    }))
    checkoutSlice.resetCheckout.mockImplementation(() => ({ type: 'checkout/resetCheckout' }))

    wompiSlice.createCardToken.mockImplementation(() => ({ type: 'wompi/createCardToken' }))
    wompiSlice.resetWompi.mockImplementation(() => ({ type: 'wompi/resetWompi' }))

    transactionSlice.pollTransaction.mockImplementation((payload: any) => ({
      type: 'transaction/poll',
      payload,
    }))
    transactionSlice.createTransactionThunk.mockImplementation((payload: any) => ({
      type: 'transaction/create',
      payload,
    }))
    transactionSlice.payTransactionThunk.mockImplementation((payload: any) => ({
      type: 'transaction/pay',
      payload,
    }))
    transactionSlice.recoverTransactionThunk.mockImplementation((payload: any) => ({
      type: 'transaction/recover',
      payload,
    }))
    transactionSlice.resetTransaction.mockImplementation(() => ({
      type: 'transaction/resetTransaction',
    }))
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

    expect(checkoutSlice.fetchProducts).toHaveBeenCalled()
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
        errorMessage: 'Network down',
      },
      transaction: {
        ...mockState.transaction,
        pollStatus: 'idle',
      },
    }

    render(<App />)

    expect(screen.getByText('Network down')).toBeInTheDocument()
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

    expect(checkoutSlice.setSelectedProductId).toHaveBeenCalledWith('prod-1')
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'checkout/setSelectedProductId',
      payload: 'prod-1',
    })
  })

  it('advances to step 2 when starting checkout', () => {
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
        currentStep: 1,
      },
      transaction: {
        ...mockState.transaction,
        pollStatus: 'idle',
      },
    }

    render(<App />)

    const button = screen.getByRole('button', { name: 'Continue to details' })
    button.click()

    expect(formSlice.setSheetOpen).toHaveBeenCalledWith(true)
    expect(checkoutSlice.setCurrentStep).toHaveBeenCalledWith(2)
  })

  it('moves to the next step when confirming the summary', async () => {
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

    expect(wompiSlice.createCardToken).toHaveBeenCalled()
    await waitFor(() => {
      expect(checkoutSlice.setCurrentStep).toHaveBeenCalledWith(4)
    })
  })

  it('handles missing tokens on summary confirm', async () => {
    const previousEnv = (globalThis as any).__VITE_ENV__
    ;(globalThis as any).__VITE_ENV__ = {
      VITE_PUBLIC_KEY: '',
      VITE_API_BASE_URL: 'http://localhost:3000',
    }

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
      wompi: {
        ...mockState.wompi,
        acceptanceToken: null,
        personalAuthToken: null,
      },
      transaction: {
        ...mockState.transaction,
        pollStatus: 'idle',
      },
    }

    render(<App />)

    const button = screen.getByRole('button', { name: 'Confirm' })
    button.click()

    await waitFor(() => {
      expect(checkoutSlice.setTransactionStatus).toHaveBeenCalledWith('FAILED')
      expect(checkoutSlice.setCurrentStep).toHaveBeenCalledWith(4)
    })

    ;(globalThis as any).__VITE_ENV__ = previousEnv
  })

  it('handles missing transaction id on summary confirm', async () => {
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
        transactionId: null,
      },
    }

    render(<App />)

    const button = screen.getByRole('button', { name: 'Confirm' })
    button.click()

    await waitFor(() => {
      expect(checkoutSlice.setTransactionStatus).toHaveBeenCalledWith('FAILED')
      expect(checkoutSlice.setCurrentStep).toHaveBeenCalledWith(4)
    })
  })

  it('closes the sheet and returns to step 1', () => {
    mockState = {
      ...mockState,
      form: {
        ...mockState.form,
        isSheetOpen: true,
      },
      checkout: {
        ...mockState.checkout,
        status: 'succeeded',
        currentStep: 2,
      },
      transaction: {
        ...mockState.transaction,
        pollStatus: 'idle',
      },
    }

    render(<App />)

    const button = screen.getByRole('button', { name: 'Close sheet' })
    button.click()

    expect(formSlice.setSheetOpen).toHaveBeenCalledWith(false)
    expect(checkoutSlice.setCurrentStep).toHaveBeenCalledWith(1)
  })

  it('creates a transaction and moves to summary on continue', async () => {
    mockState = {
      ...mockState,
      form: {
        ...mockState.form,
        isSheetOpen: true,
        values: {
          ...mockState.form.values,
          fullName: 'Jane Doe',
          email: 'jane@example.com',
          phone: '3005551234',
          address: 'Street 123',
          city: 'Bogota',
        },
      },
      checkout: {
        ...mockState.checkout,
        status: 'succeeded',
        selectedProductId: 'prod-1',
        currentStep: 2,
      },
    }

    render(<App />)

    const button = screen.getByRole('button', { name: 'Continue sheet' })
    button.click()

    await waitFor(() => {
      expect(transactionSlice.createTransactionThunk).toHaveBeenCalled()
      expect(checkoutSlice.setCurrentStep).toHaveBeenCalledWith(3)
    })
  })

  it('handles create transaction errors', async () => {
    mockDispatch.mockImplementation((action) => {
      if (action?.type === 'transaction/create') {
        return { unwrap: () => Promise.reject(new Error('fail')) }
      }
      return action
    })

    mockState = {
      ...mockState,
      form: {
        ...mockState.form,
        isSheetOpen: true,
      },
      checkout: {
        ...mockState.checkout,
        status: 'succeeded',
        selectedProductId: 'prod-1',
        currentStep: 2,
      },
    }

    render(<App />)

    const button = screen.getByRole('button', { name: 'Continue sheet' })
    button.click()

    await waitFor(() => {
      expect(checkoutSlice.setTransactionStatus).toHaveBeenCalledWith('FAILED')
      expect(checkoutSlice.setCurrentStep).toHaveBeenCalledWith(4)
    })
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

    expect(transactionSlice.pollTransaction).toHaveBeenCalledWith({ transactionId: 'tx-1' })
  })

  it('handles poll errors by setting failed', async () => {
    mockDispatch.mockImplementation((action) => {
      if (action?.type === 'transaction/poll') {
        return { unwrap: () => Promise.reject(new Error('poll error')) }
      }
      return action
    })

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

    await waitFor(() => {
      expect(checkoutSlice.setTransactionStatus).toHaveBeenCalledWith('FAILED')
    })
  })

  it('recovers a transaction and handles failure', async () => {
    mockDispatch.mockImplementation((action) => {
      if (action?.type === 'transaction/recover') {
        return { unwrap: () => Promise.reject(new Error('recover error')) }
      }
      return action
    })

    mockState = {
      ...mockState,
      checkout: {
        ...mockState.checkout,
        status: 'succeeded',
      },
      transaction: {
        ...mockState.transaction,
        transactionId: 'tx-1',
      },
    }

    render(<App />)

    await waitFor(() => {
      expect(transactionSlice.resetTransaction).toHaveBeenCalled()
      expect(checkoutSlice.resetCheckout).toHaveBeenCalled()
    })
  })

  it('resets state and refetches on successful return', () => {
    mockState = {
      ...mockState,
      checkout: {
        ...mockState.checkout,
        status: 'succeeded',
        currentStep: 4,
        transactionStatus: 'SUCCESS',
      },
      transaction: {
        ...mockState.transaction,
        transactionId: 'tx-1',
      },
    }

    render(<App />)

    const button = screen.getByRole('button', { name: 'Return to products' })
    button.click()

    expect(checkoutSlice.fetchProducts).toHaveBeenCalled()
    expect(checkoutSlice.resetCheckout).toHaveBeenCalled()
    expect(formSlice.resetForm).toHaveBeenCalled()
    expect(wompiSlice.resetWompi).toHaveBeenCalled()
    expect(transactionSlice.resetTransaction).toHaveBeenCalled()
  })
})
