# ElevateControl — Front-end v0.5 (React + TypeScript)

**TCC | Sistema de Gestão de Chamados para Elevadores**

Projeto-base no estilo **SaaS profissional**, com identidade corporativa em azul, painel de chamados, gestão de equipamentos e três perfis de acesso. Esta versão mantém o projeto **100% TypeScript/TSX** e todas as telas das versões 0.3 e 0.4. Incorpora agora o **checklist mensal padrão 2026** das duas imagens, sem duplicar os campos existentes.

## 1. Tecnologias

- React 19 + TypeScript (modo `strict`)
- Vite 6 + plugin React
- Tailwind CSS 4 + estilos corporativos próprios
- Componentes locais no padrão shadcn/ui, Radix Slot e Class Variance Authority
- Lucide React (ícones) e Motion (animações discretas)
- API REST via `fetch` tipado, preparada para backend futuro

## 2. Executar no VS Code

1. Extraia o ZIP e abra a pasta `elevatecontrol-frontend` no VS Code.
2. Instale Node.js compatível (recomenda-se Node 22 LTS recente).
3. No terminal:

```bash
npm install
npm run dev
```

4. Acesse a URL exibida, geralmente `http://localhost:5173`.

### Verificar tipos e gerar a versão de produção

```bash
npm run typecheck
npm run build
npm run preview
```

**Atenção:** a criação do pacote não incluiu `node_modules`. É necessário executar `npm install` na sua máquina.

## 3. Acessos de demonstração

| Perfil | E-mail | Senha |
|---|---|---|
| Administrador | `camila@exemplo.com` | `Demo@123` |
| Técnico | `rafael@exemplo.com` | `Demo@123` |
| Cliente | `mariana@exemplo.com` | `Demo@123` |

O login demonstrativo **não é autenticação segura** e não deve ser usado em produção. Os dados são fictícios e ficam em armazenamento local do navegador. O ID da sessão demonstrativa fica em `sessionStorage`; a senha não é persistida.

## 4. Módulos preservados

- **Login:** e-mail/senha, mostrar senha, validação, recuperação preparada para API, sair da conta.
- **Administrador:** painel geral, clientes, prédios, elevadores, equipe, chamados, atribuição, checklists, relatórios.
- **Técnico:** atendimentos atribuídos, fluxo de execução, checklist mensal e de emergência, assinatura e histórico permitido.
- **Cliente:** abertura e consulta de chamados do próprio condomínio, elevadores e históricos do prédio.
- **Relatórios:** impressão com opção de salvar PDF pelo navegador (documento demonstrativo).
- **Layout responsivo:** menu adaptado a telas pequenas.

Não há integração efetiva com banco ou backend. Gravações e permissões locais são apenas simulações: **a autorização real precisa ser feita no servidor**.

## 5. Organização em TypeScript

```text
src/
  types.ts                  # Interfaces e uniões (User, Ticket, Checklist etc.)
  App.tsx                   # Roteamento interno e telas por perfil
  main.tsx                  # Montagem e gate de autenticação
  context/
    AuthContext.tsx          # Login/logout, sessão e recuperação
    AppContext.tsx           # Dados e operações locais demonstrativas
  components/
    Layout.tsx               # Menu lateral e cabeçalho
    SignaturePad.tsx         # Captura de assinatura digital
    MonthlyChecklistForm.tsx # Rotinas mensais S/N/NA por elevador
    UI.tsx                   # Componentes compartilhados
    ui/                     # Primitivos de botão, badge e card
  data/seed.ts              # Dados fictícios tipados
  data/monthlyChecklist.ts  # Catálogo de 29 rotinas mensais (2026)
  pages/                    # Login, Dashboard, Tickets, Clients,
                            # Assets, Team, Checklists, Reports (TSX)
  services/
    auth.ts                 # Serviço tipado de autenticação
    http.ts                 # Cliente HTTP genérico tipado
    repository.ts           # Estado demonstrativo local
    domainApi.ts            # Contratos REST propostos (ainda não ligados)
  utils/                    # Datas, status e impressão
  styles.css                # Identidade visual original preservada
```

