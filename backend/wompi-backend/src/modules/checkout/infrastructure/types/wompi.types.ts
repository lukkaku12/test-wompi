export type WompiPaymentSourceResponse = {
  data?: {
    id?: string;
  };
  error?: {
    message?: string;
  };
};

export type WompiTransactionResponse = {
  data?: {
    id?: string;
    status?: string;
  };
  error?: {
    message?: string;
  };
};
