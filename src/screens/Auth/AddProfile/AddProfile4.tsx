import { useState } from "react";
import { View } from "react-native";
import CTextInput from "../../../components/CTextInput";
import CButton from "../../../components/CButton";
import { ADD_PROFILE_5 } from "../../../navigators/Stack";

const AddProfile4 = ({ navigation, route }: any) => {
    const [country, setCountry] = useState("");
    const [city, setCity] = useState("");

    const next = () => navigation.navigate(ADD_PROFILE_5, { ...route.params, country, city });

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <CTextInput label="Ülke" value={country} onChangeText={setCountry} />
            <CTextInput label="Şehir" value={city} onChangeText={setCity} />
            <CButton title="İleri" disabled={!country || !city} onPress={next} />
        </View>
    );
};

export default AddProfile4;
