import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { isAuthorized, getUserProfile } from '../config/authorizedUsers';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { uid, email, name, role }
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && isAuthorized(firebaseUser.email)) {
        const profile = getUserProfile(firebaseUser.email);
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: profile.name,
          role: profile.role,
        });
      } else {
        if (firebaseUser && !isAuthorized(firebaseUser.email)) {
          // Sesión de una cuenta que no está en la lista blanca: se cierra.
          firebaseSignOut(auth);
        }
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    setAuthError('');
    if (!isAuthorized(email)) {
      setAuthError('Este correo no está autorizado para usar la aplicación.');
      throw new Error('NOT_AUTHORIZED');
    }
    try {
      await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
    } catch (err) {
      const message =
        err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
          ? 'Correo o contraseña incorrectos.'
          : err.code === 'auth/user-not-found'
          ? 'El usuario aún no ha sido creado en Firebase Auth.'
          : err.code === 'auth/too-many-requests'
          ? 'Demasiados intentos. Intenta de nuevo en unos minutos.'
          : 'No se pudo iniciar sesión. Intenta nuevamente.';
      setAuthError(message);
      throw err;
    }
  };

  const logout = () => firebaseSignOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading, authError, login, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
