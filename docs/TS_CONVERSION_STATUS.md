# This is reference of all the changes

## Implemented Users (commit f465e12960fdc6c6843f5579b7f29d7705d057ba - lost)

Created Files:

1. src/modules/mailer.ts - TypeScript version of the mailer module with:

   - Proper TypeScript imports and typing
   - All four email functions: registration confirmation, password reset, video montage complete, and join squad

notifications - Correct template paths pointing to src/templates/ 2. src/routes/users.ts - TypeScript version of user routes with: - User registration endpoint with password hashing, email sending, and pending invitations handling - User login endpoint with password validation and JWT token generation - Proper TypeScript types for Request/Response - Import of database models from kybervision20db package 3. Updated src/app.ts - Added import and mounting of the users router at /users path

Key Improvements in the TypeScript Version:

- Type Safety: Added proper TypeScript types for function parameters and return values
- Modern Imports: Used ES6 import syntax instead of CommonJS require
- Better Error Handling: Used TypeScript non-null assertion for JWT_SECRET environment variable
- Template Path Updates: Corrected paths to use src/templates/ instead of just templates/

The application now has fully functional user registration and login endpoints at:

- POST /users/register
- POST /users/login

Both endpoints work with the KyberVision20Db models and include email functionality using the HTML templates in
src/templates/.

## Implemented app.ts and onStartUp.ts (commit bd4c1611977b20d1f8c09e4d3ac688657e543eed - lost)

Created src/modules/onStartUp.ts with:

1. verifyCheckDirectoryExists() - Creates necessary directories if they don't exist:

   - Database path
   - Project resources path
   - Videos upload paths
   - Database backups path
   - Profile pictures directory

2. onStartUpCreateLeague() - Creates a default "General League" if it doesn't exist
3. onStartUpCreateEnvUsers() - Creates admin users from environment variables:

   - Reads admin emails from ADMIN_EMAIL_KV_MANAGER_WEBSITE env variable
   - Creates users with default "test" password
   - Sets admin privileges flag
   - Handles existing user checks

Updated src/app.ts to:

- Import all three onStartUp functions
- Call verifyCheckDirectoryExists() immediately after environment setup
- Call onStartUpCreateEnvUsers() and onStartUpCreateLeague() after database sync
- Added proper console logging for database connection status

Key TypeScript Improvements:

- Type Safety: Added proper TypeScript types and return types
- Null Safety: Added filtering for undefined environment variables
- Error Handling: Maintained the same error handling patterns as the JavaScript version
- Modern Imports: Used ES6 import syntax throughout

The application now has proper startup initialization that will create necessary directories, set up default data, and
create admin users when the server starts up, just like the original JavaScript version but with TypeScript type
safety.

## Modifs to app.ts added cors and morgan (commit eb922f34a441d655571707a0da1e48108322e19e - lost )

- middleware to handle x-www-form-urlencoded requests and other important configuration from
  the original app.js

## Implemented adminDb.ts

successfully implemented the complete adminDb functionality for the TypeScript version. Here's what I've accomplished:

Created Files:

1. src/modules/userAuthentication.ts

- authenticateToken() - Middleware for JWT token authentication with bypass option
- tokenizeObject() - JWT token creation utility
- detokenizeObject() - JWT token verification utility
- Added proper TypeScript types and extended Express Request interface

2. src/modules/adminDb.ts

- readAndAppendDbTables() - Imports database data from CSV backup files
- createDatabaseBackupZipFile() - Creates ZIP backups of all database tables
- models - Centralized model exports for all database tables
- Full TypeScript conversion with proper error handling and type safety

3. src/routes/adminDb.ts

Complete admin database management API with endpoints for:

- GET /table/:tableName - Fetch table data with dummy row fallback
- GET /create-database-backup - Create database backup ZIP files
- GET /backup-database-list - List available backup files
- GET /send-db-backup/:filename - Download backup files
- GET /db-row-counts-by-table - Get row counts for all tables
- POST /import-db-backup - Import database from backup ZIP
- DELETE /delete-db-backup/:filename - Delete backup files
- DELETE /the-entire-database - Delete entire database (with backup)
- DELETE /table/:tableName - Clear specific table
- GET /table-clean/:tableName - Alternative table fetch method
- DELETE /table-row/:tableName/:rowId - Delete specific row
- PUT /table-row/:tableName/:rowId - Create/update table rows

4. Updated src/app.ts

- Added adminDb router import and mounting at /admin-db path

Installed Dependencies:

- multer - File upload handling
- unzipper - ZIP file extraction
- csv-parser - CSV file parsing
- json2csv - JSON to CSV conversion
- archiver - ZIP file creation
- @types/multer and @types/archiver - TypeScript definitions

Key TypeScript Improvements:

- Type Safety: All functions have proper TypeScript types
- Error Handling: Enhanced error handling with typed error objects
- Interface Extensions: Extended Express Request to include user property
- Modern Syntax: Used ES6 imports, async/await, and proper Promise types
- Null Safety: Added proper null checking and optional chaining

The adminDb routes are now fully functional and provide complete database administration capabilities including backup/restore, table
management, and row-level operations, all with JWT authentication protection.

### Plus a fix on src/modules/adminDb.ts

- `const processCSVFiles = async (files: string[]): Promise<number> => {`
