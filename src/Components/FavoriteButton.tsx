import React from 'react';
import { TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';

// Importar os ícones de favorito
import FavoriteEmpty from '../assets/favorite.svg';
import FavoriteFull from '../assets/favorite_full.svg';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  size?: number;
}

const FavoriteButtonContainer = styled(TouchableOpacity)<{ size: number }>`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  justify-content: center;
  align-items: center;
  padding: 4px;
`;

const FavoriteWrapper = styled.View<{ size: number }>`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  justify-content: center;
  align-items: center;
`;

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  isFavorite,
  onToggle,
  size = 24
}) => {
  return (
    <FavoriteButtonContainer
      size={size}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <FavoriteWrapper size={size}>
        {isFavorite ? (
          <FavoriteFull width={size} height={size} fill="#FF6B6B" />
        ) : (
          <FavoriteEmpty width={size} height={size} fill="#E0E0E0" />
        )}
      </FavoriteWrapper>
    </FavoriteButtonContainer>
  );
};

export default FavoriteButton;
