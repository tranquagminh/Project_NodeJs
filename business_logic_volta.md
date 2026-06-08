# 📘 VOLTA — Business Logic Specification

> Tài liệu này mô tả **quy tắc nghiệp vụ** (business rules) cho web e-commerce bán đồ cầu lông VOLTA. Dùng làm "single source of truth" để viết prompt AI code & test cho từng tính năng.
>
> **Phiên bản:** v1.0 — Draft cho dự án cá nhân (có thể mở rộng sau)

---

## 0. Tổng quan & Giả định cốt lõi

### 0.1 Bối cảnh
- **Thị trường:** Việt Nam (VND, ship nội địa)
- **Currency:** VND, format hiển thị `1.250.000₫` hoặc `1,250,000 VND`
- **Ngôn ngữ:** Tiếng Việt là chính, tiếng Anh cho thuật ngữ kỹ thuật cầu lông (Astrox, BG80, 4U G5...)
- **Tax:** Giá hiển thị **đã bao gồm VAT 10%**. Hóa đơn xuất riêng nếu khách yêu cầu.
- **Mô hình kinh doanh:** B2C — bán lẻ trực tiếp cho người chơi cầu lông (amateur → bán chuyên → tournament players)

### 0.2 Quyết định đã chốt
| # | Vấn đề | Quyết định |
|---|--------|-----------|
| 1 | Thị trường | Việt Nam, VND, ship nội địa |
| 2 | Stringing service | **Có — miễn phí khi mua vợt** (khách chọn dây + tension) |
| 3 | Account | Guest checkout cho phép, nhưng có **loyalty points** khuyến khích đăng ký |

### 0.3 6 Danh mục sản phẩm chính (categories)
1. **RACKETS** — Vợt cầu lông (phức tạp nhất, có stringing service)
2. **SHOES** — Giày cầu lông (size, width)
3. **APPAREL** — Quần áo (size, color, gender)
4. **SHUTTLECOCKS** — Cầu lông (speed, feather/nylon, pack size)
5. **STRINGS** — Dây vợt (gauge, tension recommend)
6. **ACCESSORIES** — Phụ kiện (bags, grips, towels, wristbands...)

---

## 1. Catalog & Sản phẩm

### 1.1 Cấu trúc Product–Variant–SKU
- **Product** = đại diện 1 model (vd: "Astrox 88D Pro")
- **Variant** = 1 SKU cụ thể có giá riêng + tồn kho riêng
  - Vợt: variant theo `(grip size, weight)` → vd: "Astrox 88D Pro 4U G5", "Astrox 88D Pro 3U G4"
  - Giày: variant theo `(size, color)` → "Power Cushion 65Z3 - 42 EU - Red"
  - Quần áo: variant theo `(size, color, gender)`
  - Cầu: variant theo `(speed, pack)` → "Aerosena 50 - Speed 77 - 12 quả"
  - Dây: thường 1 variant duy nhất (theo cuộn 10m hoặc box) trừ khi có màu khác nhau
  - Accessories: thường 1 variant, một số có `color`/`size`

### 1.2 Quy tắc đặc thù từng category

#### 🏸 RACKETS (vợt) — phức tạp nhất
**Bắt buộc có các thuộc tính (spec):**
- `weight` enum: `2U` (90–94g), `3U` (85–89g), `4U` (80–84g), `5U` (75–79g), `F` (under 75g)
- `gripSize` enum: `G2` (lớn nhất) → `G3`, `G4`, `G5`, `G6` (nhỏ nhất)
- `flex` enum: `STIFF` / `MEDIUM` / `FLEXIBLE`
- `playStyle` enum: `POWER_HEAD_HEAVY` / `SPEED_HEAD_LIGHT` / `CONTROL_EVEN_BALANCE`
- `skillLevel` enum: `BEGINNER` / `INTERMEDIATE` / `ADVANCED` / `PROFESSIONAL`
- `series` string: vd "Astrox", "Nanoflare", "Arcsaber", "Auraspeed", "Thruster"
- `maxTension` object: tension max theo từng weight, vd `{ "3U": 29, "4U": 28 }` (đơn vị lbs)
- `recommendedTension` string: vd "4U: 20–28 lbs"
- `frameMaterial` string: vd "HM Graphite / Tungsten"
- `shaftMaterial` string: vd "HM Graphite / Namd"
- `technologies` array: tham chiếu tới bảng `Technology` (vd: "Rotational Generator System")

**Quy tắc giá:**
- Vợt được bán **"naked"** (chưa có dây) trừ khi khách chọn stringing service.
- Giá hiển thị = giá vợt chưa căng dây.
- Khi chọn stringing → giá dây cộng vào, công căng dây = **miễn phí** (per quyết định 0.2).

#### 👟 SHOES (giày)
- `size`: enum theo nhiều hệ — lưu cả `EU`, `US`, `CM` (vd: "42 EU / 9 US / 26.5 CM")
- `width`: `NARROW` / `STANDARD` / `WIDE`
- `color`: string
- `gender`: `MEN` / `WOMEN` / `UNISEX`
- `technologies` array: vd "Power Cushion+", "Round Sole"

#### 👕 APPAREL (quần áo)
- `size`: `XS` / `S` / `M` / `L` / `XL` / `XXL` / `XXXL`
- `color`: string
- `gender`: `MEN` / `WOMEN` / `UNISEX` / `KIDS`
- `type`: `SHIRT` / `SHORTS` / `SKIRT` / `JACKET` / `SOCKS`

#### 🏸 SHUTTLECOCKS (cầu)
- `speed` enum: `75` / `76` / `77` / `78` / `79` (số tốc độ — cao = bay xa)
  - **Quy tắc gợi ý theo nhiệt độ VN:** 76–77 cho miền Bắc mùa đông, 77–78 quanh năm cho miền Nam.
- `material` enum: `FEATHER_GOOSE` / `FEATHER_DUCK` / `NYLON`
- `grade` enum: `TOURNAMENT` / `TRAINING` / `PRACTICE`
- `packSize` int: số quả / ống (thường 12) — có thể có box 6 ống (72 quả)
- **Lưu ý:** cầu là consumable → khuyến khích combo "mua 6 ống tặng 1 ống" hoặc giá box ưu đãi.

