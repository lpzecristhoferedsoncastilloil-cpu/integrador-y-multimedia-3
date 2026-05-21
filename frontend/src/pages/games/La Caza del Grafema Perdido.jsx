import React, { useState, useEffect, useRef } from 'react';

// 1. BASE DE DATOS ESTÁNDAR (Sirve de base si no hay conexión a la BD externa)
// Puedes añadir, quitar o modificar estos niveles fácilmente aquí.
const BASE_DATOS_ESTANDAR = [
  {
    id: 1,
    palabraCompleta: "GUITARRA",
    textoPantalla: "GUI _ ARRA",
    letraFaltante: "T",
    opciones: ["T", "D", "P", "B"],
    imagenUrl: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=300&auto=format&fit=crop&q=60", // Reemplazar por tu asset local
    audioPalabra: "https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg", // Reemplazar por tus audios reales (.mp3)
    audioFonema: "https://actions.google.com/sounds/v1/cartoon/slide_whistle_to_drum_hit.ogg" 
  },
  {
    id: 2,
    palabraCompleta: "ZAPATO",
    textoPantalla: "ZA _ ATO",
    letraFaltante: "P",
    opciones: ["B", "D", "P", "Q"],
    imagenUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop&q=60",
    audioPalabra: "", 
    audioFonema: ""
  },
  {
    id: 3,
    palabraCompleta: "BARCO",
    textoPantalla: "_ ARCO",
    letraFaltante: "B",
    opciones: ["D", "B", "P", "V"],
    imagenUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=300&auto=format&fit=crop&q=60",
    audioPalabra: "",
    audioFonema: ""
  }
];

