import React from 'react';
import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../core/core';

export const Container = styled(SafeAreaView)`
    background-color: ${colors.purpleDark};
    flex: 1;
    justify-content: center;
    align-items: center;
`;


export const InputArea = styled.View`
    width: 100%;
    padding: 40px;
`;

export const CustomButton = styled.TouchableOpacity`
    height: 60px;
    background-color: ${colors.blueDark};
    border-radius: 30px;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    box-shadow: 0px 2px 4px rgba(76, 175, 80, 0.3);
    elevation: 3;
`;

export const CustomButtonText = styled.Text`
    font-size: 18px;
    color: ${colors.white};
`;

export const SignMessageButton = styled.TouchableOpacity`
    flex-direction: row;
    justify-content: center;
    margin-top: 50px;
    margin-bottom: 20px;
`;

export const SignMessageButtonText = styled.Text`
    font-size: 16px;
    color: ${colors.blueDark};
`;

export const SignMessageButtonTextBold = styled.Text`
    font-size: 16px;
    color: ${colors.blueDark};
    font-weight: bold;
    margin-left: 5px;
`;