#### 🧵 STRINGS (dây vợt)
- `gauge` float: 0.61 – 0.70 mm (mỏng = repulsion cao, dày = bền)
- `material` enum: `MULTIFILAMENT` / `MONOFILAMENT` / `HYBRID`
- `repulsion` int 1–5 (sức bật)
- `durability` int 1–5 (độ bền)
- `controlRating` int 1–5
- `recommendedTension` string: vd "20–28 lbs"
- `length` int: mặc định 10m (đủ căng 1 vợt)

#### 🎒 ACCESSORIES
- Variant tùy mặt hàng, đơn giản hơn các loại trên.
- Một số mặt hàng (grip, overgrip, towel...) là consumable → hỗ trợ "Subscribe & Save" sau này.

### 1.3 Status & Visibility sản phẩm
| Status | Hiển thị FE | Cho phép thêm vào cart | Ghi chú |
|--------|-------------|----------------------|---------|
| `DRAFT` | ❌ | ❌ | Admin đang soạn |
| `ACTIVE` | ✅ | ✅ (nếu còn stock) | Trạng thái chính |
| `OUT_OF_STOCK` | ✅ (badge "Hết hàng") | ❌ | Cho phép wishlist + notify khi có hàng |
| `DISCONTINUED` | ⚠️ (chỉ hiện trong order history) | ❌ | Không xuất hiện trong listing/search |
| `ARCHIVED` | ❌ | ❌ | Ẩn hoàn toàn |

**Quy tắc:** product không thể xóa cứng nếu đã có order → chuyển sang `ARCHIVED` để bảo toàn lịch sử đơn hàng.

### 1.4 Featured / New Arrival / Best Seller
- `isFeatured` (bool, admin set tay): hiển thị ở homepage hero / banner
- `isNewArrival` (bool, **auto-set** khi `createdAt` < 30 ngày): hiển thị badge "NEW ARRIVAL"
- `isBestSeller` (computed): top 10 sản phẩm có `totalSold` cao nhất trong 90 ngày qua. Cron job chạy hàng ngày 02:00.

### 1.5 Naming conventions (UX brand)
| Standard term | VOLTA term hiển thị |
|---|---|
| Cart | "Tactical Kit" / "Giỏ hàng" |
| Add to Cart | "ADD TO TACTICAL KIT" / "THÊM VÀO GIỎ" |
| Checkout | "EXECUTE ORDER ⚡" / "ĐẶT HÀNG" |
| Standard Shipping | "Standard Delivery" / "Giao tiêu chuẩn" |
| Express Shipping | "Express Velocity" / "Giao hỏa tốc" |

---

## 2. Custom Stringing Service — Quy tắc đặc thù

> Đây là **điểm khác biệt lớn nhất** giữa shop cầu lông và shop e-commerce thông thường. Phải implement đúng.

### 2.1 Khi nào áp dụng
Chỉ áp dụng cho **category RACKETS**. Trên trang Product Detail của vợt, khách thấy 3 lựa chọn:

1. **MUA VỢT TRƠN (Naked)** — không căng dây, ship vợt rỗng.
2. **CĂNG DÂY MIỄN PHÍ (Free Stringing)** — chọn dây + tension, shop căng trước khi ship.
3. **MUA VỢT + DÂY RIÊNG (chưa căng)** — vợt + cuộn dây để khách tự đem đi căng, không tính công.

### 2.2 Form chọn stringing (UI rules)
Khi khách chọn option 2 (Free Stringing), bắt buộc 3 input:

| Input | Loại | Validation |
|-------|------|-----------|
| **String type** | Dropdown — chỉ hiện strings đang `ACTIVE` và `inStock > 0` | Required |
| **Tension (lbs)** | Number stepper (bước 0.5 lbs) | Required, integer hoặc 0.5; phải nằm trong khoảng `[minTension, maxTension]` của vợt + dây |
| **Grip / Overgrip** | Dropdown optional (mặc định "Original grip") | Optional |

### 2.3 Compatibility check
- `chosenTension` phải `<= min(racket.maxTension[weight], string.maxTension)`
  - vd: vợt 4U max 28 lbs, dây BG80 max 30 lbs → max là 28.
- Nếu khách chọn `tension` vượt mức cho phép → BE trả 422 với message: *"Tension X lbs vượt mức an toàn của vợt này (max Y lbs ở weight Zu). Có thể gãy vợt."*
- FE phải show warning ngay khi user gõ (client-side validation).

### 2.4 Recommended pairings
- Mỗi vợt có field `recommendedStrings: string[]` (array string SKU/ID) — admin set.
- Trên UI hiển thị "🌟 Recommended: BG80" làm option đầu tiên.
- Mỗi loại dây có `recommendedTensionRange: { min, max, default }` để pre-fill cho user.

### 2.5 Lead time
- Đơn có stringing → cộng thêm **+1 ngày** vào lead time (để shop căng dây).
- Hiển thị trên checkout: *"Đơn có căng dây — giao trong X–Y ngày"*

### 2.6 Quy tắc không cho phép
- ❌ Không cho phép đổi/trả vợt đã căng dây (trừ khi lỗi sản phẩm) — đã căng coi như đã sử dụng.
- ❌ Không cho phép sửa string/tension sau khi đơn chuyển sang `PROCESSING` (vì đã bắt đầu căng).
- ⚠️ Nếu dây hết hàng giữa lúc đơn đang `CONFIRMED` → admin liên hệ user đổi dây khác hoặc cancel + refund.

### 2.7 Pricing logic
```
Final racket price = racket.basePrice (giá vợt trơn)
  + (string.price if user chose stringing else 0)
  + 0 (công căng dây = miễn phí)
```
Hiển thị breakdown trên cart:
```
Astrox 88D Pro (4U G5)        1.250.000₫
  └─ String: BG80 @ 26 lbs    +  180.000₫
─────────────────────────────────────────
Subtotal                       1.430.000₫
```

---

## 3. Inventory & Stock

### 3.1 Stock được track ở cấp Variant
- `productVariant.stock` (int, >= 0)
- Không có khái niệm "product stock" — luôn sum từ variants.

### 3.2 Reserved stock khi user đang checkout
**Lý do:** tránh race condition khi 2 user cùng mua sản phẩm cuối cùng.

