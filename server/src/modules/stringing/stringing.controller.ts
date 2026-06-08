import { RequestHandler } from 'express';
import { StringingConfigSchema, getOptionsParamSchema } from './stringing.validation';
import { getStringingOptions, validateStringingConfig } from './stringing.service';

export const getOptions: RequestHandler = async (req, res, next) => {
  try {
    const parsed = getOptionsParamSchema.safeParse({ params: req.params });
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Invalid racket product ID', errors: parsed.error.flatten() });
      return;
    }
    const data = await getStringingOptions(parsed.data.params.racketProductId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const validateConfig: RequestHandler = async (req, res, next) => {
  try {
    const parsed = StringingConfigSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Invalid request body', errors: parsed.error.flatten() });
      return;
    }

    const result = await validateStringingConfig(parsed.data);

    if (!result.valid) {
      res.status(422).json({
        success: false,
        error: {
          code: 'STRINGING_VALIDATION_FAILED',
          message: result.message,
          details: { rule: result.rule, ...result.details },
        },
      });
      return;
    }

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
