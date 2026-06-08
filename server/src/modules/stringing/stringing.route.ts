import { Router } from 'express';
import { getOptions, validateConfig } from './stringing.controller';

const router = Router();

// Public — used by Product Detail page (no auth required)
router.get('/options/:racketProductId', getOptions);
router.post('/validate', validateConfig);

export default router;
