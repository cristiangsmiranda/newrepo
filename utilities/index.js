const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
  let data = await invModel.getClassifications();

  // Verifica se os dados foram carregados corretamente
  console.log("Nav Data:", data); // <-- Adiciona um log para depuração

  // Se data for null ou um array vazio, retorna apenas Home e New Car
  if (!data || data.length === 0) {
    console.error("Error: No classification data found.");
    return [
      { name: "Home", url: "/" },
      { name: "New Car", url: "/inv/management" }
    ];
  }

  // Constrói a navegação como um array de objetos
  let navItems = [
    { name: "Home", url: "/" },
    ...data.map(row => ({
      name: row.classification_name,
      url: `/inv/type/${row.classification_id}`
    })),
    { name: "New Car", url: "/inv/management" }
  ];

  return navItems;
};

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid = ''

  if(data.length > 0){
    grid = '<div class="vehicle-grid">' // Adiciona um container flexível para os cards
    data.forEach(vehicle => { 
      grid += `
        <div class="vehicle-card">
          <a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
            <img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" />
          </a>
          <div class="vehicle-info">
            <h2>
              <a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
                ${vehicle.inv_make} ${vehicle.inv_model}
              </a>
            </h2>
            <span class="price">$${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</span>
          </div>
        </div>
      `
    })
    grid += '</div>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => 
  Promise.resolve(fn(req, res, next)).catch(next);


/* ****************************************
 * Build Classification Dropdown List
 **************************************** */
Util.buildClassificationList = async function (selectedId = null) {
  let data = await invModel.getClassifications();

  if (!data || data.length === 0) {
    console.error("Error: No classification data found.");
    return '<select name="classification_id"><option value="">No classifications found</option></select>';
  }

  let dropdown = `<select name="classification_id" id="classification_id" required>`;
  dropdown += `<option value="">Select a Classification</option>`;

  data.forEach(row => {
    let selected = row.classification_id == selectedId ? "selected" : "";
    dropdown += `<option value="${row.classification_id}" ${selected}>${row.classification_name}</option>`;
  });

  dropdown += `</select>`;
  return dropdown;
};


module.exports = {
  getNav: Util.getNav,
  buildClassificationGrid: Util.buildClassificationGrid,
  handleErrors: Util.handleErrors,
  buildClassificationList: Util.buildClassificationList, // Adicione esta linha
};
