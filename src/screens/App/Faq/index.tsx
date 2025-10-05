import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, UIManager, Platform, ActivityIndicator, Dimensions, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import DetailHeaders from '../../../components/DetailHeaders'
import { useTheme } from '../../../utils/colors'
import { responsive } from '../../../utils/responsive'
import CText from '../../../components/CText/CText'
import { useTranslation } from "react-i18next";

type FAQItem = {
  id: string
  question: string
  answer: string
}

const faqList = [
  {
    id: "0",
    question: "faq_q_0",
    answer: "faq_a_0"
  },
  {
    id: "1",
    question: "faq_q_1",
    answer: "faq_a_1"
  },
  {
    id: "2",
    question: "faq_q_2",
    answer: "faq_a_2"
  },
  {
    id: "3",
    question: "faq_q_3",
    answer: "faq_a_3"
  },
  {
    id: "4",
    question: "faq_q_4",
    answer: "faq_a_4"
  },
  {
    id: "5",
    question: "faq_q_5",
    answer: "faq_a_5"
  },
  {
    id: "6",
    question: "faq_q_6",
    answer: "faq_a_6"
  },
  {
    id: "7",
    question: "faq_q_7",
    answer: "faq_a_7"
  },
  {
    id: "8",
    question: "faq_q_8",
    answer: "faq_a_8"
  }
]


const FaqScreen = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { width, height } = Dimensions.get('window');
  const isTablet = Math.min(width, height) >= 600;
  const styles = getStyles(colors, isTablet);
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const toggleItem = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setActiveIndex(activeIndex === index ? null : index)
  }

  return (
    <View style={styles.container}>
      <DetailHeaders
        title={t("faq_title")}
      />
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {faqList.length === 0 ? (
          <Text style={styles.emptyText}>{t("faq_empty")}</Text>
        ) : (
          faqList.map((item, index) => (
            <View key={item.id} style={styles.itemContainer}>
              <TouchableOpacity onPress={() => toggleItem(index)} activeOpacity={0.8} style={styles.questionContainer}>
                <CText>{t(item.question)}</CText>
              </TouchableOpacity>
              {activeIndex === index && (
                <View style={styles.answerContainer}>
                  <CText>{t(item.answer)}</CText>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  )
}

const getStyles = (colors: any, isTablet: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND_COLOR,
  },
  listContent: {
    padding: responsive(16),
  },
  itemContainer: {
    borderRadius: responsive(7),
    backgroundColor: colors.WHITE_COLOR,
    marginBottom: responsive(14),
    shadowColor: colors.BLACK_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 0.5,
    borderColor: colors.STROKE_COLOR,
  },
  questionContainer: {
    paddingVertical: responsive(18),
    paddingHorizontal: responsive(16),
  },
  answerContainer: {
    padding: responsive(15),
  },
  emptyText: {
    fontSize: 16,
    color: colors.GRAY_COLOR,
    textAlign: 'center',
    marginTop: responsive(32),
  },
})

export default FaqScreen
