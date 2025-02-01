import { View, Text, StatusBar,  } from 'react-native'
import React, { useCallback, useMemo, useState } from 'react'
import { useRoute } from '@react-navigation/native'
import { useUserStore } from '@/store/userStore'
import { calculateFare } from '@/utils/mapUtils'
import { rideStyles } from '@/styles/rideStyles'

const RideBooking = () => {
  const route = useRoute() as any
  const item = route?.params as any;
  const {location} = useUserStore() as any
  const [selectedLocation, setSelectedLocation] = useState("Bike");
  const [loading, setLoading] = useState(false)

  const farePrices = useMemo(() => calculateFare(parseFloat(item?.distanceInKm)), [item?.distanceInKm])

  const rideOptions = useMemo(() => [
    {type:"Bike", 
      seats: 1, 
      time: "1 min", 
      dropTime: "4:28 pm", 
      price:farePrices?.bike, 
      isFastest: true, 
      icon: require("@/assets/icons/bike.png")},
      {type:"Auto", 
        seats: 3, 
        time: "1 min", 
        dropTime: "4:28 pm", 
        price:farePrices?.auto, 
        isFastest: true, 
        icon: require("@/assets/icons/auto.png")},
        {type:"Cab Economy", 
          seats: 4, 
          time: "1 min", 
          dropTime: "4:28 pm", 
          price:farePrices?.cabEconomy, 
          isFastest: true, 
          icon: require("@/assets/icons/cab.png")},
          {type:"Cab Premium", 
            seats: 1, 
            time: "1 min", 
            dropTime: "4:28 pm", 
            price:farePrices?.cabPremium, 
            isFastest: true, 
            icon: require("@/assets/icons/cab_premium.png")},
  ], [farePrices])

  const handleOptionSelect = useCallback((type: string) => {
    setSelectedLocation(type)
  }, [])

  return (
    <View style={rideStyles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="orange"
        translucent={false}
      />
    </View>
  )
}

export default RideBooking