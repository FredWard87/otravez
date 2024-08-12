import React, { useState } from 'react';
import styled from 'styled-components';

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  margin: auto;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Button = styled.button`
  padding: 10px 20px;
  margin-top: 10px;
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

const ErrorMessage = styled.p`
  color: red;
  font-size: 0.9rem;
`;

const CalificacionForm = ({ onSubmit }) => {
  const [nombreCurso, setNombreCurso] = useState('');
  const [calificacion, setCalificacion] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const calificacionNumber = parseFloat(calificacion);
    if (calificacionNumber < 0 || calificacionNumber > 10) {
      setError('La calificación debe estar entre 0 y 10.');
      return;
    }
    setError('');
    onSubmit({ nombreCurso, calificacion });
    setNombreCurso('');
    setCalificacion('');
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <Input
        type="text"
        placeholder="Nombre del curso"
        value={nombreCurso}
        onChange={(e) => setNombreCurso(e.target.value)}
      />
      <Input
        type="number"
        placeholder="Calificación"
        value={calificacion}
        onChange={(e) => setCalificacion(e.target.value)}
        min="0"
        max="10"
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <Button type="submit">Agregar Calificación</Button>
    </FormContainer>
  );
};

export default CalificacionForm;
