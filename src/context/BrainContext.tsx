
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

import {
  AIAccount,
  AIAccountSlot,
  Memory,
  Project,
  Decision,
  MemoryAccessLog,
} from '../types/database';

import {
  getSupabaseClient,
  getSupabaseCredentials,
  rpcSaveMemory,
  rpcDeleteMemory,
  rpcRegisterBrainAccount,
  rpcCurrentBrainOwner,
  pingMcpEdgeFunction,
} from '../lib/supabase';

import { User, Session } from '@supabase/supabase-js';

export type NavigationTab =
  | 'home'
  | 'memories'
  | 'accounts'
  | 'projects'
  | 'activity'
  | 'settings';

interface SupabaseStatus {
  isConfigured: boolean;
  isConnected: boolean;
  url: string;
  error: string | null;
  tableStatus: Record<string, boolean>;
  isOwner: boolean;
}

interface BrainContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  isBrainOnline: boolean;
  setIsBrainOnline: (online: boolean) => void;
  isBrainModalOpen: boolean;
  setIsBrainModalOpen: (open: boolean) => void;
  isCreateMemoryOpen: boolean;
  setIsCreateMemoryOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  selectedMcpSlot: AIAccount | null;
  setSelectedMcpSlot: (slot: AIAccount | null) => void;

  accounts: AIAccount[];
  memories: Memory[];
  projects: Project[];
  decisions: Decision[];
  activities: MemoryAccessLog[];
  isLoadingData: boolean;

  user: User | null;
  session: Session | null;
  isMainOwner: boolean;
  signInWithEmail: (
    email: string,
    pass: string
  ) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (
    email: string,
    pass: string
  ) => Promise<{ success: boolean; error?: string }>;
  signOutUser: () => Promise<void>;

  connectedAccountCount: number;
  registeredAccountCount: number;
  totalMemoriesCount: number;

  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredMemories: Memory[];

  addMemory: (memory: {
    content: string;
    title?: string;
    tags?: string[];
    importance?: number;
    project_id?: string;
    category?: string;
    source_account_id?: string;
  }) => Promise<void>;

  deleteMemory: (id: string) => Promise<void>;

  registerAccountInSupabase: (
    slotNumber: number
  ) => Promise<{ success: boolean; error?: string }>;

  verifyMcpConnection: (
    slotNumber: number
  ) => Promise<{ ok: boolean; message: string }>;

  refreshBrainData: () => Promise<void>;

  supabaseStatus: SupabaseStatus;
  saveSupabaseConfig: (
    url: string,
    key: string
  ) => Promise<{ success: boolean; error?: string }>;
  resetSupabaseConfig: () => void;
}

// Existing Supabase identity mapping.
// Claude Main = owner.
// Claude 2–8 = seven existing members in their original order.

const OWNER_ID = '7ffaf319-80a2-43ec-bae1-114509f27df7';

const ACCOUNT_USER_IDS: Record<AIAccountSlot, string> = {
  1: OWNER_ID,
  2: '0640e045-619f-4845-9f55-9e733dc83bd3',
  3: '72480468-2aa8-4312-b4d7-7c70cf6af5de',
  4: '000b7be0-2632-428d-a170-e21c76f1342b',
  5: '48bc41f2-65bb-4e81-8bd3-35588cb307d0',
  6: 'ebbbe72d-c08c-4963-874e-ad8fd8ffcc62',
  7: '0ae40d3e-dfaf-45f1-9153-1b16c3cb938c',
  8: '7f02c17e-b3c3-4d4c-a688-3b5cf898aba1',
};

const SLOT_DETAILS = [
  ['Claude Main', 'Lead Architect & Brain Controller', 'claude-3-7-sonnet'],
  ['Claude 2', 'Full-Stack & Systems Engineer', 'claude-3-5-sonnet'],
  ['Claude 3', 'Database & SQL Optimization Agent', 'claude-3-5-sonnet'],
  ['Claude 4', 'Real-time Event Streamer & Auditor', 'claude-3-5-haiku'],
  ['Claude 5', 'Testing, Quality & Edge Verification', 'claude-3-5-sonnet'],
  ['Claude 6', 'Memory Garbage Collection & Dedup', 'claude-3-5-haiku'],
  ['Claude 7', 'Strategic Safety Evaluator', 'claude-3-opus'],
  ['Claude 8', 'External Remote MCP Bridge Agent', 'claude-3-5-sonnet'],
] as const;