export default function CazaGrafemaPerdido({ nivelesDesdeBD }) {
  // Inicializar juego: usa la BD externa si existe, de lo contrario usa la estándar
  const listaNiveles = nivelesDesdeBD && nivelesDesdeBD.length > 0 ? nivelesDesdeBD : BASE_DATOS_ESTANDAR;

  const [nivelActualIdx, setNivelActualIdx] = useState(0);
  const [burbujas, setBurbujas] = useState([]);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [palabraMostrada, setPalabraMostrada] = useState("");
  const [bloquearClicks, setBloquearClicks] = useState(false);
  const [mensajeFeedback, setMensajeFeedback] = useState("");
  const [colorTexto, setColorTexto] = useState("text-gray-700");

  const datosNivel = listaNiveles[nivelActualIdx];
  
  // Referencias para controlar los audios
  const audioRef = useRef(null);

  // Cargar o cambiar de nivel
  useEffect(() => {
    if (datosNivel) {
      setPalabraMostrada(datosNivel.textoPantalla);
      setMensajeFeedback("");
      setColorTexto("text-gray-700");
      setBloquearClicks(false);
      generarBurbujas(datosNivel.opciones);
      reproducirAudioIntro();
    }
  }, [nivelActualIdx, datosNivel]);

  // Bucle de animación para que las burbujas floten hacia arriba
  useEffect(() => {
    if (juegoTerminado) return;

    const interval = setInterval(() => {
      setBurbujas((prevBurbujas) =>
        prevBurbujas.map((burbuja) => {
          let nuevaY = burbuja.y - burbuja.velocidad;
          // Si la burbuja se sale por arriba de la pantalla, reaparece abajo
          if (nuevaY < -50) {
            nuevaY = 450; 
          }
          return { ...burbuja, y: nuevaY };
        })
      );
    }, 30); // ~30 FPS para un movimiento fluido

    return () => clearInterval(interval);
  }, [juegoTerminado]);

  // Función para generar las burbujas en posiciones X aleatorias
  const generarBurbujas = (opciones) => {
    const nuevasBurbujas = opciones.map((letra, index) => ({
      id: index,
      letra: letra,
      x: 10 + index * 22, // Distribución horizontal para que no se encima tanto
      y: 350 + Math.random() * 80, // Aparición escalonada abajo
      velocidad: 1 + Math.random() * 1.2, // Velocidades diferentes (diseño UX infantil pausado)
      color: obtenerColorBurbuja(index)
    }));
    setBurbujas(nuevasBurbujas);
  };

  const obtenerColorBurbuja = (index) => {
    const colores = [
      'bg-red-400 border-red-600',
      'bg-blue-400 border-blue-600',
      'bg-green-400 border-green-600',
      'bg-yellow-400 border-yellow-600'
    ];
    return colores[index % colores.length];
  };

  // CONTROL DE AUDIO
  const reproducirAudioIntro = () => {
    if (!datosNivel) return;
    // Lógica simulada de reproducción consecutiva: Palabra -> Fonema
    if (datosNivel.audioPalabra) {
      ejecutarAudio(datosNivel.audioPalabra, () => {
        // Cuando termine la palabra, toca el fonema si existe
        if (datosNivel.audioFonema) setTimeout(() => ejecutarAudio(datosNivel.audioFonema), 600);
      });
    }
  };

  const reproducirSoloFonema = () => {
    if (datosNivel && datosNivel.audioFonema) {
      ejecutarAudio(datosNivel.audioFonema);
    }
  };

  const ejecutarAudio = (url, alTerminar = null) => {
    if (!url) return;
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.play().catch(e => console.log("Audio play bloqueado por navegador"));
      if (alTerminar) {
        audioRef.current.onended = alTerminar;
      } else {
        audioRef.current.onended = null;
      }
    }
  };

  // LOGICA DE JUEGO (Acciones del Niño)
  const manejarClickBurbuja = (burbujaSeleccionada) => {
    if (bloquearClicks) return;

    if (burbujaSeleccionada.letra === datosNivel.letraFaltante) {
      // --- ¡ACIERTO! ---
      setBloquearClicks(true);
      setPalabraMostrada(datosNivel.palabraCompleta);
      setColorTexto("text-green-600 font-bold scale-110 transition-transform");
      setMensajeFeedback("¡Excelente! ¡Lo lograste! 🎉");
      
      // Quitar la burbuja acertada de la pantalla
      setBurbujas(prev => prev.filter(b => b.id !== burbujaSeleccionada.id));
      
      // Sonar palabra completa en éxito
      if (datosNivel.audioPalabra) ejecutarAudio(datosNivel.audioPalabra);

      // Pasar al siguiente nivel tras 2.5 segundos
      setTimeout(() => {
        if (nivelActualIdx + 1 < listaNiveles.length) {
          setNivelActualIdx(prev => prev + 1);
        } else {
          setJuegoTerminado(true);
        }
      }, 2500);

    } else {
      // --- ¡ERROR! ---
      setMensajeFeedback("¡Casi! Escucha con atención otra vez... 🤔");
      reproducirSoloFonema(); // Le recuerda el sonido automáticamente
      
      // Efecto visual de rebote/penalización suave sin destruir la burbuja
      setBurbujas(prev => prev.map(b => {
        if (b.id === burbujaSeleccionada.id) {
          return { ...b, y: b.y + 40 }; // La baja un poco para denotar el fallo
        }
        return b;
      }));
    }
  };

  const reiniciarJuego = () => {
    setNivelActualIdx(0);
    setJuegoTerminado(false);
  };

  // PANTALLA DE JUEGO TERMINADO
  if (juegoTerminado) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-amber-50 rounded-2xl shadow-xl max-w-xl mx-auto border-4 border-amber-300 text-center">
        <h2 className="text-3xl font-extrabold text-amber-600 mb-4 font-sans">¡Fin de la Misión, Detective! 🎖️</h2>
        <p className="text-lg text-gray-700 mb-6">Completaste todos los desafíos de las letras perdidas.</p>
        <button 
          onClick={reiniciarJuego}
          className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg transform hover:scale-105 transition text-lg"
        >
          Volver a Jugar
        </button>
      </div>
    );
  }

  // RENDER PRINCIPAL DE LA INTERFAZ
  return (
    <div className="w-full max-w-2xl mx-auto bg-sky-50 rounded-3xl shadow-2xl border-4 border-sky-300 overflow-hidden flex flex-col font-sans select-none">
      
      {/* Etiqueta invisible para reproducir los sonidos */}
      <audio ref={audioRef} className="hidden" />

      {/* Encabezado e indicador de progreso */}
      <div className="bg-sky-300 p-4 flex justify-between items-center text-sky-900 font-bold shadow-sm">
        <span>La Caza del Grafema Perdido 🕵️‍♂️</span>
        <span className="bg-white/50 px-3 py-1 rounded-full text-sm">
          Nivel {nivelActualIdx + 1} de {listaNiveles.length}
        </span>
      </div>

      {/* Área Central: Estímulos Multimedia (Imagen + Texto + Altavoz) */}
      <div className="p-6 flex flex-col items-center bg-white border-b-2 border-sky-100 relative">
        
        {/* Imagen del Objeto */}
        <div className="w-44 h-44 rounded-2xl overflow-hidden border-4 border-amber-200 shadow-md bg-gray-100 flex items-center justify-center mb-4">
          {datosNivel.imagenUrl ? (
            <img 
              src={datosNivel.imagenUrl} 
              alt="Estímulo visual" 
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-400 text-sm">Sin imagen</span>
          )}
        </div>

        {/* Bloque de Texto de la Palabra y Altavoz de Pista */}
        <div className="flex items-center gap-4 my-2">
          <h1 className={`text-4xl tracking-widest font-mono uppercase ${colorTexto}`}>
            {palabraMostrada}
          </h1>
          
          <button 
            onClick={reproducirSoloFonema}
            className="p-3 bg-amber-400 hover:bg-amber-500 text-amber-950 rounded-full shadow-md active:scale-95 transition"
            title="Escuchar sonido de la letra"
          >
            🔊
          </button>
        </div>

        {/* Feedback Dinámico (Mensaje de acierto o error) */}
        <div className="h-6 text-center mt-2">
          <p className="text-md font-semibold text-sky-700 animate-pulse">{mensajeFeedback}</p>
        </div>
      </div>

      {/* Área Inferior: El Cielo de las Burbujas Flotantes */}
      <div className="relative w-full h-[400px] bg-gradient-to-b from-sky-100 to-sky-200 overflow-hidden cursor-crosshair">
        
        {burbujas.map((burbuja) => (
          <button
            key={burbuja.id}
            onClick={() => manejarClickBurbuja(burbuja)}
            style={{ 
              left: `${burbuja.x}%`, 
              top: `${burbuja.y}px`,
            }}
            className={`absolute w-14 h-14 rounded-full border-2 flex items-center justify-center font-mono text-xl font-black text-white shadow-lg transition-transform active:scale-75 select-none ${burbuja.color}`}
          >
            {burbuja.letra}
          </button>
        ))}

        {burbujas.length === 0 && !bloquearClicks && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
            Cargando letras...
          </div>
        )}
      </div>
    </div>
  );
}

