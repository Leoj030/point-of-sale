export interface User {
    _id: string;
    name: string;
    username: string;
    role: 'ADMIN' | 'CASHIER';
  }