"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { toast } from "react-hot-toast";

import { RosterTab } from "./RosterTab";
import type { Volunteer, Shift } from "./rosterUtils";
import { rosterService } from "@/services/roster.service";

interface RosterTabContainerProps {
  opportunityId: string;
  role: "organiser" | "volunteer";
  recruits: Volunteer[];
  canAccessRoster: boolean;
  onUpdateShiftCount?: (count: number) => void;
}

export function RosterTabContainer({
  opportunityId,
  role,
  recruits,
  canAccessRoster,
  onUpdateShiftCount,
}: RosterTabContainerProps) {
  const { data: session } = useSession();
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const [rosterShifts, setRosterShifts] = useState<Shift[]>([]);

  const invalidateRoster = () => {
    queryClient.invalidateQueries({ queryKey: ["rosterShifts", opportunityId] });
  };

  const { data: rosterShiftsFromDb } = useQuery({
    queryKey: ["rosterShifts", opportunityId],
    queryFn: () => rosterService.getShiftsForOpportunity(axiosAuth, opportunityId),
    enabled: !!opportunityId && !!canAccessRoster,
  });

  useEffect(() => {
    if (rosterShiftsFromDb) {
      setRosterShifts(rosterShiftsFromDb as unknown as Shift[]);
      if (onUpdateShiftCount) {
        onUpdateShiftCount((rosterShiftsFromDb as unknown as Shift[]).length);
      }
    }
  }, [rosterShiftsFromDb, onUpdateShiftCount]);

  const createShiftMutation = useMutation({
    mutationFn: (payload: any) => rosterService.createShift(axiosAuth, payload),
    onSuccess: invalidateRoster,
  });

  const updateShiftMutation = useMutation({
    mutationFn: (payload: any) => rosterService.updateShift(axiosAuth, payload.shiftId, payload),
    onSuccess: invalidateRoster,
  });

  const deleteShiftMutation = useMutation({
    mutationFn: (payload: { shiftId: string }) => rosterService.deleteShift(axiosAuth, payload.shiftId),
    onSuccess: invalidateRoster,
  });

  const assignVolunteerMutation = useMutation({
    mutationFn: (payload: { shiftId: string; volunteerId: string }) =>
      rosterService.assignVolunteer(axiosAuth, payload.shiftId, payload.volunteerId),
    onSuccess: invalidateRoster,
  });

  const unassignVolunteerMutation = useMutation({
    mutationFn: (payload: { shiftId: string; volunteerId: string }) =>
      rosterService.removeVolunteer(axiosAuth, payload.shiftId, payload.volunteerId),
    onSuccess: invalidateRoster,
  });

  const updateVolunteerStatusMutation = useMutation({
    mutationFn: (payload: any) =>
      rosterService.updateShiftStatus(axiosAuth, payload.shiftId, payload.status),
    onSuccess: invalidateRoster,
  });

  const signupForShiftMutation = useMutation({
    mutationFn: (payload: { shiftId: string }) =>
      rosterService.signupShift(axiosAuth, payload.shiftId),
    onSuccess: invalidateRoster,
  });

  const withdrawFromShiftMutation = useMutation({
    mutationFn: (payload: { shiftId: string }) =>
      rosterService.withdrawShift(axiosAuth, payload.shiftId),
    onSuccess: invalidateRoster,
  });

  return (
    <RosterTab
      postId={opportunityId}
      role={role}
      recruits={recruits}
      shifts={rosterShifts}
      currentUserId={session?.user?.id}
      onShiftCreate={(data) => {
        const newShift: Shift = {
          ...data,
          id: `shift-${Date.now()}`,
          assignedVolunteers: [],
        };
        setRosterShifts((prev) => {
          const updated = [...prev, newShift];
          if (onUpdateShiftCount) onUpdateShiftCount(updated.length);
          return updated;
        });
        createShiftMutation.mutate({
          opportunityId,
          title: data.title,
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          role: data.role,
          maxVolunteers: data.maxVolunteers,
        });
      }}
      onShiftUpdate={(shiftId, data) => {
        setRosterShifts((prev) =>
          prev.map((s) => (s.id === shiftId ? { ...s, ...data } : s))
        );
        updateShiftMutation.mutate({
          shiftId,
          title: (data as any).title,
          date: (data as any).date,
          startTime: (data as any).startTime,
          endTime: (data as any).endTime,
          role: (data as any).role,
          maxVolunteers: (data as any).maxVolunteers,
        });
      }}
      onUpdateVolunteerStatus={(shiftId, volunteerId, status) => {
        setRosterShifts((prev) =>
          prev.map((s) => {
            if (s.id !== shiftId) return s;
            return {
              ...s,
              assignedVolunteers: s.assignedVolunteers.map((v) =>
                v.id === volunteerId ? { ...v, status } : v
              ),
            };
          })
        );
        updateVolunteerStatusMutation.mutate({
          shiftId,
          volunteerId,
          status: status as any,
        });
      }}
      onAssign={(shiftId, volunteerId) => {
        setRosterShifts((prev) =>
          prev.map((s) => {
            if (s.id !== shiftId) return s;
            const volunteer = recruits.find((r) => r.id === volunteerId);
            if (
              !volunteer ||
              s.assignedVolunteers.some((v) => v.id === volunteerId)
            )
              return s;
            return {
              ...s,
              assignedVolunteers: [
                ...s.assignedVolunteers,
                { ...volunteer, status: "pending" as const },
              ],
            };
          })
        );
        assignVolunteerMutation.mutate({ shiftId, volunteerId });
      }}
      onUnassign={(shiftId, volunteerId) => {
        setRosterShifts((prev) =>
          prev.map((s) =>
            s.id === shiftId
              ? {
                ...s,
                assignedVolunteers: s.assignedVolunteers.filter(
                  (v) => v.id !== volunteerId
                ),
              }
              : s
          )
        );
        unassignVolunteerMutation.mutate({ shiftId, volunteerId });
      }}
      onSignup={(shiftId) => {
        if (!session?.user?.id) return;
        const userName = session.user.name ?? "Me";
        const me: Volunteer = {
          id: session.user.id,
          name: userName,
          initials: userName
            .split(" ")
            .map((w: string) => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 2),
          skills: [],
          status: "pending",
        };
        setRosterShifts((prev) =>
          prev.map((s) => {
            if (s.id !== shiftId) return s;
            if (s.assignedVolunteers.some((v) => v.id === me.id)) return s;
            if (s.assignedVolunteers.length >= s.maxVolunteers) return s;
            return { ...s, assignedVolunteers: [...s.assignedVolunteers, me] };
          })
        );
        signupForShiftMutation.mutate({ shiftId });
      }}
      onWithdraw={(shiftId) => {
        if (!session?.user?.id) return;
        const userId = session.user.id;
        setRosterShifts((prev) =>
          prev.map((s) =>
            s.id === shiftId
              ? {
                ...s,
                assignedVolunteers: s.assignedVolunteers.filter(
                  (v) => v.id !== userId
                ),
              }
              : s
          )
        );
        withdrawFromShiftMutation.mutate({ shiftId });
      }}
      onDeleteShift={(shiftId) => {
        setRosterShifts((prev) => {
          const updated = prev.filter((s) => s.id !== shiftId);
          if (onUpdateShiftCount) onUpdateShiftCount(updated.length);
          return updated;
        });
        deleteShiftMutation.mutate({ shiftId });
      }}
      onExport={() => toast.success("Roster export coming soon")}
      onSendReminders={() => toast.success("Reminders sent!")}
    />
  );
}
