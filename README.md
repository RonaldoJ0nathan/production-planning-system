# Production Planning System (AutoFlex)

Esta é a solução integral para o desafio Full-Stack / DevOps AutoFlex, focado no sistema de Controle Produtivo e Associações de Matéria Prima. A solução foi desenhada priorizando testes, modularização limpa, DX e Clean Architecture.

## Tecnologias Principais

- **Backend:** Java 21, Quarkus, Hibernate, Resteasy (JAX-RS), OracleDB, Docker Testcontainers
- **Frontend:** React 19, Vite, Redux Toolkit (RTK Query), Material UI, Zod (Validation), React Hook Form, Cypress E2E
- **DevOps:** Docker Compose (com BuildKit nativo) e Traefik Reverse Proxy gerenciando rotas dinâmicas `/api` e a interface `Vite` nativa.

## Como Executar o Projeto

Para visualizar a aplicação por completo, use os containers orquestrados no Docker Compose presentes na raiz do projeto. O compose subirá o frontend, backend, reverse proxy e testcontainers.

### Pré-requisitos

- Docker Engine & Docker Compose instalados e em execução.

### Passos de Execução

1. Clone o repositório e abra o terminal na pasta raiz (onde encontra-se o \`compose.yml\`).
2. Execute o build para todas as sub-camadas (React + Quarkus) usando:
   \`\`\`bash
   docker compose build --no-cache
   \`\`\`
   \`\`\`bash
   docker compose up -d --force-recreate
   \`\`\`
3. Acesse a aplicação no seu navegador:
   \`\`\`url
   <http://localhost>
   \`\`\`
   *(O Traefik cuida da porta 80 nativa redirecionando \`/api\` para o backend e a raíz para o servidor do Frontend)*

## Testes e Quality Assurance

### Testes Frontend (Cypress)

O módulo React (situado em \`/frontend\`) foi testado usando chamadas de interceptores assíncronos via **Cypress**.

\`\`\`bash
cd frontend
npm install
npm run test:e2e
\`\`\`

### Funcionalidades Elaboradas

- Crud Inteligente de Matérias-Primas (RF006)
- Crud e Associação Master/Detail Inline de Produtos  (RF005, RF007)
- Cálculo e Sugestão Algorítmica de Rentabilidade Ordenada (RF008)
