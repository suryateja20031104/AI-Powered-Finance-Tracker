import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchTransactions,
  removeTransactionById,
  saveTransaction
} from '../redux/slices/transactionSlice'
import { categories, formatCurrency, formatDate, paymentMethods } from '../utils/format'

const emptyForm = {
  type: 'expense',
  title: '',
  amount: '',
  category: 'Food',
  paymentMethod: 'upi',
  description: '',
  transactionDate: new Date().toISOString().slice(0, 10)
}

const sortOptions = [
  { value: 'latest', label: 'Latest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'amount_desc', label: 'Amount high → low' },
  { value: 'amount_asc', label: 'Amount low → high' }
]

const getPaymentLabel = (method) =>
  method
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())

function Transactions() {
  const dispatch = useDispatch()
  const { transactions, pagination, loading, error } = useSelector((state) => state.transactions)

  const [filters, setFilters] = useState({ search: '', type: '', category: '', sort: 'latest' })
  const [page, setPage] = useState(1)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })

  const query = useMemo(
    () => ({
      page,
      limit: 10,
      ...filters
    }),
    [filters, page]
  )

  useEffect(() => {
    dispatch(fetchTransactions(query))
  }, [dispatch, query])

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
    setPage(1)
  }

  const resetFilters = () => {
    setFilters({ search: '', type: '', category: '', sort: 'latest' })
    setPage(1)
  }

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
    setStatus({ type: '', message: '' })
  }

  const openEdit = (transaction) => {
    setEditingId(transaction._id)
    setForm({
      type: transaction.type,
      title: transaction.title || '',
      amount: String(transaction.amount || ''),
      category: transaction.category || categories[0],
      paymentMethod: transaction.paymentMethod || 'upi',
      description: transaction.description || '',
      transactionDate: transaction.transactionDate
        ? new Date(transaction.transactionDate).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10)
    })
    setShowForm(true)
    setStatus({ type: '', message: '' })
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      await dispatch(saveTransaction({ id: editingId, data: form })).unwrap()
      setStatus({ type: 'success', message: editingId ? 'Transaction updated successfully.' : 'Transaction created successfully.' })
      closeForm()
      dispatch(fetchTransactions(query))
    } catch (saveError) {
      setStatus({ type: 'error', message: saveError || 'Unable to save transaction.' })
    }
  }

  const deleteTransaction = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this transaction?')
    if (!confirmed) return

    try {
      await dispatch(removeTransactionById(id)).unwrap()
      setStatus({ type: 'success', message: 'Transaction deleted successfully.' })
      dispatch(fetchTransactions(query))
    } catch (deleteError) {
      setStatus({ type: 'error', message: deleteError || 'Unable to delete transaction.' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Transactions</h2>
          <p className="mt-1 text-sm text-slate-500">Manage your income and expense records with filters, pagination, and quick edits.</p>
        </div>
        <button onClick={openCreate} className="rounded-lg bg-primary px-4 py-2 font-semibold text-white hover:bg-slate-900">
          Add Transaction
        </button>
      </div>

      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-5">
          <input
            type="search"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Search transactions"
            className="rounded-lg border px-3 py-2"
          />

          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="rounded-lg border px-3 py-2"
          >
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="rounded-lg border px-3 py-2"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="rounded-lg border px-3 py-2"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <button onClick={resetFilters} className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
            Reset filters
          </button>
        </div>
      </section>

      {(error || status.message) && (
        <div className={`rounded-lg border p-4 text-sm ${status.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>
          {status.message || error}
        </div>
      )}

      <section className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full md:min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-6 text-center text-slate-500">
                    Loading transactions...
                  </td>
                </tr>
              ) : transactions.length ? (
                transactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td className="px-4 py-4 text-slate-900">{transaction.title}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${transaction.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{transaction.category}</td>
                    <td className="px-4 py-4 text-slate-700">{formatDate(transaction.transactionDate)}</td>
                    <td className="px-4 py-4 text-slate-700">{getPaymentLabel(transaction.paymentMethod)}</td>
                    <td className="px-4 py-4 text-slate-900">{formatCurrency(transaction.amount)}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(transaction)}
                          className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-100"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteTransaction(transaction._id)}
                          className="rounded-lg border border-rose-300 px-3 py-1 text-sm text-rose-700 hover:bg-rose-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-6 text-center text-slate-500">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 border-t px-4 py-4 text-sm md:flex-row md:items-center md:justify-between">
          <p className="text-slate-500">
            Page {pagination.page} of {Math.max(pagination.pages, 1)}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={pagination.page <= 1}
              className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-100"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(prev + 1, pagination.pages || 1))}
              disabled={pagination.page >= pagination.pages}
              className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-100"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/30 px-4 py-6">
          <div className="w-full max-w-2xl max-h-[calc(100vh-4rem)] overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  {editingId ? 'Edit Transaction' : 'Add Transaction'}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {editingId ? 'Update your transaction details.' : 'Record a new income or expense.'}
                </p>
              </div>
              <button type="button" onClick={closeForm} className="rounded-lg border px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6 overflow-y-auto max-h-[calc(100vh-18rem)]">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Type</span>
                  <select value={form.type} onChange={(e) => handleChange('type', e.target.value)} className="w-full rounded-lg border px-3 py-2">
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Category</span>
                  <select value={form.category} onChange={(e) => handleChange('category', e.target.value)} className="w-full rounded-lg border px-3 py-2">
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-slate-700">Title</span>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="w-full rounded-lg border px-3 py-2"
                    required
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Amount</span>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => handleChange('amount', e.target.value)}
                    className="w-full rounded-lg border px-3 py-2"
                    required
                    min="0"
                    step="0.01"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Payment Method</span>
                  <select value={form.paymentMethod} onChange={(e) => handleChange('paymentMethod', e.target.value)} className="w-full rounded-lg border px-3 py-2">
                    {paymentMethods.map((method) => (
                      <option key={method} value={method}>{getPaymentLabel(method)}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Date</span>
                  <input
                    type="date"
                    value={form.transactionDate}
                    onChange={(e) => handleChange('transactionDate', e.target.value)}
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </label>
              </div>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Description</span>
                <textarea
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="min-h-[120px] w-full rounded-lg border px-3 py-2 resize-none"
                  placeholder="Optional description"
                />
              </label>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900"
                >
                  {loading ? 'Saving...' : editingId ? 'Update Transaction' : 'Save Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Transactions
