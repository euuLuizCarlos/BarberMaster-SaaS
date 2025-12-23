const app = require('./src/app');
require('./src/config/db');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
  =========================================
  🚀 SERVIDOR INICIADO COM SUCESSO
  📡 URL: http://localhost:${PORT}
  🛡️  STATUS: AMBIENTE PROTEGIDO
  =========================================
  `);
});