import { View, Text, Platform, StatusBar, Alert, ActivityIndicator } from 'react-native'
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRoute } from '@react-navigation/native'
import { screenHeight } from '@/utils/Constants'
import { useWS } from '@/service/WSProvider'
import { rideStyles } from '@/styles/rideStyles'
import { resetAndNavigate } from '@/utils/Helpers'
import LiveTrackingMap from '@/components/customer/LiveTrackingMap'
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import SearchingRideSheet from '@/components/customer/SearchingRideSheet'
import LiveTrackingSheet from '@/components/customer/LiveTrackingSheet'

const androidHeights = [screenHeight * 0.12, screenHeight * 0.42,]
const ioseights = [screenHeight * 0.2, screenHeight *0.5,]

const LiveRide = () => {
  const {emit, on, off} = useWS()
  const [rideData, setRideData] = useState<any>(null)
  const [captainCoords, setCaptainCoords] = useState<any>(null)
  const route = useRoute() as any;
  const params = route?.params || {}
  const id = params.id;

  const bottomSheetRef = useRef(null);
  const snapPoint = useMemo(() => Platform.OS === "ios" ? ioseights : androidHeights, [])
  const [mapHeight, setMapHeight] = useState(snapPoint[0])

  const handleSheetChanges = useCallback((index: number) => {
    let height = screenHeight * 0.8
    if(index == 1){
      height = screenHeight * 0.5
    }
    setMapHeight(height)
  }, []);

 useEffect(() => {
  if(id){
    emit("subscribeRide", id)

    on("rideData", (data) => {
      setRideData(data)
      if(data?.status === "SEARCHING_FOR_CAPTAIN"){
        emit("searchCaptain", id)
      }
    })

    on("rideUpdate", (data) => {
      setRideData(data)
    })

    on("rideCanceled", (error) => {
      resetAndNavigate("/customer/home")
      Alert.alert("viaje Cancelado")
    })

    on("error", (error) => {
      resetAndNavigate("/customer/home")
      Alert.alert("Ups....no encontramos choferes")
    })
  }

  return () => {
    off("rideData");
    off("rideUpdate");
    off("rideCanceled");
    off("error");
  };

 }, [id, emit, on, off])
  
 useEffect(() => {
    if(rideData?.captain?._id){
      emit("subscribeToCaptainLocation", rideData?.captain?._id)
      on("captainLocationUpdate", (data) => {
        setCaptainCoords(data?.coords);
      })
    }

    return() => {
      off("captainLocationUpdate")
    }
 }, [rideData])

  return (
    <View style={rideStyles.container}>
      <StatusBar
        barStyle="default"
        backgroundColor="orange"
        translucent={false}
      />
      {
        rideData &&
        <LiveTrackingMap
          height={mapHeight}
          status={rideData?.status}
          drop={{latitude: parseFloat(rideData?.drop?.latitude), longitude: parseFloat(rideData?.drop?.longitude)}}
          pickup={{latitude: parseFloat(rideData?.pickup?.latitude), longitude: parseFloat(rideData?.pickup?.longitude)}}
          captain={
            captainCoords
              ? {
                latitude: captainCoords.latitude,
                longitude: captainCoords.longitude,
                heading: captainCoords.heading
              }
              : {}
          }
        />
      }
      {
        rideData ?
        <BottomSheet
          ref={bottomSheetRef}
          index={1}
          handleIndicatorStyle={{
            backgroundColor: "#ccc"
          }}
          enableOverDrag={false}
          enableDynamicSizing={false}
          style={{zIndex: 4}}
          snapPoints={snapPoint}
          onChange={handleSheetChanges}
        >
          <BottomSheetScrollView contentContainerStyle={rideStyles?.container}>
            {
              rideData?.status !== "SEARCHING_FOR_CAPTAIN" ?
                <SearchingRideSheet item={rideData}/>
                :
                <LiveTrackingSheet item={rideData} />
            }
          </BottomSheetScrollView>
        </BottomSheet>
        :
        <View style={{flex: 1, justifyContent: "center", alignContent: "center"}}>
          <ActivityIndicator color="black" size="small"/>
        </View>
      }
    </View>
  )
}

export default memo(LiveRide)