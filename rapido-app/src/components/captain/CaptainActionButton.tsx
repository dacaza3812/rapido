import { View, Text } from 'react-native'
import React, { FC } from 'react'
import { Ionicons } from '@expo/vector-icons';
import { rideStyles } from '@/styles/rideStyles';
import { commonStyles } from '@/styles/commonStyles';
import CustomText from '../shared/CustomText';
import { orderStyles } from '@/styles/captainStyles';
import SwipeButton from "rn-swipe-button"
import { RFValue } from 'react-native-responsive-fontsize';

const CaptainActionButton: FC<{ride: any, color?: string; title: string, onPress: () => void}> = ({onPress,ride,title,color}) => {

    const CheckoutButton = () => (
        <Ionicons name='arrow-forward-sharp' style={{bottom: 2}} size={32} color="#fff"/>
    )
    
  return (
    <View style={rideStyles?.swipeableContaninerCaptain}>
        <View style={commonStyles?.flexRowBetween}>
            <CustomText fontSize={11} style={{marginTop: 10, marginBottom: 3}} numberOfLines={1} fontFamily='Medium'>
                Conoce al Cliente
            </CustomText>
            <CustomText fontSize={11} style={{marginTop: 10, marginBottom: 3}} numberOfLines={1} fontFamily='Medium'>
                +53 {ride?.customer?.phone && ride?.customer?.phone?.slice(0, 5) + " " + ride?.customer?.phone?.slice(5)}
            </CustomText>
        </View>

        <View style={orderStyles.locationsContainer}>

            <View style={orderStyles.flexRowBase}>
                <View>
                    <View style={orderStyles.pickupHollowCircle}/>
                    <View style={orderStyles.continuousLine}/>
                </View>
                <View style={orderStyles.infoText}>
                    <CustomText fontFamily='SemiBold' fontSize={11} numberOfLines={1}>
                        {ride?.pickup?.address?.slice(0, 10)}
                    </CustomText>
                    <CustomText fontFamily='Medium' fontSize={9.5} numberOfLines={2} style={orderStyles.label}>
                        {ride?.pickup?.address}
                    </CustomText>
                </View>
            </View>

            <View style={orderStyles.flexRowBase}>
                <View>
                    <View style={orderStyles.pickupHollowCircle}/>
                    <View style={orderStyles.continuousLine}/>
                </View>
                <View style={orderStyles.infoText}>
                    <CustomText fontFamily='SemiBold' fontSize={11} numberOfLines={1}>
                        {ride?.drop?.address?.slice(0, 10)}
                    </CustomText>
                    <CustomText fontFamily='Medium' fontSize={9.5} numberOfLines={2} style={orderStyles.label}>
                        {ride?.drop?.address}
                    </CustomText>
                </View>
            </View>

        </View>

        <SwipeButton
            containerStyles={rideStyles.swipeButtonContainer}
            height={30}
            shouldResetAfterSuccess={true}
            resetAfterSuccessAnimDelay={200}
            onSwipeSuccess={onPress}
            railBackgroundColor={color}
            railStyles={rideStyles.railStyles}
            railBorderColor='transparent'
            railFillBackgroundColor='rgba(255, 255, 255, 0.5)'
            railFillBorderColor='rgba(255, 255, 255, 0.5)'
            titleColor='#fff'
            titleFontSize={RFValue(13)}
            titleStyles={rideStyles.titleStyles}
            thumbIconComponent={CheckoutButton}
            thumbIconStyles={rideStyles.thumbIconStyles}
            title={title.toUpperCase()}
            thumbIconBackgroundColor='transparent'
            thumbIconBorderColor='transparent'
            thumbIconHeight={50}
            thumbIconWidth={60}
        />
    </View>
  )
}

export default CaptainActionButton