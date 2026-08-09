"use client";

import FAQAccordion from './FAQAccordion';
import { motion } from "framer-motion";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title: string;
  faqs: FAQItem[];
}

export default function FAQSection({ title, faqs }: FAQSectionProps) {
  return (
    <div className="mb-20 bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-slate-100">
      <div className="flex flex-col items-center mb-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">{title}</h2>
        <div className="h-1.5 w-16 bg-primary/20 rounded-full" />
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        {faqs.map((faq, index) => (
          <FAQAccordion
            key={index}
            question={faq.question}
            answer={faq.answer}
          />
        ))}
      </motion.div>
    </div>
  );
}