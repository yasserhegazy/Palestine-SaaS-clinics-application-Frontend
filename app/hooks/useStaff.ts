'use client';

import { useState, useEffect, useMemo } from "react";
import { getStaffList, updateStaff, deleteStaff, StaffType } from "../api/mangmentStaff";

export const useStaff = (token: string | null) => {
  const [staffList, setStaffList] = useState<StaffType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState<string>("");
  const [filterRole, setFilterRole] = useState<"All" | "Doctor" | "Secretary">("All");

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffType | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<StaffType | null>(null);

  const fetchStaff = async () => {
    if (!token) {
      setError("User not logged in");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getStaffList(token);
      console.log("Fetched staff:", data);

      if (!Array.isArray(data)) {
        setError("Invalid staff data received from server");
        setStaffList([]);
      } else {
        // ===== احسب حالة النشاط حسب اليوم =====
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }); // Monday, Tuesday, ...
        const staffWithStatus = data.map(staff => {
          if (staff.role === 'Doctor') {
            const days = staff.available_days
              ? staff.available_days.split(',').map(d => d.trim())
              : [];
            return { ...staff, isActive: days.includes(today) };
          }
          return staff;
        });
        setStaffList(staffWithStatus);
      }
    } catch (err: any) {
      console.error("Fetch Staff Error:", err.response?.data || err.message);
      setError(err.response?.data?.message || err.message || "Failed to fetch staff");
      setStaffList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [token]);

  // ===== Filter + Search =====
  const filteredStaff = useMemo(() => {
    const q = search.toLowerCase();
    return staffList.filter((s) => {
      const matchRole = filterRole === "All" || s.role === filterRole;
      const matchSearch =
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.includes(search);
      return matchRole && matchSearch;
    });
  }, [staffList, search, filterRole]);

  // ===== Pagination =====
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage) || 1;
  const currentStaff = filteredStaff.slice(
    (currentPage - 1) * itemsPerPage,
    (currentPage - 1) * itemsPerPage + itemsPerPage
  );

  const handlePageChange = (p: number) => {
    if (p >= 1 && p <= totalPages) setCurrentPage(p);
  };

  // ===== Edit Staff =====
  const handleEditClick = (staff: StaffType) => {
    setEditingStaff(staff);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (updated: StaffType) => {
    if (!token) {
      setError("User not logged in");
      return;
    }

    try {
      await updateStaff(updated, token);
      await fetchStaff();
      setIsEditModalOpen(false);
      setEditingStaff(null);
    } catch (err: any) {
      console.error("Update Staff Error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to update staff");
    }
  };

  // ===== Delete Staff =====
  const handleDeleteClick = (staff: StaffType) => {
    setStaffToDelete(staff);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!token || !staffToDelete) {
      setError("User not logged in or staff not selected");
      return;
    }

    try {
      await deleteStaff(staffToDelete.user_id, token);
      await fetchStaff();
      setIsDeleteModalOpen(false);
      setStaffToDelete(null);
    } catch (err: any) {
      console.error("Delete Staff Error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to delete staff");
    }
  };

  return {
    loading,
    error,
    currentStaff,
    filteredCount: filteredStaff.length,
    refreshStaff: fetchStaff,
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
    setIsDeleteModalOpen,
  };
};
