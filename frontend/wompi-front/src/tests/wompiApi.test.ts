import { getAcceptance, tokenizeCard } from '../services/api/wompi'

describe('wompi api', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('fetches acceptance data', async () => {
    const response = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        data: {
          presigned_acceptance: {
            acceptance_token: 'acceptance-token',
            permalink: 'https://example.com/terms',
          },
          presigned_personal_data_auth: {
            acceptance_token: 'personal-token',
            permalink: 'https://example.com/personal',
          },
        },
      }),
      text: jest.fn().mockResolvedValue(''),
    }

    const fetchMock = jest.fn().mockResolvedValue(response as unknown as Response)
    global.fetch = fetchMock as typeof fetch

    const data = await getAcceptance('pub-test')

    expect(data.acceptanceToken).toBe('acceptance-token')
    expect(data.personalAuthToken).toBe('personal-token')
  })

  it('tokenizes the card', async () => {
    const response = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        data: {
          id: 'card-token',
        },
      }),
      text: jest.fn().mockResolvedValue(''),
    }

    const fetchMock = jest.fn().mockResolvedValue(response as unknown as Response)
    global.fetch = fetchMock as typeof fetch

    const data = await tokenizeCard('pub-test', {
      cardNumber: '4111111111111111',
      cvv: '123',
      expiry: '12/29',
      cardName: 'Jane Doe',
    })

    expect(data.cardToken).toBe('card-token')
  })
})
