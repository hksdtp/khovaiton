/**
 * Lead Management Component
 * Ninh ơi, component này cho phép bạn xem và quản lý tất cả leads đã thu thập
 */

import { useState, useEffect } from 'react'
import { Users, Download, Phone, MessageSquare, CheckCircle, X, Clock } from 'lucide-react'
import { leadStorageService, CustomerLead } from '@/services/leadStorageService'

export function LeadManagement() {
  const [leads, setLeads] = useState<CustomerLead[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'new' | 'contacted' | 'converted' | 'lost'>('all')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [allLeads, leadStats] = await Promise.all([
        leadStorageService.getAllLeads(),
        leadStorageService.getLeadStats()
      ])
      setLeads(allLeads)
      setStats(leadStats)
    } catch (error) {
      console.error('Failed to load leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateLeadStatus = async (leadId: string, status: CustomerLead['status']) => {
    try {
      await leadStorageService.updateLeadStatus(leadId, status)
      await loadData() // Reload data
    } catch (error) {
      console.error('Failed to update lead status:', error)
    }
  }

  const exportLeads = async (format: 'json' | 'csv') => {
    try {
      const data = await leadStorageService.exportLeads(format)
      const blob = new Blob([data], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `leads_${new Date().toISOString().split('T')[0]}.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export leads:', error)
    }
  }

  const filteredLeads = filter === 'all' 
    ? leads 
    : leads.filter(lead => lead.status === filter)

  const getStatusColor = (status: CustomerLead['status']) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'contacted': return 'bg-yellow-100 text-yellow-800'
      case 'converted': return 'bg-green-100 text-green-800'
      case 'lost': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: CustomerLead['status']) => {
    switch (status) {
      case 'new': return <Clock className="w-4 h-4" />
      case 'contacted': return <Phone className="w-4 h-4" />
      case 'converted': return <CheckCircle className="w-4 h-4" />
      case 'lost': return <X className="w-4 h-4" />
      default: return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Đang tải dữ liệu leads...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản Lý Leads</h1>
              <p className="text-gray-600">Theo dõi và chăm sóc khách hàng tiềm năng</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => exportLeads('csv')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Xuất CSV
            </button>
            <button
              onClick={() => exportLeads('json')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Xuất JSON
            </button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Tổng leads</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
              <div className="text-sm text-blue-600">Mới</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">{stats.contacted}</div>
              <div className="text-sm text-yellow-600">Đã liên hệ</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">{stats.converted}</div>
              <div className="text-sm text-green-600">Chuyển đổi</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">{stats.lost}</div>
              <div className="text-sm text-red-600">Mất</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">{stats.todayCount}</div>
              <div className="text-sm text-purple-600">Hôm nay</div>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <div className="text-2xl font-bold text-indigo-600">{stats.weekCount}</div>
              <div className="text-sm text-indigo-600">Tuần này</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'all', label: 'Tất cả', count: stats?.total },
            { key: 'new', label: 'Mới', count: stats?.new },
            { key: 'contacted', label: 'Đã liên hệ', count: stats?.contacted },
            { key: 'converted', label: 'Chuyển đổi', count: stats?.converted },
            { key: 'lost', label: 'Mất', count: stats?.lost }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === key
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label} ({count || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Liên hệ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Địa chỉ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{lead.name}</div>
                    <div className="text-sm text-gray-500">ID: {lead.id.split('_')[1]}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{lead.phone}</div>
                    <div className="flex gap-2 mt-1">
                      <a
                        href={`tel:${lead.phone}`}
                        className="text-green-600 hover:text-green-800"
                        title="Gọi điện"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                      <a
                        href={`https://zalo.me/${lead.phone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                        title="Chat Zalo"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {lead.address}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                      {getStatusIcon(lead.status)}
                      {lead.status === 'new' && 'Mới'}
                      {lead.status === 'contacted' && 'Đã liên hệ'}
                      {lead.status === 'converted' && 'Chuyển đổi'}
                      {lead.status === 'lost' && 'Mất'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(lead.timestamp).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-1">
                      {lead.status === 'new' && (
                        <button
                          onClick={() => updateLeadStatus(lead.id, 'contacted')}
                          className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                        >
                          Đã liên hệ
                        </button>
                      )}
                      {(lead.status === 'new' || lead.status === 'contacted') && (
                        <>
                          <button
                            onClick={() => updateLeadStatus(lead.id, 'converted')}
                            className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                          >
                            Chuyển đổi
                          </button>
                          <button
                            onClick={() => updateLeadStatus(lead.id, 'lost')}
                            className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                          >
                            Mất
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLeads.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-500">Chưa có leads nào</div>
          </div>
        )}
      </div>
    </div>
  )
}
