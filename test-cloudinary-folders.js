/**
 * Kiểm tra thư mục chứa ảnh trên Cloudinary
 * Test các folder structure khác nhau để tìm ảnh
 */

const CLOUDINARY_CLOUD_NAME = 'dgaktc3fb'

async function kiemTraThuMucCloudinary() {
  console.log('🔍 Đang kiểm tra các thư mục chứa ảnh trên Cloudinary...\n')
  
  // Danh sách mã vải để test từ fabricImageMapping
  const maVaiTest = [
    'AR-071-02B',
    'BERTONE-30',
    'TP01623-224',
    'DCR-RP1120',
    '71022-10',
    'YB0320-7',
    'FB15151A3',
    'M907-12',
    'W5601-6',
    '83102-19'
  ]
  
  // Các cấu trúc thư mục có thể
  const cacThuMuc = [
    {
      ten: 'Gốc (root)',
      duongDan: '',
      moTa: 'Ảnh đặt trực tiếp ở root'
    },
    {
      ten: 'fabrics/',
      duongDan: 'fabrics/',
      moTa: 'Thư mục fabrics (cũ)'
    },
    {
      ten: 'fabric_images/',
      duongDan: 'fabric_images/',
      moTa: 'Thư mục fabric_images (mới)'
    },
    {
      ten: 'images/',
      duongDan: 'images/',
      moTa: 'Thư mục images tổng quát'
    },
    {
      ten: 'uploads/',
      duongDan: 'uploads/',
      moTa: 'Thư mục uploads'
    }
  ]
  
  const ketQua = {}
  let tongSoAnh = 0
  
  for (const thuMuc of cacThuMuc) {
    console.log(`\n📂 Đang kiểm tra thư mục: ${thuMuc.ten}`)
    console.log(`   Mô tả: ${thuMuc.moTa}`)
    console.log(`   Đường dẫn: ${thuMuc.duongDan || '(root)'}`)
    
    ketQua[thuMuc.ten] = {
      duongDan: thuMuc.duongDan,
      soAnhTonTai: 0,
      danhSachAnh: [],
      danhSachLoi: []
    }
    
    for (const maVai of maVaiTest) {
      try {
        const url = `https://res.cloudinary.com/dgaktc3fb/image/upload/${thuMuc.duongDan}${maVai}.jpg`
        const response = await fetch(url, { method: 'HEAD' })
        
        if (response.ok) {
          console.log(`   ✅ ${maVai}.jpg`)
          ketQua[thuMuc.ten].soAnhTonTai++
          ketQua[thuMuc.ten].danhSachAnh.push(maVai)
          tongSoAnh++
        } else {
          console.log(`   ❌ ${maVai}.jpg (${response.status})`)
          ketQua[thuMuc.ten].danhSachLoi.push({
            maVai,
            loi: `${response.status} ${response.statusText}`
          })
        }
      } catch (error) {
        console.log(`   ❌ ${maVai}.jpg (Lỗi: ${error.message})`)
        ketQua[thuMuc.ten].danhSachLoi.push({
          maVai,
          loi: error.message
        })
      }
      
      // Delay nhỏ giữa các request
      await new Promise(resolve => setTimeout(resolve, 50))
    }
  }
  
  return { ketQua, tongSoAnh }
}

