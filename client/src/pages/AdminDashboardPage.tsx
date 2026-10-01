import { AdminLayout } from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, TrendingUp, Activity } from "lucide-react";

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = trpc.systemAdmin.getSystemStats.useQuery();
  const { data: health, isLoading: healthLoading } = trpc.systemAdmin.getSystemHealth.useQuery();

  const StatCard = ({ icon: Icon, label, value, subtext, color }: any) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{label}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
            {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-8 animate-pulse" aria-busy="true" aria-label="Loading admin dashboard">
          <div className="space-y-3">
            <div className="h-8 w-48 rounded bg-gray-200" />
            <div className="h-4 w-80 max-w-full rounded bg-gray-200" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => <div key={item} className="h-32 rounded-xl bg-gray-100" />)}
          </div>
          <div className="h-52 rounded-xl bg-gray-100" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's your system overview.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Users}
            label="Total Users"
            value={stats?.totalUsers || 0}
            subtext="Active accounts"
            color="bg-blue-500"
          />
          <StatCard
            icon={Activity}
            label="Active Users"
            value={stats?.activeUsers || 0}
            subtext="Last 30 days"
            color="bg-green-500"
          />
          <StatCard
            icon={CreditCard}
            label="Total Revenue"
            value={`NPR ${(stats?.totalRevenue || 0).toLocaleString()}`}
            subtext="All time"
            color="bg-purple-500"
          />
          <StatCard
            icon={TrendingUp}
            label="Active Subscriptions"
            value={stats?.activeSubscriptions || 0}
            subtext="Paid plans"
            color="bg-orange-500"
          />
        </div>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Current system status and performance</CardDescription>
          </CardHeader>
          <CardContent>
            {healthLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse" aria-busy="true" aria-label="Loading system health">
                {[1, 2, 3].map((item) => <div key={item} className="h-24 rounded-lg bg-gray-100" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {health?.services?.map((service: any) => (
                <div key={service.name} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800">{service.name}</span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-semibold ${
                        service.status === "operational"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {service.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">Uptime: {service.uptime}</div>
                </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>System Metrics</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">Total Sessions</p>
                  <p className="text-sm text-gray-600">{stats?.totalSessions || 0} practice sessions</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">Failed Payments</p>
                  <p className="text-sm text-gray-600">{stats?.failedPayments || 0} transactions</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">System Errors</p>
                  <p className="text-sm text-gray-600">{stats?.systemErrors || 0} errors detected</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">API Calls</p>
                  <p className="text-sm text-gray-600">{(stats?.apiCalls || 0).toLocaleString()} total calls</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
