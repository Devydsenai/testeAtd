# 🚀 Como Iniciar a API Backend

## Passo 1: Instalar Dependências da API
```bash
# No terminal, na pasta raiz do seu projeto:
npm install express cors body-parser sqlite3 sqlite nodemon
```

## Passo 2: Iniciar o Servidor
```bash
# Executar a API:
node server.js
```

## Passo 3: Testar se está funcionando
Abra no navegador: http://localhost:3000

Você deve ver: `{"status":"ok","message":"API está funcionando!"}`

## 📡 URLs da API Funcionando:

- **GET** `/` - Health Check  
- **POST** `/auth/login` - Login  
- **POST** `/auth/register` - Cadastro  
- **GET** `/clientes` - Listar clientes  
- **POST** `/clientes` - Criar cliente  
- **GET** `/clientes/:codigo` - Buscar cliente  
- **PUT** `/clientes/:codigo` - Atualizar cliente  
- **PATCH** `/clientes/:codigo` - Atualizar parcial cliente  
- **DELETE** `/clientes/:codigo` - Deletar cliente  

## 🛠️ Se der algum erro:
1. Verifique se a porta 3000 não está em uso
2. Tente usar: `PORT=3001 node server.js`
3. Se usar porta diferente, atualize no `API.tsx`

## ✅ Se funcionou:
Agora você pode testar o app React Native que vai se conectar automaticamente!
