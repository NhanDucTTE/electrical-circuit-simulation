@echo off
setlocal
set "MOPHONG_EXE=%~dp0MoPhongTuDien.exe"
if not exist "%MOPHONG_EXE%" set "MOPHONG_EXE=%~dp0Mo Phong Mach Dien.exe"
if not exist "%MOPHONG_EXE%" (
    echo Khong tim thay ung dung. Hay giai nen toan bo goi MoPhongTuDien.
    pause
    exit /b 1
)
start "" "%MOPHONG_EXE%"
