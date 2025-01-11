import { View,  } from 'react-native'
import React from 'react'
import {StatusBar} from 'expo-status-bar'
import LocationBar from '@/components/customer/LocationBar'
import { homeStyles } from '@/styles/homeStyles'

const Home = () => {
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

export default Home