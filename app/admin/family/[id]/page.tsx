"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios, { AxiosError } from "axios";
import { API_ENDPOINTS } from "@/lib/api-config";
import { AuthStorage } from "@/lib/secure-storage";
import { APIResponse } from "@/types/response";
import { GetMemberDetailResponse } from "@/types/member";
import { ParentRelation } from "@/types/family";
import Link from "next/link";
import Image from "next/image";

export default function MemberDetailPage() {
  const router = useRouter();
  const params = useParams();
  const memberId = params?.id as string;

  const [member, setMember] = useState<GetMemberDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (memberId) {
      fetchMemberDetail();
    }
  }, [memberId]);

  const fetchMemberDetail = async () => {
    setIsLoading(true);
    setError("");

    try {
      const token = AuthStorage.getToken();
      if (!token) {
        router.push("/superuser");
        return;
      }

      const response = await axios.get<APIResponse<GetMemberDetailResponse>>(
        API_ENDPOINTS.member.detail(Number(memberId)),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.code === 200 && response.data.data) {
        setMember(response.data.data);
      }
    } catch (err) {
      const axiosError = err as AxiosError<APIResponse<any>>;
      if (axiosError.response?.status === 401) {
        AuthStorage.clearSession();
        router.push("/superuser");
      } else {
        setError("Failed to load member details");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAge = (birthDate?: Date, deathDate?: Date): string => {
    if (!birthDate) return "-";
    const birth = new Date(birthDate);
    const end = deathDate ? new Date(deathDate) : new Date();
    const age = end.getFullYear() - birth.getFullYear();
    return `${age} tahun`;
  };

  const formatDate = (date?: Date): string => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <svg
          className="animate-spin h-12 w-12 text-blue-600"
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
    );
  }

  if (error || !member) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/family"
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
          >
            <svg
              className="w-6 h-6 text-zinc-600 dark:text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Member Details
          </h1>
        </div>

        <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
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
          <p className="text-red-600 dark:text-red-400 mb-4">
            {error || "Member not found"}
          </p>
          <button
            onClick={fetchMemberDetail}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/family"
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
          >
            <svg
              className="w-6 h-6 text-zinc-600 dark:text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Member Details
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              View complete information about {member.fullname}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href={`/admin/family/edit/${member.id}`}
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6 sticky top-6">
            {/* Profile Image */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4">
                {member.photo_url ? (
                  <img
                    src={member.photo_url}
                    alt={member.fullname}
                    className="w-32 h-32 rounded-full object-cover border-4 border-zinc-200 dark:border-zinc-700"
                  />
                ) : (
                  <div
                    className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold border-4 border-zinc-200 dark:border-zinc-700
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
                )}
                {member.death_date && (
                  <div className="absolute -top-2 -right-2 bg-zinc-500 text-white rounded-full p-2">
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                )}
              </div>

              <h2 className="text-xl font-bold text-zinc-900 dark:text-white text-center">
                {member.fullname}
              </h2>
              {member.nickname && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">
                  "{member.nickname}"
                </p>
              )}

              {/* Gender Badge */}
              <div className="mt-3">
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium
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
                    width={16}
                    height={16}
                    alt="gender"
                  />
                  {member.gender === "male" ? "Pria" : "Wanita"}
                </span>
              </div>
            </div>

            {/* Quick Info */}
            <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-700">
              {/* Birth Date */}
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                  Birth Date
                </p>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                  {formatDate(member.birth_date)}
                </p>
              </div>

              {/* Death Date */}
              {member.death_date && (
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                    Death Date
                  </p>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    {formatDate(member.death_date)}
                  </p>
                </div>
              )}

              {/* Age */}
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                  Age
                </p>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                  {calculateAge(member.birth_date, member.death_date)}
                </p>
              </div>

              {/* Profession */}
              {member.detail?.profession && (
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                    Profession
                  </p>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    {member.detail.profession}
                  </p>
                </div>
              )}

              {/* Domicile */}
              {member.detail?.domicile && (
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                    Domicile
                  </p>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    {member.detail.domicile}
                  </p>
                </div>
              )}

              {/* Biography */}
              {member.bio && (
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                    Biography
                  </p>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          {member.detail && (
            <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
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
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                Contact & Address
              </h3>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                    Full Address
                  </p>
                  {member.detail.full_address ? (
                    <>
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {member.detail.full_address}
                      </p>
                    </>
                  ) : (
                    "-"
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                      WhatsApp
                    </p>
                    {member.detail.whatsapp_number ? (
                      <a
                        href={`https://wa.me/${member.detail.whatsapp_number}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        {member.detail.whatsapp_number}
                      </a>
                    ) : (
                      "-"
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                      Instagram
                    </p>

                    {member.detail.instagram_handle ? (
                      <a
                        href={`https://instagram.com/${member.detail.instagram_handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                        @{member.detail.instagram_handle}
                      </a>
                    ) : (
                      "-"
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Family Relations */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Family Relations
            </h3>

            <div className="space-y-4">
              {/* Spouse */}
              {member.spouse && (
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                    Spouse
                  </p>
                  <Link
                    href={`/admin/family/${member.spouse.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 flex items-center justify-center font-semibold text-sm">
                      {member.spouse.fullname
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-zinc-900 dark:text-white">
                        {member.spouse.fullname}
                      </p>
                      {member.spouse.nickname && (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">
                          "{member.spouse.nickname}"
                        </p>
                      )}
                    </div>
                    <svg
                      className="w-5 h-5 text-zinc-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              )}

              {/* Parents */}
              {member.parents && member.parents.length > 0 && (
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                    Parents
                  </p>
                  <div className="space-y-2">
                    {member.parents.map((parentRelation, index) => (
                      <Link
                        key={index}
                        href={`/admin/family/${parentRelation.parent.id}`}
                        className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                          ${
                            parentRelation.relation === ParentRelation.FATHER
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                              : "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400"
                          }`}
                        >
                          {parentRelation.parent.fullname
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-zinc-900 dark:text-white">
                            {parentRelation.parent.fullname}
                          </p>
                          <div className="flex items-center gap-2">
                            {parentRelation.parent.nickname && (
                              <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">
                                "{parentRelation.parent.nickname}"
                              </p>
                            )}
                            <span className="text-xs text-zinc-400">•</span>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">
                              {parentRelation.relation}
                            </p>
                          </div>
                        </div>
                        <svg
                          className="w-5 h-5 text-zinc-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {!member.spouse &&
                (!member.parents || member.parents.length === 0) && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-4">
                    No family relations recorded
                  </p>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
