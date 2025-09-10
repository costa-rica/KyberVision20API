![Logo](./docs/images/kyberVisionLogo01.png)

# API v0.20.0

## Overview

### Conversion to TypeScript

This is a TypeScript Express.js API project. This project is based on the KyberVision18API which was written in JavaScript. One main difference in this project structure is that it will use a src/ directory for the source code and a dist/ directory for the compiled code.

- see the docs/TS_CONVERSION_STATUS.md for detailed step by step conversion process with Claude Code.

## .env

```bash
APP_NAME=KyberVision20API
JWT_SECRET=secret_code
PATH_DATABASE=Users/nickrodriguez/Documents/KyberVision20API/databases/KyberVision20API/
NAME_DB=kv20.db
PATH_VIDEOS=/Users/nickrodriguez/Documents/_project_resources/KyberVision20API/session_videos
PATH_VIDEOS_UPLOADED=/Users/nickrodriguez/Documents/_project_resources/KyberVision20API/session_videos/uploaded
PATH_VIDEOS_MONTAGE_CLIPS=/Users/nickrodriguez/Documents/_project_resources/KyberVision20API/session_videos/montage_clips
PATH_VIDEOS_MONTAGE_COMPLETE=/Users/nickrodriguez/Documents/_project_resources/KyberVision20API/session_videos/montage_complete
ADMIN_EMAIL_ADDRESS=kyber.vision.info@gmail.com
ADMIN_EMAIL_PASSWORD="secret_code"
PATH_DB_BACKUPS=/Users/nickrodriguez/Documents/_project_resources/KyberVision20API/db_backups
PATH_PROJECT_RESOURCES=/Users/nickrodriguez/Documents/_project_resources/KyberVision20API
ADMIN_EMAIL_KV_MANAGER_WEBSITE=["nrodrig1@gmail.com"]
URL_KV_MANAGER_WEBSITE=https://kv20-manager.dashanddata.com
URL_KV_JOB_QUEUER=http://localhost:8003
PATH_KV_VIDEO_PROCESSOR=/Users/nickrodriguez/Documents/KyberVisionVideoProcessor01
NAME_KV_VIDEO_PROCESSOR=videoProcessor.js
URL_BASE_KV_API=https://api.kv20.dashanddata.com
PATH_TEST_REQUEST_ARGS=/Users/nickrodriguez/Documents/project_resources/KyberVision20API/test_request_args
NODE_ENV=production
AUTHENTIFICATION_TURNED_OFF=false
```
