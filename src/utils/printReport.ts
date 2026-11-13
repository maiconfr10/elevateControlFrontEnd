import {situacoesAtendimento, tiposVisita, type Checklist, type Database} from '../types';
import {dateBr, dateTimeBr} from './format';
import {secoesChecklistMensal} from '../data/monthlyChecklist';
import type {ChecklistMensalDetalhado} from '../types';

const ESCAPES:Record<string,string>={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};
const escapeHtml=(value:unknown):string=>String(value??'').replace(/[&<>"']/g,ch=>ESCAPES[ch]||ch);
const safeSignature=(value:string):string=>/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(value)?value:'';
const row=(label:string,value:unknown)=>`<div class="row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value||'—')}</strong></div>`;
const signature=(title:string,value:string)=>{
  const src=safeSignature(value);
  return `<div class="signature"><span>${escapeHtml(title)}</span>${src?`<img src="${src}" alt="${escapeHtml(title)}"/>`:'<p>Não disponível no registro demonstrativo.</p>'}</div>`;
};
const paragraph=(value:unknown)=>`<div class="notice">${escapeHtml(value||'Não informado.')}</div>`;

const monthlyBlock=(monthly:ChecklistMensalDetalhado):string=>{
  const responses=new Map(monthly.respostas.map(item=>[item.codigo,item.resposta]));
  return `<div class="monthly-report"><h3>CHECK-LIST — Manutenção mensal · Modelo 2026</h3>
  ${row('LL (sigla do modelo original)',monthly.ll)}
  ${secoesChecklistMensal.map(section=>`<h4>${escapeHtml(section.titulo)}</h4><table class="monthly-report-table"><thead><tr><th>Item</th><th>Rotina</th><th>S</th><th>N</th><th>NA</th></tr></thead><tbody>
    ${section.itens.map((item,index)=>`<tr><td>${String(index+1).padStart(2,'0')}</td><td>${escapeHtml(item.texto)} ${item.periodicidade?`<small>(${escapeHtml(item.periodicidade)})</small>`:''}</td>${(['S','N','NA'] as const).map(a=>`<td class="mark">${responses.get(item.codigo)===a?'●':'—'}</td>`).join('')}</tr>`).join('')}
  </tbody></table>`).join('')}
  ${row('Folga no redutor (mm)',monthly.folgaRedutorMm)}
  ${row('Medidas dos acrílicos',monthly.medidasAcrilicos)}
  ${row('Distância contrapeso / para-choque (mm)',monthly.distanciaContrapesoParachoqueMm)}</div>`;
};

/** Impressão demonstrativa do checklist, registro de atendimento e comprovante de material.
 * O backend futuro será responsável pela emissão definitiva, auditoria e autorização. */
export function printChecklist(checklist:Checklist, db:Database):void {
  const ticket=db.tickets.find(t=>t.id===checklist.chamadoId);
  const building=db.buildings.find(b=>b.id===ticket?.predioId);
  const client=db.clients.find(c=>c.id===building?.clienteId);
  const elevator=db.elevators.find(e=>e.id===ticket?.elevadorId);
  const tech=db.users.find(u=>u.id===checklist.tecnicoId);
  const registro=checklist.registroAtendimento;
  const hasDetailedMonthly=Boolean(registro?.equipamentos.some(item=>item.checklistMensal));
  const popup=window.open('','_blank');
  if(!popup){window.alert('Permita pop-ups para visualizar o relatório.');return;}
  const equipamentos=registro?.equipamentos.map((item,index)=>{
    const info=db.elevators.find(e=>e.id===item.elevadorId);
    return `<div class="equip"><h3>Elevador ${index+1} — ${escapeHtml(info?.identificacao||item.elevadorId)}</h3>
      ${row('Marca / modelo',[info?.marca,info?.modelo].filter(Boolean).join(' / '))}
      <div class="columns"><div><h4>Tipo de visita</h4>${tiposVisita.map(type=>row(type,item.tiposVisita.includes(type)?'Marcado':'—')).join('')}</div><div><h4>Situação após atendimento</h4>${situacoesAtendimento.map(status=>row(status,item.situacoes.includes(status)?'Marcado':'—')).join('')}</div></div>
      ${item.situacoes.includes('Outros')?row('Outros',item.outros):''}
      ${item.checklistMensal?monthlyBlock(item.checklistMensal):''}</div>`;
  }).join('')||'';
  const authorization=registro?.autorizacaoMaterial;
  const monthlySignatures=registro?.assinaturasMensais;
  const monthSignatures=monthlySignatures?`<div class="subsection"><h2>Assinaturas — manutenção mensal</h2>
    ${signature('Assinatura do técnico',monthlySignatures.assinaturaTecnico)}
    ${row('Líder de serviços',monthlySignatures.nomeLiderServicos)}
    ${signature('Assinatura do líder de serviços',monthlySignatures.assinaturaLiderServicos)}
    ${signature('Assinatura do responsável pelo condomínio (reaproveitada da validação)',registro?.servicoExecutado.assinaturaCliente||'')}
    </div>`:'';
  const additional=registro?`
    <h2>Registro de atendimento — ${escapeHtml(registro.numeroRegistro)}</h2>
    ${equipamentos}
    <h3>Registro de ocorrência (problemas com equipamento)</h3>${paragraph(registro.ocorrencia)}
    <h3>Observações gerais / atendimento</h3>${paragraph(registro.observacoesEmpresa)}
    <h2>Comprovante de material</h2><h3>Descrição do material necessário</h3>${paragraph(registro.materialNecessario)}
    <div class="subsection"><h3>Autorização do fornecimento de material</h3>
    ${authorization?`${row('Data',dateBr(authorization.data))}${row('Nome do cliente',authorization.nomeCliente)}${row('Técnico',authorization.tecnico)}${signature('Assinatura do cliente — autorização',authorization.assinaturaCliente)}`:'<p>Autorização não registrada para este atendimento.</p>'}</div>
    <div class="subsection"><h3>Serviço executivo</h3>${row('Data',dateBr(registro.servicoExecutado.data))}${row('Cliente',registro.servicoExecutado.nomeCliente)}${row('Técnico',registro.servicoExecutado.tecnico)}${signature('Assinatura do cliente — serviço executado',registro.servicoExecutado.assinaturaCliente)}</div>${monthSignatures}
  `:'';
  popup.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"/>
  <title>ElevateControl — ${escapeHtml(registro?.numeroRegistro||checklist.id)}</title>
  <style>
    *{box-sizing:border-box}body{font:12px Arial,sans-serif;color:#24344b;max-width:800px;margin:34px auto;line-height:1.6}
    .brand{font-weight:800;color:#174e83;font-size:20px;letter-spacing:-.5px}.subtitle{color:#70849b}
    h1{font-size:23px;margin:12px 0 2px;color:#1d3b56}h2{font-size:15px;border-bottom:2px solid #dbe5ef;padding-bottom:7px;margin-top:27px;color:#274665}
    h3{font-size:12px;color:#31536e;margin:18px 0 9px}h4{font-size:11px;color:#56728c;margin:8px 0}
    .row{display:flex;justify-content:space-between;align-items:start;gap:14px;padding:6px 0;border-bottom:1px solid #e8edf2;break-inside:avoid}
    .row span{color:#61778b;min-width:0}.row strong{text-align:right;font-weight:700;max-width:60%;white-space:pre-line;overflow-wrap:anywhere}
    .columns{display:grid;grid-template-columns:1fr 1fr;gap:19px}.equip{break-inside:auto;page-break-inside:auto}.subsection{break-inside:avoid;page-break-inside:avoid}.equip,.subsection{margin:13px 0}
    .equip{background:#f9fbfd;border:1px solid #e7edf3;padding:13px;border-radius:8px}
    .notice{background:#f5f8fb;padding:13px;border:1px solid #ebf0f6;border-radius:6px;white-space:pre-wrap;overflow-wrap:anywhere;min-height:32px}
    .signature{border:1px solid #e3eaf1;border-radius:8px;padding:12px;margin:10px 0;break-inside:avoid}
    .signature>span{display:block;color:#7890a2;font-size:11px}.signature img{max-width:280px;height:80px;object-fit:contain;border-bottom:1px solid #9aa9b8;display:block}
    .signature p{font-size:11px;color:#8a98a6}
    .monthly-report{margin:17px 0;padding-top:10px;border-top:1px dashed #bbcadd;break-before:auto}
    .monthly-report-table{width:100%;border-collapse:collapse;margin:7px 0 14px;table-layout:fixed}
    .monthly-report-table th,.monthly-report-table td{border:1px solid #d5e0eb;padding:5px;font-size:9px;line-height:1.35;vertical-align:top}
    .monthly-report-table th:first-child,.monthly-report-table td:first-child{width:33px;text-align:center}
    .monthly-report-table th:nth-last-child(-n+3),.monthly-report-table td:nth-last-child(-n+3){width:27px;text-align:center}
    .monthly-report-table th{background:#eaf1f8;color:#244b6d}
    .monthly-report-table tr{break-inside:avoid}
    .monthly-report-table td small{display:block;color:#8795a5}
    .monthly-report-table td.mark{font-size:10px;font-weight:700}
    .footer{border-top:1px solid #dde6ef;margin-top:38px;padding-top:12px;font-size:10px;color:#879bab}
    @page{size:A4;margin:16mm}@media print{body{margin:0;max-width:none}}
  </style></head><body><div class="brand">▣ ElevateControl</div><h1>Registro de atendimento técnico</h1>
  <p class="subtitle">Protótipo acadêmico • Dados e assinaturas de demonstração</p>
  <h2>Chamada / manutenção / material</h2>
  ${row('Nº do registro',registro?.numeroRegistro||checklist.id)}${row('Chamado',ticket?.id)}${row('Data da chamada',dateTimeBr(ticket?.data))}
  ${row('Prédio',building?.nome)}${row('Endereço / nº',building?.endereco)}${row('Cliente / condomínio',client?.nome)}${row('Elevador principal',elevator?.identificacao)}
  ${row('Tipo de atendimento',checklist.tipo)}${row('Chegada',dateTimeBr(checklist.inicio))}${row('Saída',dateTimeBr(checklist.fim))}
  ${row('Técnico',tech?.nome)}${row('Cliente responsável',checklist.responsavel)}
  ${additional}
  <h2>${hasDetailedMonthly?'Complementos do atendimento':'Checklist técnico'}</h2>
  ${hasDetailedMonthly?'':`${row('Lubrificação',checklist.lubrificacao?'Realizada':'Não assinalada')}${row('Teste de segurança',checklist.testeSeguranca?'Realizado':'Não assinalado')}`}
  ${row('Peças substituídas',checklist.pecas)}<h3>Serviço realizado / observações técnicas</h3>${paragraph(checklist.observacoes)}
  ${!registro?`<h2>Validação do responsável</h2>${row('Nome',checklist.responsavel)}${signature('Assinatura do cliente',checklist.assinatura)}`:''}
  <p class="footer">Documento demonstrativo. A emissão oficial, a rastreabilidade e a validade de assinaturas deverão ser tratadas pelo backend.</p></body></html>`);
  popup.document.close();popup.focus();
  setTimeout(()=>popup.print(),350);
}
