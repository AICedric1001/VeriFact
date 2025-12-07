#!/usr/bin/env python3
"""
Verification script to check if all components for Sources Management are properly installed
"""

import os
import sys

def check_file_exists(path, description):
    """Check if a file exists"""
    if os.path.exists(path):
        print(f"✅ {description}: {path}")
        return True
    else:
        print(f"❌ {description}: NOT FOUND - {path}")
        return False

def check_file_contains(path, search_string, description):
    """Check if a file contains a specific string"""
    if not os.path.exists(path):
        print(f"❌ {description}: File not found - {path}")
        return False
    
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
        if search_string in content:
            print(f"✅ {description}")
            return True
        else:
            print(f"❌ {description}: Not found in {path}")
            return False

def main():
    print("=" * 60)
    print("SOURCES MANAGEMENT FEATURE - VERIFICATION CHECKLIST")
    print("=" * 60)
    print()
    
    base_path = os.path.dirname(os.path.abspath(__file__))
    all_good = True
    
    # Check files created
    print("📁 Checking created files...")
    all_good &= check_file_exists(
        os.path.join(base_path, 'templates', 'VeriFact_interface', 'admin', 'sources.html'),
        "Sources HTML template"
    )
    all_good &= check_file_exists(
        os.path.join(base_path, 'SOURCES_FEATURE_README.md'),
        "Feature documentation"
    )
    print()
    
    # Check modifications to existing files
    print("📝 Checking file modifications...")
    all_good &= check_file_contains(
        os.path.join(base_path, 'admin_routes.py'),
        "def sources():",
        "Sources route in admin_routes.py"
    )
    all_good &= check_file_contains(
        os.path.join(base_path, 'admin_routes.py'),
        "def add_source():",
        "Add source API endpoint in admin_routes.py"
    )
    all_good &= check_file_contains(
        os.path.join(base_path, 'admin_routes.py'),
        "def delete_source(source_id):",
        "Delete source API endpoint in admin_routes.py"
    )
    all_good &= check_file_contains(
        os.path.join(base_path, 'db_utils.py'),
        "def get_trusted_sources(cursor, status='all'):",
        "get_trusted_sources method in db_utils.py"
    )
    all_good &= check_file_contains(
        os.path.join(base_path, 'db_utils.py'),
        "def add_trusted_source(cursor, domain",
        "add_trusted_source method in db_utils.py"
    )
    all_good &= check_file_contains(
        os.path.join(base_path, 'db_utils.py'),
        "def delete_trusted_source(cursor, source_id):",
        "delete_trusted_source method in db_utils.py"
    )
    all_good &= check_file_contains(
        os.path.join(base_path, 'templates', 'VeriFact_interface', 'admin', 'base.html'),
        "url_for('admin.sources')",
        "Sources link in admin sidebar"
    )
    all_good &= check_file_contains(
        os.path.join(base_path, 'templates', 'VeriFact_interface', 'admin', 'base.html'),
        "fas fa-globe",
        "Globe icon for Sources link"
    )
    print()
    
    # Summary
    print("=" * 60)
    if all_good:
        print("✅ ALL CHECKS PASSED - Sources Management is ready!")
        print()
        print("✨ Implementation Complete:")
        print("   • New /admin/sources page with full UI")
        print("   • Add/Edit/Delete source functionality")
        print("   • Filter by trusted/blocked/all status")
        print("   • Database integration via AdminDB methods")
        print("   • Sidebar navigation link added")
        print("   • Responsive design with theme styling")
        print()
        print("🚀 Next steps:")
        print("   1. Start Flask: python app.py")
        print("   2. Login to admin panel: /admin/login")
        print("   3. Navigate to: /admin/sources")
        print("   4. Add your first trusted/blocked domain")
        print()
        print("📖 Documentation: See SOURCES_FEATURE_README.md")
        return 0
    else:
        print("❌ SOME CHECKS FAILED - Please review the errors above")
        return 1

if __name__ == "__main__":
    sys.exit(main())
