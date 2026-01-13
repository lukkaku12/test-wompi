import type { Product } from '../services/api/products'

type SummaryScreenProps = {
  product: Product | null
  baseFee: number
  deliveryFee: number
  onConfirm: () => void
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(price)

const SummaryScreen = ({
  product,
  baseFee,
  deliveryFee,
  onConfirm,
}: SummaryScreenProps) => {
  if (!product) {
    return <p className="summary-empty">Pick a product to see the summary.</p>
  }

  // Total is the product price plus the fixed fees.
  const total = product.price + baseFee + deliveryFee

  return (
    <div className="summary">
      <h2 className="summary-title">Order summary</h2>

      <div className="summary-row">
        <span>Product</span>
        <span>{formatPrice(product.price)}</span>
      </div>
      <div className="summary-row">
        <span>Base fee</span>
        <span>{formatPrice(baseFee)}</span>
      </div>
      <div className="summary-row">
        <span>Delivery fee</span>
        <span>{formatPrice(deliveryFee)}</span>
      </div>
      <div className="summary-row summary-total">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>

      <button className="summary-confirm" type="button" onClick={onConfirm}>
        Confirm
      </button>
    </div>
  )
}

export default SummaryScreen
