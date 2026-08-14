"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TermsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TermsDialog({ open, onOpenChange }: TermsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Terms and Conditions</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground space-y-4">
          <p>Welcome to our platform! By using our services, you agree to the following terms:</p>

          <h4 className="font-medium text-foreground">1. Account Responsibilities</h4>
          <p>You are responsible for maintaining the confidentiality of your account and password.</p>

          <h4 className="font-medium text-foreground">2. User Conduct</h4>
          <p>You agree not to use the service for any illegal or unauthorized purpose.</p>

          <h4 className="font-medium text-foreground">3. Content Ownership</h4>
          <p>You retain ownership of any content you submit, but grant us a license to use it.</p>

          <h4 className="font-medium text-foreground">4. Termination</h4>
          <p>We may terminate or suspend access to our service immediately, without prior notice.</p>

          <h4 className="font-medium text-foreground">5. Changes to Terms</h4>
          <p>We reserve the right to modify these terms at any time. Continued use constitutes acceptance.</p>

          <p>By clicking &quot;Agree&quot;, you acknowledge that you have read and understood these terms.</p>
        </div>
        <div className="mt-6 flex justify-end">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
