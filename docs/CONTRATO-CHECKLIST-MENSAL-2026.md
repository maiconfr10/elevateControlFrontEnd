# ElevateControl v0.5 — Checklist mensal padrão 2026

## Origem e objetivo

Esta atualização digitaliza **somente os novos campos** das duas imagens intituladas **Check List Padrão 2026(3)** recebidas em 13/11/2026, dentro da versão v0.4 do front-end. Os nomes e as rotinas foram adaptados para apresentação digital, mantendo sua estrutura e ordem; não foram incluídos logotipos de terceiros.

**Já existentes, sem novo cadastro:** observações gerais, materiais necessários, condomínio, endereço (com número no campo existente), horários de chegada/saída, assinatura do responsável do condomínio, registro de ocorrência e autorizações de material.

**Novos:** 29 rotinas individualizadas por elevador, colunas S/N/NA, campo LL, folga do redutor, medidas dos acrílicos, distância contrapeso/para-choque, assinatura do técnico, nome/assinatura opcional do líder de serviços e impressão dessas informações.

## Grupos de rotinas

- Rotinas gerais / casa de máquinas: **17 itens**. O primeiro grupo não tinha cabeçalho específico além de “Rotina”, portanto o nome do grupo é organizacional.
- Passadiço da cabina: **7 itens**.
- Fundo do poço: **5 itens**.

**Total: 29 itens**, preservados no arquivo `src/data/monthlyChecklist.ts`. A sigla `LL` foi mantida **sem interpretação**, pois o material não esclarece seu significado; confirmar com o grupo antes de finalizar a API.

## Modelo no TypeScript

A estrutura já existente `RegistroAtendimento.equipamentos[]` possui agora o campo opcional `checklistMensal` por elevador. Isso é importante quando a visita registra dois elevadores no mesmo condomínio.

```json
{
  "elevadorId": "ELV-03",
  "tiposVisita": ["Mensal"],
  "situacoes": ["Atendimento regularizado"],
  "outros": "",
  "checklistMensal": {
    "versao": "2026",
    "ll": "",
    "respostas": [
      {"codigo": "MAQ-01", "resposta": "N"},
      {"codigo": "MAQ-02", "resposta": "S"},
      {"codigo": "CAB-01", "resposta": "NA"}
    ],
    "folgaRedutorMm": "",
    "medidasAcrilicos": "",
    "distanciaContrapesoParachoqueMm": ""
  }
}
```

O exemplo acima é abreviado: a interface exige resposta para **todos os 29 itens** (`MAQ-01..17`, `CAB-01..07`, `POCO-01..05`). Valores de aferição são opcionais e dependem da periodicidade e do procedimento técnico aplicável. Os itens de 3 e 6 meses mantêm essa periodicidade como texto de referência.

As assinaturas mensais são armazenadas apenas uma vez por visita em `RegistroAtendimento.assinaturasMensais`:

```json
{
  "assinaturaTecnico": "data:image/png;base64,...",
  "nomeLiderServicos": "",
  "assinaturaLiderServicos": ""
}
```

A assinatura do responsável pelo condomínio é **a mesma** já presente em `RegistroAtendimento.servicoExecutado.assinaturaCliente` e `Checklist.assinatura`, não havendo coleta adicional. O líder de serviços é opcional na demonstração, pois pode não estar presente; caso seja informado, **nome e assinatura** são exigidos juntos.

## Regras antes de conectar o backend

1. Aplicar autenticação e autorização no servidor. Técnico só pode registrar chamados atribuídos; cliente somente consulta documentos de seu prédio.
2. Validar que cada item usa exclusivamente `S`, `N` ou `NA`, um por código, com 29 códigos válidos e únicos por checklist mensal.
3. **Não inferir falha a partir da letra `N` isoladamente.** Ex.: responder `N` a “Existem molas de tração quebradas?” é diferente de responder `N` a “Fusíveis de reserva?”. Regras de inspeção necessitam avaliação técnica.
4. A mudança de status de elevador/chamado segue a **situação final do atendimento**; apenas marcar S/N/NA não libera equipamento automaticamente.
5. Não fechar chamados com pendência de material, assistência, orçamento ou equipamento parado. Registrar visitas subsequentes sem sobrescrever histórico.
6. Armazenar assinatura, identidade do signatário, carimbo temporal, vinculação e integridade em servidor seguro. Canvas e armazenamento local são somente simulações.
7. Compatibilidade: `RegistroElevador.checklistMensal?` e `RegistroAtendimento.assinaturasMensais?` são opcionais. Dados anteriores à v0.5 devem permanecer legíveis e imprimíveis.
8. Gerar PDF final e validar data/hora no servidor, não confiar em IDs, associações ou medidas enviados pelo navegador.

## Arquivos alterados

- `src/types.ts` — contratos TypeScript opcionais e preservação de legado.
- `src/data/monthlyChecklist.ts` — catálogo estável de 29 rotinas.
- `src/components/MonthlyChecklistForm.tsx` — UI de S/N/NA e aferições, por elevador.
- `src/pages/Checklists.tsx` — integração com registro de atendimento existente; assinaturas complementares.
- `src/utils/printReport.ts` — impressão A4 das 29 rotinas e das assinaturas, sem perder relatório legado.
- `src/styles.css` — visual SaaS corporativo e adaptação mobile.

**Status:** interface demonstrativa, aguardando conexão à API e confirmação do significado de `LL`.
