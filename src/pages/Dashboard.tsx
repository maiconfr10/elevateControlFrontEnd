import type {PageProps} from '../types';
import { Activity, ArrowRight, Building2, CalendarCheck2, CheckCircle2, CircleAlert, ClipboardCheck, Clock3, Gauge, Ticket, Wrench } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge, Button, EmptyState, PageHeader, Panel, StatCard } from '../components/UI';
import { dateBr, dateTimeBr } from '../utils/format';

export default function Dashboard({ navigate }:PageProps) {
  const { db, user, access } = useApp();
  const active = access.tickets.filter(t => t.status !== 'Concluído');
  const finished = access.tickets.filter(t => t.status === 'Concluído');
  const urgent = access.tickets.filter(t => t.prioridade === 'Crítica' && t.status !== 'Concluído');
  const working = access.tickets.filter(t => t.status === 'Em andamento');
  const outOfService = access.elevators.filter(e => e.status === 'Fora de serviço');
  const latest = [...access.tickets].sort((a,b) => new Date(b.data).getTime()-new Date(a.data).getTime()).slice(0,5);
  const greeting = user.perfil === 'admin' ? 'Sua operação em um só lugar.' : user.perfil === 'tecnico' ? 'Seus atendimentos, com clareza.' : 'Acompanhe cada elevador de perto.';
  const subtitle = user.perfil === 'admin' ? 'Monitore chamados, equipes e equipamentos dos condomínios.' : user.perfil === 'tecnico' ? 'Veja os chamados designados e registre suas visitas técnicas.' : 'Consulte a situação dos equipamentos e acompanhe suas solicitações.';
  const today = new Intl.DateTimeFormat('pt-BR', { day:'2-digit', month:'long', year:'numeric' }).format(new Date());
  return <>
    <PageHeader eyebrow={`PAINEL PRINCIPAL · ${today.toUpperCase()}`} title={greeting} subtitle={subtitle} action={<Button icon={Ticket} onClick={()=>navigate('tickets')}>{user.perfil === 'cliente' ? 'Abrir chamado' : 'Ver chamados'}</Button>}/>
    <div className="overview-banner"><div className="banner-copy"><span className="banner-kicker"><span className="live-dot"/> CENTRAL DE OPERAÇÕES</span><h2>ElevateControl</h2><p>Gestão de chamados e manutenções com visibilidade para quem administra, atende e acompanha.</p><button onClick={()=>navigate('tickets')} className="banner-link">Acessar central de chamados <ArrowRight size={17}/></button></div><div className="banner-art" aria-hidden="true"><div className="tower tower-one"><span/><span/><span/><span/></div><div className="tower tower-two"><span/><span/><span/></div><div className="tower tower-three"><span/><span/><span/><span/><span/></div><div className="art-path"/></div></div>
    <div className="stats-grid">
      <StatCard icon={Ticket} label={user.perfil === 'tecnico' ? 'Meus chamados ativos' : 'Chamados abertos / ativos'} value={active.length.toString().padStart(2,'0')} foot="Aguardando ou em atendimento" tone="blue"/>
      <StatCard icon={Wrench} label="Em andamento" value={working.length.toString().padStart(2,'0')} foot="Atendimento em execução" tone="amber"/>
      <StatCard icon={CheckCircle2} label="Concluídos" value={finished.length.toString().padStart(2,'0')} foot="Chamados finalizados" tone="green"/>
      <StatCard icon={Gauge} label={user.perfil === 'tecnico' ? 'Prédios vinculados' : 'Elevadores visíveis'} value={(user.perfil === 'tecnico' ? access.buildings.length : access.elevators.length).toString().padStart(2,'0')} foot={user.perfil==='tecnico'?'Atribuídos ou visitados':'Na área do seu perfil'} tone="violet"/>
    </div>
    <div className="dashboard-columns">
      <Panel title="Chamados recentes" subtitle="Últimas solicitações da sua área de acesso" action={<button className="text-link" onClick={()=>navigate('tickets')}>Ver todos <ArrowRight size={15}/></button>}>
        {latest.length ? <div className="ticket-list compact-list">{latest.map(ticket=>{
          const building = db.buildings.find(b=>b.id===ticket.predioId);
          return <button className="ticket-row" key={ticket.id} onClick={()=>navigate('tickets')}><span className={`ticket-type-icon ${ticket.prioridade==='Crítica'?'critical':''}`}><Ticket size={19}/></span><span className="ticket-row-main"><strong>{ticket.titulo}</strong><small>{ticket.id} · {building?.nome||'Prédio'} · {dateBr(ticket.data)}</small></span><Badge>{ticket.status}</Badge><ArrowRight className="ticket-chevron" size={16}/></button>;
        })}</div>:<EmptyState title="Nenhum chamado disponível" description="Os chamados permitidos para seu perfil aparecerão aqui."/>}
      </Panel>
      <div className="sidebar-panels">
        <Panel title="Atenção operacional" subtitle="Situações que merecem acompanhamento">
          <div className="alert-list">
            <div className="alert-row"><span className="alert-icon alert-red"><CircleAlert size={19}/></span><div><strong>{urgent.length.toString().padStart(2,'0')} chamado(s) crítico(s)</strong><small>Emergências aguardando solução</small></div></div>
            <div className="alert-row"><span className="alert-icon alert-orange"><Wrench size={19}/></span><div><strong>{outOfService.length.toString().padStart(2,'0')} elevador(es) fora de serviço</strong><small>Verifique o status dos equipamentos</small></div></div>
            <div className="alert-row"><span className="alert-icon alert-green"><ClipboardCheck size={19}/></span><div><strong>{access.history.length.toString().padStart(2,'0')} checklist(s) registrado(s)</strong><small>Histórico de atendimentos disponível</small></div></div>
          </div>
        </Panel>
        <Panel title="Acesso rápido" subtitle="Tudo o que você precisa em poucos cliques">
          <div className="quick-links"><button onClick={()=>navigate('tickets')}><Ticket size={17}/> Gerenciar chamados <ArrowRight size={15}/></button>{user.perfil!=='tecnico'&&<button onClick={()=>navigate('assets')}><Building2 size={17}/> Consultar elevadores <ArrowRight size={15}/></button>}{user.perfil!=='cliente'&&<button onClick={()=>navigate('checklists')}><ClipboardCheck size={17}/> Preencher checklist <ArrowRight size={15}/></button>}<button onClick={()=>navigate('reports')}><CalendarCheck2 size={17}/> Consultar histórico <ArrowRight size={15}/></button></div>
        </Panel>
      </div>
    </div>
  </>;
}
