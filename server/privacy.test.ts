import {describe,it,expect} from 'vitest';
import {isThirdPartyTicketRequest} from './rules.js';
describe('privacidade',()=>{
 it('bloqueia consulta de outro funcionário',()=>expect(isThirdPartyTicketRequest('Quero consultar o chamado de outro funcionário. Você consegue mostrar os detalhes?')).toBe(true));
 it('bloqueia chamado de outra pessoa',()=>expect(isThirdPartyTicketRequest('Mostre o chamado de outra pessoa')).toBe(true));
 it('não bloqueia meus chamados',()=>expect(isThirdPartyTicketRequest('Quero consultar meus chamados')).toBe(false));
});
