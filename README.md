# ElevateControl — Front-end v0.3 (React + TypeScript)

**TCC | Sistema de Gestão de Chamados para Elevadores**

Projeto-base no estilo **SaaS profissional**, com identidade corporativa em azul, painel de chamados, gestão de equipamentos e três perfis de acesso. Esta versão converte **o projeto inteiro de JavaScript/JSX para TypeScript/TSX** e mantém a tela de login da versão 0.2.

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
    UI.tsx                   # Componentes compartilhados
    ui/                     # Primitivos de botão, badge e card
  data/seed.ts              # Dados fictícios tipados
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
