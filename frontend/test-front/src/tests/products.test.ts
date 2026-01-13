import { getProducts } from '../services/api/products'
import { client } from '../services/api/client'

jest.mock('../services/api/client', () => ({
  client: jest.fn(),
}))

const clientMock = jest.mocked(client)

describe('products API', () => {
  it('calls the products endpoint', async () => {
    clientMock.mockResolvedValue([])

    await getProducts()

    expect(clientMock).toHaveBeenCalledWith('/products')
  })
})
