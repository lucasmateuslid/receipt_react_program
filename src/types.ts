export interface Vehicle {
  plate: string;
}

export interface ReceiptData {
  payerDocument: string;
  payerName: string;
  amount: number;
  dueDate: string;
  paymentMethod: 'PIX' | 'DEBIT' | 'CREDIT' | 'TRANSFER';
  serviceType: 'ADHESION' | 'MONTHLY' | 'OWNERSHIP_CHANGE' | 'CANCELLATION';
  vehicles: Vehicle[];
  receiptNumber: string;
  emissionDate: string;
}

export const PAYMENT_METHODS = [
  { id: 'PIX', label: 'PIX' },
  { id: 'DEBIT', label: 'Cartão de Débito' },
  { id: 'CREDIT', label: 'Cartão de Crédito' },
  { id: 'TRANSFER', label: 'Transferência Bancária' },
];

export const SERVICE_TYPES = [
  { id: 'ADHESION', label: 'Adesão' },
  { id: 'MONTHLY', label: 'Mensalidade' },
  { id: 'OWNERSHIP_CHANGE', label: 'Troca de Titularidade' },
  { id: 'CANCELLATION', label: 'Cancelamento' },
];