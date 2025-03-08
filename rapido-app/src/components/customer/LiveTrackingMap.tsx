import { View, Text, Image, TouchableOpacity } from 'react-native'
import React, { FC, memo, useEffect, useRef, useState } from 'react'
import MapView, { Marker, Polyline } from 'react-native-maps'
import { customMapStyle, tunasIntialRegion } from '@/utils/CustomMap'
import MapViewDirectionsAlt from '../shared/MapViewDirectionsAlt'
import { Colors } from '@/utils/Constants'
import { getPoints } from '@/utils/mapUtils'
import { mapStyles } from '@/styles/mapStyles'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { RFValue } from 'react-native-responsive-fontsize'

const apikey = process.env.EXPO_PUBLIC_MAPBOX_API_KEY || "sk.eyJ1IjoiZGFjYXphIiwiYSI6ImNtNmpjMmhmajBobWoya3ByNGhlMnZlZWgifQ.QJmQ4pkf78lHlqTFIUCXTQ"

const LiveTrackingMap: FC<{height: number, drop: any, pickup: any, captain: any, status:string}> = ({
    drop,
    status,
    height,
    pickup,
    captain
}) => {

    const mapRef = useRef<MapView>(null)
    const [isUserInteracting, setIsUserInteracting] = useState(false)

    const fitToMarkers = async() => {
        if(isUserInteracting) return;
        const coordinates = [];
        
        if(pickup?.latitude && pickup?.longitude && (status === "START")){
            coordinates.push({latitude: pickup.latitude, longitude: pickup.longitude});
        }

        if(drop?.latitude && drop?.longitude && status === "ARRIVED"){
            coordinates.push({latitude: drop.latitude, longitude: drop.longitude});
        }

        if(captain?.latitude && captain?.longitude){
            coordinates.push({latitude: captain.latitude, longitude: captain.longitude});
        }

        if(coordinates.length === 0) return;
        
        try {
            mapRef.current?.fitToCoordinates(coordinates, {
                edgePadding: {top: 50, right: 50, bottom:50, left: 50},
                animated: true
            })
        } catch (error) {
            console.log(error)
        }
    }

    const calculateInitialRegion = () => {
            if(pickup?.latitude && drop?.latitude){
                const latitude = (pickup?.latitude + drop?.latitude) / 2
                const longitude = (pickup?.longitude + drop?.longitude) / 2
                return {
                    latitude,
                    longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }
            }
            return tunasIntialRegion
    };
    
    
    useEffect(() => {
        
        if(pickup?.latitude && drop?.latitude){
            fitToMarkers();
        } 
    }, [drop?.latitude, pickup?.latitude, captain.latitude])

  return (
    <View style={{height: height, width: "100%"}}>
          <MapView
              ref={mapRef}
              maxZoomLevel={20}
              followsUserLocation
              style={{ flex: 1 }}
              initialRegion={calculateInitialRegion()}
              provider='google'
              showsMyLocationButton={false}
              showsCompass={false}
              showsIndoors={false}
              customMapStyle={customMapStyle}
              showsUserLocation={true}
              onRegionChange={() => setIsUserInteracting(true)}
              onRegionChangeComplete={() => setIsUserInteracting(false)}
              minZoomLevel={12}
              pitchEnabled={false}
              showsIndoorLevelPicker={false}
              showsTraffic={false}
              showsScale={false}
              showsBuildings={false}
              showsPointsOfInterest={false}
          >
        { 
                captain?.latitude && pickup?.latitude && (
                    <MapViewDirectionsAlt
                        origin={captain}
                        destination={status === "START" ? pickup: drop}
                        apikey={apikey}
                        strokeWidth={5}
                        precision="high"
                        onReady={fitToMarkers}
                        strokeColor={Colors.iosColor}
                        onError={(err) => console.log(err)}
                    />
                ) 
            }

{
                drop?.latitude && (
                    <Marker
                        coordinate={{latitude: drop.latitude, longitude: drop.longitude}}
                        anchor={{x: 0.5, y:1}}
                        zIndex={1}
                    >
                        <Image
                            source={require("@/assets/icons/drop_marker.png")}
                            style={{height: 30, width: 30, resizeMode: "contain"}}
                        />
                    </Marker>
                )
            }

            {
                            pickup?.latitude && (
                                <Marker
                                    coordinate={{latitude: pickup.latitude, longitude: pickup.longitude}}
                                    anchor={{x: 0.5, y:1}}
                                    zIndex={2}
                                >
                                    <Image
                                        source={require("@/assets/icons/marker.png")}
                                        style={{height: 30, width: 30, resizeMode: "contain"}}
                                    />
                                </Marker>
                            ) 
                        }

{
                captain?.latitude && (
                      <Marker
                          coordinate={{ latitude: captain.latitude, longitude: captain.longitude }}
                          anchor={{ x: 0.5, y: 1 }}
                          zIndex={3}
                      >
                          <View style={{transform: [{rotate: `${captain?.heading}deg`}]}}>
                              <Image
                                  source={require("@/assets/icons/cab_marker.png")}
                                  style={{ height: 30, width: 30, resizeMode: "contain" }}
                              />
                          </View>

                      </Marker>
                ) 
            }

            {
                drop && pickup && 
                <Polyline
                    coordinates={getPoints([drop, pickup])}
                    strokeColor={Colors.text}
                    strokeWidth={2}
                    geodesic={true}
                    lineDashPattern={[12, 10]}
                />
            }
</MapView>

    <TouchableOpacity style={mapStyles.gpsButton} onPress={fitToMarkers}>
        <MaterialCommunityIcons name='crosshairs-gps' size={RFValue(16)} color="#3C75BE"/>
    </TouchableOpacity>

      
      
    </View>
  )
}

export default memo(LiveTrackingMap)