import type { CheckoutState } from './slices/checkoutSlice'
import type { TransactionState } from './slices/transactionSlice'
import type { WompiState } from './slices/wompiSlice'

const STORAGE_KEY = 'wompi.checkout'

export type PersistedState = {
  checkout: Pick<
    CheckoutState,
    'currentStep' | 'selectedProductId' | 'baseFee' | 'deliveryFee' | 'transactionStatus'
  >
  transaction: Pick<TransactionState, 'transactionId'>
  wompi: Pick<
    WompiState,
    | 'acceptanceToken'
    | 'personalAuthToken'
    | 'acceptancePermalink'
    | 'personalAuthPermalink'
    | 'acceptanceStatus'
  >
}

export const loadPersistedState = (): PersistedState | undefined => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return undefined
    }
    return JSON.parse(raw) as PersistedState
  } catch {
    return undefined
  }
}

export const savePersistedState = (state: PersistedState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore storage write failures.
  }
}
