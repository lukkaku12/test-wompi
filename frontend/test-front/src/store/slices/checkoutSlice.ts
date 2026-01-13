import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { getProducts, type Product } from '../../services/api/products'

// This slice stores the product list and selection.
export type CheckoutState = {
  currentStep: number
  products: Product[]
  baseFee: number
  deliveryFee: number
  transactionStatus: 'PENDING' | 'SUCCESS' | 'FAILED'
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  selectedProductId: string | null
  errorMessage: string | null
}

// Default values when the app starts.
const initialState: CheckoutState = {
  currentStep: 1,
  products: [],
  baseFee: 1500,
  deliveryFee: 3500,
  transactionStatus: 'PENDING',
  status: 'idle',
  selectedProductId: null,
  errorMessage: null,
}

// Load products from the API and store them in Redux.
export const fetchProducts = createAsyncThunk<Product[], void, { rejectValue: string }>('checkout/fetchProducts', async (_, { rejectWithValue }) => {
  try {
    return await getProducts()
  } catch (error) {
    // Turn any failure into a simple string error message.
    const errorMessage =
      error instanceof Error ? error.message : 'Unable to load products'
    return rejectWithValue(errorMessage)
  }
})

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setCurrentStep(state, action: PayloadAction<number>) {
      // Move between steps in the flow.
      state.currentStep = action.payload
    },
    setTransactionStatus(
      state,
      action: PayloadAction<'PENDING' | 'SUCCESS' | 'FAILED'>,
    ) {
      // Save the current status for the status screen.
      state.transactionStatus = action.payload
    },
    setSelectedProductId(state, action: PayloadAction<string>) {
      // Save the selected product id.
      state.selectedProductId = action.payload
    },
    resetCheckout(state) {
      // Reset checkout state to the defaults.
      state.currentStep = 1
      state.selectedProductId = null
      state.errorMessage = null
      state.transactionStatus = 'PENDING'
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading'
        state.errorMessage = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.products = action.payload
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed'
        state.errorMessage =
          action.payload ?? action.error.message ?? 'Unable to load products'
      })
  },
})

export const {
  setCurrentStep,
  setSelectedProductId,
  setTransactionStatus,
  resetCheckout,
} = checkoutSlice.actions
export default checkoutSlice.reducer