//Juego 1.2: "La Caza del Grafema Perdido"
//Ideal para entrenar la correspondencia exacta entre el sonido (fonema) y la letra escrita (grafema).
//Diseño Visual de la Interfaz:
//Fondo: Un cielo despejado o el fondo del océano.
//Centro: Una tarjeta grande con la imagen del objeto (ej: una Guitarra) y justo debajo el texto con el hueco: GUI _ ARRA. El hueco parpadea sutilmente para llamar la atención.
//Elementos Móviles: 4 burbujas de colores (rojo, azul, verde, amarillo) flotan desde la parte inferior de la pantalla hacia arriba de forma pausada. Dentro de cada una hay una letra en mayúscula: T, D, P, B.
//Flujo del Juego (Paso a Paso):
//El nivel inicia cargando la imagen y el texto incompleto.
//Audio Automático: Se reproduce el sonido del objeto entero: "¡Guitarra!", seguido inmediatamente por el fonema aislado de la letra que falta: "/ttttt/ (sonido seco de la T, no el nombre de la letra 'Ete')".
//Si el niño hace clic en el botón de altavoz (pista), el fonema /t/ vuelve a sonar.
//Las burbujas empiezan a flotar.
//Lógica de Programación y Feedback:
//Acierto (Clic en 'T'): La burbuja explota con un sonido agradable (un "pop" suave), la letra T se traslada automáticamente al hueco GUI T ARRA, completando la palabra, y una voz dice: "¡Excelente! ¡Guitarra!". El texto cambia a color verde.
//Error (Clic en 'D', 'P' o 'B'): La burbuja rebota como si fuera de goma (no explota) y emite un sonido sutil de "inténtalo de nuevo". El juego vuelve a reproducir el fonema /t/ de manera automática para recordarle qué busca.//