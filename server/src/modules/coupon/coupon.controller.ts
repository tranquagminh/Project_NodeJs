import { RequestHandler } from 'express';
import * as couponService from './coupon.service';
import { sendSuccess } from '../../utils/response';

export const validateCoupon: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const result = await couponService.validateCoupon(req.body.code, req.body.subtotal, userId);
    sendSuccess(res, result);
  } catch (e) { next(e); }
};

export const listCoupons: RequestHandler = async (req, res, next) => {
  try {
    const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
    const page = req.query.page ? Number(req.query.page) : 1;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 20;
    sendSuccess(res, await couponService.listCoupons({ isActive, page, pageSize }));
  } catch (e) { next(e); }
};

export const createCoupon: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, await couponService.createCoupon(req.body), 'Coupon created', 201);
  } catch (e) { next(e); }
};

export const updateCoupon: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, await couponService.updateCoupon(req.params.id as string, req.body));
  } catch (e) { next(e); }
};

export const deactivateCoupon: RequestHandler = async (req, res, next) => {
  try {
    sendSuccess(res, await couponService.deactivateCoupon(req.params.id as string));
  } catch (e) { next(e); }
};
