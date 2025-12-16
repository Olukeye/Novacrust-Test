import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TransactionsService {
    constructor(
      private prisma:PrismaService,
    ){}

 async getTransactionHistory(
  userId: string,
  page = 1,
  limit = 20,
) {
  const wallet = await this.prisma.wallet.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!wallet) {
    throw new NotFoundException('Wallet not found');
  }

  const skip = (page - 1) * limit;

  const [transactions, total] = await this.prisma.$transaction([
    this.prisma.transaction.findMany({
      where: {
        OR: [
          { walletId: wallet.id },
          { recipientWalletId: wallet.id },
        ],
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    this.prisma.transaction.count({
      where: {
        OR: [
          { walletId: wallet.id },
          { recipientWalletId: wallet.id },
        ],
      },
    }),
  ]);

  return {
    page,
    limit,
    total,
    data: transactions,
  };
}
}
