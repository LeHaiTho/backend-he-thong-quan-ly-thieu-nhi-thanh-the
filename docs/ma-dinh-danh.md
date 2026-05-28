# Mã học viên / giáo viên

## Định dạng

| Loại | Tiền tố | Ví dụ |
|------|---------|--------|
| Học viên | `MHV` | `MHV-20260519-0001` |
| Giáo lý viên | `MGV` | `MGV-20260519-0002` |

Cấu trúc: **`{PREFIX}-{YYYYMMDD}-{SEQ4}`**

- `YYYYMMDD`: ngày tạo (múi giờ `Asia/Ho_Chi_Minh`)
- `SEQ4`: số thứ tự trong ngày (0001–9999), tăng dần, không trùng

Tối đa **17 ký tự** (cột `code` VARCHAR(20)).

## Tra cứu

- Theo ngày: tìm `MHV-20260519-*`
- Theo loại: `MHV` = học viên, `MGV` = giáo viên
- Sắp xếp theo mã ≈ thứ tự nhập trong ngày

## Tự động / nhập tay

- Để trống khi tạo mới → server tự sinh
- Có thể nhập mã riêng (≤ 20 ký tự) nếu không trùng DB

Logic: `server/src/services/personCodeHelper.js`
