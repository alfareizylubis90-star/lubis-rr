export interface Customer {
  id: string;
  name: string;
  accountNumber: string;
  bankId: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  balance: number;
  createdAt: any;
}

export interface Bank {
  id: string;
  name: string;
  code: string;
  country: string;
  status: 'active' | 'inactive';
  createdAt: any;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'transfer';
  amount: number;
  fromAccountId?: string;
  toAccountId?: string;
  timestamp: any;
  status: 'pending' | 'completed' | 'failed';
  description: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'staff';
  displayName: string;
}
