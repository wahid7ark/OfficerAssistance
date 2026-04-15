# Asisten Officer - Marine Navigation Toolkit

Aplikasi navigasi maritim komprehensif dengan perhitungan variasi magnetik WMM2025 yang akurat, kalkulator CPA/TCPA, ETA, dan berbagai fitur navigasi lainnya.

![Version](https://img.shields.io/badge/version-3.0.0-blue)
![WMM](https://img.shields.io/badge/WMM-2025-green)
![License](https://img.shields.io/badge/license-MIT-orange)

## Fitur Utama

### 1. Magnetic Variation & Compass Error
- Perhitungan variasi magnetik menggunakan **WMM2025** (World Magnetic Model 2025)
- Konversi geodetic → geocentric latitude (NOAA compliant)
- Perhitungan compass error/deviation
- Annual change tracking
- **GPS Integration** - Auto-fill koordinat dari GPS device
- Valid untuk 2025-2030

### 2. CPA / TCPA Calculator
- Closest Point of Approach
- Time to CPA
- Status: SAFE / CAUTION / DANGER / PASSED
- Input: Course, Speed, Bearing, Range (own & target ship)
- **Calculation History** dengan export functionality

### 3. ETA Calculator
- Estimated Time of Arrival
- Travel duration
- Support untuk voyage multi-hari
- **Calculation History**

### 4. Wind Calculator
- Konversi True Wind ↔ Apparent Wind
- Perhitungan berdasarkan course dan speed kapal

### 5. Sextant Calculator
- Koreksi altitude observasi
- Index error correction
- Dip correction berdasarkan height of eye

### 6. COLREG Reference
- Quick reference untuk International Regulations
- Lights & Shapes reference
- Sound signals
- **Signal Flags** dengan visual representation

### 7. Draft Survey Calculator
- Perhitungan berat muatan
- Initial dan Final draft comparison
- Export hasil perhitungan

### 8. Paint Calculator
- Perhitungan konsumsi cat
- Coverage area estimation

### 9. True Azimuth Calculator
- Perhitungan azimuth matahari
- Untuk compass checking

### 10. Compass Adjustment Tool
- Deviation table
- Compass error analysis

### 11. Star Finder
- Celestial navigation reference
- Star identification

### 12. Logbook Reference
- Sea State (Douglas Scale)
- Weather conditions
- Cloud types
- **PDF Export** capability

---

## Fitur Baru v3.0

### Dark/Light Mode
- Toggle antara dark mode dan light mode
- Smooth transitions
- Persistent preference

### Toast Notifications
- Success, error, warning, info notifications
- Non-intrusive feedback
- Auto-dismiss

### Calculation History
- Setiap kalkulator menyimpan history
- Export history ke JSON/CSV
- Clear individual atau semua history

### Export Functionality
- Export hasil perhitungan ke JSON
- Export history ke CSV
- Date-stamped filenames

### GPS Integration
- One-click GPS position acquisition
- Auto-fill latitude/longitude
- Hemisphere detection otomatis

### Loading States
- Visual feedback selama perhitungan
- Loading spinners
- Progress indicators

### Animated Transitions
- Smooth page transitions
- Element animations
- Fade-in effects

---

## Penggunaan Offline

### Opsi 1: PWA (Progressive Web App) - RECOMMENDED

Cara termudah untuk menggunakan aplikasi secara offline:

1. **Buka aplikasi di browser** (Chrome/Safari)
2. **Install ke Home Screen:**
   - **Android:** Menu → "Add to Home screen" / "Install app"
   - **iPhone:** Share → "Add to Home Screen"
3. **Gunakan offline** - Aplikasi akan cache semua data

### Opsi 2: APK Android

Build APK native untuk distribusi:

```bash
# Install dependencies
npm install

# Build APK
chmod +x build-apk.sh
./build-apk.sh
```

Atau build otomatis via GitHub Actions (lihat `.github/workflows/build-apk.yml`)

---

## Teknologi

- **Frontend:** React 19.2.0 + TypeScript 5.9.3 + Vite 7.2.4
- **UI:** Tailwind CSS 3.4.19 + shadcn/ui
- **PWA:** Vite PWA Plugin + Workbox
- **Mobile:** Capacitor 8.1.0 (Android)
- **Geomagnetism:** WMM2025 Spherical Harmonics
- **Icons:** Lucide React

---

## Model Geomagnetik

Aplikasi menggunakan **WMM2025** (World Magnetic Model 2025) dari NOAA NCEI:

- Reference Epoch: **2025.0**
- Valid Period: **2025 - 2030**
- Spherical Harmonics Degree: **n=12**
- Konversi: Geodetic → Geocentric (WGS-84)

### Akurasi

| Parameter | Akurasi |
|-----------|---------|
| Declination | ~0.5° (typical) |
| Inclination | ~0.2° |
| Intensity | ~150 nT |

---

## Struktur Project

```
app/
├── src/
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── AnimatedTransition.tsx
│   │   ├── CalculationHistory.tsx
│   │   └── LoadingSpinner.tsx
│   ├── hooks/
│   │   ├── useLocalStorage.ts
│   │   ├── useCalculationHistory.ts
│   │   ├── useExport.ts
│   │   └── useToast.ts
│   ├── lib/
│   │   ├── wmm2025.ts          # WMM2025 coefficients
│   │   ├── geomagnetism.ts     # Magnetic field calculation
│   │   ├── navigation.ts       # CPA/ETA calculations
│   │   └── language.ts         # i18n translations
│   ├── sections/               # Panel components
│   │   ├── MagneticVariationPanel.tsx
│   │   ├── CPAPanel.tsx
│   │   ├── ETAPanel.tsx
│   │   ├── WindCalculatorPanel.tsx
│   │   ├── SextantCalculatorPanel.tsx
│   │   ├── COLREGPanel.tsx
│   │   ├── DraftSurveyPanel.tsx
│   │   ├── PaintCalculatorPanel.tsx
│   │   ├── AzimuthPanel.tsx
│   │   ├── CompassAdjustmentPanel.tsx
│   │   ├── StarFinderPanel.tsx
│   │   └── LogbookReferencePanel.tsx
│   └── App.tsx
├── public/
│   ├── compass.jpg
│   ├── icon-192x192.png
│   └── icon-512x512.png
├── capacitor.config.json
├── vite.config.ts
├── info.md                     # Enhancement documentation
└── BUILD_APK_GUIDE.md
```

---

## Development

```bash
# Clone repository
git clone <repo-url>
cd app

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

---

## Build APK

### Requirements
- Node.js 20+
- Android Studio
- Java JDK 17+

### Steps
```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# Add Android platform
npx cap add android

# Build web
npm run build

# Sync to Android
npx cap sync android

# Open Android Studio
npx cap open android

# Or build via command line
cd android
./gradlew assembleRelease
```

---

## Validasi

Hasil perhitungan telah divalidasi dengan:
- NOAA NCEI Magnetic Field Calculators
- WMM2025 Test Values

### Sample Results

| Location | Lat | Lon | Declination |
|----------|-----|-----|-------------|
| Banjarmasin | 3°44'S | 115°44'E | 1.68° E |
| Jakarta | 6°10'S | 106°49'E | 1.99° E |
| Singapore | 1°17'N | 103°51'E | 1.29° E |

---

## Changelog

### v3.0.0 (2026-02-27)
- **Major UI/UX Update**
- Dark/Light mode toggle
- Toast notifications
- Calculation history untuk semua kalkulator
- Export functionality (JSON/CSV)
- GPS integration untuk auto-fill koordinat
- Loading states dan animations
- Theme persistence
- History persistence dengan localStorage

### v2.2.0 (2026-02-26)
- Added Star Finder panel
- Added Logbook Reference panel
- Added Paint Calculator panel
- Multi-language support (ID, EN, ZH)

### v2.0.0 (2026-02-25)
- Added COLREG Reference
- Added Draft Survey Calculator
- Added True Azimuth Calculator
- Added Compass Adjustment Tool

### v1.0.0 (2026-02-24)
- Initial release
- WMM2025 magnetic variation
- CPA/TCPA calculator
- ETA calculator
- Wind Calculator
- Sextant Calculator
- PWA support
- Android APK support

---

## Credits

- **WMM2025 Coefficients:** NOAA NCEI
- **Framework:** React + Vite
- **UI Components:** shadcn/ui
- **Icons:** Lucide React
- **Original Developer:** Mr. Wahid (15)

---

## License

MIT License - ARK DAN © 2026

---

**Catatan:** Aplikasi ini dirancang untuk navigasi maritim. Selalu cross-check dengan sumber navigasi resmi dan chart magnetik terbaru.
