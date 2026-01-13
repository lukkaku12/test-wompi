import { loadPersistedState, savePersistedState } from '../store/persist'

describe('persist', () => {
  const storageKey = 'wompi.checkout'
  const originalGetItem = localStorage.getItem
  const originalSetItem = localStorage.setItem

  afterEach(() => {
    localStorage.getItem = originalGetItem
    localStorage.setItem = originalSetItem
    localStorage.removeItem(storageKey)
  })

  it('returns undefined when nothing is stored', () => {
    localStorage.removeItem(storageKey)
    expect(loadPersistedState()).toBeUndefined()
  })

  it('parses stored state', () => {
    const stored = {
      checkout: {
        currentStep: 2,
        selectedProductId: 'prod-1',
        baseFee: 1500,
        deliveryFee: 3500,
        transactionStatus: 'PENDING',
      },
      transaction: { transactionId: 'tx-1' },
      wompi: {
        acceptanceToken: 'acc',
        personalAuthToken: 'auth',
        acceptancePermalink: 'terms',
        personalAuthPermalink: 'personal',
        acceptanceStatus: 'succeeded',
      },
    }

    localStorage.setItem(storageKey, JSON.stringify(stored))
    expect(loadPersistedState()).toEqual(stored)
  })

  it('returns undefined on invalid JSON', () => {
    localStorage.getItem = jest.fn(() => 'not-json')
    expect(loadPersistedState()).toBeUndefined()
  })

  it('saves state safely', () => {
    const state = {
      checkout: {
        currentStep: 1,
        selectedProductId: null,
        baseFee: 1500,
        deliveryFee: 3500,
        transactionStatus: 'PENDING',
      },
      transaction: { transactionId: null },
      wompi: {
        acceptanceToken: null,
        personalAuthToken: null,
        acceptancePermalink: '',
        personalAuthPermalink: '',
        acceptanceStatus: 'idle',
      },
    }

    savePersistedState(state)
    expect(localStorage.getItem(storageKey)).toBe(JSON.stringify(state))
  })

  it('ignores storage failures', () => {
    localStorage.setItem = jest.fn(() => {
      throw new Error('fail')
    })

    expect(() =>
      savePersistedState({
        checkout: {
          currentStep: 1,
          selectedProductId: null,
          baseFee: 1500,
          deliveryFee: 3500,
          transactionStatus: 'PENDING',
        },
        transaction: { transactionId: null },
        wompi: {
          acceptanceToken: null,
          personalAuthToken: null,
          acceptancePermalink: '',
          personalAuthPermalink: '',
          acceptanceStatus: 'idle',
        },
      }),
    ).not.toThrow()
  })
})
