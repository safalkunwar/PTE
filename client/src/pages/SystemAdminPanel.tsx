import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity, Users, Settings, Database, AlertCircle, LogOut,
  TrendingUp, Server, Shield, Lock, FileText, BarChart3,
  Download, Upload, RefreshCw, Trash2, Eye, Edit, CheckCircle,
  Clock, Zap, HardDrive, Cpu, MemoryStick,
} from "lucide-react";
import { motion } from "framer-motion";

interface SystemHealth {
  status: "healthy" | "warning" | "critical";
  cpu: number;
  memory: number;
  database: "connected" | "disconnected";
  api: "operational" | "degraded";
  uptime: string;
  lastCheck: string;
}

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "moderator";
  status: "active" | "inactive";
  lastLogin: string;
  createdAt: string;
}

interface SystemLog {
  id: number;
  admin: string;
  action: string;
  target: string;
  timestamp: string;
  status: "success" | "failed";
  details: string;
}

export default function SystemAdminPanel() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("health");
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: "healthy",
    cpu: 45,
    memory: 62,
    database: "connected",
    api: "operational",
    uptime: "45 days 12 hours",
    lastCheck: new Date().toLocaleTimeString(),
  });

  // Check if user is super admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      window.location.href = "/";
    }
  }, [user]);

  if (!user || user.role !== "admin") {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const mockAdminUsers: AdminUser[] = [
    {
      id: 1,
      name: "John Admin",
      email: "john@admin.com",
      role: "super_admin",
      status: "active",
      lastLogin: "2 minutes ago",
      createdAt: "2024-01-15",
    },
    {
      id: 2,
      name: "Sarah Manager",
      email: "sarah@admin.com",
      role: "admin",
      status: "active",
      lastLogin: "1 hour ago",
      createdAt: "2024-02-10",
    },
    {
      id: 3,
      name: "Mike Moderator",
      email: "mike@admin.com",
      role: "moderator",
      status: "active",
      lastLogin: "3 hours ago",
      createdAt: "2024-02-20",
    },
  ];

  const mockSystemLogs: SystemLog[] = [
    {
      id: 1,
      admin: "John Admin",
      action: "User Ban",
      target: "User #1234",
      timestamp: "2 minutes ago",
      status: "success",
      details: "Banned user for violating terms of service",
    },
    {
      id: 2,
      admin: "Sarah Manager",
      action: "Plan Update",
      target: "Pro Plan",
      timestamp: "15 minutes ago",
      status: "success",
      details: "Updated Pro plan pricing to ₨1,499",
    },
    {
      id: 3,
      admin: "Mike Moderator",
      action: "Content Upload",
      target: "Reading Questions",
      timestamp: "1 hour ago",
      status: "success",
      details: "Uploaded 50 new reading comprehension questions",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/80 backdrop-blur border-b border-slate-700 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">System Admin Panel</h1>
              <p className="text-xs text-slate-400">Senior Administrator Control</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-slate-400">Super Administrator</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* System Health Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4">System Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Health Status */}
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">System Status</p>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <p className="text-lg font-bold text-white capitalize">
                        {systemHealth.status}
                      </p>
                    </div>
                  </div>
                  <Activity className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            {/* CPU Usage */}
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">CPU Usage</p>
                    <p className="text-lg font-bold text-white">{systemHealth.cpu}%</p>
                    <div className="w-full bg-slate-600 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${systemHealth.cpu}%` }}
                      />
                    </div>
                  </div>
                  <Cpu className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            {/* Memory Usage */}
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Memory Usage</p>
                    <p className="text-lg font-bold text-white">{systemHealth.memory}%</p>
                    <div className="w-full bg-slate-600 rounded-full h-2 mt-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${systemHealth.memory}%` }}
                      />
                    </div>
                  </div>
                  <MemoryStick className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            {/* Uptime */}
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Uptime</p>
                    <p className="text-lg font-bold text-white">{systemHealth.uptime}</p>
                    <p className="text-xs text-slate-400 mt-2">Last check: {systemHealth.lastCheck}</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="bg-slate-700 border-slate-600 grid w-full grid-cols-6">
              <TabsTrigger value="health" className="text-white data-[state=active]:bg-red-600">
                <Server className="w-4 h-4 mr-2" />
                Health
              </TabsTrigger>
              <TabsTrigger value="users" className="text-white data-[state=active]:bg-red-600">
                <Users className="w-4 h-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="content" className="text-white data-[state=active]:bg-red-600">
                <FileText className="w-4 h-4 mr-2" />
                Content
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-white data-[state=active]:bg-red-600">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="logs" className="text-white data-[state=active]:bg-red-600">
                <BarChart3 className="w-4 h-4 mr-2" />
                Logs
              </TabsTrigger>
              <TabsTrigger value="security" className="text-white data-[state=active]:bg-red-600">
                <Lock className="w-4 h-4 mr-2" />
                Security
              </TabsTrigger>
            </TabsList>

            {/* Health Tab */}
            <TabsContent value="health" className="space-y-4">
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">Service Status</CardTitle>
                  <CardDescription>Real-time system service monitoring</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      { name: "API Server", status: "operational", uptime: "99.9%" },
                      { name: "Database", status: "operational", uptime: "99.95%" },
                      { name: "Cache Server", status: "operational", uptime: "100%" },
                      { name: "Email Service", status: "operational", uptime: "99.8%" },
                      { name: "Payment Gateway", status: "operational", uptime: "99.99%" },
                      { name: "Storage Service", status: "operational", uptime: "99.9%" },
                    ].map((service, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-600 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{service.name}</p>
                          <p className="text-xs text-slate-400">Uptime: {service.uptime}</p>
                        </div>
                        <Badge className="bg-green-500">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {service.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-4">
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">Admin Users</CardTitle>
                  <CardDescription>Manage administrator accounts and permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {mockAdminUsers.map((admin) => (
                      <div key={admin.id} className="flex items-center justify-between p-3 bg-slate-600 rounded-lg hover:bg-slate-500 transition-colors">
                        <div className="flex-1">
                          <p className="text-white font-medium">{admin.name}</p>
                          <p className="text-xs text-slate-400">{admin.email}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={admin.role === "super_admin" ? "default" : "secondary"}>
                            {admin.role.replace("_", " ")}
                          </Badge>
                          <span className="text-xs text-slate-400">{admin.lastLogin}</span>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-4">
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">Content Management</CardTitle>
                  <CardDescription>Upload and manage PTE questions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { type: "Speaking", count: 250, lastUpdate: "2 hours ago" },
                      { type: "Writing", count: 180, lastUpdate: "5 hours ago" },
                      { type: "Reading", count: 320, lastUpdate: "1 day ago" },
                      { type: "Listening", count: 200, lastUpdate: "3 days ago" },
                    ].map((content, i) => (
                      <div key={i} className="p-4 bg-slate-600 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-white font-medium">{content.type}</p>
                            <p className="text-2xl font-bold text-teal-400">{content.count}</p>
                            <p className="text-xs text-slate-400">Updated {content.lastUpdate}</p>
                          </div>
                          <FileText className="w-8 h-8 text-teal-500" />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1 bg-teal-600 hover:bg-teal-700">
                            <Upload className="w-3 h-3 mr-1" />
                            Upload
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4">
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">System Configuration</CardTitle>
                  <CardDescription>Manage system-wide settings and integrations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {[
                      { label: "Email Service", value: "Resend API", status: "configured" },
                      { label: "Payment Gateway", value: "Khalti + eSewa", status: "configured" },
                      { label: "Storage Service", value: "AWS S3", status: "configured" },
                      { label: "Analytics", value: "Custom Dashboard", status: "configured" },
                      { label: "Backup Service", value: "Daily Backups", status: "configured" },
                      { label: "API Rate Limit", value: "1000 req/min", status: "active" },
                    ].map((setting, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-600 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{setting.label}</p>
                          <p className="text-sm text-slate-400">{setting.value}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className="bg-green-500">{setting.status}</Badge>
                          <Button size="sm" variant="ghost" className="text-blue-400">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Logs Tab */}
            <TabsContent value="logs" className="space-y-4">
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">Activity Logs</CardTitle>
                  <CardDescription>Track all admin actions and system events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {mockSystemLogs.map((log) => (
                      <div key={log.id} className="p-3 bg-slate-600 rounded-lg border-l-4 border-teal-500">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-white font-medium">{log.action}</p>
                            <p className="text-sm text-slate-400">By {log.admin} on {log.target}</p>
                          </div>
                          <Badge variant={log.status === "success" ? "default" : "destructive"}>
                            {log.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-slate-400">{log.details}</p>
                          <p className="text-xs text-slate-500">{log.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-4">
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">Security & Compliance</CardTitle>
                  <CardDescription>System security settings and audit controls</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      { name: "Two-Factor Authentication", enabled: true, users: 45 },
                      { name: "API Key Rotation", enabled: true, days: 90 },
                      { name: "SSL/TLS Encryption", enabled: true, version: "1.3" },
                      { name: "DDoS Protection", enabled: true, status: "Active" },
                      { name: "Data Backup", enabled: true, frequency: "Daily" },
                      { name: "Security Audit Log", enabled: true, retention: "90 days" },
                    ].map((security, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-600 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{security.name}</p>
                          <p className="text-xs text-slate-400">
                            {security.enabled ? "✓ Enabled" : "✗ Disabled"}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {security.enabled && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                          <Button size="sm" variant="ghost" className="text-blue-400">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
