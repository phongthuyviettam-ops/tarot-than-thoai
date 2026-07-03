# Đưa website Tarot lên mạng bằng Cloudflare Pages

Website này là web tĩnh, có thể upload trực tiếp lên Cloudflare Pages để có link dạng `https://ten-web.pages.dev`.

## Cách nhanh nhất

1. Vào https://pages.cloudflare.com/ và đăng nhập Cloudflare.
2. Chọn **Create a project**.
3. Chọn **Upload assets** hoặc **Direct Upload**.
4. Kéo thả toàn bộ thư mục này lên:

   `tarot-than-thoai-website`

5. Đặt tên project, ví dụ:

   `tarot-than-thoai`

6. Bấm **Deploy site**.
7. Cloudflare sẽ tạo link kiểu:

   `https://tarot-than-thoai.pages.dev`

## Quan trọng

Khi upload, phải upload cả các file và thư mục này:

- `index.html`
- `styles.css`
- `app.js`
- `cards.js`
- `planetary-cards.js`
- `birth-year-cards.js`
- `zodiac-year-cards.js`
- thư mục `assets`

Không cần backend, không cần cài gì thêm.
