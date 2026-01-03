from products.models import Product


class Cart:
    def __init__(self, request):
        self.session = request.session
        cart = self.session.get("cart")

        if not cart:
            cart = self.session["cart"] = {}

        self.cart = cart

    def add(self, product_id, quantity=1):
        product_id = str(product_id)

        if product_id not in self.cart:
            self.cart[product_id] = {
                "quantity": 0
            }

        self.cart[product_id]["quantity"] += quantity
        self.session.modified = True

    def decrease(self, product_id):
        product_id = str(product_id)

        if product_id in self.cart:
            self.cart[product_id]["quantity"] -= 1

            if self.cart[product_id]["quantity"] <= 0:
                del self.cart[product_id]

            self.session.modified = True

    def remove(self, product_id):
        product_id = str(product_id)

        if product_id in self.cart:
            del self.cart[product_id]
            self.session.modified = True

    def __iter__(self):
        product_ids = self.cart.keys()
        products = Product.objects.filter(id__in=product_ids)

        for product in products:
            item = self.cart[str(product.id)]
            quantity = item["quantity"]

            yield {
                "product": product,
                "quantity": quantity,
                "total_price": product.price * quantity,
            }

    def __len__(self):
        return sum(item["quantity"] for item in self.cart.values())

    def get_total_price(self):
        products = Product.objects.filter(id__in=self.cart.keys())
        total = 0
        for product in products:
            total += product.price * self.cart[str(product.id)]["quantity"]
        return total

    def clear(self):
        self.session["cart"] = {}
        self.session.modified = True





