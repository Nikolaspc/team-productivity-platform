'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@/core/schemas/auth.schema';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import Link from 'next/link';

export default function LoginPage() {
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      // English: Standard login request to the NestJS BFF
      const response = await api.post('/auth/signin', data);

      if (response.status === 200 || response.status === 201) {
        const { user, access_token, accessToken } = response.data;
        const token = access_token || accessToken;

        // English: Store data in global state if available
        if (user && token) {
          setAuth(user, token);
        }

        toast.success('Login Successful! Redirecting...');

        // English: Hard redirect to force Next.js Middleware to read the new cookies
        // This solves the "stuck on login" issue you're seeing in Safari
        window.location.assign('/dashboard');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Invalid credentials';
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg border border-slate-100 text-slate-900">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold">TeamFlow</h2>
          <p className="text-slate-500 text-sm mt-2">
            Login with admin@test.com
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              {...register('email')}
              type="email"
              placeholder="Email"
              className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <input
              {...register('password')}
              type="password"
              placeholder="Password"
              className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
