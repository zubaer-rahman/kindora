"use client";

import { useEffect } from "react";
import { MapPin, Globe, Briefcase, Heart, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import Loading from "@/app/loading";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { IoArrowBackOutline } from "react-icons/io5";
import { profileService } from "@/services/profile.service";
import Image from "next/image";
import OrganizationAvatar from "@/components/common/OrganizationAvatar";

interface OrganizationDrawerProps {
  organizationId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrganizationDrawer({
  organizationId,
  isOpen,
  onClose,
}: OrganizationDrawerProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  // Fetch organization data
  const {
    data: fetchResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["organizationProfile", organizationId],
    queryFn: () => profileService.getOrganizationProfileById(axiosAuth, organizationId!),
    enabled: !!organizationId && isOpen,
  });

  const organization = fetchResponse?.organizationProfile;

  // Favorite functionality
  const { data: favoriteData, isLoading: isFavoriteLoading } = useQuery({
      queryKey: ["organizationFavoriteStatus", organizationId],
      queryFn: () => profileService.getFavoriteStatus(axiosAuth, organizationId!),
      enabled: !!session?.user && !!organizationId && isOpen,
  });

  const toggleFavoriteMutation = useMutation({
      mutationFn: (orgId: string) => profileService.toggleFavorite(axiosAuth, orgId),
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["organizationFavoriteStatus", organizationId] });
          queryClient.invalidateQueries({ queryKey: ["favoriteOrganizations"] });
      },
  });

  const isFavorite = favoriteData?.isFavorite;
  const isToggling = toggleFavoriteMutation.isPending;

  const handleFavoriteClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!session) {
          router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
          return;
      }
      if (organizationId) {
          toggleFavoriteMutation.mutate(organizationId);
      }
  };

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

  if (!organizationId) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full bg-card z-50 shadow-2xl w-full md:w-[600px] lg:w-[800px] max-w-[95vw] flex flex-col transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"
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
                href={`/organisations/${organization?._id || organizationId}?referrer_url_path=/search/organizations`}
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
          ) : error || !organization ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8">
              <p className="text-destructive mb-4 text-sm">Error loading organization details</p>
              <Button onClick={onClose} variant="outline" size="sm">
                Close
              </Button>
            </div>
          ) : (
            <div className="px-4 sm:px-6 pb-8 pt-6">
              
              {/* Main Content */}
              <div className="flex flex-col md:flex-row gap-6 mb-8">
                <div className="flex-shrink-0">
                    <OrganizationAvatar 
                        organization={organization} 
                        size={96} 
                        shape="rounded"
                        objectFit="cover"
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border border-border"
                    />
                </div>
                
                <div className="flex-1 min-w-0 space-y-3">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight break-words">
                    {organization.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    {organization.type && (
                      <Badge variant="secondary" className="capitalize">
                          {organization.type.replace('_', ' ')}
                      </Badge>
                    )}
                    {organization.website && (
                        <div className="flex items-center gap-1.5">
                            <Globe className="w-4 h-4 text-muted-foreground/70" />
                            <a href={organization.website.startsWith('http') ? organization.website : `https://${organization.website}`} 
                               target="_blank" 
                               rel="noopener noreferrer"
                               className="hover:text-primary transition-colors hover:underline truncate max-w-[200px]"
                            >
                                {organization.website.replace(/^https?:\/\//, '')}
                            </a>
                        </div>
                    )}
                  </div>
                </div>

                <div className="md:w-auto flex-shrink-0 flex items-start">
                    <Button
                        variant="outline"
                        className="w-full md:w-auto h-10 text-sm border-primary text-primary hover:bg-primary/10 flex items-center justify-center gap-2 font-semibold rounded-full transition-all"
                        onClick={handleFavoriteClick}
                        disabled={isFavoriteLoading || isToggling}
                    >
                        {isFavoriteLoading || isToggling ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                        <Heart
                            className={`h-4 w-4 ${isFavorite ? "fill-primary" : ""}`}
                        />
                        )}
                        <span>{isFavorite ? "Saved" : "Save organization"}</span>
                    </Button>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-3 mb-8">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">About {organization.title}</h3>
                <div 
                  className="prose prose-sm max-w-none text-foreground/90 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: organization.bio || "No description provided." }}
                />
              </div>

              {/* Opportunity Types / Categories */}
              {organization.opportunity_types && organization.opportunity_types.length > 0 && (
                <div className="space-y-3 mb-8 pt-6 border-t border-border">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Opportunity Types</h3>
                  <div className="flex flex-wrap gap-2">
                    {organization.opportunity_types.map((type: string, index: number) => (
                        <Badge
                            key={index}
                            variant="secondary"
                            className="bg-muted text-foreground hover:bg-muted/80 border-none px-3 py-1.5 text-xs font-medium rounded-full"
                        >
                            {type}
                        </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-border">
                  <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg border border-border/50">
                      <div className="bg-background p-2 rounded-md shadow-sm border border-border/50">
                          <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                          <p className="text-xs text-muted-foreground font-medium">Location</p>
                          <p className="text-sm font-medium text-foreground">
                              {organization.area ? `${organization.area}, ` : ""}{organization.state || "Not specified"}
                          </p>
                      </div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg border border-border/50">
                      <div className="bg-background p-2 rounded-md shadow-sm border border-border/50">
                          <Briefcase className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                          <p className="text-xs text-muted-foreground font-medium">Active Opportunities</p>
                          <p className="text-sm font-medium text-foreground">
                              {organization.opportunityCount || 0}
                          </p>
                      </div>
                  </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
}
