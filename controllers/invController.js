const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invController = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invController.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  try {
    const data = await invModel.getInventoryByClassificationId(classification_id);

    if (!data || data.length === 0) {
      return res.status(404).send("No vehicles found for this classification.");
    }

    const grid = await utilities.buildClassificationGrid(data);
    let nav = await utilities.getNav();
    const className = data[0]?.classification_name || "Unknown Classification";

    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    });
  } catch (error) {
    console.error("Error building classification view:", error);
    res.status(500).send("Internal Server Error");
  }
};


/* ***************************
 *  Build vehicle detail view
 * ************************** */
invController.getVehicleDetail = async function (req, res, next) {
  const vehicleId = req.params.vehicleId
  try {
    const vehicle = await invModel.getVehicleById(vehicleId)
    if (!vehicle) {
      return res.status(404).send("Veículo não encontrado.")
    }

    let nav = await utilities.getNav() // Caso use navegação dinâmica

    res.render("./inventory/detail", {
      title: `${vehicle.make} ${vehicle.model}`,
      nav,
      vehicle,
    })
  } catch (error) {
    console.error("Erro ao buscar detalhes do veículo:", error)
    res.status(500).send("Erro interno no servidor.")
  }
}


// Exibir a página de gerenciamento
invController.showManagement = async (req, res) => {
  try {
    let nav = await utilities.getNav(); // Asegure-se de obter a navegação
    res.render("inventory/management", { 
      title: "Vehicle Management", 
      classifications: [], 
      errors: [], 
      nav: nav // Passando 'nav' como array de objetos
    });
  } catch (error) {
    console.error("Error loading management page:", error);
    res.status(500).send("Internal Server Error");
  }
};


// Exibir formulário para adicionar classificação
invController.showAddClassification = async (req, res) => {
  try {
    const classifications = await invModel.getClassifications();
    const nav = await utilities.getNav();
    
    res.render("inventory/add-classification", { 
      title: "Add Classification", 
      classifications, 
      errors: [], 
      classification_name: req.body.classification_name || '',
      nav
    });
  } catch (error) {
    res.status(500).send("Error loading add classification form: " + error.message);
  }
};

// Processar adição de classificação
invController.processAddClassification = async (req, res) => {
  let nav = await utilities.getNav();
  let errors = [];

  try {
    const { classification_name } = req.body;
    console.log("Classification Name recebido:", classification_name);

    if (!classification_name) {
      errors.push({ msg: "O nome da classificação é obrigatório." });
    }

    // Se houver erros, renderiza novamente a página de adição
    if (errors.length > 0) {
      return res.render("inventory/add-classification", {
        title: "Add New Classification",
        errors,
        nav,
      });
    }

    // Inserir no banco de dados
    const addResult = await classificationModel.addClassification(classification_name);
    console.log("Nova classificação adicionada:", addResult);

    // Se inseriu corretamente, redireciona para a página de gerenciamento
    req.flash("success", "Classificação adicionada com sucesso!");
    return res.redirect("/inv/management");

  } catch (error) {
    console.error("Erro ao adicionar classificação:", error);
    return res.status(500).render("inventory/management", {
      title: "Vehicle Management",
      errors: [{ msg: "Erro ao processar a solicitação." }],
      nav,
    });
  }
};



// Exibir formulário para adicionar inventário
invController.showAddInventory = async (req, res) => {
  try {
    const classifications = await invModel.getClassifications();
    const nav = await utilities.getNav(); // Obter o menu de navegação
    
    // Renderizando a view e passando nav para a mesma
    res.render("inventory/add-inventory", { 
      title: "Add Inventory", 
      classifications, 
      errors: [], 
      nav: nav // Passando nav para a view
    });
  } catch (error) {
    res.status(500).send("Error loading add inventory form: " + error.message);
  }
};

// Processar adição de novo veículo ao inventário
invController.addInventory = async (req, res) => {
  try {
    const { 
      classification_id, 
      inv_make, 
      inv_model, 
      inv_year, 
      inv_price, 
      inv_description, 
      inv_image, 
      inv_thumbnail, 
      inv_miles, 
      inv_color 
    } = req.body;

    // Validação no servidor: Verificar se todos os campos necessários estão presentes
    if (!classification_id || !inv_make || !inv_model || !inv_year || !inv_price || !inv_description || !inv_image || !inv_thumbnail || !inv_miles || !inv_color) {
      req.flash("error", "All fields are required.");
      return res.redirect("/inv/add-inventory");
    }

    // Chama o modelo para adicionar o veículo com todos os campos
    const result = await invModel.addInventory(
      inv_make, 
      inv_model, 
      inv_year, 
      inv_price, 
      classification_id, 
      inv_description, 
      inv_image, 
      inv_thumbnail, 
      inv_miles, 
      inv_color
    );

    // Verificar se a inserção foi bem-sucedida
    if (!result) {
      req.flash("error", "Failed to add vehicle.");
      return res.redirect("/inv/add-inventory");
    }

    req.flash("success", "Vehicle added successfully!");
    res.redirect("/inv/management");

  } catch (error) {
    console.error("Error adding vehicle:", error);
    req.flash("error", "An error occurred while adding the vehicle.");
    res.redirect("/inv/add-inventory");
  }
};


module.exports = invController;
