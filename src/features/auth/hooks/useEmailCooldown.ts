import { useEffect, useMemo, useState } from 'react';

type Result = {
  cooldownSeconds: number;
  startCooldown: (seconds: number) => void;
  canSend: boolean;
};

export function useEmailCooldown(): Result {
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const id = window.setInterval(() => {
      setCooldownSeconds((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [cooldownSeconds]);

  const startCooldown = (seconds: number) => setCooldownSeconds(Math.max(0, seconds));

  const canSend = useMemo(() => cooldownSeconds <= 0, [cooldownSeconds]);

  return { cooldownSeconds, startCooldown, canSend };
}
