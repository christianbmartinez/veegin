// Define and store variables
const query = document.getElementById('query')
let term
const locale = document.getElementById('locale')
let zipCode
const submit = document.getElementById('submit')
const submitZip = document.getElementById('submit-zip')
const zipRow = document.getElementById('zip-row')
const searchRow = document.getElementById('search-row')
const logo = document.querySelector('.logo-text')
const locationResults = document.getElementById('location-results')
const sectionHero = document.getElementById('hero')
const sectionResults = document.getElementById('results')
const noResults = document.getElementById('no-results')

const clientID = 'veeginapp-109f0d4bc41f356dbd06e2743026d6418964079376451615292'
const clientSecret = 'wjR5llDKnHQKI107Yn615kMURGHUFgWPVKrI7nWU'
const base64Encoded = btoa(clientID + ':' + clientSecret) // Base64 encode our keys

let tokenSettings = {
  // Our main api config
  async: true,
  crossDomain: true,
  method: 'POST',
  body: 'grant_type=client_credentials&scope=product.compact',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: `Basic ${base64Encoded}`,
  },
}

locale.onfocus = () => {
  // Always change back the color when it's red
  locale.style.color = '#777'
}

isNumber = (n) => {
  // Zip code error handling
  return !isNaN(parseFloat(n)) && !isNaN(n - 0)
}

locale.onchange = () => {
  // If the zip value is good, store it, otherwise make it red
  isNumber(locale.value) === false
    ? (locale.style.color = '#e35252')
    : (zipCode = locale.value)
}

submitZip.onclick = () => {
  locationResults.innerHTML = '' // If a user changes zip code, we need to clear the previous html
  zipCode = locale.value // Store the zip code value
  getLocations() // Call the locations api
}

query.onfocus = () => {
  query.placeholder = sessionStorage.getItem('locationName')
    ? (query.placeholder = `Search ${sessionStorage.getItem('locationName')}`)
    : query.placeholder // Assign the current placeholder value
  query.placeholder.color = '#777' // Make sure the color is dark gray

  query.onchange = () => {
    term = query.value // After the input focus, store the user search value for the product api
  }
}

logo.onclick = () => {
  window.location.reload() // Refreshing the page brings the user to the home page
  // sessionStorage tracks any user data we assign even after a refresh
}

submit.onclick = () => {
  if (!term) {
    // If search is performed and the value is missing, let them know
    query.placeholder = 'Search is required'
  } else {
    // Otherwise, display the content
    sectionHero.style.display = 'none'
    sectionResults.style.display = 'block'
    if (sectionResults.innerHTML) {
      sectionResults.innerHTML = '' // After each query, clear the previous html to make room for new data
    }
    getProducts() // Call the products api
  }
}

setLocation = (id, name) => {
  // Here we are passing in the name and id of the store the user chooses
  sessionStorage.setItem('locationId', id) // We use sessionStorage to store the data and pass it into our products api
  sessionStorage.setItem('locationName', name)
  zipRow.style.display = 'none'
  searchRow.style.display = 'block'
  query.placeholder = `Search ${name}` // We can use the stored values to display the name of the store in the search bar
  locationResults.style.display = 'none'
}

getLocations = () => {
  // oauth2 requires a token to access api data. Once a token is received, we pass it into our api auth header
  fetch('https://api.kroger.com/v1/connect/oauth2/token', tokenSettings)
    .then((res) => res.json())
    .catch((err) => console.log('Error', err))

    .then((data) => {
      // Location api
      return fetch(
        `https://api.kroger.com/v1/locations?filter.zipCode.near=${zipCode}`,
        {
          async: true,
          crossDomain: true,
          method: 'GET',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `${data.token_type} ${data.access_token}`,
          },
        }
      )
    })
    .then((res) => res.json())
    .catch((err) => console.log('Error', err))
    .then((data) => {
      function capitalizeFirstLetter(string) {
        // Function for correcting all caps
        return string.charAt(0).toUpperCase() + string.slice(1)
      }

      let locationData = data.data
      // We need to filter the results for locations based on whether the result has a deli department. This lets us know it's a food store, not a jewelry store. Or a gas station.
      locationData.length > 0
        ? (locationResults.style.display = 'block')
        : (noResults.style.display = 'block') // If no results, display no results block

      locationData.forEach((location) => {
        noResults.style.display = 'none' // If no results block is active, disable it
        // Push all results into the location results div
        locationResults.innerHTML += `
    <div class="row">
        <div class="card card-margin">
            <div class="location-container">    
                <div class="row">
                    <div class="col s7">
                        <p class="location-title">${capitalizeFirstLetter(
                          location.chain.toLowerCase()
                        )} ${location.address.city}</p>
                        <div class="location-details">
                            <p>${location.address.addressLine1}</p>
                            <p>${location.address.city}, ${
          location.address.state
        }, ${location.address.zipCode}</p>
                        </div>
                    </div>
                    <div class="col s5 location-action">
                        <a onclick="setLocation('${
                          location.locationId
                        }', '${capitalizeFirstLetter(
          location.chain.toLowerCase()
        )}')" alt="Shop ${
          location.name
        }" class="btn-floating waves-effect waves-light red darken-1"><i class="material-icons">store</i></a>
                        <a alt="Call ${location.name}" href="tel:${
          location.phone
        }" class="btn-floating waves-effect waves-light blue darken-1"><i class="material-icons">phone_in_talk</i></a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `
      })
    })
    .catch((err) => console.log('Error', err))
}

