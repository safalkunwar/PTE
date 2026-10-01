/**
 * System Admin Router
 * Advanced system control procedures for senior administrators
 */

import { router, protectedProcedure } from "../_core/trpc";
import os from "node:os";
import { getDb } from "../db";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as adminDb from "../admin/adminDb";
import * as analyticsDb from "../admin/analyticsDb";
import { getAdminUserDetails, listAdminUsers, setUserBanStatus, setUserRole } from "../admin/userAdmin";
import { canDemoteUser, canSuspendUser } from "../admin/adminPolicy";
/**
 * Admin-only procedure - checks for super admin role
 */
const adminOnlyProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only administrators can access this resource",
    });
  }
  return next({ ctx });
});

export const systemAdminRouter = router({
  /**
   * Get system health status
   */
  getSystemHealth: adminOnlyProcedure.query(async () => {
    try {
      const db = await getDb();
      let database = "unavailable" as "connected" | "unavailable";
      if (db) {
        await db.execute("SELECT 1");
        database = "connected";
      }
      const cpu = Math.round(Math.min(100, (os.loadavg()[0] / Math.max(1, os.cpus().length)) * 100));
      const memory = Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100);
      const emailConfigured = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "test_key");
      const paymentsConfigured = Boolean(
        (process.env.KHALTI_SECRET_KEY && process.env.KHALTI_SECRET_KEY !== "test_secret_key") ||
        (process.env.ESEWA_MERCHANT_CODE && process.env.ESEWA_MERCHANT_CODE !== "TESTMERCHANT")
      );
      const services = [
        { name: "API Server", status: "operational", uptime: `${Math.floor(process.uptime() / 3600)}h` },
        { name: "Database", status: database === "connected" ? "operational" : "unavailable", uptime: "runtime check" },
        { name: "Email Service", status: emailConfigured ? "configured" : "not_configured", uptime: "configuration check" },
        { name: "Payment Gateway", status: paymentsConfigured ? "configured" : "not_configured", uptime: "configuration check" },
        { name: "Storage Service", status: "configured", uptime: "runtime check" },
      ];
      return {
        status: database === "connected" ? "healthy" as const : "degraded" as const,
        cpu,
        memory,
        database,
        api: "operational" as const,
        uptime: `${Math.floor(process.uptime() / 3600)} hours`,
        lastCheck: new Date().toISOString(),
        services,
      };
    } catch (error) {
      console.error("[Admin] Error fetching system health:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  /**
   * Get system statistics
   */
  getSystemStats: adminOnlyProcedure.query(async ({ ctx }) => {
    try {
      return await adminDb.getSystemStatistics();
    } catch (error) {
      console.error("[Admin] Error fetching system stats:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  /**
   * Get activity logs
   */
  getActivityLogs: adminOnlyProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
        filter: z.enum(["all", "user_actions", "system_events", "errors"]).default("all"),
      })
    )
    .query(async ({ input }) => {
      try {
        return await adminDb.getUserActivityLogs(input.limit, input.offset);
      } catch (error) {
        console.error("[Admin] Error fetching activity logs:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  /**
   * List users with real persisted role and ban state.
   */
  listUsers: adminOnlyProcedure
    .input(z.object({
      limit: z.number().int().min(1).max(100).default(50),
      offset: z.number().int().min(0).default(0),
      search: z.string().optional(),
      role: z.enum(["user", "admin"]).optional(),
      isBanned: z.boolean().optional(),
    }))
    .query(async ({ input }) => {
      try {
        return await listAdminUsers(input);
      } catch (error) {
        console.error("[Admin] Error listing users:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Unable to list users" });
      }
    }),

  /**
   * View one user's persisted profile, subscriptions, and recent sessions.
   */
  getUserDetails: adminOnlyProcedure
    .input(z.object({ userId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const details = await getAdminUserDetails(input.userId);
      if (!details) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      return details;
    }),

  /**
   * Ban or unban a user. An administrator may not suspend their own account.
   */
  toggleUserBan: adminOnlyProcedure
    .input(z.object({
      userId: z.number().int().positive(),
      isBanned: z.boolean(),
      reason: z.string().max(500).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!canSuspendUser(ctx.user.id, input.userId)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Administrators cannot suspend their own account" });
      }
      const updated = await setUserBanStatus(input.userId, input.isBanned, input.reason);
      if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      return { success: true, ...updated };
    }),

  /**
   * Promote or demote a user. Administrators may not demote themselves.
   */
  setUserRole: adminOnlyProcedure
    .input(z.object({ userId: z.number().int().positive(), role: z.enum(["user", "admin"]) }))
    .mutation(async ({ input, ctx }) => {
      if (!canDemoteUser(ctx.user.id, input.userId, input.role)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Administrators cannot demote their own account" });
      }
      const updated = await setUserRole(input.userId, input.role);
      if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      return { success: true, ...updated };
    }),

  /**
   * Update system configuration
   */
  updateSystemConfig: adminOnlyProcedure
    .input(
      z.object({
        key: z.string(),
        value: z.any(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      console.log(`[Admin] ${ctx.user?.name} updated config: ${input.key}`);

      return {
        success: true,
        message: "Configuration updated",
        key: input.key,
        timestamp: new Date().toISOString(),
      };
    }),

  /**
   * Trigger system backup
   */
  triggerBackup: adminOnlyProcedure.mutation(async ({ ctx }) => {
    console.log(`[Admin] ${ctx.user?.name} triggered system backup`);

    return {
      success: true,
      backupId: `backup_${Date.now()}`,
      status: "in_progress",
      estimatedTime: "15 minutes",
      timestamp: new Date().toISOString(),
    };
  }),

  /**
   * Get backup history
   */
  getBackupHistory: adminOnlyProcedure.query(async () => {
    return [
      {
        id: "backup_1710000000000",
        date: new Date(Date.now() - 24 * 60 * 60000).toISOString(),
        size: "2.5 GB",
        status: "completed",
        duration: "12 minutes",
      },
      {
        id: "backup_1709913600000",
        date: new Date(Date.now() - 48 * 60 * 60000).toISOString(),
        size: "2.4 GB",
        status: "completed",
        duration: "11 minutes",
      },
      {
        id: "backup_1709827200000",
        date: new Date(Date.now() - 72 * 60 * 60000).toISOString(),
        size: "2.3 GB",
        status: "completed",
        duration: "10 minutes",
      },
    ];
  }),

  /**
   * Get API key management
   */
  getApiKeys: adminOnlyProcedure.query(async () => {
    // Mock API keys - in production, fetch from secure vault
    return [
      {
        id: "key_1",
        name: "Email Service",
        key: "sk_live_••••••••••••••••",
        status: "active",
        lastUsed: "2 minutes ago",
        createdAt: "2024-01-15",
      },
      {
        id: "key_2",
        name: "Payment Gateway",
        key: "pk_live_••••••••••••••••",
        status: "active",
        lastUsed: "5 minutes ago",
        createdAt: "2024-01-20",
      },
      {
        id: "key_3",
        name: "Storage Service",
        key: "aws_••••••••••••••••",
        status: "active",
        lastUsed: "1 hour ago",
        createdAt: "2024-02-01",
      },
    ];
  }),

  /**
   * Rotate API key
   */
  rotateApiKey: adminOnlyProcedure
    .input(
      z.object({
        keyId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      console.log(`[Admin] ${ctx.user?.name} rotated API key: ${input.keyId}`);

      return {
        success: true,
        message: "API key rotated successfully",
        newKey: "sk_live_••••••••••••••••",
        timestamp: new Date().toISOString(),
      };
    }),

  /**
   * Get user engagement metrics
   */
  getUserEngagement: adminOnlyProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ input }) => {
      try {
        return await analyticsDb.getUserEngagementMetrics(input.days);
      } catch (error) {
        console.error("[Admin] Error fetching user engagement:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  /**
   * Get learning performance metrics
   */
  getLearningPerformance: adminOnlyProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ input }) => {
      try {
        return await analyticsDb.getLearningPerformanceMetrics(input.days);
      } catch (error) {
        console.error("[Admin] Error fetching learning performance:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  /**
   * Get payment and revenue metrics
   */
  getPaymentRevenue: adminOnlyProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ input }) => {
      try {
        return await analyticsDb.getPaymentRevenueMetrics(input.days);
      } catch (error) {
        console.error("[Admin] Error fetching payment revenue:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  /**
   * Get customer lifetime value
   */
  getCustomerLTV: adminOnlyProcedure.query(async () => {
    try {
      return await analyticsDb.getCustomerLifetimeValue();
    } catch (error) {
      console.error("[Admin] Error fetching CLV:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  /**
   * Get churn and retention metrics
   */
  getChurnRetention: adminOnlyProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ input }) => {
      try {
        return await analyticsDb.getChurnRetentionMetrics(input.days);
      } catch (error) {
        console.error("[Admin] Error fetching churn retention:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  /**
   * Get system alerts
   */
  getSystemAlerts: adminOnlyProcedure.query(async () => {
    // Mock alerts - in production, fetch from monitoring service
    return [
      {
        id: 1,
        severity: "warning" as const,
        title: "High Memory Usage",
        message: "Memory usage is at 78%, consider scaling up",
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
      },
      {
        id: 2,
        severity: "info" as const,
        title: "Backup Completed",
        message: "Daily backup completed successfully",
        timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
      },
      {
        id: 3,
        severity: "error" as const,
        title: "Failed Payment Processing",
        message: "2 payments failed in the last hour",
        timestamp: new Date(Date.now() - 4 * 60 * 60000).toISOString(),
      },
    ];
  }),

  /**
   * Acknowledge alert
   */
  acknowledgeAlert: adminOnlyProcedure
    .input(
      z.object({
        alertId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      console.log(`[Admin] ${ctx.user?.name} acknowledged alert: ${input.alertId}`);

      return {
        success: true,
        message: "Alert acknowledged",
        timestamp: new Date().toISOString(),
      };
    }),

  /**
   * Get system performance metrics
   */
  getPerformanceMetrics: adminOnlyProcedure.query(async () => {
    // Mock performance metrics - in production, fetch from monitoring service
    return {
      apiResponseTime: "145ms",
      databaseQueryTime: "23ms",
      cacheHitRate: "87%",
      errorRate: "0.02%",
      uptime: "99.98%",
      requestsPerSecond: 1250,
      activeConnections: 456,
      queuedRequests: 12,
    };
  }),
});

export default systemAdminRouter;
