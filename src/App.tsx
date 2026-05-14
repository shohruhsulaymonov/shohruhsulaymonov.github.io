/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Play, RefreshCcw, CheckCircle2, AlertCircle, Ban, X, MessageSquare, Landmark } from 'lucide-react';
import { Category, Question, Team, GameState } from './types';
import { GAME_CATEGORIES, TEAM_COLORS } from './constants';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('setup');
  const [numTeams, setNumTeams] = useState(3);
  const [teamNames, setTeamNames] = useState<string[]>(['Команда А', 'Команда Б', 'Команда В', 'Команда Г', 'Команда Д']);
  const [teams, setTeams] = useState<Team[]>([]);
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set());
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userVerdict, setUserVerdict] = useState<'legal' | 'grey' | 'illegal' | null>(null);

  const startGame = () => {
    const initialTeams: Team[] = Array.from({ length: numTeams }).map((_, i) => ({
      id: `team-${i}`,
      name: teamNames[i] || `Команда ${i + 1}`,
      score: 0,
      color: TEAM_COLORS[i],
    }));
    setTeams(initialTeams);
    setGameState('board');
  };

  const handleSelectQuestion = (category: Category, question: Question) => {
    if (usedQuestions.has(question.id)) return;
    setActiveQuestion(question);
    setActiveCategory(category);
    setShowAnswer(false);
    setUserVerdict(null);
    setGameState('clue');
  };

  const handleVerdict = (verdict: 'legal' | 'grey' | 'illegal') => {
    setUserVerdict(verdict);
    setShowAnswer(true);
  };

  const awardPoints = (teamId: string) => {
    if (!activeQuestion) return;
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, score: t.score + activeQuestion.pts } : t));
    finalizeQuestion();
  };

  const finalizeQuestion = () => {
    if (activeQuestion) {
      setUsedQuestions(prev => {
        const next = new Set(prev);
        next.add(activeQuestion.id);
        return next;
      });
    }
    setActiveQuestion(null);
    setActiveCategory(null);
    setGameState('board');
  };

  useEffect(() => {
    if (usedQuestions.size === GAME_CATEGORIES.length * 5 && usedQuestions.size > 0) {
      setGameState('final');
    }
  }, [usedQuestions.size]);

  const renderSetup = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-screen p-6 text-center"
    >
      <div className="mb-12">
        <div className="inline-flex bg-accent/20 p-4 rounded-2xl mb-6 text-accent">
          <Landmark size={48} />
        </div>
        <h1 className="font-display font-extrabold text-6xl md:text-8xl tracking-tight mb-2 uppercase">
          ФИНТЕХ<span className="text-accent">:</span> СВОЯ ИГРА
        </h1>
        <p className="text-muted tracking-[0.2em] uppercase text-xs font-bold">Интеллектуальная битва • Раунд 1</p>
      </div>

      <div className="bg-surface border border-border-bold rounded-[24px] p-8 max-w-md w-full text-left shadow-2xl relative">
        <div className="absolute -top-3 -right-3 bg-accent text-bg px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest px-2">Setup</div>
        <h3 className="font-display font-bold text-xl mb-6 text-accent uppercase tracking-tight">Настройка игры</h3>
        
        <div className="mb-6">
          <label className="block text-xs font-black text-muted uppercase tracking-[0.15em] mb-2">Количество команд</label>
          <select 
            value={numTeams}
            onChange={(e) => setNumTeams(Number(e.target.value))}
            className="w-full bg-surface2 border border-border-subtle rounded-xl p-3 text-sm focus:border-accent outline-none cursor-pointer appearance-none text-white"
          >
            {[2, 3, 4, 5].map(n => <option key={n} value={n} className="bg-surface2">{n} команды</option>)}
          </select>
        </div>

        <div className="mb-8">
          <label className="block text-xs font-black text-muted uppercase tracking-[0.15em] mb-2">Названия команд</label>
          <div className="space-y-3">
            {Array.from({ length: numTeams }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: TEAM_COLORS[i] }} />
                <input 
                  type="text"
                  value={teamNames[i]}
                  onChange={(e) => {
                    const newNames = [...teamNames];
                    newNames[i] = e.target.value;
                    setTeamNames(newNames);
                  }}
                  className="flex-1 bg-surface2 border border-border-subtle rounded-xl p-3 text-sm focus:border-accent outline-none transition-colors text-white"
                  placeholder={`Команда ${i + 1}`}
                />
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={startGame}
          className="w-full bg-accent hover:opacity-90 active:scale-95 transition-all text-bg font-display font-black py-4 rounded-2xl flex items-center justify-center gap-2 tracking-tight uppercase"
        >
          ПОЕХАЛИ <Play size={18} fill="currentColor" />
        </button>
      </div>
    </motion.div>
  );

  const renderBoard = () => {
    const totalQuestions = GAME_CATEGORIES.length * 5;
    const remaining = totalQuestions - usedQuestions.size;

    return (
      <div className="min-h-screen p-4 md:p-8 flex flex-col gap-6">
        {/* Bento Header */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-4 bg-surface border border-border-bold rounded-2xl p-6 flex flex-row items-center gap-6 shadow-sm">
            <div className="bg-accent p-3 rounded-xl text-bg shrink-0">
              <Landmark size={24} />
            </div>
            <div>
              <h1 className="font-display font-black text-xl tracking-tight uppercase">ФИНТЕХ: СВОЯ ИГРА</h1>
              <p className="text-xs text-muted font-bold uppercase tracking-widest">Интеллектуальная битва • Раунд 1</p>
            </div>
          </div>
          
          <div className="md:col-span-2 bg-gradient-to-br from-[#1e1b4b] to-[#312e81] border border-border-bold rounded-2xl p-6 flex flex-col justify-center items-end text-right shadow-sm">
            <span className="text-[11px] font-black opacity-70 uppercase tracking-widest mb-1">ОСТАЛОСЬ ВОПРОСОВ</span>
            <div className="font-display font-black text-4xl leading-none">
              {remaining} <span className="opacity-40 text-2xl tracking-tighter">/ {totalQuestions}</span>
            </div>
          </div>
        </div>

        {/* Game Board Grid */}
        <div className="flex-1 bg-surface/30 border border-border-bold rounded-[32px] p-4 md:p-8 grid grid-cols-2 md:grid-cols-5 gap-4 overflow-auto shadow-inner">
          {GAME_CATEGORIES.map(cat => (
            <div key={cat.id} className="flex flex-col gap-4">
              <div className="h-[60px] flex items-center justify-center border-b-2 border-border-bold mb-2">
                <span className="font-display font-black text-xs uppercase tracking-[0.12em] text-accent text-center px-2">
                  {cat.name}
                </span>
              </div>
              {cat.questions.map(q => {
                const isUsed = usedQuestions.has(q.id);
                return (
                  <button
                    key={q.id}
                    disabled={isUsed}
                    onClick={() => handleSelectQuestion(cat, q)}
                    className={`flex-1 min-h-[90px] rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isUsed 
                      ? 'bg-transparent border border-transparent opacity-20 cursor-default' 
                      : 'bg-surface2 border border-border-subtle group hover:border-gold hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(250,204,21,0.15)] active:scale-95 cursor-pointer shadow-md'
                    }`}
                  >
                    <span 
                      className={`font-display font-black text-3xl transition-colors ${
                        isUsed ? 'text-muted' : 'text-gold group-hover:text-white'
                      }`}
                    >
                      {isUsed ? 'X' : q.pts}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Team Scores Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {teams.map((team) => (
            <div 
              key={team.id} 
              className="bg-surface border border-border-bold rounded-2xl p-4 flex justify-between items-center shadow-sm"
              style={{ borderLeftWidth: '6px', borderLeftColor: team.color }}
            >
              <div>
                <p className="text-xs font-black text-muted uppercase tracking-widest mb-0.5">{team.name}</p>
                <p className="text-[10px] font-bold opacity-40 uppercase tracking-tighter">TEAM {team.id.split('-')[1]}</p>
              </div>
              <span className="font-display font-black text-3xl text-success tracking-tighter">{team.score}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderClue = () => {
    if (!activeQuestion || !activeCategory) return null;
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="max-w-4xl w-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <span 
                className="text-xs font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full border border-current"
                style={{ color: activeCategory.color }}
              >
                {activeCategory.name}
              </span>
              <span className="font-display text-3xl font-black text-gold tracking-tighter uppercase">{activeQuestion.pts} ОЧКОВ</span>
            </div>
          </div>

          <div className="bg-surface border-2 border-border-bold rounded-[40px] p-10 md:p-16 mb-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-[-10%] right-[-5%] p-8 opacity-5 text-accent pointer-events-none">
              <MessageSquare size={240} />
            </div>
            <p className="text-2xl md:text-4xl font-display font-medium leading-[1.4] relative z-10 text-white">
              {activeQuestion.clue}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!showAnswer ? (
              <motion.div 
                key="verdict-ui"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4">
                  <div className="h-px bg-border-bold flex-1" />
                  <p className="text-muted text-xs font-black uppercase tracking-[0.3em]">Какой ваш вердикт?</p>
                  <div className="h-px bg-border-bold flex-1" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <button 
                    onClick={() => handleVerdict('legal')}
                    className="bg-surface border-2 border-border-bold hover:border-success transition-all rounded-3xl p-6 flex flex-col items-center gap-4 group active:scale-95 shadow-lg"
                  >
                    <div className="bg-success/10 p-4 rounded-2xl text-success group-hover:bg-success group-hover:text-bg transition-all">
                      <CheckCircle2 size={32} />
                    </div>
                    <span className="font-display font-black text-sm uppercase tracking-widest">ЛЕГАЛЬНО</span>
                  </button>
                  <button 
                    onClick={() => handleVerdict('grey')}
                    className="bg-surface border-2 border-border-bold hover:border-warning transition-all rounded-3xl p-6 flex flex-col items-center gap-4 group active:scale-95 shadow-lg"
                  >
                    <div className="bg-warning/10 p-4 rounded-2xl text-warning group-hover:bg-warning group-hover:text-bg transition-all">
                      <AlertCircle size={32} />
                    </div>
                    <span className="font-display font-black text-sm uppercase tracking-widest">РИСКОВАННО</span>
                  </button>
                  <button 
                    onClick={() => handleVerdict('illegal')}
                    className="bg-surface border-2 border-border-bold hover:border-danger transition-all rounded-3xl p-6 flex flex-col items-center gap-4 group active:scale-95 shadow-lg"
                  >
                    <div className="bg-danger/10 p-4 rounded-2xl text-danger group-hover:bg-danger group-hover:text-bg transition-all">
                      <Ban size={32} />
                    </div>
                    <span className="font-display font-black text-sm uppercase tracking-widest">ЗАПРЕЩЕНО</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="answer-ui"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-12"
              >
                <div className="bg-surface2 border-2 border-border-bold rounded-[32px] p-8 md:p-12 relative shadow-2xl">
                  <div className={`absolute top-0 right-10 -translate-y-1/2 px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest border-2 ${
                    activeQuestion.verdict === 'legal' ? 'bg-success text-bg border-success' :
                    activeQuestion.verdict === 'grey' ? 'bg-warning text-bg border-warning' : 'bg-danger text-bg border-danger'
                  }`}>
                    ОТВЕТ: {
                      activeQuestion.verdict === 'legal' ? 'Легально' :
                      activeQuestion.verdict === 'grey' ? 'Рискованно' : 'Запрещено'
                    }
                  </div>
                  
                  <div className="mb-8 text-left">
                    <h4 className="text-muted text-xs font-black uppercase tracking-[0.2em] mb-4">РАСШИФРОВКА</h4>
                    <p className="text-3xl font-display font-bold text-accent mb-4 uppercase tracking-tighter">{activeQuestion.answer}</p>
                    <p className="text-lg text-white/70 leading-relaxed max-w-2xl">{activeQuestion.explanation}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <p className="text-xs font-black text-muted uppercase tracking-[0.3em] text-center">НАЧИСЛИТЬ ОЧКИ</p>
                  <div className="flex flex-wrap justify-center gap-4">
                    {teams.map(team => (
                      <button 
                        key={team.id}
                        onClick={() => awardPoints(team.id)}
                        className="bg-surface hover:scale-[1.05] border-2 border-border-bold hover:border-accent transition-all rounded-full px-8 py-4 flex items-center gap-3 active:scale-95 shadow-md"
                      >
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color }} />
                        <span className="font-display font-black text-sm uppercase tracking-tight">{team.name}</span>
                      </button>
                    ))}
                    <button 
                      onClick={finalizeQuestion}
                      className="border-2 border-dashed border-border-bold hover:border-white/20 px-8 py-4 rounded-full text-muted hover:text-white transition-all font-display font-bold text-sm uppercase tracking-widest"
                    >
                      ПРОПУСТИТЬ
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  const renderFinal = () => {
    const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen p-6 flex flex-col items-center justify-center text-center"
      >
        <div className="bg-gold/20 p-8 rounded-[40px] mb-10 text-gold shadow-[0_0_50px_rgba(250,204,21,0.1)]">
          <Trophy size={100} strokeWidth={1.5} />
        </div>
        <h1 className="font-display font-black text-6xl md:text-8xl tracking-tighter mb-4 uppercase">ФИНАЛ</h1>
        <p className="text-muted tracking-[0.5em] uppercase text-xs font-black mb-16">ИТОГИ БИТВЫ</p>

        <div className="max-w-2xl w-full grid grid-cols-1 gap-4 mb-16">
          {sortedTeams.map((team, i) => (
            <motion.div 
              key={team.id}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.15 }}
              className={`flex items-center gap-6 bg-surface border-2 rounded-[32px] p-8 ${i === 0 ? 'border-gold scale-105 shadow-[0_20px_50px_rgba(250,204,21,0.1)]' : 'border-border-bold opacity-60'}`}
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-display font-black text-2xl" style={{ backgroundColor: `${team.color}20`, color: team.color }}>
                {i + 1}
              </div>
              <div className="flex-1 text-left">
                <p className="text-xs font-black text-muted uppercase tracking-widest mb-1">КОМАНДА {team.id.split('-')[1]}</p>
                <p className="font-display font-black text-2xl md:text-3xl text-white uppercase tracking-tight">{team.name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-muted uppercase tracking-widest mb-1">СЧЕТ</p>
                <p className={`font-display font-black text-4xl leading-none ${i === 0 ? 'text-gold' : 'text-success'}`}>{team.score}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <button 
          onClick={() => window.location.reload()}
          className="bg-accent hover:bg-white hover:text-bg border-4 border-accent rounded-[32px] px-12 py-6 font-display font-black text-xl tracking-tight transition-all flex items-center gap-4 shadow-xl"
        >
          <RefreshCcw size={28} /> НОВАЯ ИГРА
        </button>
      </motion.div>
    );
  };

  return (
    <div className="selection:bg-accent selection:text-bg font-sans overflow-x-hidden min-h-screen bg-bg relative text-slate-200">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-20">
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-gold/10 rounded-full blur-[140px]" />
      </div>

      <main className="relative z-10 w-full max-w-[1400px] mx-auto min-h-screen flex flex-col">
        <AnimatePresence mode="wait">
          {gameState === 'setup' && renderSetup()}
          {gameState === 'board' && <motion.div key="board" className="flex-1 flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderBoard()}</motion.div>}
          {gameState === 'clue' && <motion.div key="clue" className="flex-1 flex flex-col" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>{renderClue()}</motion.div>}
          {gameState === 'final' && renderFinal()}
        </AnimatePresence>
      </main>
    </div>
  );
}
