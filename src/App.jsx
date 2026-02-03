import { useEffect, useRef, useState } from 'react'
import './App.css'
import { supabase } from './supabaseClient'
import {
  Bell,
  Calendar,
  DollarSign,
  Download,
  FileText,
  Filter,
  Menu,
  Plus,
  Search,
  TrendingUp,
  Upload,
  Users,
  X,
} from 'lucide-react'

const LoginView = ({
  loginEmail,
  loginPassword,
  loginError,
  loginHint,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 px-6">
    <div className="w-full max-w-md bg-white border border-gray-200 shadow-xl rounded-2xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
          DC
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">DC Cable LLC</h1>
          <p className="text-sm text-gray-600">Financial Management System</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Sign in to your account
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        Use your company credentials to continue.
      </p>
      {loginHint && (
        <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-700">
          {loginHint}
        </div>
      )}

      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={loginEmail}
            onChange={onEmailChange}
            placeholder="name@dccable.com"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            autoComplete="username"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            value={loginPassword}
            onChange={onPasswordChange}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            autoComplete="current-password"
          />
        </div>
        {loginError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {loginError}
          </p>
        )}
        <button
          type="submit"
          className="w-full py-2.5 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
        >
          Sign In
        </button>
      </form>

      <div className="mt-6 text-xs text-gray-500 leading-relaxed">
        By continuing, you agree to company security policies. Contact an admin
        if you need access.
      </div>
    </div>
  </div>
)

