import { Platform, View, } from 'react-native'
import React, { useMemo, useRef, useState } from 'react'
import { homeStyles } from '@/styles/homeStyles'
import { StatusBar } from 'expo-status-bar'
import LocationBar from '@/components/customer/LocationBar'
import { screenHeight } from '@/utils/Constants'

const androidHeights = [screenHeight * 0.12, screenHeight * 0.42,]
const ioseights = [screenHeight * 0.2, screenHeight *0.5,]

const Selectlocations = () => {

    const bottomSheetRef = useRef(null)
    const snapPoints = useMemo(() => Platform.OS === "ios" ? ioseights : androidHeights, [] );

    const [mapHeight, setMapHeight] = useState(snapPoints[0])
  return (
    <View style={homeStyles.container}>
      <StatusBar
        style='auto'
        backgroundColor='orange'
        translucent={false}
      />
      <LocationBar />
    </View>
  )
}

export default Selectlocations