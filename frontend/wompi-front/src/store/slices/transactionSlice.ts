import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import {
  createTransaction,
  getTransaction,
  payTransaction,
  type CreateTransactionPayload,
  type PayTransactionPayload,
  type TransactionResponse,
} from '../../services/api/transactions'

export type TransactionState = {
  transactionId: string | null
  pollStatus: 'idle' | 'polling' | 'succeeded' | 'failed'
  lastStatus: 'PENDING' | 'SUCCESS' | 'FAILED' | null
  attempts: number
  errorMessage: string | null
}

const initialState: TransactionState = {
  transactionId: null,
  pollStatus: 'idle',
  lastStatus: null,
  attempts: 0,
  errorMessage: null,
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const createTransactionThunk = createAsyncThunk<
  TransactionResponse,
  CreateTransactionPayload,
  { rejectValue: string }
>('transaction/create', async (payload, { rejectWithValue }) => {
  try {
    return await createTransaction(payload)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to create transaction'
    return rejectWithValue(message)
  }
})

export const payTransactionThunk = createAsyncThunk<
  TransactionResponse,
  { transactionId: string; payload: PayTransactionPayload },
  { rejectValue: string }
>('transaction/pay', async ({ transactionId, payload }, { rejectWithValue }) => {
  try {
    return await payTransaction(transactionId, payload)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to pay transaction'
    return rejectWithValue(message)
  }
})

export const recoverTransactionThunk = createAsyncThunk<
  TransactionResponse,
  { transactionId: string },
  { rejectValue: string }
>('transaction/recover', async ({ transactionId }, { rejectWithValue }) => {
  try {
    return await getTransaction(transactionId)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to recover transaction'
    return rejectWithValue(message)
  }
})

// Poll the backend for the transaction status (max 12 attempts).
export const pollTransaction = createAsyncThunk<
  { status: 'PENDING' | 'SUCCESS' | 'FAILED'; transactionId: string; attempts: number },
  { transactionId: string },
  { rejectValue: string }
>('transaction/poll', async ({ transactionId }, { rejectWithValue }) => {
  try {
    for (let attempt = 1; attempt <= 12; attempt += 1) {
      const data = await getTransaction(transactionId)
      const status = data?.status ?? 'PENDING'

      if (status === 'SUCCESS' || status === 'FAILED') {
        return { status, transactionId, attempts: attempt }
      }

      await sleep(2500)
    }

    return rejectWithValue('Transaction still pending')
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to check transaction'
    return rejectWithValue(message)
  }
})

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    setTransactionId(state, action: PayloadAction<string | null>) {
      // Save the current transaction id for polling.
      state.transactionId = action.payload
    },
    resetTransaction(state) {
      // Reset everything to the defaults.
      state.transactionId = null
      state.pollStatus = 'idle'
      state.lastStatus = null
      state.attempts = 0
      state.errorMessage = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTransactionThunk.fulfilled, (state, action) => {
        state.transactionId = action.payload.transactionId
        state.lastStatus = action.payload.status
        state.errorMessage = null
      })
      .addCase(createTransactionThunk.rejected, (state, action) => {
        state.errorMessage =
          action.payload ?? action.error.message ?? 'Unable to create transaction'
      })
      .addCase(payTransactionThunk.fulfilled, (state, action) => {
        state.lastStatus = action.payload.status
        state.errorMessage = action.payload.errorMessage ?? null
      })
      .addCase(payTransactionThunk.rejected, (state, action) => {
        state.errorMessage =
          action.payload ?? action.error.message ?? 'Unable to pay transaction'
      })
      .addCase(recoverTransactionThunk.fulfilled, (state, action) => {
        state.transactionId = action.payload.transactionId
        state.lastStatus = action.payload.status
        state.errorMessage = action.payload.errorMessage ?? null
      })
      .addCase(recoverTransactionThunk.rejected, (state, action) => {
        state.errorMessage =
          action.payload ?? action.error.message ?? 'Unable to recover transaction'
      })
      .addCase(pollTransaction.pending, (state) => {
        state.pollStatus = 'polling'
        state.attempts = 0
        state.errorMessage = null
      })
      .addCase(pollTransaction.fulfilled, (state, action) => {
        state.pollStatus = 'succeeded'
        state.lastStatus = action.payload.status
        state.attempts = action.payload.attempts
      })
      .addCase(pollTransaction.rejected, (state, action) => {
        state.pollStatus = 'failed'
        state.errorMessage =
          action.payload ?? action.error.message ?? 'Unable to check transaction'
      })
  },
})

export const { setTransactionId, resetTransaction } = transactionSlice.actions
export default transactionSlice.reducer
