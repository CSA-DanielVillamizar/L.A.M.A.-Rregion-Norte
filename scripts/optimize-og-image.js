#!/usr/bin/env node

/**
 * Script para optimizar imagen Open Graph
 * Comprime LAMARegionNorte.png para cumplir con estándares de redes sociales
 * Redes sociales esperan: 600x315 px mínimo, <300KB ideal
 */

const fs = require('fs');
const path = require('path');

// Buscar sharp
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('ERROR: sharp no instalado');
  console.log('\nSolución:');
  console.log('npm install sharp');
  console.log('\nO ejecutar desde Linux/WSL para mejor soporte:');
  console.log('wsl npm install sharp');
  process.exit(1);
}

const inputPath = path.join(__dirname, '../public/img/LAMARegionNorte.png');
const outputPath = path.join(__dirname, '../public/img/og-logo.png');

async function optimizeImage() {
  try {
    console.log('📸 Optimizando imagen para Open Graph...');
    
    // Leer imagen original
    const original = fs.statSync(inputPath);
    console.log(`   Original: ${(original.size / 1024).toFixed(2)} KB`);
    
    // Optimizar: redimensionar a 1200x630 (estándar Facebook), comprimir
    await sharp(inputPath)
      .resize(1200, 630, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png({ quality: 85, progressive: true, compressionLevel: 9 })
      .toFile(outputPath);
    
    const optimized = fs.statSync(outputPath);
    const saved = ((1 - optimized.size / original.size) * 100).toFixed(1);
    
    console.log(`   Optimizada: ${(optimized.size / 1024).toFixed(2)} KB (${saved}% ahorrado)`);
    console.log(`   Dimensiones: 1200x630 px`);
    console.log(`   Ruta: /img/og-logo.png`);
    console.log('\n✅ Imagen optimizada exitosamente');
    console.log('\nProxima acción:');
    console.log('Actualizar header.ejs para usar /img/og-logo.png en og:image');
    
  } catch (error) {
    console.error('❌ Error durante optimización:', error.message);
    process.exit(1);
  }
}

optimizeImage();
