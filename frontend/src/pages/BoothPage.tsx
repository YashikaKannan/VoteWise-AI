import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { motion } from "framer-motion";
import { MapPin, Search } from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const defaultCenter = { lat: 20.5937, lng: 78.9629 };
const libraries: "places"[] = ["places"];

export function BoothPage() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "";
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries,
  });

  const [address, setAddress] = useState("");
  const debounced = useDebouncedValue(address, 400);
  const [center, setCenter] = useState(defaultCenter);
  const [marker, setMarker] = useState(defaultCenter);
  const [status, setStatus] = useState<string | null>(null);

  const geocode = useCallback(
    (q: string) => {
      if (!isLoaded || !q.trim()) return;
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: q }, (results, resStatus) => {
        if (resStatus === "OK" && results && results[0]) {
          const loc = results[0].geometry.location;
          const c = { lat: loc.lat(), lng: loc.lng() };
          setCenter(c);
          setMarker(c);
          setStatus(
            "Marker shows your searched area. Confirm the exact polling booth on the ECI portal or with your BLO.",
          );
        } else {
          setStatus("Could not geocode that address. Try a more specific location.");
        }
      });
    },
    [isLoaded],
  );

  const onSearch = () => geocode(debounced || address);

  if (!apiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Polling booth map</CardTitle>
          <CardDescription>
            Set <code className="text-primary">VITE_GOOGLE_MAPS_API_KEY</code> in{" "}
            <code className="text-primary">frontend/.env</code> to enable the map.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loadError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Map error</CardTitle>
          <CardDescription>Could not load Google Maps. Check API key restrictions.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Find your area on the map</h1>
        <p className="mt-2 text-muted-foreground">
          Geocode an address or locality to drop a marker. Always cross-check the official polling
          station assignment.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="size-5 text-cyan-400" />
            Location search
          </CardTitle>
          <CardDescription>Debounced search reduces API churn while typing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="addr">Address or area</Label>
              <Input
                id="addr"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Connaught Place, New Delhi"
              />
            </div>
            <Button onClick={onSearch} className="gap-2" disabled={!isLoaded}>
              <Search className="size-4" />
              Show on map
            </Button>
          </div>
          {status && <p className="text-sm text-muted-foreground">{status}</p>}
          <motion.div
            className="overflow-hidden rounded-xl border border-border/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded ? 1 : 0.4 }}
          >
            {isLoaded && (
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "420px" }}
                center={center}
                zoom={12}
                options={{
                  disableDefaultUI: false,
                  styles: [
                    { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
                    { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
                    { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
                  ],
                }}
              >
                <Marker position={marker} />
              </GoogleMap>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}
