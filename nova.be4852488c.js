/* nova.js — الواجهة الجديدة: رأس، شريط سفلي/قائمة جانبية، بطل الصفحة الرئيسية، بطاقات الأقسام، أوقات الصلاة وآية اليوم.
 * يُبنى فوق الأقسام الموجودة دون تغيير وظائفها؛ الأيقونات كلها SVG أصلية مرسومة هنا. */
(function () {
    'use strict';
    var $ = function (i) { return document.getElementById(i); };
    function ls(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

    /* ---------- الأيقونات ---------- */
    var F = ' class="f"';
    var beads = (function () { var o = ''; for (var i = 0; i < 9; i++) { var a = (i / 9) * Math.PI * 2 - Math.PI / 2; o += '<circle cx="' + (12 + 6.4 * Math.cos(a)).toFixed(2) + '" cy="' + (10.5 + 6.4 * Math.sin(a)).toFixed(2) + '" r="1.55"' + F + '/>'; } return o + '<path d="M12 17.6v2.1"/><path d="M12 19.7c-1 .9-1 1.8 0 1.8s1-.9 0-1.8z"' + F + '/>'; })();
    var IC = {
        home: '<path d="M4 11.2 12 4l8 7.2V19a1.5 1.5 0 0 1-1.5 1.5h-3.2v-5H8.7v5H5.5A1.5 1.5 0 0 1 4 19z"' + F + '/><path d="M9.6 20.5v-4.8"/>',
        quran: '<path d="M12 6.4C10 4.9 7 4.5 4 4.9v13c3-.4 6 0 8 1.6 2-1.6 5-2 8-1.6v-13c-3-.4-6 0-8 1.5z"' + F + '/><path d="M12 6.4v13.1M6.8 8.5c1.2 0 2.3.2 3.3.7M6.8 11.9c1.2 0 2.3.2 3.3.7M17.2 8.5c-1.2 0-2.3.2-3.3.7M17.2 11.9c-1.2 0-2.3.2-3.3.7"/>',
        prayer: '<circle cx="12" cy="12" r="8.6"' + F + '/><path d="M12 7.3V12l3.2 2"/><path d="M12 2.6v1.5M12 19.9v1.5M2.6 12h1.5M19.9 12h1.5"/>',
        qibla: '<circle cx="12" cy="12" r="8.8"/><path d="m15.9 8.1-2.3 5.5-5.5 2.3 2.3-5.5z"' + F + '/><circle cx="12" cy="12" r=".9" fill="currentColor"/>',
        mosques: '<path d="M7.2 20v-6.3c0-3 2-5.1 4.8-6.9 2.8 1.8 4.8 3.9 4.8 6.9V20z"' + F + '/><path d="M12 3.6v3.2M10.9 4.9h2.2"/><path d="M3.8 20V11l1.3-2.1L6.4 11v9M17.6 20v-9l1.3-2.1 1.3 2.1v9"/><path d="M2.8 20h18.4M10.3 20v-2.8a1.7 1.7 0 0 1 3.4 0V20"/>',
        qtest: '<rect x="4.8" y="4.4" width="14.4" height="16.6" rx="3.2"' + F + '/><path d="M9 3.2h6v3.2H9z"/><path d="m8.4 11 1.2 1.2 2.1-2.3M8.4 16.2l1.2 1.2 2.1-2.3M14 11.6h2.6M14 16.8h2.6"/>',
        adhkar: beads,
        readers: '<path d="M4.2 14.2V12a7.8 7.8 0 0 1 15.6 0v2.2"/><rect x="3.4" y="13.4" width="4.2" height="6.6" rx="2"' + F + '/><rect x="16.4" y="13.4" width="4.2" height="6.6" rx="2"' + F + '/><path d="M12 9.2v5.2M9.8 10.6v2.4M14.2 10.6v2.4"/>',
        khatmah: '<circle cx="12" cy="12" r="8.6"' + F + '/><path d="M8.4 12.4l2.5 2.5 4.7-5.1"/><path d="M12 3.4a8.6 8.6 0 0 1 8.2 6" stroke-dasharray="1.2 2.4"/>',
        ruqyah: '<path d="M12 3.2 19 5.8v5.5c0 4.4-2.8 8.2-7 9.7-4.2-1.5-7-5.3-7-9.7V5.8z"' + F + '/><path d="M12 8.4l1.1 2.2 2.4.3-1.8 1.7.5 2.4-2.2-1.2-2.2 1.2.5-2.4-1.8-1.7 2.4-.3z"/>',
        hadith: '<path d="M6.8 3.8h9.9a2.3 2.3 0 0 1 2.3 2.3v11.8a2.6 2.6 0 0 1-2.6 2.6H8.1a2.6 2.6 0 0 1-2.6-2.6V5.1a1.3 1.3 0 0 1 1.3-1.3z"' + F + '/><path d="M9 8.6h7M9 12.2h7M9 15.8h4.2"/>',
        children: '<circle cx="12" cy="12.6" r="7.6"' + F + '/><path d="M8.9 14.6c.8 1.2 1.9 1.8 3.1 1.8s2.3-.6 3.1-1.8"/><circle cx="9.5" cy="11" r=".9" fill="currentColor"/><circle cx="14.5" cy="11" r=".9" fill="currentColor"/><path d="M12 2.2l.9 1.8 2 .3-1.4 1.4.3 2L12 6.7l-1.8.9.3-2-1.4-1.4 2-.3z"/>',
        repeat: '<path d="M5 11.6a7 7 0 0 1 11.8-4.3L19 9.4"/><path d="M19 12.4a7 7 0 0 1-11.8 4.3L5 14.6"/><path d="M19 4.8v4.6h-4.6M5 19.2v-4.6h4.6"/><circle cx="12" cy="12" r="1.6"' + F + '/>',
        modes: '<path d="M4.6 6.4h14.8M4.6 12h14.8M4.6 17.6h14.8"/><circle cx="9" cy="6.4" r="2.1"' + F + '/><circle cx="15.4" cy="12" r="2.1"' + F + '/><circle cx="8" cy="17.6" r="2.1"' + F + '/>',
        manasik: '<rect x="4" y="5.4" width="16" height="15.2" rx="3.6"' + F + '/><path d="M8 3.4v4M16 3.4v4M4 10.2h16"/><path d="M13.7 13.1a2.7 2.7 0 1 0 1.9 4.6 3.5 3.5 0 0 1-1.9-4.6z"/>',
        daily: '<path d="M3.6 17.4h16.8"/><path d="M7.4 17.4a4.6 4.6 0 0 1 9.2 0"' + F + '/><path d="M12 6.2v2.3M5.6 9l1.7 1.5M18.4 9l-1.7 1.5M3.4 13.2H5M19 13.2h1.6M8.2 20.6h7.6"/>',
        settings: '<circle cx="12" cy="12" r="3.1"' + F + '/><circle cx="12" cy="12" r="6.7"/><path d="M12 3.2v2.2M12 18.6v2.2M3.2 12h2.2M18.6 12h2.2M5.8 5.8l1.5 1.5M16.7 16.7l1.5 1.5M5.8 18.2l1.5-1.5M16.7 7.3l1.5-1.5"/>',
        bell: '<path d="M6 16.6V11a6 6 0 0 1 12 0v5.6l1.6 2.1H4.4z"' + F + '/><path d="M10 20.6a2.2 2.2 0 0 0 4 0"/>',
        moon: '<path d="M19.6 14.3A8 8 0 1 1 9.7 4.4a6.3 6.3 0 0 0 9.9 9.9z"' + F + '/>',
        sun: '<circle cx="12" cy="12" r="4.2"' + F + '/><path d="M12 2.8v2.2M12 19v2.2M2.8 12H5M19 12h2.2M5.5 5.5 7 7M17 17l1.5 1.5M5.5 18.5 7 17M17 7l1.5-1.5"/>',
        search: '<circle cx="10.8" cy="10.8" r="6.6"' + F + '/><path d="m15.8 15.8 4.4 4.4"/>',
        assistant: '<path d="M12 3.4c1.2 3.8 2.8 5.4 6.6 6.6-3.8 1.2-5.4 2.8-6.6 6.6-1.2-3.8-2.8-5.4-6.6-6.6 3.8-1.2 5.4-2.8 6.6-6.6z"' + F + '/><path d="M18.6 15.8c.5 1.6 1.1 2.2 2.6 2.7-1.5.5-2.1 1.1-2.6 2.7-.5-1.6-1.1-2.2-2.7-2.7 1.6-.5 2.2-1.1 2.7-2.7z"/>',
        travel: '<path d="M21 4 3.6 10.4l6 2.4 2.4 6z"' + F + '/><path d="m9.6 12.8 4.4-4.2"/>',
        info: '<circle cx="12" cy="12" r="8.8"' + F + '/><path d="M12 11v5.4"/><circle cx="12" cy="7.9" r=".9" fill="currentColor"/>',
        go: '<path d="M14.5 6.5 9 12l5.5 5.5"/>',
        /* أوقات الصلاة */
        fajr: '<path d="M3.6 16.8h16.8"/><path d="M7.2 16.8a4.8 4.8 0 0 1 9.6 0"' + F + '/><path d="M12 4.4v-.2M12 7.2v2M6.4 8.4l1.2 1.4M17.6 8.4l-1.2 1.4"/><path d="m9.8 4.6 2.2-2 2.2 2"/>',
        sunrise: '<path d="M3.6 17.2h16.8"/><path d="M7.2 17.2a4.8 4.8 0 0 1 9.6 0"' + F + '/><path d="M12 6.2v2.4M5.7 9.2l1.6 1.5M18.3 9.2l-1.6 1.5"/><path d="m9.8 4.4 2.2-2 2.2 2"/>',
        dhuhr: '<circle cx="12" cy="12" r="4.4"' + F + '/><path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/>',
        asr: '<circle cx="12" cy="13.2" r="4"' + F + '/><path d="M12 4.6v2.2M4.6 8.2l1.6 1.4M19.4 8.2l-1.6 1.4M3.4 13.2h2M18.6 13.2h2M7.2 20.6h9.6"/>',
        maghrib: '<path d="M3.6 16.8h16.8"/><path d="M7.4 16.8a4.6 4.6 0 0 1 9.2 0"' + F + '/><path d="m9.8 8.8 2.2 2 2.2-2M6.2 11.2l1.4 1.2M17.8 11.2l-1.4 1.2M8 20.2h8"/>',
        isha: '<path d="M18.8 14.6a7.6 7.6 0 1 1-9.4-9.4 6 6 0 0 0 9.4 9.4z"' + F + '/><path d="M17.4 4.2v2.4M16.2 5.4h2.4"/>'
    };
    function ic(n, c) { return '<svg class="nv ' + (c || '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (IC[n] || IC.info) + '</svg>'; }
    window.v123Icon = ic;

    /* ---------- مشهد المسجد (SVG أصلي) ---------- */
    function scene() {
        var st = '', i, x, y, r, seed = 7;
        function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
        for (i = 0; i < 46; i++) { x = Math.round(rnd() * 1000); y = Math.round(rnd() * 300); r = (0.6 + rnd() * 1.4).toFixed(1); st += '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" opacity="' + (0.35 + rnd() * 0.6).toFixed(2) + '"/>'; }
        var win = '', k;
        for (k = 0; k < 7; k++) { x = 543 + k * 48; if (k === 3) continue; win += '<path d="M' + x + ' 430v-30a10 10 0 0 1 20 0v30z"/>'; }
        var M = '' +
            '<g id="nvM">' +
            '<path d="M585 250v-34M815 250v-34" stroke="#ffdca1" stroke-width="2"/><path d="M574 250l11-42 11 42zM804 250l11-42 11 42z" fill="url(#nvDome)"/>' +
            '<rect x="575" y="250" width="20" height="150" fill="url(#nvWall)"/><rect x="805" y="250" width="20" height="150" fill="url(#nvWall)"/>' +
            '<rect x="569" y="286" width="32" height="7" rx="2" fill="#e8d8ff"/><rect x="799" y="286" width="32" height="7" rx="2" fill="#e8d8ff"/>' +
            '<path d="M470 300v-26M930 300v-26" stroke="#ffdca1" stroke-width="2"/><path d="M460 300l10-34 10 34zM920 300l10-34 10 34z" fill="url(#nvDome)"/>' +
            '<rect x="461" y="300" width="18" height="130" fill="url(#nvWall)"/><rect x="921" y="300" width="18" height="130" fill="url(#nvWall)"/>' +
            '<rect x="456" y="330" width="28" height="6" rx="2" fill="#e8d8ff"/><rect x="916" y="330" width="28" height="6" rx="2" fill="#e8d8ff"/>' +
            '<rect x="520" y="360" width="360" height="70" fill="url(#nvWall)"/>' +
            '<path d="M512 360a48 48 0 0 1 96 0z" fill="url(#nvDome)"/><path d="M792 360a48 48 0 0 1 96 0z" fill="url(#nvDome)"/>' +
            '<path d="M560 312v-14M840 312v-14" stroke="#ffdca1" stroke-width="2"/>' +
            '<rect x="622" y="330" width="156" height="32" fill="url(#nvWall)"/>' +
            '<path d="M610 330a90 90 0 0 1 180 0z" fill="url(#nvDome)"/><path d="M700 240v-24M692 224h16" stroke="#ffdca1" stroke-width="2.4" stroke-linecap="round"/><circle cx="700" cy="212" r="4.4" fill="#ffdca1"/>' +
            '<g fill="#ffd27d">' + win + '<path d="M679 430v-44a21 21 0 0 1 42 0v44z"/><rect x="578" y="262" width="4" height="14" rx="2"/><rect x="588" y="262" width="4" height="14" rx="2"/><rect x="808" y="262" width="4" height="14" rx="2"/><rect x="818" y="262" width="4" height="14" rx="2"/><rect x="636" y="338" width="6" height="16" rx="3"/><rect x="658" y="338" width="6" height="16" rx="3"/><rect x="736" y="338" width="6" height="16" rx="3"/><rect x="758" y="338" width="6" height="16" rx="3"/></g>' +
            '</g>';
        return '<svg class="nvScene" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><defs>' +
            '<linearGradient id="nvSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#090d33"/><stop offset=".42" stop-color="#262b78"/><stop offset=".7" stop-color="#7a63b8"/><stop offset="1" stop-color="#f0b894"/></linearGradient>' +
            '<radialGradient id="nvGlow"><stop offset="0" stop-color="#ffd9a0" stop-opacity=".6"/><stop offset="1" stop-color="#ffd9a0" stop-opacity="0"/></radialGradient>' +
            '<linearGradient id="nvWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6f0ff"/><stop offset="1" stop-color="#b3a0e4"/></linearGradient>' +
            '<linearGradient id="nvDome" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6e2"/><stop offset="1" stop-color="#c2aaf0"/></linearGradient>' +
            '<linearGradient id="nvWater" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a72c6"/><stop offset=".5" stop-color="#2c3180"/><stop offset="1" stop-color="#0c1040"/></linearGradient>' +
            '<linearGradient id="nvFadeG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>' +
            '<mask id="nvFade" maskUnits="userSpaceOnUse" x="0" y="430" width="1000" height="170"><rect x="0" y="430" width="1000" height="170" fill="url(#nvFadeG)"/></mask>' +
            '<mask id="nvCr"><rect width="1000" height="600" fill="#fff"/><circle cx="900" cy="86" r="31" fill="#000"/></mask>' +
            '<filter id="nvBlur" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="2.4 5"/></filter></defs>' +
            '<rect width="1000" height="600" fill="url(#nvSky)"/><g fill="#fff">' + st + '</g>' +
            '<circle cx="884" cy="100" r="110" fill="url(#nvGlow)" opacity=".5"/><circle cx="880" cy="100" r="36" fill="#fff6dc" mask="url(#nvCr)"/>' +
            '<circle cx="700" cy="330" r="330" fill="url(#nvGlow)"/>' +
            '<g fill="#7f6bbd" opacity=".55"><path d="M0 430v-40q60-20 130-6t160 6 190-4v44z"/></g>' +
            M +
            '<g fill="#0e2540"><circle cx="40" cy="392" r="46"/><circle cx="110" cy="404" r="40"/><circle cx="180" cy="414" r="32"/><circle cx="256" cy="424" r="22"/><circle cx="978" cy="404" r="40"/><circle cx="1000" cy="380" r="44"/></g>' +
            '<g fill="#1a3a52" opacity=".8"><circle cx="70" cy="410" r="34"/><circle cx="150" cy="420" r="26"/></g>' +
            '<rect y="430" width="1000" height="170" fill="url(#nvWater)"/>' +
            '<g mask="url(#nvFade)" opacity=".5" filter="url(#nvBlur)"><use href="#nvM" transform="translate(0 860) scale(1 -1)"/></g>' +
            '<g stroke="#ffe3b0" stroke-opacity=".22" stroke-width="1.6" stroke-linecap="round"><path d="M420 452h90M560 466h140M730 458h110M470 482h60M640 492h100M800 478h70M380 520h120M600 540h160"/></g></svg>';
    }

    /* ---------- بيانات ---------- */
    var KEYS = [
        ['mushaf107', 'quran'], ['prayer', 'prayer'], ['qibla', 'qibla'], ['mosques', 'mosques'], ['quranTest', 'qtest'], ['adhkar', 'adhkar'],
        ['readers', 'readers'], ['khatmah', 'khatmah'], ['ruqyah', 'ruqyah'], ['hadith107', 'hadith'], ['children', 'children'], ['repeatAyah', 'repeat'],
        ['modes', 'modes'], ['manasik', 'manasik'], ['daily', 'daily']
    ];
    var FEAT = { quran: 1, prayer: 1, qibla: 1, mosques: 1, qtest: 1, adhkar: 1 };
    var VERSES = [
        ['إِنَّ اللَّهَ مَعَ الصَّابِرِينَ', 'سورة البقرة — الآية 153'],
        ['أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ', 'سورة الرعد — الآية 28'],
        ['فَاذْكُرُونِي أَذْكُرْكُمْ', 'سورة البقرة — الآية 152'],
        ['إِنَّ مَعَ الْعُسْرِ يُسْرًا', 'سورة الشرح — الآية 6'],
        ['وَمَنْ يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ', 'سورة الطلاق — الآية 3'],
        ['وَقُل رَّبِّ زِدْنِي عِلْمًا', 'سورة طه — الآية 114'],
        ['وَاصْبِرْ وَمَا صَبْرُكَ إِلَّا بِاللَّهِ', 'سورة النحل — الآية 127']
    ];
    var SLIDES = [
        ['مرحباً بك في', 'المسلم', 'رفيقك في رحلتك الإيمانية والمعرفية', 'اكتشف المزيد', null],
        ['القرآن الكريم', 'بين يديك', 'مصحف المدينة بالتشكيل الكامل، ويُقرأ دون إنترنت بعد التنزيل', 'افتح المصحف', 'mushaf107'],
        ['مواقيت الصلاة', 'بدقة', 'بحسب موقعك مع تنبيه الأذان والإقامة', 'المواقيت', 'prayer'],
        ['أذكار', 'وأدعية', 'أذكار الصباح والمساء وغيرها بأصوات بشرية', 'الأذكار', 'adhkar']
    ];
    var PR = [['fajr', 'الفجر'], ['sunrise', 'الشروق'], ['dhuhr', 'الظهر'], ['asr', 'العصر'], ['maghrib', 'المغرب'], ['isha', 'العشاء']];

    var ID = { qtTile: 'qtest', v103Tile: 'assistant', travelTile: 'travel', v107TilePr: 'prayer' };
    function keyOf(t) {
        var o = t.getAttribute('onclick') || '', m; if (/QuranTest/.test(o)) return 'qtest'; m = o.match(/show\('([A-Za-z0-9]+)'\)/); if (!m) return null;
        for (var i = 0; i < KEYS.length; i++) if (KEYS[i][0] === m[1]) return KEYS[i][1];
        return null;
    }

    /* ---------- الأقسام الرئيسية ---------- */
    function tag() {
        var menu = document.querySelector('#home .menu'); if (!menu) return;
        var n = 0;
        [].forEach.call(menu.querySelectorAll(':scope > .tile'), function (t) {
            var k = keyOf(t) || ID[t.id] || 'info'; n++;
            if (t.dataset.nv === k && t.querySelector('.nvIco')) return;
            t.dataset.nv = k; t.classList.toggle('nf', !!FEAT[k]);
            var ico = t.querySelector('.ico'); if (ico) { ico.className = 'ico nvIco'; ico.innerHTML = ic(k); }
            var go = t.querySelector('.nvGo'); if (!go) { go = document.createElement('span'); go.className = 'nvGo'; t.appendChild(go); } go.innerHTML = ic('go');
        });
    }
    function prayerCard() {
        var c = document.createElement('div'); c.className = 'nvCard nvPray'; c.id = 'nvPray';
        c.innerHTML = '<div class="nvCh"><h3>أوقات الصلاة اليوم</h3><span class="nvLoc" id="nvLoc"></span></div><div id="nvNextBox"></div><div class="nvTimes" id="nvTimes"></div><button type="button" class="nvMore" onclick="show(\'prayer\')">المزيد ' + ic('go') + '</button>';
        return c;
    }
    function verseCard() {
        var d = new Date(), doy = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5), v = VERSES[doy % VERSES.length];
        var c = document.createElement('div'); c.className = 'nvCard nvVerse';
        c.innerHTML = '<div class="nvVh">' + ic('quran') + '<span>آية اليوم</span></div><div class="nvV">﴿ ' + v[0] + ' ﴾</div><small>' + v[1] + '</small><button type="button" class="nvMore" onclick="show(\'mushaf107\')">قراءة في المصحف ' + ic('go') + '</button>';
        return c;
    }
    function times() {
        var box = $('nvTimes'), P = window.v107Prayer; if (!box) return;
        var l = P && P.getLoc && P.getLoc(), nm = $('nvLoc');
        if (!l) { box.innerHTML = '<button type="button" class="nvSet" onclick="show(\'prayer\')">حدّد موقعك لعرض المواقيت</button>'; if (nm) nm.textContent = ''; return; }
        var now = new Date(), t = P.timesFor(now, l), cur = null;
        PR.forEach(function (x) { if (t[x[0]] && t[x[0]] <= now) cur = x[0]; });
        if (nm) nm.innerHTML = ic('mosques', 'nvPin') + (l.name || l.city || l.label || '');
        box.innerHTML = PR.map(function (x) { return '<div class="' + (x[0] === cur ? 'cur' : '') + '">' + ic(x[0]) + '<small>' + x[1] + '</small><b>' + (t[x[0]] ? P.fmt(t[x[0]]) : '--:--') + '</b></div>'; }).join('');
    }
    function homeBuild() {
        var home = $('home'), menu = home && home.querySelector('.menu'); if (!home || !menu || $('nvHero')) return false;
        var hero = home.querySelector('.hero');
        var sec = document.createElement('section'); sec.id = 'nvHero'; sec.className = 'nvHero';
        sec.innerHTML = scene() + '<div class="nvHt"><div id="nvSl"></div><div class="nvDots" id="nvDots"></div></div>';
        if (hero) hero.parentNode.replaceChild(sec, hero); else home.insertBefore(sec, home.firstChild);
        var old = $('v107Home'); var next = $('v107Next');
        menu.classList.add('nvMenu');
        var row = document.createElement('div'); row.className = 'nvRow'; var pc = prayerCard(); row.appendChild(pc); row.appendChild(verseCard());
        if (old) old.style.display = 'none';
        var hd = document.createElement('div'); hd.className = 'nvHd'; hd.id = 'nvAll'; hd.innerHTML = '<span>كل الأقسام</span>';
        menu.appendChild(row); menu.appendChild(hd); if (next) $('nvNextBox').appendChild(next); tag();
        new MutationObserver(function () { tag(); }).observe(menu, { childList: true });
        slides(); times(); setInterval(times, 30000);
        fit(); if (window.ResizeObserver) new ResizeObserver(fit).observe(sec); else addEventListener('resize', fit);
        return true;
    }
    function fit() {
        var h = $('nvHero'), sv = h && h.querySelector('.nvScene'); if (!sv) return;
        var w = h.clientWidth, ht = h.clientHeight; if (!w || !ht) return;
        var ar = w / ht, W, H, x0, y0;
        if (ar >= 1.2) { W = 1000; H = Math.min(600, 1000 / ar); x0 = 0; y0 = Math.max(0, Math.min(600 - H, 430 - H * 0.74)); }
        else { W = Math.min(1000, 540); H = W / ar; if (H > 600) { H = 600; W = H * ar; } x0 = Math.max(0, Math.min(1000 - W, 700 - W / 2)); y0 = Math.max(0, Math.min(600 - H, 430 - H * 0.8)); }
        sv.setAttribute('viewBox', x0.toFixed(1) + ' ' + y0.toFixed(1) + ' ' + W.toFixed(1) + ' ' + H.toFixed(1));
    }
    var si = 0, st = null;
    function slide(i, user) {
        si = (i + SLIDES.length) % SLIDES.length; var s = SLIDES[si], box = $('nvSl'); if (!box) return;
        box.classList.remove('in'); void box.offsetWidth;
        box.innerHTML = '<h1><span>' + s[0] + '</span><em>' + s[1] + '</em></h1><p>' + s[2] + '</p><button type="button" class="nvCta" id="nvCta">' + s[3] + ' <i>▶</i></button>';
        box.classList.add('in');
        $('nvCta').onclick = function () { if (s[4]) show(s[4]); else { var a = $('nvAll'), f = document.querySelector('#home .tile.nf'); (f || a).scrollIntoView({ behavior: 'smooth', block: 'center' }); } };
        [].forEach.call($('nvDots').children, function (d, k) { d.classList.toggle('on', k === si); });
        if (user) { clearInterval(st); st = setInterval(function () { slide(si + 1); }, 8000); }
    }
    function slides() {
        var dots = $('nvDots'); dots.innerHTML = SLIDES.map(function (_, k) { return '<button type="button" aria-label="الشريحة ' + (k + 1) + '"></button>'; }).join('');
        dots.onclick = function (e) { var b = e.target.closest('button'); if (b) slide([].indexOf.call(dots.children, b), true); };
        slide(0);
        if (!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) st = setInterval(function () { if (!document.hidden && $('home').classList.contains('active')) slide(si + 1); }, 8000);
    }

    /* ---------- الرأس والتنقل ---------- */
    function openAbout() { show('settings'); setTimeout(function () { var d = $('stgcat-aboutus'); if (d) { d.open = true; d.scrollIntoView({ block: 'start' }); } }, 120); }
    function isDark() { return document.body.classList.contains('dark'); }
    function logo(k) {
        var g = 'nvLg' + k;
        return '<svg class="nvLogo" viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="' + g + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9b0"/><stop offset="1" stop-color="#d49b3b"/></linearGradient></defs><g fill="none" stroke="url(#' + g + ')" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.3"><path d="M10 40V26c0-5 5-9 14-15 9 6 14 10 14 15v14z"/><path d="M24 4v7M21.5 7h5"/><path d="M4 40V24l2.6-4 2.6 4v16M38.8 40V24l2.6-4 2.6 4v16M2.5 40h43"/><path d="M16 26v6M32 26v6"/></g><path d="M20 40v-6a4 4 0 0 1 8 0v6" fill="url(#' + g + ')" opacity=".9"/></svg>';
    }
    function header() {
        var top = document.querySelector('header.top'); if (!top || top.dataset.nv) return; top.dataset.nv = 1;
        top.innerHTML = '<div class="nvBrand" onclick="show(\'home\')" role="button" tabindex="0">' + logo('h') + '<b>المسلم</b></div>' +
            '<button type="button" class="nvSearch" id="nvSearch">' + ic('search') + '<span>ابحث في موقع المسلم …</span></button>' +
            '<div class="nvTools"><button type="button" id="nvDark" aria-label="الوضع الليلي/النهاري"></button><button type="button" aria-label="الإعدادات" onclick="show(\'settings\')">' + ic('settings') + '</button><button type="button" aria-label="الإشعارات والتنبيهات" onclick="show(\'settings\');setTimeout(function(){var d=document.getElementById(\'stgcat-alerts\');if(d){d.open=true;d.scrollIntoView()}},120)">' + ic('bell') + '</button></div>';
        $('nvSearch').onclick = function () { show('assistant'); setTimeout(function () { var i = document.querySelector('#assistant input'); if (i) i.focus(); }, 250); };
        $('nvDark').onclick = function () { toggleDark(); paintDark(); };
        paintDark();
    }
    function paintDark() { var b = $('nvDark'); if (b) b.innerHTML = ic(isDark() ? 'moon' : 'sun'); }
    var NAV = [
        ['home', 'الرئيسية', 'home', "show('home')", 'home'],
        ['quran', 'القرآن الكريم', 'quran', "show('mushaf107')", 'mushaf107,quran,readers,khatmah,repeatAyah'],
        ['prayer', 'مواقيت الصلاة', 'mosques', "show('prayer')", 'prayer', 'c'],
        ['qibla', 'القبلة', 'qibla', "show('qibla')", 'qibla', 'x'],
        ['mosques', 'المساجد', 'mosques', "show('mosques');initNearbyMosques()", 'mosques', 'x'],
        ['manasik', 'التقويم الهجري', 'manasik', "show('manasik');initManasik()", 'manasik', 'x'],
        ['adhkar', 'أذكار وأدعية', 'adhkar', "show('adhkar');initAdhkarV27()", 'adhkar,ruqyah,modes,daily'],
        ['qtest', 'اختبار القرآن', 'qtest', "v122QuranTest&&v122QuranTest.open()", 'quranTest', 'x'],
        ['about', 'معلومات عنا', 'info', "window.v123About()", 'about', 'x s'],
        ['settings', 'الإعدادات', 'settings', "show('settings')", 'settings', 's']
    ];
    window.v123About = openAbout;
    function nav() {
        var n = document.querySelector('nav.nav'); if (!n || n.dataset.nv) return; n.dataset.nv = 1;
        n.innerHTML = '<div class="nvSbBrand" onclick="show(\'home\')">' + logo('s') + '<b>المسلم</b></div>' +
            NAV.map(function (x) { var f = x[5] || ''; return '<button type="button" data-ids="' + x[4] + '" data-n="' + x[0] + '" class="' + (f.indexOf('c') > -1 ? 'nvC ' : '') + (f.indexOf('x') > -1 ? 'nvX ' : '') + (f.indexOf('s') > -1 ? 'nvS ' : '') + '" onclick="' + x[3] + '">' + '<span class="nvIc">' + ic(x[2]) + '</span><b>' + x[1] + '</b></button>'; }).join('') +
            '<div class="nvSbArt" aria-hidden="true"><svg viewBox="0 0 240 90" preserveAspectRatio="xMidYMax meet"><g fill="#f4d99c" opacity=".85"><path d="M96 90V58c0-9 9-16 24-26 15 10 24 17 24 26v32z"/><path d="M120 18v14M115 24h10" stroke="#f4d99c" stroke-width="2"/><rect x="58" y="44" width="10" height="46"/><rect x="172" y="44" width="10" height="46"/><path d="M56 44l7-18 7 18zM170 44l7-18 7 18z"/><rect x="74" y="62" width="92" height="28" opacity=".8"/></g></svg></div>';
        sync('home');
    }
    function sync(id) {
        var n = document.querySelector('nav.nav'); if (!n) return;
        [].forEach.call(n.querySelectorAll('button'), function (b) { b.classList.toggle('on', (',' + b.dataset.ids + ',').indexOf(',' + id + ',') > -1); });
        document.body.dataset.pg = id;
    }
    function wrapShow() {
        var s = window.show; if (typeof s !== 'function' || s.__nv) return;
        var w = function (id) { var r = s.apply(this, arguments); try { sync(id); } catch (e) { } return r; }; w.__nv = 1; window.show = w;
    }

    function init() {
        document.body.classList.add('nova');
        if (ls('quran-m09-dark') === null) document.body.classList.add('dark');
        header(); nav(); wrapShow(); homeBuild(); paintDark();
    }
    var n = 0, iv = setInterval(function () {
        if (document.body && document.querySelector('#home .menu') && window.show && document.querySelector('header.top') && document.querySelector('nav.nav') && $('v107Home')) { clearInterval(iv); setTimeout(init, 60); }
        else if (++n > 60) { clearInterval(iv); init(); }
    }, 150);
})();
