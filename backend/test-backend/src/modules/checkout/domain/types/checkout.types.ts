export type CreateTransactionInput = {
  productId: string;
  baseFee?: number;
  deliveryFee?: number;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    notes?: string;
  };
};

export type PayTransactionInput = {
  cardToken: string;
  acceptanceToken: string;
  acceptPersonalAuth: string;
};

export type CheckoutErrorCode =
  | 'BAD_REQUEST'
  | 'NOT_FOUND'
  | 'CONFLICT';

export type CheckoutError = {
  code: CheckoutErrorCode;
  message: string;
};
