import { IsDecimal, IsNotEmpty, IsString } from "class-validator"
import { generateUniqueAccountNumber } from "src/utils/uniqueIdGenerator";

const accountNumber = generateUniqueAccountNumber();

export class TransferFundsDTO {
  @IsString()
  wallet_token: string;

  @IsNotEmpty()
  amount: number;

  @IsString()
  description: string;
}