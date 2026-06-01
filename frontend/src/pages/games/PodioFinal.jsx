import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Trophy, RefreshCw, LogOut, Sparkles, Star, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

// A helper to get a cute kid-friendly animal emoji avatar based on nickname
function getAnimalAvatar(nickname = '', fotoPaciente = '') {
  if (fotoPaciente) {
    return <img src={fotoPaciente} alt={nickname} className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-md" />;
  }
  const animals = ['🦁', '🐯', '🐼', '🦊', '🐨', '🐰', '🐵', '🦄', '🐬', '🐸', '🦉', '🐝'];
  let hash = 0;
  for (let i = 0; i < nickname.length; i++) {
    hash = nickname.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % animals.length;
  return (
    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl shadow-md border-2 border-indigo-200 select-none">
      {animals[index]}
    </div>
  );
}

export default function PodioFinal({ sessionData, onRetry, onExit }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  
  // Animation states
  const [showBronze, setShowBronze] = useState(false);
  const [showSilver, setShowSilver] = useState(false);
  const [showGold, setShowGold] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [showConfetti, setShowConfetti] = useState([]);

  useEffect(() => {
    const fetchPodio = async () => {
      try {
        // Query the podio data from Django backend in real-time
        const res = await api.get(`/games/podio/${sessionData.sessionId}/`);
        setData(res.data);
      } catch (err) {
        console.error(err);
        toast.error('Error al cargar ranking del podio');
        // Fail-safe default data if server fails
        setData({
          game_type: sessionData.gameType || 'fonologica',
          current_score: sessionData.score,
          current_position: 1,
          total_participants: 1,
          is_top_3: true,
          nickname: 'Jugador',
          top_3: [
            { nickname: 'Tú', score: sessionData.score, rank: 1 }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (sessionData?.sessionId) {
      fetchPodio();
    } else {
      // Fake session default
      setLoading(false);
      setData({
        game_type: 'fonologica',
        current_score: sessionData?.score || 0,
        current_position: 1,
        total_participants: 1,
        is_top_3: true,
        nickname: 'Invitado',
        top_3: [
          { nickname: 'Invitado', score: sessionData?.score || 0, rank: 1 }
        ]
      });
    }
  }, [sessionData]);

  // Sequential animation triggers
  useEffect(() => {
    if (!loading && data) {
      // 3er Lugar sube primero
      const t1 = setTimeout(() => setShowBronze(true), 400);
      // 2do Lugar sube segundo
      const t2 = setTimeout(() => setShowSilver(true), 1100);
      // 1er Lugar sube al final
      const t3 = setTimeout(() => {
        setShowGold(true);
        setShowSparkles(true);
        // Lanzar confeti/destellos
        const confetis = Array.from({ length: 25 }, (_, i) => ({
          id: i,
          x: 20 + Math.random() * 60,
          y: 10 + Math.random() * 40,
          size: Math.random() * 20 + 10,
          delay: Math.random() * 0.5,
          emoji: ['🎉', '✨', '⭐', '🌟', '💫', '👑'][Math.floor(Math.random() * 6)]
        }));
        setShowConfetti(confetis);
      }, 1800);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [loading, data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans">
        <Loader2 className="w-16 h-16 animate-spin text-yellow-400 mb-4" />
        <h2 className="text-xl font-bold font-display animate-pulse">¡Calculando resultados en el podio...!</h2>
        <p className="text-sm text-indigo-200 mt-2">Un momento mientras recolectamos las marcas globales...</p>
      </div>
    );
  }

  const { top_3 = [], current_score, current_position, total_participants, is_top_3, nickname, foto_paciente } = data || {};

  // Mapeamos los ganadores del podio
  const oro = top_3.find(p => p.rank === 1);
  const plata = top_3.find(p => p.rank === 2);
  const bronce = top_3.find(p => p.rank === 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-950 flex flex-col items-center justify-between p-6 pb-12 text-white font-sans overflow-hidden relative select-none">
      
      {/* Estilo local para animaciones personalizadas del Podio */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatAvatar {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes sparkleScale {
          0%, 100% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        @keyframes confettiFall {
          0% { transform: translateY(-50px) rotate(0deg) scale(0.5); opacity: 1; }
          100% { transform: translateY(600px) rotate(360deg) scale(1); opacity: 0; }
        }
        .animate-avatar {
          animation: floatAvatar 3s ease-in-out infinite;
        }
        .animate-sparkle {
          animation: sparkleScale 1.5s ease-in-out infinite;
        }
        .animate-confetti {
          animation: confettiFall 2.5s ease-out forwards;
        }
      `}} />

      {/* Confetti Animation Elements */}
      {showConfetti.map(c => (
        <div
          key={c.id}
          className="absolute animate-confetti z-50 pointer-events-none"
          style={{
            left: `${c.x}%`,
            top: `${c.y}%`,
            fontSize: `${c.size}px`,
            animationDelay: `${c.delay}s`
          }}
        >
          {c.emoji}
        </div>
      ))}

      {/* Header */}
      <div className="text-center mt-4 z-10 space-y-2">
        <div className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse shadow-sm">
          <Trophy className="w-4 h-4 text-yellow-400" /> ¡Juego Terminado!
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display bg-gradient-to-r from-yellow-300 via-white to-purple-300 bg-clip-text text-transparent drop-shadow-md">
          Gran Podio NeuroGym
        </h1>
        <p className="text-sm text-indigo-200">¿Quién logró el mayor récord histórico?</p>
      </div>

      {/* Podio Principal (Visual Kahoot) */}
      <div className="w-full max-w-xl flex items-end justify-center gap-3 sm:gap-6 my-auto pt-24 min-h-[380px] z-10 px-4">
        
        {/* SEGUNDO LUGAR (PLATA) */}
        <div className="flex flex-col items-center flex-1 transition-all duration-700">
          {plata && (
            <div className={`flex flex-col items-center mb-2 transition-all duration-1000 ${showSilver ? 'opacity-100 scale-100 animate-avatar' : 'opacity-0 scale-50'}`}>
              {getAnimalAvatar(plata.nickname, plata.foto)}
              <span className="text-sm font-bold mt-1 text-slate-300 truncate max-w-[85px]">{plata.nickname}</span>
              <span className="text-[11px] font-semibold text-slate-400 bg-slate-500/20 px-2 py-0.5 rounded-full mt-0.5">{plata.score} pts</span>
            </div>
          )}
          <div
            className="w-full bg-gradient-to-t from-slate-600 via-slate-500 to-slate-400 rounded-t-2xl shadow-lg border-t-2 border-slate-300 flex items-center justify-center font-black text-4xl sm:text-5xl text-slate-200/50 transition-all duration-1000"
            style={{
              height: showSilver ? '140px' : '0px',
              transitionDelay: '0.1s'
            }}
          >
            {showSilver && '2'}
          </div>
        </div>

        {/* PRIMER LUGAR (ORO) */}
        <div className="flex flex-col items-center flex-1 transition-all duration-700 relative">
          
          {/* Sparkles y flashes para 1er Lugar */}
          {showSparkles && (
            <>
              <Sparkles className="w-12 h-12 text-yellow-300 absolute -top-16 -left-4 animate-sparkle" />
              <Star className="w-10 h-10 fill-yellow-400 text-yellow-400 absolute -top-20 right-2 animate-pulse" />
              <div className="absolute inset-0 bg-yellow-400/10 rounded-full filter blur-2xl -z-10 animate-pulse" style={{ width: '150px', height: '150px', top: '-100px', left: '50%', marginLeft: '-75px' }} />
            </>
          )}

          {oro && (
            <div className={`flex flex-col items-center mb-2 transition-all duration-1000 z-10 ${showGold ? 'opacity-100 scale-110 animate-avatar' : 'opacity-0 scale-50'}`}>
              <div className="relative">
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl select-none">👑</span>
                {getAnimalAvatar(oro.nickname, oro.foto)}
              </div>
              <span className="text-base font-black mt-1 text-yellow-300 truncate max-w-[95px] drop-shadow-sm">{oro.nickname}</span>
              <span className="text-xs font-bold text-yellow-400 bg-yellow-400/20 px-2.5 py-0.5 rounded-full mt-0.5 border border-yellow-400/30">{oro.score} pts</span>
            </div>
          )}
          <div
            className="w-full bg-gradient-to-t from-yellow-600 via-yellow-500 to-amber-400 rounded-t-2xl shadow-xl border-t-2 border-yellow-300 flex items-center justify-center font-black text-5xl sm:text-6xl text-yellow-200/50 transition-all duration-1000"
            style={{
              height: showGold ? '200px' : '0px',
              transitionDelay: '0.1s'
            }}
          >
            {showGold && '1'}
          </div>
        </div>

        {/* TERCER LUGAR (BRONCE) */}
        <div className="flex flex-col items-center flex-1 transition-all duration-700">
          {bronce && (
            <div className={`flex flex-col items-center mb-2 transition-all duration-1000 ${showBronze ? 'opacity-100 scale-100 animate-avatar' : 'opacity-0 scale-50'}`}>
              {getAnimalAvatar(bronce.nickname, bronce.foto)}
              <span className="text-sm font-bold mt-1 text-amber-500 truncate max-w-[85px]">{bronce.nickname}</span>
              <span className="text-[11px] font-semibold text-amber-500 bg-amber-600/20 px-2 py-0.5 rounded-full mt-0.5">{bronce.score} pts</span>
            </div>
          )}
          <div
            className="w-full bg-gradient-to-t from-amber-800 via-amber-700 to-amber-600 rounded-t-2xl shadow-md border-t-2 border-amber-500 flex items-center justify-center font-black text-4xl sm:text-5xl text-amber-800/40 transition-all duration-1000"
            style={{
              height: showBronze ? '95px' : '0px',
              transitionDelay: '0.1s'
            }}
          >
            {showBronze && '3'}
          </div>
        </div>

      </div>

      {/* Sección Inferior: Banner Fuera del Top 3 */}
      <div className="w-full max-w-xl z-10 px-4 space-y-6">
        
        {!is_top_3 && data && (
          <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-indigo-950 border-2 border-indigo-500/30 rounded-2xl p-4 text-center shadow-lg transform hover:scale-102 transition animate-bounce">
            <span className="text-2xl mr-2">💫</span>
            <span className="text-sm font-semibold text-indigo-100">
              ¡Buen intento, <strong className="text-indigo-300 font-bold">{nickname}</strong>! Quedaste en el <strong className="text-yellow-400 font-black text-base">Puesto {current_position}</strong> de {total_participants} niños con <strong className="text-yellow-300 font-bold">{current_score} puntos</strong>.
            </span>
          </div>
        )}
        
        {is_top_3 && data && (
          <div className="bg-gradient-to-r from-yellow-500/10 via-yellow-500/20 to-yellow-500/10 border border-yellow-400/30 rounded-2xl p-4 text-center shadow-lg">
            <span className="text-2xl mr-2">🌟</span>
            <span className="text-sm font-semibold text-yellow-100">
              ¡Excelente, <strong className="text-yellow-300 font-bold">{nickname}</strong>! Has entrado al <strong className="text-yellow-400 font-black text-base">Top 3 del Podio</strong> con tu grandiosa puntuación de <strong className="text-yellow-300 font-black">{current_score} pts</strong>.
            </span>
          </div>
        )}

        {/* Botones Finales */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onRetry}
            className="flex items-center justify-center gap-2 h-14 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-2xl text-base font-extrabold shadow-lg hover:shadow-emerald-500/20 transform active:scale-95 transition-all"
          >
            <RefreshCw className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
            Volver a intentar
          </button>
          
          <button
            onClick={onExit}
            className="flex items-center justify-center gap-2 h-14 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white rounded-2xl text-base font-extrabold shadow-lg hover:shadow-rose-500/20 transform active:scale-95 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Salir
          </button>
        </div>

      </div>

    </div>
  );
}
