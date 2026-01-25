'use client';

import { useState } from 'react';
import { Mail, Send, Loader2, CheckCircle, Users } from 'lucide-react';
import { useTeams } from '@/hooks/useTeams';
import { useInvitations } from '@/hooks/useInvitations';

export default function InvitationsPage() {
  const { teams } = useTeams();
  const { sendInvitation, isSending } = useInvitations();

  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [email, setEmail] = useState('');
  const [sentStatus, setSentStatus] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamId || !email) return;

    const result = await sendInvitation(selectedTeamId, email);
    if (result.success) {
      setSentStatus(true);
      setEmail('');
      setTimeout(() => setSentStatus(false), 3000);
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Mail className="text-blue-600" />
          Invite Team Members
        </h1>
        <p className="text-slate-500">
          Grow your team and collaborate on projects.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <form onSubmit={handleSend} className="space-y-6">
          {/* Team Selection */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Users size={16} /> Select Team
            </label>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              required
            >
              <option value="">Choose a team to invite to...</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Mail size={16} /> Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSending || !selectedTeamId || !email}
            className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-100"
          >
            {isSending ? (
              <Loader2 className="animate-spin" size={20} />
            ) : sentStatus ? (
              <CheckCircle size={20} />
            ) : (
              <Send size={18} />
            )}
            {sentStatus ? 'Invitation Sent!' : 'Send Invitation'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-400 text-center italic">
            Your team member will receive an email with a secure link to join.
          </p>
        </div>
      </div>
    </div>
  );
}
