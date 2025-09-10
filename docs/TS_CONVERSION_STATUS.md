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

## Implemented adminDb.ts (commit 87d3ac270e84bacc0df7df289f3b5ed39912e335)

- ** this commit includes everything before becuase we deleted and restarted the .git / repo **

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

## Implemented teams routes (commit 3731dc1caffbd6ae31c3cf56d1672e2144e9c041)

Successfully implemented the complete teams functionality for the TypeScript version. Here's what was accomplished:

### Created Files:

**1. src/modules/players.ts**
Contains utility functions for player management:

- `createUniquePlayerObjArray()` - Extracts unique player objects from action data
- `createUniquePlayerNamesArray()` - Extracts unique player names from action data
- `addNewPlayerToTeam()` - Creates a new player and associates them with a team
- Added proper TypeScript interfaces and error handling

**2. src/routes/teams.ts**
Complete teams management API with endpoints for:

- `GET /teams` - Fetch all teams
- `POST /teams/create` - Create new team with players and league association
- `POST /teams/update-visibility` - Update team visibility setting
- `POST /teams/add-player` - Add individual player to existing team
- `DELETE /teams/player` - Remove player from team

**3. Updated src/app.ts**

- Added teams router import and mounting at `/teams` path

### Key Features Implemented:

**Team Creation Process:**

1. **Create Team** - Creates new team record with name and description (playersArray excluded from Team.create())
2. **League Association** - Links team to league (defaults to General League if none specified)
3. **User Permissions** - Automatically grants creator admin and super user privileges
4. **Player Creation** - Processes players array and creates player records with team associations
5. **Response Enhancement** - Returns teamNew object with playersArray included for client reference

**Player Management:**

- **Player Creation** - Creates player records with optional shirt numbers, positions
- **Team Association** - Links players to teams via ContractTeamPlayer relationship
- **Player Removal** - Removes player-team associations while preserving player records
- **Return Enhancement** - Returns player object with teamId included (not stored in Player table)

### Key Fixes:

- **Set Iteration** - Changed `[...new Set()]` to `Array.from(new Set())` for ES5 compatibility
- **Schema Compliance** - Removed `playersArray` from Team.create() and `teamId` from Player.create()
- **Response Objects** - Enhanced return objects to include client-needed properties without affecting database schema

### TypeScript Improvements:

- **Type Safety** - Proper interfaces for Player objects and request/response types
- **Error Handling** - Enhanced error handling with null checking
- **Optional Parameters** - Proper optional parameter handling for player creation
- **Authentication** - All endpoints protected with JWT authentication middleware

The teams API now provides complete team and player management functionality with proper TypeScript type safety and authentication.

## Implemented sessions routes

Successfully implemented the complete sessions functionality for the TypeScript version. Here's what was accomplished:

### Created Files:

**1. src/modules/contractVideoAction.ts**
Contains utility function for video timestamp calculations:
- `createEstimatedTimestampStartOfVideo()` - Calculates the estimated start time of a video based on action timestamps and delta time
- Added proper TypeScript interfaces for Action objects
- Enhanced null safety with optional chaining

**2. src/routes/sessions.ts**
Complete sessions management API with endpoints for:
- `POST /sessions/review-selection-screen/get-actions` - Complex endpoint that processes actions from multiple scripts, calculates video timestamps, checks user favorites, and merges/sorts results
- `GET /sessions/:teamId` - Fetches all sessions for a team with formatted date strings
- `POST /sessions/create` - Creates new session with league association
- `GET /sessions/scripting-sync-video/:sessionId/actions` - Fetches actions for mobile scripting sync screen
- `GET /sessions/scripting-sync-video-screen/get-actions-for-syncing/:sessionId` - Advanced endpoint for syncing actions with video timestamps

**3. Updated src/app.ts**
- Added sessions router import and mounting at `/sessions` path

### Key Features Implemented:

**Session Management:**
1. **Session Creation** - Creates new sessions linked to teams and leagues
2. **Session Retrieval** - Fetches sessions with formatted French date strings (e.g., "15 mar 20h00")
3. **Default League Handling** - Uses default league when none specified

**Action Processing:**
1. **Multi-Script Processing** - Handles actions from multiple scripts within a session
2. **Video Timestamp Calculations** - Calculates precise video timestamps using reference times and delta values
3. **User Favorites** - Checks and includes user favorite status for actions
4. **Action Sorting** - Sorts actions by video timestamp for proper playback order
5. **Index Assignment** - Assigns review indices for UI navigation

**Advanced Video Synchronization:**
- **Delta Time Processing** - Handles time synchronization between scripts and videos
- **Timestamp Calculations** - Complex calculations for accurate video-to-action mapping
- **Multi-Video Support** - Supports actions linked to different videos via ContractVideoAction relationships

### Key TypeScript Fixes:

**ContractVideoActions Association Handling:**
- **Problem**: TypeScript didn't recognize `ContractVideoActions` as a property since it's a Sequelize association
- **Solution**: Cast `action.toJSON()` to `any` type to access included association data
```typescript
const actionJSON = action.toJSON() as any;
const { ContractVideoActions, ...actionWithoutContractVideoActions } = actionJSON;
```

**Timestamp Arithmetic Type Issues:**
- **Problem**: TypeScript couldn't perform arithmetic operations on timestamp fields
- **Solution**: Convert timestamps to numbers using `new Date().getTime()` before performing calculations
```typescript
const actionTimestamp = new Date(actionWithoutContractVideoActions.timestamp).getTime();
const referenceTimestamp = new Date(scriptsArray[i].timestampReferenceFirstAction).getTime();
const differenceInTime = (actionTimestamp - referenceTimestamp) / 1000;
```

### Database Relationship Handling:
- **Multiple ContractVideoActions**: Properly handles the fact that each Action can have multiple corresponding rows in the ContractVideoActions table
- **Association Filtering**: Finds the correct ContractVideoAction for a specific video using `ContractVideoActions.find()`
- **Safe Array Access**: Uses optional chaining and fallback values for robust data handling

### TypeScript Improvements:
- **Type Safety** - Proper interfaces for complex nested objects and API responses
- **Error Handling** - Enhanced error handling with typed error objects
- **Optional Chaining** - Safe access to potentially undefined nested properties
- **Authentication** - All endpoints protected with JWT authentication middleware
- **Null Safety** - Proper null checking for database queries and calculations

The sessions API now provides comprehensive session and action management functionality for sports video analysis, with proper TypeScript type safety and authentication.