| Event | Action |
|-------|--------|
| User submit checkout form (chưa thanh toán) | Tạo `Order` status = `PENDING`, **decrement stock** ngay |
| Thanh toán thành công | Status = `CONFIRMED`, stock đã được trừ từ trước |
| Thanh toán thất bại / timeout (15 phút) | Status = `CANCELLED`, **rollback stock** (+= back) |
| User hủy đơn hàng (khi `PENDING`/`CONFIRMED`) | Rollback stock |
| Admin hủy đơn | Rollback stock |

**Implementation note:** dùng DB transaction + row-level lock (`SELECT ... FOR UPDATE`) khi trừ stock để tránh oversell.

### 3.3 Low stock & Out of stock
| Stock level | Display | Cho phép mua? |
|------|---------|--------------|
| `> 10` | (không hiện) | ✅ |
| `1–10` | Badge "Chỉ còn X cái" (urgency) | ✅ |
| `= 0` | Badge "Hết hàng" + button "Thông báo khi có hàng" | ❌ |

### 3.4 Pre-order / Back-order
- **Phase 1 (MVP): không hỗ trợ.** Hết hàng = không mua được.
- Phase 2: thêm flag `allowBackorder` cho phép đặt trước, ship khi có hàng.

### 3.5 Stock cho stringing
- Khi căng vợt → trừ 1 từ `string.stock` (theo số cuộn 10m).
- Stock dây cũng phải đủ trước khi confirm đơn.

---

## 4. Giá & Khuyến mãi

### 4.1 Pricing model
- `basePrice` — giá gốc
- `salePrice` (nullable) — giá khuyến mãi. Nếu có → hiển thị gạch ngang basePrice và in đậm salePrice.
- `salePrice` phải `<= basePrice` (validation).
- `salePrice` có thể có `saleStartDate` / `saleEndDate` để tự động bật/tắt.

### 4.2 Coupon (mã giảm giá)
| Field | Quy tắc |
|-------|---------|
| `type` | `PERCENTAGE` (vd 10% off) hoặc `FIXED_AMOUNT` (vd -100k) |
| `value` | Nếu PERCENTAGE: 1–100. Nếu FIXED: VND > 0 |
| `minOrderAmount` | Đơn tối thiểu, vd 500.000₫ |
| `maxDiscount` | Trần giảm cho PERCENTAGE, vd "giảm 10% tối đa 200k" |
| `usageLimit` | Tổng số lần dùng được, global |
| `usagePerUser` | Số lần 1 user dùng được (default = 1) |
| `usedCount` | Counter, increment mỗi lần dùng thành công |
| `startDate` / `endDate` | Cửa sổ hiệu lực |
| `applicableCategories` | Optional, vd: chỉ áp dụng cho RACKETS |
| `applicableProducts` | Optional, danh sách product ID cụ thể |
| `excludeSaleItems` | Bool — true thì không áp dụng cho item đã sale |

**Quy tắc áp dụng:**
- 1 đơn chỉ áp dụng **1 coupon** (Phase 1).
- Coupon được apply trên `subtotal` (sau khi đã sale, trước shipping & tax).
- Nếu coupon không thỏa mãn `minOrderAmount` → error: *"Đơn tối thiểu 500.000₫ để dùng mã này"*

### 4.3 Free shipping threshold
- Đơn `subtotal >= 1.500.000₫` → **free Standard Delivery**.
- Express vẫn tính phí (25.000–50.000₫).
- Threshold này configurable trong admin settings.

### 4.4 Bundle / Combo deals
- Phase 2 feature, không MVP.
- Idea: "Vợt + Giày + Túi" combo giảm 10%, hoặc "Mua 6 ống cầu tặng 1 ống".

---

## 5. Loyalty Points (VOLTA Points)

### 5.1 Quy tắc tích điểm
- **Chỉ user đã đăng ký** mới được tích điểm. Guest checkout không tích.
- **Tỉ lệ:** mỗi **10.000₫ chi tiêu = 1 điểm** (làm tròn xuống). 1 điểm = 1.000₫ khi đổi.
- Điểm tích từ `subtotal sau giảm giá, không tính shipping/tax`.
- Điểm được cộng vào account **sau khi đơn `COMPLETED`** (sau ngày hết hạn return = 7 ngày sau DELIVERED).
- Điểm có **hạn sử dụng 12 tháng** kể từ ngày tích. Hết hạn → bị thu hồi.

### 5.2 Đổi điểm
- Mỗi đơn được dùng tối đa **50% subtotal** bằng điểm (tránh dùng hết một lần).
- Không combine được với coupon trong cùng 1 đơn (chọn 1 trong 2).
- 1 điểm = 1.000₫. Vd: 50 điểm = 50.000₫ giảm.

### 5.3 Tier system (đề xuất — có thể bỏ nếu muốn đơn giản)
| Tier | Yêu cầu (chi tiêu 12 tháng) | Quyền lợi |
|------|------------------------------|-----------|
| **Bronze** | 0 – 5.000.000₫ | Tích 1x điểm |
| **Silver** | 5.000.000 – 15.000.000₫ | Tích 1.5x điểm, ưu tiên hỗ trợ |
| **Gold** | > 15.000.000₫ | Tích 2x điểm, free Express delivery, priority stringing |

> **🔸 Cần bạn quyết định:** Có muốn implement tier system ngay từ MVP không, hay chỉ làm flat points trước?

### 5.4 Events trigger tích điểm
- Đơn `COMPLETED` → tích điểm theo subtotal.
- Đăng ký tài khoản lần đầu → tặng **10 điểm** (10.000₫) welcome.
- Verify email → tặng thêm 5 điểm.
- Review sản phẩm có ảnh + ≥ 50 từ → tặng 2 điểm.
- Sinh nhật user → tặng 20 điểm (cron job hàng ngày).

---

## 6. Tìm kiếm & Lọc

### 6.1 Search rules
- Search trên các field: `product.name`, `product.shortDescription`, `product.series`, `brand.name`, `category.name`.
- Sử dụng **full-text search PostgreSQL** (Phase 1) hoặc Elasticsearch (Phase 2).
- Hỗ trợ typo tolerance cơ bản (vd "astrocs" → "astrox" via trigram).
- Search result phải có **highlight** từ khóa.
- Search query phải log lại (table `search_logs`) để analytics & gợi ý popular searches.

