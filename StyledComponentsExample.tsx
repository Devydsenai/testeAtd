// Exemplo de uso do styled-components no React Native
import React from 'react';
import styled from 'styled-components/native';
import { Button as RNButton, Text as RNText, View as RNView } from 'react-native';

// Componentes estilizados usando styled-components
const Container = styled(RNView)`
  flex: 1;
  background-color: #ffffff;
  padding: 20px;
  justify-content: center;
  align-items: center;
`;

const Title = styled(RNText)`
  font-size: 24px;
  font-weight: bold;
  color: #333333;
  margin-bottom: 20px;
  text-align: center;
`;

const Subtitle = styled(RNText)`
  font-size: 16px;
  color: #666666;
  margin-bottom: 30px;
  text-align: center;
`;

const Button = styled(RNButton)`
  background-color: #007AFF;
  padding: 15px 30px;
  border-radius: 8px;
  margin: 10px;
`;

const CardContainer = styled(RNView)`
  background-color: #f8f8f8;
  padding: 15px;
  border-radius: 10px;
  margin: 10px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.25;
  shadow-radius: 3.84px;
  elevation: 5;
`;

const CardText = styled(RNText)`
  font-size: 14px;
  color: #333;
`;

// Exemplo com props
interface ButtonStyledProps {
  primary?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const StyledButton = styled.TouchableOpacity<ButtonStyledProps>`
  background-color: ${props => props.primary ? '#007AFF' : '#f8f8f8'};
  padding: ${props => {
    switch (props.size) {
      case 'small': return '8px 16px';
      case 'large': return '16px 32px';
      default: return '12px 24px';
    }
  }};
  border-radius: 8px;
  margin: 5px;
`;

const ButtonText = styled(RNText)<ButtonStyledProps>`
  color: ${props => props.primary ? '#ffffff' : '#333333'};
  font-size: ${props => {
    switch (props.size) {
      case 'small': return '12px';
      case 'large': return '18px';
      default: return '16px';
    }
  }};
  text-align: center;
  font-weight: bold;
`;

export default function StyledComponentsExample() {
  return (
    <Container>
      <Title>Styled Components</Title>
      <Subtitle>Exemplo em React Native</Subtitle>
      
      <CardContainer>
        <CardText>Este é um card criado com styled-components</CardText>
      </CardContainer>
      
      <StyledButton primary size="medium">
        <ButtonText primary size="medium">
          Botão Estilizado
        </ButtonText>
      </StyledButton>
      
      <StyledButton size="large">
        <ButtonText size="large">
          Botão Secundário
        </ButtonText>
      </StyledButton>
      
      <StyledButton primary size="small">
        <ButtonText primary size="small">
          Pequeno
        </ButtonText>
      </StyledButton>
    </Container>
  );
}
