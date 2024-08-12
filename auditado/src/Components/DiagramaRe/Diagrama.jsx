import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Logo from "../../assets/img/logoAguida.png";
import Navigation from "../Navigation/navbar";
import Ishikawa from '../../assets/img/Ishikawa-transformed.png';

const Diagrama = () => {
    const [ishikawas, setIshikawas] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/ishikawa`);
                setIshikawas(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div>
        <div style={{ position: 'absolute', top: 0, left: 0 }}>
        <Navigation />
         </div>
          <div>
          {ishikawas.map((ishikawa, index) => (
          <div className="image-container">
            <img src={Logo} alt="Logo Aguida" className='logo-empresa' />
            <div className='posicion-en'>
            <div style={{ display: 'flex', alignItems: 'center' }}>
             <h2 style={{ marginLeft: '30rem', marginRight:'10px'}}>Problema: </h2>
            <div style={{width:'30rem', fontSize:'20px'}}>{ishikawa.problema}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
             <h2 style={{ marginLeft: '30rem', marginRight:'10px' }}>Afectación: </h2>
              <div style={{width:'30rem', fontSize:'20px'}}>{ishikawa.afectacion}</div>
            </div>
            
            </div>
            <div className='posicion-en-2'>
              <h3>Fecha: {ishikawa.fecha}</h3>
            </div>
          
            <div >
              <img src={Ishikawa} alt="Diagrama de Ishikawa" className="responsive-image" />
              {ishikawa.diagrama.map((item, i) => (
              <div key={i}>
              <textarea className="text-area"
               style={{ top: '19.1rem', left: '8.7rem' }} disabled>{item.text1}</textarea>
              <textarea className="text-area" 
               style={{ top: '19.1rem', left: '25.4rem' }} disabled>{item.text2}</textarea>
              <textarea className="text-area"
               style={{ top: '19.1rem', left: '41.2rem' }} disabled>{item.text3}</textarea>
    
              <textarea className="text-area" 
               style={{ top: '23.2rem', left: '12.2rem' }} disabled>{item.text4}</textarea>
              <textarea className="text-area" 
               style={{ top: '23.2rem', left: '28.8rem' }} disabled>{item.text5}</textarea>
              <textarea className="text-area"
               style={{ top: '23.2rem', left: '45rem' }} disabled>{item.text6}</textarea>
      
              <textarea className="text-area" 
               style={{ top: '27.2rem', left: '15.5rem' }} disabled>{item.text7}</textarea>
              <textarea className="text-area" 
               style={{ top: '27.2rem', left: '32.3rem' }} disabled>{item.text8}</textarea>
              <textarea className="text-area"
               style={{ top: '27.2rem', left: '48.1rem' }}   disabled>{item.text9}</textarea>
    
              <textarea className="text-area" value={item.text10}
               style={{ top: '31rem', left: '23rem' }} disabled></textarea>
              <textarea className="text-area" name='text11' value={item.text11}
               style={{ top: '31rem', left: '39.4rem' }} disabled></textarea>
    
              <textarea className="text-area" value={item.text12}
               style={{ top: '35rem', left: '19.7rem' }} disabled></textarea>
              <textarea className="text-area" name='text13' value={item.text13}
               style={{ top: '35rem', left: '36rem' }} disabled></textarea>
    
              <textarea className="text-area" name='text14' value={item.text14}
               style={{ top: '39rem', left: '16.6rem' }} disabled></textarea>
              <textarea className="text-area" name='text15' value={item.text15} 
               style={{ top: '39rem', left: '32.8rem' }} disabled></textarea>
    
              <textarea className="text-area" 
               style={{ top: '27rem', left: '67.5rem',width:'8.5rem', height:'8rem' }} value={item.problema}></textarea>
              </div>
                ))}
            </div>
    
                  <div key={index}>
                    <div className='posicion-bo'>
                      <h3>No conformidad:</h3>
                         <div style={{fontSize:'20px',width:'55em', textAlign:'justify'}}> {ishikawa.requisito}
                    
                    </div>
                      <h3>Hallazgo:</h3>
                      <div className='hallazgo-container'>
                        <div  >{ishikawa.hallazgo}</div>
                      </div>
                      <h3>Acción inmediata o corrección: </h3>
                      {ishikawa.correccion}
                      <h3>Causa del problema (Ishikawa, TGN, W-W, DCR):</h3>
                      <div style={{marginBottom:'20px'}}>{ishikawa.causa}</div>
                    </div>
                  </div>
                
            <div className='table-ish'>
              <table style={{border:'none'}}>
                <thead>
                  <tr>
                    <th className="conformity-header">Actividad</th>
                    <th className="conformity-header">Responsable</th>
                    <th className="conformity-header">Fecha Compromiso</th>
                  </tr>
                </thead>
                <tbody>
                {ishikawa.actividades.map((actividad, i) => (
                    <tr key={i}>
                      <td>
                      {actividad.actividad}
                      </td>
                      <td>
                        {actividad.responsable}
                      </td>
                      <td>
                      {new Date(actividad.fechaCompromiso).toLocaleDateString()}
                      </td>
                     
                    </tr>
                  ))}

                </tbody>
                </table>
    
                <table style={{border:'none'}}>
                  <thead>
                    <tr>
                      <th>Actividad</th>
                      <th>Responsable</th>
                      <th>Fecha Compromiso</th>
                      <th colSpan="2" className="sub-div">
                        <div>Acción Correctiva cerrada</div>
                        <div style={{ display: 'flex' }}>
                          <div className="left">Sí</div>
                          <div className="right">No</div>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                  {ishikawa.accionesCorrectivas.map((accion, i) => (
                      <tr key={i}>
                        <td>
                          {accion.actividad}
                        </td>
                        <td>
                          {accion.responsable}
                        </td>
                        <td>
                        {new Date(accion.fechaCompromiso).toLocaleDateString()}
                        </td>
                        <td>
                        {accion.cerrada}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            ))}
            </div>

          </div>
        );
};

export default Diagrama;