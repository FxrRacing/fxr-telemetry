# Project Spec

For this project we are going to be extending our upsell applciation to get inteligent recomendations of customer buying habits 
 and actually displaying that as our upsell options 


 we want to
 - Check frequently bought with 
 - color matched associated Item 
 - Accessories for the product
 - return instock items


 Front end is a shopify checkout ui extension that should emit checkout telemetry so we can see what they buying with
 we will also query shopify for the product data and so we have an idea of all the product options , this is going to be an internal app so the following will matter to us.
 - For multi store setup we need to be install on each store and store the product's id's 
 - to reduce our scope we will just return list of product ids and suggested variants to the client and the code will filter from there 
 - want it to be secure so only our clients can make queries to our service


we are going to extend the current checkout extension to include web pixels and sub to events, we should have a mechanism to make sure only our clients can send to 




- cart init  
        - take a snapshot of when they init checkout and the items already in the cart and potentially match them 
        - the customers ID
        - general location and shop 

- Upsell interaction
    - Adding upsell items to their cart 
    - upsell version clicked on
    - what the items were, color , size , sku 
    - if modal was opened but no item was added
    - what ui syle of modal was used 
    - cart subtotal before interaction and cart subtotal after interaction
    - device type 
    - add to cart button hit but no new item in cart

- Submitted address information if cart init did not already have info of address

- Check out complete 


  



