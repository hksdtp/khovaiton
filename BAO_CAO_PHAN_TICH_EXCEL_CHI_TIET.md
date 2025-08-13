# 🔍 BÁO CÁO PHÂN TÍCH CHI TIẾT GIAVONMOI.XLSX

## 📊 Thống kê tổng quan:
- **Tổng số dòng từ dòng 3:** 336
- **Dòng có dữ liệu:** 335
- **Dòng hợp lệ:** 330
- **Dòng không hợp lệ:** 5
- **Dòng trống:** 1
- **Mã trùng lặp:** 5 mã

## 🔢 So sánh số liệu:
- **Bạn đếm được:** 332 sản phẩm
- **Script đọc được:** 330 sản phẩm hợp lệ
- **Đã import thành công:** 325 sản phẩm

## 📈 Phân tích sự khác biệt:
- **Khác biệt đếm tay vs script:** 2
- **Khác biệt script vs import:** 5

## ❌ Dòng không hợp lệ (5 dòng):
1. Dòng 8: '8059' - Vải 8059 Khổ 280cm
2. Dòng 62: '8000' - 8000 W140cm
3. Dòng 335: 'Lưu ý :' - 
4. Dòng 336: '1. Số lượng vải được kiểm kê theo tem mác dán trên cuộn vải. Số lượng chính xác cần kiểm kê theo thực tế bằng phương pháp tời vải để kiểm tra.' - 
5. Dòng 337: '2. Vải được kiểm tra ngoại quan phía ngoài, chưa kiểm tra chi tiết chất lượng vải bên trong.' - 

## 🔄 Mã trùng lặp (5 mã):
1. Mã '71022-10' xuất hiện tại dòng: [5, 59]
2. Mã 'DCR-71022-8' xuất hiện tại dòng: [13, 145]
3. Mã 'DCR-MELIA-NHẠT' xuất hiện tại dòng: [14, 154]
4. Mã 'FB15144A3' xuất hiện tại dòng: [16, 193]
5. Mã 'SG21-19-4007' xuất hiện tại dòng: [31, 307]

## 💡 Kết luận:
Sự khác biệt giữa 332 (đếm tay) và 325 (import thành công) có thể do:
1. **5 dòng không hợp lệ** (ghi chú, header, format sai)
2. **5 mã trùng lặp** (database chỉ lưu 1 record/mã)
3. **1 dòng trống**
4. **Lỗi import** một số records

## 🎯 Khuyến nghị:
- Kiểm tra lại các dòng không hợp lệ
- Xử lý mã trùng lặp trong Excel
- Đảm bảo format dữ liệu nhất quán

---
Tạo bởi: analyze-excel-detailed.py
