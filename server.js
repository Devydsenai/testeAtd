// server.js
// API backend simple para o projeto Expo React Native
// Execute: node server.js

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Inicializar SQLite
const database = {
  db: null
};

async function initializeDatabase() {
  try {
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });


    // Criar tabelas se não existirem
    await db.exec(`
      CREATE TABLE IF NOT EXISTS clientes (
        codigo INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        telefone TEXT,
        ativo BOOLEAN DEFAULT 1,
        deleted BOOLEAN DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Adicionar coluna 'deleted' se não existir (para bancos existentes)
    const columns = await db.all(`PRAGMA table_info(clientes);`);
    const hasDeleted = columns.some(col => col.name === 'deleted');
    if (!hasDeleted) {
      try {
        await db.exec(`ALTER TABLE clientes ADD COLUMN deleted BOOLEAN DEFAULT 0;`);
        console.log('Coluna "deleted" adicionada à tabela clientes');
      } catch (error) {
        console.log('Erro ao adicionar coluna "deleted":', error.message);
      }
    } else {
      console.log('Coluna "deleted" já existe na tabela clientes');
    }

    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        password TEXT NOT NULL,
        avatar TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    database.db = db;
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database error:', error);
  }
}

// Inicializar no startup
initializeDatabase();

// Helper para responder com JSON
const respond = (res, data, status = 200) => {
  return res.status(status).json(data);
};

// ROTAS DA API

// 1. HEALTH CHECK
app.get('/', (req, res) => {
  console.log('Health check requested');
  respond(res, { status: 'ok', message: 'API está funcionando!' });
});

// 2. AUTENTICAÇÃO - LOGIN
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', email);

    if (!email || !password) {
      return respond(res, { error: 'Email e senha são obrigatórios' }, 400);
    }

    // Buscar usuário no banco
    const user = await database.db.get(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      return respond(res, { error: 'Usuário não encontrado' }, 404);
    }

    // Verificar senha (simplificado - em produção use bcrypt)
    if (user.password !== password) {
      return respond(res, { error: 'Senha incorreta' }, 401);
    }

    // Gerar token (simplificado - em produção use JWT)
    const token = `fake_token_${user.id}_${Date.now()}`;

    respond(res, {
      token,
      data: {
        avatar: user.avatar || 'default_avatar.jpg',
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    respond(res, { error: 'Erro no servidor' }, 500);
  }
});

// 3. AUTENTICAÇÃO - REGISTRAR
app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    console.log('Register attempt:', { name, email, phone });

    if (!name || !email || !password) {
      return respond(res, { error: 'Nome, email e senha são obrigatórios' }, 400);
    }

    // Verificar se email já existe
    const existingUser = await database.db.get(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser) {
      return respond(res, { error: 'Email já cadastrado' }, 409);
    }

    // Inserir novo usuário
    const result = await database.db.run(
      'INSERT INTO users (name, email, phone, password, avatar) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone || null, password, 'default_avatar.jpg']
    );

    const userId = result.lastID;
    const token = `fake_token_${userId}_${Date.now()}`;

    respond(res, {
      token,
      data: {
        avatar: 'default_avatar.jpg',
        name,
        email,
        phone
      }
    }, 201);

  } catch (error) {
    console.error('Register error:', error);
    respond(res, { error: 'Erro no servidor' }, 500);
  }
});

// 4. CLIENTES - LISTAR TODOS
app.get('/clientes', async (req, res) => {
  try {
    console.log('Listando clientes');
    const { nome, email, ativo, limit = 100, offset = 0 } = req.query;

    let query = 'SELECT * FROM clientes WHERE 1=1';
    const params = [];

    if (nome) {
      query += ' AND nome LIKE ?';
      params.push(`%${nome}%`);
    }
    if (email) {
      query += ' AND email = ?';
      params.push(email);
    }
    if (ativo !== undefined) {
      query += ' AND ativo = ?';
      params.push(ativo === 'true' ? 1 : 0);
    }

    query += ` ORDER BY codigo ASC LIMIT ${limit} OFFSET ${offset}`;

    const clientes = await database.db.all(query, params);
    console.log(`Encontrados ${clientes.length} clientes`);
    respond(res, clientes);

  } catch (error) {
    console.error('List clients error:', error);
    respond(res, { error: 'Erro ao buscar clientes' }, 500);
  }
});

// 5. CLIENTES - BUSCAR POR CÓDIGO
app.get('/clientes/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;
    console.log('Buscando cliente:', codigo);

    const cliente = await database.db.get(
      'SELECT * FROM clientes WHERE codigo = ?',
      [codigo]
    );

    if (!cliente) {
      return respond(res, { error: 'Cliente não encontrado' }, 404);
    }

    respond(res, cliente);

  } catch (error) {
    console.error('Get client error:', error);
    respond(res, { error: 'Erro ao buscar cliente' }, 500);
  }
});

// 6. CLIENTES - CRIAR
app.post('/clientes', async (req, res) => {
  try {
    const { nome, email, telefone, ativo = false } = req.body;
    console.log('Criando cliente:', { nome, email, telefone });

    if (!nome || !email) {
      return respond(res, { error: 'Nome e email são obrigatórios' }, 400);
    }

    // Verificar se email já existe
    const existing = await database.db.get(
      'SELECT codigo FROM clientes WHERE email = ?',
      [email]
    );

    if (existing) {
      return respond(res, { error: 'E-mail já cadastrado' }, 409);
    }

    const result = await database.db.run(
      'INSERT INTO clientes (nome, email, telefone, ativo) VALUES (?, ?, ?, ?)',
      [nome, email, telefone || null, ativo ? 1 : 0]
    );

    const cliente = await database.db.get(
      'SELECT * FROM clientes WHERE codigo = ?',
      [result.lastID]
    );

    console.log('Cliente criado:', cliente.codigo);
    respond(res, cliente, 201);

  } catch (error) {
    console.error('Create client error:', error);
    respond(res, { error: 'Erro ao criar cliente' }, 500);
  }
});

// 7. CLIENTES - ATUALIZAR
app.put('/clientes/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;
    const { nome, email, telefone, ativo } = req.body;
    console.log('Atualizando cliente:', codigo);

    const cliente = await database.db.get(
      'SELECT codigo FROM clientes WHERE codigo = ?',
      [codigo]
    );

    if (!cliente) {
      return respond(res, { error: 'Cliente não encontrado' }, 404);
    }

    await database.db.run(
      'UPDATE clientes SET nome = ?, email = ?, telefone = ?, ativo = ?, updatedAt = CURRENT_TIMESTAMP WHERE codigo = ?',
      [nome, email, telefone || null, ativo ? 1 : 0, codigo]
    );

    const clienteAtualizado = await database.db.get(
      'SELECT * FROM clientes WHERE codigo = ?',
      [codigo]
    );

    console.log('Cliente atualizado:', codigo);
    respond(res, clienteAtualizado);

  } catch (error) {
    console.error('Update client error:', error);
    respond(res, { error: 'Erro ao atualizar cliente' }, 500);
  }
});

// 8. CLIENTES - ATUALIZAR PARCIAL
app.patch('/clientes/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;
    console.log('Patch cliente:', codigo, req.body);

    const cliente = await database.db.get(
      'SELECT codigo FROM clientes WHERE codigo = ?',
      [codigo]
    );

    if (!cliente) {
      return respond(res, { error: 'Cliente não encontrado' }, 404);
    }

    // Construir query UPDATE dinamicamente
    const fields = Object.keys(req.body);
    if (fields.length === 0) {
      return respond(res, { error: 'Nenhum campo para atualizar' }, 400);
    }

    let query = 'UPDATE clientes SET ';
    const setClauses = [];
    const values = [];

    fields.forEach(field => {
      setClauses.push(`${field} = ?`);
      values.push(req.body[field]);
    });

    query += setClauses.join(', ') + ', updatedAt = CURRENT_TIMESTAMP WHERE codigo = ?';
    values.push(codigo);

    await database.db.run(query, values);

    const clienteAtualizado = await database.db.get(
      'SELECT * FROM clientes WHERE codigo = ?',
      [codigo]
    );

    console.log('Cliente patch atualizado:', codigo);
    respond(res, clienteAtualizado);

  } catch (error) {
    console.error('Patch client error:', error);
    respond(res, { error: 'Erro ao atualizar cliente' }, 500);
  }
});

// 9. CLIENTES - DELETAR
app.delete('/clientes/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;
    console.log('Deletando cliente:', codigo);

    const cliente = await database.db.get(
      'SELECT codigo FROM clientes WHERE codigo = ?',
      [codigo]
    );

    if (!cliente) {
      return respond(res, { error: 'Cliente não encontrado' }, 404);
    }

    await database.db.run('DELETE FROM clientes WHERE codigo = ?', [codigo]);

    console.log('Cliente deletado:', codigo);
    respond(res, { message: 'Cliente removido' });

  } catch (error) {
    console.error('Delete client error:', error);
    respond(res, { error: 'Erro ao remover cliente' }, 500);
  }
});

// Iniciar servidor - ESCUTA EM TODOS OS IPs para permitir conexões externas
app.listen(PORT, '0.0.0.0', () => {
  console.log('\n------ API SERVER INICIADA ------');
  console.log(`Servidor rodando na porta: ${PORT}`);
  console.log(`URL: http://localhost:${PORT} (local)`);
  console.log(`Network URL: http://[IP_DA_MÁQUINA]:${PORT} (externa)`);
  console.log(`Health check: http://localhost:${PORT}/`);
  console.log('Pronto para receber requisições!');
  console.log('Servidor escuta em 0.0.0.0 - aceita conexões externas');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nParando servidor...');
  process.exit(0);
});
