import { Router } from 'express';
import { authenticate } from '../../middlewares/auth';
import { env } from '../../config/env';
import { retryPayment } from './payment.service';
import {
  processVnpayWebhook,
  processMomoWebhook,
  processMockWebhook,
} from './payment.webhook';

const router = Router();

// ── VNPay ─────────────────────────────────────────────────────────────────────

router.get('/webhook/vnpay', async (req, res) => {
  const params = req.query as Record<string, string>;
  const result = await processVnpayWebhook(params).catch((err) => {
    console.error('[vnpay-webhook]', err);
    return { RspCode: '99', Message: 'Unknown error' };
  });
  res.json(result);
});

router.post('/webhook/vnpay', async (req, res) => {
  const params = { ...req.query, ...req.body } as Record<string, string>;
  const result = await processVnpayWebhook(params).catch((err) => {
    console.error('[vnpay-webhook]', err);
    return { RspCode: '99', Message: 'Unknown error' };
  });
  res.json(result);
});

// Return URL (browser redirect from VNPay — just pass through to frontend)
router.get('/return/vnpay', (req, res) => {
  const qs = new URLSearchParams(req.query as Record<string, string>).toString();
  res.redirect(`${env.CLIENT_URL}/payment/return/vnpay?${qs}`);
});

// ── MoMo ──────────────────────────────────────────────────────────────────────

router.post('/webhook/momo', async (req, res) => {
  try {
    await processMomoWebhook(req.body as Record<string, string | number>);
    res.sendStatus(204);
  } catch (err) {
    console.error('[momo-webhook]', err);
    res.sendStatus(500);
  }
});

// Return URL (browser redirect from MoMo)
router.get('/return/momo', (req, res) => {
  const qs = new URLSearchParams(req.query as Record<string, string>).toString();
  res.redirect(`${env.CLIENT_URL}/payment/return/momo?${qs}`);
});

// ── Mock gateway (PAYMENT_MOCK_MODE only) ─────────────────────────────────────

router.post('/webhook/mock', async (req, res) => {
  if (!env.PAYMENT_MOCK_MODE) {
    res.status(404).json({ success: false, message: 'Not found' });
    return;
  }
  const { orderCode, result } = req.body as { orderCode: string; result: 'success' | 'failed' };
  if (!orderCode || !result) {
    res.status(400).json({ success: false, message: 'orderCode and result required' });
    return;
  }
  try {
    await processMockWebhook(orderCode, result);
    res.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).json({ success: false, message: msg });
  }
});

// ── Retry payment ─────────────────────────────────────────────────────────────

router.post('/retry/:orderCode', authenticate, async (req, res, next) => {
  try {
    const initiation = await retryPayment(
      req.params.orderCode as string,
      req.user!.id,
      req.ip,
    );
    res.json({ success: true, data: initiation });
  } catch (err) {
    next(err);
  }
});

export default router;
