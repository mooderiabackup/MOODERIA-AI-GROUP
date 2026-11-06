
import React, { useEffect, useState } from 'react';
import { getSupabaseClient } from '../lib/supabase';

type ConsentDetails = {
  authorization_id: string;
  client: {
    name: string;
    description?: string;
  };
  redirect_uri: string;
  scope: string;
};

export const OAuthConsentPage: React.FC = () => {
  const [authorizationId] = useState(
    () => new URLSearchParams(window.location.search).get('authorization_id')
  );

  const [details, setDetails] = useState<ConsentDetails | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const supabase = getSupabaseClient();

  useEffect(() => {
    if (!supabase || !authorizationId) {
      setError(
        !authorizationId
          ? 'Missing authorization request ID.'
          : 'Supabase is not configured.'
      );
      setLoading(false);
      return;
    }

    let active = true;

    const loadDetails = async () => {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!active) return;

      if (!sessionData.session) {
        setLoading(false);
        return;
      }

      const { data, error: detailsError } =
        await supabase.auth.oauth.getAuthorizationDetails(authorizationId);

      if (!active) return;

      if (detailsError || !data) {
        setError(detailsError?.message || 'Could not load authorization details.');
        setLoading(false);
        return;
      }

      if (!('authorization_id' in data)) {
        window.location.replace(data.redirect_url);
        return;
      }

      setDetails(data as ConsentDetails);
      setError('');
      setLoading(false);
    };

    loadDetails();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          loadDetails();
        } else {
          setDetails(null);
        }
      }
    );

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase, authorizationId]);

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!supabase) return;

    setBusy(true);
    setError('');

    const { error: signInError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    setBusy(false);

    if (signInError) {
      setError(signInError.message);
    }
  };

  const handleDecision = async (decision: 'approve' | 'deny') => {
    if (!supabase || !authorizationId) return;

    setBusy(true);
    setError('');

    const result =
      decision === 'approve'
        ? await supabase.auth.oauth.approveAuthorization(authorizationId)
        : await supabase.auth.oauth.denyAuthorization(authorizationId);

    if (result.error) {
      setError(result.error.message);
      setBusy(false);
      return;
    }

    window.location.assign(result.data.redirect_url);
  };

  const scopes = details?.scope
    ? details.scope.split(' ').filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl">
        <div className="text-center mb-6">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center text-2xl">
            🧠
          </div>

          <h1 className="text-2xl font-black text-slate-900 mt-4">
            MOODERIA AI GROUP
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Secure AI Brain Authorization
          </p>
        </div>

        {loading ? (
          <p className="text-center text-sm text-slate-500">
            Loading authorization...
          </p>
        ) : details ? (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Authorize application
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                This application is requesting access to your Supabase account.
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4">
              <p className="text-xs text-purple-600 font-bold uppercase">
                Requesting application
              </p>

              <p className="font-bold text-slate-900 mt-1">
                {details.client.name}
              </p>

              {details.client.description && (
                <p className="text-sm text-slate-600 mt-1">
                  {details.client.description}
                </p>
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-slate-700 mb-2">
                Requested permissions
              </p>

              {scopes.length ? (
                <ul className="space-y-2">
                  {scopes.map((scope) => (
                    <li
                      key={scope}
                      className="text-sm text-slate-700 flex gap-2"
                    >
                      <span className="text-emerald-600">✓</span>
                      {scope}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">
                  No additional scopes requested.
                </p>
              )}
            </div>

            <div className="text-xs text-slate-500 break-all">
              Redirect destination: {details.redirect_uri}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleDecision('deny')}
                disabled={busy}
                className="flex-1 rounded-xl border border-slate-300 py-3 text-sm font-bold text-slate-700 disabled:opacity-50"
              >
                Deny
              </button>

              <button
                onClick={() => handleDecision('approve')}
                disabled={busy}
                className="flex-1 rounded-xl bg-purple-700 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                {busy ? 'Processing...' : 'Approve'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSignIn} className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              Sign in to continue
            </h2>

            <p className="text-sm text-slate-600">
              Sign in using an authorized MOODERIA Supabase account.
            </p>

            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email address"
              className="w-full border border-slate-300 rounded-xl p-3 text-sm"
            />

            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              className="w-full border border-slate-300 rounded-xl p-3 text-sm"
            />

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-purple-700 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              {busy ? 'Signing in...' : 'Sign in securely'}
            </button>
          </form>
        )}

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <p className="text-center text-xs text-slate-400 mt-6">
          MOODERIA AI GROUP · Secure Authorization
        </p>
      </div>
    </div>
  );
};
