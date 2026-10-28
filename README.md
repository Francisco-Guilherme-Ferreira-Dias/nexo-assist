# Nexo Assist — Desafio Técnico Beyond the Bytes

Protótipo funcional de service desk desenvolvido com React, TypeScript, Express e SQLite. A aplicação permite que funcionários consultem informações de TI, acompanhem chamados, solicitem atendimento e interajam com um assistente virtual. Também inclui um console para analistas de suporte.

## Tecnologias utilizadas

- **Frontend:** React, TypeScript e Vite.
- **Backend:** Node.js, Express e TypeScript.
- **Banco de dados:** SQLite com `better-sqlite3`.
- **Testes automatizados:** Vitest.
- **Agente:** regras determinísticas com integração opcional e parcial ao Mastra.
- **Modelo de linguagem opcional:** OpenAI, por meio de `@ai-sdk/openai`.

## Requisitos

- Node.js 22 ou superior.
- npm.
- Ferramentas de compilação nativas, caso necessárias para instalar `better-sqlite3`.

## Instalação e execução

Clone o repositório e acesse a pasta do projeto.

Instale as dependências:

```bash
npm install
```

Crie um arquivo `.env` a partir de `.env.example` e configure as variáveis necessárias.

Exemplo:

```env
PORT=3001
DATABASE_PATH=./nexo.sqlite

OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini

SESSION_SECRET=substitua-por-um-segredo-longo-e-aleatorio
```

A aplicação funciona sem configurar `OPENAI_API_KEY`.

Inicie o ambiente:

```bash
npm run dev
```

Acesse:

- Frontend: http://localhost:5173
- API: http://localhost:3001

## Contas de demonstração

| Perfil | E-mail |
|---|---|
| Funcionário | ana.silva@nexo.com |
| Funcionário | bruno.lima@nexo.com |
| Funcionário | carla.souza@nexo.com |
| Analista | analista@nexo.com |

Para fins de demonstração, qualquer senha não vazia permite o acesso às contas cadastradas.

**A autenticação é simulada e não deve ser utilizada em produção.**

## Funcionalidades implementadas

### Atendimento ao funcionário

- Login com contas de demonstração.
- Conversas com histórico persistente.
- Consulta de chamados pertencentes ao funcionário autenticado.
- Classificação de solicitações e incidentes.
- Identificação de categoria e prioridade.
- Consulta de artigos da central de ajuda.
- Preparação de rascunhos de chamados.
- Confirmação explícita antes da criação ou atualização.
- Identificação heurística de chamados semelhantes.
- Reabertura de chamados resolvidos dentro do prazo permitido.
- Cancelamento de rascunhos.
- Solicitação de transferência para atendimento humano.
- Limite de 30 mensagens do funcionário por conversa.

### Atendimento do analista

- Consulta de conversas.
- Acompanhamento do histórico.
- Assumir atendimento.
- Enviar mensagens ao funcionário.
- Devolver o atendimento ao agente.
- Encerrar conversas.

### Rastreabilidade

As respostas do assistente registram informações como:

- Intenção identificada.
- Ação realizada ou proposta.
- Nível de confiança.
- Justificativa da decisão.
- Data e hora.

Essas informações são armazenadas junto às mensagens e disponibilizadas na interface.

## Arquitetura

A aplicação é organizada em três partes principais:

**Frontend (`src/`)**

Responsável pela interface de login, chat, visualização de chamados, confirmação de rascunhos e console do analista.

**Backend (`server/index.ts`)**

Responsável pelas rotas HTTP, autenticação, autorização, conversas, chamados, transferências e persistência.

**Regras de atendimento (`server/rules.ts`)**

Contém a classificação de solicitações, a central de ajuda, as verificações de duplicidade, os prazos de atendimento e as regras de reabertura.

**Integração opcional (`server/mastra-agent.ts`)**

Disponibiliza respostas informativas com Mastra quando existe uma chave de API configurada.

