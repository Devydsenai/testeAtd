import React from 'react';
import styled from 'styled-components/native';
import { colors } from '../core/core';

import StarFull from '../assets/star.svg';
import StarHalf from '../assets/star_half.svg';
import StarEmpty from '../assets/star_empty.svg';

const StarArea = styled.View`
    flex-direction: row;
`;

const StarView = styled.View``;

const StarText = styled.Text`
    font-size: 12px;
    font-weight: bold;
    margin-left: 5px;
    color: ${colors.gray};
`;

interface StarsProps {
    stars: number;
    showNumber?: boolean;
}

export default function Stars({ stars, showNumber = false }: StarsProps) {
    // Validar entrada para stars
    const safeStars = Math.max(0, Math.min(5, stars || 0));
    const s = [0, 0, 0, 0, 0];
    const floor = Math.floor(safeStars);
    const left = safeStars - floor;

    // Preencher stars completas
    for (let i = 0; i < floor; i++) {
        s[i] = 2;
    }
    
    // Adicionar meia estrela se necessário
    if (left > 0) {
        s[floor] = 1;
    }

    return (
        <StarArea>
            {s.map((starType, index) => (
                <StarView key={`star-${index}`}>
                    {starType === 0 && <StarEmpty width={18} height={18} fill={colors.yellow} />}
                    {starType === 1 && <StarHalf width={18} height={18} fill={colors.yellow} />}
                    {starType === 2 && <StarFull width={18} height={18} fill={colors.yellow} />}
                </StarView>
            ))}
            {showNumber && <StarText>{safeStars}</StarText>}
        </StarArea>
    );
}
