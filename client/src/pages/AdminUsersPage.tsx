import { AdminLayout } from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Mail, Calendar, Lock, Unlock, UserCheck, UserX, RefreshCw } from "lucide-react";
import { useState } from "react";

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const usersQuery = trpc.systemAdmin.listUsers.useQuery({
    limit: 100,
    offset: 0,
    search: searchTerm.trim() || undefined,
  });

  const setUserRole = trpc.systemAdmin.setUserRole.useMutation({
    onSuccess: () => void usersQuery.refetch(),
  });
  const toggleUserBan = trpc.systemAdmin.toggleUserBan.useMutation({
    onSuccess: () => void usersQuery.refetch(),
  });

  const handleRoleToggle = async (user: { id: number; role: "user" | "admin" }) => {
    const nextRole = user.role === "admin" ? "user" : "admin";
    if (!window.confirm(`${nextRole === "admin" ? "Promote" : "Demote"} this user?`)) return;
    try {
      await setUserRole.mutateAsync({ userId: user.id, role: nextRole });
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to update the user role.");
    }
  };

  const handleBanToggle = async (user: { id: number; name: string | null; isBanned: boolean }) => {
    const nextBanned = !user.isBanned;
    const reason = nextBanned ? window.prompt(`Reason for suspending ${user.name || "this user"}?`) || undefined : undefined;
    if (nextBanned && reason === undefined && !window.confirm("Suspend without a reason?")) return;
    try {
      await toggleUserBan.mutateAsync({ userId: user.id, isBanned: nextBanned, reason });
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to update the user status.");
    }
  };

  const isMutating = setUserRole.isPending || toggleUserBan.isPending;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">Manage persisted accounts, roles, and suspension status.</p>
          </div>
          <Button variant="outline" onClick={() => void usersQuery.refetch()} disabled={usersQuery.isFetching}>
            <RefreshCw className={`mr-2 h-4 w-4 ${usersQuery.isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="search"
                placeholder="Search by name, email, or account ID..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              {usersQuery.isLoading ? "Loading users..." : `${usersQuery.data?.length ?? 0} users shown`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usersQuery.isLoading ? (
              <div className="flex items-center justify-center py-12 text-gray-500" aria-busy="true">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading users
              </div>
            ) : usersQuery.isError ? (
              <div className="text-center py-12 text-red-600">
                <p>Unable to load users.</p>
                <Button className="mt-3" variant="outline" onClick={() => void usersQuery.refetch()}>Try again</Button>
              </div>
            ) : !usersQuery.data?.length ? (
              <div className="text-center py-12 text-gray-500">No users found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">User</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Last sign-in</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {usersQuery.data.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                              {(user.name || user.email || "?").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.name || "Unnamed user"}</p>
                              <p className="flex items-center gap-1 text-sm text-gray-600"><Mail size={14} />{user.email || "No email"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${user.isBanned ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                            {user.isBanned ? "Suspended" : "Active"}
                          </span>
                          {user.isBanned && user.banReason && <p className="mt-1 max-w-48 truncate text-xs text-gray-500" title={user.banReason}>{user.banReason}</p>}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          <span className="flex items-center gap-2"><Calendar size={15} />{user.lastSignedIn ? new Date(user.lastSignedIn).toLocaleDateString() : "Never"}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" disabled={isMutating} onClick={() => void handleRoleToggle(user)} title={user.role === "admin" ? "Demote to user" : "Promote to admin"}>
                              {user.role === "admin" ? <Unlock className="mr-1 h-4 w-4 text-orange-600" /> : <Lock className="mr-1 h-4 w-4 text-green-600" />}
                              {user.role === "admin" ? "Demote" : "Promote"}
                            </Button>
                            <Button size="sm" variant={user.isBanned ? "default" : "outline"} disabled={isMutating} onClick={() => void handleBanToggle(user)} title={user.isBanned ? "Restore access" : "Suspend user"}>
                              {user.isBanned ? <UserCheck className="mr-1 h-4 w-4" /> : <UserX className="mr-1 h-4 w-4" />}
                              {user.isBanned ? "Restore" : "Suspend"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
