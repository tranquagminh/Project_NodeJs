import dotenv from 'dotenv';

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 5000,

  // Database
  DATABASE_URL: process.env.DATABASE_URL || '',

  // Redis
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: Number(process.env.REDIS_PORT) || 6379,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // Client
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  ADMIN_URL: process.env.ADMIN_URL || 'http://localhost:3001',

  // VNPay
  VNPAY_TMN_CODE: process.env.VNPAY_TMN_CODE || '',
  VNPAY_HASH_SECRET: process.env.VNPAY_HASH_SECRET || '',
  VNPAY_URL: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  VNPAY_RETURN_URL: process.env.VNPAY_RETURN_URL || 'http://localhost:3000/payment/return/vnpay',
  VNPAY_IPN_URL: process.env.VNPAY_IPN_URL || 'http://localhost:5001/api/payment/webhook/vnpay',

  // MoMo
  MOMO_PARTNER_CODE: process.env.MOMO_PARTNER_CODE || '',
  MOMO_ACCESS_KEY: process.env.MOMO_ACCESS_KEY || '',
  MOMO_SECRET_KEY: process.env.MOMO_SECRET_KEY || '',
  MOMO_API_URL: process.env.MOMO_API_URL || 'https://test-payment.momo.vn',
  MOMO_RETURN_URL: process.env.MOMO_RETURN_URL || 'http://localhost:3000/payment/return/momo',
  MOMO_NOTIFY_URL: process.env.MOMO_NOTIFY_URL || 'http://localhost:5001/api/payment/webhook/momo',

  // Payment
  PAYMENT_MOCK_MODE: process.env.PAYMENT_MOCK_MODE === 'true',

  // Bank transfer
  BANK_ACCOUNT_NUMBER: process.env.BANK_ACCOUNT_NUMBER || '0123456789',
  BANK_ACCOUNT_HOLDER: process.env.BANK_ACCOUNT_HOLDER || 'VOLTA SPORTS',
  BANK_NAME: process.env.BANK_NAME || 'VietcomBank',
} as const;
