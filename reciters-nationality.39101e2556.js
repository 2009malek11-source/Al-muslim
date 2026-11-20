/* reciters-nationality.js — جنسية القارئ داخل صفحته فقط (اسم الدولة + علمها كرسم SVG)
 * القاعدة: لا تُعرض جنسية إلا إذا كان الاسم معروفاً في الجدول (لا تخمين). لا جنسية لأحمد خضر/الطرابلسي عمداً: المصادر متضاربة.
 * لإضافة قارئ: أضف مفتاح اسمه بلا مسافات إلى الدولة في T/MORE، أو ضع nat:'LY' في تعريفه. */
(function () {
    'use strict';
    var R = '#ce1126', G = '#007a3d', W = '#fff', K = '#111';
    function f(inner) { return '<svg class="mFlag" viewBox="0 0 30 20" aria-hidden="true" focusable="false"><clipPath id="fc"><rect width="30" height="20" rx="2.5"/></clipPath><g clip-path="url(#fc)">' + inner + '</g><rect width="30" height="20" rx="2.5" fill="none" stroke="rgba(0,0,0,.25)"/></svg>'; }
    function h3(a, b, c) { return '<rect width="30" height="6.7" fill="' + a + '"/><rect y="6.7" width="30" height="6.7" fill="' + b + '"/><rect y="13.3" width="30" height="6.7" fill="' + c + '"/>'; }
    var C = {
        SA: ['سعودي', 'السعودية', f('<rect width="30" height="20" fill="#006c35"/><path d="M8 6.5h14M9.5 8.7h11M8.5 10.8h13" stroke="#fff" stroke-width="1.1" stroke-linecap="round"/><path d="M7.5 14.2h15" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/><path d="M8 14.2h-1.2v1.4h1.2zM22 14.2h2" stroke="#fff" stroke-width="1" fill="#fff"/>')],
        EG: ['مصري', 'مصر', f(h3(R, W, K) + '<circle cx="15" cy="10" r="2.2" fill="#c09300"/>')],
        KW: ['كويتي', 'الكويت', f(h3(G, W, R) + '<path d="M0 0L8 6.7V13.3L0 20Z" fill="' + K + '"/>')],
        LY: ['ليبي', 'ليبيا', f('<rect width="30" height="20" fill="' + K + '"/><rect width="30" height="5" fill="' + R + '"/><rect y="15" width="30" height="5" fill="' + G + '"/><circle cx="14.5" cy="10" r="3.3" fill="#fff"/><circle cx="15.5" cy="10" r="2.8" fill="' + K + '"/><circle cx="17.3" cy="10" r=".9" fill="#fff"/>')],
        MA: ['مغربي', 'المغرب', f('<rect width="30" height="20" fill="#c1272d"/><path d="M15 5.6l1.6 4.8-4.1-3h5l-4.1 3z" fill="none" stroke="#006233" stroke-width="1"/>')],
        DZ: ['جزائري', 'الجزائر', f('<rect width="15" height="20" fill="#006233"/><rect x="15" width="15" height="20" fill="#fff"/><circle cx="15.2" cy="10" r="4.3" fill="#d21034"/><circle cx="16.4" cy="10" r="3.5" fill="#fff"/><circle cx="17.6" cy="10" r="1.1" fill="#d21034"/>')],
        AE: ['إماراتي', 'الإمارات', f('<rect width="30" height="20" fill="#fff"/><rect width="30" height="6.7" fill="#00732f"/><rect y="13.3" width="30" height="6.7" fill="' + K + '"/><rect width="8" height="20" fill="#ff0000"/>')],
        TD: ['تشادي', 'تشاد', f('<rect width="10" height="20" fill="#002664"/><rect x="10" width="10" height="20" fill="#fecb00"/><rect x="20" width="10" height="20" fill="#c60c30"/>')],
        IQ: ['عراقي', 'العراق', f(h3(R, W, K) + '<rect x="9" y="8.6" width="12" height="2.8" rx="1" fill="#007a3d"/>')],
        YE: ['يمني', 'اليمن', f(h3(R, W, K))],
        SD: ['سوداني', 'السودان', f(h3(R, W, K) + '<path d="M0 0L12 10L0 20Z" fill="' + G + '"/>')],
        TN: ['تونسي', 'تونس', f('<rect width="30" height="20" fill="#e70013"/><circle cx="15" cy="10" r="5.2" fill="#fff"/><circle cx="14.7" cy="10" r="3.4" fill="#e70013"/><circle cx="15.6" cy="10" r="2.8" fill="#fff"/><circle cx="15.9" cy="10" r="1.6" fill="#e70013"/>')],
        QA: ['قطري', 'قطر', f('<rect width="30" height="20" fill="#8a1538"/><path d="M0 0H9L12 1.43 9 2.86 12 4.29 9 5.71 12 7.14 9 8.57 12 10 9 11.43 12 12.86 9 14.29 12 15.71 9 17.14 12 18.57 9 20H0Z" fill="#fff"/>')]
    };
    function norm(s) { return String(s || '').replace(/[ً-ٰٟـ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي').replace(/[^؀-ۿ0-9a-zA-Z]/g, ''); }
    // مفاتيح بعد التطبيع (بلا مسافات). الأطول أولاً تلقائياً.
    var T = {
        SA: ['عبدالرحمنالسديس', 'السديس', 'سعودالشريم', 'الشريم', 'ماهرالمعيقلي', 'المعيقلي', 'سعدالغامدي', 'ياسرالدوسري', 'عليالحذيفي', 'احمدالحذيفي', 'الحذيفي', 'صلاحالبدير', 'البدير', 'بندربليله', 'عليجابر', 'ناصرالقطامي', 'عبدالمحسنالقاسم', 'عبدالمحسنالحارثي', 'خالدالجليل', 'احمدالعجمي', 'عبداللهالجهني', 'عبداللهعوادالجهني', 'عبداللهبصفر', 'محمداللحيدان', 'محمدايوب', 'محمدالبراك', 'ابراهيمالاخضر', 'عبدالباريالثبيتي', 'صالحالطالب', 'خالدالقحطاني', 'عبداللهالموسي', 'اسامهخياط', 'عبداللهخياط', 'فيصلغزاوي', 'ماجدالزامل', 'عبدالعزيزالزهراني', 'محمدالمحيسني'],
        KW: ['مشاريراشدالعفاسي', 'مشاريالعفاسي', 'العفاسي', 'فهدالكندري', 'نبيلالرفاعي', 'عبداللهالكندري', 'صلاحالهاشم', 'ياسرالفيلكاوي'],
        EG: ['عبدالباسطعبدالصمد', 'عبدالباسط', 'محمودخليلالحصري', 'الحصري', 'المنشاوي', 'مصطفىاسماعيل', 'مصطفياسماعيل', 'محمودعليالبنا', 'الطبلاوي', 'محمدرفعت', 'الشعشاعي', 'ياسرسلامه', 'محمدجبريل', 'ابوالعينينشعيشع', 'شعيشع', 'السيدسعيد', 'الشحاتانور', 'احمدنعينع', 'نعينع', 'احمدعامر', 'راغبمصطفىغلوش', 'راغبمصطفيغلوش', 'طهالفشني', 'الفشني', 'كامليوسفالبهتيمي', 'البهتيمي', 'عليحجاجالسويسي', 'عبدالرحمنمسعد', 'عبدالعظيمزاهر', 'محمودالخشت', 'السيدمتولي'],
        LY: ['نورالدينالمسلاتي', 'المسلاتي', 'مصطفىالفرجاني', 'مصطفيالفرجاني', 'وليدالنائحي', 'النائحي'],
        MA: ['عمرالقزابري', 'القزابري', 'العيونالكوشي'], DZ: ['ياسينالجزائري'],
        AE: ['هزاعالبلوشي', 'صلاحبوخاطر'], TD: ['ادريسابكر'], IQ: ['رعدالكردي', 'رعدمحمدالكردي'],
        YE: ['عبدالوليالاركاني', 'وديعاليمني'], SD: ['نورينمحمدصديق', 'الزينمحمداحمد', 'الفاتحمحمدالزبير']
    };
    var MORE = {
        SA: ['فارسعباد', 'عبدالباريالثبيتي', 'الثبيتي', 'صلاحالبدير', 'البدير', 'خالدالغامدي', 'ابراهيمالاخضر', 'عبدالعزيزالزهراني', 'عبداللهخياط', 'عبدالمحسنالقاسم', 'محمداللحيدان', 'احمدبنعليالعجمي', 'العجمي', 'عادلالكلباني', 'ناصرالقطامي', 'القطامي', 'توفيقالصائغ', 'سهلياسين', 'صالحالطالب', 'احمدالحذيفي', 'محمدالمحيسني', 'المحيسني', 'محمدايوب', 'هانيالرفاعي', 'ابراهيمالجبرين', 'بندربليله', 'عمادزهيرحافظ', 'عبدالكريمالحازمي', 'عبدالودودحنيف', 'محمدجبريل'],
        EG: ['محمدالطبلاوي', 'الطبلاوي', 'احمدنعينع', 'محمودعليالبنا', 'شوقيحامد', 'محمداسماعيلالمقدم', 'عبدالمنعمعبدالمبدي', 'محمدعبدالكريم', 'عليحجاجالسويسي', 'حاتمفريد'],
        IQ: ['مصطفىالعزاوي', 'عبدالرزاقالدليمي', 'بيشهواقادرالكردي'], AE: ['خليفهالطنيجي'],
        SA2: ['بدرالتركي', 'احمدالسويلم', 'ابراهيمالجرمي', 'ابراهيمكشيدان', 'احمدطالببنحميد', 'ابوبكرالشاطري'],
        EG2: ['الحسينيالعزازي', 'اسلامصبحي', 'احمدصابر', 'احمدعيسىالمعصراوي', 'احمدعيسيالمعصراوي', 'ايمنرشديسويد', 'العشريعمران'],
        KW2: ['احمدالنفيس'], LY2: ['الدوكاليمحمدالعالم']
    };
    Object.keys(MORE).forEach(function (c) { T[c.replace(/2$/, '')] = (T[c.replace(/2$/, '')] || []).concat(MORE[c]); });
    var ORDERED = [];
    Object.keys(T).forEach(function (c) { T[c].forEach(function (k) { ORDERED.push([k, c]); }); });
    ORDERED.sort(function (a, b) { return b[0].length - a[0].length; });
    function lookup(name, rec) {
        if (rec && rec.nat && C[rec.nat]) return C[rec.nat];
        var n = norm(String(name || '').replace('⭐', ''));
        if (!n) return null;
        for (var i = 0; i < ORDERED.length; i++) if (n.indexOf(ORDERED[i][0]) >= 0) { var c = ORDERED[i][1]; return C[c]; }
        return null;
    }
    window.MuslimNat = { lookup: lookup, table: T, countries: C };

    function $(id) { return document.getElementById(id); }
    function profile() {
        var p = $('readerProfile'); if (!p || typeof currentReader === 'undefined' || !currentReader) return;
        var mine = p.querySelector('.mNatP'), n = lookup(currentReader.name, currentReader);
        if (!n) { if (mine) mine.remove(); return; }
        if (mine && mine.getAttribute('data-r') === String(currentReader.id)) return;
        if (mine) mine.remove();
        var d = document.createElement('div'); d.className = 'mNatP'; d.setAttribute('data-r', String(currentReader.id));
        d.innerHTML = '<span class="mNatL">الجنسية</span>' + n[2] + '<b>' + n[1] + '</b><span class="mNatD">(' + n[0] + ')</span>';
        var h = p.querySelector('h3') || p.firstElementChild;
        if (h && h.parentNode) h.parentNode.insertBefore(d, h.nextSibling); else p.appendChild(d);
    }
    function init() {
        var el = $('readerProfile'); if (!el) return;
        var t = 0;
        function run() { clearTimeout(t); t = setTimeout(function () { try { profile(); } catch (e) { } }, 80); }
        new MutationObserver(run).observe(el, { childList: true, subtree: true }); run();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
