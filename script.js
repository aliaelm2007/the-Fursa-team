// mobile menu
  const menuToggle = document.getElementById('menuToggle');
  const mobilePanel = document.getElementById('mobilePanel');
  menuToggle.addEventListener('click', () => {
    const open = mobilePanel.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // cursor glow in hero
  const heroSection = document.getElementById('heroSection');
  const cursorGlow = document.getElementById('cursorGlow');
  if(heroSection && window.matchMedia('(pointer:fine)').matches){
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      cursorGlow.style.setProperty('--mx', x + '%');
      cursorGlow.style.setProperty('--my', y + '%');
    });
  }

  // countdown timers
  function formatTime(totalSeconds){
    totalSeconds = Math.max(0, totalSeconds);
    const h = Math.floor(totalSeconds/3600);
    const m = Math.floor((totalSeconds%3600)/60);
    const s = Math.floor(totalSeconds%60);
    return [h,m,s].map(v => String(v).padStart(2,'0')).join(':');
  }
  const timers = document.querySelectorAll('[data-countdown]');
  const states = Array.from(timers).map(el => ({
    el,
    remaining: parseInt(el.dataset.countdown, 10) * 60
  }));
  function tick(){
    states.forEach(st => {
      st.remaining = Math.max(0, st.remaining - 1);
      st.el.textContent = formatTime(st.remaining);
    });
  }
  setInterval(tick, 1000);

  // ---- deals filtering: category tabs + hero city search work together ----
  const filterBtns = document.querySelectorAll('.filter-btn');
  const tiles = document.querySelectorAll('.deal-tile');
  const dealsSection = document.getElementById('deals');
  const citySelect = document.getElementById('citySelect');
  const findDealsBtn = document.getElementById('findDealsBtn');
  const cityResult = document.getElementById('cityResult');
  const cityResultText = document.getElementById('cityResultText');
  const clearCityFilter = document.getElementById('clearCityFilter');
  const emptyState = document.getElementById('emptyState');
  const emptyCity = document.getElementById('emptyCity');
  const emptyStateClear = document.getElementById('emptyStateClear');

  let activeCategory = 'all';
  let activeCity = null;

  function applyFilters(){
    let anyVisible = false;
    tiles.forEach(tile => {
      const catMatch = activeCategory === 'all' || tile.dataset.cat === activeCategory;
      const cityMatch = !activeCity || tile.dataset.city === activeCity;
      const visible = catMatch && cityMatch;
      tile.style.display = visible ? '' : 'none';
      if(visible) anyVisible = true;
    });
    emptyState.hidden = anyVisible;
    if(!anyVisible){
      emptyCity.textContent = activeCity || 'this category';
    }
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.filter;
      applyFilters();
    });
  });

  function searchCity(city){
    activeCity = city;
    activeCategory = 'all';
    filterBtns.forEach(b => b.classList.toggle('active', b.dataset.filter === 'all'));
    if(citySelect) citySelect.value = city;
    dealsSection.hidden = false;
    cityResult.hidden = false;
    cityResultText.innerHTML = `Showing tonight's drops in <strong>${city}</strong>`;
    applyFilters();
    dealsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  document.querySelectorAll('.js-citygate[data-city]').forEach(card => {
    card.addEventListener('click', () => searchCity(card.dataset.city));
  });

  function clearCity(){
    activeCity = null;
    cityResult.hidden = true;
    applyFilters();
  }

  if(findDealsBtn && citySelect){
    findDealsBtn.addEventListener('click', () => searchCity(citySelect.value));
  }
  document.querySelectorAll('.city-chip[data-city]').forEach(chip => {
    chip.addEventListener('click', () => searchCity(chip.dataset.city));
  });
  if(clearCityFilter){ clearCityFilter.addEventListener('click', clearCity); }
  if(emptyStateClear){ emptyStateClear.addEventListener('click', clearCity); }

  // faq accordion
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(o => {
        o.classList.remove('open');
        o.querySelector('.faq-a').style.maxHeight = null;
        o.querySelector('.faq-q').setAttribute('aria-expanded','false');
      });
      if(!isOpen){
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
        q.setAttribute('aria-expanded','true');
      }
    });
  });

  // reveal on scroll
  const revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  // ---- modals: waitlist (Get the app) + partner (Become a partner) ----
  let lastFocusedEl = null;

  function openModal(id){
    const overlay = document.getElementById(id);
    if(!overlay) return;
    lastFocusedEl = document.activeElement;
    overlay.hidden = false;
    const firstField = overlay.querySelector('input, select, button.modal-close');
    if(firstField) firstField.focus();
    document.body.style.overflow = 'hidden';
  }

  function closeModal(id){
    const overlay = document.getElementById(id);
    if(!overlay) return;
    overlay.hidden = true;
    document.body.style.overflow = '';
    if(lastFocusedEl) lastFocusedEl.focus();
  }

  // open triggers
  document.querySelectorAll('.js-waitlist').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      openModal('waitlistModal');
    });
  });
  document.querySelectorAll('.js-partner').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      openModal('partnerModal');
    });
  });

  // close triggers: X buttons, overlay background click, data-close-modal buttons, Escape
  document.getElementById('waitlistCloseBtn').addEventListener('click', () => closeModal('waitlistModal'));
  document.getElementById('partnerCloseBtn').addEventListener('click', () => closeModal('partnerModal'));
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
  });
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if(e.target === overlay) closeModal(overlay.id);
    });
  });
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape'){
      document.querySelectorAll('.modal-overlay').forEach(overlay => {
        if(!overlay.hidden) closeModal(overlay.id);
      });
    }
  });

  // waitlist form submit -> show success state
  document.getElementById('waitlistForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('waitlistEmail').value;
  const city = document.getElementById('waitlistCity').value;

  await fetch('/api/waitlist', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      Name: '',
      Email: email,
      City: city,
      Source: 'Website'
    })
  });

  document.getElementById('waitlistFormView').hidden = true;
  document.getElementById('waitlistSuccessView').hidden = false;
});
    e.preventDefault();
    const city = document.getElementById('waitlistCity').value;
    document.getElementById('waitlistFormView').hidden = true;
    document.getElementById('waitlistSuccessView').hidden = false;
    document.getElementById('waitlistSuccessText').textContent =
      city ? `We'll email you the moment Fursa opens in ${city}.` : `We'll email you the moment Fursa opens near you.`;
  });

  // partner form submit -> show success state
  document.getElementById('partnerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const venue = document.getElementById('partnerVenue').value;
    document.getElementById('partnerFormView').hidden = true;
    document.getElementById('partnerSuccessView').hidden = false;
    document.getElementById('partnerSuccessText').textContent =
      `Thanks${venue ? ' from ' + venue : ''} — our partnerships team will reach out within one business day with rates and next steps.`;
  });

  // reset modals to their form view each time they're reopened
  function resetModal(formViewId, successViewId, formId){
    document.getElementById(formViewId).hidden = false;
    document.getElementById(successViewId).hidden = true;
    document.getElementById(formId).reset();
  }
  document.getElementById('waitlistCloseBtn').addEventListener('click', () => resetModal('waitlistFormView','waitlistSuccessView','waitlistForm'));
  document.getElementById('partnerCloseBtn').addEventListener('click', () => resetModal('partnerFormView','partnerSuccessView','partnerForm'));
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      if(btn.dataset.closeModal === 'waitlistModal') resetModal('waitlistFormView','waitlistSuccessView','waitlistForm');
      if(btn.dataset.closeModal === 'partnerModal') resetModal('partnerFormView','partnerSuccessView','partnerForm');
    });
  });

  // footer newsletter -> inline success message
  const footerNewsletter = document.getElementById('footerNewsletter');
  if(footerNewsletter){
    footerNewsletter.addEventListener('submit', (e) => {
      e.preventDefault();
      footerNewsletter.hidden = true;
      document.getElementById('footerNewsletterSuccess').hidden = false;
    });
  }

  // ---- info modal: About / Careers / Press / Terms / Privacy / Cancellation ----
  const infoContent = {
    about: {
      title: "About Fursa",
      body: "Fursa (فرصة — Arabic for \u201copportunity\u201d) connects people with last-minute luxury that would otherwise go unsold. Five-star hotels, resorts, spas and restaurants across Egypt and the Gulf release unbooked rooms, tables and treatment slots the same day, priced for the fact that empty inventory earns nothing. We started in Cairo and have since expanded to Alexandria, the North Coast, El Gouna, Sharm El Sheikh, Hurghada, Dubai, Riyadh and Doha. ",
      title_ar: "عن فرصة",
      body_ar: "فرصة تربط الناس بفخامة اللحظة الأخيرة التي كانت ستبقى دون بيع. فنادق ومنتجعات ومراكز سبا ومطاعم خمس نجوم في مصر والخليج تطرح غرفها وطاولاتها ومواعيدها غير المحجوزة في نفس اليوم، بسعر يعكس أن المخزون الفارغ لا يُدر شيئاً. بدأنا في القاهرة وتوسّعنا منذ ذلك الحين إلى الإسكندرية والساحل الشمالي والجونة وشرم الشيخ والغردقة ودبي والرياض والدوحة. ملاحظة: هذه الصفحة تصميم مفاهيمي، وليست خدمة حجز فعلية بعد."
    },
    careers: {
      title: "Careers at Fursa",
      body: "We're not running public job listings yet, but we're always glad to hear from people who care about hospitality, travel tech, or building for the Middle East market. Send your CV and a short note and we'll keep it on file for when roles open up.",
      actionText: "Email hello@fursadeals.com",
      actionHref: "mailto:hello@fursadeals.com",
      title_ar: "الوظائف في فرصة",
      body_ar: "لا توجد لدينا إعلانات وظائف عامة بعد، لكننا دائماً سعداء بالتواصل مع من يهتم بالضيافة أو تقنية السفر أو البناء لسوق الشرق الأوسط. أرسل سيرتك الذاتية مع نبذة قصيرة وسنحتفظ بها لحين توفر الفرص.",
      actionText_ar: "راسلنا على hello@fursadeals.com"
    },
    press: {
      title: "Press & media",
      body: "For interview requests, brand assets, or comment on same-day luxury travel in the region, reach out and our team will get back to you.",
      actionText: "Email hello@fursadeals.com",
      actionHref: "mailto:hello@fursadeals.com",
      title_ar: "الإعلام والصحافة",
      body_ar: "لطلبات المقابلات أو ملفات العلامة التجارية أو التعليق على فخامة السفر في نفس اليوم بالمنطقة، تواصل معنا وسيردّ عليك فريقنا.",
      actionText_ar: "راسلنا على hello@fursadeals.com"
    },
    terms: {
      title: "Terms of service",
      body: "This is a concept design, so a full legal terms document hasn't been published yet. In short: bookings would be confirmed instantly on payment, prices shown include tax and service unless stated otherwise, and same-day deals are final except where a venue can't honor a reservation.",
      title_ar: "شروط الخدمة",
      body_ar: "هذا تصميم مفاهيمي، لذا لم تُنشر بعد وثيقة شروط قانونية كاملة. باختصار: تُؤكَّد الحجوزات فوراً عند الدفع، والأسعار المعروضة تشمل الضريبة والخدمة ما لم يُذكر خلاف ذلك، وعروض نفس اليوم نهائية إلا في حال تعذّر على المنشأة الوفاء بالحجز."
    },
    privacy: {
      title: "Privacy",
      body: "Fursa would only collect what's needed to confirm a booking — name, contact details, and payment processed through a licensed provider — and would never sell personal data to third parties. A full privacy policy will publish before launch.",
      title_ar: "الخصوصية",
      body_ar: "تجمع فرصة فقط ما يلزم لتأكيد الحجز — الاسم وبيانات التواصل، والدفع يُعالج عبر مزود مرخّص — ولن تبيع البيانات الشخصية لأي طرف ثالث أبداً. ستُنشر سياسة خصوصية كاملة قبل الإطلاق."
    },
    cancellation: {
      title: "Cancellation policy",
      body: "Same-day deals are sold at a steep discount specifically because they're final — once confirmed, they can't be cancelled for a refund. The one exception: if a venue is unable to honor your reservation, you're refunded automatically and in full.",
      title_ar: "سياسة الإلغاء",
      body_ar: "تُباع عروض نفس اليوم بخصم كبير تحديداً لأنها نهائية — بعد التأكيد، لا يمكن إلغاؤها لاسترداد المبلغ. الاستثناء الوحيد: إذا تعذّر على المنشأة الوفاء بحجزك، يُرد لك المبلغ تلقائياً وبالكامل."
    }
  };

  function openInfo(key){
    const data = infoContent[key];
    if(!data) return;
    const isAr = document.body.classList.contains('lang-ar');
    document.getElementById('infoModalTitle').textContent = isAr ? data.title_ar : data.title;
    document.getElementById('infoModalBody').textContent = isAr ? data.body_ar : data.body;
    const actionEl = document.getElementById('infoModalAction');
    if(data.actionText && data.actionHref){
      actionEl.textContent = isAr && data.actionText_ar ? data.actionText_ar : data.actionText;
      actionEl.href = data.actionHref;
      actionEl.style.display = 'block';
    } else {
      actionEl.style.display = 'none';
    }
    openModal('infoModal');
  }

  document.querySelectorAll('.js-info').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      openInfo(el.dataset.info);
    });
  });
  document.getElementById('infoCloseBtn').addEventListener('click', () => closeModal('infoModal'));

  // ---- footer city links reuse the same city search as the hero ----
  document.querySelectorAll('.js-footer-city').forEach(btn => {
    btn.addEventListener('click', () => searchCity(btn.dataset.city));
  });

  // ---- AI chat widget ----
  const chatFabBtn = document.getElementById('chatFabBtn');
  const chatPanel = document.getElementById('chatPanel');
  const chatCloseBtn = document.getElementById('chatCloseBtn');
  const chatMessages = document.getElementById('chatMessages');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatSendBtn = document.getElementById('chatSendBtn');

  let chatHistory = [];
  let chatIsOpen = false;

  function toggleChat(open){
    chatIsOpen = open;
    chatPanel.hidden = !open;
    if(open) chatInput.focus();
  }
  chatFabBtn.addEventListener('click', () => toggleChat(!chatIsOpen));
  chatCloseBtn.addEventListener('click', () => toggleChat(false));

  function appendChatMessage(role, text){
    const div = document.createElement('div');
    div.className = 'chat-msg ' + (role === 'user' ? 'user' : 'bot');
    div.textContent = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function showTyping(){
    const t = document.createElement('div');
    t.className = 'chat-typing';
    t.id = 'chatTypingIndicator';
    t.innerHTML = '<span></span><span></span><span></span>';
    chatMessages.appendChild(t);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  function hideTyping(){
    const t = document.getElementById('chatTypingIndicator');
    if(t) t.remove();
  }

  const FURSA_SYSTEM_PROMPT = "You are the friendly customer support assistant embedded on the Fursa website. Fursa (\u0641\u0631\u0635\u0629, Arabic for \u2018opportunity\u2019) is a concept for a same-day luxury deals marketplace covering Cairo, Alexandria, North Coast, El Gouna, Sharm El Sheikh, Hurghada, Dubai, Riyadh and Doha. It lets people book discounted last-minute rooms at hotels and resorts, spa and wellness treatments, restaurant tables, and experiences (desert camps, boat trips, day passes) at verified 4-star-and-above venues, with bookings normally confirmed in under 90 seconds. Same-day deals are final, but customers are refunded automatically if a venue can't honor a booking. Hotels, spas and restaurants can become partners and list unsold inventory; Fursa takes a commission per booking. This particular page is a design concept and demo, not a live booking system. Keep answers short, warm and concrete, usually 1 to 4 sentences. If someone asks something unrelated to Fursa, gently steer the conversation back to how you can help with the app.";

  // ---- reliable local fallback: used whenever the live API call can't be reached ----
  // (the live fetch only succeeds while this file is being previewed inside Claude's own
  // interface; once downloaded or hosted elsewhere there's no backend to call, so this
  // keyword-matched knowledge base keeps the bot useful everywhere, every time.)
  const FURSA_LOCAL_FAQ = [
    { keywords: ['discount','cheap','why so low','deep','price drop'],
      reply: "A room or table that goes unsold tonight earns a venue nothing, so partners would rather sell that same capacity at a steep discount than lose it entirely. That's the whole model — no catch." },
    { keywords: ['city','cities','where','location','cairo','alexandria','dubai','riyadh','doha','sharm','hurghada','gouna','coast'],
      reply: "Fursa covers Cairo, Alexandria, the North Coast, El Gouna, Sharm El Sheikh and Hurghada, and we're live in Dubai, Riyadh and Doha as we expand across the Gulf." },
    { keywords: ['confirm','fast','how long','instant','speed'],
      reply: "Most reservations would confirm in under 90 seconds, since Fursa connects directly to each venue's live availability rather than a manual callback." },
    { keywords: ['cancel','refund','change my booking','reschedule'],
      reply: "Same-day deals are sold at a steep discount specifically because they're final — but if a venue can't honor your reservation, you'd be refunded automatically and in full." },
    { keywords: ['real','genuine','legit','scam','fake','trust'],
      reply: "Every listing would come from a verified 4-star-and-above partner venue. Worth noting: this particular site is a design concept and demo, so no bookings or charges are actually being made right now." },
    { keywords: ['partner','list my','join as a venue','become a','my hotel','my restaurant','my business'],
      reply: "Hotels, spas and restaurants can list unsold capacity as a partner with no upfront cost — Fursa takes a commission per booking. There's a \"Become a Partner\" button up top that walks through it." },
    { keywords: ['date night','anniversary','proposal','birthday','romantic'],
      reply: "Date Nights is one of our most popular categories — curated two-person packages like dinner + flowers, a spa duo + dinner, or a yacht sail + dinner, built for anniversaries, birthdays and proposals." },
    { keywords: ['what is fursa','about fursa','what do you do','what is this'],
      reply: "Fursa (\u0641\u0631\u0635\u0629 — Arabic for \u201copportunity\u201d) connects people with last-minute luxury that would otherwise go unsold: hotel rooms, spa slots, restaurant tables and experiences across Egypt and the Gulf, released the same day at a steep discount." },
    { keywords: ['contact','support','email','reach','help me','human','speak to someone'],
      reply: "You can reach the team at hello@fursadeals.com, or support@fursadeals.com for anything booking-related." },
    { keywords: ['pay','payment','card','charge','checkout'],
      reply: "Reserve flows through to a payment step in this demo, but it isn't wired to a real processor — no charge is made. A live version would route through a licensed provider like Paymob, Fawry or Stripe." },
    { keywords: ['hi','hello','hey','salam','marhaba'],
      reply: "Hey! I can help with how Fursa works, cities we cover, cancellations, payments, or becoming a partner — what would you like to know?" },
  ];

  function getLocalAnswer(userText){
    const lower = userText.toLowerCase();
    for(const entry of FURSA_LOCAL_FAQ){
      if(entry.keywords.some(k => lower.includes(k))){
        return entry.reply;
      }
    }
    return "I don't have a specific answer for that, but I can help with how bookings work, which cities we cover, cancellations, payment, date night packages, or becoming a partner venue — feel free to ask about any of those.";
  }

  async function sendChatMessage(userText){
    appendChatMessage('user', userText);
    chatHistory.push({ role: 'user', content: userText });
    chatInput.value = '';
    chatSendBtn.disabled = true;
    chatInput.disabled = true;
    showTyping();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: FURSA_SYSTEM_PROMPT,
          messages: chatHistory
        })
      });
      clearTimeout(timeoutId);
      if(!response.ok){
        const errBody = await response.text();
        console.error('Fursa chat API error', response.status, errBody);
        throw new Error('HTTP ' + response.status);
      }
      const data = await response.json();
      hideTyping();
      const textBlock = (data.content || []).find(b => b.type === 'text');
      const replyText = textBlock ? textBlock.text : getLocalAnswer(userText);
      appendChatMessage('bot', replyText);
      chatHistory.push({ role: 'assistant', content: replyText });
    } catch (err) {
      clearTimeout(timeoutId);
      console.error('Fursa chat: live API unavailable, using local fallback —', err);
      hideTyping();
      chatHistory.pop();
      const replyText = getLocalAnswer(userText);
      appendChatMessage('bot', replyText);
      chatHistory.push({ role: 'assistant', content: replyText });
    } finally {
      chatSendBtn.disabled = false;
      chatInput.disabled = false;
      chatInput.focus();
    }
  }

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if(!text) return;
    sendChatMessage(text);
  });

  // Escape also closes the chat panel
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && chatIsOpen) toggleChat(false);
  });

  // ---- reserve modal: event delegation so it covers every deal tile, including future ones ----
  function populateAndOpenReserve(tile){
    const venue = tile.querySelector('.tile-venue')?.textContent || 'This deal';
    const loc = tile.querySelector('.tile-loc')?.textContent || '';
    const tag = tile.querySelector('.cat-tag')?.textContent || '';
    const pct = tile.querySelector('.pct-badge')?.textContent || '';
    const oldPrice = tile.querySelector('.tile-old')?.textContent || '';
    const newPrice = tile.querySelector('.tile-new')?.textContent || '';
    const timerText = tile.querySelector('.tile-timer')?.textContent || '';

    document.getElementById('reserveTag').textContent = tag;
    document.getElementById('reservePct').textContent = pct;
    document.getElementById('reserveVenue').textContent = venue;
    document.getElementById('reserveLoc').textContent = loc;
    document.getElementById('reserveOldPrice').textContent = oldPrice;
    document.getElementById('reserveNewPrice').textContent = newPrice;
    document.getElementById('reserveTimer').textContent = timerText;
    document.getElementById('reserveSuccessText').textContent =
      `Confirmation for ${venue} would normally be sent to your email, along with directions and a QR code for the front desk.`;

    openModal('reserveModal');
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.js-reserve');
    if(!btn) return;
    const tile = btn.closest('.deal-tile');
    if(!tile) return;
    populateAndOpenReserve(tile);
  });

  function resetReserveFlow(){
    document.getElementById('reserveFormView').hidden = false;
    document.getElementById('reservePaymentView').hidden = true;
    document.getElementById('reserveSuccessView').hidden = true;
    document.getElementById('reserveForm').reset();
    document.getElementById('paymentForm').reset();
  }

  document.getElementById('reserveCloseBtn').addEventListener('click', () => closeModal('reserveModal'));
  document.getElementById('reserveCloseBtn').addEventListener('click', resetReserveFlow);
  document.querySelectorAll('[data-close-modal="reserveModal"]').forEach(btn => {
    btn.addEventListener('click', resetReserveFlow);
  });

  // step 1 -> step 2: details captured, move to payment
  document.getElementById('reserveForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const venue = document.getElementById('reserveVenue').textContent;
    const amount = document.getElementById('reserveNewPrice').textContent;
    document.getElementById('paymentVenue').textContent = venue;
    document.getElementById('paymentAmount').textContent = amount;
    document.getElementById('reserveFormView').hidden = true;
    document.getElementById('reservePaymentView').hidden = false;
  });

  document.getElementById('paymentBackBtn').addEventListener('click', () => {
    document.getElementById('reservePaymentView').hidden = true;
    document.getElementById('reserveFormView').hidden = false;
  });

  // payment method toggle: card fields only make sense for "Card"
  const payMethodBtns = document.querySelectorAll('.pay-method');
  const cardFieldsGroup = document.getElementById('cardFieldsGroup');
  const payNowBtn = document.getElementById('payNowBtn');
  payMethodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      payMethodBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const method = btn.dataset.method;
      cardFieldsGroup.style.display = method === 'card' ? '' : 'none';
      payNowBtn.textContent = method === 'cod' ? 'Confirm — pay at venue' : 'Pay now';
    });
  });

  // step 2 -> step 3: "payment" submitted
  document.getElementById('paymentForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const venue = document.getElementById('reserveVenue').textContent;
    const email = document.getElementById('reserveEmail').value;
    document.getElementById('reservePaymentView').hidden = true;
    document.getElementById('reserveSuccessView').hidden = false;
    document.getElementById('reserveSuccessText').innerHTML =
      `We've held ${venue} for you${email ? ' — a confirmation would go to ' + email : ''}, with directions and a QR code for the front desk.<br><span style="font-size:11px; color:var(--muted);">Concept preview — no real charge was made.</span>`;
  });

  // ---- inline waitlist section (separate from the app-download waitlist modal) ----
  const waitlistInlineForm = document.getElementById('waitlistInlineForm');
  if(waitlistInlineForm){
    waitlistInlineForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const city = document.getElementById('waitlistInlineCity').value;
      document.getElementById('waitlistInlineFormView').hidden = true;
      document.getElementById('waitlistInlineSuccessView').hidden = false;
      document.getElementById('waitlistInlineSuccessText').textContent =
        city ? `We'll email you the moment Fursa opens in ${city}.` : `We'll email you the moment Fursa opens near you.`;
    });
  }

  // ---- social proof toast: cycles through recent-booking style messages ----

