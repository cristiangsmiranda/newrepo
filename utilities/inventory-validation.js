const invModel = require("../models/inventory-model")

const utilities = require(".")
const { body, validationResult } = require("express-validator")
 const validate = {}

  /*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
validate.classificationRules = () => {
  return [   
    // valid classification is required and cannot already exist in the database
    body("classification_name")
      .trim()
      .notEmpty()
      .isAlpha() 
      .isLength({ min: 1 })     
      .withMessage("A valid classification is required.")
      .custom(async (classification_name) => {
        const classExists = await invModel.checkExistingClassification(classification_name);
        if (classExists){
          throw new Error("Classification exists. Please check the classification name");
        }
      })
  ]
};


  /* ******************************
 * Check data and return errors or continue to management
 * ***************************** */
validate.checkClassData = async (req, res, next) => {
    const { classification_name } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("inventory/add-classification", {
        errors,
        title: "Add New Classification",
        nav,
        classification_name
      })
      return
    }
    next()
  }

  validate.inventoryRules = () => {
    return [   
      
      body('classification_id')
      .notEmpty()
      .withMessage('Classification is required.'),

    body('inv_make')
      .trim()
      .notEmpty()
      .matches(/^[a-zA-Z0-9 ]+$/)
      .withMessage('Make can only contain alphanumeric characters and spaces.'),

    body('inv_model')
      .trim()
      .notEmpty()
      .matches(/^[a-zA-Z0-9 ]+$/)
      .withMessage('Model can only contain alphanumeric characters and spaces.'),

      body('inv_description')
      .trim()
      .notEmpty()
      .isLength({ min: 30, max: 100 })
      .withMessage('Description must be between 30 and 100 characters.'),

    body('inv_image')
      .trim()
      .notEmpty()
      .matches(/^[a-zA-Z0-9\/_.-]+$/)
      .withMessage('Image Path can only contain alphanumeric characters, slashes, underscores, hyphens and dots.'),

    body('inv_thumbnail')
      .trim()
      .notEmpty()
      .matches(/^[a-zA-Z0-9\/_.-]+$/)
      .withMessage('Thumbnail Path can only contain alphanumeric characters, slashes, underscores, and hyphens.'),

    body('inv_price')
      .trim()
      .notEmpty()
      .matches(/^\d+(\.\d{1,2})?$/)
      .withMessage('Price must be a valid monetary value with up to two decimal places.'),

    body('inv_year')
      .trim()
      .notEmpty()
      .matches(/^\d{4}$/)
      .withMessage('Year must be a 4-digit number.'),

    body('inv_miles')
      .trim()
      .notEmpty()
      .matches(/^[0-9]+$/)
      .withMessage('Miles can only contain numeric characters.'),

    body('inv_color')
      .trim()
      .notEmpty()
      .matches(/^[a-zA-Z0-9 ]+$/)
      .withMessage('Color can only contain alphanumeric characters and spaces.')
    ]
  };
  
  
    /* ******************************
   * Check data and return errors or continue to management
   * ***************************** */
  validate.checkInventoryData = async (req, res, next) => {
      const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color } = req.body
      let errors = []
      errors = validationResult(req)
      if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        let classificationList = await utilities.buildClassificationList(classification_id);
        res.render("inventory/add-inventory", {
          errors,
          title: "Add New Vehicle",
          nav,
          classificationList,
          inv_make,
          inv_model,
          inv_description,
          inv_image,
          inv_thumbnail,
          inv_price,
          inv_year,
          inv_miles,
          inv_color

        })
        return
      }
      next()
    }
  
    /* ******************************
   * Check data and return errors or continue to edit view
   * ***************************** */
    validate.checkUpdateData = async (req, res, next) => {
      const { inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, inv_id } = req.body
      let errors = []
      errors = validationResult(req)
      if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        const data = await invModel.getVehicleDetails(inv_id)
        const itemData = data[0];
        const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
        const itemName = `${itemData.inv_make} ${itemData.inv_model}`
        res.render("inventory/edit-inventory", {
          errors,
          title:`Edit ${itemName}`,
          nav,
          classificationSelect,
          inv_make,
          inv_model,
          inv_description,
          inv_image,
          inv_thumbnail,
          inv_price,
          inv_year,
          inv_miles,
          inv_color,
          inv_id

        })
        return
      }
      next()
    }
  
    validate.newInventoryRules = () => {
      return [   
        
        body('classification_id')
        .notEmpty()
        .withMessage('Classification is required.'),
  
      body('inv_make')
        .trim()
        .notEmpty()
        .matches(/^[a-zA-Z0-9 ]+$/)
        .withMessage('Make can only contain alphanumeric characters and spaces.'),
  
      body('inv_model')
        .trim()
        .notEmpty()
        .matches(/^[a-zA-Z0-9 ]+$/)
        .withMessage('Model can only contain alphanumeric characters and spaces.'),
  
        body('inv_description')
        .trim()
        .notEmpty()
        .isLength({ min: 30, max: 300 })
        .withMessage('Description must be between 30 and 300 characters.'),
  
      body('inv_image')
        .trim()
        .notEmpty()
        .matches(/^[a-zA-Z0-9\/_.-]+$/)
        .withMessage('Image Path can only contain alphanumeric characters, slashes, underscores, hyphens and dots.'),
  
      body('inv_thumbnail')
        .trim()
        .notEmpty()
        .matches(/^[a-zA-Z0-9\/_.-]+$/)
        .withMessage('Thumbnail Path can only contain alphanumeric characters, slashes, underscores, and hyphens.'),
  
      body('inv_price')
        .trim()
        .notEmpty()
        .matches(/^\d+(\.\d{1,2})?$/)
        .withMessage('Price must be a valid monetary value with up to two decimal places.'),
  
      body('inv_year')
        .trim()
        .notEmpty()
        .matches(/^\d{4}$/)
        .withMessage('Year must be a 4-digit number.'),
  
      body('inv_miles')
        .trim()
        .notEmpty()
        .matches(/^[0-9]+$/)
        .withMessage('Miles can only contain numeric characters.'),
  
      body('inv_color')
        .trim()
        .notEmpty()
        .matches(/^[a-zA-Z0-9 ]+$/)
        .withMessage('Color can only contain alphanumeric characters and spaces.')
      ]
    };

module.exports = validate