import { Platform, Text, View, } from 'react-native'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { homeStyles } from '@/styles/homeStyles'
import { StatusBar } from 'expo-status-bar'
import LocationBar from '@/components/customer/LocationBar'
import { screenHeight } from '@/utils/Constants'
import DraggableMap from '@/components/customer/DraggableMap'



const Selectlocations = () => {

  

  return (
    <View >
      <Text>Selec location</Text>
    </View>
  )
}

export default Selectlocations