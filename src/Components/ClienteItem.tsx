import React from 'react';
import styled from 'styled-components/native';
import { colors } from '../core/core';

import Stars from './Stars';

const Area = styled.TouchableOpacity`
    background-color: ${colors.white};
    margin-bottom: 20px;
    border-radius: 20px;
    padding: 15px;
    flex-direction: row;
`;

const Avatar = styled.Image`
    width: 88px;
    height: 88px;
    border-radius: 20px;
`;

const InfoArea = styled.View`
    margin-left: 20px;
    justify-content: space-between;
`;

const UserName = styled.Text`
    font-size: 17px;
    font-weight: bold;
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
    avatar: string;
    name: string;
    stars: number;
}

interface ClienteItemProps {
    data: ClienteData;
}

export default function ClienteItem({ data }: ClienteItemProps) {
    return (
        <Area>
            <Avatar source={{ uri: data.avatar }} />
            <InfoArea>
                <UserName>{data.name}</UserName>

                <Stars stars={data.stars} showNumber={true} />

                <SeeProfileButton>
                    <SeeProfileButtonText>Ver Perfil</SeeProfileButtonText>
                </SeeProfileButton>
            </InfoArea>
        </Area>
    );
}
