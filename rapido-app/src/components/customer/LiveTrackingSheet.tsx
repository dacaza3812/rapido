import { View, Text, Image, TouchableOpacity, Alert } from 'react-native'
import React, { FC, useEffect, useState } from 'react'
import { useWS } from '@/service/WSProvider';
import { rideStyles } from '@/styles/rideStyles';
import { commonStyles } from '@/styles/commonStyles';
import { vehicleIcons } from '@/utils/mapUtils';
import CustomText from '../shared/CustomText';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { resetAndNavigate } from '@/utils/Helpers';

type VehicleType = "bike" | "auto" | "cabEconomy" | "cabPremium"

interface RideItem {
  _id: string,
  vehicle?: VehicleType;
  pickup?: { address: string };
  drop?: { address: string };
  fare?: number;
  otp?: string;
  captain: any;
  status: string
}


const LiveTrackingSheet: FC<{ item: RideItem }> = ({ item }) => {
  

  useEffect(()=> {
    if(item?.status === "COMPLETED"){
      console.log(item?.status)
      Alert.alert("Viaje Completado", "Usted será redirigido a la vista principal");
      resetAndNavigate("/customer/home")
      return
    }
  }, [item?.status])

  const { emit } = useWS()
  return (
    <View>
      <View style={rideStyles?.headerContainer}>
        <View style={commonStyles.flexRowGap}>
          {
            item.vehicle && (
              <Image source={vehicleIcons[item.vehicle]?.icon} style={rideStyles.rideIcon} />
            )
          }

          <View>
          <CustomText fontSize={10}>
            {
              item?.status === "START" ? "Choferes cerca de ti" :
                item?.status === "ARRIVED"
                  ? "HAPPY JOURNEY" :
                  "WHOOOOO 😎"
            }
          </CustomText>

          <CustomText>
            {item?.status === "START" ? `OTP - ${item?.otp}` : " "}
          </CustomText>
          </View>
        </View>

        <CustomText fontSize={11} numberOfLines={1} fontFamily='Medium'>
          +53 {item?.captain?.phone && item?.captain?.phone?.slice(0, 5) + " " + item?.captain?.phone?.slice(5)}
        </CustomText>
      </View>

      <View style={{ padding: 10 }}>
        <CustomText fontFamily='SemiBold' fontSize={12}>
          Detalles de Ubicación
        </CustomText>

        <View style={[commonStyles.flexRowGap, { marginVertical: 15, width: "90%" }]}>
          <Image source={require("@/assets/icons/marker.png")} style={rideStyles.pinIcon} />
          <CustomText fontSize={10} numberOfLines={2}>
            {item?.pickup?.address}
          </CustomText>
        </View>

        <View style={[commonStyles.flexRowGap, { width: "90%" }]}>
          <Image source={require("@/assets/icons/drop_marker.png")} style={rideStyles.pinIcon} />
          <CustomText fontSize={10} numberOfLines={2}>
            {item?.drop?.address}
          </CustomText>
        </View>

        <View style={{ marginVertical: 20 }}>
          <View style={[commonStyles.flexRowBetween]}>

            <View style={commonStyles.flexRow}>
              <MaterialCommunityIcons name='credit-card' size={24} color="black" />
              <CustomText style={{ marginLeft: 10 }} fontFamily='SemiBold'>
                Pago
              </CustomText>
            </View>

            <CustomText fontFamily='SemiBold' fontSize={14}>
              $ {item.fare?.toFixed(2)} CUP
            </CustomText>
          </View>

          <CustomText fontSize={10}>
            Pagar en efectivo
          </CustomText>
        </View>
      </View>

            <View style={rideStyles.bottomButtonContainer}>
              <TouchableOpacity style={rideStyles.cancelButton} onPress={() => { emit("cancelRide", item?._id)}}>
                <CustomText style={rideStyles.backButtonText}>
                  Cancelar
                </CustomText>
              </TouchableOpacity>

              <TouchableOpacity style={rideStyles.backButton2} onPress={() => {
                if(item?.status === "COMPLETED") {
                  resetAndNavigate("/customer/home")
                  return
                }
              }}>
                <CustomText style={rideStyles.backButtonText}>
                  Atrás
                </CustomText>
              </TouchableOpacity>
            </View>
    </View>
  )
}

export default LiveTrackingSheet