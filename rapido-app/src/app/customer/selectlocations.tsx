import { Platform, SafeAreaView, Text, TouchableOpacity, View, } from 'react-native'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { homeStyles } from '@/styles/homeStyles'
import { StatusBar } from 'expo-status-bar'
import LocationBar from '@/components/customer/LocationBar'
import { Colors, screenHeight } from '@/utils/Constants'
import DraggableMap from '@/components/customer/DraggableMap'
import { Ionicons } from '@expo/vector-icons'
import { commonStyles } from '@/styles/commonStyles'
import { router } from 'expo-router'
import CustomText from '@/components/shared/CustomText'
import { uiStyles } from '@/styles/uiStyles'
import LocationInput from './LocationInput'
import { getPlacesSuggestions } from '@/utils/mapUtils'



const Selectlocations = () => {

  const [pickup, setPickup] = useState("")
  const [pickupCoords, setPickupCoords] = useState<any>(null)
  const [dropCoords, setDropCoords] = useState<any>(null)
  const [drop, setDrop] = useState("")
  const [location, setLocation] = useState([])

  const fetchLocation = async (query: string) => {
    if(query?.length > 4){
      const data = await getPlacesSuggestions(query)
      setLocation(data)
    }
  }

  return (
    <View style={homeStyles.container}>
      <StatusBar
        style='light'
        backgroundColor='orange'
        translucent={false}
      />

      <SafeAreaView />

      <TouchableOpacity style={commonStyles.flexRow} onPress={() => router.back()}>
        <Ionicons name='chevron-back' size={24} color={Colors.iosColor}/>
        <CustomText fontFamily='Regular' style={{color: Colors.iosColor}}>Atrás</CustomText>
      </TouchableOpacity>

      <View style={uiStyles.locationInputs}>
        <LocationInput
            placeholder='Selecciona ubicación de recogida'
            type='pickup'
            value={pickup}
            onChangeText={(text) => {
              setPickup(text)

            }}
        />
      </View>
    </View>
  )
}

export default Selectlocations