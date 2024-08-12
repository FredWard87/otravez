import { Container, Card, Icon, Button, Modal } from 'semantic-ui-react';
import './css/Camara.css';
import { useEffect, useRef, useState } from 'react';

function Fotos({ open, onClose, onCapture }) {
  const videoDiv = useRef(null);
  const fotoDiv = useRef(null);
  const [hayFoto, setHayFoto] = useState(false);
  const [stream, setStream] = useState(null);
  const [camera, setCamera] = useState('user');
  const [zoom, setZoom] = useState(1);

  const verCamara = async () => {
    try {
      if (stream) {
        detenerCamara();
      }
      const currentStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1080, height: 720, facingMode: camera }
      });
      setStream(currentStream);
      if (videoDiv.current) {
        videoDiv.current.srcObject = currentStream;
        videoDiv.current.play();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const detenerCamara = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const tomarFoto = () => {
    const w = 720;
    const h = w / (16 / 9);

    const video = videoDiv.current;
    const foto = fotoDiv.current;

    if (foto && video) {
      foto.width = w;
      foto.height = h;
      const context = foto.getContext('2d');
      context.drawImage(video, 0, 0, w, h);
      setHayFoto(true);

      // Captura la imagen como una base64 string
      const dataUrl = foto.toDataURL('image/png');
      onCapture(dataUrl);
    }
  };

  const cerrarFoto = () => {
    const f = fotoDiv.current;
    if (f) {
      const context = f.getContext('2d');
      context.clearRect(0, 0, f.width, f.height);
      setHayFoto(false);
    }
  };

  const cambiarCamara = () => {
    setCamera(prevCamera => (prevCamera === 'user' ? 'environment' : 'user'));
  };

  const handleZoomChange = (event) => {
    const newZoom = event.target.value;
    setZoom(newZoom);

    const track = stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities();
    if (capabilities.zoom) {
      const settings = track.getSettings();
      track.applyConstraints({
        advanced: [{ zoom: newZoom }]
      });
    }
  };

  useEffect(() => {
    if (open) {
      verCamara();
    } else {
      detenerCamara();
    }

    return () => {
      detenerCamara();
    };
  }, [open, camera]);

  return (
    <Modal open={open} onClose={onClose} size="small" className="fixed-modal">
      <Modal.Content>
        <Container className="miApp" fluid textAlign="center">
          <Card.Group centered>
            <Card>
              <video ref={videoDiv} style={{ width: '100%', height: 'auto'}}></video>
              <Card.Content>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={handleZoomChange}
                />
                <button className="camera-button" color="teal" onClick={tomarFoto} disabled={!open}>
                  <span className="material-symbols-outlined" style={{fontSize: "40px",}}>photo_camera</span>
                </button>
                <Button className="camera-switch-button" color="blue" onClick={cambiarCamara}>
                  <span className="material-symbols-outlined" >switch_camera</span>
                </Button>
                <Button color="red" onClick={onClose}>
                  <Icon name="close" /> Cerrar
                </Button>
              </Card.Content>
            </Card>
            <Card>
              <canvas ref={fotoDiv}></canvas>
              {hayFoto && (
                <Card.Content>
                  <Button color="red" onClick={cerrarFoto}>
                    <Icon name="close" /> Cerrar Foto
                  </Button>
                </Card.Content>
              )}
            </Card>
          </Card.Group>
        </Container>
      </Modal.Content>
    </Modal>
  );
}

export default Fotos;
