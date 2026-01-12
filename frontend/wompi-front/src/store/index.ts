import { configureStore } from '@reduxjs/toolkit'
import checkoutReducer from './slices/checkoutSlice'
import formReducer from './slices/formSlice'
import wompiReducer from './slices/wompiSlice'
import transactionReducer from './slices/transactionSlice'
import { loadPersistedState, savePersistedState } from './persist'

// The Redux store is the main box that holds all app state.
const persistedState = loadPersistedState()

const shouldResetStep =
  !persistedState?.transaction?.transactionId &&
  persistedState?.checkout?.currentStep !== undefined

export const store = configureStore({
  reducer: {
    checkout: checkoutReducer,
    form: formReducer,
    wompi: wompiReducer,
    transaction: transactionReducer,
  },
  preloadedState: persistedState
    ? {
        checkout: {
          ...persistedState.checkout,
          products: [],
          status: 'idle',
          errorMessage: null,
          currentStep: shouldResetStep ? 1 : persistedState.checkout.currentStep,
        },
        transaction: {
          ...persistedState.transaction,
          pollStatus: 'idle',
          lastStatus: null,
          attempts: 0,
          errorMessage: null,
        },
        form: formReducer(undefined, { type: '@@INIT' }),
        wompi: {
          ...wompiReducer(undefined, { type: '@@INIT' }),
          ...persistedState.wompi,
          acceptanceStatus: persistedState.wompi.acceptanceToken
            ? 'succeeded'
            : persistedState.wompi.acceptanceStatus,
          tokenStatus: 'idle',
          cardToken: null,
          errorMessage: null,
        },
      }
    : undefined,
})

store.subscribe(() => {
  const state = store.getState()
  savePersistedState({
    checkout: {
      currentStep: state.checkout.currentStep,
      selectedProductId: state.checkout.selectedProductId,
      baseFee: state.checkout.baseFee,
      deliveryFee: state.checkout.deliveryFee,
      transactionStatus: state.checkout.transactionStatus,
    },
    transaction: {
      transactionId: state.transaction.transactionId,
    },
    wompi: {
      acceptanceToken: state.wompi.acceptanceToken,
      personalAuthToken: state.wompi.personalAuthToken,
      acceptancePermalink: state.wompi.acceptancePermalink,
      personalAuthPermalink: state.wompi.personalAuthPermalink,
      acceptanceStatus: state.wompi.acceptanceStatus,
    },
  })
})

// Helpful TypeScript types for state + dispatch.
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
