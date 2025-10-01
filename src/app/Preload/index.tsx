import React, { useEffect } from 'react';
import { Container, LoadingIcon } from './styles';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import apiService from '../../../API';

export default function Preload() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                console.log('Iniciando verificação de autenticação...');
                
                // 1. Verificar se existe token no localStorage PRIMEIRO
                let hasToken = false;
                if (typeof window !== 'undefined' && window.localStorage) {
                    const savedToken = window.localStorage.getItem('auth_token');
                    hasToken = !!savedToken && savedToken.trim() !== '';
                    console.log('Token no localStorage:', savedToken ? 'presente' : 'ausente');
                }
                
                if (!hasToken) {
                    console.log('Nenhum token encontrado - indo para SignIn');
                    setTimeout(() => {
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'SignIn' }],
                        });
                    }, 1000);
                    return;
                }
                
                // 2. Fazer health check da API
                await apiService.healthCheck();
                
                // 3. Verificar se existe token válido
                const isAuthenticated = await apiService.verifyAuthentication();
                
                setTimeout(() => {
                    if (isAuthenticated) {
                        console.log('Usuário autenticado - indo para MainTab');
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'MainTab' }],
                        });
                    } else {
                        console.log('Usuário não autenticado - indo para SignIn');
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'SignIn' }],
                        });
                    }
                }, 1500);
                
            } catch (apiError) {
                console.log('Erro na verificação de autenticação:', apiError);
                setTimeout(() => {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'SignIn' }],
                    });
                }, 1500);
            }
        };
        
        checkAuthentication();
    }, [navigation]);

    return (
        <Container>
            <LoadingIcon size="large" color="#FFFFFF" />
        </Container>
    );
}