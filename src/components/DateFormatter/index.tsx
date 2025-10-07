import React from 'react';
import { Dimensions, Text } from 'react-native';
import { useTheme } from '../../utils/colors';
import { useTranslation } from 'react-i18next';

interface DateFormatterProps {
    timestamp: any;
    color?: string;
    locale: string;
    textStyle?: any;
    // Deprecated: use display instead. If provided, true => both, false => date only
    showTime?: boolean;
    // Controls what to display: 'date', 'time', or 'both' (default)
    display?: 'date' | 'time' | 'both';
}

const formatDate = (
    timestamp: any,
    locale: string,
    options: Intl.DateTimeFormatOptions
) => {
    if (!timestamp) return "Unknown date";

    let date: Date;

    if (timestamp.toDate) {
        date = timestamp.toDate();
    } else {
        date = timestamp;
    }

    return new Intl.DateTimeFormat(locale, options).format(date);
};

const DateFormatter: React.FC<DateFormatterProps> = ({
    timestamp,
    color,
    locale,
    textStyle,
    showTime,
    display,
}) => {
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 600;
    const { colors } = useTheme();
    const { t } = useTranslation();

    // Resolve display mode with backward compatibility for showTime
    let resolvedDisplay: 'date' | 'time' | 'both' = 'both';
    if (display) {
        resolvedDisplay = display;
    } else if (showTime !== undefined) {
        resolvedDisplay = showTime ? 'both' : 'date';
    }

    const intlOptions: Intl.DateTimeFormatOptions = {};
    if (resolvedDisplay === 'date' || resolvedDisplay === 'both') {
        intlOptions.year = 'numeric';
        intlOptions.month = 'short';
        intlOptions.day = '2-digit';
    }
    if (resolvedDisplay === 'time' || resolvedDisplay === 'both') {
        intlOptions.hour = '2-digit';
        intlOptions.minute = '2-digit';
    }

    return (
        <Text style={[{
            fontSize: isTablet ? 22 : 16,
            color: color ? color : colors.TEXT_MAIN_COLOR,
            fontWeight: "500",
        }, textStyle]}>
            {timestamp
                ? formatDate(timestamp, locale, intlOptions)
                : <Text
                    style={{
                        color: colors.GRAY_COLOR
                    }}>{t("select_date")}</Text>
            }
        </Text>
    );
};

export default DateFormatter;
