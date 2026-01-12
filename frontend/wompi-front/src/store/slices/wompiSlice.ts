import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { getAcceptance, tokenizeCard } from '../../services/api/wompi'

export type WompiState = {
  acceptanceToken: string | null
  personalAuthToken: string | null
  acceptancePermalink: string
  personalAuthPermalink: string
  acceptanceStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  tokenStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  cardToken: string | null
  errorMessage: string | null
}

const initialState: WompiState = {
  acceptanceToken: null,
  personalAuthToken: null,
  acceptancePermalink: '',
  personalAuthPermalink: '',
  acceptanceStatus: 'idle',
  tokenStatus: 'idle',
  cardToken: null,
  errorMessage: null,
}

// Fetch Wompi acceptance info when the form opens.
export const fetchAcceptance = createAsyncThunk<
  {
    acceptanceToken: string
    personalAuthToken: string
    acceptancePermalink: string
    personalAuthPermalink: string
  },
  string,
  { rejectValue: string }
>('wompi/fetchAcceptance', async (publicKey, { rejectWithValue }) => {
  try {
    return await getAcceptance(publicKey)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load acceptance'
    return rejectWithValue(message)
  }
})

// Tokenize the card on confirm.
export const createCardToken = createAsyncThunk<
  { cardToken: string },
  {
    publicKey: string
    cardNumber: string
    cvv: string
    expiry: string
    cardName: string
  },
  { rejectValue: string }
>('wompi/createCardToken', async (payload, { rejectWithValue }) => {
  try {
    return await tokenizeCard(payload.publicKey, {
      cardNumber: payload.cardNumber,
      cvv: payload.cvv,
      expiry: payload.expiry,
      cardName: payload.cardName,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to tokenize card'
    return rejectWithValue(message)
  }
})

const wompiSlice = createSlice({
  name: 'wompi',
  initialState,
  reducers: {
    resetWompi(state) {
      // Reset token state for a new flow.
      state.tokenStatus = 'idle'
      state.cardToken = null
      state.errorMessage = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAcceptance.pending, (state) => {
        state.acceptanceStatus = 'loading'
        state.errorMessage = null
      })
      .addCase(fetchAcceptance.fulfilled, (state, action) => {
        state.acceptanceStatus = 'succeeded'
        state.acceptanceToken = action.payload.acceptanceToken
        state.personalAuthToken = action.payload.personalAuthToken
        state.acceptancePermalink = action.payload.acceptancePermalink
        state.personalAuthPermalink = action.payload.personalAuthPermalink
      })
      .addCase(fetchAcceptance.rejected, (state, action) => {
        state.acceptanceStatus = 'failed'
        state.errorMessage =
          action.payload ?? action.error.message ?? 'Unable to load acceptance'
      })
      .addCase(createCardToken.pending, (state) => {
        state.tokenStatus = 'loading'
        state.errorMessage = null
      })
      .addCase(createCardToken.fulfilled, (state, action) => {
        state.tokenStatus = 'succeeded'
        state.cardToken = action.payload.cardToken
      })
      .addCase(createCardToken.rejected, (state, action) => {
        state.tokenStatus = 'failed'
        state.errorMessage =
          action.payload ?? action.error.message ?? 'Unable to tokenize card'
      })
  },
})

export const { resetWompi } = wompiSlice.actions
export default wompiSlice.reducer
