import {
  createTransaction,
  getTransaction,
  payTransaction,
} from '../services/api/transactions'
import { client } from '../services/api/client'

jest.mock('../services/api/client', () => ({
  client: jest.fn(),
}))

const clientMock = jest.mocked(client)

describe('transactions api', () => {
  it('creates a transaction', async () => {
    clientMock.mockResolvedValueOnce({
      transactionId: 'tx-1',
      status: 'PENDING',
    })

    const payload = {
      productId: 'prod-1',
      baseFee: 1500,
      deliveryFee: 3500,
      customer: {
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        phone: '3005551234',
        address: 'Street 123',
        city: 'Bogota',
      },
    }

    await createTransaction(payload)

    expect(clientMock).toHaveBeenCalledWith('/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  })

  it('fetches a transaction by id', async () => {
    clientMock.mockResolvedValueOnce({
      transactionId: 'tx-1',
      status: 'PENDING',
    })

    await getTransaction('tx-1')

    expect(clientMock).toHaveBeenCalledWith('/transactions/tx-1')
  })

  it('pays a transaction', async () => {
    clientMock.mockResolvedValueOnce({
      transactionId: 'tx-1',
      status: 'SUCCESS',
    })

    const payload = {
      cardToken: 'card-token',
      acceptanceToken: 'acceptance-token',
      acceptPersonalAuth: 'personal-token',
    }

    await payTransaction('tx-1', payload)

    expect(clientMock).toHaveBeenCalledWith('/transactions/tx-1/pay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  })
})
