# PTE Practice App - Admin Section

This folder contains all the admin panel components, pages, and backend procedures for the PTE Academic Practice Platform.

## Directory Structure

```
admin-section/
├── components/          # React admin components
│   ├── AdminUserManagement.tsx    # User management interface
│   └── AdminAnalytics.tsx         # Analytics dashboard
├── pages/              # Admin pages
│   ├── SystemAdminPanel.tsx       # Main system control panel
│   └── AdminDashboard.tsx         # Admin dashboard
├── routers/            # tRPC procedures
│   └── systemAdminRouter.ts       # System admin backend procedures
├── admin/              # Admin utilities
│   └── adminDb.ts      # Database query helpers for admin operations
└── payment/            # Payment utilities
    └── db.ts           # Payment database helpers
```

## Features

### System Admin Panel (`SystemAdminPanel.tsx`)
- **6 Main Tabs:**
  1. **Health** - Service status monitoring (CPU, memory, database, API)
  2. **Users** - Platform user management with search
  3. **Content** - Question and content management
  4. **Settings** - System configuration
  5. **Logs** - Activity tracking and audit logs
  6. **Alerts** - Real-time system alerts

- **KPI Cards:**
  - Total Users
  - Active Subscriptions
  - Total Revenue
  - Failed Payments

### Admin Dashboard (`AdminDashboard.tsx`)
- Dashboard layout with sidebar navigation
- User statistics
- Revenue analytics
- Subscription management
- Payment history

### Admin Components
- **AdminUserManagement.tsx** - User search, filter, and bulk actions
- **AdminAnalytics.tsx** - Analytics charts and metrics

### Backend Procedures (`systemAdminRouter.ts`)
- `getSystemHealth()` - System health metrics
- `getSystemStats()` - System statistics
- `getActivityLogs()` - Activity tracking
- `getSystemAlerts()` - System alerts
- `getPerformanceMetrics()` - Performance data
- `banUser()` - Ban/unban users
- `promoteUser()` - Promote users to admin
- `getApiKeys()` - API key management

### Database Helpers (`adminDb.ts`)
- `getSystemStatistics()` - Fetch system stats from database
- `getAdminUsers()` - Get admin accounts
- `getPlatformUsers()` - Get platform users with pagination
- `getUserSubscriptions()` - Get subscription data
- `getPaymentTransactions()` - Get payment history
- `getRevenueByGateway()` - Revenue analytics
- `getUserActivityLogs()` - Activity tracking

## Integration Steps

1. **Copy Components:**
   ```bash
   cp components/* src/components/
   cp pages/* src/pages/
   ```

2. **Copy Backend:**
   ```bash
   cp routers/* server/routers/
   cp admin/* server/admin/
   cp payment/* server/payment/
   ```

3. **Add Routes in App.tsx:**
   ```tsx
   import SystemAdminPanel from "@/pages/SystemAdminPanel";
   import AdminDashboard from "@/pages/AdminDashboard";
   
   // Add routes
   <Route path="/system-admin" component={SystemAdminPanel} />
   <Route path="/admin" component={AdminDashboard} />
   ```

4. **Add Router in server/routers.ts:**
   ```ts
   import { systemAdminRouter } from "./routers/systemAdminRouter";
   
   export const appRouter = router({
     systemAdmin: systemAdminRouter,
     // ... other routers
   });
   ```

5. **Update Navigation:**
   Add links to admin panel in your main navigation component

## Database Requirements

The admin section requires the following database tables:
- `users` - User accounts
- `subscriptions` - Subscription data
- `payments` - Payment transactions
- `practice_sessions` - Practice session data

See `drizzle/schema.ts` for full schema details.

## Features Included

✅ Real-time system monitoring
✅ User management and search
✅ Payment analytics
✅ Activity logging
✅ System alerts
✅ Content management
✅ Role-based access control
✅ Empty state handling
✅ Loading skeletons
✅ Error handling

## API Endpoints

All admin operations use tRPC procedures:
- `trpc.systemAdmin.getSystemHealth.useQuery()`
- `trpc.systemAdmin.getSystemStats.useQuery()`
- `trpc.systemAdmin.getActivityLogs.useQuery()`
- `trpc.systemAdmin.getSystemAlerts.useQuery()`
- `trpc.systemAdmin.banUser.useMutation()`
- `trpc.systemAdmin.promoteUser.useMutation()`

## Styling

The admin panel uses:
- Tailwind CSS 4
- shadcn/ui components
- Framer Motion for animations
- Lucide icons

## Access Control

Admin panel is protected by role-based access control:
- Only users with `role === "admin"` can access
- Automatic redirect to home page for non-admin users

## Next Steps

1. **Advanced Filtering** - Add more filter options for users
2. **Real-time Updates** - Implement WebSocket for live data
3. **Export Reports** - Add CSV/PDF export functionality
4. **Custom Alerts** - Allow admins to create custom alert rules
5. **Bulk Operations** - Implement bulk user management actions

## Support

For issues or questions, refer to the main project documentation.
