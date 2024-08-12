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
  const [showAuditoriasSubmenu, setShowAuditoriasSubmenu] = useState(false);
  const [showIshikawaSubmenu, setShowIshikawaSubmenu] = useState(false);
  const [showCalendariosSubmenu, setShowCalendariosSubmenu] = useState(false);

  const toggleAuditoriasSubmenu = () => {
    setShowAuditoriasSubmenu(!showAuditoriasSubmenu);
    setShowIshikawaSubmenu(false);
    setShowCalendariosSubmenu(false);
  };
  
  const toggleIshikawaSubmenu = () => {
    setShowIshikawaSubmenu(!showIshikawaSubmenu);
    setShowAuditoriasSubmenu(false);
    setShowCalendariosSubmenu(false);
  };
  
  const toggleCalendariosSubmenu = () => {
    setShowCalendariosSubmenu(!showCalendariosSubmenu);
    setShowAuditoriasSubmenu(false);
    setShowIshikawaSubmenu(false);
  };
  

  const drawerItems = [
    { text: "Usuarios", href: "/usuariosRegistrados" },
    { text: "Programa", href: "/programa" },
    { text: "Departamentos", href: "/departamento" },
    {
      text: "Auditorías", subItems: [
        { text: "Generar Auditoría", href: "/datos" },
        { text: "Revisión de Auditoría", href: "/revicion" },
        { text: "Revisión de Ishikawa", href: "/terminada" },
        { text: "Auditorías Finalizadas", href: "/finalizadas" }
      ],
      showSubmenu: showAuditoriasSubmenu,
      toggleSubmenu: toggleAuditoriasSubmenu
    },
    {
      text: "Ishikawa", subItems: [
        { text: "Generar Ishikawa", href: "/ishikawa" },
        { text: "Ishikawas Generados", href: "/diagrama" },
      ],
      showSubmenu: showIshikawaSubmenu,
      toggleSubmenu: toggleIshikawaSubmenu
    },
    {
      text: "Calendarios",
      subItems: [
        { text: "Calendario de Auditorias", href: "/calendario" },
        { text: "Historial de Auditorias", href: "/auditcalendar" }
      ],
      showSubmenu: showCalendariosSubmenu,
      toggleSubmenu: toggleCalendariosSubmenu
    },
    { text: "Carga Masiva", href: "/carga" },
    { text: "Estadisticas", href: "/estadisticas" }
    
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
                  <ListItem disablePadding className="list-item" onClick={item.toggleSubmenu}>
                    <ListItemButton>
                    <ListItemText primary={item.text} className="list-item-text" />
                    {item.showSubmenu ? <MdExpandLess /> : <MdExpandMore />}
                    </ListItemButton>
                  </ListItem>
                </Dropdown.Toggle>
                <Dropdown.Menu style={{ display: item.showSubmenu ? 'block' : 'none' }}>
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
