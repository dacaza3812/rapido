import { View, Text, SafeAreaView, TouchableOpacity, Image, Alert } from 'react-native'
import React, { useEffect } from 'react'
import { useWS } from '@/service/WSProvider'
import { useCaptainStorage } from '@/store/captainStore'
import { useIsFocused } from '@react-navigation/native'
import { captainStyles } from '@/styles/captainStyles'
import { commonStyles } from '@/styles/commonStyles'
import { MaterialIcons } from '@expo/vector-icons'
import { logout } from '@/service/authService'
import CustomText from '../shared/CustomText'
import * as Location from "expo-location"

const CaptainHeader = () => {
    const {disconnect, emit} = useWS()
    const {setOnDuty, onDuty, setLocation} = useCaptainStorage()
    const isFocused = useIsFocused()

    const toggleOnDuty = async () => {
        if(onDuty){
            const {status} = await Location.requestForegroundPermissionsAsync();
            if(status != "granted"){
                Alert.prompt("Permiso Denegado a la ubicación")
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const {latitude, longitude, heading} = location.coords;
            setLocation({latitude: latitude, longitude: longitude, address: "Somewhere", heading: heading as number})
            emit("goOnDuty", {
                latitude: location?.coords?.latitude,
                longitude: location?.coords?.longitude,
                heading: heading
            })
        }else{
            emit("goOffDuty")
        }
    }


    useEffect(() => {
        if(isFocused){
            toggleOnDuty()
        }
    }, [isFocused, onDuty])

  return (
    <>
        <View style={captainStyles.headerContainer}>
            <SafeAreaView />

            <View style={commonStyles.flexRowBetween}>
                <MaterialIcons name='logout' size={24} color="black" onPress={() => logout(disconnect)}/>
                <TouchableOpacity style={captainStyles.toggleContainer} onPress={() => setOnDuty(!onDuty)}>
                <CustomText fontFamily='SemiBold' fontSize={12} style={{color: "#888"}}>
                    {onDuty ? "EN SERVICIO" : "FUERA DE SERVICIO"}
                </CustomText>

                <Image
                    source={onDuty ?
                        require("@/assets/icons/switch_on.png") :
                        require("@/assets/icons/switch_off.png")
                    }
                    style={captainStyles.icon}
                />
                </TouchableOpacity>

                <MaterialIcons name='notifications' size={24} color="black" />
            </View>
        </View>

        <View style={captainStyles?.earningContainer}>
            <CustomText fontSize={13} style={{color: "#fff"}} fontFamily='Medium'>
                Ganado hoy
            </CustomText>

            <View style={commonStyles?.flexRowGap}>
                <CustomText fontSize={14} style={{color: "#fff"}} fontFamily='Medium'>
                    $ 5030 CUP
                </CustomText>
                <MaterialIcons name='arrow-drop-down' size={24} color="#fff"/>
            </View>
        </View>
    </>
  )
}

export default CaptainHeader