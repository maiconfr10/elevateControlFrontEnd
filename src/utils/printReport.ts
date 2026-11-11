import type {Checklist, Database} from '../types';
import { dateTimeBr } from './format';

const ESCAPES:Record<string,string>={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};
const escapeHtml=(value:unknown):string=>String(value??'').replace(/[&<>"']/g,ch=>ESCAPES[ch]||ch);
export function printChecklist(checklist:Checklist, db:Database):void {
  const ticket = db.tickets.find(t=>t.id===checklist.chamadoId);
  const building = db.buildings.find(b=>b.id===ticket?.predioId);
  const elevator = db.elevators.find(e=>e.id===ticket?.elevadorId);
  const tech = db.users.find(u=>u.id===checklist.tecnicoId);
  const doc = window.open('', '_blank');
  if(!doc) { window.alert('O navegador bloqueou a janela. Permita pop-ups para imprimir o relatório.'); return; }
  const row=(label:string,value:unknown)=>`<div class="row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
  doc.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"/><title>Relatório ${escapeHtml(ticket?.id||'')}</title><style>body{font:14px Arial,sans-serif;color:#24344b;max-width:780px;margin:40px auto;line-height:1.6}h1{color:#193c61;font-size:24px}h2{font-size:16px;border-bottom:1px solid #dbe1e7;padding-bottom:8px;margin-top:30px}.row{display:flex;justify-content:space-between;gap:15px;padding:9px 0;border-bottom:1px solid #e8ecef}.row span{color:#687b90}.row strong{text-align:right}.logo{color:#12365b;font-weight:800;letter-spacing:-.5px}.subtitle{color:#72849b}img{height:85px;max-width:300px;object-fit:contain;border-bottom:1px solid #8896a7}.notice{background:#f5f8fa;padding:15px;margin:16px 0;border-radius:8px;white-space:pre-wrap}.foot{font-size:11px;color:#8998a6;margin-top:48px}@media print{body{margin:16mm}}</style></head><body><div class="logo">▣ ElevateControl</div><h1>Relatório técnico de atendimento</h1><p class="subtitle">Gerado a partir do protótipo acadêmico. Dados de demonstração.</p><h2>Informações gerais</h2>${row('Chamado',ticket?.id||'—')}${row('Tipo',checklist.tipo)}${row('Prédio',building?.nome||'—')}${row('Elevador',elevator?.identificacao||'—')}${row('Técnico',tech?.nome||'—')}${row('Entrada',dateTimeBr(checklist.inicio))}${row('Saída',dateTimeBr(checklist.fim))}<h2>Itens verificados</h2>${row('Lubrificação',checklist.lubrificacao?'Realizada':'Não assinalada')}${row('Teste de segurança',checklist.testeSeguranca?'Realizado':'Não assinalado')}${row('Peças',checklist.pecas||'Nenhuma informada')}<h2>Observações</h2><div class="notice">${escapeHtml(checklist.observacoes||'Sem observações.')}</div><h2>Validação do responsável</h2><p>Responsável: <strong>${escapeHtml(checklist.responsavel||'—')}</strong></p>${checklist.assinatura?`<img alt="Assinatura do responsável" src="${checklist.assinatura}"/>`:'<p>Assinatura digital não disponível neste registro de exemplo.</p>'}<div class="foot">Documento demonstrativo. Na versão de produção, a geração oficial do PDF deverá ser validada e registrada no backend.</div></body></html>`);
  doc.document.close();doc.focus();
  setTimeout(()=>doc.print(),300);
}
