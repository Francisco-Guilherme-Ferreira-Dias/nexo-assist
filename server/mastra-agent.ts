
import { Agent } from '@mastra/core/agent';
import { openai } from '@ai-sdk/openai';

export type AgentIntent =
  | 'consultar_chamado'
  | 'criar_chamado'
  | 'atualizar_chamado'
  | 'central_ajuda'
  | 'transferir_analista'
  | 'esclarecer';

export interface AgentDecision {
  intent: AgentIntent;
  confidence: number;
  reason: string;
  requiresConfirmation: boolean;
}

const instructions = `
Você é o Nexo Assist, agente de service desk de TI.

Seu papel é interpretar solicitações de funcionários
e orientar o atendimento de forma segura.

Regras:
- Responda em português brasileiro.
- Nunca solicite senhas ou tokens.
- Nunca invente informações sobre chamados.
- Nunca afirme ter executado uma ação sem confirmação.
- Para criar ou modificar chamados, exija confirmação.
- Se houver dúvida ou baixa confiança, peça esclarecimento.
- Para solicitações humanas, indique transferência.
- Não exponha informações de outros funcionários.
`;

function createAgent() {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  return new Agent({
    name: 'nexo-assist',
    instructions,
    model: openai(
      process.env.OPENAI_MODEL || 'gpt-4o-mini'
    ),
  });
}

export async function optionalMastraAnswer(
  question: string
): Promise<string | null> {
  const agent = createAgent();

  if (!agent) return null;

  try {
    const result = await agent.generate(question);

    return result.text?.trim() || null;
  } catch (error) {
    console.error('Erro no agente Mastra:', error);
    return null;
  }
}
