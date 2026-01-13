type AcceptanceInfo = {
  acceptanceToken: string
  personalAuthToken: string
  acceptancePermalink: string
  personalAuthPermalink: string
}

import { getEnv } from '../env'

type CardTokenInfo = {
  cardToken: string
}

const API_BASE =
  getEnv().VITE_BASE_URL?.toString().replace(/\/$/, '') ??
  'https://api-sandbox.co.uat.wompi.dev/v1'

const toJson = async (response: Response) => {
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Wompi request failed')
  }

  return response.json()
}

// GET /v1/merchants/{PUBLIC_KEY}
export const getAcceptance = async (publicKey: string): Promise<AcceptanceInfo> => {
  const response = await fetch(`${API_BASE}/merchants/${publicKey}`)
  const data = await toJson(response)

  const acceptance = data?.data?.presigned_acceptance
  const personal = data?.data?.presigned_personal_data_auth

  if (!acceptance?.acceptance_token || !personal?.acceptance_token) {
    throw new Error('Invalid acceptance response')
  }

  return {
    acceptanceToken: acceptance.acceptance_token,
    personalAuthToken: personal.acceptance_token,
    acceptancePermalink: acceptance.permalink ?? '',
    personalAuthPermalink: personal.permalink ?? '',
  }
}

// POST /v1/tokens/cards
export const tokenizeCard = async (
  publicKey: string,
  card: { cardNumber: string; cvv: string; expiry: string; cardName: string },
): Promise<CardTokenInfo> => {
  const [month, year] = card.expiry.split('/')
  const body = {
    number: card.cardNumber.replace(/\s+/g, ''),
    cvc: card.cvv,
    exp_month: month,
    exp_year: year,
    card_holder: card.cardName,
  }

  const response = await fetch(`${API_BASE}/tokens/cards`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${publicKey}`,
    },
    body: JSON.stringify(body),
  })

  const data = await toJson(response)
  const cardToken = data?.data?.id

  if (!cardToken) {
    throw new Error('Invalid card token response')
  }

  return { cardToken }
}
