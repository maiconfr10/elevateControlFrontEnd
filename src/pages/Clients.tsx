import type {FormEvent} from 'react';
import { useState } from 'react';
import { ArrowRight, Building2, Plus, Search, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, EmptyState, Field, Modal, PageHeader, Panel } from '../components/UI';

const initial = { nome:'', documento:'', contato:'', email:'', telefone:'' };
export default function Clients() {
  const { db, user, add } = useApp();
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState(initial);
  const [search,setSearch]=useState('');
  if(user.perfil!=='admin') return <EmptyState title="Acesso restrito" description="Somente administradores podem gerenciar clientes."/>;
  const rows=db.clients.filter(c=>[c.nome,c.contato,c.documento].join(' ').toLowerCase().includes(search.toLowerCase()));
  const submit=(e:FormEvent<HTMLFormElement>)=>{e.preventDefault();add('clients','CLI',form);setModal(false);setForm(initial)};
  return <>
    <PageHeader eyebrow="CADASTROS / CLIENTES" title="Clientes e condomínios" subtitle="Centralize contatos e informações dos clientes atendidos." action={<Button icon={Plus} onClick={()=>setModal(true)}>Cadastrar cliente</Button>}/>
    <Panel title="Clientes cadastrados" subtitle="Dados de demonstração com contatos fictícios" action={<span className="total-count">{rows.length} cliente(s)</span>}>
      <div className="table-controls"><label className="search-control"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar cliente ou responsável"/></label></div>
      {rows.length?<div className="table-scroll"><table className="data-table"><thead><tr><th>CLIENTE / CONDOMÍNIO</th><th>CONTATO</th><th>E-MAIL</th><th>DOCUMENTO</th><th>PRÉDIOS</th></tr></thead><tbody>{rows.map(c=><tr key={c.id}><td><strong className="table-main">{c.nome}</strong><small className="table-secondary">{c.id}</small></td><td>{c.contato||'—'}<small className="table-secondary">{c.telefone||'—'}</small></td><td>{c.email||'—'}</td><td>{c.documento||'—'}</td><td><span className="count-pill"><Building2 size={14}/>{db.buildings.filter(b=>b.clienteId===c.id).length}</span></td></tr>)}</tbody></table></div>:<EmptyState icon={Users}/>}
    </Panel>
    {modal&&<Modal title="Cadastrar cliente" subtitle="Adicione um cliente à estrutura do ElevateControl." wide onClose={()=>setModal(false)}><form className="form-grid" onSubmit={submit}>
      <Field className="full" label="Nome ou razão social"><input required maxLength="110" value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} placeholder="Ex.: Condomínio Solar"/></Field>
      <Field label="CPF ou CNPJ"><input maxLength="24" value={form.documento} onChange={e=>setForm({...form,documento:e.target.value})} placeholder="Documento do responsável"/></Field>
      <Field label="Responsável / contato"><input required maxLength="90" value={form.contato} onChange={e=>setForm({...form,contato:e.target.value})} placeholder="Nome de contato"/></Field>
      <Field label="E-mail"><input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="contato@exemplo.com"/></Field>
      <Field label="Telefone"><input maxLength="25" value={form.telefone} onChange={e=>setForm({...form,telefone:e.target.value})} placeholder="(21) 90000-0000"/></Field>
      <div className="form-actions full"><Button variant="secondary" onClick={()=>setModal(false)}>Cancelar</Button><Button type="submit" icon={Plus}>Salvar cliente</Button></div>
    </form></Modal>}
  </>;
}
