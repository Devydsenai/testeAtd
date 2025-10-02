import axios, { AxiosResponse } from 'axios';

// Interface para Cliente
interface Cliente {
  codigo: number;
  nome: string;
  email: string;
  telefone?: string;
  ativo: boolean;
  deleted?: boolean;
  avatar?: string;
  favorito: boolean;
  avaliacao: number;
  createdAt?: string;
  updatedAt?: string;
}

// Interface para criar/atualizar Cliente
interface ClienteForm {
  nome: string;
  email: string;
  telefone?: string;
  ativo?: boolean;
  deleted?: boolean;
  avatar?: string;
  favorito?: boolean;
  avaliacao?: number;
}

// Interface para filtros de busca
interface ClienteFilters {
  limit?: number;
  offset?: number;
  nome?: string;
  email?: string;
  ativo?: boolean;
}

// Interface para resposta de health check
interface HealthResponse {
  status: string;
}

// Interface para autenticação
interface SignInData {
  email: string;
  password: string;
}

interface SignInResponse {
  token: string;
  data: {
    avatar: string;
    name?: string;
    email?: string;
  };
}

// Interface para cadastro
interface SignUpData {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

interface SignUpResponse {
  token: string;
  data: {
    avatar: string;
    name?: string;
    email?: string;
  };
  error?: string;
}

class ApiService {
  private baseURL: string;
  private axiosInstance = axios.create();

  /**
   * Detectar URL correta baseado na plataforma ReactNative
   * Método para criar configuração inteligente de endpoint
   */
  private detectPlatformURL(): string {
    try {
      console.log('Detecting React Native platform...');
      
      // Para Android Simulator: 10.0.2.2 aponta para localhost da máquina  
      // Para iOS Simulator: localhost funciona normalmente
      return 'http://10.0.2.2:3000'; // Android simulator default
    } catch (error) {
      console.log('Platform detection failed, using default mobile API URL');
      return 'http://localhost:3000';
    }
  }

  /**
   * Método para testar conectividade e ajustar baseURL automaticamente
   */
  private async testAndAdjustURL(): Promise<void> {
    const testURLs = ['http://localhost:3000', 'http://10.0.2.2:3000', 'http://127.0.0.1:3000'];
    
    for (const testURL of testURLs) {
      try {
        const tempAxios = require('axios');
        const response = await tempAxios.get(`${testURL}/`, { timeout: 2000 });
        
        if (response.status === 200) {
          console.log(`URL válida encontrada: ${testURL}`);
          this.baseURL = testURL;
          this.axiosInstance.defaults.baseURL = testURL;
          return; // URL válida encontrada
        }
      } catch {
        console.log(`URL não válida: ${testURL}`);
      }
    }
    
    // Se chegou aqui, nenhuma URL funcionou
    console.log('Nenhuma URL válida encontrada, mantendo atual');
  }

