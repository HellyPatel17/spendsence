import { Transaction, UserProfile } from './types';

const STORAGE_KEY = 'spendsense_data';
const PROFILE_KEY = 'spendsense_profile';

export const storage = {
  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  saveTransaction: (transaction: Transaction) => {
    const transactions = storage.getTransactions();
    transactions.unshift(transaction);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  },
  
  deleteTransaction: (id: string) => {
    const transactions = storage.getTransactions();
    const filtered = transactions.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },
  
  getProfile: (): UserProfile => {
    const data = localStorage.getItem(PROFILE_KEY);
    return data ? JSON.parse(data) : { uid: 'local-user', email: 'local@user.com', currency: 'INR' };
  },
  
  saveProfile: (profile: UserProfile) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }
};
