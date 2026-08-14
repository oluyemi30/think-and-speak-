import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PracticePage } from './pages/PracticePage';
import { ContentCreatorPage } from './pages/ContentCreatorPage';
import { GroupModePage } from './pages/GroupModePage';
import { ProgressPage } from './pages/ProgressPage';
import { SocialLinks } from './components/SocialLinks';
import { storageService } from './services/storageService';
import { TopicPrompt } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'practice' | 'content' | 'group' | 'progress'>('practice');
  const [streakDays, setStreakDays] = useState<number>(0);
  const [directPracticeTopic, setDirectPracticeTopic] = useState<TopicPrompt | null>(null);

  useEffect(() => {
    const stats = storageService.getStats();
    setStreakDays(stats.streakDays || 0);
  }, [activeTab]);

  const handleSelectTopicToPractice = (prompt: TopicPrompt) => {
    setDirectPracticeTopic(prompt);
    setActiveTab('practice');
  };

  return (
    <div className="min-h-screen offthecuff-bg text-zinc-100 flex flex-col font-sans selection:bg-[#f59e0b] selection:text-[#080c14] antialiased">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab !== 'practice') setDirectPracticeTopic(null);
          setActiveTab(tab);
        }}
        streakDays={streakDays}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col justify-center">
        {activeTab === 'practice' && (
          <PracticePage initialTopicPrompt={directPracticeTopic} />
        )}

        {activeTab === 'content' && (
          <ContentCreatorPage onSelectTopicToPractice={handleSelectTopicToPractice} />
        )}

        {activeTab === 'group' && <GroupModePage />}

        {activeTab === 'progress' && <ProgressPage />}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 px-4 text-center space-y-4 bg-[#080c14]/40">
        <div className="space-y-1">
          <p className="font-serif-display text-lg text-zinc-200">
            Off The Cuff
          </p>
          <p className="text-[11px] text-zinc-400">
            Think quick on your feet. Master spontaneous speaking.
          </p>
          <p className="text-[11px] text-amber-500/90 font-semibold pt-0.5">
            Designed &amp; Created by BigYemy
          </p>
        </div>

        <SocialLinks variant="footer" />
      </footer>
    </div>
  );
}
