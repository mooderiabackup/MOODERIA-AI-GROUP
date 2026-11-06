
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export function getSupabaseCredentials(): {
  url: string;
  anonKey: string;
  isConfigured: boolean;
} {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

  const localUrl =
    typeof window !== 'undefined'
      ? localStorage.getItem('mooderia_supabase_url') || ''
      : '';

  const localKey =
    typeof window !== 'undefined'
      ? localStorage.getItem('mooderia_supabase_key') || ''
      : '';

  const url = (localUrl || envUrl).trim();
  const anonKey = (localKey || envKey).trim();

  const isConfigured = Boolean(url && anonKey && /^https:\/\/.+/.test(url));

  return { url, anonKey, isConfigured };
}

let cachedClient: SupabaseClient | null = null;
let cachedConfigKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseCredentials();

  if (!isConfigured) return null;

  const currentKey = `${url}::${anonKey}`;

  if (cachedClient && cachedConfigKey === currentKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

    cachedConfigKey = currentKey;
    return cachedClient;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
}

export async function testSupabaseConnection(
  url: string,
  anonKey: string
) {
  try {
    const testClient = createClient(url, anonKey, {
      auth: { persistSession: false },
    });

    const checks = [
      ['memories', testClient.from('memories').select('id').limit(1)],
      ['ai_accounts', testClient.from('ai_accounts').select('id, account_name').limit(1)],
      ['projects', testClient.from('projects').select('id, name').limit(1)],
      ['memory_access_logs', testClient.from('memory_access_logs').select('id, action, created_at').limit(1)],
      ['brain_members', testClient.from('brain_members').select('id, role').limit(1)],
      ['decisions', testClient.from('decisions').select('id, title').limit(1)],
      ['profiles', testClient.from('profiles').select('owner_id').limit(1)],
      ['memory_versions', testClient.from('memory_versions').select('id').limit(1)],
    ] as const;

    const results = await Promise.all(
      checks.map(async ([table, query]) => {
        const { error } = await query;

        return {
          table,
          success: !error,
          error: error?.message || null,
        };
      })
    );

    return {
      success: results.every((result) => result.success),
      results,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Network error',
    };
  }
}

export async function pingMcpEdgeFunction(
  _accountName: string,
  accessToken?: string
) {
  const { url, anonKey, isConfigured } = getSupabaseCredentials();

  if (!isConfigured) {
    return {
      ok: false,
      status: 0,
      message: 'Supabase URL is not configured',
    };
  }

  if (!accessToken) {
    return {
      ok: false,
      status: 0,
      message: 'An authenticated session is required',
    };
  }

  const endpoint = `${url.replace(/\/$/, '')}/functions/v1/ai-brain-api`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: anonKey,
      },
    });

    return {
      ok: response.ok,
      status: response.status,
      message: response.ok
        ? `AI Brain API reachable (HTTP ${response.status})`
        : `AI Brain API returned HTTP ${response.status}`,
    };
  } catch (error: any) {
    return {
      ok: false,
      status: 0,
      message: error?.message || 'AI Brain API unreachable',
    };
  }
}

export async function rpcRegisterBrainAccount(params: {
  authUserId: string;
  accountName: string;
  provider?: string;
}) {
  const client = getSupabaseClient();

  if (!client) throw new Error('Supabase client not configured');

  const { data, error } = await client.rpc('register_brain_account', {
    p_auth_user_id: params.authUserId,
    p_account_name: params.accountName,
    p_provider: params.provider || 'Claude',
  });

  if (error) throw new Error(`Account registration failed: ${error.message}`);

  return data;
}

export async function rpcSaveMemory(params: {
  category: string;
  content: string;
  title: string;
  tags?: string[];
  importance?: number;
  project_id?: string | null;
  source_account_id?: string | null;
}) {
  const client = getSupabaseClient();

  if (!client) throw new Error('Supabase client not configured');

  const { data, error } = await client.rpc('save_memory', {
    p_category: params.category,
    p_title: params.title,
    p_content: params.content,
    p_tags: params.tags ?? [],
    p_importance: params.importance ?? 3,
    p_project_id: params.project_id ?? null,
    p_source_account_id: params.source_account_id ?? null,
  });

  if (error) throw new Error(`Memory save failed: ${error.message}`);

  return data;
}

export async function rpcSearchMemory(params: {
  query: string;
  category?: string | null;
  projectId?: string | null;
  limit?: number;
}) {
  const client = getSupabaseClient();

  if (!client) throw new Error('Supabase client not configured');

  const { data, error } = await client.rpc('search_memory', {
    p_query: params.query,
    p_category: params.category ?? null,
    p_project_id: params.projectId ?? null,
    p_limit: params.limit ?? 10,
  });

  if (error) throw new Error(`Memory search failed: ${error.message}`);

  return data;
}

