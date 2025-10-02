import React from 'react';
import styled from 'styled-components/native';
import { colors } from '../core/core';

import Avatar from './Avatar';
import StarRating from './StarRating';
import FavoriteButton from './FavoriteButton';

const Area = styled.TouchableOpacity`
    background-color: ${colors.white};
    margin-bottom: 20px;
    border-radius: 20px;
    padding: 15px;
    flex-direction: row;
    align-items: center;
    shadow-color: #000;
    shadow-offset: 0px 2px;
    shadow-opacity: 0.1;
    shadow-radius: 4px;
    elevation: 3;
`;

const InfoArea = styled.View`
    flex: 1;
    margin-left: 15px;
    justify-content: space-between;
`;

const HeaderArea = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
`;

const UserName = styled.Text`
    font-size: 17px;
    font-weight: bold;
    color: ${colors.dark};
    flex: 1;
    margin-right: 10px;
`;

const UserEmail = styled.Text`
    font-size: 14px;
    color: ${colors.grayMedium};
    margin-bottom: 4px;
`;

const UserPhone = styled.Text`
    font-size: 14px;
    color: ${colors.grayMedium};
    margin-bottom: 8px;
`;

const RatingArea = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-top: 8px;
`;

const SeeProfileButton = styled.View`
    width: 85px;
    height: 26px;
    border: 1px solid ${colors.blue};
    border-radius: 10px;
    justify-content: center;
    align-items: center;
`;

const SeeProfileButtonText = styled.Text`
    font-size: 13px;
    color: ${colors.blue};
`;

interface ClienteData {
    codigo: number;
    nome: string;
    email: string;
    telefone?: string;
    avatar?: string;
    favorito: boolean;
    avaliacao: number; // Pode ser decimal (0, 0.5, 1, 1.5, etc.)
    ativo: boolean;
}

interface ClienteItemProps {
    data: ClienteData;
    onToggleFavorite?: (codigo: number, favorito: boolean) => void;
    onRatingChange?: (codigo: number, avaliacao: number) => void;
}

export default function ClienteItem({ 
    data, 
    onToggleFavorite, 
    onRatingChange 
}: ClienteItemProps) {
    const handleToggleFavorite = () => {
        if (onToggleFavorite) {
            onToggleFavorite(data.codigo, !data.favorito);
        }
    };

    const handleRatingChange = (rating: number) => {
        if (onRatingChange) {
            onRatingChange(data.codigo, rating);
        }
    };

    return (
        <Area>
            <Avatar 
                avatar={data.avatar} 
                name={data.nome} 
                size={60} 
            />
            <InfoArea>
                <HeaderArea>
                    <UserName numberOfLines={1}>{data.nome}</UserName>
                    <FavoriteButton
                        isFavorite={data.favorito}
                        onToggle={handleToggleFavorite}
                        size={24}
                    />
                </HeaderArea>
                
                <UserEmail numberOfLines={1}>{data.email}</UserEmail>
                {data.telefone && (
                    <UserPhone numberOfLines={1}>{data.telefone}</UserPhone>
                )}

                <RatingArea>
                    <StarRating
                        rating={data.avaliacao}
                        onRatingChange={handleRatingChange}
                        interactive={true}
                        size={18}
                    />
                    <SeeProfileButton>
                        <SeeProfileButtonText>Ver Perfil</SeeProfileButtonText>
                    </SeeProfileButton>
                </RatingArea>
            </InfoArea>
        </Area>
    );
}
