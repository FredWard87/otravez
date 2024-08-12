import React, { useState } from 'react';
import styled from 'styled-components';
import CalificacionForm from './Calificacionform';

const Modal = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  position: relative;
`;

const CloseButton = styled.span`
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
  cursor: pointer;
`;

const Title = styled.h2`
  margin-top: 0;
`;

const CalificacionList = styled.div`
  margin-bottom: 20px;
`;

const CalificacionItem = styled.div`
  margin-bottom: 10px;
`;

const SaveButton = styled.button`
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const CalificacionModal = ({ show, handleClose, onSubmit }) => {
  const [calificaciones, setCalificaciones] = useState([]);

  const handleAddCalificacion = (calificacion) => {
    setCalificaciones([...calificaciones, calificacion]);
  };

  const handleSubmitCalificaciones = () => {
    onSubmit(calificaciones);
    setCalificaciones([]);
    handleClose();
  };

  return (
    <>
      {show && (
        <Modal>
          <ModalContent>
            <CloseButton onClick={handleClose}>&times;</CloseButton>
            <Title>Agregar Calificaciones</Title>
            <CalificacionList>
              {calificaciones.map((calificacion, index) => (
                <CalificacionItem key={index}>
                  <p>Nombre del curso: {calificacion.nombreCurso}, Calificación: {calificacion.calificacion}</p>
                </CalificacionItem>
              ))}
            </CalificacionList>
            <CalificacionForm onSubmit={handleAddCalificacion} />
            <SaveButton onClick={handleSubmitCalificaciones}>Guardar Calificaciones</SaveButton>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default CalificacionModal;
