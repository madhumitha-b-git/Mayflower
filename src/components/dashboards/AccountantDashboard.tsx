import React, { useState } from 'react';
import { 
  DollarSign, TrendingUp, FileText, CreditCard, LogOut, Bell, BarChart3, 
  Download, ArrowUpRight, Filter, Search, Sparkles, Check, X, Building, 
  Lock, LockOpen, RefreshCw, ShieldCheck, CheckCircle2, AlertTriangle, 
  PieChart, Landmark, Truck, Receipt, FileSpreadsheet, Eye, ChevronRight
} from 'lucide-react';
import { UserProfile } from '../../types';

interface Props { 
  user: UserProfile; 
  onLogout: () => void;
  onSwitchRole?: (role: string) => void;
}

interface ZReport {
  id: string;
  outlet: string;
  terminal: string;
  zRepCode: string;
  grossSale: number;
  edcSwipes: number;
  upiAmount: number;
  systemCash: number;
  physicalCount: number;
  variance: number;
  status: 'Reconciled' | 'Variance Cleared' | 'Audit Pending';
}

interface VendorInvoice {
  id: string;
  vendor: string;
  items: string;
  poCode: string;
  amount: number;
  dueDate: string;
  status: 'Approved · Release' | 'Due Soon' | 'Customs Duty Paid' | 'Ready to Pay' | 'Paid';
  imageUrl?: string;
}