export async function rpcGetMemory(memoryId: string) {
  const client = getSupabaseClient();

  if (!client) throw new Error('Supabase client not configured');

  const { data, error } = await client.rpc('get_memory', {
    p_memory_id: memoryId,
  });

  if (error) throw new Error(`Get memory failed: ${error.message}`);

  return data;
}

export async function rpcUpdateMemory(params: {
  memoryId: string;
  title: string;
  content: string;
  category?: string | null;
  tags?: string[] | null;
  importance?: number | null;
}) {
  const client = getSupabaseClient();

  if (!client) throw new Error('Supabase client not configured');

  const { data, error } = await client.rpc('update_memory', {
    p_memory_id: params.memoryId,
    p_title: params.title,
    p_content: params.content,
    p_category: params.category ?? null,
    p_tags: params.tags ?? null,
    p_importance: params.importance ?? null,
  });

  if (error) throw new Error(`Memory update failed: ${error.message}`);

  return data;
}

export async function rpcDeleteMemory(memoryId: string) {
  const client = getSupabaseClient();

  if (!client) throw new Error('Supabase client not configured');

  const { data, error } = await client.rpc('delete_memory', {
    p_memory_id: memoryId,
  });

  if (error) throw new Error(`Memory deletion failed: ${error.message}`);

  return data;
}

export async function rpcRestoreMemory(memoryId: string) {
  const client = getSupabaseClient();

  if (!client) throw new Error('Supabase client not configured');

  const { data, error } = await client.rpc('restore_memory', {
    p_memory_id: memoryId,
  });

  if (error) throw new Error(`Memory restoration failed: ${error.message}`);

  return data;
}

export async function rpcGetMemoryHistory(
  memoryId: string,
  limit = 20
) {
  const client = getSupabaseClient();

  if (!client) throw new Error('Supabase client not configured');

  const { data, error } = await client.rpc('get_memory_history', {
    p_memory_id: memoryId,
    p_limit: limit,
  });

  if (error) throw new Error(`Memory history failed: ${error.message}`);

  return data;
}

export async function rpcCurrentBrainOwner(): Promise<string> {
  const client = getSupabaseClient();

  if (!client) throw new Error('Supabase client not configured');

  const { data, error } = await client.rpc('current_brain_owner');

  if (error) throw new Error(`Could not resolve brain owner: ${error.message}`);

  if (!data) throw new Error('No brain owner is available for this session');

  return data as string;
}

export async function rpcHasBrainAccess(
  targetOwner: string
): Promise<boolean> {
  const client = getSupabaseClient();

  if (!client) throw new Error('Supabase client not configured');

  const { data, error } = await client.rpc('has_brain_access', {
    target_owner: targetOwner,
  });

  if (error) throw new Error(`Brain access verification failed: ${error.message}`);

  return data === true;
}

export async function testMooderiaMcpAuthentication() {
  const client = getSupabaseClient();
  const { url, anonKey, isConfigured } = getSupabaseCredentials();

  if (!client || !isConfigured) {
    return {
      success: false,
      message: 'Supabase is not configured',
    };
  }

  const { data: sessionData, error: sessionError } =
    await client.auth.getSession();

  if (sessionError || !sessionData.session) {
    return {
      success: false,
      message: 'No active login session. Please sign in first.',
    };
  }

  try {
    const response = await fetch(
      `${url.replace(/\/$/, '')}/functions/v1/mooderia-mcp`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/event-stream',
          'Authorization': `Bearer ${sessionData.session.access_token}`,
          'apikey': anonKey,
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {
            protocolVersion: '2025-03-26',
            capabilities: {},
            clientInfo: {
              name: 'mooderia-dashboard-test',
              version: '1.0.0',
            },
          },
        }),
      }
    );

    const responseText = await response.text();

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        message: `MCP request failed: ${responseText.slice(0, 1000)}`,
      };
    }

    let result: any = null;

    try {
      result = JSON.parse(responseText);
    } catch {
      const dataLine = responseText
        .split('\n')
        .find((line) => line.startsWith('data:'));

      if (dataLine) {
        try {
          result = JSON.parse(dataLine.slice(5).trim());
        } catch {
          result = null;
        }
      }
    }

    if (result?.error) {
      return {
        success: false,
        status: response.status,
        message: result.error.message || 'MCP initialization failed',
      };
    }

    const serverInfo = result?.result?.serverInfo;
    const protocolVersion = result?.result?.protocolVersion;

    if (!serverInfo || !protocolVersion) {
      return {
        success: false,
        status: response.status,
        message: `MCP responded, but initialization was not confirmed: ${responseText.slice(0, 1000)}`,
      };
    }

    return {
      success: true,
      status: response.status,
      message: 'MCP initialization successful',
      server_name: serverInfo.name || null,
      server_version: serverInfo.version || null,
      protocol_version: protocolVersion,
      capabilities: result.result.capabilities || {},
    };
  } catch (error: any) {
    return {
      success: false,
      status: 0,
      message: error?.message || 'Could not reach the MOODERIA MCP endpoint',
    };
  }
}
