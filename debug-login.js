// Script de debug pour tester la connexion
import bcrypt from 'bcryptjs';

const storedHash = '$2a$10$8K1p/a0dL3.I7cXR3UuJauEI.QvCVj7aXQPKVxLrVSqXdp7YFG8wi';
const password = 'admin123';

console.log('🔍 Test de vérification du mot de passe:');
console.log('Password:', password);
console.log('Hash:', storedHash);

bcrypt.compare(password, storedHash).then(result => {
  console.log('✅ Résultat:', result ? 'MATCH' : 'NO MATCH');
  
  // Test avec génération d'un nouveau hash
  bcrypt.hash(password, 10).then(newHash => {
    console.log('\n🔑 Nouveau hash généré:', newHash);
    bcrypt.compare(password, newHash).then(result2 => {
      console.log('✅ Test nouveau hash:', result2 ? 'MATCH' : 'NO MATCH');
    });
  });
});
