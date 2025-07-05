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


#Aqui empieza el auto update


@echo off
chcp 65001 >nul
echo Verificando actualizaciones...

:: Ir al directorio del proyecto
cd C:\Users\fredw\Desktop\elmassreciente\otravez

:: Hacer fetch del repositorio remoto
git fetch origin

:: Obtener commits locales y remotos
for /f %%i in ('git rev-parse HEAD') do set LOCAL=%%i
for /f %%i in ('git rev-parse origin/Completo') do set REMOTE=%%i

if "%LOCAL%" NEQ "%REMOTE%" (
    echo Nuevos commits detectados en rama 'Completo', actualizando...
    
    :: Hacer pull con allow-unrelated-histories
    git pull origin Completo --allow-unrelated-histories
    
    :: Si hay conflictos, usar la versión remota
    if errorlevel 1 (
        echo Resolviendo conflictos automaticamente...
        git reset --hard origin/Completo
    )
    
    :: Ir al directorio server
    cd server
    echo Instalando dependencias...
    npm install
    
    echo Actualizacion completada
    echo Fecha: %date% %time%
) else (
    echo No hay cambios nuevos
    echo Fecha: %date% %time%
)

echo -----------------------------------
pause
