import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { generateUniqueAccountNumber } from '../utils/uniqueIdGenerator'
import { DuplicateReferenceError, InsufficientFundsError, NotFoundError} from "../utils/errors";
import logger from "../utils/logger";
import { randomBytes } from 'crypto';
import {FundWalletDTO, TransactionStatus, TransactionType } from './dto';
import { FORBIDDEN_MESSAGE } from '@nestjs/core/guards';
import { TransferFundsDTO } from './dto/transfer.dto';

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
      throw new BadRequestException("Wallet not found")
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
        throw new BadRequestException("Invalid amount provided.")
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
          userId
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

async transferFunds( senderUserId: string, data: TransferFundsDTO) {
  return this.prisma.$transaction(async (tx) => {
    const senderWallet = await tx.wallet.findUnique({
      where: { userId: senderUserId },
    });

    if (!senderWallet) {
      throw new NotFoundError('Sender wallet not found');
    }

    const recipientWallet = await tx.wallet.findUnique({
      where: { wallet_token: data.wallet_token },
    });

    if (!recipientWallet) {
      throw new NotFoundError('Recipient wallet not found');
    }

    if (senderWallet.id === recipientWallet.id) {
      throw new Error("You can't transfer to yourself");
    }

    if (Number(senderWallet.balance) < data.amount) {
      throw new InsufficientFundsError();
    }

    const reference = this.generateTransactionId();
    const creditReference = `${reference}_CREDIT`;

    await tx.wallet.update({
      where: { id: senderWallet.id },
      data: {
        balance: { decrement: data.amount },
      },
    });

    await tx.wallet.update({
      where: { id: recipientWallet.id },
      data: {
        balance: { increment: data.amount },
      },
    });

    const senderTransaction = await tx.transaction.create({
      data: {
        userId: senderUserId,
        walletId: senderWallet.id,
        type: "TRANSFER",
        amount: data.amount,
        reference,
        description:
          data.description ||
          `Transfer to ${recipientWallet.account_name ?? recipientWallet.wallet_token}`,
        recipientWalletId: recipientWallet.id,
        status:"COMPLETED",
        metadata: {
          recipientWalletId: recipientWallet.id,
        },
      },
    });

    await tx.transaction.create({
      data: {
        walletId: recipientWallet.id,
        type: "CREDIT",
        amount: data.amount,
        reference: creditReference,
        description:
          data.description ||
          `Transfer from user ${senderUserId}`,
        status: "COMPLETED",
        userId: recipientWallet.userId,
        metadata: {
          senderWalletId: senderWallet.id,
        },
      },
    });

    return {senderTransaction, message:"Fund transfered successfully",};
  });
  }


  generateTransactionId = (): string => {
    const timestamp = Date.now().toString(36);
    const randomString = randomBytes(7).toString('base64').replace(/\W/g, ''); // Generate a random 3-byte base64 string and remove non-alphanumeric characters
    return `TRNX-${timestamp.toUpperCase()}-${randomString.toUpperCase()}`;
  };
}
