import React, { useState, useEffect } from 'react';
import { Alert, FlatList, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../core/core';
import apiService, { type Cliente } from '../../../API';

// Importar ícones SVG
import HomeIcon from '../../assets/home.svg';
import SearchIcon from '../../assets/search.svg';

import {
    Container,
    Header,
    Title,
    BackButton,
    SearchContainer,
    SearchInputContainer,
    SearchInput,
    FilterContainer,
    FilterButton,
    FilterButtonText,
    ClientList,
    EmptyState,
    EmptyText,
    LoadingContainer,
    ClientCard,
    ClientInfo,
    ClientName,
    ClientEmail,
    ClientPhone,
    ClientStatus,
    ClientActions,
    ActionButton,
    ActionButtonText,
    DeleteButton,
    ActivateButton,
    ModalContainer,
    ModalContent,
    ModalOverlay,
    ModalHeader,
    ModalTitle,
    ModalFormContainer,
    ModalInput,
    ModalButtonContainer,
    ModalButton,
    ModalButtonText
} from './styles';

type FilterType = 'all' | 'active' | 'inactive';

export default function ListaDeClient() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [showModal, setShowModal] = useState(false);
    const [editingClient, setEditingClient] = useState<Cliente | null>(null);
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone: '',
        ativo: true
    });

    // Carregar clientes
    const loadClientes = async () => {
        try {
            setLoading(true);
            console.log('Carregando lista de clientes...');
            const response = await apiService.getClientes();
            setClientes(response);
            console.log(`${response.length} clientes carregados`);
        } catch (error: any) {
            console.error('Erro ao carregar clientes:', error);
            Alert.alert('Erro', 'Não foi possível carregar a lista de clientes');
        } finally {
            setLoading(false);
        }
    };

    // Filtrar clientes
    useEffect(() => {
        console.log('Filtrando clientes:', { 
            totalClientes: clientes.length, 
            activeFilter, 
            searchTerm 
        });
        console.log('Clientes antes do filtro:', clientes.map(c => ({ 
            nome: c.nome, 
            ativo: c.ativo, 
            ativoType: typeof c.ativo,
            deleted: c.deleted,
            deletedType: typeof c.deleted
        })));

        let filtered = clientes;

        // Filtro por busca PRIMEIRO (funciona em todos os clientes)
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(cliente =>
                cliente.nome.toLowerCase().includes(term) ||
                cliente.email.toLowerCase().includes(term) ||
                (cliente.telefone && cliente.telefone.includes(term))
            );
        }

        // Filtro por status DEPOIS da busca
        if (activeFilter === 'active') {
            filtered = filtered.filter(cliente => Boolean(cliente.ativo) === true && Boolean(cliente.deleted) === false);
        } else if (activeFilter === 'inactive') {
            filtered = filtered.filter(cliente => Boolean(cliente.ativo) === false && Boolean(cliente.deleted) === false);
        } else if (activeFilter === 'all') {
            // Para "Todos", mostrar apenas clientes não deletados
            filtered = filtered.filter(cliente => Boolean(cliente.deleted) === false);
        }

        console.log('Clientes após filtro:', filtered.length);
        console.log('Clientes filtrados:', filtered.map(c => ({ 
            nome: c.nome, 
            ativo: c.ativo, 
            deleted: c.deleted 
        })));

        setFilteredClientes(filtered);
        console.log('setFilteredClientes chamado com:', filtered.length, 'clientes');
    }, [clientes, searchTerm, activeFilter]);

    // Carregar clientes ao montar
    useEffect(() => {
        loadClientes();
    }, []);

    // Recarregar clientes quando a tela recebe foco
    useFocusEffect(
        React.useCallback(() => {
            loadClientes();
        }, [])
    );

    // Ativar cliente
    const handleActivateClient = async (clienteId: number) => {
        try {
            console.log('Ativando cliente:', clienteId);
            setLoading(true);
            
            await apiService.atualizarClienteParcial(clienteId, { ativo: true });
            
            // Atualizar estado local - cliente aparece na lista atual
            const updatedClientes = clientes.map(cliente =>
                cliente.codigo === clienteId ? { ...cliente, ativo: true } : cliente
            );
            setClientes(updatedClientes);
            
            console.log('Cliente ativado com sucesso');
            Alert.alert(
                'Cliente Ativado', 
                'Cliente ativado com sucesso! Agora ele aparece na aba "Todos" e "Ativos".'
            );
            
        } catch (error: any) {
            console.error('Erro ao ativar cliente:', error);
            Alert.alert('Erro', 'Não foi possível ativar o cliente');
        } finally {
            setLoading(false);
        }
    };

    // Desativar cliente
    const handleDeactivateClient = async (clienteId: number) => {
        try {
            console.log('Desativando cliente:', clienteId);
            setLoading(true);
            
            await apiService.atualizarClienteParcial(clienteId, { ativo: false });
            
            // Atualizar estado local - cliente desaparece da lista atual
            const updatedClientes = clientes.map(cliente =>
                cliente.codigo === clienteId ? { ...cliente, ativo: false } : cliente
            );
            setClientes(updatedClientes);
            
            console.log('Cliente desativado com sucesso');
            Alert.alert(
                'Cliente Desativado', 
                'Cliente desativado com sucesso! Ele desapareceu desta lista e agora aparece na aba "Inativos".'
            );
            
        } catch (error: any) {
            console.error('Erro ao desativar cliente:', error);
            Alert.alert('Erro', 'Não foi possível desativar o cliente');
        } finally {
            setLoading(false);
        }
    };


    // Deletar cliente (soft delete)
    const handleSoftDeleteClient = async (clienteId: number) => {
        try {
            console.log('Deletando cliente (soft delete):', clienteId);
            console.log('Clientes antes do soft delete:', clientes.map(c => ({ 
                codigo: c.codigo, 
                nome: c.nome, 
                deleted: c.deleted 
            })));
            setLoading(true);
            
            const response = await apiService.atualizarClienteParcial(clienteId, { deleted: true });
            console.log('📥 Resposta da API:', response);
            
            // Atualizar estado local
            const updatedClientes = clientes.map(cliente =>
                cliente.codigo === clienteId ? { ...cliente, deleted: true } : cliente
            );
            console.log('Clientes após atualização local:', updatedClientes.map(c => ({ 
                codigo: c.codigo, 
                nome: c.nome, 
                deleted: c.deleted 
            })));
            
            setClientes(updatedClientes);
            
            console.log('Cliente deletado (soft delete)');
            Alert.alert('Sucesso', 'Cliente deletado com sucesso!');
            
        } catch (error: any) {
            console.error('Erro ao deletar cliente:', error);
            Alert.alert('Erro', 'Não foi possível deletar o cliente');
        } finally {
            setLoading(false);
        }
    };


    // Resetar formulário
    const resetForm = () => {
        setFormData({
            nome: '',
            email: '',
            telefone: '',
            ativo: true
        });
        setEditingClient(null);
        setShowModal(false);
    };

    // Abrir modal para editar
    const openEditModal = (cliente: Cliente) => {
        setEditingClient(cliente);
        setFormData({
            nome: cliente.nome,
            email: cliente.email,
            telefone: cliente.telefone || '',
            ativo: cliente.ativo
        });
        setShowModal(true);
    };

    // Salvar cliente
    const handleSaveCliente = async () => {
        if (!formData.nome.trim() || !formData.email.trim()) {
            Alert.alert('Erro', 'Nome e email são obrigatórios');
            return;
        }

        try {
            setLoading(true);
            
            if (editingClient) {
                // Atualizar cliente existente
                await apiService.atualizarCliente(editingClient.codigo, formData);
                
                const updatedClientes = clientes.map(cliente =>
                    cliente.codigo === editingClient.codigo ? { ...cliente, ...formData } : cliente
                );
                setClientes(updatedClientes);
                
                Alert.alert('Sucesso', 'Cliente atualizado com sucesso!');
            }
            
            resetForm();
            
        } catch (error: any) {
            console.error('Erro ao salvar cliente:', error);
            Alert.alert('Erro', 'Não foi possível salvar o cliente');
        } finally {
            setLoading(false);
        }
    };

    // Voltar para Home (que está dentro do MainTab)
    const handleBackToHome = () => {
        console.log('Navegando para MainTab (Home)...');
        try {
            navigation.navigate('MainTab');
            console.log('Navegação para MainTab executada');
        } catch (error) {
            console.error('Erro na navegação para MainTab:', error);
            // Fallback: tentar reset
            navigation.reset({
                index: 0,
                routes: [{ name: 'MainTab' }],
            });
        }
    };

    // Voltar para MainTab (tela principal)
    const handleBackToMainTab = () => {
        navigation.navigate('MainTab');
    };

    return (
        <Container>
            <Header>
                <HomeIcon 
                    width={24} 
                    height={24} 
                    fill={colors.blue} 
                    onPress={handleBackToMainTab}
                />
                <Title>Lista de Clientes</Title>
                <BackButton onPress={handleBackToHome}>
                    <ActionButtonText>Voltar</ActionButtonText>
                </BackButton>
            </Header>

            <SearchContainer>
                <SearchInputContainer>
                    <SearchIcon width={20} height={20} fill={colors.grayMedium} />
                    <SearchInput
                        placeholder={!searchTerm || searchTerm.trim() === '' ? "Buscar clientes por nome, email ou telefone..." : ''}
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                        keyboardType="default"
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="off"
                        autoCompleteType="off"
                        textContentType="none"
                        importantForAutofill="no"
                    />
                </SearchInputContainer>
            </SearchContainer>

            <FilterContainer>
                <FilterButton 
                    active={activeFilter === 'all'} 
                    onPress={() => setActiveFilter('all')}
                >
                    <FilterButtonText active={activeFilter === 'all'}>Todos</FilterButtonText>
                </FilterButton>
                <FilterButton 
                    active={activeFilter === 'active'} 
                    onPress={() => setActiveFilter('active')}
                >
                    <FilterButtonText active={activeFilter === 'active'}>Ativos</FilterButtonText>
                </FilterButton>
                <FilterButton 
                    active={activeFilter === 'inactive'} 
                    onPress={() => setActiveFilter('inactive')}
                >
                    <FilterButtonText active={activeFilter === 'inactive'}>Inativos</FilterButtonText>
                </FilterButton>
            </FilterContainer>

            {loading ? (
                <LoadingContainer>
                    <EmptyText>Carregando...</EmptyText>
                </LoadingContainer>
            ) : filteredClientes.length === 0 ? (
                <EmptyState>
                    <EmptyText>
                        {searchTerm.trim() 
                            ? 'Nenhum cliente encontrado.' 
                            : activeFilter === 'active' 
                                ? 'Nenhum cliente ativo.' 
                                : activeFilter === 'inactive'
                                    ? 'Nenhum cliente inativo.'
                                    : 'Nenhum cliente disponível.'
                        }
                    </EmptyText>
                </EmptyState>
            ) : (
                <ClientList>
                    <FlatList<Cliente>
                        data={filteredClientes}
                        keyExtractor={(item) => item.codigo.toString()}
                        renderItem={({ item }) => (
                            <ClientCard>
                                <ClientInfo>
                                    <ClientName>{item.nome}</ClientName>
                                    <ClientEmail>{item.email}</ClientEmail>
                                    {item.telefone && (
                                        <ClientPhone>{item.telefone}</ClientPhone>
                                    )}
                                    <ClientStatus status={Boolean(item.deleted) ? 'deleted' : (Boolean(item.ativo) ? 'active' : 'inactive')}>
                                        {Boolean(item.deleted) ? 'Deletado' : (Boolean(item.ativo) ? 'Ativo' : 'Inativo')}
                                    </ClientStatus>
                                </ClientInfo>
                                <ClientActions>
                                    <ActionButton onPress={() => openEditModal(item)}>
                                        <ActionButtonText>Editar</ActionButtonText>
                                    </ActionButton>
                                    {Boolean(item.ativo) ? (
                                        // Cliente ativo: mostrar Desativar e Deletar
                                        <>
                                            <DeleteButton onPress={() => handleDeactivateClient(item.codigo)}>
                                                <ActionButtonText>Desativar</ActionButtonText>
                                            </DeleteButton>
                                            <DeleteButton onPress={() => handleSoftDeleteClient(item.codigo)}>
                                                <ActionButtonText>Deletar</ActionButtonText>
                                            </DeleteButton>
                                        </>
                                    ) : (
                                        // Cliente inativo: mostrar Ativar apenas na aba "Inativos", sempre mostrar Deletar
                                        <>
                                            {activeFilter === 'inactive' && (
                                                <ActivateButton onPress={() => handleActivateClient(item.codigo)}>
                                                    <ActionButtonText>Ativar</ActionButtonText>
                                                </ActivateButton>
                                            )}
                                            <DeleteButton onPress={() => handleSoftDeleteClient(item.codigo)}>
                                                <ActionButtonText>Deletar</ActionButtonText>
                                            </DeleteButton>
                                        </>
                                    )}
                                </ClientActions>
                            </ClientCard>
                        )}
                        showsVerticalScrollIndicator={false}
                    />
                </ClientList>
            )}

            {/* Modal para editar cliente */}
            <Modal
                visible={showModal}
                animationType="slide"
                transparent={true}
                onRequestClose={resetForm}
            >
                <ModalOverlay>
                    <ModalContainer>
                        <KeyboardAvoidingView 
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={{ flex: 1 }}
                        >
                            <ModalContent>
                                <ModalHeader>
                                    <ModalTitle>Editar Cliente</ModalTitle>
                                </ModalHeader>

                                <ModalFormContainer>
                                    <ModalInput
                                        placeholder={!formData.nome || formData.nome.trim() === '' ? "Nome completo *" : ''}
                                        value={formData.nome}
                                        onChangeText={(text) => setFormData({ ...formData, nome: text })}
                                        autoCapitalize="words"
                                        autoComplete="off"
                                        autoCompleteType="off"
                                        textContentType="none"
                                        importantForAutofill="no"
                                    />

                                    <ModalInput
                                        placeholder={!formData.email || formData.email.trim() === '' ? "Email *" : ''}
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
                                        placeholder={!formData.telefone || formData.telefone.trim() === '' ? "Telefone (opcional)" : ''}
                                        value={formData.telefone}
                                        onChangeText={(text) => setFormData({ ...formData, telefone: text })}
                                        keyboardType="phone-pad"
                                        autoComplete="off"
                                        autoCompleteType="off"
                                        textContentType="none"
                                        importantForAutofill="no"
                                    />
                                </ModalFormContainer>

                                <ModalButtonContainer>
                                    <ModalButton onPress={resetForm}>
                                        <ModalButtonText>Cancelar</ModalButtonText>
                                    </ModalButton>
                                    <ModalButton onPress={handleSaveCliente}>
                                        <ModalButtonText>Salvar</ModalButtonText>
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
