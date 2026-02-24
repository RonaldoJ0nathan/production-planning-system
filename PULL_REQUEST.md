# Produção e Estoque: Implementação Completa (AutoFlex Challenge)

## 🎯 Objetivo

Esta Pull Request integra a branch `dev` na `main`, entregando a solução Full-Stack completa para o Teste Técnico da Autoflex (Production Planning System). A entrega atende a **100% dos Requisitos Funcionais (RF) e Não Funcionais (RNF)**, além de cobrir os **Requisitos Desejáveis (Testes Unitários, Integração e E2E)**.

## 🛠 Tecnologias Utilizadas

- **Backend:** Java 25, Quarkus 3, Hibernate ORM (Panache), RestAssured, Mockito, JUnit 5.
- **Frontend:** React 19, TypeScript, Vite, Redux Toolkit (RTK Query), Material UI v6, React Hook Form, Zod, Cypress.
- **Infraestrutura:** Docker, Docker Compose, Traefik (Reverse Proxy), Oracle Database (emulado em dev/test via containers/H2).

## ✅ Requisitos Cumpridos

### ⚙️ Backend (API)

- [x] **RF001 / RF002:** CRUD completo para *Products* e *Raw Materials*.
- [x] **RF003:** Endpoint dedicado para gerenciar "Receitas" (`ProductRawMaterialResource`), protegendo o banco contra duplicatas e garantindo consistência relacional.
- [x] **RF004 (Algoritmo Core):** Motor lógico (`ProductionSuggestionService`) que processa o estoque, simula consumo em memória e recomenda a produção priorizando a **maior rentabilidade (Valor Unitário)**, identificando o gargalo matemático de cada receita.
- [x] **Testes Automatizados:** Cobertura abrangente com 27 casos de testes executados com êxito (Unitários garantindo a lógica de Negócio + Integração testando os endpoints HTTP).

### 🖥️ Frontend (SPA)

- [x] **RF005 / RF006:** Telas reativas para gestão de Estoque e Catálogo de Produtos.
- [x] **RF007:** Associação de Matérias-Primas acoplada nativamente na tela de Produtos via um *Stepper* (Wizard) interativo, eliminando a necessidade de telas isoladas. Otimizações de renderização (evitando *cascading renders*) e minimização de hits desnecessários à API usando `isDirty`.
- [x] **RF008:** Dashboard Home construído para consumir as recomendações de produção. O sistema apresenta de forma visual as ordens de produção mais rentáveis, quantidade faturável e teto físico da fábrica.
- [x] **UX/UI:** Toda a interface e tratativas de erro (toasts, validações) traduzidas para português-BR. Interface totalmente responsiva.
- [x] **Testes Cypress:** Suíte de e2e engatilhada e testada no frontend.

### 🐳 DevOps

- [x] `docker-compose.yml` finalizado contendo Frontend, Backend, Banco de Dados e Proxy.
- [x] Rotas devidamente mapeadas ocultando portas em favor do Gateway Principal.
- [x] `Hot Reloading` mapeado com volumes na branch para facilitar manutenção dos devs no Frontend e Backend simultaneamente.

## 🧪 Como Testar

1. Baixe o repositório na branch `main` após o merge.
2. Execute `docker compose up -d --build`.
3. Acesse `http://localhost/` e verifique a robustez do Dashboard.
