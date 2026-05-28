import { useCallback, useState } from "react";
export type GeoStatus = "idle" | "loading" | "done" | "error";

export const GEOLOCATION_UNAVAILABLE_MESSAGE =
  "Ubicación automática no disponible. Permite acceso a ubicación en tu navegador.";

interface UseGeolocationParams {
  setUbicacion: (value: string) => void;
}

export function useGeolocation({ setUbicacion }: UseGeolocationParams) {
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");

  const detectLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setUbicacion(GEOLOCATION_UNAVAILABLE_MESSAGE);
      setGeoStatus("error");
      return;
    }

    setGeoStatus("loading");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const coordinates = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=es`,
          );
          if (!res.ok) throw new Error("geo fetch failed");

          const data = await res.json();
          const addr = data.address ?? {};
          const city =
            addr.city || addr.town || addr.village || addr.municipality || addr.county || "";
          const stateName = addr.state ?? "";
          const location = [city, stateName].filter(Boolean).join(", ");

          if (location) {
            setUbicacion(`${location} · ${coordinates}`);
            setGeoStatus("done");
            return;
          }
        } catch {
          // Keep coordinate fallback when reverse geocoding fails.
        }

        setUbicacion(`Coordenadas GPS: ${coordinates}`);
        setGeoStatus("done");
      },
      () => {
        setUbicacion(GEOLOCATION_UNAVAILABLE_MESSAGE);
        setGeoStatus("error");
      },
      { timeout: 10000, maximumAge: 300000 },
    );
  }, [setUbicacion]);

  return { geoStatus, detectLocation };
}