export const AccountantDashboard: React.FC<Props> = ({ user, onLogout, onSwitchRole }) => {
  const [selectedSanctuary, setSelectedSanctuary] = useState('poes');
  const [isBooksLocked, setIsBooksLocked] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; text: string; icon: string } | null>(null);

  // Z-Reports Matrix State
  const [zReports, setZReports] = useState<ZReport[]>([
    { id: 'ZR-01', outlet: 'Poes Garden Flagship', terminal: 'Terminal 01', zRepCode: '#PET-88219', grossSale: 194800, edcSwipes: 98400, upiAmount: 74200, systemCash: 22200, physicalCount: 22200, variance: 0.00, status: 'Reconciled' },
    { id: 'ZR-02', outlet: 'Palavakkam ECR Seaside', terminal: 'Terminal 02', zRepCode: '#PET-88220', grossSale: 142650, edcSwipes: 68250, upiAmount: 56100, systemCash: 18300, physicalCount: 18250, variance: -50.00, status: 'Variance Cleared' },
    { id: 'ZR-03', outlet: 'Anna Nagar East Pavilion', terminal: 'Terminal 03', zRepCode: '#PET-88221', grossSale: 86410, edcSwipes: 41200, upiAmount: 36810, systemCash: 8400, physicalCount: 8400, variance: 0.00, status: 'Reconciled' },
    { id: 'ZR-04', outlet: 'Velachery Lakeside Conservatory', terminal: 'Terminal 04', zRepCode: '#PET-88222', grossSale: 62360, edcSwipes: 25535, upiAmount: 17653, systemCash: 19172, physicalCount: 19172, variance: 0.00, status: 'Reconciled' },
  ]);

  // Accounts Payable Consignment Invoices State
  const [vendorInvoices, setVendorInvoices] = useState<VendorInvoice[]>([
    { 
      id: 'INV-101', 
      vendor: 'Ocean Prime Logistics Ltd', 
      items: 'Hokkaido Scallops & Norwegian Langoustine', 
      poCode: 'PO #8912', 
      amount: 184500, 
      dueDate: 'Due in 4 Days', 
      status: 'Due Soon',
      imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=150&auto=format&fit=crop&q=80'
    },
    { 
      id: 'INV-102', 
      vendor: 'Ooty Highlands Botanical Estate', 
      items: 'Winter Black Truffles & Micro-Flora', 
      poCode: 'PO #8915', 
      amount: 92300, 
      dueDate: 'Immediate', 
      status: 'Approved · Release',
      imageUrl: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=150&auto=format&fit=crop&q=80'
    },
    { 
      id: 'INV-103', 
      vendor: 'Grand Cru Importers Chennai', 
      items: 'Burgundy En Primeur Allocation', 
      poCode: 'PO #8901', 
      amount: 465300, 
      dueDate: 'Paid Duty', 
      status: 'Customs Duty Paid',
      imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=150&auto=format&fit=crop&q=80'
    },
    { 
      id: 'INV-104', 
      vendor: 'Nilgiri High-Grown Teas Co.', 
      items: 'Single Flush Silver Needle', 
      poCode: 'PO #8928', 
      amount: 32000, 
      dueDate: 'Ready', 
      status: 'Ready to Pay'
    },
  ]);

  const showToast = (title: string, text: string, icon = 'check_circle') => {
    setToastMessage({ title, text, icon });
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleToggleLedgerLock = () => {
    const nextLocked = !isBooksLocked;
    setIsBooksLocked(nextLocked);
    if (nextLocked) {
      showToast('Books Locked & Sealed', 'All 4 outlet registers closed for posting. CA audit hash generated.', 'lock');
    } else {
      showToast('Books Re-Opened', 'Auditor permission granted to adjust ledger entries.', 'lock_open');
    }
  };

  const handleFetchPetpoojaZFiles = () => {
    showToast('Syncing Petpooja POS API', 'Fetching latest Z-reports across Poes Garden, ECR, Anna Nagar & Velachery...', 'sync');
  };

  const handleAuthorizeNEFT = () => {
    setVendorInvoices(prev => prev.map(inv => inv.status !== 'Paid' ? { ...inv, status: 'Paid' } : inv));
    showToast('NEFT Batch Authorized', 'Transferred ₹7,74,100 to 4 luxury vendor bank accounts.', 'payments');
  };

  const handleDownloadDossier = (type: 'pdf' | 'csv' | 'zip') => {
    if (type === 'pdf') {
      showToast('Generating Audit PDF', 'Official Mayflower Sanctuaries CA signed report downloading...', 'picture_as_pdf');
    } else if (type === 'csv') {
      showToast('Exporting POS Ledger CSV', 'Raw transaction rows formatted for Tally Prime / SAP...', 'table_view');
    } else {
      showToast('Generating Dossier Pack', 'Compiled GSTR-1, Bank EDC logs, and Procurement invoices into ZIP bundle.', 'archive');
    }
  };

  // Aggregates
  const totalGrossSale = zReports.reduce((s, r) => s + r.grossSale, 0);
  const totalEdc = zReports.reduce((s, r) => s + r.edcSwipes, 0);
  const totalUpi = zReports.reduce((s, r) => s + r.upiAmount, 0);
  const totalSystemCash = zReports.reduce((s, r) => s + r.systemCash, 0);
  const totalPhysicalCount = zReports.reduce((s, r) => s + r.physicalCount, 0);
  const totalVariance = zReports.reduce((s, r) => s + r.variance, 0);

  return (
    <div className="min-h-screen bg-[#fbf9f5] text-[#1b1c1a] font-sans antialiased pb-16">
      {/* Toast Component */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#02150c] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center space-x-3 border border-[#e4c27d]/40 animate-bounce">
          <Sparkles className="w-5 h-5 text-[#e4c27d]" />
          <div>
            <div className="text-xs font-bold text-[#e4c27d]">{toastMessage.title}</div>
            <div className="text-xs text-gray-300">{toastMessage.text}</div>
          </div>
        </div>
      )}

      {/* Top Fixed Header */}
      <header className="sticky top-0 z-50 bg-[#fbf9f5]/95 backdrop-blur-xl border-b border-[#e4e2de] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo & Monogram */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#02150c] text-[#e4c27d] flex items-center justify-center font-serif font-bold text-xl shadow">
                M
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg font-bold text-[#02150c] leading-tight">Mayflower</span>
                <span className="text-[10px] font-bold text-[#745b20] uppercase tracking-widest">Sanctuaries · Chennai</span>
              </div>
            </div>

            {/* Sanctuary Selector */}
            <div className="hidden xl:flex items-center bg-[#efeeea] px-3 py-1.5 rounded-xl space-x-2 text-xs">
              <span className="text-[#424844] font-medium">Sanctuary:</span>
              <select 
                value={selectedSanctuary}
                onChange={(e) => setSelectedSanctuary(e.target.value)}
                className="bg-transparent font-bold text-[#02150c] focus:outline-none cursor-pointer"
              >
                <option value="poes">Poes Garden Flagship</option>
                <option value="ecr">Palavakkam ECR</option>
                <option value="anna">Anna Nagar East</option>
                <option value="velachery">Velachery Lakeside</option>
              </select>
            </div>
          </div>

          {/* Right Header Status & Role */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 bg-[#f5f3ef] px-3 py-1.5 rounded-xl text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[#424844]">Petpooja POS</span>
              <span className="font-bold text-[#745b20] uppercase text-[10px]">Live Sync</span>
            </div>

            <div className="flex items-center space-x-2 bg-[#efeeea] px-3 py-1 rounded-xl text-xs">
              <span className="text-[10px] uppercase font-bold text-[#424844]">Role:</span>
              <span className="bg-[#152a20] text-white px-2 py-0.5 rounded-md font-bold uppercase text-[10px]">
                {user.role ? user.role.toUpperCase() : 'ACCOUNTANT'}
              </span>
            </div>

            {/* Quick Role Switcher */}
            {onSwitchRole && user.role === 'SuperAdmin' && (
              <select
                onChange={(e) => onSwitchRole(e.target.value)}
                defaultValue="accountant-ledger"
                className="bg-[#02150c] text-xs text-[#e4c27d] border border-green-800 rounded-xl px-3 py-1.5 cursor-pointer focus:outline-none"
              >
                <option value="owner-management">👑 Owner & Multi-Outlet</option>
                <option value="admin-suite">🛡️ System Admin</option>
                <option value="manager-operations">💼 Floor Operations</option>
                <option value="chef-kitchen">👨‍🍳 Kitchen & HACCP</option>
                <option value="hr-roster">👥 Staffing & HR</option>
                <option value="accountant-ledger">📊 POS Reconciliation</option>
                <option value="customer-portal">🍷 VIP Guest Suite</option>
              </select>
            )}

            <button 
              onClick={onLogout} 
              className="text-xs text-red-600 hover:text-red-800 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Secondary Sub-navigation Ribbon */}
        <div className="w-full bg-[#f5f3ef] border-t border-[#e4e2de] px-6 overflow-x-auto">
          <div className="max-w-7xl mx-auto flex items-center space-x-1 py-2 text-xs">
            {user.role === 'SuperAdmin' && (
              <>
                <button 
                  onClick={() => onSwitchRole?.('owner-management')}
                  className="px-3 py-1.5 font-bold text-[#424844] hover:text-[#02150c] hover:bg-[#eae8e4] rounded-lg transition whitespace-nowrap cursor-pointer"
                >
                  Owner & Multi-Outlet
                </button>
                <button 
                  onClick={() => onSwitchRole?.('admin-suite')}
                  className="px-3 py-1.5 font-bold text-[#424844] hover:text-[#02150c] hover:bg-[#eae8e4] rounded-lg transition whitespace-nowrap cursor-pointer"
                >
                  System Admin
                </button>
                <button 
                  onClick={() => onSwitchRole?.('manager-operations')}
                  className="px-3 py-1.5 font-bold text-[#424844] hover:text-[#02150c] hover:bg-[#eae8e4] rounded-lg transition whitespace-nowrap cursor-pointer"
                >
                  Floor Operations
                </button>
                <button 
                  onClick={() => onSwitchRole?.('chef-kitchen')}
                  className="px-3 py-1.5 font-bold text-[#424844] hover:text-[#02150c] hover:bg-[#eae8e4] rounded-lg transition whitespace-nowrap cursor-pointer"
                >
                  Kitchen & HACCP
                </button>
                <button 
                  onClick={() => onSwitchRole?.('hr-roster')}
                  className="px-3 py-1.5 font-bold text-[#424844] hover:text-[#02150c] hover:bg-[#eae8e4] rounded-lg transition whitespace-nowrap cursor-pointer"
                >
                  Staffing & HR
                </button>
              </>
            )}
            <button 
              className="px-3 py-1.5 font-bold bg-[#152a20] text-white rounded-lg shadow-sm whitespace-nowrap cursor-pointer"
            >
              POS Reconciliation
            </button>
            <button 
              onClick={() => onSwitchRole?.('customer-portal')}
              className="px-3 py-1.5 font-bold text-[#424844] hover:text-[#02150c] hover:bg-[#eae8e4] rounded-lg transition whitespace-nowrap cursor-pointer"
            >
              VIP Guest Suite
            </button>
          </div>
        </div>
      </header>

      {/* Main Fiscal Body */}
      <main className="max-w-7xl mx-auto px-6 pt-6 space-y-8">
        {/* Fiscal Context Ribbon */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#745b20]">
              <span>Treasury & Fiscal Compliance</span>
              <span className="w-1 h-1 rounded-full bg-gray-400" />
              <span className="text-[#424844]">FY 2024-25 · Period M08 (November)</span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-[#02150c]">Financial Intelligence & POS Audit</h1>
            <p className="text-xs text-[#424844] max-w-2xl">
              Live synchronization engine matching Petpooja POS cloud transactions, bank gateway batch logs, and vendor procurement accounts across four Chennai flagships.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2 bg-[#efeeea] px-3 py-2 rounded-xl text-xs">
              <span className="text-[#745b20] font-bold">📅 Today: 18 Nov 2024</span>
              <span className="text-gray-400">|</span>
              <span className="text-[#424844]">EOD Shift 2</span>
            </div>

            <button
              onClick={handleToggleLedgerLock}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm cursor-pointer ${
                isBooksLocked 
                  ? 'bg-[#152a20] text-[#e4c27d]' 
                  : 'bg-[#02150c] hover:bg-[#152a20] text-white'
              }`}
            >
              {isBooksLocked ? <LockOpen className="w-4 h-4 text-[#e4c27d]" /> : <Lock className="w-4 h-4 text-[#e4c27d]" />}
              <span className="uppercase tracking-wider">
                {isBooksLocked ? 'Books Locked (Read-Only)' : 'Lock Daily Books'}
              </span>
            </button>

            <button
              onClick={() => handleDownloadDossier('zip')}
              className="bg-[#f5f3ef] hover:bg-[#efeeea] text-[#02150c] border border-[#e4e2de] px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Dossier</span>
            </button>
          </div>
        </section>

        {/* 4 Metric Bento Tiles */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Tile 1: Daily Gross */}
          <div className="bg-white p-5 rounded-2xl border border-[#e4e2de] shadow-sm hover:shadow-md transition space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#424844]">Gross Settlements (Net)</span>
                <div className="text-2xl font-bold font-serif text-[#02150c] mt-1">₹4,86,220</div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-[#f5f3ef] flex items-center justify-center text-[#02150c]">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-[#e4e2de]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#02150c]">99.8% Bank Reconciled</span>
                <span className="text-[#745b20] font-semibold">4 Flagships live</span>
              </div>
              <div className="w-full bg-[#f5f3ef] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#02150c] h-full rounded-full" style={{ width: '99.8%' }} />
              </div>
            </div>
          </div>

          {/* Tile 2: Tender Split */}
          <div className="bg-white p-5 rounded-2xl border border-[#e4e2de] shadow-sm hover:shadow-md transition space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#424844]">Payment Tender Split</span>
                <div className="text-xl font-bold font-serif text-[#02150c] mt-1">₹2,33,385 <span className="text-xs font-normal text-gray-500">Card Dominant</span></div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-[#f5f3ef] flex items-center justify-center text-[#02150c]">
                <PieChart className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="w-full h-2 rounded-full flex overflow-hidden bg-[#efeeea]">
                <div className="bg-[#02150c] h-full" style={{ width: '48%' }} title="Card: 48%" />
                <div className="bg-[#745b20] h-full" style={{ width: '38%' }} title="UPI/QR: 38%" />
                <div className="bg-gray-400 h-full" style={{ width: '10%' }} title="Cash: 10%" />
                <div className="bg-[#e4c27d] h-full" style={{ width: '4%' }} title="Credit: 4%" />
              </div>
              <div className="grid grid-cols-4 text-center text-[10px] text-[#424844]">
                <div><strong className="text-[#02150c]">48%</strong> EDC</div>
                <div><strong className="text-[#745b20]">38%</strong> UPI</div>
                <div><strong>10%</strong> Cash</div>
                <div><strong className="text-[#02150c]">4%</strong> Corp</div>
              </div>
            </div>
          </div>

          {/* Tile 3: COGS Margins */}
          <div className="bg-white p-5 rounded-2xl border border-[#e4e2de] shadow-sm hover:shadow-md transition space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#424844]">Aggregate Food & Bev Cost</span>
                <div className="text-2xl font-bold font-serif text-[#02150c] mt-1">28.2% <span className="text-xs bg-[#efeeea] text-[#02150c] px-2 py-0.5 rounded font-bold">Target &lt;30%</span></div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-[#f5f3ef] flex items-center justify-center text-[#02150c]">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-[#e4e2de]">
              <div><span className="text-gray-500">Wine Cellar:</span> <strong className="text-[#745b20]">74.5% Mar</strong></div>
              <div><span className="text-gray-500">Kitchen:</span> <strong className="text-[#02150c]">69.2% Mar</strong></div>
            </div>
          </div>

          {/* Tile 4: GST Accrual */}
          <div className="bg-white p-5 rounded-2xl border border-[#e4e2de] shadow-sm hover:shadow-md transition space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#424844]">Daily GST Accrual (5% F&B)</span>
                <div className="text-2xl font-bold font-serif text-[#02150c] mt-1">₹24,310</div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-[#f5f3ef] flex items-center justify-center text-[#02150c]">
                <Landmark className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-[#e4e2de]">
              <div><span className="text-gray-500">CGST (2.5%):</span> <strong className="text-[#02150c]">₹12,155</strong></div>
              <div><span className="text-gray-500">SGST (2.5%):</span> <strong className="text-[#02150c]">₹12,155</strong></div>
            </div>
          </div>
        </section>

        {/* SECTION 1: Petpooja POS Daily Z-Report Matrix */}
        <section className="bg-white rounded-2xl border border-[#e4e2de] shadow-sm overflow-hidden space-y-4">
          <div className="p-5 bg-[#f5f3ef] border-b border-[#e4e2de] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-[#745b20] font-bold text-xs">
                <Receipt className="w-4 h-4" />
                <span>Section 01 · Daily Petpooja POS Register Audit (Z-Reports)</span>
              </div>
              <h3 className="text-lg font-serif font-bold text-[#02150c]">Petpooja Master Terminal Settlement Register</h3>
            </div>

            <div className="flex items-center space-x-2">
              <button 
                onClick={handleFetchPetpoojaZFiles}
                className="bg-[#02150c] hover:bg-[#152a20] text-white px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center space-x-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Fetch Cloud Z-Files</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#efeeea] text-[#424844] font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Outlet / Register ID</th>
                  <th className="px-4 py-3">POS Gross Sale</th>
                  <th className="px-4 py-3">EDC Swipes (Card)</th>
                  <th className="px-4 py-3">UPI / BharatPe</th>
                  <th className="px-4 py-3">System Cash</th>
                  <th className="px-4 py-3">Physical Count</th>
                  <th className="px-4 py-3">Cash Variance</th>
                  <th className="px-4 py-3 text-right">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e4e2de]">
                {zReports.map((report) => (
                  <tr key={report.id} className="hover:bg-[#f5f3ef] transition">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-[#02150c] text-sm">{report.outlet}</div>
                      <div className="text-[11px] text-gray-500">{report.terminal} • <span className="font-mono">{report.zRepCode}</span></div>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-[#02150c]">₹{report.grossSale.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3.5">₹{report.edcSwipes.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3.5">₹{report.upiAmount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3.5">₹{report.systemCash.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3.5 font-semibold text-[#02150c]">₹{report.physicalCount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3.5">
                      {report.variance === 0 ? (
                        <span className="bg-[#efeeea] text-[#02150c] font-bold px-2 py-0.5 rounded text-[11px]">₹0.00 Exact</span>
                      ) : (
                        <span className="bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded text-[11px]">- ₹50.00</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-bold ${
                        report.status === 'Reconciled'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{report.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#efeeea] font-bold text-[#02150c]">
                <tr>
                  <td className="px-4 py-3.5 font-serif text-sm">Aggregate Consolidation</td>
                  <td className="px-4 py-3.5">₹{totalGrossSale.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3.5">₹{totalEdc.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3.5">₹{totalUpi.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3.5">₹{totalSystemCash.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3.5">₹{totalPhysicalCount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3.5 text-red-600">- ₹50.00</td>
                  <td className="px-4 py-3.5 text-right text-[#745b20] uppercase text-[11px]">99.98% Net Accuracy</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* SECTION 2 & 3 COMBINED: Merchant Gateway & Luxury Vendor AP */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 6 Cols: Gateway Batches & Settlement Terminal Slips */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#745b20] uppercase">
                <CreditCard className="w-4 h-4" />
                <span>Section 02 · Gateway & Batch Slips</span>
              </div>
              <span className="text-xs text-gray-500 font-medium">T+1 Auto Sweep</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#e4e2de] shadow-sm space-y-3">
              {/* Pine Labs EDC */}
              <div className="p-4 bg-[#f5f3ef] rounded-xl border border-[#e4e2de] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded bg-[#152a20] text-white flex items-center justify-center font-bold text-xs">PL</div>
                    <div>
                      <div className="font-bold text-xs text-[#02150c]">Pine Labs POS · HDFC Batch #4109</div>
                      <div className="text-[10px] text-gray-500">Terminal TID-892401 · Settled at 23:30</div>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-[#02150c]">₹2,33,385</span>
                </div>
                <div className="text-[11px] text-gray-500 flex justify-between pt-1 border-t border-[#e4e2de]">
                  <span>MDR Fee Deducted: 1.15% (₹2,683.92)</span>
                  <span className="text-[#745b20] font-bold">Credited to HDFC **4192</span>
                </div>
              </div>

              {/* Razorpay UPI */}
              <div className="p-4 bg-[#f5f3ef] rounded-xl border border-[#e4e2de] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded bg-[#745b20] text-white flex items-center justify-center font-bold text-xs">RZ</div>
                    <div>
                      <div className="font-bold text-xs text-[#02150c]">Razorpay Direct Dynamic UPI Gateway</div>
                      <div className="text-[10px] text-gray-500">Table QR Autopay · Batch #RZP-81042</div>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-[#02150c]">₹1,84,763</span>
                </div>
                <div className="text-[11px] text-gray-500 flex justify-between pt-1 border-t border-[#e4e2de]">
                  <span>MDR 0.00% (Govt UPI Mandate)</span>
                  <span className="text-[#745b20] font-bold">Transfer In-Flight (Expected 06:00 IST)</span>
                </div>
              </div>

              {/* VIP Corporate Accounts */}
              <div className="p-4 bg-[#f5f3ef] rounded-xl border border-[#e4e2de] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded bg-gray-200 text-[#02150c] flex items-center justify-center font-bold text-xs">CA</div>
                    <div>
                      <div className="font-bold text-xs text-[#02150c]">VIP Corporate Dining Accounts (30-Day Net)</div>
                      <div className="text-[10px] text-gray-500">Chennai Industrial Group & Consulate Diners</div>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-[#02150c]">₹19,450</span>
                </div>
                <div className="text-[11px] text-gray-500 flex justify-between pt-1 border-t border-[#e4e2de]">
                  <span>3 Signed Charge Slips Attached</span>
                  <span className="text-[#02150c] font-bold">Billed to Ledger 204</span>
                </div>
              </div>

              <div className="p-3 bg-[#02150c] text-white rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs">
                  <ShieldCheck className="w-5 h-5 text-[#e4c27d]" />
                  <span>Bank Feeds Matched — All webhooks verified</span>
                </div>
                <span className="text-[10px] font-bold uppercase bg-[#e4c27d] text-[#02150c] px-2 py-0.5 rounded">Synced</span>
              </div>
            </div>
          </div>

          {/* Right 6 Cols: Luxury Provisioning & Accounts Payable */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#745b20] uppercase">
                <Truck className="w-4 h-4" />
                <span>Section 03 · Cold-Chain & Luxury Vendor AP</span>
              </div>
              <span className="text-xs text-gray-500 font-medium">30-Day Payables Ledger</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#e4e2de] shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-[#e4e2de]">
                <span className="font-bold text-gray-500 uppercase">Active Consignments Requiring Release</span>
                <span className="font-bold text-[#745b20]">₹8,42,100 Total Pending</span>
              </div>

              {vendorInvoices.map((inv) => (
                <div key={inv.id} className="p-3 bg-[#f5f3ef] rounded-xl border border-[#e4e2de] flex items-center justify-between hover:bg-[#efeeea] transition">
                  <div className="flex items-center space-x-3">
                    {inv.imageUrl ? (
                      <img src={inv.imageUrl} alt={inv.vendor} className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-xs">
                        AP
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-xs text-[#02150c]">{inv.vendor}</div>
                      <div className="text-[10px] text-gray-500">{inv.items} • <span className="font-mono">{inv.poCode}</span></div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-xs text-[#02150c]">₹{inv.amount.toLocaleString('en-IN')}</div>
                    <div className="text-[10px] font-bold text-[#745b20]">{inv.status}</div>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-[#745b20] font-bold cursor-pointer hover:underline">
                  View Complete 42-Vendor Ledger
                </span>
                <button
                  onClick={handleAuthorizeNEFT}
                  className="bg-[#02150c] hover:bg-[#152a20] text-white text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl transition cursor-pointer"
                >
                  Authorize Batched NEFT
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: Tax Compliance (GSTR-1 / GSTR-3B) & Food Cost Matrix */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#745b20] uppercase">
              <Landmark className="w-4 h-4" />
              <span>Section 04 · Tax Compliance (GSTR-1 / GSTR-3B) & Profitability Matrix</span>
            </div>
            <span className="text-xs text-gray-500 font-mono">GSTIN: 33AAAAA0000A1Z5</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 Cols: Tax Computation & Variance Summary */}
            <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-[#e4e2de] shadow-sm space-y-4">
              <div className="p-4 bg-[#f5f3ef] rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#745b20]">Current Tax Filing Window</span>
                  <div className="text-base font-serif font-bold text-[#02150c]">November 2024 Return Preparation</div>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="bg-[#e4c27d] text-[#02150c] px-2.5 py-1 rounded font-bold">Audit Mode: ON</span>
                  <span className="bg-[#02150c] text-white px-2.5 py-1 rounded font-bold">E-Invoice Sync: 100%</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[#424844] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-2">Category</th>
                      <th className="py-2">Taxable Base (MTD)</th>
                      <th className="py-2">CGST Rate / Amt</th>
                      <th className="py-2">SGST Rate / Amt</th>
                      <th className="py-2 text-right">Total Accrued</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e4e2de]">
                    <tr>
                      <td className="py-3 font-bold text-[#02150c]">Dine-In Restaurant Food Service</td>
                      <td className="py-3">₹72,40,000</td>
                      <td className="py-3">2.5% (₹1,81,000)</td>
                      <td className="py-3">2.5% (₹1,81,000)</td>
                      <td className="py-3 text-right font-bold text-[#02150c]">₹3,62,000</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-bold text-[#02150c]">Alcohol & Cellar Revenue (TN VAT)</td>
                      <td className="py-3">₹38,20,000</td>
                      <td className="py-3 text-gray-500">TN Excise 58%</td>
                      <td className="py-3 text-gray-500">Direct State Levy</td>
                      <td className="py-3 text-right font-bold text-[#02150c]">₹22,15,600</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-bold text-[#02150c]">Private Conservatory Event Hire</td>
                      <td className="py-3">₹8,50,000</td>
                      <td className="py-3">9.0% (₹76,500)</td>
                      <td className="py-3">9.0% (₹76,500)</td>
                      <td className="py-3 text-right font-bold text-[#02150c]">₹1,53,000</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-bold text-[#745b20]">Input Tax Credit (ITC) on Cold Chain</td>
                      <td className="py-3 text-[#745b20]">- ₹18,40,000</td>
                      <td className="py-3 text-[#745b20]">- ₹92,000</td>
                      <td className="py-3 text-[#745b20]">- ₹92,000</td>
                      <td className="py-3 text-right font-bold text-[#745b20]">- ₹1,84,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-[#f5f3ef] rounded-xl flex items-center justify-between text-xs">
                <span>Next statutory GSTR-3B monthly filing deadline: <strong className="text-[#02150c]">20th December 2024</strong></span>
                <span className="font-bold text-[#02150c]">Net Payable: ₹3,31,000</span>
              </div>
            </div>

            {/* Right 4 Cols: Food Cost & Audit Artifact Exporter */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-[#e4e2de] shadow-sm space-y-3">
                <span className="text-[10px] font-bold uppercase text-[#424844]">Theoretical vs Actual Food Cost</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-bold font-serif text-[#02150c]">28.2% Actual</span>
                  <span className="text-xs text-[#745b20] font-bold">27.6% Recipe Model</span>
                </div>
                <div className="w-full bg-[#efeeea] h-2.5 rounded-full overflow-hidden flex">
                  <div className="bg-[#02150c] h-full" style={{ width: '27.6%' }} />
                  <div className="bg-[#745b20] h-full" style={{ width: '0.6%' }} />
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Variance (+0.6%) tracked to trim loss on A5 Wagyu striploins and cold prep ambient shrinkage during weekend high-volume service.
                </p>
              </div>

              <div className="bg-[#02150c] text-white p-5 rounded-2xl shadow-md space-y-4 relative overflow-hidden">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#e4c27d]">Audit Ready Artifacts</span>
                  <h3 className="text-lg font-serif font-bold text-white">Financial Dossier Pack</h3>
                  <p className="text-xs text-gray-300 mt-1">
                    Generates signed PDF bundle with daily Petpooja Z-summaries, EDC merchant batch proof, ITC invoices, and CA signature sign-off sheet.
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => handleDownloadDossier('pdf')}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#745b20] hover:bg-[#8e6f28] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition cursor-pointer shadow"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Export Signed Audit PDF</span>
                  </button>

                  <button
                    onClick={() => handleDownloadDossier('csv')}
                    className="w-full py-2 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Export Raw Petpooja CSV</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-[#e4e2de] mt-16 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#424844]">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Petpooja REST API v2.4 (Active 14ms) • SOC2 Type II Certified • Chennai GSTIN Compliant</span>
          </div>
          <div>© 2024 Mayflower Hospitality Group India LLP. All Privileges Reserved.</div>
        </div>
      </footer>
    </div>
  );
};
