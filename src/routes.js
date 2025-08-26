
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import GroupIcon from "@mui/icons-material/Group";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
import HistoryIcon from "@mui/icons-material/History";



const routes = [
    {
    type: "collapse",
    name: "Inicio",
    key: "home",
    route: "/",
    icon: <HomeIcon />,
  },
  {
    type: "collapse",
    name: "Alta de Productos",
    key: "alta-productos",
    route: "/alta-productos",
    icon: <AddCircleOutlineIcon />,
  },
  {
    type: "collapse",
    name: "Cargar Venta",
    key: "ventas",
    route: "/cargar-venta",
    icon: <GroupIcon />,
  },
  {
    type: "collapse",
    name: "Inventario",
    key: "inventario",
    route: "/inventario",
    icon: <Inventory2Icon />,
  },
   {
    type: "collapse",
    name: "Historial",
    key: "historial",
    route: "/historial",
    icon: <HistoryIcon />,
  },
  {
    type: "collapse",
    name: "Salir",
    key: "salir",
    route: "/logout",
    icon: <LogoutIcon />,
  },
];

export default routes;
