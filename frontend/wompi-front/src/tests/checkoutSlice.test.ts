import { configureStore } from '@reduxjs/toolkit'
import checkoutReducer, {
  fetchProducts,
  setCurrentStep,
  setSelectedProductId,
} from '../store/slices/checkoutSlice'
import { getProducts, type Product } from '../services/api/products'

jest.mock('../services/api/products', () => ({
  getProducts: jest.fn(),
}))

const getProductsMock = jest.mocked(getProducts)

describe('checkoutSlice', () => {
  it('returns the initial state', () => {
    const state = checkoutReducer(undefined, { type: 'unknown' })
    expect(state.currentStep).toBe(1)
    expect(state.products).toEqual([])
    expect(state.baseFee).toBeGreaterThan(0)
    expect(state.deliveryFee).toBeGreaterThan(0)
    expect(state.transactionStatus).toBe('PENDING')
    expect(state.status).toBe('idle')
    expect(state.selectedProductId).toBeNull()
    expect(state.errorMessage).toBeNull()
  })

  it('sets the selected product id', () => {
    const state = checkoutReducer(undefined, setSelectedProductId('prod-1'))
    expect(state.selectedProductId).toBe('prod-1')
  })

  it('moves to another step', () => {
    const state = checkoutReducer(undefined, setCurrentStep(3))
    expect(state.currentStep).toBe(3)
  })

  it('fetchProducts thunk populates products', async () => {
    const products: Product[] = [
      {
        id: 'prod-1',
        name: 'Tasting Box',
        description: 'A curated set of single origin beans.',
        price: 38000,
        availableUnits: 6,
      },
    ]

    getProductsMock.mockResolvedValue(products)

    const store = configureStore({
      reducer: {
        checkout: checkoutReducer,
      },
    })

    await store.dispatch(fetchProducts())

    const state = store.getState().checkout
    expect(state.status).toBe('succeeded')
    expect(state.products).toEqual(products)
  })

  it('fetchProducts thunk handles failures', async () => {
    getProductsMock.mockRejectedValue(new Error('Network down'))

    const store = configureStore({
      reducer: {
        checkout: checkoutReducer,
      },
    })

    await store.dispatch(fetchProducts())

    const state = store.getState().checkout
    expect(state.status).toBe('failed')
    expect(state.errorMessage).toBe('Network down')
  })

  it('uses a fallback error message when needed', () => {
    const state = checkoutReducer(undefined, {
      type: fetchProducts.rejected.type,
      payload: undefined,
      error: { message: 'Unexpected failure' },
    })

    expect(state.status).toBe('failed')
    expect(state.errorMessage).toBe('Unexpected failure')
  })
})