/* ===== next block ===== */

// =========================================================
  // ARABIC / RTL LANGUAGE ENGINE
  // =========================================================
  const LOCATIONS_AR = {
  "Abu Tig Marina, El Gouna": "مرسى أبو تيج، الجونة",
  "Ain Shams": "عين شمس",
  "Al Fahidi, Dubai": "الفهيدي، دبي",
  "Al Marmoom, Dubai": "المرموم، دبي",
  "Al Nakheel, Riyadh": "النخيل، الرياض",
  "Al Wakrah, Doha": "الوكرة، الدوحة",
  "Alexandria Corniche": "كورنيش الإسكندرية",
  "Alexandria Marina": "مرسى الإسكندرية",
  "Almaza Bay": "خليج الماظة",
  "Almaza Bay, North Coast": "خليج الماظة، الساحل الشمالي",
  "Anfoushi": "الأنفوشي",
  "Anfoushi, Alexandria": "الأنفوشي، الإسكندرية",
  "Business Bay, Dubai": "الخليج التجاري، دبي",
  "Chatby": "شاطبي",
  "Chatby, Alexandria": "شاطبي، الإسكندرية",
  "Dahar, Hurghada": "الدهار، الغردقة",
  "Deira, Dubai": "ديرة، دبي",
  "Diplo": "دبلو",
  "Diplomatic Quarter, Riyadh": "الحي الدبلوماسي، الرياض",
  "Diriyah, Riyadh": "الدرعية، الرياض",
  "Doha Corniche": "كورنيش الدوحة",
  "Dokki": "الدقي",
  "Downtown Cairo": "وسط القاهرة",
  "Downtown Dubai, UAE": "وسط مدينة دبي، الإمارات",
  "Downtown, El Gouna": "وسط البلد، الجونة",
  "Dubai Creek, UAE": "خور دبي، الإمارات",
  "Dubai Marina, UAE": "مرسى دبي، الإمارات",
  "El Ahyaa, Hurghada": "الأحياء، الغردقة",
  "El Gouna, Egypt": "الجونة، مصر",
  "El Mamsha, Hurghada": "الممشى، الغردقة",
  "Fouka Bay": "خليج فوكا",
  "Garden City": "جاردن سيتي",
  "Garden City, Cairo": "جاردن سيتي، القاهرة",
  "Giza Plateau, Cairo": "هضبة الجيزة، القاهرة",
  "Gleem": "جليم",
  "Gleem, Alexandria": "جليم، الإسكندرية",
  "Hacienda Bay": "هاسيندا باي",
  "Hacienda Bay, North Coast": "هاسيندا باي، الساحل الشمالي",
  "Hadaba, Sharm El Sheikh": "الهضبة، شرم الشيخ",
  "Heliopolis": "مصر الجديدة",
  "Heliopolis, Cairo": "مصر الجديدة، القاهرة",
  "Hittin, Riyadh": "حطين، الرياض",
  "Hurghada Marina": "مرسى الغردقة",
  "Hurghada, Egypt": "الغردقة، مصر",
  "JBR, Dubai": "جي بي آر، دبي",
  "Jumeirah, Dubai": "جميرا، دبي",
  "Kafr Abdou": "كفر عبده",
  "Kafr El Gouna": "كفر الجونة",
  "Katara, Doha": "كتارا، الدوحة",
  "Khan El Khalili, Cairo": "خان الخليلي، القاهرة",
  "King Fahd Road, Riyadh": "طريق الملك فهد، الرياض",
  "Kom El Shoqafa, Alexandria": "كوم الشقافة، الإسكندرية",
  "Korba": "كوربة",
  "La Vista": "لافيستا",
  "Lusail, Doha": "لوسيل، الدوحة",
  "Maadi": "المعادي",
  "Maadi, Cairo": "المعادي، القاهرة",
  "Makadi Bay, Hurghada": "مكادي باي، الغردقة",
  "Mangroovy Bay, El Gouna": "خليج مانجروفي، الجونة",
  "Mansheya": "المنشية",
  "Mansheya, Alexandria": "المنشية، الإسكندرية",
  "Marassi": "مراسي",
  "Marassi, North Coast": "مراسي، الساحل الشمالي",
  "Marina, North Coast": "مارينا، الساحل الشمالي",
  "Mohandessin": "المهندسين",
  "Mokattam": "المقطم",
  "Mokattam, Cairo": "المقطم، القاهرة",
  "Montaza, Alexandria": "المنتزه، الإسكندرية",
  "Msheireb, Doha": "مشيرب، الدوحة",
  "Naama Bay, Sharm El Sheikh": "نعمة باي، شرم الشيخ",
  "Nabq Bay, Sharm El Sheikh": "نبق باي، شرم الشيخ",
  "Nasr City": "مدينة نصر",
  "New Cairo": "القاهرة الجديدة",
  "Nile Corniche, Cairo": "كورنيش النيل، القاهرة",
  "North Coast, Egypt": "الساحل الشمالي، مصر",
  "Olaya, Riyadh": "العليا، الرياض",
  "Old Market, Sharm El Sheikh": "السوق القديم، شرم الشيخ",
  "Palm Jumeirah, Dubai": "نخلة جميرا، دبي",
  "Qaitbay": "قايتباي",
  "Qaitbay, Alexandria": "قايتباي، الإسكندرية",
  "Ras Mohammed, Sharm El Sheikh": "رأس محمد، شرم الشيخ",
  "Ras Um Sid, Sharm El Sheikh": "رأس أم سيد، شرم الشيخ",
  "Riyadh Boulevard, Riyadh": "بوليفارد الرياض، الرياض",
  "Roushdy": "الرشدي",
  "Sahl Hasheesh, Hurghada": "سهل حشيش، الغردقة",
  "Sakkala, Hurghada": "السقالة، الغردقة",
  "Sealine, Doha": "سيلاين، الدوحة",
  "Shark's Bay, Sharm El Sheikh": "شارك باي، شرم الشيخ",
  "Sidi Abdel Rahman": "سيدي عبد الرحمن",
  "Sidi Bishr": "سيدي بشر",
  "Sinai Desert, Sharm El Sheikh": "صحراء سيناء، شرم الشيخ",
  "Smouha": "سموحة",
  "Soho Square, Sharm El Sheikh": "سوهو سكوير، شرم الشيخ",
  "Soma Bay, Hurghada": "سوما باي، الغردقة",
  "Souq Waqif, Doha": "سوق واقف، الدوحة",
  "Stanley": "ستانلي",
  "Stanley, Alexandria": "ستانلي، الإسكندرية",
  "Tahlia Street, Riyadh": "شارع التحلية، الرياض",
  "Tawila, El Gouna": "الطويلة، الجونة",
  "Telal": "تلال",
  "Telal, North Coast": "تلال، الساحل الشمالي",
  "The Pearl, Doha": "اللؤلؤة، الدوحة",
  "Tuwaiq, Riyadh": "طويق، الرياض",
  "West Bay, Doha": "الخليج الغربي، الدوحة",
  "White House, El Gouna": "الفيلا البيضاء، الجونة",
  "Zamalek": "الزمالك",
  "Zamalek, Cairo": "الزمالك، القاهرة",
  "Zeytouna Island, El Gouna": "جزيرة الزيتونة، الجونة",
  "Cairo": "القاهرة",
  "Alexandria": "الإسكندرية",
  "North Coast": "الساحل الشمالي",
  "El Gouna": "الجونة",
  "Sharm El Sheikh": "شرم الشيخ",
  "Sharm": "شرم الشيخ",
  "Hurghada": "الغردقة",
  "Dubai": "دبي",
  "Riyadh": "الرياض",
  "Doha": "الدوحة"
};
  const CAT_TAGS_AR = {
  "Hotel": "فندق",
  "Resort": "منتجع",
  "Spa": "سبا",
  "Restaurant": "مطعم",
  "Experience": "تجربة",
  "Date Night": "ليلة رومانسية"
};
  // sorted longest-first so "Zamalek, Cairo" matches before bare "Cairo"
  const LOCATION_KEYS_SORTED = Object.keys(LOCATIONS_AR).sort((a,b) => b.length - a.length);

  const EASTERN_DIGITS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
  function toEasternDigits(str){
    return String(str).replace(/[0-9]/g, d => EASTERN_DIGITS[+d]);
  }

  function cacheHTML(el){
    if(el.dataset.enHtml === undefined) el.dataset.enHtml = el.innerHTML;
    return el.dataset.enHtml;
  }

  function translatePlaceString(html){
    for(const key of LOCATION_KEYS_SORTED){
      if(html.includes(key)){
        return html.split(key).join(LOCATIONS_AR[key]);
      }
    }
    return html;
  }

  function applyCatalogTranslation(isAr){
    // venue location / city strings across tiles
    document.querySelectorAll('.tile-loc, .deal-city').forEach(el => {
      const original = cacheHTML(el);
      el.innerHTML = isAr ? translatePlaceString(original) : original;
    });
    // category tags
    document.querySelectorAll('.cat-tag').forEach(el => {
      const original = cacheHTML(el);
      el.innerHTML = isAr ? (CAT_TAGS_AR[original] || original) : original;
    });
    // percentage-off badges (runs after the above so nested .pct spans inside
    document.querySelectorAll('.pct-badge, .deal-pct').forEach(el => {
      const original = cacheHTML(el);
      if(!isAr){ el.innerHTML = original; return; }
      const m = original.match(/(\d+)%\s*off/i);
      el.innerHTML = m ? ('خصم ٪' + toEasternDigits(m[1])) : original;
    });
    // the 450 reserve buttons
    document.querySelectorAll('.reserve-btn').forEach(el => {
      const original = cacheHTML(el);
      el.innerHTML = isAr ? 'احجز' : original;
    });
  }

  function applyChromeTranslation(isAr){
    document.querySelectorAll('[data-ar]').forEach(el => {
      if(el.dataset.en === undefined) el.dataset.en = el.textContent;
      el.textContent = isAr ? el.dataset.ar : el.dataset.en;
    });
    document.querySelectorAll('[data-ar-html]').forEach(el => {
      if(el.dataset.enHtmlFull === undefined) el.dataset.enHtmlFull = el.innerHTML;
      el.innerHTML = isAr ? el.dataset.arHtml : el.dataset.enHtmlFull;
    });
    document.querySelectorAll('[data-ar-placeholder]').forEach(el => {
      if(el.dataset.enPlaceholder === undefined) el.dataset.enPlaceholder = el.placeholder;
      el.placeholder = isAr ? el.dataset.arPlaceholder : el.dataset.enPlaceholder;
    });
  }

  let currentLang = 'en';
  function setLanguage(lang){
    currentLang = lang;
    const isAr = lang === 'ar';
    document.documentElement.lang = isAr ? 'ar' : 'en';
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    document.body.classList.toggle('lang-ar', isAr);
    applyChromeTranslation(isAr);
    applyCatalogTranslation(isAr);
    const btnLabel = isAr ? 'English' : 'عربي';
    const lb1 = document.getElementById('langToggleBtn');
    const lb2 = document.getElementById('langToggleBtnMobile');
    if(lb1) lb1.textContent = btnLabel;
    if(lb2) lb2.textContent = btnLabel;
  }

  document.getElementById('langToggleBtn').addEventListener('click', () => setLanguage(currentLang === 'ar' ? 'en' : 'ar'));
  document.getElementById('langToggleBtnMobile').addEventListener('click', () => setLanguage(currentLang === 'ar' ? 'en' : 'ar'));