const ProfileFolderCard = ({
  folder,
  canEdit,
  canAddInvoice,
  isAdmin,
  currentUserEmail,
  pendingDelete,
  onRequestDelete,
  onClearDelete,
  onAddInvoice,
  onUpdateInvoice,
  onAddInvoiceFile,
  onDeleteInvoiceFile,
  onDeleteInvoice,
  onToggleInvoicePaid,
  onSelectInvoice,
}) => {
  const [amount, setAmount] = useState('')
  const [expectedPayment, setExpectedPayment] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingInvoiceId, setEditingInvoiceId] = useState(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const fileInputRef = useRef(null)

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{folder.name}</h3>
          <p className="text-xs text-gray-500">{folder.ownerEmail}</p>
          {!folder.isActive && (
            <p className="mt-1 text-xs font-semibold text-red-600">
              Inactive project
            </p>
          )}
        </div>
        {(() => {
          const paidCount = folder.invoices.filter(
            (invoice) => invoice.paid,
          ).length
          const unpaidCount = folder.invoices.length - paidCount
          const statusLabel =
            folder.invoices.length === 0
              ? 'No invoices'
              : unpaidCount > 0
                ? 'Unpaid'
                : 'Paid'
          const statusClass =
            folder.invoices.length === 0
              ? 'bg-gray-100 text-gray-700'
              : unpaidCount > 0
                ? 'bg-amber-100 text-amber-700'
                : 'bg-green-100 text-green-700'

          return (
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass}`}
            >
              {statusLabel}
            </span>
          )
        })()}
      </div>

      <div className="space-y-3">
        {folder.invoices.length === 0 && (
          <p className="text-sm text-gray-500">
            No invoices in this project yet.
          </p>
        )}
        {folder.invoices.map((invoice) => {
          const canEditInvoice =
            canEdit &&
            !invoice.paid &&
            (isAdmin || invoice.createdBy === currentUserEmail)
          const canDeleteInvoice = canEditInvoice
          const isEditing = editingInvoiceId === invoice.id
          const files = invoice.files || []
          const legacyCount = invoice.imageUrl ? 1 : 0
          const fileCount = files.length + legacyCount

          return (
            <div
              key={invoice.id}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm space-y-2"
            >
              {!isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-[120px_120px_140px_1fr_120px_1fr] gap-2 items-center">
                  <div>
                    <div className="text-xs text-gray-500">Amount</div>
                    <div className="text-sm text-gray-900">
                      ${Number(invoice.amount || 0).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Created</div>
                    <div className="text-sm text-gray-700">{invoice.date}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Expected</div>
                    <div className="text-sm text-gray-700">
                      {invoice.expectedPaymentDate || '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Added by</div>
                    <div className="text-sm text-gray-700">
                      {invoice.createdBy}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Image</div>
                    <p className="text-sm text-gray-700">
                      {fileCount} file{fileCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          invoice.paid
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {invoice.paid ? 'Paid' : 'Unpaid'}
                      </span>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() =>
                            onToggleInvoicePaid(folder.id, invoice.id)
                          }
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                        >
                          Mark {invoice.paid ? 'Unpaid' : 'Paid'}
                        </button>
                      )}
                      {canEditInvoice && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingInvoiceId(invoice.id)
                            onSelectInvoice?.(invoice.id)
                          }}
                          className="text-xs font-semibold text-gray-600 hover:text-gray-800"
                        >
                          Edit
                        </button>
                      )}
                    <button
                      type="button"
                      onClick={() => {
                        if (!canDeleteInvoice) return
                        onRequestDelete({
                          type: 'invoice',
                          folderId: folder.id,
                          invoiceId: invoice.id,
                        })
                      }}
                      className="text-xs font-semibold text-red-600 hover:text-red-800"
                      disabled={!canDeleteInvoice}
                    >
                      Delete
                    </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Amount
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      pattern="^[0-9]*\\.?[0-9]*$"
                      value={invoice.amount}
                      onChange={(event) =>
                        onUpdateInvoice(folder.id, invoice.id, {
                          amount: Number(event.target.value || 0),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Expected Payment
                    </label>
                    <input
                      type="date"
                      value={invoice.expectedPaymentDate || ''}
                      onChange={(event) =>
                        onUpdateInvoice(folder.id, invoice.id, {
                          expectedPaymentDate: event.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingInvoiceId(null)
                        onSelectInvoice?.(null)
                      }}
                      className="px-3 py-2 text-xs border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingInvoiceId(null)
                        onSelectInvoice?.(null)
                      }}
                      className="px-3 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {canEdit && (
        <div className="space-y-3">
          {canAddInvoice ? (
            <>
              <button
                type="button"
                onClick={() => setShowNewForm((prev) => !prev)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {showNewForm ? 'Cancel' : 'New Invoice'}
              </button>
              {showNewForm && (
            <form
              className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
              onSubmit={async (event) => {
                event.preventDefault()
                if (!amount) return
                setIsSubmitting(true)
                await onAddInvoice({
                  folderId: folder.id,
                  amount,
                  expectedPaymentDate: expectedPayment || null,
                  imageFile,
                })
                setAmount('')
                setExpectedPayment('')
                setImageFile(null)
                if (fileInputRef.current) {
                  fileInputRef.current.value = ''
                }
                setIsSubmitting(false)
                setShowNewForm(false)
              }}
            >
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Date
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-gray-50">
                  {new Date().toLocaleDateString()}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Expected Payment
                </label>
                <input
                  type="date"
                  value={expectedPayment}
                  onChange={(event) => setExpectedPayment(event.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Invoice Image
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(event) =>
                    setImageFile(event.target.files?.[0] || null)
                  }
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-left hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  {imageFile ? imageFile.name : 'Upload PDF / Image'}
                </button>
              </div>
              <button
                type="submit"
                className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add Invoice'}
              </button>
            </form>
              )}
            </>
          ) : (
            <p className="text-xs text-gray-500">
              This project is inactive. New invoices are disabled until an admin
              reactivates it.
            </p>
          )}
        </div>
      )}

      {!canEdit && (
        <p className="text-xs text-gray-500">
          Edits are locked for paid invoices.
        </p>
      )}
    </div>
  )
}

const AdminFolderRow = ({ folder, onSelect }) => {
  const totalAmount = folder.invoices.reduce(
    (sum, invoice) => sum + invoice.amount,
    0,
  )
  const paidCount = folder.invoices.filter((invoice) => invoice.paid).length
  const unpaidCount = folder.invoices.length - paidCount

  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{folder.name}</h3>
          <p className="text-xs text-gray-500">{folder.ownerEmail}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            {paidCount} paid • {unpaidCount} unpaid
          </span>
          <button
            onClick={() => onSelect(folder.id)}
            className="px-3 py-1.5 text-xs font-semibold border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            View
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
        <div>
          <p className="text-xs text-gray-400">Invoices</p>
          <p className="font-semibold text-gray-900">
            {folder.invoices.length}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Total</p>
          <p className="font-semibold text-gray-900">
            ${totalAmount.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Status</p>
          <p className="font-semibold text-gray-900">
            {unpaidCount > 0 ? 'Awaiting Payment' : 'Paid'}
          </p>
        </div>
      </div>
    </div>
  )
}

const AdminOverviewView = ({
  folders,
  filteredInvoices,
  totalPaidAmount,
  totalUnpaidAmount,
  onSelectProject,
  projectFilterId,
}) => {
  const today = new Date().toISOString().slice(0, 10)
  const totalOverdueAmount = filteredInvoices
    .filter(
      (invoice) =>
        !invoice.paid &&
        invoice.expectedPaymentDate &&
        invoice.expectedPaymentDate < today,
    )
    .reduce((sum, invoice) => sum + invoice.amount, 0)
  const projectList = folders.filter((folder) => {
    if (!projectFilterId) return true
    return folder.id === projectFilterId
  })

  const filteredProjectList =
    filteredInvoices.length === 0
      ? []
      : projectList.filter((folder) =>
          filteredInvoices.some((invoice) => invoice.folderId === folder.id),
        )

  const projectTotals = filteredProjectList.map((folder, index) => {
    const scopedInvoices = filteredInvoices.filter(
      (invoice) => invoice.folderId === folder.id,
    )
    const paid = scopedInvoices
      .filter((invoice) => invoice.paid)
      .reduce((sum, invoice) => sum + invoice.amount, 0)
    const unpaid = scopedInvoices
      .filter((invoice) => !invoice.paid)
      .reduce((sum, invoice) => sum + invoice.amount, 0)
    const payrollTotal = (folder.payrollEntries || []).reduce(
      (sum, entry) => sum + entry.amount,
      0,
    )
    const total = paid + unpaid
    const color = [
      '#2563eb',
      '#16a34a',
      '#f97316',
      '#dc2626',
      '#7c3aed',
      '#0891b2',
      '#eab308',
      '#db2777',
      '#0f172a',
    ][index % 9]
      return {
        id: folder.id,
        name: folder.name,
        paid,
        unpaid,
        total,
        payrollTotal,
        color,
      }
    })

  const totalAllProjects = projectTotals.reduce(
    (sum, project) => sum + project.total,
    0,
  )

  const pieSegments = projectTotals
    .filter((project) => project.total > 0)
    .reduce(
      (acc, project) => {
        const start = acc.current
        const slice = totalAllProjects === 0 ? 0 : (project.total / totalAllProjects) * 360
        const end = start + slice
        acc.stops.push(`${project.color} ${start}deg ${end}deg`)
        acc.current = end
        return acc
      },
      { stops: [], current: 0 },
    )

  const paidInvoices = filteredInvoices.filter((invoice) => invoice.paid)
  const unpaidInvoices = filteredInvoices.filter((invoice) => !invoice.paid)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Projects</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {folders.length}
          </p>
          <div className="mt-2 text-xs text-gray-500 space-y-0.5">
            <p>
              Active projects:{' '}
              {folders.filter((folder) => folder.isActive).length}
            </p>
            <p>
              Inactive projects:{' '}
              {folders.filter((folder) => !folder.isActive).length}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Unpaid Invoices</p>
          <p className="text-3xl font-bold text-amber-600 mt-1">
            {unpaidInvoices.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            ${totalUnpaidAmount.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Paid Invoices</p>
          <p className="text-3xl font-bold text-green-600 mt-1">
            {paidInvoices.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            ${totalPaidAmount.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Invoices</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {filteredInvoices.length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Payment Status Overview
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Overdue (unpaid)</span>
            <span>${totalOverdueAmount.toLocaleString()}</span>
          </div>
          <div className="h-3 rounded-full bg-red-100">
            <div
              className="h-3 rounded-full bg-red-500"
              style={{
                width: `${
                  totalPaidAmount + totalUnpaidAmount === 0
                    ? 0
                    : (totalOverdueAmount /
                        (totalPaidAmount + totalUnpaidAmount)) *
                      100
                }%`,
              }}
            />
          </div>
          <div>
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Unpaid</span>
              <span>${totalUnpaidAmount.toLocaleString()}</span>
            </div>
            <div className="h-3 rounded-full bg-amber-100">
              <div
                className="h-3 rounded-full bg-amber-500"
                style={{
                  width: `${
                    totalPaidAmount + totalUnpaidAmount === 0
                      ? 0
                      : (totalUnpaidAmount /
                          (totalPaidAmount + totalUnpaidAmount)) *
                        100
                  }%`,
                }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Paid</span>
              <span>${totalPaidAmount.toLocaleString()}</span>
            </div>
            <div className="h-3 rounded-full bg-green-100">
              <div
                className="h-3 rounded-full bg-green-500"
                style={{
                  width: `${
                    totalPaidAmount + totalUnpaidAmount === 0
                      ? 0
                      : (totalPaidAmount /
                          (totalPaidAmount + totalUnpaidAmount)) *
                        100
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Projects Breakdown
        </h3>
        {folders.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center text-gray-500">
            No projects created yet.
          </div>
        )}
        <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr_320px] gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center justify-center">
            <div className="relative">
              <div
                className="w-56 h-56 sm:w-64 sm:h-64 rounded-full border border-gray-200"
                style={{
                  background:
                    totalAllProjects === 0
                      ? 'conic-gradient(#e5e7eb 0deg, #e5e7eb 360deg)'
                      : `conic-gradient(${pieSegments.stops.join(', ')})`,
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white border border-gray-200 flex flex-col items-center justify-center text-center px-3">
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ${totalAllProjects.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {projectTotals.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => onSelectProject(project.id)}
                className="w-full text-left bg-white rounded-lg border border-gray-200 shadow-sm p-3 flex items-center justify-between gap-3 hover:border-blue-300"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {project.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      ${project.total.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-[11px] text-gray-500 text-right">
                  ${project.paid.toLocaleString()} paid • $
                  {project.unpaid.toLocaleString()} unpaid
                  <div className="text-gray-400">
                    Payroll: ${project.payrollTotal.toLocaleString()}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center justify-center">
            <div className="relative">
              {(() => {
                const payrollTotalAll = projectTotals.reduce(
                  (sum, project) => sum + project.payrollTotal,
                  0,
                )
                const payrollSegments = projectTotals
                  .filter((project) => project.payrollTotal > 0)
                  .reduce(
                    (acc, project) => {
                      const start = acc.current
                      const slice =
                        payrollTotalAll === 0
                          ? 0
                          : (project.payrollTotal / payrollTotalAll) * 360
                      const end = start + slice
                      acc.stops.push(`${project.color} ${start}deg ${end}deg`)
                      acc.current = end
                      return acc
                    },
                    { stops: [], current: 0 },
                  )

                return (
                  <>
                    <div
                      className="w-56 h-56 sm:w-64 sm:h-64 rounded-full border border-gray-200"
                      style={{
                        background:
                          payrollTotalAll === 0
                            ? 'conic-gradient(#e5e7eb 0deg, #e5e7eb 360deg)'
                            : `conic-gradient(${payrollSegments.stops.join(', ')})`,
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white border border-gray-200 flex flex-col items-center justify-center text-center px-3">
                        <p className="text-xs text-gray-500">Payroll</p>
                        <p className="text-lg font-semibold text-gray-900">
                          ${payrollTotalAll.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const RegularHomeView = ({ currentUser }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Welcome back{currentUser ? `, ${currentUser.email}` : ''}.
      </h2>
      <p className="text-sm text-gray-600">
        Use the Projects tab to manage your invoices. You can edit invoices
        while a project has unpaid items.
      </p>
    </div>
  </div>
)

const ProjectFolderList = ({
  folders,
  onSelectFolder,
  onDeleteFolder,
  canDeleteFolder,
  isAdmin,
  onToggleProjectActive,
  pendingDelete,
  onRequestDelete,
  onClearDelete,
}) => (
  <div className="space-y-4">
    {folders.length === 0 && (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center text-gray-500">
        No projects yet. Create one to start tracking invoices.
      </div>
    )}
    {folders.map((folder) => {
      const paidCount = folder.invoices.filter((invoice) => invoice.paid).length
      const unpaidCount = folder.invoices.length - paidCount
      const statusLabel =
        folder.invoices.length === 0
          ? 'No invoices'
          : unpaidCount > 0
            ? 'Unpaid'
            : 'Paid'
      const statusClass =
        folder.invoices.length === 0
          ? 'bg-gray-100 text-gray-700'
          : unpaidCount > 0
            ? 'bg-amber-100 text-amber-700'
            : 'bg-green-100 text-green-700'

      return (
      <div
        key={folder.id}
        className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:border-blue-300 hover:shadow-md transition"
        style={{ marginLeft: folder.depth ? `${folder.depth * 12}px` : 0 }}
      >
        <button
          onClick={() => onSelectFolder(folder.id)}
          className="w-full text-left"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {folder.name}
              </h3>
              <p className="text-xs text-gray-500">{folder.ownerEmail}</p>
              {!folder.isActive && (
                <p className="mt-1 text-xs font-semibold text-red-600">
                  Inactive project
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass}`}
              >
                {statusLabel}
              </span>
              {!folder.isActive && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-600">
                  Inactive
                </span>
              )}
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            {folder.invoices.length} invoices
          </div>
        </button>
        {(canDeleteFolder || isAdmin) && (
          <div className="mt-3 flex flex-wrap justify-end gap-3">
            {isAdmin && (
              <button
                type="button"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                onClick={() => onToggleProjectActive?.(folder.id, folder.isActive)}
              >
                {folder.isActive ? 'Mark Inactive' : 'Mark Active'}
              </button>
            )}
            {canDeleteFolder && (
              <button
                type="button"
                className="text-xs font-semibold text-red-600 hover:text-red-800"
                onClick={() => onRequestDelete({ type: 'project', folderId: folder.id })}
              >
                Delete Project
              </button>
            )}
          </div>
        )}
      </div>
    )
    })}
  </div>
)

const ProjectFolderDetail = ({
  folder,
  canEdit,
  isAdmin,
  currentUserEmail,
  pendingDelete,
  onRequestDelete,
  onClearDelete,
  onBack,
  onAddInvoice,
  onUpdateInvoice,
  onAddInvoiceFile,
  onDeleteInvoiceFile,
  onDeleteLegacyInvoiceFile,
  onDeleteFolder,
  onDeleteInvoice,
  onToggleInvoicePaid,
  onToggleProjectActive,
  selectedInvoiceId,
  onSelectInvoice,
}) => (
  <div className="space-y-4">
    {(() => {
      const paidCount = folder.invoices.filter((invoice) => invoice.paid).length
      const unpaidCount = folder.invoices.length - paidCount
      const statusLabel =
        folder.invoices.length === 0
          ? 'No invoices'
          : unpaidCount > 0
            ? 'Unpaid'
            : 'Paid'
      const statusClass =
        folder.invoices.length === 0
          ? 'bg-gray-100 text-gray-700'
          : unpaidCount > 0
            ? 'bg-amber-100 text-amber-700'
            : 'bg-green-100 text-green-700'

      return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <button
        onClick={onBack}
        className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        Back to Projects
      </button>
      <div className="flex flex-wrap items-center gap-2">
        {isAdmin && (
          <button
            type="button"
            onClick={() => onToggleProjectActive?.(folder.id, folder.isActive)}
            className="px-3 py-2 text-sm border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50"
          >
            {folder.isActive ? 'Mark Inactive' : 'Mark Active'}
          </button>
        )}
        {isAdmin &&
          (() => {
            const isConfirm =
              pendingDelete?.type === 'project' &&
              pendingDelete?.folderId === folder.id
            return (
              <button
                onClick={() => {
                  if (isConfirm) {
                    onClearDelete()
                    onDeleteFolder(folder.id)
                  } else {
                    onRequestDelete({ type: 'project', folderId: folder.id })
                  }
                }}
                className="px-3 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
              >
                {isConfirm ? 'Click again to delete' : 'Delete Project'}
              </button>
            )
          })()}
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass}`}
        >
          {statusLabel}
        </span>
        {!folder.isActive && (
          <span className="px-2 py-1 rounded-full text-[11px] font-semibold bg-red-100 text-red-600">
            Inactive
          </span>
        )}
      </div>
    </div>
      )
    })()}

    <div
      className={`grid gap-4 ${
        selectedInvoiceId
          ? 'grid-cols-1 lg:grid-cols-[1fr_280px]'
          : 'grid-cols-1'
      }`}
    >
      <ProfileFolderCard
        folder={folder}
        canEdit={canEdit}
        canAddInvoice={canEdit && folder.isActive}
        isAdmin={isAdmin}
        currentUserEmail={currentUserEmail}
        pendingDelete={pendingDelete}
        onRequestDelete={onRequestDelete}
        onClearDelete={onClearDelete}
        onAddInvoice={onAddInvoice}
        onUpdateInvoice={onUpdateInvoice}
        onAddInvoiceFile={onAddInvoiceFile}
        onDeleteInvoiceFile={onDeleteInvoiceFile}
        onDeleteInvoice={onDeleteInvoice}
        onToggleInvoicePaid={onToggleInvoicePaid}
        onSelectInvoice={onSelectInvoice}
      />
      {selectedInvoiceId && (
        (() => {
          const selectedInvoice = folder.invoices.find(
            (inv) => inv.id === selectedInvoiceId,
          )
          if (!selectedInvoice) return null
          const files = [
            ...(selectedInvoice.files || []),
            ...(selectedInvoice.imageUrl
              ? [
                  {
                    id: `legacy-${selectedInvoice.id}`,
                    name: selectedInvoice.imageName || 'legacy-file',
                    path: selectedInvoice.imagePath || null,
                    url: selectedInvoice.imageUrl,
                    legacy: true,
                  },
                ]
              : []),
          ]
          return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900">
                  Invoice Files
                </h4>
                <button
                  type="button"
                  onClick={() => onSelectInvoice(null)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Close
                </button>
              </div>
              {files.length === 0 ? (
                <p className="text-sm text-gray-500">No files yet.</p>
              ) : (
                <div className="space-y-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        {file.url && file.url.match(/\.(png|jpe?g|gif|webp)$/i) ? (
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-10 h-10 rounded-md object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                            PDF
                          </div>
                        )}
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:text-blue-800 truncate"
                        >
                          {file.name}
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          file.legacy
                            ? onDeleteLegacyInvoiceFile(selectedInvoice.id, file.path)
                            : onDeleteInvoiceFile(file.id, file.path)
                        }
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) {
                      onAddInvoiceFile(selectedInvoice.id, file)
                      event.target.value = ''
                    }
                  }}
                  className="hidden"
                  id="add-invoice-file"
                />
                <label
                  htmlFor="add-invoice-file"
                  className="inline-flex items-center justify-center w-full px-3 py-2 border border-gray-300 rounded-lg text-xs hover:bg-gray-50 cursor-pointer"
                >
                  Add file
                </label>
              </div>
            </div>
          )
        })()
      )}
    </div>
  </div>
)

const DCCableProjectManager = () => {
  const [activeView, setActiveView] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedWeek, setSelectedWeek] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginHint] = useState('Admin: vikdcbilling@dccablellc.com • User: your Supabase email')
  const [currentUser, setCurrentUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [selectedFolderId, setSelectedFolderId] = useState(null)
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterProject, setFilterProject] = useState('')
  const [filterCreatedDate, setFilterCreatedDate] = useState('')
  const [filterPaidDate, setFilterPaidDate] = useState('')
  const [filterCreatedFrom, setFilterCreatedFrom] = useState('')
  const [filterCreatedTo, setFilterCreatedTo] = useState('')
  const [showCustomDate, setShowCustomDate] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [quickProjectId, setQuickProjectId] = useState('')
  const [quickAmount, setQuickAmount] = useState('')
  const [quickFile, setQuickFile] = useState(null)
  const [quickExpectedPayment, setQuickExpectedPayment] = useState('')
  const [payrollProjectId, setPayrollProjectId] = useState('')
  const [payrollAmount, setPayrollAmount] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Empty state - will be populated from your backend
  const [projects] = useState([])
  const [documents] = useState([])
  const [weeklyData] = useState([])
  const [employees] = useState([])
  const [payrollRecords] = useState([])

  const adminEmails = [
    'vikdcbilling@dccablellc.com',
    'ernestofons@dccablellc.com',
    'raulddl@dccablellc.com',
  ]

  const [folders, setFolders] = useState([])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsAuthenticated(false)
    setCurrentUser(null)
    setUserRole(null)
    setActiveView('dashboard')
    setLoginPassword('')
    setSelectedFolderId(null)
    setFolders([])
  }

  const handleLoginSubmit = async (event) => {
    event.preventDefault()
    const normalizedEmail = loginEmail.trim().toLowerCase()
    if (!normalizedEmail || !loginPassword.trim()) {
      setLoginError('Email and password are required.')
      return
    }
    setLoginError('')
    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: loginPassword,
    })
    if (error) {
      setLoginError(error.message)
    }
  }

  useEffect(() => {
    let isMounted = true

    const setSessionState = (session) => {
      if (!isMounted) return
      if (session?.user) {
        const email = session.user.email?.toLowerCase() || ''
        const isAdmin = adminEmails.includes(email)
        setCurrentUser({ id: session.user.id, email })
        setUserRole(isAdmin ? 'admin' : 'regular')
        setIsAuthenticated(true)
        setActiveView(isAdmin ? 'dashboard' : 'home')
      } else {
        setCurrentUser(null)
        setUserRole(null)
        setIsAuthenticated(false)
      }
      setIsLoadingAuth(false)
    }

    supabase.auth.getSession().then(({ data }) => {
      setSessionState(data.session)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSessionState(session)
      },
    )

    return () => {
      isMounted = false
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setSidebarOpen(true)
    }
  }, [])

  const requestDelete = (payload) => {
    setPendingDelete(payload)
    setShowDeleteModal(true)
  }

  const closeSidebarIfMobile = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }

  const loadData = async () => {
    if (!isAuthenticated || !currentUser) return
    setIsLoadingData(true)

    const [projectsRes, invoicesRes, payrollRes, filesRes] = await Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('invoices').select('*').order('created_at', { ascending: false }),
      supabase.from('payroll_entries').select('*').order('created_at', { ascending: false }),
      supabase.from('invoice_files').select('*').order('created_at', { ascending: false }),
    ])

    if (projectsRes.error || invoicesRes.error || payrollRes.error || filesRes.error) {
      setIsLoadingData(false)
      return
    }

    const projectsData = projectsRes.data || []
    const invoicesDataRaw = invoicesRes.data || []
    const payrollData = payrollRes.data || []
    const filesData = filesRes.data || []

    const invoicesData =
      userRole === 'admin'
        ? invoicesDataRaw
        : invoicesDataRaw.filter((invoice) => invoice.created_by === currentUser.id)

    const foldersMapped = projectsData.map((project) => {
      const projectInvoices = invoicesData
        .filter((invoice) => invoice.project_id === project.id)
        .map((invoice) => ({
          id: invoice.id,
          amount: Number(invoice.amount || 0),
          date: invoice.date,
          createdAt: invoice.created_at ? invoice.created_at.slice(0, 10) : '',
          paid: invoice.paid,
          paidAt: invoice.paid_at,
          seenByAdmin: invoice.seen_by_admin,
            imageName: invoice.image_name || '',
            imageUrl: invoice.image_url || '',
            imagePath: invoice.image_path || '',
            expectedPaymentDate: invoice.expected_payment_date || '',
            files: filesData
              .filter((file) => file.invoice_id === invoice.id)
              .map((file) => ({
                id: file.id,
                name: file.file_name,
                path: file.file_path,
                url: file.file_url,
              })),
          createdBy: invoice.created_by_email || '',
        }))

      const projectPayroll = payrollData
        .filter((entry) => entry.project_id === project.id)
        .map((entry) => ({
          id: entry.id,
          amount: Number(entry.amount || 0),
          createdAt: entry.created_at ? entry.created_at.slice(0, 10) : '',
        }))

        return {
          id: project.id,
          name: project.name,
          ownerEmail: project.created_by_email || 'admin',
          isActive: project.is_active ?? true,
          payrollEntries: projectPayroll,
          invoices: projectInvoices,
        }
      })

    setFolders(foldersMapped)
    setIsLoadingData(false)
  }

  useEffect(() => {
    loadData()
  }, [isAuthenticated, currentUser, userRole])

  const collectInvoices = (nodes) =>
    nodes.flatMap((folder) =>
      folder.invoices.map((invoice) => ({
        ...invoice,
        folderId: folder.id,
        folderName: folder.name,
        ownerEmail: folder.ownerEmail,
      })),
    )

  const allInvoices = collectInvoices(folders)
  const todayDate = new Date().toISOString().slice(0, 10)
  const unseenInvoices = allInvoices.filter(
    (invoice) => !invoice.seenByAdmin,
  )
  const dueTodayInvoices = allInvoices.filter(
    (invoice) =>
      invoice.expectedPaymentDate &&
      invoice.expectedPaymentDate === todayDate,
  )

  const handleCreateProject = (projectName) => {
    if (!projectName.trim()) return
    const trimmedName = projectName.trim()
    const createProject = async () => {
      const { error } = await supabase.from('projects').insert({
        name: trimmedName,
        created_by: currentUser?.id,
        created_by_email: currentUser?.email,
      })
      if (error) {
        alert(`Create project failed: ${error.message}`)
        return
      }
      setNewProjectName('')
      loadData()
    }
    createProject()
  }

  const findFolderById = (nodes, folderId) =>
    nodes.find((folder) => folder.id === folderId) || null

  const uploadInvoiceFile = async (file) => {
    if (!file) return { path: null, publicUrl: null }
    const ext = file.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${ext}`
    const filePath = `${currentUser?.id}/${fileName}`
    const { error } = await supabase.storage
      .from('invoice-files')
      .upload(filePath, file, { upsert: false })
    if (error) {
      return { path: null, publicUrl: null }
    }
    const { data } = supabase.storage
      .from('invoice-files')
      .getPublicUrl(filePath)
    return { path: filePath, publicUrl: data?.publicUrl || null }
  }

  const handleAddInvoice = async ({
    folderId,
    amount,
    expectedPaymentDate,
    imageFile,
  }) => {
    if (!amount) return
    const targetFolder = findFolderById(folders, folderId)
    if (targetFolder && !targetFolder.isActive) {
      alert('This project is inactive. Ask an admin to reactivate it.')
      return
    }
    const today = new Date().toISOString().slice(0, 10)
    const uploadResult = await uploadInvoiceFile(imageFile)
    await supabase.from('invoices').insert({
      project_id: folderId,
      amount: Number(amount),
      date: today,
      created_by: currentUser?.id,
      created_by_email: currentUser?.email,
      paid: false,
      paid_at: null,
      seen_by_admin: false,
      image_name: imageFile ? imageFile.name : null,
      image_path: uploadResult.path,
      image_url: uploadResult.publicUrl,
      expected_payment_date: expectedPaymentDate,
    })
    loadData()
  }

  const handleAddPayroll = (event) => {
    event.preventDefault()
    if (!payrollProjectId || !payrollAmount) return
    const amountValue = Number(payrollAmount)
    if (Number.isNaN(amountValue) || amountValue <= 0) return
    const addPayroll = async () => {
      await supabase.from('payroll_entries').insert({
        project_id: payrollProjectId,
        amount: amountValue,
        created_by: currentUser?.id,
      })
      setPayrollAmount('')
      loadData()
    }
    addPayroll()
  }

  const handleQuickAddInvoice = (event) => {
    event.preventDefault()
    if (!quickProjectId || !quickAmount) return
    const targetFolder = findFolderById(folders, quickProjectId)
    if (targetFolder && !targetFolder.isActive) {
      alert('This project is inactive. Ask an admin to reactivate it.')
      return
    }
    handleAddInvoice({
      folderId: quickProjectId,
      amount: quickAmount,
      expectedPaymentDate: quickExpectedPayment || null,
      imageFile: quickFile,
    })
    setQuickAmount('')
    setQuickExpectedPayment('')
    setQuickFile(null)
  }

  const markInvoiceSeen = (folderId, invoiceId) => {
    const markSeen = async () => {
      await supabase
        .from('invoices')
        .update({ seen_by_admin: true })
        .eq('id', invoiceId)
      loadData()
    }
    markSeen()
  }

  const handleUpdateInvoice = (folderId, invoiceId, updates) => {
    const updateInvoice = async () => {
      const updatePayload = {}
      if (typeof updates.amount !== 'undefined') updatePayload.amount = updates.amount
      if (typeof updates.date !== 'undefined') updatePayload.date = updates.date
      if (typeof updates.expectedPaymentDate !== 'undefined') {
        updatePayload.expected_payment_date = updates.expectedPaymentDate || null
      }
      const { error } = await supabase
        .from('invoices')
        .update(updatePayload)
        .eq('id', invoiceId)
      if (error) {
        alert(`Update failed: ${error.message}`)
        return
      }
      loadData()
    }
    updateInvoice()
  }

  const handleAddInvoiceFile = (invoiceId, file) => {
    const addFile = async () => {
      const uploadResult = await uploadInvoiceFile(file)
      if (!uploadResult.path || !uploadResult.publicUrl) {
        alert('File upload failed')
        return
      }
      const { error } = await supabase.from('invoice_files').insert({
        invoice_id: invoiceId,
        file_name: file.name,
        file_path: uploadResult.path,
        file_url: uploadResult.publicUrl,
        created_by: currentUser?.id,
      })
      if (error) {
        alert(`File add failed: ${error.message}`)
        return
      }
      loadData()
    }
    addFile()
  }

  const handleDeleteInvoiceFile = (fileId, filePath) => {
    const deleteFile = async () => {
      if (filePath) {
        await supabase.storage.from('invoice-files').remove([filePath])
      }
      const { error } = await supabase.from('invoice_files').delete().eq('id', fileId)
      if (error) {
        alert(`File delete failed: ${error.message}`)
        return
      }
      loadData()
    }
    deleteFile()
  }

  const handleDeleteLegacyInvoiceFile = (invoiceId, filePath) => {
    const deleteLegacy = async () => {
      if (filePath) {
        await supabase.storage.from('invoice-files').remove([filePath])
      }
      const { error } = await supabase
        .from('invoices')
        .update({
          image_name: null,
          image_path: null,
          image_url: null,
        })
        .eq('id', invoiceId)
      if (error) {
        alert(`File delete failed: ${error.message}`)
        return
      }
      loadData()
    }
    deleteLegacy()
  }

  const toggleInvoicePaid = (folderId, invoiceId) => {
    const today = new Date().toISOString().slice(0, 10)
    const togglePaid = async () => {
      const invoice = findFolderById(folders, folderId)?.invoices.find(
        (inv) => inv.id === invoiceId,
      )
      if (!invoice) return
      const { error } = await supabase
        .from('invoices')
        .update({
          paid: !invoice.paid,
          paid_at: invoice.paid ? null : today,
          seen_by_admin: true,
        })
        .eq('id', invoiceId)
      if (error) {
        alert(`Paid status update failed: ${error.message}`)
        return
      }
      loadData()
    }
    togglePaid()
  }

  const handleDeleteFolder = (folderId) => {
    const folder = findFolderById(folders, folderId)
    if (!folder) return
    if (userRole !== 'admin') return
    const deleteProject = async () => {
      const { error } = await supabase.from('projects').delete().eq('id', folderId)
      if (error) {
        alert(`Delete failed: ${error.message}`)
        return
      }
      if (selectedFolderId === folderId) {
        setSelectedFolderId(null)
      }
      loadData()
    }
    deleteProject()
  }

  const toggleProjectActive = (folderId, isActive) => {
    if (userRole !== 'admin') return
    const updateProject = async () => {
      const { error } = await supabase
        .from('projects')
        .update({ is_active: !isActive })
        .eq('id', folderId)
      if (error) {
        alert(`Update failed: ${error.message}`)
        return
      }
      loadData()
    }
    updateProject()
  }

  const handleDeleteInvoice = (folderId, invoiceId) => {
    const folder = findFolderById(folders, folderId)
    if (!folder) return
    const invoice = folder.invoices.find((inv) => inv.id === invoiceId)
    if (!invoice || invoice.paid) return
    if (userRole === 'regular' && invoice.createdBy !== currentUser?.email) {
      return
    }
    const deleteInvoice = async () => {
      const { error } = await supabase.from('invoices').delete().eq('id', invoiceId)
      if (error) {
        alert(`Delete failed: ${error.message}`)
        return
      }
      loadData()
    }
    deleteInvoice()
  }

  const collectFolderInvoices = (folder) => folder.invoices

  const invoiceMatchesFilters = (invoice) => {
    if (filterStatus !== 'all') {
      const wantsPaid = filterStatus === 'paid'
      if (invoice.paid !== wantsPaid) return false
    }
    if (filterCreatedDate && invoice.createdAt !== filterCreatedDate) {
      return false
    }
    if (filterCreatedFrom || filterCreatedTo) {
      if (!invoice.createdAt) return false
      if (filterCreatedFrom && invoice.createdAt < filterCreatedFrom) {
        return false
      }
      if (filterCreatedTo && invoice.createdAt > filterCreatedTo) {
        return false
      }
    }
    if (filterPaidDate && invoice.paidAt !== filterPaidDate) {
      return false
    }
    return true
  }

  const folderMatchesFilters = (folder) => {
    if (filterProject) {
      if (folder.id !== filterProject) return false
    }

    const hasInvoiceFilters =
      filterStatus !== 'all' || filterCreatedDate || filterPaidDate

    if (!hasInvoiceFilters) return true

    return folder.invoices.some((invoice) => invoiceMatchesFilters(invoice))
  }

  const flattenFoldersWithDepth = (nodes, depth = 0) =>
    nodes.map((folder) => ({ ...folder, depth }))

  const filteredInvoices = allInvoices.filter((invoice) => {
    const projectMatch = filterProject ? invoice.folderId === filterProject : true
    return projectMatch && invoiceMatchesFilters(invoice)
  })

  const filteredFolders = folders.filter((folder) => folderMatchesFilters(folder))

  const totalPaidAmount = filteredInvoices
    .filter((invoice) => invoice.paid)
    .reduce((sum, invoice) => sum + invoice.amount, 0)
  const totalUnpaidAmount = filteredInvoices
    .filter((invoice) => !invoice.paid)
    .reduce((sum, invoice) => sum + invoice.amount, 0)

  // Upload Modal Component
  const UploadModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Upload Document</h2>
          <button
            onClick={() => setShowUploadModal(false)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project
            </label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Type
            </label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select type</option>
              <option value="invoice">Invoice</option>
              <option value="receipt">Receipt</option>
              <option value="contract">Contract</option>
              <option value="purchase_order">Purchase Order</option>
              <option value="expense">Expense Report</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Week
            </label>
            <input
              type="week"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload File
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
              <Upload className="mx-auto text-gray-400 mb-2" size={40} />
              <p className="text-sm text-gray-600">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, DOC, DOCX, XLS, XLSX (max 10MB)
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add any additional notes..."
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={() => setShowUploadModal(false)}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Upload Document
          </button>
        </div>
      </div>
    </div>
  )

  const DashboardView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Projects</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {projects.length}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Documents This Month</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {documents.length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Upload className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                $
                {documents
                  .reduce((sum, doc) => sum + (doc.amount || 0), 0)
                  .toLocaleString()}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <DollarSign className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Employees</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {employees.length}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Users className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Recent Documents</h2>
          </div>
          <div className="p-6">
            {documents.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto text-gray-400 mb-3" size={48} />
                <p className="text-gray-600">No documents uploaded yet</p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Upload First Document
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.slice(0, 5).map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="text-blue-600" size={20} />
                      <div>
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        <p className="text-sm text-gray-600">{doc.project}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900">
                      ${doc.amount.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Weekly Overview</h2>
          </div>
          <div className="p-6">
            {weeklyData.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto text-gray-400 mb-3" size={48} />
                <p className="text-gray-600">No weekly data available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {weeklyData.slice(0, 5).map((week, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        Week {week.weekNumber}
                      </p>
                      <p className="text-sm text-gray-600">{week.dateRange}</p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      ${week.total.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const DocumentsView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Documents</h2>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter size={16} />
                Filter
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download size={16} />
                Export
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={16} />
                Upload Document
              </button>
            </div>
          </div>
        </div>

        {documents.length === 0 ? (
          <div className="p-12 text-center">
            <Upload className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No documents yet
            </h3>
            <p className="text-gray-600 mb-6">
              Upload your first document to get started
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Upload Document
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    Document Name
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    Type
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    Project
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    Amount
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    Week
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    Uploaded By
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    Date
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <FileText className="text-blue-600" size={18} />
                        <span className="font-medium text-gray-900">
                          {doc.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{doc.type}</td>
                    <td className="p-4 text-sm text-gray-600">{doc.project}</td>
                    <td className="p-4 font-semibold text-gray-900">
                      ${doc.amount.toLocaleString()}
                    </td>
                    <td className="p-4 text-sm text-gray-600">{doc.week}</td>
                    <td className="p-4 text-sm text-gray-600">
                      {doc.uploadedBy}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {doc.uploadDate}
                    </td>
                    <td className="p-4">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )

  const WeeklyView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Weekly Financial Tracking
            </h2>
            <div className="flex gap-3">
              <input
                type="week"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download size={16} />
                Export
              </button>
            </div>
          </div>
        </div>

        {weeklyData.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No weekly data yet
            </h3>
            <p className="text-gray-600 mb-6">
              Upload documents to start tracking weekly finances
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Upload Document
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    Week
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    Date Range
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    Documents
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    Total Amount
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    Projects
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {weeklyData.map((week, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedWeek(week)}
                  >
                    <td className="p-4 font-medium text-gray-900">
                      Week {week.weekNumber}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {week.dateRange}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {week.documentCount}
                    </td>
                    <td className="p-4 font-semibold text-gray-900">
                      ${week.total.toLocaleString()}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {week.projects.join(', ')}
                    </td>
                    <td className="p-4">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Weekly Revenue Trend</h3>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center">
            <TrendingUp className="mx-auto text-gray-400 mb-2" size={40} />
            <p className="text-gray-600">Chart will display here</p>
            <p className="text-sm text-gray-500 mt-1">
              Connect to your backend to visualize data
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  const ProjectsView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Projects</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
              <Plus size={16} />
              New Project
            </button>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No projects yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first project to start organizing documents
            </p>
            <button className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
              Create Project
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    Project Name
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    Client
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    Documents
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    Total Amount
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    Start Date
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    Status
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="p-4 font-medium text-gray-900">
                      {project.name}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {project.client}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {project.documentCount}
                    </td>
                    <td className="p-4 font-semibold text-gray-900">
                      ${project.totalAmount.toLocaleString()}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {project.startDate}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          project.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : project.status === 'Completed'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Active Projects</p>
            <p className="text-3xl font-bold text-gray-900">
              {projects.filter((p) => p.status === 'Active').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Total Project Value</p>
            <p className="text-3xl font-bold text-gray-900">
              $
              {projects
                .reduce((sum, p) => sum + p.totalAmount, 0)
                .toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Completed Projects</p>
            <p className="text-3xl font-bold text-gray-900">
              {projects.filter((p) => p.status === 'Completed').length}
            </p>
          </div>
        </div>
      )}
    </div>
  )

  const PayrollView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Payroll Management</h2>
            <div className="flex gap-3">
              <input
                type="month"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download size={16} />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus size={16} />
                Add Employee
              </button>
            </div>
          </div>
        </div>

        {employees.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No employees yet
            </h3>
            <p className="text-gray-600 mb-6">
              Add employees to start managing payroll
            </p>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Add Employee
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    Employee Name
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    Position
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    Hourly Rate
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    Hours This Week
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    Total This Week
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    YTD Total
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                          {employee.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <span className="font-medium text-gray-900">
                          {employee.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {employee.position}
                    </td>
                    <td className="p-4 text-sm text-gray-900">
                      ${employee.hourlyRate.toFixed(2)}/hr
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {employee.hoursThisWeek} hrs
                    </td>
                    <td className="p-4 font-semibold text-gray-900">
                      $
                      {(
                        employee.hourlyRate * employee.hoursThisWeek
                      ).toLocaleString()}
                    </td>
                    <td className="p-4 font-semibold text-gray-900">
                      ${employee.ytdTotal.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {employees.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Total Employees</p>
            <p className="text-3xl font-bold text-gray-900">
              {employees.length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">This Week Payroll</p>
            <p className="text-3xl font-bold text-gray-900">
              $
              {employees
                .reduce((sum, e) => sum + e.hourlyRate * e.hoursThisWeek, 0)
                .toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Total Hours This Week</p>
            <p className="text-3xl font-bold text-gray-900">
              {employees.reduce((sum, e) => sum + e.hoursThisWeek, 0)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">YTD Payroll</p>
            <p className="text-3xl font-bold text-gray-900">
              ${employees.reduce((sum, e) => sum + e.ytdTotal, 0).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Recent Payroll Records</h3>
        </div>
        {payrollRecords.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No payroll records yet</p>
          </div>
        ) : (
          <div className="p-6 space-y-3">
            {payrollRecords.map((record, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{record.period}</p>
                  <p className="text-sm text-gray-600">
                    {record.employeeCount} employees
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    ${record.total.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">{record.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {isLoadingAuth && (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600">
          Loading...
        </div>
      )}
      {!isLoadingAuth && (
    <div className="min-h-screen bg-gray-50">
      {!isAuthenticated && (
        <LoginView
          loginEmail={loginEmail}
          loginPassword={loginPassword}
          loginError={loginError}
          loginHint={loginHint}
          onEmailChange={(event) => setLoginEmail(event.target.value)}
          onPasswordChange={(event) => setLoginPassword(event.target.value)}
          onSubmit={handleLoginSubmit}
        />
      )}
      {isAuthenticated && (
        <>
      {showDeleteModal && pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Confirm delete
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              Are you sure you want to delete this{' '}
              {pendingDelete.type === 'project' ? 'project' : 'invoice'}?
              This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                onClick={() => {
                  setShowDeleteModal(false)
                  setPendingDelete(null)
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                onClick={() => {
                  if (pendingDelete.type === 'project') {
                    handleDeleteFolder(pendingDelete.folderId)
                  } else if (pendingDelete.type === 'invoice') {
                    handleDeleteInvoice(
                      pendingDelete.folderId,
                      pendingDelete.invoiceId,
                    )
                  }
                  setShowDeleteModal(false)
                  setPendingDelete(null)
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {showUploadModal && <UploadModal />}

      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu size={24} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  DC
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    DC Cable LLC
                  </h1>
                  <p className="text-xs text-gray-600">
                    Financial Management System
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden lg:block">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search documents..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {userRole === 'admin' && (
                <div className="relative">
                  <button
                    className="relative p-2 hover:bg-gray-100 rounded-lg"
                    onClick={() => {
                      setShowNotifications((prev) => !prev)
                    }}
                  >
                    <Bell size={20} />
                    {(unseenInvoices.length + dueTodayInvoices.length) > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-600 text-white text-[10px] rounded-full flex items-center justify-center px-1">
                        {unseenInvoices.length + dueTodayInvoices.length}
                      </span>
                    )}
                  </button>
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-50">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-gray-900">
                          New Invoices
                        </p>
                        <button
                          className="text-xs text-gray-500 hover:text-gray-700"
                          onClick={() => setShowNotifications(false)}
                        >
                          Close
                        </button>
                      </div>
                      {dueTodayInvoices.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-semibold text-amber-600 mb-2">
                            Due Today
                          </p>
                          <div className="space-y-2">
                            {dueTodayInvoices.map((invoice) => (
                              <button
                                key={`due-${invoice.id}`}
                                type="button"
                                onClick={() => {
                                  setActiveView('projects')
                                  setSelectedFolderId(invoice.folderId)
                                  setShowNotifications(false)
                                }}
                                className="w-full text-left border border-amber-200 rounded-lg p-3 text-sm hover:border-amber-400 hover:bg-amber-50"
                              >
                                <p className="font-semibold text-gray-900">
                                  {invoice.folderName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {invoice.createdBy} • ${invoice.amount}
                                </p>
                                <p className="text-xs text-gray-400">
                                  Expected {invoice.expectedPaymentDate}
                                </p>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {unseenInvoices.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          No new invoices.
                        </p>
                      ) : (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {unseenInvoices.map((invoice) => (
                            <button
                              key={invoice.id}
                              type="button"
                              onClick={() => {
                                markInvoiceSeen(invoice.folderId, invoice.id)
                                setActiveView('projects')
                                setSelectedFolderId(invoice.folderId)
                                setShowNotifications(false)
                              }}
                              className="w-full text-left border border-gray-200 rounded-lg p-3 text-sm hover:border-blue-300 hover:bg-blue-50"
                            >
                              <p className="font-semibold text-gray-900">
                                {invoice.folderName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {invoice.createdBy} • ${invoice.amount}
                              </p>
                              <p className="text-xs text-gray-400">
                                Created {invoice.createdAt || invoice.date}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Logout
              </button>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold cursor-pointer ${
                  userRole === 'admin'
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {userRole === 'admin' ? 'A' : 'U'}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {sidebarOpen && (
          <button
            type="button"
            className="lg:hidden fixed inset-0 bg-black/30 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transition-transform duration-300 mt-[73px] lg:mt-0`}
        >
          <nav className="p-4 space-y-2">
            {userRole === 'admin' && (
              <button
                onClick={() => {
                  setActiveView('dashboard')
                  setSelectedFolderId(null)
                  closeSidebarIfMobile()
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeView === 'dashboard'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <TrendingUp size={20} />
                <span className="font-medium">Admin Overview</span>
              </button>
            )}

            {userRole === 'admin' && (
              <button
                onClick={() => {
                  setActiveView('payroll')
                  setSelectedFolderId(null)
                  closeSidebarIfMobile()
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeView === 'payroll'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <DollarSign size={20} />
                <span className="font-medium">Payroll</span>
              </button>
            )}

            {userRole === 'regular' && (
              <button
                onClick={() => {
                  setActiveView('home')
                  setSelectedFolderId(null)
                  closeSidebarIfMobile()
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeView === 'home'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <TrendingUp size={20} />
                <span className="font-medium">Home</span>
              </button>
            )}

            <button
              onClick={() => {
                setActiveView('projects')
                setSelectedFolderId(null)
                closeSidebarIfMobile()
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeView === 'projects'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FileText size={20} />
              <span className="font-medium">Projects</span>
            </button>

            <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Filters
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Project
                </label>
                <select
                  value={filterProject}
                  onChange={(event) => setFilterProject(event.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">All projects</option>
                  {folders.map((folder) => (
                    <option
                      key={folder.id}
                      value={folder.id}
                      style={{ color: folder.isActive ? undefined : '#dc2626' }}
                    >
                      {folder.name}
                      {!folder.isActive ? ' (inactive)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(event) => setFilterStatus(event.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">All</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Date Created
                </label>
                <input
                  type="date"
                  value={filterCreatedDate}
                  onChange={(event) =>
                    setFilterCreatedDate(event.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Date Paid
                </label>
                <input
                  type="date"
                  value={filterPaidDate}
                  onChange={(event) => setFilterPaidDate(event.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => setShowCustomDate((prev) => !prev)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  {showCustomDate ? 'Hide Custom Date' : 'Custom Date'}
                </button>
              </div>
              {showCustomDate && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Custom Date From
                    </label>
                    <input
                      type="date"
                      value={filterCreatedFrom}
                      onChange={(event) =>
                        setFilterCreatedFrom(event.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Custom Date To
                    </label>
                    <input
                      type="date"
                      value={filterCreatedTo}
                      onChange={(event) =>
                        setFilterCreatedTo(event.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </>
              )}
              <button
                onClick={() => {
                  setFilterProject('')
                  setFilterStatus('all')
                  setFilterCreatedDate('')
                  setFilterCreatedFrom('')
                  setFilterCreatedTo('')
                  setFilterPaidDate('')
                  setShowCustomDate(false)
                }}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                Clear filters
              </button>
            </div>
            <div className="pt-4 mt-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          </nav>
        </aside>

        <main className="flex-1 p-6 lg:p-8">
          {userRole === 'admin' && activeView === 'dashboard' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Create Project
                </h3>
                <form
                  className="flex flex-col md:flex-row gap-3"
                  onSubmit={(event) => {
                    event.preventDefault()
                    handleCreateProject(newProjectName)
                  }}
                >
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(event) => setNewProjectName(event.target.value)}
                    placeholder="Project name"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600"
                >
                  Add Project
                </button>
                </form>
              </div>
              <AdminOverviewView
                folders={folders}
                filteredInvoices={filteredInvoices}
                totalPaidAmount={totalPaidAmount}
                totalUnpaidAmount={totalUnpaidAmount}
                projectFilterId={filterProject}
                onSelectProject={(id) => {
                  setActiveView('projects')
                  setSelectedFolderId(id)
                }}
              />
            </div>
          )}
          {userRole === 'admin' && activeView === 'payroll' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Payroll Allocation
                </h2>
                <form
                  className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end"
                  onSubmit={handleAddPayroll}
                >
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Project
                    </label>
                    <select
                      value={payrollProjectId}
                      onChange={(event) =>
                        setPayrollProjectId(event.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">Select a project</option>
                      {folders.map((folder) => (
                        <option key={folder.id} value={folder.id}>
                          {folder.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Payroll Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={payrollAmount}
                      onChange={(event) =>
                        setPayrollAmount(event.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                  >
                    Add Payroll
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Payroll by Project
                </h3>
                <div className="space-y-3">
                  {folders.map((folder) => {
                    const payrollTotal = (folder.payrollEntries || []).reduce(
                      (sum, entry) => sum + entry.amount,
                      0,
                    )
                    const maxPayroll = Math.max(
                      ...folders.map((f) =>
                        (f.payrollEntries || []).reduce(
                          (sum, entry) => sum + entry.amount,
                          0,
                        ),
                      ),
                      1,
                    )
                    const width = Math.round((payrollTotal / maxPayroll) * 100)

                    return (
                      <div
                        key={folder.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                          <span>{folder.name}</span>
                          <span>${payrollTotal.toLocaleString()}</span>
                        </div>
                        <div className="h-3 rounded-full bg-blue-100">
                          <div
                            className="h-3 rounded-full bg-blue-500"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
          {userRole === 'regular' && activeView === 'home' && (
            <RegularHomeView currentUser={currentUser} />
          )}
          {activeView === 'projects' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Projects
                    </h2>
                    <p className="text-sm text-gray-600">
                      {userRole === 'admin'
                        ? 'All user projects'
                        : 'Your projects'}
                    </p>
                  </div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {userRole === 'admin' ? 'Admin' : 'User'}
                  </div>
                </div>
              </div>

              {(() => {
                const selectedFolder = selectedFolderId
                  ? findFolderById(folders, selectedFolderId)
                  : null

                if (selectedFolderId && selectedFolder) {
                  const canEdit = userRole === 'admin' || userRole === 'regular'

                  return (
                    <ProjectFolderDetail
                      folder={selectedFolder}
                      canEdit={canEdit}
                      isAdmin={userRole === 'admin'}
                      currentUserEmail={currentUser?.email || ''}
                      pendingDelete={pendingDelete}
                      onRequestDelete={requestDelete}
                      onClearDelete={() => setPendingDelete(null)}
                      onBack={() => {
                        setSelectedFolderId(null)
                        setSelectedInvoiceId(null)
                      }}
                      onAddInvoice={handleAddInvoice}
                      onUpdateInvoice={handleUpdateInvoice}
                      onAddInvoiceFile={handleAddInvoiceFile}
                      onDeleteInvoiceFile={handleDeleteInvoiceFile}
                      onDeleteLegacyInvoiceFile={handleDeleteLegacyInvoiceFile}
                      onDeleteInvoice={handleDeleteInvoice}
                      onToggleInvoicePaid={toggleInvoicePaid}
                      onDeleteFolder={handleDeleteFolder}
                      onToggleProjectActive={toggleProjectActive}
                      selectedInvoiceId={selectedInvoiceId}
                      onSelectInvoice={setSelectedInvoiceId}
                    />
                  )
                }

                const flattenedFolders =
                  flattenFoldersWithDepth(filteredFolders)
                const visibleFolders = flattenedFolders

                return (
                  <div className="space-y-6">
                    <ProjectFolderList
                      folders={visibleFolders}
                      onSelectFolder={(id) => {
                        setSelectedFolderId(id)
                        setSelectedInvoiceId(null)
                      }}
                      onDeleteFolder={handleDeleteFolder}
                      canDeleteFolder={userRole === 'admin'}
                      isAdmin={userRole === 'admin'}
                      onToggleProjectActive={toggleProjectActive}
                      pendingDelete={pendingDelete}
                      onRequestDelete={requestDelete}
                      onClearDelete={() => setPendingDelete(null)}
                    />
                  </div>
                )
              })()}
            </div>
          )}
        </main>
      </div>
        </>
      )}
    </div>
      )}
    </>
  )
}

export default DCCableProjectManager
