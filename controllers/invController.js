const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build vehicle detail view
 * ************************** */
invCont.getVehicleDetail = async function (req, res, next) {
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


module.exports = invCont