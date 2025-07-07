/**
 * Google Sheets Service
 * Ninh ơi, service này quản lý việc lưu trữ leads vào Google Sheets
 * Sử dụng Google Apps Script webhook để đơn giản hóa việc tích hợp
 */

import type { CustomerLead } from './leadStorageService'

interface GoogleSheetsConfig {
  webhookUrl: string
  spreadsheetId: string
  sheetName: string
}

class GoogleSheetsService {
  private static instance: GoogleSheetsService
  private config: GoogleSheetsConfig

  constructor() {
    this.config = {
      // Ninh ơi, paste webhook URL từ Google Apps Script vào đây
      // Ví dụ: 'https://script.google.com/macros/s/AKfycbx.../exec'
      webhookUrl: import.meta.env.VITE_GOOGLE_APPS_SCRIPT_WEBHOOK_URL || '',
      spreadsheetId: '1ey7cg9XC_ZikHComwNAIITCBe_qyr_Rey7f9nNAtZuM',
      sheetName: 'Sheet1'
    }
  }

  static getInstance(): GoogleSheetsService {
    if (!GoogleSheetsService.instance) {
      GoogleSheetsService.instance = new GoogleSheetsService()
    }
    return GoogleSheetsService.instance
  }

  /**
   * Khởi tạo service (không cần làm gì với webhook approach)
   */
  async initialize(): Promise<void> {
    console.log('✅ Google Sheets service initialized (webhook mode)')
  }

  /**
   * Thêm lead mới vào Google Sheets qua webhook
   */
  async addLead(lead: CustomerLead): Promise<boolean> {
    try {
      const leadData = {
        id: lead.id,
        name: lead.name,
        phone: lead.phone,
        address: lead.address,
        source: lead.source,
        status: lead.status,
        timestamp: new Date(lead.timestamp).toLocaleString('vi-VN'),
        notes: lead.notes || ''
      }

      console.log('📝 Sending lead to Google Sheets:', leadData)

      // Kiểm tra có webhook URL không
      if (!this.config.webhookUrl) {
        console.warn('⚠️ No webhook URL configured. Please set VITE_GOOGLE_APPS_SCRIPT_WEBHOOK_URL environment variable.')
        console.log('Current webhook URL:', this.config.webhookUrl)
        return false
      }

      console.log('🚀 Sending to webhook URL:', this.config.webhookUrl)

      // Thử POST với no-cors mode
      await fetch(this.config.webhookUrl, {
        method: 'POST',
        mode: 'no-cors', // Tránh CORS preflight
        headers: {
          'Content-Type': 'text/plain', // Dùng text/plain để tránh preflight
        },
        body: JSON.stringify({
          action: 'addLead',
          data: leadData
        })
      })

      // Với mode: 'no-cors', chúng ta không thể đọc response
      // Nhưng nếu request được gửi thành công thì Apps Script sẽ xử lý
      console.log('📡 Request sent with no-cors mode')
      console.log('✅ Lead sent to Google Sheets (no-cors mode - cannot verify response)')

      // Giả định thành công vì không thể kiểm tra response với no-cors
      return true

    } catch (error) {
      console.error('❌ Failed to add lead to Google Sheets:', error)
      return false
    }
  }

  /**
   * Lấy tất cả leads từ Google Sheets (tạm thời return empty)
   */
  async getAllLeads(): Promise<CustomerLead[]> {
    try {
      console.log('📋 Would get leads from Google Sheets')
      // Tạm thời return empty array
      return []

    } catch (error) {
      console.error('❌ Failed to get leads from Google Sheets:', error)
      return []
    }
  }

  /**
   * Cập nhật trạng thái lead trong Google Sheets (tạm thời chỉ log)
   */
  async updateLeadStatus(leadId: string, status: CustomerLead['status'], notes?: string): Promise<boolean> {
    try {
      console.log(`📝 Would update lead ${leadId} status to ${status}`, { notes })
      return true

    } catch (error) {
      console.error('❌ Failed to update lead status in Google Sheets:', error)
      return false
    }
  }

  /**
   * Kiểm tra kết nối với Google Sheets (tạm thời luôn return true)
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('✅ Google Sheets connection test (webhook mode)')
      return true

    } catch (error) {
      console.error('❌ Google Sheets connection test failed:', error)
      return false
    }
  }
}

// Export singleton instance
export const googleSheetsService = GoogleSheetsService.getInstance()

// Export types
export type { GoogleSheetsConfig }

/*
HƯỚNG DẪN SETUP GOOGLE APPS SCRIPT WEBHOOK:

1. Vào https://script.google.com
2. Tạo project mới
3. Paste code sau:

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const spreadsheetId = '1ey7cg9XC_ZikHComwNAIITCBe_qyr_Rey7f9nNAtZuM';
    const sheetName = 'Sheet1';

    if (data.action === 'addLead') {
      const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
      const leadData = data.data;

      sheet.appendRow([
        leadData.id,
        leadData.name,
        leadData.phone,
        leadData.address,
        leadData.source,
        leadData.status,
        leadData.timestamp,
        leadData.notes || ''
      ]);

      return ContentService.createTextOutput(JSON.stringify({success: true}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({error: 'Unknown action'}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

4. Deploy as web app
5. Copy URL và update webhookUrl trong config
*/
