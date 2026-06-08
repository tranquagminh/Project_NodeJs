import { Router } from 'express';
import { quoteHandler, quoteValidator } from './shipping.controller';

const router = Router();
router.post('/quote', quoteValidator, quoteHandler);
export default router;
