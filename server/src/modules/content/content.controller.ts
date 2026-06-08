import { Request, Response, NextFunction } from 'express';
import * as contentService from './content.service';
import { sendSuccess } from '../../utils/response';

// ==================== BANNER ====================
export async function getBanners(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await contentService.getBanners(req.query.position as string | undefined)); } catch (e) { next(e); }
}
export async function getAllBanners(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await contentService.getAllBanners()); } catch (e) { next(e); }
}
export async function createBanner(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await contentService.createBanner(req.body), 'Banner created', 201); } catch (e) { next(e); }
}
export async function updateBanner(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await contentService.updateBanner(req.params.id as string, req.body), 'Banner updated'); } catch (e) { next(e); }
}
export async function deleteBanner(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await contentService.deleteBanner(req.params.id as string)); } catch (e) { next(e); }
}

// ==================== ATHLETE ====================
export async function getAthletes(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await contentService.getAthletes()); } catch (e) { next(e); }
}
export async function getAllAthletes(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await contentService.getAllAthletes()); } catch (e) { next(e); }
}
export async function createAthlete(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await contentService.createAthlete(req.body), 'Athlete created', 201); } catch (e) { next(e); }
}
export async function updateAthlete(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await contentService.updateAthlete(req.params.id as string, req.body), 'Athlete updated'); } catch (e) { next(e); }
}
export async function deleteAthlete(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await contentService.deleteAthlete(req.params.id as string)); } catch (e) { next(e); }
}

// ==================== TECHNOLOGY ====================
export async function getTechnologies(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await contentService.getTechnologies()); } catch (e) { next(e); }
}
export async function getAllTechnologies(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await contentService.getAllTechnologies()); } catch (e) { next(e); }
}
export async function createTechnology(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await contentService.createTechnology(req.body), 'Technology created', 201); } catch (e) { next(e); }
}
export async function updateTechnology(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await contentService.updateTechnology(req.params.id as string, req.body), 'Technology updated'); } catch (e) { next(e); }
}
export async function deleteTechnology(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await contentService.deleteTechnology(req.params.id as string)); } catch (e) { next(e); }
}
