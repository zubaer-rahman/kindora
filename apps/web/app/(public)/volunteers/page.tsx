"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/utils/trpc";
import SignupModal from "@/components/layout/opportunities/SignupModal";
import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import VolunteerCard from "@/components/layout/organisation/VolunteerCard";
import PublicPageHero from "@/components/common/PublicPageHero";
import { RotateCcw } from "lucide-react";

export default function PublicVolunteersPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get("searchQuery") || undefined;
    const location = searchParams.get("location") || undefined;

    const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, location]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.push("/volunteers");
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    const { data: volunteersData, isLoading } =
        trpc.users.getPublicVolunteers.useQuery(
            {
                page: currentPage,
                limit: 9, // Standardized with opportunities
                sortBy: "recently_added",
                search: searchQuery,
                location: location,
            }
        );

    const volunteers = (volunteersData?.users || []) as any[];

    const handleConnect = () => {
        setIsSignupModalOpen(true);
    };

    return (
        <PublicLayout>
            <div className="bg-white flex flex-col min-h-screen">
                <main className="flex-1">
                    <PublicPageHero 
                        title="Meet our volunteers"
                        description="Connect with passionate individuals ready to make a tangible difference in their local NSW communities."
                        onRefresh={handleRefresh}
                        isRefreshing={isRefreshing}
                    />

                    {/* Volunteers Grid Section */}
                    <section className="py-24 md:py-32 bg-slate-50/50">
                        <div className="container max-w-[1170px] mx-auto px-4 md:px-8">
                            {isLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                                    {Array.from({ length: 9 }).map((_, index) => (
                                        <div
                                            key={index}
                                            className="h-[430px] bg-white border border-slate-100 rounded-[40px] animate-pulse shadow-sm"
                                        />
                                    ))}
                                </div>
                            ) : volunteers.length === 0 ? (
                                <div className="text-center py-40 bg-white rounded-[48px] border border-slate-100 shadow-xl shadow-slate-200/50">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                                      <RotateCcw className="w-10 h-10 text-slate-300" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-2">No volunteers found</h3>
                                    <p className="text-slate-500 text-lg mb-8">Try adjusting your search or location to find more amazing people.</p>
                                    <Button 
                                      onClick={handleRefresh}
                                      className="bg-primary text-white px-8 py-6 rounded-full font-bold shadow-lg shadow-primary/20"
                                    >
                                      Clear all filters
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
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

                                    <div className="mt-28 flex flex-col items-center gap-10">
                                        <div className="h-1.5 w-24 bg-primary/10 rounded-full" />
                                        <div className="text-center space-y-6">
                                          <h3 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Expand your impact</h3>
                                          <p className="text-slate-500 max-w-md mx-auto font-medium">Join our growing community and connect with nonprofits that value your unique skills.</p>
                                          <Button
                                              onClick={() => setIsSignupModalOpen(true)}
                                              className="bg-primary hover:bg-primary/95 text-white px-12 h-16 rounded-full text-lg font-bold shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                                          >
                                              Sign Up to Explore More
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
