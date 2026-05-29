(function(){
  const authToken = () => localStorage.getItem('authToken');
  if(!authToken()){
    location.href = '/me.html';
    return;
  }

  const translations = {
    zh: {
      pageTitle: '填写收货信息',
      pageDesc: '请确认数量和收货地址，然后继续支付。',
      orderInfoTitle: '订单信息',
      productLabel: '商品：',
      productName: '神秘盲盒',
      qtyLabel: '数量：',
      totalLabel: '总价：',
      shippingTitle: '收货信息',
      nameLabel: '姓名',
      phoneLabel: '手机号',
      addressLabel: '地址',
      submitBtn: '继续付款',
      submitError: '提交订单失败，请稍后重试。',
      logo: '强哥的地盘',
      langToggle: 'English',
      title: '填写收货信息 - 强哥的地盘',
      footerText: '© 2026 强哥的地盘'
    },
    en: {
      pageTitle: 'Shipping Information',
      pageDesc: 'Confirm quantity and shipping details, then continue to payment.',
      orderInfoTitle: 'Order Details',
      productLabel: 'Product:',
      productName: 'Mystery Blind Box',
      qtyLabel: 'Quantity:',
      totalLabel: 'Total:',
      shippingTitle: 'Shipping Information',
      nameLabel: 'Name',
      phoneLabel: 'Phone',
      addressLabel: 'Address',
      submitBtn: 'Continue to Payment',
      submitError: 'Order submission failed. Please try again.',
      logo: 'Qiangge\'s Spot',
      langToggle: '中文',
      title: 'Shipping Information - Qiangge\'s Spot',
      footerText: '© 2026 Qiangge\'s Spot'
    }
  };

  let lang = localStorage.getItem('lang') || 'zh';
  let t = translations[lang] || translations.zh;

  const params = new URLSearchParams(location.search);
  const qty = Math.max(1, Number(params.get('quantity'))||1);
  const unitPrice = 5;
  const selectedQty = document.getElementById('selectedQty');
  const selectedTotal = document.getElementById('selectedTotal');
  const checkoutForm = document.getElementById('checkoutForm');
  const checkoutResult = document.getElementById('checkoutResult');

  const pageTitle = document.getElementById('pageTitle');
  const pageDesc = document.getElementById('pageDesc');
  const orderInfoTitle = document.getElementById('orderInfoTitle');
  const productLabel = document.getElementById('productLabel');
  const productName = document.getElementById('productName');
  const qtyLabel = document.getElementById('qtyLabel');
  const totalLabel = document.getElementById('totalLabel');
  const shippingTitle = document.getElementById('shippingTitle');
  const nameLabel = document.getElementById('nameLabel');
  const phoneLabel = document.getElementById('phoneLabel');
  const addressLabel = document.getElementById('addressLabel');
  const submitBtn = document.getElementById('submitBtn');
  const siteLogo = document.getElementById('siteLogo');
  const langToggle = document.getElementById('langToggle');
  const footerText = document.getElementById('footerText');

  function applyLanguage(nextLang){
    lang = nextLang;
    t = translations[lang] || translations.zh;
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
    document.title = t.title;
    if(siteLogo) siteLogo.textContent = t.logo;
    if(langToggle) langToggle.textContent = t.langToggle;
    if(pageTitle) pageTitle.textContent = t.pageTitle;
    if(pageDesc) pageDesc.textContent = t.pageDesc;
    if(orderInfoTitle) orderInfoTitle.textContent = t.orderInfoTitle;
    if(productLabel) productLabel.textContent = t.productLabel;
    if(productName) productName.textContent = t.productName;
    if(qtyLabel) qtyLabel.textContent = t.qtyLabel;
    if(totalLabel) totalLabel.textContent = t.totalLabel;
    if(shippingTitle) shippingTitle.textContent = t.shippingTitle;
    if(nameLabel && nameLabel.firstChild) nameLabel.firstChild.textContent = t.nameLabel;
    if(phoneLabel && phoneLabel.firstChild) phoneLabel.firstChild.textContent = t.phoneLabel;
    if(addressLabel && addressLabel.firstChild) addressLabel.firstChild.textContent = t.addressLabel;
    if(submitBtn) submitBtn.textContent = t.submitBtn;
    if(footerText) footerText.textContent = t.footerText;
    localStorage.setItem('lang', lang);
  }

  applyLanguage(lang);
  langToggle?.addEventListener('click', () => {
    applyLanguage((localStorage.getItem('lang') || 'zh') === 'zh' ? 'en' : 'zh');
  });

  if(selectedQty) selectedQty.textContent = qty;
  if(selectedTotal) selectedTotal.textContent = (unitPrice * qty).toFixed(2);

  checkoutForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const f = new FormData(checkoutForm);
    const order = {
      product: t.productName,
      unitPrice: unitPrice.toFixed(2),
      totalAmount: (unitPrice * qty).toFixed(2),
      quantity: qty,
      buyerName: f.get('buyerName'),
      phone: f.get('phone'),
      address: f.get('address'),
      method: 'alipay',
      createdAt: new Date().toISOString()
    };
    try{
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + authToken()
        },
        body: JSON.stringify(order)
      });
      if(!res.ok) throw new Error('网络错误');
      const data = await res.json();
      location.href = '/payment.html?orderId='+encodeURIComponent(data.id)+'&amount='+encodeURIComponent(order.totalAmount);
    }catch(err){
      if(checkoutResult) checkoutResult.textContent = t.submitError;
    }
  });
})();
