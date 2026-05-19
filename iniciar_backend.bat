@echo off
echo Iniciando Backend NeuroGym...
cd /d "%~dp0backend"
python manage.py runserver
pause
