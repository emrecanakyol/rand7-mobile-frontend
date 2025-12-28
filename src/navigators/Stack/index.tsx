import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import EmailLogin from '../../screens/Auth/Login/EmailLogin';
import OnBoardingOne from '../../screens/Auth/OnBoardings/OnBoardingOne';
import Register from '../../screens/Auth/Register';
import ResetPassword from '../../screens/Auth/ResetPassword';
import PhoneLogin from '../../screens/Auth/Login/PhoneLogin';
import PhoneVerification from '../../screens/Auth/PhoneVerification';
import Home from '../../screens/App/Home';
import AddProfile from '../../screens/Auth/AddProfile';
import EditProfile from '../../screens/App/EditProfile';
import AddHelp from '../../screens/App/Help/components/AddHelp';
import Subscriptions from '../../screens/App/Subscriptions';
import DeleteAccount from '../../screens/App/DeleteAccount';
import AddSubscriptions from '../../screens/App/Subscriptions/components/AddSubscriptions';
import BottomTabs from '../BottomTabs';
import AddProfile2 from '../../screens/Auth/AddProfile/AddProfile2';
import AddProfile3 from '../../screens/Auth/AddProfile/AddProfile3';
import AddProfile4 from '../../screens/Auth/AddProfile/AddProfile4';
import AddProfile5 from '../../screens/Auth/AddProfile/AddProfile5';
import AddProfile6 from '../../screens/Auth/AddProfile/AddProfile6';
import AddProfile7 from '../../screens/Auth/AddProfile/AddProfile7';
import AddProfile8 from '../../screens/Auth/AddProfile/AddProfile8';
import MyProfile from '../../screens/App/MyProfile';
import LikeMatched from '../../screens/App/LikeMatched';
import SuperLikeMatched from '../../screens/App/SuperLikeMatched';
import UserProfile from '../../screens/App/UserProfile';
import Chat from '../../screens/App/Messages/Chat';
import AnonimChat from '../../screens/App/RandomMatch/components/AnonimChat';
import Help from '../../screens/App/Help';
import Settings from '../../screens/App/Settings';

const Stack = createStackNavigator();

export const BOOTOMTABS = "BottomTabs";
export const DRAWER = "Drawer";
export const ONEBOARDINGONE = "OnBoardingOne";
export const EMAIL_LOGIN = "Email Login";
export const PHONE_LOGIN = "Phone Login";
export const REGISTER = "Register";
export const RESET_PASSWORD = "Reset Password";
export const PHONE_VERIFICATION = "Phone Verification";
export const SETTINGS = "Settings";
export const HOME = "Home";
export const EDIT_PROFILE = "Edit Profile";
export const HELP = "Help";
export const ADD_HELP = "Add Help";
export const SUBSCRIPTONS = "Subscriptions";
export const DELETE_ACCOUNT = "Delete Account";
export const ADD_SUBSCRIPTONS = "Add Subscriptions";
export const MYPROFILE = "MyProfile";
export const USER_PROFILE = "User Profile";
export const ADD_PROFILE = "Add Profile";
export const ADD_PROFILE_2 = "Add Profile 2";
export const ADD_PROFILE_3 = "Add Profile 3";
export const ADD_PROFILE_4 = "Add Profile 4";
export const ADD_PROFILE_5 = "Add Profile 5";
export const ADD_PROFILE_6 = "Add Profile 6";
export const ADD_PROFILE_7 = "Add Profile 7";
export const ADD_PROFILE_8 = "Add Profile 8";
export const LIKE_MATCHED = "LikeMatched";
export const SUPER_LIKE_MATCHED = "SuperLikeMatched";
export const CHAT = "Chat";
export const ANONIM_CHAT = "AnonimChat";

export default function StackNavigator() {
    const user = useSelector((state: any) => state?.auth?.user);

    return (
        <NavigationContainer>
            {user ? (
                <Stack.Navigator
                    initialRouteName={BOOTOMTABS}
                    screenOptions={{
                        headerShown: false,
                    }}>
                    <Stack.Screen name={BOOTOMTABS} component={BottomTabs} />
                    <Stack.Screen name={HOME} component={Home} />
                    <Stack.Screen name={EDIT_PROFILE} component={EditProfile} />
                    <Stack.Screen name={SETTINGS} component={Settings} />
                    <Stack.Screen name={HELP} component={Help} />
                    <Stack.Screen name={ADD_HELP} component={AddHelp} />
                    <Stack.Screen name={SUBSCRIPTONS} component={Subscriptions} />
                    <Stack.Screen name={DELETE_ACCOUNT} component={DeleteAccount} />
                    <Stack.Screen name={RESET_PASSWORD} component={ResetPassword} />
                    <Stack.Screen name={ADD_SUBSCRIPTONS} component={AddSubscriptions} />
                    <Stack.Screen name={MYPROFILE} component={MyProfile} />
                    <Stack.Screen name={USER_PROFILE} component={UserProfile} />
                    <Stack.Screen name={ADD_PROFILE} component={AddProfile} />
                    <Stack.Screen name={ADD_PROFILE_2} component={AddProfile2} />
                    <Stack.Screen name={ADD_PROFILE_3} component={AddProfile3} />
                    <Stack.Screen name={ADD_PROFILE_4} component={AddProfile4} />
                    <Stack.Screen name={ADD_PROFILE_5} component={AddProfile5} />
                    <Stack.Screen name={ADD_PROFILE_6} component={AddProfile6} />
                    <Stack.Screen name={ADD_PROFILE_7} component={AddProfile7} />
                    <Stack.Screen name={ADD_PROFILE_8} component={AddProfile8} />
                    <Stack.Screen name={LIKE_MATCHED} component={LikeMatched} />
                    <Stack.Screen name={SUPER_LIKE_MATCHED} component={SuperLikeMatched} />
                    <Stack.Screen name={CHAT} component={Chat} />
                    <Stack.Screen name={ANONIM_CHAT} component={AnonimChat} />
                </Stack.Navigator>
            ) : (
                <Stack.Navigator
                    initialRouteName={ONEBOARDINGONE}
                    screenOptions={{
                        headerShown: false,
                    }}>
                    <Stack.Screen name={ONEBOARDINGONE} component={OnBoardingOne} />
                    <Stack.Screen name={EMAIL_LOGIN} component={EmailLogin} />
                    <Stack.Screen name={PHONE_LOGIN} component={PhoneLogin} />
                    <Stack.Screen name={REGISTER} component={Register} />
                    <Stack.Screen name={RESET_PASSWORD} component={ResetPassword} />
                    <Stack.Screen name={PHONE_VERIFICATION} component={PhoneVerification} />
                </Stack.Navigator>
            )}
        </NavigationContainer>
    );
}