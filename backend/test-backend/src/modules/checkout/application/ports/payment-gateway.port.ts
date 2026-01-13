export type PaymentResult = {
  success: boolean;
  status?: string;
  wompiReference?: string;
  errorMessage?: string;
};

export type PaymentRequest = {
  amount: number;
  customerEmail: string;
  reference: string;
  cardToken: string;
  acceptanceToken: string;
  acceptPersonalAuth: string;
};

export const PAYMENT_GATEWAY = Symbol('PAYMENT_GATEWAY');

export interface PaymentGatewayPort {
  charge(input: PaymentRequest): Promise<PaymentResult>;
}
