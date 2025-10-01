import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import apiService from '../../../API';
import SignInput from '../../Components/SignInput';

import PersonIcon from '../../assets/person.svg';
import EmailIcon from '../../assets/email.svg';
import LockIcon from '../../assets/lock.svg';
import TelefoneIcon from '../../assets/telefone.svg';

import {
    Container,
    InputArea,
    CustomButton,
    CustomButtonText,
    SignMessageButton,
    SignMessageButtonText,
    SignMessageButtonTextBold
} from './styles';

export default function SignUp() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const [nameField, setNameField] = useState('');
    const [emailField, setEmailField] = useState('');
    const [phoneField, setPhoneField] = useState('');
    const [passwordField, setPasswordField] = useState('');

    const handleSignClick = async () => {
        if (nameField !== '' && emailField !== '' && passwordField !== '') {
            try {
                const res = await apiService.signUp({ 
                    name: nameField, 
                    email: emailField, 
                    phone: phoneField || '',
                    password: passwordField 
                });
               
                if (res.token) {
                    // Definir token via API (não AsyncStorage)
                    apiService.setAuthToken(res.token);

                    navigation.reset({
                        routes: [{ name: 'MainTab' }]
                    });
                } else {
                    Alert.alert("Erro", res.error || "Erro ao criar conta");
                }
            } catch (error) {
                console.log('Erro no cadastro:', error);
                Alert.alert('Erro', error instanceof Error ? error.message : 'Erro ao criar conta');
            }
        } else {
            Alert.alert("Atenção", "Preencha todos os campos obrigatórios");
        }
    };

    const handleMessageButtonClick = () => {
        navigation.reset({
            routes: [{ name: 'SignIn' }]
        });
    };

    return (
        <Container>
            <InputArea>
                <SignInput
                    IconSvg={PersonIcon}
                    placeholder="Digite seu nome"
                    value={nameField}
                    onChangeText={t => setNameField(t)}
                />

                <SignInput
                    IconSvg={EmailIcon}
                    placeholder="Digite seu e-mail"
                    value={emailField}
                    onChangeText={t => setEmailField(t)}
                />

                <SignInput
                    IconSvg={TelefoneIcon}
                    placeholder="Digite seu telefone (opcional)"
                    value={phoneField}
                    onChangeText={t => setPhoneField(t)}
                />

                <SignInput
                    IconSvg={LockIcon}
                    placeholder="Digite sua senha"
                    value={passwordField}
                    onChangeText={t => setPasswordField(t)}
                    password={true}
                />

                <CustomButton onPress={handleSignClick}>
                    <CustomButtonText>CADASTRAR</CustomButtonText>
                </CustomButton>
            </InputArea>

            <SignMessageButton onPress={handleMessageButtonClick}>
                <SignMessageButtonText>Já possui uma conta?</SignMessageButtonText>
                <SignMessageButtonTextBold>Faça Login</SignMessageButtonTextBold>
            </SignMessageButton>
        </Container>
    );
}
