import { configureStore } from '@reduxjs/toolkit'
import transactionReducer, {
  createTransactionThunk,
  payTransactionThunk,
  pollTransaction,
  recoverTransactionThunk,
  resetTransaction,
  setTransactionId,
} from '../store/slices/transactionSlice'
import {
  createTransaction,
  getTransaction,
  payTransaction,
} from '../services/api/transactions'

jest.mock('../services/api/transactions', () => ({
  getTransaction: jest.fn(),
  createTransaction: jest.fn(),
  payTransaction: jest.fn(),
}))

const getTransactionMock = jest.mocked(getTransaction)
const createTransactionMock = jest.mocked(createTransaction)
const payTransactionMock = jest.mocked(payTransaction)

describe('transactionSlice', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('polls until success', async () => {
    getTransactionMock
      .mockResolvedValueOnce({ transactionId: 'tx-1', status: 'PENDING' })
      .mockResolvedValueOnce({ transactionId: 'tx-1', status: 'SUCCESS' })

    const store = configureStore({
      reducer: {
        transaction: transactionReducer,
      },
    })

    const promise = store.dispatch(pollTransaction({ transactionId: 'tx-1' }))

    await jest.runAllTimersAsync()

    const result = await promise
    expect(result.type).toBe('transaction/poll/fulfilled')
    expect(store.getState().transaction.lastStatus).toBe('SUCCESS')
  })

  it('handles poll rejection after max attempts', async () => {
    getTransactionMock.mockResolvedValue({
      transactionId: 'tx-1',
      status: 'PENDING',
    })

    const store = configureStore({
      reducer: {
        transaction: transactionReducer,
      },
    })

    const promise = store.dispatch(pollTransaction({ transactionId: 'tx-1' }))

    await jest.runOnlyPendingTimersAsync()

    const result = await promise
    expect(result.type).toBe('transaction/poll/rejected')
    expect(store.getState().transaction.pollStatus).toBe('failed')
  })

  it('creates a transaction', async () => {
    createTransactionMock.mockResolvedValue({
      transactionId: 'tx-1',
      status: 'PENDING',
    })

    const store = configureStore({
      reducer: {
        transaction: transactionReducer,
      },
    })

    await store.dispatch(
      createTransactionThunk({
        productId: 'prod-1',
        customer: {
          fullName: 'Jane Doe',
          email: 'jane@example.com',
          phone: '3005551234',
          address: 'Street 123',
          city: 'Bogota',
        },
      }),
    )

    const state = store.getState().transaction
    expect(state.transactionId).toBe('tx-1')
    expect(state.lastStatus).toBe('PENDING')
  })

  it('handles create transaction errors', async () => {
    createTransactionMock.mockRejectedValue(new Error('create failed'))

    const store = configureStore({
      reducer: {
        transaction: transactionReducer,
      },
    })

    await store.dispatch(
      createTransactionThunk({
        productId: 'prod-1',
        customer: {
          fullName: 'Jane Doe',
          email: 'jane@example.com',
          phone: '3005551234',
          address: 'Street 123',
          city: 'Bogota',
        },
      }),
    )

    expect(store.getState().transaction.errorMessage).toBe('create failed')
  })

  it('handles failed payment', async () => {
    payTransactionMock.mockRejectedValue(new Error('failed'))

    const store = configureStore({
      reducer: {
        transaction: transactionReducer,
      },
    })

    await store.dispatch(
      payTransactionThunk({
        transactionId: 'tx-1',
        payload: {
          cardToken: 'card-token',
          acceptanceToken: 'acc',
          acceptPersonalAuth: 'auth',
        },
      }),
    )

    expect(store.getState().transaction.errorMessage).toBe('failed')
  })

  it('handles successful payment', async () => {
    payTransactionMock.mockResolvedValue({
      transactionId: 'tx-1',
      status: 'SUCCESS',
      errorMessage: null,
    })

    const store = configureStore({
      reducer: {
        transaction: transactionReducer,
      },
    })

    await store.dispatch(
      payTransactionThunk({
        transactionId: 'tx-1',
        payload: {
          cardToken: 'card-token',
          acceptanceToken: 'acc',
          acceptPersonalAuth: 'auth',
        },
      }),
    )

    expect(store.getState().transaction.lastStatus).toBe('SUCCESS')
  })

  it('recovers a transaction', async () => {
    getTransactionMock.mockResolvedValue({
      transactionId: 'tx-2',
      status: 'SUCCESS',
      errorMessage: null,
    })

    const store = configureStore({
      reducer: {
        transaction: transactionReducer,
      },
    })

    await store.dispatch(recoverTransactionThunk({ transactionId: 'tx-2' }))

    const state = store.getState().transaction
    expect(state.transactionId).toBe('tx-2')
    expect(state.lastStatus).toBe('SUCCESS')
  })

  it('handles recover errors', async () => {
    getTransactionMock.mockRejectedValue(new Error('recover failed'))

    const store = configureStore({
      reducer: {
        transaction: transactionReducer,
      },
    })

    await store.dispatch(recoverTransactionThunk({ transactionId: 'tx-2' }))

    expect(store.getState().transaction.errorMessage).toBe('recover failed')
  })

  it('sets and resets transaction id', () => {
    const store = configureStore({
      reducer: {
        transaction: transactionReducer,
      },
    })

    store.dispatch(setTransactionId('tx-3'))
    expect(store.getState().transaction.transactionId).toBe('tx-3')

    store.dispatch(resetTransaction())
    expect(store.getState().transaction.transactionId).toBeNull()
  })
})
