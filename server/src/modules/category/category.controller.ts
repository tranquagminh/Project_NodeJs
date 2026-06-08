import { Request, Response, NextFunction } from 'express';
import * as categoryService from './category.service';
import { sendSuccess } from '../../utils/response';

export async function getCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await categoryService.getCategories();
    sendSuccess(res, categories);
  } catch (error) { next(error); }
}

export async function getAllCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await categoryService.getAllCategories();
    sendSuccess(res, categories);
  } catch (error) { next(error); }
}

export async function getCategoryById(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await categoryService.getCategoryById(req.params.id as string);
    sendSuccess(res, category);
  } catch (error) { next(error); }
}

export async function createCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await categoryService.createCategory(req.body);
    sendSuccess(res, category, 'Category created', 201);
  } catch (error) { next(error); }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await categoryService.updateCategory(req.params.id as string, req.body);
    sendSuccess(res, category, 'Category updated');
  } catch (error) { next(error); }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await categoryService.deleteCategory(req.params.id as string);
    sendSuccess(res, result);
  } catch (error) { next(error); }
}
