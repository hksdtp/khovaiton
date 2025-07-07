/**
 * Lead Storage Service
 * Ninh ơi, service này quản lý việc lưu trữ và truy xuất thông tin leads khách hàng
 * Hỗ trợ nhiều phương thức lưu trữ: localStorage, sessionStorage, Google Sheets
 */

import { googleSheetsService } from './googleSheetsService'

export interface CustomerLead {
  id: string
  name: string
  phone: string
  address: string
  timestamp: string
  source: 'marketing_modal' | 'contact_form' | 'other'
  status: 'new' | 'contacted' | 'converted' | 'lost'
  notes?: string
}

export interface LeadStorageOptions {
  storage: 'localStorage' | 'sessionStorage' | 'memory' | 'googleSheets'
  autoBackup?: boolean
  maxLeads?: number
  useGoogleSheets?: boolean
}

class LeadStorageService {
  private static instance: LeadStorageService
  private options: LeadStorageOptions
  private memoryStorage: Map<string, CustomerLead> = new Map()
  private readonly STORAGE_KEY = 'khovaiton_customer_leads'
  private readonly BACKUP_KEY = 'khovaiton_leads_backup'

  constructor(options: LeadStorageOptions = { storage: 'localStorage', autoBackup: true, maxLeads: 1000, useGoogleSheets: true }) {
    this.options = options
  }

  static getInstance(options?: LeadStorageOptions): LeadStorageService {
    if (!LeadStorageService.instance) {
      LeadStorageService.instance = new LeadStorageService(options)
    }
    return LeadStorageService.instance
  }

  /**
   * Lưu thông tin lead mới
   */
  async saveLead(leadData: Omit<CustomerLead, 'id' | 'timestamp' | 'status'>): Promise<CustomerLead> {
    const lead: CustomerLead = {
      ...leadData,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      status: 'new'
    }

    try {
      // Lưu vào storage được chọn
      await this.saveToStorage(lead)
      
      // Auto backup nếu được bật
      if (this.options.autoBackup) {
        await this.createBackup()
      }

      // Log cho analytics
      console.log('📊 Lead saved successfully:', {
        id: lead.id,
        source: lead.source,
        timestamp: lead.timestamp
      })

      // Gửi đến Google Sheets (nếu được bật)
      if (this.options.useGoogleSheets) {
        this.sendToGoogleSheets(lead).catch(error => {
          console.warn('⚠️ Failed to send lead to Google Sheets:', error)
        })
      }

      // Gửi đến backend (nếu có)
      this.sendToBackend(lead).catch(error => {
        console.warn('⚠️ Failed to send lead to backend:', error)
      })

      return lead

    } catch (error) {
      console.error('❌ Failed to save lead:', error)
      throw new Error('Không thể lưu thông tin khách hàng')
    }
  }

  /**
   * Lấy tất cả leads
   */
  async getAllLeads(): Promise<CustomerLead[]> {
    try {
      const leads = await this.loadFromStorage()
      return leads.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    } catch (error) {
      console.error('❌ Failed to load leads:', error)
      return []
    }
  }

  /**
   * Lấy leads theo trạng thái
   */
  async getLeadsByStatus(status: CustomerLead['status']): Promise<CustomerLead[]> {
    const allLeads = await this.getAllLeads()
    return allLeads.filter(lead => lead.status === status)
  }

  /**
   * Cập nhật trạng thái lead
   */
  async updateLeadStatus(leadId: string, status: CustomerLead['status'], notes?: string): Promise<boolean> {
    try {
      const leads = await this.loadFromStorage()
      const leadIndex = leads.findIndex(lead => lead.id === leadId)
      
      if (leadIndex === -1) {
        throw new Error('Lead not found')
      }

      const lead = leads[leadIndex]
      if (lead) {
        lead.status = status
        if (notes) {
          lead.notes = notes
        }
      }

      await this.saveAllToStorage(leads)
      
      console.log(`📊 Lead ${leadId} status updated to ${status}`)
      return true

    } catch (error) {
      console.error('❌ Failed to update lead status:', error)
      return false
    }
  }

  /**
   * Xuất dữ liệu leads (cho admin)
   */
  async exportLeads(format: 'json' | 'csv' = 'json'): Promise<string> {
    const leads = await this.getAllLeads()
    
    if (format === 'csv') {
      return this.convertToCSV(leads)
    }
    
    return JSON.stringify(leads, null, 2)
  }

