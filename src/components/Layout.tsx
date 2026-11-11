import { useState, type ReactNode } from 'react';
import type {PageKey, Role} from '../types';
import { Bell, Building2, ClipboardCheck, DoorOpen, FileText, Headphones, LayoutGrid, LogOut, Menu, RotateCcw, ShieldCheck, Ticket, Users, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { initials, labelRole } from '../utils/format';
import { useAuth } from '../context/AuthContext';

const navigation: Record<Role, Array<{key:PageKey;label:string;icon:typeof LayoutGrid}>> = {
  admin: [
    { key:'dashboard',label:'Visão geral',icon:LayoutGrid },
    { key:'tickets',label:'Chamados',icon:Ticket },
    { key:'clients',label:'Clientes',icon:Users },
    { key:'assets',label:'Prédios e elevadores',icon:Building2 },
    { key:'team',label:'Equipe e acessos',icon:ShieldCheck },
    { key:'checklists',label:'Checklists',icon:ClipboardCheck },
    { key:'reports',label:'Relatórios e histórico',icon:FileText },
  ],
  tecnico: [
    { key:'dashboard',label:'Meu painel',icon:LayoutGrid },
    { key:'tickets',label:'Meus chamados',icon:Ticket },
    { key:'checklists',label:'Checklists',icon:ClipboardCheck },
    { key:'reports',label:'Histórico atendido',icon:FileText },
  ],
  cliente: [
    { key:'dashboard',label:'Visão do condomínio',icon:LayoutGrid },
    { key:'tickets',label:'Meus chamados',icon:Ticket },
    { key:'assets',label:'Meus elevadores',icon:Building2 },
    { key:'reports',label:'Relatórios técnicos',icon:FileText },
  ],
};

export default function Layout({ page, navigate, children }: {page:PageKey;navigate:(page:PageKey)=>void;children:ReactNode}) {
  const { user, resetDemo, notify } = useApp();
  const { logout, isDemo } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [open, setOpen] = useState(false);
  const nav = navigation[user.perfil];
  const current = nav.find(n => n.key === page) || nav[0];
  const goTo = (key:PageKey) => { navigate(key); setOpen(false); window.scrollTo({top:0,behavior:'smooth'}); };
  const handleLogout = async () => {
    setLoggingOut(true);
    try { await logout(); }
    catch { notify('Não foi possível encerrar a sessão. Tente novamente.'); }
    finally { setLoggingOut(false); }
  };
  return <div className="app-layout">
    {open && <button className="sidebar-screen" aria-label="Fechar menu" onClick={() => setOpen(false)}/>}
    <aside className={`sidebar ${open?'sidebar-open':''}`}>
      <div className="brand"><div className="brand-icon"><DoorOpen size={22} strokeWidth={2.2} /></div><div className="brand-text"><strong>Elevate<span>Control</span></strong><small>GESTÃO DE ELEVADORES</small></div><button className="sidebar-close icon-button" aria-label="Fechar menu" onClick={()=>setOpen(false)}><X size={19}/></button></div>
      <div className="workspace-tag"><span className="live-dot"/> {isDemo?'AMBIENTE DEMONSTRATIVO':'SESSÃO AUTENTICADA'}</div>
      <p className="nav-section">MENU PRINCIPAL</p>
      <nav aria-label="Navegação principal">{nav.map(item => <button key={item.key} className={`nav-item ${page===item.key?'nav-active':''}`} onClick={()=>goTo(item.key)}><item.icon size={19}/><span>{item.label}</span>{page===item.key && <span className="nav-indicator"/>}</button>)}</nav>
      <div className="sidebar-bottom">
        <div className="side-support"><div className="support-icon"><Headphones size={19}/></div><strong>Seu centro de operações</strong><p>Chamados, manutenção e históricos em um só lugar.</p></div>
        {isDemo && <button className="sidebar-reset" onClick={()=>{ if(window.confirm('Restaurar todos os dados fictícios desta demonstração?')){resetDemo();goTo('dashboard')} }}><RotateCcw size={15}/> Restaurar demonstração</button>}
        <button className="sidebar-reset sidebar-logout" onClick={handleLogout} disabled={loggingOut}><LogOut size={15}/> {loggingOut?'Saindo...':'Sair da conta'}</button>
      </div>
      <div className="sidebar-account"><div className="avatar avatar-dark">{initials(user.nome)}</div><div><strong>{user.nome}</strong><small>{labelRole[user.perfil]}</small></div></div>
    </aside>
    <div className="app-column">
      <header className="topbar"><div className="top-left"><button className="mobile-menu icon-button" aria-label="Abrir menu" onClick={()=>setOpen(true)}><Menu size={21}/></button><span className="breadcrumb">Workspace</span><span className="slash">/</span><strong>{current.label}</strong></div>
        <div className="top-right"><span className="top-user-label"><strong>{user.nome}</strong><small>{labelRole[user.perfil]}</small></span><button className="icon-button notification" aria-label="Notificações demonstrativas" onClick={()=>notify('O painel utiliza dados de demonstração.')}><Bell size={20}/><span/></button><div className="avatar avatar-top" title={`${user.nome} · ${labelRole[user.perfil]}`}>{initials(user.nome)}</div><button className="icon-button top-logout" title="Sair da conta" aria-label="Sair da conta" onClick={handleLogout} disabled={loggingOut}><LogOut size={18}/></button></div>
      </header>
      <main className="content">{children}</main>
      <footer className="page-footer"><span>© 2026 ElevateControl · Protótipo acadêmico</span><span>{isDemo?'Versão 0.3 · Login demonstrativo':'Versão 0.3 · Autenticação via API'}</span></footer>
    </div>
  </div>;
}
