import { Loader } from '@googlemaps/js-api-loader';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

let googleMapsLoaded = false;
let googleMapsPromise: Promise<typeof google> | null = null;

export const loadGoogleMaps = (): Promise<typeof google> => {
  if (googleMapsLoaded && window.google) {
    return Promise.resolve(window.google);
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    if (!GOOGLE_MAPS_API_KEY) {
      reject(new Error('Google Maps API key not found'));
      return;
    }

    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places', 'geometry']
    });

    loader.load().then(() => {
      googleMapsLoaded = true;
      resolve(window.google);
    }).catch((error:any) => {
      googleMapsPromise = null;
      reject(error);
    });
  });

  return googleMapsPromise;
};

export const isGoogleMapsLoaded = (): boolean => {
  return googleMapsLoaded && !!window.google;
};