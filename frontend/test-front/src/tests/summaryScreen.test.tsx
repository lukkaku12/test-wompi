import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import SummaryScreen from '../components/SummaryScreen'

describe('SummaryScreen', () => {
  it('shows product and fees', () => {
    render(
      <SummaryScreen
        product={{
          id: 'prod-1',
          name: 'Coffee Beans',
          description: 'Roasted and ready to brew.',
          price: 25000,
          availableUnits: 5,
        }}
        baseFee={1500}
        deliveryFee={3500}
        onConfirm={() => {}}
      />,
    )

    expect(screen.getByText('Order summary')).toBeInTheDocument()
    expect(screen.getByText('Product')).toBeInTheDocument()
    expect(screen.getByText('Base fee')).toBeInTheDocument()
    expect(screen.getByText('Delivery fee')).toBeInTheDocument()
  })
})
