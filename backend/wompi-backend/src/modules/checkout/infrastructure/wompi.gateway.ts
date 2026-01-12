import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

import type {
  PaymentGatewayPort,
  PaymentRequest,
  PaymentResult,
} from '../application/ports/payment-gateway.port';
import type {
  WompiPaymentSourceResponse,
  WompiTransactionResponse,
} from './types/wompi.types';

@Injectable()
export class WompiGateway implements PaymentGatewayPort {
  async charge(input: PaymentRequest): Promise<PaymentResult> {
    const baseUrl = process.env.WOMPI_BASE_URL;
    const privateKey = process.env.WOMPI_PRIVATE_KEY;
    const currency = process.env.WOMPI_CURRENCY;
    const integrityKey = process.env.WOMPI_INTEGRITY_KEY;

    // If these env vars are missing, we cannot authenticate or even target the correct environment.
    // Returning a controlled failure here keeps the Use Case pure (no try/catch around infra setup)
    // and avoids wasting time on external calls that are guaranteed to fail.
    if (!baseUrl || !privateKey || !currency || !integrityKey) {
      return {
        success: false,
        errorMessage: 'Wompi configuration is missing',
      };
    }

    // Wompi requires a two-step flow for cards:
    // - payment source: binds the card token + customer acceptance to a reusable source id
    // - transaction: performs the actual charge using that source
    // The internal `reference` is passed later so we can reconcile Wompi events with our DB record.
    const paymentSource = await this.createPaymentSource(
      baseUrl,
      privateKey,
      input,
    );

    if (!paymentSource.success || !paymentSource.paymentSourceId) {
      return {
        success: false,
        errorMessage: paymentSource.errorMessage ?? 'Payment source failed',
      };
    }

    // Normalize provider-specific errors into a simple message.
    const transaction = await this.createTransaction(
      baseUrl,
      privateKey,
      currency,
      integrityKey,
      input,
      paymentSource.paymentSourceId,
    );

    if (!transaction.success) {
      return {
        success: false,
        errorMessage: transaction.errorMessage ?? 'Transaction failed',
      };
    }

    return {
      success: true,
      wompiReference: transaction.wompiReference,
    };
  }

  // Technical adapter method.
  // Important: card details must never reach this backend; we only accept a Wompi card token
  // produced on the client. Acceptance tokens prove the user accepted Wompi's terms.
  private async createPaymentSource(
    baseUrl: string,
    privateKey: string,
    input: PaymentRequest,
  ): Promise<{
    success: boolean;
    paymentSourceId?: string;
    errorMessage?: string;
  }> {
    const response = await fetch(`${baseUrl}/payment_sources`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${privateKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'CARD',
        token: input.cardToken,
        customer_email: input.customerEmail,
        acceptance_token: input.acceptanceToken,
        accept_personal_auth: input.acceptPersonalAuth,
      }),
    });

    const payload = (await response.json()) as WompiPaymentSourceResponse;

    if (!response.ok || !payload?.data?.id) {
      const tokenPrefix = input.cardToken?.slice(0, 10);
      const acceptancePrefix = input.acceptanceToken?.slice(0, 10);
      const personalAuthPrefix = input.acceptPersonalAuth?.slice(0, 10);
      // Log provider payload for debugging failed payment source creation.
      // Avoid logging full card data (only token is used here).
      console.error('[Wompi] payment_source failed', {
        status: response.status,
        error: payload?.error ?? null,
        data: payload?.data ?? null,
        tokenPrefix,
        acceptancePrefix,
        personalAuthPrefix,
      });
      if (payload?.error?.messages?.acceptance_token) {
        return {
          success: false,
          errorMessage: 'Invalid acceptance token',
        };
      }
      return {
        success: false,
        errorMessage:
          payload?.error?.message ?? 'Unable to create payment source',
      };
    }

    return {
      success: true,
      paymentSourceId: payload.data.id,
    };
  }

  // Technical adapter method.
  // We treat only `APPROVED` as success. Other statuses are surfaced as failures so the Use Case
  // can decide how to persist/retry (this challenge does not implement webhooks/polling).
  private async createTransaction(
    baseUrl: string,
    privateKey: string,
    currency: string,
    integrityKey: string,
    input: PaymentRequest,
    paymentSourceId: string,
  ): Promise<{
    success: boolean;
    status?: string;
    wompiReference?: string;
    errorMessage?: string;
  }> {
    const amountInCents = Math.round(input.amount * 100);
    const signatureInput = `${input.reference}${amountInCents}${currency}${integrityKey}`;
    const signature = createHash('sha256')
      .update(signatureInput)
      .digest('hex');

    const response = await fetch(`${baseUrl}/transactions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${privateKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Wompi expects cents (integer). Ensure the Use Case passes cents, not COP pesos.
        amount_in_cents: amountInCents,
        currency,
        customer_email: input.customerEmail,
        payment_source_id: paymentSourceId,
        reference: input.reference,
        signature,
        payment_method: {
          installments: 1,
        },
      }),
    });

    const payload = (await response.json()) as WompiTransactionResponse;

    if (!response.ok || !payload?.data?.id) {
      // Log provider payload for debugging failed transaction creation.
      console.error('[Wompi] transaction failed', {
        status: response.status,
        error: payload?.error ?? null,
        data: payload?.data ?? null,
        signatureInput,
        signature,
      });
      return {
        success: false,
        errorMessage: payload?.error?.message ?? 'Unable to create transaction',
      };
    }

    const status = payload.data.status;
    if (status === 'APPROVED') {
      return {
        success: true,
        status,
        wompiReference: payload.data.id,
      };
    }

    if (status === 'PENDING') {
      return {
        success: true,
        status,
        wompiReference: payload.data.id,
      };
    }

    return {
      success: false,
      status,
      errorMessage: `Transaction ${status ?? 'failed'}`,
    };
  }
}
