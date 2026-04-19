document.addEventListener('DOMContentLoaded', () => {
  const cartToggle = document.getElementById('cartToggle');
  const cart = document.getElementById('cart');
  const closeCart = document.getElementById('closeCart');
  const cartItemsEl = document.getElementById('cartItems');
  const cartTotalEl = document.getElementById('cartTotal');
  const cartCount = document.getElementById('cartCount');
  const productGrid = document.getElementById('productGrid');
  const modal = document.getElementById('personalizeModal');
  const modalClose = document.getElementById('modalClose');
  const modalAdd = document.getElementById('modalAdd');
  const previewText = document.getElementById('previewText');
  const pName = document.getElementById('pName');
  const pNumber = document.getElementById('pNumber');
  const pColor = document.getElementById('pColor');
  const productIdField = document.getElementById('productId');
  const navToggle = document.getElementById('navToggle');
  const siteNav = document.getElementById('siteNav');

  function loadCart(){
    try{
      const data = localStorage.getItem('cart');
      const parsed = data ? JSON.parse(data) : [];
      return Array.isArray(parsed) ? parsed : [];
    }catch(e){
      console.error('Error loading cart:', e);
      return [];
    }
  }
  function saveCart(items){
    try{
      localStorage.setItem('cart',JSON.stringify(Array.isArray(items) ? items : []));
    }catch(e){
      console.error('Error saving cart:', e);
    }
  }

  function renderCart(){
    if(!cartItemsEl) return; // cart sidebar not on this page
    const items = loadCart();
    cartItemsEl.innerHTML = '';
    let total = 0;
    items.forEach(it=>{
      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML = `<div>
          <div style="font-weight:600">${escapeHtml(it.name)}</div>
          <div class="muted">${it.personalization||'—'}</div>
        </div>
        <div style="text-align:right">
          <div>$${Number(it.price).toFixed(2)}</div>
          <button data-id="${it.id}" class="btn btn-outline remove">Remove</button>
        </div>`;
      cartItemsEl.appendChild(el);
      total += Number(it.price);
    });
    cartTotalEl.textContent = total.toFixed(2);
    cartCount.textContent = items.length;
    // attach remove handlers
    cartItemsEl.querySelectorAll('.remove').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.getAttribute('data-id');
        const next = loadCart().filter(i=>i.id!==id);
        saveCart(next);
        renderCart();
      })
    })
  }

  function escapeHtml(s){return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]))}

  function addToCart(product, personalization){
    const items = loadCart();
    const id = String(Date.now()) + Math.random().toString(36).slice(2,6);
    const price = Number(product.dataset.price||product.price||0);
    const img = product.querySelector('img')?.src||'';
    items.push({id,name:product.dataset.name||product.name,price,personalization,img});
    saveCart(items);
    renderCart();
  }

  // open personalize modal for a product
  function openModalFor(product){
    if(!modal || !productIdField) return;
    productIdField.value = product.dataset.id;
    const modalTitle = document.getElementById('modalTitle');
    if(modalTitle) modalTitle.textContent = 'Personalize ' + product.dataset.name;
    if(pName) pName.value = '';
    if(pNumber) pNumber.value = '';
    if(pColor) pColor.value = '#0066cc';
    if(previewText) previewText.textContent = '—';
    modal.setAttribute('aria-hidden','false');
  }

  function closeModal(){ if(modal) modal.setAttribute('aria-hidden','true'); }

  // attach product button handlers
  if(productGrid){
    productGrid.querySelectorAll('.card').forEach(card=>{
      card.querySelectorAll('.customize').forEach(b=>{
        b.addEventListener('click', ()=> openModalFor(card));
      });
      card.querySelectorAll('.add-to-cart').forEach(b=>{
        b.addEventListener('click', ()=>{
          addToCart(card,'');
        });
      });
    });
  }

  // modal preview
  if(pName || pNumber || pColor){
    [pName,pNumber,pColor].forEach(inp=>inp && inp.addEventListener('input', ()=>{
      const name = pName.value.trim();
      const num = pNumber.value.trim();
      previewText.textContent = (name||num) ? `${name}${num?(' #' + num):''}` : '—';
      previewText.style.color = pColor.value;
    }));
  }

  if(modalAdd){
    modalAdd.addEventListener('click', ()=>{
      const pid = productIdField.value;
      const card = document.querySelector(`.card[data-id="${pid}"]`);
      if(!card) return closeModal();
      const personalization = `${pName.value.trim() || ''}${pNumber.value?(' #' + pNumber.value):''}`.trim();
      addToCart(card, personalization);
      closeModal();
    });
  }

  // cart toggles
  if(cartToggle){
    cartToggle.addEventListener('click', ()=>{cart.classList.add('open');cart.setAttribute('aria-hidden','false')});
  }
  if(closeCart){
    closeCart.addEventListener('click', ()=>{cart.classList.remove('open');cart.setAttribute('aria-hidden','true')});
  }

  // mobile nav toggle
  if(navToggle && siteNav){
    navToggle.addEventListener('click', ()=>{
      siteNav.classList.toggle('open');
    });
    // close nav when clicking a link
    siteNav.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=> siteNav.classList.remove('open')));
  }

  // smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const targetId = a.getAttribute('href').slice(1);
      if(!targetId) return;
      const target = document.getElementById(targetId);
      if(target){
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth',block:'start'});
      }
    })
  });

  // modal close
  if(modalClose){
    modalClose.addEventListener('click', closeModal);
  }
  if(modal){
    modal.addEventListener('click', (e)=>{ if(e.target===modal) closeModal(); });
  }

  // checkout
  const checkoutBtn = document.getElementById('checkout');
  if(checkoutBtn){
    checkoutBtn.addEventListener('click', ()=>{
      const items = loadCart();
      if(items.length===0){alert('Your cart is empty');return}
      // navigate to checkout page
      if(window.location.pathname.endsWith('checkout.html')){
        // if on checkout page the submit handler will run
        return;
      }
      window.location.href = 'checkout.html';
    });
  }

  // If on checkout page, populate items and handle form
  const checkoutForm = document.getElementById('checkoutForm');
  if(checkoutForm){
    const checkoutItemsEl = document.getElementById('checkoutItems');
    const checkoutTotalEl = document.getElementById('checkoutTotal');
    const itemCountEl = document.getElementById('itemCount');
    
    // Variable to store cart items loaded from localStorage
    // This same variable is used for both display and form submission
    let checkoutItems = [];

    function getCheckoutItemsForSubmit(){
      // Primary source of truth is localStorage.
      const latestItems = loadCart();
      if(latestItems.length > 0){
        checkoutItems = latestItems;
        return latestItems;
      }

      // Fallback to the already-rendered checkout items and persist them back.
      if(checkoutItems.length > 0){
        saveCart(checkoutItems);
        return checkoutItems;
      }

      return [];
    }
    
    function populateCheckout(){
      // Use the same cart source used by submit validation.
      checkoutItems = getCheckoutItemsForSubmit();
      
      // Render items in order summary
      checkoutItemsEl.innerHTML = '';
      let total = 0;
      checkoutItems.forEach(it=>{
        const el = document.createElement('div');
        el.className = 'summary-item-with-image';
        el.innerHTML = `<div class="summary-item-image">
            ${it.img ? `<img src="${it.img}" alt="${escapeHtml(it.name)}">` : '<div class="no-image">No image</div>'}
          </div>
          <div class="summary-item-details">
            <div class="item-name">${escapeHtml(it.name)}</div>
            <div class="item-detail">${it.personalization||'Standard'}</div>
            <div class="item-quantity">Qty: 1</div>
          </div>
          <div class="summary-item-price">$${Number(it.price).toFixed(2)}</div>`;
        checkoutItemsEl.appendChild(el);
        total += Number(it.price);
      });
      itemCountEl.textContent = `Items in cart: ${checkoutItems.length}`;
      checkoutTotalEl.textContent = total.toFixed(2);
    }
    populateCheckout();

    // card number formatting
    const cardInput = document.getElementById('cardInput');
    if(cardInput){
      cardInput.addEventListener('input', (e)=>{
        let val = e.target.value.replace(/\D/g, ''); // remove non-digits
        let formatted = '';
        for(let i = 0; i < val.length && i < 16; i++){
          if(i > 0 && i % 4 === 0) formatted += '-';
          formatted += val[i];
        }
        e.target.value = formatted;
      });
    }

    // expiry date formatting (MM/YY)
    const expiryInput = document.getElementById('expiryInput');
    if(expiryInput){
      expiryInput.addEventListener('input', (e)=>{
        let val = e.target.value.replace(/\D/g, ''); // remove non-digits
        let formatted = '';
        
        // Add first 2 digits (month)
        if(val.length > 0){
          formatted = val.substring(0, 2);
          // Add slash after 2 digits
          if(val.length >= 3){
            formatted += '/' + val.substring(2, 4);
          } else if(val.length === 2){
            formatted += '/';
          }
        }
        
        e.target.value = formatted;
      });
    }

    checkoutForm.addEventListener('submit', (e)=>{
      e.preventDefault();

      // Stop submission and show native field messages if required inputs are missing.
      if(!checkoutForm.checkValidity()){
        checkoutForm.reportValidity();
        return;
      }
      
      // Use the same cart source as order summary, with storage-first fallback.
      const items = getCheckoutItemsForSubmit();
      
      // Show the empty-cart error only when storage truly has no items.
      if(!items || items.length === 0){
        alert('Your cart is empty. Please add items before checking out.');
        return;
      }
      
      // Get form data
      const form = new FormData(checkoutForm);
      
      // Create order with the verified items
      const order = {
        id: 'ord_' + Date.now().toString(36),
        created: Date.now(),
        items: items,
        total: items.reduce((s,i)=>s+Number(i.price),0),
        customer: {
          name: form.get('name'),
          address: form.get('address'),
          city: form.get('city'),
          postal: form.get('postal')
        }
      };
      
      // Save order to localStorage
      localStorage.setItem('lastOrder', JSON.stringify(order));
      
      // Append to orders list
      const orders = JSON.parse(localStorage.getItem('orders')||'[]');
      orders.push(order);
      localStorage.setItem('orders', JSON.stringify(orders));
      
      // NOW clear the cart (after order is saved)
      localStorage.removeItem('cart');
      checkoutItems = []; // Clear the stored items
      renderCart();
      
      // Redirect to confirmation page
      window.location.href = 'confirmation.html';
    });
  }

  // If on order confirmation page, show the last order
  const orderDetails = document.getElementById('orderDetails');
  if(orderDetails){
    const raw = localStorage.getItem('lastOrder');
    if(!raw){ orderDetails.innerHTML = '<p>No recent order found.</p>'; }
    else{
      const ord = JSON.parse(raw);
      const d = new Date(ord.created);
      let html = `<p><strong>Order ID:</strong> ${ord.id}</p>`;
      html += `<p><strong>Date:</strong> ${d.toLocaleString()}</p>`;
      html += `<h3>Items</h3>`;
      html += '<ul>';
      ord.items.forEach(i=> html += `<li>${escapeHtml(i.name)} — $${Number(i.price).toFixed(2)} <div class="muted">${i.personalization||'—'}</div></li>`);
      html += '</ul>';
      html += `<p class="total"><strong>Total:</strong> $${Number(ord.total).toFixed(2)}</p>`;
      html += `<h3>Shipping</h3><p>${escapeHtml(ord.customer.name)}<br>${escapeHtml(ord.customer.address)}<br>${escapeHtml(ord.customer.city)} ${escapeHtml(ord.customer.postal)}</p>`;
      orderDetails.innerHTML = html;
    }
  }

  // init
  renderCart();
  // set year
  const yearEl = document.getElementById('year');
  if(yearEl){
    yearEl.textContent = new Date().getFullYear();
  }
});
