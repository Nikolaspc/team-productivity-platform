'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, SignupFormData } from '@/core/schemas/auth.schema';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      await api.post('/auth/signup', {
        name: data.name,
        email: data.email,
        password: data.password,
      });
      toast.success('Account created successfully!');
      router.push('/auth/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg border border-slate-100 text-slate-900">
        <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            {...register('name')}
            placeholder="Name"
            className="w-full p-2 border rounded"
          />
          <input
            {...register('email')}
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded"
          />
          <input
            {...register('password')}
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded"
          />
          <input
            {...register('confirmPassword')}
            type="password"
            placeholder="Confirm Password"
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700"
          >
            Register
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
