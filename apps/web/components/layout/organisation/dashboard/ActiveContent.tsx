import { Skeleton } from "@/components/ui/skeleton";
import ActiveContractCard from "./ActiveContractCard";

interface ActiveContract {
  id: string;
  profileImg?: string;
  jobTitle: string;
  freelancerName: string;
  startedAt: string;
  opportunityTitle?: string;
  opportunityId?: string;
  uniqueKey: string;
  opportunities: Array<{
    id: string;
    title: string;
  }>;
}

interface ActiveContentProps {
  activeContracts: ActiveContract[];
  isLoadingRecruited: boolean;
}

const ActiveContent = ({ activeContracts, isLoadingRecruited }: ActiveContentProps) => (
  <div className="space-y-0.5 mb-8">
    {isLoadingRecruited ? (
      <Skeleton className="h-28 w-full" />
    ) : activeContracts.length === 0 ? (
      <div className="text-muted-foreground">No active volunteer contracts.</div>
    ) : (
      activeContracts.map((contract) => (
        <ActiveContractCard
          key={contract.id}
          contract={contract}
        />
      ))
    )}
  </div>
);

export default ActiveContent; 