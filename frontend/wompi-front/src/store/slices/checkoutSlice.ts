import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { getProducts, type Product } from '../../services/api/products'

// This slice stores the product list and selection.
export type CheckoutState = {
  currentStep: number
  products: Product[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  selectedProductId: string | null
  errorMessage: string | null
}

// Default values when the app starts.
const initialState: CheckoutState = {
  currentStep: 1,
  products: [],
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
    setSelectedProductId(state, action: PayloadAction<string>) {
      // Save the selected product id.
      state.selectedProductId = action.payload
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

export const { setSelectedProductId } = checkoutSlice.actions
export default checkoutSlice.reducer
