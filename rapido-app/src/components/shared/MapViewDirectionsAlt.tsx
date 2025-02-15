import React, { useEffect, useState } from 'react';
import { Polyline } from 'react-native-maps';
import axios from 'axios';
import polyline from '@mapbox/polyline';

interface DirectionsResult {
  distance: number;      // en kilómetros
  duration: number;      // en minutos
  coordinates: { latitude: number; longitude: number }[];
}

interface MapViewDirectionsAltProps {
  origin: { latitude: number; longitude: number };
  destination: { latitude: number; longitude: number };
  apikey: string; // Tu token de Mapbox
  strokeWidth?: number;
  strokeColor?: string;
  precision?: string;
  onReady?: (result: DirectionsResult) => void;
  onError?: (errorMessage: string) => void;
  // ... cualquier otra prop que quieras pasar al Polyline
}

const MapViewDirectionsAlt: React.FC<MapViewDirectionsAltProps> = ({
  origin,
  destination,
  apikey,
  strokeWidth = 3,
  strokeColor = 'hotpink',
  precision, // En este ejemplo no se utiliza pero se mantiene por contrato
  onReady = () => {},
  onError = () => {},
  ...props
}) => {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number }[]>([]);

  useEffect(() => {
    if (!origin || !destination) return;

    const fetchDirections = async () => {
      try {
        // Mapbox espera coordenadas en el formato "long,lat"
        const originCoord = `${origin.longitude},${origin.latitude}`;
        const destinationCoord = `${destination.longitude},${destination.latitude}`;
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${originCoord};${destinationCoord}`;
        const response = await axios.get(url, {
          params: {
            geometries: 'polyline', // O 'polyline6' según la precisión deseada
            access_token: apikey,
          },
        });

        if (
          response.data &&
          response.data.routes &&
          response.data.routes.length > 0
        ) {
          const route = response.data.routes[0];
          // Decodifica la polilínea (devuelve un arreglo de [lat, lon])
          const decodedCoords = polyline.decode(route.geometry).map(coord => ({
            latitude: coord[0],
            longitude: coord[1],
          }));
          setCoords(decodedCoords);

          // La API devuelve distancia en metros y duración en segundos
          const distance = route.distance; // en metros
          const duration = route.duration; // en segundos

          onReady({
            distance: distance / 1000, // convertir a kilómetros
            duration: duration / 60,   // convertir a minutos
            coordinates: decodedCoords,
          });
        } else {
          onError('No se encontró una ruta');
        }
      } catch (error: any) {
        onError(error.message);
      }
    };

    fetchDirections();
  }, [origin, destination, apikey]);

  if (coords.length === 0) {
    return null;
  }

  return (
    <Polyline
      coordinates={coords}
      strokeWidth={strokeWidth}
      strokeColor={strokeColor}
      {...props}
    />
  );
};

export default MapViewDirectionsAlt;