### 6.2 Filter cho RACKETS (sidebar)
| Filter | Type | Source |
|--------|------|--------|
| Skill Level | Multi-select checkbox | enum: BEGINNER, INTERMEDIATE, ADVANCED, PROFESSIONAL |
| Play Style | Multi-select checkbox | enum: POWER_HEAD_HEAVY, SPEED_HEAD_LIGHT, CONTROL_EVEN_BALANCE |
| Series | Multi-select | distinct values từ DB |
| Weight & Grip | Pill toggles | enum kết hợp: "3U G4", "4U G5"... |
| Flex | Multi-select | STIFF / MEDIUM / FLEXIBLE |
| Brand | Multi-select | distinct brands |
| Price Range | Slider | min–max từ DB |

### 6.3 Filter cho SHOES
- Size, Width, Color, Brand, Price Range, Gender

### 6.4 Filter cho APPAREL
- Size, Color, Gender, Type, Brand, Price Range

### 6.5 Filter cho SHUTTLECOCKS
- Speed (75–79), Material, Grade, Pack Size, Brand, Price Range

### 6.6 Filter cho STRINGS
- Gauge range, Material, Repulsion ≥ X, Durability ≥ X, Brand, Price Range

### 6.7 Sort options
- `Mặc định` — Newest Arrivals (createdAt DESC)
- `Bán chạy` — totalSold DESC
- `Giá thấp → cao` — effectivePrice ASC (effective = salePrice ?? basePrice)
- `Giá cao → thấp` — effectivePrice DESC
- `Đánh giá cao` — avgRating DESC, totalReviews DESC

### 6.8 URL state
- Filter + sort + page **phải reflect trong URL query params** (`?skill=PRO&style=POWER&sort=price_asc&page=2`).
- Refresh / share link / browser back đều hoạt động đúng.

### 6.9 Pagination
- Page size mặc định: **24 sản phẩm/trang** (chia hết 3 cột grid).
- Hiển thị: `< 1 2 3 ... 10 >`.
- Có toggle xem 24 / 48 / 96 per page (user preference, lưu localStorage).

---

## 7. Giỏ hàng (Cart / Tactical Kit)

### 7.1 Guest cart vs User cart
- **Guest cart:** lưu trong `localStorage` của browser, không sync server.
- **User cart:** lưu trong DB (`Cart` + `CartItem`), persistent qua devices.

### 7.2 Cart merge khi đăng nhập
Khi guest login:
1. Lấy local cart từ localStorage.
2. Lấy user cart từ server.
3. Merge: nếu trùng `(productId, variantId, stringingConfig)` → cộng quantity (nhưng không vượt stock).
4. Lưu merged cart lên server, clear localStorage.

### 7.3 Cart item structure
```
CartItem {
  productId, variantId, quantity,
  // Nếu là vợt có stringing:
  stringing?: {
    stringId, tension, gripChoice?, includeStringingService: boolean
  }
}
```

### 7.4 Quantity rules
- Min: 1. Max per item: **5** (tránh người mua sỉ qua kênh retail).
- Stock check: quantity không được vượt `variant.stock`.
- Sản phẩm `OUT_OF_STOCK` không add được; nếu đã có trong cart mà sau đó hết hàng → giữ trong cart nhưng disable checkbox checkout với badge "Hết hàng".

### 7.5 Cart expiry
- User cart: không expire, giữ vô thời hạn.
- Guest cart localStorage: 30 ngày, sau đó clear.

### 7.6 Cart total calculation
```
itemSubtotal = sum(variant.effectivePrice * quantity + stringing.stringPrice if any)
cartSubtotal = sum(itemSubtotal)
shippingFee = calculateShipping(cartSubtotal, address, method)
discount = calculateCoupon(cartSubtotal) + pointsRedemption
tax = (cartSubtotal - discount) * 10% / 110%   // VAT đã trong giá
total = cartSubtotal + shippingFee - discount
```

### 7.7 Cart abandonment
- Sau **24h** từ lần update cuối, nếu user chưa checkout → gửi email "Bạn quên gì trong giỏ?".
- Sau **72h** → gửi email lần 2 kèm mã giảm 5%.
- (Phase 2 feature, không MVP)

---

## 8. Checkout & Đặt hàng

### 8.1 Checkout flow (single-page như Figma)
Tất cả trong 1 trang `/checkout`:
1. **Cart Review** — show items, cho phép edit quantity / xóa.
2. **Shipping Destination** — form địa chỉ.
3. **Shipping Method** — Standard / Express.
4. **Payment Method** — COD / VNPay / MoMo / Bank Transfer.
5. **Order Summary** (sticky panel bên phải).
6. **Coupon / Loyalty Points** — input mã + slider chọn dùng bao nhiêu điểm.
7. **Place Order** ("EXECUTE ORDER ⚡").

### 8.2 Address rules (Việt Nam)
| Field | Required | Validation |
|-------|----------|-----------|
| `fullName` | ✅ | 2–50 chars |
| `phone` | ✅ | Regex VN: `^(0\|\+84)[3-9]\d{8}$` |
| `province` | ✅ | Dropdown (63 tỉnh/TP) |
| `district` | ✅ | Dropdown, depend on province |
| `ward` | ✅ | Dropdown, depend on district |
| `addressLine` | ✅ | Số nhà, tên đường, 5–200 chars |
| `note` | ❌ | Tối đa 500 chars |

**Address book:** user đã đăng ký có thể lưu nhiều địa chỉ, đánh dấu 1 cái default. Guest phải gõ lại mỗi lần.

### 8.3 Order validation (server-side, before creating Order)
Phải re-check tất cả những thứ sau (không tin client):
- Mỗi item: variant còn ACTIVE, stock đủ.
- Vợt có stringing: tension hợp lệ, string còn stock.
- Coupon: còn hạn, chưa hết lượt, đơn đạt minOrderAmount.
- Loyalty points: user có đủ điểm.
- Address: hợp lệ.
- Tổng tiền BE tính phải khớp client gửi lên ± 1₫ (rounding). Nếu lệch → error 409, force refresh cart.

