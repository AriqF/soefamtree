"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { API_ENDPOINTS } from "@/lib/api-config";
import { AuthStorage } from "@/lib/secure-storage";
import { APIResponse } from "@/types/response";
import { FamilyMember, Gender } from "@/types/family";
import Link from "next/link";
import Image from "next/image";
import { GetMemberResponse, PaginateList } from "@/types/member";

export default function FamilyListPage() {
  const router = useRouter();
  const [members, setMembers] = useState<GetMemberResponse[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<GetMemberResponse[]>(
    [],
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [limit] = useState(10);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  // Fetch family members
  useEffect(() => {
    // Set searching state for debounce
    setIsSearching(true);

    // Debounce search - wait 500ms after user stops typing
    const debounceTimer = setTimeout(() => {
      fetchMembers();
      setIsSearching(false);
    }, 500);

    return () => {
      clearTimeout(debounceTimer);
      setIsSearching(false);
    };
  }, [currentPage, searchQuery]);

  // No need for separate filter effect anymore since we're using server-side search
  const fetchMembers = async () => {
    setIsLoading(true);
    setError("");

    try {
      const token = AuthStorage.getToken();

      const response = await axios.get<
        APIResponse<PaginateList<GetMemberResponse>>
      >(
        API_ENDPOINTS.member.list(currentPage, limit, searchQuery || undefined),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.code === 200 && response.data.data) {
        const data = response.data.data;
        setMembers(data.rows || []);
        setFilteredMembers(data.rows || []);
        setTotalPages(data.total_page);
        setTotalData(data.total_data);
        setHasNextPage(data.has_next_page);
        setHasPrevPage(data.has_previous_page);
      }
    } catch (err) {
      const axiosError = err as AxiosError<APIResponse<any>>;
      if (axiosError.response?.status === 401) {
        // Unauthorized - clear session and redirect
        AuthStorage.clearSession();
        router.push("/superuser");
      } else {
        setError("Failed to load family members");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAge = (birthDate?: string, deathDate?: string): string => {
    if (!birthDate) return "-";
    const birth = new Date(birthDate);
    const end = deathDate ? new Date(deathDate) : new Date();
    const age = end.getFullYear() - birth.getFullYear();
    return `${age} tahun`;
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Family Members
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Manage and view all family members
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Link
            href="/admin/family/create-member"
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-600 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Tambah Anggota
          </Link>

          <Link
            href="/admin/family/create-family"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Tambah Keluarga
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {isSearching ? (
              <svg
                className="animate-spin h-5 w-5 text-zinc-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <svg
                className="h-5 w-5 text-zinc-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            )}
          </div>
          <input
            type="text"
            placeholder="Nickname or fullname..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to page 1 when searching
            }}
            className="block w-full pl-10 pr-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-900 dark:text-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg
                className="h-5 w-5 text-zinc-400 hover:text-zinc-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <svg
              className="animate-spin h-8 w-8 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <svg
              className="w-12 h-12 text-red-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={fetchMembers}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <svg
              className="w-12 h-12 text-zinc-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="text-zinc-600 dark:text-zinc-400">
              {searchQuery
                ? "No members found matching your search"
                : "No family members yet"}
            </p>
          </div>
        ) : (
          <>
            {/* Table Header - Desktop */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <div className="col-span-3">Name</div>
              <div className="col-span-2">Jenis Kelamin</div>
              <div className="col-span-2">Tanggal Lahir</div>
              <div className="col-span-3">Domisili</div>
              <div className="col-span-2 text-right">Aksi</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/admin/family/${member.id}`)}
                >
                  {/* Desktop View */}
                  <div className="hidden md:grid md:grid-cols-12 gap-4 items-center">
                    {/* Name with Avatar */}
                    <div className="col-span-3 flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0
                          ${
                            member.death_date
                              ? "bg-zinc-300 dark:bg-zinc-600 text-white"
                              : member.gender === "male"
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                : "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400"
                          }`}
                      >
                        {member.fullname
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-zinc-900 dark:text-white truncate">
                          {member.fullname}
                        </p>
                        {member.nickname && (
                          <p className="text-sm text-zinc-500 dark:text-zinc-400 italic truncate">
                            {member.nickname}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Gender */}
                    <div className="col-span-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium
                        ${
                          member.gender === "male"
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                            : "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400"
                        }`}
                      >
                        <Image
                          src={
                            member.gender === "male"
                              ? "/icons/male.svg"
                              : "/icons/female.svg"
                          }
                          width={12}
                          height={12}
                          alt="gender"
                        />
                        {member.gender === "male" ? "Pria" : "Wanita"}
                      </span>
                    </div>

                    {/* Age */}
                    <div className="col-span-2 text-zinc-700 dark:text-zinc-300">
                      {calculateAge(member.birth_date, member.death_date)}
                    </div>

                    {/* Location */}
                    <div className="col-span-3 text-zinc-700 dark:text-zinc-300 truncate">
                      {member.detail?.domicile ?? "-"}
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/family/edit/${member.id}`);
                        }}
                        className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          /* TODO: Add delete confirmation */
                        }}
                        className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Mobile View */}
                  <div className="md:hidden space-y-3">
                    {/* Name with Avatar */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0
                          ${
                            member.death_date
                              ? "bg-zinc-300 dark:bg-zinc-600 text-white"
                              : member.gender === "male"
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                : "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400"
                          }`}
                      >
                        {member.fullname
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-zinc-900 dark:text-white">
                          {member.fullname}
                        </p>
                        {member.nickname && (
                          <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">
                            {member.nickname}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-zinc-500 dark:text-zinc-400">
                          Gender:
                        </span>
                        <span
                          className={`ml-2 font-medium ${member.gender === Gender.MALE ? "text-blue-600 dark:text-blue-400" : "text-pink-600 dark:text-pink-400"}`}
                        >
                          {member.gender === Gender.MALE ? "Pria" : "Wanita"}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 dark:text-zinc-400">
                          Age:
                        </span>
                        <span className="ml-2 font-medium text-zinc-900 dark:text-white">
                          {calculateAge(member.birth_date, member.death_date)}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-zinc-500 dark:text-zinc-400">
                          Location:
                        </span>
                        <span className="ml-2 font-medium text-zinc-900 dark:text-white">
                          {member.detail?.domicile ?? "-"}
                        </span>
                      </div>
                    </div>

                    {/* Mobile Actions */}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/family/edit/${member.id}`);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          /* TODO: Add delete confirmation */
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer with Pagination */}
            <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Results count */}
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Showing{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * limit, totalData)}
                  </span>{" "}
                  of <span className="font-medium">{totalData}</span> members
                </p>

                {/* Pagination controls */}
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    {/* Previous button */}
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={!hasPrevPage}
                      className="px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>

                    {/* Page numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          // Show first 3, last 1, and current page with neighbors
                          let pageNum: number;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={i}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors
                              ${
                                currentPage === pageNum
                                  ? "bg-blue-600 text-white"
                                  : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        },
                      )}
                    </div>

                    {/* Next button */}
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={!hasNextPage}
                      className="px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
