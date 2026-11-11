/** Cliente HTTP tipado. Cookie de sessão HttpOnly gerenciado pelo backend. */
const BASE_URL=(import.meta.env.VITE_API_URL||'http://localhost:8080/api').replace(/\/$/,'');
export class ApiError extends Error{
  constructor(message:string,public readonly status:number){super(message);this.name='ApiError';}
}
export interface RequestOptions{
  method?:'GET'|'POST'|'PUT'|'PATCH'|'DELETE';body?:unknown;signal?:AbortSignal;
}
export async function apiRequest<T=unknown>(path:string,{method='GET',body,signal}:RequestOptions={}):Promise<T>{
  let response:Response;
  try{
    response=await fetch(`${BASE_URL}${path}`,{
      method,signal,credentials:'include',headers:{Accept:'application/json',...(body!==undefined?{'Content-Type':'application/json'}:{})},
      ...(body!==undefined?{body:JSON.stringify(body)}:{}),
    });
  }catch{throw new ApiError('Não foi possível conectar ao servidor. Verifique o endereço da API.',0);}
  if(!response.ok){
    const messages:Record<number,string>={400:'Verifique os dados informados.',401:'E-mail ou senha inválidos, ou sessão expirada.',403:'Você não tem permissão para esta operação.',404:'Serviço não encontrado na API.',429:'Muitas tentativas. Tente novamente mais tarde.'};
    throw new ApiError(messages[response.status]||`O servidor retornou um erro (${response.status}).`,response.status);
  }
  if(response.status===204)return null as T;
  const contentType=response.headers.get('content-type')||'';
  if(!contentType.includes('application/json'))throw new ApiError('Resposta inesperada do servidor.',response.status);
  return await response.json() as T;
}
