import React, { useState } from 'react';
import styled from 'styled-components/native';
import { colors } from '../core/core';

const InputArea = styled.View<{ focused?: boolean }>`
    width: 100%;
    height: 60px;
    background-color: ${props => props.focused ? colors.white : colors.grayLightest};
    flex-direction: row;
    border-radius: 30px;
    padding-left: 15px;
    align-items: center;
    margin-bottom: 15px;
    border-width: 0px;
    border-color: transparent;
    box-shadow: ${props => props.focused ? '0px 2px 4px rgba(99, 194, 209, 0.2)' : 'none'};
    elevation: ${props => props.focused ? 2 : 0};
`;

const Input = styled.TextInput`
    flex: 1;
    font-size: 16px;
    color: ${colors.black};
    margin-left: 10px;
    border-width: 0;
    outline-style: none;
    underlineColorAndroid: transparent;
    autoCorrect: false;
    autoCapitalize: none;
`;

const IconWrapper = styled.View<{ focused?: boolean }>`
    opacity: ${props => props.focused ? 1 : 0.6};
`;

interface SignInputProps {
    IconSvg: React.ComponentType<any>;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    password?: boolean;
}

export default function SignInput({ 
    IconSvg, 
    placeholder, 
    value, 
    onChangeText, 
    password = false 
}: SignInputProps) {
    const [focused, setFocused] = useState(false);

    return (
        <InputArea focused={focused}>
            <IconWrapper focused={focused}>
                <IconSvg width={24} height={24} fill={focused ? colors.blue : colors.grayDark} />
            </IconWrapper>
            <Input
                placeholder={value && value.length > 0 ? '' : placeholder}
                placeholderTextColor={colors.grayMedium}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={password}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                underlineColorAndroid="transparent"
                selectionColor={colors.blue}
                autoCorrect={false}
                autoCapitalize="none"
                autoComplete="off"
                autoCompleteType="off"
                textContentType="none"
                importantForAutofill="no"
            />
            
        </InputArea>
        
        
    );
}
