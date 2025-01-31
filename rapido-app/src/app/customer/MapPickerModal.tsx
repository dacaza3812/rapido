import { View, Text, Modal, TouchableOpacity, TextInput, FlatList, Image } from 'react-native'
import React, { FC, useRef, useState } from 'react'
import { modalStyles } from '@/styles/modalStyles';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RFValue } from 'react-native-responsive-fontsize';
import { getLatLong, getPlacesSuggestions, reverseGeocode } from '@/utils/mapUtils';
import MapView, { Region } from 'react-native-maps';
import { useUserStore } from '@/store/userStore';
import * as Location from "expo-location";
import LocationItem from './LocationItem';
import { customMapStyle, tunasIntialRegion } from '@/utils/CustomMap';
import { mapStyles } from '@/styles/mapStyles';

interface MapPickerModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    selectedLocation: {
        latitude: number;
        longitude: number;
        address: string
    },
    onSelectLocation: (location: any) => void;
}

const MapPickerModal:FC<MapPickerModalProps> = ({visible, selectedLocation, onClose, title, onSelectLocation}) => {

    const mapRef = useRef<MapView>(null)
    const [text, setText] = useState("")
    const {location} = useUserStore()
    const [address, setAddress] = useState("")
    const [region, setRegion] = useState<Region | null>(null)
    const [locations, setLocations] = useState([])
    const textInputRef = useRef<TextInput>(null)
    const [query, setQuery] = useState("")

    const fetchLocation = async (query: string) => {
        if(query?.length > 4){
            setQuery(query)
          const data = await getPlacesSuggestions(query)
          setLocations(data)
        }else{
            setLocations([])
        }
    }

    const addLocation = async (place_id: string, description: string) => {
        const data = await getLatLong(place_id, description) 
        if(data){
            setRegion({
                latitude: data.latitude,
                longitude: data.longitude,
                latitudeDelta: 0.5,
                longitudeDelta: 0.5
            })
            setAddress(data.address)
        }
        textInputRef.current?.blur()
        setText("")
    }

    const renderLocations = ({item} :any) => {
        return (
          <LocationItem item={item} onPress={() => addLocation(item?.place_id, item?.description)}/>
        )
    }

        const handleRegionChangeComplete = async (newRegion: Region) => {
          try {
            const address = await reverseGeocode(newRegion?.latitude, newRegion?.longitude);
            setRegion(newRegion)
            setAddress(address)
          } catch (error) {
            console.log("Error getting location", error)
          }
        }

    const handleGpsButtonPress = async() => {
        try {
            const location = await Location.getCurrentPositionAsync({});
            const {latitude, longitude} = location.coords;
            mapRef.current?.fitToCoordinates([{latitude, longitude}], {
                edgePadding: {top: 50, right: 50, bottom: 50, left: 50},
                animated: true,
            });

        const address = await reverseGeocode(latitude, longitude);
        setAddress(address)
        setRegion({
            latitude: latitude,
            longitude: longitude,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5
        })
        } catch (error) {
            console.log(error)
        }
    }

  return (
    <Modal
        animationType='slide'
        visible={visible}
        presentationStyle='formSheet'
        onRequestClose={onClose}
    >
        <View style={modalStyles?.modalContainer}>
            <Text style={modalStyles?.centerText}>
                Seleccionar {title}
            </Text>

            <TouchableOpacity onPress={onClose}>
                <Text style={modalStyles?.cancelButton}>Cancelar</Text>
            </TouchableOpacity>
        </View>

        <View style={modalStyles.searchContainer}>
            <Ionicons name='search-outline' size={RFValue(16)} color="#777"/>
            <TextInput
                ref={textInputRef}
                style={modalStyles?.input}
                placeholder='Buscar dirección'
                placeholderTextColor="#aaa"
                value={text}
                onChangeText={(e) => {
                    setText(e)
                    fetchLocation(e)
                }}
            />
        </View>

        {
            text !== "" ?
                <FlatList
                    ListHeaderComponent={
                        <View>
                            {
                                text.length > 4 ? null : 
                                <Text style={{marginHorizontal: 16}}>
                                    Introduzca los últimos 4 caracteres para buscar
                                </Text>
                            }
                        </View>
                    }
                    data={locations}
                    renderItem={renderLocations}
                    keyExtractor={(item: any) => item.place_id}
                    initialNumToRender={5}
                    windowSize={5}
                />
            :
            <>
                <View style={{flex: 1, width: "100%"}}>
                <MapView
                    ref={mapRef}
                    maxZoomLevel={16}
                    minZoomLevel={12}
                    pitchEnabled={false}
                    style={{flex: 1}}
                    onRegionChangeComplete={handleRegionChangeComplete}
                    initialRegion={{
                        latitude: region?.latitude ?? location?.latitude ?? tunasIntialRegion?.latitude,
                        longitude: region?.longitude ?? location?.longitude ?? tunasIntialRegion?.longitude,
                        latitudeDelta: 0.5,
                        longitudeDelta: 0.5
                    }}
                    provider='google'
                    customMapStyle={customMapStyle}
                    showsMyLocationButton={false}
                    showsCompass={false}
                    showsIndoors={false}
                    showsIndoorLevelPicker={false}
                    showsTraffic={false}
                    showsScale={false}
                    showsBuildings={false}
                    showsPointsOfInterest={false}
                    showsUserLocation={true}
                />
                          <View style={mapStyles.centerMarkerContainer}>
                              <Image  
                                source={title == "drop" ? require("@/assets/icons/drop_marker.png") : require("@/assets/icons/marker.png")}
                                style={mapStyles.marker} />
                          </View>

                          <TouchableOpacity style={mapStyles.gpsButton} onPress={handleGpsButtonPress}>
                              <MaterialCommunityIcons name="crosshairs-gps" size={RFValue(16)} color="#3C75BE" />
                          </TouchableOpacity>
                </View>

                <View style={modalStyles?.footerContainer}>
                    <Text style={modalStyles.addressText} numberOfLines={2}>
                        {address === "" ? "Obteniendo dirección..." : address}
                    </Text>
                    <View style={modalStyles.buttonContainer}>
                        <TouchableOpacity style={modalStyles.button}
                            onPress={() => {
                                onSelectLocation({
                                    type: title,
                                    latitude: region?.latitude,
                                    longitude: region?.longitude,
                                    address: address
                                })
                            }}
                        >
                            <Text style={modalStyles.buttonText}>
                                Establecer Dirección
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </>
        }

    </Modal>
  )
}

export default MapPickerModal