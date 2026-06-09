/**
 * Hook for Customer Registration Page Logic.
 * Manages states, filters, permissions, and handlers for customer registration operations.
 * 
 * Used by: CustomerRegistrationPage
 * Dependencies: AuthService, CustomerService, MasterService, UserService, LinkNetService, useCustomers, useToast, useDebounce
 */

import { useState, useEffect, useCallback } from "react";
import { AuthService } from "@/services/auth.service";
import { CustomerService, type Customer } from "@/services/customer.service";
import { MasterService } from "@/services/master.service";
import { UserService } from "@/services/user.service";
import { LinkNetService } from "@/services/linknet.service";
import { useCustomers } from "./useCustomers";
import { useToast } from "@/hooks/useToast";
import { useDebounce } from "@/hooks/useDebounce";

export function useCustomerRegistration() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const userProfile = AuthService.getUser();
  const userRole = userProfile?.role || "USER";
  const resource = "pelanggan.pendaftaran";

  const permissions = {
    canCreate: AuthService.hasPermission(userRole, resource, "create"),
    canEdit: AuthService.hasPermission(userRole, resource, "edit"),
    canDelete: AuthService.hasPermission(userRole, resource, "delete"),
    canVerify: AuthService.hasPermission(userRole, resource, "verify"),
    canLinknet: AuthService.hasPermission(userRole, resource, "linknet"),
  };

  const customerHook = useCustomers({ linknetPipeline: 'pending' });
  const { setQuery, update, remove, refetch: refresh } = customerHook;

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerToView, setCustomerToView] = useState<Customer | null>(null);
  const [customerToVerify, setCustomerToVerify] = useState<Customer | null>(null);
  const [linknetCustomer, setLinknetCustomer] = useState<Customer | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Initial state for filters
  const [filters, setFilters] = useState({
    status: "all",
    internet: "all",
    wilayah: "all",
    unit: "all",
    upline: "all",
    linknetStatus: "all",
  });

  const [units, setUnits] = useState<{ label: string; value: string }[]>([]);
  const [uplines, setUplines] = useState<{ label: string; value: string }[]>([]);

  // Fetch unit and upline options
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [unitsRes, usersRes] = await Promise.all([
          MasterService.getUnits({ paginate: false }),
          UserService.findAll({ paginate: false }),
        ]);

        if (unitsRes.data) {
          const unitOptions = (unitsRes.data as any).items?.map((u: any) => ({
            label: u.name,
            value: u.id,
          })) || [];
          setUnits([{ label: "Semua Unit", value: "all" }, ...unitOptions]);
        }

        if (usersRes.data) {
          const uplineOptions = (usersRes.data as any).items?.map((u: any) => ({
            label: u.name,
            value: u.id,
          })) || [];
          setUplines([{ label: "Semua Upline", value: "all" }, ...uplineOptions]);
        }
      } catch (error) {
        console.error("Failed to fetch filter options", error);
      }
    };

    fetchData();
  }, []);

  // Update query when debounced search or filters change
  useEffect(() => {
    const searchParts: string[] = [];
    let searchString: string | undefined = undefined;
    if (debouncedSearchQuery) searchString = debouncedSearchQuery;
    if (filters.status !== "all") searchParts.push(`statusCust:${filters.status === "verified"}`);
    if (filters.internet !== "all") searchParts.push(`statusNet:${filters.internet === "online"}`);
    if (filters.wilayah !== "all") searchParts.push(`idWilayah:${filters.wilayah}`);
    if (filters.unit !== "all") searchParts.push(`unitId:${filters.unit}`);
    if (filters.upline !== "all") searchParts.push(`idUpline:${filters.upline}`);
    if (filters.linknetStatus !== "all") searchParts.push(`linknetStatus:${filters.linknetStatus}`);

    const whereParam = searchParts.join("+");
    const payload = {
      where: whereParam || undefined,
      search: searchString || undefined,
      linknetPipeline: 'pending' as const,
    };
    setQuery(payload);
  }, [debouncedSearchQuery, filters, setQuery]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const searchParts: string[] = [];
      let searchString: string | undefined = undefined;
      if (debouncedSearchQuery) searchString = debouncedSearchQuery;
      if (filters.status !== "all") searchParts.push(`statusCust:${filters.status === "verified"}`);
      if (filters.internet !== "all") searchParts.push(`statusNet:${filters.internet === "online"}`);
      if (filters.wilayah !== "all") searchParts.push(`idWilayah:${filters.wilayah}`);
      if (filters.unit !== "all") searchParts.push(`unitId:${filters.unit}`);
      if (filters.upline !== "all") searchParts.push(`idUpline:${filters.upline}`);
      if (filters.linknetStatus !== "all") searchParts.push(`linknetStatus:${filters.linknetStatus}`);

      const whereParam = searchParts.join("+");
      const exportQuery = {
        where: whereParam || undefined,
        search: searchString || undefined,
        linknetPipeline: 'pending' as const,
      };

      await CustomerService.exportExcel(exportQuery);
      toast({
        title: "Ekspor Berhasil",
        description: "Data pelanggan berhasil diunduh.",
      });
    } catch (error) {
      toast({
        title: "Gagal Ekspor",
        description: "Terjadi kesalahan saat mengunduh data excel.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreateCustomer = async (customerData: Partial<Customer> | FormData) => {
    await CustomerService.createCustomer(customerData);
    toast({
      title: "Berhasil",
      description: "Pelanggan baru berhasil didaftarkan",
    });
    refresh();
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (data: Partial<Customer>) => {
    if (!selectedCustomer) return false;
    const result = await update(selectedCustomer.id, data);
    if (result) {
      toast({
        title: "Berhasil",
        description: "Data pelanggan berhasil diperbarui",
      });
      setIsEditModalOpen(false);
      setSelectedCustomer(null);
      return true;
    }
    return false;
  };

  const handleDeleteClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCustomer) return;
    const success = await remove(selectedCustomer.id);
    if (success) {
      toast({
        title: "Berhasil",
        description: "Pelanggan berhasil dihapus",
      });
      setIsDeleteModalOpen(false);
      setSelectedCustomer(null);
    }
  };

  const handleViewDetail = (row: Customer) => {
    setCustomerToView(row);
    setIsDetailModalOpen(true);
  };

  const handleStartReview = async (row: Customer) => {
    try {
      await CustomerService.updateCustomer(row.id, { linknetStatus: "ON_REVIEW" });
      toast({
        title: "Status Diperbarui",
        description: "Status pelanggan sekarang On Review",
      });
      refresh();
    } catch (error) {
      toast({
        title: "Gagal",
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  };

  const handleVerify = useCallback(async (idOrCustomer: string | Customer, isVerify: boolean = true, siteId?: string) => {
    const id = typeof idOrCustomer === 'string' ? idOrCustomer : idOrCustomer.id;

    setVerifyingId(id);
    try {
      if (isVerify) {
        await CustomerService.verifyCustomer(id, siteId);
        toast({
          title: "Verifikasi Berhasil",
          description: "Pelanggan telah diverifikasi.",
        });
      } else {
        await CustomerService.rejectCustomer(id);
        toast({
          title: "Pelanggan Ditolak",
          description: "Status pelanggan ditolak.",
          variant: "destructive",
        });
      }
      refresh();
    } catch (error) {
      toast({
        title: "Gagal Memproses",
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setVerifyingId(null);
      setCustomerToVerify(null);
    }
  }, [refresh, toast]);

  const handleVerifyAction = async (id: string, isVerify: boolean, siteId?: string) => {
    await handleVerify(id, isVerify, siteId);
    setIsDetailModalOpen(false);
  };

  const handleLinknetPipeline = (row: Customer) => {
    setLinknetCustomer(row);
  };

  const handleRegenerateId = async (row: Customer) => {
    if (!permissions.canEdit) return;
    try {
      await CustomerService.regenerateCustomerId(row.id);
      toast({
        title: "Berhasil",
        description: `ID Pelanggan ${row.name} berhasil di-generate ulang`,
      });
      refresh();
    } catch (error) {
      toast({
        title: "Gagal",
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  };

  const handleSetDocumentUploaded = async (row: Customer) => {
    if (!permissions.canLinknet) return;
    try {
      await CustomerService.setDocumentUploaded(row.id);
      toast({
        title: "Berhasil",
        description: `Status Linknet ${row.name} diubah ke DOCUMENT_UPLOADED`,
      });
      refresh();
    } catch (error) {
      toast({
        title: "Gagal",
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  };

  const handleCheckWOStatus = async (row: Customer) => {
    if (!row.lnId) {
      toast({
        title: "ID WO Tidak Ditemukan",
        description: "Pelanggan belum memiliki Service Order (LN ID).",
        variant: "destructive",
      });
      return;
    }

    try {
      const res: any = await LinkNetService.getWorkOrderStatus(row.id, row.lnId);
      const state = res?.data?.state || "Unknown";
      toast({
        title: "Status WO",
        description: `Status Work Order saat ini: ${state}`,
      });
      refresh();
    } catch (error) {
      toast({
        title: "Gagal Mengecek Status",
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  };

  // Get current user for role-based status
  const currentUser = AuthService.getUser();
  const isSubUnit = currentUser?.role === "SALES";
  const defaultRegStatus: "Menunggu" | "Diproses" = isSubUnit ? "Menunggu" : "Diproses";

  return {
    // State
    searchQuery,
    setSearchQuery,
    filters,
    units,
    uplines,
    isEditModalOpen,
    setIsEditModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    selectedCustomer,
    setSelectedCustomer,
    customerToView,
    setCustomerToView,
    customerToVerify,
    setCustomerToVerify,
    linknetCustomer,
    setLinknetCustomer,
    verifyingId,
    isDetailModalOpen,
    setIsDetailModalOpen,
    isExporting,
    defaultRegStatus,

    // Permissions
    ...permissions,

    // Customers Data
    ...customerHook,

    // Handlers
    handleFilterChange,
    handleExportData,
    handleCreateCustomer,
    handleEdit,
    handleEditSubmit,
    handleDeleteClick,
    handleConfirmDelete,
    handleViewDetail,
    handleStartReview,
    handleVerifyAction,
    handleVerify,
    handleLinknetPipeline,
    handleRegenerateId,
    handleSetDocumentUploaded,
    handleCheckWOStatus,
  };
}
