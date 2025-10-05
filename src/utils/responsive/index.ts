
import { Dimensions } from 'react-native';
export const SCREEN_WIDTH = Dimensions.get("window").width

export const responsive = (value: number) => SCREEN_WIDTH / (430 / value)