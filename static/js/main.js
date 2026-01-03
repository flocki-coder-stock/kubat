// ==================================================
// CLEAN & WORKING JS FOR DJANGO E-COMMERCE
// KontsTovar — FINAL VERSION
// ==================================================

// ---------- CSRF ----------
function getCookie(name) {
  let cookieValue = null
  if (document.cookie && document.cookie !== "") {
    document.cookie.split(";").forEach((cookie) => {
      cookie = cookie.trim()
      if (cookie.startsWith(name + "=")) {
        cookieValue = decodeURIComponent(cookie.slice(name.length + 1))
      }
    })
  }
  return cookieValue
}

const CSRF_TOKEN =
  getCookie("csrftoken") ||
  document.querySelector('meta[name="csrf-token"]')?.getAttribute("content")

// ---------- NOTIFICATIONS ----------
const notificationContainer =
  document.getElementById("notificationContainer") ||
  (() => {
    const el = document.createElement("div")
    el.id = "notificationContainer"
    el.className = "notification-container"
    document.body.appendChild(el)
    return el
  })()

function showNotification(message, type = "success") {
  const n = document.createElement("div")
  n.className = `notification ${type}`
  n.textContent = message
  notificationContainer.appendChild(n)

  setTimeout(() => {
    n.style.opacity = "0"
    n.style.transform = "translateX(200px)"
    setTimeout(() => n.remove(), 300)
  }, 3000)
}

// ---------- ADD TO CART ----------
document.querySelectorAll(".btn-add-cart").forEach((btn) => {
  btn.addEventListener("click", async (e) => {
    e.preventDefault()

    const productId = btn.dataset.productId
    const productName = btn.dataset.productName
    if (!productId) return

    btn.disabled = true

    try {
      const res = await fetch(`/cart/add/${productId}/`, {
        method: "POST",
        headers: {
          "X-CSRFToken": CSRF_TOKEN,
          "X-Requested-With": "XMLHttpRequest",
        },
      })

      if (!res.ok) throw new Error()

      const data = await res.json()

      const countEl = document.getElementById("cartItemsCount")
      if (countEl) countEl.textContent = data.cart_items_count

      showNotification(`${productName} добавлен в корзину`)
    } catch {
      showNotification("Ошибка добавления товара", "error")
    } finally {
      btn.disabled = false
    }
  })
})

// ---------- CART PAGE (+ / - / remove) ----------
const cartItems = document.getElementById("cartItems")

if (cartItems) {
  cartItems.addEventListener("click", async (e) => {
    const btn = e.target.closest(".qty-btn, .cart-item-remove")
    if (!btn) return

    const productId = btn.dataset.productId
    const action = btn.dataset.action
    if (!productId || !action) return

    let url = ""
    if (action === "add") url = `/cart/add/${productId}/`
    if (action === "decrease") url = `/cart/decrease/${productId}/`
    if (action === "remove") url = `/cart/remove/${productId}/`

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "X-CSRFToken": CSRF_TOKEN,
          "X-Requested-With": "XMLHttpRequest",
        },
      })

      if (!res.ok) throw new Error()

      const data = await res.json()

      const item = btn.closest(".cart-item")

      if (action === "remove" || data.quantity === 0) {
        item.remove()
      } else {
        item.querySelector(".cart-qty").value = data.quantity
        item.querySelector(".cart-item-total-price").textContent =
          data.item_total_price + " сом"
      }

      document.getElementById("cartTotalPrice") &&
        (document.getElementById("cartTotalPrice").textContent =
          data.cart_total_price + " сом")

      document.getElementById("cartItemsCount") &&
        (document.getElementById("cartItemsCount").textContent =
          data.cart_items_count)
    } catch {
      showNotification("Ошибка корзины", "error")
    }
  })
}

// ---------- CATEGORIES DROPDOWN ----------
const categoriesBtn = document.getElementById("categoriesBtn")
const categoriesMenu = document.getElementById("categoriesMenu")

if (categoriesBtn && categoriesMenu) {
  categoriesBtn.addEventListener("click", (e) => {
    e.stopPropagation()
    categoriesBtn.classList.toggle("active")
    categoriesMenu.classList.toggle("active")
  })

  document.addEventListener("click", (e) => {
    if (!categoriesMenu.contains(e.target) && !categoriesBtn.contains(e.target)) {
      categoriesBtn.classList.remove("active")
      categoriesMenu.classList.remove("active")
    }
  })
}

// ---------- SEARCH PANEL ----------
const searchBtn = document.getElementById("searchBtn")
const searchPanel = document.getElementById("searchPanel")
const searchCloseBtn = document.getElementById("searchCloseBtn")
const searchInput = document.getElementById("searchInput")

if (searchBtn && searchPanel) {
  searchBtn.addEventListener("click", (e) => {
    e.stopPropagation()
    searchPanel.classList.add("active")
    setTimeout(() => searchInput?.focus(), 200)
  })
}

if (searchCloseBtn) {
  searchCloseBtn.addEventListener("click", () => {
    searchPanel.classList.remove("active")
  })
}

document.addEventListener("click", (e) => {
  if (
    searchPanel?.classList.contains("active") &&
    !searchPanel.contains(e.target) &&
    !searchBtn.contains(e.target)
  ) {
    searchPanel.classList.remove("active")
  }
})
