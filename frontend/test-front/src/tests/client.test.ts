import { client } from '../services/api/client'

describe('client', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('builds the correct URL when the path has no leading slash', async () => {
    const response = {
      ok: true,
      json: jest.fn().mockResolvedValue({ ok: true }),
      text: jest.fn().mockResolvedValue(''),
    }

    const fetchMock = jest.fn().mockResolvedValue(response as unknown as Response)
    global.fetch = fetchMock as typeof fetch

    const data = await client<{ ok: boolean }>('products')

    expect(data).toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/products',
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'application/json',
        }),
      }),
    )
  })

  it('throws a readable error when the response is not ok', async () => {
    const response = {
      ok: false,
      json: jest.fn(),
      text: jest.fn().mockResolvedValue('Bad request'),
      status: 400,
    }

    const fetchMock = jest.fn().mockResolvedValue(response as unknown as Response)
    global.fetch = fetchMock as typeof fetch

    await expect(client('/products')).rejects.toThrow('Bad request')
  })
})
