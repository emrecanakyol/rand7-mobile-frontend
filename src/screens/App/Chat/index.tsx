import { View, Text } from 'react-native';
import React from 'react';

interface RouteParams {
    route?: {
        params?: {
            annonIds?: string[];
        };
    };
}

const Chat = ({ route }: RouteParams) => {
    const annonIds = route?.params?.annonIds ?? [];

    return (
        <View>
            <Text>Chat</Text>
            {annonIds.length > 0 ? (
                annonIds.map((id, index) => <Text key={index}>{id}</Text>)
            ) : (
                <Text>No annonIds provided</Text>
            )}
        </View>
    );
};

export default Chat;
