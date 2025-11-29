// src/types/index.ts
export interface User {
    id: number;
    name: string;
    email: string;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface AuthResponse {
    message: string;
    token: string;
    user: User;
  }

  export interface Todo {
    id: number;
    title: string;
    description: string;
    status: 'pending' | 'completed' | 'on-hold';
    createdAt: string;
  }
  
  export interface TodoFilters {
    status: string;
    date: string;
  }