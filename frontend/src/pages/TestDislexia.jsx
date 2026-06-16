import { useState, useEffect, useRef } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import { 
  Play, Square, Pause, Download, Upload, Activity, 
  CheckCircle, AlertTriangle, XCircle, Info, Calendar, 
  User, Clock, ChevronRight, Plus, Trash2, Mic, 
  Volume2, Loader2, Check, RotateCcw, FileText, 
  ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

// Estímulos oficiales del PROLEC-R
const WORDS_LIST = [
  "uva", "gamo", "riña", "buitre", "genio", "nieve", "fango", "nobleza", "aguja", "corona",
  "carreta", "glucosa", "trapecio", "estornudo", "teclado", "blancura", "alfombra", "armario", "testigo", "ombligo",
  "pandereta", "electorado", "redundancia", "medicamento", "aristocracia", "arquitectura", "laringitis", "sintonía", "influencia", "sutil",
  "contaminante", "posterioridad", "adiestramiento", "protestantismo", "mercantiles", "fundamental", "constitucional", "revolucionario", "dromedario", "magistrado"
]

const PSEUDOWORDS_LIST = [
  "uja", "jela", "viza", "molga", "grupo", "mieve", "bango", "poleza", "otuja", "calona",
  "marresa", "tropasio", "espormijo", "culbito", "crasura", "taspigo", "emprobla", "osmario", "jorina", "umbrico",
  "canserela", "asortorado", "tancalanio", "voliparento", "clesidracia", "orquitectura", "laringosna", "sintomía", "infroncia", "sutal",
  "planamirande", "monserioletan", "traperindosula", "eriestramuenzo", "parparlamienzo", "foranderasolinda", "tropanderaselión", "engraderasionisca", "dromisario", "modistrado"
]

const getEdadPaciente = (paciente) => {
  if (!paciente) return 8
  if (paciente.edad_actual) return paciente.edad_actual
  if (!paciente.fecha_nacimiento) return 8
  const hoy = new Date()
  const nac = new Date(paciente.fecha_nacimiento)
  let edad = hoy.getFullYear() - nac.getFullYear()
  const m = hoy.getMonth() - nac.getMonth()
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--
  return edad
}

const alignWords = (targetWords, spokenText) => {
  if (!spokenText || spokenText.trim() === "") {
    return targetWords.map(w => ({
      word: w,
      state: 'incorrect',
      read_as: 'no se escuchó la palabra'
    }));
  }

  function cleanWord(w) {
    if (!w) return "";
    return w.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]/g, "");
  }

  function getEditDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  function fuzzyMatch(sClean, tClean) {
    const maxLen = Math.max(sClean.length, tClean.length);
    if (maxLen === 0) return false;
    const dist = getEditDistance(sClean, tClean);
    if (maxLen <= 3) return dist === 0;
    if (maxLen <= 5) return dist <= 1;
    return dist <= 2;
  }

  const targetClean = targetWords.map(w => cleanWord(w));
  const spokenTokens = spokenText.split(/[\s,]+/).filter(Boolean);
  const spokenClean = spokenTokens.map(w => cleanWord(w));

  let spokenIdx = 0;
  const details = [];

  for (let i = 0; i < targetWords.length; i++) {
    const target = targetWords[i];
    const tClean = targetClean[i];

    let matchIdx = -1;
    const searchLimit = Math.min(spokenClean.length, spokenIdx + 8);
    
    for (let j = spokenIdx; j < searchLimit; j++) {
      if (fuzzyMatch(spokenClean[j], tClean)) {
        matchIdx = j;
        break;
      }
    }

    if (matchIdx !== -1) {
      let isHesitation = false;
      let isIncorrect = false;
      const matchedToken = spokenTokens[matchIdx];
      const matchedClean = spokenClean[matchIdx];
      
      if (matchedClean !== tClean) {
        isIncorrect = true;
      }

      const readAsArr = [];
      for (let k = spokenIdx; k < matchIdx; k++) {
        const tok = spokenTokens[k];
        const tokClean = spokenClean[k];
        if (tClean.startsWith(tokClean) || tok.includes('..') || tokClean.length <= 3) {
          isHesitation = true;
          readAsArr.push(tok);
        }
      }

      readAsArr.push(matchedToken);

      if (matchedToken.includes('..')) {
        isHesitation = true;
      }

      let state = 'correct';
      if (isIncorrect) {
        state = 'incorrect';
      } else if (isHesitation) {
        state = 'hesitation';
      }

      details.push({
        word: target,
        state: state,
        read_as: readAsArr.join(' ')
      });

      spokenIdx = matchIdx + 1;
    } else {
      details.push({
        word: target,
        state: 'incorrect',
        read_as: 'no se escuchó la palabra'
      });
    }
  }

  return details;
}

