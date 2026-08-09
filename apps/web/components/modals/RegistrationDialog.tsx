"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface RegistrationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RegistrationDialog({
  isOpen,
  onOpenChange,
}: RegistrationDialogProps) {
  const handleRegister = () => {
    window.open(
      "https://events.humanitix.com/thriving-in-the-ai-age",
      "_blank"
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="!max-w-[700px] sm:!max-w-[700px] w-[85vw] p-0 overflow-hidden rounded-none !border-0 !outline-0 !shadow-none !bg-transparent gap-0 [&>button]:text-white [&>button>svg]:text-white"
        style={{ maxWidth: '700px', border: 'none', outline: 'none', boxShadow: 'none' }}
      >
        <DialogTitle className="sr-only">Registration</DialogTitle>
        
        {/* Image */}
        <div className="w-full m-0 p-0 leading-none border-0 outline-0">
          <img 
            src="/registrationBanner.jpg" 
            alt="Registration Banner"
            className="w-full h-auto object-contain block m-0 p-0 leading-none border-0 outline-0"
            style={{ display: 'block', verticalAlign: 'bottom', border: 'none', outline: 'none' }}
          />
        </div>
        
        {/* Button Section */}
        <div className="w-full bg-white p-6 flex justify-center m-0 border-0 outline-0">
          <Button
            onClick={handleRegister}
            className="bg-[#1649B8] hover:bg-[#133d9a] text-white font-medium px-12 py-2"
          >
            Register Now →
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
