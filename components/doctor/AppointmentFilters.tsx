interface AppointmentFiltersProps {
  statusFilter: string;
  dateFilter: string;
  searchTerm: string;
  onStatusChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

export function AppointmentFilters({
  statusFilter,
  dateFilter,
  searchTerm,
  onStatusChange,
  onDateChange,
  onSearchChange,
}: AppointmentFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Status Filter */}
      <div>
        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Status</label>
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
        >
          <option value="all">All</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="rescheduled">Rescheduled</option>
          <option value="completed">Completed</option>
          <option value="canceled">Cancelled</option>
        </select>
      </div>

      {/* Date Filter */}
      <div>
        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
          Date
        </label>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
        />
      </div>

      {/* Search Filter */}
      <div>
        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Search</label>
        <input
          type="text"
          placeholder="Patient, phone, service..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full md:w-64 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
      </div>
    </div>
  );
}
