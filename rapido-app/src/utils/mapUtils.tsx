import axios from "axios";
import { useUserStore } from "@/store/userStore";

export const getLatLong = async (placeId: string, description: string) => {
    try {
        const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${description}.json`, {
            params: {
                placeid: placeId,
                access_token: "sk.eyJ1IjoiZGFjYXphIiwiYSI6ImNtNmpjMmhmajBobWoya3ByNGhlMnZlZWgifQ.QJmQ4pkf78lHlqTFIUCXTQ",
            },
        });
        const data = response.data;
        if (data.features.length > 0) {
            const location = data.features[0].geometry.coordinates; // Mapbox devuelve [longitude, latitude]
            const address = data.features[0].place_name;

            return {
                latitude: location[1],  // Mapbox: [lon, lat], se invierte para que sea lat, lon
                longitude: location[0],
                address: address,
            };
        } else {
            throw new Error('Unable to fetch location details');
        }
    } catch (error) {
        throw new Error('Unable to fetch location details');
    }
}

export const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
        const response = await axios.get(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json`,
            {
                params: {
                    access_token: "sk.eyJ1IjoiZGFjYXphIiwiYSI6ImNtNmpjMmhmajBobWoya3ByNGhlMnZlZWgifQ.QJmQ4pkf78lHlqTFIUCXTQ",
                }
            }
        );
        if (response.data.features.length > 0) {
            const address = response.data.features[0].place_name;
            return address;
        } else {
            console.log('Geocoding failed: ', response.data.status);
            return "";
        }
    } catch (error) {
        console.log('Error during reverse geocoding: ', error);
        return "";
    }
};

function extractPlaceData(data: any) {
    return data.map((item: any) => ({
        place_id: item.id,  // Mapbox usa 'id' en lugar de 'place_id'
        title: item.text,   // 'text' es el nombre del lugar
        description: item.place_name,  // 'place_name' es la descripción del lugar
    }));
}

export const getPlacesSuggestions = async (query: string) => {
    const { location } = useUserStore.getState();
    try {
        const response = await axios.get(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json`,
            {
                params: {
                    proximity: `${location?.longitude},${location?.latitude}`,
                    access_token: "sk.eyJ1IjoiZGFjYXphIiwiYSI6ImNtNmpjMmhmajBobWoya3ByNGhlMnZlZWgifQ.QJmQ4pkf78lHlqTFIUCXTQ",
                }
            }
        );

        console.log("RESPONSE", location)

        // Procesar los resultados de Mapbox para que coincidan con tu estructura
        return extractPlaceData(response.data.features);

    } catch (error) {
        console.error('Error fetching autocomplete suggestions:', error);
        return [];
    }
};

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export const calculateFare = (distance: number) => {
    const rateStructure = {
        bike: { baseFare: 10, perKmRate: 5, minimumFare: 25 },
        auto: { baseFare: 15, perKmRate: 7, minimumFare: 30 },
        cabEconomy: { baseFare: 20, perKmRate: 10, minimumFare: 50 },
        cabPremium: { baseFare: 30, perKmRate: 15, minimumFare: 70 },
    };

    const fareCalculation = (baseFare: number, perKmRate: number, minimumFare: number) => {
        const calculatedFare = baseFare + (distance * perKmRate);
        return Math.max(calculatedFare, minimumFare);
    };

    return {
        bike: fareCalculation(rateStructure.bike.baseFare, rateStructure.bike.perKmRate, rateStructure.bike.minimumFare),
        auto: fareCalculation(rateStructure.auto.baseFare, rateStructure.auto.perKmRate, rateStructure.auto.minimumFare),
        cabEconomy: fareCalculation(rateStructure.cabEconomy.baseFare, rateStructure.cabEconomy.perKmRate, rateStructure.cabEconomy.minimumFare),
        cabPremium: fareCalculation(rateStructure.cabPremium.baseFare, rateStructure.cabPremium.perKmRate, rateStructure.cabPremium.minimumFare),
    };
}

function quadraticBezierCurve(p1: any, p2: any, controlPoint: any, numPoints: any) {
    const points = [];
    const step = 1 / (numPoints - 1);

    for (let t = 0; t <= 1; t += step) {
        const x =
            (1 - t) ** 2 * p1[0] +
            2 * (1 - t) * t * controlPoint[0] +
            t ** 2 * p2[0];
        const y =
            (1 - t) ** 2 * p1[1] +
            2 * (1 - t) * t * controlPoint[1] +
            t ** 2 * p2[1];
        const coord = { latitude: x, longitude: y };
        points.push(coord);
    }

    return points;
}

const calculateControlPoint = (p1: any, p2: any) => {
    const d = Math.sqrt((p2[0] - p1[0]) ** 2 + (p2[1] - p1[1]) ** 2);
    const scale = 1; // Scale factor to reduce bending
    const h = d * scale; // Reduced distance from midpoint
    const w = d / 2;
    const x_m = (p1[0] + p2[0]) / 2;
    const y_m = (p1[1] + p2[1]) / 2;

    const x_c =
        x_m +
        ((h * (p2[1] - p1[1])) /
            (2 * Math.sqrt((p2[0] - p1[0]) ** 2 + (p2[1] - p1[1]) ** 2))) *
        (w / d);
    const y_c =
        y_m -
        ((h * (p2[0] - p1[0])) /
            (2 * Math.sqrt((p2[0] - p1[0]) ** 2 + (p2[1] - p1[1]) ** 2))) *
        (w / d);

    const controlPoint = [x_c, y_c];
    return controlPoint;
};

export const getPoints = (places: any) => {
    const p1 = [places[0].latitude, places[0].longitude];
    const p2 = [places[1].latitude, places[1].longitude];
    const controlPoint = calculateControlPoint(p1, p2);

    return quadraticBezierCurve(p1, p2, controlPoint, 100);
};

export const vehicleIcons: Record<'bike' | 'auto' | 'cabEconomy' | 'cabPremium', { icon: any }> = {
    bike: { icon: require('@/assets/icons/bike.png') },
    auto: { icon: require('@/assets/icons/auto.png') },
    cabEconomy: { icon: require('@/assets/icons/cab.png') },
    cabPremium: { icon: require('@/assets/icons/cab_premium.png') },
  };
  