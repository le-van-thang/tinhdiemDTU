# 🎓 DTU GPA Calculator - Công cụ Tính & Giả lập Điểm GPA Đại Học Duy Tân

[![Vercel Deployment](https://img.shields.io/badge/deploy-vercel-black?style=flat-square&logo=vercel)](https://tinhdiem-dtu-six.vercel.app/)
[![React Version](https://img.shields.io/badge/react-%5E19.2.7-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/typescript-%5E5.0.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/vite-%5E8.0.16-yellow?style=flat-square&logo=vite)](https://vite.dev/)

**DTU GPA Calculator** là ứng dụng web hiện đại, tiện lợi giúp sinh viên **Đại học Duy Tân (DTU)** dễ dàng quản lý, tính toán điểm trung bình tích lũy (GPA) và lên kế hoạch học tập (giả lập điểm mục tiêu) theo đúng quy chế đào tạo tín chỉ mới nhất của nhà trường.

👉 **Trải nghiệm trực tuyến tại:** [tinhdiem-dtu-six.vercel.app](https://tinhdiem-dtu-six.vercel.app/)

---

## ✨ Các Tính Năng Nổi Bật

### 1. 📋 Nhập Điểm Thông Minh (Smart Paste)
* Hỗ trợ copy toàn bộ bảng điểm từ hệ thống **myDTU** (Khung chương trình hoặc Bảng điểm học tập) và dán thẳng vào ứng dụng.
* Hệ thống tự động phân tích cú pháp, trích xuất: Mã môn, tên môn, số tín chỉ, điểm số và điền vào bảng điểm chỉ trong 1 giây.

### 2. 🧮 Bộ Tính Điểm Chi Tiết Môn Học (Detailed Grade Calculator)
Đây là công cụ đắc lực giúp bạn tính toán điểm thành phần chi tiết của từng môn học:
* **Nhập điểm nhanh từ myDTU:** Copy toàn bộ bảng điểm chi tiết môn học trên myDTU và dán vào, ứng dụng tự động nhận diện và bóc tách các cột điểm kiểm tra thường kỳ, giữa kỳ, đồ án, thi cuối kỳ,...
* **Tự động bóc tách trọng số chuẩn:** Trích xuất chính xác cột `% Điểm tối đa` (ví dụ: `10%`, `15%`, `20%`, `35%`) làm tỷ trọng của các cột điểm để đảm bảo tổng trọng số luôn bằng **100%**. Tự động lấy điểm thi Lần 2 thay thế Lần 1 nếu có.
* **Quy chế làm tròn điểm DTU:** Hiển thị song song điểm trung bình môn thô (chưa làm tròn - 2 chữ số thập phân) và điểm trung bình môn làm tròn (1 chữ số thập phân) theo đúng chuẩn quy chế học vụ DTU.
* **Điều kiện khống chế thi Cuối Kỳ:** Tự động áp dụng quy tắc: **Nếu điểm thi Cuối Kỳ < 1.0 điểm, sinh viên bị tính điểm chữ F (Trượt môn/Học lại)**, ngay cả khi điểm trung bình tổng kết môn học lớn hơn hoặc bằng 4.0 điểm.
* **Dự báo điểm thi (Grade Predictor):** Tự động tính toán số điểm bạn cần đạt tối thiểu trong các bài thi/kiểm tra còn lại để qua môn (đạt điểm D) hoặc đạt loại Khá (B-), Giỏi (A-), Xuất sắc (A), Tối đa (A+).
* **Chế độ máy tính nháp (Sandbox):** Hỗ trợ tính nháp điểm thành phần mà không cần ảnh hưởng đến danh sách môn học chính.

### 3. 📊 Tính GPA Tích Lũy Tự Động & Chính Xác
* Quy đổi điểm số sang điểm chữ (A+, A, A-, B+, B, B-, C+, C, C-, D, F) và hệ điểm 4 chuẩn quy chế đào tạo tín chỉ.
* Thống kê trực quan: Tổng số tín chỉ tích lũy, GPA hệ 4, GPA hệ 10, xếp loại học lực (Xuất sắc, Giỏi, Khá...).

### 4. 📈 Giả Lập Mục Tiêu GPA (GPA Simulator)
* Cho phép sinh viên nhập mục tiêu GPA mong muốn khi ra trường.
* Hệ thống sẽ tự động tính toán tổng số tín chỉ còn lại và số điểm trung bình cần đạt được trong các kỳ học tới để đạt mục tiêu.

### 5. 🔄 Hỗ Trợ Học Cải Thiện / Học Lại
* Tự động nhận diện và xử lý các môn học lại hoặc học cải thiện.
* Thực hiện bù trừ điểm số của môn học cũ và cập nhật lại điểm tích lũy thực tế chính xác nhất (Cơ chế "Trừ cũ - Cộng mới" loại bỏ môn cũ khỏi GPA).

### 6. 📱 Giao Diện Mobile-First Tối Ưu UX/UI
* Thiết kế chế độ tối (Dark Mode) sang trọng với hiệu ứng kính mờ (Glassmorphism).
* Tối ưu hiển thị trên thiết bị di động với thanh Tab điều hướng thông minh (Bảng điểm | Nhập điểm | Giả lập) và Bottom-sheet nhập điểm tiện lợi.

### 7. 🔒 Bảo Mật & Riêng Tư (Local First)
* Toàn bộ dữ liệu điểm của bạn được lưu trữ cục bộ trên thiết bị cá nhân qua `localStorage` của trình duyệt.
* Không gửi bất kỳ dữ liệu điểm hay thông tin cá nhân nào về máy chủ, đảm bảo an toàn và riêng tư tuyệt đối cho sinh viên.

---

## 🛠️ Công Nghệ Sử Dụng

* **Thư viện chính:** [React 19](https://react.dev/)
* **Ngôn ngữ:** [TypeScript](https://www.typescriptlang.org/)
* **Công cụ build:** [Vite 8](https://vite.dev/)
* **Styling:** CSS + TailwindCSS (giao diện responsive)
* **Icons:** [Lucide React](https://lucide.dev/)
* **Analytics:** Google Analytics 4 (GA4) để đo lường lượng truy cập ẩn danh (không thu thập dữ liệu điểm số)

---

## 🚀 Hướng Dẫn Cài Đặt và Chạy Local

Để chạy ứng dụng trên máy tính của bạn, hãy thực hiện theo các bước sau:

### Yêu cầu hệ thống
* Đã cài đặt [Node.js](https://nodejs.org/) (Khuyến nghị phiên bản 18 trở lên).

### Các bước thực hiện

1. **Clone mã nguồn dự án:**
   ```bash
   git clone https://github.com/le-van-thang/tinhdiemDTU.git
   ```

2. **Di chuyển vào thư mục dự án:**
   ```bash
   cd tinhdiemDTU
   ```

3. **Cài đặt các gói phụ thuộc (Dependencies):**
   ```bash
   npm install
   ```

4. **Chạy máy chủ phát triển (Development Server):**
   ```bash
   npm run dev
   ```
   *Mở trình duyệt truy cập địa chỉ hiển thị trên terminal (thường là `http://localhost:3000` hoặc `http://localhost:3001`).*

5. **Build phiên bản Production:**
   ```bash
   npm run build
   ```

---

## 🤝 Góp Ý & Báo Lỗi

Nếu bạn phát hiện lỗi hoặc có bất kỳ ý tưởng đóng góp nào nhằm nâng cấp ứng dụng, bạn có thể gửi phản hồi trực tiếp bằng cách click vào nút **Hỗ trợ & Góp ý** ngay trong ứng dụng hoặc tạo **Issue** trên repository này.

Chúc các bạn sinh viên DTU có những kỳ học thành công rực rỡ! 🎉🎓
