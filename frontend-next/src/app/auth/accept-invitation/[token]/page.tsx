'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle, Users } from 'lucide-react';
import api from '@/lib/axios';

export default function AcceptInvitationPage() {
  const { token } = useParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  );
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const verifyInvitation = async () => {
      try {
        // English: API call to accept the invitation using the token from URL
        await api.post(`/invitations/accept/${token}`);
        setStatus('success');
        // English: Redirect to dashboard after 3 seconds
        setTimeout(() => router.push('/dashboard'), 3000);
      } catch (err: any) {
        setStatus('error');
        setErrorMsg(
          err.response?.data?.message || 'Invalid or expired invitation token.',
        );
      }
    };

    if (token) verifyInvitation();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center">
        {status === 'loading' && (
          <div className="space-y-4">
            <Loader2 className="mx-auto animate-spin text-blue-600" size={48} />
            <h1 className="text-xl font-bold text-slate-800">
              Verifying Invitation...
            </h1>
            <p className="text-slate-500">
              Please wait while we set up your access.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="mx-auto bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center">
              <CheckCircle2 size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">
              Welcome to the Team!
            </h1>
            <p className="text-slate-500">
              Invitation accepted successfully. Redirecting you to your
              dashboard...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="mx-auto bg-red-100 text-red-600 w-16 h-16 rounded-full flex items-center justify-center">
              <XCircle size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">
              Invitation Failed
            </h1>
            <p className="text-slate-500">{errorMsg}</p>
            <button
              onClick={() => router.push('/login')}
              className="mt-4 w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition-all"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
