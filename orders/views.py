from django.shortcuts import render, redirect
from django.core.mail import send_mail
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string


from .models import Order, OrderItem
from cart.cart import Cart


def checkout(request):
    cart = Cart(request)

    # если корзина пустая — на главную
    if len(cart) == 0:
        return redirect("/")

    if request.method == "POST":
        order = Order.objects.create(
            full_name=request.POST["full_name"],
            phone=request.POST["phone"],
            address=request.POST["address"],
        )

        email_lines = [
            f"Новый заказ #{order.id}",
            f"Имя: {order.full_name}",
            f"Телефон: {order.phone}",
            f"Адрес: {order.address}",
            "",
            "Товары:"
        ]

        for item in cart:
            OrderItem.objects.create(
                order=order,
                product=item["product"],
                quantity=item["quantity"],
                price=item["product"].price,
            )

            email_lines.append(
                f"- {item['product'].name} × {item['quantity']} = {item['total_price']} сом"
            )

        email_lines.append("")
        email_lines.append(f"Итого: {cart.get_total_price()} сом")

        # 📧 EMAIL ПРОДАВЦУ
        # HTML email
        html_message = render_to_string(
            "emails/order_email.html",
            {
                "order": order,
                "items": list(cart),
                "total_price": cart.get_total_price(),
            }
        )

        email = EmailMultiAlternatives(
            subject=f"Новый заказ №{order.id}",
            body="У вас новый заказ. Откройте письмо в HTML.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[settings.SHOP_OWNER_EMAIL],
        )

        email.attach_alternative(html_message, "text/html")
        email.send()

        cart.clear()
        return redirect("orders:success")

    return render(request, "orders/checkout.html", {"cart": cart})


def success(request):
    return render(request, "orders/success.html")

