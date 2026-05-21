# SpecRadar — Challenge Ford / FIAP

Plataforma de inteligência competitiva automotiva desenvolvida para o Challenge Ford da FIAP. O analista consulta um veículo concorrente via chat livre ou formulário estruturado e recebe uma ficha técnica padronizada em menos de 10 segundos, com _confidence score_ por campo, fonte e data de verificação.

**Caso de teste oficial:** Ford Ranger Raptor  
**Entrega:** 2026-05-24 — apresentação no Teams + link do vídeo no slide 1 + arquivo `.archimate`

---

## Equipe

| Frente | Responsáveis |
|---|---|
| Arquitetura SOA / Web Services (Java) | Renan e Camila |
| **Mobile (React Native + Expo)** | **Pedro e Isabelle** |
| Cybersecurity | Renan e Camila |
| Testing / Compliance / QA (pitch, BMC, Quadro de Valor, TOGAF) | Todos · vídeo: Isabelle |
| IA & ML — clustering + classificação | Nicoli |

> Este repositório concentra a **frente Mobile (Pedro)**. Backend, Cyber e IA/ML estão em repositórios separados da equipe.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | React Native 0.83 + Expo SDK 55 |
| Navegação | Expo Router 6 (file-based) |
| Linguagem | TypeScript estrito |
| HTTP | `fetch` nativo + `AbortController` (timeout 15 s) |
| Persistência | `@react-native-async-storage/async-storage` |
| Exportação | `Share` nativo do React Native |

**Não utilizamos:** Redux/Zustand, NativeWind, axios.

---

## Estrutura do projeto

```
Sprint_Mobile/
├── CHALLENGE _ FORD.pdf          # brief original (não editar)
├── CLAUDE.md                     # instruções para o agente de IA
├── README.md                     # este arquivo
└── specradar-mobile/             # app Expo
    ├── app/                      # rotas Expo Router
    │   ├── _layout.tsx           # Stack root
    │   ├── ficha/[id].tsx        # rota dinâmica de detalhe
    │   └── (tabs)/
    │       ├── _layout.tsx       # barra de tabs (4 abas)
    │       ├── chat.tsx          # consulta por linguagem natural
    │       ├── formulario.tsx    # entrada estruturada com validação
    │       ├── comparar.tsx      # comparação lado a lado
    │       └── historico.tsx     # últimas 10 consultas
    ├── src/
    │   ├── api/
    │   │   ├── client.ts         # fetch wrapper com toggle mock/real
    │   │   └── mocks/
    │   │       └── ranger-raptor.ts  # mock de 13 atributos
    │   ├── components/
    │   │   ├── SpecCard.tsx      # ficha técnica + Exportar CSV
    │   │   ├── ConfidenceBadge.tsx
    │   │   ├── LoadingSpinner.tsx
    │   │   └── ErrorMessage.tsx
    │   ├── hooks/
    │   │   └── useSpecQuery.ts   # data / loading / error + auto-save
    │   ├── storage/
    │   │   └── history.ts        # AsyncStorage, máx 10, dedupe por id
    │   ├── theme/
    │   │   └── colors.ts         # paleta Ford + ATRIBUTOS_PADRAO
    │   └── types/
    │       └── spec.ts           # SpecQuery, SpecResponse, Confidence, ApiError
    ├── components/               # boilerplate Expo (não modificar)
    └── hooks/                    # use-color-scheme normalizado
```

---

## Como rodar

Todos os comandos devem ser executados dentro de `specradar-mobile/`.

```bash
# Instalar dependências (use a flag caso haja conflito de peer deps)
npm install --legacy-peer-deps

# Iniciar Metro + QR Code para Expo Go
npm start

# Se PC e celular não compartilham a mesma rede
npm start -- --tunnel

# Emulador Android
npm run android

# Navegador (limitado — use apenas para debug visual rápido)
npm run web

# Verificar tipos TypeScript
./node_modules/.bin/tsc --noEmit
```

> **Atenção:** use sempre `./node_modules/.bin/tsc`, nunca `npx tsc`.

---

## Modo mock vs. API real

O toggle é automático via variável de ambiente:

| Condição | Comportamento |
|---|---|
| `EXPO_PUBLIC_API_BASE_URL` ausente ou vazio | Usa mock local (`ranger-raptor.ts`) |
| `EXPO_PUBLIC_API_BASE_URL` definida | Chama a API real |

Para ativar a API real, crie um arquivo `.env` em `specradar-mobile/`:

```env
EXPO_PUBLIC_API_BASE_URL=https://sua-api.exemplo.com
```

---

## Funcionalidades implementadas

| Funcionalidade | Status |
|---|---|
| Consulta por linguagem natural (chat) | ✅ |
| Formulário estruturado com validação | ✅ |
| Ficha técnica com confidence score | ✅ |
| Loading spinner e mensagem de erro em PT-BR | ✅ |
| Timeout 15 s com feedback ao usuário | ✅ |
| Histórico das últimas 10 consultas (AsyncStorage) | ✅ |
| Comparação lado a lado com destaque do vencedor | ✅ |
| Rota dinâmica de detalhe (`/ficha/[id]`) | ✅ |
| Exportar ficha como CSV (Share API nativa) | ✅ |
| Indicador visual de confiança (verde / laranja / cinza) | ✅ |
| Integração com API real + JWT | ⏳ Fase 4 |
| Teste em iOS e Android físicos | ⏳ Fase 4 |

---

## Endpoints da API (Fase 4)

| Método | Path | Descrição |
|---|---|---|
| `POST` | `/api/v1/specs/query` | Consulta: `{marca, modelo, versao, atributos[]}` → ficha |
| `GET` | `/api/v1/specs/compare` | Comparação: `?v1=X&v2=Y&atributos=a,b` |
| `GET` | `/api/v1/specs/history` | Histórico com filtros |
| `POST` | `/api/v1/specs/from-pdf` | Upload de catálogo PDF → ficha extraída |

---

## Confidence score

Cada campo da ficha retorna um dos três níveis:

| Nível | Cor | Significado |
|---|---|---|
| `alta` | Verde | Dado confirmado na fonte |
| `inferida` | Laranja | Dado estimado ou aproximado |
| `nao_encontrado` | Cinza | Campo não localizado (`valor: null`) |

---

## Convenções de código

- **Idioma da UI:** Português (labels, mensagens, comentários)
- **Variáveis JS/TS:** `camelCase`
- **Campos JSON da API:** `snake_case` (`verificado_em`, `potencia_cv`, etc.)
- **Importações:** absolutas com `@/...` (configurado em `tsconfig.json`)
- `components/` na raiz → boilerplate Expo (não modificar)
- `src/components/` → componentes do SpecRadar

---

## Dependências bloqueantes (Fase 4)

| Bloqueio | Responsável |
|---|---|
| Contrato JSON do endpoint `/specs/query` | Renan / Camila |
| Decisão Java vs FastAPI | Equipe + professor |
| URL pública da API (ngrok / deploy) | Renan / Camila |
| JWT de teste | Renan / Camila (Cyber) |

A cobertura via mock permite desenvolver e demonstrar as Fases 1–3 sem dependência do backend.
