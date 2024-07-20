// src/types.ts
export interface UserObject {
  address: string;
  name: string;
  phoneNumber: number;
  email: string;
}

export interface OrderObject {
  orderType: 'cod' | 'upi';
  amount: number;
}
