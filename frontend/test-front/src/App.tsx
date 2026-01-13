import { useEffect, useRef } from 'react'
import './App.css'
import CheckoutFormSheet from './components/CheckoutFormSheet'
import ProductScreen from './components/ProductScreen'
import SummaryScreen from './components/SummaryScreen'
import StatusScreen from './components/StatusScreen'
import { useAppDispatch, useAppSelector } from './store/hooks'
import {
  fetchProducts,
  setCurrentStep,
  resetCheckout,
  setSelectedProductId,
  setTransactionStatus,
} from './store/slices/checkoutSlice'
import { resetForm, setSheetOpen } from './store/slices/formSlice'
import { createCardToken, resetWompi } from './store/slices/wompiSlice'
import {
  createTransactionThunk,
  pollTransaction,
  payTransactionThunk,
  recoverTransactionThunk,
  resetTransaction,
} from './store/slices/transactionSlice'
import { getEnv } from './services/env'

function App() {
  const dispatch = useAppDispatch()
  const {
    products,
    status,
    errorMessage,
    selectedProductId,
    currentStep,
    baseFee,
    deliveryFee,
    transactionStatus,
  } = useAppSelector((state) => state.checkout)
  const isSheetOpen = useAppSelector((state) => state.form.isSheetOpen)
  const formValues = useAppSelector((state) => state.form.values)
  const acceptanceToken = useAppSelector((state) => state.wompi.acceptanceToken)
  const personalAuthToken = useAppSelector(
    (state) => state.wompi.personalAuthToken,
  )
  const { transactionId, pollStatus } = useAppSelector(
    (state) => state.transaction,
  )
  const transactionError = useAppSelector(
    (state) => state.transaction.errorMessage,
  )
  const initialTransactionId = useRef(transactionId)
  const selectedProduct =
    products.find((product) => product.id === selectedProductId) ?? null
  const publicKey = getEnv().VITE_PUBLIC_KEY ?? ''

  const stepLabel =
    currentStep >= 4
      ? 'Step 4 of 4'
      : currentStep === 3
        ? 'Step 3 of 4'
        : currentStep === 2
          ? 'Step 2 of 4'
          : 'Step 1 of 4'

  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  useEffect(() => {
    if (!initialTransactionId.current) {
      return
    }

    dispatch(
      recoverTransactionThunk({ transactionId: initialTransactionId.current }),
    )
      .unwrap()
      .then((result) => {
        dispatch(setTransactionStatus(result.status))
        dispatch(setCurrentStep(4))
      })
      .catch(() => {
        dispatch(resetTransaction())
        dispatch(resetCheckout())
      })
  }, [dispatch])

  useEffect(() => {
    if (currentStep >= 4 && transactionStatus === 'PENDING' && transactionId) {
      // Start polling only once when the status is pending.
      if (pollStatus === 'idle') {
        dispatch(pollTransaction({ transactionId }))
          .unwrap()
          .then((result) => {
            dispatch(setTransactionStatus(result.status))
          })
          .catch(() => {
            dispatch(setTransactionStatus('FAILED'))
          })
      }
    }
  }, [dispatch, currentStep, transactionStatus, transactionId, pollStatus])

  return (
    <div className="app">
      <header className="app-header">
        <p className="app-kicker">{stepLabel}</p>
        <h1 className="app-title">
          {currentStep >= 4
            ? 'Payment status'
            : currentStep === 3
              ? 'Review your order'
              : 'Choose your product'}
        </h1>
        <p className="app-subtitle">
          {currentStep >= 4
            ? 'Return to the product list when you are ready.'
            : currentStep === 3
              ? 'Check the totals before confirming.'
              : 'Select a product to continue the checkout.'}
        </p>
      </header>

      <section className="app-content">
        {status === 'loading' && (
          <p className="app-status">Loading products...</p>
        )}
        {status === 'failed' && (
          <p className="app-status app-status-error" role="alert">
            {errorMessage ?? 'Unable to load products'}
          </p>
        )}

        {status === 'succeeded' && currentStep < 3 && (
          <>
            <ProductScreen
              products={products}
              selectedProductId={selectedProductId}
              onSelect={(productId) => dispatch(setSelectedProductId(productId))}
            />
            <div className="app-actions">
              <button
                className="app-cta"
                type="button"
                onClick={() => {
                  // Step 2 starts when the sheet opens.
                  dispatch(setSheetOpen(true))
                  dispatch(setCurrentStep(2))
                }}
                disabled={!selectedProductId}
              >
                Continue to details
              </button>
              {!selectedProductId && (
                <p className="app-helper">Select a product to continue.</p>
              )}
            </div>
          </>
        )}

        {status === 'succeeded' && currentStep === 3 && (
          <SummaryScreen
            product={selectedProduct}
            baseFee={baseFee}
            deliveryFee={deliveryFee}
            onConfirm={async () => {
              // Tokenize the card, then move to the status screen.
              if (!publicKey || !acceptanceToken || !personalAuthToken) {
                dispatch(setTransactionStatus('FAILED'))
                dispatch(setCurrentStep(4))
                return
              }
              if (!transactionId) {
                dispatch(setTransactionStatus('FAILED'))
                dispatch(setCurrentStep(4))
                return
              }

              try {
                // If tokenization succeeds, we can move forward.
                const tokenResult = await dispatch(
                  createCardToken({
                    publicKey,
                    cardNumber: formValues.cardNumber,
                    cvv: formValues.cvv,
                    expiry: formValues.expiry,
                    cardName: formValues.cardName,
                  }),
                ).unwrap()

                const payResult = await dispatch(
                  payTransactionThunk({
                    transactionId,
                    payload: {
                      cardToken: tokenResult.cardToken,
                      acceptanceToken,
                      acceptPersonalAuth: personalAuthToken,
                    },
                  }),
                ).unwrap()

                dispatch(setTransactionStatus(payResult.status))
              } catch {
                dispatch(setTransactionStatus('FAILED'))
              }

              dispatch(setCurrentStep(4))
            }}
          />
        )}

        {status === 'succeeded' && currentStep >= 4 && (
          <>
            <StatusScreen
              status={transactionStatus}
              errorMessage={transactionError}
              onReturn={() => {
                // Reset the flow to start again.
                if (transactionStatus === 'SUCCESS') {
                  dispatch(fetchProducts())
                }
                dispatch(resetCheckout())
                dispatch(resetForm())
                dispatch(resetWompi())
                dispatch(resetTransaction())
              }}
            />
            {transactionStatus === 'PENDING' && (
              <p className="status-note">Checking transaction status...</p>
            )}
          </>
        )}
      </section>

      <CheckoutFormSheet
        isOpen={isSheetOpen}
        onClose={() => {
          dispatch(setSheetOpen(false))
          dispatch(setCurrentStep(1))
        }}
        onContinue={() => {
          if (!selectedProductId) {
            return
          }

          dispatch(
            createTransactionThunk({
              productId: selectedProductId,
              baseFee,
              deliveryFee,
              customer: {
                fullName: formValues.fullName,
                email: formValues.email,
                phone: formValues.phone,
                address: formValues.address,
                city: formValues.city,
                notes: formValues.notes || undefined,
              },
            }),
          )
            .unwrap()
            .then((result) => {
              dispatch(setTransactionStatus(result.status))
              dispatch(setSheetOpen(false))
              dispatch(setCurrentStep(3))
            })
            .catch(() => {
              dispatch(setTransactionStatus('FAILED'))
              dispatch(setSheetOpen(false))
              dispatch(setCurrentStep(4))
            })
        }}
      />
    </div>
  )
}

export default App
