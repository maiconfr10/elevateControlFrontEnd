import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AUTH_MODE, authenticate, endSession, requestPasswordReset, restoreSession } from '../services/auth';
import type { Credentials, User } from '../types';

interface AuthContextValue {
  user:User|null; checking:boolean; connectionError:string; isDemo:boolean;
  login:(credentials:Credentials)=>Promise<User>; logout:()=>Promise<void>;
  retrySession:()=>Promise<void>; requestPasswordReset:(email:string)=>Promise<void>;
}
const AuthContext=createContext<AuthContextValue|null>(null);
export function AuthProvider({children}:{children:ReactNode}){
  const [user,setUser]=useState<User|null>(null);
  const [checking,setChecking]=useState(true);
  const [connectionError,setConnectionError]=useState('');
  const checkSession=async():Promise<void>=>{
    setChecking(true);setConnectionError('');
    try{setUser(await restoreSession());}
    catch{setConnectionError('Não foi possível validar sua sessão. Verifique a conexão com o servidor.');}
    finally{setChecking(false);}
  };
  useEffect(()=>{void checkSession();},[]);
  const login=async(credentials:Credentials):Promise<User>=>{
    const account=await authenticate(credentials);setUser(account);setConnectionError('');return account;
  };
  const logout=async():Promise<void>=>{await endSession();setUser(null);};
  const value=useMemo<AuthContextValue>(()=>({user,checking,connectionError,isDemo:AUTH_MODE==='demo',login,logout,retrySession:checkSession,requestPasswordReset}),[user,checking,connectionError]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth():AuthContextValue{
  const context=useContext(AuthContext);if(!context)throw new Error('useAuth precisa estar dentro de AuthProvider');return context;
}
