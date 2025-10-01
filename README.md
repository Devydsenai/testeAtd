# TesteAtd - Aplicativo de Gestão de Clientes

Um aplicativo React Native desenvolvido com Expo para gerenciamento de clientes, incluindo sistema de autenticação e interface moderna.

## 📱 Sobre o Projeto

O TesteAtd é uma aplicação mobile que permite:
- **Autenticação de usuários** (login e cadastro)
- **Gestão de clientes** (CRUD completo)
- **Interface moderna** com navegação por abas
- **Backend API** com Express.js e SQLite
- **Sistema de favoritos** para clientes

## 🛠️ Tecnologias Utilizadas

### Frontend (Mobile)
- **React Native** - Framework para desenvolvimento mobile
- **Expo** - Plataforma para desenvolvimento React Native
- **TypeScript** - Linguagem de programação tipada
- **React Navigation** - Navegação entre telas
- **Styled Components** - Estilização de componentes
- **AsyncStorage** - Armazenamento local
- **Axios** - Cliente HTTP para API

### Backend (API)
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **SQLite** - Banco de dados
- **CORS** - Middleware para requisições cross-origin
- **Body Parser** - Parser para requisições HTTP

## 📁 Estrutura do Projeto

```
testeAtd/
├── src/
│   ├── app/                    # Telas da aplicação
│   │   ├── Favorites/         # Tela de favoritos
│   │   ├── Home/              # Tela inicial
│   │   ├── ListaDeClient/     # Lista de clientes
│   │   ├── Preload/           # Tela de carregamento
│   │   ├── SignIn/            # Tela de login
│   │   └── SingUp/            # Tela de cadastro
│   ├── Components/            # Componentes reutilizáveis
│   ├── contexts/              # Contextos React
│   ├── stacks/                # Configuração de navegação
│   └── assets/                # Recursos (ícones, imagens)
├── server.js                  # Servidor backend
├── database.sqlite           # Banco de dados SQLite
├── App.tsx                   # Componente principal
└── package.json              # Dependências do projeto
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn
- Expo CLI (`npm install -g @expo/cli`)
- Dispositivo móvel com Expo Go ou emulador

### 1. Instalar Dependências
```bash
npm install
```

### 2. Iniciar o Backend (API)
```bash
node server.js
```
O servidor estará disponível em `http://localhost:3000`

### 3. Iniciar o Aplicativo Mobile
```bash
npm start
# ou
expo start
```

### 4. Executar em Dispositivo
- **Android**: `npm run android`
- **iOS**: `npm run ios`
- **Web**: `npm run web`

## 📡 API Endpoints

### Autenticação
- `POST /auth/login` - Login de usuário
- `POST /auth/register` - Cadastro de usuário

### Clientes
- `GET /clientes` - Listar todos os clientes
- `GET /clientes/:codigo` - Buscar cliente por código
- `POST /clientes` - Criar novo cliente
- `PUT /clientes/:codigo` - Atualizar cliente
- `PATCH /clientes/:codigo` - Atualização parcial
- `DELETE /clientes/:codigo` - Deletar cliente

### Health Check
- `GET /` - Verificar status da API

## 🗄️ Banco de Dados

O projeto utiliza SQLite com as seguintes tabelas:

### Tabela `users`
- `id` - ID único do usuário
- `name` - Nome do usuário
- `email` - Email (único)
- `phone` - Telefone
- `password` - Senha
- `avatar` - Avatar do usuário
- `createdAt` - Data de criação

### Tabela `clientes`
- `codigo` - Código único do cliente
- `nome` - Nome do cliente
- `email` - Email (único)
- `telefone` - Telefone
- `ativo` - Status ativo/inativo
- `deleted` - Soft delete
- `createdAt` - Data de criação
- `updatedAt` - Data de atualização

## 🎨 Funcionalidades

### Sistema de Autenticação
- Login com email e senha
- Cadastro de novos usuários
- Contexto global para gerenciamento de estado do usuário

### Gestão de Clientes
- Listagem de clientes com filtros
- Criação de novos clientes
- Edição de dados existentes
- Exclusão de clientes
- Sistema de favoritos

### Interface
- Navegação por abas
- Design responsivo
- Componentes reutilizáveis
- Ícones SVG personalizados

## 🔧 Scripts Disponíveis

```bash
npm start          # Inicia o Expo
npm run android    # Executa no Android
npm run ios        # Executa no iOS
npm run web        # Executa no navegador
```

## 📝 Notas de Desenvolvimento

- O projeto utiliza TypeScript para maior segurança de tipos
- Styled Components para estilização modular
- Context API para gerenciamento de estado global
- SQLite como banco de dados local
- API RESTful para comunicação frontend/backend

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e destinado para fins de teste e desenvolvimento.

---

**Desenvolvido com ❤️ usando React Native e Expo**