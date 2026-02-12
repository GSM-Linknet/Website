import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  WhatsappTemplateService,
  type WhatsappTemplate,
} from "@/services/whatsapp-template.service";

export const useTemplateManagement = () => {
  const [templates, setTemplates] = useState<WhatsappTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState(false);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [currentTemplate, setCurrentTemplate] =
    useState<WhatsappTemplate | null>(null);
  const [editForm, setEditForm] = useState({ name: "", content: "" });
  const [saving, setSaving] = useState(false);
  const [variables, setVariables] = useState<string[]>([]);
  const [previewContent, setPreviewContent] = useState("");

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await WhatsappTemplateService.findAll({ paginate: false });
      setTemplates(data.items || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal memuat template");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    try {
      await WhatsappTemplateService.toggleActive(id, !currentActive);
      toast.success(
        !currentActive
          ? "Template berhasil diaktifkan"
          : "Template berhasil dinonaktifkan",
      );
      loadTemplates();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Gagal mengubah status template",
      );
    }
  };

  const openEditDialog = async (template: WhatsappTemplate) => {
    setCurrentTemplate(template);
    setEditForm({ name: template.name, content: template.content });

    try {
      const vars = await WhatsappTemplateService.getAvailableVariables(
        template.code,
      );
      setVariables(vars);
    } catch (error) {
      console.error("Failed to load variables:", error);
    }

    setEditDialog(true);
  };

  const handleSave = async () => {
    if (!currentTemplate) return;

    try {
      setSaving(true);
      await WhatsappTemplateService.update(currentTemplate.id, editForm);
      toast.success("Template berhasil diperbarui");
      setEditDialog(false);
      loadTemplates();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Gagal memperbarui template",
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async (template: WhatsappTemplate) => {
    setCurrentTemplate(template);

    try {
      const sampleData = getSampleData(template.code);
      const result = await WhatsappTemplateService.preview(
        template.code,
        sampleData,
      );
      setPreviewContent(result.rendered);
      setPreviewDialog(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal membuat preview");
    }
  };

  const getSampleData = (code: string): Record<string, any> => {
    const samples: Record<string, Record<string, any>> = {
      registration_fee: {
        customerName: "John Doe",
        customerId: "CUST-001",
        amount: "350.000",
        registrationFee: "100.000",
        paymentLink: "https://pay.gsmlink.net/INV001",
        date: "08 Februari 2026",
      },
      monthly_bill: {
        customerName: "John Doe",
        invoiceNumber: "INV-2026-001",
        amount: "350.000",
        packageName: "Premium 50Mbps",
        period: "2026-02",
        dueDate: "05 Februari 2026",
        paymentLink: "https://pay.gsmlink.net/INV001",
      },
      customer_pending_verification: {
        unitName: "Unit Jakarta Pusat",
        customerName: "John Doe",
        phone: "081234567890",
        address: "Jl. Sudirman No. 123",
        packageName: "Premium 50Mbps",
        date: "08 Februari 2026",
      },
      customer_activation: {
        customerName: "John Doe",
        customerId: "CUST-001",
        packageName: "Premium 50Mbps",
        activationDate: "08 Februari 2026",
      },
      payment_confirmation: {
        customerName: "John Doe",
        invoiceNumber: "INV-2026-001",
        amount: "350.000",
        period: "2026-02",
        packageName: "Premium 50Mbps",
      },
      verification_success: {
        customerName: "John Doe",
        customerId: "CUST-001",
        packageName: "Premium 50Mbps",
        address: "Jl. Sudirman No. 123",
        verificationDate: "08 Februari 2026",
      },
    };

    return samples[code] || {};
  };

  return {
    templates,
    loading,
    editDialog,
    setEditDialog,
    previewDialog,
    setPreviewDialog,
    currentTemplate,
    editForm,
    setEditForm,
    saving,
    variables,
    previewContent,
    handleToggle,
    openEditDialog,
    handleSave,
    handlePreview,
  };
};
