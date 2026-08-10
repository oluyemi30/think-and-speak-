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
        <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-black bg-[#FF4F00] text-white text-[10px] font-black uppercase tracking-[0.2em]">
          <Users className="w-3.5 h-3.5" /> GROUP PRACTICE ROOM
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-black uppercase tracking-tighter leading-tight">
          SPEAK WITH FRIENDS &amp; PEERS
        </h1>

        <p className="text-xs sm:text-sm text-gray-700 max-w-xl mx-auto font-bold uppercase tracking-wider leading-relaxed">
          Spin a random topic for everyone in the room. Each person gets 60 seconds. Vote on the most compelling argument, best delivery, or funniest answer!
        </p>
      </div>

      {/* Lobby Room Card */}
      {room.status === 'lobby' && (
        <div className="bg-white border-2 border-black p-6 sm:p-8 space-y-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-gray-200">
            <div>
              <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">ROOM CODE</span>
              <div className="text-3xl font-black text-[#FF4F00] font-mono tracking-widest">{room.code}</div>
            </div>

            <span className="px-3 py-1 border-2 border-black bg-black text-white text-[10px] font-black uppercase tracking-widest">
              ● ROOM ACTIVE
            </span>
          </div>

          {/* Players List */}
          <div>
            <h3 className="text-[10px] font-black text-[#FF4F00] uppercase tracking-[0.2em] mb-3">
              PLAYERS IN ROOM ({room.players.length})
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {room.players.map((p) => (
                <div
                  key={p.id}
                  className="bg-gray-100 border-2 border-black p-3 text-center space-y-1 relative"
                >
                  <div className="w-10 h-10 bg-black text-white font-black flex items-center justify-center mx-auto text-sm border-2 border-black">
                    {p.name.charAt(0)}
                  </div>
                  <span className="block text-xs font-black text-black truncate uppercase">{p.name}</span>
                  {p.isHost && (
                    <span className="inline-block text-[9px] bg-[#FF4F00] text-white px-2 py-0.5 font-black uppercase tracking-wider border border-black">
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
              className="flex-1 bg-white border-2 border-black p-3 text-xs font-bold text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF4F00]"
            />
            <button
              type="submit"
              className="px-5 py-3 border-2 border-black bg-black text-white hover:bg-[#FF4F00] text-xs font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
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
              className="w-full sm:w-auto px-8 py-5 bg-[#FF4F00] hover:bg-[#E04500] text-white font-black text-base uppercase tracking-wider border-2 border-black flex items-center justify-center gap-2 mx-auto cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              <Dices className="w-5 h-5" />
              <span>SPIN FOR EVERYONE 🎲</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Speaking Phase */}
      {room.status === 'speaking' && room.topic && (
        <div className="bg-white border-2 border-black p-6 sm:p-8 space-y-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center">
          <div className="px-4 py-1 bg-[#FF4F00] text-white text-[10px] font-black inline-block uppercase tracking-[0.2em] border-2 border-black">
            🎙️ GROUP SPEAKING PHASE — 60 SECONDS
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-black text-black italic uppercase">&ldquo;{room.topic.topic}&rdquo;</h2>
            <p className="text-sm text-gray-700 font-extrabold">{room.topic.challenge}</p>
          </div>

          <div className="text-7xl font-black font-mono text-black my-4">
            00:{secondsLeft.toString().padStart(2, '0')}
          </div>

          <button
            type="button"
            onClick={handleFinishSpeaking}
            className="px-6 py-3 border-2 border-black bg-black text-white hover:bg-[#FF4F00] font-black text-xs uppercase tracking-wider cursor-pointer transition-colors"
          >
            Everyone Finished Speaking → Proceed to Vote
          </button>
        </div>
      )}

      {/* Voting Phase */}
      {room.status === 'voting' && (
        <div className="bg-white border-2 border-black p-6 sm:p-8 space-y-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-center space-y-1">
            <Award className="w-8 h-8 text-[#FF4F00] mx-auto" />
            <h2 className="text-2xl font-black text-black uppercase tracking-tight">Cast Your Peer Votes</h2>
            <p className="text-xs text-gray-600 font-bold uppercase tracking-wider">
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
              <div key={cat.id} className="bg-gray-100 border-2 border-black p-4 space-y-2">
                <span className="text-[10px] font-black text-[#FF4F00] uppercase tracking-[0.2em]">{cat.title}</span>
                <div className="flex flex-wrap gap-2">
                  {room.players.map((p) => {
                    const isVoted = activeVotes[cat.id] === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleVote(cat.id, p.id)}
                        className={`px-3 py-1.5 text-xs font-black uppercase cursor-pointer border-2 transition-all ${
                          isVoted
                            ? 'border-black bg-black text-white'
                            : 'border-gray-300 bg-white text-black hover:border-black'
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
              className="px-6 py-3 border-2 border-black bg-black text-white hover:bg-gray-800 font-black text-xs uppercase tracking-wider cursor-pointer"
            >
              Back to Group Lobby
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
