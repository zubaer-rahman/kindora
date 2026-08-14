"use client";

import { useParams, useRouter } from "next/navigation";
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
} from "lucide-react";
import { formatTimeToAMPM } from "@/utils/helpers/formatTime";
import { PostSidebar } from "@/components/features/shared/PostSidebar";
import { Button } from "@/components/ui/button";
import SignupModal from "@/components/features/opportunities/SignupModal";
import PublicLayout from "@/components/layout/PublicLayout";
import { motion } from "framer-motion";
import BackButton from "@/components/buttons/BackButton";

export default function PublicOpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  const {
    data: opportunity,
    isLoading,
    isError,
  } = useQuery({
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

  /* ---------- Loading ---------- */
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

  /* ---------- Error / Not found ---------- */
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
      value:
        opportunity.commitment_type === "workbased"
          ? "Work based"
          : "Event based",
      color: "text-muted-foreground",
    },
  ];

  return (
    <PublicLayout>
      <main className="max-w-[1170px] mt-8 mx-auto px-4 md:px-8 py-12  md:py-20 flex-1">
        <BackButton
          buttonText="Back to Explore"
          className="sticky top-24 z-50"
        />
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-w-0 space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-2xl md:text-5xl font-semibold text-foreground mb-4 tracking-tight">
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
              {detailCards.map((detail, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-5 rounded-2xl bg-muted/30 border border-border transition-all hover:bg-card hover:shadow-xl hover:shadow-primary/5"
                >
                  <div
                    className={`w-10 h-10 rounded-xl bg-background flex items-center justify-center shadow-sm ${detail.color}`}
                  >
                    <detail.icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">
                      {detail.label}
                    </p>
                    <p className="text-foreground font-semibold break-words">
                      {detail.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact quick links */}
            {(opportunity.email_contact || opportunity.phone_contact) && (
              <div className="flex flex-wrap gap-4 pt-4">
                {opportunity.email_contact && (
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-full px-6 bg-muted/50 border-border hover:bg-primary/5 hover:text-primary"
                  >
                    <a href={`mailto:${opportunity.email_contact}`}>
                      <Mail className="w-4 h-4 mr-2" />
                      {opportunity.email_contact}
                    </a>
                  </Button>
                )}
                {opportunity.phone_contact && (
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-full px-6 bg-muted/50 border-border hover:bg-primary/5 hover:text-primary"
                  >
                    <a href={`tel:${opportunity.phone_contact}`}>
                      <Phone className="w-4 h-4 mr-2" />
                      {opportunity.phone_contact}
                    </a>
                  </Button>
                )}
              </div>
            )}

            {/* Description */}
            <div className="prose prose-lg max-w-none">
              <h3 className="text-2xl font-bold text-foreground mb-6">
                About this role
              </h3>
              <div
                className="leading-relaxed text-muted-foreground"
                dangerouslySetInnerHTML={{
                  __html:
                    opportunity.description ||
                    "<p>No description provided.</p>",
                }}
              />
            </div>

            {/* Categories & Skills */}
            <div className="grid md:grid-cols-2 gap-10 pt-8 border-t border-border">
              {(opportunity.category?.length ?? 0) > 0 && (
                <div>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">
                    Categories
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(opportunity.category ?? []).map(
                      (cat: string, i: number) => (
                        <span
                          key={i}
                          className="px-4 py-2 bg-primary/5 text-primary text-sm rounded-full font-bold"
                        >
                          {cat}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              )}
              {(opportunity.required_skills?.length ?? 0) > 0 && (
                <div>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">
                    Core Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(opportunity.required_skills ?? []).map(
                      (skill: string, i: number) => (
                        <span
                          key={i}
                          className="px-4 py-2 bg-muted text-foreground text-sm rounded-full font-bold"
                        >
                          {skill}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-8 md:p-12 rounded-[40px] bg-card border border-border text-center md:text-left"
            >
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 tracking-tight">
                  Ready to make an impact?
                </h2>
                <p className="text-muted-foreground text-lg mb-10 max-w-xl">
                  Sign up today to join Kindora's network and apply for this
                  opportunity. Start your mission now.
                </p>
                <Button
                  size="lg"
                  onClick={() => setIsSignupOpen(true)}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-11 rounded-full text-sm sm:text-base font-semibold shadow-md shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Join as Volunteer
                </Button>
              </div>
            </motion.div>
          </div>

           {org && (
            <div className="w-full lg:w-[320px] flex-shrink-0">
              <div className="lg:sticky lg:top-6">
                <PostSidebar
                  organization_profile={
                    org as unknown as import("@/server/db/interfaces/organization-profile").IOrgnizationPofile
                  }
                  userRole="volunteer"
                  className="lg:w-[320px]"
                />
              </div>
            </div>
          )}
        </div>
      </main>

      <SignupModal
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
      />
    </PublicLayout>
  );
}
