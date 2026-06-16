import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  const games = [
    {
      id: 'maze',
      title: 'EL LABERINTO DE LAS HABITACIONES',
      subtitle: 'La Casa del Alfabeto',
      description: 'Resuelve acertijos para abrir puertas y descubre los 3 portales ocultos.',
      color: '#FF3B30',
      route: '/minigames/maze',
      testid: 'landing-maze-button'
    },
    {
      id: 'cheese',
      title: 'EL RETO DEL QUESO Y LOS RATONES',
      subtitle: 'Rimas y Silabas',
      description: 'Atrapa los ratones con palabras que rimen con la palabra clave.',
      color: '#FFCC00',
      route: '/minigames/cheese',
      testid: 'landing-cheese-button'
    },
    {
      id: 'hangman',
      title: 'EL RESCATE DE LAS LETRAS',
      subtitle: 'Ahorcado Interactivo',
      description: 'Adivina la palabra oculta antes de que se complete el ahorcado.',
      color: '#007AFF',
      route: '/minigames/hangman',
      testid: 'landing-hangman-button'
    },
    {
      id: 'machine',
      title: 'LA MAQUINA DE LAS SILABAS',
      subtitle: 'Prefijos y Sufijos',
      description: 'Une prefijos y sufijos en la cinta transportadora para construir palabras.',
      color: '#4CD964',
      route: '/minigames/machine',
      testid: 'landing-machine-button'
    },
    {
      id: 'river',
      title: 'EL RIO DE LAS PALABRAS CRUZADAS',
      subtitle: 'Sinonimos y Antonimos',
      description: 'Navega el rio y choca contra los troncos con palabras correctas.',
      color: '#1E90FF',
      route: '/minigames/river',
      testid: 'landing-river-button'
    },
    {
      id: 'warehouse',
      title: 'EL ALMACEN DE LAS LETRAS PERDIDAS',
      subtitle: 'Sopa de Letras e Intrusos',
      description: 'Encuentra las palabras de la categoria correcta y evita los intrusos.',
      color: '#FF8C00',
      route: '/minigames/warehouse',
      testid: 'landing-warehouse-button'
    },
    {
      id: 'temple',
      title: 'EL ECO DE LAS SILABAS',
      subtitle: 'Templo de los Sonidos',
      description: 'Identifica si la palabra es Aguda, Llana o Esdrujula al ritmo del gong.',
      color: '#9B59B6',
      route: '/minigames/temple',
      testid: 'landing-temple-button'
    },
    {
      id: 'train',
      title: 'EL TREN DE LAS LETRAS',
      subtitle: 'Clasificacion de Objetos',
      description: 'Arrastra los juguetes al vagon con la letra correcta. Para los mas pequenos!',
      color: '#FF6F61',
      route: '/minigames/train',
      testid: 'landing-train-button'
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#87CEEB' }}>
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1
            className="text-7xl mb-6"
            style={{ fontFamily: 'VT323, monospace', color: '#111827' }}
            data-testid="landing-title"
          >
            WORD EXPLORER
          </h1>
          <p className="text-2xl mb-2" style={{ fontFamily: 'Fredoka, sans-serif', color: '#111827' }}>
            Aventura Educativa 3D
          </p>
          <p className="text-xl" style={{ fontFamily: 'Fredoka, sans-serif', color: '#4B5563' }}>
            Elige un minijuego para comenzar
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
              <p className="text-lg mb-3 font-bold" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                {game.subtitle}
              </p>
              <p className="text-sm mb-4" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                {game.description}
              </p>
              <div className="inline-block px-4 py-2 bg-white border-4 border-black" style={{ fontFamily: 'VT323, monospace', fontSize: '20px' }}>
                JUGAR →
              </div>
            </button>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-block bg-white border-4 border-black p-6" style={{ boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)' }}>
            <h3 className="text-3xl mb-4" style={{ fontFamily: 'VT323, monospace', color: '#111827' }}>
              CARACTERISTICAS
            </h3>
            <ul className="text-left space-y-2" style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '16px', color: '#4B5563' }}>
              <li>✓ Graficos 3D Low-Poly Coloridos</li>
              <li>✓ 8 Minijuegos Educativos en Espanol</li>
              <li>✓ Acertijos, Rimas, Sinonimos y Antonimos</li>
              <li>✓ Vocabulario, Gramatica y Acentuacion</li>
              <li>✓ Estilo Retro Indie</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
