import { RequestHandler } from 'express';
import { z } from 'zod';
import * as shippingService from './shipping.service';
import { sendSuccess } from '../../utils/response';
import { validate } from '../../middlewares/validate';

const quoteSchema = z.object({
  body: z.object({
    subtotal: z.number().int().min(0),
    province: z.string().min(1),
    method: z.enum(['STANDARD_DELIVERY', 'EXPRESS_VELOCITY']),
    hasStringing: z.boolean().optional(),
  }),
});

export const quoteHandler: RequestHandler = async (req, res, next) => {
  try {
    const result = await shippingService.getShippingQuote(req.body);
    sendSuccess(res, result);
  } catch (e) { next(e); }
};

export const quoteValidator = validate(quoteSchema);
