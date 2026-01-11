import { Injectable } from '@nestjs/common';

import {
  PaymentGatewayPort,
  PaymentRequest,
  PaymentResult,
} from '../application/ports/payment-gateway.port';

@Injectable()
export class FakeWompiGateway implements PaymentGatewayPort {
  async charge(input: PaymentRequest): Promise<PaymentResult> {
    const success = input.forceResult !== 'failed';

    if (!success) {
      return {
        success: false,
        errorMessage: input.errorMessage ?? 'Payment failed',
      };
    }

    return {
      success: true,
      wompiReference: `wompi_${Date.now()}`,
    };
  }
}
