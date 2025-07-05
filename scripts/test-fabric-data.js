#!/usr/bin/env node

/**
 * 🧪 TEST FABRIC DATA
 * Ninh ơi, script này test dữ liệu fabric để đảm bảo quantity field đúng
 */

import fs from 'fs'
import path from 'path'

async function testFabricData() {
  console.log('🧪 TESTING FABRIC DATA - QUANTITY FIELD')
  console.log('═══════════════════════════════════════════════════════════════\n')
  
  try {
    // Test public JSON file
    const publicPath = path.join(process.cwd(), 'public/anhhung-fabrics.json')
    if (!fs.existsSync(publicPath)) {
      console.log('❌ public/anhhung-fabrics.json not found')
      return
    }
    
    const data = JSON.parse(fs.readFileSync(publicPath, 'utf-8'))
    console.log('✅ Loaded fabric data successfully')
    console.log(`📊 Total fabrics: ${data.metadata.totalItems}`)
    
    // Test first 5 fabrics
    console.log('\n📋 TESTING FIRST 5 FABRICS:')
    data.fabrics.slice(0, 5).forEach((fabric, index) => {
      console.log(`\n${index + 1}. ${fabric.code}`)
      console.log(`   Name: ${fabric.name}`)
      console.log(`   Quantity: ${fabric.quantity} ${fabric.unit}`)
      console.log(`   Stock: ${fabric.stock} ${fabric.unit}`)
      console.log(`   Location: ${fabric.location}`)
      
      // Check for NaN
      if (isNaN(fabric.quantity)) {
        console.log(`   ❌ QUANTITY IS NaN!`)
      } else {
        console.log(`   ✅ Quantity is valid: ${fabric.quantity}`)
      }
    })
    
    // Check for any NaN quantities
    const nanFabrics = data.fabrics.filter(f => isNaN(f.quantity))
    console.log(`\n🔍 CHECKING FOR NaN QUANTITIES:`)
    if (nanFabrics.length > 0) {
      console.log(`❌ Found ${nanFabrics.length} fabrics with NaN quantity:`)
      nanFabrics.slice(0, 5).forEach(fabric => {
        console.log(`   • ${fabric.code}: quantity=${fabric.quantity}`)
      })
    } else {
      console.log(`✅ All ${data.fabrics.length} fabrics have valid quantities`)
    }
    
    // Statistics
    const validQuantities = data.fabrics.filter(f => !isNaN(f.quantity) && f.quantity > 0)
    const totalStock = validQuantities.reduce((sum, f) => sum + f.quantity, 0)
    const avgStock = totalStock / validQuantities.length
    
    console.log(`\n📊 STATISTICS:`)
    console.log(`   Total fabrics: ${data.fabrics.length}`)
    console.log(`   Valid quantities: ${validQuantities.length}`)
    console.log(`   Total stock: ${totalStock.toFixed(2)} units`)
    console.log(`   Average stock: ${avgStock.toFixed(2)} units per fabric`)
    
    // Top 5 by quantity
    const topFabrics = data.fabrics
      .filter(f => !isNaN(f.quantity) && f.quantity > 0)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
    
    console.log(`\n🏆 TOP 5 BY QUANTITY:`)
    topFabrics.forEach((fabric, index) => {
      console.log(`   ${index + 1}. ${fabric.code}: ${fabric.quantity} ${fabric.unit}`)
    })
    
    console.log('\n🎉 DATA TEST COMPLETE!')
    
  } catch (error) {
    console.error('❌ Error testing fabric data:', error)
  }
}

// Run the test
testFabricData().catch(console.error)
