import { RequestHandler } from 'express';
import * as locationService from './location.service';

export const getProvinces: RequestHandler = (_req, res, next) => {
  try {
    res.json({ success: true, data: locationService.getProvinces() });
  } catch (err) {
    next(err);
  }
};

export const getDistricts: RequestHandler = (req, res, next) => {
  try {
    const data = locationService.getDistricts(req.params.provinceCode as string);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getWards: RequestHandler = (req, res, next) => {
  try {
    const data = locationService.getWards(req.params.districtCode as string);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
