# AI Nexus: So sánh LLM

AI Nexus là một công cụ so sánh hiệu năng mạnh mẽ để đối chiếu phản hồi của các LLM cạnh nhau cùng với phân tích hiệu suất.

## Tính năng chính

*   **So sánh song song:** Gửi một truy vấn đến nhiều mô hình (Gemini, GPT-4o, DeepSeek Coder) và xem kết quả trong thời gian thực.
*   **Phân tích Hiệu suất:** Tự động theo dõi thời gian phản hồi, chi phí ước tính và số lượng token cho mỗi phản hồi.
*   **Trực quan hóa Dữ liệu:** Biểu đồ Radar để so sánh trực quan hiệu suất của các mô hình dựa trên tốc độ, chi phí, chất lượng và độ ngắn gọn.
*   **Quản lý API Key:** Giao diện an toàn để bạn nhập và quản lý các khóa API của riêng mình (lưu trữ cục bộ trên trình duyệt).
*   **Lịch sử & Xuất dữ liệu:** Tất cả các truy vấn đều được lưu lại và có thể được xuất ra file CSV để phân tích thêm.

## Yêu cầu cài đặt

Để chạy ứng dụng này trên máy của bạn, bạn cần cài đặt:

*   [Node.js](https://nodejs.org/) (phiên bản 18.x trở lên được khuyến nghị)
*   npm (thường được cài đặt sẵn cùng với Node.js)

## Hướng dẫn Cài đặt & Khởi chạy

1.  **Tải mã nguồn:**
    Tải và giải nén tệp ZIP của dự án này vào một thư mục trên máy tính của bạn.

2.  **Mở Terminal (Dòng lệnh):**
    Mở một cửa sổ terminal hoặc command prompt và điều hướng đến thư mục gốc của dự án bạn vừa giải nén.
    ```bash
    cd duong-dan-den-thu-muc-du-an
    ```

3.  **Cài đặt các gói phụ thuộc:**
    Chạy lệnh sau để cài đặt tất cả các thư viện cần thiết cho dự án. Quá trình này có thể mất vài phút.
    ```bash
    npm install
    ```

4.  **Khởi chạy ứng dụng:**
    Sau khi cài đặt hoàn tất, chạy lệnh sau để khởi động máy chủ phát triển.
    ```bash
    npm run dev
    ```

5.  **Truy cập ứng dụng:**
    Mở trình duyệt web của bạn và truy cập vào địa chỉ được hiển thị trong terminal (thường là `http://localhost:5173`).

## Cấu hình

Sau khi khởi chạy ứng dụng lần đầu tiên, vui lòng thực hiện các bước sau:

1.  Nhấp vào biểu tượng **Cài đặt** (hình bánh răng ⚙️) ở góc trên bên phải.
2.  Nhập các khóa API của bạn cho OpenAI và/hoặc DeepSeek vào các ô tương ứng.
3.  Nhấp vào **"Lưu thay đổi"**.

**Lưu ý:** Các khóa API của bạn được lưu trữ an toàn ngay trên trình duyệt của bạn bằng `localStorage` và không bao giờ được gửi đi nơi khác. Các mô hình yêu cầu khóa API sẽ không hoạt động nếu không có khóa hợp lệ. Mô hình Gemini của Google đã được cấu hình sẵn.


