import { RequestHandler } from 'express';
import { OrderStatus } from '@prisma/client';
import * as orderService from './order.service';
import { sendSuccess } from '../../utils/response';
import prisma from '../../config/database';

// ── Public ────────────────────────────────────────────────────────────────────

export const validateCheckout: RequestHandler = async (req, res, next) => {
  try {
    const result = await orderService.validateCheckout(req.body, req.user?.id);
    sendSuccess(res, result);
  } catch (e) { next(e); }
};

export const createOrder: RequestHandler = async (req, res, next) => {
  try {
    const result = await orderService.createOrder(
      { ...req.body, ipAddress: req.ip },
      req.user?.id,
    );
    sendSuccess(res, result, 'Order placed', 201);
  } catch (e) { next(e); }
};

export const lookupOrder: RequestHandler = async (req, res, next) => {
  try {
    const email = req.query.email as string;
    if (!email) {
      res.status(400).json({ success: false, message: 'email query param required' });
      return;
    }
    const order = await orderService.getOrderByCode(req.params.orderCode as string, email);
    sendSuccess(res, order);
  } catch (e) { next(e); }
};

// ── Authenticated ─────────────────────────────────────────────────────────────

export const listMyOrders: RequestHandler = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const status = req.query.status as OrderStatus | undefined;
    const result = await orderService.listMyOrders(req.user!.id, { status, page, pageSize });
    sendSuccess(res, result);
  } catch (e) { next(e); }
};

export const getMyOrder: RequestHandler = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id as string, req.user!.id);
    sendSuccess(res, order);
  } catch (e) { next(e); }
};

export const cancelMyOrder: RequestHandler = async (req, res, next) => {
  try {
    const order = await orderService.cancelMyOrder(
      req.params.id as string,
      req.user!.id,
      req.body.reason,
    );
    sendSuccess(res, order);
  } catch (e) { next(e); }
};

// ── Admin ─────────────────────────────────────────────────────────────────────

export const listAllOrders: RequestHandler = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 20;
    const status = req.query.status as OrderStatus | undefined;
    const result = await orderService.listAllOrders({ status, page, pageSize });
    sendSuccess(res, result);
  } catch (e) { next(e); }
};

export const getAdminOrder: RequestHandler = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id as string);
    sendSuccess(res, order);
  } catch (e) { next(e); }
};

export const adminUpdateStatus: RequestHandler = async (req, res, next) => {
  try {
    const order = await orderService.updateOrderStatus(
      req.params.id as string,
      req.body.toStatus,
      'ADMIN',
      { note: req.body.note, reason: req.body.reason, trackingNumber: req.body.trackingNumber },
    );
    sendSuccess(res, order);
  } catch (e) { next(e); }
};

export const adminConfirmCod: RequestHandler = async (req, res, next) => {
  try {
    const order = await orderService.updateOrderStatus(
      req.params.id as string,
      'CONFIRMED',
      'ADMIN',
      { note: 'COD confirmed by admin' },
    );
    sendSuccess(res, order);
  } catch (e) { next(e); }
};

export const adminCancelOrder: RequestHandler = async (req, res, next) => {
  try {
    const order = await orderService.updateOrderStatus(
      req.params.id as string,
      'CANCELLED',
      'ADMIN',
      { reason: req.body.reason ?? 'Cancelled by admin' },
    );
    sendSuccess(res, order);
  } catch (e) { next(e); }
};

// DEV ONLY — gated by ENABLE_DEV_ENDPOINTS env flag
export const adminMarkPaid: RequestHandler = async (req, res, next) => {
  try {
    if (process.env.ENABLE_DEV_ENDPOINTS !== 'true') {
      res.status(404).json({ success: false, message: 'Not found' });
      return;
    }
    const order = await prisma.order.update({
      where: { id: req.params.id as string },
      data: { paymentStatus: 'PAID' },
    });
    sendSuccess(res, order);
  } catch (e) { next(e); }
};

export const adminUpdateTracking: RequestHandler = async (req, res, next) => {
  try {
    const order = await orderService.updateOrderStatus(
      req.params.id as string,
      'SHIPPING',
      'ADMIN',
      { trackingNumber: req.body.trackingNumber },
    );
    sendSuccess(res, order);
  } catch (e) { next(e); }
};