const INITIAL_SLOTS: AIAccount[] = SLOT_DETAILS.map(
  ([accountName, identityLabel, modelId], index) => ({
    id: `claude-slot-${index + 1}`,
    account_name: accountName,
    slot_number: (index + 1) as AIAccountSlot,
    identity_label: identityLabel,
    model_id: modelId,
    is_registered_in_db: false,
    mcp_connection_state: 'not_connected',
    status_message: 'Awaiting registration and MCP handshake',
  })
);

const BrainContext = createContext<BrainContextType | null>(null);

export function BrainProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [isBrainOnline, setIsBrainOnline] = useState(true);
  const [isBrainModalOpen, setIsBrainModalOpen] = useState(false);
  const [isCreateMemoryOpen, setIsCreateMemoryOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedMcpSlot, setSelectedMcpSlot] =
    useState<AIAccount | null>(null);

  const [accounts, setAccounts] = useState<AIAccount[]>(INITIAL_SLOTS);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [activities, setActivities] = useState<MemoryAccessLog[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isMainOwner, setIsMainOwner] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const [supabaseStatus, setSupabaseStatus] =
    useState<SupabaseStatus>({
      isConfigured: false,
      isConnected: false,
      url: '',
      error: null,
      tableStatus: {},
      isOwner: false,
    });

  const loadAllSupabaseData = useCallback(async () => {
    const creds = getSupabaseCredentials();

    if (!creds.isConfigured) {
      setMemories([]);
      setProjects([]);
      setDecisions([]);
      setActivities([]);
      setAccounts(INITIAL_SLOTS);
      setUser(null);
      setSession(null);
      setIsMainOwner(false);
      setSupabaseStatus({
        isConfigured: false,
        isConnected: false,
        url: '',
        error: null,
        tableStatus: {},
        isOwner: false,
      });
      return;
    }

    const client = getSupabaseClient();

    if (!client) {
      setSupabaseStatus({
        isConfigured: true,
        isConnected: false,
        url: creds.url,
        error: 'Could not initialize Supabase client',
        tableStatus: {},
        isOwner: false,
      });
      return;
    }

    setIsLoadingData(true);

    const tableStatus: Record<string, boolean> = {};

    try {
      const { data: authData, error: authError } =
        await client.auth.getSession();

      if (authError) throw authError;

      const currentSession = authData.session;
      const currentUser = currentSession?.user ?? null;

      setSession(currentSession);
      setUser(currentUser);

      if (!currentUser) {
        setMemories([]);
        setProjects([]);
        setDecisions([]);
        setActivities([]);
        setAccounts(INITIAL_SLOTS);
        setIsMainOwner(false);

        setSupabaseStatus({
          isConfigured: true,
          isConnected: true,
          url: creds.url,
          error: 'Please sign in to access AI Brain data.',
          tableStatus,
          isOwner: false,
        });

        return;
      }

      let ownerId: string;

      try {
        ownerId = await rpcCurrentBrainOwner();
      } catch (error: any) {
        throw new Error(
          `Could not resolve brain ownership: ${error.message}`
        );
      }

      const ownerVerified = ownerId === currentUser.id;

      setIsMainOwner(ownerVerified);

      // Load memories.
      const { data: memData, error: memError } = await client
        .from('memories')
        .select('*')
        .order('created_at', { ascending: false });

      tableStatus.memories = !memError;

      if (memError) throw memError;

      setMemories(
        (memData || []).map((m: any) => ({
          id: m.id,
          owner_id: m.owner_id,
          project_id: m.project_id,
          source_account_id: m.source_account_id,
          category: m.category || 'General',
          title: m.title || '',
          content: m.content || '',
          tags: Array.isArray(m.tags) ? m.tags : [],
          importance: Number(m.importance ?? 3),
          status: m.status || 'active',
          created_at: m.created_at,
          updated_at: m.updated_at,
        }))
      );

      // Load registered AI account mappings.
      const { data: accData, error: accError } = await client
        .from('ai_accounts')
        .select('*');

      tableStatus.ai_accounts = !accError;

      if (accError) throw accError;

      setAccounts(
        INITIAL_SLOTS.map((slot) => {
          const expectedUserId = ACCOUNT_USER_IDS[slot.slot_number];

          const found = (accData || []).find(
            (account: any) =>
              account.account_name === slot.account_name &&
              account.auth_user_id === expectedUserId
          );

          if (!found) {
            return {
              ...slot,
              is_registered_in_db: false,
              mcp_connection_state: 'not_connected',
              status_message: 'Not registered in database',
            };
          }

          return {
            ...slot,
            id: found.id,
            owner_id: found.owner_id,
            auth_user_id: found.auth_user_id,
            provider: found.provider,
            is_active: found.is_active,
            connected_at: found.connected_at,
            is_registered_in_db: true,
            mcp_connection_state: 'not_connected',
            status_message: found.is_active
              ? 'Registered and enabled in database; MCP handshake pending'
              : 'Registered in database; account inactive',
          };
        })
      );

      // Load projects.
      const { data: projData, error: projError } = await client
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      tableStatus.projects = !projError;

      if (projError) throw projError;

      setProjects(
        (projData || []).map((p: any) => ({
          id: p.id,
          owner_id: p.owner_id,
          name: p.name || 'Untitled Project',
          description: p.description || '',
          summary: p.summary || '',
          status: p.status || 'active',
          created_at: p.created_at,
          updated_at: p.updated_at,
        }))
      );

      // Load decisions.
      const { data: decData, error: decError } = await client
        .from('decisions')
        .select('*')
        .order('created_at', { ascending: false });

      tableStatus.decisions = !decError;

      if (decError) throw decError;

      setDecisions(
        (decData || []).map((d: any) => ({
          id: d.id,
          owner_id: d.owner_id,
          project_id: d.project_id,
          title: d.title || 'Decision',
          decision: d.decision || '',
          reason: d.reason || '',
          created_at: d.created_at,
        }))
      );

      // Load activity logs.
      const { data: actData, error: actError } = await client
        .from('memory_access_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      tableStatus.memory_access_logs = !actError;

      if (actError) throw actError;

      setActivities(
        (actData || []).map((a: any) => ({
          id: a.id,
          owner_id: a.owner_id,
          account_id: a.account_id,
          action: a.action || 'access',
          details: a.details,
          created_at: a.created_at,
        }))
      );

      // Verify remaining tables.
      const checks = await Promise.all([
        client.from('brain_members').select('id').limit(1),
        client.from('profiles').select('owner_id').limit(1),
        client.from('memory_versions').select('id').limit(1),
      ]);

      tableStatus.brain_members = !checks[0].error;
      tableStatus.profiles = !checks[1].error;
      tableStatus.memory_versions = !checks[2].error;

      setSupabaseStatus({
        isConfigured: true,
        isConnected: true,
        url: creds.url,
        error: null,
        tableStatus,
        isOwner: ownerVerified,
      });
    } catch (error: any) {
      console.error('AI Brain data loading failed:', error);

      setSupabaseStatus({
        isConfigured: true,
        isConnected: false,
        url: creds.url,
        error: error?.message || 'Database synchronization failed',
        tableStatus,
        isOwner: false,
      });
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadAllSupabaseData();

    const client = getSupabaseClient();

    if (!client) return;

    const { data: subscription } =
      client.auth.onAuthStateChange(() => {
        void loadAllSupabaseData();
      });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, [loadAllSupabaseData]);

  const signInWithEmail = async (
    email: string,
    pass: string
  ) => {
    const client = getSupabaseClient();

    if (!client) {
      return {
        success: false,
        error: 'Supabase is not configured.',
      };
    }

    const { error } = await client.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    await loadAllSupabaseData();

    return { success: true };
  };

  const signUpWithEmail = async (
    email: string,
    pass: string
  ) => {
    const client = getSupabaseClient();

    if (!client) {
      return {
        success: false,
        error: 'Supabase is not configured.',
      };
    }

    const { error } = await client.auth.signUp({
      email,
      password: pass,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    await loadAllSupabaseData();

    return { success: true };
  };

  const signOutUser = async () => {
    const client = getSupabaseClient();

    if (!client) return;

    const { error } = await client.auth.signOut();

    if (error) throw error;

    setUser(null);
    setSession(null);
    setIsMainOwner(false);
    setMemories([]);
    setProjects([]);
    setDecisions([]);
    setActivities([]);
    setAccounts(INITIAL_SLOTS);

    await loadAllSupabaseData();
  };

  const saveSupabaseConfig = async (
    url: string,
    key: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanUrl = url.trim();
    const cleanKey = key.trim();

    if (!cleanUrl || !cleanKey) {
      return {
        success: false,
        error: 'Both Supabase URL and publishable key are required.',
      };
    }

    if (!/^https:\/\/.+/.test(cleanUrl)) {
      return {
        success: false,
        error: 'Please enter a valid HTTPS Supabase URL.',
      };
    }

    try {
      localStorage.setItem('mooderia_supabase_url', cleanUrl);
      localStorage.setItem('mooderia_supabase_key', cleanKey);

      await loadAllSupabaseData();

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Could not save Supabase configuration.',
      };
    }
  };

  const resetSupabaseConfig = () => {
    localStorage.removeItem('mooderia_supabase_url');
    localStorage.removeItem('mooderia_supabase_key');

    setMemories([]);
    setProjects([]);
    setDecisions([]);
    setActivities([]);
    setAccounts(INITIAL_SLOTS);
    setUser(null);
    setSession(null);
    setIsMainOwner(false);

    setSupabaseStatus({
      isConfigured: false,
      isConnected: false,
      url: '',
      error: null,
      tableStatus: {},
      isOwner: false,
    });
  };

  const connectedAccountCount = accounts.filter(
    (account) => account.mcp_connection_state === 'connected'
  ).length;

  const registeredAccountCount = accounts.filter(
    (account) => account.is_registered_in_db
  ).length;

  const totalMemoriesCount = memories.length;

  const filteredMemories = memories.filter((memory) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();

    return (
      (memory.title || '').toLowerCase().includes(query) ||
      memory.content.toLowerCase().includes(query) ||
      (memory.category || '').toLowerCase().includes(query) ||
      (memory.tags || []).some((tag) =>
        tag.toLowerCase().includes(query)
      )
    );
  });

  const addMemory = async (newMemory: {
    content: string;
    title?: string;
    tags?: string[];
    importance?: number;
    project_id?: string;
    category?: string;
    source_account_id?: string;
  }) => {
    const client = getSupabaseClient();

    if (!client) {
      throw new Error('Supabase is not configured.');
    }

    if (!user) {
      throw new Error('Please sign in before saving a memory.');
    }

    const importance = newMemory.importance ?? 3;

    if (
      !Number.isInteger(importance) ||
      importance < 1 ||
      importance > 5
    ) {
      throw new Error('Memory importance must be an integer from 1 to 5.');
    }

    await rpcCurrentBrainOwner();

    await rpcSaveMemory({
      category: newMemory.category?.trim() || 'General',
      title: newMemory.title?.trim() || 'Untitled Memory',
      content: newMemory.content,
      tags: newMemory.tags ?? [],
      importance,
      project_id: newMemory.project_id || null,
      source_account_id: newMemory.source_account_id || null,
    });

    await loadAllSupabaseData();
  };

  const deleteMemory = async (id: string) => {
    if (!user) {
      throw new Error('Please sign in first.');
    }

    await rpcDeleteMemory(id);
    await loadAllSupabaseData();
  };

  const registerAccountInSupabase = async (
    slotNumber: number
  ): Promise<{ success: boolean; error?: string }> => {
    const client = getSupabaseClient();

    if (!client) {
      return {
        success: false,
        error: 'Supabase is not configured.',
      };
    }

    if (!user) {
      return {
        success: false,
        error: 'Authentication required.',
      };
    }

    if (!isMainOwner || user.id !== OWNER_ID) {
      return {
        success: false,
        error: 'Only the main brain owner can register AI accounts.',
      };
    }

    if (
      !Number.isInteger(slotNumber) ||
      slotNumber < 1 ||
      slotNumber > 8
    ) {
      return {
        success: false,
        error: 'Invalid Claude account slot.',
      };
    }

    const slot = INITIAL_SLOTS.find(
      (item) => item.slot_number === slotNumber
    );

    if (!slot) {
      return {
        success: false,
        error: 'Account slot not found.',
      };
    }

    const targetUserId =
      ACCOUNT_USER_IDS[slot.slot_number];

    if (!targetUserId) {
      return {
        success: false,
        error: 'No Supabase identity is mapped to this slot.',
      };
    }

    const existing = accounts.find(
      (account) =>
        account.account_name === slot.account_name &&
        account.auth_user_id === targetUserId &&
        account.is_registered_in_db
    );

    if (existing) {
      return {
        success: true,
      };
    }

    try {
      await rpcRegisterBrainAccount({
        authUserId: targetUserId,
        accountName: slot.account_name,
        provider: 'Claude',
      });

      await loadAllSupabaseData();

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Account registration failed.',
      };
    }
  };

  const verifyMcpConnection = async (
    slotNumber: number
  ): Promise<{ ok: boolean; message: string }> => {
    const target = accounts.find(
      (account) => account.slot_number === slotNumber
    );

    if (!target) {
      return {
        ok: false,
        message: 'Invalid account slot.',
      };
    }

    if (!target.is_registered_in_db) {
      return {
        ok: false,
        message: 'Register this account before testing API access.',
      };
    }

    if (!session?.access_token) {
      return {
        ok: false,
        message: 'Please sign in first.',
      };
    }

    const ping = await pingMcpEdgeFunction(
      target.account_name,
      session.access_token
    );

    // API health is NOT an MCP handshake.
    // Never mark this account as MCP-connected here.
    setAccounts((previous) =>
      previous.map((account) =>
        account.slot_number === slotNumber
          ? {
              ...account,
              mcp_connection_state: 'not_connected',
              status_message: ping.ok
                ? `AI Brain API reachable (HTTP ${ping.status}). Actual MCP handshake not verified.`
                : `AI Brain API health check failed: ${ping.message}`,
            }
          : account
      )
    );

    return {
      ok: ping.ok,
      message: ping.ok
        ? `AI Brain API is reachable (HTTP ${ping.status}). This does not confirm an MCP connection.`
        : ping.message,
    };
  };

  const refreshBrainData = async () => {
    await loadAllSupabaseData();
  };

  return (
    <BrainContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isBrainOnline,
        setIsBrainOnline,
        isBrainModalOpen,
        setIsBrainModalOpen,
        isCreateMemoryOpen,
        setIsCreateMemoryOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        selectedMcpSlot,
        setSelectedMcpSlot,

        accounts,
        memories,
        projects,
        decisions,
        activities,
        isLoadingData,

        user,
        session,
        isMainOwner,
        signInWithEmail,
        signUpWithEmail,
        signOutUser,

        connectedAccountCount,
        registeredAccountCount,
        totalMemoriesCount,

        searchQuery,
        setSearchQuery,
        filteredMemories,

        addMemory,
        deleteMemory,
        registerAccountInSupabase,
        verifyMcpConnection,
        refreshBrainData,

        supabaseStatus,
        saveSupabaseConfig,
        resetSupabaseConfig,
      }}
    >
      {children}
    </BrainContext.Provider>
  );
}

export function useBrain() {
  const context = useContext(BrainContext);

  if (!context) {
    throw new Error(
      'useBrain must be used within a BrainProvider'
    );
  }

  return context;
}