  constructor(baseURL: string = 'http://localhost:3000') {
    // Detectar URL correta da API baseado no ambiente
    console.log('Detecção de ambiente - URL fornecida:', baseURL);
    
    let finalURL = baseURL;
    
    // Se URL específico foi passada, usar
    if (baseURL !== 'http://localhost:3000') {
      finalURL = baseURL;
    } else {
      // Detectar ambiente e usar URL correta
      if (typeof window !== 'undefined') {
        try {
          // Verificar se window.location existe antes de usar
          if (window.location && typeof window.location === 'object') {
            const hostname = window.location.hostname || 'localhost';
            
            if (hostname === 'localhost' || hostname === '127.0.0.1') {
              finalURL = 'http://localhost:3000';
              console.log('Detected: Browser/Expo Web Dev. Usando:', finalURL);
            } else {
              console.log('Browser remote:', hostname);
              finalURL = 'http://localhost:3000';
            }
          } else {
            console.log('window.location unavailable, using default');
            finalURL = 'http://localhost:3000';
          }
        } catch (error) {
          console.log('Erro ao detectar ambiente browser, usando default:', error);
          finalURL = 'http://localhost:3000';
        }
      } else {
        // React Native environment
        console.log('Mobile/React Native detected');
        
        // URLs sugeridas para testar automaticamente se conectie falhar
        finalURL = 'http://localhost:3000';
        console.log('React Native - testing localhost:3000');
        console.log('URLs alternativas disponíveis se falhar:');
        console.log('   • http://10.0.2.2:3000 (Android Simulator)');
        console.log('   • http://192.168.1.8:3000 (IP da máquina)');
        console.log('   • http://127.0.0.1:3000 (Loopback local)');
      }
    }
    
    this.baseURL = finalURL;
    console.log('Inicializando API com baseURL:', finalURL);
    console.log('Tipo de ambiente:', typeof window !== 'undefined' ? 'Browser/Web' : 'React Native');
    
    // Configurações do axios
    this.axiosInstance.defaults.baseURL = finalURL;
    this.axiosInstance.defaults.timeout = 15000;
    this.axiosInstance.defaults.headers.common['Content-Type'] = 'application/json';
    
    // Headers adicionais para melhor compatibilidade
    this.axiosInstance.defaults.headers.common['Accept'] = 'application/json';
    // User-Agent removido - navegador não permite definir manualmente
    
    // Recuperar token salvo do localStorage se existir
    this.loadSavedToken();
    
    // Interceptor para logs de debug
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.log('API Request:', `${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log('API Response:', response.status, response.statusText);
        console.log('API Response data:', response.data);
        return response;
      },
      (error) => {
        console.error('API Request falhou:');
        console.error('API Error:', error.message);
        console.error('API Error Type:', error.code || 'UNKNOWN');
        console.error('API URL:', error.config?.url || 'UNKNOWN URL');
        console.error('API Method:', error.config?.method?.toUpperCase() || 'UNKNOWN METHOD');
        
        // Detectar tipo de erro específico 
        if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
          console.error('Network Error detectado');
          console.error('URL completa configurada:', this.baseURL);
          console.error('Verifique se o server está rodando em outro terminal: node server.js');
          console.error('E tente acessar: http://localhost:3000 diretamente no browser');
          console.error('Para React Native: Certifique-se que server.js escuta em 0.0.0.0:3000');
          
          // Dicas específicas baseadas na config do servidor
          console.error('SOLUÇÕES:');
          console.error('   1. Para Expo Web: deve funcionar http://localhost:3000');
          console.error('   2. Para Android Simulator: tentar http://10.0.2.2:3000');  
          console.error('   3. Para iOS Simulator: deve funcionar http://localhost:3000');
          console.error('   4. Para device físico: use http://192.168.1.8:3000 (IP da sua máquina)');
          console.error('   5. Para teste rápido no navegador: http://192.168.1.8:3000');
          
          // Ultima linha importante: como forçar URL no app
          console.error(' SOLUÇÃO ALTERNATIVA:');
          console.error('   Configure manualmente o IP na instância da API se necessário');
        } else if (error.code === 'ECONNREFUSED') {
          console.error(' Connection Refused - API server não está rodando');
        } else if (error.code === 'ETIMEDOUT') {
          console.error(' Timeout - API está muito lenta ou inacessível');
        } else {
          console.error(' Server Response Status:', error.response?.status);
          console.error(' Server Response Data:', error.response?.data);
        }
        
        console.error('Full Error Object:', error);
        throw error;
      }
    );
  }

  /**
   * Health Check - Verificar se API está funcionando
   * GET /
   */
  async healthCheck(): Promise<HealthResponse> {
    try {
      console.log('Executando health check...');
      console.log('URL completa:', this.baseURL + '/');
      console.log('Headers config:', this.axiosInstance.defaults.headers);
      
      const response: AxiosResponse<HealthResponse> = await this.axiosInstance.get('/');
      console.log('Health check successful:', response.status);
      console.log('Response data:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Health check failed:');
      console.error('Error details:', error.message);
      console.error('Error code:', error.code);
      console.error('Error config:', error.config);
      
      if (error.message === 'Network Error') {
        console.error('Network error details - Base URL may be incorrect');
        console.log('Tentando URLs alternativas automaticamente...');
        
        // URLs alternativas para testar automaticamente
        const alternativeURLs = [
          'http://localhost:3000',
          'http://127.0.0.1:3000', 
          'http://10.0.2.2:3000',
          'http://192.168.1.8:3000'
        ];
        
        // Evita testar a URL atual que falhou
        const urlsToTest = alternativeURLs.filter(url => url !== this.baseURL);
        
        console.log('Testando URLs alternativas:', urlsToTest);
        
        for (const url of urlsToTest) {
          try {
            console.log(`Testando URL: ${url}`);
            
            // Criar instância temporária para testar
            const testAxios = axios.create({
              baseURL: url,
              timeout: 5000,
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'Expo-ReactNative-API-Client-Health'
              }
            });
            
            const testResponse = await testAxios.get('/');
            console.log(`URL funcional encontrada: ${url}`);
            
            // Atualizar prática para usar URL que funcionou
            this.baseURL = url;
            this.axiosInstance.defaults.baseURL = url;
            console.log(`API reconectada automaticamente para: ${url}`);
            
            return testResponse.data;
          } catch (testError: any) {
            console.log(`URL ${url} também falhou: ${testError.message}`);
            continue;
          }
        }
        
        // Se nenhuma URL funcionou, fornecer instruções mais específicas 
        console.error(` Todas as URLs testadas falharam:`);
        console.error(`   URL original: ${this.baseURL}`);
        console.error(`   URLs testadas: ${urlsToTest.join(', ')}`);
        
        throw new Error(`API não está acessível em nenhuma URL testada. Servidor pode não estar rodando.

Para resolver este problema:
1. Certifique-se que o servidor está rodando: node server.js  
2. Para Expo Web: tente http://localhost:3000
3. Para Android Simulator: tente http://10.0.2.2:3000
4. Para device físico: use http://192.168.1.8:3000  
5. Teste no browser: http://192.168.1.8:3000
6. Confirme que server.js está executando com bind 0.0.0.0`);
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error('Conexão recusada - API server não está rodando. Execute: node server.js');
      } else if (error.code === 'ETIMEDOUT') {
        throw new Error('Timeout - API demorou mais de 15 segundos para responder');
      }
      
      throw new Error(`Falha no health check: ${error.message || 'Erro desconhecido'}`);
    }
  }

  /**
   * Listar todos os clientes com paginação e filtros opcionais
   * GET /clientes
   */
  async getClientes(filters?: ClienteFilters): Promise<Cliente[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.limit !== undefined) params.append('limit', filters.limit.toString());
      if (filters?.offset !== undefined) params.append('offset', filters.offset.toString());
      if (filters?.nome) params.append('nome', filters.nome);
      if (filters?.email) params.append('email', filters.email);
      if (filters?.ativo !== undefined) params.append('ativo', filters.ativo.toString());

      // Adicionar email do usuário no header
      const userEmail = this.getCurrentUserEmail();
      if (userEmail) {
        this.axiosInstance.defaults.headers.common['x-user-email'] = userEmail;
      }

      const response: AxiosResponse<Cliente[]> = await this.axiosInstance.get(`/clientes?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      throw new Error('Erro ao buscar clientes');
    }
  }

