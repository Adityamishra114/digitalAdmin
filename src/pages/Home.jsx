import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { useSelector, useDispatch } from "react-redux";

// Redux selectors and thunks
import { selectTotalCourses, fetchCourses } from "../store/courseSlice";
import {
  selectTotalEnrolledCourses,
  fetchAllCourseStudents,
} from "../store/courseStudentSlice";
import { selectTotalUsers, getAllUsers } from "../store/userSlice";
import {
  selectAllPaymentsCount,
  getAllSuccessfulPayments,
} from "../store/paymentSlice";

const Home = () => {
  const dispatch = useDispatch();
  const [chartType, setChartType] = useState("Bar");

  // Fetch all required data on mount
  useEffect(() => {
    dispatch(fetchCourses());
    dispatch(fetchAllCourseStudents());
    dispatch(getAllUsers());
    dispatch(getAllSuccessfulPayments());
  }, [dispatch]);

  // Redux state
  const totalCourses = useSelector(selectTotalCourses) ?? 0;
  const totalEnrollments = useSelector(selectTotalEnrolledCourses) ?? 0;
  const totalUsers = useSelector(selectTotalUsers) ?? 0;
  const totalPayments = useSelector(selectAllPaymentsCount) ?? 0;

  // Prepare chart/metric data
  const metricsData = useMemo(
    () => [
      { name: "Courses", value: totalCourses, color: "#3b82f6" },
      { name: "Enrollments", value: totalEnrollments, color: "#10b981" },
      { name: "Payments", value: totalPayments, color: "#f59e0b" },
      { name: "Students", value: totalUsers, color: "#ef4444" },
    ],
    [totalCourses, totalEnrollments, totalPayments, totalUsers]
  );

  // Render chart based on selection
  const renderChart = () => {
    if (!metricsData.length) return <p>No data available</p>;

    switch (chartType) {
      case "Bar":
        return (
          <BarChart data={metricsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value">
              {metricsData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        );

      case "Line":
        return (
          <LineChart data={metricsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#6366f1"
              strokeWidth={2}
            />
          </LineChart>
        );

      case "Pie":
      case "Donut":
        return (
          <PieChart>
            <Tooltip />
            <Legend />
            <Pie
              data={metricsData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={chartType === "Donut" ? 40 : 0}
              outerRadius={80}
              label
            >
              {metricsData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto font-nunito">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6 items-start sm:items-center">
        <div className="flex flex-wrap gap-3">
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="border px-3 py-2 rounded-md shadow-sm text-sm"
          >
            {["Bar", "Line", "Pie", "Donut"].map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-primary">
          Platform Metrics
        </h1>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {metricsData.map((metric, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-xl shadow text-center hover:shadow-md transition"
          >
            <p className="text-sm text-gray-500">{metric.name}</p>
            <p className="text-xl font-bold" style={{ color: metric.color }}>
              {metric.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition duration-300">
        <h2 className="text-lg font-semibold mb-2 text-gray-700">
          {chartType} Chart - Metrics Overview
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Home;
