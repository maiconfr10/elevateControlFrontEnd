import type {BadgeTone,Role} from '../types';
export const dateBr=(value:string|null|undefined):string=>value?new Date(value).toLocaleDateString('pt-BR'):'—';
export const dateTimeBr=(value:string|null|undefined):string=>value?new Date(value).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'}):'—';
export const initials=(name:string=''):string=>name.split(/\s+/).slice(0,2).map(n=>n[0]||'').join('').toUpperCase();
export const labelRole:Record<Role,string>={admin:'Administrador',tecnico:'Técnico',cliente:'Cliente'};
export const nextId=(prefix:string):string=>`${prefix}-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2,5).toUpperCase()}`;
export const nowLocalInput=():string=>{
  const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
};
export const statusTone:Record<string,BadgeTone>={
  Aberto:'blue','Em andamento':'amber',Concluído:'green',Operacional:'green','Em manutenção':'amber','Fora de serviço':'red',Alta:'amber',Crítica:'red',Normal:'neutral',
};
