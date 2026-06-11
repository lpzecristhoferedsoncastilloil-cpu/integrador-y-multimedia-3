export const settings = {
  baseUrl: process.env.TEST_BASE_URL || "http://localhost:5173", // URL del Frontend de Vite por defecto
  backendUrl: process.env.TEST_BACKEND_URL || "http://localhost:8000", // URL del Backend Django por defecto
  scanTimeout: 5000,
  defaultTimeout: 10000,
  
  // Configuración de la base de datos local (XAMPP / MySQL)
  db: {
    host: "localhost",
    user: "root",
    password: "",
    database: "neurogym"
  }
};
