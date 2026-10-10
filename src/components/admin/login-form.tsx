'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState, type FormEvent } from 'react';
import { Eye, EyeOff, Loader2, ShieldCheck, ArrowLeft, MailCheck } from 'lucide-react';
import { getSupabaseBrowser } from '@/lib/supabase/client';

export function AdminLoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const handleSignIn = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);

      const trimmedEmail = email.trim();

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        setError('Please enter a valid email address.');
        return;
      }

      if (password.length < 6) {
        setError('Please enter your password.');
        return;
      }

      setLoading(true);
      try {
        const supabase = getSupabaseBrowser();
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

        if (signInError) {
          setError(
            signInError.message === 'Invalid login credentials'
              ? 'Invalid email or password.'
              : signInError.message,
          );
          return;
        }

        router.push('/admin');
        router.refresh();
      } catch {
        setError('Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [email, password, router],
  );

  const handleForgotPassword = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);
      setResetSent(false);

      const trimmedEmail = email.trim();

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        setError('Please enter a valid email address.');
        return;
      }

      setLoading(true);
      try {
        const supabase = getSupabaseBrowser();
        const redirectUrl = `${window.location.origin}/api/auth/callback?next=/admin/reset-password`;
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
          redirectTo: redirectUrl,
        });

        if (resetError) {
          setError(resetError.message);
          return;
        }

        setResetSent(true);
      } catch {
        setError('Failed to send reset email. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [email],
  );

  const inputClass =
    'w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20';

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 dark:bg-zinc-800 text-amber-500">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
              {mode === 'login' ? 'Admin Sign In' : 'Reset Password'}
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              {mode === 'login'
                ? 'Authorized PROEDGE staff only.'
                : 'Enter your admin email to receive a recovery link.'}
            </p>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleSignIn} className="space-y-4" noValidate>
              <div>
                <label
                  htmlFor="admin-email"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300"
                >
                  Email
                </label>
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@proedge.lk"
                  className={inputClass}
                  disabled={loading}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="admin-password"
                    className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError(null);
                    }}
                    className="text-xs font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="admin-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputClass}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {error ? (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-300"
                >
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 dark:bg-amber-500 px-6 py-3.5 text-sm font-black uppercase tracking-wider text-white dark:text-zinc-950 transition-all hover:bg-amber-600 dark:hover:bg-amber-400 hover:text-zinc-950 focus:ring-2 focus:ring-amber-500/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {resetSent ? (
                <div className="text-center py-4 space-y-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                    <MailCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 dark:text-white">Check your email</h3>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      We sent a recovery link to <strong>{email}</strong>. Click the link in the email to choose a new password.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setResetSent(false);
                      setError(null);
                    }}
                    className="inline-flex items-center gap-2 text-xs font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4" noValidate>
                  <div>
                    <label
                      htmlFor="reset-email"
                      className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300"
                    >
                      Admin Email
                    </label>
                    <input
                      id="reset-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@proedge.lk"
                      className={inputClass}
                      disabled={loading}
                    />
                  </div>

                  {error ? (
                    <div
                      role="alert"
                      className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-300"
                    >
                      {error}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 dark:bg-amber-500 px-6 py-3.5 text-sm font-black uppercase tracking-wider text-white dark:text-zinc-950 transition-all hover:bg-amber-600 dark:hover:bg-amber-400 hover:text-zinc-950 focus:ring-2 focus:ring-amber-500/40 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending link…
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setError(null);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Back to Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}