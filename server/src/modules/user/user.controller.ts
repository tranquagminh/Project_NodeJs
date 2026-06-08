import { Request, Response, NextFunction } from 'express';
import * as userService from './user.service';
import { sendSuccess } from '../../utils/response';

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.updateProfile(req.user!.id, req.body);
    sendSuccess(res, user, 'Profile updated');
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await userService.changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function getAddresses(req: Request, res: Response, next: NextFunction) {
  try {
    const addresses = await userService.getAddresses(req.user!.id);
    sendSuccess(res, addresses);
  } catch (error) {
    next(error);
  }
}

export async function createAddress(req: Request, res: Response, next: NextFunction) {
  try {
    const address = await userService.createAddress(req.user!.id, req.body);
    sendSuccess(res, address, 'Address created', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateAddress(req: Request, res: Response, next: NextFunction) {
  try {
    const address = await userService.updateAddress(req.user!.id, req.params.id as string, req.body);
    sendSuccess(res, address, 'Address updated');
  } catch (error) {
    next(error);
  }
}

export async function deleteAddress(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await userService.deleteAddress(req.user!.id, req.params.id as string);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

// ── Admin ────────────────────────────────────────────────────────────────────

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, search, role, isActive } = req.query;
    const result = await userService.listUsers({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string | undefined,
      role: role as string | undefined,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function getUserById(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.getUserById(req.params.id as string);
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
}

export async function suspendUser(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await userService.suspendUser(req.params.id as string);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function activateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await userService.activateUser(req.params.id as string);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function changeUserRole(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await userService.changeUserRole(req.params.id as string, req.body.role);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}
