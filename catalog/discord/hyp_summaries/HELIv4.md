# HELIv4.hyp

## Metadata
- **Author**: vox
- **Channel**: #🎨│showcase
- **Date**: 2025-05-20
- **Size**: 110,027 bytes

## Blueprint
- **Name**: TEIL2
- **Version**: 2
- **Model**: `asset://b93c1f159939d95f2b05950dd4c6f63547ea9733d979cfbbdbcb42983cbc8d8a.glb`
- **Script**: `asset://6ecadc8344a7e77a8270dc85099f82fea9f5b78cd7d013e94fd6095e69e5ebca.js`

## Props
- `audio`: audio → `asset://106e351912176bb68cb49d49e2be83becec591bc4b7344fc4d497726a691b610.mp3`

## Assets
- `[model]` b93c1f159939d95f2b05950dd4c6f63547ea9733d979cfbbdbcb42983cbc8d8a.glb (87,644 bytes)
- `[script]` 6ecadc8344a7e77a8270dc85099f82fea9f5b78cd7d013e94fd6095e69e5ebca.js (5,535 bytes)
- `[audio]` 106e351912176bb68cb49d49e2be83becec591bc4b7344fc4d497726a691b610.mp3 (15,899 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.create()`, `app.get()`, `app.on()`
**Events Listened**: `update`
**Nodes Created**: `audio`

## Keywords (for Discord search)
accelerationFactor, adjustedSpeed, angewendet, anpassen, atan2, audio, audioType, baseSpeed, basierend, berechnen, centerX, centerZ, clockwise, configure, console, create, curvature, delta, diff, distanceModel

## Script Source
```javascript
// UV Scroll Script für Hyperfy mit Audio und ovalem Pfad
// Polizeihubschrauber fliegt einen ovalen Pfad
app.configure([
  {
    key: 'audio',
    type: 'file',
    kind: 'audio',
    label: 'Audio'
  }
]);

const audio = app.create('audio', {
  src: props.audio?.url,
  volume: props.volume || 20,
  group: props.audioType || 'sfx',
  spatial: true,
  loop: true,
  distanceModel: 'inverse',
  rolloffFactor: 0.6,
  maxDistance: 200
});
app.add(audio);

const rotorMesh = app.get('ROTOR2');
if (!rotorMesh) {
  console.error('Konnte ROTOR2 Mesh nicht finden');
  return;
}

const heliMesh = app.get('HELI');
if (!heliMesh) {
  console.error('Konnte HELI Mesh nicht finden');
  return;
}

const scrollConfig = {
  speedX: 2,
  speedY: 0.0,
  offset: { x: 0, y: 0 }
};

const ovalConfig = {
  radiusX: 100, // Radius in X-Richtung (längere Achse)
  radiusZ: 50, // Radius in Z-Richtung (kürzere Achse)
  baseSpeed: 0.0201, // Geschwindigkeit
  t: 0, // Fortschrittsparameter (0 bis 1)
  prevTangentAngle: 0 // Für Interpolation
};

const initialOffset = {
  x: heliMesh.position.x - rotorMesh.position.x,
  y: heliMesh.position.y - rotorMesh.position.y,
  z: heliMesh.position.z - rotorMesh.position.z
};

audio.play();

function normalizeAngleDiff(target, source) {
  let diff = target - source;
  while (diff > Math.PI) diff -= 2 * Math.PI;
  while (diff < -Math.PI) diff += 2 * Math.PI;
  return source + diff;
}

app.on('update', delta => {
  if (!rotorMesh || !heliMesh) return;

  // --- UV-Scrolling (auf ROTOR2 angewendet) ---
  scrollConfig.offset.x += scrollConfig.speedX * delta;
  scrollConfig.offset.y += scrollConfig.speedY * delta;
  scrollConfig.offset.x = scrollConfig.offset.x % 1;
  scrollConfig.offset.y = scrollConfig.offset.y % 1;
  rotorMesh.material.textureX = scrollConfig.offset.x;
  rotorMesh.material.textureY = scrollConfig.offset.y;
  rotorMesh.material.textureScaleX = 1;
  rotorMesh.material.textureScaleY = 1;

  // --- Ovaler Pfad (Clockwise) ---
  let t = ovalConfig.t;
  const rx = ovalConfig.radiusX; // 100m
  const rz = ovalConfig.radiusZ; // 40m

  // Position berechnen (ovaler Pfad)
  const theta = 2 * Math.PI * t; // Winkel von 0 bis 2π (im Uhrzeigersinn)
  const posX = rx * Math.cos(theta);
  const posZ = rz * Math.sin(theta);

  // Tangente für die Flugrichtung berechnen
  const dx_dt = -rx * Math.sin(theta) * (2 * Math.PI); // Ableitung von x = rx * cos(θ)
  const dz_dt = rz * Math.cos(theta) * (2 * Math.PI); // Ableitung von z = rz * sin(θ)
  const curvature = Math.abs(dx_dt * (-rz * Math.sin(theta) * (2 * Math.PI) * (2 * Math.PI)) - dz_dt * (-rx * Math.cos(theta) * (2 * Math.PI) * (2 * Math.PI))) /
                    Math.pow(dx_dt * dx_dt + dz_dt * dz_dt, 1.5) || 0;

  // Geschwindigkeit basierend auf Krümmung anpassen
  const speedFactor = 1 / (1 + 2 * curvature);
  const adjustedSpeed = ovalConfig.baseSpeed * speedFactor;

  // Aktualisiere den Fortschrittsparameter t (clockwise)
  ovalConfig.t = (t + adjustedSpeed * delta) % 1;

  // Wende die neue Position an
  const posY = rotorMesh.position.y;
  rotorMesh.position.set(posX, posY, posZ);
  heliMesh.position.set(
    posX + initialOffset.x,
    posY + initialOffset.y,
    posZ + initialOffset.z
  );

  // --- Update Audio Position für räumlichen Effekt ---
  audio.position.set(posX, posY, posZ);

  // --- Hubschrauber Orientierung ---
  // Berechne den Winkel in Flugrichtung
  let forwardAngle = Math.atan2(dx_dt, dz_dt);
  forwardAngle += Math.PI / 2; // Blender-Export Anpassung für Flugrichtung
  console.log(`forwardAngle=${(forwardAngle * 180 / Math.PI).toFixed(1)}°`);

  // Berechne den Winkel zur Mitte des Ovals (Mitte ist bei x=0, z=0)
  const centerX = 0;
  const centerZ = 0;
  const vectorToCenterX = centerX - posX;
  const vectorToCenterZ = centerZ - posZ;
  let targetAngle = Math.atan2(vectorToCenterX, vectorToCenterZ);
  targetAngle += Math.PI; // Drehe um 180 Grad, um Rückwärtsfliegen zu verhindern
  console.log(`targetAngle=${(targetAngle * 180 / Math.PI).toFixed(1)}°, posX=${posX.toFixed(1)}, posZ=${posZ.toFixed(1)}`);

  // Interpoliere den Winkel für sanfte Drehungen
  const lerpFactor = 1 - Math.exp(-3 * delta); // Sehr sanfte Übergänge
  const normalizedTarget = normalizeAngleDiff(targetAngle, ovalConfig.prevTangentAngle);
  const interpolatedAngle = ovalConfig.prevTangentAngle + lerpFactor * (normalizedTarget - ovalConfig.prevTangentAngle);
  ovalConfig.prevTangentAngle = interpolatedAngle;
  console.log(`interpolatedAngle=${(interpolatedAngle * 180 / Math.PI).toFixed(1)}°`);

  // Wende den Yaw (rotation.y) an
  rotorMesh.rotation.y = interpolatedAngle;
  heliMesh.rotation.y = interpolatedAngle;

  // Simuliere die Neigung der Nase (Pitch-Anpassung)
  let noseTiltAngle;
  const localRightX = -Math.cos(interpolatedAngle);
  const localRightZ = Math.sin(interpolatedAngle);
  const dot = vectorToCenterX * localRightX + vectorToCenterZ * localRightZ;
  const distanceToCenter = Math.sqrt(vectorToCenterX * vectorToCenterX + vectorToCenterZ * vectorToCenterZ);
  noseTiltAngle = -0.1 * (dot / (distanceToCenter || 1));

  // Erhöhe die Neigung während der Beschleunigung
  const accelerationFactor = 1 - speedFactor;
  noseTiltAngle *= (1 + 0.5 * accelerationFactor);

  // Wende den Pitch (rotation.x) an
  rotorMesh.rotation.x = noseTiltAngle;
  heliMesh.rotation.x = noseTiltAngle;
});
```

---
*Extracted from HELIv4.hyp. Attachment ID: 1374463194738987048*