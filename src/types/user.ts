export interface User {
  userID: number;
  username: string;
  name: string;
  surname: string;
  email: string;
  role: 'ADMIN' | 'USER';
  products: unknown[];
} 