  /**
   * Thống kê leads
   */
  async getLeadStats(): Promise<{
    total: number
    new: number
    contacted: number
    converted: number
    lost: number
    todayCount: number
    weekCount: number
  }> {
    const leads = await this.getAllLeads()
    const today = new Date().toDateString()
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    return {
      total: leads.length,
      new: leads.filter(l => l.status === 'new').length,
      contacted: leads.filter(l => l.status === 'contacted').length,
      converted: leads.filter(l => l.status === 'converted').length,
      lost: leads.filter(l => l.status === 'lost').length,
      todayCount: leads.filter(l => new Date(l.timestamp).toDateString() === today).length,
      weekCount: leads.filter(l => new Date(l.timestamp) >= weekAgo).length
    }
  }

  // Private methods

  private async saveToStorage(lead: CustomerLead): Promise<void> {
    const leads = await this.loadFromStorage()
    leads.push(lead)

    // Giới hạn số lượng leads nếu cần
    if (this.options.maxLeads && leads.length > this.options.maxLeads) {
      leads.splice(0, leads.length - this.options.maxLeads)
    }

    await this.saveAllToStorage(leads)
  }

  private async loadFromStorage(): Promise<CustomerLead[]> {
    try {
      switch (this.options.storage) {
        case 'localStorage':
          const data = localStorage.getItem(this.STORAGE_KEY)
          return data ? JSON.parse(data) : []
        
        case 'sessionStorage':
          const sessionData = sessionStorage.getItem(this.STORAGE_KEY)
          return sessionData ? JSON.parse(sessionData) : []
        
        case 'memory':
          return Array.from(this.memoryStorage.values())
        
        default:
          return []
      }
    } catch (error) {
      console.error('❌ Failed to parse stored leads:', error)
      return []
    }
  }

  private async saveAllToStorage(leads: CustomerLead[]): Promise<void> {
    const data = JSON.stringify(leads)
    
    switch (this.options.storage) {
      case 'localStorage':
        localStorage.setItem(this.STORAGE_KEY, data)
        break
      
      case 'sessionStorage':
        sessionStorage.setItem(this.STORAGE_KEY, data)
        break
      
      case 'memory':
        this.memoryStorage.clear()
        leads.forEach(lead => this.memoryStorage.set(lead.id, lead))
        break
    }
  }

  private async createBackup(): Promise<void> {
    try {
      const leads = await this.getAllLeads()
      const backup = {
        timestamp: new Date().toISOString(),
        count: leads.length,
        data: leads
      }
      localStorage.setItem(this.BACKUP_KEY, JSON.stringify(backup))
    } catch (error) {
      console.warn('⚠️ Failed to create backup:', error)
    }
  }

  private async sendToGoogleSheets(lead: CustomerLead): Promise<void> {
    try {
      const success = await googleSheetsService.addLead(lead)
      if (success) {
        console.log('✅ Lead sent to Google Sheets successfully:', lead.id)
      } else {
        throw new Error('Failed to add lead to Google Sheets')
      }
    } catch (error) {
      console.error('❌ Error sending lead to Google Sheets:', error)
      throw error
    }
  }

  private async sendToBackend(lead: CustomerLead): Promise<void> {
    // Ninh ơi, đây là nơi bạn có thể tích hợp với backend API
    // Ví dụ: gửi đến CRM, email service, webhook, etc.

    // Ví dụ implementation:
    /*
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lead)
    })

    if (!response.ok) {
      throw new Error('Backend API error')
    }
    */

    // Hiện tại chỉ log để demo
    console.log('🚀 Would send to backend:', lead)
  }

  private generateId(): string {
    return `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private convertToCSV(leads: CustomerLead[]): string {
    const headers = ['ID', 'Tên', 'Số điện thoại', 'Địa chỉ', 'Nguồn', 'Trạng thái', 'Thời gian', 'Ghi chú']
    const rows = leads.map(lead => [
      lead.id,
      lead.name,
      lead.phone,
      lead.address,
      lead.source,
      lead.status,
      lead.timestamp,
      lead.notes || ''
    ])

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
  }
}

// Export singleton instance
export const leadStorageService = LeadStorageService.getInstance()

// Export types for external use
