# Saúde Tracker

Sistema de acompanhamento de saúde pessoal desenvolvido como projeto P2 da FATEC Rubens Lara.

## Tecnologias

- **Backend:** Haskell + Servant + Warp
- **Banco de dados:** PostgreSQL
- **Frontend:** React + Vite

## Funcionalidades

- Cadastro e gerenciamento de usuários
- Registro de métricas de saúde (Peso, Pressão, Sono, Humor, Glicemia)
- Geração automática de alertas com base nas métricas
- Histórico completo de métricas
- CRUD completo

## Regras de negócio

| Métrica | Regra |
|---|---|
| Peso | Calcula IMC e classifica |
| Pressão Arterial | Alerta se acima de 120/80 |
| Sono | Alerta se abaixo de 6h ou acima de 8h |
| Humor | Alerta se abaixo de 6 |
| Glicemia | Alerta se fora de 70-100 mg/dL |

## Como rodar

### Backend
```bash
cabal build
cabal run
```

### Frontend
```bash
cd front
npm install
npm run dev
```

## Autores

- Gabriel Silva Corrêa
- Ana Grazielle