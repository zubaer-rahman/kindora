"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/utils/trpc";
import {
  ArrowLeft,
  MapPin,
  Users,
  Calendar,
  Clock,
  Target,
  ExternalLink,
  Mail,
  Phone,
} from "lucide-react";
import { formatTimeToAMPM } from "@/utils/helpers/formatTime";
import { PostSidebar } from "@/components/layout/shared/PostSidebar";
import { Button } from "@/components/ui/button";
import PublicLayout from "@/components/layout/PublicLayout";
import { motion } from "framer-motion";

export default function PublicOpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: opportunity, isLoading, isError } =
    trpc.opportunities.getPublicOpportunity.useQuery(id, {
      enabled: !!id,
      retry: false,
    });

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="max-w-5xl mx-auto px-4 py-20">
          <div className="h-8 w-32 bg-slate-50 rounded-full animate-pulse mb-8" />
          <div className="h-12 w-3/4 bg-slate-50 rounded-2xl animate-pulse mb-6" />
          <div className="h-4 w-full bg-slate-50 rounded-full animate-pulse mb-3" />
          <div className="h-4 w-5/6 bg-slate-50 rounded-full animate-pulse" />
        </div>
      </PublicLayout>
    );
  }

  if (isError || !opportunity) {
    return (
      <PublicLayout>
        <div className="max-w-2xl mx-auto px-4 py-32 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <ArrowLeft className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-xl text-slate-500 mb-8 font-medium">
            This opportunity is not available or has been removed.
          </p>
          <Button asChild variant="outline" className="rounded-full px-8">
            <Link href="/opportunities">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to listings
            </Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  const org = opportunity.organization_profile as {
    _id: string;
    title?: string;
    profile_img?: string;
    area?: string;
    state?: string;
    contact_email?: string;
    phone_number?: string;
    website?: string;
  } | null;

  return (
    <PublicLayout>
      {/* Dynamic Header */}
      <div className="bg-slate-50 border-b border-slate-100 pt-24 md:pt-28">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="group inline-flex items-center gap-2 text-slate-500 hover:text-primary font-semibold transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-primary/20 group-hover:bg-primary/5 transition-all">
              <ArrowLeft className="w-4 h-4" />
            </div>
            Back to Explore
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-20 flex-1">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
                {opportunity.title}
              </h1>
              {org?.title && (
                <div className="flex items-center gap-3 text-primary font-semibold text-lg">
                  <span className="w-6 h-px bg-primary/30 rounded-full" />
                  {org.title}
                </div>
              )}
            </motion.div>

            {/* Key detail cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: MapPin, label: "Location", value: opportunity.location, color: "text-primary" },
                { 
                  icon: Calendar, 
                  label: "Date", 
                  value: opportunity.date?.start_date ? new Date(opportunity.date.start_date).toLocaleDateString("en-US", {
                    weekday: "short", month: "short", day: "numeric"
                  }) : "Ongoing",
                  color: "text-slate-500" 
                },
                { icon: Users, label: "Positions", value: `${opportunity.number_of_volunteers} volunteers`, color: "text-slate-500" },
                { 
                  icon: Target, 
                  label: "Type", 
                  value: opportunity.commitment_type === "workbased" ? "Work based" : "Event based",
                  color: "text-slate-500"
                }
              ].map((detail, i) => (
                <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-xl hover:shadow-primary/5">
                  <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm ${detail.color}`}>
                    <detail.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">{detail.label}</p>
                    <p className="text-slate-900 font-semibold">{detail.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Quick Links */}
            {(opportunity.email_contact || opportunity.phone_contact) && (
              <div className="flex flex-wrap gap-4 pt-4">
                {opportunity.email_contact && (
                  <Button asChild variant="outline" className="rounded-full px-6 bg-slate-50 hover:bg-primary/5 hover:text-primary transition-all">
                    <a href={`mailto:${opportunity.email_contact}`}>
                      <Mail className="w-4 h-4 mr-2" />
                      {opportunity.email_contact}
                    </a>
                  </Button>
                )}
                {opportunity.phone_contact && (
                  <Button asChild variant="outline" className="rounded-full px-6 bg-slate-50 hover:bg-primary/5 hover:text-primary transition-all">
                    <a href={`tel:${opportunity.phone_contact}`}>
                      <Phone className="w-4 h-4 mr-2" />
                      {opportunity.phone_contact}
                    </a>
                  </Button>
                )}
              </div>
            )}

            {/* Content Sidebar Layout */}
            <div className="space-y-10">
              {/* Description */}
              <div className="prose prose-lg prose-slate max-w-none">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">About this role</h3>
                <div
                  className="leading-relaxed text-slate-600"
                  dangerouslySetInnerHTML={{
                    __html: opportunity.description || "<p>No description provided.</p>",
                  }}
                />
              </div>

              {/* Requirement Pills */}
              <div className="grid md:grid-cols-2 gap-10 pt-8 border-t border-slate-100">
                {(opportunity.category?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Categories</p>
                    <div className="flex flex-wrap gap-2">
                      {(opportunity.category ?? []).map((cat: string, i: number) => (
                        <span key={i} className="px-4 py-2 bg-primary/5 text-primary text-sm rounded-full font-bold">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {(opportunity.required_skills?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Core Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {(opportunity.required_skills ?? []).map((skill: string, i: number) => (
                        <span key={i} className="px-4 py-2 bg-slate-100 text-slate-600 text-sm rounded-full font-bold">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CTA Section */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="p-8 md:p-12 rounded-[40px] bg-slate-900 relative overflow-hidden text-center md:text-left"
            >
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">Ready to make an impact?</h2>
                <p className="text-slate-400 text-lg mb-10 max-w-xl">
                  Sign up today to join Kindora&apos;s network and apply for this opportunity. Start your mission now.
                </p>
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-12 py-8 text-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-primary/30">
                  <Link href={`/login?redirect=/view/opportunity/${id}`}>
                    Join as Volunteer
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          {org && (
            <div className="lg:w-[350px] lg:flex-shrink-0">
              <div className="lg:sticky lg:top-28">
                <PostSidebar
                  organization_profile={
                    org as import("@/server/db/interfaces/organization-profile").IOrgnizationPofile
                  }
                  userRole="volunteer"
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </PublicLayout>
  );
}
