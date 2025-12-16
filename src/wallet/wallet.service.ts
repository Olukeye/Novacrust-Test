import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { generateUniqueAccountNumber } from '../utils/uniqueIdGenerator'
import { DuplicateReferenceError, InsufficientFundsError, NotFoundError} from "../utils/errors";
import logger from "../utils/logger";
import { randomBytes } from 'crypto';
import {FundWalletDTO, TransactionStatus, TransactionType } from './dto';

@Injectable()
export class WalletService {
  constructor(
    private prisma:PrismaService,
  ){}


  async getWalletById(walletId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: {
        id: walletId
      }
    })

    if(!wallet){
      throw new NotFoundError("Wallet not found")
    }

    return wallet;
  }

  async getWalletToken(wallet_token: string) {
    const token = await this.prisma.wallet.findFirst({
      where: {
        wallet_token
      },
      select:{
        account_name: true,
      }
    })

    if(!token){
      throw new NotFoundError("Token not found")
    }
  }

  async createWallet(userId: string){
    try {
      const user = await this.prisma.user.findUnique({
        where: {id: userId},
        select:{
          firstName:true,
          lastName:true
        }
      })
        

      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      const accountName = `${user.firstName} ${user.lastName}`.trim();
      const accountNumber = generateUniqueAccountNumber();

      const wallet = await this.prisma.wallet.create({
        data :{
          userId,
          account_name: accountName,
          wallet_token: accountNumber,
          balance: 0,
          currency: 'USD',
        }
      });

      return wallet;
    } catch (error) {
      logger.error(error);
      throw new Error('Failed to create wallet');
    }
  }

  async getWalletByUserId(userId: string){
    const wallet = await this.prisma.wallet.findFirst({
      where:{
        userId
      }
    })

    if(!wallet){
      throw new NotFoundError("Wallet not found")
    }

    return wallet;
  }


async fundWallet(userId: string, data: FundWalletDTO) {
  try {
    const result = await this.prisma.$transaction(async (tx) => {
      const existingTranx = await tx.transaction.findFirst({
        where: { reference: data.reference },
      });

      if (existingTranx) {
        throw new DuplicateReferenceError();
      }

      if(data.amount <= 0){
        throw new Error("Invalid amount provided.")
      }
      
      const wallet = await tx.wallet.findFirst({
        where: { userId },
      });

      if (!wallet) {
        throw new NotFoundError('Wallet not found');
      }

      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            increment: data.amount,
          },
        },
      });

      const reference = this.generateTransactionId();
      
      const transaction = await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'CREDIT',
          amount: data.amount,
          reference,
          description: 'Wallet funding via external source',
          status: 'COMPLETED',
        },
      });

      return transaction;
    });

    return {
      message: `Wallet funded for user ${userId} with ${data.amount}`,
      data: result
    };

  } catch (error) {
    if (
      error instanceof DuplicateReferenceError ||
      error instanceof NotFoundError
    ) {
      throw error;
    }

    logger.error(error);
    throw new Error('Failed to fund wallet');
  }
}

  
  generateTransactionId = (): string => {
    const timestamp = Date.now().toString(36);
    const randomString = randomBytes(7).toString('base64').replace(/\W/g, ''); // Generate a random 3-byte base64 string and remove non-alphanumeric characters
    return `TRNX-${timestamp.toUpperCase()}-${randomString.toUpperCase()}`;
  };
}