### 8.4 Order code format
- Format: `VLT-{YYYYMMDD}-{6 random uppercase alphanumeric}`
- Vd: `VLT-20260605-A7K2QM`
- Unique constraint trên DB.

### 8.5 Order status lifecycle
```
PENDING ────► CONFIRMED ────► PROCESSING ────► READY_TO_SHIP ────► SHIPPING ────► DELIVERED ────► COMPLETED
   │             │                  │                                   │             │
   │             └──► CANCELLED ◄───┘ (khách hủy hoặc admin hủy)        │             │
   │                                                                    │             │
   └──► CANCELLED (timeout 15p hoặc payment fail)                       └──► RETURN_REQUESTED ──► RETURNED / REFUNDED
```

| Status | Mô tả | User cancel? | Admin cancel? |
|--------|------|-----------|--------------|
| `PENDING` | Vừa tạo, chờ thanh toán (online) hoặc xác nhận (COD) | ✅ | ✅ |
| `CONFIRMED` | Đã thanh toán / COD đã confirm qua phone | ✅ | ✅ |
| `PROCESSING` | Đang đóng gói / căng dây | ❌ | ⚠️ (chỉ trong 2h đầu) |
| `READY_TO_SHIP` | Đã đóng gói, chờ pickup vận chuyển | ❌ | ⚠️ |
| `SHIPPING` | Đang giao | ❌ | ❌ |
| `DELIVERED` | Đã nhận hàng | ❌ | ❌ |
| `COMPLETED` | Quá 7 ngày sau DELIVERED, không có return → final | ❌ | ❌ |
| `CANCELLED` | Đã hủy, rollback stock | — | — |
| `RETURN_REQUESTED` | User yêu cầu trả | — | — |
| `RETURNED` | Đã nhận lại hàng, đang refund | — | — |
| `REFUNDED` | Đã hoàn tiền | — | — |

### 8.6 Order item snapshot
Khi tạo Order, snapshot các field sau (vì product có thể thay đổi sau này):
- `productName`, `productImage`, `variantName`
- `price` (giá tại thời điểm đặt — không bị ảnh hưởng nếu sale thay đổi)
- `stringingDetails` (string name, tension, etc.)

### 8.7 Order timeline
Mỗi đơn có bảng `OrderStatusHistory` log mọi status change với `changedBy` (user/admin/system) + `timestamp` + `note`. Hiển thị timeline trên trang order detail.

---

## 9. Thanh toán (Payment)

### 9.1 Payment methods (VN)
| Method | Code | Khi nào dùng | Confirm |
|--------|------|-------------|---------|
| **COD** | `CASH_ON_DELIVERY` | Đơn `<= 5.000.000₫`, ship nội địa | Phone confirm trong 24h |
| **VNPay** | `VNPAY` | Bất kỳ đơn nào | Redirect → callback |
| **MoMo** | `MOMO` | Bất kỳ đơn nào | Redirect → callback |
| **Bank Transfer** | `BANK_TRANSFER` | Bất kỳ đơn nào | Manual confirm by admin (sau khi nhận tiền) |

> **Quy tắc đặc biệt cho COD:** chỉ áp dụng cho đơn `<= 5.000.000₫`. Đơn cao hơn bắt buộc thanh toán online (giảm rủi ro bom hàng).

### 9.2 Payment status flow
```
PENDING ──► PAID (thành công)
   │
   ├──► FAILED (thất bại từ gateway)
   │
   └──► EXPIRED (timeout 15 phút không thanh toán)
        │
        └──► sau khi paid manually (BANK_TRANSFER) ──► PAID
```

### 9.3 Payment timeout
- Đơn `PENDING` chờ payment quá **15 phút** → auto cancel + rollback stock.
- COD: timeout là **24h** chờ admin confirm phone call.

### 9.4 Webhook security
- VNPay/MoMo gửi callback về `POST /api/payment/webhook/{provider}`.
- **Bắt buộc verify signature** theo doc gateway (HMAC-SHA512 hoặc tương đương).
- Idempotency: nhận callback trùng phải xử lý đúng (không double-confirm).

### 9.5 Refund rules
- Đơn `CANCELLED` sau khi đã `PAID` → auto-refund qua cùng gateway.
- Lead time refund: VNPay/MoMo: 3–7 ngày làm việc. Bank transfer: 1–3 ngày.
- COD đã giao rồi return → chuyển khoản hoàn về tài khoản user (user phải cung cấp STK).
- Refund partial (khi return 1 phần đơn) hỗ trợ ở Phase 2.

---

## 10. Vận chuyển (Shipping)

### 10.1 Shipping zones (VN)
| Zone | Tỉnh/TP | Standard lead time | Express lead time |
|------|---------|-------------------|------------------|
| **Zone 1 — Nội thành lớn** | HCM, HN | 1–2 ngày | Same day / Next day |
| **Zone 2 — Thành phố lớn** | Đà Nẵng, Hải Phòng, Cần Thơ, Biên Hòa, Vũng Tàu | 2–3 ngày | Next day |
| **Zone 3 — Tỉnh thành** | Còn lại trừ vùng sâu | 3–5 ngày | 2 ngày |
| **Zone 4 — Vùng sâu vùng xa** | Hà Giang, Cao Bằng, Điện Biên, Côn Đảo... | 5–7 ngày | Không hỗ trợ |

### 10.2 Shipping methods & fees
| Method | Zone 1 | Zone 2 | Zone 3 | Zone 4 |
|--------|--------|--------|--------|--------|
| **Standard Delivery** | 25.000₫ | 35.000₫ | 45.000₫ | 60.000₫ |
| **Express Velocity** | 50.000₫ | 70.000₫ | 90.000₫ | — |

**Free Standard** khi subtotal `>= 1.500.000₫` (per quyết định 4.3).

### 10.3 Lead time với stringing
- Cộng thêm **+1 ngày** vào lead time nếu đơn có stringing service.
- Hiển thị rõ trên checkout: *"Đơn có căng dây → giao trong 2–3 ngày (Zone 1)"*

### 10.4 Tracking
- Mỗi order có `trackingNumber` (sau khi chuyển status sang SHIPPING).
- Integrate API GHN / J&T / Giao Hàng Tiết Kiệm để get realtime status (Phase 2).
- Phase 1: admin gõ tay tracking number, gửi email cho user kèm link tracking của hãng vận chuyển.

