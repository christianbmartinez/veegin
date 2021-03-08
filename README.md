# What's this? 
Veegin helps you narrow down gluten free/ plant based products using the kroger api.

This project was inspired by a co worker, who's wife is vegan. She has had trouble finding plant based products, as well as gluten free for her allergies. I decided to create this project in context of discovering that.

# Built with
HTML, CSS, MATERIALIZE, JS, UNDRAW, KROGER API'S

# How it works
The user lands on the home page, submits their zip code, and veegin uses Krogers store locator api to find locations near their zip code. Session storage sets the users location and store name that the user chooses. They can call the store directly, or set it as their local store. This data is then passed into the product search api where they can search for items and retrieve results from local stores. 

On the products list page, users can scroll through products and view name, price, aisle locations, and a popup modal that displays sales price if the item is on sale.  

