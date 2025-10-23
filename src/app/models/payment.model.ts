export interface Payment {
  id: number;
  appointment: any;
  amount: number;
  currency: string;
  status: string;
  transactionId: string;
  paymentMethod: string;
  paymentGateway: string;
  paymentDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentStats {
  totalPayments: number;
  successfulPayments: number;
  pendingPayments: number;
  failedPayments: number;
}

export interface CreatePaymentRequest {
  appointmentId: number;
  amount: number;
}

export interface ProcessPaymentRequest {
  paymentId: number;
  paymentMethod: string;
  cardLastFour: string;
}