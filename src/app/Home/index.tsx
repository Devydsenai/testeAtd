import React, { useState, useEffect } from 'react';
import { Alert, FlatList, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../core/core';
import apiService, { type Cliente, type ClienteForm } from '../../../API';
import ClienteItem from '../../Components/ClienteItem';

// Importar ícones SVG
import HomeIcon from '../../assets/home.svg';
import SearchIcon from '../../assets/search.svg';
import ListaIcon from '../../assets/lista.svg';

import {
    Container,
    Header,
    Title,
    LogoutButton,
    SearchContainer,
    SearchInputContainer,
    SearchInput,
    ClientList,
    EmptyState,
    EmptyText,
    LoadingContainer,
    ClientCard,
    ClientInfo,
    ClientName,
    ClientEmail,
    ClientPhone,
    ClientActions,
    ActionButton,
    ActionButtonText,
    DeleteButton,
    ActivateButton,
    RestoreButton,
    ModalContainer,
    ModalContent,
    ModalOverlay,
    ModalHeader,
    ModalTitle,
    ModalFormContainer,
    ModalInput,
    ModalButtonContainer,
    ModalButton,
    ModalButtonText,
    CreateButton,
    CreateButtonText,
    SearchButton,
    SearchButtonText
} from './styles';

export default function Home() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
    
    // Estados para formulário modal
    const [showModal, setShowModal] = useState(false);
    const [editingClient, setEditingClient] = useState<Cliente | null>(null);
    const [formData, setFormData] = useState<ClienteForm>({
        nome: '',
        email: '',
        telefone: '',
        ativo: true,
        avatar: '',
        favorito: false,
        avaliacao: 0
    });

    // Carregar clientes iniciais
    useEffect(() => {
        loadClientes();
    }, []);

    // Recarregar clientes quando a tela recebe foco
    useFocusEffect(
        React.useCallback(() => {
            loadClientes();
        }, [])
    );

    // Debug: Log quando clientes mudam
    useEffect(() => {
        console.log('📊 Estado clientes atualizado:', {
            total: clientes.length,
            deletados: clientes.filter(c => c.deleted).length,
            ativos: clientes.filter(c => !c.deleted).length,
            clientes: clientes.map(c => ({ nome: c.nome, codigo: c.codigo, deleted: c.deleted }))
        });
    }, [clientes]);

    // Filtrar clientes baseado no termo de busca
    useEffect(() => {
        console.log('Busca executada:', { searchTerm, totalClientes: clientes.length });
        
        if (searchTerm.trim() === '') {
            // Sem busca: mostrar apenas clientes não deletados
            const clientesAtivos = clientes.filter(cliente => !cliente.deleted);
            console.log('Sem busca - clientes ativos:', clientesAtivos.length);
            setFilteredClientes(clientesAtivos);
        } else {
            // Com busca: mostrar TODOS os clientes que correspondem (incluindo deletados)
            const filtered = clientes.filter(cliente => 
                cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cliente.telefone?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            console.log('Busca encontrou:', filtered.length, 'clientes');
            console.log('Clientes encontrados:', filtered.map(c => ({ nome: c.nome, codigo: c.codigo, deleted: c.deleted })));
            setFilteredClientes(filtered);
        }
    }, [searchTerm, clientes]);

    const loadClientes = async () => {
        try {
            console.log('Carregando clientes da API...');
            setLoading(true);
            const clientesData = await apiService.getClientes();
            console.log('Clientes recebidos da API:', clientesData.length);
            
            // Forçar conversão correta dos campos boolean
            const clientesProcessados = clientesData.map(cliente => ({
                ...cliente,
                ativo: Boolean(cliente.ativo),
                deleted: Boolean(cliente.deleted)
            }));
            
            console.log('Clientes processados:', clientesProcessados.length);
            console.log('Clientes deletados encontrados:', clientesProcessados.filter(c => c.deleted).length);
            
            // Carregar TODOS os clientes (incluindo deletados) para busca funcionar
            setClientes(clientesProcessados);
            // Filtrar apenas clientes não deletados para exibição padrão
            const clientesAtivos = clientesProcessados.filter(cliente => !cliente.deleted);
            setFilteredClientes(clientesAtivos);
            
            console.log('Clientes ativos para exibição:', clientesAtivos.length);
            
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
            Alert.alert('Erro', 'Erro ao carregar lista de clientes');
        } finally {
            setLoading(false);
        }
    };

    // Funções para CRUD de clientes
    const resetForm = () => {
        setFormData({
            nome: '',
            email: '',
            telefone: '',
            ativo: true,
            avatar: '',
            favorito: false,
            avaliacao: 0
        });
        setEditingClient(null);
    };

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (cliente: Cliente) => {
        setFormData({
            nome: cliente.nome,
            email: cliente.email,
            telefone: cliente.telefone || '',
            ativo: cliente.ativo,
            avatar: cliente.avatar || '',
            favorito: cliente.favorito,
            avaliacao: cliente.avaliacao
        });
        setEditingClient(cliente);
        setShowModal(true);
    };

    const handleSaveCliente = async () => {
        // Validação básica dos campos obrigatórios
        if (!formData.nome.trim() || !formData.email.trim()) {
            Alert.alert('Atenção', 'Os campos Nome e Email são obrigatórios!');
            return;
        }

        try {
            setLoading(true);
            
            if (editingClient) {
                // Atualizar cliente existente
                await apiService.atualizarCliente(editingClient.codigo, formData);
                Alert.alert('Sucesso', 'Cliente atualizado com sucesso!');
            } else {
                // Criar novo cliente como INATIVO por padrão
                await apiService.criarCliente({
                    ...formData,
                    ativo: false  // ← NOVO: Cliente criado como inativo
                });
                
                Alert.alert(
                    'Cliente Criado', 
                    'Cliente criado com sucesso! Ele ficará inativo até ser ativado na lista de clientes.',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                // Navegar para ListaDeClient após criar
                                navigation.navigate('ListaDeClient');
                            }
                        }
                    ]
                );
                setSearchTerm(''); // Limpar busca quando criar cliente
            }
            
            setShowModal(false);
            resetForm();
            loadClientes();
        } catch (error: any) {
            console.error('Erro ao salvar cliente:', error);
            Alert.alert('Erro', error.message || 'Erro ao salvar cliente');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchCreateCliente = async () => {
        const trimmedSearch = searchTerm.trim();
        if (!trimmedSearch) return;

        try {
            // Primeiro verifica se já existe um cliente com esse nome ou email 
            const existingClient = clientes.find(cliente => 
                cliente.nome.toLowerCase() === trimmedSearch.toLowerCase() ||
                cliente.email.toLowerCase() === trimmedSearch.toLowerCase()
            );

            if (existingClient) {
                Alert.alert(
                    'Cliente Encontrado',
                    `Cliente "${existingClient.nome}" já está cadastrado`,
                    [
                        { text: 'Cancelar', style: 'cancel' },
                        { text: 'Editar', onPress: () => openEditModal(existingClient) }
                    ]
                );
                return;
            }

            // Se não existe, preparar modal para criar
            const emailRegex = /^[A-Za-z0-9+_.-]+@([A-Za-z0-9.-]+\.[A-Za-z]{2,})$/;
            const isEmail = emailRegex.test(trimmedSearch);
            
            setFormData({
                nome: isEmail ? '' : trimmedSearch,
                email: isEmail ? trimmedSearch : '',
                telefone: '',
                ativo: true
            });
            setEditingClient(null);
            setShowModal(true);
        } catch (error) {
            console.error('Erro ao buscar cliente:', error);
        }
    };


    // Desativar cliente
    const handleDeactivateClient = async (clienteId: number) => {
        try {
            setLoading(true);
            
            await apiService.atualizarClienteParcial(clienteId, { ativo: false });
            
            // Atualizar estado local
            const updatedClientes = clientes.map(cliente =>
                cliente.codigo === clienteId ? { ...cliente, ativo: false } : cliente
            );
            const updatedFilteredClientes = filteredClientes.map(cliente =>
                cliente.codigo === clienteId ? { ...cliente, ativo: false } : cliente
            );
            
            setClientes(updatedClientes);
            setFilteredClientes(updatedFilteredClientes);
            
            Alert.alert(
                'Cliente Desativado', 
                'Cliente desativado com sucesso! Agora ele aparece na aba "Inativos" da Lista de Clientes.'
            );
            
        } catch (error: any) {
            console.error('Erro ao desativar cliente:', error);
            Alert.alert('Erro', 'Não foi possível desativar o cliente');
        } finally {
            setLoading(false);
        }
    };

    // Ativar cliente
    const handleActivateClient = async (clienteId: number) => {
        try {
            setLoading(true);
            
            await apiService.atualizarClienteParcial(clienteId, { ativo: true });
            
            // Atualizar estado local
            const updatedClientes = clientes.map(cliente =>
                cliente.codigo === clienteId ? { ...cliente, ativo: true } : cliente
            );
            const updatedFilteredClientes = filteredClientes.map(cliente =>
                cliente.codigo === clienteId ? { ...cliente, ativo: true } : cliente
            );
            
            setClientes(updatedClientes);
            setFilteredClientes(updatedFilteredClientes);
            
            Alert.alert(
                'Cliente Ativado', 
                'Cliente ativado com sucesso!'
            );
            
        } catch (error: any) {
            console.error('Erro ao ativar cliente:', error);
            Alert.alert('Erro', 'Não foi possível ativar o cliente');
        } finally {
            setLoading(false);
        }
    };

    // Soft delete cliente
    const handleSoftDelete = async (clienteId: number) => {
        try {
            setLoading(true);
            
            await apiService.atualizarClienteParcial(clienteId, { deleted: true });
            
            // Atualizar estado local - marcar como deletado mas manter na lista
            const updatedClientes = clientes.map(cliente =>
                cliente.codigo === clienteId ? { ...cliente, deleted: true } : cliente
            );
            
            setClientes(updatedClientes);
            
            // Se não há busca ativa, remover da lista filtrada (pois não deve aparecer na tela principal)
            if (!searchTerm.trim()) {
                const updatedFilteredClientes = filteredClientes.filter(cliente => cliente.codigo !== clienteId);
                setFilteredClientes(updatedFilteredClientes);
            }
            
            Alert.alert(
                'Cliente Deletado', 
                'Cliente deletado com sucesso! Ele aparece na aba "Deletados" da Lista de Clientes.'
            );
            
        } catch (error: any) {
            console.error('Erro ao deletar cliente:', error);
            Alert.alert('Erro', 'Não foi possível deletar o cliente');
        } finally {
            setLoading(false);
        }
    };

    // Restaurar cliente deletado
    const handleRestoreClient = async (clienteId: number) => {
        try {
            setLoading(true);
            
            await apiService.atualizarClienteParcial(clienteId, { deleted: false, ativo: true });
            
            // Atualizar estado local - marcar como restaurado
            const updatedClientes = clientes.map(cliente =>
                cliente.codigo === clienteId ? { ...cliente, deleted: false, ativo: true } : cliente
            );
            
            setClientes(updatedClientes);
            
            // Se não há busca ativa, adicionar à lista filtrada (pois agora é ativo)
            if (!searchTerm.trim()) {
                const updatedFilteredClientes = [...filteredClientes, updatedClientes.find(c => c.codigo === clienteId)!];
                setFilteredClientes(updatedFilteredClientes);
            }
            
            Alert.alert(
                'Cliente Restaurado', 
                'Cliente restaurado com sucesso! Ele aparece na lista de clientes ativos.'
            );
            
        } catch (error: any) {
            console.error('Erro ao restaurar cliente:', error);
            Alert.alert('Erro', 'Não foi possível restaurar o cliente');
        } finally {
            setLoading(false);
        }
    };

    // Deletar cliente definitivamente
    const handleDeleteClient = async (clienteId: number) => {
        try {
            setLoading(true);
            const result = await apiService.deletarCliente(clienteId);
            
            // Atualizar estado local - remover cliente completamente
            const updatedClientes = clientes.filter(cliente => cliente.codigo !== clienteId);
            const updatedFilteredClientes = filteredClientes.filter(cliente => cliente.codigo !== clienteId);
            
            setClientes(updatedClientes);
            setFilteredClientes(updatedFilteredClientes);
            
            Alert.alert(
                'Cliente Deletado', 
                'Cliente deletado definitivamente do sistema.'
            );
            
        } catch (error: any) {
            console.error('Erro ao deletar cliente:', error);
            Alert.alert('Erro', `Não foi possível deletar o cliente: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFavorite = async (codigo: number, favorito: boolean) => {
        try {
            await apiService.toggleFavoriteCliente(codigo, favorito);
            await loadClientes();
        } catch (error) {
            console.error('Erro ao atualizar favorito:', error);
            Alert.alert('Erro', 'Erro ao atualizar favorito');
        }
    };

    const handleRatingChange = async (codigo: number, avaliacao: number) => {
        try {
            await apiService.updateAvaliacaoCliente(codigo, avaliacao);
            await loadClientes();
        } catch (error) {
            console.error('Erro ao atualizar avaliação:', error);
            Alert.alert('Erro', 'Erro ao atualizar avaliação');
        }
    };

    const handleSearchChange = (text: string) => {
        setSearchTerm(text);
    };


    const refreshClientes = () => {
        loadClientes();
    };

    const handleLogout = () => {
        console.log('🚪 Iniciando logout...');
        
        // 1. Limpar token e localStorage
        apiService.removeAuthToken();
        console.log('🧹 Token removido e localStorage limpo');
        
        // 2. Limpar estado local
        setClientes([]);
        setFilteredClientes([]);
        setSearchTerm('');
        
        // 3. Navegação IMEDIATA - exatamente como o botão de teste
        console.log('🏃 Executando navegação IMEDIATA para login...');
        navigation.reset({
            index: 0,
            routes: [{ name: 'SignIn' }],
        });
        
    };

    return (
        <Container>
            <Header>
                <HomeIcon 
                    width={24} 
                    height={24} 
                    fill={colors.blue} 
                    onPress={() => navigation.navigate('MainTab')}
                />
                <ListaIcon 
                    width={24} 
                    height={24} 
                    fill={colors.blue} 
                    onPress={() => navigation.navigate('ListaDeClient')}
                />
                <LogoutButton onPress={handleLogout}>
                    <ActionButtonText>Sair</ActionButtonText>
                </LogoutButton>
            </Header>

            <SearchContainer>
                <SearchInputContainer>
                    <SearchIcon width={20} height={20} fill={colors.grayMedium} />
                    <SearchInput
                        placeholder={!searchTerm || searchTerm.trim() === '' ? "Buscar clientes por nome, email ou telefone..." : ''}
                        value={searchTerm}
                        onChangeText={handleSearchChange}
                        keyboardType="default"
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="off"
                        autoCompleteType="off"
                        textContentType="none"
                        importantForAutofill="no"
                    />
                </SearchInputContainer>
                {searchTerm.trim() && (
                    <SearchButton onPress={handleSearchCreateCliente}>
                        <SearchButtonText>Buscar/Criar</SearchButtonText>
                    </SearchButton>
                )}
            </SearchContainer>

            <Title>Clientes</Title>

            {loading ? (
                <LoadingContainer>
                    <EmptyText>Carregando...</EmptyText>
                </LoadingContainer>
            ) : filteredClientes.length === 0 ? (
                <EmptyState>
                    <EmptyText>
                        {searchTerm.trim() ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado.'}
                    </EmptyText>
                    <CreateButton onPress={openCreateModal}>
                        <CreateButtonText>+ Novo Cliente</CreateButtonText>
                    </CreateButton>
                </EmptyState>
            ) : (
                <ClientList>
                    <FlatList<Cliente>
                        data={filteredClientes}
                        keyExtractor={(item) => item.codigo.toString()}
                        renderItem={({ item }) => (
                            <ClienteItem
                                data={item}
                                onToggleFavorite={handleToggleFavorite}
                                onRatingChange={handleRatingChange}
                            />
                        )}
                        showsVerticalScrollIndicator={false}
                        ListFooterComponent={() => (
                            <>
                                <CreateButton onPress={openCreateModal} style={{ marginVertical: 20 }}>
                                    <CreateButtonText>+ Adicionar Cliente</CreateButtonText>
                                </CreateButton>
                            </>
                        )}
                    />
                </ClientList>
            )}

            {/* Modal para criar/editar cliente */}
            <Modal
                visible={showModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowModal(false)}
            >
                <ModalOverlay>
                    <ModalContainer>
                        <KeyboardAvoidingView 
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={{ flex: 1 }}
                        >
                            <ModalContent>
                                <ModalHeader>
                                    <ModalTitle>
                                        {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
                                    </ModalTitle>
                                </ModalHeader>

                                <ModalFormContainer>
                                    <ModalInput
                                        placeholder={formData.nome && formData.nome.length > 0 ? '' : "Nome completo *"}
                                        value={formData.nome}
                                        onChangeText={(text) => setFormData({ ...formData, nome: text })}
                                        autoCapitalize="words"
                                        autoComplete="off"
                                        autoCompleteType="off"
                                        textContentType="none"
                                        importantForAutofill="no"
                                    />

                                    <ModalInput
                                        placeholder={formData.email && formData.email.length > 0 ? '' : "Email *"}
                                        value={formData.email}
                                        onChangeText={(text) => setFormData({ ...formData, email: text })}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoComplete="off"
                                        autoCompleteType="off"
                                        textContentType="none"
                                        importantForAutofill="no"
                                    />

                                    <ModalInput
                                        placeholder={formData.telefone && formData.telefone.length > 0 ? '' : "Telefone"}
                                        value={formData.telefone || ''}
                                        onChangeText={(text) => setFormData({ ...formData, telefone: text })}
                                        keyboardType="phone-pad"
                                        autoComplete="off"
                                        autoCompleteType="off"
                                        textContentType="none"
                                        importantForAutofill="no"
                                    />

                                    <ModalInput
                                        placeholder={formData.avatar && formData.avatar.length > 0 ? '' : "URL do Avatar (opcional)"}
                                        value={formData.avatar || ''}
                                        onChangeText={(text) => setFormData({ ...formData, avatar: text })}
                                        autoCapitalize="none"
                                        autoComplete="off"
                                        autoCompleteType="off"
                                        textContentType="none"
                                        importantForAutofill="no"
                                    />
                                </ModalFormContainer>

                                <ModalButtonContainer>
                                    <ModalButton 
                                        onPress={() => setShowModal(false)}
                                        style={{ backgroundColor: colors.gray }}
                                    >
                                        <ModalButtonText>Cancelar</ModalButtonText>
                                    </ModalButton>

                                    <ModalButton
                                        onPress={handleSaveCliente}
                                        disabled={!formData.nome || !formData.email}
                                        style={{ 
                                            backgroundColor: (!formData.nome || !formData.email) ? 
                                            colors.gray : colors.blue 
                                        }}
                                    >
                                        <ModalButtonText>
                                            {loading ? 'Salvando...' : (editingClient ? 'Atualizar' : 'Criar')}
                                        </ModalButtonText>
                                    </ModalButton>
                                </ModalButtonContainer>
                            </ModalContent>
                        </KeyboardAvoidingView>
                    </ModalContainer>
                </ModalOverlay>
            </Modal>
        </Container>
    );
}
