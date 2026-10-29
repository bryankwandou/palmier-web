import React, { useState } from 'react';
import { 
  Plus, 
  Folder, 
  Settings as SettingsIcon, 
  Search, 
  Play, 
  Film, 
  Clock, 
  ChevronRight, 
  Sparkles, 
  Trash2, 
  Copy, 
  MoreVertical,
  CheckCircle2,
  HardDrive
} from 'lucide-react';

export default function PalmierHomeView({ 
  projects, 
  sampleProjects, 
  onOpenProject, 
  onCreateProject, 
  onDeleteProject,
  onOpenSettings 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSamplesExpanded, setIsSamplesExpanded] = useState(true);
  const [activeMenuProjectId, setActiveMenuProjectId] = useState(null);

  // Filter projects by search
  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="palmier-home-root">
      {/* Left Sidebar matching HomeSidebar in HomeView.swift */}
      <aside className="palmier-home-sidebar">
        {/* User Identity Strip */}
        <div className="home-identity-strip">
          <div className="identity-avatar">B</div>
          <div className="identity-info">
            <span className="identity-name">Bryan Kwandou</span>
            <span className="identity-badge">Pro Studio</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="home-sidebar-actions">
          <button 
            className="home-sidebar-btn primary"
            onClick={onCreateProject}
          >
            <Plus size={15} />
            <span>New Project</span>
          </button>

          <button 
            className="home-sidebar-btn"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.palmier,video/*,application/json';
              input.onchange = (e) => {
                if (e.target.files?.[0]) {
                  onCreateProject();
                }
              };
              input.click();
            }}
          >
            <Folder size={15} />
            <span>Open Project...</span>
          </button>
        </div>

        <div className="home-sidebar-spacer" />

        {/* Update Card matching UpdateSidebarCard.swift */}
        <div className="home-update-card">
          <div className="update-card-header">
            <CheckCircle2 size={13} className="update-ok-icon" />
            <span className="update-version">Palmier Pro v0.7.6</span>
          </div>
          <p className="update-status-text">MCP Engine running on port 19789. All 36 native video editing tools active.</p>
        </div>

        {/* Settings button */}
        <div className="home-sidebar-footer">
          <button 
            className="home-sidebar-btn settings-btn"
            onClick={onOpenSettings}
          >
            <SettingsIcon size={15} />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="palmier-home-main">
        {/* Welcome Header */}
        <header className="home-main-header">
          <div className="welcome-title-wrap">
            <h1 className="home-welcome-title">Welcome to Palmier Pro</h1>
            <p className="home-welcome-subtitle">Studio AI Video Editor with Swift Engine Parity & Local MCP Integration</p>
          </div>
        </header>

        {/* Sample Projects Strip matching SampleProjectsStrip.swift */}
        <section className="home-samples-section">
          <div 
            className="section-header-collapsible"
            onClick={() => setIsSamplesExpanded(!isSamplesExpanded)}
          >
            <div className="section-title-wrap">
              <span className="section-title">Sample Projects</span>
              <ChevronRight 
                size={14} 
                className={`section-arrow ${isSamplesExpanded ? 'expanded' : ''}`} 
              />
            </div>
            <span className="section-count">{sampleProjects.length} templates available</span>
          </div>

          {isSamplesExpanded && (
            <div className="sample-cards-carousel">
              {sampleProjects.map((sample) => (
                <div 
                  key={sample.id}
                  className="sample-project-card"
                  onClick={() => onOpenProject(sample.id)}
                >
                  <div className="sample-card-poster">
                    <img src={sample.thumb} alt={sample.name} />
                    <div className="poster-overlay">
                      <div className="play-badge">
                        <Play size={14} fill="#fff" />
                      </div>
                      <span className="sample-res-tag">{sample.resolution}</span>
                    </div>
                  </div>
                  <div className="sample-card-body">
                    <span className="sample-title">{sample.name}</span>
                    <div className="sample-meta">
                      <span className="sample-duration">{sample.duration}</span>
                      <span className="sample-fps">{sample.fps}fps</span>
                      <span className="sample-tag">{sample.tag}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* My Projects Section matching MyProjectsSection.swift */}
        <section className="home-my-projects-section">
          <div className="my-projects-toolbar">
            <div className="section-title-wrap">
              <span className="section-title">My Projects</span>
              <span className="projects-count-pill">{filteredProjects.length}</span>
            </div>

            <div className="projects-search-bar">
              <Search size={13} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search projects..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Grid of Projects */}
          <div className="my-projects-grid">
            {/* Create Project Card */}
            <div 
              className="new-project-dashed-card"
              onClick={onCreateProject}
            >
              <div className="dashed-icon-circle">
                <Plus size={20} />
              </div>
              <span className="dashed-card-title">Create New Project</span>
              <span className="dashed-card-desc">Start from scratch with 6 multi-track lanes</span>
            </div>

            {/* Existing Project Cards */}
            {filteredProjects.map((proj) => (
              <div 
                key={proj.id}
                className="project-grid-card"
                onClick={() => onOpenProject(proj.id)}
              >
                <div className="project-card-thumbnail">
                  <img src={proj.thumb} alt={proj.name} />
                  <div className="thumbnail-gradient">
                    <span className="card-aspect-badge">{proj.aspectRatio}</span>
                    <span className="card-time-badge">{proj.duration}</span>
                  </div>
                </div>

                <div className="project-card-details">
                  <div className="project-details-row">
                    <span className="project-name-label">{proj.name}</span>
                    <button 
                      className="project-card-menu-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuProjectId(activeMenuProjectId === proj.id ? null : proj.id);
                      }}
                    >
                      <MoreVertical size={13} />
                    </button>
                  </div>

                  <div className="project-meta-row">
                    <span className="project-resolution">{proj.resolution}</span>
                    <span className="meta-bullet">•</span>
                    <span className="project-date">{proj.modifiedDate}</span>
                  </div>
                </div>

                {/* Dropdown Menu */}
                {activeMenuProjectId === proj.id && (
                  <div 
                    className="project-card-popover-menu"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button 
                      className="popover-item"
                      onClick={() => {
                        setActiveMenuProjectId(null);
                        onOpenProject(proj.id);
                      }}
                    >
                      <Play size={12} />
                      <span>Open in Editor</span>
                    </button>
                    <button 
                      className="popover-item delete"
                      onClick={() => {
                        setActiveMenuProjectId(null);
                        onDeleteProject(proj.id);
                      }}
                    >
                      <Trash2 size={12} />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