  /**
   * Buscar cliente por código
   * GET /clientes/:codigo
   */
  async getCliente(codigo: number): Promise<Cliente> {
    try {
      // Adicionar email do usuário no header
      const userEmail = this.getCurrentUserEmail();
      if (userEmail) {
        this.axiosInstance.defaults.headers.common['x-user-email'] = userEmail;
      }

      const response: AxiosResponse<Cliente> = await this.axiosInstance.get(`/clientes/${codigo}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error('Cliente não encontrado');
      }
      console.error('Erro ao buscar cliente:', error);
      throw new Error('Erro ao buscar cliente');
    }
  }

  /**
   * Criar novo cliente
   * POST /clientes
   */
  async criarCliente(dados: ClienteForm): Promise<Cliente> {
    try {
      // Adicionar email do usuário no header
      const userEmail = this.getCurrentUserEmail();
      if (userEmail) {
        this.axiosInstance.defaults.headers.common['x-user-email'] = userEmail;
      }

      const response: AxiosResponse<Cliente> = await this.axiosInstance.post('/clientes', dados);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          throw new Error('E-mail já cadastrado');
        }
        if (error.response?.status === 400) {
          throw new Error(`Dados inválidos: ${error.response.data.error || 'Verifique os campos obrigatórios'}`);
        }
      }
      console.error('Erro ao criar cliente:', error);
      throw new Error('Erro ao criar cliente');
    }
  }

  /**
   * Atualizar cliente completamente
   * PUT /clientes/:codigo
   */
  async atualizarCliente(codigo: number, dados: ClienteForm): Promise<Cliente> {
    try {
      // Adicionar email do usuário no header
      const userEmail = this.getCurrentUserEmail();
      if (userEmail) {
        this.axiosInstance.defaults.headers.common['x-user-email'] = userEmail;
      }

      const response: AxiosResponse<Cliente> = await this.axiosInstance.put(`/clientes/${codigo}`, dados);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('Cliente não encontrado');
        }
        if (error.response?.status === 409) {
          throw new Error('E-mail já cadastrado');
        }
        if (error.response?.status === 400) {
          throw new Error(`Dados inválidos: ${error.response.data.error || 'Verifique os campos obrigatórios'}`);
        }
      }
      console.error('Erro ao atualizar cliente:', error);
      throw new Error('Erro ao atualizar cliente');
    }
  }

  /**
   * Atualizar cliente parcialmente
   * PATCH /clientes/:codigo
   */
  async atualizarClienteParcial(codigo: number, dados: Partial<ClienteForm>): Promise<Cliente> {
    try {
      // Adicionar email do usuário no header
      const userEmail = this.getCurrentUserEmail();
      if (userEmail) {
        this.axiosInstance.defaults.headers.common['x-user-email'] = userEmail;
      }

      const response: AxiosResponse<Cliente> = await this.axiosInstance.patch(`/clientes/${codigo}`, dados);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('Cliente não encontrado');
        }
        if (error.response?.status === 409) {
          throw new Error('E-mail já cadastrado');
        }
      }
      console.error('Erro ao atualizar cliente:', error);
      throw new Error('Erro ao atualizar cliente');
    }
  }

  /**
   * Deletar cliente
   * DELETE /clientes/:codigo
   */
  async deletarCliente(codigo: number): Promise<{ message: string }> {
    try {
      console.log('API: Iniciando DELETE request...');
      console.log('API: URL:', `/clientes/${codigo}`);
      console.log('API: Base URL completa:', this.baseURL);
      
      // Adicionar email do usuário no header
      const userEmail = this.getCurrentUserEmail();
      if (userEmail) {
        this.axiosInstance.defaults.headers.common['x-user-email'] = userEmail;
      }
      
      const response: AxiosResponse<{ message: string }> = await this.axiosInstance.delete(`/clientes/${codigo}`);
      
      console.log('API: DELETE realizado com sucesso!');
      console.log('API: Status:', response.status);
      console.log('API: Response data:', response.data);
      console.log('API: Headers:', response.headers);
      
      return response.data;
    } catch (error) {
      console.error('API: Erro completo ao deletar cliente:', error);
      
      if (axios.isAxiosError(error)) {
        console.error(' API: Axios Error detected');
        console.error(' API: Status code:', error.response?.status);
        console.error(' API: Response data:', error.response?.data);
        console.error(' API: Request config:', error.config);
        console.error(' API: Headers:', error.response?.headers);
        
        if (error.response?.status === 404) {
          console.log('API: Cliente não encontrado (404)');
          throw new Error('Cliente não encontrado');
        }
        
        if (error.response?.status === 500) {
          console.log('API: Erro do servidor (500)');
          throw new Error('Erro interno do servidor');
        }
        
        // Mostrar erro do servidor se existir
        if (error.response?.data?.error) {
          console.log('API: Server error response:', error.response.data.error);
          throw new Error(error.response.data.error);
        }
      }
      
      // Erro de conexão
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('API: Network check:', errorMessage);
      
      if (errorMessage.includes('Network Error')) {
        console.log('API: Network error detected');
        throw new Error('Erro de conexão. Verifique se a API está funcionando.');
      }
      
      console.error(' API: Unexpected error:', errorMessage);
      throw new Error(`Erro ao deletar cliente: ${errorMessage || 'Erro desconhecido'}`);
    }
  }

  /**
   * Método para definir nova URL base
   */
  setBaseURL(newBaseURL: string): void {
    this.baseURL = newBaseURL;
    this.axiosInstance.defaults.baseURL = newBaseURL;
  }

  /**
   * Método para obter URL base atual
   */
  getBaseURL(): string {
    return this.baseURL;
  }

  /**
   * Carregar token salvo do localStorage
   */
  private loadSavedToken(): void {
    try {
      // Verifica se estamos no navegador (React Native Web ou desenvolvimento)
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedToken = window.localStorage.getItem('auth_token');
        if (savedToken) {
          console.log('Token encontrado no localStorage');
          this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        }
      }
    } catch (error) {
      console.log('Não foi possível recuperar token salvo:', error);
    }
  }

  /**
   * Salvar token no localStorage
   */
  private saveToken(token: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('auth_token', token);
        console.log('Token salvo no localStorage');
      }
    } catch (error) {
      console.log('Não foi possível salvar token:', error);
    }
  }

  /**
   * Remover token do localStorage
   */
  private clearToken(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const existingToken = window.localStorage.getItem('auth_token');
        window.localStorage.removeItem('auth_token');
        console.log('Token removido do localStorage:', existingToken ? 'era' : 'não existia');
        
        // Verificar se realmente foi removido
        const verifyRemoval = window.localStorage.getItem('auth_token');
        console.log('Token removido com sucesso:', verifyRemoval === null);
      } else {
        console.log('localStorage não disponível');
      }
    } catch (error) {
      console.log('Erro ao remover token:', error);
    }
  }

  /**
   * Método para definir token de autenticação nos headers
   */
  setAuthToken(token: string): void {
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    this.saveToken(token);
    console.log('Token de auth definido e salvo');
  }

  /**
   * Método para remover token de autenticação dos headers
   */
  removeAuthToken(): void {
    const existingAuth = this.axiosInstance.defaults.headers.common['Authorization'];
    console.log('🧹 Removendo auth token:', existingAuth || 'nenhum encontrado');
    
    // 1. Remover dos headers do axios
    delete this.axiosInstance.defaults.headers.common['Authorization'];
    delete this.axiosInstance.defaults.headers.common['x-user-email'];
    
    // 2. Limpar localStorage
    this.clearToken();
    this.clearUserEmail();
    
    // 3. Forçar limpeza adicional de qualquer cache
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        // Remover qualquer token residual
        window.localStorage.removeItem('auth_token');
        window.localStorage.removeItem('token');
        window.localStorage.removeItem('user_token');
        window.localStorage.removeItem('user_email');
        
        // Verificar se realmente foi limpo
        const verifyClean = window.localStorage.getItem('auth_token');
        const verifyEmailClean = window.localStorage.getItem('user_email');
        console.log('localStorage completamente limpo:', verifyClean === null && verifyEmailClean === null);
      }
    } catch (error) {
      console.log('Erro ao limpar localStorage:', error);
    }
    
    // 4. Verificar se foi removido dos headers
    const newAuth = this.axiosInstance.defaults.headers.common['Authorization'];
    const newEmail = this.axiosInstance.defaults.headers.common['x-user-email'];
    console.log('Auth token removido dos headers:', newAuth === undefined);
    console.log('User email removido dos headers:', newEmail === undefined);
    console.log('Logout completo - token e email removidos de todos os locais');
  }

  /**
   * Obter email do usuário atual do localStorage
   */
  private getCurrentUserEmail(): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem('user_email');
      }
      return null;
    } catch (error) {
      console.log('Erro ao obter email do usuário:', error);
      return null;
    }
  }

  /**
   * Salvar email do usuário no localStorage
   */
  private saveUserEmail(email: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('user_email', email);
        console.log('Email do usuário salvo:', email);
      }
    } catch (error) {
      console.log('Erro ao salvar email do usuário:', error);
    }
  }

  /**
   * Remover email do usuário do localStorage
   */
  private clearUserEmail(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('user_email');
        console.log('Email do usuário removido');
      }
    } catch (error) {
      console.log('Erro ao remover email do usuário:', error);
    }
  }

  /**
   * Método para verificar se usuário está autenticado
   */
  async verifyAuthentication(): Promise<boolean> {
    try {
      console.log('Verificando autenticação...');
      
      // 1. Verificar se existe token no localStorage
      let hasToken = false;
      let savedToken = null;
      
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          savedToken = window.localStorage.getItem('auth_token');
          hasToken = !!savedToken;
          console.log('Token no localStorage:', savedToken ? 'presente' : 'ausente');
          
          if (savedToken && savedToken.trim() !== '') {
            // 2. Confirmar que o token está ativo nos headers
            const currentAuth = this.axiosInstance.defaults.headers.common['Authorization'];
            const isTokenActive = currentAuth === `Bearer ${savedToken}`;
            console.log('Token nos headers:', isTokenActive ? 'presente' : 'ausente');
            
            if (!isTokenActive) {
              // 3. Se token existe mas não está nos headers, ativar
              this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
              console.log('Token reativado nos headers');
            }
            
            // 4. Verificação adicional - testar se o token é válido fazendo uma chamada real
            try {
              console.log('Testando validade do token com chamada real...');
              const testResponse = await this.axiosInstance.get('/clientes');
              console.log('Token válido - API respondeu:', testResponse.status);
              return true;
            } catch (testError: any) {
              console.log('Token inválido ou expirado:', testError.response?.status);
              if (testError.response?.status === 401 || testError.response?.status === 403) {
                console.log('Token inválido detectado - limpando...');
                this.removeAuthToken();
                return false;
              }
              // Se for outro erro (network, etc), considerar token como válido
              return true;
            }
          }
        }
      } catch (storageError) {
        console.log('Erro ao verificar localStorage:', storageError);
      }
      
      console.log('Usuário não autenticado - nenhum token encontrado');
      return false;
      
    } catch (error) {
      console.log('Falha na verificação de autenticação:', error);
      return false;
    }
  }

  /**
   * Método de login de usuário
   */
  async signIn(credentials: SignInData): Promise<SignInResponse> {
    try {
      const response: AxiosResponse<SignInResponse> = await this.axiosInstance.post('/auth/login', {
        email: credentials.email,
        password: credentials.password
      });
      
      // Salvar email do usuário para usar nas requisições
      this.saveUserEmail(credentials.email);
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('E-mail ou senha incorretos');
        }
        if (error.response?.status === 404) {
          throw new Error('Usuário não encontrado');
        }
        // Verificar se há mensagem de erro específica do servidor
        if (error.response?.data?.error) {
          if (error.response.data.error === 'Usuário não encontrado') {
            throw new Error('Usuário não encontrado');
          } else if (error.response.data.error === 'Senha incorreta') {
            throw new Error('E-mail ou senha incorretos');
          } else {
            throw new Error(error.response.data.error);
          }
        }
      }
      console.error('Erro no login:', error);
      throw new Error('Erro ao fazer login');
    }
  }

  /**
   * Método de cadastro de usuário
   */
  async signUp(data: SignUpData): Promise<SignUpResponse> {
    try {
      const response: AxiosResponse<SignUpResponse> = await this.axiosInstance.post('/auth/register', {
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        password: data.password
      });
      
      // Salvar email do usuário para usar nas requisições
      this.saveUserEmail(data.email);
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          throw new Error('E-mail já cadastrado');
        }
        if (error.response?.status === 400) {
          throw new Error('Dados inválidos - verifique os campos');
        }
      }
      console.error('Erro no cadastro:', error);
      throw new Error('Erro ao criar conta');
    }
  }

  /**
   * Atualizar favorito de um cliente
   */
  async toggleFavoriteCliente(codigo: number, favorito: boolean): Promise<Cliente> {
    try {
      const userEmail = this.getCurrentUserEmail();
      if (userEmail) {
        this.axiosInstance.defaults.headers.common['x-user-email'] = userEmail;
      }

      const response: AxiosResponse<Cliente> = await this.axiosInstance.patch(`/clientes/${codigo}`, {
        favorito
      });
      
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar favorito:', error);
      throw new Error('Erro ao atualizar favorito');
    }
  }

  /**
   * Atualizar avaliação de um cliente
   */
  async updateAvaliacaoCliente(codigo: number, avaliacao: number): Promise<Cliente> {
    try {
      const userEmail = this.getCurrentUserEmail();
      if (userEmail) {
        this.axiosInstance.defaults.headers.common['x-user-email'] = userEmail;
      }

      const response: AxiosResponse<Cliente> = await this.axiosInstance.patch(`/clientes/${codigo}`, {
        avaliacao
      });
      
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar avaliação:', error);
      throw new Error('Erro ao atualizar avaliação');
    }
  }
}

// Configurar URL da API baseada no ambiente
const getBaseURL = () => {
  // Você pode configurar aqui uma URL específica ou variável de ambiente
  // Exemplo: process.env.API_URL ou uma URL fixa
  const API_URL = 'http://localhost:3000'; // ou sua URL da API
  return API_URL;
};

// Exportar instância única do serviço
export const apiService = new ApiService(getBaseURL());

// Exportar a classe e interfaces para uso individual
export { ApiService, type Cliente, type ClienteForm, type ClienteFilters, type SignInData, type SignInResponse, type SignUpData, type SignUpResponse };

// Export default da instância
export default apiService;
