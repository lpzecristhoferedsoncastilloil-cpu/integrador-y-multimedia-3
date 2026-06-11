import { When, Then } from "@cucumber/cucumber";
import { generateValidUser } from "../../generator/dataGenerator.js";
import assert from "assert";
import { faker } from "@faker-js/faker";
import mysql from "mysql2/promise";
import { settings } from "../../config/settings.js";

When("introduce datos de registro válidos generados dinámicamente", async function () {
  const user = generateValidUser();
  this.generatedUser = user;
  
  try { await this.fill("firstName", user.firstName); } catch (e) { /* Opcional */ }
  try { await this.fill("lastName", user.lastName); } catch (e) { /* Opcional */ }
  try { await this.fill("email", user.email); } catch (e) { /* Opcional */ }
  try { await this.fill("password", user.password); } catch (e) { /* Opcional */ }
  try { await this.fill("confirmPassword", user.password); } catch (e) { /* Opcional */ }
  try { await this.fill("phone", user.phone); } catch (e) { /* Opcional */ }
  
  console.log(`    [Faker Data] Registro con: Name=${user.firstName}, Email=${user.email}`);
});

When("introduce datos de registro inválidos de tipo {string}", async function (tipoError) {
  const user = generateValidUser();
  if (tipoError === "short_password") user.password = "123";
  if (tipoError === "invalid_email") user.email = "correo_sin_arroba";
  
  this.generatedUser = user;

  try { await this.fill("firstName", user.firstName); } catch (e) { /* Opcional */ }
  try { await this.fill("lastName", user.lastName); } catch (e) { /* Opcional */ }
  try { await this.fill("email", user.email); } catch (e) { /* Opcional */ }
  try { await this.fill("password", user.password); } catch (e) { /* Opcional */ }
  
  if (tipoError === "passwords_mismatch") {
    try { await this.fill("confirmPassword", "ClaveDiferente1!"); } catch (e) { /* Opcional */ }
  } else {
    try { await this.fill("confirmPassword", user.password); } catch (e) { /* Opcional */ }
  }
});

When("modifica los datos de su perfil con información nueva", async function () {
  const newName = faker.person.firstName();
  const newLastName = faker.person.lastName();

  try { await this.fill("firstName", newName); } catch (e) { /* Opcional */ }
  try { await this.fill("lastName", newLastName); } catch (e) { /* Opcional */ }
});

// =============================================================================
// PASOS ESPECÍFICOS DE REGISTRO DE PACIENTES (MENOR Y MAYOR DE EDAD)
// =============================================================================

When("el usuario introduce datos válidos para un paciente menor de edad", async function () {
  console.log("    [Pacientes] Rellenando datos de paciente menor de edad...");
  
  const nombrePaciente = faker.person.fullName();
  // Fecha de nacimiento para que sea menor de edad (ej. 8 años atrás)
  const hoy = new Date();
  const anioNacimiento = hoy.getFullYear() - 8;
  const fechaNacimiento = `${anioNacimiento}-05-15`; // Formato YYYY-MM-DD
  const genero = faker.helpers.arrayElement(["masculino", "femenino"]);
  const telefono = faker.phone.number({ style: "national" }).replace(/\D/g, "").slice(0, 8);
  const correo = faker.internet.email().toLowerCase();
  const colegio = "Colegio Primario San Agustín";
  const motivo = "Presenta dificultades de concentración en clases de matemáticas.";

  // Rellenar de forma secuencial y directa en base a la estructura del formulario
  const form = this.page.locator("form");
  
  // 1. Nombre Completo
  await form.locator("input").nth(0).fill(nombrePaciente);
  await this.sleep(1000);
  // 2. Fecha de Nacimiento
  await form.locator("input").nth(1).fill(fechaNacimiento);
  await this.sleep(1000);
  // 3. Género (Select)
  await form.locator("select").nth(0).selectOption(genero);
  await this.sleep(1000);
  // 4. Teléfono
  await form.locator("input").nth(2).fill(telefono);
  await this.sleep(1000);
  // 5. Correo
  await form.locator("input").nth(3).fill(correo);
  await this.sleep(1000);
  // 6. Colegio/Ocupación
  await form.locator("input").nth(4).fill(colegio);
  await this.sleep(1000);
  // 7. Motivo de Consulta (Textarea)
  await form.locator("textarea").first().fill(motivo);
  await this.sleep(1000);

  // Guardamos datos en el contexto
  this.pacientePrueba = { nombrePaciente, esMenor: true };
  
  // Pequeña pausa para ver el reajuste del formulario al detectar menor
  await this.page.waitForTimeout(500);
});

When("el usuario introduce datos válidos para un paciente mayor de edad", async function () {
  console.log("    [Pacientes] Rellenando datos de paciente mayor de edad...");
  
  const nombrePaciente = faker.person.fullName();
  // Fecha de nacimiento para que sea mayor de edad (ej. 30 años atrás)
  const hoy = new Date();
  const anioNacimiento = hoy.getFullYear() - 30;
  const fechaNacimiento = `${anioNacimiento}-08-20`; // Formato YYYY-MM-DD
  const genero = faker.helpers.arrayElement(["masculino", "femenino"]);
  const telefono = faker.phone.number({ style: "national" }).replace(/\D/g, "").slice(0, 8);
  const correo = faker.internet.email().toLowerCase();
  const ocupacion = "Ingeniero de Sistemas";
  const motivo = "Busca mejorar agilidad mental y memoria de trabajo.";

  const form = this.page.locator("form");
  
  // 1. Nombre Completo
  await form.locator("input").nth(0).fill(nombrePaciente);
  await this.sleep(1000);
  // 2. Fecha de Nacimiento
  await form.locator("input").nth(1).fill(fechaNacimiento);
  await this.sleep(1000);
  // 3. Género
  await form.locator("select").nth(0).selectOption(genero);
  await this.sleep(1000);
  // 4. Teléfono
  await form.locator("input").nth(2).fill(telefono);
  await this.sleep(1000);
  // 5. Correo
  await form.locator("input").nth(3).fill(correo);
  await this.sleep(1000);
  // 6. Colegio/Ocupación
  await form.locator("input").nth(4).fill(ocupacion);
  await this.sleep(1000);
  // 7. Motivo de Consulta
  await form.locator("textarea").first().fill(motivo);
  await this.sleep(1000);

  this.pacientePrueba = { nombrePaciente, esMenor: false };
  await this.page.waitForTimeout(500);
});

