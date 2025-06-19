import React, { useEffect, useState } from "react";
import {
  Globe,
  TrendingUp,
  Users,
  MapPin,
  ExternalLink,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { collection, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

// Reusable table components
const Table = ({ children, className = "" }) => (
  <div className={`w-full ${className}`}>{children}</div>
);

const TableHeader = ({ children }) => (
  <div className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
    {children}
  </div>
);

const TableBody = ({ children }) => <div>{children}</div>;

const TableRow = ({ children, className = "" }) => (
  <div
    className={`flex w-full border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 ${className}`}
  >
    {children}
  </div>
);

const TableHead = ({ children, className = "" }) => (
  <div
    className={`flex-1 p-3 text-left font-medium text-gray-700 dark:text-gray-300 text-sm ${className}`}
  >
    {children}
  </div>
);

const TableCell = ({ children, className = "" }) => (
  <div className={`flex-1 p-3 text-gray-900 dark:text-white ${className}`}>
    {children}
  </div>
);

const colors = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];

export default function LinkAnalytics({ linkId }) {
  const [loading, setLoading] = useState(true);
  const [linkData, setLinkData] = useState(null);

  useEffect(() => {
    async function getLinkData() {
      try {
        setLoading(true);
        const linkRef = doc(db, "links", linkId);
        const linkSnap = await getDoc(linkRef);
        if (linkSnap.exists()) {
          const data = { id: linkSnap.id, ...linkSnap.data() };
          setLinkData(data);
          setLoading(false);
        } else {
          console.error("Link not found");
        }
      } catch (error) {
        console.error("Error fetching link:", error);
      } finally {
        setLoading(false);
      }
    }
    getLinkData();
  }, [linkId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!linkData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-black">
        <div className="text-center">
          <Globe className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-300">No data found</p>
        </div>
      </div>
    );
  }

  const {
    count = 0,
    stats = [],
    message,
    phone,
    waUrl,
    urlId,
    createdAt,
  } = linkData;

  const barChartData = stats.map(({ country, count }) => ({
    country: country.length > 12 ? country.substring(0, 12) + "..." : country,
    clicks: count,
  }));

  const pieChartData = stats.map(({ country, count }, index) => ({
    name: country,
    value: count,
    color: colors[index % colors.length],
  }));

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Link Analytics
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{urlId}</p>
            </div>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="w-4 h-4 mr-1" />
              Created {formatDate(createdAt)}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              icon: <TrendingUp className="w-5 h-5 text-blue-600" />,
              label: "Total Clicks",
              value: count.toLocaleString(),
            },
            {
              icon: <Globe className="w-5 h-5 text-green-600" />,
              label: "Countries",
              value: stats.length,
            },
            {
              icon: <MapPin className="w-5 h-5 text-purple-600" />,
              label: "Cities",
              value: stats.reduce(
                (acc, stat) => acc + stat.topCities.length,
                0
              ),
            },
            {
              icon: <Users className="w-5 h-5 text-orange-600" />,
              label: "Top Country",
              value: stats.length > 0 ? stats[0].country : "-",
            },
          ].map((metric, idx) => (
            <Card
              key={idx}
              className="bg-white dark:bg-gray-900 border dark:border-gray-700"
            >
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-opacity-10">
                    {metric.icon}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {metric.label}
                    </p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {metric.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white dark:bg-gray-900 border dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 dark:text-white">
                Clicks by Country
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Geographic distribution of clicks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="country" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip />
                    <Bar
                      dataKey="clicks"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 border dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 dark:text-white">
                Traffic Distribution
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Percentage breakdown by region
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="bg-white dark:bg-gray-900 border dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white">
              Geographic Breakdown
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Detailed analytics by country and city
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {stats.length === 0 ? (
              <div className="text-center py-8">
                <Globe className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">
                  No data available
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Country</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Top Cities</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.map(({ country, count: countryCount, topCities }) => (
                    <TableRow key={country}>
                      <TableCell className="font-medium">{country}</TableCell>
                      <TableCell className="font-semibold">
                        {countryCount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">
                        {((countryCount / count) * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {topCities.map((c, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                            >
                              {c.city} ({c.count})
                            </span>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Link Details */}
        <Card className="bg-white dark:bg-gray-900 border dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center">
              <ExternalLink className="w-5 h-5 mr-2" />
              Link Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message
                </label>
                <div className="p-3 rounded-lg border dark:border-gray-700">
                  <code className="text-sm text-gray-900 dark:text-white">
                    {message}
                  </code>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <div className="p-3 rounded-lg border dark:border-gray-700">
                  <code className="text-sm text-gray-900 dark:text-white">
                    {phone}
                  </code>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                WhatsApp URL
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 p-3 rounded-lg border dark:border-gray-700">
                  <code className="text-sm break-all text-gray-900 dark:text-white">
                    {waUrl}
                  </code>
                </div>
                <button
                  onClick={() => window.open(waUrl, "_blank")}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Open
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
