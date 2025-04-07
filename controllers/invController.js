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

invCont.buildByInvId = async function (req, res, next) {
  const inv_id = req.params.invId
  const data = await invModel.getVehicleDetails(inv_id)
  const grid = await utilities.buildVehicleDetails(data)
  let nav = await utilities.getNav()
  const className = `${data[0].inv_year} ${data[0].inv_make} ${data[0].inv_model}`
  res.render("./inventory/details", {
    title: className,
    nav,
    grid,
    inv_id,
  })
}

invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList()
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    errors: null,
    classificationSelect
  })
}

invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null
  })
}

invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList();
  res.render("./inventory/add-inventory", {
    title: "Add New Vehicle",
    nav,
    classificationList,
    errors: null
  })
}

/* ****************************************
*  Process Classification
* *************************************** */
invCont.manageClassification = async function (req, res) {
  const { classification_name } = req.body
  const managementResult = await invModel.addClassification(
   classification_name
  )
  let nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList()

  if (managementResult) {
    req.flash(
      "notice",
      `The newcar classification was succesfully aded.`
    )
    res.status(201).render("./inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null,
      classificationSelect
    });
  } else {
    req.flash("notice", "Provide a correct clasification name.")
    res.status(501).render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
      classificationSelect
    })
  }
}

/* ****************************************
*  Process new vehicle
* *************************************** */
invCont.manageInventory = async function (req, res) {
  let nav = await utilities.getNav()
  const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color } = req.body
  const vehicleResult = await invModel.addNewVehicle(
    classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color
  )
  const classificationSelect = await utilities.buildClassificationList()
  if (vehicleResult) {
    req.flash(
      "notice",
      `The new vehicle was succesfully aded.`
    )
    res.status(201).render("./inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null,
      classificationSelect
    });
  } else {
    req.flash("notice", "Sorry, the vehicle could not be added. Please try again.")
    res.status(501).render("./inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      errors: null,
      classificationSelect
    })
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}


/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.invId)
  let nav = await utilities.getNav()
  const data = await invModel.getVehicleDetails(inv_id)
  const itemData = data[0];
  console.log("classification: " + itemData.classification_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

/* ***************************
 *  Build delete inventory view
 * ************************** */
invCont.deleteView = async function (req, res, next) {
  const inv_id = parseInt(req.params.invId)
  let nav = await utilities.getNav()
  const data = await invModel.getVehicleDetails(inv_id)
  const itemData = data[0];
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
  })
}


/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.deleteItem = async function (req, res, next) {
  let nav = await utilities.getNav()
  const inv_id = parseInt(req.body.inv_id)
  const deleteResult = await invModel.deleteInventoryItem(inv_id)
  if (deleteResult) {
    req.flash("notice", `The item was successfully deleted.`)
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the delete failed.")
    res.redirect(`/inv/`)
  }
}

module.exports = invCont