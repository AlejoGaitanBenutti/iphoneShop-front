import React, { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
import { CircularProgress } from "@mui/material";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

const apiUrl = process.env.REACT_APP_BACKEND_URL + "/api/clientes.php";

const StyledDataGrid = styled(DataGrid)(() => ({
  border: "none",
  color: "#f0f0f0",
  backgroundColor: "#121212",
  borderRadius: "10px",
  fontFamily: "Roboto, sans-serif",
  fontSize: "0.9rem",

  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: "#1f1f1f",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: "0.9rem",
    borderBottom: "1px solid #444",
    textTransform: "uppercase",
  },

  "& .MuiDataGrid-cell": {
    color: "#e0e0e0",
    fontSize: "0.88rem",
    fontWeight: 500,
    fontFamily: "Roboto, sans-serif",
    borderBottom: "1px solid #333",
  },

  "& .MuiDataGrid-row:hover": {
    backgroundColor: "#1e1e1e",
  },

  "& .Mui-selected": {
    backgroundColor: "#252525 !important",
  },

  "& .MuiDataGrid-footerContainer": {
    backgroundColor: "#181818",
    borderTop: "1px solid #444",
    color: "#fff",
  },

  "& .MuiSvgIcon-root, & .MuiTablePagination-root": {
    color: "#ffffff",
  },
}));

const ClientesTable = () => {
  const [clientes, setClientes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchClientes = async () => {
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const data = await response.json();

        if (isMounted) {
          setClientes(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("❌ Error al obtener clientes:", error.message);
        alert("Error al obtener clientes: " + error.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchClientes();
    return () => {
      isMounted = false;
    };
  }, []);

  const columns = [
    { field: "id_cliente", headerName: "ID", width: 70 },
    { field: "nombre", headerName: "Nombre", width: 250 },
    { field: "apellido", headerName: "Apellido", width: 250 },
    { field: "email", headerName: "Email", width: 300 },
    { field: "telefono", headerName: "Teléfono", width: 150 },
    { field: "direccion", headerName: "Dirección", width: 180 },
    { field: "ciudad", headerName: "Ciudad", width: 120 },
    { field: "codigo_postal", headerName: "C.P.", width: 90 },
    { field: "pais", headerName: "País", width: 100 },
    {
      field: "fecha_registro",
      headerName: "Registrado el",
      width: 170,
      renderCell: (params) => (
        <MDBox
          px={1.2}
          py={0.4}
          borderRadius="5px"
          sx={{
            backgroundColor: "#2c2c2c",
            color: "#ffc107",
            fontWeight: "bold",
            fontSize: "0.75rem",
            textAlign: "center",
          }}
        >
          {params.value}
        </MDBox>
      ),
    },
  ];

  return (
    <Card sx={{ backgroundColor: "#1a1a1a", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
      <MDBox p={3}>
        <MDBox
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
          px={2}
          py={1.5}
          borderRadius="lg"
          sx={{
            background: "linear-gradient(90deg, #1f1f1f, #2c2c2c)",
            color: "#ffffff",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          }}
        >
          <MDBox display="flex" alignItems="center" gap={1}>
            <MDBox
              display="flex"
              alignItems="center"
              justifyContent="center"
              width="36px"
              height="36px"
              borderRadius="50%"
              sx={{ backgroundColor: "#ff9100" }}
            >
              <i className="material-icons" style={{ color: "#fff", fontSize: "20px" }}>groups</i>
            </MDBox>
            <MDTypography variant="h6" fontWeight="bold" color="white">
              Lista de Clientes
            </MDTypography>
          </MDBox>

          <MDTypography variant="button" fontWeight="bold" color="#ffb300">
            Total: {clientes.length}
          </MDTypography>
        </MDBox>

        {isLoading ? (
          <MDBox display="flex" alignItems="center" gap={1}>
            <CircularProgress sx={{ color: "#ff9100" }} size={24} />
            <MDTypography variant="body2" color="white">
              Cargando clientes...
            </MDTypography>
          </MDBox>
        ) : (
          <StyledDataGrid
            rows={clientes}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            autoHeight
            getRowId={(row) => row.id_cliente || `${row.email}-${row.telefono}`}
          />
        )}
      </MDBox>
    </Card>
  );
};

export default ClientesTable;
