const pool = require("../database/");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  try {
    const result = await pool.query("SELECT * FROM public.classification ORDER BY classification_name");
    console.log("Classifications:", result.rows); // <-- Confirma se os dados estão corretos
    return result.rows; // <-- Alterado para retornar apenas as linhas
  } catch (error) {
    console.error("Error fetching classifications:", error);
    return [];
  }
}



/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("Erro ao buscar inventário por classificação:", error);
    throw error; // Lança o erro para ser tratado pelo controlador
  }
}

/* ***************************
 *  Get vehicle details by ID
 * ************************** */
async function getVehicleById(vehicleId) {
  try {
    const sql = `SELECT * FROM public.inventory WHERE inv_id = $1`;
    const data = await pool.query(sql, [vehicleId]);
    return data.rows.length ? data.rows[0] : null;
  } catch (error) {
    console.error("Erro ao buscar veículo por ID:", error);
    throw error; // Lança o erro para ser tratado pelo controlador
  }
}

/* ***************************
 *  Add new classification to the database
 * ************************** */
async function addClassification(classification_name) {
  try {
    // Verificar se já existe uma classificação com o mesmo nome
    const checkQuery = `SELECT * FROM public.classification WHERE classification_name = $1`;
    const checkResult = await pool.query(checkQuery, [classification_name]);

    if (checkResult.rows.length > 0) {
      throw new Error("Classification already exists"); // Lança um erro ao invés de retornar um objeto
    }    

    // Se não existir, insere a nova classificação
    const sql = `INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *`;
    const result = await pool.query(sql, [classification_name]);
    return result.rows[0]; // Retorna a nova classificação inserida
  } catch (error) {
    console.error("Erro ao adicionar nova classificação:", error);
    throw error;
  }
}


/* ***************************
 *  Add new inventory item to the database
 * ************************** */
async function addInventory(make, model, year, price, classification_id, description, image, thumbnail, miles, color) {
  try {
    const sql = `
      INSERT INTO public.inventory 
      (inv_make, inv_model, inv_year, inv_price, classification_id, inv_description, inv_image, inv_thumbnail, inv_miles, inv_color) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *`;
    const result = await pool.query(sql, [make, model, year, price, classification_id, description, image, thumbnail, miles, color]);
    return result.rows[0]; // Retorna o novo item inserido
  } catch (error) {
    console.error("Erro ao adicionar novo veículo:", error);
    throw error; // Lança o erro para ser tratado pelo controlador
  }
}


module.exports = { 
  getClassifications, 
  getInventoryByClassificationId, 
  getVehicleById, 
  addClassification, 
  addInventory 
};
