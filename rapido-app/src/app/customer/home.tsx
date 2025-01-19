import { Platform, View,  } from 'react-native'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import {StatusBar} from 'expo-status-bar'
import LocationBar from '@/components/customer/LocationBar'
import { homeStyles } from '@/styles/homeStyles'
import DraggableMap from '@/components/customer/DraggableMap'
import { screenHeight } from '@/utils/Constants'

const androidHeights = [screenHeight * 0.12, screenHeight * 0.42,]
const ioseights = [screenHeight * 0.2, screenHeight *0.5,]

const Home = () => {
  const bottomSheetRef = useRef(null)
      const snapPoints = useMemo(() => Platform.OS === "ios" ? ioseights : androidHeights, [] );
  
      const [mapHeight, setMapHeight] = useState(snapPoints[1])
  
      const handleSheetChanges = useCallback((index:number) => {
          let height = screenHeight * 0.8
          if(index == 1){
              height = screenHeight * 0.5
          }
          setMapHeight(height)
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
    </View>
  )
}

export default Home