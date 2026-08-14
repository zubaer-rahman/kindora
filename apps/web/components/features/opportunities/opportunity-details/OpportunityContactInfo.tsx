import { Mail, Phone, ExternalLink } from "lucide-react";

interface OpportunityContactInfoProps {
  emailContact?: string;
  phoneContact?: string;
  externalEventLink?: string;
}

export function OpportunityContactInfo({
  emailContact,
  phoneContact,
  externalEventLink,
}: OpportunityContactInfoProps) {
  if (!emailContact && !phoneContact && !externalEventLink) {
    return null;
  }

  return (
    <div className="space-y-2 pt-2 border-t border-border">
      <p className="text-xs font-medium text-muted-foreground">Contact</p>
      <div className="space-y-1.5">
        {emailContact && (
          <a
            href={`mailto:${emailContact}`}
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 hover:underline"
          >
            <Mail className="w-3.5 h-3.5" />
            <span className="truncate">{emailContact}</span>
          </a>
        )}
        {phoneContact && (
          <a
            href={`tel:${phoneContact}`}
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 hover:underline"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{phoneContact}</span>
          </a>
        )}
        {externalEventLink && (
          <a
            href={externalEventLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="truncate">External Link</span>
          </a>
        )}
      </div>
    </div>
  );
}