**Banco de dados (`nexo.sqlite`)**

Armazena usuários, conversas, mensagens, chamados e rascunhos.

## Funcionamento do assistente

O fluxo principal utiliza regras determinísticas para interpretar mensagens e selecionar ações de atendimento.

Quando identifica uma solicitação de criação ou atualização de chamado, o sistema prepara um rascunho e exige confirmação explícita antes de executar a alteração.

A consulta de chamados é limitada ao proprietário autenticado.

Solicitações de atendimento humano alteram o estado da conversa, interrompendo as respostas automáticas até que o atendimento seja devolvido ao agente.

### Integração com Mastra

O projeto contém uma integração opcional com `@mastra/core/agent` e `@ai-sdk/openai`.

Quando `OPENAI_API_KEY` está configurada, o Mastra pode responder dúvidas informativas que não foram atendidas pelas regras principais.

Sem chave de API, o sistema utiliza respostas determinísticas.

**Limitação conhecida:** a consulta e a alteração de chamados ainda são coordenadas pelas regras do backend Express, e não por ferramentas orquestradas pelo Mastra. Portanto, a integração com o framework de agentes é parcial.

## Segurança e privacidade

- Tokens de sessão assinados com HMAC-SHA256.
- Validade de sessão de 12 horas.
- Validação da assinatura e expiração nas requisições protegidas.
- Autorização de acesso às conversas.
- Consultas de chamados restritas ao funcionário autenticado.
- Confirmação obrigatória antes de modificar chamados.
- Verificação do prazo de reabertura no momento da confirmação.
- Chaves e segredos configurados por variáveis de ambiente.
- Limite de tamanho das mensagens e do corpo JSON.

A autenticação utiliza contas demonstrativas e não substitui um provedor corporativo de identidade.

O armazenamento de tokens no navegador também exigiria proteções adicionais em um ambiente de produção.

## Testes e validação

Execute os testes automatizados:

```bash
npx vitest run
```

Execute a compilação:

```bash
npm run build
```

Na última validação local, os sete testes automatizados foram aprovados e a compilação foi concluída com sucesso.

Os testes existentes verificam classificação, prioridade, regras de reabertura, SLA e verificações de privacidade.

## Decisões técnicas

**SQLite:** escolhido pela simplicidade de instalação e persistência local.

**Regras determinísticas:** permitem executar o projeto sem custos de API e tornam as decisões principais reproduzíveis.

**Confirmação de ações:** evita alterações automáticas em chamados sem autorização explícita.

**Sessões assinadas:** impedem que a simples alteração de um identificador de usuário no cabeçalho conceda acesso a outra conta.

**Mastra opcional:** permite demonstrar uma integração inicial com um framework de agentes sem tornar o funcionamento básico dependente de serviços externos.

## Limitações conhecidas

- Integração do Mastra ainda não orquestra ferramentas de chamados.
- Classificação e deduplicação baseadas em heurísticas.
- Ausência de streaming real das respostas.
- Console do analista com filtros incompletos.
- Autenticação exclusivamente demonstrativa.
- Tratamento de indisponibilidade do serviço legado ainda limitado.
- SLA simplificado, sem calendário completo de feriados.
- Ausência de testes end-to-end abrangentes.

## Melhorias futuras

- Implementar ferramentas tipadas e validadas para o Mastra.
- Adicionar testes de integração e ponta a ponta.
- Implementar autenticação corporativa.
- Melhorar o tratamento de falhas e indisponibilidade de serviços.
- Adicionar observabilidade, rate limiting e auditoria.
- Refinar a interface e a responsividade.
- Disponibilizar uma versão demonstrativa em ambiente de deploy protegido.

## Entrega

Projeto desenvolvido como solução demonstrativa para o desafio técnico Beyond the Bytes.

A aplicação pode ser executada localmente sem serviços pagos e mantém persistência das informações em SQLite.