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
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 px-6">
    <div className="w-full max-w-md bg-white border border-gray-200 shadow-xl rounded-2xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
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
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
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
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
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
  isAdmin,
  currentUserEmail,
  pendingDelete,
  onRequestDelete,
  onClearDelete,
  onAddInvoice,
  onUpdateInvoice,
  onDeleteInvoice,
  onToggleInvoicePaid,
}) => {
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef(null)

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{folder.name}</h3>
          <p className="text-xs text-gray-500">{folder.ownerEmail}</p>
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
            No invoices in this folder yet.
          </p>
        )}
        {folder.invoices.map((invoice) => {
          const canEditInvoice =
            canEdit &&
            !invoice.paid &&
            (isAdmin || invoice.createdBy === currentUserEmail)
          const canDeleteInvoice = canEditInvoice

          return (
          <div
            key={invoice.id}
            className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center border border-gray-200 rounded-lg p-3"
          >
            <div>
              <p className="text-xs text-gray-500 mb-1">Amount</p>
              <input
                type="number"
                value={invoice.amount}
                onChange={(event) =>
                  onUpdateInvoice(folder.id, invoice.id, {
                    amount: Number(event.target.value || 0),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                disabled={!canEditInvoice}
              />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Date</p>
              <input
                type="date"
                value={invoice.date}
                onChange={(event) =>
                  onUpdateInvoice(folder.id, invoice.id, {
                    date: event.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                disabled={!canEditInvoice}
              />
            </div>
            <div className="text-sm text-gray-600">
              <p className="text-xs text-gray-500 mb-1">Image</p>
              {invoice.imageUrl ? (
                <a
                  href={invoice.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  View file
                </a>
              ) : (
                <p className="truncate">{invoice.imageName || 'No file'}</p>
              )}
            </div>
            <div className="text-xs text-gray-500">
              Added by {invoice.createdBy}
            </div>
            <div>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                  invoice.paid
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {invoice.paid ? 'Paid' : 'Unpaid'}
              </span>
            </div>
            <div className="flex justify-end">
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => onToggleInvoicePaid(folder.id, invoice.id)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    Mark {invoice.paid ? 'Unpaid' : 'Paid'}
                  </button>
                )}
                {(() => {
                  const isConfirm =
                    pendingDelete?.type === 'invoice' &&
                    pendingDelete?.invoiceId === invoice.id
                  return (
                    <button
                      type="button"
                      onClick={() => {
                        if (!canDeleteInvoice) return
                        if (isConfirm) {
                          onClearDelete()
                          onDeleteInvoice(folder.id, invoice.id)
                        } else {
                          onRequestDelete({
                            type: 'invoice',
                            folderId: folder.id,
                            invoiceId: invoice.id,
                          })
                        }
                      }}
                      className="text-xs font-semibold text-red-600 hover:text-red-800"
                      disabled={!canDeleteInvoice}
                    >
                      {isConfirm ? 'Click again to delete' : 'Delete'}
                    </button>
                  )
                })()}
              </div>
            </div>
          </div>
        )
        })}
      </div>

      {canEdit && (
        <form
          className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
          onSubmit={async (event) => {
            event.preventDefault()
            if (!amount || !date) return
            setIsSubmitting(true)
            await onAddInvoice({
              folderId: folder.id,
              amount,
              date,
              imageFile,
            })
            setAmount('')
            setDate('')
            setImageFile(null)
            if (fileInputRef.current) {
              fileInputRef.current.value = ''
            }
            setIsSubmitting(false)
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
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
  projectFilterText,
}) => {
  const projectList = folders.filter((folder) => {
    if (!projectFilterText.trim()) return true
    return folder.name
      .toLowerCase()
      .includes(projectFilterText.trim().toLowerCase())
  })

  const projectTotals = projectList.map((folder, index) => {
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
      '#0ea5e9',
      '#14b8a6',
      '#22c55e',
      '#f59e0b',
      '#f97316',
      '#ef4444',
      '#8b5cf6',
      '#ec4899',
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Total Folders</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {folders.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Unpaid Invoices</p>
          <p className="text-3xl font-bold text-amber-600 mt-1">
            {unpaidInvoices.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            ${totalUnpaidAmount.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Paid Invoices</p>
          <p className="text-3xl font-bold text-green-600 mt-1">
            {paidInvoices.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            ${totalPaidAmount.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
                    className="w-2.5 h-2.5 rounded-full"
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
        Use the Projects tab to manage your invoice folders. You can edit
        invoices while a folder is unpaid.
      </p>
    </div>
  </div>
)

const ProjectFolderList = ({
  folders,
  onSelectFolder,
  onDeleteFolder,
  canDeleteFolder,
  pendingDelete,
  onRequestDelete,
  onClearDelete,
}) => (
  <div className="space-y-4">
    {folders.length === 0 && (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center text-gray-500">
        No folders yet. Create one to start tracking invoices.
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
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass}`}
            >
              {statusLabel}
            </span>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            {folder.invoices.length} invoices
          </div>
        </button>
        {canDeleteFolder && (
          <div className="mt-3 flex justify-end">
            {(() => {
              const isConfirm =
                pendingDelete?.type === 'project' &&
                pendingDelete?.folderId === folder.id
              return (
                <button
                  type="button"
                  className="text-xs font-semibold text-red-600 hover:text-red-800"
                  onClick={() => {
                    if (isConfirm) {
                      onClearDelete()
                      onDeleteFolder(folder.id)
                    } else {
                      onRequestDelete({ type: 'project', folderId: folder.id })
                    }
                  }}
                >
                  {isConfirm ? 'Click again to delete' : 'Delete Folder'}
                </button>
              )
            })()}
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
  onDeleteFolder,
  onDeleteInvoice,
  onToggleInvoicePaid,
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
    <div className="flex items-center justify-between gap-4">
      <button
        onClick={onBack}
        className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        Back to Folders
      </button>
      {isAdmin && (
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
              {isConfirm ? 'Click again to delete' : 'Delete Folder'}
            </button>
          )
        })()
      )}
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass}`}
      >
        {statusLabel}
      </span>
    </div>
      )
    })()}

    <ProfileFolderCard
      folder={folder}
      canEdit={canEdit}
      isAdmin={isAdmin}
      currentUserEmail={currentUserEmail}
      pendingDelete={pendingDelete}
      onRequestDelete={onRequestDelete}
      onClearDelete={onClearDelete}
      onAddInvoice={onAddInvoice}
      onUpdateInvoice={onUpdateInvoice}
      onDeleteInvoice={onDeleteInvoice}
      onToggleInvoicePaid={onToggleInvoicePaid}
    />
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
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterProject, setFilterProject] = useState('')
  const [filterCreatedDate, setFilterCreatedDate] = useState('')
  const [filterPaidDate, setFilterPaidDate] = useState('')
  const [newProjectName, setNewProjectName] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [quickProjectId, setQuickProjectId] = useState('')
  const [quickAmount, setQuickAmount] = useState('')
  const [quickDate, setQuickDate] = useState('')
  const [quickFile, setQuickFile] = useState(null)
  const [payrollProjectId, setPayrollProjectId] = useState('')
  const [payrollAmount, setPayrollAmount] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)

  // Empty state - will be populated from your backend
  const [projects] = useState([])
  const [documents] = useState([])
  const [weeklyData] = useState([])
  const [employees] = useState([])
  const [payrollRecords] = useState([])

  const adminEmails = [
    'vikdcbilling@dccablellc.com',
    'ernestofons@dccablellc.com',
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
    window.setTimeout(() => {
      setPendingDelete((current) => {
        if (!current) return current
        if (JSON.stringify(current) === JSON.stringify(payload)) {
          return null
        }
        return current
      })
    }, 4000)
  }

  const closeSidebarIfMobile = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }

  const loadData = async () => {
    if (!isAuthenticated || !currentUser) return
    setIsLoadingData(true)

    const [projectsRes, invoicesRes, payrollRes] = await Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('invoices').select('*').order('created_at', { ascending: false }),
      supabase.from('payroll_entries').select('*').order('created_at', { ascending: false }),
    ])

    if (projectsRes.error || invoicesRes.error || payrollRes.error) {
      setIsLoadingData(false)
      return
    }

    const projectsData = projectsRes.data || []
    const invoicesDataRaw = invoicesRes.data || []
    const payrollData = payrollRes.data || []

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
  const unseenInvoices = allInvoices.filter(
    (invoice) => !invoice.seenByAdmin,
  )

  const handleCreateProject = (projectName) => {
    if (!projectName.trim()) return
    const trimmedName = projectName.trim()
    const createProject = async () => {
      await supabase.from('projects').insert({
        name: trimmedName,
        created_by: currentUser?.id,
        created_by_email: currentUser?.email,
      })
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

  const handleAddInvoice = async ({ folderId, amount, date, imageFile }) => {
    if (!amount || !date) return
    const uploadResult = await uploadInvoiceFile(imageFile)
    await supabase.from('invoices').insert({
      project_id: folderId,
      amount: Number(amount),
      date,
      created_by: currentUser?.id,
      created_by_email: currentUser?.email,
      paid: false,
      paid_at: null,
      seen_by_admin: false,
      image_name: imageFile ? imageFile.name : null,
      image_path: uploadResult.path,
      image_url: uploadResult.publicUrl,
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
    if (!quickProjectId || !quickAmount || !quickDate) return
    handleAddInvoice({
      folderId: quickProjectId,
      amount: quickAmount,
      date: quickDate,
      imageFile: quickFile,
    })
    setQuickAmount('')
    setQuickDate('')
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
      await supabase.from('invoices').update(updatePayload).eq('id', invoiceId)
      loadData()
    }
    updateInvoice()
  }

  const toggleInvoicePaid = (folderId, invoiceId) => {
    const today = new Date().toISOString().slice(0, 10)
    const togglePaid = async () => {
      const invoice = findFolderById(folders, folderId)?.invoices.find(
        (inv) => inv.id === invoiceId,
      )
      if (!invoice) return
      await supabase
        .from('invoices')
        .update({
          paid: !invoice.paid,
          paid_at: invoice.paid ? null : today,
          seen_by_admin: true,
        })
        .eq('id', invoiceId)
      loadData()
    }
    togglePaid()
  }

  const handleDeleteFolder = (folderId) => {
    const folder = findFolderById(folders, folderId)
    if (!folder) return
    if (userRole !== 'admin') return
    const deleteProject = async () => {
      await supabase.from('projects').delete().eq('id', folderId)
      if (selectedFolderId === folderId) {
        setSelectedFolderId(null)
      }
      loadData()
    }
    deleteProject()
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
      await supabase.from('invoices').delete().eq('id', invoiceId)
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
    if (filterPaidDate && invoice.paidAt !== filterPaidDate) {
      return false
    }
    return true
  }

  const folderMatchesFilters = (folder) => {
    if (filterProject.trim()) {
      const query = filterProject.trim().toLowerCase()
      if (!folder.name.toLowerCase().includes(query)) return false
    }

    const hasInvoiceFilters =
      filterStatus !== 'all' || filterCreatedDate || filterPaidDate

    if (!hasInvoiceFilters) return true

    return folder.invoices.some((invoice) => invoiceMatchesFilters(invoice))
  }

  const flattenFoldersWithDepth = (nodes, depth = 0) =>
    nodes.map((folder) => ({ ...folder, depth }))

  const filteredInvoices = allInvoices.filter((invoice) => {
    const projectMatch = filterProject.trim()
      ? invoice.folderName
          .toLowerCase()
          .includes(filterProject.trim().toLowerCase())
      : true
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
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
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
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
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
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
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
                    {unseenInvoices.length > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-600 text-white text-[10px] rounded-full flex items-center justify-center px-1">
                        {unseenInvoices.length}
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
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold cursor-pointer">
                U
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
                <input
                  type="text"
                  value={filterProject}
                  onChange={(event) => setFilterProject(event.target.value)}
                  placeholder="Search project name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
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
              <button
                onClick={() => {
                  setFilterProject('')
                  setFilterStatus('all')
                  setFilterCreatedDate('')
                  setFilterPaidDate('')
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
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
                projectFilterText={filterProject}
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
                        ? 'All user folders'
                        : 'Your folders'}
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
                      }}
                      onAddInvoice={handleAddInvoice}
                      onUpdateInvoice={handleUpdateInvoice}
                      onDeleteInvoice={handleDeleteInvoice}
                      onToggleInvoicePaid={toggleInvoicePaid}
                      onDeleteFolder={handleDeleteFolder}
                    />
                  )
                }

                const flattenedFolders =
                  flattenFoldersWithDepth(filteredFolders)
                const visibleFolders = flattenedFolders

                return (
                  <div className="space-y-6">
                    {userRole === 'regular' && (
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
                          Add Invoice to Project
                        </h3>
                        <form
                          className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
                          onSubmit={handleQuickAddInvoice}
                        >
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                              Project
                            </label>
                            <select
                              value={quickProjectId}
                              onChange={(event) =>
                                setQuickProjectId(event.target.value)
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
                              Amount
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={quickAmount}
                              onChange={(event) =>
                                setQuickAmount(event.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                              Date
                            </label>
                            <input
                              type="date"
                              value={quickDate}
                              onChange={(event) =>
                                setQuickDate(event.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                              Invoice Image
                            </label>
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={(event) =>
                                setQuickFile(event.target.files?.[0] || null)
                              }
                              className="w-full text-sm"
                            />
                          </div>
                          <button
                            type="submit"
                            className="md:col-span-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                          >
                            Add Invoice
                          </button>
                        </form>
                      </div>
                    )}

                    <ProjectFolderList
                      folders={visibleFolders}
                      onSelectFolder={(id) => {
                        setSelectedFolderId(id)
                      }}
                      onDeleteFolder={handleDeleteFolder}
                      canDeleteFolder={userRole === 'admin'}
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
