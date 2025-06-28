i am building an ecommerce app in which there is customers, sellers, products, admin

now i want to know the approach to build this web app in .net core web api(backend) and react(frontend) and SQL(ssms)(database)

so first let me explain you the requirements-
(1) a user can register/login as customer or seller

(2) if user registers as seller then a request will go to the admin by email (using email service), and admin will reject/approve the request

(3) note: there can be only one seller in the city like city1 -> f1 esports, city2 -> f2 esports (valid), city1 -> f1 esports , city2 -> f1 esports (invalid)

(4) seller can see his products, can add a product, can make product inactive, can update product details, also manage the stock quantity of products
    seller can also see the approvals for the product order
    basically customer will order a product and an order request will go to that product seller and that seller will approve/reject the order

(5) customer can see the products, can place an order, can add product to cart, can see the ordered products, can cancel a product order, can save products to their favourites

(6) also make an invoice pdf (pdf service) for the products ordered by the customer and send that invoice to the customer email (using email sevrice)

(7) Admin routes must be accessible only to Admin users, Seller routes only to Sellers, and Customer routes to Customers. Implement Role based functionality

(8) admin can make sellers active/inactive, can make customers active/inactive, can make products active/inactive

(9) Note: when a product/customer/seller is created it can be deleted(hard delete) and can also be make inactive(soft delete)

(10) I also want a functionality like, when customer places an order then the product should be delivered between 1hour to 0.5hour (based on the random time)

(11) also i want to manage a wallet for the customers, like if a customer has only 500 dollar in wallet then if user tries to purhcase a product of 600 dollar then i will not  allow customer to purchase that product.

(12) Note: a customer can also be a seller, and a seller can also be a customer

(13) so i will show below tabs/navigation for custoemr, admin ,sellers
     customers -> dashboard, products, orders, cart, wallet
     sellers -> dashboard, invoices, products, approvals, inventory
     admin -> dashboard, users (customers, sellers, admin(you)), approvals 

So Can Explain me the flow and make the models for the all the entites like admin, customer, seller, orders, etc. to store in the database