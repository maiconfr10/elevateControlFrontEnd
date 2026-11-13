# ElevateControl v0.4 — Contrato preliminar para o backend

Este documento acompanha **o front-end TypeScript** e descreve a digitalização do formulário físico de Registro de Atendimento apresentado pelo grupo. **Ainda não há API conectada.** O backend deverá validar e definir os DTOs definitivos.

## Modelo

A propriedade `Checklist.registroAtendimento?: RegistroAtendimento` é opcional para compatibilidade com os checklists de versões anteriores. Novos registros usam a estrutura abaixo:

```json
{
  "chamadoId": "CH-1001",
  "tecnicoId": "USR-02",
  "tipo": "Atendimento",
  "inicio": "2026-11-13T09:00",
  "fim": "2026-11-13T10:20",
  "lubrificacao": false,
  "testeSeguranca": true,
  "pecas": "Nenhuma peça substituída",
  "observacoes": "Inspeção concluída; aguardando peça de reposição.",
  "responsavel": "Pessoa responsável do condomínio",
  "assinatura": "data:image/png;base64,...",
  "registroAtendimento": {
    "numeroRegistro": "RA-EXEMPLO",
    "equipamentos": [
      {
        "elevadorId": "ELV-02",
        "tiposVisita": ["Corretiva"],
        "situacoes": ["Pendência de Material"],
        "outros": ""
      }
    ],
    "observacoesEmpresa": "Material solicitado para continuidade do reparo.",
    "ocorrencia": "Ruído e desnível durante a operação.",
    "materialNecessario": "Conjunto de roldanas, 1 unidade",
    "autorizacaoMaterial": {
      "data": "2026-11-13",
      "nomeCliente": "Pessoa responsável do condomínio",
      "tecnico": "Rafael Oliveira",
      "assinaturaCliente": "data:image/png;base64,..."
    },
    "servicoExecutado": {
      "data": "2026-11-13",
      "nomeCliente": "Pessoa responsável do condomínio",
      "tecnico": "Rafael Oliveira",
      "assinaturaCliente": "data:image/png;base64,..."
    }
  }
}
```

Os caminhos **propostos, ainda não implementados no backend**, são:

- `POST /api/checklists`: criar registro de visita e checklist.
- `GET /api/checklists`: listar conforme permissões do usuário autenticado.
- `GET /api/checklists/{id}`: consultar um registro autorizado.
- Emissão final de PDF e armazenamento de assinaturas: **a definir pelo backend**.

## Regras essenciais de produção

1. Exigir usuário autenticado: perfil técnico atribuído ao chamado ou administrador devidamente autorizado. Clientes apenas consultam os relatórios de seus próprios prédios.
2. Não confiar em `tecnicoId`, `numeroRegistro`, `data`, nome do cliente ou associações enviadas pelo navegador. Determinar vínculo e permissão no servidor; gerar identificador próprio e data confiável no backend.
3. Garantir que o elevador principal pertence ao chamado e o segundo, quando presente, ao **mesmo prédio**, sem duplicação. Limite sugerido para esta interface: **até dois equipamentos por registro**.
4. Verificar tipo de visita, situação final, horários e assinaturas. Rejeitar estados contraditórios como “Atendimento regularizado” junto com “Parado”.
5. Salvar o registro de maneira transacional com atualização do chamado/elevador. Se houver pendência, **não concluir o chamado**; somente liberar após validação da regra de negócio.
6. Manter histórico imutável ou auditável das visitas; nova visita gera novo registro, não sobrescreve o anterior. Autorizações requerem identificação de quem assinou, data/hora, integridade, consentimento e prova de aceitação compatíveis com o uso pretendido.
7. Base64 no front é **demonstração**. Definir armazenamento seguro de imagens assinadas, restrição de tamanho e política de retenção antes de produção. Não presumir que canvas seja assinatura digital certificada.
8. Implementar políticas de privacidade, minimização de dados e restrição por condomínio. A proteção no menu React não substitui autorização no servidor.
9. Em produção, a mudança de status do elevador deve respeitar as aprovações e os procedimentos de segurança da operação. A IA, quando adicionada depois, não deverá liberar equipamentos automaticamente.

## Compatibilidade

`Checklist.registroAtendimento` é **opcional** para que registros v0.3 continuem aparecendo no histórico e sejam imprimíveis. A API pode optar por DTO específico para visitas, desde que preserve os campos e seus vínculos.
