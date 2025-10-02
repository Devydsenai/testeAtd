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
        email TEXT NOT NULL,
        telefone TEXT,
        ativo BOOLEAN DEFAULT 1,
        deleted BOOLEAN DEFAULT 0,
        user_id INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `);

    // Adicionar colunas se não existirem (para bancos existentes)
    const columns = await db.all(`PRAGMA table_info(clientes);`);
    const hasDeleted = columns.some(col => col.name === 'deleted');
    const hasUserId = columns.some(col => col.name === 'user_id');
    
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
    
    if (!hasUserId) {
      try {
        await db.exec(`ALTER TABLE clientes ADD COLUMN user_id INTEGER DEFAULT 1;`);
        console.log('Coluna "user_id" adicionada à tabela clientes');
      } catch (error) {
        console.log('Erro ao adicionar coluna "user_id":', error.message);
      }
    } else {
      console.log('Coluna "user_id" já existe na tabela clientes');
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

// Middleware para extrair usuário do token (simplificado para este exemplo)
const extractUserFromToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autorização necessário' });
    }
    
    const token = authHeader.substring(7);
    
    // Para este exemplo, vamos usar um sistema simples baseado no email
    // Em produção, você deveria usar JWT real
    const userEmail = req.headers['x-user-email'];
    if (!userEmail) {
      return res.status(401).json({ error: 'Email do usuário necessário' });
    }
    
    // Buscar usuário pelo email
    database.db.get('SELECT id FROM users WHERE email = ?', [userEmail])
      .then(user => {
        if (!user) {
          return res.status(401).json({ error: 'Usuário não encontrado' });
        }
        req.userId = user.id;
        next();
      })
      .catch(error => {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
      });
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
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

// 4. CLIENTES - LISTAR TODOS (FILTRADO POR USUÁRIO)
app.get('/clientes', extractUserFromToken, async (req, res) => {
  try {
    const userId = req.userId;
    console.log('Listando clientes para usuário:', userId);
    const { nome, email, ativo, limit = 100, offset = 0 } = req.query;

    let query = 'SELECT * FROM clientes WHERE deleted = 0 AND user_id = ?';
    const params = [userId];

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
    console.log(`Encontrados ${clientes.length} clientes para usuário ${userId}`);
    respond(res, clientes);

  } catch (error) {
    console.error('List clients error:', error);
    respond(res, { error: 'Erro ao buscar clientes' }, 500);
  }
});

// 5. CLIENTES - BUSCAR POR CÓDIGO (FILTRADO POR USUÁRIO)
app.get('/clientes/:codigo', extractUserFromToken, async (req, res) => {
  try {
    const { codigo } = req.params;
    const userId = req.userId;
    console.log('Buscando cliente:', codigo, 'para usuário:', userId);

    const cliente = await database.db.get(
      'SELECT * FROM clientes WHERE codigo = ? AND user_id = ?',
      [codigo, userId]
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

// 6. CLIENTES - CRIAR (ASSOCIADO AO USUÁRIO)
app.post('/clientes', extractUserFromToken, async (req, res) => {
  try {
    const { nome, email, telefone, ativo = false } = req.body;
    const userId = req.userId;
    console.log('Criando cliente:', { nome, email, telefone, userId });

    if (!nome || !email) {
      return respond(res, { error: 'Nome e email são obrigatórios' }, 400);
    }

    // Verificar se email já existe para este usuário
    const existing = await database.db.get(
      'SELECT codigo FROM clientes WHERE email = ? AND user_id = ?',
      [email, userId]
    );

    if (existing) {
      return respond(res, { error: 'E-mail já cadastrado' }, 409);
    }

    const result = await database.db.run(
      'INSERT INTO clientes (nome, email, telefone, ativo, user_id) VALUES (?, ?, ?, ?, ?)',
      [nome, email, telefone || null, ativo ? 1 : 0, userId]
    );

    const cliente = await database.db.get(
      'SELECT * FROM clientes WHERE codigo = ?',
      [result.lastID]
    );

    console.log('Cliente criado:', cliente.codigo, 'para usuário:', userId);
    respond(res, cliente, 201);

  } catch (error) {
    console.error('Create client error:', error);
    respond(res, { error: 'Erro ao criar cliente' }, 500);
  }
});

// 7. CLIENTES - ATUALIZAR (FILTRADO POR USUÁRIO)
app.put('/clientes/:codigo', extractUserFromToken, async (req, res) => {
  try {
    const { codigo } = req.params;
    const { nome, email, telefone, ativo } = req.body;
    const userId = req.userId;
    console.log('Atualizando cliente:', codigo, 'para usuário:', userId);

    const cliente = await database.db.get(
      'SELECT codigo FROM clientes WHERE codigo = ? AND user_id = ?',
      [codigo, userId]
    );

    if (!cliente) {
      return respond(res, { error: 'Cliente não encontrado' }, 404);
    }

    await database.db.run(
      'UPDATE clientes SET nome = ?, email = ?, telefone = ?, ativo = ?, updatedAt = CURRENT_TIMESTAMP WHERE codigo = ? AND user_id = ?',
      [nome, email, telefone || null, ativo ? 1 : 0, codigo, userId]
    );

    const clienteAtualizado = await database.db.get(
      'SELECT * FROM clientes WHERE codigo = ?',
      [codigo]
    );

    console.log('Cliente atualizado:', codigo, 'para usuário:', userId);
    respond(res, clienteAtualizado);

  } catch (error) {
    console.error('Update client error:', error);
    respond(res, { error: 'Erro ao atualizar cliente' }, 500);
  }
});

// 8. CLIENTES - ATUALIZAR PARCIAL (FILTRADO POR USUÁRIO)
app.patch('/clientes/:codigo', extractUserFromToken, async (req, res) => {
  try {
    const { codigo } = req.params;
    const userId = req.userId;
    console.log('Patch cliente:', codigo, req.body, 'para usuário:', userId);

    const cliente = await database.db.get(
      'SELECT codigo FROM clientes WHERE codigo = ? AND user_id = ?',
      [codigo, userId]
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

    query += setClauses.join(', ') + ', updatedAt = CURRENT_TIMESTAMP WHERE codigo = ? AND user_id = ?';
    values.push(codigo, userId);

    await database.db.run(query, values);

    const clienteAtualizado = await database.db.get(
      'SELECT * FROM clientes WHERE codigo = ?',
      [codigo]
    );

    console.log('Cliente patch atualizado:', codigo, 'para usuário:', userId);
    respond(res, clienteAtualizado);

  } catch (error) {
    console.error('Patch client error:', error);
    respond(res, { error: 'Erro ao atualizar cliente' }, 500);
  }
});

// 9. CLIENTES - DELETAR (FILTRADO POR USUÁRIO)
app.delete('/clientes/:codigo', extractUserFromToken, async (req, res) => {
  try {
    const { codigo } = req.params;
    const userId = req.userId;
    console.log('Deletando cliente:', codigo, 'para usuário:', userId);

    const cliente = await database.db.get(
      'SELECT codigo FROM clientes WHERE codigo = ? AND user_id = ?',
      [codigo, userId]
    );

    if (!cliente) {
      return respond(res, { error: 'Cliente não encontrado' }, 404);
    }

    await database.db.run('DELETE FROM clientes WHERE codigo = ? AND user_id = ?', [codigo, userId]);

    console.log('Cliente deletado:', codigo, 'para usuário:', userId);
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
