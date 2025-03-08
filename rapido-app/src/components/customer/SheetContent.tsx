import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { uiStyles } from '@/styles/uiStyles'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { RFValue } from 'react-native-responsive-fontsize'
import CustomText from '../shared/CustomText'
import { commonStyles } from '@/styles/commonStyles'

const cubes = [
    {name: "Moto", imageUri: require("@/assets/icons/bike.png")},
    {name: "Auto", imageUri: require("@/assets/icons/auto.png")},
    {name: "Auto Económico", imageUri: require("@/assets/icons/cab.png")},
    {name: "Paquete", imageUri: require("@/assets/icons/parcel.png")},
    {name: "Auto Premium", imageUri: require("@/assets/icons/cab_premium.png")},
]

const SheetContent = () => {
  return (
    <View style={{height: "100%"}}>
      <TouchableOpacity style={uiStyles.searchBarContainer} onPress={() => router.navigate("/customer/selectlocations")}>
            <Ionicons name='search-outline' size={RFValue(16)} color="black"/>
            <CustomText fontFamily='Medium' fontSize={11}>A dónde quieres ir?</CustomText>
      </TouchableOpacity>

      <View style={commonStyles.flexRowBetween}>
            <CustomText fontFamily='Medium' fontSize={11}>Explora</CustomText>

            <TouchableOpacity style={commonStyles.flexRow}>
                <CustomText fontFamily='Regular' fontSize={10}>
                    Ver Todo
                </CustomText>
                <Ionicons name='chevron-forward' size={RFValue(14)} color="black"/>
            </TouchableOpacity>
      </View>

      <View style={uiStyles.cubes}>
          {
            cubes?.slice(0,4).map((item, index) => (
              <TouchableOpacity key={index} style={uiStyles.cubeContainer} onPress={() => router.navigate("/customer/selectlocations")}>
                <View style={uiStyles.cubeIconContainer}>
                  <Image source={item?.imageUri} style={uiStyles.cubeIcon}/>
                </View>

                <CustomText fontFamily='Medium' fontSize={9.5} style={{textAlign: "center"}}>
                  {item?.name}
                </CustomText>
              </TouchableOpacity>
            ))
          }
      </View>

      <View style={uiStyles.adSection}>
          <Image source={require("@/assets/images/ad_banner.jpg")} style={uiStyles.adImage}/>
      </View>

      <View style={uiStyles.bannerContainer}>
        <Image source={require("@/assets/icons/banner.gif")} style={uiStyles.banner} resizeMode="contain" resizeMethod="resize"/>
      </View>
    </View>
  )
}

export default SheetContent