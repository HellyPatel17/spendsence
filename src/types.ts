export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category?: string;
  source?: string;
  paymentMethod?: string;
  note?: string;
  date: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  currency: string;
}

export const CATEGORIES = [
  'Food',
  'Travel',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Education',
  'Others'
];

export const PAYMENT_METHODS = [
  'Cash',
  'Card',
  'UPI',
  'Bank Transfer'
];
