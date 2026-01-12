import { WompiGateway } from './wompi.gateway';

describe('WompiGateway (simple)', () => {
  const originalEnv = { ...process.env };

  const request = {
    amount: 150000,
    customerEmail: 'jane@example.com',
    reference: 't1',
    cardToken: 'tok',
    acceptanceToken: 'acc',
    acceptPersonalAuth: 'true',
  };

  beforeEach(() => {
    process.env.WOMPI_BASE_URL = 'https://wompi.test';
    process.env.WOMPI_PRIVATE_KEY = 'priv_key';
    process.env.WOMPI_CURRENCY = 'COP';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.restoreAllMocks();
  });

  it('fails when env vars are missing', async () => {
    delete process.env.WOMPI_BASE_URL;

    const gateway = new WompiGateway();
    const result = await gateway.charge(request as any);

    expect(result).toEqual({
      success: false,
      errorMessage: 'Wompi configuration is missing',
    });
  });

  it('creates payment source and transaction successfully', async () => {
    (global as any).fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: 'src_test_123' } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { id: 'txn_test_456', status: 'APPROVED' },
        }),
      });

    const gateway = new WompiGateway();
    const result = await gateway.charge(request as any);

    expect(result).toEqual({ success: true, wompiReference: 'txn_test_456' });
  });

  it('fails when transaction is declined', async () => {
    (global as any).fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: 'src_test_123' } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { id: 'txn_test_456', status: 'DECLINED' },
        }),
      });

    const gateway = new WompiGateway();
    const result = await gateway.charge(request as any);

    expect(result.success).toBe(false);
    expect(result.errorMessage).toBe('Transaction DECLINED');
  });

  it('fails when payment source request fails', async () => {
    (global as any).fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: { message: 'Invalid token' } }),
    });

    const gateway = new WompiGateway();
    const result = await gateway.charge(request as any);

    expect(result.success).toBe(false);
    expect(result.errorMessage).toBe('Invalid token');
  });

  it('fails when transaction request fails', async () => {
    (global as any).fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: 'src_test_123' } }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: { message: 'Bad request' } }),
      });

    const gateway = new WompiGateway();
    const result = await gateway.charge(request as any);

    expect(result.success).toBe(false);
    expect(result.errorMessage).toBe('Bad request');
  });
});
