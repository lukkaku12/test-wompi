import { client } from './client'

export type CreateTransactionPayload = {
  productId: string
  baseFee?: number
  deliveryFee?: number
  customer: {
    fullName: string
    email: string
    phone: string
    address: string
    city: string
    notes?: string
  }
}

export type TransactionResponse = {
  transactionId: string
  status: 'PENDING' | 'SUCCESS' | 'FAILED'
  totalAmount?: number
  wompiReference?: string | null
  errorMessage?: string | null
}

export type PayTransactionPayload = {
  cardToken: string
  acceptanceToken: string
  acceptPersonalAuth: string
}

export const createTransaction = async (payload: CreateTransactionPayload) =>
  client<TransactionResponse>('/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

export const getTransaction = async (transactionId: string) =>
  client<TransactionResponse>(`/transactions/${transactionId}`)

export const payTransaction = async (
  transactionId: string,
  payload: PayTransactionPayload,
) =>
  client<TransactionResponse>(`/transactions/${transactionId}/pay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
