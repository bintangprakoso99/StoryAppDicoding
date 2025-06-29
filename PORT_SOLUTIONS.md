# Port Solutions untuk Development Server

Jika mengalami masalah port yang sudah digunakan, berikut adalah beberapa solusi:

## 1. Menggunakan Port Alternatif

\`\`\`bash
# Port 3000 (default baru)
npm run start

# Port 3001
npm run start:3001

# Port 8080
npm run start:8080

# Port custom
npm run dev:port
\`\`\`

## 2. Kill Process yang Menggunakan Port

### Windows (PowerShell/CMD):
\`\`\`bash
# Cek process yang menggunakan port 9000
netstat -ano | findstr :9000

# Kill process berdasarkan PID
taskkill /PID <PID_NUMBER> /F

# Atau kill semua port sekaligus
npm run kill-port
\`\`\`

### Linux/Mac:
\`\`\`bash
# Cek process yang menggunakan port 9000
lsof -ti:9000

# Kill process
kill -9 $(lsof -ti:9000)

# Atau kill semua port sekaligus
npm run kill-port
\`\`\`

## 3. Menggunakan Port Environment Variable

\`\`\`bash
# Set port via environment variable
PORT=4000 npm run start

# Atau
set PORT=4000 && npm run start  # Windows
export PORT=4000 && npm run start  # Linux/Mac
\`\`\`

## 4. Manual Port Configuration

Jika ingin menggunakan port tertentu secara permanen, edit `webpack.config.cjs`:

\`\`\`javascript
devServer: {
  port: 4000, // Ganti dengan port yang diinginkan
  // ... konfigurasi lainnya
}
\`\`\`

## 5. Troubleshooting

Jika masih ada masalah:

1. Restart terminal/command prompt
2. Restart komputer jika diperlukan
3. Cek apakah ada aplikasi lain yang menggunakan port tersebut
4. Gunakan port yang tidak umum (contoh: 3333, 4444, 5555)
