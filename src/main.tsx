import React from 'react';
import {createRoot} from 'react-dom/client';
import {AuthProvider,useAuth} from './context/AuthContext';
import {AppProvider} from './context/AppContext';
import Login from './pages/Login';
import App from './App';
import './styles.css';
function AuthGate(){
  const {user,checking}=useAuth();
  if(checking)return <div className="auth-loading" role="status" aria-live="polite"><div className="auth-loading-mark">E</div><span>Verificando acesso...</span></div>;
  if(!user)return <Login/>;
  return <AppProvider><App/></AppProvider>;
}
const container=document.getElementById('root');
if(!container)throw new Error('Elemento #root não encontrado.');
createRoot(container).render(<React.StrictMode><AuthProvider><AuthGate/></AuthProvider></React.StrictMode>);
