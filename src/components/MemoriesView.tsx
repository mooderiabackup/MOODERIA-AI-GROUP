import React, { useState } from 'react';
import { useBrain } from '../context/BrainContext';
import { Memory } from '../types/database';
import {
  Brain,
  Search,
  Plus,
  Tag,
  Clock,
  Sparkles,
  Trash2,
  Copy,
  Check,
  ChevronRight,
  Filter,
  AlertCircle
} from 'lucide-react';

export const MemoriesView: React.FC = () => {
  const {
    memories,
    filteredMemories,
    searchQuery,
    setSearchQuery,
    deleteMemory,
    setIsCreateMemoryOpen,
  } = useBrain();

  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [activeMemory, setActiveMemory] = useState<Memory | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extract unique tags
  const allTags = Array.from(
    new Set((memories || []).flatMap((m) => m.tags || []))
  );

  const displayedMemories = filteredMemories.filter((m) => {
    if (selectedTag === 'all') return true;
    return Boolean(m.tags && m.tags.includes(selectedTag));
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const importanceBadge = (imp?: Memory['importance']) => {
    const key = imp || 'medium';
    const map = {
      critical: 'bg-rose-50 text-rose-700 border-rose-200',
      high: 'bg-amber-50 text-amber-800 border-amber-200',
      medium: 'bg-purple-50 text-purple-700 border-purple-200',
      low: 'bg-slate-100 text-slate-600 border-slate-200',
    };
    return (
      <span
        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${map[key]}`}
      >
        {key}
      </span>
    );
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-purple-100 text-purple-800">
              <Brain className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black italic tracking-tight text-slate-900 font-display">
              SHARED MEMORY INDEX
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Synchronized across all 8 Claude accounts in Supabase
          </p>
        </div>

        <button
          onClick={() => setIsCreateMemoryOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-900/10 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Save New Memory</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search memories by title, keyword, code snippet, tag, or AI slot..."
          className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-100 shadow-xs transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filter Tag Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setSelectedTag('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            selectedTag === 'all'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-purple-50 border border-slate-200'
          }`}
        >
          All ({memories.length})
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              selectedTag === tag
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-purple-50 border border-slate-200'
            }`}
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* Memories List */}
      {displayedMemories.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-3">
          <Brain className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="font-bold text-sm text-slate-700">
            {memories.length === 0
              ? 'No memories stored in Supabase yet'
              : 'No memories match your query'}
          </p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {memories.length === 0
              ? 'Use Save New Memory to store an entry into your existing Supabase table using the save_memory function.'
              : 'Try adjusting your search keywords or filter tags.'}
          </p>
          <button
            onClick={() => setIsCreateMemoryOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-700 text-white font-bold text-xs hover:bg-purple-800 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Save New Memory</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedMemories.map((mem) => (
            <div
              key={mem.id}
              className="group p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:border-purple-300 hover:shadow-md transition-all space-y-2.5"
            >
              {/* Header Info */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {importanceBadge(mem.importance || 'medium')}
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                    {mem.owner_id ? `Owner: ${mem.owner_id.slice(0, 6)}...` : mem.category || 'Shared Intelligence'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopy(mem.id, `${mem.title}\n\n${mem.content}`)}
                    className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                    title="Copy memory content"
                  >
                    {copiedId === mem.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteMemory(mem.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete memory"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Title & Body */}
              <div>
                <h3 className="font-black text-slate-900 text-sm sm:text-base font-display">
                  {mem.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 whitespace-pre-wrap mt-1 leading-relaxed">
                  {mem.content}
                </p>
              </div>

              {/* Tags & Metadata Footer */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(mem.tags || []).map((t) => (
                    <span
                      key={t}
                      onClick={() => setSelectedTag(t)}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 hover:bg-purple-100 hover:text-purple-700 transition-colors cursor-pointer"
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1 ml-auto">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(mem.created_at || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
