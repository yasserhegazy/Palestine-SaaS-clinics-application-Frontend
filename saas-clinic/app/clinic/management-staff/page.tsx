'use client';

import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useStaff } from '../../hooks/useStaff';
import { StaffType } from '../../api/mangmentStaff';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilSquareIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

export default function StaffManagementPage() {
  const { clinic, token } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];

  // ----- Use the custom hook -----
  const {
    loading,
    currentStaff,
    filteredCount,
    search,
    setSearch,
    filterRole,
    setFilterRole,
    currentPage,
    totalPages,
    handlePageChange,
    editingStaff,
    setEditingStaff,
    isEditModalOpen,
    handleEditClick,
    handleUpdate,
    setIsEditModalOpen,
    staffToDelete,
    isDeleteModalOpen,
    handleDeleteClick,
    confirmDelete,
    setIsDeleteModalOpen
  } = useStaff(token);

  // Wrapper for form submission
  const onUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStaff) {
      handleUpdate(editingStaff);
    }
  };

  // ----- JSX -----
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t.staffManagementTitle}</h1>
            <p className="text-sm text-gray-500 mt-1">{clinic?.name} - Staff Directory</p>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm font-medium flex items-center gap-2"
            >
              {t.btnBack}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">

          {/* Table Header / Controls */}
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-800">{t.staffDetailsTitle || "Staff Details"}</h2>
              <span className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-semibold rounded-full border border-teal-100">
                {filteredCount} Members
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder={t.searchPlaceholder || "Search..."}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-full sm:w-64 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none bg-gray-50 focus:bg-white"
                />
              </div>

              {/* Filter */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FunnelIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as any)}
                  className="pl-10 pr-8 py-2.5 w-full sm:w-40 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                >
                  <option value="All">{t.filterAll || "All Roles"}</option>
                  <option value="Doctor">{t.filterDoctor || "Doctors"}</option>
                  <option value="Secretary">{t.filterSecretary || "Secretaries"}</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t.colName || "Name"}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t.colEmail || "Email"}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t.colPhone || "Phone"}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t.colRole || "Role"}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t.colSpecialization || "Specialization"}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t.colWorkingHours || "Working Hours"}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t.colStatus || "Status"}</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">{t.colActions || "Actions"}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : currentStaff.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <MagnifyingGlassIcon className="h-8 w-8 text-gray-300" />
                        <p>{t.noRecordsMessage || "No staff members found matching your criteria."}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentStaff.map((staff, idx) => (
                    <tr key={staff.user_id} className="group hover:bg-teal-50/30 transition-colors duration-200">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {(currentPage - 1) * 5 + idx + 1}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold mr-2 text-xs">
                            {staff.name.charAt(0)}
                          </div>
                          <div className="text-sm font-semibold text-gray-900">{staff.name}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 max-w-[150px] truncate" title={staff.email}>{staff.email}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{staff.phone}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${staff.role === 'Doctor'
                          ? 'bg-blue-50 text-blue-700 border-blue-100'
                          : 'bg-purple-50 text-purple-700 border-purple-100'
                          }`}>
                          {staff.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 min-w-[120px]">
                        {staff.role === 'Doctor' ? staff.specialization || '-' : '-----'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 min-w-[150px]">
                        {staff.role === 'Doctor' ? staff.available_days || '-' : '-----'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${staff.status === 'Active'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-700'
                          }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${staff.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          {staff.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium flex gap-2 justify-end">
                        <button onClick={() => handleEditClick(staff)} className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="Edit">
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteClick(staff)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-900">{filteredCount > 0 ? (currentPage - 1) * 5 + 1 : 0}</span> to <span className="font-medium text-gray-900">{Math.min(currentPage * 5, filteredCount)}</span> of <span className="font-medium text-gray-900">{filteredCount}</span> entries
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                &lt;
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {isEditModalOpen && editingStaff && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">{t.editStaffTitle || "Edit Staff Member"}</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <form onSubmit={onUpdateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.colName || "Name"}</label>
                <input
                  type="text"
                  required
                  value={editingStaff.name}
                  onChange={(e) => setEditingStaff(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.colEmail || "Email"}</label>
                <input
                  type="email"
                  required
                  value={editingStaff.email}
                  onChange={(e) => setEditingStaff(prev => prev ? { ...prev, email: e.target.value } : null)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.colPhone || "Phone"}</label>
                <input
                  type="tel"
                  required
                  value={editingStaff.phone}
                  onChange={(e) => setEditingStaff(prev => prev ? { ...prev, phone: e.target.value } : null)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                />
              </div>

              {editingStaff.role === 'Doctor' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.colSpecialization || "Specialization"}</label>
                    <input
                      type="text"
                      value={editingStaff.specialization || ''}
                      onChange={(e) => setEditingStaff(prev => prev ? { ...prev, specialization: e.target.value } : null)}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.colWorkingHours || "Available Days"}</label>
                    <input
                      type="text"
                      value={editingStaff.available_days || ''}
                      onChange={(e) => setEditingStaff(prev => prev ? { ...prev, available_days: e.target.value } : null)}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                      placeholder="e.g., Mon, Wed, Fri"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Room</label>
                    <input
                      type="text"
                      value={editingStaff.clinic_room || ''}
                      onChange={(e) => setEditingStaff(prev => prev ? { ...prev, clinic_room: e.target.value } : null)}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                      placeholder="e.g., Room 101"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-all"
                >
                  {t.btnCancel || "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-700 shadow-lg shadow-teal-600/20 transition-all"
                >
                  {t.btnSave || "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div >
      )
      }

      {/* Delete Confirmation Modal */}
      {
        isDeleteModalOpen && staffToDelete && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 mx-auto flex items-center justify-center mb-4">
                  <TrashIcon className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t.deleteStaffTitle || "Delete Staff Member"}</h3>
                <p className="text-gray-500 text-sm mb-6">
                  {t.deleteConfirmationMessage || `Are you sure you want to delete ${staffToDelete.name}? This action cannot be undone.`}
                </p>

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors w-full"
                  >
                    {t.btnCancel || "Cancel"}
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all w-full"
                  >
                    {t.btnDelete || "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
