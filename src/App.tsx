import {useEffect,useState,type ComponentType} from 'react';
import {CheckCircle2} from 'lucide-react';
import {motion,useReducedMotion} from 'motion/react';
import {useApp} from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import Clients from './pages/Clients';
import Assets from './pages/Assets';
import Team from './pages/Team';
import Checklists from './pages/Checklists';
import Reports from './pages/Reports';
import type {PageKey,PageProps} from './types';
const pages:Record<PageKey,ComponentType<PageProps>>={dashboard:Dashboard,tickets:Tickets,clients:Clients,assets:Assets,team:Team,checklists:Checklists,reports:Reports};
export default function App(){
  const {user,toast}=useApp();
  const [page,setPage]=useState<PageKey>('dashboard');
  const reducedMotion=useReducedMotion();
  useEffect(()=>{document.title=`ElevateControl · ${page==='dashboard'?'Visão geral':page}`;},[page]);
  const allowed:PageKey[]=user.perfil==='admin'?Object.keys(pages) as PageKey[]:user.perfil==='tecnico'
    ?['dashboard','tickets','checklists','reports']:['dashboard','tickets','assets','reports'];
  const active=allowed.includes(page)?page:'dashboard';
  const Page=pages[active];
  return <><Layout page={active} navigate={setPage}><motion.div key={`${user.perfil}-${active}`} initial={reducedMotion?false:{opacity:0,y:7}} animate={{opacity:1,y:0}} transition={{duration:0.2,ease:'easeOut'}}><Page navigate={setPage}/></motion.div></Layout>{toast&&<div className="toast" role="status"><CheckCircle2 size={19}/>{toast}</div>}</>;
}
