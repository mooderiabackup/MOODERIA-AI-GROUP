
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface BrainMember {
  id?: string;
  owner_id: string;
  member_user_id: string;
  role: 'owner' | 'member';
  is_active?: boolean;
  created_at?: string;
}

export interface Profile {
  owner_id: string;
  display_name?: string;
  profile_summary?: string;
  preferences?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export type AIAccountSlot = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface AIAccount {
  id: string;
  owner_id?: string;
  account_name: string;
  provider?: string;
  is_active?: boolean;
  connected_at?: string | null;
  auth_user_id?: string | null;
  created_at?: string;

  // Frontend-only account slot information
  slot_number: AIAccountSlot;
  identity_label: string;
  model_id: string;
  is_registered_in_db: boolean;
  mcp_connection_state:
    | 'not_connected'
    | 'awaiting_handshake'
    | 'connected';
  status_message: string;
}

export interface Project {
  id: string;
  owner_id?: string;
  name: string;
  description?: string;
  status?: string;
  summary?: string;
  category?: string;
  created_at?: string;
  updated_at?: string;
  memory_count?: number;
}

export interface Memory {
  id: string;
  owner_id?: string;
  project_id?: string | null;
  source_account_id?: string | null;
  category?: string;
  title?: string;
  content: string;
  tags?: string[];
  importance: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Decision {
  id: string;
  owner_id?: string;
  project_id?: string | null;
  title?: string;
  decision?: string;
  reason?: string;
  status?: string;
  created_at?: string;
}

export interface MemoryVersion {
  id: string;
  memory_id: string;
  owner_id?: string;
  previous_content?: string;
  changed_at?: string;
  changed_by?: string | null;
}

export interface MemoryAccessLog {
  id: string;
  owner_id?: string;
  account_id?: string | null;
  action: string;
  details?: Json;
  created_at?: string;
}
