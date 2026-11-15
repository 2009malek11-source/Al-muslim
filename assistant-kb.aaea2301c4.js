(function () {
    'use strict';
    // معرفة المساعد بكل الأقسام والإعدادات + أزرار الاستعانة بمساعد ذكاء اصطناعي خارجي لغير الفتاوى.
    var AD = '٠١٢٣٤٥٦٧٨٩';
    function norm(s) {
        return String(s || '').replace(/[٠-٩]/g, function (d) { return AD.indexOf(d); })
            .replace(/[ً-ٰٟـ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
            .replace(/[^؀-ۿa-zA-Z0-9\s]/g, ' ').toLowerCase().replace(/\s+/g, ' ').trim();
    }
    function bare(w) { return w.replace(/^(وال|بال|لل|ال|و)(?=.{3,})/, ''); }
    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    var FIQH = /(ما حكم|حكم |يجوز|لا يجوز|هل يجوز|حلال|حرام|فتوي|فتوى|افتني|يبطل|تبطل|كفاره|هل يصح|هل تصح|مباح|مكروه|يفطر|مفطر|نجس|طهاره|طلاق|ربا|زكاه|ميراث|نصاب|مذهب|شرعا|بدعه|كفر|شرك|اثم|ذنب|تفسير ايه|معني ايه)/;
    var STOP = {};
    'كيف اين وين ما ماذا هي هو في من على الي عن هل لو سمحت ارجوك اريد ابي ابغي اعرف اشرح شرح لي لنا يا مساعد المسلم التطبيق الموقع هذا هذه ممكن اقدر استطيع يوجد توجد عندكم لديكم فيه فيها قسم ميزه ميزات خاصيه افتح'.split(' ').forEach(function (w) { STOP[w] = 1; });

    // معرفة مكتوبة يدويًا لكل ما في الموقع. [معرّف الصفحة، العنوان، الكلمات، الشرح، (اختياري) نص الزر]
    var KB = [
        ['home', 'الصفحة الرئيسية', 'رئيسيه بدايه بطاقات اقسام الصفحه الرئيسيه', 'فيها بطاقات كل الأقسام (القرّاء، الأذكار، القبلة، المساجد…) وبطاقة مواقيت الصلاة. يمكنك من الإعدادات ← «البدء والتنقّل» إخفاء أي قسم من الرئيسية أو اختيار الصفحة التي يفتح عليها التطبيق.'],
        ['prayer', 'مواقيت الصلاة', 'مواقيت اوقات صلاه فجر ظهر عصر مغرب عشاء الاذان القادمه العد التنازلي', 'تظهر أوقات الصلوات الخمس لموقعك مع الصلاة القادمة وعدّ تنازلي. الحساب فلكي داخل التطبيق دون إنترنت. من الإعدادات ← «مواقيت الصلاة» تختار طريقة الحساب ووقت العصر وتعدّل الدقائق لتوافق مسجدك.'],
        ['readers', 'القرّاء والتلاوات', 'قراء قارئ تلاوات تلاوه سوره استماع شيخ مقرئ رواية حفص ورش قالون تحميل', 'مكتبة كبيرة من القرّاء بروايات متعددة. اختر القارئ ثم السورة وستستمع، ويمكنك تحميل السورة للاستماع دون إنترنت، وإضافة القارئ للمفضلة. جرّب السؤال: «شغّل سورة الكهف بصوت المعيقلي».'],
        ['repeatAyah', 'تكرار الآية', 'تكرار ايه ايات حفظ مراجعه كرر ترديد', 'لحفظ القرآن: اختر السورة ونطاق الآيات والقارئ وعدد التكرار، ثم يكرر التطبيق كل آية حتى توقفه. الإعدادات ← «تكرار الآية» لتحديد الافتراضي.'],
        ['khatmah', 'ختمة القرآن', 'ختمه ختمتي خطه يوميه ورد سلسله ايام سجل', 'خطة يومية لختم القرآن مع سلسلة أيام وسجل واستماع لورد اليوم.'],
        ['ruqyah', 'الرقية الشرعية', 'رقيه رقيه شرعيه تلاوات رقيه ايات الرقيه', 'تسجيلات بشرية فقط (آيات الرقية بأصوات قرّاء وتسجيلات كاملة). لا نستخدم صوتًا مولّدًا.'],
        ['adhkar', 'الأذكار والأدعية', 'اذكار ادعيه دعاء صباح مساء نوم استيقاظ طعام سفر مسجد', 'أذكار الصباح والمساء والنوم وغيرها، مع تحكم في حجم الخط والتباعد والمحاذاة من الإعدادات ← «الأذكار والأدعية»، وإضافة أي ذكر للمفضلة.'],
        ['hadith', 'الأحاديث', 'احاديث حديث صحيح بخاري مسلم السنه رياض الصالحين', 'أحاديث من مجموعات موثوقة للقراءة والحفظ والمفضلة. حجم الخط من الإعدادات ← «الأحاديث».'],
        ['mushaf107', 'مصحف القرآن', 'مصحف مصحف قران قراءه صفحه جزء سوره خط وضع القراءه ملء الشاشه علامه ورد', 'مصحف بخط المدينة المنورة: اختر السورة أو الجزء أو الصفحة. «وضع القراءة» يملأ الشاشة كاملة وفيه تكبير وتصغير وتنقل وخروج. تستطيع تنزيله كاملًا ليعمل دون إنترنت، وتضع علامة 🔖 على أي صفحة، وتحدد وردك اليومي بالصفحات وتتابع تقدمك.'],
        ['qibla', 'القبلة', 'قبله اتجاه بوصله كعبه', 'بوصلة القبلة تعتمد على موقعك وحسّاس الاتجاه في جهازك. الأفضل أن تبتعد عن المعادن والمغناطيس وتحرّك الجهاز على شكل ٨ لمعايرته. الدقة تعتمد على جهازك.'],
        ['mosques', 'المساجد القريبة', 'مساجد مسجد قريب اقرب مسجد مصليات', 'يبحث عن المساجد ومصليات النساء حولك من خرائط OpenStreetMap بعد إذنك لموقعك، ويعرض الأقرب أولًا.'],
        ['manasik', 'المناسك والتقويم الهجري', 'مناسك تقويم هجري تاريخ مناسبات حج عمره رمضان عيد', 'تقويم هجري بمناسباته، ودليل الحج والعمرة. يمكنك تعديل التاريخ الهجري يومًا لموافقة رؤية الهلال في بلدك من الإعدادات.'],
        ['daily', 'أعمال اليوم', 'اعمال اليوم طاعات تذكيرات ورد يومي ليله', 'أعمال وتذكيرات مرتبطة بالوقت الحالي؛ تختار من الإعدادات ما يظهر لك.'],
        ['modes', 'الأوضاع', 'اوضاع وضع النوم وضع الصباح وضع المساء تشغيل متتالي مؤقت نوم', 'اختر وضعًا (نوم، صباح، مساء، رقية، سفر…) فيعمل كل ما فيه متتاليًا تلقائيًا، مع مؤقت نوم يخفض الصوت ثم يتوقف.'],
        ['children', 'عالم الأطفال', 'اطفال طفل قصص اسئله تعليم', 'قسم للأطفال: قصص ممتعة وأسئلة تفاعلية تساعد على التعلم.'],
        ['favorites', 'المفضلة', 'مفضله مفضلة نجمه نجمة حفظ', 'اضغط النجمة ★ على أي قارئ أو حديث أو ذكر لإضافته، واضغطها مرة أخرى للإزالة. تجد كل شيء في «المفضلة» مقسّمًا حسب النوع.'],
        ['downloads', 'تنزيلاتي', 'تنزيلات تحميلات محمل حذف مساحه', 'كل ما حمّلته للاستماع دون إنترنت، وتستطيع حذفه واحدًا واحدًا هنا.'],
        ['travel', 'وضع السفر', 'سفر مسافر رحله ادعيه السفر', 'أذكار السفر وأدعيته وما يلزم المسافر من تعديل لموقع الصلاة.'],
        ['tools120', 'أدوات المسلم', 'مسبحه تسبيح عداد تسبيح ذكر دفتر ادعيه دعائي متابعه صلوات صلواتي سجل صلاه', 'ثلاث أدوات: 📿 مسبحة إلكترونية (اختيار الذكر والهدف وتراجع وإحصاء يومي)، 🕌 متابعة صلواتك اليومية مع رسم لآخر ٧ أيام، 🤲 دفتر أدعيتي الشخصي. كلها محفوظة على جهازك فقط.'],
        ['settings', 'الإعدادات', 'اعدادات ضبط تخصيص', 'الإعدادات مرتبة في أقسام قابلة للطي: المظهر، المواقيت، الأذان والإشعارات، المصحف، الأحاديث، القرّاء، الأذكار، الأوضاع، تكرار الآية، التقويم، أعمال اليوم، القبلة والمساجد، البدء والتنقل، التخزين، عن التطبيق، المصادر.'],
        ['assistant', 'مساعد المسلم', 'مساعد سؤال ذكاء اصطناعي', 'أفتح لك الأقسام وأشغّل القرّاء وأشرح الميزات والإعدادات. لا أجيب عن الفتاوى والأحكام، ولأي سؤال عام يمكنني تحويله لمساعد ذكاء اصطناعي تختاره.']
    ];
    // أسئلة «كيف» الشائعة بإجابات جاهزة
    var HOW = [
        [/(تحديث|تحدث|اخر نسخه|نسخه جديده)/, '🔄 يتحدث التطبيق تلقائيًا عند الدخول (في أول ثوانٍ). وللتحديث اليدوي: الإعدادات ← «البدء والتنقّل» أو «عن التطبيق» ← «التحقق من التحديث». إن لم يتغير شيء اضغط «فرض التحديث».', 'settings'],
        [/(دون انترنت|بدون انترنت|اوفلاين|offline|بدون نت|لا يوجد نت)/, '📶 بعد أول فتح يعمل هيكل التطبيق دون إنترنت. المصحف يلزمه «تنزيل المصحف» مرة واحدة (من صفحة المصحف) ثم يعمل دون نت. التلاوات تُحمَّل واحدة واحدة من صفحة القارئ ثم تجدها في «تنزيلاتي».', 'mushaf107'],
        [/(مفضله|نجمه)/, '⭐ اضغط النجمة على أي عنصر ليُضاف، واضغطها مجددًا لإزالته، ثم افتح «المفضلة» من الرئيسية.', 'favorites'],
        [/(حواف|استداره|زوايا)/, '🎨 الإعدادات ← «المظهر» ← «استدارة الحواف»: مؤشر من ٠ (حادّة) إلى ٤٠ (دائرية) يغيّر كل الأزرار والبطاقات.', 'settings'],
        [/(حجم الخط|تكبير الخط|الخط)/, '🔠 الإعدادات ← «المظهر» ← «حجم الخط». وللأذكار والأحاديث إعدادات خط خاصة في أقسامها، وللمصحف أزرار A+ و A− داخل وضع القراءة.', 'settings'],
        [/(ملء الشاشه|وضع القراءه|ملئ الشاشه)/, '📖 افتح «المصحف» ثم اختر أي صفحة؛ يدخل وضع القراءة بملء الشاشة. في الأعلى زر الرجوع، وفي الأسفل أزرار الصفحة والجزء وزر «خروج».', 'mushaf107'],
        [/(اذان|اقامه|المؤذن|تنبيه|اشعار)/, '🔔 الإعدادات ← «الأذان والإشعارات»: اختر المؤذّن ونوع التنبيه والصلوات التي تنبَّه لها ومستوى الصوت. إقامة «قد قامت الصلاة» مقطع قصير مخصص. التنبيهات في الخلفية تعتمد على نظام جهازك وقد تُقيَّد لتوفير البطارية، فجرّب «اختبار التنبيه».', 'settings'],
        [/(نسخه احتياطيه|تصدير|استيراد|نقل البيانات)/, '💾 الإعدادات ← «التخزين والتنزيلات والنسخ الاحتياطي»: «تصدير بياناتك» ينشئ ملفًا بمفضلتك وإعداداتك، و«استيراد نسخة» يعيدها على أي جهاز.', 'settings'],
        [/(ثبت|تثبيت|ايقونه|شاشه رئيسيه)/, '📲 من متصفحك: «إضافة إلى الشاشة الرئيسية» (آيفون: زر المشاركة ثم «إضافة إلى الشاشة الرئيسية»)، وعلى أندرويد/الكمبيوتر خيار «تثبيت التطبيق».', 'install'],
        [/(الموقع|اذن الموقع|gps)/, '📍 لا نطلب موقعك إلا عند القبلة أو المساجد أو حساب المواقيت، ولا نستخدمه في الخلفية. ولا يُرسل لأي خادم خاص بنا.', 'settings'],
        [/(حساب|بياناتي|خصوصيه|امان)/, '🔒 لا حسابات ولا خوادم: كل بياناتك (المفضلة والإعدادات والتقدم) على جهازك فقط.', 'settings']
    ];

    function scanSettings() {
        var out = [];
        var cats = document.querySelectorAll('#settings details.stgCat');
        cats.forEach(function (c) {
            var sm = c.querySelector('summary'), cname = sm ? sm.textContent.replace(/[▾▸]/g, '').trim() : '';
            c.querySelectorAll('.stgRow').forEach(function (r) {
                var b = r.querySelector('b'), s = r.querySelector('small');
                if (!b) return;
                out.push({ cat: c.id, catName: cname, title: b.textContent.trim(), desc: s ? s.textContent.trim() : '', el: r });
            });
        });
        return out;
    }
    function tokens(q) {
        return norm(q).split(' ').map(bare).filter(function (w) { return w.length >= 2 && !STOP[w] && !STOP[bare(w)]; });
    }
    function scoreText(tk, txt) {
        var t = ' ' + norm(txt) + ' ', sc = 0;
        tk.forEach(function (w) { if (t.indexOf(' ' + w) >= 0 || t.indexOf(w) >= 0) sc++; });
        return sc;
    }
    function openSetting(cat, rowText) {
        try {
            show('settings');
            setTimeout(function () {
                var d = document.getElementById(cat); if (!d) return;
                d.open = true;
                var g = d.querySelector('.stgGroup'); if (g) g.classList.add('open');
                var row = null;
                d.querySelectorAll('.stgRow').forEach(function (r) { var b = r.querySelector('b'); if (!row && b && b.textContent.trim() === rowText) row = r; });
                var el = row || d;
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.style.outline = '3px solid #c8a15b'; setTimeout(function () { el.style.outline = ''; }, 2600);
            }, 200);
        } catch (e) { }
    }
    window.v120OpenSetting = openSetting;
    function btnOpen(id, label) { return '<button type="button" class="v103Go" onclick="show(\'' + id + '\')">' + esc(label || 'افتح القسم') + '</button>'; }
    function btnSet(cat, row, label) { return '<button type="button" class="v103Go" onclick="window.v120OpenSetting(\'' + cat + '\',\'' + String(row).replace(/'/g, '') + '\')">' + esc(label || 'افتح هذا الإعداد') + '</button>'; }

    function kbAnswer(q) {
        var n = norm(q);
        var tk = tokens(q);
        for (var i = 0; i < HOW.length; i++) if (HOW[i][0].test(n)) return '<div>' + HOW[i][1] + '</div>' + (HOW[i][2] ? btnOpen(HOW[i][2], 'افتح') : '');
        if (/(ماذا|ما) (فيه|فيها|يوجد|يحتوي|ميزات|هي ميزات)|ميزات|وش فيه|ايش فيه|ماذا يقدم|ماذا تقدم/.test(n) && !tk.length) {
            return '✨ في المسلم: ' + KB.filter(function (k) { return ['home', 'assistant'].indexOf(k[0]) < 0; }).map(function (k) { return esc(k[1]); }).join(' • ') + '.<br>اسألني عن أي قسم وسأشرحه لك.';
        }
        if (!tk.length) return null;
        var best = [], bs = 0;
        KB.forEach(function (k) {
            var sc = scoreText(tk, k[1]) * 3 + scoreText(tk, k[2]);
            if (sc > 0) best.push({ k: k, sc: sc });
        });
        best.sort(function (a, b) { return b.sc - a.sc; });
        var sets = scanSettings().map(function (s) { return { s: s, sc: scoreText(tk, s.title) * 3 + scoreText(tk, s.desc) }; }).filter(function (x) { return x.sc > 0; }).sort(function (a, b) { return b.sc - a.sc; });
        var wantSetting = /(اعداد|ضبط|اغير|غير|تغيير|تعديل|خيار)/.test(n);
        var out = [];
        if (wantSetting && sets.length && (!best.length || sets[0].sc >= best[0].sc / 2)) {
            sets.slice(0, 3).forEach(function (x) { out.push('⚙️ <b>' + esc(x.s.title) + '</b> — في «' + esc(x.s.catName) + '»' + (x.s.desc ? ': ' + esc(x.s.desc) : '') + '<br>' + btnSet(x.s.cat, x.s.title)); });
            return out.join('<hr class="v103hr">');
        }
        if (best.length && best[0].sc >= 2) {
            var k = best[0].k;
            out.push('<b>' + esc(k[1]) + '</b><div>' + esc(k[3]) + '</div>' + btnOpen(k[0]));
            if (sets.length && sets[0].sc >= 2) out.push('⚙️ ذو صلة في الإعدادات: <b>' + esc(sets[0].s.title) + '</b> (' + esc(sets[0].s.catName) + ') ' + btnSet(sets[0].s.cat, sets[0].s.title));
            return out.join('<hr class="v103hr">');
        }
        if (sets.length && sets[0].sc >= 2) {
            var x = sets[0].s;
            return '⚙️ <b>' + esc(x.title) + '</b> — في «' + esc(x.catName) + '»' + (x.desc ? ': ' + esc(x.desc) : '') + '<br>' + btnSet(x.cat, x.title);
        }
        return null;
    }

    // ---- الاستعانة بمساعد ذكاء اصطناعي خارجي (لغير الفتاوى)
    var GK = 'muslim-gemini-key';
    function getKey() { try { return localStorage.getItem(GK) || ''; } catch (e) { return ''; } }
    function aiPrompt(q) {
        return 'أجب بالعربية وباختصار. إن كان السؤال في حكم شرعي أو فتوى فاعتذر وأحِل السائل إلى أهل العلم الثقات ولا تُفتِ. السؤال: ' + q;
    }
    function aiButtons(q) {
        var p = encodeURIComponent(aiPrompt(q));
        var h = '<div class="mini" style="margin-top:8px">لسؤال عام خارج التطبيق يمكنك سؤال مساعد ذكاء اصطناعي (يفتح موقعه، وهو يخضع لسياسته):</div><div class="v103Chips">' +
            '<a class="v103Go" target="_blank" rel="noopener noreferrer" href="https://chatgpt.com/?q=' + p + '">ChatGPT</a>' +
            '<a class="v103Go" target="_blank" rel="noopener noreferrer" href="https://claude.ai/new?q=' + p + '">Claude</a>' +
            '<a class="v103Go" target="_blank" rel="noopener noreferrer" href="https://www.google.com/search?udm=50&q=' + p + '">Google AI</a>' +
            '<button type="button" class="v103Go" data-v120gem="' + esc(q) + '">Gemini</button></div>';
        return h;
    }
    function askGemini(q, cb) {
        var key = getKey();
        if (!key) { cb(null, 'nokey'); return; }
        var ctl = new AbortController(), to = setTimeout(function () { ctl.abort(); }, 20000);
        fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent', {
            method: 'POST', signal: ctl.signal,
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: 'أنت مساعد لموقع «المسلم». أجب بالعربية وباختصار. لا تُفتِ في أي حكم شرعي ولا تفسّر الآيات؛ اعتذر وأحِل السائل إلى أهل العلم الثقات. لا تُجرِ حسابات دينية كالزكاة.' }] },
                contents: [{ role: 'user', parts: [{ text: q }] }]
            })
        }).then(function (r) { return r.json(); }).then(function (j) {
            clearTimeout(to);
            var t = j && j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts && j.candidates[0].content.parts.map(function (p) { return p.text || ''; }).join('');
            cb(t || null, t ? '' : 'empty');
        }).catch(function () { clearTimeout(to); cb(null, 'err'); });
    }
    document.addEventListener('click', function (e) {
        var b = e.target.closest && e.target.closest('[data-v120gem]');
        if (!b) return;
        var q = b.getAttribute('data-v120gem'), m = document.getElementById('v103Msgs');
        function add(html) { if (!m) return; var d = document.createElement('div'); d.className = 'v103Msg bot'; d.innerHTML = html; m.appendChild(d); m.scrollTop = m.scrollHeight; }
        if (!getKey()) {
            add('لربط Gemini داخل التطبيق: أنشئ مفتاحًا مجانيًا من <a target="_blank" rel="noopener noreferrer" href="https://aistudio.google.com/apikey">Google AI Studio</a> وألصقه هنا. يُحفظ على جهازك فقط ولا يخرج إلا إلى Google عند السؤال.<form id="v120KeyForm" class="v103Form"><input id="v120Key" class="field" type="password" autocomplete="off" placeholder="الصق المفتاح هنا"><button class="primary" type="submit">حفظ</button></form><div class="mini">إن لم ترغب، استخدم أزرار ChatGPT أو Claude أو Google AI.</div>');
            return;
        }
        add('<span class="mini">⏳ أسأل Gemini…</span>');
        askGemini(q, function (t, err) {
            var last = m && m.lastElementChild; if (last) last.remove();
            if (t) add(esc(t).replace(/\n/g, '<br>') + '<div class="mini">إجابة من نموذج ذكاء اصطناعي قد تخطئ؛ لا تعتمد عليها في أمور الدين.</div>');
            else add('تعذّر الحصول على إجابة من Gemini (' + (err === 'err' ? 'تحقق من الاتصال أو المفتاح' : 'رد فارغ') + '). جرّب الأزرار الأخرى. <button type="button" class="v103Go" data-v120clear="1">حذف المفتاح المحفوظ</button>');
        });
    });
    document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('[data-v120clear]')) { try { localStorage.removeItem(GK); } catch (x) { } } });
    document.addEventListener('submit', function (e) {
        if (!e.target || e.target.id !== 'v120KeyForm') return;
        e.preventDefault();
        var v = (document.getElementById('v120Key').value || '').trim();
        if (v.length < 20) return;
        try { localStorage.setItem(GK, v); } catch (x) { }
        e.target.outerHTML = '<div>✅ حُفظ المفتاح على جهازك. اضغط «Gemini» تحت سؤالك مرة أخرى.</div>';
    });

    var REFUSE = 'عذرًا، لا أستطيع الإجابة عن الأمور الفقهية والأحكام والفتاوى ولا تفسير الآيات. يُرجى سؤال أهل العلم الثقات أو جهة الإفتاء الرسمية في بلدك. 🤍 ويسعدني مساعدتك في أي شيء داخل التطبيق.';
    function install() {
        var prev = window.v105Ask;
        if (typeof prev !== 'function' || prev.__kb) return !!(prev && prev.__kb);
        var w = async function (q, legacy) {
            var n = norm(q);
            if (FIQH.test(n)) return REFUSE;
            var r = null;
            try { r = kbAnswer(q); } catch (e) { console.warn('kb', e); }
            // الأوامر الصريحة (افتح/شغّل) لها أولوية على الشرح
            var cmd = null;
            try { cmd = window.v115Cmd && window.v115Cmd.parse(q); } catch (e) { }
            if (cmd) return prev.call(this, q, legacy);
            if (r) return r;
            var p = await prev.call(this, q, legacy);
            if (typeof p === 'string' && /^لم أجد/.test(p.replace(/<[^>]+>/g, ''))) return p + aiButtons(q);
            return p;
        };
        w.__kb = 1; window.v105Ask = w; return true;
    }
    window.v120KB = { answer: kbAnswer, norm: norm, install: install, size: KB.length };
    function tryInstall() { if (!install()) setTimeout(tryInstall, 400); }
    if (document.readyState === 'complete') setTimeout(tryInstall, 600); else window.addEventListener('load', function () { setTimeout(tryInstall, 800); });
})();
