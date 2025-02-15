import { View, Text, StatusBar, ScrollView, TouchableOpacity, Image,  } from 'react-native'
import React, { memo, useCallback, useMemo, useState } from 'react'
import { useRoute } from '@react-navigation/native'
import { useUserStore } from '@/store/userStore'
import { calculateFare } from '@/utils/mapUtils'
import { rideStyles } from '@/styles/rideStyles'
import CustomText from '@/components/shared/CustomText'
import { commonStyles } from '@/styles/commonStyles'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { RFValue } from 'react-native-responsive-fontsize'
import CustomButton from '@/components/shared/CustomButton'
import RoutesMap from '@/components/customer/RoutesMap'
import { createRide } from '@/service/rideService'

const RideBooking = () => {
  const route = useRoute() as any
  const item = route?.params as any;
  const {location} = useUserStore() as any
  const [selectedOption, setSelectedOption] = useState("Bike");
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
        isFastest: false, 
        icon: require("@/assets/icons/auto.png")},
        {type:"Cab Economy", 
          seats: 4, 
          time: "1 min", 
          dropTime: "4:28 pm", 
          price:farePrices?.cabEconomy, 
          isFastest: false, 
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
    setSelectedOption(type)
  }, [])

  const handleRideBooking = async () => {
    setLoading(true)

    await createRide({
      vehicle: selectedOption === "Cab Economy" ? "cabEconomy" 
        : selectedOption === "Cab Premium" ? "cabPremium" : selectedOption === "Bike" ? "bike" : "auto",
        drop: {
          latitude: parseFloat(item.drop_latitude),
          longitude: parseFloat(item.drop_longitude),
          address: item?.drop_address
        },
        pickup: {
          latitude: parseFloat(location.latitude),
          longitude: parseFloat(location.longitude),
          address: location.address
        }
    })
  }

  return (
    <View style={rideStyles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="orange"
        translucent={false}
      />

    {
      item?.drop_latitude && location?.latitude && (
        <RoutesMap
          drop={{latitude: parseFloat(item?.drop_latitude), longitude: parseFloat(item?.drop_longitude)}}
          pickup={{latitude: parseFloat(location?.latitude), longitude: parseFloat(location?.longitude)}}
        />
      )
    }
      
      <View style={rideStyles.rideSelectionContainer}>
        <View style={rideStyles?.offerContainer}>
          <CustomText fontSize={12} style={rideStyles.offerText}>
            Has obtenido $10 de descuento
          </CustomText>
        </View>

        <ScrollView contentContainerStyle={rideStyles?.scrollContainer} showsVerticalScrollIndicator={false}>
          {
            rideOptions?.map((ride, index) => (
              <RideOption
                key={index}
                ride={ride}
                selected={selectedOption}
                onSelect={handleOptionSelect}
              />
            ))
          }
        </ScrollView>
      </View>

          <TouchableOpacity style={rideStyles.backButton} onPress={() => router.back()}>
            <Ionicons name='arrow-back' size={RFValue(14)} style={{left: 0}} color="black"/>
          </TouchableOpacity>

          <View style={rideStyles.bookingContainer}>
            <View style={commonStyles.flexRowBetween}>
              <View style={[rideStyles.couponContainer, {borderRightWidth: 1, borderRightColor: "#ccc"}]}>
                <Image source={require("@/assets/icons/rupee.png")} style={rideStyles?.icon}/>
                <View>
                  <CustomText fontFamily='Medium' fontSize={12}>Efectivo</CustomText>
                  <CustomText fontFamily='Medium' fontSize={10} style={{opacity: 0.7}}>A: {item?.distanceInKm} KM</CustomText>
                </View>
                <Ionicons name='chevron-forward' size={RFValue(14)} color="#777"/>
              </View>

              <View style={rideStyles.couponContainer}>
                  <Image source={require("@/assets/icons/coupon.png")} style={rideStyles?.icon}/>
                <View>
                  <CustomText fontFamily='Medium' fontSize={12}>GORAPIDO</CustomText>
                  <CustomText style={{opacity: 0.7}} fontFamily='Medium' fontSize={10}>Cupon Aplicado</CustomText>
                </View>
                  <Ionicons name='chevron-forward' size={RFValue(14)} color="#777"/>
              </View>
            </View>

            <CustomButton
              title='Book Ride'
              disabled={loading}
              loading={loading}
              onPress={handleRideBooking}
            />

          </View>

    </View>
  )
}

const RideOption = memo(({ride, selected, onSelect}: any) => (
  <TouchableOpacity
    onPress={() => onSelect(ride?.type)}
    style={[
      rideStyles.rideOption,
      {borderColor: selected === ride.type ? "#222" : "#ddd"}
    ]}
  >
    <View style={commonStyles.flexRowBetween}>
      <Image source={ride?.icon} style={rideStyles?.rideIcon}/>
      <View style={rideStyles?.rideDetails}>
        <CustomText fontFamily='Medium' fontSize={12}>
          {ride?.type} {ride?.isFastest && <Text style={rideStyles.fastestLabel}>SUPER RAPIDO</Text>}
        </CustomText>
        <CustomText fontSize={10}>
          {ride?.seats} asientos » llegada: {ride?.time} » Recogida: {ride?.dropTime}
        </CustomText>
      </View>

      <View style={rideStyles?.priceContainer}>
        <CustomText fontFamily='Medium' fontSize={14}>
          ${ride?.price?.toFixed(2)}
        </CustomText>
        {selected === ride.type && <Text style={rideStyles?.discountedPrice}>${Number((ride?.price + 10)).toFixed(2)}</Text>}
      </View>
    </View>
  </TouchableOpacity>
))

export default memo(RideBooking)