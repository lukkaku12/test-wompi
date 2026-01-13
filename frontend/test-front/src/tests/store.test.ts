describe('store preloaded state', () => {
  afterEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  it('resets the step when there is no transaction id', async () => {
    const loadPersistedState = jest.fn(() => ({
      checkout: {
        currentStep: 3,
        selectedProductId: 'prod-1',
        baseFee: 1500,
        deliveryFee: 3500,
        transactionStatus: 'PENDING',
      },
      transaction: { transactionId: null },
      wompi: {
        acceptanceToken: 'acc',
        personalAuthToken: 'auth',
        acceptancePermalink: 'terms',
        personalAuthPermalink: 'personal',
        acceptanceStatus: 'idle',
      },
    }))
    const savePersistedState = jest.fn()

    jest.doMock('../store/persist', () => ({
      loadPersistedState,
      savePersistedState,
    }))

    const { store } = await import('../store')

    expect(store.getState().checkout.currentStep).toBe(1)
    expect(store.getState().wompi.acceptanceStatus).toBe('succeeded')
  })

  it('persists state on dispatch', async () => {
    const loadPersistedState = jest.fn(() => undefined)
    const savePersistedState = jest.fn()

    jest.doMock('../store/persist', () => ({
      loadPersistedState,
      savePersistedState,
    }))

    const { store } = await import('../store')

    store.dispatch({ type: 'checkout/setCurrentStep', payload: 2 })

    expect(savePersistedState).toHaveBeenCalled()
  })
})
