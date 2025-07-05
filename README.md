@echo off
echo Iniciando servidor automaticamente...

REM Cambiar a la ruta correcta (ajusta según tu carpeta)
cd /d "C:\Users\fredw\Desktop\maasreciente\otravez\server"

REM Verificar que estamos en la carpeta correcta
echo Carpeta actual: %cd%

REM Verificar que existe package.json
if exist package.json (
    echo ✅ package.json encontrado
    echo 🚀 Iniciando servidor...
    npm start
) else (
    echo ❌ No se encontró package.json en esta carpeta
    echo Verifica la ruta en el script
    pause
)

REM Mantener ventana abierta si hay error
if errorlevel 1 (
    echo ❌ Error al iniciar el servidor
    pause
)