When("completa los datos obligatorios del tutor legal", async function () {
  console.log("    [Pacientes] Rellenando datos obligatorios del Tutor Legal...");
  
  const nombreTutor = faker.person.fullName();
  const relacion = faker.helpers.arrayElement(["padre", "madre", "tutor"]);
  const ci = faker.number.int({ min: 1000000, max: 9999999 }).toString();
  const telefonoTutor = faker.phone.number({ style: "national" }).replace(/\D/g, "").slice(0, 8);
  const correoTutor = faker.internet.email().toLowerCase();

  const form = this.page.locator("form");

  // Localizamos el contenedor del tutor (div de color naranja) para mayor seguridad
  const tutorSection = form.locator("div.bg-orange-50");
  
  // Rellenar dentro del bloque de tutor
  await tutorSection.locator("input").nth(0).fill(nombreTutor);
  await this.sleep(1000);
  await tutorSection.locator("select").first().selectOption(relacion);
  await this.sleep(1000);
  await tutorSection.locator("input").nth(1).fill(ci);
  await this.sleep(1000);
  await tutorSection.locator("input").nth(2).fill(telefonoTutor);
  await this.sleep(1000);
  await tutorSection.locator("input").nth(3).fill(correoTutor);
  await this.sleep(1000);

  console.log(`      [Tutor] Relación: ${relacion}, Nombre: ${nombreTutor}`);
});

When("selecciona el psicólogo asignado", async function () {
  console.log("    [Pacientes] Seleccionando psicólogo asignado...");
  
  const form = this.page.locator("form");
  const selectPsicologo = form.locator("select").nth(1);
  
  await selectPsicologo.waitFor({ state: "visible" });
  
  // Buscar opciones disponibles
  const opciones = await selectPsicologo.locator("option").all();
  if (opciones.length > 1) {
    const val = await opciones[1].getAttribute("value");
    await selectPsicologo.selectOption(val);
    console.log(`      [Psicólogo] Psicólogo seleccionado ID: ${val}`);
  } else {
    console.warn("      [!] Advertencia: No hay psicólogos disponibles en el menú. Seleccionando por defecto.");
    await selectPsicologo.selectOption({ index: 0 });
  }
});

Then("el paciente debería figurar en la lista de pacientes registrados", async function () {
  const nombreEsperado = this.pacientePrueba?.nombrePaciente;
  assert.ok(nombreEsperado, "No se ha registrado el nombre del paciente de prueba.");
  
  console.log(`    [Pacientes] Verificando presencia de: "${nombreEsperado}" en la tabla...`);

  const inputBusqueda = this.page.locator('input[placeholder="Buscar paciente..."]');
  await inputBusqueda.waitFor({ state: "visible" });
  await inputBusqueda.fill(nombreEsperado);
  await this.page.waitForTimeout(500);

  const tabla = this.page.locator("table tbody");
  const textoTabla = await tabla.innerText();
  
  assert.ok(
    textoTabla.includes(nombreEsperado),
    `El paciente "${nombreEsperado}" no figura en la tabla filtrada de pacientes.`
  );
  
  console.log(`    [Pacientes] ¡Verificación exitosa! Paciente encontrado en el listado.`);
});

Then("se verifica que el registro del paciente exista en la base de datos local de Neurogym", async function () {
  const nombreEsperado = this.pacientePrueba?.nombrePaciente;
  assert.ok(nombreEsperado, "No se ha registrado el nombre del paciente de prueba.");

  console.log(`    [Database QA] Conectando a la base de datos MySQL local (${settings.db.database})...`);
  
  let connection;
  try {
    connection = await mysql.createConnection(settings.db);
    
    // Buscar en la tabla 'pacientes' por el nombre completo
    const [rows] = await connection.execute(
      "SELECT * FROM pacientes WHERE nombre_completo = ?",
      [nombreEsperado]
    );

    assert.ok(
      rows.length > 0,
      `[Database ERROR] No se encontró ningún registro para el paciente "${nombreEsperado}" en la tabla 'pacientes'.`
    );

    console.log(`    [Database QA] ¡ÉXITO! Registro del paciente encontrado en la DB. ID Paciente: ${rows[0].id_paciente}`);
    
    // Guardar confirmación en métricas del caso para mostrar en el reporte PDF/HTML
    this.testCaseData.metrics = this.testCaseData.metrics || {};
    this.testCaseData.metrics.dbVerified = `Confirmado en MySQL (ID: ${rows[0].id_paciente})`;
    
  } catch (err) {
    console.error("    [Database ERROR] Falló la verificación de base de datos:", err.message);
    assert.fail(`Fallo en la verificación de base de datos MySQL: ${err.message}`);
  } finally {
    if (connection) await connection.end();
  }
});
