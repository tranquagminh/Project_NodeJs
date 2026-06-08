import { Request, Response, NextFunction } from 'express';
import * as wishlistService from './wishlist.service';
import { sendSuccess } from '../../utils/response';

export async function getWishlist(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await wishlistService.getWishlist(req.user!.id)); } catch (e) { next(e); }
}

export async function addToWishlist(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await wishlistService.addToWishlist(req.user!.id, req.body.productId), 'Added to wishlist', 201); } catch (e) { next(e); }
}

export async function removeFromWishlist(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await wishlistService.removeFromWishlist(req.user!.id, req.params.productId as string)); } catch (e) { next(e); }
}
