import React, { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import apiService from '../../../API';
import SignInput from '../../Components/SignInput';

import EmailIcon from '../../assets/email.svg';
import LockIcon from '../../assets/lock.svg';

import {
    Container,
    InputArea,
    CustomButton,
    CustomButtonText,
    SignMessageButton,
    SignMessageButtonText,
    SignMessageButtonTextBold
} from './styles';

export default function SignIn() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const [emailField, setEmailField] = useState('');
    const [passwordField, setPasswordField] = useState('');

    const handleSignClick = async () => {
        if (emailField !== '' && passwordField !== '') {
            try {
                const json = await apiService.signIn({ email: emailField, password: passwordField });

                if (json.token) {
                    // Definir token via API (não AsyncStorage)
                    apiService.setAuthToken(json.token);

                    navigation.reset({
                        routes: [{ name: 'MainTab' }]
                    });
                } else {
                    Alert.alert('E-mail e/ou senha errados!');
                }
            } catch (error) {
                console.log('Erro no login:', error);
                
                // Mensagens de erro mais específicas
                if (error instanceof Error) {
                    if (error.message.includes('E-mail ou senha incorretos')) {
                        if (Platform.OS === 'web') {
                            const result = window.confirm('Usuário não encontrado\n\nE-mail ou senha incorretos.\n\nVocê não é cadastrado? Faça seu cadastro!');
                            if (result) {
                                navigation.reset({ routes: [{ name: 'SignUp' }] });
                            }
                        } else {
                            Alert.alert(
                                'Usuário não encontrado', 
                                'E-mail ou senha incorretos.\n\nVocê não é cadastrado? Faça seu cadastro!',
                                [
                                    { text: 'Tentar Novamente', style: 'cancel' },
                                    { 
                                        text: 'Fazer Cadastro', 
                                        onPress: () => navigation.reset({ routes: [{ name: 'SignUp' }] })
                                    }
                                ]
                            );
                        }
                    } else if (error.message.includes('Usuário não encontrado')) {
                        if (Platform.OS === 'web') {
                            const result = window.confirm('Usuário não cadastrado\n\nEste e-mail não está cadastrado em nosso sistema.\n\nFaça seu cadastro para continuar!');
                            if (result) {
                                navigation.reset({ routes: [{ name: 'SignUp' }] });
                            }
                        } else {
                            Alert.alert(
                                'Usuário não cadastrado', 
                                'Este e-mail não está cadastrado em nosso sistema.\n\nFaça seu cadastro para continuar!',
                                [
                                    { text: 'Tentar Novamente', style: 'cancel' },
                                    { 
                                        text: 'Fazer Cadastro', 
                                        onPress: () => navigation.reset({ routes: [{ name: 'SignUp' }] })
                                    }
                                ]
                            );
                        }
                    } else {
                        if (Platform.OS === 'web') {
                            window.alert(`Erro no login!\n\n${error.message}`);
                        } else {
                            Alert.alert('Erro no login!', error.message);
                        }
                    }
                } else {
                    Alert.alert('Erro no login!', 'Erro desconhecido');
                }
            }
        } else {
            Alert.alert("Preencha os campos!", "E-mail e senha são obrigatórios");
        }
    };

    const handleMessageButtonClick = () => {
        navigation.reset({
            routes: [{ name: 'SignUp' }]
        });
    };


    return (
        <Container>
            <InputArea>
                <SignInput
                    IconSvg={EmailIcon}
                    placeholder="Digite seu e-mail"
                    value={emailField}
                    onChangeText={t => setEmailField(t)}
                />

                <SignInput
                    IconSvg={LockIcon}
                    placeholder="Digite sua senha"
                    value={passwordField}
                    onChangeText={t => setPasswordField(t)}
                    password={true}
                />

                <CustomButton onPress={handleSignClick}>
                    <CustomButtonText>LOGIN</CustomButtonText>
                </CustomButton>
            </InputArea>

            <SignMessageButton onPress={handleMessageButtonClick}>
                <SignMessageButtonText>Ainda não possui uma conta?</SignMessageButtonText>
                <SignMessageButtonTextBold>Cadastre-se</SignMessageButtonTextBold>
            </SignMessageButton>
        </Container>
    );
}
