// src/components/doctor/AppointmentFilters.tsx

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
      <div>
        <label className="block text-xs text-gray-500 mb-1">Status</label>
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="border rounded-md px-2 text-black py-1 text-sm"
        >
          <option value="all">All</option>
          <option value="requested">Requested</option>
          <option value="approved">Approved</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1 text-black">
          Date
        </label>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => onDateChange(e.target.value)}
          className="border rounded-md px-2 py-1 text-sm text-black"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Search</label>
        <input
          type="text"
          placeholder="Patient, phone, service..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="border rounded-md px-2 py-1 text-sm w-40 md:w-52 text-black"
        />
      </div>
    </div>
  );
}
