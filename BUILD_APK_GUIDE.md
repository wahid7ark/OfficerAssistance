# Panduan Build APK Android - Asisten Officer

## Opsi 1: PWA (Progressive Web App) - RECOMMENDED ⭐

Cara termudah dan tercepat untuk menggunakan aplikasi secara offline.

### Cara Install PWA:

#### Android (Chrome):
1. Buka https://b267ps5cca3aq.ok.kimi.link di Chrome
2. Tap menu (3 titik) → "Add to Home screen" atau "Install app"
3. Aplikasi akan muncul di home screen seperti app native
4. Bisa digunakan **100% OFFLINE** setelah pertama kali install

#### iPhone (Safari):
1. Buka URL di Safari
2. Tap share button → "Add to Home Screen"
3. Aplikasi akan terinstall

### Keuntungan PWA:
- ✅ Tidak perlu download APK
- ✅ Auto-update saat ada versi baru
- ✅ Work offline sepenuhnya
- ✅ Icon di home screen
- ✅ Hanya ~400KB download

---

## Opsi 2: APK Android (Native App)

Untuk build APK, Anda membutuhkan:
- Android Studio (download dari https://developer.android.com/studio)
- Java JDK 17 atau lebih baru
- Node.js (sudah terinstall)

### Langkah Build APK:

#### Step 1: Install Android Platform
```bash
cd /mnt/okcomputer/output/app
npx cap add android
```

#### Step 2: Build Web App
```bash
npm run build
```

#### Step 3: Sync ke Android
```bash
npx cap sync android
```

#### Step 4: Build APK dengan Android Studio
```bash
npx cap open android
```

Atau build langsung via command line:
```bash
cd android
./gradlew assembleRelease
```

APK akan tersedia di:
`android/app/build/outputs/apk/release/app-release-unsigned.apk`

#### Step 5: Sign APK (untuk distribusi)
```bash
# Generate keystore (hanya sekali)
keytool -genkey -v -keystore asisten-officer.keystore -alias asistenofficer -keyalg RSA -keysize 2048 -validity 10000

# Sign APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore asisten-officer.keystore app-release-unsigned.apk asistenofficer

# Zip align
zipalign -v 4 app-release-unsigned.apk AsistenOfficer.apk
```

---

## Opsi 3: Online Build Service (Tanpa Android Studio)

Gunakan layanan online untuk build APK tanpa install Android Studio:

### Ionic Appflow / Capacitor Cloud Build
1. Upload project ke GitHub
2. Connect ke Ionic Appflow
3. Build APK online

### Alternatif: GitHub Actions
Buat file `.github/workflows/build-apk.yml`:

```yaml
name: Build APK
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run build
      - run: npx cap add android
      - run: npx cap sync android
      - uses: android-actions/setup-android@v2
      - run: cd android && ./gradlew assembleRelease
      - uses: actions/upload-artifact@v3
        with:
          name: apk
          path: android/app/build/outputs/apk/release/*.apk
```

---

## Fitur Offline

Aplikasi ini sudah dilengkapi dengan:
- ✅ Service Worker untuk caching
- ✅ Workbox untuk precache semua assets
- ✅ Local storage untuk data
- ✅ Tidak perlu internet setelah pertama kali install

---

## Troubleshooting

### PWA tidak muncul "Add to Home Screen"
- Pastikan menggunakan HTTPS (sudah aktif)
- Clear browser cache dan coba lagi
- Gunakan Chrome versi terbaru

### APK build error
- Pastikan Android Studio terinstall dengan benar
- Cek `local.properties` sudah ada path SDK Android
- Jalankan `npx cap doctor` untuk cek environment

---

## Rekomendasi

Untuk penggunaan pribadi/officer di kapal:
- **Gunakan PWA** (Opsi 1) - Cepat, mudah, auto-update
- Jika butuh APK untuk distribusi massal, gunakan **Opsi 2** atau **Opsi 3**

---

Dibuat oleh: ARK DAN © 2026
Model: WMM2025 (NOAA NCEI)
