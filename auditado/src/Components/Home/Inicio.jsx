import React, { useContext, useEffect, useRef } from "react";
import './css/Inicio.css';
import videoFile from '../../assets/img/UpscaleVideo_1_20240628.mp4';
import Navigation from "../Navigation/navbar";
import { UserContext } from '../../App';

const Inicio = () => {
  const { userData, setUserData } = useContext(UserContext);
  const videoRef = useRef(null);

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, [setUserData]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  }, []);

  return (
    <div className="inicio-container" style={{ position: 'relative' }}>
      <video 
        ref={videoRef} 
        src={videoFile} 
        autoPlay 
        loop 
        muted 
        style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: -1 }}
      />
      <div style={{ position: 'absolute', top: 0, left: 0, width: '4rem',
         borderRadius:'10px', backgroundColor:'#000000' }}>
        <Navigation />
      </div>
      <div className="inicio-content">
        <h1>Bienvenido</h1>
        {userData && (
          <div className="user-info">
            <br />
            <br />
            <br />
            <br />
            <p className="user-name">{userData.Nombre}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inicio;
