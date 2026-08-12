"use client";

import { useEffect, useState } from "react";
import { checkEmailUniqueness } from "@/lib/auth-api";

export function useEmailUniqueness(email: string | undefined) {
  const [isTaken, setIsTaken] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const value = email?.trim();
    if (!value) {
      setIsTaken(false);
      setIsChecking(false);
      return;
    }

    const controller = new AbortController();
    setIsChecking(true);

    const timeoutId = setTimeout(async () => {
      try {
        const taken = await checkEmailUniqueness(value, controller.signal);
        if (!controller.signal.aborted) setIsTaken(taken);
      } catch {
        if (!controller.signal.aborted) setIsTaken(false);
      } finally {
        if (!controller.signal.aborted) setIsChecking(false);
      }
    }, 350);

    return () => {
      controller.abort();
      setIsChecking(false);
      clearTimeout(timeoutId);
    };
  }, [email]);

  return { isTaken, isChecking };
}
