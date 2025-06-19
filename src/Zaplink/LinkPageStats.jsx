// src/components/LinkPageStats.jsx
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Globe,
  MapPin,
  Eye,
  TrendingUp,
  Users,
  Link as LinkIcon,
  Info,
  Image,
  Download,
} from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../../firebase/firebase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// For Word Document generation (keep these imports)
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  VerticalAlign,
  convertInchesToTwip,
  TableBorders,
  Border,
  BorderStyle,
} from "docx";
import { saveAs } from "file-saver";

// Import the new map component
import WorldMapAnalytics from "../components/AppComponents/MapComponent";

const LinkPageStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { slug } = useParams();
  const { currentUserData } = useAuth();

  useEffect(() => {
    async function getZurlAnalyticsOfUrl() {
      setLoading(true);
      const docRef = doc(db, "linkPages", slug);
      try {
        const documentSnapShot = await getDoc(docRef);

        if (!documentSnapShot.exists()) {
          toast.error("URL not found");
          setStats(null);
        } else {
          const urlInfo = documentSnapShot.data();

          setStats(urlInfo);
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

  const colors = [
    "#0ea5e9",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#84cc16",
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-lg mb-6"></div>{" "}
            {/* Placeholder for map */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="h-64 bg-gray-200 rounded-lg mt-6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card>
          <CardHeader>
            <CardTitle>No Data Found</CardTitle>
            <CardDescription>
              The analytics for this link page could not be loaded or do not
              exist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Please check the URL or try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const countryData = stats.stats.map((stat) => ({
    name: stat.country,
    value: stat.count,
    percentage: ((stat.count / stats.pageClicks) * 100).toFixed(1),
  }));

  const topCitiesList = stats.stats
    .flatMap((country) =>
      country.topCities.map((city) => ({
        name: `${city.city}, ${country.country}`,
        value: city.count,
      }))
    )
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // --- CSV Download Function ---
  const handleDownloadCSV = () => {
    if (!stats) {
      toast.error("No data to download.");
      return;
    }

    let csvContent = "Category,Detail,Value\n";
    csvContent += `Total Page Views,,${stats.pageClicks}\n`;
    csvContent += `Countries Reached,,${stats.stats.length}\n`;
    csvContent += `Top Country,,${countryData[0]?.name || "N/A"}\n`;
    csvContent += `Average Visits per Country,,${
      stats.stats.length > 0
        ? Math.round(stats.pageClicks / stats.stats.length)
        : "0"
    }\n`;
    csvContent += `Link Page URL,,${stats.linkPageUrl}\n`;
    csvContent += `Bio,,"${stats.bio || "No bio provided."}"\n\n`;

    csvContent += "Country,Visits,Percentage\n";
    countryData.forEach((data) => {
      csvContent += `${data.name},${data.value},${data.percentage}%\n`;
    });
    csvContent += "\n";

    csvContent += "Top Cities,Visits\n";
    topCitiesList.forEach((city) => {
      csvContent += `"${city.name}",${city.value}\n`;
    });
    csvContent += "\n";

    csvContent += "Detailed Country Breakdown\n";
    stats.stats.forEach((country) => {
      csvContent += `Country: ${country.country},Visits: ${country.count}\n`;
      if (country.topCities && country.topCities.length > 0) {
        country.topCities.forEach((city) => {
          csvContent += `,,City: ${city.city},City Visits: ${city.count}\n`;
        });
      } else {
        csvContent += `,,No cities for this country.\n`;
      }
      csvContent += "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `link_page_stats_${slug}.csv`);
    toast.success("CSV file downloaded successfully!");
  };

  // --- Word Document Download Function ---
  const handleDownloadWord = async () => {
    if (!stats) {
      toast.error("No data to download.");
      return;
    }

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              text: "Analytics Dashboard",
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: `Link page statistics for @${stats.username}`,
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Summary Statistics",
                  bold: true,
                  size: 30,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Total Page Views: ", bold: true }),
                new TextRun(stats.pageClicks.toLocaleString()),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Countries Reached: ", bold: true }),
                new TextRun(stats.stats.length.toString()),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Top Country: ", bold: true }),
                new TextRun(countryData[0]?.name || "N/A"),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Average Visits per Country: ",
                  bold: true,
                }),
                new TextRun(
                  stats.stats.length > 0
                    ? Math.round(
                        stats.pageClicks / stats.stats.length
                      ).toLocaleString()
                    : "0"
                ),
              ],
              spacing: { after: 300 },
            }),

            new Paragraph({
              children: [
                new TextRun({ text: "Page Details", bold: true, size: 30 }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Link Page URL: ", bold: true }),
                new TextRun({
                  text: stats.linkPageUrl,
                  style: "Hyperlink",
                  break: 1,
                }), // Adds a hyperlink
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Bio: ", bold: true }),
                new TextRun(stats.bio || "No bio provided."),
              ],
              spacing: { after: 300 },
            }),

            new Paragraph({
              children: [
                new TextRun({ text: "Top Cities", bold: true, size: 30 }),
              ],
              spacing: { after: 100 },
            }),
            topCitiesList.length > 0
              ? new Table({
                  rows: [
                    new TableRow({
                      children: [
                        new TableCell({
                          children: [new Paragraph("City")],
                          borders: TableBorders.ALL,
                          verticalAlign: VerticalAlign.CENTER,
                          width: {
                            size: convertInchesToTwip(2.5),
                            type: WidthType.DXA,
                          },
                        }),
                        new TableCell({
                          children: [new Paragraph("Visits")],
                          borders: TableBorders.ALL,
                          verticalAlign: VerticalAlign.CENTER,
                          width: {
                            size: convertInchesToTwip(1),
                            type: WidthType.DXA,
                          },
                        }),
                      ],
                    }),
                    ...topCitiesList.map(
                      (city) =>
                        new TableRow({
                          children: [
                            new TableCell({
                              children: [new Paragraph(city.name)],
                              borders: TableBorders.ALL,
                            }),
                            new TableCell({
                              children: [new Paragraph(city.value.toString())],
                              borders: TableBorders.ALL,
                            }),
                          ],
                        })
                    ),
                  ],
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  borders: {
                    top: {
                      style: BorderStyle.SINGLE,
                      size: 6,
                      color: "000000",
                    },
                    bottom: {
                      style: BorderStyle.SINGLE,
                      size: 6,
                      color: "000000",
                    },
                    left: {
                      style: BorderStyle.SINGLE,
                      size: 6,
                      color: "000000",
                    },
                    right: {
                      style: BorderStyle.SINGLE,
                      size: 6,
                      color: "000000",
                    },
                    insideHorizontal: {
                      style: BorderStyle.SINGLE,
                      size: 6,
                      color: "000000",
                    },
                    insideVertical: {
                      style: BorderStyle.SINGLE,
                      size: 6,
                      color: "000000",
                    },
                  },
                })
              : new Paragraph("No city data available yet."),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Detailed Country Breakdown",
                  bold: true,
                  size: 30,
                }),
              ],
              spacing: { top: 300, after: 100 },
            }),
            ...stats.stats.flatMap((country, index) => {
              const countryParagraphs = [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${country.country} (Visits: ${country.count})`,
                      bold: true,
                    }),
                  ],
                  spacing: { after: 100 },
                }),
              ];

              if (country.topCities && country.topCities.length > 0) {
                countryParagraphs.push(
                  new Table({
                    rows: [
                      new TableRow({
                        children: [
                          new TableCell({
                            children: [new Paragraph("City")],
                            borders: TableBorders.ALL,
                            verticalAlign: VerticalAlign.CENTER,
                            width: {
                              size: convertInchesToTwip(2.5),
                              type: WidthType.DXA,
                            },
                          }),
                          new TableCell({
                            children: [new Paragraph("Visits")],
                            borders: TableBorders.ALL,
                            verticalAlign: VerticalAlign.CENTER,
                            width: {
                              size: convertInchesToTwip(1),
                              type: WidthType.DXA,
                            },
                          }),
                        ],
                      }),
                      ...country.topCities.map(
                        (city) =>
                          new TableRow({
                            children: [
                              new TableCell({
                                children: [new Paragraph(city.city)],
                                borders: TableBorders.ALL,
                              }),
                              new TableCell({
                                children: [
                                  new Paragraph(city.count.toString()),
                                ],
                                borders: TableBorders.ALL,
                              }),
                            ],
                          })
                      ),
                    ],
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {
                      top: {
                        style: BorderStyle.SINGLE,
                        size: 6,
                        color: "000000",
                      },
                      bottom: {
                        style: BorderStyle.SINGLE,
                        size: 6,
                        color: "000000",
                      },
                      left: {
                        style: BorderStyle.SINGLE,
                        size: 6,
                        color: "000000",
                      },
                      right: {
                        style: BorderStyle.SINGLE,
                        size: 6,
                        color: "000000",
                      },
                      insideHorizontal: {
                        style: BorderStyle.SINGLE,
                        size: 6,
                        color: "000000",
                      },
                      insideVertical: {
                        style: BorderStyle.SINGLE,
                        size: 6,
                        color: "000000",
                      },
                    },
                  })
                );
              } else {
                countryParagraphs.push(
                  new Paragraph("No city data available for this country.")
                );
              }

              // Add a separator if it's not the last country
              if (index < stats.stats.length - 1) {
                countryParagraphs.push(
                  new Paragraph({ text: "", spacing: { after: 300 } })
                ); // Adds a vertical space
              }
              return countryParagraphs;
            }),
          ],
        },
      ],
    });

    Packer.toBlob(doc)
      .then((blob) => {
        saveAs(blob, `link_page_stats_${slug}.docx`);
        toast.success("Word document downloaded successfully!");
      })
      .catch((error) => {
        console.error("Error generating Word document:", error);
        toast.error("Failed to generate Word document.");
      });
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground">
              Link page statistics for{" "}
              <Badge variant="secondary">@{stats.username}</Badge>
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleDownloadCSV}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" /> Download CSV
            </Button>
            <Button
              onClick={handleDownloadWord}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" /> Download DOCX
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Page Views
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.pageClicks.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                All time page visits
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Countries Reached
              </CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.stats.length}</div>
              <p className="text-xs text-muted-foreground">Unique countries</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Country</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {countryData[0]?.name || "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                {countryData[0]?.percentage
                  ? `${countryData[0]?.percentage}% of total visits`
                  : "No data"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average per Country
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.stats.length > 0
                  ? Math.round(
                      stats.pageClicks / stats.stats.length
                    ).toLocaleString()
                  : "0"}
              </div>
              <p className="text-xs text-muted-foreground">
                Average visits per country
              </p>
            </CardContent>
          </Card>
        </div>

        

        {/* New Section for URL-related Info and Top Cities Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* URL-related Info Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Page Details
              </CardTitle>
              <CardDescription>
                Essential information about your link page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                {stats.profilePic && (
                  <img
                    src={stats.profilePic}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover border"
                  />
                )}
                <div>
                  <p className="text-sm font-medium flex items-center gap-1">
                    <Image className="h-4 w-4 text-muted-foreground" /> Profile
                    Picture
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats.profilePic ? "Loaded" : "Not set"}
                  </p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium flex items-center gap-1">
                  <LinkIcon className="h-4 w-4 text-muted-foreground" /> Link
                  Page URL
                </p>
                <a
                  href={stats.linkPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-white hover:underline text-sm"
                >
                  {stats.linkPageUrl}
                </a>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium flex items-center gap-1">
                  <Info className="h-4 w-4 text-muted-foreground" /> Bio
                </p>
                <p className="text-sm text-muted-foreground">
                  {stats.bio || "No bio provided."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Top Cities Card (replacing the chart) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Top Cities
              </CardTitle>
              <CardDescription>Your top 5 most active cities.</CardDescription>
            </CardHeader>
            <CardContent>
              {topCitiesList.length > 0 ? (
                <ul className="space-y-3">
                  {topCitiesList.map((city, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: colors[index % colors.length],
                          }}
                        ></div>
                        <span className="font-medium">{city.name}</span>
                      </div>
                      <Badge variant="secondary">{city.value} visits</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No city data available yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Section (Country Distribution Chart remains) */}
        <div className="grid grid-cols-1 xl:grid-cols-1 gap-6 mb-8">
          {/* Country Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Visits by Country (Bar Chart)
              </CardTitle>
              <CardDescription>
                Geographic distribution of your page visits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={countryData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="name"
                    className="fill-muted-foreground"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                  />
                  <YAxis className="fill-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      color: "hsl(var(--card-foreground))",
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {countryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={colors[index % colors.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Country Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Detailed Country Breakdown
            </CardTitle>
            <CardDescription>View top cities for each country</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Added ScrollArea here */}
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              <div className="space-y-6">
                {stats.stats.map((country, index) => (
                  <div key={country.country} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: colors[index % colors.length],
                          }}
                        ></div>
                        {country.country}
                      </h3>
                      <Badge variant="outline">{country.count} visits</Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pl-5">
                      {country.topCities.map((city, cityIndex) => (
                        <Card key={city.city} className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{city.city}</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {city.count}
                            </Badge>
                          </div>
                        </Card>
                      ))}
                    </div>

                    {index < stats.stats.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </CardContent>
        </Card>
        <Card className="mt-8 w-[600px] h-[500px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              World Map Analytics
            </CardTitle>
            <CardDescription>
              Visualize page visits by country on a world map.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {countryData.length > 0 ? (
              <WorldMapAnalytics
                countryStats={countryData}
                totalPageClicks={stats.pageClicks}
              />
            ) : (
              <div className="text-center text-muted-foreground py-10">
                No geographic data available to display on the map.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LinkPageStats;
