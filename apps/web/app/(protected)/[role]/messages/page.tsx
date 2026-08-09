'use client'
import MessageUI from "@/components/layout/messages/MessageUI";
import ProtectedLayout from "@/components/layout/ProtectedLayout";
import { useSearchParams } from "next/navigation";
import React from "react";

export default function Page() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  return (
    <ProtectedLayout> 
      <div className="w-full h-[calc(100vh-2rem)] sm:h-[calc(100vh-4rem)] max-w-7xl mx-auto p-2 sm:p-4 lg:p-6 overflow-hidden">
        <div className="w-full h-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <MessageUI initialUserId={userId} />
        </div>
      </div>
    </ProtectedLayout>
  );
}
