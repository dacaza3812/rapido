import { View, Text } from 'react-native'
import React, { FC, useRef } from 'react'
import MapView, {UrlTile} from 'react-native-maps'
import {  customMapStyle, indiaIntialRegion } from '@/utils/CustomMap'

const DraggableMap: FC<{height: number}> = ({height}) => {
    const mapRef = useRef<MapView>(null)

    const handleRegionChangeComplete = async () => {

    }

  return (
    <View style={{height: height, width: "100%"}}>
      <MapView
        
        style={{flex: 1}}
        onRegionChangeComplete={handleRegionChangeComplete}
      >
        <UrlTile
            urlTemplate='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            maximumZ={19}
            flipY={false}
        />
      </MapView>
    </View>
  )
}

export default DraggableMap