import { Router } from 'express';
import * as locationController from './location.controller';

const router = Router();

router.get('/provinces', locationController.getProvinces);
router.get('/provinces/:provinceCode/districts', locationController.getDistricts);
router.get('/districts/:districtCode/wards', locationController.getWards);

export default router;
