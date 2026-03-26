// User information from token exchange
export interface User {
  userId: number;
  username: string;
  email: string;
  role: string;
}

// Course information from token exchange (may be null)
export interface Course {
  id: number;
  name: string;
  description: string;
}

// Full token exchange response from API
export interface TokenExchangeResponse {
  userId: number;
  username: string;
  email: string;
  role: string;
  course: Course | null;
}
