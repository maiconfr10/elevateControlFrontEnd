import { useState, type FormEvent } from 'react';
import type {DemoAccount} from '../services/auth';
import {
  ArrowRight, ArrowUpRight, BadgeCheck, Building2, Check, ChevronLeft,
  ClipboardCheck, DoorOpen, Eye, EyeOff, Headphones, KeyRound,
  LockKeyhole, Mail, ShieldCheck, Wrench,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { demoAccounts, demoPassword } from '../services/auth';

export default function Login() {
  const { login, isDemo, requestPasswordReset, connectionError, retrySession } = useAuth();
  const [view, setView] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const onLogin = async (event:FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setPending(true);
    try {
      await login({ email, password });
    } catch (failure) {
      setError((failure instanceof Error ? failure.message : '') || 'Não foi possível entrar. Tente novamente.');
    } finally {
      setPending(false);
    }
  };

  const onRecover = async (event:FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setPending(true);
    try {
      await requestPasswordReset(email);
      setNotice('Se o e-mail estiver cadastrado, você receberá instruções para recuperar o acesso.');
    } catch (failure) {
      setError((failure instanceof Error ? failure.message : '') || 'Não foi possível solicitar a recuperação.');
    } finally {
      setPending(false);
    }
  };

  const selectDemo = (account:DemoAccount) => {
    setEmail(account.email);
    setPassword(demoPassword);
    setError('');
    setNotice('');
    setView('login');
  };

  return <div className="login-shell">
    <section className="login-aside" aria-label="Apresentação do ElevateControl">
      <div className="login-aside-top">
        <div className="login-brand-icon"><DoorOpen size={24} strokeWidth={2.2}/></div>
        <div className="login-brand-name"><strong>Elevate<span>Control</span></strong><small>GESTÃO INTELIGENTE DE ELEVADORES</small></div>
      </div>
      <div className="login-aside-copy">
        <div className="login-aside-pill"><span className="login-live-dot"/> PLATAFORMA DE GESTÃO</div>
        <h1>Mais controle.<br/><em>Menos complicação.</em></h1>
        <p>Chamados, manutenções e históricos em um só lugar. Uma operação conectada entre administradores, técnicos e clientes.</p>
      </div>
      <div className="login-visual" aria-hidden="true">
        <div className="login-visual-grid"/>
        <div className="login-lift-building">
          <div className="login-lift-header"><Building2 size={17}/> PAINEL DE EQUIPAMENTOS <span>•••</span></div>
          <div className="login-lift-body">
            <div className="login-lift-shaft"><div className="login-lift-top">12 <small>ANDAR</small></div><div className="login-lift-doors"><span/><span/></div><div className="login-lift-bottom"><span className="login-live-dot"/> OPERACIONAL</div></div>
            <div className="login-lift-stats">
              <div><small>Elevadores monitorados</small><strong>24</strong><span>↑ Visão centralizada</span></div>
              <div><small>Chamados em andamento</small><strong>08</strong><span>Atualizados pela equipe</span></div>
              <div className="login-lift-tile"><span><Check size={15}/></span> Manutenção registrada</div>
            </div>
          </div>
        </div>
        <div className="login-floating-card"><span><ClipboardCheck size={18}/></span><div><strong>Atendimento concluído</strong><small>Histórico atualizado</small></div><BadgeCheck size={18}/></div>
      </div>
      <div className="login-aside-footer"><div><ShieldCheck size={17}/> Acesso por perfil</div><span>ADMINISTRADOR · TÉCNICO · CLIENTE</span></div>
    </section>

    <main className="login-main">
      <div className="login-main-top"><span className="login-edition">ELEVATECONTROL / PORTAL</span><span className="login-version">Versão acadêmica · 0.3</span></div>
      <div className="login-content">
        <div className="login-mobile-brand"><div className="login-brand-icon"><DoorOpen size={22}/></div><strong>Elevate<span>Control</span></strong></div>
        <div className="login-form-heading">
          <span className="login-kicker">{view === 'login' ? 'BEM-VINDO DE VOLTA' : 'RECUPERAÇÃO DE ACESSO'}</span>
          <h2>{view === 'login' ? 'Acesse sua conta' : 'Esqueceu sua senha?'}</h2>
          <p>{view === 'login' ? 'Entre para acompanhar chamados, equipamentos e manutenções.' : 'Informe seu e-mail cadastrado para receber as próximas instruções.'}</p>
        </div>
        {connectionError && <div className="login-alert" role="alert">{connectionError}<button type="button" onClick={retrySession}>Tentar novamente</button></div>}
        {error && <div className="login-alert" role="alert">{error}</div>}
        {notice && <div className="login-success" role="status">{notice}</div>}
        <form onSubmit={view === 'login' ? onLogin : onRecover} className="login-form">
          <label className="login-label" htmlFor="login-email">E-mail</label>
          <div className="login-input-wrap"><Mail size={18}/><input autoComplete="email" id="login-email" name="email" type="email" placeholder="seuemail@empresa.com.br" value={email} onChange={e=>setEmail(e.target.value)} required disabled={pending}/></div>
          {view === 'login' && <>
            <div className="login-label-row"><label className="login-label" htmlFor="login-password">Senha</label><button type="button" className="login-forgot" onClick={()=>{setError('');setNotice('');setView('recover')}}>Esqueceu a senha?</button></div>
            <div className="login-input-wrap"><LockKeyhole size={18}/><input id="login-password" name="password" type={showPassword?'text':'password'} placeholder="Digite sua senha" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required disabled={pending}/><button type="button" className="login-reveal" onClick={()=>setShowPassword(value=>!value)} aria-label={showPassword?'Ocultar senha':'Mostrar senha'} aria-pressed={showPassword}>{showPassword?<EyeOff size={19}/>:<Eye size={19}/>}</button></div>
          </>}
          <button type="submit" className="login-submit" disabled={pending}>{pending?'Processando...':view==='login'?'Entrar no sistema':'Enviar instruções'}{!pending && <ArrowRight size={18}/>}</button>
          {view === 'recover' && <button type="button" className="login-back" onClick={()=>{setView('login');setError('');setNotice('')}}><ChevronLeft size={16}/> Voltar ao login</button>}
        </form>
        {isDemo && view === 'login' && <div className="login-demo">
          <div className="login-demo-heading"><span className="login-demo-icon"><KeyRound size={16}/></span><div><strong>Acessos para testar o sistema</strong><p>Modo demonstração · selecione um perfil para preencher os campos</p></div></div>
          <div className="login-demo-grid">
            {demoAccounts.map(account => <button type="button" key={account.id} className={`login-demo-account ${email===account.email?'selected':''}`} onClick={()=>selectDemo(account)}><span className="login-demo-avatar">{account.role==='Administrador'?<ShieldCheck size={19}/>:account.role==='Técnico'?<Wrench size={19}/>:<Building2 size={19}/>}</span><strong>{account.role}</strong><small>{account.hint}</small>{email===account.email && <span className="login-demo-selected"><Check size={12}/></span>}</button>)}
          </div>
          <p className="login-demo-notice">Senha de demonstração: <strong>{demoPassword}</strong>. Dados fictícios, sem autenticação real.</p>
        </div>}
        <div className="login-support"><Headphones size={16}/> {isDemo?'Teste apenas com informações fictícias.':'Problemas para acessar? Entre em contato com o administrador.'}</div>
      </div>
      <footer className="login-main-footer"><span>© 2026 ElevateControl</span><span>Gestão, manutenção e transparência <ArrowUpRight size={13}/></span></footer>
    </main>
  </div>;
}
