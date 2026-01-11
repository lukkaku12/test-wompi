export type PaymentResult = {
  success: boolean;
  wompiReference?: string;
  errorMessage?: string;
};

export type PaymentRequest = {
  amount: number;
  forceResult?: 'success' | 'failed';
  errorMessage?: string;
};

export const PAYMENT_GATEWAY = Symbol('PAYMENT_GATEWAY');

export interface PaymentGatewayPort {
  charge(input: PaymentRequest): Promise<PaymentResult>;
}
