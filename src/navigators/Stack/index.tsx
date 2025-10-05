import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import EmailLogin from '../../screens/Auth/Login/EmailLogin';
import GroupDetail from '../../screens/App/GroupDetail';
import OnBoardingOne from '../../screens/Auth/OnBoardings/OnBoardingOne';
import OnBoardingTwo from '../../screens/Auth/OnBoardings/OnBoardingTwo';
import OnBoardingThree from '../../screens/Auth/OnBoardings/OnBoardingThree';
import Register from '../../screens/Auth/Register';
import ResetPassword from '../../screens/Auth/ResetPassword';
import PhoneLogin from '../../screens/Auth/Login/PhoneLogin';
import Drawer from '../Drawer';
import PhoneVerification from '../../screens/Auth/PhoneVerification';
import Groups from '../../screens/App/Groups';
import AddProfile from '../../screens/Auth/AddProfile';
import EditProfile from '../../screens/App/EditProfile';
import AddHelp from '../../screens/App/Help/components/AddHelp';
import Subscriptions from '../../screens/App/Subscriptions';
import DeleteAccount from '../../screens/App/DeleteAccount';
import AddSubscriptions from '../../screens/App/Subscriptions/components/AddSubscriptions';

const Stack = createStackNavigator();

export const DRAWER = "Drawer";
export const ONEBOARDINGONE = "OnBoardingOne";
export const ONEBOARDINGTWO = "OnBoardingTwo";
export const ONEBOARDINGOTHREE = "OnBoardingThree";
export const EMAIL_LOGIN = "Email Login";
export const PHONE_LOGIN = "Phone Login";
export const REGISTER = "Register";
export const RESET_PASSWORD = "Reset Password";
export const PHONE_VERIFICATION = "Phone Verification";
export const GROUPS = "Groups";
export const GROUP_DETAIL = "Group Detail";
export const ADD_PROFILE = "Add Profile";
export const EDIT_PROFILE = "Edit Profile";
export const ADD_HELP = "Add Help";
export const SUBSCRIPTONS = "Subscriptions";
export const DELETE_ACCOUNT = "Delete Account";
export const ADD_SUBSCRIPTONS = "Add Subscriptions";

export default function StackNavigator() {
    const user = useSelector((state: any) => state?.auth?.user);

    return (
        <NavigationContainer>
            {user ? (
                <Stack.Navigator
                    initialRouteName={DRAWER}
                    screenOptions={{
                        headerShown: false,
                    }}>
                    <Stack.Screen name={DRAWER} component={Drawer} />
                    <Stack.Screen name={GROUPS} component={Groups} />
                    <Stack.Screen name={GROUP_DETAIL} component={GroupDetail} />
                    <Stack.Screen name={ADD_PROFILE} component={AddProfile} />
                    <Stack.Screen name={EDIT_PROFILE} component={EditProfile} />
                    <Stack.Screen name={ADD_HELP} component={AddHelp} />
                    <Stack.Screen name={SUBSCRIPTONS} component={Subscriptions} />
                    <Stack.Screen name={DELETE_ACCOUNT} component={DeleteAccount} />
                    <Stack.Screen name={RESET_PASSWORD} component={ResetPassword} />
                    <Stack.Screen name={ADD_SUBSCRIPTONS} component={AddSubscriptions} />
                </Stack.Navigator>
            ) : (
                <Stack.Navigator
                    initialRouteName={ONEBOARDINGONE}
                    screenOptions={{
                        headerShown: false,
                    }}>
                    <Stack.Screen name={ONEBOARDINGONE} component={OnBoardingOne} />
                    <Stack.Screen name={ONEBOARDINGTWO} component={OnBoardingTwo} />
                    <Stack.Screen name={ONEBOARDINGOTHREE} component={OnBoardingThree} />
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