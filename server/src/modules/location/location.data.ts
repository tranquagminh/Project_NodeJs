// Static VN administrative divisions — Levels: Province → District → Ward
// Source: Vietnam's Ministry of Home Affairs official division codes (GHN API compatible)
// Codes align with GHN (Giao Hàng Nhanh) shipping API — the de-facto standard for VN e-commerce

export interface Province {
  code: string;
  name: string;
  type: 'Thành phố Trung ương' | 'Tỉnh';
}

export interface District {
  code: string;
  name: string;
  provinceCode: string;
}

export interface Ward {
  code: string;
  name: string;
  districtCode: string;
}

// Top 10 most-populated provinces/cities (representative subset — full dataset via GHN API)
export const PROVINCES: Province[] = [
  { code: '01', name: 'Hà Nội', type: 'Thành phố Trung ương' },
  { code: '79', name: 'Hồ Chí Minh', type: 'Thành phố Trung ương' },
  { code: '48', name: 'Đà Nẵng', type: 'Thành phố Trung ương' },
  { code: '31', name: 'Hải Phòng', type: 'Thành phố Trung ương' },
  { code: '92', name: 'Cần Thơ', type: 'Thành phố Trung ương' },
  { code: '74', name: 'Bình Dương', type: 'Tỉnh' },
  { code: '75', name: 'Đồng Nai', type: 'Tỉnh' },
  { code: '77', name: 'Bà Rịa - Vũng Tàu', type: 'Tỉnh' },
  { code: '52', name: 'Khánh Hòa', type: 'Tỉnh' },
  { code: '66', name: 'Đắk Lắk', type: 'Tỉnh' },
  // ... remaining 53 provinces omitted for brevity — use GHN API in production
];

// Representative districts for HCM (code 79) and HN (code 01)
export const DISTRICTS: District[] = [
  { code: '760', name: 'Quận 1', provinceCode: '79' },
  { code: '761', name: 'Quận 12', provinceCode: '79' },
  { code: '764', name: 'Quận Gò Vấp', provinceCode: '79' },
  { code: '765', name: 'Quận Bình Thạnh', provinceCode: '79' },
  { code: '766', name: 'Quận Tân Bình', provinceCode: '79' },
  { code: '769', name: 'Quận Bình Tân', provinceCode: '79' },
  { code: '778', name: 'Thành phố Thủ Đức', provinceCode: '79' },
  { code: '001', name: 'Quận Ba Đình', provinceCode: '01' },
  { code: '002', name: 'Quận Hoàn Kiếm', provinceCode: '01' },
  { code: '003', name: 'Quận Tây Hồ', provinceCode: '01' },
  { code: '004', name: 'Quận Long Biên', provinceCode: '01' },
  { code: '005', name: 'Quận Cầu Giấy', provinceCode: '01' },
  { code: '006', name: 'Quận Đống Đa', provinceCode: '01' },
  { code: '007', name: 'Quận Hai Bà Trưng', provinceCode: '01' },
];

// Representative wards for Q1 HCM (code 760)
export const WARDS: Ward[] = [
  { code: '26734', name: 'Phường Tân Định', districtCode: '760' },
  { code: '26737', name: 'Phường Đa Kao', districtCode: '760' },
  { code: '26740', name: 'Phường Bến Nghé', districtCode: '760' },
  { code: '26743', name: 'Phường Bến Thành', districtCode: '760' },
  { code: '26746', name: 'Phường Nguyễn Thái Bình', districtCode: '760' },
  { code: '26749', name: 'Phường Phạm Ngũ Lão', districtCode: '760' },
  { code: '26752', name: 'Phường Cầu Ông Lãnh', districtCode: '760' },
  { code: '26755', name: 'Phường Cô Giang', districtCode: '760' },
  { code: '26758', name: 'Phường Nguyễn Cư Trinh', districtCode: '760' },
  { code: '26761', name: 'Phường Cầu Kho', districtCode: '760' },
];