## 6. Conectar ao backend futuramente

Crie um arquivo `.env` copiando `.env.example`:

```env
VITE_AUTH_MODE=api
VITE_API_URL=http://localhost:8080/api
```

Os endpoints **previstos** para autenticação são `POST /auth/login`, `GET /auth/me`, `POST /auth/logout` e `POST /auth/forgot-password`. Eles **precisam ser implementados pelo backend**, que deve retornar o usuário com os campos `id`, `nome`, `email`, `perfil` e, quando necessário, `clienteId` / `registro`.

O sistema espera **cookie de sessão HttpOnly + Secure + SameSite emitido pelo backend**. Não persistir JWT ou senha no `localStorage`. Se a API e o front estiverem em origens diferentes, configurar CORS com credenciais e proteção CSRF no servidor conforme arquitetura escolhida.

As operações de domínio continuam locais por enquanto. Os serviços tipados de `src/services/domainApi.ts` representam **propostas de endpoints**, que poderão ser ajustadas ao contrato do Spring Boot/Node real e integradas ao `AppContext`. Não presuma que a alteração de `VITE_AUTH_MODE` já conecte os cadastros.

Acesso restrito por perfil, validação de vínculo cliente/prédio/elevador, permissão do técnico, auditoria e emissão definitiva do relatório devem ser garantidos pelo backend.

## 7. Próximas melhorias do TCC

- Construir e integrar a API real, incluindo autenticação e RBAC.
- Validar contratos com o banco de dados e endpoints reais.
- Criar testes unitários, integração e testes de interface.
- Adicionar tratamento de erros/estados de carregamento às operações remotas.
- Gerar PDFs definitivos no servidor, com histórico e trilha de auditoria.

**Status:** base acadêmica em TypeScript, com dados simulados. A compilação completa deve ser verificada via `npm install && npm run build` no seu ambiente.


## 8. Novidade da v0.4 — Registro de Atendimento do PDF

A digitalização foi **integrada ao formulário existente de Atendimentos e checklists**, em vez de criar um segundo formulário duplicado. O modelo de papel recebido foi usado como referência de campos, mas a marca, logotipo e numeração externa **não** são reproduzidos: o sistema é o ElevateControl.

### Campos digitalizados

- Identificação de até **2 elevadores do mesmo prédio**, sendo o primeiro vinculado ao chamado.
- Tipo de visita, independente para cada equipamento: **Mensal, Auditoria, Corretiva e Vistoria** (seleção múltipla).
- Situação após atendimento, independente para cada equipamento: **Atendimento regularizado, Pendência de Material, Solicitação de Apoio Técnico, Orçamento pendente de aprovação, Parado e Outros**. A seleção “Outros” exige descrição; situações incompatíveis são desmarcadas automaticamente.
- **Registro de ocorrência** (problemas com equipamentos) e **Observações da empresa/atendimento**.
- Dados de **Chamada / manutenção / material**: data da chamada, chegada, saída, nome do técnico e do cliente. Dados já existentes são preenchidos do cadastro; não há campos duplicados.
- **Comprovante de material** com a descrição de materiais necessários (diferente de peças já substituídas).
- **Autorização do fornecimento de material**, quando aplicável: data, nome e assinatura digital do cliente, técnico associado.
- **Serviço executado**: data, nome do cliente, técnico e assinatura, aproveitando a assinatura final já existente no checklist.
- **Número do registro** gerado pelo ElevateControl e impressão via botão **Imprimir / PDF**; os relatórios anteriores continuam funcionando sem os campos novos.

### Regra operacional importante

