"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import Loading from "@/app/loading";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { IoArrowBackOutline } from "react-icons/io5";
import { MapPin, Calendar, Clock, BookOpen, Heart, Globe, Briefcase, Mail, Phone, ExternalLink, GraduationCap } from "lucide-react";
import { profileService } from "@/services/profile.service";
import UserAvatar from "@/components/common/UserAvatar";
import { formatText } from "@/utils/helpers/formatText";

interface VolunteerDrawerProps {
  volunteerId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function VolunteerDrawer({
  volunteerId,
  isOpen,
  onClose,
}: VolunteerDrawerProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const axiosAuth = useAxiosAuth();

  // Fetch volunteer data
  const {
    data: volunteer,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["volunteerProfile", volunteerId],
    queryFn: () => profileService.getVolunteerProfileById(axiosAuth, volunteerId!),
    enabled: !!volunteerId && isOpen,
  });

  // Close drawer on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!volunteerId) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full bg-card z-50 shadow-2xl w-full md:w-[600px] lg:w-[800px] max-w-[95vw] flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* Header - Sticky inside scroll container */}
          <div className="sticky top-0 bg-card px-6 py-4 flex items-center lg:gap-6 z-20 flex-shrink-0 border-b border-border/50">
            <div className="flex-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="p-2 -ml-2 hover:bg-muted cursor-pointer text-primary transition-colors"
              >
                <IoArrowBackOutline className="text-2xl" />
              </Button>
            </div>

            <div className="lg:w-[300px] lg:flex-shrink-0 flex justify-end">
              <a
                href={`/volunteers/${volunteer?._id || volunteerId}?referrer_url_path=${encodeURIComponent(pathname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Open profile in a new window</span>
              </a>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <Loading size="medium">
                <p className="text-gray-600 mt-2 text-sm">Loading...</p>
              </Loading>
            </div>
          ) : error || !volunteer ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8">
              <p className="text-destructive mb-4 text-sm">Error loading volunteer details</p>
              <Button onClick={onClose} variant="outline" size="sm">
                Close
              </Button>
            </div>
          ) : (
            <div className="px-4 sm:px-6 pb-8 pt-6">
              
              {/* Main Content */}
              <div className="flex flex-col md:flex-row gap-6 mb-8">
                <div className="flex-shrink-0">
                    <UserAvatar 
                        user={volunteer as any} 
                        size={96} 
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border border-border"
                    />
                </div>
                
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight break-words capitalize">
                      {volunteer.user?.name || volunteer.name || "Volunteer"}
                    </h1>
                    {volunteer.is_available && (
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100">
                          Open to Volunteer
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    {volunteer.course && (
                        <div className="flex items-center gap-1.5">
                            <GraduationCap className="w-4 h-4 text-muted-foreground/70" />
                            <span className="font-medium text-foreground/80">{volunteer.course}</span>
                        </div>
                    )}
                    {(volunteer.area || volunteer.state) && (
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-muted-foreground/70" />
                            <span>
                                {[volunteer.area, volunteer.state].filter(Boolean).map(s => formatText(s as string)).join(', ')}
                            </span>
                        </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              {volunteer.bio && (
                <div className="space-y-3 mb-8">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">About</h3>
                  <div 
                    className="prose prose-sm max-w-none text-foreground/90 text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: volunteer.bio }}
                  />
                </div>
              )}

              {/* Skills */}
              {volunteer.skills && volunteer.skills.length > 0 && (
                <div className="space-y-3 mb-8 pt-6 border-t border-border">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {volunteer.skills.map((skill: string, index: number) => (
                        <Badge
                            key={index}
                            variant="secondary"
                            className="bg-primary/5 text-primary hover:bg-primary/10 border-primary/20 px-3 py-1.5 text-xs font-medium rounded-full"
                        >
                            {skill}
                        </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Causes Supported */}
              {volunteer.causes && volunteer.causes.length > 0 && (
                <div className="space-y-3 mb-8 pt-6 border-t border-border">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Causes Supported</h3>
                  <div className="flex flex-wrap gap-2">
                    {volunteer.causes.map((cause: string, index: number) => (
                        <Badge
                            key={index}
                            variant="outline"
                            className="px-3 py-1.5 text-xs font-medium rounded-full"
                        >
                            {cause}
                        </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-border">
                  {volunteer.available_hours_per_week && (
                    <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg border border-border/50">
                        <div className="bg-background p-2 rounded-md shadow-sm border border-border/50">
                            <Clock className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium">Availability</p>
                            <p className="text-sm font-semibold text-foreground mt-0.5">{volunteer.available_hours_per_week} hours/week</p>
                        </div>
                    </div>
                  )}
                  {volunteer.languages && volunteer.languages.length > 0 && (
                    <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg border border-border/50">
                        <div className="bg-background p-2 rounded-md shadow-sm border border-border/50">
                            <Globe className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium">Languages</p>
                            <p className="text-sm font-semibold text-foreground mt-0.5">{volunteer.languages.join(', ')}</p>
                        </div>
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
