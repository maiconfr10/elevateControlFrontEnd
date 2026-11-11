/** Persistência exclusivamente demonstrativa. A API real precisará de controle de acesso no servidor. */
import {seed} from '../data/seed';
import type {Database} from '../types';
const KEY='elevatecontrol_demo_v1';
export function getInitialData():Database{
  try{
    const saved=localStorage.getItem(KEY);
    if(saved){const parsed:unknown=JSON.parse(saved);
      if(parsed&&typeof parsed==='object'&&'users' in parsed&&'tickets' in parsed&&'buildings' in parsed&&'checklists' in parsed){
        // Estado persistido é somente demonstrativo; em produção, dados vêm dos DTOs do backend.
        const data=parsed as Database;
        if(Array.isArray(data.users)&&Array.isArray(data.tickets)&&Array.isArray(data.buildings)&&Array.isArray(data.checklists)&&Array.isArray(data.clients)&&Array.isArray(data.elevators))return data;
      }
    }
  }catch(error){console.warn('Não foi possível carregar a demonstração:',error);}
  return structuredClone(seed);
}
export function persistData(data:Database):void{try{localStorage.setItem(KEY,JSON.stringify(data));}catch(error){console.warn('Não foi possível salvar localmente:',error);}}
export function resetData():void{localStorage.removeItem(KEY);}
export const futureApiBaseUrl=import.meta.env.VITE_API_URL||'http://localhost:8080/api';
