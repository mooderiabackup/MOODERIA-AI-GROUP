
import React, { useEffect, useState } from 'react';
import { useBrain } from '../context/BrainContext';
import { Brain, X } from 'lucide-react';

export const CreateMemoryModal: React.FC = () => {
  const {
    isCreateMemoryOpen,
    setIsCreateMemoryOpen,
    accounts,
    projects,
    addMemory,
    supabaseStatus,
    setIsAuthModalOpen,
  } = useBrain();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState(
    'Architecture, Shared Intelligence'
  );
  const [importance, setImportance] = useState<number>(4);
  const [selectedAccount, setSelectedAccount] =
    useState('Claude Main');
  const [selectedProjectId, setSelectedProjectId] =
    useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (
      selectedProjectId &&
      !projects.some((project) => project.id === selectedProjectId)
    ) {
      setSelectedProjectId('');
    }
  }, [projects, selectedProjectId]);

  useEffect(() => {
    if (
      !accounts.some(
        (account) => account.account_name === selectedAccount
      )
    ) {
      setSelectedAccount('Claude Main');
    }
  }, [accounts, selectedAccount]);

  if (!isCreateMemoryOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError('Please provide a title and memory content.');
      return;
    }

    if (!supabaseStatus.isConnected) {
      setError('Connect to Supabase before saving memories.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const parsedTags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    const targetAccount = accounts.find(
      (account) => account.account_name === selectedAccount
    );

    // Only real registered database UUIDs may be saved.
    const sourceAccountId =
      targetAccount?.is_registered_in_db &&
      targetAccount.id &&
      !targetAccount.id.startsWith('claude-slot-')
        ? targetAccount.id
        : undefined;

    try {
      await addMemory({
        title: title.trim(),
        content: content.trim(),
        tags: parsedTags.length > 0 ? parsedTags : ['General'],
        importance,
        project_id: selectedProjectId || undefined,
        category: 'Architecture',
        source_account_id: sourceAccountId,
      });

      setTitle('');
      setContent('');
      setTagsInput('Architecture, Shared Intelligence');
      setImportance(4);
      setSelectedAccount('Claude Main');
      setSelectedProjectId('');
      setIsCreateMemoryOpen(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to save memory.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-3xl sm:rounded-4xl shadow-2xl border border-purple-100 overflow-hidden">
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-purple-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-700 text-white flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black italic text-slate-900 font-display">
                STORE NEW MEMORY
              </h2>
              <p className="text-[11px] text-purple-700 font-semibold">
                Centralized AI Brain • RPC: save_memory
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateMemoryOpen(false)}
            className="p-1.5 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {!supabaseStatus.isConnected && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-2">
              <span>
                Supabase is not connected. Connect your database to save memories.
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsCreateMemoryOpen(false);
                  setIsAuthModalOpen(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-purple-700 text-white font-bold text-[10px] shrink-0"
              >
                Connect
              </button>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Memory Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Supabase RLS Policy Pattern"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Content & Shared Knowledge
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe the architectural decision, rule, code pattern, or session context..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 outline-hidden resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Importance Level
              </label>
              <select
                value={importance}
                onChange={(e) => setImportance(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-purple-600 focus:ring-2 focus:ring-purple-100 outline-hidden bg-white"
              >
                <option value={5}>Critical</option>
                <option value={4}>High Priority</option>
                <option value={3}>Medium</option>
                <option value={2}>Low</option>
                <option value={1}>Reference Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Originating AI Slot
              </label>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-purple-600 focus:ring-2 focus:ring-purple-100 outline-hidden bg-white"
              >
                {accounts.map((account) => (
                  <option
                    key={account.slot_number}
                    value={account.account_name}
                  >
                    {account.account_name} (Slot {account.slot_number})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Project Association
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-purple-600 focus:ring-2 focus:ring-purple-100 outline-hidden bg-white"
              >
                <option value="">No Project (General Brain)</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Database, MCP, Security"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-purple-600 focus:ring-2 focus:ring-purple-100 outline-hidden"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateMemoryOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !supabaseStatus.isConnected}
              className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md shadow-purple-900/10 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Saving to Brain...' : 'Save to Supabase'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
