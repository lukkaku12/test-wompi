import { configureStore } from '@reduxjs/toolkit'
import { describe, expect, it, vi } from 'vitest'
import wompiReducer, {
  createCardToken,
  fetchAcceptance,
} from '../store/slices/wompiSlice'
import { getAcceptance, tokenizeCard } from '../services/api/wompi'

vi.mock('../services/api/wompi', () => ({
  getAcceptance: vi.fn(),
  tokenizeCard: vi.fn(),
}))

const getAcceptanceMock = vi.mocked(getAcceptance)
const tokenizeCardMock = vi.mocked(tokenizeCard)

describe('wompiSlice', () => {
  it('returns the initial state', () => {
    const state = wompiReducer(undefined, { type: 'unknown' })
    expect(state.acceptanceStatus).toBe('idle')
    expect(state.tokenStatus).toBe('idle')
  })

  it('fetches acceptance data', async () => {
    getAcceptanceMock.mockResolvedValue({
      acceptanceToken: 'acceptance-token',
      personalAuthToken: 'personal-token',
      acceptancePermalink: 'https://example.com/terms',
      personalAuthPermalink: 'https://example.com/personal',
    })

    const store = configureStore({
      reducer: {
        wompi: wompiReducer,
      },
    })

    await store.dispatch(fetchAcceptance('pub-test'))

    const state = store.getState().wompi
    expect(state.acceptanceStatus).toBe('succeeded')
    expect(state.acceptanceToken).toBe('acceptance-token')
  })

  it('tokenizes the card', async () => {
    tokenizeCardMock.mockResolvedValue({ cardToken: 'card-token' })

    const store = configureStore({
      reducer: {
        wompi: wompiReducer,
      },
    })

    await store.dispatch(
      createCardToken({
        publicKey: 'pub-test',
        cardNumber: '4111111111111111',
        cvv: '123',
        expiry: '12/29',
        cardName: 'Jane Doe',
      }),
    )

    const state = store.getState().wompi
    expect(state.tokenStatus).toBe('succeeded')
    expect(state.cardToken).toBe('card-token')
  })
})
