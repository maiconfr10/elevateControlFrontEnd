import type {FormEvent} from 'react';
import type {NewTicket,PageProps,TicketType,Priority} from '../types';
import { useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, CheckCircle2, ClipboardCheck, Clock3, Filter, MapPin, Plus, Search, Ticket, UserRound, Wrench } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge, Button, EmptyState, Field, Modal, PageHeader, Panel } from '../components/UI';
import { dateTimeBr } from '../utils/format';

const blanks:Omit<NewTicket,'tecnicoId'> = { titulo:'', descricao:'', predioId:'', elevadorId:'', tipo:'Corretiva', prioridade:'Normal' };

export default function Tickets({ navigate }:PageProps) {
  const { db, user, access, addTicket, update, notify } = useApp();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('Todos');
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState<string|null>(null);
  const [form, setForm] = useState(blanks);
  const canCreate = user.perfil !== 'tecnico';
  const technicians = db.users.filter(u=>u.perfil==='tecnico');
  const allowedBuildings = user.perfil==='cliente' ? db.buildings.filter(b=>access.myBuildingIds.includes(b.id)) : db.buildings;
  const filtered = useMemo(()=>[...access.tickets].filter(t=>{
    const building=db.buildings.find(b=>b.id===t.predioId);
    const term=[t.id,t.titulo,t.tipo,building?.nome].join(' ').toLowerCase();
    return (status==='Todos'||t.status===status)&&term.includes(search.toLowerCase());
  }).sort((a,b)=>new Date(b.data).getTime()-new Date(a.data).getTime()),[access.tickets,db.buildings,status,search]);
  const current = access.tickets.find(t=>t.id===selected);
  const building = current && db.buildings.find(b=>b.id===current.predioId);
  const elevator = current && db.elevators.find(e=>e.id===current.elevadorId);
  const technician = current && db.users.find(u=>u.id===current.tecnicoId);
  const checklist = current && db.checklists.find(c=>c.chamadoId===current.id);
  const availableElevators = db.elevators.filter(e=>e.predioId===form.predioId);
  const createTicket = (event:FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if(!allowedBuildings.some(b=>b.id===form.predioId)||!availableElevators.some(e=>e.id===form.elevadorId)) return notify('Escolha um prédio e um elevador permitidos.');
    const ticket=addTicket({...form,tecnicoId:null});
    setModal(false);setForm(blanks);setSelected(ticket.id);
    notify('Chamado aberto com sucesso na demonstração.');
  };
  const start = () => { if(current && current.status==='Aberto') {update('tickets',current.id,{status:'Em andamento'});notify('Chamado iniciado.')} };
  const canHandle = user.perfil==='admin'||(user.perfil==='tecnico'&&current?.tecnicoId===user.id);
  return <>
    <PageHeader eyebrow="OPERAÇÃO / CENTRAL DE CHAMADOS" title={user.perfil==='tecnico'?'Meus chamados':user.perfil==='cliente'?'Chamados do condomínio':'Central de chamados'} subtitle="Acompanhe solicitações preventivas, corretivas e emergenciais." action={canCreate&&<Button icon={Plus} onClick={()=>setModal(true)}>Novo chamado</Button>}/>
    <div className="summary-strip"><span><span className="summary-dot dot-blue"/> {access.tickets.filter(t=>t.status==='Aberto').length} abertos</span><span><span className="summary-dot dot-amber"/> {access.tickets.filter(t=>t.status==='Em andamento').length} em andamento</span><span><span className="summary-dot dot-green"/> {access.tickets.filter(t=>t.status==='Concluído').length} concluídos</span></div>
    <Panel className="table-panel" title="Solicitações registradas" subtitle="Informações restritas conforme o perfil selecionado" action={<span className="total-count">{filtered.length} registro(s)</span>}>
      <div className="table-controls"><label className="search-control"><Search size={18}/><input placeholder="Buscar por código, chamado ou prédio" value={search} onChange={e=>setSearch(e.target.value)}/></label><label className="filter-control"><Filter size={16}/><select aria-label="Filtrar por status" value={status} onChange={e=>setStatus(e.target.value)}>{['Todos','Aberto','Em andamento','Concluído'].map(s=><option key={s}>{s}</option>)}</select></label></div>
      {filtered.length?<div className="table-scroll"><table className="data-table"><thead><tr><th>CHAMADO</th><th>PRÉDIO / ELEVADOR</th><th>TIPO</th><th>PRIORIDADE</th><th>STATUS</th><th>ABERTURA</th><th></th></tr></thead><tbody>{filtered.map(ticket=>{
        const predio=db.buildings.find(b=>b.id===ticket.predioId);
        const el=db.elevators.find(e=>e.id===ticket.elevadorId);
        return <tr key={ticket.id}><td><strong className="table-main">{ticket.titulo}</strong><small className="table-secondary">{ticket.id}</small></td><td><strong className="table-muted">{predio?.nome}</strong><small className="table-secondary">{el?.identificacao}</small></td><td>{ticket.tipo}</td><td><Badge>{ticket.prioridade}</Badge></td><td><Badge>{ticket.status}</Badge></td><td className="nowrap">{dateTimeBr(ticket.data)}</td><td><button className="row-action" title="Ver detalhes" aria-label={`Detalhes de ${ticket.id}`} onClick={()=>setSelected(ticket.id)}><ArrowRight size={18}/></button></td></tr>;
      })}</tbody></table></div>:<EmptyState icon={Ticket} title="Nenhum chamado encontrado" description="Verifique os filtros ou cadastre uma nova solicitação."/>}
    </Panel>
    {modal&&<Modal title="Abrir novo chamado" subtitle="Registre a solicitação para um elevador." onClose={()=>setModal(false)} wide><form id="ticket-form" onSubmit={createTicket} className="form-grid">
      <Field label="Título do chamado" className="full"><input required maxLength="100" placeholder="Ex.: Falha na abertura da porta" value={form.titulo} onChange={e=>setForm({...form,titulo:e.target.value})}/></Field>
      <Field label="Prédio"><select required value={form.predioId} onChange={e=>setForm({...form,predioId:e.target.value,elevadorId:''})}><option value="">Selecione um prédio</option>{allowedBuildings.map(b=><option key={b.id} value={b.id}>{b.nome}</option>)}</select></Field>
      <Field label="Elevador"><select required value={form.elevadorId} onChange={e=>setForm({...form,elevadorId:e.target.value})}><option value="">Selecione um elevador</option>{availableElevators.map(e=><option value={e.id} key={e.id}>{e.identificacao} · {e.marca}</option>)}</select></Field>
      <Field label="Tipo de atendimento"><select value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value as TicketType})}>{['Corretiva','Preventiva','Emergência'].map(t=><option key={t}>{t}</option>)}</select></Field>
      <Field label="Prioridade"><select value={form.prioridade} onChange={e=>setForm({...form,prioridade:e.target.value as Priority})}>{['Normal','Alta','Crítica'].map(t=><option key={t}>{t}</option>)}</select></Field>
      <Field className="full" label="Descrição da ocorrência"><textarea rows={4} required maxLength="1500" placeholder="Descreva o problema ou a manutenção necessária..." value={form.descricao} onChange={e=>setForm({...form,descricao:e.target.value})}/></Field>
      <div className="form-actions full"><Button variant="secondary" onClick={()=>setModal(false)}>Cancelar</Button><Button type="submit" icon={Plus}>Registrar chamado</Button></div>
    </form></Modal>}
    {current&&<Modal title={`Chamado ${current.id}`} subtitle="Detalhamento e acompanhamento da solicitação" onClose={()=>setSelected(null)} wide>
      <div className="detail-summary"><div><span className="detail-label">SOLICITAÇÃO</span><h3>{current.titulo}</h3><p>{current.descricao}</p></div><Badge>{current.status}</Badge></div>
      <div className="detail-grid"><div><span className="detail-label">PRÉDIO</span><strong>{building?.nome}</strong><small>{building?.endereco}</small></div><div><span className="detail-label">ELEVADOR</span><strong>{elevator?.identificacao}</strong><small>{elevator?.marca} · {elevator?.modelo}</small></div><div><span className="detail-label">ATENDIMENTO</span><strong>{current.tipo}</strong><small>Prioridade: {current.prioridade}</small></div><div><span className="detail-label">ABERTURA</span><strong>{dateTimeBr(current.data)}</strong><small>{current.status==='Concluído'?'Finalizado em '+dateTimeBr(current.concluidoEm):'Aguardando conclusão'}</small></div></div>
      {user.perfil==='admin'&&current.status!=='Concluído'&&<Field label="Técnico responsável"><select value={current.tecnicoId||''} onChange={e=>{update('tickets',current.id,{tecnicoId:e.target.value||null});notify('Responsável atualizado.')}}><option value="">Ainda não atribuído</option>{technicians.map(t=><option key={t.id} value={t.id}>{t.nome} · {t.registro}</option>)}</select></Field>}
      {user.perfil!=='admin'&&<div className="detail-assignment"><UserRound size={16}/> Técnico: <strong>{technician?.nome||'Ainda não atribuído'}</strong></div>}
      {checklist&&<div className="detail-completed"><CheckCircle2 size={18}/> Checklist registrado · {dateTimeBr(checklist.concluidoEm)} · {checklist.tipo}</div>}
      {canHandle&&current.status!=='Concluído'&&<div className="form-actions detail-actions">{current.status==='Aberto'&&<Button variant="secondary" icon={Clock3} onClick={start}>Iniciar atendimento</Button>}{current.tecnicoId&&<Button icon={ClipboardCheck} onClick={()=>{setSelected(null);navigate('checklists')}}>Preencher checklist</Button>}{!current.tecnicoId&&<span className="detail-hint">Atribua um técnico para liberar o checklist.</span>}</div>}
    </Modal>}
  </>;
}
