# Website tra cứu Tarot thần thoại

Mở `index.html` trong trình duyệt để dùng website. Không cần backend.

## Cấu trúc

- `index.html`: khung trang chính và popup chi tiết.
- `styles.css`: giao diện nền tối, lưới lá bài, modal.
- `cards.js`: dữ liệu 34 lá bài. Hiện 5 lá đầu đã có nội dung đầy đủ từ bản bạn cung cấp, 29 lá còn lại là mẫu chờ nhập.
- `app.js`: tìm kiếm, lọc năng lượng, render lưới và modal.

## Thêm nội dung mới

Mở `cards.js`, tìm lá cần cập nhật theo `id`, rồi thay các trường `name`, `legend`, `imageMeaning`, `overview`, `positiveKeywords`, `challengeKeywords`, `readings`, `message`.
