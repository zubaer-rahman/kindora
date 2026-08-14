import { Calendar, Users, Target } from "lucide-react";
import { formatTimeToAMPM } from "@/utils/helpers/formatTime";

interface OpportunityInfoGridProps {
  date?: { start_date?: string | Date };
  time?: { start_time?: string };
  numberOfVolunteers?: number;
  commitmentType?: string;
}

export function OpportunityInfoGrid({
  date,
  time,
  numberOfVolunteers,
  commitmentType,
}: OpportunityInfoGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 py-4 border-t border-border">
      {date?.start_date && (
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground/70 flex-shrink-0" />
          <span className="text-foreground/80">
            {new Date(date.start_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
            {time?.start_time && ` ${formatTimeToAMPM(time.start_time)}`}
          </span>
        </div>
      )}

      {numberOfVolunteers !== undefined && (
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-muted-foreground/70 flex-shrink-0" />
          <span className="text-foreground/80 font-medium">
            {numberOfVolunteers} spots
          </span>
        </div>
      )}

      {commitmentType && (
        <div className="flex items-center gap-2 text-sm">
          <Target className="w-4 h-4 text-muted-foreground/70 flex-shrink-0" />
          <span className="text-foreground/80">
            {commitmentType === "workbased" ? "Work based" : "Event based"}
          </span>
        </div>
      )}
    </div>
  );
}
