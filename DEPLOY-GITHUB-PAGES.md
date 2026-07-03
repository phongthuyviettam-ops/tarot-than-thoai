# Đưa website lên GitHub Pages

## Cách nhanh nhất

1. Vào https://github.com và đăng nhập.
2. Bấm **New repository**.
3. Đặt tên repo, ví dụ: `tarot-than-thoai`.
4. Chọn **Public**.
5. Bấm **Create repository**.
6. Ở trang repo mới, bấm **uploading an existing file**.
7. Mở thư mục:
   `outputs/tarot-than-thoai-website`
8. Kéo toàn bộ file và thư mục bên trong vào GitHub:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `cards.js`
   - `planetary-cards.js`
   - `birth-year-cards.js`
   - `zodiac-year-cards.js`
   - `.nojekyll`
   - thư mục `assets`
9. Bấm **Commit changes**.
10. Vào **Settings** > **Pages**.
11. Ở mục **Build and deployment**:
    - Source: **Deploy from a branch**
    - Branch: **main**
    - Folder: **/root**
12. Bấm **Save**.

Sau vài phút, GitHub sẽ tạo link dạng:

`https://TEN-GITHUB-CUA-BAN.github.io/tarot-than-thoai/`

## Lưu ý

- Không upload nguyên file `.zip` làm website. Cần upload các file bên trong zip.
- File `index.html` phải nằm ở ngoài cùng của repo.
- Nếu sửa web sau này, chỉ cần upload lại các file mới rồi bấm **Commit changes**.
