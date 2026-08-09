"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { trpc } from "@/utils/trpc";
import {
  ArrowLeft,
  MapPin,
  Heart,
  GraduationCap,
  Calendar,
  Clock,
  Globe,
  BookOpen,
  User,
  Briefcase,
  ChevronRight,
  Target,
} from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import { Badge } from "@/components/ui/badge";
import RandomAvatar from "@/components/ui/random-avatar";
import { motion } from "framer-motion";

const isPlaceholder = (val: string | null | undefined): boolean =>
  !val || val.trim() === "" || val.trim().toLowerCase() === "to be updated";

function getStudentStatusDisplay(profile: {
  is_currently_studying?: string | null;
  non_student_type?: string | null;
  student_type?: string | null;
}): string | null {
  if (profile.is_currently_studying === "yes") return "Currently Studying";
  if (profile.is_currently_studying === "no") {
    const t = profile.non_student_type;
    if (t === "staff") return "Staff Member";
    if (t === "alumni") return "Alumni";
    if (t === "general_public" || t === "general") return "General Public";
    return "Not Currently Studying";
  }
  if (profile.student_type === "yes") return "Student";
  if (profile.student_type === "no") return "Non-Student";
  return null;
}

function formatAvailabilityTime(t: { start_time?: string; end_time?: string } | null): string | null {
  if (!t || (!t.start_time && !t.end_time)) return null;
  if (t.start_time && t.end_time) return `${t.start_time} – ${t.end_time}`;
  return t.start_time || t.end_time || null;
}

function formatAvailabilityDate(d: { start_date?: string; end_date?: string } | null): string | null {
  if (!d || (!d.start_date && !d.end_date)) return null;
  if (d.start_date && d.end_date) return `${d.start_date} to ${d.end_date}`;
  return d.start_date || d.end_date || null;
}

