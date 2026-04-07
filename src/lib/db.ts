import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { db, auth } from './firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const dbService = {
  async getCustomers() {
    const path = 'customers';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  subscribeCustomers(callback: (data: any[]) => void) {
    const path = 'customers';
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  async addCustomer(data: any) {
    const path = 'customers';
    try {
      return await addDoc(collection(db, path), {
        ...data,
        balance: 0,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async getBanks() {
    const path = 'banks';
    try {
      const q = query(collection(db, path), orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  subscribeBanks(callback: (data: any[]) => void) {
    const path = 'banks';
    const q = query(collection(db, path), orderBy('name', 'asc'));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  async addBank(data: any) {
    const path = 'banks';
    try {
      return await addDoc(collection(db, path), {
        ...data,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async processTransaction(transaction: any) {
    const path = 'transactions';
    try {
      await runTransaction(db, async (tx) => {
        // 1. Create transaction record
        const transRef = doc(collection(db, path));
        tx.set(transRef, {
          ...transaction,
          timestamp: serverTimestamp(),
          status: 'completed'
        });

        // 2. Update balances
        if (transaction.type === 'deposit') {
          const customerRef = doc(db, 'customers', transaction.toAccountId);
          const customerDoc = await tx.get(customerRef);
          if (!customerDoc.exists()) throw new Error('Customer not found');
          tx.update(customerRef, { balance: customerDoc.data().balance + transaction.amount });
        } else if (transaction.type === 'withdraw') {
          const customerRef = doc(db, 'customers', transaction.fromAccountId);
          const customerDoc = await tx.get(customerRef);
          if (!customerDoc.exists()) throw new Error('Customer not found');
          if (customerDoc.data().balance < transaction.amount) throw new Error('Insufficient balance');
          tx.update(customerRef, { balance: customerDoc.data().balance - transaction.amount });
        } else if (transaction.type === 'transfer') {
          const fromRef = doc(db, 'customers', transaction.fromAccountId);
          const toRef = doc(db, 'customers', transaction.toAccountId);
          const fromDoc = await tx.get(fromRef);
          const toDoc = await tx.get(toRef);
          if (!fromDoc.exists() || !toDoc.exists()) throw new Error('Account(s) not found');
          if (fromDoc.data().balance < transaction.amount) throw new Error('Insufficient balance');
          tx.update(fromRef, { balance: fromDoc.data().balance - transaction.amount });
          tx.update(toRef, { balance: toDoc.data().balance + transaction.amount });
        }
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  subscribeTransactions(callback: (data: any[]) => void) {
    const path = 'transactions';
    const q = query(collection(db, path), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  }
};
