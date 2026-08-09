import React from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { MapPin, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function HomePageSuggestions() {
  const opportunities = [
    {
      id: 1,
      title: "Seek help",
      organization: "All In",
      location: "Sydney, Australia",
      type: "Regular",
      matchingAvailability: true,
      matchedSkills: 3,
      categories: ["Human Rights", "Health & Medicine"],
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore...",
      logoSrc: "/v1.svg",
    },
    {
      id: 2,
      title: "Environmental Champions Needed!",
      organization: "Red Cross",
      location: "Sydney, Australia",
      type: "Regular",
      matchingAvailability: true,
      matchedSkills: 3,
      categories: ["Disaster Relief", "Emergency & Safety"],
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore...",
      logoSrc: "/v2.svg",
    },
    {
      id: 3,
      title: "Community Support",
      organization: "All In",
      location: "Sydney, Australia",
      type: "Regular",
      matchingAvailability: true,
      matchedSkills: 3,
      categories: ["Education & Literacy"],
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore...",
      logoSrc: "/v3.svg",
    },
  ];

  return (
    <div className='flex flex-col mx-auto max-w-[1380px] pt-20 px-2 sm:px-4'>
      <div className='w-full rounded-xl h-auto min-h-[400px] md:h-[380px]' style={{ background: 'radial-gradient(96.44% 77.84% at 76.32% 16.97%, #6D91D3 0%, #29997A 100%)' }}>
        <div className='flex flex-col h-full'>
          <div className='flex items-center'>
            <div className='flex items-center gap-1 px-2 bg-[#00000026] h-[30px] md:h-[35px] rounded-md'>
              <Image src="/star.svg" alt="Star icon" width={16} height={16} className="md:w-[18px] md:h-[18px]" />
              <span className='text-white text-xs md:text-sm font-medium'>Highly recommended</span>
            </div>
          </div>
          
          <div className='flex flex-col md:flex-row gap-4 md:gap-6 px-3 md:px-8 flex-1'>
            <div className='hidden md:flex flex-col justify-end w-[200px]'>
              <Image
                src="/ForYou.svg"
                alt="Suggested content"
                width={200}
                height={100}
                className="rounded-lg object-cover -ml-8"
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 flex-1 pb-6'>
              {opportunities.map((opportunity, index) => (
                <Card key={index} className="bg-white rounded-xl overflow-hidden shadow-none">
                  <div className="p-2 md:p-3">
                    <div className="flex items-center mb-1.5">
                      <div className="w-6 h-6 md:w-8 md:h-8 mr-2">
                        <Image
                          src={opportunity.logoSrc}
                          alt={opportunity.organization}
                          width={32}
                          height={32}
                          className="rounded-full w-full h-full"
                        />
                      </div>
                      <h3 className="text-sm md:text-base font-semibold line-clamp-1">{opportunity.title}</h3>
                    </div>

                    <div className="flex items-center text-[10px] md:text-xs text-gray-500 mb-1.5">
                      <MapPin className="w-3 h-3 mr-1 text-blue-500" />
                      <span>{opportunity.location}</span>
                      <Badge variant="outline" className="ml-2 px-1.5 py-0.5 text-[10px] md:text-xs">
                        {opportunity.type}
                      </Badge>
                    </div>

                    <div className="flex space-x-2 md:space-x-3 mb-2">
                      <div className="flex items-center text-[10px] md:text-xs text-green-600">
                        <div className="w-3 h-3 md:w-4 md:h-4 mr-1">
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-500">
                            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <span className="hidden sm:inline">Matching availability</span>
                        <span className="sm:hidden">Matching</span>
                      </div>

                      <div className="flex items-center text-[10px] md:text-xs text-orange-600">
                        <div className="w-3 h-3 md:w-4 md:h-4 mr-1">
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-orange-500">
                            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <span>{opportunity.matchedSkills} matched skills</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-2">
                      {opportunity.categories.slice(0, 1).map((category, idx) => (
                        <Badge key={idx} variant="secondary" className="text-[10px] md:text-xs font-normal">
                          {category}
                        </Badge>
                      ))}
                      {opportunity.categories.length > 1 && (
                        <Badge variant="secondary" className="text-[10px] md:text-xs font-normal text-gray-500">
                          +{opportunity.categories.length - 1} more
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs md:text-sm text-gray-600 mb-2 line-clamp-2 md:line-clamp-3">
                      {opportunity.description}
                    </p>
                  </div>

                  <div className="flex justify-between items-center px-2 pb-2">
                    <div className="flex gap-1 md:gap-1.5 items-center">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white h-6 md:h-7 text-[10px] md:text-xs px-2 md:px-3">
                        Apply now
                      </Button>
                      <Button variant="ghost" size="icon" className="text-yellow-400 h-6 w-6 md:h-7 md:w-7">
                        <Star className="h-3 w-3 md:h-4 md:w-4 fill-current" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}