# GSM - Indracipta RDN Application (RDN App)

A high-performance enterprise dashboard application for managing network technicians, customer registrations, and subscription lifecycle management.

---

## 🏗️ System Overview & Schema

Indracipta RDN is a multi-tier management system connecting Sales, Admin, Production, and Technicians.

### 📋 Master Module (Core Database)

The heart of the system containing all static and operational data.

#### 1. Technician Management

- **FreeLance Technician Registration**: Onboarding system for external network specialists.
- **Kewilayahan Database**: Regional mapping based on the technician's residence for optimized task allocation.
- **Tool Inventory**: Detailed tracking of physical tools owned by each technician.

#### 2. Pricing & Labor (Modul Harga Jasa)

Standardized rates for field operations (Manual addition supported):

- **Survey & Troubleshooting**: Visit from ODP to Customer premises.
- **Backbone/Distribution**: Labor costs for pulling distribution cables.
- **Infrastructure**: Post/Pole installation and ODP installation.

#### 3. Organizational Hierarchy

- **Regional Mapping**: Wilayah → Unit → Sub-Unit → Supervisor.
- **Product & Offerings**: Packet definitions, dynamic Pricing, and Discount schemas.
- **Operational Scheduling**: Master technician schedule for installations and maintenance.

---

## 🔄 Operational Flows (Standard Operating Procedures)

### 🎫 Interface & Ticket Types

The system handles two primary "Info Ticket" categories:

1. **IKR (Instalasi Kabel Rumah)**: New customer home cable installation.
2. **Trouble Ticket**: Internet connectivity issues or physical network damage.

### 📊 Reporting & Performance Forms

#### A. Supervisor View (Data Prospek)

- **Performance Prospek**:
  - **Input Capel**: Name, Address.
  - **Needs Analysis**: Number of mobile users, number of laptop users, current provider, requested Mbps, and target price.
- **Work Activity**:
  - Regional visits (Kunjungan Wilayah).
  - Sales Prospecting & Sales Funnel management.
- **Team Performance**: Tracking the activity and conversion of the associated sales team.

#### B. KA Unit View (Managerial Controls)

- **Managerial Controls**:
  - **Daily Activity Form**: Detailed input for activities, analysis, and strategies.
  - **Resource Management**: Input for tool and manpower needs.
  - **Feedback System**: Direct line for Admin/Super Admin to provide review and coaching.
  - **History View**: Searchable list of all submitted reports with status indicators.

---

## 🏢 Unit & Sub-Unit Quota System

To manage network resources and registration volume, the system implements a Quota System:

- **Visibility**: Quota status is displayed in Unit and Sub-Unit management tables with visual progress indicators.
- **Enforcement**: New customer verification is restricted by the available quota of the associated Unit or Sub-Unit.
- **Alerts**: Real-time warnings are displayed in the Customer Detail/Verification modal if the quota is low (<20% remaining) or exhausted.
- **Management**: Authorized administrators can increment or adjust quotas through the Unit/Sub-Unit edit modals.

---

## 🏭 Production Lifecycle (Step-by-Step)

### Phase 1: Input Data

1. **Sales Channel**: Sales representatives input lead data via the Android Mobile App.
2. **Visibility**: Data instantly appears on both the Admin Dashboard and the specific Sales Representative's app dashboard.

### Phase 2: Data Processing (Admin Operations)

Admins perform deep-dive verification and technical prep:

- **Verification**: Cross-checking prospective customer data.
- **Technical Prep**: Inputting/Editing `Home ID`, `Site ID`, and `No Work Order`.
- **Logistics**: Handling "Ijin Lintas" (Right-of-way permits).
- **Production Schedule**: Assigning install dates based on the production queue (routing and priority).

### Phase 3: Output & Deployment (Work Order)

Verified data triggers a **Work Order (WO)** notification system:

- **Trigger**: Notifications sent to Unit, Supervisor, Sales, Customer, and the Technical Production Team.
- **Order Management**: Production team tags or forwards the WO to a specific Technician.
- **Financial Adjustment**: Admin can Edit/Cancel orders and set the final labor rate for technician payroll (Rekap Akhir Bulan).

---

## 🚀 Feature Roadmap: "RDN Extensions"

| Feature                    | Detailed Description                                                            | Status     |
| :------------------------- | :------------------------------------------------------------------------------ | :--------- |
| **Input-to-Install Aging** | Analytics on the time elapsed from initial input to active installation.        | ⏳ Planned |
| **Billing Aging**          | Monitoring the span between payment due date and actual fulfillment.            | ⏳ Planned |
| **Payment History**        | Comprehensive audits of Cash, Bank Transfer, and Virtual Account (VA) payments. | ⏳ Planned |
| **Periodic Reports**       | Weekly and Monthly performance reports for Supervisors and General Managers.    | ⏳ Planned |

---

## 🌐 Customer Journey & Self-Service

Within the Customer Portal, users can track their progress through a real-time schedule:

1. **Input Data** ✓ (Status: Registered)
2. **Verifikasi** ✓ (Status: Validated)
3. **Jadwal Pasang** ✓ (Status: Scheduled)
4. **No Urut Hari Ini** ✓ (Status: On the Move)
5. **Done Pemasangan** ✓ (Status: Active)
6. **Info Pembayaran & Tagihan** (Status: Billing)
   - Customers receive an internal link to a detailed payment page.
   - Xendit payment links are generated on-demand when the customer initiates payment.

### 🛠️ Subscription Management Features

Administrators can manage active customers with the following features:

- **Internet Suspension**: Toggle internet connection status (`statusNet`).
- **Account Activation**: Activate or deactivate customer accounts (`statusCust`).
- **Free Account Designation**: Mark customers as free accounts to exempt them from monthly billing.
- **Custom Billing Dates**: Set specific days of the month for invoice generation (Default: 10th).
- **Package Upgrades**: Change internet packages for active customers.
- **Data Editing**: Update customer personal and contact information.
- **Manual Coordinate Input**: Flexibility to enter latitude and longitude manually or via map picker in the registration form.

### Layanan Pelanggan (Self-Service List)

- **Access**: Change Wi-Fi Password.
- **Support**: Report No Connection, Request Invoice.
- **Commercial**: Upgrade Packets, Add-on TV Services.
- **Ecosystem**: Information on UMKM (SME) Products.

### 💰 Disbursement Approval (Super Admin Only)

The Disbursement (Payout) approval process has been hardened:

- **Visibility**: The "Approve" and "Reject" actions in the Disbursement menu are now exclusively visible to users with the `SUPER_ADMIN` role.
- **Workflow**: Non-Super Admin users can still view and propose payouts (based on permissions), but the final financial clearance must come from a Super Admin.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite.
- **UI Architecture**: Tailwind CSS v4, Lucide Icons, Shadcn UI.
- **Mobile**: Android (Sales App integration).
- **Design System**: Premium GSM "Float" aesthetic (border-less, clean typography).

### 📦 Setup & Dependencies

The system utilizes **Sonner** for high-fidelity toast notifications (configured in `App.tsx` with `richColors`).

To trigger notifications, use the `toast` utility:

```typescript
import { toast } from "sonner";

toast.success("Success message");
toast.error("Error message");
```

### 🔐 Authentication & Error Handling

The login system has been hardened to prevent unauthorized access even when the API returns a success HTTP status but an internal failure flag:

- **Validation**: `AuthService.login` validates the `status` flag in the API response.
- **Feedback**: `LoginForm` provides real-time feedback via toasts for both successful entries and descriptive error messages from the backend.
- **Redirection**: Unauthorized users are strictly prevented from entering the dashboard upon login failure.
