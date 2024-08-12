import React, { useState, useEffect } from 'react';
import { Button, FormControl, Form, Modal, Table } from 'react-bootstrap';
import Navigation from '../Navigation/Navbar';
import './css/Departaments.css';
import './css/areaModals.css'; // Nueva hoja de estilos para los modales

const AreaForm = ({ nuevaArea, handleInputChange, handleAreaChange, areasInput, agregarAreaInput, eliminarAreaInput }) => (
  <Form>
    <Form.Group controlId="formDepartamento">
      <Form.Label>Departamento</Form.Label>
      <FormControl
        type="text"
        name="departamento"
        value={nuevaArea.departamento}
        onChange={handleInputChange}
      />
    </Form.Group>
    <Form.Group controlId="formAreas">
      <Form.Label>Áreas</Form.Label>
      {areasInput.map((area, index) => (
        <div key={index} className="area-input-group">
          <FormControl
            type="text"
            name={`area-${index}`}
            value={area}
            onChange={(e) => handleAreaChange(e, index)}
            placeholder={`Área ${index + 1}`}
            className="mb-2"
          />
          <Button variant="danger" onClick={() => eliminarAreaInput(index)}>Eliminar Área</Button>
        </div>
      ))}
      <Button variant="secondary" onClick={agregarAreaInput}>Agregar otra área</Button>
    </Form.Group>
  </Form>
);

