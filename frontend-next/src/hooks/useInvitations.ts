import { useState } from 'react';
import api from '@/lib/axios';

export function useInvitations() {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendInvitation = async (teamId: string, email: string) => {
    if (!teamId || !email)
      return { success: false, error: 'Team and Email are required' };

    setIsSending(true);
    setError(null);
    try {
      await api.post(`/invitations/team/${teamId}/send`, {
        email,
        role: 'MEMBER', // Default role for SaaS invitations
      });
      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to send invitation';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsSending(false);
    }
  };

  return { sendInvitation, isSending, error };
}