export default function TestDislexia() {
  // Pestañas principales: 'manual' | 'automatizado' | 'resultados'
  const [tab, setTab] = useState('manual')
  
  // Catálogo de pacientes
  const [pacientes, setPacientes] = useState([])
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null)
  const [cargandoPacientes, setCargandoPacientes] = useState(true)
  
  // Historial de resultados
  const [historial, setHistorial] = useState([])
  const [cargandoHistorial, setCargandoHistorial] = useState(false)
  const [resultadoExpandido, setResultadoExpandido] = useState(null)

  // --- ESTADOS DE LA EVALUACIÓN MANUAL ---
  const [manualSubTab, setManualSubTab] = useState('words') // 'words' | 'pseudowords' | 'obs'
  
  // Estados de marcación manual (para cada estímulo: 'correct' | 'hesitation' | 'incorrect')
  const [manualWordsState, setManualWordsState] = useState(Array(40).fill('correct'))
  const [manualPseudowordsState, setManualPseudowordsState] = useState(Array(40).fill('correct'))
  
  // Cronómetros manuales
  const [timerWords, setTimerWords] = useState(0)
  const [timerPseudowords, setTimerPseudowords] = useState(0)
  const [timerWordsRunning, setTimerWordsRunning] = useState(false)
  const [timerPseudowordsRunning, setTimerPseudowordsRunning] = useState(false)
  const wordsIntervalRef = useRef(null)
  const pseudowordsIntervalRef = useRef(null)
  
  // Transcripciones manuales
  const [manualTranscripcionP, setManualTranscripcionP] = useState('')
  const [manualTranscripcionPS, setManualTranscripcionPS] = useState('')

  // --- ESTADOS DE LA EVALUACIÓN AUTOMATIZADA ---
  const [autoSubTab, setAutoSubTab] = useState('words') // 'words' | 'pseudowords' | 'save'
  
  // Archivos de audio subidos/grabados
  const [audioWordsBlob, setAudioWordsBlob] = useState(null)
  const [audioPseudowordsBlob, setAudioPseudowordsBlob] = useState(null)
  const [audioWordsUrl, setAudioWordsUrl] = useState('')
  const [audioPseudowordsUrl, setAudioPseudowordsUrl] = useState('')
  const [audioWordsName, setAudioWordsName] = useState('')
  const [audioPseudowordsName, setAudioPseudowordsName] = useState('')
  
  // Grabador de voz (MediaRecorder)
  const [recordingPart, setRecordingPart] = useState(null) // 'words' | 'pseudowords' | null
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [isRecordingPaused, setIsRecordingPaused] = useState(false)
  const recordingIntervalRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const recognitionRef = useRef(null)
  const accumulatedTranscriptRef = useRef('')

  // Resultados del análisis del backend
  const [processingWords, setProcessingWords] = useState(false)
  const [processingPseudowords, setProcessingPseudowords] = useState(false)
  const [autoResultP, setAutoResultP] = useState(null)
  const [autoResultPS, setAutoResultPS] = useState(null)
  const [autoWordsDetails, setAutoWordsDetails] = useState([])
  const [autoPseudowordsDetails, setAutoPseudowordsDetails] = useState([])
  const [autoTranscripcionP, setAutoTranscripcionP] = useState('')
  const [autoTranscripcionPS, setAutoTranscripcionPS] = useState('')

  // --- OBSERVACIONES CUALITATIVAS GENERALES ---
  const [obsCualitativas, setObsCualitativas] = useState({
    // Mecánica Lectora
    silabeo: false,
    rectificaciones: false,
    vacilaciones: false,
    silencios_prolongados: false,
    // Errores
    inversiones: false,
    sustituciones: false,
    omisiones: false,
    adiciones: false,
    rotaciones: false,
    // Comportamiento
    perdida_renglon: false,
    subvocalizacion: false,
    fatiga: false,
    // Comentario extra
    comentario: ''
  })
  
  const [guardandoTest, setGuardandoTest] = useState(false)

  // --- EFECTOS E INICIALIZACIÓN ---
  useEffect(() => {
    fetchPacientes()
    
    // Initialize Web Speech API SpeechRecognition
    const SpeechObj = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechObj) {
      const rec = new SpeechObj();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'es-BO'; // Bolivia / Spanish
      recognitionRef.current = rec;
    }

    return () => {
      stopAllTimers()
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    }
  }, [])

  useEffect(() => {
    if (pacienteSeleccionado) {
      fetchHistorial(pacienteSeleccionado.id_paciente)
      // Resetear evaluaciones al cambiar de paciente
      resetManualEvaluation()
      resetAutoEvaluation()
    } else {
      setHistorial([])
    }
  }, [pacienteSeleccionado])

  const fetchPacientes = async () => {
    setCargandoPacientes(true)
    try {
      const res = await api.get('/pacientes/')
      setPacientes(res.data.results || res.data || [])
      if ((res.data.results || res.data || []).length > 0) {
        setPacienteSeleccionado((res.data.results || res.data || [])[0])
      }
    } catch (err) {
      toast.error('Error al cargar la lista de pacientes')
    } finally {
      setCargandoPacientes(false)
    }
  }

  const fetchHistorial = async (pacienteId) => {
    setCargandoHistorial(true)
    try {
      const res = await api.get(`/test-dislexia/historial/?paciente_id=${pacienteId}`)
      setHistorial(res.data || [])
    } catch (err) {
      console.error(err)
      toast.error('Error al cargar el historial del paciente')
    } finally {
      setCargandoHistorial(false)
    }
  }

  const stopAllTimers = () => {
    if (wordsIntervalRef.current) clearInterval(wordsIntervalRef.current)
    if (pseudowordsIntervalRef.current) clearInterval(pseudowordsIntervalRef.current)
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current)
  }

  const resetManualEvaluation = () => {
    setManualWordsState(Array(40).fill('correct'))
    setManualPseudowordsState(Array(40).fill('correct'))
    setTimerWords(0)
    setTimerPseudowords(0)
    setTimerWordsRunning(false)
    setTimerPseudowordsRunning(false)
    setManualTranscripcionP('')
    setManualTranscripcionPS('')
    stopAllTimers()
    setObsCualitativas({
      silabeo: false,
      rectificaciones: false,
      vacilaciones: false,
      silencios_prolongados: false,
      inversiones: false,
      sustituciones: false,
      omisiones: false,
      adiciones: false,
      rotaciones: false,
      perdida_renglon: false,
      subvocalizacion: false,
      fatiga: false,
      comentario: ''
    })
  }

  const resetAutoEvaluation = () => {
    setAudioWordsBlob(null)
    setAudioPseudowordsBlob(null)
    setAudioWordsUrl('')
    setAudioPseudowordsUrl('')
    setAudioWordsName('')
    setAudioPseudowordsName('')
    setAutoResultP(null)
    setAutoResultPS(null)
    setAutoWordsDetails([])
    setAutoPseudowordsDetails([])
    setAutoTranscripcionP('')
    setAutoTranscripcionPS('')
    setRecordingPart(null)
    setRecordingSeconds(0)
    setIsRecordingPaused(false)
    stopAllTimers()
  }

  // --- CRONÓMETRO MANUAL ---
  const toggleTimerWords = () => {
    if (timerWordsRunning) {
      clearInterval(wordsIntervalRef.current)
      setTimerWordsRunning(false)
    } else {
      setTimerWordsRunning(true)
      wordsIntervalRef.current = setInterval(() => {
        setTimerWords(prev => prev + 0.1)
      }, 100)
    }
  }

  const toggleTimerPseudowords = () => {
    if (timerPseudowordsRunning) {
      clearInterval(pseudowordsIntervalRef.current)
      setTimerPseudowordsRunning(false)
    } else {
      setTimerPseudowordsRunning(true)
      pseudowordsIntervalRef.current = setInterval(() => {
        setTimerPseudowords(prev => prev + 0.1)
      }, 100)
    }
  }

  // --- CICLAR ESTADOS DE MARCADOR MANUAL ---
  // correct (green) -> hesitation (yellow) -> incorrect (red) -> correct (green)
  const cycleWordState = (index, isPseudo = false) => {
    if (isPseudo) {
      setManualPseudowordsState(prev => {
        const next = [...prev]
        if (next[index] === 'correct') next[index] = 'hesitation'
        else if (next[index] === 'hesitation') next[index] = 'incorrect'
        else next[index] = 'correct'
        return next
      })
    } else {
      setManualWordsState(prev => {
        const next = [...prev]
        if (next[index] === 'correct') next[index] = 'hesitation'
        else if (next[index] === 'hesitation') next[index] = 'incorrect'
        else next[index] = 'correct'
        return next
      })
    }
  }

  // Aciertos manuales (contamos sólo los 'correct')
  const countManualAciertos = (isPseudo = false) => {
    const arr = isPseudo ? manualPseudowordsState : manualWordsState
    return arr.filter(s => s === 'correct').length
  }

  const handleTranscripcionPChange = (newVal) => {
    setAutoTranscripcionP(newVal);
    accumulatedTranscriptRef.current = newVal;
    const aligned = alignWords(WORDS_LIST, newVal);
    setAutoWordsDetails(aligned);
  };

  const handleTranscripcionPSChange = (newVal) => {
    setAutoTranscripcionPS(newVal);
    accumulatedTranscriptRef.current = newVal;
    const aligned = alignWords(PSEUDOWORDS_LIST, newVal);
    setAutoPseudowordsDetails(aligned);
  };

  // --- AUDIO RECORDING LOGIC ---
  const startRecording = async (part) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioChunksRef.current = []
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const url = URL.createObjectURL(audioBlob)
        const name = `Grabacion_${part === 'words' ? 'Palabras' : 'Pseudopalabras'}_Manual.wav`
        
        const transcript = accumulatedTranscriptRef.current.trim();
        
        if (part === 'words') {
          setAudioWordsBlob(audioBlob)
          setAudioWordsUrl(url)
          setAudioWordsName(name)
          procesarAudioAutomatico(audioBlob, 'WORDS', transcript)
        } else {
          setAudioPseudowordsBlob(audioBlob)
          setAudioPseudowordsUrl(url)
          setAudioPseudowordsName(name)
          procesarAudioAutomatico(audioBlob, 'PSEUDOWORDS', transcript)
        }
        
        stream.getTracks().forEach(track => track.stop())
      }

      // Web Speech API initialization
      if (recognitionRef.current) {
        accumulatedTranscriptRef.current = '';
        if (part === 'words') {
          setAutoTranscripcionP('');
        } else {
          setAutoTranscripcionPS('');
        }

        recognitionRef.current.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + ' ';
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          
          const textToShow = (accumulatedTranscriptRef.current + finalTranscript + interimTranscript).trim().replace(/\s+/g, ' ');
          if (part === 'words') {
            setAutoTranscripcionP(textToShow);
          } else {
            setAutoTranscripcionPS(textToShow);
          }
          
          if (finalTranscript) {
            accumulatedTranscriptRef.current += finalTranscript;
          }
        };

        recognitionRef.current.onerror = (e) => {
          console.error("Speech recognition error", e);
        };

        recognitionRef.current.onend = () => {
          console.log("Speech recognition ended.");
        };

        recognitionRef.current.start();
      }

      setRecordingPart(part)
      setRecordingSeconds(0)
      setIsRecordingPaused(false)
      mediaRecorder.start()

      recordingIntervalRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1)
      }, 1000)

    } catch (err) {
      console.error(err)
      toast.error('No se pudo acceder al micrófono. Por favor verifica tus permisos.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error(e);
      }
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
    }
    setRecordingPart(null)
    setIsRecordingPaused(false)
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause()
      setIsRecordingPaused(true)
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
        recordingIntervalRef.current = null
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error(e);
        }
      }
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume()
      setIsRecordingPaused(false)
      recordingIntervalRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1)
      }, 1000)
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error(e);
        }
      }
    }
  }

  const resetPart = (part) => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
      recordingIntervalRef.current = null
    }
    setRecordingPart(null)
    setIsRecordingPaused(false)
    setRecordingSeconds(0)

    if (part === 'words') {
      setAudioWordsBlob(null)
      setAudioWordsUrl('')
      setAudioWordsName('')
      setAutoResultP(null)
      setAutoWordsDetails([])
      setAutoTranscripcionP('')
      accumulatedTranscriptRef.current = ''
    } else {
      setAudioPseudowordsBlob(null)
      setAutoPseudowordsDetails([])
      setAudioPseudowordsUrl('')
      setAudioPseudowordsName('')
      setAutoResultPS(null)
      setAutoTranscripcionPS('')
      accumulatedTranscriptRef.current = ''
    }
  }

  const cycleAutoWordState = (index, isPseudo = false) => {
    if (isPseudo) {
      setAutoPseudowordsDetails(prev => {
        const next = [...prev]
        const currentItem = next[index]
        if (!currentItem) return prev
        let nextState = 'correct'
        let nextRead = currentItem.word

        if (currentItem.state === 'correct') {
          nextState = 'hesitation'
          nextRead = `${currentItem.word}...`
        } else if (currentItem.state === 'hesitation') {
          nextState = 'incorrect'
          nextRead = 'no se escuchó la palabra'
        } else {
          nextState = 'correct'
          nextRead = currentItem.word
        }

        next[index] = {
          ...currentItem,
          state: nextState,
          read_as: nextRead
        }
        return next
      })
    } else {
      setAutoWordsDetails(prev => {
        const next = [...prev]
        const currentItem = next[index]
        if (!currentItem) return prev
        let nextState = 'correct'
        let nextRead = currentItem.word

        if (currentItem.state === 'correct') {
          nextState = 'hesitation'
          nextRead = `${currentItem.word}...`
        } else if (currentItem.state === 'hesitation') {
          nextState = 'incorrect'
          nextRead = 'no se escuchó la palabra'
        } else {
          nextState = 'correct'
          nextRead = currentItem.word
        }

        next[index] = {
          ...currentItem,
          state: nextState,
          read_as: nextRead
        }
        return next
      })
    }
  }

  // --- PROCESAMIENTO AUTOMATIZADO CON EL BACKEND ---
  const procesarAudioAutomatico = async (blobFile, listType, transcript = '') => {
    if (!pacienteSeleccionado) {
      toast.error('Selecciona un paciente antes de procesar')
      return
    }

    const isWords = listType === 'WORDS'
    if (isWords) setProcessingWords(true)
    else setProcessingPseudowords(true)

    const formData = new FormData()
    formData.append('audio', blobFile, isWords ? 'palabras.wav' : 'pseudopalabras.wav')
    formData.append('list_type', listType)
    formData.append('edad', getEdadPaciente(pacienteSeleccionado))
    formData.append('transcription', transcript)

    try {
      const res = await api.post('/test-dislexia/procesar/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      if (isWords) {
        setAutoResultP(res.data)
        setAutoWordsDetails(res.data.detalles || [])
        setAutoTranscripcionP(res.data.transcripcion || transcript || '')
        toast.success('Audio de Palabras Reales procesado con éxito')
      } else {
        setAutoResultPS(res.data)
        setAutoPseudowordsDetails(res.data.detalles || [])
        setAutoTranscripcionPS(res.data.transcripcion || transcript || '')
        toast.success('Audio de Pseudopalabras procesado con éxito')
      }

      // Pre-llenar observaciones cualitativas de forma inteligente según el análisis del audio
      const detalles = res.data.detalles || []
      const tieneVacilaciones = detalles.some(d => d.state === 'hesitation')
      const tieneErrores = detalles.some(d => d.state === 'incorrect')

      setObsCualitativas(prev => ({
        ...prev,
        vacilaciones: prev.vacilaciones || tieneVacilaciones,
        rectificaciones: prev.rectificaciones || tieneVacilaciones,
        sustituciones: prev.sustituciones || tieneErrores,
        omisiones: prev.omisiones || tieneErrores
      }))
    } catch (err) {
      console.error(err)
      toast.error(`Error al procesar el audio de ${isWords ? 'palabras' : 'pseudopalabras'}`)
    } finally {
      if (isWords) setProcessingWords(false)
      else setProcessingPseudowords(false)
    }
  }

  const handleFileUpload = (e, part) => {
    const file = e.target.files[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    if (part === 'words') {
      setAudioWordsBlob(file)
      setAudioWordsUrl(url)
      setAudioWordsName(file.name)
      setAutoTranscripcionP('')
      accumulatedTranscriptRef.current = ''
      procesarAudioAutomatico(file, 'WORDS', '')
    } else {
      setAudioWordsBlob(file) // Note: this is a typo in original line 643 where it set audioPseudowordsBlob
      setAudioPseudowordsBlob(file)
      setAudioPseudowordsUrl(url)
      setAudioPseudowordsName(file.name)
      setAutoTranscripcionPS('')
      accumulatedTranscriptRef.current = ''
      procesarAudioAutomatico(file, 'PSEUDOWORDS', '')
    }
  }

  // --- GUARDAR EVALUACIÓN (MANUAL O AUTOMATIZADA) ---
  const guardarEvaluacion = async () => {
    if (!pacienteSeleccionado) {
      toast.error('Selecciona un paciente')
      return
    }

    setGuardandoTest(true)

    // Formatear payload
    let payload = {
      id_paciente: pacienteSeleccionado.id_paciente,
      metodo: tab === 'manual' ? 'manual' : 'automatico',
      observaciones: obsCualitativas
    }

    if (tab === 'manual') {
      const a_p = countManualAciertos(false)
      const a_ps = countManualAciertos(true)
      
      // Construir detalles_errores unificado
      const detalles_errores = [
        ...WORDS_LIST.map((w, i) => ({
          word: w,
          state: manualWordsState[i],
          read_as: manualWordsState[i] === 'correct' ? w : (manualWordsState[i] === 'hesitation' ? `${w}...` : `(${w} fallada)`)
        })),
        ...PSEUDOWORDS_LIST.map((w, i) => ({
          word: w,
          state: manualPseudowordsState[i],
          read_as: manualPseudowordsState[i] === 'correct' ? w : (manualPseudowordsState[i] === 'hesitation' ? `${w}...` : `(${w} fallada)`)
        }))
      ]

      payload = {
        ...payload,
        a_p,
        t_p: parseFloat(timerWords.toFixed(1)),
        a_ps,
        t_ps: parseFloat(timerPseudowords.toFixed(1)),
        transcripcion_p: manualTranscripcionP || 'Administración manual sin transcripción detallada.',
        transcripcion_ps: manualTranscripcionPS || 'Administración manual sin transcripción detallada.',
        detalles_errores,
        audio_p_ruta: null,
        audio_ps_ruta: null
      }
    } else {
      // Automatizado
      if (!autoResultP || !autoResultPS) {
        toast.error('Debes completar y procesar el audio de ambas partes en modo Automatizado.')
        setGuardandoTest(false)
        return
      }

      // Recalcular aciertos según correcciones del psicólogo en la rejilla
      const a_p = autoWordsDetails.filter(d => d.state === 'correct').length
      const a_ps = autoPseudowordsDetails.filter(d => d.state === 'correct').length

      // Combinar los arreglos de detalles de errores
      const detalles_errores = [
        ...autoWordsDetails,
        ...autoPseudowordsDetails
      ]

      payload = {
        ...payload,
        a_p,
        t_p: autoResultP.tiempo,
        a_ps,
        t_ps: autoResultPS.tiempo,
        transcripcion_p: autoTranscripcionP,
        transcripcion_ps: autoTranscripcionPS,
        detalles_errores,
        audio_p_ruta: autoResultP.audio_url,
        audio_ps_ruta: autoResultPS.audio_url
      }
    }

    try {
      await api.post('/test-dislexia/guardar/', payload)
      toast.success('Test guardado y baremado correctamente')
      fetchHistorial(pacienteSeleccionado.id_paciente)
      setTab('resultados')
      // Resetear datos
      resetManualEvaluation()
      resetAutoEvaluation()
    } catch (err) {
      console.error(err)
      toast.error('Error al guardar los resultados del test')
    } finally {
      setGuardandoTest(false)
    }
  }

  // Colores del semáforo
  const getColorClasses = (state) => {
    switch (state) {
      case 'correct':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
      case 'hesitation':
        return 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
      case 'incorrect':
        return 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const getBadgeColor = (rango) => {
    if (rango === 'Normal') return 'bg-emerald-100 text-emerald-800'
    if (rango === 'Dudas') return 'bg-amber-100 text-amber-800'
    if (rango === 'D') return 'bg-orange-100 text-orange-800'
    return 'bg-rose-100 text-rose-800'
  }

  const getDiagnosticoBadge = (diag) => {
    if (diag === 'LECTOR NORMAL') return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    if (diag === 'DIFICULTAD LEVE DE LECTURA') return 'bg-amber-100 text-amber-800 border-amber-200'
    return 'bg-rose-100 text-rose-800 border-rose-200'
  }

  // --- VISTA ---
  return (
    <Layout titulo="Test de Dislexia (PROLEC-R)">
      
      {/* SECCIÓN SUPERIOR: SELECCIÓN DE PACIENTE */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Paciente en Evaluación</h3>
            <p className="text-sm text-gray-500">Administra o visualiza el historial de evaluaciones del PROLEC-R.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {cargandoPacientes ? (
            <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
          ) : (
            <select
              value={pacienteSeleccionado?.id_paciente || ''}
              onChange={(e) => {
                const found = pacientes.find(p => p.id_paciente === parseInt(e.target.value))
                setPacienteSeleccionado(found)
              }}
              className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold min-w-[220px]"
            >
              {pacientes.map(p => (
                <option key={p.id_paciente} value={p.id_paciente}>
                  {p.nombre_completo} ({getEdadPaciente(p)} años)
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* PESTAÑAS PRINCIPALES */}
      <div className="flex border-b border-gray-200 mb-6 gap-2">
        <button
          onClick={() => setTab('manual')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            tab === 'manual'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
          }`}
        >
          <Clock className="w-4 h-4" /> Evaluador Manual
        </button>
        <button
          onClick={() => setTab('automatizado')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            tab === 'automatizado'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
          }`}
        >
          <Mic className="w-4 h-4" /> Evaluador por IA (Audio)
        </button>
        <button
          onClick={() => setTab('resultados')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            tab === 'resultados'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
          }`}
        >
          <Activity className="w-4 h-4" /> Historial y Resultados
        </button>
      </div>

      {/* DETALLE SEGÚN PESTAÑA */}
      
      {/* 1. MODO MANUAL */}
      {tab === 'manual' && (
        <div className="space-y-6">
          {/* Subpestañas manuales */}
          <div className="flex bg-gray-100 p-1 rounded-2xl w-fit gap-1">
            <button
              onClick={() => setManualSubTab('words')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                manualSubTab === 'words' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-950'
              }`}
            >
              1. Palabras Reales
            </button>
            <button
              onClick={() => setManualSubTab('pseudowords')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                manualSubTab === 'pseudowords' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-950'
              }`}
            >
              2. Pseudopalabras
            </button>
            <button
              onClick={() => setManualSubTab('obs')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                manualSubTab === 'obs' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-950'
              }`}
            >
              3. Observaciones y Guardado
            </button>
          </div>

          {/* PARTE A: PALABRAS REALES */}
          {manualSubTab === 'words' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
              {/* Grid de Marcación */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-gray-800 text-base">Marcación de Palabras Reales</h4>
                    <p className="text-xs text-gray-400">Haz clic en cada palabra para alternar su estado.</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /> Correcto ({countManualAciertos(false)})</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full" /> Vacilación ({manualWordsState.filter(s => s === 'hesitation').length})</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-rose-500 rounded-full" /> Error ({manualWordsState.filter(s => s === 'incorrect').length})</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  {[0, 1, 2, 3].map((colIdx) => (
                    <div key={colIdx} className="flex flex-col gap-2.5">
                      <p className="text-xs font-bold text-gray-400 border-b pb-1">Columna {colIdx + 1}</p>
                      {WORDS_LIST.slice(colIdx * 10, (colIdx + 1) * 10).map((word, rowIdx) => {
                        const globalIdx = colIdx * 10 + rowIdx
                        return (
                          <button
                            key={globalIdx}
                            onClick={() => cycleWordState(globalIdx, false)}
                            className={`px-3 py-2 rounded-xl text-left border text-sm font-semibold transition-all select-none ${getColorClasses(manualWordsState[globalIdx])}`}
                          >
                            <span className="text-xs text-gray-400 mr-1.5">{globalIdx + 1}.</span>
                            {word}
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Panel de Cronómetro */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between h-fit gap-6">
                <div>
                  <h4 className="font-bold text-gray-800 text-base mb-1">Cronómetro</h4>
                  <p className="text-xs text-gray-400">Toma el tiempo exacto que le toma al paciente leer la lista completa de palabras reales.</p>
                  
                  <div className="my-8 text-center">
                    <span className="text-6xl font-black text-gray-900 font-mono select-none">
                      {timerWords.toFixed(1)}<span className="text-2xl text-gray-400">s</span>
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={toggleTimerWords}
                    className={`w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition text-sm ${
                      timerWordsRunning 
                        ? 'bg-amber-500 text-white hover:bg-amber-600' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {timerWordsRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {timerWordsRunning ? 'Pausar Tiempo' : 'Iniciar Tiempo'}
                  </button>
                  
                  <button
                    onClick={() => { setTimerWords(0); if (timerWordsRunning) toggleTimerWords() }}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition text-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reiniciar
                  </button>
                </div>
                
                <div className="border-t border-gray-100 pt-4 mt-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Transcripción manual (Opcional)</label>
                  <textarea
                    value={manualTranscripcionP}
                    onChange={(e) => setManualTranscripcionP(e.target.value)}
                    placeholder="Escribe palabras leídas con errores o stumbles específicos..."
                    className="w-full border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none bg-gray-50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PARTE B: PSEUDOPALABRAS */}
          {manualSubTab === 'pseudowords' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
              {/* Grid de Marcación */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-gray-800 text-base">Marcación de Pseudopalabras</h4>
                    <p className="text-xs text-gray-400">Haz clic en cada palabra para alternar su estado.</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /> Correcto ({countManualAciertos(true)})</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full" /> Vacilación ({manualPseudowordsState.filter(s => s === 'hesitation').length})</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-rose-500 rounded-full" /> Error ({manualPseudowordsState.filter(s => s === 'incorrect').length})</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  {[0, 1, 2, 3].map((colIdx) => (
                    <div key={colIdx} className="flex flex-col gap-2.5">
                      <p className="text-xs font-bold text-gray-400 border-b pb-1">Columna {colIdx + 1}</p>
                      {PSEUDOWORDS_LIST.slice(colIdx * 10, (colIdx + 1) * 10).map((word, rowIdx) => {
                        const globalIdx = colIdx * 10 + rowIdx
                        return (
                          <button
                            key={globalIdx}
                            onClick={() => cycleWordState(globalIdx, true)}
                            className={`px-3 py-2 rounded-xl text-left border text-sm font-semibold transition-all select-none ${getColorClasses(manualPseudowordsState[globalIdx])}`}
                          >
                            <span className="text-xs text-gray-400 mr-1.5">{globalIdx + 1}.</span>
                            {word}
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Panel de Cronómetro */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between h-fit gap-6">
                <div>
                  <h4 className="font-bold text-gray-800 text-base mb-1">Cronómetro</h4>
                  <p className="text-xs text-gray-400">Toma el tiempo exacto que le toma al paciente leer la lista completa de pseudopalabras.</p>
                  
                  <div className="my-8 text-center">
                    <span className="text-6xl font-black text-gray-900 font-mono select-none">
                      {timerPseudowords.toFixed(1)}<span className="text-2xl text-gray-400">s</span>
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={toggleTimerPseudowords}
                    className={`w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition text-sm ${
                      timerPseudowordsRunning 
                        ? 'bg-amber-500 text-white hover:bg-amber-600' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {timerPseudowordsRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {timerPseudowordsRunning ? 'Pausar Tiempo' : 'Iniciar Tiempo'}
                  </button>
                  
                  <button
                    onClick={() => { setTimerPseudowords(0); if (timerPseudowordsRunning) toggleTimerPseudowords() }}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition text-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reiniciar
                  </button>
                </div>
                
                <div className="border-t border-gray-100 pt-4 mt-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Transcripción manual (Opcional)</label>
                  <textarea
                    value={manualTranscripcionPS}
                    onChange={(e) => setManualTranscripcionPS(e.target.value)}
                    placeholder="Escribe pseudopalabras leídas con errores específicos..."
                    className="w-full border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none bg-gray-50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PARTE C: OBSERVACIONES Y GUARDADO */}
          {manualSubTab === 'obs' && (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6 animate-fadeIn">
              <div>
                <h4 className="font-bold text-gray-800 text-base">Observaciones Cualitativas Clínicas</h4>
                <p className="text-xs text-gray-400">Marca los indicios de dificultad observados durante la administración manual.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-5 rounded-2xl space-y-3">
                  <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2">Mecánica Lectora</p>
                  {[
                    { key: 'silabeo', label: 'Lectura Silábica' },
                    { key: 'rectificaciones', label: 'Autorreparaciones / Rectificación' },
                    { key: 'vacilaciones', label: 'Vacilaciones / Dudas' },
                    { key: 'silencios_prolongados', label: 'Silencios Prolongados' }
                  ].map(item => (
                    <label key={item.key} className="flex items-center gap-3 cursor-pointer select-none text-sm text-gray-700 font-medium">
                      <input
                        type="checkbox"
                        checked={obsCualitativas[item.key]}
                        onChange={(e) => setObsCualitativas(prev => ({ ...prev, [item.key]: e.target.checked }))}
                        className="w-4.5 h-4.5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      {item.label}
                    </label>
                  ))}
                </div>

                <div className="bg-gray-50 p-5 rounded-2xl space-y-3">
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">Errores Clínicos</p>
                  {[
                    { key: 'inversiones', label: 'Inversiones de letras/sílabas' },
                    { key: 'sustituciones', label: 'Sustitución de fonemas' },
                    { key: 'omisiones', label: 'Omisión de grafías' },
                    { key: 'adiciones', label: 'Adición de letras' },
                    { key: 'rotaciones', label: 'Rotación (d/b, p/q)' }
                  ].map(item => (
                    <label key={item.key} className="flex items-center gap-3 cursor-pointer select-none text-sm text-gray-700 font-medium">
                      <input
                        type="checkbox"
                        checked={obsCualitativas[item.key]}
                        onChange={(e) => setObsCualitativas(prev => ({ ...prev, [item.key]: e.target.checked }))}
                        className="w-4.5 h-4.5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      {item.label}
                    </label>
                  ))}
                </div>

                <div className="bg-gray-50 p-5 rounded-2xl space-y-3">
                  <p className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-2">Comportamiento</p>
                  {[
                    { key: 'perdida_renglon', label: 'Pérdida de renglón' },
                    { key: 'subvocalizacion', label: 'Subvocalización (murmullos)' },
                    { key: 'fatiga', label: 'Estrés / Fatiga vocal o física' }
                  ].map(item => (
                    <label key={item.key} className="flex items-center gap-3 cursor-pointer select-none text-sm text-gray-700 font-medium">
                      <input
                        type="checkbox"
                        checked={obsCualitativas[item.key]}
                        onChange={(e) => setObsCualitativas(prev => ({ ...prev, [item.key]: e.target.checked }))}
                        className="w-4.5 h-4.5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      {item.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Comentarios adicionales del terapeuta</label>
                <textarea
                  value={obsCualitativas.comentario}
                  onChange={(e) => setObsCualitativas(prev => ({ ...prev, comentario: e.target.value }))}
                  placeholder="Detalla particularidades del test, ritmo de lectura, distractores..."
                  className="w-full border border-gray-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 h-28 resize-none bg-gray-50"
                />
              </div>

              {/* Botón Guardar */}
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  onClick={guardarEvaluacion}
                  disabled={guardandoTest}
                  className="bg-indigo-600 text-white font-bold px-8 py-3.5 rounded-2xl hover:bg-indigo-700 transition flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  {guardandoTest ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Guardando y Baremeando...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Finalizar y Guardar Evaluación
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. MODO AUTOMATIZADO CON GRABACIÓN / IA */}
      {tab === 'automatizado' && (
        <div className="space-y-6">
          {/* Subpestañas */}
          <div className="flex bg-gray-100 p-1 rounded-2xl w-fit gap-1">
            <button
              onClick={() => setAutoSubTab('words')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                autoSubTab === 'words' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-950'
              }`}
            >
              1. Audio de Palabras Reales
            </button>
            <button
              onClick={() => setAutoSubTab('pseudowords')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                autoSubTab === 'pseudowords' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-950'
              }`}
            >
              2. Audio de Pseudopalabras
            </button>
            <button
              onClick={() => setAutoSubTab('save')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                autoSubTab === 'save' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-950'
              }`}
            >
              3. Guardar Resultados de Análisis
            </button>
          </div>

          {/* PARTE A: GRABACIÓN / SUBIDA DE PALABRAS REALES */}
          {autoSubTab === 'words' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
              {/* Estímulos en Grid */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm lg:col-span-2 space-y-6">
                <div>
                  <h4 className="font-bold text-gray-800 text-base">Palabras Reales a Pronunciar</h4>
                  <p className="text-xs text-gray-400">Guía al paciente para leer estas palabras de izquierda a derecha.</p>
                </div>

                {autoResultP ? (
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-emerald-650 flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Resultados de Análisis de IA (Haz clic en una palabra para alternar su estado):</p>
                    <div className="grid grid-cols-4 gap-3">
                      {autoWordsDetails.map((det, idx) => (
                        <div
                          key={idx}
                          onClick={() => cycleAutoWordState(idx, false)}
                          className={`px-3 py-2 border rounded-xl text-xs font-semibold cursor-pointer transition-all ${getColorClasses(det.state)}`}
                        >
                          <p className="text-gray-400 font-normal">Leído: "{det.read_as}"</p>
                          <p className="font-bold truncate mt-0.5">{det.word}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-4 opacity-75">
                    {[0, 1, 2, 3].map((colIdx) => (
                      <div key={colIdx} className="flex flex-col gap-2.5">
                        <p className="text-xs font-bold text-gray-400 border-b pb-1">Columna {colIdx + 1}</p>
                        {WORDS_LIST.slice(colIdx * 10, (colIdx + 1) * 10).map((word, rowIdx) => (
                          <div key={rowIdx} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 select-none">
                            {word}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Panel de Grabación */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6 h-fit">
                <div>
                  <h4 className="font-bold text-gray-800 text-base mb-1">Grabador Clínico</h4>
                  <p className="text-xs text-gray-400">Graba la voz del paciente o sube un archivo pregrabado.</p>
                </div>

                {/* Área de Grabador */}
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center bg-gray-50 space-y-4">
                  {recordingPart === 'words' ? (
                    <div className="space-y-3">
                      <div className="flex justify-center items-center gap-2">
                        <span className={`w-3.5 h-3.5 rounded-full ${isRecordingPaused ? 'bg-amber-500 animate-pulse' : 'bg-red-500 animate-ping'}`} />
                        <span className={`font-bold text-sm ${isRecordingPaused ? 'text-amber-600' : 'text-red-600'}`}>
                          {isRecordingPaused ? 'Grabación Pausada' : 'Grabando audio...'}
                        </span>
                      </div>
                      <p className="text-3xl font-black font-mono">{recordingSeconds}s</p>
                      
                      <div className="flex justify-center items-center gap-4 mt-2">
                        {isRecordingPaused ? (
                          <button
                            onClick={resumeRecording}
                            title="Reanudar grabación"
                            className="bg-emerald-600 text-white font-bold p-3 rounded-full hover:bg-emerald-700 transition flex items-center justify-center shadow-lg"
                          >
                            <Play className="w-4 h-4 fill-white text-white" />
                          </button>
                        ) : (
                          <button
                            onClick={pauseRecording}
                            title="Pausar grabación"
                            className="bg-amber-500 text-white font-bold p-3 rounded-full hover:bg-amber-650 transition flex items-center justify-center shadow-lg"
                          >
                            <Pause className="w-4 h-4 fill-white text-white" />
                          </button>
                        )}

                        <button
                          onClick={stopRecording}
                          title="Detener y procesar"
                          className="bg-red-600 text-white font-bold p-3 rounded-full hover:bg-red-700 transition flex items-center justify-center shadow-lg"
                        >
                          <Square className="w-4 h-4 fill-white text-white" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {audioWordsUrl && (
                        <div className="space-y-3">
                          <p className="text-xs font-semibold text-indigo-600 truncate">{audioWordsName}</p>
                          <audio src={audioWordsUrl} controls className="w-full h-8 mx-auto" />
                          <button
                            onClick={() => resetPart('words')}
                            className="bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition mx-auto"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Repetir Grabación
                          </button>
                        </div>
                      )}
                      
                      {!audioWordsUrl && (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => startRecording('words')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm"
                          >
                            <Mic className="w-4 h-4" /> Iniciar Mic
                          </button>

                          <label className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer select-none">
                            <Upload className="w-4 h-4" /> Subir Audio
                            <input type="file" accept="audio/*" onChange={(e) => handleFileUpload(e, 'words')} className="hidden" />
                          </label>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Cargando o resultados */}
                {processingWords && (
                  <div className="flex flex-col items-center justify-center p-4 space-y-2 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                    <p className="text-xs font-bold text-indigo-800">IA Procesando audio y estimando tiempo...</p>
                  </div>
                )}

                {autoResultP && (
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 space-y-3">
                    <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5"><Check className="w-4 h-4" /> Análisis Completo</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-gray-400 font-semibold">Aciertos Estimados:</p>
                        <p className="font-bold text-gray-800 text-sm">{autoResultP.aciertos} / 40</p>
                      </div>
                      <div>
                        <p className="text-gray-400 font-semibold">Duración Detectada:</p>
                        <p className="font-bold text-gray-800 text-sm">{autoResultP.tiempo} segundos</p>
                      </div>
                    </div>
                    <div className="border-t border-emerald-100 pt-2">
                      <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Transcripción Literal Verbatim (Editable):</p>
                      <textarea
                        value={autoTranscripcionP}
                        onChange={(e) => handleTranscripcionPChange(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none bg-white italic text-gray-700 font-medium"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PARTE B: GRABACIÓN / SUBIDA DE PSEUDOPALABRAS */}
          {autoSubTab === 'pseudowords' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
              {/* Estímulos en Grid */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm lg:col-span-2 space-y-6">
                <div>
                  <h4 className="font-bold text-gray-800 text-base">Pseudopalabras a Pronunciar</h4>
                  <p className="text-xs text-gray-400">Guía al paciente para leer estas pseudopalabras de izquierda a derecha.</p>
                </div>

                {autoResultPS ? (
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-emerald-650 flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Resultados de Análisis de IA (Haz clic en una palabra para alternar su estado):</p>
                    <div className="grid grid-cols-4 gap-3">
                      {autoPseudowordsDetails.map((det, idx) => (
                        <div
                          key={idx}
                          onClick={() => cycleAutoWordState(idx, true)}
                          className={`px-3 py-2 border rounded-xl text-xs font-semibold cursor-pointer transition-all ${getColorClasses(det.state)}`}
                        >
                          <p className="text-gray-400 font-normal">Leído: "{det.read_as}"</p>
                          <p className="font-bold truncate mt-0.5">{det.word}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-4 opacity-75">
                    {[0, 1, 2, 3].map((colIdx) => (
                      <div key={colIdx} className="flex flex-col gap-2.5">
                        <p className="text-xs font-bold text-gray-400 border-b pb-1">Columna {colIdx + 1}</p>
                        {PSEUDOWORDS_LIST.slice(colIdx * 10, (colIdx + 1) * 10).map((word, rowIdx) => (
                          <div key={rowIdx} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 select-none">
                            {word}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Panel de Grabación */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6 h-fit">
                <div>
                  <h4 className="font-bold text-gray-800 text-base mb-1">Grabador Clínico</h4>
                  <p className="text-xs text-gray-400">Graba la voz del paciente o sube un archivo pregrabado.</p>
                </div>

                {/* Área de Grabador */}
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center bg-gray-50 space-y-4">
                  {recordingPart === 'pseudowords' ? (
                    <div className="space-y-3">
                      <div className="flex justify-center items-center gap-2">
                        <span className={`w-3.5 h-3.5 rounded-full ${isRecordingPaused ? 'bg-amber-500 animate-pulse' : 'bg-red-500 animate-ping'}`} />
                        <span className={`font-bold text-sm ${isRecordingPaused ? 'text-amber-600' : 'text-red-600'}`}>
                          {isRecordingPaused ? 'Grabación Pausada' : 'Grabando audio...'}
                        </span>
                      </div>
                      <p className="text-3xl font-black font-mono">{recordingSeconds}s</p>
                      
                      <div className="flex justify-center items-center gap-4 mt-2">
                        {isRecordingPaused ? (
                          <button
                            onClick={resumeRecording}
                            title="Reanudar grabación"
                            className="bg-emerald-600 text-white font-bold p-3 rounded-full hover:bg-emerald-700 transition flex items-center justify-center shadow-lg"
                          >
                            <Play className="w-4 h-4 fill-white text-white" />
                          </button>
                        ) : (
                          <button
                            onClick={pauseRecording}
                            title="Pausar grabación"
                            className="bg-amber-500 text-white font-bold p-3 rounded-full hover:bg-amber-600 transition flex items-center justify-center shadow-lg"
                          >
                            <Pause className="w-4 h-4 fill-white text-white" />
                          </button>
                        )}

                        <button
                          onClick={stopRecording}
                          title="Detener y procesar"
                          className="bg-red-600 text-white font-bold p-3 rounded-full hover:bg-red-700 transition flex items-center justify-center shadow-lg"
                        >
                          <Square className="w-4 h-4 fill-white text-white" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {audioPseudowordsUrl && (
                        <div className="space-y-3">
                          <p className="text-xs font-semibold text-indigo-600 truncate">{audioPseudowordsName}</p>
                          <audio src={audioPseudowordsUrl} controls className="w-full h-8 mx-auto" />
                          <button
                            onClick={() => resetPart('pseudowords')}
                            className="bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition mx-auto"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Repetir Grabación
                          </button>
                        </div>
                      )}
                      
                      {!audioPseudowordsUrl && (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => startRecording('pseudowords')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm"
                          >
                            <Mic className="w-4 h-4" /> Iniciar Mic
                          </button>

                          <label className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer select-none">
                            <Upload className="w-4 h-4" /> Subir Audio
                            <input type="file" accept="audio/*" onChange={(e) => handleFileUpload(e, 'pseudowords')} className="hidden" />
                          </label>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Cargando o resultados */}
                {processingPseudowords && (
                  <div className="flex flex-col items-center justify-center p-4 space-y-2 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                    <p className="text-xs font-bold text-indigo-800">IA Procesando audio y estimando tiempo...</p>
                  </div>
                )}

                {autoResultPS && (
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 space-y-3">
                    <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5"><Check className="w-4 h-4" /> Análisis Completo</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-gray-400 font-semibold">Aciertos Estimados:</p>
                        <p className="font-bold text-gray-800 text-sm">{autoResultPS.aciertos} / 40</p>
                      </div>
                      <div>
                        <p className="text-gray-400 font-semibold">Duración Detectada:</p>
                        <p className="font-bold text-gray-800 text-sm">{autoResultPS.tiempo} segundos</p>
                      </div>
                    </div>
                    <div className="border-t border-emerald-100 pt-2">
                      <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Transcripción Literal Verbatim (Editable):</p>
                      <textarea
                        value={autoTranscripcionPS}
                        onChange={(e) => handleTranscripcionPSChange(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none bg-white italic text-gray-700 font-medium"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PARTE C: OBSERVACIONES Y GUARDADO AUTOMATIZADO */}
          {autoSubTab === 'save' && (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6 animate-fadeIn">
              <div>
                <h4 className="font-bold text-gray-800 text-base">Consolidación de Datos de Análisis de Voz</h4>
                <p className="text-xs text-gray-400">Verifica los datos automáticos obtenidos antes de guardar la ficha.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gray-50 p-5 rounded-2xl border border-gray-150">
                <div className="space-y-2">
                  <p className="font-bold text-indigo-700 text-xs uppercase">Parte 1: Palabras Reales</p>
                  <p className="text-gray-600 font-medium">Aciertos: <span className="text-gray-900 font-bold">{autoResultP?.aciertos ?? 'Pendiente'} / 40</span></p>
                  <p className="text-gray-600 font-medium">Tiempo total: <span className="text-gray-900 font-bold">{autoResultP?.tiempo ?? 'Pendiente'} segundos</span></p>
                </div>
                <div className="space-y-2">
                  <p className="font-bold text-indigo-700 text-xs uppercase">Parte 2: Pseudopalabras</p>
                  <p className="text-gray-600 font-medium">Aciertos: <span className="text-gray-900 font-bold">{autoResultPS?.aciertos ?? 'Pendiente'} / 40</span></p>
                  <p className="text-gray-600 font-medium">Tiempo total: <span className="text-gray-900 font-bold">{autoResultPS?.tiempo ?? 'Pendiente'} segundos</span></p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-5 rounded-2xl space-y-3 border">
                  <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2">Mecánica Lectora</p>
                  {[
                    { key: 'silabeo', label: 'Lectura Silábica' },
                    { key: 'rectificaciones', label: 'Autorreparaciones / Rectificación' },
                    { key: 'vacilaciones', label: 'Vacilaciones / Dudas' },
                    { key: 'silencios_prolongados', label: 'Silencios Prolongados' }
                  ].map(item => (
                    <label key={item.key} className="flex items-center gap-3 cursor-pointer select-none text-sm text-gray-700 font-medium">
                      <input
                        type="checkbox"
                        checked={obsCualitativas[item.key]}
                        onChange={(e) => setObsCualitativas(prev => ({ ...prev, [item.key]: e.target.checked }))}
                        className="w-4.5 h-4.5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      {item.label}
                    </label>
                  ))}
                </div>

                <div className="bg-gray-50 p-5 rounded-2xl space-y-3 border">
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">Errores Clínicos</p>
                  {[
                    { key: 'inversiones', label: 'Inversiones de letras/sílabas' },
                    { key: 'sustituciones', label: 'Sustitución de fonemas' },
                    { key: 'omisiones', label: 'Omisión de grafías' },
                    { key: 'adiciones', label: 'Adición de letras' },
                    { key: 'rotaciones', label: 'Rotación (d/b, p/q)' }
                  ].map(item => (
                    <label key={item.key} className="flex items-center gap-3 cursor-pointer select-none text-sm text-gray-700 font-medium">
                      <input
                        type="checkbox"
                        checked={obsCualitativas[item.key]}
                        onChange={(e) => setObsCualitativas(prev => ({ ...prev, [item.key]: e.target.checked }))}
                        className="w-4.5 h-4.5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      {item.label}
                    </label>
                  ))}
                </div>

                <div className="bg-gray-50 p-5 rounded-2xl space-y-3 border">
                  <p className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-2">Comportamiento</p>
                  {[
                    { key: 'perdida_renglon', label: 'Pérdida de renglón' },
                    { key: 'subvocalizacion', label: 'Subvocalización (murmullos)' },
                    { key: 'fatiga', label: 'Estrés / Fatiga vocal o física' }
                  ].map(item => (
                    <label key={item.key} className="flex items-center gap-3 cursor-pointer select-none text-sm text-gray-700 font-medium">
                      <input
                        type="checkbox"
                        checked={obsCualitativas[item.key]}
                        onChange={(e) => setObsCualitativas(prev => ({ ...prev, [item.key]: e.target.checked }))}
                        className="w-4.5 h-4.5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      {item.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Comentarios adicionales del terapeuta</label>
                <textarea
                  value={obsCualitativas.comentario}
                  onChange={(e) => setObsCualitativas(prev => ({ ...prev, comentario: e.target.value }))}
                  placeholder="Escribe comentarios clínicos..."
                  className="w-full border border-gray-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 h-28 resize-none bg-gray-50"
                />
              </div>

              {/* Botón Guardar */}
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  onClick={guardarEvaluacion}
                  disabled={guardandoTest || !autoResultP || !autoResultPS}
                  className="bg-indigo-600 text-white font-bold px-8 py-3.5 rounded-2xl hover:bg-indigo-700 transition flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  {guardandoTest ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Guardando y Baremeando...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Registrar Resultados del Test
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. HISTORIAL Y RESULTADOS */}
      {tab === 'resultados' && (
        <div className="space-y-6">
          {cargandoHistorial ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Listado de Evaluaciones */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                <h4 className="font-bold text-gray-800 text-base">Historial de Evaluaciones de {pacienteSeleccionado?.nombre_completo}</h4>
                {historial.length === 0 ? (
                  <div className="text-center p-8 border border-dashed rounded-2xl bg-gray-50/50">
                    <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-400">No hay pruebas del Test de Dislexia registradas para este paciente</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {historial.map(test => (
                      <div key={test.id} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${test.metodo === 'manual' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
                              {test.metodo === 'manual' ? 'M' : 'A'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${getDiagnosticoBadge(test.diagnostico)}`}>
                                  {test.diagnostico}
                                </span>
                                <span className="text-xs text-gray-400 font-semibold">{test.fecha}</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                Palabras: {test.a_p}/40 ({test.t_p}s) · Pseudopalabras: {test.a_ps}/40 ({test.t_ps}s) · Método: <span className="capitalize">{test.metodo}</span>
                              </p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => setResultadoExpandido(resultadoExpandido === test.id ? null : test.id)}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-4 py-2 hover:bg-indigo-50/50 rounded-xl transition flex items-center gap-1.5"
                          >
                            {resultadoExpandido === test.id ? 'Ocultar Detalles' : 'Ver Ficha Completa'}
                            {resultadoExpandido === test.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* DETALLE EXPANDIDO DE LA EVALUACIÓN */}
                        {resultadoExpandido === test.id && (
                          <div className="mt-5 pt-5 border-t border-gray-100 space-y-6 animate-fadeIn">
                            
                            {/* BAREMOS E INDICES */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              <div className="bg-gray-50 border p-4 rounded-2xl text-center space-y-1.5">
                                <p className="text-[10px] uppercase font-bold text-gray-400">Palabras Aciertos</p>
                                <p className="text-2xl font-black text-gray-800">{test.a_p} <span className="text-xs text-gray-450 font-normal">/ 40</span></p>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getBadgeColor(test.r_p)}`}>
                                  Baremo: {test.r_p}
                                </span>
                              </div>
                              <div className="bg-gray-50 border p-4 rounded-2xl text-center space-y-1.5">
                                <p className="text-[10px] uppercase font-bold text-gray-400">Eficiencia Palabras (IL-P)</p>
                                <p className="text-2xl font-black text-gray-800">{test.il_p}</p>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                                  {test.t_p} segundos
                                </span>
                              </div>
                              <div className="bg-gray-50 border p-4 rounded-2xl text-center space-y-1.5">
                                <p className="text-[10px] uppercase font-bold text-gray-400">Pseudopalabras Aciertos</p>
                                <p className="text-2xl font-black text-gray-800">{test.a_ps} <span className="text-xs text-gray-450 font-normal">/ 40</span></p>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getBadgeColor(test.r_ps)}`}>
                                  Baremo: {test.r_ps}
                                </span>
                              </div>
                              <div className="bg-gray-50 border p-4 rounded-2xl text-center space-y-1.5">
                                <p className="text-[10px] uppercase font-bold text-gray-400">Eficiencia Pseudos (IL-PS)</p>
                                <p className="text-2xl font-black text-gray-800">{test.il_ps}</p>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                                  {test.t_ps} segundos
                                </span>
                              </div>
                            </div>

                            {/* RECONSTRUCCIÓN SEMÁFORO DE PALABRAS Y PSEUDOPALABRAS */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Reconstrucción Palabras */}
                              <div className="bg-gray-50/50 border border-gray-150 p-5 rounded-2xl space-y-4">
                                <div className="flex justify-between items-center border-b pb-2">
                                  <p className="text-xs font-extrabold text-gray-600 uppercase tracking-wider">Reconstrucción: Palabras Reales</p>
                                  <span className="text-[10px] text-gray-400 font-bold">Semáforo Clínico</span>
                                </div>
                                <div className="grid grid-cols-4 gap-2.5">
                                  {[0, 1, 2, 3].map((colIdx) => (
                                    <div key={colIdx} className="space-y-1.5">
                                      {WORDS_LIST.slice(colIdx * 10, (colIdx + 1) * 10).map((word, rowIdx) => {
                                        const globalIdx = colIdx * 10 + rowIdx
                                        const detailsArr = Array.isArray(test.detalles_errores) ? test.detalles_errores : []
                                        const match = detailsArr[globalIdx]
                                        const state = match ? match.state : 'correct'
                                        const readAs = match ? match.read_as : word

                                        return (
                                          <div
                                            key={globalIdx}
                                            title={`Leído como: "${readAs}"`}
                                            className={`px-2 py-1.5 border rounded-lg text-left text-[11px] font-semibold truncate select-none ${getColorClasses(state)}`}
                                          >
                                            <span className="opacity-40 font-normal mr-1">{globalIdx+1}.</span>
                                            {word}
                                          </div>
                                        )
                                      })}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Reconstrucción Pseudopalabras */}
                              <div className="bg-gray-50/50 border border-gray-150 p-5 rounded-2xl space-y-4">
                                <div className="flex justify-between items-center border-b pb-2">
                                  <p className="text-xs font-extrabold text-gray-600 uppercase tracking-wider">Reconstrucción: Pseudopalabras</p>
                                  <span className="text-[10px] text-gray-400 font-bold">Semáforo Clínico</span>
                                </div>
                                <div className="grid grid-cols-4 gap-2.5">
                                  {[0, 1, 2, 3].map((colIdx) => (
                                    <div key={colIdx} className="space-y-1.5">
                                      {PSEUDOWORDS_LIST.slice(colIdx * 10, (colIdx + 1) * 10).map((word, rowIdx) => {
                                        const globalIdx = colIdx * 10 + rowIdx
                                        const detailsArr = Array.isArray(test.detalles_errores) ? test.detalles_errores : []
                                        // Las pseudopalabras se guardaron en la segunda mitad del array (índices 40 al 79)
                                        const match = detailsArr[40 + globalIdx]
                                        const state = match ? match.state : 'correct'
                                        const readAs = match ? match.read_as : word

                                        return (
                                          <div
                                            key={globalIdx}
                                            title={`Leído como: "${readAs}"`}
                                            className={`px-2 py-1.5 border rounded-lg text-left text-[11px] font-semibold truncate select-none ${getColorClasses(state)}`}
                                          >
                                            <span className="opacity-40 font-normal mr-1">{globalIdx+1}.</span>
                                            {word}
                                          </div>
                                        )
                                      })}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* LEYENDA DEL SEMÁFORO */}
                            <div className="flex gap-4 justify-center text-xs font-semibold text-gray-500 py-1 bg-gray-50 rounded-xl border">
                              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /> Pronunciación Correcta / Fluida</span>
                              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full" /> Vacilación / Silabeo / Rectificación</span>
                              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-rose-500 rounded-full" /> Error de lectura / Omitido / Saltado</span>
                            </div>

                            {/* TRANSCRIPCIONES LITERALES (VERBATIM) Y AUDIOS */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                              {/* Palabras Transcripcion */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <label className="block text-xs font-extrabold text-gray-500 uppercase">Transcripción Literal: Palabras Reales</label>
                                  {test.audio_p_ruta && (
                                    <a
                                      href={`http://127.0.0.1:8000${test.audio_p_ruta}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      download
                                      className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 transition"
                                    >
                                      <Download className="w-3.5 h-3.5" /> Descargar Audio P
                                    </a>
                                  )}
                                </div>
                                <div className="bg-white border rounded-2xl p-4 italic text-sm text-gray-700 leading-relaxed shadow-sm min-h-[100px]">
                                  "{test.transcripcion_p || 'Sin registro de transcripción.'}"
                                </div>
                                {test.audio_p_ruta && (
                                  <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-2xl border">
                                    <Volume2 className="w-4 h-4 text-indigo-600" />
                                    <audio src={`http://127.0.0.1:8000${test.audio_p_ruta}`} controls className="w-full h-8" />
                                  </div>
                                )}
                              </div>

                              {/* Pseudopalabras Transcripcion */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <label className="block text-xs font-extrabold text-gray-500 uppercase">Transcripción Literal: Pseudopalabras</label>
                                  {test.audio_ps_ruta && (
                                    <a
                                      href={`http://127.0.0.1:8000${test.audio_ps_ruta}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      download
                                      className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 transition"
                                    >
                                      <Download className="w-3.5 h-3.5" /> Descargar Audio PS
                                    </a>
                                  )}
                                </div>
                                <div className="bg-white border rounded-2xl p-4 italic text-sm text-gray-700 leading-relaxed shadow-sm min-h-[100px]">
                                  "{test.transcripcion_ps || 'Sin registro de transcripción.'}"
                                </div>
                                {test.audio_ps_ruta && (
                                  <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-2xl border">
                                    <Volume2 className="w-4 h-4 text-indigo-600" />
                                    <audio src={`http://127.0.0.1:8000${test.audio_ps_ruta}`} controls className="w-full h-8" />
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* CUALITATIVOS Y COMENTARIOS */}
                            <div className="bg-gray-50 border p-5 rounded-2xl space-y-4">
                              <div className="flex justify-between items-center border-b pb-2">
                                <p className="text-xs font-bold text-gray-600 uppercase">Registro de Signos Clínicos Detectados</p>
                              </div>
                              
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(test.observaciones || {}).map(([key, val]) => {
                                  if (key === 'comentario' || !val) return null
                                  // Formatear el label de la propiedad
                                  const label = key
                                    .replace(/_/g, ' ')
                                    .replace(/\b\w/g, c => c.toUpperCase())
                                  return (
                                    <span key={key} className="bg-red-50 text-red-700 text-xs px-3 py-1 rounded-xl font-bold border border-red-200 shadow-sm flex items-center gap-1">
                                      <AlertCircle className="w-3.5 h-3.5" /> {label}
                                    </span>
                                  )
                                })}
                                {Object.entries(test.observaciones || {}).filter(([k, v]) => k !== 'comentario' && v).length === 0 && (
                                  <p className="text-xs font-semibold text-gray-400">No se registraron signos cualitativos negativos en este test.</p>
                                )}
                              </div>

                              {test.observaciones?.comentario && (
                                <div className="pt-2">
                                  <p className="text-[10px] font-bold text-gray-400 uppercase">Notas del psicólogo:</p>
                                  <p className="text-sm font-medium text-gray-700 bg-white border p-3 rounded-xl mt-1.5 leading-relaxed">
                                    {test.observaciones.comentario}
                                  </p>
                                </div>
                              )}
                            </div>

                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

    </Layout>
  )
}
