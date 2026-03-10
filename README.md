# API de Gerenciamento de Pedidos Jitterbit

Uma API REST completa para gerenciamento de pedidos, desenvolvida em Node.js com Express, TypeScript e banco de dados MySQL. A API implementa operações CRUD com transformação automática de dados e validação robusta.

## Características

- **Endpoints REST completos** para criar, ler, atualizar e deletar pedidos
- **Transformação automática de dados** entre formato de API e banco de dados
- **Validação robusta** com mensagens de erro em português
- **Tratamento de erros** com códigos HTTP apropriados (200, 201, 400, 404, 500)
- **Banco de dados MySQL** com schema relacional (tabelas Order e Items)
- **Testes unitários** com Vitest para validação de dados
- **Código limpo e bem documentado** com comentários descritivos
- **TypeScript** para type safety e melhor experiência de desenvolvimento

## Requisitos

- Node.js 18+
- npm ou pnpm
- MySQL 8.0+

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/igorlini22-cmd/jitterbit-order-api.git
cd jitterbit-order-api
```

2. Instale as dependências:
```bash
pnpm install
```

3. Configure o banco de dados:
```bash
pnpm db:push
```

4. Inicie o servidor:
```bash
pnpm dev
```

O servidor estará disponível em `http://localhost:3000`

## Endpoints da API

### Criar Pedido
**POST** `/api/order`

Cria um novo pedido com seus itens.

**Request Body:**
```json
{
  "numeroPedido": "v10089015vdb-01",
  "valorTotal": 10000,
  "dataCriacao": "2023-07-19T12:24:11.529Z",
  "items": [
    {
      "idItem": "2434",
      "quantidadeItem": 1,
      "valorItem": 1000
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "orderId": "v10089015vdb-01",
    "value": 10000,
    "creationDate": "2023-07-19T12:24:11.529Z",
    "items": [
      {
        "productId": 2434,
        "quantity": 1,
        "price": 1000
      }
    ]
  }
}
```

### Obter Pedido Específico
**GET** `/api/order/:orderId`

Recupera um pedido específico pelo número.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "orderId": "v10089015vdb-01",
    "value": 10000,
    "creationDate": "2023-07-19T12:24:11.529Z",
    "items": [
      {
        "productId": 2434,
        "quantity": 1,
        "price": 1000
      }
    ]
  }
}
```

### Listar Todos os Pedidos
**GET** `/api/order/list`

Lista todos os pedidos com seus itens.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "orderId": "v10089015vdb-01",
      "value": 10000,
      "creationDate": "2023-07-19T12:24:11.529Z",
      "items": [...]
    }
  ]
}
```

### Atualizar Pedido
**PUT** `/api/order/:orderId`

Atualiza um pedido existente.

**Request Body (todos os campos opcionais):**
```json
{
  "valorTotal": 15000,
  "dataCriacao": "2023-07-20T10:00:00.000Z"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "orderId": "v10089015vdb-01",
    "value": 15000,
    "creationDate": "2023-07-20T10:00:00.000Z",
    "items": [...]
  }
}
```

### Deletar Pedido
**DELETE** `/api/order/:orderId`

