import { fakerES as faker } from "@faker-js/faker";

/**
 * Genera un conjunto de datos válidos para registrar un usuario promedio (Happy Path).
 */
export function generateValidUser() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const email = faker.internet.email({ firstName, lastName }).toLowerCase();
  
  // Contraseña robusta: mínimo 8 caracteres, números, mayúsculas, minúsculas, caracter especial
  const password = "Ng!" + faker.string.alphanumeric({ length: 10 }) + "19_";

  return {
    firstName,
    lastName,
    email,
    password,
    username: faker.internet.username({ firstName, lastName }).toLowerCase(),
    phone: faker.phone.number({ style: "national" }),
    avatar: faker.helpers.arrayElement(["avatar1", "avatar2", "avatar3"])
  };
}

/**
 * Genera datos de usuario inválidos específicos según el tipo de error requerido.
 */
export function generateInvalidUser(type) {
  const valid = generateValidUser();
  switch (type) {
    case "short_password":
      return { ...valid, password: "123" };
    case "invalid_email":
      return { ...valid, email: "correo_sin_arroba_y_dominio" };
    case "missing_fields":
      return {
        firstName: "",
        lastName: "",
        email: "",
        password: ""
      };
    case "passwords_mismatch":
      return {
        ...valid,
        password: "PasswordV1!",
        confirmPassword: "PasswordV2!"
      };
    default:
      return valid;
  }
}

/**
 * Genera datos válidos para actualizar un perfil de usuario.
 */
export function generateProfileUpdateData() {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    avatar: faker.helpers.arrayElement(["avatar_new1", "avatar_new2"])
  };
}
