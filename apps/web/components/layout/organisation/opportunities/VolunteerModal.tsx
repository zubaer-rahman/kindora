'use client';

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import UserAvatar from "@/components/ui/UserAvatar";

export interface Volunteer {
  id: string;
  name: string;
  profileImg: string;
  location: string;
  bio: string;
  skills: string[];
  completedProjects: number;
  availability: string;
  applicationId: string;
}

interface VolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
  volunteer: Volunteer | null;
}

const VolunteerModal = ({ isOpen, onClose, volunteer }: VolunteerModalProps) => {
  const router = useRouter();

  if (!volunteer) return null;

  const handleSendMessage = () => {
    router.push(`/messaging?userId=${volunteer.id}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6">
        <div className="flex flex-col">
          <div className="relative w-24 h-24">
            <UserAvatar
              user={volunteer}
              size={96}
              className="rounded-full"
            />
          </div>
          
          <h2 className="mt-4 text-xl font-semibold">{volunteer.name}</h2>
          
          <div className="flex items-center gap-2 mt-2">
            <span className="text-gray-600">{volunteer.location}</span>
            <span className="text-green-600">{volunteer.availability}</span>
          </div>

          <div className="flex gap-2 mt-4">
            {volunteer.skills.map((skill) => (
              <span
                key={skill}
                className="text-xs bg-gray-100 px-2 py-1 rounded"
              >
                {skill}
              </span>
            ))}
          </div>

          <p className="text-sm text-gray-600 mt-4">{volunteer.bio}</p>

          <div className="flex gap-4 mt-6">
            <Button className="flex-1 bg-blue-600 text-white" variant="outline">View full profile</Button>
            <Button 
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900"
              onClick={handleSendMessage}
            >
              Send message
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VolunteerModal;