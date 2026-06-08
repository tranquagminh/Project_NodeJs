import { Request, Response, NextFunction } from 'express';
import * as brandService from './brand.service';
import { sendSuccess } from '../../utils/response';

export async function getBrands(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await brandService.getBrands()); } catch (e) { next(e); }
}

export async function getAllBrands(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await brandService.getAllBrands()); } catch (e) { next(e); }
}

export async function getBrandById(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await brandService.getBrandById(req.params.id as string)); } catch (e) { next(e); }
}

export async function createBrand(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await brandService.createBrand(req.body), 'Brand created', 201); } catch (e) { next(e); }
}

export async function updateBrand(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await brandService.updateBrand(req.params.id as string, req.body), 'Brand updated'); } catch (e) { next(e); }
}

export async function deleteBrand(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await brandService.deleteBrand(req.params.id as string)); } catch (e) { next(e); }
}
