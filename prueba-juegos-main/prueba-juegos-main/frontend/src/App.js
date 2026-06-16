import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Game from './pages/Game';
import MinigamesHub from './pages/MinigamesHub';
import Game1Maze from './pages/Game1Maze';
import Game2Cheese from './pages/Game2Cheese';
import Game3Hangman from './pages/Game3Hangman';
import Game4SyllableMachine from './pages/Game4SyllableMachine';
import Game5River from './pages/Game5River';
import Game6Warehouse from './pages/Game6Warehouse';
import Game7Temple from './pages/Game7Temple';
import Game8Train from './pages/Game8Train';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/game"
            element={
              <ProtectedRoute>
                <Game />
              </ProtectedRoute>
            }
          />
          <Route path="/minigames" element={<MinigamesHub />} />
          <Route path="/minigames/maze" element={<Game1Maze />} />
          <Route path="/minigames/cheese" element={<Game2Cheese />} />
          <Route path="/minigames/hangman" element={<Game3Hangman />} />
          <Route path="/minigames/machine" element={<Game4SyllableMachine />} />
          <Route path="/minigames/river" element={<Game5River />} />
          <Route path="/minigames/warehouse" element={<Game6Warehouse />} />
          <Route path="/minigames/temple" element={<Game7Temple />} />
          <Route path="/minigames/train" element={<Game8Train />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;