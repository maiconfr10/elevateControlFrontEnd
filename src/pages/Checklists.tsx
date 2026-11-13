import {useMemo, useState, type FormEvent} from 'react';
import {ArrowRight, CheckCircle2, FileText, Plus, Wrench, PackageCheck} from 'lucide-react';
import {useApp} from '../context/AppContext';
import SignaturePad from '../components/SignaturePad';
import MonthlyChecklistForm, {novoChecklistMensal} from '../components/MonthlyChecklistForm';
import {codigosChecklistMensal} from '../data/monthlyChecklist';
import {Badge, Button, EmptyState, Field, Modal, Note, PageHeader, Panel} from '../components/UI';
import {dateBr, dateTimeBr, nextId, nowLocalInput} from '../utils/format';
import {printChecklist} from '../utils/printReport';
import {situacoesAtendimento, tiposVisita, type RegistroElevador, type SituacaoAtendimento, type Ticket, type TipoVisita} from '../types';

interface FormDataRegistro {
  inicio:string;
  fim:string;
  lubrificacao:boolean;
  testeSeguranca:boolean;
  pecas:string;
  observacoes:string;
  responsavel:string;
  assinatura:string;
  equipamentos:RegistroElevador[];
  observacoesEmpresa:string;
  ocorrencia:string;
  materialNecessario:string;
  exigeAutorizacao:boolean;
  dataAutorizacao:string;
  nomeClienteAutorizacao:string;
  assinaturaAutorizacao:string;
  assinaturaTecnico:string;
  nomeLiderServicos:string;
  assinaturaLiderServicos:string;
}
const newEquipment=(elevadorId:string,ticket:Ticket):RegistroElevador=>({
  elevadorId,
  tiposVisita:ticket.tipo==='Preventiva'?['Mensal']:['Corretiva'],
  situacoes:[],
  outros:'',
  ...(ticket.tipo==='Preventiva'?{checklistMensal:novoChecklistMensal()}:{}),
});
const initialForm=(ticket:Ticket):FormDataRegistro=>({
  inicio:nowLocalInput(), fim:nowLocalInput(), lubrificacao:false,
  testeSeguranca:false, pecas:'', observacoes:'', responsavel:'', assinatura:'',
  equipamentos:[newEquipment(ticket.elevadorId,ticket)],
  observacoesEmpresa:'', ocorrencia:'', materialNecessario:'',
  exigeAutorizacao:false, dataAutorizacao:nowLocalInput().slice(0,10),
  nomeClienteAutorizacao:'', assinaturaAutorizacao:'',
  assinaturaTecnico:'', nomeLiderServicos:'', assinaturaLiderServicos:'',
});

