/** Digitalização do CHECK-LIST Manutenção mensal 2026 enviado pelo grupo.
 * Códigos estáveis para contratos da futura API, sem duplicar os campos de atendimento existentes.
 * Atenção: S/N/NA representa a resposta à PERGUNTA específica, não aprovação/reprovação automática.
 */
export interface RotinaMensal {
  codigo:string;
  texto:string;
  periodicidade?:string;
}
export interface SecaoMensal {
  codigo:string;
  titulo:string;
  itens:readonly RotinaMensal[];
}
export const secoesChecklistMensal:readonly SecaoMensal[]=[
  {codigo:'MAQ',titulo:'Rotinas gerais / casa de máquinas',itens:[
    {codigo:'MAQ-01',texto:'Indagar ao porteiro / zelador se existe(m) problema(s)'},
    {codigo:'MAQ-02',texto:'Verificar nível de óleo do redutor e mancais do motor'},
    {codigo:'MAQ-03',texto:'Verificar limitador de velocidade'},
    {codigo:'MAQ-04',texto:'Regular freio e verificar desgastes'},
    {codigo:'MAQ-05',texto:'Verificar se existe vazamento no redutor'},
    {codigo:'MAQ-06',texto:'Lubrificar todos os pontos que tenham graxeiras'},
    {codigo:'MAQ-07',texto:'Limpar redutor de velocidade'},
    {codigo:'MAQ-08',texto:'Limpar casa de máquina'},
    {codigo:'MAQ-09',texto:'Fusíveis completos (quadro)'},
    {codigo:'MAQ-10',texto:'Fusíveis de reserva'},
    {codigo:'MAQ-11',texto:'Existe folga no redutor?',periodicidade:'6 em 6 meses'},
    {codigo:'MAQ-12',texto:'Freio de segurança atuou?',periodicidade:'6 em 6 meses'},
    {codigo:'MAQ-13',texto:'O contato do freio de segurança atuou?',periodicidade:'6 em 6 meses'},
    {codigo:'MAQ-14',texto:'O cabo de tração tem quebras?'},
    {codigo:'MAQ-15',texto:'Verificar: iluminação / portas'},
    {codigo:'MAQ-16',texto:'Verificar: janelas / extintor'},
    {codigo:'MAQ-17',texto:'Existem molas de tração quebradas?'},
  ]},
  {codigo:'CAB',titulo:'Passadiço da cabina',itens:[
    {codigo:'CAB-01',texto:'Barulho no decorrer da viagem'},
    {codigo:'CAB-02',texto:'Portas de andares (reapertar ditadores, fechos e bombas)'},
    {codigo:'CAB-03',texto:'Lubrificar guias de cabina e contrapeso'},
    {codigo:'CAB-04',texto:'Lubrificar fechos eletromecânicos'},
    {codigo:'CAB-05',texto:'Lubrificar dobradiças e molas TS'},
    {codigo:'CAB-06',texto:'Existem acrílicos quebrados?'},
    {codigo:'CAB-07',texto:'Limpar topo de cabina'},
  ]},
  {codigo:'POCO',titulo:'Fundo do poço',itens:[
    {codigo:'POCO-01',texto:'Limpar embaixo da cabina',periodicidade:'3 em 3 meses'},
    {codigo:'POCO-02',texto:'Lubrificar tensor e verificar cabos'},
    {codigo:'POCO-03',texto:'A distância entre o contrapeso e para-choque é padrão?',periodicidade:'6 em 6 meses'},
    {codigo:'POCO-04',texto:'Para-choque em ordem?'},
    {codigo:'POCO-05',texto:'Limpar fundo do poço'},
  ]},
] as const;
export const codigosChecklistMensal=secoesChecklistMensal.flatMap(secao=>secao.itens.map(item=>item.codigo));
export const totalRotinasMensais=codigosChecklistMensal.length;
