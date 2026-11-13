/** Contratos do front-end. Ajuste estes tipos junto com os DTOs da API futura. */
export type Role = 'admin' | 'tecnico' | 'cliente';
export type TicketStatus = 'Aberto' | 'Em andamento' | 'Concluído';
export type TicketType = 'Corretiva' | 'Preventiva' | 'Emergência';
export type Priority = 'Normal' | 'Alta' | 'Crítica';
export type ElevatorStatus = 'Operacional' | 'Em manutenção' | 'Fora de serviço';
export type ChecklistType = 'Mensal' | 'Atendimento';
export type PageKey = 'dashboard' | 'tickets' | 'clients' | 'assets' | 'team' | 'checklists' | 'reports';

export interface User {
  id: string; nome: string; email: string; perfil: Role;
  registro?: string; clienteId?: string | null;
}
export interface Client {id:string; nome:string; documento:string; contato:string; email:string; telefone:string}
export interface Building {id:string; clienteId:string; nome:string; endereco:string}
export interface Elevator {id:string; predioId:string; identificacao:string; marca:string; modelo:string; status:ElevatorStatus; pendencia:string}
export interface Ticket {
  id:string; titulo:string; descricao:string; predioId:string; elevadorId:string;
  tipo:TicketType; prioridade:Priority; status:TicketStatus; tecnicoId:string|null;
  criadoPor:string; data:string; concluidoEm:string|null;
}
/** Campos digitalizados do Registro de Atendimento (formulário de referência recebido). */
export const tiposVisita = ['Mensal', 'Auditoria', 'Corretiva', 'Vistoria'] as const;
export type TipoVisita = typeof tiposVisita[number];
export const situacoesAtendimento = [
  'Atendimento regularizado',
  'Pendência de Material',
  'Solicitação de Apoio Técnico',
  'Orçamento pendente de aprovação',
  'Parado',
  'Outros',
] as const;
export type SituacaoAtendimento = typeof situacoesAtendimento[number];
/** Rotinas do checklist mensal padrão 2026 (S = Sim, N = Não, NA = Não se aplica). */
export type RespostaRotina = 'S' | 'N' | 'NA';
export interface MarcacaoRotina {
  codigo:string;
  resposta:RespostaRotina;
}
export interface ChecklistMensalDetalhado {
  versao:'2026';
  ll:string; // Sigla preservada do formulário: significado ainda não informado pelo grupo.
  respostas:MarcacaoRotina[];
  folgaRedutorMm:string;
  medidasAcrilicos:string;
  distanciaContrapesoParachoqueMm:string;
}
export interface AssinaturasMensais {
  assinaturaTecnico:string;
  nomeLiderServicos:string;
  assinaturaLiderServicos:string;
  // A assinatura do responsável do condomínio já existe em servicoExecutado.
}
export interface RegistroElevador {
  elevadorId:string;
  tiposVisita:TipoVisita[];
  situacoes:SituacaoAtendimento[];
  outros:string;
  /** Um checklist mensal por elevador da visita. Opcional para históricos legados. */
  checklistMensal?:ChecklistMensalDetalhado;
}
export interface AutorizacaoMaterial {
  data:string;
  nomeCliente:string;
  tecnico:string;
  assinaturaCliente:string;
}
export interface ServicoExecutado {
  data:string;
  nomeCliente:string;
  tecnico:string;
  assinaturaCliente:string;
}
export interface RegistroAtendimento {
  /** Identificação gerada pelo sistema; não é a numeração de formulários de terceiros. */
  numeroRegistro:string;
  equipamentos:RegistroElevador[]; // 1 ou 2 elevadores do mesmo prédio
  observacoesEmpresa:string;
  ocorrencia:string;
  materialNecessario:string;
  autorizacaoMaterial:AutorizacaoMaterial|null;
  servicoExecutado:ServicoExecutado;
  /** Uma coleta para a visita; assinatura do condomínio é reutilizada de servicoExecutado. */
  assinaturasMensais?:AssinaturasMensais;
}
export interface Checklist {
  id:string; chamadoId:string; tecnicoId:string|null; tipo:ChecklistType;
  inicio:string; fim:string; lubrificacao:boolean; testeSeguranca:boolean;
  pecas:string; observacoes:string; responsavel:string; assinatura:string;
  concluidoEm:string;
  /** Ausente nos registros legados da versão 0.3; não exige migração destrutiva. */
  registroAtendimento?:RegistroAtendimento;
}
export interface Database {
  users:User[]; clients:Client[]; buildings:Building[]; elevators:Elevator[];
  tickets:Ticket[]; checklists:Checklist[];
}
export type Collection = keyof Database;
export type CollectionItem<K extends Collection> = Database[K][number];
export type NewRecord<K extends Collection> = Omit<CollectionItem<K>, 'id'>;
export type NewTicket = Omit<Ticket, 'id'|'status'|'criadoPor'|'data'|'concluidoEm'>;
export type NewChecklist = Omit<Checklist,'id'|'concluidoEm'>;
export interface AccessScope {
  tickets: Ticket[]; buildings: Building[]; elevators: Elevator[]; history: Checklist[];
  myBuildingIds: string[]; visitedBuildingIds: string[];
}
export interface Credentials { email:string; password:string }
export interface PageProps {navigate: (page:PageKey)=>void}
export type BadgeTone = 'blue'|'green'|'amber'|'red'|'neutral';