export default function Checklists() {
  const {db,user,access,saveChecklist,notify}=useApp();
  const [ticketId,setTicketId]=useState('');
  const [form,setForm]=useState<FormDataRegistro|null>(null);
  const [filter,setFilter]=useState('Todos');
  // Uma visita com pendências pode gerar novos registros no mesmo chamado.
  const eligible=access.tickets.filter(t=>t.status!=='Concluído'&&
    (user.perfil==='admin'?Boolean(t.tecnicoId):t.tecnicoId===user.id));
  const history=access.history.filter(c=>filter==='Todos'||c.tipo===filter);
  const ticket=db.tickets.find(t=>t.id===ticketId);
  const building=db.buildings.find(b=>b.id===ticket?.predioId);
  const client=db.clients.find(c=>c.id===building?.clienteId);
  const technician=db.users.find(u=>u.id===ticket?.tecnicoId);
  const availableElevators=useMemo(()=>db.elevators.filter(e=>e.predioId===ticket?.predioId),[db.elevators,ticket?.predioId]);
  const openForm=(selected:Ticket)=>{setForm(initialForm(selected));setTicketId(selected.id);};
  const monthlyEquipments=form?.equipamentos.filter(e=>e.tiposVisita.includes('Mensal'))||[];
  const monthlySelected=monthlyEquipments.length>0;
  const closeForm=()=>{setTicketId('');setForm(null);};
  const updateEquipment=(index:number,update:Partial<RegistroElevador>)=>{
    setForm(prev=>prev?{...prev,equipamentos:prev.equipamentos.map((e,i)=>i===index?{...e,...update}:e)}:prev);
  };
  const toggleVisit=(index:number,type:TipoVisita,checked:boolean)=>{
    const item=form?.equipamentos[index];if(!item)return;
    updateEquipment(index,{
      tiposVisita:checked?[...item.tiposVisita,type]:item.tiposVisita.filter(v=>v!==type),
      ...(checked&&type==='Mensal'&&!item.checklistMensal?{checklistMensal:novoChecklistMensal()}:{}),
    });
  };
  const toggleSituation=(index:number,situation:SituacaoAtendimento,checked:boolean)=>{
    const item=form?.equipamentos[index];if(!item)return;
    let situacoes=checked?[...item.situacoes,situation]:item.situacoes.filter(v=>v!==situation);
    // Evita duas declarações incompatíveis na mesma visita.
    if(checked&&situation==='Atendimento regularizado')situacoes=['Atendimento regularizado'];
    if(checked&&situation!=='Atendimento regularizado')situacoes=situacoes.filter(v=>v!=='Atendimento regularizado');
    updateEquipment(index,{situacoes});
  };
  const addElevator=()=>{
    if(!ticket||!form||form.equipamentos.length>=2)return;
    const next=availableElevators.find(e=>!form.equipamentos.some(x=>x.elevadorId===e.id));
    if(next)setForm({...form,equipamentos:[...form.equipamentos,newEquipment(next.id,ticket)]});
  };
  const create=(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();
    if(!ticket||!form||!eligible.some(t=>t.id===ticketId))return notify('Chamado não autorizado para registro.');
    if(new Date(form.fim).getTime()<new Date(form.inicio).getTime())return notify('A saída não pode ser anterior à chegada.');
    if(form.equipamentos.some(e=>!e.tiposVisita.length||!e.situacoes.length))
      return notify('Informe o tipo de visita e a situação final de cada elevador.');
    if(form.equipamentos.some(e=>e.situacoes.includes('Outros')&&!e.outros.trim()))
      return notify('Descreva a situação marcada como Outros.');
    if(monthlyEquipments.some(e=>!e.checklistMensal||codigosChecklistMensal.some(codigo=>
      !e.checklistMensal?.respostas.some(r=>r.codigo===codigo))))
      return notify('Preencha S, N ou NA em todas as rotinas do checklist mensal de cada elevador.');
    if(monthlySelected&&!form.assinaturaTecnico)return notify('Colete a assinatura do técnico no checklist mensal.');
    if(monthlySelected&&Boolean(form.nomeLiderServicos.trim())!==Boolean(form.assinaturaLiderServicos))
      return notify('Para o líder de serviços, informe nome e assinatura juntos ou deixe os dois em branco.');
    if(!form.responsavel.trim()||!form.assinatura)return notify('Informe o nome e recolha a assinatura do responsável.');
    if(form.exigeAutorizacao&&(!form.materialNecessario.trim()||!form.nomeClienteAutorizacao.trim()||!form.assinaturaAutorizacao))
      return notify('A autorização requer material descrito, nome e assinatura do cliente.');
    // O número é interno ao ElevateControl, não reproduz a numeração do documento da empresa.
    const registroAtendimento={
      numeroRegistro:nextId('RA'),
      equipamentos:form.equipamentos.map(e=>({
        ...e,
        ...(e.tiposVisita.includes('Mensal')?{}:{checklistMensal:undefined}),
      })),
      observacoesEmpresa:form.observacoesEmpresa.trim(),
      ocorrencia:form.ocorrencia.trim(),
      materialNecessario:form.materialNecessario.trim(),
      autorizacaoMaterial:form.exigeAutorizacao?{
        data:form.dataAutorizacao,
        nomeCliente:form.nomeClienteAutorizacao.trim(),
        tecnico:technician?.nome||'',
        assinaturaCliente:form.assinaturaAutorizacao,
      }:null,
      ...(monthlySelected?{assinaturasMensais:{
        assinaturaTecnico:form.assinaturaTecnico,
        nomeLiderServicos:form.nomeLiderServicos.trim(),
        assinaturaLiderServicos:form.assinaturaLiderServicos,
      }}:{}),
      servicoExecutado:{
        data:form.fim.slice(0,10),
        nomeCliente:form.responsavel.trim(),
        tecnico:technician?.nome||'',
        assinaturaCliente:form.assinatura,
      },
    };
    saveChecklist({
      chamadoId:ticketId,tecnicoId:ticket.tecnicoId,
      tipo:monthlySelected?'Mensal':'Atendimento',
      inicio:form.inicio,fim:form.fim,lubrificacao:form.lubrificacao,
      testeSeguranca:form.testeSeguranca,pecas:form.pecas.trim(),
      observacoes:form.observacoes.trim(),responsavel:form.responsavel.trim(),
      assinatura:form.assinatura,registroAtendimento,
    });
    closeForm();
  };
  return <>
    <PageHeader eyebrow="ATENDIMENTO / REGISTRO DE VISITA" title="Atendimentos e checklists" subtitle="Registre a visita técnica, a situação dos elevadores, materiais e validações do cliente." action={eligible.length>0&&<Button icon={Plus} onClick={()=>openForm(eligible[0])}>Novo registro de atendimento</Button>}/>
    <div className="checklist-steps"><div><span>01</span><strong>Chamado</strong><small>Técnico atribuído</small></div><ArrowRight size={17}/><div><span>02</span><strong>Visita</strong><small>1 ou 2 elevadores</small></div><ArrowRight size={17}/><div><span>03</span><strong>Checklist</strong><small>Mensal, se aplicável</small></div><ArrowRight size={17}/><div><span>04</span><strong>Material</strong><small>Comprovante</small></div><ArrowRight size={17}/><div><span>05</span><strong>Validação</strong><small>Assinaturas</small></div></div>
    <Panel title="Atendimentos disponíveis" subtitle="Chamados com técnico atribuído. Pendências permitem registrar novas visitas.">
      {eligible.length?<div className="available-list">{eligible.map(t=>{const b=db.buildings.find(b=>b.id===t.predioId);return <div className="available-item" key={t.id}><span className="available-icon"><Wrench size={20}/></span><div className="available-text"><strong>{t.titulo}</strong><small>{t.id} · {b?.nome} · {t.tipo}</small></div><Badge>{t.status}</Badge><Button variant="secondary" onClick={()=>openForm(t)}>Registrar visita</Button></div>})}</div>:<EmptyState icon={CheckCircle2} title="Nenhuma visita pendente" description="Chamados abertos com técnico atribuído aparecerão aqui."/>}
    </Panel>
    <Panel className="section-gap" title="Registros e checklists finalizados" subtitle="Histórico de visitas para consulta e impressão" action={<select aria-label="Filtrar checklists" className="select-compact" value={filter} onChange={e=>setFilter(e.target.value)}><option>Todos</option><option>Mensal</option><option>Atendimento</option></select>}>
      {history.length?<div className="table-scroll"><table className="data-table"><thead><tr><th>ATENDIMENTO</th><th>PRÉDIO</th><th>TIPO</th><th>REGISTRO</th><th>DATA</th><th>RELATÓRIO</th></tr></thead><tbody>{history.map(c=>{const t=db.tickets.find(t=>t.id===c.chamadoId);const b=db.buildings.find(b=>b.id===t?.predioId);return <tr key={c.id}><td><strong className="table-main">{t?.titulo||c.chamadoId}</strong><small className="table-secondary">{c.chamadoId} · {c.id}</small></td><td>{b?.nome||'—'}</td><td><Badge tone={c.tipo==='Mensal'?'blue':'neutral'}>{c.tipo}</Badge></td><td>{c.registroAtendimento?.numeroRegistro||'Modelo anterior'}</td><td>{dateBr(c.concluidoEm)}</td><td><button className="report-button" onClick={()=>printChecklist(c,db)}><FileText size={16}/> Imprimir / PDF</button></td></tr>})}</tbody></table></div>:<EmptyState title="Nenhum registro disponível" description="Os atendimentos finalizados aparecerão aqui."/>}
    </Panel>
    {ticket&&form&&<Modal wide title="Registro de atendimento" subtitle={`${ticket.id} · ${ticket.titulo}`} onClose={closeForm}>
      <form className="form-grid" onSubmit={create}>
        <div className="full"><Note>Modelo digital inspirado no formulário recebido. O registro fica no histórico mesmo quando o elevador permanece parado ou com material pendente. Informações demonstrativas, sem vínculo com a empresa do formulário original.</Note></div>
        <div className="registro-section full"><span className="registro-step">01</span><div><h3>Identificação e horários</h3><p>Dados da chamada e da equipe, aproveitados do cadastro do sistema.</p></div></div>
        <Field label="Chamado (automático)"><input value={ticket.id} readOnly/></Field>
        <Field label="Data da chamada"><input value={dateTimeBr(ticket.data)} readOnly/></Field>
        <Field label="Prédio"><input value={building?.nome||''} readOnly/></Field>
        <Field label="Cliente / condomínio"><input value={client?.nome||''} readOnly/></Field>
        <Field label="Técnico responsável"><input value={technician?.nome||''} readOnly/></Field>
        <Field label="Registro de atendimento"><input value="Gerado ao salvar" readOnly/></Field>
        <Field label="Chegada ao local"><input type="datetime-local" required value={form.inicio} onChange={e=>setForm({...form,inicio:e.target.value})}/></Field>
        <Field label="Saída do local"><input type="datetime-local" required value={form.fim} onChange={e=>setForm({...form,fim:e.target.value})}/></Field>

        <div className="registro-section full"><span className="registro-step">02</span><div><h3>Elevadores e tipo de visita</h3><p>O formulário original possui espaço para dois elevadores no mesmo atendimento.</p></div></div>
        <div className="full registro-equipment-grid">{form.equipamentos.map((eq,index)=>{
          const elevator=db.elevators.find(e=>e.id===eq.elevadorId);
          const options=availableElevators.filter(e=>e.id===eq.elevadorId||!form.equipamentos.some(v=>v.elevadorId===e.id));
          return <section className="registro-equipment-card" key={index}>
            <div className="registro-equipment-head"><strong>Elevador {index+1}</strong>{index===1&&<button type="button" className="text-link" onClick={()=>setForm({...form,equipamentos:form.equipamentos.slice(0,1)})}>Remover</button>}</div>
            <Field label="Identificação do elevador"><select value={eq.elevadorId} disabled={index===0} onChange={e=>updateEquipment(index,{elevadorId:e.target.value})}>{options.map(e=><option key={e.id} value={e.id}>{e.identificacao} · {e.marca}</option>)}</select></Field>
            {index===0&&<small className="registro-hint">Vinculado automaticamente ao chamado. {elevator?.id}</small>}
            <div className="registro-label">Tipo de visita *</div>
            <div className="registro-option-list">{tiposVisita.map(type=><label key={type} className="registro-check"><input type="checkbox" checked={eq.tiposVisita.includes(type)} onChange={e=>toggleVisit(index,type,e.target.checked)}/>{type}</label>)}</div>
            <div className="registro-label">Situação após atendimento *</div>
            <div className="registro-option-list">{situacoesAtendimento.map(status=><label key={status} className="registro-check"><input type="checkbox" checked={eq.situacoes.includes(status)} onChange={e=>toggleSituation(index,status,e.target.checked)}/>{status}</label>)}</div>
            {eq.situacoes.includes('Outros')&&<Field label="Especifique 'Outros'"><input required maxLength={160} value={eq.outros} onChange={e=>updateEquipment(index,{outros:e.target.value})}/></Field>}
          </section>;
        })}</div>
        {form.equipamentos.length<2&&availableElevators.length>1&&<div className="full"><Button variant="secondary" icon={Plus} onClick={addElevator}>Adicionar segundo elevador</Button></div>}
        {monthlySelected&&<>
          <div className="registro-section full"><span className="registro-step">03</span><div><h3>Checklist mensal padrão 2026</h3><p>Rotinas individuais por elevador, com S, N e NA e aferições técnicas.</p></div></div>
          {form.equipamentos.map((eq,index)=>eq.tiposVisita.includes('Mensal')&&<div className="full" key={`mensal-${eq.elevadorId}`}>
            <MonthlyChecklistForm elevadorId={eq.elevadorId} identificacao={db.elevators.find(e=>e.id===eq.elevadorId)?.identificacao||`Elevador ${index+1}`}
              value={eq.checklistMensal||novoChecklistMensal()} onChange={checklistMensal=>updateEquipment(index,{checklistMensal})}/>
          </div>)}
        </>}
        <div className="registro-section full"><span className="registro-step">{monthlySelected?'04':'03'}</span><div><h3>Ocorrência e observações</h3><p>Separe problemas do equipamento das observações gerais do atendimento.</p></div></div>
        <Field className="full" label="Registro de ocorrência — apenas problemas com o equipamento"><textarea rows={3} maxLength={1500} value={form.ocorrencia} onChange={e=>setForm({...form,ocorrencia:e.target.value})} placeholder="Ex.: Ruído na máquina de tração e falha de nivelamento"/></Field>
        <Field className="full" label="Observações gerais da visita / atendimento"><textarea rows={3} maxLength={1600} value={form.observacoesEmpresa} onChange={e=>setForm({...form,observacoesEmpresa:e.target.value})} placeholder="Informações adicionais sobre a visita"/></Field>
        {!monthlySelected&&<div className="full checklist-options"><label className="check-option"><input type="checkbox" checked={form.lubrificacao} onChange={e=>setForm({...form,lubrificacao:e.target.checked})}/><div><strong>Lubrificação verificada / realizada</strong><span>Item já existente no checklist preventivo</span></div></label><label className="check-option"><input type="checkbox" checked={form.testeSeguranca} onChange={e=>setForm({...form,testeSeguranca:e.target.checked})}/><div><strong>Teste de segurança realizado</strong><span>Item já existente no checklist técnico</span></div></label></div>}
        <Field className="full" label="Peças efetivamente substituídas"><input maxLength={500} value={form.pecas} onChange={e=>setForm({...form,pecas:e.target.value})} placeholder="Ex.: Sensor de porta, relé de comando"/></Field>
        <Field className="full" label="Serviço executado / observações técnicas"><textarea rows={3} required maxLength={1800} value={form.observacoes} onChange={e=>setForm({...form,observacoes:e.target.value})} placeholder="Descreva os serviços realizados e as verificações"/></Field>
        <div className="registro-section full"><span className="registro-step">{monthlySelected?'05':'04'}</span><div><h3>Comprovante de material</h3><p>Registre materiais necessários e, se houver autorização, a assinatura do cliente.</p></div></div>
        <Field className="full" label="Descrição do material necessário"><textarea rows={3} maxLength={1200} value={form.materialNecessario} onChange={e=>setForm({...form,materialNecessario:e.target.value})} placeholder="Liste itens e quantidades necessários, se houver"/></Field>
        <label className="registro-authorization full"><input type="checkbox" checked={form.exigeAutorizacao} onChange={e=>setForm({...form,exigeAutorizacao:e.target.checked,assinaturaAutorizacao:e.target.checked?form.assinaturaAutorizacao:''})}/><span><strong>Registrar autorização do fornecimento de material</strong><small>Habilite quando o cliente autorizar o fornecimento durante a visita.</small></span></label>
        {form.exigeAutorizacao&&<>
          <Field label="Data da autorização"><input type="date" required value={form.dataAutorizacao} onChange={e=>setForm({...form,dataAutorizacao:e.target.value})}/></Field>
          <Field label="Nome do cliente que autoriza"><input required maxLength={120} value={form.nomeClienteAutorizacao} onChange={e=>setForm({...form,nomeClienteAutorizacao:e.target.value})}/></Field>
          <div className="full"><div className="registro-label">Assinatura para autorização de material</div><SignaturePad label="Assinatura do cliente — autorização de material *" onChange={assinaturaAutorizacao=>setForm(prev=>prev?{...prev,assinaturaAutorizacao}:prev)}/></div>
        </>}
        <div className="registro-section full"><span className="registro-step">{monthlySelected?'06':'05'}</span><div><h3>Serviço executivo e validação</h3><p>A assinatura principal do cliente também valida o serviço executado, sem repetir a coleta.</p></div></div>
        <Field className="full" label="Nome do cliente / responsável que valida"><input required maxLength={120} value={form.responsavel} onChange={e=>setForm({...form,responsavel:e.target.value})} placeholder="Nome completo"/></Field>
        <div className="full"><SignaturePad label={monthlySelected?'Assinatura do responsável pelo condomínio — serviço executado *':'Assinatura do cliente — serviço executado *'} onChange={assinatura=>setForm(prev=>prev?{...prev,assinatura}:prev)}/></div>
        {monthlySelected&&<div className="full monthly-signatures">
          <div className="monthly-signature-title"><h4>Assinaturas do checklist de manutenção mensal</h4><p>A assinatura do responsável pelo condomínio acima é aproveitada também no checklist mensal; não precisa coletar duas vezes.</p></div>
          <SignaturePad label="Assinatura do técnico *" onChange={assinaturaTecnico=>setForm(prev=>prev?{...prev,assinaturaTecnico}:prev)}/>
          <Field label="Nome do líder de serviços (quando aplicável)"><input maxLength={120} value={form.nomeLiderServicos} onChange={e=>setForm({...form,nomeLiderServicos:e.target.value})} placeholder="Nome do líder responsável"/></Field>
          <SignaturePad label="Assinatura do líder de serviços (quando aplicável)" onChange={assinaturaLiderServicos=>setForm(prev=>prev?{...prev,assinaturaLiderServicos}:prev)}/>
        </div>}
        <div className="full"><Note tone="warning">Se um elevador estiver parado, com pendência de material, apoio técnico ou orçamento pendente, a visita será registrada, mas o chamado não será concluído automaticamente. Assinaturas são demonstrativas até validação pelo backend.</Note></div>
        <div className="form-actions full"><Button variant="secondary" onClick={closeForm}>Cancelar</Button><Button icon={PackageCheck} type="submit">Salvar registro de atendimento</Button></div>
      </form>
    </Modal>}
  </>;
}