Deleta um pedido e seus itens.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Pedido v10089015vdb-01 deletado com sucesso",
    "orderId": "v10089015vdb-01"
  }
}
```

## Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | OK - Requisição bem-sucedida (GET, PUT) |
| 201 | Created - Recurso criado com sucesso (POST) |
| 400 | Bad Request - Dados inválidos ou incompletos |
| 404 | Not Found - Pedido não encontrado |
| 500 | Internal Server Error - Erro no servidor |

## Estrutura do Projeto

```
jitterbit-order-api/
├── drizzle/
│   ├── schema.ts          # Definição das tabelas (Order, Items, Users)
│   └── migrations/        # Histórico de migrações
├── server/
│   ├── _core/
│   │   └── index.ts       # Configuração do Express e rotas
│   ├── db.ts              # Funções de acesso ao banco de dados
│   ├── orderRoutes.ts     # Endpoints da API de pedidos
│   ├── orderValidation.ts # Validação e transformação de dados
│   ├── orderValidation.test.ts # Testes unitários
│   └── routers.ts         # Rotas tRPC
├── client/                # Frontend React (opcional)
├── package.json           # Dependências do projeto
├── drizzle.config.ts      # Configuração do Drizzle ORM
└── README.md              # Este arquivo
```

## Transformação de Dados

A API realiza transformação automática entre o formato de requisição e o formato do banco de dados:

**Entrada (API):**
- `numeroPedido` → `orderId`
- `valorTotal` → `value`
- `dataCriacao` → `creationDate`
- `idItem` → `productId`
- `quantidadeItem` → `quantity`
- `valorItem` → `price`

## Validação

A API valida todos os dados de entrada:

- **numeroPedido**: Obrigatório, string não vazia
- **valorTotal**: Obrigatório, número positivo
- **dataCriacao**: Obrigatório, ISO 8601 datetime válido
- **items**: Obrigatório, array com pelo menos um item
- **idItem**: Obrigatório, string não vazia
- **quantidadeItem**: Obrigatório, inteiro positivo
- **valorItem**: Obrigatório, número positivo

## Testes

Execute os testes unitários:

```bash
pnpm test
```

Os testes cobrem:
- Validação de dados de entrada
- Transformação de dados
- Tratamento de erros
- Casos extremos e validações

## Desenvolvimento

Para iniciar o servidor em modo desenvolvimento com hot reload:

```bash
pnpm dev
```

Para verificar tipos TypeScript:

```bash
pnpm check
```

Para formatar o código:

```bash
pnpm format
```

## Exemplo de Uso com cURL

Criar um pedido:
```bash
curl --location 'http://localhost:3000/api/order' \
--header 'Content-Type: application/json' \
--data '{
  "numeroPedido": "v10089015vdb-01",
  "valorTotal": 10000,
  "dataCriacao": "2023-07-19T12:24:11.529Z",
  "items": [
    {
      "idItem": "2434",
      "quantidadeItem": 1,
      "valorItem": 1000
    }
  ]
}'
```

Obter um pedido:
```bash
curl --location 'http://localhost:3000/api/order/v10089015vdb-01'
```

Listar todos os pedidos:
```bash
curl --location 'http://localhost:3000/api/order/list'
```

Atualizar um pedido:
```bash
curl --location --request PUT 'http://localhost:3000/api/order/v10089015vdb-01' \
--header 'Content-Type: application/json' \
--data '{
  "valorTotal": 15000
}'
```

Deletar um pedido:
```bash
curl --location --request DELETE 'http://localhost:3000/api/order/v10089015vdb-01'
```

## Tratamento de Erros

Exemplo de resposta de erro:

```json
{
  "success": false,
  "error": "Dados do pedido invalidos",
  "details": {
    "numeroPedido": ["Numero do pedido e obrigatorio"],
    "items": ["Pelo menos um item e obrigatorio"]
  }
}
```

## Banco de Dados

### Tabela: orders
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| orderId | VARCHAR(64) | Identificador único do pedido (chave primária) |
| value | INT | Valor total do pedido em centavos |
| creationDate | TIMESTAMP | Data de criação do pedido |
| updatedAt | TIMESTAMP | Data da última atualização |

### Tabela: items
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | INT | Identificador único do item (chave primária) |
| orderId | VARCHAR(64) | Referência ao pedido (chave estrangeira) |
| productId | INT | Identificador do produto |
| quantity | INT | Quantidade do item |
| price | INT | Preço unitário em centavos |
| createdAt | TIMESTAMP | Data de criação do item |

## Licença

MIT

## Contato

Para dúvidas ou sugestões, entre em contato com a equipe de desenvolvimento.