const Departaments = () => {
  const [areas, setAreas] = useState([]);
  const [nuevaArea, setNuevaArea] = useState({ departamento: '', areas: [] });
  const [mostrarFormularioArea, setMostrarFormularioArea] = useState(false);
  const [areaSeleccionadaId, setAreaSeleccionadaId] = useState(null);
  const [valoresAreaSeleccionada, setValoresAreaSeleccionada] = useState({ departamento: '', areas: [] });
  const [mostrarModalActualizar, setMostrarModalActualizar] = useState(false);
  const [filtroArea, setFiltroArea] = useState('');
  const [areasInput, setAreasInput] = useState(['']); // Inicializa con un área

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/areas`);
        if (!response.ok) {
          throw new Error('No se pudo obtener la lista de áreas');
        }
        const data = await response.json();
        setAreas(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAreas();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNuevaArea((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleAreaChange = (event, index) => {
    const newAreas = [...areasInput];
    newAreas[index] = event.target.value;
    setAreasInput(newAreas);
  };

  const agregarAreaInput = () => {
    setAreasInput([...areasInput, '']);
  };

  const eliminarAreaInput = (index) => {
    const newAreas = [...areasInput];
    newAreas.splice(index, 1);
    setAreasInput(newAreas);
  };

  const agregarArea = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/areas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...nuevaArea,
          areas: areasInput.filter(area => area.trim() !== '') // Eliminar áreas vacías
        }),
      });

      if (!response.ok) {
        throw new Error('No se pudo agregar el área');
      }

      const data = await response.json();
      setAreas([...areas, data]);
      setNuevaArea({ departamento: '', areas: [] });
      setAreasInput(['']); // Reinicia el área input
      setMostrarFormularioArea(false);
    } catch (error) {
      console.error('Error al agregar el área:', error);
    }
  };

  const eliminarArea = async (areaId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/areas/${areaId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('No se pudo eliminar el área');
      }
      const nuevasAreas = areas.filter((area) => area._id !== areaId);
      setAreas(nuevasAreas);
    } catch (error) {
      console.error(error);
    }
  };

  const abrirModalActualizar = (areaId) => {
    setAreaSeleccionadaId(areaId);
    const areaSeleccionada = areas.find(area => area._id === areaId);
    setValoresAreaSeleccionada(areaSeleccionada);
    setMostrarModalActualizar(true);
  };

  const cerrarModalActualizar = () => {
    setMostrarModalActualizar(false);
  };

  const actualizarArea = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/areas/${areaSeleccionadaId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...valoresAreaSeleccionada,
            areas: valoresAreaSeleccionada.areas.filter(area => area.trim() !== '') // Eliminar áreas vacías
          }),
        }
      );
      if (!response.ok) {
        throw new Error('No se pudo actualizar el área');
      }
      const data = await response.json();
      const index = areas.findIndex((a) => a._id === areaSeleccionadaId);
      const nuevasAreas = [...areas];
      nuevasAreas[index] = data;
      setAreas(nuevasAreas);
      cerrarModalActualizar();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <Navigation />
      <h2 className="titulo">Gestión de Departamentos y Áreas</h2>
      <div className="contenedor">
        <div className="boton-container">
          <Button
            variant="success"
            className="boton-verde"
            onClick={() => setMostrarFormularioArea(true)}
          >
            Agregar Departamento
          </Button>{' '}
          <FormControl
            type="text"
            placeholder="Filtrar Departamentos"
            value={filtroArea}
            onChange={(e) => setFiltroArea(e.target.value)}
            className="filtro"
          />
        </div>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Departamento</th>
              <th>Áreas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {areas
              .filter((area) =>
                area.departamento.toLowerCase().includes(filtroArea.toLowerCase())
              )
              .map((area) => (
                <tr key={area._id}>
                  <td>{area.departamento}</td>
                  <td>{area.areas.join(', ')}</td>
                  <td>
                    <button
                      variant="warning"
                      onClick={() => abrirModalActualizar(area._id)}
                      className="button-edit-dep"
                    >
                      Actualizar
                    </button>
                    <Button
                      variant="danger"
                      onClick={() => eliminarArea(area._id)}
                      className="button-eli-dep"
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
      </div>
      <Modal show={mostrarFormularioArea} onHide={() => setMostrarFormularioArea(false)} className="custom-modal">
        <Modal.Header closeButton className="custom-modal-header">
          <Modal.Title className="custom-modal-title">Agregar Departamento</Modal.Title>
        </Modal.Header>
        <Modal.Body className="custom-modal-body">
          <AreaForm
            nuevaArea={nuevaArea}
            handleInputChange={handleInputChange}
            agregarArea={agregarArea}
            handleAreaChange={handleAreaChange}
            areasInput={areasInput}
            agregarAreaInput={agregarAreaInput} // Pasar la función aquí
            eliminarAreaInput={eliminarAreaInput} // Pasar la función aquí
          />
        </Modal.Body>
        <Modal.Footer className="custom-modal-footer">
          <Button variant="secondary" onClick={() => setMostrarFormularioArea(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={agregarArea}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={mostrarModalActualizar} onHide={cerrarModalActualizar} className="custom-modal">
        <Modal.Header closeButton className="custom-modal-header">
          <Modal.Title className="custom-modal-title">Actualizar Departamento</Modal.Title>
        </Modal.Header>
        <Modal.Body className="custom-modal-body">
          <Form>
            <Form.Group controlId="formActualizarDepartamento">
              <Form.Label>Departamento</Form.Label>
              <FormControl
                type="text"
                name="departamento"
                value={valoresAreaSeleccionada.departamento}
                onChange={(e) =>
                  setValoresAreaSeleccionada({
                    ...valoresAreaSeleccionada,
                    departamento: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group controlId="formActualizarAreas">
              <Form.Label>Áreas</Form.Label>
              {valoresAreaSeleccionada.areas.map((area, index) => (
                <div key={index} className="area-input-group">
                  <FormControl
                    type="text"
                    name={`area-${index}`}
                    value={area}
                    onChange={(e) => {
                      const newAreas = [...valoresAreaSeleccionada.areas];
                      newAreas[index] = e.target.value;
                      setValoresAreaSeleccionada({
                        ...valoresAreaSeleccionada,
                        areas: newAreas,
                      });
                    }}
                    placeholder={`Área ${index + 1}`}
                    className="mb-2"
                  />
                  <Button variant="danger" onClick={() => {
                    const newAreas = [...valoresAreaSeleccionada.areas];
                    newAreas.splice(index, 1);
                    setValoresAreaSeleccionada({
                      ...valoresAreaSeleccionada,
                      areas: newAreas,
                    });
                  }}>Eliminar Área</Button>
                </div>
              ))}
              <Button
                variant="secondary"
                onClick={() =>
                  setValoresAreaSeleccionada({
                    ...valoresAreaSeleccionada,
                    areas: [...valoresAreaSeleccionada.areas, ''],
                  })
                }
              >
                Agregar otra área
              </Button>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="custom-modal-footer">
          <Button variant="secondary" onClick={cerrarModalActualizar}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={actualizarArea}>
            Actualizar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Departaments;