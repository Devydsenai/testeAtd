import React, { useState } from 'react';
import { Alert } from 'react-native';
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
                Alert.alert('Erro no login!', error instanceof Error ? error.message : 'Erro desconhecido');
            }
        } else {
            Alert.alert("Preencha os campos!");
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
