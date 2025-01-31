import { FlatList, Image, Platform, SafeAreaView, Text, TouchableOpacity, View, } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { getLatLong, getPlacesSuggestions } from '@/utils/mapUtils'
import { locationStyles } from '@/styles/locationStyles'
import { useUserStore } from '@/store/userStore'
import LocationItem from './LocationItem'
import MapPickerModal from './MapPickerModal'

type focusType = "drop" | "pickup"

const Selectlocations = () => {

  const {location, setLocation} = useUserStore()

  const [pickup, setPickup] = useState("")
  const [pickupCoords, setPickupCoords] = useState<any>(null)
  const [dropCoords, setDropCoords] = useState<any>(null)
  const [drop, setDrop] = useState("")
  const [locations, setLocations] = useState([])
  const [focusedInput, setFocusedInput] = useState<focusType>("drop")
  const [modalTitle, setModalTitle] = useState<focusType>("drop")
  const [isMapModalVisible, setMapModalVisible] = useState(false)

  const fetchLocation = async (query: string) => {
    if(query?.length > 4){
      const data = await getPlacesSuggestions(query)
      setLocations(data)
    }
  }

  useEffect(() => {
    if(location){
      setPickupCoords(location)
      setPickup(location?.address)
    }
  }, [location])

  const addLocation = async (id: string, description: string) => {
    const data = await getLatLong(id, description)
    console.log("DATA", {id})
    if(data){
      if(focusedInput === "drop"){
        setDrop(data?.address)
        setDropCoords(data)
      }else {
        setLocation(data)
        setPickupCoords(data)
        setPickup(data?.address)
      }
    }
  }

  const renderLocations = ({item} :any) => {
    return (
      <LocationItem item={item} onPress={() => addLocation(item?.place_id, item?.description)}/>
    )
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
              fetchLocation(text)
            }}
            onFocus={() => setFocusedInput("pickup")}
        />
        <LocationInput
            placeholder='Selecciona tu dirección de destino'
            type='drop'
            value={drop}
            onChangeText={(text) => {
              setDrop(text)
              fetchLocation(text)
            }}
            onFocus={() => setFocusedInput("drop")}
        />

        <CustomText fontFamily='Medium' fontSize={10} style={uiStyles.suggestionText}>
            {focusedInput} sugerencias
        </CustomText>
      </View>

            <FlatList
                data={locations}
                renderItem={renderLocations}
                keyExtractor={(item: any) => item?.place_id}
                initialNumToRender={5}
                windowSize={5}
                ListFooterComponent={
                  <TouchableOpacity style={[commonStyles.flexRow, locationStyles.container]}
                    onPress={() => {
                      setModalTitle(focusedInput)
                      setMapModalVisible(true)
                    }}
                  >
                    <Image source={require("@/assets/icons/map_pin.png")} style={uiStyles.mapPinIcon}/>
                    <CustomText fontFamily='Medium' fontSize={12}>
                      Selecciona desde el mapa
                    </CustomText>
                  </TouchableOpacity>
                }
            />

                {
                  isMapModalVisible && 

                  <MapPickerModal
                    selectedLocation={{
                      latitude: focusedInput === "drop" ? dropCoords?.latitude : pickupCoords?.latitude,
                      longitude: focusedInput === "drop" ? dropCoords?.longitude : pickupCoords?.longitude,
                      address: focusedInput == "drop" ? drop : pickup
                    }}
                      title={modalTitle}
                      visible={isMapModalVisible}
                      onClose={() => setMapModalVisible(false)}
                      onSelectLocation={(data) => {
                        if(data){
                          if(modalTitle === "drop"){
                            setDropCoords(data)
                            setDrop(data?.address)
                          }else{
                            setLocation(data)
                            setPickupCoords(data)
                            setPickup(data?.address)
                          }
                        }
                      }}
                    />
                }

    </View>
  )
}

export default Selectlocations