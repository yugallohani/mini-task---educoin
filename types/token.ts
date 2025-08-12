import { Principal } from '@dfinity/principal';

export interface TokenInfo {
  name: string;
  symbol: string;
  total_supply: bigint;
  creator: Principal;
}

export interface UserInfo {
  user_principal: Principal;
  balance: bigint;
}

export type TransferResult = 
  | { Success: null }
  | { InsufficientBalance: null }
  | { SameAccount: null };

export type MintResult = 
  | { Success: null }
  | { Unauthorized: null };

export interface TokenActor {
  get_token_info: () => Promise<TokenInfo>;
  get_balance: (account: Principal) => Promise<bigint>;
  get_total_supply: () => Promise<bigint>;
  get_all_users: () => Promise<UserInfo[]>;
  is_creator: (principal: Principal) => Promise<boolean>;
  transfer: (to: Principal, amount: bigint) => Promise<TransferResult>;
  mint: (to: Principal, amount: bigint) => Promise<MintResult>;
}
