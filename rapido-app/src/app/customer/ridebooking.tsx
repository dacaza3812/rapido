// RideBooking.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StatusBar, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useUserStore } from '@/store/userStore';
import { calculateFare } from '@/utils/mapUtils';
import { rideStyles } from '@/styles/rideStyles';
import CustomText from '@/components/shared/CustomText';
import { commonStyles } from '@/styles/commonStyles';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { RFValue } from 'react-native-responsive-fontsize';
import CustomButton from '@/components/shared/CustomButton';
import RoutesMap from '@/components/customer/RoutesMap';
import { createRide } from '@/service/rideService';

// Función que calcula la hora estimada de llegada dado una distancia (en km)
// y una velocidad promedio (en km/h)
const calculateEstimatedArrival = (distance: number, averageSpeed: number): Date => {
  // Calcula el tiempo de viaje en minutos
  const travelTimeMinutes = (distance / averageSpeed) * 60;
  const arrivalDate = new Date();
  arrivalDate.setMinutes(arrivalDate.getMinutes() + travelTimeMinutes);
  return arrivalDate;
};

const RideBooking = () => {
  const route = useRoute() as any;
  const item = route?.params as any;
  const { location } = useUserStore() as any;
  const [selectedOption, setSelectedOption] = useState("Motocicleta");
  const [loading, setLoading] = useState(false);

  // Cálculo de las tarifas basado en la distancia
  const farePrices = useMemo(
    () => calculateFare(parseFloat(item?.distanceInKm)),
    [item?.distanceInKm]
  );

  // Estado para mantener el tiempo actual (para recalcular el ETA)
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Actualiza cada minuto
    return () => clearInterval(timer);
  }, []);

  // Definición de velocidades promedio según el tipo de vehículo
  const averageSpeeds: Record<string, number> = {
    "Motocicleta": 40,
    "Triciclo": 30,
    "Auto Económico": 35,
    "Auto Premium": 45,
  };

  // Opciones base de viaje sin ETA (se completan a continuación)
  const baseRideOptions = [
    {
      type: "Motocicleta",
      seats: 1,
      price: farePrices?.bike,
      isFastest: true,
      icon: require("@/assets/icons/bike.png")
    },
    {
      type: "Triciclo",
      seats: 3,
      price: farePrices?.auto,
      isFastest: false,
      icon: require("@/assets/icons/auto.png")
    },
    {
      type: "Auto Económico",
      seats: 4,
      price: farePrices?.cabEconomy,
      isFastest: false,
      icon: require("@/assets/icons/cab.png")
    },
    {
      type: "Auto Premium",
      seats: 1,
      price: farePrices?.cabPremium,
      isFastest: true,
      icon: require("@/assets/icons/cab_premium.png")
    },
  ];

  // Para cada opción, calculamos el ETA usando la velocidad promedio correspondiente
  const rideOptions = useMemo(() => {
    return baseRideOptions.map((ride) => {
      const avgSpeed = averageSpeeds[ride.type];
      const distance = parseFloat(item?.distanceInKm);
      const estimatedArrivalDate = calculateEstimatedArrival(distance, avgSpeed);
      const diffMs = estimatedArrivalDate.getTime() - currentTime.getTime();
      const dynamicArrivalMinutes = Math.max(Math.round(diffMs / 60000), 0);
      const arrivalTimeString = estimatedArrivalDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return {
        ...ride,
        time: `${dynamicArrivalMinutes} min`,
        dropTime: arrivalTimeString,
      };
    });
  }, [item?.distanceInKm, currentTime, farePrices]);

  const handleOptionSelect = (type: string) => {
    setSelectedOption(type);
  };

  const handleRideBooking = async () => {
    setLoading(true);
    await createRide({
      vehicle:
        selectedOption === "Auto Económico"
          ? "cabEconomy"
          : selectedOption === "Auto Premium"
          ? "cabPremium"
          : selectedOption === "Motocicleta"
          ? "bike"
          : "auto",
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
    });
    setLoading(false);
  };

  return (
    <View style={rideStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor="orange" translucent={false} />

      {item?.drop_latitude && location?.latitude && (
        <RoutesMap
          drop={{ latitude: parseFloat(item?.drop_latitude), longitude: parseFloat(item?.drop_longitude) }}
          pickup={{ latitude: parseFloat(location?.latitude), longitude: parseFloat(location?.longitude) }}
        />
      )}

      <View style={rideStyles.rideSelectionContainer}>
        <View style={rideStyles.offerContainer}>
          <CustomText fontSize={12} style={rideStyles.offerText}>
            Has obtenido $10 de descuento
          </CustomText>
        </View>

        <ScrollView contentContainerStyle={rideStyles.scrollContainer} showsVerticalScrollIndicator={false}>
          {rideOptions.map((ride, index) => (
            <RideOption
              key={index}
              ride={ride}
              selected={selectedOption}
              onSelect={handleOptionSelect}
            />
          ))}
        </ScrollView>
      </View>

      <TouchableOpacity style={rideStyles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={RFValue(14)} style={{ left: 0 }} color="black" />
      </TouchableOpacity>

      <View style={rideStyles.bookingContainer}>
        <View style={commonStyles.flexRowBetween}>
          <View style={[rideStyles.couponContainer, { borderRightWidth: 1, borderRightColor: "#ccc" }]}>
            <Image source={require("@/assets/icons/rupee.png")} style={rideStyles.icon} />
            <View>
              <CustomText fontFamily="Medium" fontSize={12}>
                Efectivo
              </CustomText>
              <CustomText fontFamily="Medium" fontSize={10} style={{ opacity: 0.7 }}>
                A: {item?.distanceInKm} KM
              </CustomText>
            </View>
            <Ionicons name="chevron-forward" size={RFValue(14)} color="#777" />
          </View>

          <View style={rideStyles.couponContainer}>
            <Image source={require("@/assets/icons/coupon.png")} style={rideStyles.icon} />
            <View>
              <CustomText fontFamily="Medium" fontSize={12}>
                GORAPIDO
              </CustomText>
              <CustomText style={{ opacity: 0.7 }} fontFamily="Medium" fontSize={10}>
                Cupón Aplicado
              </CustomText>
            </View>
            <Ionicons name="chevron-forward" size={RFValue(14)} color="#777" />
          </View>
        </View>

        <CustomButton title="Realizar Viaje" disabled={loading} loading={loading} onPress={handleRideBooking} />
      </View>
    </View>
  );
};

const RideOption = React.memo(({ ride, selected, onSelect }: any) => (
  <TouchableOpacity
    onPress={() => onSelect(ride?.type)}
    style={[rideStyles.rideOption, { borderColor: selected === ride.type ? "#222" : "#ddd" }]}
  >
    <View style={commonStyles.flexRowBetween}>
      <Image source={ride?.icon} style={rideStyles.rideIcon} />
      <View style={rideStyles.rideDetails}>
        <CustomText fontFamily="Medium" fontSize={12}>
          {ride?.type} {ride?.isFastest && <Text style={rideStyles.fastestLabel}>SUPER RÁPIDO</Text>}
        </CustomText>
        <CustomText fontSize={10}>
          {ride?.seats} asientos » llegada: {ride?.time} » Recogida: {ride?.dropTime}
        </CustomText>
      </View>
      <View style={rideStyles.priceContainer}>
        <CustomText fontFamily="Medium" fontSize={14}>
          ${ride?.price?.toFixed(2)}
        </CustomText>
        {selected === ride.type && (
          <Text style={rideStyles.discountedPrice}>
            ${Number(ride?.price + 10).toFixed(2)}
          </Text>
        )}
      </View>
    </View>
  </TouchableOpacity>
));

export default React.memo(RideBooking);
