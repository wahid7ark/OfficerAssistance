#!/bin/bash
# Script untuk build APK Android - Asisten Officer
# Requirements: Android Studio, Java JDK 17+, Node.js

echo "=========================================="
echo "  BUILD APK - ASISTEN OFFICER"
echo "  Marine Navigation Toolkit"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Android platform exists
if [ ! -d "android" ]; then
    echo -e "${YELLOW}Android platform belum ditambahkan...${NC}"
    echo "Menambahkan Android platform..."
    npx cap add android
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Gagal menambahkan Android platform${NC}"
        echo "Pastikan Capacitor CLI terinstall: npm install @capacitor/cli"
        exit 1
    fi
fi

# Build web app
echo -e "${YELLOW}Building web app...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}Build web app gagal${NC}"
    exit 1
fi

# Sync ke Android
echo -e "${YELLOW}Sync ke Android project...${NC}"
npx cap sync android

if [ $? -ne 0 ]; then
    echo -e "${RED}Sync gagal${NC}"
    exit 1
fi

# Check if Android Studio is available
if command -v studio &> /dev/null; then
    echo -e "${GREEN}Membuka Android Studio...${NC}"
    npx cap open android
else
    echo -e "${YELLOW}Android Studio tidak ditemukan di PATH${NC}"
    echo "Mencoba build via Gradle..."
    
    cd android
    
    if [ -f "./gradlew" ]; then
        echo -e "${YELLOW}Building APK (Debug)...${NC}"
        ./gradlew assembleDebug
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}Build berhasil!${NC}"
            echo ""
            echo "APK Debug tersedia di:"
            echo "android/app/build/outputs/apk/debug/app-debug.apk"
            echo ""
            
            # Try to build release
            echo -e "${YELLOW}Building APK (Release - unsigned)...${NC}"
            ./gradlew assembleRelease
            
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}Build release berhasil!${NC}"
                echo ""
                echo "APK Release (unsigned) tersedia di:"
                echo "android/app/build/outputs/apk/release/app-release-unsigned.apk"
                echo ""
                echo -e "${YELLOW}CATATAN:${NC} APK release perlu di-sign untuk distribusi"
                echo "Lihat BUILD_APK_GUIDE.md untuk cara sign APK"
            fi
        else
            echo -e "${RED}Build gagal${NC}"
            echo "Pastikan Android SDK terinstall dengan benar"
            exit 1
        fi
    else
        echo -e "${RED}Gradle wrapper tidak ditemukan${NC}"
        echo "Silakan install Android Studio dan buka project ini"
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}  BUILD SELESAI${NC}"
echo -e "${GREEN}==========================================${NC}"
