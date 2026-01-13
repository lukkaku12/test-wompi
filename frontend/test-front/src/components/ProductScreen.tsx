import type { Product } from '../services/api/products'

type ProductScreenProps = {
  products: Product[]
  selectedProductId: string | null
  onSelect: (productId: string) => void
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(price)

const ProductScreen = ({
  products,
  selectedProductId,
  onSelect,
}: ProductScreenProps) => {
  if (products.length === 0) {
    return (
      <div className="product-empty">No products available right now.</div>
    )
  }

  return (
    <div className="product-grid">
      {products.map((product, index) => {
        const isSelected = product.id === selectedProductId
        const imageSrc = product.imageUrl || '/vite.svg'
        const optimizedSrc = imageSrc.replace(/picsum\.photos\/seed\/([^/]+)\/\d+\/\d+/, 'picsum.photos/seed/$1/480/320')
        const imageSet = imageSrc.includes('picsum.photos')
          ? `${optimizedSrc} 480w, ${imageSrc} 600w`
          : undefined

        return (
          <article className="product-card" key={product.id}>
            <img
              className="product-card-image"
              src={optimizedSrc}
              srcSet={imageSet}
              sizes="(min-width: 768px) 360px, 90vw"
              alt={product.name}
              loading={index < 2 ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={index < 1 ? 'high' : 'auto'}
              width={320}
              height={200}
            />
            <div className="product-card-header">
              <h2 className="product-card-name">{product.name}</h2>
              <p className="product-card-price">{formatPrice(product.price)}</p>
            </div>
            <p className="product-card-description">{product.description}</p>
            <div className="product-card-footer">
              <p className="product-card-meta">
                Available: {product.availableUnits}
              </p>
              <button
                className={`product-card-cta${
                  isSelected ? ' product-card-cta-selected' : ''
                }`}
                type="button"
                onClick={() => onSelect(product.id)}
                aria-pressed={isSelected}
              >
                {isSelected ? 'Selected' : 'Select product'}
              </button>
            </div>
          </article>
        )
      })}
    </div>
  )
}

export default ProductScreen
