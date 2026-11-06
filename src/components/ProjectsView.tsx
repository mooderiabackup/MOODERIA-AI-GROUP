import React, { useState } from 'react';
import { useBrain } from '../context/BrainContext';
import { Project } from '../types/database';
import {
  FolderKanban,
  Plus,
  Clock,
  Layers,
  ArrowRight,
  Brain,
  CheckCircle2,
  FolderCheck
} from 'lucide-react';

export const ProjectsView: React.FC = () => {
  const { projects, setActiveTab, setSearchQuery } = useBrain();
  const [filter, setFilter] = useState<'all' | 'active' | 'planning'>('all');

  const filteredProjects = projects.filter((p) => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const handleOpenProjectMemories = (projectName: string) => {
    setSearchQuery(projectName);
    setActiveTab('memories');
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-purple-100 text-purple-800">
              <FolderKanban className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black italic tracking-tight text-slate-900 font-display">
              ACTIVE PROJECTS
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Organized collaborative domains shared across all 8 Claude AI accounts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'all'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            All ({projects.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'active'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Active
          </button>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-2">
          <FolderKanban className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="font-bold text-sm text-slate-700">No projects found in Supabase</p>
          <p className="text-xs text-slate-400">
            Records from your Supabase 'projects' table will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:border-purple-300 hover:shadow-md transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                    {project.category || 'General'}
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-base font-display group-hover:text-purple-700 transition-colors">
                    {project.name}
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {project.status || 'Active'}
                </span>
              </div>

              {(project.summary || project.description) && (
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {project.summary || project.description}
                </p>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleOpenProjectMemories(project.name)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 group-hover:text-purple-700 hover:underline cursor-pointer ml-auto"
                >
                  <span>Filter Memories</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
