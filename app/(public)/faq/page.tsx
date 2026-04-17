"use client";

import FAQSection from "../../../components/layout/landing/faq/FAQSection";
import FAQHero from "../../../components/layout/landing/faq/FAQHero";
import RegistrationBannerNew from "../../../components/layout/landing/home/RegistrationBannerNew";
import PublicLayout from "@/components/layout/PublicLayout";

const KINDORAFAQs = [
  {
    question: "What's KINDORA?",
    answer:
      "KINDORA is a specialized platform focused on volunteer opportunities across Australia. It connects organizations with dedicated individuals who want to make a tangible difference in their local communities.",
  },
  {
    question: "How can I get involved?",
    answer:
      "While specific requirements vary by opportunity, most KINDORA positions are open to individuals 18 years or older who are legally eligible to volunteer. You can simply create an account, complete your profile, and start applying.",
  },
  {
    question: "Can I choose my volunteer type?",
    answer:
      "Absolutely! Our matching system takes into account your specific skills, interests, and availability to suggest the most relevant opportunities. You can also use advanced filters to explore different sectors.",
  },
  {
    question: "How do I message organizations?",
    answer:
      "Once you've applied for an opportunity, you can communicate directly with organization managers through our secure integrated messaging dashboard. It's the central hub for all your coordination.",
  },
  {
    question: "Will I receive recognition for my service?",
    answer:
      "Yes. You will receive a summary of your volunteer hours and organizations can provide specialized certificates or endorsements upon completion of their programs.",
  },
];

export default function FAQPage() {
  return (
    <PublicLayout>
      <FAQHero />
      
      <div className="container max-w-[1170px] mx-auto px-4 md:px-8 py-20 md:py-32">
        <div className="flex flex-col md:flex-row gap-16 md:gap-24">
          <div className="md:w-1/3">
             <div className="sticky top-32">
               <h2 className="text-3xl font-bold text-slate-900 mb-6 tracking-tight">Platform Support</h2>
               <p className="text-slate-500 font-medium leading-relaxed mb-8">
                 Get answers to the most frequently asked questions about the Kindora platform and how to make the most of your volunteering journey.
               </p>
               <div className="h-1.5 w-16 bg-primary rounded-full" />
             </div>
          </div>
          <div className="md:w-2/3">
            <FAQSection title="" faqs={KINDORAFAQs} />
          </div>
        </div>
      </div>

      <RegistrationBannerNew />
    </PublicLayout>
  );
}
