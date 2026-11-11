import {useEffect,type ButtonHTMLAttributes,type ReactNode} from 'react';
import {AlertCircle,ArrowRight,CheckCircle2,Plus,X,type LucideIcon} from 'lucide-react';
import {statusTone} from '../utils/format';
import {PrimitiveButton,type ButtonVariant} from './ui/button';
import {PrimitiveBadge} from './ui/badge';
import type {BadgeTone} from '../types';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>{variant?:ButtonVariant;icon?:LucideIcon;}
export function Button({children,variant='primary',icon:Icon,className='',type='button',...props}:ButtonProps){
  return <PrimitiveButton type={type} variant={variant} className={className} {...props}>{Icon&&<Icon size={16} strokeWidth={2}/>} {children}</PrimitiveButton>;
}
interface BadgeProps{children:ReactNode;tone?:BadgeTone;className?:string}
export function Badge({children,tone,className=''}:BadgeProps){
  const text=typeof children==='string'?children:'';
  return <PrimitiveBadge tone={tone||statusTone[text]||'neutral'} className={className}><span className="badge-dot"/>{children}</PrimitiveBadge>;
}
interface PageHeaderProps{eyebrow?:string;title:string;subtitle?:string;action?:ReactNode;secondary?:ReactNode}
export function PageHeader({eyebrow,title,subtitle,action,secondary}:PageHeaderProps){return <div className="page-heading"><div><p className="eyebrow">{eyebrow||'ELEVATECONTROL / WORKSPACE'}</p><h1>{title}</h1>{subtitle&&<p className="page-subtitle">{subtitle}</p>}</div>{(action||secondary)&&<div className="page-actions">{secondary}{action}</div>}</div>}
interface PanelProps{title?:string;subtitle?:string;action?:ReactNode;children:ReactNode;className?:string}
export function Panel({title,subtitle,action,children,className=''}:PanelProps){return <section className={`panel ${className}`}>{(title||action)&&<div className="panel-header"><div><h2>{title}</h2>{subtitle&&<p>{subtitle}</p>}</div>{action}</div>}{children}</section>}
interface EmptyProps{icon?:LucideIcon;title?:string;description?:string;action?:ReactNode}
export function EmptyState({icon:Icon=AlertCircle,title='Nenhum registro encontrado',description='Tente alterar seus filtros.',action}:EmptyProps){return <div className="empty"><span className="empty-icon"><Icon size={24}/></span><h3>{title}</h3><p>{description}</p>{action}</div>}
interface FieldProps{label:string;help?:string;children:ReactNode;className?:string}
export function Field({label,help,children,className=''}:FieldProps){return <label className={`field ${className}`}><span className="field-label">{label}</span>{children}{help&&<small>{help}</small>}</label>}
interface StatProps{icon:LucideIcon;label:string;value:string|number;foot:ReactNode;tone?:string}
export function StatCard({icon:Icon,label,value,foot,tone='blue'}:StatProps){return <div className="stat-card"><div className="stat-top"><span>{label}</span><span className={`stat-icon stat-${tone}`}><Icon size={20}/></span></div><strong className="stat-value">{value}</strong><div className="stat-foot">{foot}</div></div>}
export function Progress({value=0}:{value?:number}){return <div className="progress"><div style={{width:`${Math.min(100,Math.max(0,value))}%`}}/></div>}
interface ModalProps{title:string;subtitle?:string;onClose:()=>void;children:ReactNode;footer?:ReactNode;wide?:boolean}
export function Modal({title,subtitle,onClose,children,footer,wide=false}:ModalProps){
  useEffect(()=>{const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose()};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[onClose]);
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><section className={`modal ${wide?'modal-wide':''}`} role="dialog" aria-modal="true" aria-label={title}><div className="modal-heading"><div><h2>{title}</h2>{subtitle&&<p>{subtitle}</p>}</div><button aria-label="Fechar" className="icon-button" onClick={onClose}><X size={19}/></button></div><div className="modal-body">{children}</div>{footer&&<div className="modal-footer">{footer}</div>}</section></div>;
}
export function Note({children,tone='info'}:{children:ReactNode;tone?:string}){return <div className={`note note-${tone}`}><AlertCircle size={17}/><div>{children}</div></div>}
export function LinkButton({onClick,children='Ver detalhes'}:{onClick:()=>void;children?:ReactNode}){return <button className="text-link" onClick={onClick}>{children}<ArrowRight size={15}/></button>}
export function CheckMark({done}:{done:boolean}){return done?<CheckCircle2 size={18} className="yes-icon"/>:<span className="no-mark">—</span>}
export function NewButton({onClick,children}:{onClick:()=>void;children:ReactNode}){return <Button icon={Plus} onClick={onClick}>{children}</Button>}
