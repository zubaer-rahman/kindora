"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loading from "@/app/loading";

const SearchPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      const role = session.user.role;
      if (role === "volunteer") {
        router.replace("/search/opportunities");
      } else {
        router.replace("/search/volunteers");
      }
    } else if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [session, status, router]);

  return <Loading />;
};

export default SearchPage;
