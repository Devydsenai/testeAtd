import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';

// Importar os ícones de estrela
import StarEmpty from '../assets/star_empty.svg';
import StarHalf from '../assets/star_half.svg';
import StarFull from '../assets/star.svg';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  onRatingChange?: (rating: number) => void;
  interactive?: boolean;
  showHalfStars?: boolean;
}

interface StarState {
  state: 'empty' | 'half' | 'full';
}

const StarContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const StarButton = styled(TouchableOpacity)<{ size: number }>`
  margin-horizontal: 2px;
  padding: 2px;
`;

const StarWrapper = styled(View)<{ size: number }>`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  justify-content: center;
  align-items: center;
`;

const StarRating: React.FC<StarRatingProps> = ({
  rating = 0,
  maxRating = 5,
  size = 20,
  onRatingChange,
  interactive = false,
  showHalfStars = true
}) => {
  const getStarState = (starIndex: number): 'empty' | 'half' | 'full' => {
    const starValue = starIndex + 1;
    const halfValue = starIndex + 0.5;
    
    if (rating >= starValue) return 'full';
    if (rating >= halfValue) return 'half';
    return 'empty';
  };

  const handleStarPress = (starIndex: number) => {
    if (!interactive || !onRatingChange) return;
    
    const starValue = starIndex + 1;
    const halfValue = starIndex + 0.5;
    const currentState = getStarState(starIndex);
    
    // Lógica: cada estrela tem seu próprio ciclo de 3 estados
    if (currentState === 'empty') {
      // Se está vazia, ir para meia
      onRatingChange(halfValue);
    } else if (currentState === 'half') {
      // Se está meia, ir para cheia
      onRatingChange(starValue);
    } else if (currentState === 'full') {
      // Se está cheia, voltar para vazia (apenas dessa estrela)
      // Calcular o novo rating baseado nas estrelas anteriores
      let newRating = 0;
      for (let i = 0; i < starIndex; i++) {
        const prevStarValue = i + 1;
        const prevHalfValue = i + 0.5;
        if (rating >= prevStarValue) {
          newRating = prevStarValue;
        } else if (rating >= prevHalfValue) {
          newRating = prevHalfValue;
        }
      }
      onRatingChange(newRating);
    }
  };

  const renderStar = (index: number) => {
    const starState = getStarState(index);
    
    // Determinar o estado visual da estrela
    const isFull = starState === 'full';
    const isHalf = starState === 'half' && showHalfStars;
    const isEmpty = starState === 'empty';

    const StarComponent = () => {
      if (isFull) {
        return <StarFull width={size} height={size} fill="#FFD700" />;
      } else if (isHalf) {
        return <StarHalf width={size} height={size} fill="#FFD700" />;
      } else {
        return <StarEmpty width={size} height={size} fill="#E0E0E0" />;
      }
    };

    if (interactive) {
      return (
        <StarButton
          key={index}
          size={size}
          onPress={() => handleStarPress(index)}
          activeOpacity={0.7}
        >
          <StarWrapper size={size}>
            <StarComponent />
          </StarWrapper>
        </StarButton>
      );
    }

    return (
      <StarWrapper key={index} size={size}>
        <StarComponent />
      </StarWrapper>
    );
  };

  return (
    <StarContainer>
      {Array.from({ length: maxRating }, (_, index) => renderStar(index))}
    </StarContainer>
  );
};

export default StarRating;
