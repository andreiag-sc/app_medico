# Plataforma de Anonimização e Estruturação de Dados Médicos

Este repositório contém uma aplicação Full-Stack (React e FastAPI) que automatiza a anonimização e estruturação de prontuários médicos utilizando Engenharia de LLM avançada, em total conformidade com as diretrizes da LGPD (Lei Geral de Proteção de Dados).

## 1. Descrição do Problema e da Solução Proposta

**O Problema:** A discussão de casos clínicos é fundamental para o ensino médico e para a inteligência de mercado na saúde (Real-World Evidence). No entanto, limpar prontuários manualmente para remover dados sensíveis é um processo lento, caro e sujeito a falhas. O uso de regras fixas de programação (Expressões Regulares - Regex) também falha, pois não compreende o contexto das frases, gerando riscos éticos e legais.

**A Solução:** Este projeto integra um LLM que atua como um Agente de Extração de Entidades. A IA lê o texto bruto e atua em duas frentes:
1. **Anonimização:** Localiza os dados sensíveis por contexto semântico (nomes, locais, datas) e oculta essas informações usando tags seguras (ex: `[PACIENTE]`, `[LOCALIZACAO]`).
2. **Estruturação:** Fatie o texto bruto e o devolve organizado em seções clínicas padronizadas (Queixa Principal, Exame Físico, Conduta), sem alterar o sentido original da história.

## 2. Arquitetura do Sistema e Engenharia de LLM

A aplicação foi dividida em dois microsserviços para separar a interface visual da regra de negócio e proteger a chave de API:
- **Frontend:** Construído em React (Vite) com Tailwind CSS, oferecendo uma interface de validação lado a lado (texto original vs. processado) e auditoria visual.
- **Backend:** Construído em Python usando FastAPI.

**Fluxo de Dados:**
Input do Usuário (React) ➔ Backend (FastAPI) ➔ System Prompt + Instruções ➔ OpenAI API (GPT-4o-mini) ➔ Extração de Dados (JSON) ➔ Ferramenta Python (Calcula risco LGPD) ➔ Resposta na Tela.

**Decisão de Framework (SDK Direto vs. LangChain):**
Optei por fazer chamadas diretas usando a biblioteca oficial da OpenAI (SDK) em vez de usar frameworks pesados como LangChain ou LangGraph. A anonimização é uma tarefa determinística de turno único (*single-turn*). Adicionar o LangChain traria complexidade e latência desnecessárias para este caso de uso específico. O código se mantém mais leve, rápido e fácil de debugar.

## 3. Decisões de LLM e Configurações de Parâmetros

- **Modelo Escolhido (gpt-4o-mini):** A tarefa exige "Structured Outputs" rigorosos (retornar exclusivamente um formato JSON perfeito) e alta precisão clínica. O gpt-4o-mini (API paga) entrega precisão de ponta com baixo custo e altíssima velocidade. *Trade-off:* Um modelo local (como Llama 3) traria mais privacidade por rodar no próprio hospital, mas exigiria infraestrutura de servidores caros (GPUs) e maior esforço de engenharia para forçar a saída no formato JSON sem erros ou perdas em textos longos.
- **Parâmetros (Temperatura 0.0 e Top-P 0.1):** Na área da saúde, não queremos criatividade do modelo. Configurar a temperatura em zero e o Top-p em 0.1 reduz o vocabulário da IA para as palavras mais prováveis e seguras. Isso força a IA a ser factual e determinística, impedindo que ela invente sintomas clínicos (alucinação) ou altere a gravidade do quadro do paciente.

## 4. Estratégia do System Prompt

O prompt (`system_prompt.txt`) foi desenhado para máximo controle sobre a saída do modelo:

- **Persona:** O LLM é instruído a atuar como um "Especialista Sênior em Privacidade de Dados Médicos e NLP Clínico".
- **XML Tags e Few-Shot:** O prompt é estruturado em blocos definidos por tags, separando claramente as diretrizes de anonimização do formato de saída exigido, e fornece um exemplo exato da estrutura JSON desejada.
- **Heurísticas Restritivas:** Exige a troca exata de dados por marcadores específicos, garantindo que dados vitais (como idade genérica e sinais vitais) sejam preservados e não confundidos com informações de identificação pessoal.
- **Regra de Integridade do Relato:** Contém uma instrução explícita em CAIXA ALTA proibindo o modelo de abreviar o texto ou usar reticências (ex: `...texto aqui`), garantindo que o relato completo seja sempre retornado na íntegra.

## 5. Ferramenta Integrada (Tools): Termômetro de Risco LGPD

Para demonstrar o uso de *Tools* (Ferramentas), o sistema não delega matemática para a IA. Em vez disso, foi criada uma ferramenta Python local (`lgpd_tool.py`). 

**Por que usar essa ferramenta?**
Modelos de linguagem são excelentes com texto, mas não são ideais para lógica determinística e matemática. A IA apenas identifica e remove as entidades. O código Python conta essas entidades removidas e aplica uma régua de classificação de risco. Delegar essa regra de negócio para o Python garante 100% de estabilidade.

A lógica é fundamentada no conceito de *linkability* da LGPD: quanto mais dados identificáveis um documento contiver, maior a probabilidade de que um terceiro consiga cruzar as informações e reidentificar o paciente.

| Entidades Encontradas | Nível de Risco   | Significado |
|-----------------------|------------------|-------------|
| 0                     | **Risco Baixo** | Nenhum dado sensível identificável foi encontrado. O prontuário é considerado seguro para compartilhamento. |
| 1 a 3                 | **Risco Moderado** | Alguns dados sensíveis foram detectados e removidos. O documento requer revisão antes do uso. |
| 4 ou mais             | **Alto Risco** | Muitos dados sensíveis foram detectados. O risco de reidentificação do paciente é elevado. Exige atenção redobrada da equipe de compliance. |

O resultado é exibido na interface como um card visual colorido tanto na tela de Revisão quanto na aba de Auditoria, facilitando a tomada de decisão da governança hospitalar e de Comitês de Ética Médica.

## 6. Histórico de Desenvolvimento: O que funcionou e o que não funcionou

- **O que não funcionou no início:** Na primeira versão, o uso de substituição de texto simples no frontend (Regex) deixava vazar números de identificação e endereços completos. Ao integrar a IA inicialmente, ela era "preguiçosa" e começava a deletar parágrafos inteiros ou usar reticências para resumir a história.
- **A Solução:** O uso da compreensão ontológica e semântica do LLM (NER) substituiu a fragilidade do Regex. Para a "preguiça", apliquei a ordem restritiva em maiúsculas no prompt proibindo abreviações.
- **O grande acerto:** O uso do parâmetro **`response_format={ "type": "json_object" }`** foi fundamental. Sem ele, a IA respondia com textos informais, o quebrava o front-end em React. Forçar o JSON garantiu a integração perfeita das telas.
- **Mudança de Escopo Estratégica:** A ferramenta de busca de CID-10 foi substituída pelo Termômetro de Risco LGPD. A decisão foi motivada por confiabilidade técnica (a busca de CID dependia de `tool_calls` da OpenAI, que ocasionalmente retornava `content = null` e causava falhas silenciosas na interface) e por relevância prática hospitalar.

## 7. Como Executar o Projeto Localmente

É necessário executar os dois ambientes em paralelo (dois terminais separados).
Certifique-se de configurar o arquivo `backend/.env` com a sua chave `OPENAI_API_KEY`.

**Iniciando o Backend (Python/FastAPI):**
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload
