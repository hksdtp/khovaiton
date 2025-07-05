import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { cloudinaryService } from '../services/cloudinaryService'

// Mock environment variables for test
vi.mock('../services/cloudinaryService', () => {
  const actual = vi.importActual('../services/cloudinaryService')
  return {
    ...actual,
    cloudinaryService: {
      ...actual.cloudinaryService,
      cloudName: 'dgaktc3fb',
      isConfigured: () => true,
      getFabricImageUrl: (fabricCode: string, options?: any) => {
        const baseUrl = 'https://res.cloudinary.com/dgaktc3fb/image/upload'
        const publicId = `fabrics/${fabricCode}`

        const transformations = []

        if (options?.format && options.format !== 'auto') {
          transformations.push(`f_${options.format}`)
        }

        if (options?.quality && options.quality !== 'auto') {
          transformations.push(`q_${options.quality}`)
        }

        if (options?.width) {
          transformations.push(`w_${options.width}`)
        }

        if (options?.height) {
          transformations.push(`h_${options.height}`)
        }

        const transformString = transformations.length > 0 ? transformations.join(',') + '/' : ''
        return `${baseUrl}/${transformString}${publicId}`
      },
      checkFabricImageExists: async (fabricCode: string) => {
        // Mock implementation
        return true
      }
    }
  }
})

// Mock component để test ảnh
const TestImageComponent = ({ fabricCode }: { fabricCode: string }) => {
  const imageUrl = cloudinaryService.getFabricImageUrl(fabricCode)
  
  return (
    <div>
      <img 
        src={imageUrl} 
        alt={`Fabric ${fabricCode}`}
        data-testid={`fabric-image-${fabricCode}`}
        onLoad={() => console.log(`Image loaded: ${fabricCode}`)}
        onError={() => console.log(`Image failed: ${fabricCode}`)}
      />
      <p data-testid="image-url">{imageUrl}</p>
    </div>
  )
}

describe('Cloudinary Image Integration', () => {
  beforeEach(() => {
    // Reset any mocks
    vi.clearAllMocks()
  })

  it('should generate correct Cloudinary URL format', () => {
    const fabricCode = 'YB096'
    const expectedUrl = 'https://res.cloudinary.com/dgaktc3fb/image/upload/fabrics/YB096'
    
    const url = cloudinaryService.getFabricImageUrl(fabricCode)
    
    expect(url).toBe(expectedUrl)
  })

  it('should generate URL with transformations', () => {
    const fabricCode = 'YB096'
    const options = {
      width: 400,
      height: 300,
      format: 'webp' as const,
      quality: 80
    }
    
    const url = cloudinaryService.getFabricImageUrl(fabricCode, options)
    
    expect(url).toContain('w_400')
    expect(url).toContain('h_300')
    expect(url).toContain('f_webp')
    expect(url).toContain('q_80')
    expect(url).toContain('fabrics/YB096')
  })

  it('should render image component with correct URL', () => {
    const fabricCode = 'YB096'
    
    render(<TestImageComponent fabricCode={fabricCode} />)
    
    const image = screen.getByTestId(`fabric-image-${fabricCode}`)
    const urlText = screen.getByTestId('image-url')
    
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'https://res.cloudinary.com/dgaktc3fb/image/upload/fabrics/YB096')
    expect(urlText).toHaveTextContent('https://res.cloudinary.com/dgaktc3fb/image/upload/fabrics/YB096')
  })

  it('should handle multiple fabric codes', () => {
    const fabricCodes = ['YB096', '10-780-14', 'YB093']
    
    fabricCodes.forEach(code => {
      const url = cloudinaryService.getFabricImageUrl(code)
      expect(url).toBe(`https://res.cloudinary.com/dgaktc3fb/image/upload/fabrics/${code}`)
    })
  })

  it('should return empty string when not configured', () => {
    // Mock isConfigured to return false
    const originalIsConfigured = cloudinaryService.isConfigured
    cloudinaryService.isConfigured = vi.fn().mockReturnValue(false)
    
    const url = cloudinaryService.getFabricImageUrl('YB096')
    
    expect(url).toBe('')
    
    // Restore original method
    cloudinaryService.isConfigured = originalIsConfigured
  })

  it('should check if fabric image exists', async () => {
    const fabricCode = 'YB096'
    
    // Mock fetch to simulate successful response
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200
    })
    
    const exists = await cloudinaryService.checkFabricImageExists(fabricCode)
    
    expect(exists).toBe(true)
    expect(fetch).toHaveBeenCalledWith(
      'https://res.cloudinary.com/dgaktc3fb/image/upload/fabrics/YB096',
      { method: 'HEAD' }
    )
  })

  it('should handle non-existent fabric image', async () => {
    const fabricCode = 'NONEXISTENT'
    
    // Mock fetch to simulate 404 response
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404
    })
    
    const exists = await cloudinaryService.checkFabricImageExists(fabricCode)
    
    expect(exists).toBe(false)
  })
})
