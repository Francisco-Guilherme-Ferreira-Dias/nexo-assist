export type Priority='Crítica'|'Alta'|'Média'|'Baixa';
export type Category='Acesso'|'Rede e VPN'|'Hardware'|'Software'|'E-mail'|'Outros';
export type Kind='INC'|'REQ';
export const categories:Category[]=['Acesso','Rede e VPN','Hardware','Software','E-mail','Outros'];
export const articles=[
{title:'VPN — erro 809',body:'No Windows 10, reinstale o cliente VPN pelo portal de softwares e reinicie. No Windows 11, abra um chamado.',tags:['vpn','809','rede']},
{title:'Horário de atendimento',body:'O service desk atende de segunda a sexta, das 8h às 18h. Casos críticos contam com plantão 24 horas.',tags:['horário','suporte','atendimento']},
{title:'Redefinição de senha',body:'Utilize o portal de identidade corporativa e a opção Esqueci minha senha. Se não tiver acesso ao segundo fator, abra um chamado.',tags:['senha','login','acesso']},
{title:'Outlook não sincroniza',body:'Confira a conexão, reinicie o Outlook e verifique o espaço da caixa de entrada. Se persistir, abra um chamado.',tags:['outlook','email','e-mail']},
{title:'Impressora indisponível',body:'Verifique a alimentação, conexão de rede e fila de impressão. Se persistir, abra um chamado.',tags:['impressora','imprimir']},
{title:'Wi-Fi corporativo',body:'Conecte-se à rede corporativa com as credenciais institucionais. Se falhar, esqueça a rede e tente novamente.',tags:['wifi','wi-fi','internet']},
{title:'Solicitação de software',body:'Para solicitar instalação de software, informe o nome, a finalidade e o computador afetado.',tags:['software','instalar','programa']},
{title:'Segundo monitor',body:'Para solicitar um monitor adicional, informe a justificativa e o local de trabalho.',tags:['monitor','equipamento','hardware']}
];

export function classify(input: string): {
  kind: Kind;
  category: Category;
  priority: Priority;
  confidence: number;
  reason: string;
} {
  const t = input.toLowerCase();

  // Identifica falhas e interrupções de serviços.
  const failure =
    /não (?:está |esta )?(?:ligando|funcionando|abre|conecta)|nao (?:esta )?(?:ligando|funcionando|abre|conecta)|parou|quebrou|falhou|erro|lento|bloquead|sem (?:conexão|conexao|acesso|internet|rede)|não consigo (?:acessar|trabalhar)|nao consigo (?:acessar|trabalhar)|não (?:funciona|abre|conecta)|nao (?:funciona|abre|conecta)|indisponível|indisponivel|fora do ar/i.test(t);

  // Identifica solicitações de recursos e serviços.
  const request =
    /solicito|pedido de|instalar|instalação|instalacao|novo monitor|segundo monitor|liberação|liberacao|preciso de (?:um |uma )?(?:novo|nova|acesso|equipamento)|quero (?:um |uma )?(?:novo|nova)/i.test(t);

  // Falhas têm precedência sobre solicitações.
  const kind: Kind = failure ? 'INC' : request ? 'REQ' : 'INC';

  const category: Category =
    /vpn|rede|internet|wi.?fi/.test(t) ? 'Rede e VPN' :
    /senha|login|acesso|sap|permiss/.test(t) ? 'Acesso' :
    /notebook|computador|monitor|teclado|impressora/.test(t) ? 'Hardware' :
    /email|e-mail|outlook/.test(t) ? 'E-mail' :
    /software|programa|aplicativo|instalar|sistema/.test(t) ? 'Software' :
    'Outros';

  const priority: Priority =
    /equipe inteira|empresa inteira|todos parados|toda equipe/.test(t) ? 'Crítica' :
    /não consigo trabalhar|nao consigo trabalhar|parado|urgente|hoje|bloqueado|sem acesso/.test(t) ? 'Alta' :
    kind === 'REQ' ? 'Baixa' : 'Média';

  const confidence = category === 'Outros' ? 0.48 : 0.87;

  const reason =
    `Classificação por indícios do texto: ${
      kind === 'INC' ? 'falha de serviço' : 'solicitação'
    }; categoria ${category}; impacto e urgência sugerem prioridade ${priority}. Confirme com o funcionário.`;

  return { kind, category, priority, confidence, reason };
}

export function dueHours(p:Priority):number{return p==='Crítica'?1:p==='Alta'?4:p==='Média'?72:120;}
export function slaLabel(p:Priority):string{return p==='Crítica'?'1 hora':p==='Alta'?'4 horas úteis':p==='Média'?'3 dias úteis':'5 dias úteis';}
export function isReopenable(status:string,updatedAt:string,now=Date.now()):boolean{const timestamp=new Date(updatedAt).getTime();const elapsed=now-timestamp;return status==='Resolvido'&&Number.isFinite(timestamp)&&elapsed>=0&&elapsed<=7*86400000;}
export function isOverdue(priority:Priority,updatedAt:string,now=new Date()):boolean{
 let t=new Date(updatedAt);if(Number.isNaN(t.getTime()))return false;
 if(priority==='Crítica')return now.getTime()-t.getTime()>3600000;
 let remaining=priority==='Alta'?4:priority==='Média'?24:40;
 while(t<now&&remaining>0){t=new Date(t.getTime()+3600000);if(t.getDay()!==0&&t.getDay()!==6&&t.getHours()>=8&&t.getHours()<18)remaining--;}
 return remaining<=0;
}

export function isThirdPartyTicketRequest(content:string):boolean {
 const thirdParty=/(outro|outra|terceiro|terceira|colega)\s+(funcion[aá]rio|pessoa|usu[aá]rio|colaborador)|(de|do|da)\s+(outro|outra)\s+(funcion[aá]rio|pessoa|usu[aá]rio|colaborador)/i.test(content);
 return thirdParty && /chamado|ticket|solicita[cç][aã]o|detalhe|consultar|mostrar|acessar/i.test(content);
}

/** Conservatively identifies the same equipment/service and the same failure. */
export function sameIssue(a:{title:string;description:string;kind:string;category:string},b:{title:string;description:string;kind:string;category:string}):boolean {
  if(a.kind!==b.kind||a.category!==b.category)return false;
  const normalize=(v:string)=>v.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ');
  const signature=(v:typeof a)=>{
    const t=normalize(v.title+' '+v.description);
    const device=/\bsap\b/.test(t)?'sap':/\b(notebook|laptop)\b/.test(t)?'notebook':/\b(computador|desktop|pc)\b/.test(t)?'computador':/\b(monitor|tela)\b/.test(t)?'monitor':/\bimpressora\b/.test(t)?'impressora':/\bvpn\b/.test(t)?'vpn':/\b(outlook|e-mail|email)\b/.test(t)?'email':null;
    const problem=/\b(nao (?:esta )?(?:ligando|liga)|sem ligar|deixou de ligar|nao inicia)\b/.test(t)?'nao_liga':/\b(senha.{0,35}bloquead[ao]|bloqueio de senha|bloquead[ao].{0,35}senha)\b/.test(t)?'senha_bloqueada':/\b(lento|lenta|lentidao|devagar|travando)\b/.test(t)?'lentidao':/\b(sem conexao|nao conecta|desconectado|erro de conexao)\b/.test(t)?'conexao':/\b(nao abre|fecha sozinho|fecha inesperadamente)\b/.test(t)?'nao_abre':null;
    return {device,problem};
  };
  const x=signature(a),y=signature(b);
  return !!x.device&&!!x.problem&&x.device===y.device&&x.problem===y.problem;
}
