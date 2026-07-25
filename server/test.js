const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:postgres@localhost:5433/tcl_dev',
});

client.connect()
  .then(() => {
    console.log('✅ Connexion réussie !');
    return client.end();
  })
  .catch((err) => {
    console.error('❌ Erreur de connexion :', err);
  });