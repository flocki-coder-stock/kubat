from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from products.models import Product
from .cart import Cart


def cart_detail(request):
    cart = Cart(request)
    return render(request, "cart/detail.html", {"cart": cart})


def is_ajax(request):
    return request.headers.get("x-requested-with") == "XMLHttpRequest"


def cart_add(request, product_id):
    cart = Cart(request)
    product = get_object_or_404(Product, id=product_id)
    cart.add(product.id)

    if is_ajax(request):
        item = cart.cart[str(product.id)]

        return JsonResponse({
            "quantity": item["quantity"],
            "item_total_price": product.price * item["quantity"],
            "cart_total_price": cart.get_total_price(),
            "cart_items_count": len(cart),
        })

    return redirect("cart:cart_detail")



def cart_decrease(request, product_id):
    cart = Cart(request)
    cart.decrease(product_id)

    if is_ajax(request):
        item = cart.cart.get(str(product_id))
        product = get_object_or_404(Product, id=product_id)

        return JsonResponse({
            "quantity": item["quantity"] if item else 0,
            "item_total_price": product.price * item["quantity"] if item else 0,
            "cart_total_price": cart.get_total_price(),
            "cart_items_count": len(cart),
        })

    return redirect("cart:cart_detail")



def cart_remove(request, product_id):
    cart = Cart(request)
    cart.remove(product_id)

    if is_ajax(request):
        return JsonResponse({
            "quantity": 0,
            "item_total_price": 0,
            "cart_total_price": cart.get_total_price(),
            "cart_items_count": len(cart),
        })

    return redirect("cart:cart_detail")
