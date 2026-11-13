# Roteiro de testes manuais — ElevateControl v0.4

1. Faça login como administrador: `camila@exemplo.com` / `Demo@123`. Verifique as telas preexistentes.
2. Abra **Atendimentos e checklists** e registre a visita `CH-1001` com situação **Pendência de Material**. Inclua ocorrência, descrição do material necessário, nome e assinaturas; salve. Confirme que o chamado continua **Em andamento** e o elevador **Em manutenção**.
3. Abra o mesmo chamado novamente, selecione **Atendimento regularizado** e salve outra visita. O chamado deve ficar **Concluído**, e o elevador **Operacional**.
4. Selecione um chamado de prédio com mais de um elevador e clique em **Adicionar segundo elevador**. O segundo elevador deve ser diferente do primeiro e pertencer ao mesmo prédio. Cada um deve ter tipos de visita e situações independentes.
5. Marque **Parado** e confirme que a visita fica registrada, o chamado permanece em andamento e o elevador fica **Fora de serviço**.
6. Teste **Outros** sem descrição: a interface deve bloquear o envio e mostrar mensagem.
7. Ative **Autorização do fornecimento de material** sem preencher material, nome ou assinatura: a interface deve bloquear o envio. Conclua os campos e tente novamente.
8. Confira **Relatórios e histórico**. Imprima registros novos com comprovante de material e um registro legado sem os campos v0.4. Ambos devem abrir.
9. Teste o login de técnico e verifique acesso somente aos chamados designados; no login de cliente, a tela de preenchimento não deve aparecer.
10. Confira o formulário e a assinatura por toque em tela pequena. Use o botão **Restaurar demonstração** para reiniciar o estado local quando necessário.

**Obs.:** Esses são testes para executar no navegador. O pacote foi revisado sintaticamente neste ambiente, mas o build npm completo depende de instalar as dependências do projeto.

## v0.5 — Novos testes do checklist mensal 2026

11. Faça login como administrador (`camila@exemplo.com`) e abra **Atendimentos e checklists**. Clique em **Registrar visita** no chamado de manutenção preventiva `CH-1002` (ou entre como técnico `bruno@exemplo.com`, disponível na demonstração conforme `src/services/auth.ts`).
12. Confirme que o tipo **Mensal** já está selecionado e o bloco **Check-list padrão 2026** aparece automaticamente para esse elevador.
13. Verifique as seções: **17 itens** gerais/casa de máquinas, **7** no passadiço, **5** no poço. Marque S, N ou NA em cada item. O progresso deve chegar a **29/29 (100%)**.
14. Tente salvar com um item sem resposta: a aplicação deve avisar que é necessário preencher todas as rotinas do(s) elevador(es) mensal(is).
15. Experimente preencher `LL`, folga do redutor (mm), medidas dos acrílicos e distância contrapeso/para-choque (mm). Estes campos são opcionais e devem aparecer no PDF de impressão.
16. Informe o serviço executado, a situação final e faça a assinatura do responsável pelo condomínio **uma única vez**, além da assinatura do técnico. Para o líder de serviços, confira que nome e assinatura são exigidos juntos, mas ambos podem ficar em branco na demonstração.
17. Salve o registro, acesse **Relatórios e histórico técnico** e clique em **Imprimir / PDF**. Confira rotinas, respostas, medidas, endereço, condomínio e assinaturas.
18. Abra um relatório da versão anterior (registro legado) e confirme que ainda imprime sem solicitar campos de manutenção mensal que não existiam.
19. Em um chamado corretivo sem o tipo de visita Mensal, confirme que o formulário mensal detalhado não aparece, mas o registro de atendimento da v0.4 continua intacto.
20. Se o chamado permitir dois elevadores no mesmo prédio, marque Mensal nos dois; cada um deve possuir **29 respostas próprias**, mas as assinaturas gerais da visita devem ser coletadas somente uma vez.

**Atenção:** campos de segurança, diagnósticos, liberação de equipamento e validade de assinaturas dependem das regras do backend e do responsável técnico. Não use a simulação como liberação operacional.
