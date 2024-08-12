import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from '../../App';
import "./css/Navbar.css";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Dropdown from 'react-bootstrap/Dropdown';
import logo from "../../assets/img/logoAguida.png";
import Swal from 'sweetalert2';
import { MdExpandMore, MdExpandLess } from "react-icons/md";

export default function Navigation() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { setUserData } = useContext(UserContext);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

const handleLogout = () => {
  Swal.fire({
    title: '¿Estás seguro de que quieres cerrar sesión?',
    text: '¡Tu sesión actual se cerrará!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3ccc37',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, cerrar sesión',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem('token');
      setUserData(null);
      navigate('/');
    }
  });
};

  return (
    <div className="navbar-container">
      <Navbar className="navbar-custom">
        <Container>
          <IconButton onClick={toggleDrawer(true)} aria-label="menu">
            <MenuIcon className="menu-icon" style={{ fontSize: '200%' }} />
          </IconButton>
          <Drawer open={open} onClose={toggleDrawer(false)}>
            <DrawerList handleLogout={handleLogout} />
          </Drawer>
        </Container>
      </Navbar>
    </div>
  );
}

function DrawerList({ handleLogout }) {
  const [showSubmenu, setShowSubmenu] = useState(false);

  const toggleSubmenu = () => {
    setShowSubmenu(!showSubmenu);
  };

  const drawerItems = [
    { text: "Inicio", href: "/home" },
    {
      text: "Auditorias" , subItems: [
        { text: "Llenado de Checklist", href: "/pendiente" },
        { text: "Reportes Generados", href: "/reporte" }
      ]
    },
    { text: "Usuario", href: "/informacion" }
    ];

  return (
    <Box className="drawer-container">
      <List className="drawer-list">
        <a href="/home">
          <img src={logo} alt="Logo Empresa" className="logo-img" />
        </a>
        {drawerItems.map((item, index) => (
          <div key={index}>
            {item.subItems ? (
              <Dropdown>
                <Dropdown.Toggle variant="transparent" className="dropdown-toggle">
                  <ListItem disablePadding className="list-item" onClick={toggleSubmenu}>
                    <ListItemButton>
                    <ListItemText primary={item.text} className="list-item-text" />
                    {toggleSubmenu[item.text] ? <MdExpandLess /> : <MdExpandMore />}
                    </ListItemButton>
                  </ListItem>
                </Dropdown.Toggle>
                <Dropdown.Menu style={{ display: showSubmenu ? 'block' : 'none' }}>
                  {item.subItems.map((subItem, subIndex) => (
                    <Dropdown.Item key={subIndex}>
                      <button className="link-button" onClick={() => window.location.href = subItem.href}>
                        {subItem.text}
                      </button>
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <ListItem disablePadding className="list-item">
                <ListItemButton>
                  {item.onClick ? (
                    <button className="link-button" onClick={item.onClick}>
                      <ListItemText primary={item.text} className="list-item-text" />
                    </button>
                  ) : (
                    <button className="link-button" onClick={() => window.location.href = item.href}>
                      <ListItemText primary={item.text} className="list-item-text" />
                    </button>
                  )}
                </ListItemButton>
              </ListItem>
            )}
          </div>
        ))}
      </List>
      <div className="logout-container">
        <button className="link-button logout-button" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </Box>
  );
}
