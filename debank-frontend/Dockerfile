# Sử dụng Node.js bản LTS làm image cơ sở để build ứng dụng React
FROM node:lts-alpine as builder

# Đặt thư mục làm việc bên trong container
WORKDIR /app

# Sao chép file package.json và package-lock.json để cài đặt dependencies
# Sử dụng wildcard để đảm bảo sao chép cả hai loại file lock
COPY package*.json ./

# Cài đặt các dependencies của dự án
# Lệnh `--force` có thể cần thiết nếu có xung đột phiên bản nhỏ
RUN npm install --force

# Sao chép toàn bộ mã nguồn của ứng dụng React vào thư mục làm việc trong container
COPY . .

# Build ứng dụng React cho môi trường production
# Lệnh `npm run build` sẽ tạo ra thư mục `dist` chứa các file tĩnh đã tối ưu
RUN npm run build

# Sử dụng image Nginx Alpine làm image cơ sở cho giai đoạn production
# Nginx là một web server nhẹ và hiệu quả để phục vụ các file tĩnh
FROM nginx:alpine

# Xóa cấu hình Nginx mặc định
# Điều này để chúng ta có thể thêm cấu hình tùy chỉnh của riêng mình
RUN rm /etc/nginx/conf.d/default.conf

# Sao chép file cấu hình Nginx tùy chỉnh của chúng ta vào đúng vị trí trong container
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Sao chép các file ứng dụng React đã được build từ giai đoạn 'builder' vào thư mục phục vụ của Nginx
# Thư mục `dist` chứa các file output từ quá trình build của React
COPY --from=builder /app/dist /usr/share/nginx/html

# Mở cổng 80 trong container để Nginx có thể lắng nghe các kết nối HTTP
EXPOSE 80

# Lệnh mặc định khi container khởi chạy: Khởi động Nginx ở chế độ foreground
# Điều này giữ cho container chạy liên tục
CMD ["nginx", "-g", "daemon off;"]
