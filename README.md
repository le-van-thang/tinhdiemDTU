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

### 2. 🧮 Tính GPA Tự Động & Chính Xác
* Quy đổi điểm số sang điểm chữ (A, B+, B, C+, C, D+, D, F) và hệ điểm 4 chuẩn quy chế đào tạo tín chỉ.
* Thống kê trực quan: Tổng số tín chỉ tích lũy, GPA hệ 4, GPA hệ 10, xếp loại học lực (Xuất sắc, Giỏi, Khá...).

### 3. 📈 Giả Lập Mục Tiêu GPA (GPA Simulator)
* Cho phép sinh viên nhập mục tiêu GPA mong muốn khi ra trường.
* Hệ thống sẽ tự động tính toán tổng số tín chỉ còn lại và số điểm trung bình cần đạt được trong các kỳ học tới để đạt mục tiêu.

### 4. 🔄 Hỗ Trợ Học Cải Thiện / Học Lại
* Tự động nhận diện và xử lý các môn học lại hoặc học cải thiện.
* Thực hiện bù trừ điểm số của môn học cũ và cập nhật lại điểm tích lũy thực tế chính xác nhất.

### 5. 📱 Giao Diện Mobile-First Tối Ưu UX/UI
* Thiết kế chế độ tối (Dark Mode) sang trọng với hiệu ứng kính mờ (Glassmorphism).
* Tối ưu hiển thị trên thiết bị di động với thanh Tab điều hướng thông minh (Bảng điểm | Nhập điểm | Giả lập) và Bottom-sheet nhập điểm tiện lợi.

### 6. 🔒 Bảo Mật & Riêng Tư (Local First)
* Toàn bộ dữ liệu điểm của bạn được lưu trữ cục bộ trên thiết bị cá nhân qua `localStorage` của trình duyệt.
* Không gửi dữ liệu điểm về máy chủ, đảm bảo sự riêng tư tuyệt đối cho sinh viên.

---

## 🛠️ Công Nghệ Sử Dụng

* **Thư viện chính:** [React 19](https://react.dev/)
* **Ngôn ngữ:** [TypeScript](https://www.typescriptlang.org/)
* **Công cụ build:** [Vite 8](https://vite.dev/)
* **Styling:** CSS + TailwindCSS (giao diện responsive)
* **Icons:** [Lucide React](https://lucide.dev/)
* **Analytics:** Google Analytics 4 (GA4) để đo lường lượng truy cập ẩn danh

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