function getProducts() {
  // Fetch the api oauth2 token
  fetch('https://api.kroger.com/v1/connect/oauth2/token', tokenSettings)
    .then((res) => res.json())
    .catch((err) => console.log('Error', err))

    .then((data) => {
      // Products api
      return fetch(
        `https://api.kroger.com/v1/products?filter.term=${term}&filter.limit=25&filter.locationId=${sessionStorage.getItem(
          'locationId'
        )}`,
        {
          async: true,
          crossDomain: true,
          method: 'GET',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `${data.token_type} ${data.access_token}`,
          },
        }
      )
    })
    .then((res) => res.json())
    .then((products) => {
      let productArray = products.data

      console.log(productArray)
      productArray.length >= 0
        ? (sectionResults.style.display = 'block')
        : (noResults.style.display = 'block')
      productArray.forEach((item) => {
        noResults.style.display = 'none'
        let imagesArr = item.images[0].sizes // Images in this api aren't sorted
        imagesArr.forEach((image) => {
          // We have to programatically retrieve the correct image size
          if (image.size === 'large') {
            imagesArr = image.url
          }
        })
        // Push all results into results container
        sectionResults.innerHTML += `
        <div class="container">
            <div class="card card-margin"> 
                <div class="row">
                    <div class="col s12 m12 l8">
                        <img class="product-image" src="${imagesArr}" alt="${
          item.brand
        }">
                    </div>
                    <div class="col s12 m12 l4">
                        <div class="product-details">
                            <h4 class="product-title">${item.description}</h4>
                            <h4 class="product-title">$${
                              item.items[0].price.regular
                                ? item.items[0].price.regular
                                : 'Price not available'
                            }</h4>
                            <div class="product-description">
                                <p>Category: ${item.categories}</p>
                                <p>Product ID: ${item.items[0].itemId}</p>
                                <p>UPC: ${item.upc}</p>
                                <p>Available at ${sessionStorage.getItem(
                                  'locationName'
                                )} ${
          item.aisleLocations[0].description
            ? item.aisleLocations[0].description
            : ''
        } </p>
                            </div>              
                            <div class="product-action left">
                                <a class="btn-floating waves-effect waves-light purple darken-1"><i class="material-icons">add_shopping_cart</i></a>
                                <a class="btn-floating waves-effect waves-light red darken-1"><i class="material-icons">location_on</i></a>
                                <a onclick="modalOpen('${item.description}','${
          item.items[0].price.promo
        }')" class="btn-floating waves-effect waves-light green darken-1"><i class="material-icons">monetization_on</i></a>
                            </div>
                        </div>
                    </div>
                </div>              
            </div>
        </div>  
        <div id="modal-promo" class="modalpromo">
            <div class="modalpromo-content">
            <i class="material-icons promo-icon">monetization_on</i>
                <span class="close-modal" onclick="modalClose()">&times;</span>
                <p id="modal-desc"></p>
                <p id="modal-price"></p>
            </div>        
        </div>
        `

        let modalPromo = document.getElementById('modal-promo')
        let modalDesc = document.getElementById('modal-desc')
        let modalPrice = document.getElementById('modal-price')

        modalOpen = (name, price) => {
          modalPromo.style.display = 'block'
          modalDesc.innerHTML = name
          if (price > 0) {
            modalPrice.innerHTML = `Promo price! <span class="price">$${price}</span>`
          } else if (!price || price === 0 || price === '0') {
            modalPrice.innerHTML = '<i>No promo price found on this item.</i>'
          }
        }

        modalClose = () => {
          modalPromo.style.display = 'none'
        }

        window.onclick = function (event) {
          if (event.target == modalPromo) {
            modalPromo.style.display = 'none'
          }
        }
      })
    })
    .catch((err) => console.log('Error', err))
}
