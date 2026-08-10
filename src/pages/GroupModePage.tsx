import React, { useState } from 'react';
import { GroupRoom, GroupPlayer } from '../types';
import { geminiService } from '../services/geminiService';
import { Users, Dices, Plus, Award } from 'lucide-react';

export const GroupModePage: React.FC = () => {
  const [room, setRoom] = useState<GroupRoom>({
    code: 'THINK-4821',
    players: [
      { id: 'p1', name: 'You (Host)', isHost: true, hasFinished: false, votes: {} },
      { id: 'p2', name: 'David', isHost: false, hasFinished: false, votes: {} },
      { id: 'p3', name: 'Sarah', isHost: false, hasFinished: false, votes: {} },
      { id: 'p4', name: 'Tobi', isHost: false, hasFinished: false, votes: {} },
    ],
    status: 'lobby',
  });

  const [newPlayerName, setNewPlayerName] = useState<string>('');
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(60);
  const [activeVotes, setActiveVotes] = useState<Record<string, string>>({});

  const handleSpinForEveryone = async () => {
    setIsSpinning(true);
    try {
      const topic = await geminiService.generateTopic({
        category: 'General',
        difficulty: 'basic',
        practiceMode: 'debate',
      });

      setRoom((prev) => ({
        ...prev,
        topic,
        status: 'speaking',
      }));

      setSecondsLeft(60);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSpinning(false);
    }
  };

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    const newPlayer: GroupPlayer = {
      id: `p-${Date.now()}`,
      name: newPlayerName.trim(),
      isHost: false,
      hasFinished: false,
      votes: {},
    };

    setRoom((prev) => ({
      ...prev,
      players: [...prev.players, newPlayer],
    }));

    setNewPlayerName('');
  };

  const handleFinishSpeaking = () => {
    setRoom((prev) => ({
      ...prev,
      status: 'voting',
    }));
  };

  const handleVote = (category: string, playerId: string) => {
    setActiveVotes((prev) => ({
      ...prev,
      [category]: playerId,
    }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-[#f59e0b] text-xs font-bold uppercase tracking-wider">
          <Users className="w-3.5 h-3.5" /> GROUP PRACTICE ROOM
        </div>

        <h1 className="text-3xl sm:text-5xl font-serif-display font-bold text-zinc-100 leading-tight">
          Speak with Friends &amp; Peers
        </h1>

        <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto font-medium leading-relaxed">
          Spin a random topic for everyone in the room. Each person gets 60 seconds. Vote on the most compelling argument, best delivery, or funniest answer!
        </p>
      </div>

      {/* Lobby Room Card */}
      {room.status === 'lobby' && (
        <div className="glass-card border border-white/10 p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">ROOM CODE</span>
              <div className="text-3xl font-black text-[#f59e0b] font-mono tracking-widest">{room.code}</div>
            </div>

            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
              ● ROOM ACTIVE
            </span>
          </div>

          {/* Players List */}
          <div>
            <h3 className="text-xs font-bold text-[#f59e0b] uppercase tracking-wider mb-3">
              PLAYERS IN ROOM ({room.players.length})
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {room.players.map((p) => (
                <div
                  key={p.id}
                  className="bg-white/[0.03] border border-white/10 rounded-2xl p-3 text-center space-y-1 relative"
                >
                  <div className="w-10 h-10 bg-white/10 text-zinc-100 font-bold rounded-xl flex items-center justify-center mx-auto text-sm border border-white/10">
                    {p.name.charAt(0)}
                  </div>
                  <span className="block text-xs font-semibold text-zinc-200 truncate">{p.name}</span>
                  {p.isHost && (
                    <span className="inline-block text-[9px] bg-[#f59e0b] text-[#080c14] px-2 py-0.5 font-bold rounded-full uppercase tracking-wider">
                      HOST
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Add Friend Input */}
          <form onSubmit={handleAddPlayer} className="flex gap-2">
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="Add player name..."
              className="flex-1 bg-white/[0.05] border border-white/10 rounded-2xl p-3 text-xs font-medium text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#f59e0b]"
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-zinc-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> ADD
            </button>
          </form>

          {/* Host Spin Action */}
          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={handleSpinForEveryone}
              disabled={isSpinning}
              className="w-full sm:w-auto px-8 py-4 btn-amber text-sm font-bold uppercase tracking-wider rounded-full flex items-center justify-center gap-2 mx-auto cursor-pointer shadow-lg transition-all"
            >
              <Dices className="w-5 h-5" />
              <span>SPIN FOR EVERYONE 🎲</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Speaking Phase */}
      {room.status === 'speaking' && room.topic && (
        <div className="glass-card border border-white/10 p-6 sm:p-8 rounded-3xl space-y-6 text-center">
          <div className="px-4 py-1.5 rounded-full bg-[#f59e0b] text-[#080c14] text-xs font-bold inline-block uppercase tracking-wider shadow-md animate-pulse">
            🎙️ GROUP SPEAKING PHASE — 60 SECONDS
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-serif-display font-bold text-zinc-100">&ldquo;{room.topic.topic}&rdquo;</h2>
            <p className="text-sm text-zinc-300 font-medium">{room.topic.challenge}</p>
          </div>

          <div className="text-7xl font-mono font-bold text-zinc-100 my-4">
            00:{secondsLeft.toString().padStart(2, '0')}
          </div>

          <button
            type="button"
            onClick={handleFinishSpeaking}
            className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-zinc-100 font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors"
          >
            Everyone Finished Speaking → Proceed to Vote
          </button>
        </div>
      )}

      {/* Voting Phase */}
      {room.status === 'voting' && (
        <div className="glass-card border border-white/10 p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="text-center space-y-1">
            <Award className="w-8 h-8 text-[#f59e0b] mx-auto" />
            <h2 className="text-2xl font-serif-display font-bold text-zinc-100">Cast Your Peer Votes</h2>
            <p className="text-xs text-zinc-400 font-medium">
              Celebrate your friends! Vote on who presented the best argument, delivery, or answer.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { id: 'bestArgument', title: 'Best Argument 🏆' },
              { id: 'bestDelivery', title: 'Best Delivery 🎙️' },
              { id: 'mostCreative', title: 'Most Creative 🎨' },
              { id: 'funniest', title: 'Funniest Answer 😂' },
            ].map((cat) => (
              <div key={cat.id} className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-2">
                <span className="text-xs font-bold text-[#f59e0b] uppercase tracking-wider">{cat.title}</span>
                <div className="flex flex-wrap gap-2">
                  {room.players.map((p) => {
                    const isVoted = activeVotes[cat.id] === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleVote(cat.id, p.id)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-full cursor-pointer transition-all ${
                          isVoted
                            ? 'bg-[#f59e0b] text-[#080c14] font-bold shadow-sm'
                            : 'bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10'
                        }`}
                      >
                        {isVoted ? '✓ ' : ''} {p.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <button
              type="button"
              onClick={() => setRoom((prev) => ({ ...prev, status: 'lobby' }))}
              className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-zinc-200 font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors"
            >
              Back to Group Lobby
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
