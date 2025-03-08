import { Alert, FlatList, Image, Platform, SafeAreaView, Text, TouchableOpacity, View, } from 'react-native'
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

import { calculateDistance, getLatLong, getPlacesSuggestions } from '@/utils/mapUtils'
import { locationStyles } from '@/styles/locationStyles'
import { useUserStore } from '@/store/userStore'
import LocationItem from '@/components/customer/LocationItem'
import LocationInput from '@/components/customer/LocationInput'
import MapPickerModal from '@/components/customer/MapPickerModal'


type focusType = "destino" | "recogida"

const Selectlocations = () => {

  const {location, setLocation} = useUserStore()

  const [pickup, setPickup] = useState("")
  const [pickupCoords, setPickupCoords] = useState<any>(null)
  const [dropCoords, setDropCoords] = useState<any>(null)
  const [drop, setDrop] = useState("")
  const [locations, setLocations] = useState([])
  const [focusedInput, setFocusedInput] = useState<focusType>("destino")
  const [modalTitle, setModalTitle] = useState<focusType>("destino")
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

  const checkDistance = async () => {
    if(!pickupCoords || !dropCoords) return

    const {latitude: lat1, longitude: lon1} = pickupCoords
    const {latitude: lat2, longitude: lon2} = dropCoords

    if(lat1 === lat2 && lon1 === lon2){
      alert("La dirección de recogida y de entrega no puede ser la misma.")
      return
    }
    console.log("Type lat1: ", typeof lat1, ": ", lat1)
    console.log("Type pickupCoords: ", typeof pickupCoords, ": ", pickupCoords)
    const distance = calculateDistance({lat1, lon1, lat2, lon2})

    const minDistance = 0.3; // Distancia mínima en km (e.j: 500 metros)
    const maxDistance = 20; // Distancia máxima en km (e.j: 20 km)

    if (distance < minDistance){
      alert("Las distancias seleccionadas son muy cercanas.")
    }else if( distance > maxDistance){
      alert("Las distancias seleccionadas están demasiado lejos.")
    }else{
      setLocations([])
      router.navigate({
        pathname: "/customer/ridebooking",
        params: {
          distanceInKm: distance.toFixed(2),
          drop_latitude: dropCoords?.latitude,
          drop_longitude: dropCoords?.longitude,
          drop_address: drop
        }
      })
      setDrop("")
      setPickup("")
      setDropCoords(null)
      setPickupCoords(null)
      setMapModalVisible(false)
      setMapModalVisible(false)
      console.log(`Distance is valid: ${distance.toFixed(2)} km`)
    }
  }

  useEffect(() => {
    if(dropCoords && pickupCoords){
      checkDistance()
    }else{
      setLocations([])
      setMapModalVisible(false)
    }
  }, [dropCoords, pickupCoords])

  const addLocation = async (id: string, description: string) => {
    const data = await getLatLong(id, description)
    console.log("DATA", {id})
    if(data){
      if(focusedInput === "destino"){
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
            onFocus={() => setFocusedInput("recogida")}
        />
        <LocationInput
            placeholder='Selecciona tu dirección de destino'
            type='drop'
            value={drop}
            onChangeText={(text) => {
              setDrop(text)
              fetchLocation(text)
            }}
            onFocus={() => setFocusedInput("destino")}
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
                      latitude: focusedInput === "destino" ? dropCoords?.latitude : pickupCoords?.latitude,
                      longitude: focusedInput === "destino" ? dropCoords?.longitude : pickupCoords?.longitude,
                      address: focusedInput == "destino" ? drop : pickup
                    }}
                      title={modalTitle}
                      visible={isMapModalVisible}
                      onClose={() => setMapModalVisible(false)}
                      onSelectLocation={(data) => {
                        if(data){
                          if(modalTitle === "destino"){
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