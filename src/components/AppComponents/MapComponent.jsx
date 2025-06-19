// src/components/WorldMapAnalytics.jsx
import React, { useState, memo, useEffect, useCallback, useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import { scaleQuantile } from "d3-scale";
import { feature } from "topojson-client";
import "leaflet/dist/leaflet.css";

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

// MapControls component has been removed as per your request.
// If you uncomment it later, ensure it's still positioned correctly.

const WorldMapAnalytics = ({ countryStats, totalPageClicks }) => {
  const [tooltipContent, setTooltipContent] = useState("");
  const [currentMapCenter, setCurrentMapCenter] = useState([0, 0]);
  const [currentMapZoom, setCurrentMapZoom] = useState(1);
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    fetch(geoUrl)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((topology) => {
        setGeoData(feature(topology, topology.objects.countries));
      })
      .catch((error) => {
        console.error("Error fetching or processing geo data:", error);
      });
  }, []);

  const colorScale = useMemo(() => {
    return scaleQuantile()
      .domain(countryStats.map((d) => d.value))
      .range([
        "#edf8fb",
        "#bfd3e6",
        "#9ebcda",
        "#8c96c6",
        "#8c6bb1",
        "#88419d",
        "#6e016b",
      ]);
  }, [countryStats]);

  const getCountryStyle = useCallback(
    (feature) => {
      const country = countryStats.find(
        (s) => s.name === feature.properties.name
      );
      const color = country ? colorScale(country.value) : "#F5F4F6";

      return {
        fillColor: color,
        weight: 0.5,
        opacity: 1,
        color: "white",
        dashArray: "3",
        fillOpacity: 0.7,
      };
    },
    [countryStats, colorScale]
  );

  const onEachFeature = useCallback(
    (feature, layer) => {
      const country = countryStats.find(
        (s) => s.name === feature.properties.name
      );
      let currentTooltipText = "No data available";
      if (country) {
        currentTooltipText = `${
          country.name
        }: ${country.value.toLocaleString()} visits (${country.percentage}%)`;
      } else {
        currentTooltipText = feature.properties.name;
      }

      layer.on({
        mouseover: (e) => {
          setTooltipContent(currentTooltipText);
          e.target.setStyle({
            weight: 2,
            color: "#FFFFFF",
            dashArray: "",
            fillOpacity: 0.9,
            fillColor: "#0ea5e9",
          });
          e.target.bringToFront();
        },
        mouseout: (e) => {
          setTooltipContent("");
          e.target.setStyle(getCountryStyle(feature));
        },
      });
    },
    [countryStats, getCountryStyle]
  );

  // setMapPosition and currentMapCenter/Zoom are now primarily for initial setup
  // and less for direct control since the custom MapControls are removed.
  // Leaflet handles internal state for pan/zoom with default controls.
  const setMapPosition = useCallback(({ coordinates, zoom }) => {
    setCurrentMapCenter([coordinates[1], coordinates[0]]);
    setCurrentMapZoom(zoom);
  }, []);

  if (!geoData) {
    return (
      <div className="flex justify-center items-center h-full min-h-[300px] text-muted-foreground">
        Loading map data...
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px] border rounded-lg overflow-hidden">
      <MapContainer
        center={currentMapCenter}
        zoom={currentMapZoom}
        scrollWheelZoom={true}
        className="w-full h-full"
        // Re-enabled default zoom control by setting zoomControl to true or removing the prop
        zoomControl={true} // Explicitly set to true, or simply remove the prop (it's true by default)
        minZoom={1}
        maxZoom={18}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {geoData && (
          <GeoJSON
            data={geoData}
            style={getCountryStyle}
            onEachFeature={onEachFeature}
          />
        )}
        {/* MapControls component has been removed from here */}
      </MapContainer>

      {tooltipContent && (
        <div
          className="absolute bg-black text-white text-xs p-2 rounded shadow-lg pointer-events-none"
          style={{
            left: "50%",
            transform: "translateX(-50%)",
            bottom: "10px",
            zIndex: 1001,
          }}
        >
          {tooltipContent}
        </div>
      )}
    </div>
  );
};

export default memo(WorldMapAnalytics);