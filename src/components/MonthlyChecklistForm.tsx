import {ClipboardCheck} from 'lucide-react';
import {codigosChecklistMensal,secoesChecklistMensal,totalRotinasMensais} from '../data/monthlyChecklist';
import type {ChecklistMensalDetalhado,RespostaRotina} from '../types';
import {Field,Note} from './UI';

export const novoChecklistMensal=():ChecklistMensalDetalhado=>({
  versao:'2026',ll:'',respostas:[],folgaRedutorMm:'',medidasAcrilicos:'',distanciaContrapesoParachoqueMm:'',
});

interface Props {
  elevadorId:string;
  identificacao:string;
  value:ChecklistMensalDetalhado;
  onChange:(value:ChecklistMensalDetalhado)=>void;
}
/** Um formulário mensal por elevador; mantém cada resposta com código estável para o backend. */
export default function MonthlyChecklistForm({elevadorId,identificacao,value,onChange}:Props){
  const marked=new Map(value.respostas.map(r=>[r.codigo,r.resposta]));
  const count=codigosChecklistMensal.filter(codigo=>marked.has(codigo)).length;
  const choose=(codigo:string,resposta:RespostaRotina)=>onChange({
    ...value,respostas:[...value.respostas.filter(r=>r.codigo!==codigo),{codigo,resposta}],
  });
  const setMeasure=(key:'ll'|'folgaRedutorMm'|'medidasAcrilicos'|'distanciaContrapesoParachoqueMm',data:string)=>onChange({...value,[key]:data});
  return <section className="monthly-wrapper" aria-label={`Checklist mensal ${identificacao}`}>
    <div className="monthly-header"><span className="monthly-icon"><ClipboardCheck size={19}/></span><div>
      <h4>Check-list padrão 2026 — manutenção mensal</h4>
      <p>{identificacao} · {count} de {totalRotinasMensais} rotinas preenchidas</p>
    </div><span className="monthly-progress-label">{Math.round(count/totalRotinasMensais*100)}%</span></div>
    <div className="monthly-progress-track"><span style={{width:`${count/totalRotinasMensais*100}%`}}/></div>
    <Note>Marque S (sim), N (não) ou NA (não se aplica) conforme a pergunta de cada linha. A resposta N não significa, por si só, que o elevador esteja irregular. A situação final continua sendo registrada no atendimento.</Note>
    <div className="monthly-intro-field"><Field label="LL — conforme formulário original" help="Sigla reproduzida fielmente; confirme com a equipe técnica seu significado antes da integração definitiva."><input maxLength={90} value={value.ll} onChange={e=>setMeasure('ll',e.target.value)} placeholder="Informar, se aplicável"/></Field></div>
    {secoesChecklistMensal.map((secao,i)=><div className="monthly-section" key={secao.codigo}>
      <div className="monthly-section-title"><span>{String(i+1).padStart(2,'0')}</span><h5>{secao.titulo}</h5><small>{secao.itens.length} itens</small></div>
      <div className="monthly-table-scroller"><table className="monthly-table"><thead><tr><th className="monthly-item-col">ITEM</th><th>ROTINA</th><th>S</th><th>N</th><th>NA</th></tr></thead><tbody>
        {secao.itens.map((item,j)=><tr key={item.codigo}><td className="monthly-number">{String(j+1).padStart(2,'0')}</td><td className="monthly-description">{item.texto}{item.periodicidade&&<small>Periodicidade de referência: {item.periodicidade}</small>}</td>
          {(['S','N','NA'] as const).map(answer=><td key={answer} className="monthly-answer"><label title={`${item.texto} — ${answer}`}><input type="radio" name={`mensal-${elevadorId}-${item.codigo}`} value={answer} aria-label={`${item.texto}: ${answer==='S'?'Sim':answer==='N'?'Não':'Não se aplica'}`} checked={marked.get(item.codigo)===answer} onChange={()=>choose(item.codigo,answer)}/></label></td>)}
        </tr>)}
      </tbody></table></div>
    </div>)}
    <div className="monthly-measures">
      <Field label="Folga no redutor (mm)" help="Item 11 da primeira seção — 6 em 6 meses."><input type="number" min="0" step="any" value={value.folgaRedutorMm} onChange={e=>setMeasure('folgaRedutorMm',e.target.value)} placeholder="Ex.: 0,5"/></Field>
      <Field label="Medidas dos acrílicos" help="Item 06 do passadiço da cabina."><input maxLength={120} value={value.medidasAcrilicos} onChange={e=>setMeasure('medidasAcrilicos',e.target.value)} placeholder="Dimensões, se necessário"/></Field>
      <Field label="Distância contrapeso / para-choque (mm)" help="Item 03 do fundo do poço — 6 em 6 meses."><input type="number" min="0" step="any" value={value.distanciaContrapesoParachoqueMm} onChange={e=>setMeasure('distanciaContrapesoParachoqueMm',e.target.value)} placeholder="Ex.: 200"/></Field>
    </div>
  </section>;
}
