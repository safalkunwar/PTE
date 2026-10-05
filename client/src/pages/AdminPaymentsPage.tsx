import { AdminLayout } from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, RefreshCw, TrendingUp } from "lucide-react";

export default function AdminPaymentsPage() {
  const paymentsQuery = trpc.systemAdmin.getPaymentRevenue.useQuery({ days: 90 });

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
            <p className="text-gray-600 mt-2">Real revenue, gateway, subscription, and failed-payment metrics for the last 90 days.</p>
          </div>
          <Button variant="outline" onClick={() => void paymentsQuery.refetch()} disabled={paymentsQuery.isFetching}>
            <RefreshCw className={`mr-2 h-4 w-4 ${paymentsQuery.isFetching ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        {paymentsQuery.isError ? (
          <Card><CardContent className="py-12 text-center text-red-600">Unable to load payment metrics. Please try again.</CardContent></Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Completed revenue</p><p className="text-3xl font-bold mt-2">NPR {(paymentsQuery.data?.totalRevenue ?? 0).toLocaleString()}</p></div><TrendingUp className="w-12 h-12 text-green-500 opacity-30" /></div></CardContent></Card>
              <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Successful payments</p><p className="text-3xl font-bold mt-2">{(paymentsQuery.data?.revenueByMethod ?? []).reduce((sum, item) => sum + Number(item.count || 0), 0)}</p></div><CheckCircle className="w-12 h-12 text-green-500 opacity-30" /></div></CardContent></Card>
              <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Failed payments</p><p className="text-3xl font-bold mt-2 text-red-600">{paymentsQuery.data?.failedPayments ?? 0}</p></div><XCircle className="w-12 h-12 text-red-500 opacity-30" /></div></CardContent></Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Revenue by gateway</CardTitle><CardDescription>Completed transactions grouped by provider.</CardDescription></CardHeader>
                <CardContent>
                  {!paymentsQuery.data?.revenueByMethod.length ? <p className="py-8 text-center text-gray-500">No completed payments found.</p> : <div className="divide-y">{paymentsQuery.data.revenueByMethod.map((item) => <div key={String(item.method)} className="flex items-center justify-between py-3"><span className="font-medium capitalize">{item.method}</span><span className="text-right"><span className="block font-semibold">NPR {Number(item.total || 0).toLocaleString()}</span><span className="text-xs text-gray-500">{Number(item.count || 0)} transactions</span></span></div>)}</div>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Active subscriptions</CardTitle><CardDescription>Current subscription plan breakdown.</CardDescription></CardHeader>
                <CardContent>
                  {!paymentsQuery.data?.subscriptionBreakdown.length ? <p className="py-8 text-center text-gray-500">No active subscriptions found.</p> : <div className="divide-y">{paymentsQuery.data.subscriptionBreakdown.map((item) => <div key={String(item.plan)} className="flex items-center justify-between py-3"><span className="font-medium">{item.plan}</span><span className="text-right"><span className="block font-semibold">{Number(item.count || 0)} users</span><span className="text-xs text-gray-500">MRR NPR {Number(item.totalMrr || 0).toLocaleString()}</span></span></div>)}</div>}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader><CardTitle>Daily completed revenue</CardTitle><CardDescription>Transaction volume over the selected period.</CardDescription></CardHeader>
              <CardContent>
                {!paymentsQuery.data?.dailyRevenue.length ? <p className="py-8 text-center text-gray-500">No daily revenue data found.</p> : <div className="overflow-x-auto"><table className="w-full"><thead className="border-b bg-gray-50"><tr><th className="px-4 py-3 text-left text-sm font-semibold">Date</th><th className="px-4 py-3 text-right text-sm font-semibold">Transactions</th><th className="px-4 py-3 text-right text-sm font-semibold">Revenue</th></tr></thead><tbody className="divide-y">{paymentsQuery.data.dailyRevenue.map((day) => <tr key={String(day.date)}><td className="px-4 py-3">{String(day.date)}</td><td className="px-4 py-3 text-right">{Number(day.count || 0)}</td><td className="px-4 py-3 text-right font-medium">NPR {Number(day.total || 0).toLocaleString()}</td></tr>)}</tbody></table></div>}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
