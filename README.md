# AI Nexus: So sánh LLM

AI Nexus là một công cụ so sánh hiệu năng mạnh mẽ để đối chiếu phản hồi của các LLM cạnh nhau cùng với phân tích hiệu suất.

**[Truy cập ứng dụng tại đây](https://ai-nexus-pro-omega.vercel.app/)**

## Tính năng chính

*   **So sánh song song:** Gửi một truy vấn đến nhiều mô hình (Gemini, GPT-4o, DeepSeek Coder) và xem kết quả trong thời gian thực.
*   **Phân tích Hiệu suất:** Tự động theo dõi thời gian phản hồi, chi phí ước tính và số lượng token cho mỗi phản hồi.
*   **Trực quan hóa Dữ liệu:** Biểu đồ Radar để so sánh trực quan hiệu suất của các mô hình dựa trên tốc độ, chi phí, chất lượng và độ ngắn gọn.
*   **Quản lý API Key:** Giao diện an toàn để bạn nhập và quản lý các khóa API của riêng mình (lưu trữ cục bộ trên trình duyệt).
*   **Lịch sử & Xuất dữ liệu:** Tất cả các truy vấn đều được lưu lại và có thể được xuất ra file CSV để phân tích thêm.

## Hướng dẫn sử dụng

Ứng dụng này là một trang web và không yêu cầu cài đặt. Chỉ cần làm theo các bước sau:

1.  **Cấu hình API Keys (Bắt buộc):**
    *   Truy cập trang web và nhấp vào biểu tượng **Cài đặt** (hình bánh răng ⚙️) ở góc trên bên phải.
    *   Nhập các khóa API của bạn cho **Google Gemini**, **OpenAI** và **DeepSeek** vào các ô tương ứng. Bạn phải cung cấp khóa của riêng mình để các mô hình hoạt động.
    *   Nhấp vào **"Lưu thay đổi"**.

2.  **Chọn Mô hình & Gửi Truy vấn:**
    *   Sử dụng các hộp kiểm để chọn những mô hình bạn muốn so sánh.
    *   Nhập truy vấn của bạn vào ô văn bản và nhấn "Gửi".

3.  **Phân tích và Đánh giá:**
    *   Xem các phản hồi xuất hiện cạnh nhau cùng với các chỉ số hiệu suất (thời gian, chi phí, tokens).
    *   Sử dụng thang điểm sao để **đánh giá chất lượng** của mỗi phản hồi. Việc đánh giá sẽ giúp hiển thị biểu đồ Radar so sánh trực quan.

4.  **Xem lại Lịch sử:**
    *   Nhấp vào nút "Lịch sử & Phân tích" để xem lại các truy vấn trước đây, sắp xếp kết quả và xuất dữ liệu ra file CSV.

## Lưu ý quan trọng về API Keys

Các khóa API của bạn được lưu trữ an toàn **chỉ trên trình duyệt của bạn** bằng `localStorage`. Chúng không bao giờ được gửi đến máy chủ của chúng tôi hay bất kỳ nơi nào khác. Bạn cần cung cấp khóa API của riêng mình để sử dụng các mô hình tương ứng.