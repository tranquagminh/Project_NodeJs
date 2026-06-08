import { z } from 'zod';

const VN_PHONE_REGEX = /^(0|\+84)[3-9]\d{8}$/;

const shippingAddressSchema = z.object({
  fullName: z.string().min(2).max(50),
  phone: z.string().regex(VN_PHONE_REGEX, 'Invalid VN phone number'),
  province: z.string().min(1),
  district: z.string().min(1),
  ward: z.string().min(1),
  addressLine: z.string().min(5).max(200),
  note: z.string().max(500).optional(),
});

const cartItemPayload = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1).max(5),
  stringing: z.object({
    stringVariantId: z.string().uuid(),
    tension: z.number().multipleOf(0.5),
    gripChoice: z.string().optional(),
  }).optional(),
});

export const createOrderSchema = z.object({
  body: z.object({
    itemsSource: z.enum(['cart', 'inline']),
    items: z.array(cartItemPayload).max(50).optional(),
    customer: z.object({
      email: z.string().email(),
      fullName: z.string().min(2).max(50),
      phone: z.string().regex(VN_PHONE_REGEX),
    }).optional(),
    shippingAddress: shippingAddressSchema.optional(),
    shippingAddressId: z.string().uuid().optional(),
    shippingMethod: z.enum(['STANDARD_DELIVERY', 'EXPRESS_VELOCITY']),
    paymentMethod: z.enum(['COD', 'VNPAY', 'MOMO', 'BANK_TRANSFER']),
    couponCode: z.string().max(50).optional(),
    pointsToRedeem: z.number().int().min(0).optional(),
  }).refine(
    (d) => d.shippingAddress !== undefined || d.shippingAddressId !== undefined,
    { message: 'Either shippingAddress or shippingAddressId must be provided' },
  ).refine(
    (d) => !(d.shippingAddress !== undefined && d.shippingAddressId !== undefined),
    { message: 'Provide either shippingAddress or shippingAddressId, not both' },
  ),
});

export const validateCheckoutSchema = createOrderSchema;

export const orderIdSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    toStatus: z.enum([
      'CONFIRMED', 'PROCESSING', 'READY_TO_SHIP', 'SHIPPING',
      'DELIVERED', 'COMPLETED', 'CANCELLED',
    ]),
    note: z.string().max(500).optional(),
    trackingNumber: z.string().max(100).optional(),
  }),
});

export const cancelOrderSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ reason: z.string().max(500).optional() }),
});

export const trackingSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ trackingNumber: z.string().min(1).max(100) }),
});
