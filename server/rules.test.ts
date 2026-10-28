
import { describe, it, expect } from 'vitest';
import {
  classify,
  isReopenable,
  isOverdue,
} from './rules';

describe('Regras do Service Desk', () => {
  it('classifica falha coletiva como crítica', () => {
    const result = classify(
      'A equipe inteira está sem acesso ao sistema'
    );

    expect(result.kind).toBe('INC');
    expect(result.priority).toBe('Crítica');
  });

  it('pedido de monitor é requisição', () => {
    const result = classify(
      'Solicito um novo monitor para trabalhar'
    );

    expect(result.kind).toBe('REQ');
    expect(result.category).toBe('Hardware');
  });

  it('permite reabertura somente dentro de 7 dias', () => {
    const now = Date.now();

    const recent = new Date(
      now - 2 * 24 * 60 * 60 * 1000
    ).toISOString();

    const old = new Date(
      now - 8 * 24 * 60 * 60 * 1000
    ).toISOString();

    expect(isReopenable('Resolvido', recent, now)).toBe(true);
    expect(isReopenable('Resolvido', old, now)).toBe(false);
    expect(isReopenable('Aberto', recent, now)).toBe(false);
  });

  it('identifica chamado crítico vencido após 1 hora', () => {
    const now = new Date();

    const twoHoursAgo = new Date(
      now.getTime() - 2 * 60 * 60 * 1000
    ).toISOString();

    expect(
      isOverdue('Crítica', twoHoursAgo, now)
    ).toBe(true);
  });
});
