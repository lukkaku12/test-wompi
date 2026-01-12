import { configureStore } from '@reduxjs/toolkit'
import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest'
import transactionReducer, { pollTransaction } from '../store/slices/transactionSlice'
import { client } from '../services/api/client'

vi.mock('../services/api/client', () => ({
  client: vi.fn(),
}))

const clientMock = vi.mocked(client)

describe('transactionSlice', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('polls until success', async () => {
    clientMock
      .mockResolvedValueOnce({ status: 'PENDING' })
      .mockResolvedValueOnce({ status: 'SUCCESS' })

    const store = configureStore({
      reducer: {
        transaction: transactionReducer,
      },
    })

    const promise = store.dispatch(pollTransaction({ transactionId: 'tx-1' }))

    await vi.runOnlyPendingTimersAsync()

    const result = await promise
    expect(result.type).toBe('transaction/poll/fulfilled')
    expect(store.getState().transaction.lastStatus).toBe('SUCCESS')
  })
})