async function kiemTraAnhNgauNhien() {
  console.log('\n🎲 Kiểm tra ảnh với ID ngẫu nhiên (từ FABRIC_CODE_CORRECTIONS)...\n')
  
  const anhNgauNhien = [
    'kxtnctannhobhvacgtqe',
    'a44zn2hnktvmktsfdt7g', 
    'agc184xbjm0n715e5aet',
    'd6ic5ifzjafn4x8lfqhs',
    'rlz7l2vnqto8vxmo2egj',
    'wq8xmjxpop92m9enfvzd',
    'l7x0xsqbnei8pursrffz'
  ]
  
  let soAnhNgauNhienTonTai = 0
  
  for (const id of anhNgauNhien) {
    try {
      // Thử với .jpg
      let url = `https://res.cloudinary.com/dgaktc3fb/image/upload/${id}.jpg`
      let response = await fetch(url, { method: 'HEAD' })
      
      if (response.ok) {
        console.log(`   ✅ ${id}.jpg`)
        soAnhNgauNhienTonTai++
        continue
      }
      
      // Thử với .png
      url = `https://res.cloudinary.com/dgaktc3fb/image/upload/${id}.png`
      response = await fetch(url, { method: 'HEAD' })
      
      if (response.ok) {
        console.log(`   ✅ ${id}.png`)
        soAnhNgauNhienTonTai++
      } else {
        console.log(`   ❌ ${id} (không tìm thấy với .jpg hoặc .png)`)
      }
      
    } catch (error) {
      console.log(`   ❌ ${id} (Lỗi: ${error.message})`)
    }
    
    await new Promise(resolve => setTimeout(resolve, 50))
  }
  
  return soAnhNgauNhienTonTai
}

async function taoTongKet() {
  console.log('🚀 Bắt đầu kiểm tra thư mục ảnh Cloudinary\n')
  console.log('=' .repeat(60))
  
  const { ketQua, tongSoAnh } = await kiemTraThuMucCloudinary()
  const soAnhNgauNhien = await kiemTraAnhNgauNhien()
  
  console.log('\n' + '=' .repeat(60))
  console.log('📊 TỔNG KẾT:')
  console.log(`   Tổng số ảnh có tên thông thường: ${tongSoAnh}`)
  console.log(`   Tổng số ảnh với ID ngẫu nhiên: ${soAnhNgauNhien}`)
  
  console.log('\n📂 CHI TIẾT THEO THƯ MỤC:')
  for (const [tenThuMuc, thongTin] of Object.entries(ketQua)) {
    if (thongTin.soAnhTonTai > 0) {
      console.log(`   ✅ ${tenThuMuc}: ${thongTin.soAnhTonTai} ảnh`)
      console.log(`      Đường dẫn: ${thongTin.duongDan || '(root)'}`)
      console.log(`      Ví dụ: ${thongTin.danhSachAnh.slice(0, 3).join(', ')}`)
    } else {
      console.log(`   ❌ ${tenThuMuc}: 0 ảnh`)
    }
  }
  
  // Tìm thư mục chính
  const thuMucChinh = Object.entries(ketQua).reduce((max, [ten, thongTin]) => {
    return thongTin.soAnhTonTai > (max.soAnhTonTai || 0) ? { ten, ...thongTin } : max
  }, {})
  
  if (thuMucChinh.soAnhTonTai > 0) {
    console.log(`\n🎯 THƯ MỤC CHÍNH: ${thuMucChinh.ten}`)
    console.log(`   Đường dẫn: ${thuMucChinh.duongDan || '(root)'}`)
    console.log(`   Số ảnh: ${thuMucChinh.soAnhTonTai}`)
    console.log(`   📋 Pattern URL chuẩn:`)
    console.log(`   https://res.cloudinary.com/dgaktc3fb/image/upload/${thuMucChinh.duongDan}{ma-vai}.jpg`)
  }
  
  console.log('\n💡 KHUYẾN NGHỊ:')
  if (thuMucChinh.soAnhTonTai > 0) {
    console.log(`   - Sử dụng thư mục "${thuMucChinh.ten}" làm mặc định`)
    console.log(`   - Cập nhật CloudinaryService để dùng pattern này`)
    console.log(`   - Kiểm tra sync service để đảm bảo sử dụng đúng đường dẫn`)
  } else {
    console.log(`   - Không tìm thấy ảnh nào, có thể cần upload ảnh lên Cloudinary`)
    console.log(`   - Kiểm tra lại cấu hình hoặc quyền truy cập`)
  }
  
  return { ketQua, thuMucChinh, tongSoAnh, soAnhNgauNhien }
}

// Chạy kiểm tra
taoTongKet().catch(console.error)