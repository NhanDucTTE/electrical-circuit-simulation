@echo off
setlocal
set "MOPHONG_EXE=%~dp0MoPhongTuDien.exe"
if not exist "%MOPHONG_EXE%" set "MOPHONG_EXE=%~dp0Mo Phong Mach Dien.exe"
if not exist "%MOPHONG_EXE%" (
    echo Khong tim thay ung dung. Hay giai nen toan bo goi MoPhongTuDien.
    pause
    exit /b 1
)
set "MOPHONG_VERIFY_DIR=%TEMP%\MoPhongTuDien-Verify"
echo Dang kiem thu ung dung Windows o che do offline.
start "" /wait "%MOPHONG_EXE%" --verify-offline "%MOPHONG_VERIFY_DIR%"
set "MOPHONG_RESULT=%ERRORLEVEL%"
if "%MOPHONG_RESULT%"=="0" (
    echo Kiem thu thanh cong.
) else (
    echo Kiem thu that bai.
)
echo Xem result.json trong thu muc kiem thu moi nhat tai "%MOPHONG_VERIFY_DIR%".
pause
exit /b %MOPHONG_RESULT%