export default function PublicMentorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: profile, isLoading, isError } =
    trpc.mentorProfile.getPublicMentorProfile.useQuery(
      { userId: id },
      { enabled: !!id, retry: false }
    );

  const { data: opportunities = [] } =
    trpc.opportunities.getPublicOpportunitiesByMentor.useQuery(
      { userId: id },
      { enabled: !!id && !!profile }
    );

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-20">
          <div className="h-8 w-24 bg-slate-50 rounded-full animate-pulse mb-8" />
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-[320px] h-[450px] rounded-[32px] border border-slate-100 bg-slate-50 animate-pulse shadow-sm" />
            <div className="flex-1 space-y-8 pt-4">
              <div className="h-14 w-2/3 bg-slate-50 rounded-2xl animate-pulse" />
              <div className="h-6 w-1/3 bg-slate-50 rounded-full animate-pulse" />
              <div className="h-40 w-full bg-slate-50 rounded-[32px] animate-pulse" />
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (isError || !profile) {
    return (
      <PublicLayout>
        <div className="max-w-2xl mx-auto px-4 py-32 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <User className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-xl text-slate-500 mb-8 font-medium">
            This mentor profile is not available or has been removed.
          </p>
          <Link
            href="/"
            className="text-primary font-bold hover:underline py-2"
          >
            Back to home
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const locationParts = [profile.area, profile.state, profile.postcode]
    .filter((v): v is string => !isPlaceholder(v));
  const locationStr = locationParts.length > 0 ? locationParts.join(", ") : null;
  const studentStatus = getStudentStatusDisplay(profile);
  const availabilityDateStr = formatAvailabilityDate(profile.availability_date);
  const availabilityTimeStr = formatAvailabilityTime(profile.availability_time);
  const hasEducation =
    studentStatus ||
    profile.university ||
    profile.graduation_year ||
    profile.course ||
    profile.major ||
    profile.major_other ||
    profile.study_area ||
    profile.home_country;
  const hasAvailability =
    profile.is_available != null ||
    availabilityDateStr ||
    availabilityTimeStr;

  return (
    <PublicLayout>
      {/* Consistent Header */}
      <div className="bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="group inline-flex items-center gap-3 text-slate-500 hover:text-primary font-semibold transition-all"
          >
            <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-primary/20 group-hover:bg-primary/5 transition-all shadow-sm">
              <ArrowLeft className="w-4 h-4" />
            </div>
            Back to Profile
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20 flex-1 w-full">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Sidebar Profiler */}
          <aside className="lg:w-[320px] lg:flex-shrink-0">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:sticky lg:top-28 space-y-8 p-8 rounded-[40px] border border-slate-100 bg-white shadow-xl shadow-slate-200/50"
            >
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 rounded-[32px] overflow-hidden bg-slate-100 ring-4 ring-white shadow-xl flex-shrink-0">
                  {profile.image ? (
                    <Image
                      src={profile.image}
                      alt={profile.name}
                      fill
                      className="object-cover"
                      sizes="128px"
                      unoptimized={profile.image.startsWith("http")}
                    />
                  ) : (
                    <RandomAvatar
                      name={profile.name}
                      size={128}
                      className="w-full h-full"
                    />
                  )}
                </div>
                <h2 className="mt-6 text-2xl font-bold text-slate-900 text-center">
                  {profile.name}
                </h2>
                <div className="mt-2 bg-primary/5 text-primary px-4 py-1.5 rounded-full text-sm font-bold border border-primary/10 tracking-wide uppercase">
                  {profile.role}
                </div>
              </div>

              {/* Fast Bio / Tags */}
              <div className="space-y-6 pt-4 border-t border-slate-100">
                {studentStatus && (
                  <p className="text-sm text-slate-500 flex items-center gap-3 font-semibold">
                    <User className="w-4 h-4 text-primary/50" />
                    {studentStatus}
                  </p>
                )}
                {locationStr && (
                  <div className="flex items-center gap-3 text-slate-500 text-sm font-semibold">
                    <MapPin className="w-4 h-4 text-primary/50" />
                    <span>{locationStr}</span>
                  </div>
                )}
                {profile.country && !isPlaceholder(profile.country) && (
                  <div className="flex items-center gap-3 text-slate-500 text-sm font-semibold">
                    <Globe className="w-4 h-4 text-primary/50" />
                    <span>{profile.country}</span>
                  </div>
                )}
              </div>

              {profile.interested_on && profile.interested_on.length > 0 && (
                <div className="pt-6 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-400" />
                    Interests
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.interested_on.map((interest: string, i: number) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="bg-primary/5 text-primary border-none px-3 py-1 text-[11px] font-bold rounded-full group hover:bg-primary hover:text-white transition-all cursor-default"
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {profile.interested_categories && profile.interested_categories.length > 0 && (
                <div className="pt-6 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    Focus Areas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.interested_categories.map((cat: string, i: number) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="bg-slate-100 text-slate-600 border-none px-3 py-1 text-[11px] font-bold rounded-full hover:bg-slate-200 transition-all cursor-default"
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {hasAvailability && (
                <div className="pt-6 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-green-400" />
                    Availability
                  </h3>
                  <ul className="space-y-3 text-slate-600 text-sm font-semibold">
                    {profile.is_available != null && (
                      <li className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${profile.is_available ? 'bg-green-500' : 'bg-red-400'}`} />
                        {profile.is_available ? "Accepting connections" : "Fully booked"}
                      </li>
                    )}
                    {availabilityDateStr && (
                      <li className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{availabilityDateStr}</span>
                      </li>
                    )}
                    {availabilityTimeStr && (
                      <li className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>{availabilityTimeStr}</span>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </motion.div>
          </aside>

          {/* Main content: About + Education + Experience */}
          <div className="flex-1 min-w-0 space-y-16">
            {/* Hero Bio */}
            <motion.section 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="pb-12 border-b border-slate-100"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight leading-tight">
                About <span className="text-primary italic underline underline-offset-8 decoration-primary/20">{profile.name}</span>
              </h1>
              <div className="prose prose-lg prose-slate max-w-none">
                <p className="text-xl text-slate-600 leading-relaxed font-medium">
                  {profile.bio && !isPlaceholder(profile.bio) 
                    ? profile.bio 
                    : "A dedicated mentor focused on community impact and professional growth within the Kindora network."}
                </p>
              </div>
            </motion.section>

            {/* Education Highlight */}
            {hasEducation && (
              <section className="bg-slate-50 p-10 md:p-12 rounded-[40px] border border-slate-100">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    <GraduationCap className="w-4 h-4 text-primary" />
                  </div>
                  Academic Background
                </h2>
                <div className="grid sm:grid-cols-2 gap-x-12 gap-y-10">
                  {[
                    { label: "University", value: profile.university, icon: Globe },
                    { label: "Course", value: profile.course, icon: BookOpen },
                    { label: "Major", value: profile.major, icon: Target },
                    { label: "Graduation", value: profile.graduation_year, icon: Calendar }
                  ].filter(stat => stat.value && !isPlaceholder(stat.value)).map((stat, i) => (
                    <div key={i} className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 mb-1">
                        <stat.icon className="w-4 h-4 text-primary/40" />
                        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">{stat.label}</span>
                      </div>
                      <span className="text-lg font-bold text-slate-800 leading-tight">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Opportunities (Experience) */}
            {opportunities.length > 0 && (
              <section className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm">
                      <Briefcase className="w-4 h-4 text-primary" />
                    </div>
                    Recent Opportunities
                  </h2>
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{opportunities.length} Total</span>
                </div>

                <div className="grid gap-6">
                  {(opportunities as unknown as Array<{ _id: string; title: string; organization_profile?: { title?: string }; location?: string }>).map((opp, idx) => (
                    <motion.div
                      key={opp._id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Link
                        href={`/view/opportunity/${opp._id}`}
                        className="flex items-center justify-between gap-6 p-8 rounded-[32px] border border-slate-100 bg-white hover:bg-slate-50 hover:border-primary/20 hover:shadow-2xl transition-all duration-500 group"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-primary font-bold uppercase tracking-widest mb-2">{opp.location || "On-site"}</p>
                          <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors truncate">
                            {opp.title}
                          </h3>
                          {opp.organization_profile?.title && (
                            <p className="text-base text-slate-500 mt-1 font-semibold truncate capitalize opacity-70">
                              {opp.organization_profile.title}
                            </p>
                          )}
                        </div>
                        <div className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                          <ChevronRight className="w-6 h-6" />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </PublicLayout>
  );
}
