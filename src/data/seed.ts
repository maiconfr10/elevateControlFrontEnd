import type {Database} from '../types';
// Dados fictícios exclusivos do protótipo. Não correspondem a clientes reais.
export const seed:Database = {
  users: [
    { id: 'USR-01', nome: 'Camila Ferreira', email: 'camila@exemplo.com', perfil: 'admin', registro: '' },
    { id: 'USR-02', nome: 'Rafael Oliveira', email: 'rafael@exemplo.com', perfil: 'tecnico', registro: 'TEC-2041' },
    { id: 'USR-03', nome: 'Bruno Mendes', email: 'bruno@exemplo.com', perfil: 'tecnico', registro: 'TEC-2190' },
    { id: 'USR-04', nome: 'Mariana Lopes', email: 'mariana@exemplo.com', perfil: 'cliente', clienteId: 'CLI-01' },
    { id: 'USR-05', nome: 'Pedro Silva', email: 'pedro@exemplo.com', perfil: 'cliente', clienteId: 'CLI-02' },
  ],
  clients: [
    { id: 'CLI-01', nome: 'Condomínio Aurora', documento: '00.000.000/0001-01', contato: 'Mariana Lopes', email: 'aurora@exemplo.com', telefone: '(21) 90000-0001' },
    { id: 'CLI-02', nome: 'Grupo Horizonte', documento: '00.000.000/0001-02', contato: 'Pedro Silva', email: 'horizonte@exemplo.com', telefone: '(21) 90000-0002' },
    { id: 'CLI-03', nome: 'Edifício Atlântico', documento: '00.000.000/0001-03', contato: 'Daniela Costa', email: 'atlantico@exemplo.com', telefone: '(21) 90000-0003' },
  ],
  buildings: [
    { id: 'PRD-01', clienteId: 'CLI-01', nome: 'Residencial Aurora', endereco: 'Rua das Acácias, 120 · Rio de Janeiro, RJ' },
    { id: 'PRD-02', clienteId: 'CLI-02', nome: 'Torre Horizonte', endereco: 'Av. Central, 485 · Rio de Janeiro, RJ' },
    { id: 'PRD-03', clienteId: 'CLI-03', nome: 'Edifício Atlântico', endereco: 'Rua do Porto, 78 · Rio de Janeiro, RJ' },
    { id: 'PRD-04', clienteId: 'CLI-01', nome: 'Bloco Aurora II', endereco: 'Rua das Acácias, 130 · Rio de Janeiro, RJ' },
  ],
  elevators: [
    { id: 'ELV-01', predioId: 'PRD-01', identificacao: 'Social 01', marca: 'Atlas', modelo: 'LX-400', status: 'Operacional', pendencia: '' },
    { id: 'ELV-02', predioId: 'PRD-01', identificacao: 'Serviço 02', marca: 'Schindler', modelo: 'S-200', status: 'Em manutenção', pendencia: 'Ajuste no nivelamento' },
    { id: 'ELV-03', predioId: 'PRD-02', identificacao: 'Principal 01', marca: 'Otis', modelo: 'Gen2', status: 'Operacional', pendencia: '' },
    { id: 'ELV-04', predioId: 'PRD-03', identificacao: 'Torre A', marca: 'Thyssenkrupp', modelo: 'Evolution', status: 'Fora de serviço', pendencia: 'Falha de porta' },
    { id: 'ELV-05', predioId: 'PRD-04', identificacao: 'Social 01', marca: 'Atlas', modelo: 'LX-400', status: 'Operacional', pendencia: '' },
  ],
  tickets: [
    { id: 'CH-1001', titulo: 'Ruído durante a subida', descricao: 'Ruído intermitente na subida do elevador de serviço.', predioId: 'PRD-01', elevadorId: 'ELV-02', tipo: 'Corretiva', prioridade: 'Alta', status: 'Em andamento', tecnicoId: 'USR-02', criadoPor: 'USR-04', data: '2026-11-09T09:30:00', concluidoEm: null },
    { id: 'CH-1002', titulo: 'Manutenção preventiva mensal', descricao: 'Inspeção preventiva de rotina prevista para novembro.', predioId: 'PRD-02', elevadorId: 'ELV-03', tipo: 'Preventiva', prioridade: 'Normal', status: 'Aberto', tecnicoId: 'USR-03', criadoPor: 'USR-01', data: '2026-11-10T08:20:00', concluidoEm: null },
    { id: 'CH-1003', titulo: 'Elevador parou entre andares', descricao: 'Solicitação de emergência por parada inesperada.', predioId: 'PRD-03', elevadorId: 'ELV-04', tipo: 'Emergência', prioridade: 'Crítica', status: 'Aberto', tecnicoId: null, criadoPor: 'USR-01', data: '2026-11-11T07:50:00', concluidoEm: null },
    { id: 'CH-1004', titulo: 'Inspeção mensal concluída', descricao: 'Revisão de componentes, segurança e lubrificação.', predioId: 'PRD-01', elevadorId: 'ELV-01', tipo: 'Preventiva', prioridade: 'Normal', status: 'Concluído', tecnicoId: 'USR-02', criadoPor: 'USR-01', data: '2026-11-04T10:00:00', concluidoEm: '2026-11-04T12:30:00' },
    { id: 'CH-1005', titulo: 'Revisão do sistema de portas', descricao: 'Verificação e ajuste das portas automáticas.', predioId: 'PRD-04', elevadorId: 'ELV-05', tipo: 'Corretiva', prioridade: 'Normal', status: 'Concluído', tecnicoId: 'USR-03', criadoPor: 'USR-04', data: '2026-11-01T13:00:00', concluidoEm: '2026-11-01T14:15:00' },
  ],
  checklists: [
    { id: 'CHK-001', chamadoId: 'CH-1004', tecnicoId: 'USR-02', tipo: 'Mensal', inicio: '2026-11-04T10:00', fim: '2026-11-04T12:30', lubrificacao: true, testeSeguranca: true, pecas: 'Nenhuma troca necessária', observacoes: 'Equipamento liberado para uso.', responsavel: 'Responsável do condomínio', assinatura: '', concluidoEm: '2026-11-04T12:30:00' },
    { id: 'CHK-002', chamadoId: 'CH-1005', tecnicoId: 'USR-03', tipo: 'Atendimento', inicio: '2026-11-01T13:00', fim: '2026-11-01T14:15', lubrificacao: false, testeSeguranca: true, pecas: 'Substituição de sensor de porta', observacoes: 'Ajuste concluído. Funcionamento normal.', responsavel: 'Portaria do edifício', assinatura: '', concluidoEm: '2026-11-01T14:15:00' },
  ],
};
