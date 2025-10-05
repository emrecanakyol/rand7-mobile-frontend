import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { responsive } from '../../utils/responsive';
import { useTheme } from '../../utils/colors';
import CText from '../CText/CText';

interface CCooldownButtonProps {
    title: string;
    onPress: () => Promise<void> | void;
    cooldownKey: string;
    cooldownSeconds: number;
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: number;
    style?: object;
    loading?: boolean;
    disabled?: boolean;
    setShowFooterText?: (visible: boolean) => void;
}

const CCooldownButton = ({
    title,
    onPress,
    cooldownKey,
    cooldownSeconds,
    backgroundColor,
    textColor,
    borderRadius = responsive(7),
    style = {},
    loading = false,
    disabled = false,
    setShowFooterText,
}: CCooldownButtonProps) => {
    const { colors } = useTheme();
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const styles = getStyles(colors, isTablet);

    const btnBgColor = backgroundColor ?? colors.BLACK_COLOR;
    const btnTextColor = textColor ?? colors.WHITE_COLOR;

    const [cooldown, setCooldown] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        const checkCooldown = async () => {
            const storedEndTime = await AsyncStorage.getItem(cooldownKey);
            if (storedEndTime) {
                const endTime = parseInt(storedEndTime, 10);
                const now = Date.now();

                if (endTime > now) {
                    setCooldown(true);
                    setShowFooterText && setShowFooterText(true);  // varsa çağır
                    setSecondsLeft(Math.floor((endTime - now) / 1000));

                    interval = setInterval(() => {
                        setSecondsLeft((prev) => {
                            if (prev <= 1) {
                                clearInterval(interval);
                                AsyncStorage.removeItem(cooldownKey);
                                setCooldown(false);
                                setShowFooterText && setShowFooterText(true);  // varsa çağır
                                return 0;
                            }
                            return prev - 1;
                        });
                    }, 1000);
                } else {
                    await AsyncStorage.removeItem(cooldownKey);
                }
            }
        };

        checkCooldown();

        return () => {
            if (interval) clearInterval(interval);
        };
    }, []);

    const handlePress = async () => {
        await onPress();

        const endTime = Date.now() + cooldownSeconds * 1000;
        await AsyncStorage.setItem(cooldownKey, endTime.toString());

        setCooldown(true);
        setSecondsLeft(cooldownSeconds);

        const interval = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    AsyncStorage.removeItem(cooldownKey);
                    setCooldown(false);
                    setShowFooterText && setShowFooterText(true);  // varsa çağır
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        const minsStr = mins < 10 ? `0${mins}` : `${mins}`;
        const secsStr = secs < 10 ? `0${secs}` : `${secs}`;
        return `${minsStr}:${secsStr}`;
    };

    return (
        <View style={[styles.buttonContainer, style]}>
            <TouchableOpacity
                style={[
                    styles.button,
                    { backgroundColor: btnBgColor, borderRadius },
                    (cooldown || loading || disabled) && styles.disabledButton,
                ]}
                onPress={!cooldown && !loading && !disabled ? handlePress : undefined}
                disabled={cooldown || loading || disabled}
            >
                {loading ? (
                    <ActivityIndicator size="small" color={btnTextColor} />
                ) : (
                    <CText style={[styles.buttonText, { color: btnTextColor }]}>
                        {cooldown ? formatTime(secondsLeft) : title}
                    </CText>
                )}
            </TouchableOpacity>
        </View>
    );
};

const getStyles = (colors: any, isTablet: boolean) =>
    StyleSheet.create({
        buttonContainer: {
            marginVertical: responsive(15),
        },
        button: {
            paddingVertical: isTablet ? responsive(10) : responsive(14),
            paddingHorizontal: responsive(20),
            justifyContent: 'center',
            alignItems: 'center',
        },
        buttonText: {
            fontSize: isTablet ? 22 : 16,
            fontWeight: 'bold',
            color: colors.WHITE_COLOR,
        },
        disabledButton: {
            backgroundColor: colors.GRAY_COLOR,
        },
    });

export default CCooldownButton;
