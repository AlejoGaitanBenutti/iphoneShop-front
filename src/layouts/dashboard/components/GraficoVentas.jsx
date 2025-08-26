import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import CircularProgress from "@mui/material/CircularProgress";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const apiUrl = process.env.REACT_APP_BACKEND_URL + "/api/ventas.php";


const GraficoVentas = () => {
  const [ventas, setVentas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVentas = async () => {
      try {
        const res = await fetch(apiUrl);
        const data = await res.json();
        setVentas(data);
      } catch (err) {
        console.error("❌ Error al obtener ventas:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVentas();
  }, []);

  const data = {
  labels: Array.isArray(ventas) ? ventas.map((v) => v.fecha) : [],
  datasets: [
    {
      label: "Ventas del mes",
      data: Array.isArray(ventas) ? ventas.map((v) => parseFloat(v.total)) : [],
      backgroundColor: "#ff9100",
      borderRadius: 4,
    },
  ],
};


  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: { color: "#fff" },
        grid: { color: "#333" },
      },
      y: {
        ticks: { color: "#fff" },
        grid: { color: "#333" },
      },
    },
  };

  return (
    <Card sx={{ backgroundColor: "#1e1e1e", borderRadius: "16px", padding: 3 }}>
      <MDBox mb={2}>
        <MDTypography variant="h6" color="white" fontWeight="bold">
          Ventas del Mes
        </MDTypography>
      </MDBox>

      {isLoading ? (
        <CircularProgress sx={{ color: "#ff9100" }} />
      ) : (
        <Bar data={data} options={options} />
      )}
    </Card>
  );
};

export default GraficoVentas;
