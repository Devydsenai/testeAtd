import React from 'react';
import { View, Text, Image } from 'react-native';
import styled from 'styled-components/native';

interface AvatarProps {
  avatar?: string | null;
  name: string;
  size?: number;
  showName?: boolean;
}

const AvatarContainer = styled(View)<{ size: number }>`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border-radius: ${props => props.size / 2}px;
  background-color: #E0E0E0;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  border: 2px solid #FFFFFF;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

const AvatarImage = styled(Image)<{ size: number }>`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border-radius: ${props => props.size / 2}px;
`;

const AvatarText = styled(Text)<{ size: number }>`
  font-size: ${props => props.size * 0.4}px;
  font-weight: bold;
  color: #666666;
  text-align: center;
`;

const NameText = styled(Text)`
  font-size: 12px;
  color: #666666;
  margin-top: 4px;
  text-align: center;
  max-width: 80px;
`;

const Avatar: React.FC<AvatarProps> = ({ 
  avatar, 
  name, 
  size = 50, 
  showName = false 
}) => {
  // Gerar iniciais do nome
  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Verificar se o avatar é uma URL válida
  const isValidUrl = (url: string | null | undefined) => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <View style={{ alignItems: 'center' }}>
      <AvatarContainer size={size}>
        {avatar && isValidUrl(avatar) ? (
          <AvatarImage 
            source={{ uri: avatar }} 
            size={size}
            resizeMode="cover"
          />
        ) : (
          <AvatarText size={size}>
            {getInitials(name)}
          </AvatarText>
        )}
      </AvatarContainer>
      {showName && (
        <NameText numberOfLines={1}>
          {name}
        </NameText>
      )}
    </View>
  );
};

export default Avatar;
