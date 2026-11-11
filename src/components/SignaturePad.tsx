import {useEffect,useRef,useState,type PointerEvent} from 'react';
import {RotateCcw} from 'lucide-react';
export default function SignaturePad({onChange}:{onChange:(dataUrl:string)=>void}){
  const canvasRef=useRef<HTMLCanvasElement|null>(null);
  const drawing=useRef(false);const hasStroke=useRef(false);
  const [count,setCount]=useState(0);
  useEffect(()=>{
    const canvas=canvasRef.current;if(!canvas)return;
    const ctx=canvas.getContext('2d');if(!ctx)return;
    const ratio=window.devicePixelRatio||1,rect=canvas.getBoundingClientRect();
    canvas.width=Math.round(rect.width*ratio);canvas.height=Math.round(rect.height*ratio);
    ctx.scale(ratio,ratio);ctx.strokeStyle='#243d59';ctx.lineWidth=2.4;ctx.lineCap='round';ctx.lineJoin='round';
  },[]);
  const point=(e:PointerEvent<HTMLCanvasElement>)=>{
    const rect=e.currentTarget.getBoundingClientRect();return{x:e.clientX-rect.left,y:e.clientY-rect.top};
  };
  const down=(e:PointerEvent<HTMLCanvasElement>)=>{
    e.preventDefault();const canvas=e.currentTarget;canvas.setPointerCapture(e.pointerId);
    const ctx=canvas.getContext('2d');if(!ctx)return;const p=point(e);drawing.current=true;ctx.beginPath();ctx.moveTo(p.x,p.y);
  };
  const move=(e:PointerEvent<HTMLCanvasElement>)=>{
    if(!drawing.current)return;const p=point(e),ctx=e.currentTarget.getContext('2d');if(!ctx)return;
    ctx.lineTo(p.x,p.y);ctx.stroke();hasStroke.current=true;
  };
  const up=()=>{
    if(!drawing.current)return;drawing.current=false;
    if(hasStroke.current&&canvasRef.current){onChange(canvasRef.current.toDataURL('image/png'));setCount(v=>v+1);}
  };
  const clear=()=>{
    const canvas=canvasRef.current;if(!canvas)return;
    canvas.getContext('2d')?.clearRect(0,0,canvas.width,canvas.height);
    drawing.current=false;hasStroke.current=false;onChange('');setCount(0);
  };
  return <div className="signature-wrap"><div className="signature-head"><span>Assinatura do responsável *</span><button type="button" onClick={clear}><RotateCcw size={14}/> Limpar</button></div><canvas ref={canvasRef} className="signature-canvas" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} aria-label="Área para assinatura digital"/><p>Assine com o mouse ou com o dedo. {count>0?'Assinatura capturada.':'A assinatura é obrigatória para encerrar o atendimento.'}</p></div>;
}
