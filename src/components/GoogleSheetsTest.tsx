import React, { useState } from 'react'
import { googleSheetsService } from '@/services/googleSheetsService'
import { leadStorageService } from '@/services/leadStorageService'

export const GoogleSheetsTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string>('')

  const testConnection = async () => {
    setIsLoading(true)
    setResult('Đang kiểm tra kết nối...')
    
    try {
      const success = await googleSheetsService.testConnection()
      if (success) {
        setResult('✅ Kết nối Google Sheets thành công!')
      } else {
        setResult('❌ Kết nối Google Sheets thất bại!')
      }
    } catch (error) {
      setResult(`❌ Lỗi: ${error}`)
    }
    
    setIsLoading(false)
  }

  const testAddLead = async () => {
    setIsLoading(true)
    setResult('Đang thêm lead test...')

    try {
      const testLead = {
        name: `Khách hàng test ${new Date().getHours()}:${new Date().getMinutes()}`,
        phone: '0123456789',
        address: 'Địa chỉ test - ' + new Date().toLocaleString('vi-VN'),
        source: 'marketing_modal' as const
      }

      const lead = await leadStorageService.saveLead(testLead)
      setResult(`✅ Thêm lead thành công!
ID: ${lead.id}
Tên: ${lead.name}
SĐT: ${lead.phone}
Địa chỉ: ${lead.address}

Kiểm tra Google Sheets để xem dữ liệu!`)
    } catch (error) {
      setResult(`❌ Lỗi thêm lead: ${error}`)
    }

    setIsLoading(false)
  }

  const testGetLeads = async () => {
    setIsLoading(true)
    setResult('Đang lấy danh sách leads...')
    
    try {
      const leads = await googleSheetsService.getAllLeads()
      setResult(`✅ Lấy được ${leads.length} leads từ Google Sheets`)
    } catch (error) {
      setResult(`❌ Lỗi lấy leads: ${error}`)
    }
    
    setIsLoading(false)
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">🧪 Test Google Sheets</h2>
      
      <div className="space-y-3">
        <button
          onClick={testConnection}
          disabled={isLoading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Kết Nối
        </button>
        
        <button
          onClick={testAddLead}
          disabled={isLoading}
          className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Thêm Lead
        </button>
        
        <button
          onClick={testGetLeads}
          disabled={isLoading}
          className="w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test Lấy Leads
        </button>
      </div>
      
      {result && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
          <pre className="whitespace-pre-wrap">{result}</pre>
        </div>
      )}
      
      {isLoading && (
        <div className="mt-4 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  )
}
