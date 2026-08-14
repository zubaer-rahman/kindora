"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Opportunity } from "@/types/opportunities";
import { OpportunityCard } from "@/components/common";
import SignupModal from "@/components/features/opportunities/SignupModal";
import PublicLayout from "@/components/layout/PublicLayout";
import PublicPageHero from "@/components/features/landing-page/PublicPageHero";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

export default function PublicOpportunitiesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("searchQuery") || undefined;
  const location = searchParams.get("location") || undefined;

  const [currentPage, setCurrentPage] = useState(1);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, location]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.push("/opportunities");
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Fetch public opportunities
  const { data: opportunitiesData, isLoading } = useQuery({
    queryKey: ["publicOpportunities", currentPage, searchQuery, location],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/opportunities/public`,
        {
          params: {
            page: currentPage,
            limit: 9,
            sortBy: "recently_added",
            search: searchQuery,
            location: location,
          },
        },
      );
      return res.data.data;
    },
  });

  const opportunities = (opportunitiesData?.opportunities ||
    []) as unknown as Opportunity[];

  return (
    <PublicLayout>
      <div className="bg-background flex flex-col min-h-screen">
        <main className="flex-1">
          <PublicPageHero
            title="Explore our opportunities"
            description="Discover the latest impact-driven roles and start your mission with Kindora's network of charities and non-profits."
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />

          {/* Opportunities Grid Section */}
          <section className="py-24 md:py-32 bg-muted">
            <div className="container max-w-[1170px] mx-auto px-4 md:px-8">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                  {Array.from({ length: 9 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-[430px] bg-card border border-border rounded-[40px] animate-pulse shadow-sm"
                    />
                  ))}
                </div>
              ) : opportunities.length === 0 ? (
                <div className="text-center py-40 bg-card rounded-[48px] border border-border shadow-xl shadow-foreground/5">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-8">
                    <RotateCcw className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    No results found
                  </h3>
                  <p className="text-muted-foreground text-lg mb-8">
                    We couldn't find any opportunities matching your criteria.
                    Try adjusting your filters.
                  </p>
                  <Button
                    onClick={handleRefresh}
                    className="bg-primary text-primary-foreground px-8 py-6 rounded-full font-bold shadow-lg shadow-primary/20"
                  >
                    Clear all filters
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
                    {opportunities.map((opportunity) => (
                      <div
                        key={opportunity._id}
                        className="transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2"
                      >
                        <OpportunityCard
                          opportunity={opportunity}
                          onCardClick={() =>
                            router.push(`/view/opportunity/${opportunity._id}`)
                          }
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-28 flex flex-col items-center gap-10">
                    <div className="h-1.5 w-24 bg-primary/10 rounded-full" />
                    <div className="text-center space-y-6">
                      <h3 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                        Ready to make an impact?
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto font-medium">
                        Join our growing community of changemakers and start
                        contributing to causes you care about.
                      </p>
                      <Button
                        asChild
                        className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-11 rounded-full text-sm sm:text-base font-semibold shadow-md shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Link href="/signup">Sign Up to Apply Now</Link>
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        </main>

        <SignupModal
          isOpen={isSignupModalOpen}
          onClose={() => setIsSignupModalOpen(false)}
        />
      </div>
    </PublicLayout>
  );
}
