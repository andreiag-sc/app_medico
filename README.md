# Protótipo: Plataforma de Anonimização e Estruturação de Dados Médicos

Este repositório contém um protótipo de interface em React (Vite) com Tailwind CSS e Lucide React para ícones.

Observações importantes:
- É apenas um mockup; NÃO há integração com modelos de IA ou backend.
- O processamento é simulado no front-end com estados e dados estáticos.

1. Descrição do Problema e da Solução Proposta

O Problema: A discussão de casos clínicos reais é fundamental para o ensino médico e para a inteligência de mercado na área da saúde. No entanto, os prontuários contêm informações sensíveis e identificáveis. Fazer a limpeza manual é um processo lento e sujeito a falhas humanas, gerando riscos éticos e legais.

A Solução: Este projeto é o protótipo (front-end) de uma aplicação que automatiza a anonimização e estruturação de textos médicos. O usuário insere um relato clínico bruto, e o sistema oculta os dados sensíveis, retornando o texto organizado em seções padrão (Queixa Principal, Histórico da Moléstia Atual, Conduta).

Integração Futura (IA Real): No futuro, o back-end será conectado a um modelo de linguagem (LLM) atuando como um Agente de Extração de Entidades. A IA lerá o texto, localizará os dados sensíveis por contexto e reescreverá o texto formatado, garantindo que o sentido clínico da história não seja alterado.

2. Escolhas de Design e Regras de Negócio

1- Arquitetura (Stack): Optei por usar React com Vite para o front-end (visual) e Tailwind CSS para a estilização. É uma estrutura rápida, moderna e ideal para prototipagem.

2- Interface de Comparação (Split Screen): Na tela de "Revisão", escolhi usar uma visualização lado a lado. Na medicina, a validação humana é inegociável. Mostrar o texto original com os dados sensíveis em vermelho ao lado do resultado processado permite ao médico revisar com segurança.

3- Uso de Tags Neutras: Em vez de simplesmente apagar os dados, o sistema substitui informações sensíveis por marcadores em destaque (azul e negrito) como [PACIENTE], [IDADE] ou [HOSPITAL]. Isso preserva o sentido da frase e cria um padrão perfeito para futuras análises de inteligência de mercado via Processamento de Linguagem Natural (NLP).

4- Paleta de Cores: Tons limpos de azul, branco e cinza, que transmitem a seriedade e limpeza exigidas em softwares de saúde.

3. O que Funcionou com o Agente (Cursor)
1- Estruturação Base: O agente foi excelente para criar a "espinha dorsal" do projeto. Com o primeiro comando, ele gerou perfeitamente a navegação lateral (Sidebar) e a divisão em três rotas principais (Visão Geral, Novo Caso e Histórico).

2- Configuração de Bibliotecas: Ele integrou o Tailwind CSS e a biblioteca de ícones Lucide React sem nenhum erro de configuração, entregando componentes visualmente limpos logo de início.

4. O que Não Funcionou e Minhas Intervenções (O Processo)
Apesar da boa estrutura inicial, atuei ativamente revisando o código gerado, pois a IA cometeu várias falhas graves de lógica, UI (Interface) e UX (Experiência do Usuário), exigindo iterações constantes:

Falha 1: Alucinação de Contexto e Dados Sensíveis: Na primeira versão da tela de Revisão, a IA mostrou um texto original de oftalmologia (retinopatia diabética) e um resultado de cardiologia. Além disso, falhou em destacar os dados óbvios (nome, CPF, CRM). Correção: Intervim com um prompt rigoroso exigindo coerência total entre os dois lados e listando exatamente o que deveria ser ocultado.

Falha 2: Perda de Dados (Estado do React): O agente não conectou o fluxo de dados. Ao aprovar um caso e ir para a aba Histórico, os dados sumiam (o React destruía o estado). Correção: Exigi a implementação de salvamento correto (state lifting / local storage) para que os casos aprovados realmente alimentassem a tabela de Histórico.

Falha 3: Simetria e Design (UI): A IA colocou a barra de rolagem (scroll) apenas na caixa de texto original, quebrando o layout. Além disso, as tags [PACIENTE] não tinham contraste. Correção: Forcei a mesma altura (max-h) e rolagem (overflow-y-auto) em ambas as caixas e adicionei fundo azul nas tags anonimizadas. Os botões também vieram com cores genéricas (verde/amarelo) e foram ajustados para o padrão do sistema.

Falha 4: Sem Rota de Fuga (UX): A interface prendia o usuário na tela de revisão, sem opção de cancelar. Correção: Pedi a inclusão do botão "Descartar Caso" para limpar o processo e voltar ao início sem salvar.

Falha 5: Limitações da Utilidade Prática: A IA listou o Histórico, mas não permitia clicar para ler o texto completo. Mais grave ainda: não havia como o aluno ou médico copiar o texto anonimizado. Correção: Instruí a criação de um Modal para leitura completa no Histórico e a inclusão de um botão interativo de "Copiar" (com feedback visual de sucesso) na caixa do texto processado. Também adicionei um botão de "Limpar Histórico".

5. Como Rodar o Projeto Localmente
Instale as dependências: npm install
Rode o servidor de desenvolvimento: npm run dev

Acesse no navegador no link:


