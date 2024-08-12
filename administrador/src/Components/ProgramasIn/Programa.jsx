import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import './css/Programa.css';
import Navigation from "../Navigation/Navbar";
import Swal from "sweetalert2";

const Programas = () => {
  const [nombre, setNombre] = useState("");
  const [file, setFile] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [programas, setProgramas] = useState([]);
  const [visibleProgramas, setVisibleProgramas] = useState({});
  const [editingRequisito, setEditingRequisito] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const fileInputRef = useRef(null);
  const [requisitos, setRequisitos] = useState([{ ID: "", Requisito: "" }]);
  const [, setInitialID] = useState("");
  const [editingPrograma, setEditingPrograma] = useState(null);



  const handleNombreChange = (e) => {
    setNombre(e.target.value);
  };

  const getNextID = (previousID) => {
    const parts = previousID.split('.').map(Number);
    parts[1] += 1;
    return parts.join('.');
  };  

  const handleRequisitoChange = (index, key, value) => {
    const newRequisitos = [...requisitos];
    newRequisitos[index][key] = value;
    setRequisitos(newRequisitos);
    if (index === 0 && key === "ID") {
      setInitialID(value);
    }
  };  
  
  const handleAddRequisito = () => {
    const lastRequisito = requisitos[requisitos.length - 1];
    const nextID = getNextID(lastRequisito.ID);
    setRequisitos([...requisitos, { ID: nextID, Requisito: "" }]);
  };  

  const handleRemoveRequisito = (index) => {
    const newRequisitos = requisitos.filter((_, i) => i !== index);
    setRequisitos(newRequisitos);
  }; 
    
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/programas/carga-masiva`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.data.duplicados && response.data.duplicados.length > 0) {
        Swal.fire({
          title: 'Advertencia',
          text: `Algunos programas ya existen y no fueron añadidos: ${response.data.duplicados.join(', ')}`,
          icon: 'warning',
          confirmButtonText: 'Aceptar'
        });
      } else {
        Swal.fire({
          title: 'Éxito',
          text: 'Archivo cargado con éxito',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
      }
      console.log('Respuesta de carga masiva:', response.data);
      fetchProgramas(); // Actualizar la lista de programas después de la carga masiva
    } catch (error) {
      console.error('Error al cargar el archivo:', error);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.error || 'Hubo un error al cargar el archivo. Por favor, inténtalo de nuevo más tarde.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      fileInputRef.current.files = e.dataTransfer.files;
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const fetchProgramas = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/programas`);
      setProgramas(response.data);
      // Inicializar la visibilidad de los programas
      const initialVisibility = response.data.reduce((acc, programa) => {
        acc[programa._id] = false;
        return acc;
      }, {});
      setVisibleProgramas(initialVisibility);
    } catch (error) {
      console.error('Error al obtener los programas:', error);
      Swal.fire({
        title: 'Error',
        text: 'Hubo un error al obtener los programas. Por favor, inténtalo de nuevo más tarde.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  };

  useEffect(() => {
    fetchProgramas();
  }, []);

  const toggleVisibility = (id) => {
    setVisibleProgramas((prevState) => ({
      ...prevState,
      [id]: !prevState[id]
    }));
  };

  const handleEditClick = (requisito, programaId) => {
    setEditingRequisito({ ...requisito, programaId });
    setEditingValue(requisito.Requisito);
  };

  const handleEditChange = (e) => {
    setEditingValue(e.target.value);
  };

  const handleEditProgram = (programa) => {
    setNombre(programa.Nombre);
    setRequisitos(programa.Descripcion);
    setEditingPrograma(programa._id);
    setShowForm(true);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingPrograma) {
      try {
        const response = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/programas/${editingPrograma}`, {
          Nombre: nombre,
          Descripcion: requisitos
        });
        Swal.fire({
          title: 'Programa actualizado con éxito',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#3ccc37'
        });
        console.log('Programa actualizado:', response.data);
        setNombre('');
        setRequisitos([{ ID: "", Requisito: "" }]);
        setEditingPrograma(null);
        fetchProgramas();
      } catch (error) {
        console.error('Error al actualizar el programa:', error);
        Swal.fire({
          title: 'Error',
          text: error.response?.data?.error || 'Hubo un error al actualizar el programa. Por favor, inténtalo de nuevo más tarde.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    } else {
      try {
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/programas`, {
          Nombre: nombre,
          Descripcion: requisitos
        });
        Swal.fire({
          title: 'Programa registrado con éxito',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#3ccc37'
        });
        console.log('Programa creado:', response.data);
        setNombre('');
        setRequisitos([{ ID: "", Requisito: "" }]);
        fetchProgramas();
      } catch (error) {
        console.error('Error al crear el programa:', error);
        Swal.fire({
          title: 'Error',
          text: error.response?.data?.error || 'Hubo un error al guardar el programa. Por favor, inténtalo de nuevo más tarde.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    }
  };
  

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedProgramas = programas.map((programa) => {
        if (programa._id === editingRequisito.programaId) {
          return {
            ...programa,
            Descripcion: programa.Descripcion.map((desc) =>
              desc.ID === editingRequisito.ID ? { ...desc, Requisito: editingValue } : desc
            )
          };
        }
        return programa;
      });

      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/programas/${editingRequisito.programaId}`, {
        Descripcion: updatedProgramas.find(p => p._id === editingRequisito.programaId).Descripcion
      });

      setProgramas(updatedProgramas);
      setEditingRequisito(null);
      Swal.fire({
        title: 'Requisito actualizado con éxito',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      });
    } catch (error) {
      console.error('Error al actualizar el requisito:', error);
      Swal.fire({
        title: 'Error',
        text: 'Hubo un error al actualizar el requisito. Por favor, inténtalo de nuevo más tarde.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  };

  const handleDeleteClick = async (requisito, programaId) => {
    const confirmResult = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (confirmResult.isConfirmed) {
      try {
        const updatedProgramas = programas.map((programa) => {
          if (programa._id === programaId) {
            return {
              ...programa,
              Descripcion: programa.Descripcion.filter((desc) => desc.ID !== requisito.ID)
            };
          }
          return programa;
        });

        await axios.put(`${process.env.REACT_APP_BACKEND_URL}/programas/${programaId}`, {
          Descripcion: updatedProgramas.find(p => p._id === programaId).Descripcion
        });

        setProgramas(updatedProgramas);
        Swal.fire({
          title: 'Requisito eliminado con éxito',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
      } catch (error) {
        console.error('Error al eliminar el requisito:', error);
        Swal.fire({
          title: 'Error',
          text: 'Hubo un error al eliminar el requisito. Por favor, inténtalo de nuevo más tarde.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    }
  };

  return (
    <div>
      <div className="centrado-pro">
        <div style={{ position: 'absolute', top: 0, left: 0 }}>
          <Navigation />
        </div>
        <div className="programas-container-ext">
          <div className="programas-container">
            <h1>Programas</h1>
            <div className="align-right">
              <button onClick={() => setShowForm(!showForm)}>
                {showForm ? "Ocultar" : "Agregar"}
              </button>
            </div>
            {showForm && (
              <form onSubmit={handleSubmit}>
                <div>
                  <label>Programa:</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={handleNombreChange}
                    required
                  />
                </div>
                {requisitos.map((requisito, index) => (
                <div key={index}>
                  <label>ID {index + 1}:</label>
                  <input
                    type="text"
                    value={requisito.ID}
                    onChange={(e) => handleRequisitoChange(index, "ID", e.target.value)}
                    required
                  />
                  <label>Requisito {index + 1}:</label>
                  <textarea
                    value={requisito.Requisito}
                    onChange={(e) => handleRequisitoChange(index, "Requisito", e.target.value)}
                    required
                  />
                  {index !== 0 && (
                    <button type="button" onClick={() => handleRemoveRequisito(index)}>Cancelar</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={handleAddRequisito}>Agregar Requisito</button>
              <button type="submit">Crear Programa</button>

              </form>
            )}
            <h2>Cargar archivo</h2>
            <form onSubmit={handleFileUpload} onDragOver={handleDragOver} onDrop={handleDrop}>
              <div className="file-drag-drop" onClick={handleClick}>
                {file ? file.name : "Arrastra y suelta el archivo aquí, o haz clic para seleccionar"}
              </div>
              <input 
                ref={fileInputRef} 
                type="file" 
                onChange={handleFileChange} 
                accept=".xlsx" 
                style={{ display: 'none' }} 
                required 
              />
              <button type="submit">Cargar</button>
            </form>
          </div>
        </div>
        
        <div className="datos-container-prog-2">
          <h2 className="list-programa">Lista de Programas</h2>
          {programas.length > 0 ? (
  programas.sort((a, b) => a.Nombre.localeCompare(b.Nombre)).map((programa) => (
    <div key={programa._id}>
      <div className="header-container-datos-prog">
        <button onClick={() => toggleVisibility(programa._id)}>
          {visibleProgramas[programa._id] ? '' : ''} {programa.Nombre}
        </button>
        
      </div>
      <div className="tabla-programa">
        {visibleProgramas[programa._id] && (
          <div>
            <div className="button-ed-pro">
              <button onClick={() => handleEditProgram(programa)}>Agregar</button>
            </div>
          <table>
            <thead>
              <tr>
                <th colSpan="3">{programa.Nombre}</th>
              </tr>
              <tr>
                <th>ID</th>
                <th>Requisitos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {programa.Descripcion.map((desc, idx) => (
                <tr key={idx}>
                  <td>{desc.ID}</td>
                  <td>{desc.Requisito}</td>
                  <td>
                    <button onClick={() => handleEditClick(desc, programa._id)}>Editar</button>
                    <button onClick={() => handleDeleteClick(desc, programa._id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  ))
) : (
  <p>No hay programas disponibles.</p>
)}

        </div>
      </div>

      {editingRequisito && (
        <>
          <div className="edit-modal-backdrop" onClick={() => setEditingRequisito(null)}></div>
          <div className="edit-modal">
            <h2>Editar Requisito</h2>
            <form onSubmit={handleEditSubmit}>
              <textarea 
                value={editingValue} 
                onChange={handleEditChange} 
                required 
              />
              <div className="button-group">
                <button type="submit">Guardar</button>
                <button type="button" onClick={() => setEditingRequisito(null)}>Cancelar</button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default Programas;