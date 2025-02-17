import { View, Text, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { useCaptainStorage } from '@/store/captainStore'
import { useWS } from '@/service/WSProvider'
import { useRoute } from '@react-navigation/native'
import * as Location from "expo-location"
import { resetAndNavigate } from '@/utils/Helpers'
import CaptainLiveTracking from '@/components/captain/CaptainLiveTracking'
import { rideStyles } from '@/styles/rideStyles'
import { updateRideStatus } from '@/service/rideService'
import CaptainActionButton from '@/components/captain/CaptainActionButton'
import OptInputModal from '@/components/captain/OptInputModal'

const CaptainLiveRide = () => {
  const [isOtpModalVisible, setOtpModalVisible] = useState(false)
  const {setLocation, location, setOnDuty} = useCaptainStorage()
  const {emit, on, off} = useWS()
  const [rideData, setRideData] = useState<any>(null)
  const route = useRoute() as any;
  const params = route?.params || {};
  const id = params.id;

  useEffect(() =>{
    let locationsSubscription: any;

    const startLocationUpdates = async () => {
      const {status} = await Location.requestForegroundPermissionsAsync();
      if(status === "granted"){
        locationsSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 2,
          },
          (location) => {
            const {latitude, longitude, heading} = location.coords;
            setLocation({latitude: latitude, longitude: longitude, address: "Somewere", heading: heading as number})
            setOnDuty(true);

            emit("goOnDuty", {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              heading: heading as number
            });

            emit("updateLocation", {
              latitude,
              longitude,
              heading,
            });
            console.log(`Location update: Lat ${latitude}, Lon ${longitude}, Heading: ${heading}`)
          }
        );
      }else {
        console.log("Permisos de ubicación denegados")
      }
    };

    startLocationUpdates();

    return () => {
      if(locationsSubscription){
        locationsSubscription.remove()
      }
    }
  }, [id]);

  useEffect(() => {
    if(id){
      emit("subscribeRide", id);

      on("rideData", (data) => {
        setRideData(data)
      });

      on("rideCanceled", (error) => {
        console.log(error);
        resetAndNavigate("/captain/home")
        Alert.prompt("Viaje Cancelado")
      });

      on("rideUpdate", (data) => {
        setRideData(data)
      })

      on("error", (error) => {
        console.log(error)
        resetAndNavigate("/captain/home")
        Alert.prompt("Hubo un error")
      });

      return () => {
        off("rideData");
        off("error");
      }
    }
  }, [id, emit, on, off])

  return (
    <View style={rideStyles.container}>
      <StatusBar
        style='light'
        backgroundColor='orange'
        translucent={false}
      />

      {
        rideData &&
        <CaptainLiveTracking
          status={rideData?.status}
          drop={{ latitude: parseFloat(rideData?.drop?.latitude), longitude: parseFloat(rideData?.drop?.longitude) }}
          pickup={{ latitude: parseFloat(rideData?.pickup?.latitude), longitude: parseFloat(rideData?.pickup?.longitude) }}
          captain={{ latitude: location?.latitude, longitude: location?.longitude, heading: location?.heading }} />
      }

      <CaptainActionButton
        ride={rideData}
        title={rideData?.status === "START" ? "ARRIVED" : rideData?.status === "ARRIVED"? "COMPLETED" : "SUCCESS"}
        onPress={async () => {
          if(rideData?.status === "START"){
            setOtpModalVisible(true)
            return
          }
          const isSucces = await updateRideStatus(rideData?._id, "COMPLETED")
          if(isSucces){
            Alert.alert("COngratulations, you rock")
            resetAndNavigate("/captain/home")
          }else {
            Alert.alert("ubo un error")
          }
        }}
        color="#228B22"
      />
      {
        isOtpModalVisible &&
        <OptInputModal
          visible={isOtpModalVisible}
          onClose={() => setOtpModalVisible(false)}
          title='Enter OTP Below'
          onConfirm={async (otp) => {
           if(otp === rideData?.otp){
            const isSucces = await updateRideStatus(rideData?._id, "ARRIVED")
            if(isSucces){
              setOtpModalVisible(false)
            }else{
              Alert.alert("Error Técnico")
            }
           } else{
            Alert.alert("OTP Erroneo")
           }
          }}
        />
      }
    </View>
  )
}

export default CaptainLiveRide