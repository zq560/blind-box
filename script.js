// 主题切换与购买流程
(function(){
  const themeBtn = document.getElementById('themeToggle');
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('theme');
  if(savedTheme) root.setAttribute('data-theme', savedTheme);
  themeBtn?.addEventListener('click', ()=>{
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  const authToken = () => localStorage.getItem('authToken');
  const isLoggedIn = () => Boolean(authToken());
  const buyBtn = document.getElementById('buyBtn');
  const quantityInput = document.getElementById('quantity');
  const loginWarning = document.getElementById('loginWarning');
  const orderResult = document.getElementById('orderResult');

  function getQuantity(){
    if(!quantityInput) return 1;
    const n = Number(quantityInput.value);
    return Math.max(1, isNaN(n) ? 1 : n);
  }

  function showLoginHint(){
    const lang = localStorage.getItem('lang') || 'zh';
    const t = translations[lang] || translations.zh;
    if(loginWarning) loginWarning.classList.remove('hidden');
    if(orderResult) orderResult.innerHTML = t.loginHint + ' <a href="me.html">' + t.loginLink + '</a>';
  }

  if(buyBtn){
    buyBtn.addEventListener('click', (event)=>{
      event.preventDefault();
      const quantity = getQuantity();
      if(!isLoggedIn()){
        showLoginHint();
        return;
      }
      location.href = '/checkout.html?quantity=' + encodeURIComponent(quantity);
    });
  }

  const langToggle = document.getElementById('langToggle');
  const translations = {
    zh: {
      logo: '强哥的地盘',
      meLink: '我',
      langToggle: 'English',
      themeToggle: '切换主题',
      heroDesc: '要么发财，要么发难',
      productName: '神秘盲盒',
      productDesc: '中奖概率倍高',
      orderTitle: '购买',
      quantityLabel: '数量',
      buyBtn: '购买',
      priceLabel: '价格：',
      unitLabel: '个',
      loginHint: '请先登录或注册后再购买。',
      loginLink: '去登录',
      productIntroTitle: '商品介绍',
      productIntro1: '神秘盲盒内含未知惊喜，适合作为收藏、送礼或自己开箱。每个盲盒均为随机规格，充满期待与惊喜。',
      productIntro2: '购买后请完成收货信息填写并进入支付宝支付页面，后台确认后系统会自动开奖。',
      prizeTitle: '奖品概率说明',
      prizePhoneTitle: '苹果手机',
      prizePhoneDesc: '中奖概率 1%，后台确认后系统自动抽取。',
      prizeCashTitle: '99元红包',
      prizeCashDesc: '中奖概率 10%，开到后可联系老板兑奖。',
      prizeThanksTitle: '谢谢参与',
      prizeThanksDesc: '概率 89%，重在参与，祝你下次好运。',
      footerText: '© 2026 强哥的地盘'
    },
    en: {
      logo: 'Qiangge\'s Spot',
      meLink: 'Me',
      langToggle: '中文',
      themeToggle: 'Toggle Theme',
      heroDesc: 'Win big or challenge hard.',
      productName: 'Mystery Blind Box',
      productDesc: 'Higher chance to win.',
      orderTitle: 'Buy',
      quantityLabel: 'Quantity',
      buyBtn: 'Purchase',
      priceLabel: 'Price:',
      unitLabel: 'pcs',
      loginHint: 'Please log in or register before purchasing.',
      loginLink: 'Go to login',
      productIntroTitle: 'Product Description',
      productIntro1: 'The mystery blind box contains unknown surprises, suitable for collecting, gifting, or unboxing yourself. Each box is randomly selected for maximum excitement.',
      productIntro2: 'After purchase, fill in your shipping information and proceed to Alipay payment. The system reveals the prize after admin confirmation.',
      prizeTitle: 'Prize Odds',
      prizePhoneTitle: 'iPhone',
      prizePhoneDesc: '1% chance. The system draws automatically after admin confirmation.',
      prizeCashTitle: '¥99 Red Packet',
      prizeCashDesc: '10% chance. Contact the owner to redeem after winning.',
      prizeThanksTitle: 'Thanks for Participating',
      prizeThanksDesc: '89% chance. Better luck next time.',
      footerText: '© 2026 Qiangge\'s Spot'
    }
  };

  function applyLanguage(lang){
    const t = translations[lang] || translations.zh;
    const siteLogo = document.getElementById('siteLogo');
    const meLink = document.getElementById('meLink');
    const themeBtn = document.getElementById('themeToggle');
    const heroDesc = document.getElementById('heroDesc');
    const productName = document.getElementById('productName');
    const productDesc = document.getElementById('productDesc');
    const orderTitle = document.getElementById('orderTitle');
    const quantityLabel = document.getElementById('quantityLabel');
    const buyBtn = document.getElementById('buyBtn');
    const priceLabel = document.getElementById('priceLabel');
    const unitLabel = document.getElementById('unitLabel');
    const loginLink = loginWarning?.querySelector('a');
    const productIntroTitle = document.getElementById('productIntroTitle');
    const productIntro1 = document.getElementById('productIntro1');
    const productIntro2 = document.getElementById('productIntro2');
    const prizeTitle = document.getElementById('prizeTitle');
    const prizePhoneTitle = document.getElementById('prizePhoneTitle');
    const prizePhoneDesc = document.getElementById('prizePhoneDesc');
    const prizeCashTitle = document.getElementById('prizeCashTitle');
    const prizeCashDesc = document.getElementById('prizeCashDesc');
    const prizeThanksTitle = document.getElementById('prizeThanksTitle');
    const prizeThanksDesc = document.getElementById('prizeThanksDesc');
    const footerText = document.getElementById('footerText');

    if(siteLogo) siteLogo.textContent = t.logo;
    if(meLink) meLink.textContent = t.meLink;
    if(themeBtn) themeBtn.textContent = t.themeToggle;
    if(heroDesc) heroDesc.textContent = t.heroDesc;
    if(productName) productName.textContent = t.productName;
    if(productDesc) productDesc.textContent = t.productDesc;
    if(orderTitle) orderTitle.textContent = t.orderTitle;
    if(quantityLabel) quantityLabel.childNodes[0].textContent = t.quantityLabel + '\n';
    if(buyBtn) buyBtn.textContent = t.buyBtn;
    if(priceLabel) priceLabel.textContent = t.priceLabel;
    if(unitLabel) unitLabel.textContent = t.unitLabel;
    if(loginWarning) loginWarning.firstChild.textContent = t.loginHint + ' ';
    if(loginLink) loginLink.textContent = t.loginLink;
    if(productIntroTitle) productIntroTitle.textContent = t.productIntroTitle;
    if(productIntro1) productIntro1.textContent = t.productIntro1;
    if(productIntro2) productIntro2.textContent = t.productIntro2;
    if(prizeTitle) prizeTitle.textContent = t.prizeTitle;
    if(prizePhoneTitle) prizePhoneTitle.textContent = t.prizePhoneTitle;
    if(prizePhoneDesc) prizePhoneDesc.textContent = t.prizePhoneDesc;
    if(prizeCashTitle) prizeCashTitle.textContent = t.prizeCashTitle;
    if(prizeCashDesc) prizeCashDesc.textContent = t.prizeCashDesc;
    if(prizeThanksTitle) prizeThanksTitle.textContent = t.prizeThanksTitle;
    if(prizeThanksDesc) prizeThanksDesc.textContent = t.prizeThanksDesc;
    if(footerText) footerText.textContent = t.footerText;
    if(langToggle) langToggle.textContent = t.langToggle;
    localStorage.setItem('lang', lang);
  }

  const savedLang = localStorage.getItem('lang') || 'zh';
  applyLanguage(savedLang);
  langToggle?.addEventListener('click', ()=>{
    const nextLang = (localStorage.getItem('lang') || 'zh') === 'zh' ? 'en' : 'zh';
    applyLanguage(nextLang);
  });
})();
