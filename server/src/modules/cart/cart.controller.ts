import { RequestHandler } from 'express';
import * as cartService from './cart.service';
import { sendSuccess } from '../../utils/response';

export const getCart: RequestHandler = async (req, res, next) => {
  try {
    const cart = await cartService.getUserCart(req.user!.id);
    sendSuccess(res, cart);
  } catch (err) { next(err); }
};

export const addItem: RequestHandler = async (req, res, next) => {
  try {
    const cart = await cartService.addItemToCart(req.user!.id, req.body);
    sendSuccess(res, cart, 'Item added to cart', 201);
  } catch (err) { next(err); }
};

export const updateItem: RequestHandler = async (req, res, next) => {
  try {
    const cart = await cartService.updateCartItem(
      req.user!.id,
      req.params.itemId as string,
      req.body.quantity,
    );
    sendSuccess(res, cart);
  } catch (err) { next(err); }
};

export const removeItem: RequestHandler = async (req, res, next) => {
  try {
    const cart = await cartService.removeCartItem(req.user!.id, req.params.itemId as string);
    sendSuccess(res, cart);
  } catch (err) { next(err); }
};

export const clearCart: RequestHandler = async (req, res, next) => {
  try {
    const result = await cartService.clearCart(req.user!.id);
    sendSuccess(res, result);
  } catch (err) { next(err); }
};

export const mergeGuestCart: RequestHandler = async (req, res, next) => {
  try {
    const result = await cartService.mergeGuestCart(req.user!.id, req.body.items);
    sendSuccess(res, result);
  } catch (err) { next(err); }
};

export const validatePayload: RequestHandler = async (req, res, next) => {
  try {
    const result = await cartService.validateCartPayload(req.body.items);
    sendSuccess(res, result);
  } catch (err) { next(err); }
};

export const calculatePayload: RequestHandler = async (req, res, next) => {
  try {
    const cart = await cartService.calculateCartFromPayload(req.body.items);
    sendSuccess(res, cart);
  } catch (err) { next(err); }
};
