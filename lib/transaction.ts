import { prisma } from "./prisma";
import { generateCacheKey, deleteCache, getCache, setCache } from "./cache";

export async function generateReference(): Promise<string> {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(1000 + Math.random() * 9000).toString();
  return `FT-${timestamp}-${random}`;
}

export async function getWalletByUserId(userId: string) {
  const cacheKey = generateCacheKey("wallet", userId);

  // Try cache first
  const cached = await getCache<any>(cacheKey);
  if (cached) {
    return cached;
  }

  const wallet = await prisma.wallet.findUnique({
    where: { userId },
  });

  if (wallet) {
    await setCache(cacheKey, wallet, 300);
  }

  return wallet;
}

export async function getWalletByAccountNumber(accountNumber: string) {
  return await prisma.wallet.findUnique({
    where: { accountNumber },
  });
}

export async function getUserByAccountNumber(accountNumber: string) {
  const wallet = await prisma.wallet.findUnique({
    where: { accountNumber },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });
  return wallet;
}

export async function transferFunds(
  senderId: string,
  receiverAccountNumber: string,
  amount: number,
  description?: string,
) {
  // Validate amount
  if (amount <= 0) {
    throw new Error("Amount must be greater than 0");
  }

  // Get sender wallet
  const senderWallet = await getWalletByUserId(senderId);
  if (!senderWallet) {
    throw new Error("Sender wallet not found");
  }

  // Check balance
  if (Number(senderWallet.balance) < amount) {
    throw new Error("Insufficient balance");
  }

  // Get receiver wallet
  const receiverWallet = await getWalletByAccountNumber(receiverAccountNumber);
  if (!receiverWallet) {
    throw new Error("Receiver account not found");
  }

  // Prevent self-transfer
  if (senderWallet.id === receiverWallet.id) {
    throw new Error("Cannot transfer to yourself");
  }

  // Generate reference
  const reference = await generateReference();

  // Calculate fee (0.5% of amount, minimum 10)
  const fee = Math.max(amount * 0.005, 10);

  // Get receiver user
  const receiverUser = await prisma.user.findUnique({
    where: { id: receiverWallet.userId },
    select: { id: true },
  });

  // Create transaction and update balances in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Update sender balance
    const updatedSender = await tx.wallet.update({
      where: { id: senderWallet.id },
      data: {
        balance: {
          decrement: amount + fee,
        },
      },
    });

    // Update receiver balance
    const updatedReceiver = await tx.wallet.update({
      where: { id: receiverWallet.id },
      data: {
        balance: {
          increment: amount,
        },
      },
    });

    // Create transaction record
    const transaction = await tx.transaction.create({
      data: {
        reference,
        senderWalletId: senderWallet.id,
        receiverWalletId: receiverWallet.id,
        amount,
        fee,
        type: "transfer",
        status: "completed",
        description: description || "Transfer",
        senderId: senderId,
        receiverId: receiverUser?.id,
        completedAt: new Date(),
      },
      include: {
        senderWallet: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        receiverWallet: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return { transaction, updatedSender, updatedReceiver };
  });

  // Invalidate cache
  await deleteCache(generateCacheKey("wallet", senderId));
  await deleteCache(generateCacheKey("wallet", receiverWallet.userId));

  return result;
}

export async function withdrawFunds(
  userId: string,
  amount: number,
  description?: string,
) {
  if (amount <= 0) {
    throw new Error("Amount must be greater than 0");
  }

  const wallet = await getWalletByUserId(userId);
  if (!wallet) {
    throw new Error("Wallet not found");
  }

  if (Number(wallet.balance) < amount) {
    throw new Error("Insufficient balance");
  }

  const reference = await generateReference();

  const result = await prisma.$transaction(async (tx) => {
    const updatedWallet = await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: {
          decrement: amount,
        },
      },
    });

    const transaction = await tx.transaction.create({
      data: {
        reference,
        senderWalletId: wallet.id,
        amount,
        fee: 0,
        type: "withdrawal",
        status: "completed",
        description: description || "Withdrawal",
        senderId: userId,
        completedAt: new Date(),
      },
    });

    return { transaction, updatedWallet };
  });

  await deleteCache(generateCacheKey("wallet", userId));

  return result;
}

export async function getTransactionHistory(
  userId: string,
  page: number = 1,
  limit: number = 10,
) {
  const wallet = await getWalletByUserId(userId);
  if (!wallet) {
    throw new Error("Wallet not found");
  }

  const skip = (page - 1) * limit;

  const transactions = await prisma.transaction.findMany({
    where: {
      OR: [{ senderWalletId: wallet.id }, { receiverWalletId: wallet.id }],
    },
    include: {
      senderWallet: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
      receiverWallet: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: limit,
  });

  const total = await prisma.transaction.count({
    where: {
      OR: [{ senderWalletId: wallet.id }, { receiverWalletId: wallet.id }],
    },
  });

  return {
    transactions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getTransactionByReference(reference: string) {
  return await prisma.transaction.findUnique({
    where: { reference },
    include: {
      senderWallet: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
      receiverWallet: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
    },
  });
}