### 10.5 Failed delivery
- Giao 3 lần không thành công → chuyển status sang `RETURN_TO_SENDER`.
- Admin liên hệ user; nếu user vẫn muốn nhận → tính phí giao lại.
- Nếu user từ chối → refund (trừ phí ship đi + về).

---

## 11. Trả hàng & Hoàn tiền (Return & Refund)

### 11.1 Return eligibility
| Sản phẩm | Có được trả không? |
|----------|------------------|
| Vợt chưa căng dây | ✅ nếu còn nguyên seal + tem |
| **Vợt đã căng dây** | ❌ trừ khi lỗi sản phẩm (gãy, lỗi NSX) |
| Giày | ✅ nếu chưa sử dụng, còn tem, còn box |
| Quần áo | ✅ nếu chưa giặt, còn tem, đổi size 1 lần |
| Cầu lông | ❌ trừ khi lỗi (rách, đứng cầu sai) |
| Dây vợt | ❌ nếu đã mở seal |
| Phụ kiện | Tùy mặt hàng, mặc định ✅ nếu còn nguyên |

### 11.2 Return time window
- **7 ngày** kể từ ngày `DELIVERED`.
- Vượt 7 ngày → status đơn auto chuyển `COMPLETED`, không return được.

### 11.3 Return process
1. User vào order detail, click "Yêu cầu trả hàng" → form chọn lý do + upload ảnh (bắt buộc nếu hàng lỗi).
2. Order status: `DELIVERED` → `RETURN_REQUESTED`.
3. Admin review trong 24h, approve hoặc reject với lý do.
4. Approved → cung cấp địa chỉ trả, lead time pickup.
5. Shop nhận hàng, check chất lượng.
6. OK → status `RETURNED` → refund.
7. Refund qua kênh thanh toán gốc (xem §9.5).

### 11.4 Return reasons (enum)
- `WRONG_ITEM` — Sai sản phẩm
- `DEFECTIVE` — Hàng lỗi/hư
- `WRONG_SIZE` — Sai size (chỉ áp dụng giày/áo)
- `NOT_AS_DESCRIBED` — Không giống mô tả
- `CHANGED_MIND` — Đổi ý (không hoàn shipping)
- `DAMAGED_SHIPPING` — Hư trong vận chuyển

### 11.5 Refund amount calculation
| Lý do | Refund amount |
|------|--------------|
| `WRONG_ITEM`, `DEFECTIVE`, `DAMAGED_SHIPPING` | 100% (item + shipping) |
| `WRONG_SIZE`, `NOT_AS_DESCRIBED` | 100% item, không hoàn shipping |
| `CHANGED_MIND` | 100% item, không hoàn shipping, user chịu phí ship trả |

### 11.6 Refund cho stringing
- Vợt đã căng dây → không refund tiền dây (vì đã căng = đã dùng).
- Trừ trường hợp dây bị lỗi (đứng dây ngay khi mở seal).

---

## 12. Đánh giá (Review)

### 12.1 Quyền review
- **Chỉ user đã đăng ký** mới review được (guest không).
- **Verified Buyer**: chỉ user đã có order `DELIVERED` cho sản phẩm đó mới review được. (Hiển thị badge "✓ Đã mua hàng")
- 1 user × 1 product × 1 order = **1 review** (không spam).
- User có thể edit review trong **7 ngày** sau khi post, sau đó frozen.
- User có thể xóa review của mình bất cứ lúc nào.

### 12.2 Review structure
- `rating`: int 1–5 ⭐ — required
- `title`: string 5–100 chars — required
- `comment`: string 10–2000 chars — required
- `images`: array URL, max 5 ảnh, mỗi ảnh max 5MB — optional
- `pros` / `cons`: string optional

### 12.3 Moderation
- Review **phải qua duyệt** admin trước khi public (`isApproved = false` mặc định).
- Auto-flag nếu chứa từ ngữ tục, link spam (regex blacklist).
- Admin có thể approve / reject với lý do (gửi email cho user).
- SLA duyệt: trong vòng 48h.

