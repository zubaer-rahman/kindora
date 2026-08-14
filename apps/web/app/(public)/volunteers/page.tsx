"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import SignupModal from "@/components/features/opportunities/SignupModal";
import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import VolunteerCard from "@/components/features/organization/VolunteerCard";
import PublicPageHero from "@/components/features/landing-page/PublicPageHero";
import { RotateCcw } from "lucide-react";

export default function PublicVolunteersPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get("searchQuery") || undefined;
    const location = searchParams.get("location") || undefined;

    const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

     useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, location]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.push("/volunteers");
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    const { data: volunteersData, isLoading } = useQuery({
        queryKey: ['publicVolunteers', currentPage, searchQuery, location],
        queryFn: async () => {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/users/public/volunteers`, {
                params: {
                    page: currentPage,
                    limit: 9, // Standardized with opportunities
                    sortBy: "recently_added",
                    search: searchQuery,
                    location: location,
                }
            });
            return res.data.data;
        }
    });

    const volunteers = (volunteersData?.users || []) as any[];

    const handleConnect = () => {
        setIsSignupModalOpen(true);
    };

    return (
        <PublicLayout>
            <div className="bg-background flex flex-col min-h-screen text-foreground">
                <main className="flex-1">
                    <PublicPageHero 
                        title="Meet our volunteers"
                        description="Connect with passionate individuals ready to make a tangible difference in their local NSW communities."
                        onRefresh={handleRefresh}
                        isRefreshing={isRefreshing}
                    />

                    {/* Volunteers Grid Section */}
                    <section className="py-12 sm:py-16 md:py-24 lg:py-32 bg-muted/30">
                        <div className="container max-w-[1170px] mx-auto px-4 md:px-8">
                            {isLoading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
                                    {Array.from({ length: 9 }).map((_, index) => (
                                        <div
                                            key={index}
                                            className="h-[340px] bg-card border border-border rounded-xl animate-pulse shadow-sm"
                                        />
                                    ))}
                                </div>
                            ) : volunteers.length === 0 ? (
                                <div className="text-center py-16 sm:py-24 md:py-32 lg:py-40 bg-card rounded-2xl sm:rounded-3xl md:rounded-[48px] border border-border shadow-xl shadow-foreground/5 px-4 sm:px-6">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
                                      <RotateCcw className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">No volunteers found</h3>
                                    <p className="text-muted-foreground text-base sm:text-lg mb-6 sm:mb-8">Try adjusting your search or location to find more amazing people.</p>
                                    <Button 
                                      onClick={handleRefresh}
                                      className="bg-primary text-primary-foreground px-6 sm:px-8 py-5 sm:py-6 rounded-full font-bold shadow-lg shadow-primary/20"
                                    >
                                      Clear all filters
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
                                        {volunteers.map((volunteer) => (
                                            <div key={volunteer._id} className="transition-transform duration-500 hover:scale-[1.03] hover:-translate-y-2">
                                                <VolunteerCard
                                                    volunteer={volunteer}
                                                    onConnect={handleConnect}
                                                    onCardClick={() => setIsSignupModalOpen(true)}
                                                    isPublic={true}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-16 sm:mt-20 md:mt-28 flex flex-col items-center gap-6 sm:gap-8 md:gap-10 px-4">
                                        <div className="h-1.5 w-24 bg-primary/10 rounded-full" />
                                        <div className="text-center space-y-4 sm:space-y-6">
                                          <h3 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Expand your impact</h3>
                                          <p className="text-muted-foreground max-w-md mx-auto font-medium text-sm sm:text-base">Join our growing community and connect with nonprofits that value your unique skills.</p>
                                          <Button
                                              asChild
                                              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-11 rounded-full text-sm sm:text-base font-semibold shadow-md shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                          >
                                              <Link href="/signup?role=organisation">
                                                  Sign Up to Explore More
                                              </Link>
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
