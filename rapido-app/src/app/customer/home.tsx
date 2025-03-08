import { Platform, View,  } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {StatusBar} from 'expo-status-bar'
import LocationBar from '@/components/customer/LocationBar'
import { homeStyles } from '@/styles/homeStyles'
import DraggableMap from '@/components/customer/DraggableMap'
import { screenHeight } from '@/utils/Constants'
import  BottomSheet, {BottomSheetScrollView} from "@gorhom/bottom-sheet"
import SheetContent from '@/components/customer/SheetContent'
import { getMyRides } from '@/service/rideService'

const androidHeights = [screenHeight * 0.12, screenHeight * 0.42,]
const ioseights = [screenHeight * 0.2, screenHeight *0.5,]

const Home = () => {
  const bottomSheetRef = useRef(null)
      const snapPoints = useMemo(() => Platform.OS === "ios" ? ioseights : androidHeights, [] );
  
      const [mapHeight, setMapHeight] = useState(snapPoints[0])
  
      const handleSheetChanges = useCallback((index:number) => {
          let height = screenHeight * 0.8
          if(index == 1){
              height = screenHeight * 0.5
          }
          setMapHeight(height)
      }, [])

      useEffect(() => {
        getMyRides()
      }, [])

  return (
    <View style={homeStyles.container}>
      <StatusBar
        style='auto'
        backgroundColor='orange'
        translucent={false}
      />
      <LocationBar />
      <DraggableMap height={mapHeight}/>

      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        handleIndicatorStyle={{
          backgroundColor: "#ccc"
        }}
        enableOverDrag={false}
        enableDynamicSizing
        style={{zIndex:4}}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
      >
        <BottomSheetScrollView contentContainerStyle={homeStyles.scrollContainer}>
          <SheetContent />
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  )
}

export default Home