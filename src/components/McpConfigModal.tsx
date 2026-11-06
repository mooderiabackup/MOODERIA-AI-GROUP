import React, { useState } from 'react';
import { useBrain } from '../context/BrainContext';
import { testMooderiaMcpAuthentication } from '../lib/supabase';
import {
  Terminal,
  X,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Server,
  Lock,
  Activity,
  Cpu,
  Database,
} from 'lucide-react';

export const McpConfigModal: React.FC = () => {
  const {
    selectedMcpSlot,
    setSelectedMcpSlot,
    supabaseStatus,
    registerAccountInSupabase,
    session,
    user,
    setIsAuthModalOpen,
  } = useBrain();

  const [isTesting, setIsTesting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const [feedback, setFeedback] = useState<{
    ok: boolean;
    message: string;
    status?: number;
    serverName?: string | null;
    serverVersion?: string | null;
    protocolVersion?: string | null;
    capabilities?: Record<string, unknown>;
    tools?: Array<{
      name: string;
      description: string;
    }>;
    toolCount?: number;
    sessionIdPresent?: boolean;
  } | null>(null);

  if (!selectedMcpSlot) return null;

  const endpointUrl =
    `${(supabaseStatus.url || 'https://your-supabase-project.supabase.co').replace(/\/$/, '')}/functions/v1/mooderia-mcp`;

  const handleTestAuthentication = async () => {
    setIsTesting(true);
    setFeedback(null);

    try {
      const result = await testMooderiaMcpAuthentication();

      setFeedback({
        ok: result.success,
        message: result.message,
        status: result.status,
        serverName: result.server_name,
        serverVersion: result.server_version,
        protocolVersion: result.protocol_version,
        capabilities: result.capabilities,
        tools: result.tools,
        toolCount: result.tool_count,
        sessionIdPresent: result.session_id_present,
      });
    } catch {
      setFeedback({
        ok: false,
        message: 'MCP initialization and tools verification encountered an unexpected error.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleRegisterAccount = async () => {
    if (!user) {
      setFeedback({
        ok: false,
        message: 'Please sign in with the Main Owner account first.',
      });
      return;
    }

    setIsRegistering(true);
    setFeedback(null);

    try {
      const result = await registerAccountInSupabase(
        selectedMcpSlot.slot_number
      );

      setFeedback({
        ok: result.success,
        message: result.success
          ? `Account "${selectedMcpSlot.account_name}" registered successfully.`
          : result.error || 'Registration failed.',
      });
    } catch {
      setFeedback({
        ok: false,
        message: 'Account registration encountered an error.',
      });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden flex flex-col max-h-[92vh]">

        <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={() => setSelectedMcpSlot(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <Terminal className="w-5 h-5" />
            <span className="text-xs font-bold tracking-widest uppercase text-purple-200">
              MOODERIA MCP • SLOT #{selectedMcpSlot.slot_number}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black">
            {selectedMcpSlot.account_name.toUpperCase()}
          </h2>

          <p className="text-xs text-purple-200 mt-1">
            {selectedMcpSlot.identity_label}
          </p>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">

          <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-100 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-purple-700 shrink-0" />
            <div className="text-xs text-purple-900">
              <p className="font-bold">Authenticated MCP Server Test</p>
              <p className="text-purple-700 mt-1">
                This test uses your existing Supabase session to initialize
                the actual MCP protocol and retrieve the available memory
                tools. Your access token stays inside the application.
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              MOODERIA MCP Endpoint
            </label>

            <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono break-all">
              <Server className="w-4 h-4 text-purple-600 shrink-0" />
              <span>{endpointUrl}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs font-bold text-slate-800">
              Connection status
            </p>

            <p className="text-xs text-slate-600 mt-2">
              Authentication: {session ? 'Signed in' : 'Not signed in'}
            </p>

            <p className="text-xs text-slate-600 mt-2">
              MCP initialization: {feedback?.ok ? 'Successful' : 'Not yet verified'}
            </p>

            <p className="text-xs text-slate-600 mt-2">
              Memory tools: {feedback?.ok && feedback.tools ? `${feedback.toolCount} retrieved` : 'Not yet verified'}
            </p>

            <p className="text-xs text-slate-600 mt-2">
              Claude client connection: Not yet connected
            </p>
          </div>

          {!session && (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Sign in first
            </button>
          )}

          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs flex flex-col gap-2 ${
                feedback.ok
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-900 border border-amber-200'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {feedback.ok ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                {feedback.message}
              </div>

              {feedback.status !== undefined && (
                <p>HTTP status: {feedback.status}</p>
              )}

              {feedback.serverName && (
                <p>Server name: {feedback.serverName}</p>
              )}

              {feedback.serverVersion && (
                <p>Server version: {feedback.serverVersion}</p>
              )}

              {feedback.protocolVersion && (
                <p>Protocol version: {feedback.protocolVersion}</p>
              )}

              {feedback.sessionIdPresent !== undefined && (
                <p>
                  MCP session ID: {feedback.sessionIdPresent ? 'Present' : 'Not provided'}
                </p>
              )}

              {feedback.capabilities && (
                <div className="mt-1">
                  <p className="font-bold mb-1">Server capabilities:</p>
                  <pre className="whitespace-pre-wrap break-all text-[10px]">
                    {JSON.stringify(feedback.capabilities, null, 2)}
                  </pre>
                </div>
              )}

              {feedback.tools && (
                <div className="mt-2 border-t border-emerald-200 pt-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Database className="w-4 h-4" />
                    <p className="font-bold">
                      Registered MCP Memory Tools ({feedback.toolCount})
                    </p>
                  </div>

                  {feedback.tools.length === 0 ? (
                    <p>No tools were returned by the server.</p>
                  ) : (
                    <div className="space-y-3">
                      {feedback.tools.map((tool, index) => (
                        <div
                          key={`${tool.name}-${index}`}
                          className="p-2.5 rounded-lg bg-white/70 border border-emerald-200"
                        >
                          <p className="font-bold break-all">
                            {index + 1}. {tool.name}
                          </p>
                          {tool.description && (
                            <p className="text-[10px] mt-1 opacity-80">
                              {tool.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2">

            <button
              onClick={handleTestAuthentication}
              disabled={isTesting || !session}
              className="w-full py-3 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
              {isTesting ? 'Testing MCP Tools...' : 'Test MCP Initialization & Tools'}
            </button>

            {!selectedMcpSlot.is_registered_in_db && (
              <button
                onClick={handleRegisterAccount}
                disabled={isRegistering}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs disabled:opacity-50"
              >
                {isRegistering ? 'Registering...' : 'Register in Supabase'}
              </button>
            )}

          </div>

          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <Activity className="w-3.5 h-3.5" />
            <span>Server initialization and memory tool discovery are verified separately from Claude client connection.</span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <Cpu className="w-3.5 h-3.5" />
            <span>This test only lists tools. It does not modify stored memories.</span>
          </div>

        </div>
      </div>
    </div>
  );
};