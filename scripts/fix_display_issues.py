#!/usr/bin/env python3
"""
Script to diagnose and fix web app display issues after rollback operation
Analyzes pagination, cache, and filtering problems

Usage: python scripts/fix_display_issues.py
"""

import json
import time
from supabase import create_client, Client

# Supabase configuration
SUPABASE_URL = "https://zgrfqkytbmahxcbgpkxx.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpncmZxa3l0Ym1haHhjYmdwa3h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxNjI1MTAsImV4cCI6MjA2MTczODUxMH0.a6giZZFMrj6jBhLip3ShOFCyTHt5dbe31UDGCECh0Zs"

def analyze_database():
    """Analyze database state"""
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("🔍 ANALYZING DATABASE STATE")
        print("=" * 50)
        
        # Total fabrics
        total_response = supabase.table('fabrics').select('id', count='exact').execute()
        total_count = len(total_response.data) if total_response.data else 0
        
        # Visible fabrics (is_hidden is null or false)
        visible_response = supabase.table('fabrics').select('id', count='exact').or_('is_hidden.is.null,is_hidden.eq.false').execute()
        visible_count = len(visible_response.data) if visible_response.data else 0
        
        # Hidden fabrics
        hidden_response = supabase.table('fabrics').select('id', count='exact').eq('is_hidden', True).execute()
        hidden_count = len(hidden_response.data) if hidden_response.data else 0
        
        print(f"📊 Database Statistics:")
        print(f"   Total fabrics: {total_count}")
        print(f"   Visible fabrics: {visible_count}")
        print(f"   Hidden fabrics: {hidden_count}")
        print(f"   Expected visible: 249")
        print(f"   Actual visible: {visible_count}")
        print(f"   Difference: {249 - visible_count}")
        
        # Test pagination
        print(f"\n🔍 Pagination Analysis:")
        page_sizes = [20, 50, 100]
        for size in page_sizes:
            page_response = supabase.table('fabrics').select('id').or_('is_hidden.is.null,is_hidden.eq.false').range(0, size-1).execute()
            page_count = len(page_response.data) if page_response.data else 0
            print(f"   Page size {size}: {page_count} items returned")
        
        # Check for null vs false values
        null_response = supabase.table('fabrics').select('id', count='exact').is_('is_hidden', 'null').execute()
        false_response = supabase.table('fabrics').select('id', count='exact').eq('is_hidden', False).execute()
        null_count = len(null_response.data) if null_response.data else 0
        false_count = len(false_response.data) if false_response.data else 0
        
        print(f"\n📋 Visibility Breakdown:")
        print(f"   is_hidden = null: {null_count}")
        print(f"   is_hidden = false: {false_count}")
        print(f"   is_hidden = true: {hidden_count}")
        print(f"   Total visible (null + false): {null_count + false_count}")
        
        return {
            'total': total_count,
            'visible': visible_count,
            'hidden': hidden_count,
            'null_hidden': null_count,
            'false_hidden': false_count
        }
        
    except Exception as e:
        print(f"❌ Database analysis error: {e}")
        return None

def check_api_endpoints():
    """Check API endpoint responses"""
    print(f"\n🌐 API ENDPOINT TESTING")
    print("=" * 50)
    
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Test different pagination scenarios
        test_cases = [
            {"page": 1, "limit": 20, "description": "Default pagination (page 1, 20 items)"},
            {"page": 1, "limit": 50, "description": "Larger page size (page 1, 50 items)"},
            {"page": 1, "limit": 100, "description": "Max page size (page 1, 100 items)"},
            {"page": 4, "limit": 20, "description": "Page 4 (items 61-80)"},
            {"page": 5, "limit": 20, "description": "Page 5 (items 81-100)"},
        ]
        
        for test in test_cases:
            start_idx = (test["page"] - 1) * test["limit"]
            end_idx = start_idx + test["limit"] - 1
            
            response = supabase.table('fabrics').select('id, code, is_hidden').or_('is_hidden.is.null,is_hidden.eq.false').range(start_idx, end_idx).execute()
            
            count = len(response.data) if response.data else 0
            print(f"   {test['description']}: {count} items")
            
            if count > 0 and count <= 5:  # Show sample for small results
                print(f"      Sample codes: {[f['code'] for f in response.data[:3]]}")
        
        return True
        
    except Exception as e:
        print(f"❌ API testing error: {e}")
        return False

def generate_cache_invalidation_script():
    """Generate cache invalidation commands"""
    print(f"\n🔄 CACHE INVALIDATION RECOMMENDATIONS")
    print("=" * 50)
    
    cache_commands = [
        "// Clear React Query cache",
        "queryClient.clear()",
        "",
        "// Invalidate specific fabric queries",
        "queryClient.invalidateQueries({ queryKey: ['fabrics'] })",
        "queryClient.invalidateQueries({ queryKey: ['fabric-stats'] })",
        "",
        "// Reset pagination to page 1",
        "setCurrentPage(1)",
        "",
        "// Clear localStorage cache",
        "localStorage.removeItem('inventory-store')",
        "",
        "// Force reload fabric data",
        "window.location.reload()"
    ]
    
    print("📋 Execute these commands in browser console:")
    for cmd in cache_commands:
        print(f"   {cmd}")
    
    return cache_commands

def main():
    """Main diagnostic function"""
    print("🔧 WEB APP DISPLAY ISSUE DIAGNOSTICS")
    print("=" * 60)
    
    # 1. Analyze database
    db_stats = analyze_database()
    
    if not db_stats:
        print("❌ Cannot proceed without database access")
        return
    
    # 2. Check API endpoints
    api_ok = check_api_endpoints()
    
    # 3. Generate recommendations
    print(f"\n💡 DIAGNOSIS & RECOMMENDATIONS")
    print("=" * 50)
    
    if db_stats['visible'] == 249:
        print("✅ Database has correct number of visible fabrics (249)")
        print("🔍 Issue is likely in frontend:")
        print("   - Pagination settings (user might be on page 4: 20x4=80)")
        print("   - Cache not invalidated after rollback")
        print("   - Frontend filtering logic")
        
        print(f"\n🎯 IMMEDIATE FIXES:")
        print("1. Check current page in web app pagination")
        print("2. Change items per page to 100 or 'Show All'")
        print("3. Clear browser cache and localStorage")
        print("4. Refresh the page")
        
    else:
        print(f"❌ Database issue: Expected 249 visible, got {db_stats['visible']}")
        print("🔍 Database inconsistency detected")
        
        if db_stats['visible'] < 249:
            missing = 249 - db_stats['visible']
            print(f"   Missing {missing} visible fabrics")
            print("   Some rollback operations may have failed")
        
    # 4. Generate cache invalidation script
    generate_cache_invalidation_script()
    
    print(f"\n📊 SUMMARY:")
    print(f"   Database visible: {db_stats['visible']}/249")
    print(f"   Database hidden: {db_stats['hidden']}")
    print(f"   API endpoints: {'✅ Working' if api_ok else '❌ Issues'}")
    print(f"   Likely cause: {'Frontend cache/pagination' if db_stats['visible'] == 249 else 'Database inconsistency'}")

if __name__ == "__main__":
    main()
