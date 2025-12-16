import { IsDecimal, IsNotEmpty, IsString } from "class-validator"
import { generateUniqueAccountNumber } from "src/utils/uniqueIdGenerator";

const accountNumber = generateUniqueAccountNumber();

export class WalletDto {
    @IsString()
    account_name: string;

    @IsString()
    wallet_token = accountNumber

    @IsDecimal()
    balance: number;

    @IsString()
    currency: string;
  }

  export class FundWalletDTO {
  @IsNotEmpty()
  amount: number;

  reference: any;
}

  export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
  TRANSFER = 'transfer',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
} 