### 12.4 Rating calculation
- `product.avgRating` = AVG(approved reviews' rating), làm tròn 1 chữ số (vd: 4.5).
- `product.totalReviews` = COUNT(approved reviews).
- Tính lại realtime mỗi khi review được approve/delete.
- Distribution: hiển thị thanh % theo từng sao (5★: 60%, 4★: 25%, ...)

### 12.5 Helpful votes
- User khác có thể "like" review (👍 helpful) — max 1 vote per user per review.
- Sort review theo: Mới nhất / Có ích nhất / Rating cao→thấp / Rating thấp→cao.

---

## 13. Wishlist & Notifications

### 13.1 Wishlist rules
- **Chỉ user đăng ký** (guest dùng localStorage tạm).
- Không giới hạn số lượng.
- Thêm/xóa từ Product Detail page (heart icon).
- Sản phẩm sold-out vẫn add wishlist được.

### 13.2 Notification types
| Type | Trigger | Channel |
|------|---------|---------|
| `ORDER_CONFIRMED` | Order chuyển CONFIRMED | Email + In-app |
| `ORDER_PROCESSING` | Đang xử lý | In-app |
| `ORDER_SHIPPED` | Có tracking | Email + In-app |
| `ORDER_DELIVERED` | Đã giao | Email + In-app |
| `ORDER_CANCELLED` | Hủy | Email + In-app |
| `RETURN_APPROVED` / `REJECTED` | Admin xử lý return | Email + In-app |
| `PAYMENT_SUCCESS` / `FAILED` | Callback gateway | Email + In-app |
| `BACK_IN_STOCK` | Wishlist item từ OUT_OF_STOCK → ACTIVE | Email + In-app |
| `PRICE_DROP` | Wishlist item có salePrice mới | Email + In-app |
| `LOW_STOCK_WISHLIST` | Wishlist item stock < 5 | In-app |
| `NEW_REVIEW_RESPONSE` | Admin reply review | In-app |
| `POINTS_EARNED` | Tích điểm | In-app |
| `POINTS_EXPIRING` | 30 ngày trước khi điểm hết hạn | Email + In-app |
| `PROMOTION` | Coupon mới, sale | Email + In-app |

### 13.3 Email preferences
- User có thể tắt từng loại email (trừ ORDER_* là transactional bắt buộc).
- Marketing emails phải có link unsubscribe (luật anti-spam).

---

## 14. User Account

### 14.1 Registration
- Email + password (min 8 chars, ít nhất 1 số + 1 chữ).
- Hoặc social login (Google, Facebook) — Phase 2.
- Email verification trong **24h**, sau đó token expire.
- Chưa verify vẫn login & mua được, nhưng có banner "Verify email để nhận 5 điểm".

### 14.2 Password rules
- Min 8 ký tự, có ít nhất 1 chữ + 1 số.
- Khuyến khích nhưng không bắt buộc: ký tự đặc biệt.
- Hash bcrypt với salt rounds 12+.
- Reset password: gửi link qua email, token expire 1h.
- Lịch sử password: không cho dùng lại 3 password gần nhất (Phase 2).

### 14.3 Account states
- `ACTIVE` — bình thường
- `EMAIL_UNVERIFIED` — đã đăng ký, chưa verify
- `SUSPENDED` — admin tạm khóa (vd: gian lận, bom hàng nhiều lần). Không login được.
- `DELETED` — soft delete. Giữ data 90 ngày để khôi phục nếu user yêu cầu, sau đó hard delete.

### 14.4 Quy tắc anti-fraud cơ bản
- 1 IP đăng ký quá 3 account/24h → captcha + delay.
- 1 phone number = 1 account.
- COD bom hàng > 3 lần → suspend, không cho COD nữa, bắt buộc trả trước.

---

## 15. Admin Operations

### 15.1 Role-based access
| Role | Quyền |
|------|------|
| `USER` | Mua hàng, review, manage account |
| `STAFF` | Xử lý đơn hàng, customer service, review moderation |
| `ADMIN` | Tất cả + product/inventory/coupon management |
| `SUPER_ADMIN` | Tất cả + user management + settings |

### 15.2 Order processing SLA
| Status | Time limit |
|--------|-----------|
| PENDING → CONFIRMED (online paid) | Auto, < 1 phút |
| PENDING → CONFIRMED (COD) | Phone confirm trong 24h, sau đó auto-cancel |
| CONFIRMED → PROCESSING | Bắt đầu trong 24h ngày làm việc |
| PROCESSING → READY_TO_SHIP | Trong 48h (có stringing: 72h) |
| SHIPPED → DELIVERED | Theo zone (xem §10) |

### 15.3 Stock management
- Admin import stock qua Excel/CSV (Phase 2) hoặc edit tay.
- Mỗi lần thay đổi stock log lại trong `StockMovement` (audit trail).
- Low stock alert: gửi email cho admin khi stock của bất kỳ variant nào < 5.

### 15.4 Coupon management
- Admin tạo, edit, deactivate. Không xóa cứng (giữ lịch sử).
- Có thể clone coupon cũ để tạo coupon mới nhanh.
- Export usage report (CSV).

### 15.5 Customer service
- Inbox tích hợp (Phase 2) hoặc chỉ email forwarding (Phase 1).
- Templates phản hồi thông dụng (chậm giao, đổi size, hỏi spec vợt).

### 15.6 Dashboard KPIs
- Doanh thu hôm nay / tuần / tháng / năm.
- Số đơn hàng theo status (donut chart).
- Top 10 sản phẩm bán chạy.
- Top 5 khách hàng theo chi tiêu.
- AOV (Average Order Value).
- Conversion rate (orders / unique visitors).
- Stringing jobs queue (đơn đang chờ căng dây).
- Low stock alerts.

---

## 16. Edge Cases & Validation Rules quan trọng

### 16.1 Concurrent stock decrement
**Vấn đề:** 2 user cùng mua sản phẩm cuối cùng.
**Giải pháp:** dùng DB transaction với row-level lock:
```sql
BEGIN;
SELECT stock FROM product_variants WHERE id = ? FOR UPDATE;
-- check stock >= quantity, nếu không → ROLLBACK + error
UPDATE product_variants SET stock = stock - ? WHERE id = ?;
INSERT INTO orders ...
COMMIT;
```

### 16.2 Price changes mid-cart
- User add product 1tr vào cart, admin đổi giá thành 1.2tr.
- Khi user load cart hoặc checkout: hiển thị "Giá sản phẩm X đã thay đổi từ 1.000.000₫ → 1.200.000₫" và yêu cầu xác nhận lại.
- Không tự động dùng giá cũ — fairness với shop, transparency với user.

### 16.3 Coupon đã hết lượt giữa lúc checkout
- User type coupon → BE validate OK → user delay 10p → submit order → coupon đã hết.
- BE re-validate coupon ở bước create order. Nếu hết → error 422, force user remove coupon, hiển thị message rõ.

### 16.4 Payment success nhưng stock hết (race condition)
- Hiếm vì stock đã trừ ở PENDING, nhưng có thể xảy ra nếu dùng webhook delayed.
- **Giải pháp:** confirm stock 1 lần nữa ngay trước khi mark PAID. Nếu hết → đánh dấu order `STOCK_FAILED`, refund auto.

### 16.5 Failed payment recovery
- User thanh toán fail → order PENDING.
- Trong 15 phút timeout, user có thể **retry** payment qua link trong email hoặc page "Đơn hàng của tôi".
- Sau 15p → auto cancel.

### 16.6 Stringing edge cases
- **Dây hết hàng sau khi đơn CONFIRMED** → status đơn pause, admin liên hệ user trong 24h:
  - User chọn dây khác → update order, ship sau khi căng xong.
  - User cancel → refund full.
- **Tension chọn sai** (vd user gõ 100 lbs) → client-side block + server-side reject.
- **User muốn căng lại sau khi nhận hàng** → không hỗ trợ online; user phải mang đến shop offline (out of scope).

### 16.7 Negative testing checklist
- Tạo order với quantity = 0 → reject.
- Tạo order với product không tồn tại → reject.
- Tạo order với variant của product khác → reject.
- Apply coupon hết hạn → reject.
- Apply coupon đã dùng (per user limit) → reject.
- Login với password sai 5 lần → lock account 15 phút.
- Đăng ký với email đã tồn tại → reject với message rõ (không leak email tồn tại — security).
- SQL injection trên search query → escape via ORM.
- XSS trên review comment → sanitize HTML server-side.
- CSRF trên mutation endpoints → check CSRF token.

### 16.8 Dữ liệu nhạy cảm
- Mật khẩu: hash bcrypt, KHÔNG log plaintext.
- Thông tin thẻ tín dụng: KHÔNG lưu trong DB; chỉ pass-through cho gateway.
- Số điện thoại: hiển thị partial trên UI public (vd "09xx xxx 678").
- Email user khác: không hiển thị (vd trong review chỉ show "Anh T.")

### 16.9 Data integrity
- Order đã `DELIVERED` → các field shipping address, items, total bị **frozen**, không edit được nữa.
- Product đã có order → không xóa cứng được, chỉ ARCHIVE.
- User đã có order → không xóa cứng, chỉ SOFT DELETE (giữ FK).

### 16.10 Performance budgets
- Page load (homepage, listing, detail): < 2s LCP.
- API response time: < 200ms p95 cho read, < 500ms p95 cho write.
- Database query: dùng index cho mọi WHERE clause hay sort field.
- Cache (Redis): product list (5 phút), product detail (10 phút), category tree (1h).

---

## 17. SEO & Content Rules

### 17.1 Product SEO
- `slug` unique, format: `astrox-88d-pro-4u`. Auto-generate từ name + key spec, có thể edit.
- `metaTitle`: 30–60 chars, format `{ProductName} | {Brand} | VOLTA`.
- `metaDescription`: 120–160 chars, có CTA mua hàng.
- Schema.org `Product` JSON-LD với price, availability, rating.
- Open Graph + Twitter Card tags.
- Canonical URL.

### 17.2 Category SEO
- Mỗi category có hero banner + intro text 200–500 từ (admin edit).
- Listing URL pattern: `/{category-slug}` (vd `/rackets`).
- Filter URL có canonical về `/{category-slug}` để tránh duplicate content.

### 17.3 Sitemap
- Auto-generate `sitemap.xml` hàng ngày.
- Include: homepage, categories, products (chỉ ACTIVE), athletes, technologies, blog (nếu có).
- Loại trừ: cart, checkout, account, admin.

---

## 18. Decisions cần bạn xác nhận (Open Questions)

Những điểm tôi đã giả định nhưng bạn có thể muốn điều chỉnh:

| # | Vấn đề | Giả định hiện tại | Lý do |
|---|--------|------------------|------|
| Q1 | **Loyalty Tier system** | Có 3 tier (Bronze/Silver/Gold) | Tăng engagement, nhưng phức tạp hơn. Có thể chỉ làm flat points trước. |
| Q2 | **Max quantity per item** | 5 | Tránh người bán sỉ trá hình. Có thể tăng/giảm. |
| Q3 | **Free shipping threshold** | 1.500.000₫ | Trung bình AOV shop cầu lông. Có thể điều chỉnh. |
| Q4 | **COD limit** | 5.000.000₫ | Giảm rủi ro bom hàng. Có thể tăng/giảm. |
| Q5 | **Return window** | 7 ngày | Chuẩn TMĐT VN. Một số shop cho 14–30 ngày. |
| Q6 | **Welcome bonus** | 10 điểm (10k VND) | Có thể tăng để khuyến khích đăng ký. |
| Q7 | **Points expiry** | 12 tháng | Cân bằng giữa engagement và liability. |
| Q8 | **Cart abandonment email** | 24h + 72h | Có thể chỉ làm 1 email. |
| Q9 | **Multi-language** | Chỉ tiếng Việt | Sau này muốn mở rộng tiếng Anh thì cần kiến trúc i18n từ đầu. |
| Q10 | **Stringing tự cung cấp dây** | Không hỗ trợ | Một số khách muốn đem dây của họ đến shop căng. Phase 2 có thể thêm. |
| Q11 | **Review with images** | Có, max 5 ảnh | Tăng trust nhưng tăng cost storage. |
| Q12 | **Subscribe & Save** (auto-reorder cầu) | Không có | Phase 2 feature thú vị. |

---

## 19. Phụ lục — Glossary thuật ngữ cầu lông

| Thuật ngữ | Giải thích |
|-----------|-----------|
| **Weight (U)** | Chỉ số trọng lượng vợt: 2U nặng nhất (90–94g), 5U nhẹ nhất (75–79g). |
| **Grip size (G)** | Kích cỡ cán vợt: G2 to nhất, G6 nhỏ nhất. Châu Á thường dùng G4–G6. |
| **Tension** | Độ căng dây, đơn vị **lbs** (pound). Càng cao càng kiểm soát tốt nhưng dễ đứt. Người mới: 20–24 lbs. Pro: 27–32 lbs. |
| **Flex** | Độ cứng cán vợt: Stiff (cứng, hợp power), Medium, Flexible (dẻo, hợp người mới). |
| **Head Heavy** | Đầu vợt nặng → đánh power tốt, smash mạnh. |
| **Head Light** | Đầu vợt nhẹ → vung nhanh, hợp đôi và phòng thủ. |
| **Even Balance** | Cân bằng → đa năng. |
| **Shaft** | Phần thân vợt nối đầu và cán. |
| **Stringing** | Quá trình căng dây vào khung vợt. |
| **Shuttle / Shuttlecock** | Quả cầu lông. |
| **Feather** | Cầu lông bằng lông vũ (ngỗng/vịt), dùng thi đấu. |
| **Nylon** | Cầu nhựa, dùng tập luyện. |
| **Speed (cầu)** | Số 75–79: tốc độ bay. Lạnh → speed cao (78–79), nóng → speed thấp (76–77). |
| **Gauge** | Đường kính dây, mm. Nhỏ = bật tốt nhưng dễ đứt. |
| **Overgrip** | Lớp quấn ngoài cán vợt, thay thường xuyên. |

---

*End of business logic spec — v1.0*

**Next step:** Sau khi bạn review file này, tôi sẽ giúp viết **prompt cụ thể cho AI** để code và test từng module theo đúng business rule ở đây. Đề xuất bắt đầu với module phức tạp nhất: **Custom Stringing** (§2) hoặc nền tảng nhất: **Product + Variant** (§1).
