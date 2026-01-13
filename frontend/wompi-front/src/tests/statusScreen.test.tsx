import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import StatusScreen from '../components/StatusScreen'

describe('StatusScreen', () => {
  it('shows the pending status', () => {
    render(<StatusScreen status="PENDING" onReturn={() => {}} />)

    expect(screen.getByText('PENDING')).toBeInTheDocument()
    expect(screen.getByText('Payment pending')).toBeInTheDocument()
  })
})
