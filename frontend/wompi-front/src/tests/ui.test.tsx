import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ProductScreen from '../components/ProductScreen'
import type { Product } from '../services/api/products'

describe('ProductScreen', () => {
  it('renders product cards', () => {
    const products: Product[] = [
      {
        id: 'prod-1',
        name: 'Coffee Beans',
        description: 'Roasted and ready to brew.',
        price: 28000,
        availableUnits: 3,
      },
    ]

    render(
      <ProductScreen
        products={products}
        selectedProductId={null}
        onSelect={() => {}}
      />,
    )

    expect(screen.getByText('Coffee Beans')).toBeInTheDocument()
    expect(screen.getByText('Roasted and ready to brew.')).toBeInTheDocument()
    expect(screen.getByText('Available: 3')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Select product' }),
    ).toBeInTheDocument()
  })

  it('renders the empty state', () => {
    render(
      <ProductScreen
        products={[]}
        selectedProductId={null}
        onSelect={() => {}}
      />,
    )

    expect(
      screen.getByText('No products available right now.'),
    ).toBeInTheDocument()
  })

  it('marks the selected product', () => {
    const products: Product[] = [
      {
        id: 'prod-2',
        name: 'Filter Starter Kit',
        description: 'Everything you need to brew.',
        price: 94000,
        availableUnits: 2,
      },
    ]

    render(
      <ProductScreen
        products={products}
        selectedProductId="prod-2"
        onSelect={() => {}}
      />,
    )

    expect(screen.getByRole('button', { name: 'Selected' })).toBeInTheDocument()
  })
})
