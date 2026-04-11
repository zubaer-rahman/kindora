'use client';

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";

interface VolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VolunteerModal = ({ isOpen, onClose }: VolunteerModalProps) => {
  const volunteerName = "Tiago Leitao"; // This would come from props in a real implementation
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6">
        <div className="flex flex-col items-center">
          <UserAvatar
            user={{ name: volunteerName }}
            size={96}
            className="h-24 w-24"
          />
          
          <h2 className="mt-4 text-xl font-semibold">{volunteerName}</h2>
          
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>Sydney, Australia</span>
            <Badge variant="secondary" className="ml-2">Available now</Badge>
          </div>

          <div className="flex gap-4 mt-6 w-full">
            <Button className="flex-1" variant="outline">View profile</Button>
            <Button className="flex-1">Hire</Button>
          </div>

          <div className="mt-6 w-full">
            <h3 className="text-sm font-semibold mb-2">About volunteer</h3>
            <p className="text-sm text-gray-600">
              Being a student and passionate about protecting our environment, I believe in combining my academic knowledge with practical action. Volunteering not only helps me contribute to the betterment of our planet, but it also allows me to learn, grow, and connect with like-minded individuals who share the same goals.
            </p>
          </div>

          <div className="mt-6 w-full">
            <h3 className="text-sm font-semibold mb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Communication</Badge>
              <Badge variant="secondary">Leadership</Badge>
              <Badge variant="secondary">Teamwork</Badge>
            </div>
          </div>

          <div className="mt-6 w-full">
            <h3 className="text-sm font-semibold mb-2">Location</h3>
            <p className="text-sm text-gray-600">21 Darling Dr, Sydney, Australia</p>
            <p className="text-sm text-gray-600 mt-1">ABN - 43 625 460 915</p>
          </div>

          <div className="mt-6 w-full text-sm text-gray-500">
            <p>Member since June 4, 2024</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VolunteerModal;