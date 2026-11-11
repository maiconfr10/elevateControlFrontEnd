/**
 * Interfaces de integração propostas — ainda não conectadas à interface DEMO.
 * O backend (Spring Boot, Node etc.) deverá implementar e confirmar as rotas,
 * os DTOs e a autorização por perfil antes de ativar estas chamadas.
 */
import {apiRequest} from './http';
import type {Building,Checklist,Client,Elevator,NewChecklist,NewTicket,Ticket,User} from '../types';

const url=(path:string,id:string)=>`${path}/${encodeURIComponent(id)}`;
export const clientsApi={
  list:()=>apiRequest<Client[]>('/clientes'),
  create:(client:Omit<Client,'id'>)=>apiRequest<Client>('/clientes',{method:'POST',body:client}),
};
export const buildingsApi={
  list:()=>apiRequest<Building[]>('/predios'),
  create:(building:Omit<Building,'id'>)=>apiRequest<Building>('/predios',{method:'POST',body:building}),
};
export const elevatorsApi={
  list:()=>apiRequest<Elevator[]>('/elevadores'),
  create:(elevator:Omit<Elevator,'id'>)=>apiRequest<Elevator>('/elevadores',{method:'POST',body:elevator}),
  update:(id:string,fields:Partial<Omit<Elevator,'id'>>)=>apiRequest<Elevator>(url('/elevadores',id),{method:'PATCH',body:fields}),
};
export const ticketsApi={
  list:()=>apiRequest<Ticket[]>('/chamados'),
  create:(ticket:NewTicket)=>apiRequest<Ticket>('/chamados',{method:'POST',body:ticket}),
  assign:(id:string,tecnicoId:string)=>apiRequest<Ticket>(url('/chamados',id)+'/atribuicao',{method:'PATCH',body:{tecnicoId}}),
  start:(id:string)=>apiRequest<Ticket>(url('/chamados',id)+'/iniciar',{method:'POST'}),
};
export const checklistsApi={
  list:()=>apiRequest<Checklist[]>('/checklists'),
  conclude:(checklist:NewChecklist)=>apiRequest<Checklist>('/checklists',{method:'POST',body:checklist}),
};
export const usersApi={
  list:()=>apiRequest<User[]>('/usuarios'),
  create:(user:Omit<User,'id'>)=>apiRequest<User>('/usuarios',{method:'POST',body:user}),
};
