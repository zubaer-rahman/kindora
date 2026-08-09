import { useState } from "react";
import { ChevronDown, ChevronUp, Calendar, Clock } from "lucide-react";

const workshops = [
  {
    id: 1,
    title: "Workshop 1",
    date: "Saturday, 10 August",
    time: "10AM - 4PM",
    details: [
      "Start your KINDORA journey!",
      "Learn about the power of volunteering!",
      "Delve deeper into exploring your purpose and values.",
      "Develop networking and relationship building skills to explore volunteering opportunities."
    ]
  },
  {
    id: 2,
    title: "Workshop 2",
    date: "Saturday, 24 August",
    time: "10AM - 4PM",
    details: [
      "Explore how to grow into an inspiring leader in your community.",
      "Learn about intelligence and explore different communication and work styles in Australia.",
      "Engage with a panel of leading experts in non-profit fields."
    ]
  },
  {
    id: 3,
    title: "Workshop 3",
    date: "Saturday, 14 September",
    time: "10AM - 4PM",
    details: [
      "Celebrate your completion of the KINDORA program!",
      "Understand the role of volunteers in creating inclusive communities and making a real difference."
    ]
  }
];

export default function WorkshopOverview() {
  const [openWorkshops, setOpenWorkshops] = useState<number[]>([]);

  const toggleWorkshop = (id: number): void => {
    setOpenWorkshops((prev) =>
      prev.includes(id) ? prev.filter((workshopId) => workshopId !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h2 className="text-2xl font-semibold mb-6">Workshop Overview</h2>
      <div className="space-y-4">
        {workshops.map((workshop) => (
          <div key={workshop.id} className="border-b pb-4">
            <button
              className="w-full flex justify-between items-center text-blue-600 text-lg font-medium"
              onClick={() => toggleWorkshop(workshop.id)}
            >
              {workshop.title}
              {openWorkshops.includes(workshop.id) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            <div className="text-[#101010] mt-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> {workshop.date}
            </div>
            <div className="text-[#101010] mt-1 flex items-center gap-2">
              <Clock className="w-4 h-4" /> {workshop.time}
            </div>
            {openWorkshops.includes(workshop.id) && (
              <div className="mt-4 text-[#101010]">
                <h3 className="font-semibold">About the workshop</h3>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {workshop.details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Apply Now Button */}
      <div className="mt-7 flex justify-center">
       
      </div>
    </div>
  );
}
