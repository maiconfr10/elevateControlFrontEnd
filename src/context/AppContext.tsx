import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getInitialData, persistData, resetData } from '../services/repository';
import { useAuth } from './AuthContext';
import { nextId } from '../utils/format';
import type { AccessScope, Collection, CollectionItem, Database, NewChecklist, NewRecord, NewTicket, Ticket, Checklist, User } from '../types';

interface AppContextValue {
  db:Database; user:User; access:AccessScope; toast:string;
  notify:(message:string)=>void;
  add:<K extends Collection>(collection:K, prefix:string, payload:NewRecord<K>)=>CollectionItem<K>;
  update:<K extends Collection>(collection:K, id:string, patch:Partial<CollectionItem<K>>)=>void;
  addTicket:(payload:NewTicket)=>Ticket;
  saveChecklist:(payload:NewChecklist)=>Checklist;
  resetDemo:()=>void;
}
const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }:{children:ReactNode}) {
  const [db, setDb] = useState<Database>(getInitialData);
  const { user } = useAuth();
  const [toast, setToast] = useState('');
  useEffect(() => persistData(db), [db]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(timer);
  }, [toast]);
  if (!user) throw new Error('AppProvider exige uma sessão autenticada.');

  const notify = (message:string) => setToast(message);
  const add = <K extends Collection,>(collection:K, prefix:string, payload:NewRecord<K>):CollectionItem<K> => {
    const newItem = { id: nextId(prefix), ...payload } as CollectionItem<K>;
    setDb(prev => ({...prev, [collection]: [newItem, ...prev[collection]]}));
    notify('Cadastro realizado nesta demonstração.');
    return newItem;
  };
  const update = <K extends Collection,>(collection:K, id:string, patch:Partial<CollectionItem<K>>):void => {
    setDb(prev => ({...prev, [collection]: prev[collection].map(item => item.id === id ? {...item, ...patch} : item)}));
  };
  const addTicket = (payload:NewTicket):Ticket => add('tickets','CH',{
    ...payload, status:'Aberto', criadoPor:user.id, data:new Date().toISOString(), concluidoEm:null,
  });
  const saveChecklist = (payload:NewChecklist):Checklist => {
    const now = new Date().toISOString();
    const chk = add('checklists','CHK',{...payload,concluidoEm:now});
    const registro = payload.registroAtendimento;
    // Um atendimento pode terminar com pendências: registrar a visita não significa
    // automaticamente que o chamado ou o elevador estão liberados para uso.
    const regularizado = !registro || registro.equipamentos.every(item =>
      item.situacoes.length===1 && item.situacoes[0]==='Atendimento regularizado');
    update('tickets',payload.chamadoId,regularizado
      ?{status:'Concluído',concluidoEm:now}
      :{status:'Em andamento',concluidoEm:null});
    if(registro){
      for(const item of registro.equipamentos){
        const parado=item.situacoes.includes('Parado');
        const pendencias=item.situacoes.filter(s=>s!=='Atendimento regularizado');
        const texto=pendencias.map(s=>s==='Outros'?(item.outros||'Outros'):s).join('; ');
        update('elevators',item.elevadorId,{
          status:parado?'Fora de serviço':pendencias.length?'Em manutenção':'Operacional',
          pendencia:texto,
        });
      }
    }
    notify(regularizado?'Registro salvo e chamado concluído.':'Visita registrada com pendências. O chamado permanece em andamento.');
    return chk;
  };
  const resetDemo=()=>{resetData();setDb(getInitialData());notify('Dados demonstrativos restaurados.');};

  const access = useMemo<AccessScope>(()=>{
    const myBuildings=db.buildings.filter(b=>b.clienteId===user.clienteId).map(b=>b.id);
    const visited=new Set<string>(db.checklists.filter(c=>c.tecnicoId===user.id)
      .map(c=>db.tickets.find(t=>t.id===c.chamadoId)?.predioId)
      .filter((id):id is string=>Boolean(id)));
    const tickets=user.perfil==='admin'?db.tickets:user.perfil==='cliente'
      ?db.tickets.filter(t=>myBuildings.includes(t.predioId))
      :db.tickets.filter(t=>t.tecnicoId===user.id);
    const buildings=user.perfil==='admin'?db.buildings:user.perfil==='cliente'
      ?db.buildings.filter(b=>myBuildings.includes(b.id))
      :db.buildings.filter(b=>visited.has(b.id)||tickets.some(t=>t.predioId===b.id));
    const history=user.perfil==='admin'?db.checklists:user.perfil==='cliente'
      ?db.checklists.filter(c=>myBuildings.includes(db.tickets.find(t=>t.id===c.chamadoId)?.predioId??''))
      :db.checklists.filter(c=>visited.has(db.tickets.find(t=>t.id===c.chamadoId)?.predioId??''));
    const elevators=db.elevators.filter(e=>buildings.some(b=>b.id===e.predioId));
    return {tickets,buildings,elevators,history,myBuildingIds:myBuildings,visitedBuildingIds:[...visited]};
  },[db,user]);
  return <AppContext.Provider value={{db,user,access,toast,notify,add,update,addTicket,saveChecklist,resetDemo}}>{children}</AppContext.Provider>;
}
export function useApp():AppContextValue{
  const value=useContext(AppContext);
  if(!value)throw new Error('useApp precisa estar dentro de AppProvider');
  return value;
}
