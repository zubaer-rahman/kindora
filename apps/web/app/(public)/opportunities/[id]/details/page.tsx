"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  MapPin,
  Users,
  Calendar,
  Clock,
  Target,
  Mail,
  Phone,
  UserPlus,
} from "lucide-react";
import BackButton from "@/components/buttons/BackButton";
import { formatTimeToAMPM } from "@/utils/helpers/formatTime";
import { PostSidebar } from "@/components/features/shared/PostSidebar";
import { Button } from "@/components/ui/button";
import SignupModal from "@/components/features/opportunities/SignupModal";

import PublicLayout from "@/components/layout/PublicLayout";
import { motion } from "framer-motion";

export default function PublicOpportunityDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [signupModalContext, setSignupModalContext] = useState<"join" | "view-profile" | null>(null);

  const { data: opportunity, isLoading, isError } = useQuery({
    queryKey: ["publicOpportunity", id],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/opportunities/public/${id}`,
      );
      return res.data.data;
    },
    enabled: !!id,
    retry: false,
  });

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="max-w-5xl mx-auto px-4 py-20">
          <div className="h-8 w-32 bg-muted rounded-full animate-pulse mb-8" />
          <div className="h-12 w-3/4 bg-muted rounded-2xl animate-pulse mb-6" />
          <div className="h-4 w-full bg-muted rounded-full animate-pulse mb-3" />
          <div className="h-4 w-5/6 bg-muted rounded-full animate-pulse" />
        </div>
      </PublicLayout>
    );
  }

  if (isError || !opportunity) {
    return (
      <PublicLayout>
        <div className="max-w-2xl mx-auto px-4 py-32 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
            <ArrowLeft className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-xl text-muted-foreground mb-8 font-medium">
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

  const detailCards = [
    {
      icon: MapPin,
      label: "Location",
      value: opportunity.location || "Location not specified",
      color: "text-primary",
    },
    {
      icon: Calendar,
      label: "Date",
      value: opportunity.date?.start_date
        ? new Date(opportunity.date.start_date).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })
        : "Ongoing",
      color: "text-muted-foreground",
    },
    {
      icon: Users,
      label: "Positions",
      value: `${opportunity.number_of_volunteers} volunteers`,
      color: "text-muted-foreground",
    },
    {
      icon: Clock,
      label: "Time",
      value: opportunity.time?.start_time
        ? formatTimeToAMPM(opportunity.time.start_time)
        : "Not specified",
      color: "text-muted-foreground",
    },
    {
      icon: Target,
      label: "Type",
      value: opportunity.commitment_type === "workbased" ? "Work based" : "Event based",
      color: "text-muted-foreground",
    },
  ];

  return (
    <PublicLayout>
      <div className="max-w-[1170px] mx-auto px-4 md:px-8 pt-32 md:pt-36 pb-16">

        {/* Back button */}
        <BackButton buttonText="Back to Explore" fallbackUrl="/opportunities" />

        {/* Title + org/location */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 tracking-tight leading-tight">
            {opportunity.title}
          </h1>
          {(org?.title || opportunity.location) && (
            <div className="flex flex-wrap items-center gap-2 mt-2 text-muted-foreground">
              {org?.title && (
                <span className="font-semibold text-primary text-base">{org.title}</span>
              )}
              {org?.title && opportunity.location && (
                <span className="text-muted-foreground/40 text-base">·</span>
              )}
              {opportunity.location && (
                <span className="flex items-center gap-1 text-sm">
                  <MapPin className="w-3.5 h-3.5" />
                  {opportunity.location}
                </span>
              )}
            </div>
          )}
        </motion.div>

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-12 lg:items-start">

          {/* Scrollable details */}
          <div className="flex-1 min-w-0 space-y-10">

          {/* Detail cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {detailCards.map((detail, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border transition-colors hover:bg-card"
                >
                  <div className={`w-9 h-9 rounded-lg bg-background flex items-center justify-center shadow-sm flex-shrink-0 ${detail.color}`}>
                    <detail.icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-0.5">
                      {detail.label}
                    </p>
                    <p className="text-sm text-foreground font-semibold break-words leading-snug">{detail.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {(opportunity.email_contact || opportunity.phone_contact) && (
              <div className="flex flex-wrap gap-4">
                {opportunity.email_contact && (
                  <Button asChild variant="outline" className="rounded-full px-6 bg-muted/50 border-border hover:bg-primary/5 hover:text-primary">
                    <a href={`mailto:${opportunity.email_contact}`}>
                      <Mail className="w-4 h-4 mr-2" />
                      {opportunity.email_contact}
                    </a>
                  </Button>
                )}
                {opportunity.phone_contact && (
                  <Button asChild variant="outline" className="rounded-full px-6 bg-muted/50 border-border hover:bg-primary/5 hover:text-primary">
                    <a href={`tel:${opportunity.phone_contact}`}>
                      <Phone className="w-4 h-4 mr-2" />
                      {opportunity.phone_contact}
                    </a>
                  </Button>
                )}
              </div>
            )}

            <div className="prose prose-sm sm:prose-base max-w-none dark:prose-invert">
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4">About this role</h3>
              <div
                className="leading-relaxed text-muted-foreground text-sm sm:text-base"
                dangerouslySetInnerHTML={{
                  __html: opportunity.description || "<p>No description provided.</p>",
                }}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-6 pt-6 border-t border-border">
              {(opportunity.category?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Categories</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(opportunity.category ?? []).map((cat: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-primary/5 text-primary text-xs rounded-full font-semibold">{cat}</span>
                    ))}
                  </div>
                </div>
              )}
              {(opportunity.required_skills?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Core Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(opportunity.required_skills ?? []).map((skill: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-muted text-foreground text-xs rounded-full font-semibold">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CTA banner */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 sm:p-8 md:p-10 rounded-3xl bg-card border border-border"
            >
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-2 tracking-tight">
                Ready to make an impact?
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base mb-6 max-w-md">
                Sign up today to join Kindora's network and apply for this opportunity.
              </p>
              <Button
                asChild
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-7 h-10 rounded-full text-sm font-semibold shadow-md shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Link href="/signup">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Join as Volunteer
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Sticky sidebar */}
          {org && (
            <aside className="w-full lg:w-[300px] xl:w-[320px] flex-shrink-0">
              <div className="lg:sticky lg:top-28 p-6 rounded-3xl border border-border bg-card shadow-sm">
                <PostSidebar
                  organization_profile={
                    org as unknown as import("@/types/api/organization-profile").IOrgnizationPofile
                  }
                  userRole="volunteer"
                  onViewProfileClick={() => setSignupModalContext("view-profile")}
                  className="w-full"
                />
              </div>
            </aside>
          )}
        </div>
      </div>

      <SignupModal
        isOpen={signupModalContext !== null}
        onClose={() => setSignupModalContext(null)}
        context={signupModalContext}
      />
    </PublicLayout>
  );
}
