import { NotificationType } from '@prisma/client';
import { NOTIFICATION_CONFIG } from './notification.config';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

interface RenderResult {
  title: string;
  message: string;
  emailSubject?: string;
  emailBody?: string;
}

// ── Template renderer ─────────────────────────────────────────────────────────

export function renderNotification(
  type: NotificationType,
  payload: Record<string, unknown>,
): RenderResult {
  const config = NOTIFICATION_CONFIG[type];
  const hasEmail = config.email !== 'NEVER';

  switch (type) {
    case 'ORDER_CONFIRMED': {
      const orderCode = String(payload.orderCode ?? '');
      const total = Number(payload.total ?? 0);
      const itemCount = Number(payload.itemCount ?? 0);
      const title = `Đơn hàng ${orderCode} đã được xác nhận`;
      const message = `Cảm ơn bạn! Đơn hàng ${itemCount} sản phẩm, tổng ${formatVND(total)} đã được xác nhận.`;
      return {
        title,
        message,
        ...(hasEmail && {
          emailSubject: `[VOLTA] Xác nhận đơn hàng ${orderCode}`,
          emailBody: `<p>Xin chào,</p><p>Đơn hàng <strong>${orderCode}</strong> của bạn đã được xác nhận.</p><p>Tổng giá trị: <strong>${formatVND(total)}</strong></p><p>Cảm ơn bạn đã mua sắm tại VOLTA!</p>`,
        }),
      };
    }

    case 'ORDER_PROCESSING': {
      const orderCode = String(payload.orderCode ?? '');
      const title = `Đơn hàng ${orderCode} đang được xử lý`;
      const message = `Đơn hàng ${orderCode} của bạn đang được đội ngũ VOLTA xử lý và chuẩn bị hàng.`;
      return {
        title,
        message,
        ...(hasEmail && {
          emailSubject: `[VOLTA] Đơn hàng ${orderCode} đang xử lý`,
          emailBody: `<p>Xin chào,</p><p>Đơn hàng <strong>${orderCode}</strong> của bạn đang được xử lý.</p><p>Chúng tôi sẽ thông báo khi hàng được giao cho đơn vị vận chuyển.</p>`,
        }),
      };
    }

    case 'ORDER_SHIPPED': {
      const orderCode = String(payload.orderCode ?? '');
      const trackingNumber = payload.trackingNumber ? String(payload.trackingNumber) : null;
      const title = `Đơn hàng ${orderCode} đã được giao cho vận chuyển`;
      const message = trackingNumber
        ? `Đơn hàng ${orderCode} đang trên đường giao đến bạn. Mã vận đơn: ${trackingNumber}.`
        : `Đơn hàng ${orderCode} đang trên đường giao đến bạn.`;
      return {
        title,
        message,
        ...(hasEmail && {
          emailSubject: `[VOLTA] Đơn hàng ${orderCode} đã giao vận chuyển`,
          emailBody: `<p>Xin chào,</p><p>Đơn hàng <strong>${orderCode}</strong> của bạn đã được giao cho đơn vị vận chuyển.</p>${trackingNumber ? `<p>Mã vận đơn: <strong>${trackingNumber}</strong></p>` : ''}<p>Dự kiến nhận hàng trong 2-5 ngày làm việc.</p>`,
        }),
      };
    }

    case 'ORDER_DELIVERED': {
      const orderCode = String(payload.orderCode ?? '');
      const title = `Đơn hàng ${orderCode} đã giao thành công`;
      const message = `Đơn hàng ${orderCode} đã được giao thành công. Hãy đánh giá sản phẩm để nhận điểm thưởng!`;
      return {
        title,
        message,
        ...(hasEmail && {
          emailSubject: `[VOLTA] Đơn hàng ${orderCode} đã giao thành công`,
          emailBody: `<p>Xin chào,</p><p>Đơn hàng <strong>${orderCode}</strong> đã được giao thành công.</p><p>Hãy <a href="#">đánh giá sản phẩm</a> để nhận điểm thưởng từ VOLTA!</p>`,
        }),
      };
    }

    case 'ORDER_CANCELLED': {
      const orderCode = String(payload.orderCode ?? '');
      const reason = payload.reason ? String(payload.reason) : null;
      const title = `Đơn hàng ${orderCode} đã bị hủy`;
      const message = reason
        ? `Đơn hàng ${orderCode} đã bị hủy. Lý do: ${reason}.`
        : `Đơn hàng ${orderCode} đã bị hủy.`;
      return {
        title,
        message,
        ...(hasEmail && {
          emailSubject: `[VOLTA] Đơn hàng ${orderCode} đã bị hủy`,
          emailBody: `<p>Xin chào,</p><p>Đơn hàng <strong>${orderCode}</strong> của bạn đã bị hủy.</p>${reason ? `<p>Lý do: ${reason}</p>` : ''}<p>Nếu có thắc mắc, vui lòng liên hệ hỗ trợ VOLTA.</p>`,
        }),
      };
    }

    case 'PAYMENT_SUCCESS': {
      const orderCode = String(payload.orderCode ?? '');
      const amount = Number(payload.amount ?? 0);
      const title = `Thanh toán thành công cho đơn ${orderCode}`;
      const message = `Thanh toán ${formatVND(amount)} cho đơn hàng ${orderCode} đã được xác nhận.`;
      return {
        title,
        message,
        ...(hasEmail && {
          emailSubject: `[VOLTA] Xác nhận thanh toán đơn hàng ${orderCode}`,
          emailBody: `<p>Xin chào,</p><p>Thanh toán <strong>${formatVND(amount)}</strong> cho đơn hàng <strong>${orderCode}</strong> đã thành công.</p><p>Cảm ơn bạn!</p>`,
        }),
      };
    }

    case 'PAYMENT_FAILED': {
      const orderCode = String(payload.orderCode ?? '');
      const title = `Thanh toán thất bại cho đơn ${orderCode}`;
      const message = `Thanh toán cho đơn hàng ${orderCode} không thành công. Vui lòng thử lại.`;
      return {
        title,
        message,
        ...(hasEmail && {
          emailSubject: `[VOLTA] Thanh toán thất bại - Đơn hàng ${orderCode}`,
          emailBody: `<p>Xin chào,</p><p>Thanh toán cho đơn hàng <strong>${orderCode}</strong> không thành công.</p><p>Vui lòng thử lại hoặc chọn phương thức thanh toán khác.</p>`,
        }),
      };
    }

    case 'PAYMENT_REFUNDED': {
      const orderCode = String(payload.orderCode ?? '');
      const amount = Number(payload.amount ?? 0);
      const title = `Hoàn tiền thành công cho đơn ${orderCode}`;
      const message = `Số tiền ${formatVND(amount)} đã được hoàn trả cho đơn hàng ${orderCode}.`;
      return {
        title,
        message,
        ...(hasEmail && {
          emailSubject: `[VOLTA] Xác nhận hoàn tiền đơn hàng ${orderCode}`,
          emailBody: `<p>Xin chào,</p><p>Số tiền <strong>${formatVND(amount)}</strong> đã được hoàn trả cho đơn hàng <strong>${orderCode}</strong>.</p><p>Tiền sẽ về tài khoản của bạn trong 3-7 ngày làm việc.</p>`,
        }),
      };
    }

    case 'RETURN_APPROVED': {
      const orderCode = String(payload.orderCode ?? '');
      const title = `Yêu cầu trả hàng đơn ${orderCode} đã được chấp nhận`;
      const message = `Yêu cầu trả hàng cho đơn ${orderCode} đã được chấp nhận. Vui lòng gửi hàng về địa chỉ VOLTA.`;
      return {
        title,
        message,
        ...(hasEmail && {
          emailSubject: `[VOLTA] Yêu cầu trả hàng được chấp nhận - ${orderCode}`,
          emailBody: `<p>Xin chào,</p><p>Yêu cầu trả hàng cho đơn <strong>${orderCode}</strong> đã được chấp nhận.</p><p>Vui lòng đóng gói và gửi hàng về kho VOLTA trong 3 ngày.</p>`,
        }),
      };
    }

    case 'RETURN_REJECTED': {
      const orderCode = String(payload.orderCode ?? '');
      const reason = payload.reason ? String(payload.reason) : null;
      const title = `Yêu cầu trả hàng đơn ${orderCode} bị từ chối`;
      const message = reason
        ? `Yêu cầu trả hàng đơn ${orderCode} bị từ chối. Lý do: ${reason}.`
        : `Yêu cầu trả hàng đơn ${orderCode} bị từ chối.`;
      return {
        title,
        message,
        ...(hasEmail && {
          emailSubject: `[VOLTA] Yêu cầu trả hàng bị từ chối - ${orderCode}`,
          emailBody: `<p>Xin chào,</p><p>Yêu cầu trả hàng đơn <strong>${orderCode}</strong> đã bị từ chối.</p>${reason ? `<p>Lý do: ${reason}</p>` : ''}<p>Vui lòng liên hệ hỗ trợ để biết thêm chi tiết.</p>`,
        }),
      };
    }

    case 'RETURN_COMPLETED': {
      const orderCode = String(payload.orderCode ?? '');
      const amount = Number(payload.amount ?? 0);
      const title = `Hoàn trả đơn ${orderCode} đã hoàn tất`;
      const message = `Đơn trả hàng ${orderCode} đã hoàn tất. Bạn sẽ nhận lại ${formatVND(amount)}.`;
      return {
        title,
        message,
        ...(hasEmail && {
          emailSubject: `[VOLTA] Hoàn trả hàng hoàn tất - ${orderCode}`,
          emailBody: `<p>Xin chào,</p><p>Đơn trả hàng <strong>${orderCode}</strong> đã hoàn tất.</p><p>Số tiền hoàn trả: <strong>${formatVND(amount)}</strong></p>`,
        }),
      };
    }

    case 'BACK_IN_STOCK': {
      const productName = String(payload.productName ?? '');
      const productSlug = String(payload.productSlug ?? '');
      const title = `${productName} đã có hàng trở lại`;
      const message = `Sản phẩm "${productName}" trong danh sách yêu thích của bạn đã có hàng trở lại. Mua ngay trước khi hết!`;
      return {
        title,
        message,
        ...(hasEmail && {
          emailSubject: `[VOLTA] ${productName} đã có hàng trở lại`,
          emailBody: `<p>Xin chào,</p><p>Sản phẩm <strong>${productName}</strong> bạn quan tâm đã có hàng trở lại.</p><p><a href="/products/${productSlug}">Mua ngay</a> trước khi hết hàng!</p>`,
        }),
      };
    }

    case 'PRICE_DROP': {
      const productName = String(payload.productName ?? '');
      const oldPrice = Number(payload.oldPrice ?? 0);
      const newPrice = Number(payload.newPrice ?? 0);
      const dropPct = Number(payload.dropPct ?? 0);
      const productSlug = String(payload.productSlug ?? '');
      const title = `Giá ${productName} vừa giảm ${Math.round(dropPct * 100)}%`;
      const message = `"${productName}" giảm từ ${formatVND(oldPrice)} xuống còn ${formatVND(newPrice)}.`;
      return {
        title,
        message,
        ...(hasEmail && {
          emailSubject: `[VOLTA] Giảm giá ${Math.round(dropPct * 100)}% - ${productName}`,
          emailBody: `<p>Xin chào,</p><p>Sản phẩm <strong>${productName}</strong> trong wishlist của bạn vừa được giảm giá.</p><p>Giá cũ: <s>${formatVND(oldPrice)}</s> → Giá mới: <strong>${formatVND(newPrice)}</strong></p><p><a href="/products/${productSlug}">Mua ngay</a></p>`,
        }),
      };
    }

    case 'LOW_STOCK_WISHLIST': {
      const productName = String(payload.productName ?? '');
      const stock = Number(payload.stock ?? 0);
      const title = `${productName} sắp hết hàng`;
      const message = `Sản phẩm "${productName}" trong danh sách yêu thích chỉ còn ${stock} sản phẩm. Mua ngay!`;
      return { title, message };
    }

    case 'REVIEW_APPROVED': {
      const productName = String(payload.productName ?? '');
      const title = `Đánh giá của bạn về "${productName}" đã được duyệt`;
      const message = `Đánh giá sản phẩm "${productName}" của bạn đã được phê duyệt và hiển thị công khai.`;
      return { title, message };
    }

    case 'REVIEW_REJECTED': {
      const productName = String(payload.productName ?? '');
      const reason = payload.reason ? String(payload.reason) : null;
      const title = `Đánh giá của bạn về "${productName}" bị từ chối`;
      const message = reason
        ? `Đánh giá sản phẩm "${productName}" bị từ chối. Lý do: ${reason}.`
        : `Đánh giá sản phẩm "${productName}" bị từ chối.`;
      return { title, message };
    }

    case 'POINTS_EARNED': {
      const amount = Number(payload.amount ?? 0);
      const reason = String(payload.reason ?? '');
      const newBalance = Number(payload.newBalance ?? 0);
      const title = `Bạn vừa nhận được ${amount} điểm thưởng`;
      const message = `${reason}. Số dư hiện tại: ${newBalance} điểm.`;
      return {
        title,
        message,
        ...(hasEmail && {
          emailSubject: `[VOLTA] Bạn vừa nhận ${amount} điểm thưởng`,
          emailBody: `<p>Xin chào,</p><p>Bạn vừa nhận được <strong>${amount} điểm</strong> thưởng.</p><p>${reason}</p><p>Số dư hiện tại: <strong>${newBalance} điểm</strong></p>`,
        }),
      };
    }

    case 'POINTS_EXPIRING': {
      const amount = Number(payload.amount ?? 0);
      const expiresAt = payload.expiresAt as Date | string;
      const dateStr = formatDate(expiresAt);
      const title = `${amount} điểm thưởng sắp hết hạn`;
      const message = `Bạn có ${amount} điểm sắp hết hạn vào ngày ${dateStr}. Hãy sử dụng trước khi mất!`;
      return {
        title,
        message,
        ...(hasEmail && {
          emailSubject: `[VOLTA] Điểm thưởng sắp hết hạn vào ${dateStr}`,
          emailBody: `<p>Xin chào,</p><p>Bạn có <strong>${amount} điểm</strong> thưởng sẽ hết hạn vào ngày <strong>${dateStr}</strong>.</p><p>Hãy sử dụng điểm khi thanh toán đơn hàng tiếp theo!</p>`,
        }),
      };
    }

    case 'PROMOTION': {
      const title = String(payload.title ?? 'Ưu đãi đặc biệt từ VOLTA');
      const body = String(payload.body ?? '');
      const couponCode = payload.couponCode ? String(payload.couponCode) : null;
      const message = couponCode ? `${body} Mã giảm giá: ${couponCode}` : body;
      return {
        title,
        message,
        ...(hasEmail && {
          emailSubject: `[VOLTA] ${title}`,
          emailBody: `<p>${body}</p>${couponCode ? `<p>Mã giảm giá: <strong>${couponCode}</strong></p>` : ''}`,
        }),
      };
    }

    default:
      return { title: 'Thông báo mới', message: 'Bạn có thông báo mới từ VOLTA.' };
  }
}
