import type {FormEvent} from 'react';
import { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, ClipboardCheck, Clock3, FileText, Plus, Wrench } from 'lucide-react';
import { useApp } from '../context/AppContext';
import SignaturePad from '../components/SignaturePad';
import { Badge, Button, EmptyState, Field, Modal, Note, PageHeader, Panel } from '../components/UI';
import { dateBr, dateTimeBr, nowLocalInput } from '../utils/format';
import { printChecklist } from '../utils/printReport';

const buildEmpty=()=>({inicio:nowLocalInput(),fim:nowLocalInput(),lubrificacao:false,testeSeguranca:false,pecas:'',observacoes:'',responsavel:'',assinatura:''});
export default function Checklists() {
  const {db,user,access,saveChecklist,notify}=useApp();
  const [ticketId,setTicketId]=useState('');
  const [form,setForm]=useState(buildEmpty);
  const [filter,setFilter]=useState('Todos');
  const eligible=access.tickets.filter(t=>t.status!=='Concluído'&&(user.perfil==='admin'?!!t.tecnicoId:t.tecnicoId===user.id)&&!db.checklists.some(c=>c.chamadoId===t.id));
  const history=access.history.filter(c=>filter==='Todos'||c.tipo===filter);
  const ticket=db.tickets.find(t=>t.id===ticketId);
  const create=(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();
    if(!ticket || !eligible.some(t=>t.id===ticketId))return notify('Esse chamado não está autorizado para preenchimento.');
    if(new Date(form.fim)<new Date(form.inicio))return notify('O horário de saída não pode ser anterior à entrada.');
    if(!form.assinatura)return notify('A assinatura digital é necessária para encerrar o atendimento.');
    saveChecklist({chamadoId:ticketId,tecnicoId:ticket.tecnicoId,tipo:ticket.tipo==='Preventiva'?'Mensal':'Atendimento',...form});
    setTicketId('');setForm(buildEmpty());
  };
  return <>
    <PageHeader eyebrow="ATENDIMENTO / CHECKLISTS" title="Checklists técnicos" subtitle="Registre a visita, os procedimentos e a assinatura de validação." action={eligible.length>0&&<Button icon={Plus} onClick={()=>{setForm(buildEmpty());setTicketId(eligible[0].id)}}>Preencher checklist</Button>}/>
    <div className="checklist-steps"><div><span>01</span><strong>Atendimento</strong><small>Chamado designado</small></div><ArrowRight size={17}/><div><span>02</span><strong>Checklist</strong><small>Itens e horários</small></div><ArrowRight size={17}/><div><span>03</span><strong>Validação</strong><small>Assinatura digital</small></div><ArrowRight size={17}/><div><span>04</span><strong>Conclusão</strong><small>Histórico registrado</small></div></div>
    <Panel title="Atendimentos disponíveis" subtitle="Chamados vinculados a um técnico e ainda não finalizados">
      {eligible.length?<div className="available-list">{eligible.map(t=>{const b=db.buildings.find(b=>b.id===t.predioId);return <div className="available-item" key={t.id}><span className="available-icon"><Wrench size={20}/></span><div className="available-text"><strong>{t.titulo}</strong><small>{t.id} · {b?.nome} · {t.tipo}</small></div><Badge>{t.status}</Badge><Button variant="secondary" onClick={()=>{setForm(buildEmpty());setTicketId(t.id)}}>Preencher</Button></div>})}</div>:<EmptyState icon={CheckCircle2} title="Nenhum checklist pendente" description="Os chamados com técnico atribuído aparecerão aqui. Na demonstração, experimente o perfil Administrador ou Técnico."/>}
    </Panel>
    <Panel className="section-gap" title="Checklists finalizados" subtitle="Atendimentos registrados e disponíveis para consulta" action={<select aria-label="Filtrar checklists" className="select-compact" value={filter} onChange={e=>setFilter(e.target.value)}><option>Todos</option><option>Mensal</option><option>Atendimento</option></select>}>
      {history.length?<div className="table-scroll"><table className="data-table"><thead><tr><th>ATENDIMENTO</th><th>LOCAL</th><th>TIPO</th><th>RESPONSÁVEL</th><th>CONCLUSÃO</th><th></th></tr></thead><tbody>{history.map(c=>{const t=db.tickets.find(t=>t.id===c.chamadoId);const b=db.buildings.find(b=>b.id===t?.predioId);const tech=db.users.find(u=>u.id===c.tecnicoId);return <tr key={c.id}><td><strong className="table-main">{t?.titulo||c.chamadoId}</strong><small className="table-secondary">{c.chamadoId}</small></td><td>{b?.nome||'—'}</td><td><Badge tone={c.tipo==='Mensal'?'blue':'neutral'}>{c.tipo}</Badge></td><td>{tech?.nome||'—'}</td><td>{dateBr(c.concluidoEm)}</td><td><button className="row-action" onClick={()=>printChecklist(c,db)} title="Visualizar / imprimir relatório"><FileText size={17}/></button></td></tr>})}</tbody></table></div>:<EmptyState title="Nenhum checklist disponível" description="Registros concluídos serão exibidos aqui."/>}
    </Panel>
    {ticketId&&ticket&&<Modal wide title="Checklist de atendimento" subtitle={`${ticket.id} · ${ticket.titulo}`} onClose={()=>setTicketId('')}>
      <form className="form-grid" onSubmit={create}>
        <div className="full"><Note>Tipo: <strong>{ticket.tipo==='Preventiva'?'Manutenção mensal preventiva':'Atendimento corretivo / emergência'}</strong>. O envio encerrará o chamado e salvará o registro nesta demonstração.</Note></div>
        <Field label="Entrada no local"><input type="datetime-local" required value={form.inicio} onChange={e=>setForm({...form,inicio:e.target.value})}/></Field>
        <Field label="Saída do local"><input type="datetime-local" required value={form.fim} onChange={e=>setForm({...form,fim:e.target.value})}/></Field>
        <div className="full checklist-options"><label className="check-option"><input type="checkbox" checked={form.lubrificacao} onChange={e=>setForm({...form,lubrificacao:e.target.checked})}/><div><strong>Lubrificação verificada / realizada</strong><span>Item de manutenção preventiva</span></div></label><label className="check-option"><input type="checkbox" checked={form.testeSeguranca} onChange={e=>setForm({...form,testeSeguranca:e.target.checked})}/><div><strong>Teste de segurança realizado</strong><span>Verificação de segurança e funcionamento</span></div></label></div>
        <Field className="full" label="Peças substituídas / materiais"><input value={form.pecas} maxLength="500" onChange={e=>setForm({...form,pecas:e.target.value})} placeholder="Informe as peças ou 'Nenhuma'"/></Field>
        <Field className="full" label="Observações técnicas"><textarea rows={3} required maxLength="1800" value={form.observacoes} onChange={e=>setForm({...form,observacoes:e.target.value})} placeholder="Descreva os testes e o resultado do atendimento"/></Field>
        <Field className="full" label="Nome do responsável que valida"><input required value={form.responsavel} onChange={e=>setForm({...form,responsavel:e.target.value})} placeholder="Nome completo"/></Field>
        <div className="full"><SignaturePad onChange={assinatura=>setForm(prev=>({...prev,assinatura}))}/></div>
        <div className="form-actions full"><Button variant="secondary" onClick={()=>setTicketId('')}>Cancelar</Button><Button icon={CheckCircle2} type="submit">Finalizar atendimento</Button></div>
      </form>
    </Modal>}
  </>;
}
