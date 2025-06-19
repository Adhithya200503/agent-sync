import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Copy,
  ExternalLink,
  Calendar,
  MousePointer,
  Globe,
  MapPin,
  BarChart3,
  QrCode,
  Smartphone, // Added for device stats
  LayoutList, // Added for OS stats
  Monitor, // Added for browser stats icon (could be different)
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "sonner";
import { db } from "../../firebase/firebase";

import WorldMapAnalytics from "../components/AppComponents/MapComponent";

const ZurlAnalytics = () => {
  const [urlData, setUrlData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { slug } = useParams();
  const { currentUserData } = useAuth();

  useEffect(() => {
    async function getZurlAnalyticsOfUrl() {
      setLoading(true);
      const docRef = doc(db, "short-links", slug);
      try {
        const documentSnapShot = await getDoc(docRef);

        if (!documentSnapShot.exists()) {
          toast.error("URL not found");
          setUrlData(null);
        } else {
          const urlInfo = documentSnapShot.data();
          setUrlData(urlInfo);
        }
      } catch (error) {
        console.error("Error fetching URL analytics:", error);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }
    getZurlAnalyticsOfUrl();
  }, [slug, currentUserData]);

  const handleCopy = () => {
    navigator.clipboard.writeText(urlData?.shortUrl);
    toast.success("Short URL copied!");
  };

  const getAllCitiesData = () => {
    const stats = urlData?.stats || {};
    const allCities = [];

    Object.entries(stats).forEach(([country, data]) => {
      if (data.cities) {
        Object.entries(data.cities).forEach(([city, count]) => {
          if (city !== "count") {
            allCities.push({
              name: city,
              clicks: count,
              country: country,
            });
          }
        });
      }
    });

    return allCities.sort((a, b) => b.clicks - a.clicks);
  };

  const getCityChartData = () => {
    return getAllCitiesData();
  };

  const getCountryData = () => {
    const stats = urlData?.stats || {};
    const totalClicks = Object.values(stats).reduce(
      (sum, country) => sum + (country.count || 0),
      0
    );

    return Object.entries(stats)
      .map(([country, data]) => ({
        country,
        clicks: data.count || 0,
        cities: Object.keys(data.cities || {}).filter((key) => key !== "count")
          .length,
        percentage:
          totalClicks > 0
            ? (((data.count || 0) / totalClicks) * 100).toFixed(1)
            : 0,
      }))
      .sort((a, b) => b.clicks - a.clicks);
  };

  const getStateData = () => {
    const stats = urlData?.stats || {};
    const stateData = [];

    Object.entries(stats).forEach(([country, data]) => {
      if (data.states) {
        Object.entries(data.states).forEach(([state, count]) => {
          if (state !== "count") {
            stateData.push({
              name: `${state}`,
              clicks: count,
              country: country,
            });
          }
        });
      }
    });

    return stateData.sort((a, b) => b.clicks - a.clicks);
  };

  // --- New functions for Browser, Device, and OS data ---

  const getBrowserStats = () => {
    const browserStats = urlData?.browserStats || {};
    return Object.entries(browserStats)
      .map(([browser, clicks]) => ({
        name: browser,
        clicks: clicks,
      }))
      .sort((a, b) => b.clicks - a.clicks);
  };

  const getDeviceStats = () => {
    const deviceStats = urlData?.deviceStats || {};
    return Object.entries(deviceStats)
      .map(([device, clicks]) => ({
        name: device,
        clicks: clicks,
      }))
      .sort((a, b) => b.clicks - a.clicks);
  };

  const getOsStats = () => {
    const osStats = urlData?.osStats || {};
    return Object.entries(osStats)
      .map(([os, clicks]) => ({
        name: os,
        clicks: clicks,
      }))
      .sort((a, b) => b.clicks - a.clicks);
  };

  // --- End of New functions ---

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <Skeleton className="w-full h-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (!urlData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Globe className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No data available</p>
          <p className="text-sm text-muted-foreground">
            The requested URL analytics could not be found.
          </p>
        </div>
      </div>
    );
  }

  const cityData = getCityChartData();
  const countryData = getCountryData();
  const stateData = getStateData();
  const browserData = getBrowserStats(); // Call new functions
  const deviceData = getDeviceStats(); // Call new functions
  const osData = getOsStats(); // Call new functions

  const countryStatsForMap = countryData.map((item) => ({
    name: item.country,
    value: item.clicks,
    percentage: item.percentage,
  }));
  console.log(urlData);
  return (
    <div className="p-6 space-y-6 max-w-2xl lg:max-w-6xl">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">URL Analytics</h1>
        <p className="text-muted-foreground">
          Comprehensive analytics for your shortened URL performance
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MousePointer className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Clicks
                </p>
                <p className="text-2xl font-bold">{urlData.clicks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Countries
                </p>
                <p className="text-2xl font-bold">{countryData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Cities
                </p>
                <p className="text-2xl font-bold">{cityData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Status
                </p>
                <Badge variant={urlData.isActive ? "default" : "secondary"}>
                  {urlData.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* URL Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <ExternalLink className="h-5 w-5" />
            <CardTitle>URL Details</CardTitle>
          </div>
          <CardDescription>
            Information about your shortened URL and its configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Original URL</label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 p-2 bg-muted rounded-md text-sm break-all">
                  {urlData.originalUrl}
                </code>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={urlData.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Short URL</label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 p-2 bg-muted rounded-md text-sm">
                  {urlData.shortUrl}
                </code>
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={urlData.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Custom ID</label>
                <code className="block p-2 bg-muted rounded-md text-sm">
                  {urlData.customUrl}
                </code>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Created</label>
                <p className="p-2 bg-muted rounded-md text-sm">
                  {new Date(urlData.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Geographical Breakdown: State, City, and Country Clicks Lists */}
      <h2 className="text-2xl tracking-tight pt-4">
        Geographical Breakdown
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* State Analytics */}
        {stateData.length > 0 && (
          <Card className="min-w-[300px]">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <CardTitle>Clicks by State</CardTitle>
              </div>
              <CardDescription>
                State-wise breakdown of your URL engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4 pr-4">
                  {" "}
                  {/* Added pr-4 for scrollbar spacing */}
                  {stateData.slice(0, 10).map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.country}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">{item.clicks} clicks</Badge>
                    </div>
                  ))}
                </div>
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* City Analytics (Top Cities List) */}
        {cityData.length > 0 && (
          <Card className="min-w-[300px]">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <CardTitle>Top Cities</CardTitle>
              </div>
              <CardDescription>
                City-wise click distribution across all countries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4 pr-4">
                  {" "}
                  {/* Added pr-4 for scrollbar spacing */}
                  {getAllCitiesData()
                    .slice(0, 10)
                    .map((item, index) => (
                      <div
                        key={`${item.name}-${item.country}-${index}`}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-medium">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.country}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">{item.clicks} clicks</Badge>
                      </div>
                    ))}
                </div>
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Country Analytics */}
        {countryData.length > 0 && (
          <Card className="min-w-[300px]">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <CardTitle>Clicks by Country</CardTitle>
              </div>
              <CardDescription>
                Geographic distribution of your URL clicks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {" "}
                {/* Added ScrollArea for consistency */}
                <div className="space-y-4 pr-4">
                  {" "}
                  {/* Added pr-4 for scrollbar spacing */}
                  {countryData.map((item, index) => (
                    <div
                      key={item.country}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{item.country}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.cities}{" "}
                            {item.cities === 1 ? "city" : "cities"}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">{item.clicks} clicks</Badge>
                    </div>
                  ))}
                </div>
                <ScrollBar orientation="vertical" /> {/* Added ScrollBar */}
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>


      <h2 className="text-2xl tracking-tight pt-4">
        Technology Breakdown
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Browser Analytics */}
        {browserData.length > 0 && (
          <Card className="min-w-[300px]">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Monitor className="h-5 w-5" />
                <CardTitle>Clicks by Browser</CardTitle>
              </div>
              <CardDescription>
                Distribution of clicks by web browser.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <div className="space-y-4 pr-4">
                  {browserData.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {index + 1}
                          </span>
                        </div>
                        <p className="font-medium">{item.name}</p>
                      </div>
                      <Badge variant="secondary">{item.clicks} clicks</Badge>
                    </div>
                  ))}
                </div>
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Device Analytics */}
        {deviceData.length > 0 && (
          <Card className="min-w-[300px]">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5" />
                <CardTitle>Clicks by Device</CardTitle>
              </div>
              <CardDescription>
                Distribution of clicks by device type.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <div className="space-y-4 pr-4">
                  {deviceData.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {index + 1}
                          </span>
                        </div>
                        <p className="font-medium">{item.name}</p>
                      </div>
                      <Badge variant="secondary">{item.clicks} clicks</Badge>
                    </div>
                  ))}
                </div>
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* OS Analytics */}
        {osData.length > 0 && (
          <Card className="min-w-[300px]">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <LayoutList className="h-5 w-5" />
                <CardTitle>Clicks by Operating System</CardTitle>
              </div>
              <CardDescription>
                Distribution of clicks by operating system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <div className="space-y-4 pr-4">
                  {osData.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {index + 1}
                          </span>
                        </div>
                        <p className="font-medium">{item.name}</p>
                      </div>
                      <Badge variant="secondary">{item.clicks} clicks</Badge>
                    </div>
                  ))}
                </div>
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
      {/* --- End of New Section --- */}

      {/* City Analytics Chart */}
      {cityData.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <CardTitle>City Analytics</CardTitle>
            </div>
            <CardDescription>
              Detailed city-wise click distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={cityData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                  formatter={(value, name, props) => [
                    `${value} clicks`,
                    `${props.payload.name}, ${props.payload.country}`,
                  ]}
                />
                <Bar dataKey="clicks" fill="blue" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* QR Code */}
      {urlData.qrcode && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <QrCode className="h-5 w-5" />
              <CardTitle>QR Code</CardTitle>
            </div>
            <CardDescription>
              Quick access QR code for your shortened URL
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-lg border">
                <img src={urlData.qrcode} alt="QR Code" className="w-40 h-40" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* World Map Analytics Card */}
      {countryStatsForMap.length > 0 && (
        <Card className="w-[600px] h-[500px]">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <CardTitle>Global Clicks Map</CardTitle>
            </div>
            <CardDescription>
              Visualize the geographic distribution of your URL clicks on a
              world map.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WorldMapAnalytics
              countryStats={countryStatsForMap}
              totalPageClicks={urlData.clicks}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ZurlAnalytics;