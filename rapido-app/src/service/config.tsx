import {Platform} from 'react-native'

export const BASE_URL = Platform.OS === "ios" ?
    "http://localhost:3000" :
    "http://192.168.1.101:3000" 


export const SOCKET_URL = Platform.OS === "ios" ?
    "ws://localhost:3000" :
    "ws://192.168.1.101:3000"