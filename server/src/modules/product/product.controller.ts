import { Request, Response, NextFunction } from 'express';
import * as productService from './product.service';
import { sendSuccess, sendPaginated } from '../../utils/response';

// ==================== Public ====================

export async function getProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const { products, meta } = await productService.getProducts(req.query as any);
    sendPaginated(res, products, meta);
  } catch (e) { next(e); }
}

export async function getProductBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, await productService.getProductBySlug(req.params.slug as string));
  } catch (e) { next(e); }
}

export async function getFeaturedProducts(_req: Request, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, await productService.getFeaturedProducts());
  } catch (e) { next(e); }
}

export async function getNewArrivals(_req: Request, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, await productService.getNewArrivals());
  } catch (e) { next(e); }
}

export async function searchProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const { q, page, limit } = req.query as any;
    const { products, meta } = await productService.searchProducts(q, Number(page) || 1, Number(limit) || 12);
    sendPaginated(res, products, meta);
  } catch (e) { next(e); }
}

// ==================== Admin ====================

export async function getAllProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const { products, meta } = await productService.getAllProducts(page, limit);
    sendPaginated(res, products, meta);
  } catch (e) { next(e); }
}

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, await productService.createProduct(req.body), 'Product created', 201);
  } catch (e) { next(e); }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, await productService.updateProduct(req.params.id as string, req.body), 'Product updated');
  } catch (e) { next(e); }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, await productService.deleteProduct(req.params.id as string));
  } catch (e) { next(e); }
}

// Spec
export async function upsertSpec(req: Request, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, await productService.upsertSpec(req.params.id as string, req.body), 'Spec saved');
  } catch (e) { next(e); }
}

// Variants
export async function createVariant(req: Request, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, await productService.createVariant(req.params.id as string, req.body), 'Variant created', 201);
  } catch (e) { next(e); }
}

export async function updateVariant(req: Request, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, await productService.updateVariant(req.params.id as string, req.params.variantId as string, req.body), 'Variant updated');
  } catch (e) { next(e); }
}

export async function deleteVariant(req: Request, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, await productService.deleteVariant(req.params.id as string, req.params.variantId as string));
  } catch (e) { next(e); }
}

// Images
export async function addImage(req: Request, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, await productService.addImage(req.params.id as string, req.body), 'Image added', 201);
  } catch (e) { next(e); }
}

export async function deleteImage(req: Request, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, await productService.deleteImage(req.params.id as string, req.params.imageId as string));
  } catch (e) { next(e); }
}
