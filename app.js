const ENERGY_FILTERS = ['Tất cả','Lửa','Nước','Đất','Khí','Hành tinh','Thần linh','Tình yêu','Tiền bạc','Bảo hộ','Thử thách'];
const mainCards = (window.TAROT_CARDS || []).map(card => ({...card, deck:'main', uid:'main-'+card.id, displayNumber:'Lá '+String(card.id).padStart(2,'0'), sectionLabel:'Mục 1'}));
const planetaryCards = (window.PLANETARY_CARDS || []).map(card => ({...card, deck:'planetary', uid:'planetary-'+card.id, displayNumber:'Mục 2 - Lá '+String(card.id).padStart(2,'0'), sectionLabel:'Mục 2'}));
const birthCards = (window.BIRTH_YEAR_CARDS || []).map(card => ({...card, deck:'birth', uid:'birth-'+card.id, displayNumber:'Mục 3 - Lá '+String(card.id).padStart(2,'0'), sectionLabel:'Mục 3'}));
const zodiacCards = (window.ZODIAC_YEAR_CARDS || []).map(card => ({...card, deck:'zodiac', uid:'zodiac-'+card.id, displayNumber:'Mục 4 - Lá '+String(card.id).padStart(2,'0'), sectionLabel:'Mục 4'}));
const state = { query:'', filter:'Tất cả', lang:'vi', activeCard:null, mainCards, planetaryCards, birthCards, zodiacCards, allCards:[...mainCards, ...planetaryCards, ...birthCards, ...zodiacCards] };
const els = { grid:document.querySelector('#cardGrid'), planetGrid:document.querySelector('#planetGrid'), search:document.querySelector('#searchInput'), filterBar:document.querySelector('#filterBar'), count:document.querySelector('#visibleCount'), mainCount:document.querySelector('#mainCount'), planetaryCount:document.querySelector('#planetaryCount'), birthCount:document.querySelector('#birthCount'), zodiacCount:document.querySelector('#zodiacCount'), energyResults:document.querySelector('#energyResults'), energyResultsTitle:document.querySelector('#energyResultsTitle'), energyResultsCount:document.querySelector('#energyResultsCount'), energyResultsGrid:document.querySelector('#energyResultsGrid'), empty:document.querySelector('#emptyState'), mainToc:document.querySelector('#mainToc'), planetaryToc:document.querySelector('#planetaryToc'), birthToc:document.querySelector('#birthToc'), zodiacToc:document.querySelector('#zodiacToc'), birthGrid:document.querySelector('#birthGrid'), zodiacGrid:document.querySelector('#zodiacGrid'), modal:document.querySelector('#detailModal'), modalImage:document.querySelector('#modalImage'), modalNumber:document.querySelector('#modalNumber'), modalTitle:document.querySelector('#modalTitle'), modalSubtitle:document.querySelector('#modalSubtitle'), modalEnergy:document.querySelector('#modalEnergy'), modalBody:document.querySelector('#modalBody') };
function escapeHtml(value){ return String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char])); }
function normalize(value){ return String(value ?? '').toLocaleLowerCase('vi-VN'); }
const UI_TEXT = {
  vi: {
    search:'Tìm kiếm', filter:'Nhóm năng lượng', all:'Tất cả', cards:'lá bài', card:'lá', oldToc:'Mục lục cũ', mainDeck:'Bộ 34 lá Tarot thần thoại', gameEyebrow:'Trò chơi xem bài', gameTitle:'Rút bài tự động', draw:'Rút bài', emptyDraw:'Chọn kiểu trải bài rồi bấm rút bài để nhận thông điệp từ bộ bài.', deityName:'Tên vị thần', vietnamese:'Tiếng Việt', english:'Tiếng Anh', thai:'Tiếng Thái', aliases:'Danh xưng khác', noThai:'Không có', legend:'Truyền thuyết ngắn gọn', imageMeaning:'Ý nghĩa hình ảnh lá bài', overview:'Ý nghĩa tổng quan', positive:'Từ khóa tích cực', challenge:'Từ khóa thử thách', message:'Thông điệp của vị thần', energyResults:'Kết quả nhóm năng lượng', cardsInGroup:'Các lá thuộc nhóm ', noResult:'Không tìm thấy lá bài phù hợp.', sourceNote:'Nội dung tiếng Anh đầy đủ có thể bổ sung trong dữ liệu english của từng lá.'
  },
  en: {
    search:'Search', filter:'Energy groups', all:'All', cards:'cards', card:'card', oldToc:'Old table of contents', mainDeck:'34 Mythic Tarot Cards', gameEyebrow:'Tarot reading game', gameTitle:'Automatic card reading', draw:'Draw cards', emptyDraw:'Choose a spread and draw cards to receive a message from the deck.', deityName:'Deity name', vietnamese:'Vietnamese', english:'English', thai:'Thai', aliases:'Other names', noThai:'Not available', legend:'Short legend', imageMeaning:'Card imagery meaning', overview:'General meaning', positive:'Positive Tarot keywords', challenge:'Challenge keywords', message:'Message from the deity', energyResults:'Energy group results', cardsInGroup:'Cards in ', noResult:'No matching cards found.', sourceNote:'English summary is shown for this card. A fully edited translation can be added later.'
  }
};
const ENERGY_LABELS_EN = {'Tất cả':'All','Lửa':'Fire','Nước':'Water','Đất':'Earth','Khí':'Air','Hành tinh':'Planetary','Thần linh':'Divine','Tình yêu':'Love','Tiền bạc':'Money','Bảo hộ':'Protection','Thử thách':'Challenge'};
function t(key){ return (UI_TEXT[state.lang] && UI_TEXT[state.lang][key]) || UI_TEXT.vi[key] || key; }
function energyLabel(value){ return state.lang === 'en' ? (ENERGY_LABELS_EN[value] || value) : value; }
function cardTitle(card){ return state.lang === 'en' ? (card.englishName || card.name) : card.name; }
function cardSubtitle(card){
  if (state.lang !== 'en') return card.subtitle || card.englishName || '';
  if (card.subtitleEn) return card.subtitleEn;
  const keywords = translatedKeywords(card.positiveKeywords).slice(0, 3);
  if (keywords.length) return keywords.join(' - ');
  const energies = translatedKeywords(card.energy).slice(0, 3);
  return energies.length ? energies.join(' - ') : (card.englishName || '');
}
function displayNumber(card){
  if (state.lang !== 'en') return card.displayNumber;
  const n = String(card.id).padStart(2, '0');
  if (card.deck === 'main') return 'Card ' + n;
  if (card.deck === 'planetary') return 'Section 2 - Card ' + n;
  if (card.deck === 'birth') return 'Section 3 - Card ' + n;
  if (card.deck === 'zodiac') return 'Section 4 - Card ' + n;
  return 'Card ' + n;
}
const KEYWORD_EN = {
  'Năng lượng':'Energy','Ý chí':'Willpower','Chuyển hóa':'Transformation','Quyết tâm':'Determination','Sức mạnh':'Strength','Yêu thương':'Love','Gia đình':'Family','Bao dung':'Compassion','Chăm sóc':'Care','Ấm áp':'Warmth','Dũng cảm':'Courage','Chiến đấu':'Fighting spirit','Trưởng thành':'Maturity','Trách nhiệm':'Responsibility','Kiên trì':'Perseverance','Trí tuệ':'Wisdom','Sáng tạo':'Creativity','Hy vọng':'Hope','Đổi mới':'Renewal','Thanh lọc':'Purification','Tu tập':'Spiritual practice','Bảo hộ':'Protection','Cố vấn':'Mentor','Học vấn':'Learning','Nghệ thuật':'Art','Giáo dục':'Education','Lãnh đạo':'Leadership','Bảo vệ':'Defense','Bản lĩnh':'Inner strength','Uy quyền':'Authority','Cám dỗ':'Temptation','Nghiệp quả':'Karma','Thử thách':'Challenge','Ảo tưởng':'Illusion','Tham vọng':'Ambition','May mắn':'Luck','Tâm linh':'Spirituality','Giác ngộ':'Awakening','Bình an':'Peace','Tài lộc':'Wealth luck','Quyền lực':'Power','Giàu có':'Prosperity','Hạnh phúc':'Happiness','Sung túc':'Abundance','Biến động':'Instability','Cẩn trọng':'Caution','Nội lực':'Inner power','Tái sinh':'Rebirth','Quyết đoán':'Decisiveness','Thành công':'Success','Chính nghĩa':'Righteousness','Chiến thắng':'Victory','Lòng tin':'Faith','Chung thủy':'Loyalty','Hy sinh':'Sacrifice','Đất đai':'Land','Vững vàng':'Stability','Độc lập':'Independence','Giải quyết vấn đề':'Problem solving','Hòa giải':'Reconciliation','Nhạy cảm':'Sensitivity','Mềm lòng':'Soft-heartedness','Niềm tin':'Trust','Đam mê':'Passion','Tai tiếng':'Scandal','Tình yêu bí mật':'Secret love','Dục vọng':'Desire','Mùa màng':'Harvest','Nuôi dưỡng':'Nurturing','Thịnh vượng':'Prosperity','Phục vụ':'Service','Hành động':'Action','Mạo hiểm':'Risk taking','Hấp dẫn':'Attraction','Rung động':'Romance','Nhân duyên':'Fated connection','Lãng mạn':'Romance','Xung đột':'Conflict','Tranh đoạt':'Struggle','Áp lực':'Pressure','Biến cố':'Sudden event','Cạnh tranh':'Competition','Ràng buộc':'Restriction','Thất vọng':'Disappointment','Mất tự do':'Loss of freedom','Lừa dối':'Deception','Tổn thương':'Hurt','Buôn bán':'Trade','Cơ hội':'Opportunity','Khách hàng':'Customers','Khủng hoảng':'Crisis','Mất mát':'Loss','Cố chấp':'Stubbornness','Nguy hiểm':'Danger','Phán xét':'Judgment','Kết thúc':'Ending','Công bằng':'Fairness','Phản bội':'Betrayal','Ngoại tình':'Affair','Đối đầu':'Confrontation','Tranh chấp':'Dispute','Đau khổ':'Suffering','Chia ly':'Separation','Van xin':'Pleading','Nhớ thương':'Longing','Danh tiếng':'Reputation','Danh vọng':'Fame','Vinh quang':'Glory','Cảm xúc':'Emotion','Trực giác':'Intuition','Lựa chọn':'Choice','Vẻ đẹp':'Beauty','Nghị lực':'Resilience','Giao tiếp':'Communication','Thương mại':'Commerce','Ngôn ngữ':'Language','Thầy dạy':'Teacher','Đạo đức':'Ethics','Tri thức':'Knowledge','Sắc đẹp':'Beauty','Hưởng thụ':'Enjoyment','Khó khăn':'Difficulty','Kiên nhẫn':'Patience','Kỷ luật':'Discipline','Bền bỉ':'Endurance','Vượt khó':'Overcoming hardship','Khởi đầu':'New beginning','Linh hoạt':'Flexibility','Thích nghi':'Adaptability','Phát triển':'Growth','Ổn định':'Stability','Điềm tĩnh':'Calmness','Khôn ngoan':'Prudence','Ánh sáng':'Light','Tiến lên':'Moving forward','Tự do':'Freedom','Bài học':'Lesson','Chăm chỉ':'Hard work','Hồn nhiên':'Innocence','Đức hạnh':'Virtue','Từ bi':'Compassion','Thanh khiết':'Purity','Phúc đức':'Blessing','Lửa':'Fire','Nước':'Water','Đất':'Earth','Khí':'Air','Hành tinh':'Planetary','Thần linh':'Divine','Tình yêu':'Love','Tiền bạc':'Money','Mục 3':'Section 3','Mục 4':'Section 4','Birth-Year':'Birth-Year','Bốc đồng':'Impulsiveness','Căng thẳng':'Stress','Nóng giận':'Anger','Thiếu kiểm soát':'Lack of control','Gánh vác quá nhiều':'Taking on too much','Kiêu ngạo':'Arrogance','Bảo thủ':'Conservatism','Cứng nhắc':'Rigidity','Cô lập':'Isolation','Mơ mộng':'Daydreaming','Thiếu thực tế':'Lack of realism','Do dự':'Hesitation','Trì hoãn':'Delay','Phụ thuộc':'Dependency','Lo lắng':'Worry','Thiếu ranh giới':'Weak boundaries','Hiếu thắng':'Aggressiveness','Nóng vội':'Impatience','Tham thắng':'Excessive competitiveness','Ghen tuông':'Jealousy','Chiếm hữu':'Possessiveness','Mất cân bằng':'Imbalance','Cực đoan':'Extremism','Ám ảnh':'Obsession','Tuyệt vọng':'Despair','Sợ thay đổi':'Fear of change','Bị lừa':'Being deceived','Cả tin':'Naivety','Tự cao':'Pride','Thiếu tự tin':'Lack of confidence','Thiếu định hướng':'Lack of direction','Mệt mỏi':'Fatigue','Cô đơn':'Loneliness','Buồn khổ':'Sadness','Nợ nghiệp':'Karmic debt','Sai lầm cảm xúc':'Emotional mistake','Cảnh báo':'Warning','Mất phương hướng':'Loss of direction','Tài chính biến động':'Financial instability','Thiếu kế hoạch':'Lack of planning','Quá kiểm soát':'Over-control','Dễ bị lừa':'Easily deceived','Quan hệ bí mật':'Secret relationship','Scandal':'Scandal','Nợ nần':'Debt','Tiêu hoang':'Overspending','Ham hưởng thụ':'Overindulgence','Thiếu kỷ luật':'Lack of discipline','Lười biếng':'Laziness','Áp đặt':'Imposition','Ép buộc':'Coercion','Thị phi':'Gossip','Sầu khổ':'Grief','Đổ vỡ':'Breakdown','Nghi ngờ':'Doubt','Đa nghi':'Suspicion','Ám ảnh quyền lực':'Obsession with power','Lạm dụng quyền lực':'Abuse of power','Bị lợi dụng':'Being used','Bóng tối':'Darkness','Cay nghiệt':'Harshness','Thù dai':'Resentment','Tổn thương sâu':'Deep hurt','Bạo lực':'Violence','Tai họa':'Disaster','Trầm cảm':'Depression','Nghiện ngập':'Addiction','Tệ nạn':'Vice','Hoảng loạn':'Panic'
};
const englishCache = new WeakMap();
function keywordEn(value){
  const text = String(value || '').trim();
  if (!text) return '';
  if (KEYWORD_EN[text]) return KEYWORD_EN[text];
  const month = text.match(/^Tháng\s*(\d+)/i);
  if (month) return 'Month ' + month[1];
  if (/^Mục\s*(\d+)/i.test(text)) return 'Section ' + text.match(/\d+/)[0];
  return 'Life lesson';
}
function translatedKeywords(values){
  const seen = new Set();
  return (values || []).map(keywordEn).filter(Boolean).filter(item => { if (seen.has(item)) return false; seen.add(item); return true; });
}
function autoEnglishContent(card){
  if (englishCache.has(card)) return englishCache.get(card);
  const name = card.englishName || card.name;
  const positives = translatedKeywords(card.positiveKeywords).slice(0, 12);
  const challenges = translatedKeywords(card.challengeKeywords).slice(0, 12);
  const energies = translatedKeywords(card.energy).slice(0, 5);
  const positiveText = positives.length ? positives.join(', ') : 'growth, awareness, and inner guidance';
  const challengeText = challenges.length ? challenges.join(', ') : 'confusion, pressure, or unbalanced choices';
  const energyText = energies.length ? energies.join(', ') : 'spiritual energy';
  const data = {
    legend: name + ' is read as a mythic archetype connected with ' + energyText + '. This card brings attention to ' + positiveText + ' and asks the querent to meet the situation with awareness.',
    imageMeaning: [
      'The central figure represents the main spiritual force of the card: ' + positiveText + '.',
      'The symbols and colors point to ' + energyText + ', showing how this energy moves through the situation.',
      'The image also warns about ' + challengeText + ', especially when the energy is used without balance.'
    ],
    overview: 'When ' + name + ' appears, it highlights ' + positiveText + '. It encourages steady reflection, clear intention, and a mature response. In a difficult spread, it may point to ' + challengeText + ', but the card still offers a path toward learning and transformation.',
    positiveKeywords: positives.length ? positives : ['Growth','Guidance','Awareness'],
    challengeKeywords: challenges.length ? challenges : ['Pressure','Confusion','Imbalance'],
    message: 'Let the energy of ' + name + ' guide you with wisdom. Use your strength consciously, and choose the path that brings clarity, balance, and growth.'
  };
  englishCache.set(card, data);
  return data;
}
function contentText(card, key){
  if (state.lang === 'en') {
    if (card.english && card.english[key]) return card.english[key];
    return autoEnglishContent(card)[key];
  }
  return card[key];
}
function contentList(card, key){
  if (state.lang === 'en') {
    if (card.english && card.english[key]) return card.english[key];
    return autoEnglishContent(card)[key] || [];
  }
  return card[key] || [];
}
function hasVietnameseText(value){
  return /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(String(value || ''));
}
function englishAliases(card){
  const aliases = (card.aliases || []).filter(alias => alias && !hasVietnameseText(alias) && /^[\x00-\x7F\s\/\-().,&]+$/.test(alias));
  const clean = aliases.length ? aliases : [card.englishName || card.name];
  return clean.filter(Boolean).join(', ');
}
function displayEnergyTags(card){
  return state.lang === 'en' ? translatedKeywords(card.energy || []) : (card.energy || []);
}
function buildCardImage(card){ const p=card.palette||['#8267b8','#d7b463','#15121d']; const primary=p[0], secondary=p[1], accent=p[2]; const symbol=escapeHtml(card.symbol||'✦'); const title=escapeHtml(displayNumber(card) || String(card.id)); const name=escapeHtml(card.name.replace(/^LÁ \d+ - /,'')); const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600"><defs><radialGradient id="glow" cx="50%" cy="24%" r="55%"><stop offset="0" stop-color="'+secondary+'" stop-opacity="0.95"/><stop offset="0.38" stop-color="'+primary+'" stop-opacity="0.55"/><stop offset="1" stop-color="'+accent+'" stop-opacity="1"/></radialGradient></defs><rect width="400" height="600" rx="22" fill="#0d0c13"/><rect x="18" y="18" width="364" height="564" rx="18" fill="url(#glow)"/><rect x="34" y="34" width="332" height="532" rx="14" fill="none" stroke="#fff0b6" stroke-width="5" opacity="0.8"/><text x="200" y="190" text-anchor="middle" font-size="104" font-family="Georgia, serif" fill="#fff6dc">'+symbol+'</text><text x="200" y="75" text-anchor="middle" font-size="22" font-weight="800" font-family="Segoe UI, Arial" fill="#fff6dc">'+title+'</text><text x="200" y="535" text-anchor="middle" font-size="23" font-weight="800" font-family="Segoe UI, Arial" fill="#fff6dc">'+name.slice(0,22)+'</text></svg>'; return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg); }
function makeTags(values){ return (values||[]).map(item => '<span class="tag">'+escapeHtml(item)+'</span>').join(''); }
function makeKeywords(values){ return (values||[]).map(item => '<span class="keyword">'+escapeHtml(item)+'</span>').join(''); }
function cardMatches(card){ const haystack = normalize([card.name,card.subtitle,card.vietnameseName,card.thaiName,card.englishName,card.sectionLabel].concat(card.aliases||[],card.energy||[],card.positiveKeywords||[],card.challengeKeywords||[]).join(' ')); const matchesQuery = !state.query || haystack.includes(normalize(state.query)); const matchesFilter = state.filter === 'Tất cả' || (card.energy || []).includes(state.filter); return matchesQuery && matchesFilter; }
function renderFilters(){ els.filterBar.innerHTML = ENERGY_FILTERS.map(filter => '<button class="filter-button '+(filter===state.filter?'active':'')+'" type="button" data-filter="'+escapeHtml(filter)+'">'+escapeHtml(energyLabel(filter))+'</button>').join(''); }
function renderToc(){ els.mainToc.innerHTML = state.mainCards.map(card => '<button type="button" data-card-id="'+card.uid+'"><span>'+escapeHtml(displayNumber(card))+'</span>'+escapeHtml(cardTitle(card))+'</button>').join(''); els.planetaryToc.innerHTML = state.planetaryCards.map(card => '<button type="button" data-card-id="'+card.uid+'"><span>'+escapeHtml(displayNumber(card))+'</span>'+escapeHtml(cardTitle(card))+'</button>').join(''); els.birthToc.innerHTML = state.birthCards.map(card => '<button type="button" data-card-id="'+card.uid+'"><span>'+escapeHtml(displayNumber(card))+'</span>'+escapeHtml(cardTitle(card))+'</button>').join(''); els.zodiacToc.innerHTML = state.zodiacCards.map(card => '<button type="button" data-card-id="'+card.uid+'"><span>'+escapeHtml(displayNumber(card))+'</span>'+escapeHtml(cardTitle(card))+'</button>').join(''); }
function cardTile(card){ return '<button class="card-tile" type="button" data-card-id="'+card.uid+'"><span class="card-image-wrap"><img src="'+(card.image || buildCardImage(card))+'" alt="'+escapeHtml(displayNumber(card)+' - '+cardTitle(card))+'" loading="lazy"></span><span class="card-meta"><span class="card-number">'+escapeHtml(displayNumber(card))+'</span><span class="card-name">'+escapeHtml(cardTitle(card))+'</span><span class="card-subtitle">'+escapeHtml(cardSubtitle(card))+'</span></span></button>'; }

function renderEnergyResults(){
  if (!els.energyResults || state.filter === 'Tất cả') {
    if (els.energyResults) els.energyResults.hidden = true;
    return;
  }
  const matching = state.allCards.filter(cardMatches);
  els.energyResults.hidden = false;
  els.energyResultsTitle.textContent = t('cardsInGroup') + energyLabel(state.filter);
  els.energyResultsCount.textContent = matching.length + ' ' + t('card');
  els.energyResultsGrid.innerHTML = matching.map(cardTile).join('');
}

function renderGrid(){ const mainVisible = state.mainCards.filter(cardMatches); const planetVisible = state.planetaryCards.filter(cardMatches); const birthVisible = state.birthCards.filter(cardMatches); const zodiacVisible = state.zodiacCards.filter(cardMatches); els.grid.innerHTML = mainVisible.map(cardTile).join(''); els.planetGrid.innerHTML = planetVisible.map(cardTile).join(''); els.birthGrid.innerHTML = birthVisible.map(cardTile).join(''); els.zodiacGrid.innerHTML = zodiacVisible.map(cardTile).join(''); els.mainCount.textContent = mainVisible.length + ' / ' + state.mainCards.length + ' ' + t('card'); els.planetaryCount.textContent = planetVisible.length + ' / ' + state.planetaryCards.length + ' ' + t('card'); els.birthCount.textContent = birthVisible.length + ' / ' + state.birthCards.length + ' ' + t('card'); els.zodiacCount.textContent = zodiacVisible.length + ' / ' + state.zodiacCards.length + ' ' + t('card'); const totalVisible = mainVisible.length + planetVisible.length + birthVisible.length + zodiacVisible.length; els.count.textContent = totalVisible; renderEnergyResults(); els.empty.hidden = totalVisible > 0; }
function textKey(value){ return String(value || '').toLocaleLowerCase('vi-VN').normalize('NFC').replace(/[\s.,;:!?'"]+/g, ' ').trim(); }
function sameContent(a, b){
  const left = textKey(a);
  const right = textKey(b);
  if (!left || !right) return false;
  return left === right || left.includes(right) || right.includes(left);
}
function renderModal(card){
  state.activeCard = card;
  els.modalImage.src = card.image || buildCardImage(card);
  els.modalImage.alt = displayNumber(card)+' - '+cardTitle(card);
  els.modalNumber.textContent = displayNumber(card);
  els.modalTitle.textContent = cardTitle(card);
  els.modalSubtitle.textContent = cardSubtitle(card);
  els.modalEnergy.innerHTML = makeTags(displayEnergyTags(card));
  const legend = contentText(card, 'legend') || '';
  const overview = contentText(card, 'overview') || '';
  const imageMeaning = contentList(card, 'imageMeaning');
  const positiveKeywords = contentList(card, 'positiveKeywords');
  const challengeKeywords = contentList(card, 'challengeKeywords');
  const message = contentText(card, 'message') || '';
  const imageText = (imageMeaning || []).join(' ');
  const showLegend = String(legend || '').trim() && !sameContent(legend, imageText);
  const showOverview = String(overview || '').trim() && !sameContent(overview, legend) && !sameContent(overview, imageText);
  const sections = [];
  sections.push('<section class="detail-section"><h3>'+escapeHtml(t('deityName'))+'</h3><div class="name-grid"><div class="info-box"><small>'+escapeHtml(t('vietnamese'))+'</small>'+escapeHtml(card.vietnameseName || card.name)+'</div><div class="info-box"><small>'+escapeHtml(t('english'))+'</small>'+escapeHtml(card.englishName || card.name)+'</div><div class="info-box"><small>'+escapeHtml(t('thai'))+'</small>'+escapeHtml(card.thaiName || t('noThai'))+'</div><div class="info-box"><small>'+escapeHtml(t('aliases'))+'</small>'+escapeHtml(state.lang === 'en' ? englishAliases(card) : (card.aliases || []).join(', '))+'</div></div></section>');
  if (state.lang === 'en' && !card.english) sections.push('<section class="detail-section language-note"><p>'+escapeHtml(t('sourceNote'))+'</p></section>');
  if (showLegend) sections.push('<section class="detail-section"><h3>'+escapeHtml(t('legend'))+'</h3><p>'+escapeHtml(legend)+'</p></section>');
  sections.push('<section class="detail-section"><h3>'+escapeHtml(t('imageMeaning'))+'</h3><ul>'+(imageMeaning || []).map(item => '<li>'+escapeHtml(item)+'</li>').join('')+'</ul></section>');
  if (showOverview) sections.push('<section class="detail-section"><h3>'+escapeHtml(t('overview'))+'</h3><p>'+escapeHtml(overview)+'</p></section>');
  sections.push('<section class="detail-section keyword-grid"><div><h3>'+escapeHtml(t('positive'))+'</h3><div class="keyword-list">'+makeKeywords(positiveKeywords)+'</div></div><div><h3>'+escapeHtml(t('challenge'))+'</h3><div class="keyword-list">'+makeKeywords(challengeKeywords)+'</div></div></section>');
  sections.push('<section class="detail-section"><h3>'+escapeHtml(t('message'))+'</h3><p class="quote">“'+escapeHtml(message)+'”</p></section>');
  els.modalBody.innerHTML = sections.join('');
  els.modal.hidden = false;
  document.body.style.overflow = 'hidden';
}
function openByUid(uid){ const card = state.allCards.find(item => item.uid === uid); if(card) renderModal(card); }
function closeModal(){ els.modal.hidden = true; document.body.style.overflow = ''; }
const DAILY_SPREADS = {
  daily: {
    label: 'Hằng ngày (2)',
    intro: 'Xem nhanh điều có thể nổi bật trong ngày và cách bạn phản ứng với điều đó.',
    positions: [
      { title: 'Sự kiện', text: 'Lá sự kiện có thể xảy ra vào ngày mai hoặc là điều nổi bật sắp bước tới.' },
      { title: 'Cảm xúc', text: 'Cách bạn cảm thấy, phản ứng hoặc nên giữ tâm thế trước sự kiện đó.' }
    ]
  },
  energy: {
    label: 'Năng lượng (2)',
    intro: 'Xem năng lượng trong ngày và cách tận dụng hoặc chuyển hóa năng lượng này.',
    positions: [
      { title: 'Năng lượng', text: 'Năng lượng chủ đạo của hôm nay, ngày mai hoặc trong tuần sau.' },
      { title: 'Cách chuyển hóa', text: 'Cách bạn có thể biến đổi, nâng lên hoặc dùng năng lượng này để phục vụ mình.' }
    ]
  },
  achieved: {
    label: 'Bạn đạt được gì? (3)',
    intro: 'Dùng để tìm phương hướng cho một sự việc, sự kiện hoặc mục tiêu đang quan tâm.',
    positions: [
      { title: 'Bạn có gì?', text: 'Nguồn lực, điều kiện, điểm mạnh hoặc nền tảng hiện tại của bạn.' },
      { title: 'Bạn cần biết điều gì?', text: 'Thông tin, bài học hoặc sự thật cần nhìn rõ trước khi đi tiếp.' },
      { title: 'Bạn đạt được gì?', text: 'Kết quả, phần thưởng hoặc điều có thể nhận được từ hướng đi này.' }
    ]
  },
  happening: {
    label: 'Chuyện gì đang xảy ra (3)',
    intro: 'Dùng để tìm bản chất của một sự việc, sự kiện hoặc tình huống đang diễn ra.',
    positions: [
      { title: 'Sự việc', text: 'Năng lượng chính và bối cảnh thật sự của chuyện đang xảy ra.' },
      { title: 'Điều cần biết', text: 'Điểm quan trọng bạn cần hiểu rõ về sự việc này.' },
      { title: 'Ảnh hưởng lớn nhất', text: 'Tác động mạnh nhất của sự việc đối với bạn hoặc quyết định của bạn.' }
    ]
  },
  seed: {
    label: 'Hạt giống (3)',
    intro: 'Xem liệu kế hoạch, dự định hoặc điều đang ấp ủ có thể thành công hay không.',
    positions: [
      { title: 'Hạt giống', text: 'Khả năng, tình hình hiện tại và nền tảng ban đầu của kế hoạch.' },
      { title: 'Mặt trời', text: 'Năng lượng cần thiết để giúp hạt giống này nảy mầm và phát triển.' },
      { title: 'Hoa quả', text: 'Phần thưởng, kết quả hoặc thu hoạch có thể đạt được.' }
    ]
  },
  vision: {
    label: 'Viễn cảnh (4)',
    intro: 'Dùng để bói về viễn cảnh, điều sẽ xảy ra của một sự việc, tình huống hoặc dự án.',
    positions: [
      { title: 'Viễn cảnh', text: 'Bức tranh chung của một tình huống, sự kiện hoặc dự án.' },
      { title: 'Ai sẽ giúp bạn?', text: 'Người, nguồn lực hoặc yếu tố hỗ trợ bạn trên hành trình này.' },
      { title: 'Điều này dẫn đến đâu?', text: 'Hướng phát triển tiếp theo và kết quả trung gian có thể xảy ra.' },
      { title: 'Cảm nhận về kết quả', text: 'Bạn sẽ cảm thấy thế nào khi sự việc đi đến kết quả.' }
    ]
  },
  fourWinds: {
    label: 'Bốn ngọn gió (4)',
    intro: 'Giúp tìm hướng đi trong một sự việc và nhìn rõ điều cần buông, điều cần đối diện.',
    positions: [
      { title: 'Phía Tây - Buông bỏ', text: 'Điều bạn cần để lại phía sau, cần buông tay hoặc giải phóng.' },
      { title: 'Phía Bắc - Đối diện', text: 'Điều bạn cần đối diện, chấp nhận hoặc nhìn thẳng vào sự thật.' },
      { title: 'Phía Đông - Cần biết', text: 'Điều bạn cần biết để chọn hướng đi sáng rõ hơn.' },
      { title: 'Phía Nam - Đạt được', text: 'Điều bạn có thể đạt được khi đi qua quá trình này.' }
    ]
  },
  windowState: {
    label: 'Cửa sổ (4)',
    intro: 'Dùng để xem trạng thái hiện tại của một người ở nhiều tầng năng lượng.',
    positions: [
      { title: 'Cơ thể', text: 'Trạng thái cơ thể hoặc sức khỏe hiện tại.' },
      { title: 'Tinh thần', text: 'Trạng thái tinh thần, suy nghĩ và mức độ tỉnh táo hiện tại.' },
      { title: 'Tình cảm', text: 'Trạng thái cảm xúc, tình cảm và những rung động bên trong.' },
      { title: 'Tâm linh', text: 'Trạng thái tâm linh, tâm hồn hoặc kết nối sâu bên trong hiện tại.' }
    ]
  },
  progress: {
    label: 'Tiến triển (4)',
    intro: 'Dùng để xem sự tiến triển của một sự việc, một tình huống hoặc kế hoạch.',
    positions: [
      { title: 'Hiện tại', text: 'Tình huống hiện tại đang như thế nào.' },
      { title: 'Bốn tuần tới', text: 'Tình huống sẽ phát triển trong bốn tuần tới như thế nào.' },
      { title: 'Ảnh hưởng chính', text: 'Điều gì hoặc ai sẽ ảnh hưởng lớn tới tình huống.' },
      { title: 'Kết quả', text: 'Kết quả có thể xuất hiện nếu mọi việc tiếp tục theo hướng hiện tại.' }
    ]
  },
  journey: {
    label: 'Chuyến đi (4)',
    intro: 'Dùng để xem chuyến đi sắp diễn ra, có thể là du lịch, nghỉ dưỡng hoặc công tác.',
    positions: [
      { title: 'Ảnh hưởng xung quanh', text: 'Những ảnh hưởng bên ngoài có thể tác động đến chuyến đi.' },
      { title: 'Cần chuyển đi', text: 'Điều bạn cần chuyển đi, thay đổi hoặc chuẩn bị trước chuyến đi.' },
      { title: 'Nhận được', text: 'Điều bạn sẽ học được, nhận được hoặc hiểu ra nhờ chuyến đi.' },
      { title: 'Kết quả', text: 'Kết quả và cảm nhận chung sau chuyến đi.' }
    ]
  },
  strength: {
    label: 'Điểm mạnh (4)',
    intro: 'Dùng để xác định và phát huy điểm mạnh của một người trong công việc, sự kiện hoặc mối quan hệ.',
    positions: [
      { title: 'Điểm mạnh lớn nhất', text: 'Điểm mạnh nổi bật nhất của bạn trong tình huống này.' },
      { title: 'Cách phát triển', text: 'Bạn có thể làm gì để phát triển điểm mạnh này.' },
      { title: 'Cách biểu hiện', text: 'Bạn có thể làm gì để điểm mạnh này thể hiện tốt hơn trong công việc, sự kiện hoặc mối quan hệ.' },
      { title: 'Điều nhận lại', text: 'Điểm mạnh này đem lại cho bạn điều gì.' }
    ]
  },
  blindSpot: {
    label: 'Điểm mù (4)',
    intro: 'Giúp tìm hiểu bản thân, tăng sự tự nhận thức và học tập từ những điều chưa nhìn rõ.',
    positions: [
      { title: 'Ai cũng biết', text: 'Những điều về bạn mà cả bạn và mọi người đều biết.' },
      { title: 'Người khác không biết', text: 'Những điều về bạn mà bạn biết nhưng người khác không biết.' },
      { title: 'Bạn mới biết', text: 'Những điều về bạn mà chỉ bạn mới biết hoặc đang dần nhận ra.' },
      { title: 'Bạn chưa biết', text: 'Những điều về bạn mà mọi người biết nhưng bạn chưa nhìn thấy rõ.' }
    ]
  },
  yesNoFive: {
    label: 'Có/Không năm lá (5)',
    intro: 'Dùng khi cần tìm câu trả lời có hoặc không cho một câu hỏi cụ thể.',
    positions: [
      { title: 'Lá 1', text: 'Một điểm năng lượng đầu tiên giúp nghiêng câu trả lời về có hoặc không.' },
      { title: 'Lá 2', text: 'Một điểm năng lượng bổ sung, cho thấy xu hướng phụ của câu hỏi.' },
      { title: 'Lá 3', text: 'Lá trung tâm, được tính hai điểm và giữ vai trò quyết định mạnh nhất.' },
      { title: 'Lá 4', text: 'Một điểm năng lượng tiếp theo để cân bằng câu trả lời.' },
      { title: 'Lá 5', text: 'Điểm cuối cùng giúp chốt lại xu hướng có hoặc không.' }
    ],
    note: 'Quy ước luận: lá xuôi là có, lá ngược là không. Lá giữa tính hai điểm. Nếu hai bên bằng nhau, bộ bài chưa đưa ra câu trả lời rõ ràng.'
  },
  newRelationship: {
    label: 'Mối quan hệ mới (5)',
    intro: 'Dùng ở bước đầu của một mối quan hệ như kết bạn mới, bắt đầu hẹn hò hoặc có đối tác mới.',
    positions: [
      { title: 'Bạn mang vào', text: 'Điều bạn mang vào mối quan hệ này.' },
      { title: 'Đối phương mang vào', text: 'Điều đối phương mang vào mối quan hệ này.' },
      { title: 'Niềm vui của bạn', text: 'Liệu bạn có hạnh phúc hoặc vui vẻ trong mối quan hệ này không.' },
      { title: 'Niềm vui của đối phương', text: 'Liệu đối phương có hạnh phúc hoặc vui vẻ trong mối quan hệ này không.' },
      { title: 'Độ bền vững', text: 'Liệu mối quan hệ này có bền vững hay không.' }
    ]
  },
  moneyFive: {
    label: 'Tiền bạc (5)',
    intro: 'Dùng để dự đoán viễn cảnh tiền bạc trong tương lai gần.',
    positions: [
      { title: 'Nền tảng tài chính', text: 'Nền tảng tài chính, tiền bạc hoặc cơ hội tiền bạc bạn đang có.' },
      { title: 'Tiền sắp xuất hiện', text: 'Tiền sẽ sớm xuất hiện trong cuộc đời bạn theo cách nào.' },
      { title: 'Cơ hội cần cân nhắc', text: 'Những cơ hội mang lại tiền bạc mà bạn nên cân nhắc kỹ hơn.' },
      { title: 'Nguồn tiền mới', text: 'Ai hoặc điều gì sẽ mang lại nguồn tiền bạc mới.' },
      { title: 'Kết quả', text: 'Kết quả tài chính có thể xảy ra trong giai đoạn gần.' }
    ]
  },
  fiveMirror: {
    label: 'Tấm gương năm lá (5)',
    intro: 'Cho biết hình ảnh thật và hình ảnh phản chiếu trong một mối quan hệ hoặc tình huống.',
    positions: [
      { title: 'Hình ảnh', text: 'Cách bạn nhìn đối phương hoặc tình huống.' },
      { title: 'Phản chiếu', text: 'Cách đối phương nhìn chính bản thân mình hoặc nhìn lại bạn.' },
      { title: 'Ý nghĩa với bạn', text: 'Đối phương hoặc tình huống này có ý nghĩa gì với bạn.' },
      { title: 'Ý nghĩa với đối phương', text: 'Bạn có ý nghĩa gì với đối phương hoặc với tình huống này.' },
      { title: 'Sự thật ở đó', text: 'Điều gì thật sự đang tồn tại phía sau các hình ảnh phản chiếu.' }
    ]
  },
  businessExpansion: {
    label: 'Mở rộng kinh doanh (5)',
    intro: 'Dùng khi muốn biết có nên mở rộng kinh doanh, công việc hoặc một lĩnh vực mới hay không.',
    positions: [
      { title: 'Thời điểm', text: 'Đây có phải thời gian tốt để mở rộng kinh doanh hoặc công việc hay không.' },
      { title: 'Yếu tố ủng hộ', text: 'Những ảnh hưởng sẽ giúp đỡ, ủng hộ hoặc thuận lợi cho bạn.' },
      { title: 'Yếu tố cản trở', text: 'Những ảnh hưởng sẽ chống lại hoặc không thuận lợi với bạn.' },
      { title: 'Điều cần quan tâm', text: 'Những yếu tố khác cần phải quan tâm trước khi quyết định.' },
      { title: 'Kết quả', text: 'Kết quả có thể xảy ra nếu bạn mở rộng theo hướng này.' }
    ]
  },
  wheelFive: {
    label: 'Bánh xe (5)',
    intro: 'Dùng để xem một tình huống và các ảnh hưởng lớn đang xoay quanh nó.',
    positions: [
      { title: 'Tổng quan hiện tại', text: 'Tổng quan về tình huống hiện tại.' },
      { title: 'Ảnh hưởng đang giảm', text: 'Những ảnh hưởng đang giảm dần, yếu đi hoặc rời khỏi tình huống.' },
      { title: 'Ảnh hưởng tiềm thức', text: 'Những ảnh hưởng bản thân không nhận biết hoặc từ tiềm thức.' },
      { title: 'Ảnh hưởng mới', text: 'Những ảnh hưởng mới đang xuất hiện.' },
      { title: 'Tổng hợp', text: 'Điều gì sẽ hòa hợp các ảnh hưởng và kết nối các lá 1-4 với nhau.' }
    ]
  },
  pastPresentFutureFive: {
    label: 'Quá khứ - hiện tại - tương lai (5)',
    intro: 'Dùng để xem quá khứ, hiện tại và tương lai của bản thân hoặc một ai đó.',
    positions: [
      { title: 'Quá khứ', text: 'Nền tảng hoặc sự kiện từ quá khứ đang ảnh hưởng đến câu hỏi.' },
      { title: 'Sự việc gần đây', text: 'Những sự việc gần đây vừa xảy ra hoặc còn để lại dư âm.' },
      { title: 'Hiện tại', text: 'Tình trạng hiện tại và năng lượng chính của lúc này.' },
      { title: 'Tương lai gần', text: 'Điều có thể xảy ra trong tương lai gần.' },
      { title: 'Tương lai xa', text: 'Xu hướng xa hơn nếu tình huống tiếp tục phát triển.' }
    ]
  }
};
const PAGE_TEXT = {
  vi: {
    title:'Tarot Thần Thoại', eyebrow:'Bộ bài thần thoại Thái - Ấn', lead:'Tra cứu bộ 34 lá chính, mục 2 gồm 7 lá hành tinh, mục 3 gồm 12 lá Birth-Year và mục 4 gồm 12 lá năm con giáp theo vị thần, biểu tượng, năng lượng và thông điệp khi luận bài.', cardCount:'lá bài', energyResults:'Kết quả nhóm năng lượng', oldToc:'Mục lục cũ', mainToc:'Bộ 34 lá chính', section2:'Mục 2', section3:'Mục 3', section4:'Mục 4', planetary:'7 lá hành tinh', birth:'12 lá Birth-Year', zodiac:'12 lá năm con giáp', mainSection:'Mục 1', mainDeck:'Bộ 34 lá Tarot thần thoại'
  },
  en: {
    title:'Mythic Tarot', eyebrow:'Thai - Indian mythic deck', lead:'Search the 34 main cards, 7 planetary cards, 12 Birth-Year cards, and 12 zodiac-year deity cards by symbol, energy, keywords, and divine message.', cardCount:'cards', energyResults:'Energy group results', oldToc:'Table of contents', mainToc:'34 main cards', section2:'Section 2', section3:'Section 3', section4:'Section 4', planetary:'7 planetary cards', birth:'12 Birth-Year cards', zodiac:'12 zodiac-year cards', mainSection:'Section 1', mainDeck:'34 mythic Tarot cards'
  }
};
const SPREAD_GUIDE_TEXT = {
  vi: {
    eyebrow:'Cách xem bài', title:'Trải bài 2 - 3 - 5 lá', count:'3 mục', aria:'Cách xem bài Tarot',
    cards:[
      {n:'2', title:'Trải 2 lá', intro:'Dùng khi cần câu trả lời nhanh, so sánh hai hướng hoặc nhìn rõ vấn đề chính.', steps:['Lá 1: Tình huống hiện tại hoặc năng lượng chính.','Lá 2: Lời khuyên, kết quả gần hoặc điều cần chú ý.'], note:'Gợi ý câu hỏi: Nên hay không nên? Người ấy nghĩ gì và mình nên làm gì? Vấn đề và giải pháp là gì?'},
      {n:'3', title:'Trải 3 lá', intro:'Dùng cho câu hỏi phổ biến, dễ đọc và phù hợp hầu hết tình huống.', steps:['Lá 1: Quá khứ hoặc nguyên nhân.','Lá 2: Hiện tại hoặc điều đang diễn ra.','Lá 3: Tương lai gần, lời khuyên hoặc hướng phát triển.'], note:'Có thể đổi thành: Bạn - Người ấy - Mối quan hệ, hoặc Vấn đề - Thử thách - Lời khuyên.'},
      {n:'5', title:'Trải 5 lá', intro:'Dùng khi muốn xem sâu hơn về một chuyện quan trọng trong công việc, tình yêu, tiền bạc hoặc định hướng.', wide:true, steps:['Lá 1: Tổng quan vấn đề.','Lá 2: Nguyên nhân gốc rễ.','Lá 3: Điều đang cản trở hoặc thử thách.','Lá 4: Lời khuyên cần làm.','Lá 5: Kết quả có thể xảy ra nếu đi theo hướng hiện tại.'], note:'Khi luận bài, đọc từng lá riêng trước, sau đó nối năng lượng các lá lại thành một câu chuyện.'}
    ]
  },
  en: {
    eyebrow:'How to read', title:'2 - 3 - 5 card spreads', count:'3 guides', aria:'How to read Tarot cards',
    cards:[
      {n:'2', title:'2-card spread', intro:'Use this for quick answers, comparing two directions, or clarifying the main issue.', steps:['Card 1: Current situation or main energy.','Card 2: Advice, near outcome, or what needs attention.'], note:'Suggested questions: Should I or should I not? What does this person think, and what should I do? What is the problem and the solution?'},
      {n:'3', title:'3-card spread', intro:'A simple, popular spread that fits most questions and is easy to read.', steps:['Card 1: Past or root cause.','Card 2: Present or what is happening now.','Card 3: Near future, advice, or direction of growth.'], note:'You can also read it as: You - The other person - The relationship, or Problem - Challenge - Advice.'},
      {n:'5', title:'5-card spread', intro:'Use this when you want a deeper reading about work, love, money, or an important direction.', wide:true, steps:['Card 1: Overall situation.','Card 2: Root cause.','Card 3: Blockage or challenge.','Card 4: Advice and action.','Card 5: Possible outcome if the current path continues.'], note:'Read each card first, then connect the energies into one clear story.'}
    ]
  }
};
function pageText(key){ return (PAGE_TEXT[state.lang] && PAGE_TEXT[state.lang][key]) || PAGE_TEXT.vi[key] || key; }
function renderSpreadGuide(){
  const guide = document.querySelector('#spreadGuide');
  if (!guide) return;
  const data = SPREAD_GUIDE_TEXT[state.lang] || SPREAD_GUIDE_TEXT.vi;
  guide.setAttribute('aria-label', data.aria);
  guide.innerHTML = '<div class="deck-heading"><div><p class="eyebrow">'+escapeHtml(data.eyebrow)+'</p><h2>'+escapeHtml(data.title)+'</h2></div><span class="deck-count">'+escapeHtml(data.count)+'</span></div><div class="spread-grid">'+data.cards.map(item => '<article class="spread-card '+(item.wide ? 'spread-card-wide' : '')+'"><div class="spread-top"><span class="spread-number">'+escapeHtml(item.n)+'</span><div><h3>'+escapeHtml(item.title)+'</h3><p>'+escapeHtml(item.intro)+'</p></div></div><ol class="spread-steps '+(item.wide ? 'spread-five' : '')+'">'+item.steps.map(step => { const parts = step.split(': '); return '<li><b>'+escapeHtml(parts[0])+':</b> '+escapeHtml(parts.slice(1).join(': '))+'</li>'; }).join('')+'</ol><p class="spread-note">'+escapeHtml(item.note)+'</p></article>').join('')+'</div>';
}
function updatePageHeadings(){
  document.title = state.lang === 'en' ? 'Mythic Tarot - Card Lookup' : 'Tarot Thần Thoại - Tra Cứu Lá Bài';
  const heroEyebrow = document.querySelector('.topbar > div:first-child .eyebrow');
  const heroTitle = document.querySelector('.topbar h1');
  const heroLead = document.querySelector('.topbar .lead');
  const countSmall = document.querySelector('.count-panel small');
  if (heroEyebrow) heroEyebrow.textContent = pageText('eyebrow');
  if (heroTitle) heroTitle.textContent = pageText('title');
  if (heroLead) heroLead.textContent = pageText('lead');
  if (countSmall) countSmall.textContent = pageText('cardCount');
  const energyEyebrow = document.querySelector('#energyResults .eyebrow');
  if (energyEyebrow) energyEyebrow.textContent = pageText('energyResults');
  const toc = document.querySelector('.toc-panel');
  if (toc) {
    const blocks = toc.querySelectorAll(':scope > div');
    const labels = [ ['oldToc','mainToc'], ['section2','planetary'], ['section3','birth'], ['section4','zodiac'] ];
    blocks.forEach((block, index) => { const eyebrow = block.querySelector('.eyebrow'); const h2 = block.querySelector('h2'); const pair = labels[index]; if(pair){ if(eyebrow) eyebrow.textContent = pageText(pair[0]); if(h2) h2.textContent = pageText(pair[1]); } });
    toc.setAttribute('aria-label', state.lang === 'en' ? 'Table of contents' : 'Mục lục');
  }
  const deckMap = [ ['#mainDeck','mainSection','mainDeck'], ['#planetaryDeck','section2','planetary'], ['#birthDeck','section3','birth'], ['#zodiacDeck','section4','zodiac'] ];
  deckMap.forEach(([selector, eyebrowKey, titleKey]) => { const section = document.querySelector(selector); if(!section) return; const eyebrow = section.querySelector('.eyebrow'); const h2 = section.querySelector('h2'); if(eyebrow) eyebrow.textContent = pageText(eyebrowKey); if(h2) h2.textContent = pageText(titleKey); });
}
const SPREAD_EN = {
  daily: { intro:'A quick reading for the main event and your emotional response.', positions:[['Event','An event or major energy that may appear soon.'],['Emotion','How you may feel, react, or hold yourself around that event.']] },
  energy: { intro:'Read the energy of the day and how to use or transform it.', positions:[['Energy','The main energy of today, tomorrow, or the near future.'],['Transformation','How you can transform, elevate, or use this energy for your benefit.']] },
  achieved: { intro:'Find direction for an event, goal, or situation.', positions:[['What you have','Your current resources, strengths, or foundation.'],['What you need to know','The information, lesson, or truth you need to see clearly.'],['What you gain','The result, reward, or outcome you may receive.']] },
  happening: { intro:'Reveal the true nature of a current event or situation.', positions:[['The situation','The core energy and real context of what is happening.'],['What to know','The key point you need to understand about this matter.'],['Main influence','The strongest influence this situation has on you.']] },
  seed: { intro:'See whether a plan, project, or intention can grow successfully.', positions:[['Seed','The current potential and foundation of the plan.'],['Sunlight','The energy needed to help this seed grow.'],['Fruit','The possible reward, result, or harvest.']] },
  vision: { intro:'Read the outlook of a situation, event, or project.', positions:[['Vision','The overall picture of the situation.'],['Support','Who or what can help you.'],['Direction','Where this situation is leading.'],['Feeling','How you may feel about the result.']] },
  fourWinds: { intro:'Find direction by seeing what to release, face, know, and receive.', positions:[['West - Release','What you need to leave behind or let go.'],['North - Face','What you need to face, accept, or acknowledge.'],['East - Know','What you need to know to choose the right direction.'],['South - Gain','What you may gain after passing through this process.']] },
  windowState: { intro:'Read a person’s current state on several levels.', positions:[['Body','Current physical or health state.'],['Mind','Current mental state and clarity.'],['Heart','Current emotional state.'],['Spirit','Current spiritual or soul state.']] },
  progress: { intro:'Read how a situation or plan will progress.', positions:[['Now','What the situation is like now.'],['Next four weeks','How the situation may develop in the next four weeks.'],['Main influence','Who or what will strongly influence the situation.'],['Outcome','The likely result if the current path continues.']] },
  journey: { intro:'Read an upcoming trip, journey, vacation, or work travel.', positions:[['Surrounding influence','External influences that may affect the journey.'],['What to move','What you need to change, prepare, or move away from.'],['What you receive','What you may learn, receive, or realize through the journey.'],['Outcome','The result and overall feeling after the trip.']] },
  strength: { intro:'Identify and develop your strengths in a situation.', positions:[['Main strength','Your strongest quality in this situation.'],['Develop it','How you can develop this strength.'],['Express it','How this strength can show up better in work, events, or relationships.'],['Gift','What this strength brings you.']] },
  blindSpot: { intro:'Understand yourself better and discover what is not yet clear.', positions:[['Open self','What both you and others know about you.'],['Hidden self','What you know about yourself but others do not.'],['Private truth','What only you are beginning to understand.'],['Blind spot','What others may see about you that you do not yet see.']] },
  yesNoFive: { intro:'Use this spread for a yes-or-no question.', positions:[['Card 1','First point toward yes or no.'],['Card 2','Second point and supporting tendency.'],['Card 3','The center card, counted as two points.'],['Card 4','Another balancing point.'],['Card 5','Final point that helps decide the answer.']], note:'Reading rule: upright means yes, reversed means no. The center card counts as two points. If both sides are equal, the deck does not give a clear answer.' },
  newRelationship: { intro:'Use this at the beginning of a new friendship, romance, or partnership.', positions:[['What you bring','What you bring into this relationship.'],['What they bring','What the other person brings into this relationship.'],['Your happiness','Whether you may feel happy or fulfilled here.'],['Their happiness','Whether the other person may feel happy or fulfilled here.'],['Stability','Whether this relationship can become stable or lasting.']] },
  moneyFive: { intro:'Read the near financial outlook.', positions:[['Financial base','Your current financial foundation, money, or opportunity.'],['Money appearing','How money may soon appear in your life.'],['Opportunity','Money-making opportunities to consider carefully.'],['New source','Who or what may bring a new source of money.'],['Outcome','The possible financial result.']] },
  fiveMirror: { intro:'Read the true image and reflection in a relationship or situation.', positions:[['Image','How you see the other person or situation.'],['Reflection','How the other person sees themselves or reflects back to you.'],['Meaning to you','What this person or situation means to you.'],['Meaning to them','What you mean to the other person or the situation.'],['Truth','What is truly present behind the reflections.']] },
  businessExpansion: { intro:'Read whether you should expand a business, work, or new field.', positions:[['Timing','Whether this is a good time to expand.'],['Support','Influences that help or support you.'],['Resistance','Influences that oppose or slow you down.'],['What to consider','Other factors you should pay attention to.'],['Outcome','The result if you expand in this direction.']] },
  wheelFive: { intro:'Read a situation and the major influences around it.', positions:[['Overview','The current situation as a whole.'],['Fading influence','Influences that are weakening or leaving.'],['Unconscious influence','Hidden or subconscious influences.'],['New influence','New influences beginning to appear.'],['Integration','What connects and harmonizes cards 1-4.']] },
  pastPresentFutureFive: { intro:'Read the past, present, and future for yourself or someone else.', positions:[['Past','Past foundation or event affecting the question.'],['Recent events','Recent events that still have influence.'],['Present','Current state and main energy.'],['Near future','What may happen in the near future.'],['Distant future','A longer-term tendency if the situation continues.']] }
};
function localizedSpread(mode){
  const base = DAILY_SPREADS[mode] || DAILY_SPREADS.daily;
  if (state.lang !== 'en') return base;
  const en = SPREAD_EN[mode];
  if (!en) return base;
  return {
    label: spreadLabel(mode, base),
    intro: en.intro || base.intro,
    note: en.note || base.note,
    positions: base.positions.map((position, index) => {
      const translated = en.positions && en.positions[index];
      return translated ? { title: translated[0], text: translated[1] } : position;
    })
  };
}
const SPREAD_LABELS_EN = {
  daily:'Daily (2)', energy:'Energy (2)', achieved:'What will you gain? (3)', happening:'What is happening? (3)', seed:'The Seed (3)', vision:'Vision (4)', fourWinds:'Four Winds (4)', windowState:'Window (4)', progress:'Progress (4)', journey:'Journey (4)', strength:'Strengths (4)', blindSpot:'Blind Spot (4)', yesNoFive:'Yes/No Five Cards (5)', newRelationship:'New Relationship (5)', moneyFive:'Money (5)', fiveMirror:'Five-Card Mirror (5)', businessExpansion:'Business Expansion (5)', wheelFive:'Wheel (5)', pastPresentFutureFive:'Past - Present - Future (5)'
};
function spreadLabel(key, spread){ return state.lang === 'en' ? (SPREAD_LABELS_EN[key] || spread.label) : spread.label; }
function createLanguageToggle(){
  if (document.querySelector('#languageToggle')) return;
  const host = document.querySelector('.topbar');
  if (!host) return;
  const wrap = document.createElement('div');
  wrap.className = 'language-switch';
  wrap.id = 'languageToggle';
  wrap.innerHTML = '<button type="button" data-lang="vi" class="active">VI</button><button type="button" data-lang="en">EN</button>';
  host.appendChild(wrap);
}
function updateStaticLanguage(){
  document.documentElement.lang = state.lang;
  document.querySelectorAll('#languageToggle [data-lang]').forEach(button => button.classList.toggle('active', button.dataset.lang === state.lang));
  const searchLabel = document.querySelector('.search-box span');
  if (searchLabel) searchLabel.textContent = t('search');
  const filterLabel = document.querySelector('.filter-label');
  if (filterLabel) filterLabel.textContent = t('filter');
  const searchInput = document.querySelector('#searchInput');
  if (searchInput) searchInput.placeholder = state.lang === 'en' ? 'Enter card name, deity, keyword...' : 'Nhập tên lá, vị thần, từ khóa...';
  const empty = document.querySelector('#emptyState');
  if (empty) empty.textContent = t('noResult');
  updatePageHeadings();
  renderSpreadGuide();
  const reader = document.querySelector('#dailyReader');
  if (reader) {
    const eyebrow = reader.querySelector('.eyebrow');
    const title = reader.querySelector('h2');
    const drawButton = reader.querySelector('#dailyDrawButton');
    if (eyebrow) eyebrow.textContent = t('gameEyebrow');
    if (title) title.textContent = t('gameTitle');
    if (drawButton) drawButton.textContent = t('draw');
    reader.querySelectorAll('[data-daily-mode]').forEach(button => {
      const spread = DAILY_SPREADS[button.dataset.dailyMode];
      if (spread) button.textContent = spreadLabel(button.dataset.dailyMode, spread);
    });
    const activeMode = reader.dataset.mode || 'daily';
    setDailyMode(activeMode);
  }
}
function createDailyReader(){
  if (document.querySelector('#dailyReader')) return;
  const anchor = document.querySelector('#spreadGuide') || document.querySelector('.controls');
  if (!anchor) return;
  const section = document.createElement('section');
  section.id = 'dailyReader';
  section.className = 'daily-reader';
  const modeButtons = Object.entries(DAILY_SPREADS).map(([key, spread], index) => '<button class="daily-mode '+(index === 0 ? 'active' : '')+'" type="button" data-daily-mode="'+key+'">'+escapeHtml(spreadLabel(key, spread))+'</button>').join('');
  section.innerHTML = '<div class="deck-heading"><div><p class="eyebrow">'+escapeHtml(t('gameEyebrow'))+'</p><h2>'+escapeHtml(t('gameTitle'))+'</h2></div><span id="dailyCount" class="deck-count">2 lá</span></div><div class="daily-reader-inner"><div class="daily-reader-panel"><div class="daily-mode-bar">'+modeButtons+'</div><p id="dailyIntro" class="daily-intro"></p><div id="dailyPositions" class="daily-positions"></div><button id="dailyDrawButton" class="daily-draw-button" type="button">'+escapeHtml(t('draw'))+'</button></div><div id="dailyResult" class="daily-result" aria-live="polite"><p class="daily-empty">'+escapeHtml(t('emptyDraw'))+'</p></div></div>'; 
  anchor.insertAdjacentElement('afterend', section);
  setDailyMode('daily');
}
function todayKey(){
  const now = new Date();
  return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
}
function seedNumber(value){
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
function seededPick(seed, count, max){
  const picks = [];
  let current = seed;
  while (picks.length < count && picks.length < max) {
    current = Math.imul(current ^ 0x9e3779b9, 1664525) + 1013904223;
    const index = (current >>> 0) % max;
    if (!picks.includes(index)) picks.push(index);
  }
  return picks;
}
const SPREAD_LAYOUTS = {
  daily: [[2,1],[4,1]],
  energy: [[2,1],[4,2]],
  achieved: [[1,1],[3,2],[5,1]],
  happening: [[1,2],[3,1],[5,2]],
  seed: [[1,1],[3,1],[5,1]],
  vision: [[1,2],[2,1],[3,2],[4,1]],
  fourWinds: [[2,2],[3,1],[4,2],[3,3]],
  windowState: [[1,1],[2,1],[3,1],[4,1]],
  progress: [[2,2],[3,1],[4,2],[3,3]],
  journey: [[1,1],[2,2],[3,1],[4,2]],
  strength: [[1,3],[2,2],[3,1],[4,1]],
  blindSpot: [[3,1],[4,2],[3,2],[4,1]],
  yesNoFive: [[5,1],[4,1],[3,1],[2,1],[1,1]],
  newRelationship: [[1,1],[5,1],[5,3],[1,3],[3,2]],
  moneyFive: [[1,3],[1,1],[3,2],[5,1],[5,3]],
  fiveMirror: [[2,3],[5,3],[2,1],[5,1],[3,1]],
  businessExpansion: [[1,1],[2,1],[3,1],[4,1],[5,1]],
  wheelFive: [[3,1],[5,2],[3,3],[1,2],[3,2]],
  pastPresentFutureFive: [[1,1],[2,1],[3,1],[4,1],[5,1]]
};
function randomPick(count, max){
  const picks = [];
  while (picks.length < count && picks.length < max) {
    const index = Math.floor(Math.random() * max);
    if (!picks.includes(index)) picks.push(index);
  }
  return picks;
}
function getSpreadCoordinates(mode, count){
  if (SPREAD_LAYOUTS[mode]) return SPREAD_LAYOUTS[mode];
  if (count === 2) return [[2,1],[4,1]];
  if (count === 3) return [[1,1],[3,2],[5,1]];
  if (count === 4) return [[1,2],[2,1],[3,2],[4,1]];
  return [[1,1],[2,1],[3,1],[4,1],[5,1]];
}
function setDailyMode(mode){
  const spread = localizedSpread(mode);
  const reader = document.querySelector('#dailyReader');
  if (!reader) return;
  reader.dataset.mode = mode;
  reader.querySelectorAll('[data-daily-mode]').forEach(button => button.classList.toggle('active', button.dataset.dailyMode === mode));
  reader.querySelector('#dailyCount').textContent = spread.positions.length + ' ' + t('card');
  reader.querySelector('#dailyIntro').textContent = spread.intro;
  reader.querySelector('#dailyPositions').innerHTML = spread.positions.map((item, index) => '<div class="daily-position"><span>'+(index + 1)+'</span><div><b>'+escapeHtml(item.title)+'</b><p>'+escapeHtml(item.text)+'</p></div></div>').join('') + (spread.note ? '<p class="daily-note">'+escapeHtml(spread.note)+'</p>' : '');
}
function drawDailyCards(){
  const reader = document.querySelector('#dailyReader');
  if (!reader) return;
  const mode = reader.dataset.mode || 'daily';
  const spread = localizedSpread(mode);
  const indexes = randomPick(spread.positions.length, state.allCards.length);
  const cards = indexes.map(index => state.allCards[index]);
  const result = reader.querySelector('#dailyResult');
  const coordinates = getSpreadCoordinates(mode, spread.positions.length);
  const board = '<div class="daily-spread-board daily-spread-'+spread.positions.length+'" data-spread="'+mode+'">'+cards.map((card, index) => {
    const coordinate = coordinates[index] || [index + 1, 1];
    const position = spread.positions[index];
    return '<button class="daily-spread-card" type="button" data-card-id="'+card.uid+'" style="grid-column:'+coordinate[0]+';grid-row:'+coordinate[1]+'"><span class="daily-spread-number">'+(index + 1)+'</span><span class="daily-card-image"><img src="'+(card.image || buildCardImage(card))+'" alt="'+escapeHtml(cardTitle(card))+'"></span><span class="daily-spread-name">'+escapeHtml(cardTitle(card))+'</span><span class="daily-spread-position">'+escapeHtml(position.title)+'</span></button>';
  }).join('')+'</div>';
  const meanings = '<div class="daily-meaning-list">'+cards.map((card, index) => {
    const position = spread.positions[index];
    const summary = contentText(card, 'overview') || contentText(card, 'legend') || (contentList(card, 'imageMeaning') || [])[0] || '';
    return '<button class="daily-result-card" type="button" data-card-id="'+card.uid+'"><span class="daily-card-copy"><small>'+escapeHtml(state.lang === 'en' ? 'Card ' : 'Lá ')+(index + 1)+' - '+escapeHtml(position.title)+'</small><strong>'+escapeHtml(cardTitle(card))+'</strong><em>'+escapeHtml(position.text)+'</em><span>'+escapeHtml(summary)+'</span></span></button>';
  }).join('')+'</div>';
  result.innerHTML = board + meanings;
}
els.search.addEventListener('input', event => { state.query = event.target.value.trim(); renderGrid(); });
els.filterBar.addEventListener('click', event => { const button = event.target.closest('[data-filter]'); if(!button) return; state.filter = button.dataset.filter; renderFilters(); renderGrid(); if (state.filter !== 'Tất cả' && els.energyResults) els.energyResults.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
document.addEventListener('click', event => { const langButton = event.target.closest('#languageToggle [data-lang]'); if(langButton){ state.lang = langButton.dataset.lang; updateStaticLanguage(); renderFilters(); renderToc(); renderGrid(); if(state.activeCard && !els.modal.hidden) renderModal(state.activeCard); return; } const modeButton = event.target.closest('[data-daily-mode]'); if(modeButton){ setDailyMode(modeButton.dataset.dailyMode); drawDailyCards(); } if(event.target.closest('#dailyDrawButton')) drawDailyCards(); });
document.addEventListener('click', event => { const tile = event.target.closest('[data-card-id]'); if(tile){ openByUid(tile.dataset.cardId); } if(event.target.closest('[data-close]')) closeModal(); });
document.addEventListener('keydown', event => { if(event.key === 'Escape' && !els.modal.hidden) closeModal(); });
createLanguageToggle(); renderFilters(); renderToc(); renderGrid(); createDailyReader(); updateStaticLanguage();
