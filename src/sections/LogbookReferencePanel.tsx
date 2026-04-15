import { useState } from 'react';
import { ClipboardList, Info, Cloud, Waves, Sun, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Sea State data
const seaStateData = [
  { no: 1, condition: 'Calm Sea', min: '0', max: '-', beaufort: '0' },
  { no: 2, condition: 'Calm Rippled', min: '0', max: '0.5', beaufort: '1' },
  { no: 3, condition: 'Smooth Sea', min: '0.05', max: '1.5', beaufort: '2' },
  { no: 4, condition: 'Slight Sea', min: '1.5', max: '2.5', beaufort: '3' },
  { no: 5, condition: 'Moderate', min: '2.5', max: '4', beaufort: '4' },
  { no: 6, condition: 'Rough', min: '4', max: '6', beaufort: '5' },
  { no: 7, condition: 'Very Rough', min: '6', max: '9', beaufort: '6' },
  { no: 8, condition: 'High Sea', min: '9', max: '14', beaufort: '7' },
  { no: 9, condition: 'Very High', min: '14', max: '-', beaufort: '8' },
  { no: 10, condition: 'Phenomenal', min: '-', max: '-', beaufort: '9' },
];

// Weather data
const weatherData = [
  { no: 1, condition: 'Fine', desc: 'Cuaca Baik Sekali/Terang' },
  { no: 2, condition: 'Blue Sky', desc: 'Langit Biru Hampir Tak Berawan' },
  { no: 3, condition: 'Rainy', desc: 'Cuaca Kabut Sebab Hujan' },
  { no: 4, condition: 'Over Cast', desc: 'Cuaca Kabut Sebab Hujan Disertai Kilat' },
  { no: 5, condition: 'Clear', desc: 'Cuaca Cerah' },
  { no: 6, condition: 'Drizzle', desc: 'Cuaca Hujan Gerimis Disertai Kilat dan Guntur' },
  { no: 7, condition: 'Moonlight', desc: 'Cuaca Terang Bulan' },
  { no: 8, condition: 'Starlight', desc: 'Cahaya Bintang' },
  { no: 9, condition: 'Cloudy', desc: 'Cuaca Berawan Mendung' },
  { no: 10, condition: 'Dark', desc: 'Cuaca Gelap' },
];

// Cloud types data
const cloudTypesData = {
  middle: [
    { name: 'ALTO CUMULUS', code: 'AC', desc: 'AWAN PUTIH TEBAL' },
    { name: 'ALTO STRATUS', code: 'AS', desc: 'AWAN MENDUNG AKAN HUJAN' },
  ],
  low: [
    { name: 'NIMBUS STRATUS', code: 'NS', desc: 'AWAN HITAM AKAN HUJAN' },
    { name: 'STRATUS CUMULUS', code: 'SC', desc: 'AWAN HITAM BERARAK' },
    { name: 'STRATUS', code: 'ST', desc: 'AWAN PUTIH BERKABUT' },
    { name: 'CUMULUS', code: 'CM', desc: 'AWAN HITAM MEMBUBUNG KE ATAS/MENDUNG' },
    { name: 'CUMULUS NIMBUS', code: 'CN', desc: 'AWAN PUTIH TIPIS MATAHARI TAMPAK SAMAR' },
  ],
  high: [
    { name: 'CIRRUS', code: 'CU', desc: 'AWAN PUTIH TIPIS SEPERTI BULU AYAM' },
    { name: 'CIRRO CUMULUS', code: 'CC', desc: 'AWAN PUTIH BERARAK SEPERTI SISIK IKAN' },
    { name: 'CIRRO STRATUS', code: 'CS', desc: 'AWAN TINGGI SEPERTI MATA PANCING' },
  ],
};

export function LogbookReferencePanel() {
  const [generating, setGenerating] = useState(false);

  // Get current date in English format
  const getCurrentDate = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    const now = new Date();
    return {
      dayName: days[now.getDay()],
      dateStr: `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`,
      isoDate: now.toISOString().split('T')[0],
    };
  };

  const generatePDF = () => {
    setGenerating(true);
    const { dayName, dateStr } = getCurrentDate();
    
    // Create print window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to generate PDF');
      setGenerating(false);
      return;
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Keadaan Laut dan Cuaca - ${dateStr}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: "Times New Roman", Georgia, serif;
            font-size: 11pt;
            line-height: 1.4;
            color: #333;
            padding: 1.5cm;
        }
        .header-info {
            text-align: right;
            font-size: 10pt;
            color: #555;
            margin-bottom: 0.5cm;
            border-bottom: 1px solid #ccc;
            padding-bottom: 0.3cm;
        }
        .header-info .date-line {
            font-weight: bold;
            color: #1a5276;
        }
        h1 {
            text-align: center;
            font-size: 16pt;
            font-weight: bold;
            color: #1a5276;
            margin-bottom: 0.8cm;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        h2 {
            font-size: 12pt;
            font-weight: bold;
            color: #1a5276;
            margin-bottom: 0.3cm;
            border-bottom: 2px solid #1a5276;
            padding-bottom: 0.15cm;
        }
        .tables-wrapper {
            display: flex;
            gap: 0.8cm;
            margin-bottom: 0.6cm;
        }
        .table-section { flex: 1; }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8pt;
            margin-bottom: 0.5cm;
        }
        table.three-line {
            border-top: 2px solid #333;
            border-bottom: 2px solid #333;
        }
        table.three-line thead {
            border-bottom: 1px solid #333;
        }
        table.three-line th,
        table.three-line td {
            padding: 4px 2px;
            text-align: center;
        }
        table.three-line th {
            font-weight: bold;
            background-color: #f8f9fa;
        }
        table.three-line tbody tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        .cloud-section { margin-top: 0.4cm; }
        .cloud-category { margin-bottom: 0.3cm; }
        .cloud-category-title {
            font-weight: bold;
            font-size: 10pt;
            color: #333;
            margin-bottom: 0.15cm;
        }
        .cloud-list {
            list-style: none;
            padding-left: 0.4cm;
        }
        .cloud-list li {
            margin-bottom: 0.1cm;
            font-size: 9pt;
        }
        .cloud-list .code {
            font-family: "Courier New", monospace;
            font-weight: bold;
            color: #1a5276;
        }
        .cloud-list .desc {
            color: #555;
        }
        .logbook-section {
            margin-top: 0.5cm;
            padding: 0.4cm;
            border: 1px solid #1a5276;
            background-color: #f8f9fa;
        }
        .logbook-section h3 {
            font-size: 11pt;
            color: #1a5276;
            margin-bottom: 0.2cm;
            text-align: center;
        }
        .logbook-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.2cm;
            font-size: 9pt;
        }
        .logbook-item {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px dotted #999;
            padding: 0.08cm 0;
        }
        .signature-area {
            margin-top: 0.4cm;
            display: flex;
            justify-content: space-between;
            font-size: 9pt;
        }
        .signature-box {
            width: 45%;
            text-align: center;
        }
        .signature-line {
            border-top: 1px solid #333;
            margin-top: 0.8cm;
            padding-top: 0.15cm;
        }
        .footer-note {
            margin-top: 0.5cm;
            font-size: 8pt;
            color: #666;
            font-style: italic;
            text-align: center;
            border-top: 1px solid #ccc;
            padding-top: 0.2cm;
        }
        @media print {
            body { padding: 1cm; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header-info">
        <div class="date-line">Hari: ${dayName} | Tanggal: ${dateStr}</div>
        <div>Vessel: _______________ &nbsp;&nbsp; Voy No: _______________</div>
        <div>Position: _______________ &nbsp;&nbsp; Watch: _______________</div>
    </div>
    
    <h1>Keadaan Laut dan Cuaca<br>Istilah Pelayaran</h1>
    
    <div class="tables-wrapper">
        <div class="table-section">
            <h2>Keadaan Laut (Sea State)</h2>
            <table class="three-line">
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Kondisi</th>
                        <th>Min</th>
                        <th>Max</th>
                        <th>Beaufort</th>
                    </tr>
                </thead>
                <tbody>
                    ${seaStateData.map(row => `
                    <tr>
                        <td>${row.no}</td>
                        <td>${row.condition}</td>
                        <td>${row.min}</td>
                        <td>${row.max}</td>
                        <td>${row.beaufort}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="table-section">
            <h2>Keadaan Cuaca (Weather)</h2>
            <table class="three-line">
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Kondisi</th>
                        <th>Keterangan</th>
                    </tr>
                </thead>
                <tbody>
                    ${weatherData.map(row => `
                    <tr>
                        <td>${row.no}</td>
                        <td>${row.condition}</td>
                        <td>${row.desc}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>
    
    <div class="cloud-section">
        <h2>Jenis Awan - Istilah Pelayaran</h2>
        
        <div class="cloud-category">
            <div class="cloud-category-title">&#9654; AWAN MENENGAH (Middle Clouds)</div>
            <ul class="cloud-list">
                ${cloudTypesData.middle.map((cloud, i) => `
                <li>${i + 1}. ${cloud.name} <span class="code">(${cloud.code})</span> : <span class="desc">${cloud.desc}</span></li>
                `).join('')}
            </ul>
        </div>
        
        <div class="cloud-category">
            <div class="cloud-category-title">&#9654; AWAN RENDAH (Low Clouds)</div>
            <ul class="cloud-list">
                ${cloudTypesData.low.map((cloud, i) => `
                <li>${i + 1}. ${cloud.name} <span class="code">(${cloud.code})</span> : <span class="desc">${cloud.desc}</span></li>
                `).join('')}
            </ul>
        </div>
        
        <div class="cloud-category">
            <div class="cloud-category-title">&#9654; AWAN TINGGI (High Clouds)</div>
            <ul class="cloud-list">
                ${cloudTypesData.high.map((cloud, i) => `
                <li>${i + 1}. ${cloud.name} <span class="code">(${cloud.code})</span> : <span class="desc">${cloud.desc}</span></li>
                `).join('')}
            </ul>
        </div>
    </div>
    
    <div class="logbook-section">
        <h3>Catatan Logbook</h3>
        <div class="logbook-grid">
            <div class="logbook-item"><span>Sea State:</span><span>_______________</span></div>
            <div class="logbook-item"><span>Weather:</span><span>_______________</span></div>
            <div class="logbook-item"><span>Wind Direction:</span><span>_______________</span></div>
            <div class="logbook-item"><span>Wind Force:</span><span>_______________</span></div>
            <div class="logbook-item"><span>Visibility:</span><span>_______________</span></div>
            <div class="logbook-item"><span>Barometer:</span><span>_______________</span></div>
            <div class="logbook-item"><span>Temperature:</span><span>_______________</span></div>
            <div class="logbook-item"><span>Cloud Type:</span><span>_______________</span></div>
        </div>
        <div class="signature-area">
            <div class="signature-box">
                <div class="signature-line">Dibuat Oleh<br>(Deck Officer)</div>
            </div>
            <div class="signature-box">
                <div class="signature-line">Diperiksa Oleh<br>(Chief Officer/Captain)</div>
            </div>
        </div>
    </div>
    
    <div class="footer-note">
        Dokumen referensi untuk pengisian logbook - Sea State, Weather, dan Cloud Types
    </div>
    
    <div class="no-print" style="margin-top: 1cm; text-align: center;">
        <button onclick="window.print()" style="padding: 10px 20px; font-size: 12pt; cursor: pointer;">
            Print / Save as PDF
        </button>
    </div>
</body>
</html>`;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Auto-trigger print after a short delay
    setTimeout(() => {
      printWindow.print();
      setGenerating(false);
    }, 500);
  };

  const currentDate = getCurrentDate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <ClipboardList className="w-12 h-12 mx-auto text-[#00eaff] mb-2" />
        <h2 className="text-xl font-bold text-[#00eaff]">Logbook Reference</h2>
        <p className="text-sm text-[#7feaff]">Sea State, Weather & Cloud Types</p>
        <p className="text-xs text-[#00ff7b] mt-1">
          {currentDate.dayName}, {currentDate.dateStr}
        </p>
      </div>

      {/* Generate PDF Button */}
      <Button
        onClick={generatePDF}
        disabled={generating}
        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-6"
      >
        <FileText className="w-5 h-5 mr-2" />
        {generating ? 'Generating...' : 'Generate PDF with Current Date'}
      </Button>

      {/* Sea State Table */}
      <Card className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-400">
            <Waves className="w-5 h-5" />
            Keadaan Laut (Sea State)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cyan-500/30">
                  <th className="text-left py-2 px-2 text-cyan-400">No</th>
                  <th className="text-left py-2 px-2 text-cyan-400">Kondisi</th>
                  <th className="text-center py-2 px-2 text-cyan-400">Min (m)</th>
                  <th className="text-center py-2 px-2 text-cyan-400">Max (m)</th>
                  <th className="text-center py-2 px-2 text-cyan-400">Beaufort</th>
                </tr>
              </thead>
              <tbody>
                {seaStateData.map((row) => (
                  <tr key={row.no} className="border-b border-cyan-500/10 hover:bg-cyan-950/20">
                    <td className="py-2 px-2 text-cyan-100">{row.no}</td>
                    <td className="py-2 px-2 text-cyan-100 font-medium">{row.condition}</td>
                    <td className="py-2 px-2 text-cyan-100 text-center">{row.min}</td>
                    <td className="py-2 px-2 text-cyan-100 text-center">{row.max}</td>
                    <td className="py-2 px-2 text-cyan-100 text-center">{row.beaufort}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Weather Table */}
      <Card className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-400">
            <Sun className="w-5 h-5" />
            Keadaan Cuaca (Weather)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cyan-500/30">
                  <th className="text-left py-2 px-2 text-cyan-400">No</th>
                  <th className="text-left py-2 px-2 text-cyan-400">Kondisi</th>
                  <th className="text-left py-2 px-2 text-cyan-400">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {weatherData.map((row) => (
                  <tr key={row.no} className="border-b border-cyan-500/10 hover:bg-cyan-950/20">
                    <td className="py-2 px-2 text-cyan-100">{row.no}</td>
                    <td className="py-2 px-2 text-cyan-100 font-medium">{row.condition}</td>
                    <td className="py-2 px-2 text-cyan-200/80">{row.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Cloud Types */}
      <Card className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-400">
            <Cloud className="w-5 h-5" />
            Jenis Awan (Cloud Types)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Middle Clouds */}
          <div>
            <h4 className="text-sm font-bold text-cyan-300 mb-2">▶ AWAN MENENGAH (Middle Clouds)</h4>
            <ul className="space-y-1 text-sm">
              {cloudTypesData.middle.map((cloud, i) => (
                <li key={cloud.code} className="text-cyan-100">
                  {i + 1}. {cloud.name} <span className="font-mono font-bold text-cyan-400">({cloud.code})</span>
                  <span className="text-cyan-300/70"> : {cloud.desc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Low Clouds */}
          <div>
            <h4 className="text-sm font-bold text-cyan-300 mb-2">▶ AWAN RENDAH (Low Clouds)</h4>
            <ul className="space-y-1 text-sm">
              {cloudTypesData.low.map((cloud, i) => (
                <li key={cloud.code} className="text-cyan-100">
                  {i + 1}. {cloud.name} <span className="font-mono font-bold text-cyan-400">({cloud.code})</span>
                  <span className="text-cyan-300/70"> : {cloud.desc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* High Clouds */}
          <div>
            <h4 className="text-sm font-bold text-cyan-300 mb-2">▶ AWAN TINGGI (High Clouds)</h4>
            <ul className="space-y-1 text-sm">
              {cloudTypesData.high.map((cloud, i) => (
                <li key={cloud.code} className="text-cyan-100">
                  {i + 1}. {cloud.name} <span className="font-mono font-bold text-cyan-400">({cloud.code})</span>
                  <span className="text-cyan-300/70"> : {cloud.desc}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-gradient-to-br from-cyan-950/40 to-slate-900/40 border-cyan-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-cyan-100/80">
              <p className="mb-2"><strong>Cara Penggunaan:</strong></p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Tekan "Generate PDF" untuk membuat dokumen dengan tanggal hari ini</li>
                <li>PDF dapat di-print atau disimpan untuk pengisian logbook</li>
                <li>Data Sea State menggunakan skala Beaufort standar</li>
                <li>Kode awan sesuai dengan istilah meteorologi internasional</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