**Salvar a visita não equivale a liberar o elevador.** Quando todos os elevadores listados estiverem marcados *apenas* como “Atendimento regularizado”, o chamado é concluído na demonstração. Havendo material pendente, orçamento, solicitação de apoio, situação de parado ou outros, a visita é registrada e o chamado permanece **Em andamento**, permitindo outra visita. Os equipamentos registrados têm o status demonstrativo atualizado: operacional, em manutenção ou fora de serviço.

### Teste sugerido

1. Faça login como `rafael@exemplo.com` / `Demo@123` (técnico) ou como administrador.
2. Abra **Atendimentos e checklists**, escolha o chamado de teste e clique em **Registrar visita**.
3. Assinale o tipo de visita e uma situação final para o elevador. Se houver outro elevador no mesmo prédio, teste **Adicionar segundo elevador**.
4. Preencha ocorrência, serviços, materiais e autorização (se houver). Faça a assinatura com mouse ou dedo.
5. Salve e consulte **Relatórios e histórico** para imprimir ou salvar como PDF.
6. Compare um registro com **pendência** (chamado continua em andamento) com outro **regularizado** (chamado concluído).
7. Use **Restaurar demonstração** no menu se quiser limpar os dados locais. A restauração apaga as alterações salvas pelo navegador.

### Integração futura com backend

O campo opcional `Checklist.registroAtendimento` em `src/types.ts` define a estrutura de dados para os campos novos. O arquivo `src/services/domainApi.ts` inclui a proposta de envio no endpoint `POST /checklists` e consulta em `GET /checklists/:id`. Ao integrar, validar DTOs, associações entre chamado/prédio/elevadores e perfis de acesso **no servidor**. Autorização e assinaturas digitais precisam de controle de identidade, integridade, consentimento e trilha de auditoria no backend; **um desenho no canvas não é, por si só, uma assinatura digital certificada**.

A versão 0.4 segue inteiramente em modo **demonstração local**. Para os recursos de IA planejados separadamente, não há ainda modelo conectado nem execução automática.


## 9. Novidade da v0.5 — Checklist mensal detalhado 2026

Com base nas imagens enviadas pelo grupo em 13/11/2026, o sistema agora possui **29 rotinas individuais de manutenção preventiva** integradas à tela existente de **Atendimentos e checklists**:

- **17 rotinas gerais / casa de máquinas** (redutor, freios, lubrificação, fusíveis, iluminação, portas, janelas e extintor);
- **7 rotinas do passadiço da cabina** (ruídos, portas de andares, guias, fechamentos, acrílicos e topo da cabina);
- **5 rotinas do fundo do poço** (limpeza, tensor, cabos, distância do contrapeso e para-choque).

Cada rotina exige uma única resposta **S (sim), N (não) ou NA (não se aplica)**, individualmente para cada elevador da visita. O formulário mostra um contador de conclusão e **não presume que N significa falha**. A situação final da visita continua controlando o chamado.

Também foram acrescentados o campo `LL` (sigla mantida sem interpretação), **folga do redutor (mm)**, **medidas dos acrílicos**, **distância contrapeso / para-choque (mm)** e as assinaturas do **técnico** e do **líder de serviços** (quando presente). A assinatura já existente do **responsável pelo condomínio** é reutilizada sem duplicidade.

Os campos de **observações gerais, materiais necessários, endereço e número, condomínio, datas, entrada e saída** já existiam e **não foram criados novamente**. O PDF de impressão inclui as novas tabelas e assinaturas; registros antigos continuam compatíveis.

**Teste rápido:** login de administrador → **Atendimentos e checklists** → registrar visita no chamado preventivo `CH-1002` → marcar 29 rotinas → assinar → salvar → **Relatórios** → **Imprimir / PDF**. O fluxo utiliza dados de demonstração no navegador.

**Consulte:** `docs/CONTRATO-CHECKLIST-MENSAL-2026.md` para o modelo TypeScript, as validações e as decisões pendentes antes da integração ao backend, e `docs/TESTES-MANUAIS.md` para o roteiro detalhado.
