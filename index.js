let query = document.getElementById('query')
let term = query.value;
const submit = document.getElementById('submit')
const logo = document.querySelector('.logo-text')
const sectionHero = document.getElementById('hero')
const sectionResults = document.getElementById('results')
let productImage = document.getElementById('product-image')
let productBrand = document.getElementById('product-brand')
let productCategory = document.getElementById('product-category')
let productDescription = document.getElementById('product-description')

const clientID = 'nodeoauth2-2c28d1cc3d0bc137ee2967a978e827793176266780055496662'
const clientSecret = 'bWwJA2SgDjPiizmuwM4tOtaVZ5us5OHaOHfbldVF'
const base64Encoded = btoa(clientID + ':' + clientSecret)

query.onchange = () => {    
    term = query.value
    console.log(term)
}

query.onfocus = () => {
  query.placeholder = ''
  query.placeholder.color = '#777'
}

logo.onclick = () => {
  window.location.reload()
}

submit.onclick = () => {
  if (!term) {
    query.placeholder = 'Please enter a search term'
  } else {
    sectionHero.style.display = 'none'
    sectionResults.style.display = 'block'
    if (sectionResults.innerHTML) {
      sectionResults.innerHTML = '' // After each query, clear the previous html.
    }
    getProducts() // Use the api to display products  
  }

}

function getProducts() { // Fetch the api oauth2 token
fetch('https://api.kroger.com/v1/connect/oauth2/token', {
    "async": true,
    "crossDomain": true,
    "method": "POST",
    "body": 'grant_type=client_credentials&scope=product.compact',
    "headers": {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${base64Encoded}`
    }
  })
.then(res => res.json())
.catch(err => console.log('Error', err))
.then(data => { // Only with an oauth2 token can we send requests to the api
	return fetch(`https://api.kroger.com/v1/products?filter.term=${term}`, {
		"async": true,
        "crossDomain": true,
        "method": "GET",
        headers: {
			'Authorization': data.token_type + ' ' + data.access_token,
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	});

})
.then(res => res.json())
.then(products => {
  let productArray = products.data
   // Loop through the array and assign data to our response container
      productArray.forEach(item => {      
         let imagesArr = item.images[0].sizes; // Images in this api aren't sorted 
         imagesArr.forEach(image => { // We have to programatically retrieve the correct image size
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
              <img class="product-image" src="${imagesArr}" alt="${item.brand}">
          </div>
          <div class="col s12 m12 l4">
              <div class="product-details">
              <h4 class="product-title">${item.description}</h4>
              <div class="product-description">
              <p>Brand: ${item.brand}</p>
              <p>Category: ${item.categories}</p>
              <p>Product ID: ${item.items[0].itemId}</p>
              <p>Product Temp: ${item.temperature.indicator}</p>
              <p>UPC: ${item.upc}</p>
              </div>              
              <div class="product-action left">
              <a class="btn-floating waves-effect waves-light purple darken-1"><i class="material-icons">add_shopping_cart</i></a>
              <a class="btn-floating waves-effect waves-light red darken-1"><i class="material-icons">location_on</i></a>
              <a class="btn-floating waves-effect waves-light green darken-1"><i class="material-icons">monetization_on</i></a>
              </div>
              </div>
           </div>
          </div>              
        </div>
        </div> 
        `
      })

  })
.catch(err => console.log('Error', err))
}