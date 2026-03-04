import { useState, useMemo, useCallback } from "react";
import { Plus, Users, Edit2, Trash2, ShieldCheck, LogIn, Loader2, Ban, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BaseTable } from "@/components/shared/BaseTable";
import { ImpersonateConfirmDialog } from "../components/ImpersonateConfirmDialog";
import { UserModal } from "../components/UserModal";
import { DeleteConfirmationModal } from "@/components/shared/DeleteConfirmationModal";
import { useUser } from "../hooks/useUser";
import { useToast } from "@/hooks/useToast";
import { Badge } from "@/components/ui/badge";
import type { User } from "@/services/user.service";
import { UserService } from "@/services/user.service";
import { AuthService } from "@/services/auth.service";
import { SearchInput } from "@/components/shared/SearchInput";

// ==================== Page Component ====================

export default function UserPage() {
    const { toast } = useToast();
    const userProfile = AuthService.getUser();
    const userRole = userProfile?.role || "USER";
    const resource = "master.users";
    const impersonateResource = "master.users";

    const canCreate = AuthService.hasPermission(userRole, resource, "create");
    const canEdit = AuthService.hasPermission(userRole, resource, "edit");
    const canDelete = AuthService.hasPermission(userRole, resource, "delete");
    // Special permission for impersonating users
    const canImpersonate = AuthService.hasPermission(userRole, impersonateResource, "impersonate");

    const {
        data,
        loading,
        totalItems,
        page,
        totalPages,
        setPage,
        create,
        creating,
        update,
        updating,
        remove: deleteUser,
        deleting,
        setQuery
    } = useUser(undefined, {
        onError: (err) => {
            toast({
                title: "Gagal",
                description: err.message || "Terjadi kesalahan pada server",
                variant: "destructive",
            });
        }
    });

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isImpersonateModalOpen, setIsImpersonateModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [userToImpersonate, setUserToImpersonate] = useState<User | null>(null);
    const [impersonatingId, setImpersonatingId] = useState<string | null>(null);
    const [suspendingId, setSuspendingId] = useState<string | null>(null);

    // Handlers
    const handleAdd = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    const handleEdit = (row: User) => {
        setSelectedUser(row);
        setIsModalOpen(true);
    };

    const handleDelete = (row: User) => {
        setUserToDelete(row);
        setIsDeleteModalOpen(true);
    };

    const handleImpersonateClick = (row: User) => {
        setUserToImpersonate(row);
        setIsImpersonateModalOpen(true);
    };

    const handleConfirmImpersonate = async () => {
        if (!userToImpersonate) return;

        setImpersonatingId(userToImpersonate.id);
        try {
            await AuthService.impersonate(userToImpersonate.id);
            toast({
                title: "Login Berhasil",
                description: `Sedang mengalihkan ke sesi ${userToImpersonate.name}...`,
            });
            // Reload page to apply new session
            window.location.href = "/dashboard";
        } catch (error) {
            toast({
                title: "Gagal Impersonate",
                description: error instanceof Error ? error.message : "Terjadi kesalahan",
                variant: "destructive",
            });
            setImpersonatingId(null);
            setIsImpersonateModalOpen(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;
        const success = await deleteUser(userToDelete.id);
        if (success) {
            toast({
                title: "Berhasil",
                description: "User berhasil dihapus",
            });
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
        }
    };

    const handleSubmit = async (formData: Partial<User>) => {
        let result = null;
        if (selectedUser) {
            result = await update(selectedUser.id, formData);
        } else {
            result = await create(formData);
        }

        if (result) {
            toast({
                title: "Berhasil",
                description: `User berhasil ${selectedUser ? "diperbarui" : "ditambahkan"}`,
            });
            return true;
        }
        return false;
    };

    const handleSearch = useCallback((val: string) => {
        setQuery({ search: val ? `name:${val}` : undefined });
    }, [setQuery]);

    const handleSuspend = async (row: User) => {
        setSuspendingId(row.id);
        try {
            await UserService.suspendUser(row.id);
            toast({
                title: "User Disuspend",
                description: `${row.name} tidak dapat login lagi.`,
                variant: "default"
            });
            // Refresh data
            window.location.reload();
        } catch (error) {
            toast({
                title: "Gagal Suspend",
                description: error instanceof Error ? error.message : "Terjadi kesalahan",
                variant: "destructive"
            });
        } finally {
            setSuspendingId(null);
        }
    };

    const handleUnsuspend = async (row: User) => {
        setSuspendingId(row.id);
        try {
            await UserService.unsuspendUser(row.id);
            toast({
                title: "User Diaktifkan Kembali",
                description: `${row.name} sudah bisa login lagi.`,
            });
            // Refresh data
            window.location.reload();
        } catch (error) {
            toast({
                title: "Gagal Mengaktifkan",
                description: error instanceof Error ? error.message : "Terjadi kesalahan",
                variant: "destructive"
            });
        } finally {
            setSuspendingId(null);
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "SUPER_ADMIN": return "bg-purple-100 text-purple-700 border-purple-200";
            case "ADMIN_PUSAT": return "bg-indigo-100 text-indigo-700 border-indigo-200";
            case "ADMIN_CABANG": return "bg-blue-100 text-blue-700 border-blue-200";
            case "ADMIN_UNIT": return "bg-sky-100 text-sky-700 border-sky-200";
            case "SUPERVISOR": return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case "SALES": return "bg-amber-100 text-amber-700 border-amber-200";
            case "USER": return "bg-slate-100 text-slate-700 border-slate-200";
            default: return "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    // Columns
    const columns = useMemo(() => [
        {
            header: "USER",
            accessorKey: "name",
            cell: (row: User) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-200">
                        {row.name.charAt(0)}
                    </div>
                    <div>
                        <p className="font-bold text-[#101D42]">{row.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{row.email}</p>
                    </div>
                </div>
            )
        },
        {
            header: "ROLE",
            accessorKey: "role",
            cell: (row: User) => {
                let label = row.role.replace(/_/g, " ");
                return (
                    <Badge variant="outline" className={getRoleBadgeColor(row.role)}>
                        {label}
                    </Badge>
                );
            }
        },
        {
            header: "PENEMPATAN",
            accessorKey: "wilayahId",
            cell: (row: User) => {
                const isCentral = ["SUPER_ADMIN", "ADMIN_PUSAT"].includes(row.role);
                if (isCentral) {
                    return <span className="text-slate-400 italic">Global / Pusat</span>;
                }
                const placement = row.subUnit?.name || row.unit?.name || row.cabang?.name || row.wilayah?.name || "-";
                return <span className="text-slate-600 font-medium">{placement}</span>;
            }
        },
        {
            header: "STATUS",
            accessorKey: "status",
            cell: (row: User) => (
                <Badge className={row.status ? "bg-green-500" : "bg-red-500"}>
                    {row.status ? "Aktif" : "Non-Aktif"}
                </Badge>
            )
        },
        {
            header: "AKSI",
            accessorKey: "actions",
            className: "w-[120px] text-center",
            cell: (row: User) => {
                if (!canEdit && !canDelete && !canImpersonate) return <span className="text-slate-400">-</span>;

                return (
                    <div className="flex items-center justify-center gap-2">
                        {canImpersonate && row.id !== userProfile?.id && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-indigo-600 hover:bg-indigo-50"
                                onClick={() => handleImpersonateClick(row)}
                                disabled={!!impersonatingId}
                                title="Login sebagai user ini"
                            >
                                {impersonatingId === row.id ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <LogIn size={14} />
                                )}
                            </Button>
                        )}
                        {canEdit && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-blue-600 hover:bg-blue-50"
                                onClick={() => handleEdit(row)}
                            >
                                <Edit2 size={14} />
                            </Button>
                        )}
                        {canEdit && row.role !== 'SUPER_ADMIN' && (
                            row.status ? (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full text-orange-600 hover:bg-orange-50"
                                    onClick={() => handleSuspend(row)}
                                    disabled={!!suspendingId}
                                    title="Suspend user"
                                >
                                    {suspendingId === row.id ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <Ban size={14} />
                                    )}
                                </Button>
                            ) : (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full text-green-600 hover:bg-green-50"
                                    onClick={() => handleUnsuspend(row)}
                                    disabled={!!suspendingId}
                                    title="Aktifkan kembali"
                                >
                                    {suspendingId === row.id ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <CheckCircle size={14} />
                                    )}
                                </Button>
                            )
                        )}
                        {canDelete && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-red-600 hover:bg-red-50"
                                onClick={() => handleDelete(row)}
                                disabled={deleting}
                            >
                                <Trash2 size={14} />
                            </Button>
                        )}
                    </div>
                );
            },
        },
    ], [deleting, canEdit, canDelete, canImpersonate, impersonatingId, suspendingId, userProfile]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#101D42] flex items-center gap-2">
                        <Users className="text-blue-600" />
                        Kelola Users
                    </h1>
                    <p className="text-sm text-slate-500">Manajemen akun pengguna dan hak akses sistem</p>
                </div>
                <div className="flex items-center gap-4">
                    <SearchInput
                        onSearch={handleSearch}
                        placeholder="Cari user (nama)..."
                    />
                    {canCreate && (
                        <Button
                            onClick={handleAdd}
                            className="bg-[#101D42] text-white rounded-xl font-bold shadow-lg"
                        >
                            <Plus size={18} className="mr-2" />
                            Tambah User
                        </Button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40">
                <div className="flex items-center gap-3 mb-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                    <div className="p-2 bg-blue-500 rounded-lg text-white">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Access Control</p>
                        <p className="text-sm text-slate-600 font-medium">
                            {loading ? "Memuat data..." : `Terdapat ${totalItems} pengguna terdaftar dalam sistem.`}
                        </p>
                    </div>
                </div>

                <BaseTable
                    data={data}
                    columns={columns}
                    rowKey={(row: User) => row.id}
                    className="border-none shadow-none"
                    loading={loading}
                    page={page}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    onPageChange={setPage}
                />
            </div>

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                isLoading={creating || updating}
                initialData={selectedUser}
            />

            {/* Impersonate Confirmation Modal */}
            <ImpersonateConfirmDialog
                isOpen={isImpersonateModalOpen}
                onClose={() => setIsImpersonateModalOpen(false)}
                onConfirm={handleConfirmImpersonate}
                user={userToImpersonate}
                loading={!!impersonatingId}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                itemName={userToDelete?.name}
                isLoading={deleting}
            />
        </div>
    );
}