/* ===== next block ===== */

// =========================================================
  // DEAL DETAIL VIEW — gallery, amenities, highlights, lightbox
  // =========================================================
  const AMENITIES_BY_CAT = {
    hotels: { en:["Free WiFi","Pool access","Breakfast included","Late checkout","Air conditioning","Valet parking"],
               ar:["واي فاي مجاني","دخول حمام السباحة","فطور مشمول","تسجيل خروج متأخر","تكييف هواء","خدمة صف السيارات"] },
    spas: { en:["Private treatment room","Steam & sauna access","Robe & slippers","Herbal tea lounge","Air conditioning","Free WiFi"],
            ar:["غرفة علاج خاصة","دخول الساونا والبخار","روب وشبشب","ركن شاي أعشاب","تكييف هواء","واي فاي مجاني"] },
    dining: { en:["Outdoor seating","Valet parking","Tasting menu","Air conditioning","Wheelchair accessible","Free WiFi"],
              ar:["جلسة خارجية","خدمة صف السيارات","قائمة تذوق","تكييف هواء","مناسب لذوي الإعاقة","واي فاي مجاني"] },
    experiences: { en:["Hotel pickup available","Equipment included","Professional guide","Refreshments included","Photos included"],
                   ar:["تواصل من الفندق متاح","المعدات مشمولة","مرشد محترف","مرطبات مشمولة","صور مشمولة"] },
    datenight: { en:["Private table","Welcome drink","Dress code: smart casual","Late checkout","Complimentary dessert"],
                 ar:["طاولة خاصة","مشروب ترحيبي","زي: كاجوال أنيق","تسجيل خروج متأخر","حلوى مجانية"] },
  };
  const INCLUDED_BY_CAT = {
    hotels: { en:"Room or suite for the stated dates, all taxes and service charges, and access to listed hotel facilities during your stay.",
              ar:"الغرفة أو الجناح للتواريخ المحددة، شاملة الضرائب ورسوم الخدمة، مع إمكانية استخدام مرافق الفندق المُدرجة خلال إقامتك." },
    spas: { en:"The full treatment as described, use of spa facilities before and after your session, and any products used during treatment.",
            ar:"العلاج الكامل كما هو موضح، مع إمكانية استخدام مرافق السبا قبل وبعد الجلسة، وأي منتجات تُستخدم أثناء العلاج." },
    dining: { en:"The stated menu or tasting experience for your party size, taxes and service charge, and your reserved table for the seating time shown.",
              ar:"القائمة أو تجربة التذوق المحددة لعدد أفراد مجموعتك، شاملة الضرائب ورسوم الخدمة، مع طاولتك المحجوزة لموعد الجلوس المُحدد." },
    experiences: { en:"The activity or access described, any equipment or guiding listed, and entry fees where applicable.",
                   ar:"النشاط أو الدخول الموضح، مع أي معدات أو إرشاد مُدرج، ورسوم الدخول حيثما ينطبق ذلك." },
    datenight: { en:"Both components of the package as described, taxes and service charge, and any welcome extras listed for the experience.",
                 ar:"كلا عنصري الباقة كما هو موضح، شاملة الضرائب ورسوم الخدمة، وأي إضافات ترحيبية مُدرجة للتجربة." },
  };
  const HIGHLIGHTS_BY_CAT = {
    hotels: { en:["Confirmed instantly, no waiting on a callback","Same room category as a full-price guest","Free cancellation if the venue can't honor it"],
              ar:["تأكيد فوري، بدون انتظار اتصال","نفس فئة الغرفة كأي ضيف بسعر كامل","إلغاء مجاني إذا تعذّر على المنشأة الوفاء بالحجز"] },
    spas: { en:["Confirmed instantly with the spa","Same therapist and treatment standard as full price","Free cancellation if the venue can't honor it"],
            ar:["تأكيد فوري مع السبا","نفس المعالج ومستوى العلاج بالسعر الكامل","إلغاء مجاني إذا تعذّر على المنشأة الوفاء بالحجز"] },
    dining: { en:["Confirmed instantly with the restaurant","Same kitchen and menu as any full-price table","Free cancellation if the venue can't honor it"],
              ar:["تأكيد فوري مع المطعم","نفس المطبخ والقائمة كأي طاولة بسعر كامل","إلغاء مجاني إذا تعذّر على المنشأة الوفاء بالحجز"] },
    experiences: { en:["Confirmed instantly with the operator","Same experience standard as full price","Free cancellation if the venue can't honor it"],
                   ar:["تأكيد فوري مع المشغّل","نفس مستوى التجربة بالسعر الكامل","إلغاء مجاني إذا تعذّر على المنشأة الوفاء بالحجز"] },
    datenight: { en:["Confirmed instantly across both venues","Same standard as booking each part separately at full price","Free cancellation if a venue can't honor it"],
                 ar:["تأكيد فوري في كلا المكانين","نفس المستوى كحجز كل جزء منفصلاً بالسعر الكامل","إلغاء مجاني إذا تعذّر على إحدى المنشأتين الوفاء بالحجز"] },
  };
  const CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"/></svg>';
  const STAR_SVG = '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.1 6.6.6-5 4.5 1.5 6.6L12 16.9l-5.9 3.4L7.6 13.7l-5-4.5 6.6-.6L12 2.5Z"/></svg>';

  // deterministic rating + review count derived from the venue name —
  // not a real review average, but consistent every time the same venue is shown
  function venueRatingFor(venueName){
    let h = 0;
    for(let i = 0; i < venueName.length; i++){ h = (h * 31 + venueName.charCodeAt(i)) >>> 0; }
    const rating = (4.5 + (h % 5) / 10).toFixed(1);
    const reviews = 60 + (h % 390);
    return { rating, reviews };
  }

  document.querySelectorAll('.deal-tile').forEach(tile => {
    const venueEl = tile.querySelector('.tile-venue');
    const locEl = tile.querySelector('.tile-loc');
    if(!venueEl || !locEl) return;
    const { rating, reviews } = venueRatingFor(venueEl.textContent);
    const ratingEl = document.createElement('div');
    ratingEl.className = 'tile-rating';
    ratingEl.innerHTML = STAR_SVG + `<span>${rating} (${reviews})</span>`;
    locEl.after(ratingEl);
  });

  let detailGalleryIndex = 0;
  const GALLERY_FRAME_COUNT = 5;

  function buildGalleryFrames(cat){
    const track = document.getElementById('detailGalleryTrack');
    const dots = document.getElementById('detailGalleryDots');
    track.innerHTML = '';
    dots.innerHTML = '';
    for(let i = 0; i < GALLERY_FRAME_COUNT; i++){
      const frame = document.createElement('div');
      frame.className = 'gallery-frame cat-' + cat;
      track.appendChild(frame);
      const dot = document.createElement('span');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => setGalleryIndex(i));
      dots.appendChild(dot);
    }
    detailGalleryIndex = 0;
    updateGalleryPosition();
  }

  function setGalleryIndex(i){
    detailGalleryIndex = ((i % GALLERY_FRAME_COUNT) + GALLERY_FRAME_COUNT) % GALLERY_FRAME_COUNT;
    updateGalleryPosition();
  }

  function updateGalleryPosition(){
    const track = document.getElementById('detailGalleryTrack');
    const isAr = document.body.classList.contains('lang-ar');
    const sign = isAr ? 1 : -1;
    track.style.transform = `translateX(${sign * detailGalleryIndex * 100}%)`;
    document.getElementById('detailGalleryCounter').textContent = `${detailGalleryIndex + 1} / ${GALLERY_FRAME_COUNT}`;
    document.querySelectorAll('#detailGalleryDots .dot').forEach((d, idx) => d.classList.toggle('active', idx === detailGalleryIndex));
    if(!document.getElementById('lightboxOverlay').hidden) renderLightboxFrame();
  }

  document.getElementById('detailGalleryPrev').addEventListener('click', () => setGalleryIndex(detailGalleryIndex - 1));
  document.getElementById('detailGalleryNext').addEventListener('click', () => setGalleryIndex(detailGalleryIndex + 1));

  // swipe support
  (function(){
    let startX = null;
    const vp = document.getElementById('detailGalleryViewport');
    vp.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, {passive:true});
    vp.addEventListener('touchend', (e) => {
      if(startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      const isAr = document.body.classList.contains('lang-ar');
      if(Math.abs(dx) > 40){
        const dir = dx < 0 ? 1 : -1;
        setGalleryIndex(detailGalleryIndex + (isAr ? -dir : dir));
      }
      startX = null;
    });
  })();

  // fullscreen lightbox
  function renderLightboxFrame(){
    const frame = document.getElementById('lightboxFrame');
    const catClass = Array.from(document.querySelectorAll('#detailGalleryTrack .gallery-frame')[detailGalleryIndex]?.classList || [])
      .find(c => c.startsWith('cat-'));
    frame.className = 'lightbox-frame gallery-frame ' + (catClass || '');
  }
  document.getElementById('detailGalleryExpand').addEventListener('click', () => {
    renderLightboxFrame();
    document.getElementById('lightboxOverlay').hidden = false;
  });
  document.getElementById('lightboxCloseBtn').addEventListener('click', () => { document.getElementById('lightboxOverlay').hidden = true; });
  document.getElementById('lightboxOverlay').addEventListener('click', (e) => {
    if(e.target.id === 'lightboxOverlay') document.getElementById('lightboxOverlay').hidden = true;
  });
  document.getElementById('lightboxPrev').addEventListener('click', () => setGalleryIndex(detailGalleryIndex - 1));
  document.getElementById('lightboxNext').addEventListener('click', () => setGalleryIndex(detailGalleryIndex + 1));
  document.addEventListener('keydown', (e) => {
    if(document.getElementById('lightboxOverlay').hidden) return;
    if(e.key === 'Escape') document.getElementById('lightboxOverlay').hidden = true;
    if(e.key === 'ArrowLeft') setGalleryIndex(detailGalleryIndex - 1);
    if(e.key === 'ArrowRight') setGalleryIndex(detailGalleryIndex + 1);
  });

  // open detail view from a tile click (but not when clicking the Reserve button itself)
  document.addEventListener('click', (e) => {
    if(e.target.closest('.js-reserve')) return;
    const tile = e.target.closest('.deal-tile');
    if(!tile) return;

    const cat = tile.dataset.cat;
    const venue = tile.querySelector('.tile-venue')?.textContent || '';
    const loc = tile.querySelector('.tile-loc')?.textContent || '';
    const oldPrice = tile.querySelector('.tile-old')?.textContent || '';
    const newPrice = tile.querySelector('.tile-new')?.textContent || '';
    const pct = tile.querySelector('.pct-badge')?.textContent || '';
    const timerText = tile.querySelector('.tile-timer')?.textContent || '';
    const isAr = document.body.classList.contains('lang-ar');
    const langKey = isAr ? 'ar' : 'en';

    document.getElementById('detailVenue').textContent = venue;
    document.getElementById('detailLoc').textContent = loc;
    const { rating, reviews } = venueRatingFor(venue);
    document.getElementById('detailRatingText').textContent = `${rating} (${reviews})`;
    document.getElementById('detailOldPrice').textContent = oldPrice;
    document.getElementById('detailNewPrice').textContent = newPrice;
    document.getElementById('detailPct').textContent = pct;
    document.getElementById('detailTimer').textContent = timerText;
    document.getElementById('detailMapLabel').textContent = loc;

    const amenities = (AMENITIES_BY_CAT[cat] || AMENITIES_BY_CAT.hotels)[langKey];
    document.getElementById('detailAmenities').innerHTML = amenities.map(a => `<span class="amenity-tag">${a}</span>`).join('');

    document.getElementById('detailIncluded').textContent = (INCLUDED_BY_CAT[cat] || INCLUDED_BY_CAT.hotels)[langKey];

    const highlights = (HIGHLIGHTS_BY_CAT[cat] || HIGHLIGHTS_BY_CAT.hotels)[langKey];
    document.getElementById('detailHighlights').innerHTML = highlights.map(h => `<li>${CHECK_SVG}<span>${h}</span></li>`).join('');

    buildGalleryFrames(cat);

    // reserve button inside the detail view reuses the same reservation logic
    const reserveBtn = document.querySelector('.js-detail-reserve');
    reserveBtn.onclick = () => {
      closeModal('detailModal');
      populateAndOpenReserve(tile);
    };

    openModal('detailModal');
  });

  document.getElementById('detailCloseBtn').addEventListener('click', () => closeModal('detailModal'));
