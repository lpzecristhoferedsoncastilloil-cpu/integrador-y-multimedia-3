import React from 'react';
import { useNavigate } from 'react-router-dom';

const MinigamesHub = () => {
  const navigate = useNavigate();

  const games = [
    {
      id: 'maze',
      title: 'EL LABERINTO DE LAS HABITACIONES',
      subtitle: 'La Casa del Alfabeto',
      color: '#FF3B30',
      route: '/minigames/maze',
      testid: 'minigame-maze-card'
    },
    {
      id: 'cheese',
      title: 'EL RETO DEL QUESO Y LOS RATONES',
      subtitle: 'Rimas y Silabas',
      color: '#FFCC00',
      route: '/minigames/cheese',
      testid: 'minigame-cheese-card'
    },
    {
      id: 'hangman',
      title: 'EL RESCATE DE LAS LETRAS',
      subtitle: 'Ahorcado Interactivo',
      color: '#007AFF',
      route: '/minigames/hangman',
      testid: 'minigame-hangman-card'
    },
  ];

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#87CEEB' }}>
      <div className="max-w-6xl mx-auto">
        <h1
          className="text-6xl text-center mb-4"
          style={{ fontFamily: 'VT323, monospace', color: '#111827' }}
          data-testid="minigames-title"
        >
          MINIJUEGOS
        </h1>
        <p className="text-center text-xl mb-12" style={{ fontFamily: 'Fredoka, sans-serif' }}>
          Elige tu aventura educativa
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {games.map((game) => (
            <button
              key={game.id}
              data-testid={game.testid}
              onClick={() => navigate(game.route)}
              className="p-6 border-4 border-black text-left transition-all"
              style={{
                backgroundColor: game.color,
                boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)',
                color: '#111827',
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translate(4px, 4px)';
                e.currentTarget.style.boxShadow = '4px 4px 0px 0px rgba(0,0,0,1)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translate(0, 0)';
                e.currentTarget.style.boxShadow = '8px 8px 0px 0px rgba(0,0,0,1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translate(0, 0)';
                e.currentTarget.style.boxShadow = '8px 8px 0px 0px rgba(0,0,0,1)';
              }}
            >
              <h2 className="text-2xl mb-2" style={{ fontFamily: 'VT323, monospace' }}>
                {game.title}
              </h2>
              <p className="text-lg" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                {game.subtitle}
              </p>
              <div className="mt-4 inline-block px-4 py-2 bg-white border-4 border-black" style={{ fontFamily: 'VT323, monospace', fontSize: '20px' }}>
                JUGAR →
              </div>
            </button>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button
            data-testid="minigames-back-button"
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-white border-4 border-black"
            style={{
              fontFamily: 'VT323, monospace',
              fontSize: '24px',
              boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
            }}
          >
            ← VOLVER
          </button>
        </div>
      </div>
    </div>
  );
};

export default MinigamesHub;
