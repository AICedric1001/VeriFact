# Source Management Feature - Implementation Summary

## Overview
Added a **Sources Management page** to the VeriFact Admin Panel for managing trusted, blocked, and neutral domains globally.

## Files Created/Modified

### 1. **New Files Created**

#### `templates/VeriFact_interface/admin/sources.html`
- Complete source management UI with:
  - Add/Edit source modal form
  - Filter tabs for All/Trusted/Blocked sources
  - Responsive sources table showing:
    - Domain (with monospace formatting)
    - Source name
    - Trust status badge (color-coded)
    - Reason for classification
    - Date added
    - Edit/Delete action buttons
  - Empty state messaging
  - Full inline styling with theme variables

#### `create_trusted_sources_table.py`
- Database setup script to create the `trusted_sources` table
- Creates necessary indexes for performance
- Run with: `python create_trusted_sources_table.py`

### 2. **Modified Files**

#### `admin_routes.py`
Added 3 new routes:
- `GET /admin/sources` - Display sources page with optional status filter
  - Query param: `?status=all|trusted|blocked`
- `POST /admin/api/sources/add` - Add new trusted source
  - JSON payload: `{domain, source_name, trust_status, reason}`
- `DELETE /admin/api/sources/delete/<source_id>` - Delete a source

#### `db_utils.py` (AdminDB class)
Added 5 new methods:
- `get_trusted_sources(status='all')` - Retrieve sources with optional filtering
- `add_trusted_source(domain, source_name, trust_status, reason)` - Add new source
- `delete_trusted_source(source_id)` - Delete source by ID
- `update_trusted_source(source_id, ...)` - Update source fields
- `get_source_by_domain(domain)` - Lookup source by domain

#### `templates/VeriFact_interface/admin/base.html`
- Added "Sources" navigation link in sidebar (between Reviews and Logout)
- Uses globe icon `<i class="fas fa-globe"></i>`
- Auto-highlights when `active_page == 'sources'`

## Database Schema

### `trusted_sources` Table
```sql
CREATE TABLE public.trusted_sources (
    source_id SERIAL PRIMARY KEY,
    domain VARCHAR(255) NOT NULL UNIQUE,
    source_name VARCHAR(255),
    trust_status VARCHAR(20) NOT NULL 
        CHECK (trust_status IN ('trusted', 'blocked', 'neutral')),
    reason TEXT,
    is_global BOOLEAN DEFAULT TRUE,
    added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_trusted_sources_domain ON trusted_sources(domain);
CREATE INDEX idx_trusted_sources_status ON trusted_sources(trust_status);
```

## Setup Instructions

### Step 1: Create Database Table
```bash
python create_trusted_sources_table.py
```

Expected output:
```
✅ trusted_sources table created successfully!
✅ Indexes created successfully!
📊 Table contains 0 sources
```

### Step 2: Access the Feature
1. Navigate to Admin Dashboard: `/admin/dashboard`
2. Click "Sources" in the sidebar navigation
3. You'll see an empty state with option to add sources

## Usage Guide

### Adding a Source
1. Click **"Add Source"** button
2. Fill in the form:
   - **Domain** (required): `example.com` (without https:// or www.)
   - **Source Name** (optional): `Reuters News`
   - **Status** (required): Trusted / Blocked / Neutral
   - **Reason** (optional): Why this domain is classified
3. Click **"Save Source"**

### Filtering Sources
- **All Sources**: Shows all entries
- **Trusted**: Shows only trusted domains ✓
- **Blocked**: Shows only blocked domains ✗

### Deleting a Source
1. Locate the source in the table
2. Click the **trash icon** in Actions column
3. Confirm deletion

## UI Features

### Status Badges
- **Trusted** (✓): Green background, used for verified reliable sources
- **Blocked** (✗): Red background, for blocked/problematic domains
- **Neutral** (—): Gray background, for unclassified domains

### Table Columns
- **Domain**: Shows domain in monospace code format
- **Source Name**: Display name for the source
- **Status**: Color-coded badge with icon and text
- **Reason**: Why the domain was added (tooltip on hover)
- **Added**: Timestamp when source was added
- **Actions**: Edit (reserved for future use) and Delete buttons

### Modal Dialog
- Smooth fade-in/out transitions
- Close on overlay click or close button
- Form validation on submit
- Success/error notifications

## Integration Points

### Admin Session Protection
All source routes require admin login (`@login_required` decorator):
- Session must be valid (not expired)
- User must be authenticated as admin
- Session automatically extends with activity

### API Responses
All API endpoints return JSON:
```json
{
  "success": true/false,
  "message": "Status message"
}
```

### Error Handling
- Domain already exists: Returns 409 Conflict
- Invalid trust_status: Returns 400 Bad Request
- Missing required fields: Returns 400 Bad Request
- Server errors: Returns 500 with error message

## Future Enhancements

### Potential Features
1. **Edit Functionality**: Modify existing source details
2. **Bulk Operations**: Import/export sources via CSV
3. **History Tracking**: Audit log of source changes
4. **API Integration**: Check domain reputation via external APIs
5. **Search/Filter**: Quick search by domain or name
6. **Statistics**: Show source usage in searches
7. **Notifications**: Alert when blocked domain appears in results

### Integration with Scraper
The trusted sources can be integrated into `scraper.py` to:
- Prioritize results from trusted sources
- Filter out blocked domains
- Weight search results accordingly

## Testing

### Manual Testing Checklist
- [ ] Table created successfully
- [ ] Add a trusted source
- [ ] Add a blocked source
- [ ] Add a neutral source
- [ ] Filter by Trusted tab (should show 1)
- [ ] Filter by Blocked tab (should show 1)
- [ ] Filter by All tab (should show 3)
- [ ] Delete a source (confirm deletion)
- [ ] Verify badge colors are correct
- [ ] Test modal close on overlay click
- [ ] Verify responsive design on mobile

### Browser Console Check
- No JavaScript errors
- Fetch calls complete successfully
- Modal animations smooth

## Security Considerations

✅ **Implemented:**
- Admin-only access via `@login_required` decorator
- Session timeout (30 minutes default)
- CSRF protection through admin session
- Input validation on backend
- SQL injection protection (parameterized queries)
- Database constraints (UNIQUE domain, CHECK trust_status)

## Performance Notes

- Indexes on `domain` and `trust_status` for fast lookups
- Ordered by `added_date DESC` for newest first
- Pagination not implemented (suitable for < 10k entries)
- No N+1 queries (simple single table reads)

## Troubleshooting

### Sources page shows 500 error
1. Check PostgreSQL is running
2. Verify credentials in `db_utils.py`
3. Run `create_trusted_sources_table.py` again
4. Check console for error messages

### Modal not opening
1. Clear browser cache
2. Check browser console for JavaScript errors
3. Verify font-awesome icons loaded

### Sources not persisting after add
1. Check browser network tab (POST request)
2. Verify database table exists
3. Check psycopg2 connection
4. Look for duplicate domain errors

## Related Files
- `app.py` - Main Flask application
- `templates/VeriFact_interface/admin/` - Admin panel templates
- `static/` - Frontend assets
- `scraper.py` - Web scraping module (future integration point)
