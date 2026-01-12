import { useEffect } from 'react'
import './App.css'
import CheckoutFormSheet from './components/CheckoutFormSheet'
import ProductScreen from './components/ProductScreen'
import { useAppDispatch, useAppSelector } from './store/hooks'
import {
  fetchProducts,
  setSelectedProductId,
} from './store/slices/checkoutSlice'
import { setSheetOpen } from './store/slices/formSlice'

function App() {
  const dispatch = useAppDispatch()
  const { products, status, errorMessage, selectedProductId } = useAppSelector(
    (state) => state.checkout,
  )
  const isSheetOpen = useAppSelector((state) => state.form.isSheetOpen)

  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  return (
    <div className="app">
      <header className="app-header">
        <p className="app-kicker">Step 1 of 3</p>
        <h1 className="app-title">Choose your product</h1>
        <p className="app-subtitle">
          Select a product to continue the checkout.
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

        {status === 'succeeded' && (
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
                onClick={() => dispatch(setSheetOpen(true))}
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
      </section>

      <CheckoutFormSheet
        isOpen={isSheetOpen}
        onClose={() => dispatch(setSheetOpen(false))}
      />
    </div>
  )
}

export default App
