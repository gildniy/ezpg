# Dashboard Module

## Overview

The Dashboard module provides access to aggregated statistics and metrics for the payment gateway admin panel. It is
designed to give admins a quick overview of system performance, transaction volumes, and merchant activities.

## Features

- Summary statistics (deposits, withdrawals, merchants, etc.)
- Transaction trends visualized over different time periods
- Merchant performance comparison
- Recent transaction tracking
- Time zone analysis of transaction activities
- System announcements and alarms

## Architecture

- **Controller**: Handles API endpoints with proper guards and role checks
- **Service**: Contains business logic for data aggregation and processing
- **DTOs**: Separated into specialized files for each domain area
  - Summary statistics
  - Transaction trends
  - Merchant performance
  - Activities and logs
  - Etc.

## Usage

The dashboard endpoints are accessible at `/admin/dashboard/*` and require admin authentication and authorization.

```typescript
// Example client usage with the useDashboard hook
const { summaryStats, transactionTrends, refreshData } = useDashboard();
```

## API Endpoints

- GET `/admin/dashboard/summary-stats` - Get summary statistics
- GET `/admin/dashboard/trends` - Get transaction trends
- GET `/admin/dashboard/merchant-performance` - Get merchant performance data
- GET `/admin/dashboard/recent-transactions` - Get recent transactions
- GET `/admin/dashboard/time-zone-stats` - Get transactions by time zone
- GET `/admin/dashboard/announcements` - Get system announcements
- GET `/admin/dashboard/dashboard-activity` - Get admin activities and alerts
