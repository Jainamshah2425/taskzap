// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthForm from './components/auth/AuthForm';
import Board from './components/board/Board';
import Navbar from './components/ui/Navbar';
import ErrorBoundary from './components/board/ErrorBoundary';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ErrorBoundary>
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/login" element={<AuthForm />} />
                <Route
                  path="/board"
                  element={
                    <ProtectedRoute>
                      <Board />
                    </ProtectedRoute>
                  }
                />
                <Route path="/" element={<Navigate to="/board" replace />} />
              </Routes>
            </main>
          </div>
        </ErrorBoundary>
      </Router>
    </AuthProvider>
  );
}
