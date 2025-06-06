import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import PaidIcon from "@mui/icons-material/Paid";
import CalculateIcon from "@mui/icons-material/Calculate";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import DiscountIcon from "@mui/icons-material/Discount";
import HailIcon from "@mui/icons-material/Hail";
import MoreTimeIcon from "@mui/icons-material/MoreTime";
import HomeIcon from "@mui/icons-material/Home";
import { useNavigate } from "react-router-dom";
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';

export default function Sidemenu({ open, toggleDrawer }) {
  const navigate = useNavigate();

  const listOptions = () => (
    <Box
      role="presentation"
      onClick={toggleDrawer(false)}
    >
      <List>
        <ListItemButton onClick={() => navigate("/home")}>
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItemButton>

        <Divider />

        <ListItemButton onClick={() => navigate("/clientlist")}>
          <ListItemIcon>
            <PeopleAltIcon />
          </ListItemIcon>
          <ListItemText primary="Clientes" />
        </ListItemButton>

        <ListItemButton onClick={() => navigate("/booking/")}>
          <ListItemIcon>
            <MoreTimeIcon />
          </ListItemIcon>
          <ListItemText primary="Reservas" />
        </ListItemButton>

        <ListItemButton onClick={() => navigate("/bookinglist")}>
          <ListItemIcon>
            <FormatListBulletedIcon />
          </ListItemIcon>
          <ListItemText primary="Lista Reservas" />
        </ListItemButton>
        



      </List>

      <Divider />

      <List>

      <ListItemButton onClick={() => navigate("/pricing")}>
          <ListItemIcon>
            <PaidIcon />
          </ListItemIcon>
          <ListItemText primary="Listado precios" />
        </ListItemButton>


        <ListItemButton onClick={() => navigate("/specialdays")}>
          <ListItemIcon>
            <DiscountIcon />
          </ListItemIcon>
          <ListItemText primary="Dias especiales" />
        </ListItemButton>

        <Divider />

        <ListItemButton onClick={() => navigate("/report")}>
          <ListItemIcon>
            <CalculateIcon />
          </ListItemIcon>
          <ListItemText primary="Reportes" />
        </ListItemButton>
        
      </List>
    </Box>
  );

  return (
    <div>
      <Drawer anchor={"left"} open={open} onClose={toggleDrawer(false)}>
        {listOptions()}
      </Drawer>
    </div>
  );
}
