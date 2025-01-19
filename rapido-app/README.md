# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.


2:57:37

3:00

FA:C2:34:61:2C:59:9E:0F:08:72:17:6A:CA:D1:1E:66:1B:D5:64:15

    <View style={{height: height, width: "100%"}}>
        <MapView
          ref={mapRef}
          maxZoomLevel={16}
          minZoomLevel={12}
          pitchEnabled={false}
          style={{flex: 1}}
          onRegionChangeComplete={handleRegionChangeComplete}
          initialRegion={tunasIntialRegion}
          provider='google'
          customMapStyle={customMapStyle}
          showsMyLocationButton={false}
          showsCompass={false}
          showsIndoors={false}
          showsIndoorLevelPicker={false}
          showsTraffic={false}
          showsScale={false}
          showsBuildings={false}
          showsPointsOfInterest={false}
          showsUserLocation={true}
        >
            {
              markers?.map((marker:any, index:number) => (
                marker.visible && (
                  <Marker
                    zIndex={index+1}
                    key={index}
                    flat
                    anchor={{x:0.5, y:0.5}}
                    coordinate={{latitude: marker?.latitude, longitude: marker?.longitude}}
                  >
                    <View style={{transform:[{rotate: `${marker?.rotation}deg`}]}}>
                      <Image
                        source={
                          marker?.type === "bike" ?
                          require("@/assets/icons/bike_marker.png"):
                          marker?.type === "auto" ?
                            require("@/assets/icons/auto_marker.png"):
                            require("@/assets/icons/cab_marker.png")
                        }
                        style={{height: 40, width: 40, resizeMode:"contain"}}
                      />
                    </View>
                  </Marker>
                )
              ))
            }
        </MapView>

        <View style={mapStyles.centerMarkerContainer}>
          <Image source={require("@/assets/icons/marker.png")} style={mapStyles.marker}/>
        </View>

        <TouchableOpacity style={mapStyles.gpsButton} onPress={handleGpsButtonPress}>
          <MaterialCommunityIcons name="crosshairs-gps" size={RFValue(16)} color="#3C75BE"/>
        </TouchableOpacity>

        {
          outOfRange && (
            <View style={mapStyles.outOfRange}>
              <FontAwesome6 name="road-circle-exclamation" size={24} color="red" />  
            </View>
          )
        }

    </View>