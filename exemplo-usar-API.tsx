// EXEMPLO DE COMO USAR A API.tsx CRIADA
import apiService from './API';
import type { Cliente, ClienteForm } from './API';

export const exemploTodasOperacoes = async () => {
  try {
    // 1. VERIFICAR SE API ESTÁ FUNCIONANDO
    // GET /
    console.log('=== HEALTH CHECK ===');
    const health = await apiService.healthCheck();
    console.log('API Status:', health.status);
    
    // 2. LISTAR TODOS OS CLIENTES
    // GET /clientes
    console.log('\n=== LISTAR CLIENTES ===');
    const todosClientes = await apiService.getClientes();
    console.log('Clientes:', todosClientes);

    // 3. LISTAR COM FILTROS E PAGINAÇÃO
    // GET /clientes?nome=João&ativo=true&limit=10&offset=0
    console.log('\n=== FILTROS ===');
    const clientesFiltrados = await apiService.getClientes({
      nome: 'João',
      ativo: true,
      limit: 10,
      offset: 0
    });
    console.log('Clientes filtrados:', clientesFiltrados);

    // 4. BUSCAR CLIENTE ESPECÍFICO
    // GET /clientes/:codigo
    console.log('\n=== BUSCAR POR CÓDIGO ===');
    const cliente = await apiService.getCliente(1);
    console.log('Cliente encontrado:', cliente);

    // 5. CRIAR NOVO CLIENTE
    // POST /clientes
    console.log('\n=== CRIAR CLIENTE ===');
    const novoCliente: ClienteForm = {
      nome: 'Maria Santos',
      email: 'maria@email.com',
      telefone: '(11) 88888-8888',
      ativo: true
    };
    const clienteCriado = await apiService.criarCliente(novoCliente);
    console.log('Cliente criado:', clienteCriado);

    // 6. ATUALIZAR CLIENTE COMPLETO
    // PUT /clientes/:codigo
    console.log('\n=== ATUALIZAR CLIENTE COMPLETO ===');
    const clienteAtualizado = await apiService.atualizarCliente(
      clienteCriado.codigo, 
      {
        nome: 'Maria Santos Silva',
        email: 'maria.silva@email.com',
        telefone: '(11) 77777-7777',
        ativo: false
      }
    );
    console.log('Cliente atualizado completamente:', clienteAtualizado);

    // 7. ATUALIZAR CLIENTE PARCIALMENTE
    // PATCH /clientes/:codigo
    console.log('\n=== ATUALIZAR CLIENTE PARCIAL ===');
    const clienteAtualizadoParcial = await apiService.atualizarClienteParcial(
      clienteCriado.codigo,
      { telefone: '(11) 66666-6666' }
    );
    console.log('Cliente atualizado parcialmente:', clienteAtualizadoParcial);

    // 8. DELETAR CLIENTE
    // DELETE /clientes/:codigo
    console.log('\n=== DELETAR CLIENTE ===');
    const resultadoDelecao = await apiService.deletarCliente(clienteCriado.codigo);
    console.log('Resultado da deleção:', resultadoDelecao);

    // 9. USAR URL CUSTOMIZADA
    // apiService.setBaseURL('http://meu-servidor.com:8080');
    
    console.log('\n=== FINALIZADO ===');

  } catch (error) {
    console.error('Erro ao executar operações:', error);
  }
};

// EXEMPLO DE USO DENTRO DE COMPONENTE REACT
export const exemploEmComponente = () => {
  // Simulação do que seria usado no componente
  const operacoesAPI = {
    // Buscar todos os clientes
    buscarClientes: () => apiService.getClientes(),
    
    // Buscar cliente específico
    buscarCliente: (codigo: number) => apiService.getCliente(codigo),
    
    // Criar cliente
    criarCliente: (dados: ClienteForm) => apiService.criarCliente(dados),
    
    // Atualizar cliente
    atualizarCliente: (codigo: number, dados: ClienteForm) => 
      apiService.atualizarCliente(codigo, dados),
    
    // Deletar cliente
    deletarCliente: (codigo: number) => apiService.deletarCliente(codigo),
    
    // Health check
    verificarAPI: () => apiService.healthCheck()
  };

  return operacoesAPI;
};

// EXEMPLO DE MAPEAMENTO DOS ENDPOINTS
export const mapeamentoEndpoints = {
  // GET /
  health: () => apiService.healthCheck(),
  
  // GET /clientes
  listarClientes: (filtros?: any) => apiService.getClientes(filtros),
  
  // GET /clientes/:codigo
  obterCliente: (codigo: number) => apiService.getCliente(codigo),
  
  // POST /clientes {nome,email,telefone,ativo}
  criarCliente: (dados: ClienteForm) => apiService.criarCliente(dados),
  
  // PUT /clientes/:codigo (substitui campos completos)
  atualizarClienteCompleto: (codigo: number, dados: ClienteForm) => 
    apiService.atualizarCliente(codigo, dados),
  
  // PATCH /clientes/:codigo (atualização parcial)
  atualizarClienteParcial: (codigo: number, dados: Partial<ClienteForm>) => 
    apiService.atualizarClienteParcial(codigo, dados),
  
  // DELETE /clientes/:codigo
  removerCliente: (codigo: number) => apiService.deletarCliente(codigo)
};

export default exemploTodasOperacoes;
