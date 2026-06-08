import { Router } from 'express';
import * as contentController from './content.controller';
import { validate } from '../../middlewares/validate';
import { authenticate, authorize } from '../../middlewares/auth';
import {
  createBannerSchema, updateBannerSchema, bannerIdSchema,
  createAthleteSchema, updateAthleteSchema, athleteIdSchema,
  createTechnologySchema, updateTechnologySchema, technologyIdSchema,
} from './content.validation';

// ==================== PUBLIC ROUTES ====================
export const bannerPublicRouter = Router();
bannerPublicRouter.get('/', contentController.getBanners);

export const athletePublicRouter = Router();
athletePublicRouter.get('/', contentController.getAthletes);

export const technologyPublicRouter = Router();
technologyPublicRouter.get('/', contentController.getTechnologies);

// ==================== ADMIN ROUTES ====================
export const bannerAdminRouter = Router();
bannerAdminRouter.use(authenticate, authorize('ADMIN', 'SUPER_ADMIN'));
bannerAdminRouter.get('/', contentController.getAllBanners);
bannerAdminRouter.post('/', validate(createBannerSchema), contentController.createBanner);
bannerAdminRouter.put('/:id', validate(updateBannerSchema), contentController.updateBanner);
bannerAdminRouter.delete('/:id', validate(bannerIdSchema), contentController.deleteBanner);

export const athleteAdminRouter = Router();
athleteAdminRouter.use(authenticate, authorize('ADMIN', 'SUPER_ADMIN'));
athleteAdminRouter.get('/', contentController.getAllAthletes);
athleteAdminRouter.post('/', validate(createAthleteSchema), contentController.createAthlete);
athleteAdminRouter.put('/:id', validate(updateAthleteSchema), contentController.updateAthlete);
athleteAdminRouter.delete('/:id', validate(athleteIdSchema), contentController.deleteAthlete);

export const technologyAdminRouter = Router();
technologyAdminRouter.use(authenticate, authorize('ADMIN', 'SUPER_ADMIN'));
technologyAdminRouter.get('/', contentController.getAllTechnologies);
technologyAdminRouter.post('/', validate(createTechnologySchema), contentController.createTechnology);
technologyAdminRouter.put('/:id', validate(updateTechnologySchema), contentController.updateTechnology);
technologyAdminRouter.delete('/:id', validate(technologyIdSchema), contentController.deleteTechnology);
