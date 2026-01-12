import { afterEach, describe, expect, it, vi } from 'vitest'
import { getAcceptance, tokenizeCard } from '../services/api/wompi'

describe('wompi api', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('fetches acceptance data', async () => {
    const response = {
      ok: true,
      json: vi.fn().mockResolvedValue({
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
      text: vi.fn().mockResolvedValue(''),
    }

    const fetchMock = vi.fn().mockResolvedValue(response as Response)
    vi.stubGlobal('fetch', fetchMock)

    const data = await getAcceptance('pub-test')

    expect(data.acceptanceToken).toBe('acceptance-token')
    expect(data.personalAuthToken).toBe('personal-token')
  })

  it('tokenizes the card', async () => {
    const response = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        data: {
          id: 'card-token',
        },
      }),
      text: vi.fn().mockResolvedValue(''),
    }

    const fetchMock = vi.fn().mockResolvedValue(response as Response)
    vi.stubGlobal('fetch', fetchMock)

    const data = await tokenizeCard('pub-test', {
      cardNumber: '4111111111111111',
      cvv: '123',
      expiry: '12/29',
      cardName: 'Jane Doe',
    })

    expect(data.cardToken).toBe('card-token')
  })
})
