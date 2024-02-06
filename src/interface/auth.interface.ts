export interface LoginBody {
  email: string;
  password: string;
}

export interface SignUpBody {
  email: string;
  password: string;
  name: string;
  id?: number;
}

export interface RecoveryPasswordBody {
  email: string;
  code?: string;
  password?: string;
}
