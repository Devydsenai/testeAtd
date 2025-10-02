import React from 'react';
import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../core/core';

export const Container = styled(SafeAreaView)`
    flex: 1;
    background-color: ${colors.white};
`;

export const Header = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 20px 20px 10px 20px;
    border-bottom-width: 1px;
    border-bottom-color: ${colors.grayLight};
`;

export const Title = styled.Text`
    font-size: 24px;
    font-weight: bold;
    color: ${colors.black};
    text-align: center;
    margin: 20px 0 10px 0;
`;

export const LogoutButton = styled.TouchableOpacity`
    background-color: ${colors.red};
    padding: 8px 16px;
    border-radius: 20px;
`;

export const SearchContainer = styled.View`
    padding: 20px;
    background-color: ${colors.white};
    flex-direction: row;
    align-items: center;
    gap: 10px;
`;

export const SearchInputContainer = styled.View`
    flex: 1;
    flex-direction: row;
    align-items: center;
    background-color: ${colors.grayLight};
    border-radius: 25px;
    border: 1px solid ${colors.grayLight};
    padding-left: 16px;
`;

export const SearchInput = styled.TextInput`
    flex: 1;
    padding: 12px 16px 12px 8px;
    font-size: 16px;
    color: ${colors.black};
    border-width: 0px;
    outline-style: none;
    underlineColorAndroid: transparent;
`;

export const SearchButton = styled.TouchableOpacity`
    background-color: ${colors.blue};
    padding: 12px 20px;
    border-radius: 25px;
`;

export const SearchButtonText = styled.Text`
    color: ${colors.white};
    font-size: 14px;
    font-weight: 600;
`;

export const ClientList = styled.View`
    flex: 1;
    padding: 0 20px;
`;

export const EmptyState = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
    padding: 40px;
`;

export const EmptyText = styled.Text`
    font-size: 16px;
    color: ${colors.gray};
    text-align: center;
    line-height: 24px;
    margin-bottom: 20px;
`;

export const CreateButton = styled.TouchableOpacity`
    background-color: ${colors.blue};
    padding: 10px 20px;
    border-radius: 22px;
    elevation: 2;
    box-shadow: 0px 1px 3px rgba(99, 194, 209, 0.2);
    align-self: center;
`;

export const CreateButtonText = styled.Text`
    color: ${colors.white};
    font-size: 15px;
    font-weight: 600;
    text-align: center;
`;

export const LoadingContainer = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
`;

export const ClientCard = styled.View`
    background-color: ${colors.white};
    margin-bottom: 16px;
    border-radius: 12px;
    border: 1px solid ${colors.grayLight};
    padding: 16px;
    elevation: 2;
    box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.1);
`;

export const ClientInfo = styled.View`
    margin-bottom: 12px;
`;

export const ClientName = styled.Text`
    font-size: 18px;
    font-weight: bold;
    color: ${colors.black};
    margin-bottom: 4px;
`;

export const ClientEmail = styled.Text`
    font-size: 14px;
    color: ${colors.gray};
    margin-bottom: 4px;
`;

export const ClientPhone = styled.Text<{ status?: 'active' | 'inactive' | 'deleted' }>`
    font-size: 14px;
    color: ${props => 
        props.status === 'active' ? colors.green : 
        props.status === 'inactive' ? colors.red : 
        props.status === 'deleted' ? colors.gray : 
        colors.gray
    };
    font-weight: ${props => props.status ? '500' : 'normal'};
`;

export const ClientActions = styled.View`
    flex-direction: row;
    justify-content: flex-end;
    gap: 8px;
`;

export const ActionButton = styled.TouchableOpacity`
    background-color: ${colors.blue};
    padding: 8px 16px;
    border-radius: 6px;
`;

export const ActionButtonText = styled.Text`
    color: ${colors.white};
    font-size: 12px;
    font-weight: 500;
`;

export const DeleteButton = styled.TouchableOpacity`
    background-color: ${colors.red};
    padding: 8px 16px;
    border-radius: 6px;
`;

export const ActivateButton = styled.TouchableOpacity`
    background-color: ${colors.green};
    padding: 8px 16px;
    border-radius: 6px;
`;

export const RestoreButton = styled.TouchableOpacity`
    background-color: ${colors.blue};
    padding: 8px 16px;
    border-radius: 6px;
`;

// Modal Styles
export const ModalOverlay = styled.View`
    flex: 1;
    background-color: rgba(0, 0, 0, 0.5);
    justify-content: center;
    align-items: center;
`;

export const ModalContainer = styled.View`
    flex: 1;
    background-color: ${colors.white};
    border-radius: 20px;
    margin-horizontal: 20px;
    margin-vertical: 50px;
    elevation: 10;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.3);
`;

export const ModalContent = styled.View`
    flex: 1;
    padding: 20px;
`;

export const ModalHeader = styled.View`
    padding-bottom: 20px;
    border-bottom-width: 1px;
    border-bottom-color: ${colors.grayLight};
`;

export const ModalTitle = styled.Text`
    font-size: 24px;
    font-weight: bold;
    color: ${colors.black};
    text-align: center;
`;

export const ModalFormContainer = styled.View`
    flex: 1;
    padding-top: 20px;
    gap: 16px;
`;

export const ModalInput = styled.TextInput`
    background-color: ${colors.grayLight};
    padding: 16px;
    border-radius: 12px;
    font-size: 16px;
    color: ${colors.black};
    border-width: 0px;
    outline-style: none;
    underlineColorAndroid: transparent;
`;

export const ModalButtonContainer = styled.View`
    flex-direction: row;
    justify-content: space-between;
    gap: 16px;
    padding-top: 20px;
`;

export const ModalButton = styled.TouchableOpacity<{ disabled?: boolean }>`
    flex: 1;
    background-color: ${colors.blue};
    padding: 16px 24px;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    opacity: ${props => props.disabled ? 0.5 : 1};
`;

export const ModalButtonText = styled.Text`
    color: ${colors.white};
    font-size: 16px;
    font-weight: 600;
    text-align: center;
`;
