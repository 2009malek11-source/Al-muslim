/* repeat-plus.js — تكرار الآية: قرّاء قالون (بتوقيت الآيات) + بحث عن القارئ + حفظ آخر النطاقات + مؤقت إيقاف + سرعة.
 * قرّاء قالون: التلاوة من mp3quran.net ملفُّها سورة كاملة، وتوقيت كل آية من واجهة التوقيت الرسمية للموقع نفسه؛
 * فيُشغَّل مقطع الآية وحده ويُكرَّر. لا يعتمد على خادم خاص بنا. */
(function () {
    'use strict';
    var $ = function (i) { return document.getElementById(i); };
    var QAL = [
        { id: 75, name: 'علي الحذيفي — قالون عن نافع', base: 'https://cdn.mp3quran.net/audio/ali-hudhaifi/r2/' },
        { id: 208, name: 'الدوكالي محمد العالم — قالون عن نافع', base: 'https://cdn.mp3quran.net/audio/dokali-alim/r1/' },
        { id: 270, name: 'محمود خليل الحصري — قالون عن نافع', base: 'https://cdn.mp3quran.net/audio/mahmoud-husary/r5/' }
    ];
    var RK = 'muslim-rp-recent', LK = 'muslim-rp-last';
    function ld(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
    function sv(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
    function status(t) { var e = $('repeatAyahStatus'); if (e) e.textContent = t; }
    function pad3(n) { return ('00' + n).slice(-3); }
    function sname(s) { try { return (typeof S !== 'undefined' && S[s - 1]) || ('سورة ' + s); } catch (e) { return 'سورة ' + s; } }
    function val(id) { var e = $(id); return e ? e.value : ''; }

    /* ---------- محرّك قالون ---------- */
    var Q = null;
    function stopQ(silent) {
        if (!Q) return;
        Q.stopped = true; clearInterval(Q.iv); clearTimeout(Q.gt);
        try { Q.el.pause(); Q.el.removeAttribute('src'); Q.el.load(); Q.el.remove(); } catch (e) { }
        Q = null;
        try { if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'none'; } catch (e) { }
        if (!silent) status('⏹ تم إيقاف التكرار.');
    }
    function timing(rd, s) {
        var k = 'muslim-qt-' + rd.id + '-' + s, c = ld(k, null);
        if (c && c.length) return Promise.resolve(c);
        var ac = window.AbortController ? new AbortController() : null, t = ac ? setTimeout(function () { ac.abort(); }, 15000) : 0;
        return fetch('https://mp3quran.net/api/v3/ayat_timing?surah=' + s + '&read=' + rd.id, { signal: ac ? ac.signal : undefined })
            .then(function (r) { clearTimeout(t); if (!r.ok) throw 0; return r.json(); })
            .then(function (j) { var o = []; (j || []).forEach(function (x) { if (x && x.ayah >= 1 && x.end_time > x.start_time) o[x.ayah] = [x.start_time / 1000, x.end_time / 1000]; }); var out = []; for (var i = 1; i < o.length; i++) out.push(o[i] || null); if (!out.length) throw 0; sv(k, out); return out; });
    }
    async function startQ(rd) {
        var s = +val('repeatSurah'), from = +val('repeatFrom'), to = +val('repeatTo'), each = Math.max(1, +val('repeatEach') || 1), gs = +val('repeatGapSel');
        var max = +($('repeatTo') || {}).max || 286;
        if (!(from >= 1) || !(to >= from) || to > max) { status('اختر نطاقًا صحيحًا (السورة فيها ' + max + ' آية).'); return; }
        try { var a = $('audio'); if (a && !a.paused) a.pause(); if (window.v100StopQueue) v100StopQueue(); } catch (e) { }
        status('⏳ تجهيز توقيت الآيات…');
        var T;
        try { T = await timing(rd, s); } catch (e) { status('تعذّر جلب توقيت الآيات لهذا القارئ الآن. تحقق من الإنترنت أو اختر قارئًا آخر.'); return; }
        var st = Q = { stopped: false, iv: 0, gt: 0, el: new Audio() };
        var el = st.el; el.preload = 'auto'; el.setAttribute('playsinline', ''); el.setAttribute('webkit-playsinline', '');
        el.src = rd.base + pad3(s) + '.mp3'; document.body.appendChild(el);
        var ai = from, rep = 0;
        var rate = +ld('muslim-rp-rate', 1) || 1;
        function meta() { try { if ('mediaSession' in navigator) { navigator.mediaSession.metadata = new MediaMetadata({ title: sname(s) + ' — آية ' + ai, artist: rd.name, album: 'المسلم — تكرار الآية' }); navigator.mediaSession.playbackState = 'playing'; } } catch (e) { } }
        function seg() { return T[ai - 1]; }
        function playSeg() {
            if (st.stopped) return;
            var g = seg();
            if (!g) { nextAyah(); return; }
            status('▶ ' + sname(s) + ' — آية ' + ai + ' (التكرار ' + (rep + 1) + ' من ' + each + ')'); meta();
            var go = function () {
                try { el.currentTime = g[0]; } catch (e) { }
                el.playbackRate = rate;
                var p = el.play(); if (p && p.catch) p.catch(function () { status('تعذّر التشغيل. المس الشاشة ثم أعد المحاولة.'); });
                clearInterval(st.iv);
                st.iv = setInterval(function () {
                    if (st.stopped) return;
                    if (el.currentTime >= g[1] - 0.04 || el.ended) { clearInterval(st.iv); el.pause(); afterSeg(g); }
                }, 60);
            };
            if (el.readyState >= 1) go(); else { var h = function () { el.removeEventListener('loadedmetadata', h); go(); }; el.addEventListener('loadedmetadata', h); }
        }
        function afterSeg(g) {
            if (st.stopped) return;
            var gap = gs === -1 ? (g[1] - g[0]) * 1000 / rate : Math.max(0, gs) * 1000;
            rep++;
            st.gt = setTimeout(function () { if (rep >= each) { rep = 0; nextAyah(); } else playSeg(); }, gap + 150);
        }
        function nextAyah() { ai++; if (ai > to) ai = from; playSeg(); }
        el.onerror = function () { if (!st.stopped) { status('تعذّر تحميل تلاوة هذا القارئ الآن. تحقق من الإنترنت.'); } };
        remember();
        playSeg();
        armTimer();
    }
    /* ---------- حفظ آخر النطاقات ---------- */
    function snap() { return { s: +val('repeatSurah'), f: +val('repeatFrom'), t: +val('repeatTo'), r: val('repeatReciter'), e: val('repeatEach'), g: val('repeatGapSel') }; }
    function remember() {
        var x = snap(); if (!x.s || !(x.f >= 1) || !(x.t >= x.f)) return;
        sv(LK, x);
        var l = ld(RK, []).filter(function (y) { return !(y.s === x.s && y.f === x.f && y.t === x.t && y.r === x.r); });
        l.unshift(x); sv(RK, l.slice(0, 8)); paintRecent();
    }
    function apply(x) {
        var s = $('repeatSurah'); if (!s) return;
        s.value = String(x.s); if (window.updateRepeatTo) updateRepeatTo();
        $('repeatFrom').value = x.f; $('repeatTo').value = x.t; if (window.updateRepeatTo) updateRepeatTo();
        var r = $('repeatReciter'); if (r && x.r != null && [].some.call(r.options, function (o) { return o.value === x.r; })) r.value = x.r;
        if (x.e && $('repeatEach')) $('repeatEach').value = x.e; if (x.g != null && $('repeatGapSel')) $('repeatGapSel').value = x.g;
    }
    function paintRecent() {
        var b = $('rpRecent'); if (!b) return;
        var l = ld(RK, []);
        if (!l.length) { b.innerHTML = '<div class="mini">لا توجد نطاقات محفوظة بعد؛ يُحفظ تلقائيًا كل نطاق تبدأ تكراره.</div>'; return; }
        b.innerHTML = '<div class="rpChips">' + l.map(function (x, i) {
            var rn = ''; var r = $('repeatReciter'); if (r) { var o = [].filter.call(r.options, function (q) { return q.value === x.r; })[0]; if (o) rn = o.textContent.split('—')[0].trim(); }
            return '<button type="button" data-rp="' + i + '">' + sname(x.s) + ' ' + x.f + (x.t > x.f ? '–' + x.t : '') + (rn ? ' · ' + rn : '') + '</button>';
        }).join('') + '</div><button type="button" class="rpClr" id="rpClr">مسح القائمة</button>';
        b.querySelectorAll('[data-rp]').forEach(function (n) { n.onclick = function () { apply(l[+n.dataset.rp]); status('تم ضبط النطاق. اضغط «بدء التكرار».'); }; });
        $('rpClr').onclick = function () { sv(RK, []); paintRecent(); };
    }
    /* ---------- مؤقت وسرعة ---------- */
    var tmr = 0;
    function armTimer() {
        clearTimeout(tmr); var m = +val('rpTimer'); if (!m) return;
        tmr = setTimeout(function () { window.stopAyahRepeat && stopAyahRepeat(true); status('⏱️ انتهى المؤقت وتوقّف التكرار.'); }, m * 60000);
    }
    function applyRate() {
        var r = +val('rpRate') || 1; sv('muslim-rp-rate', r);
        if (Q) Q.el.playbackRate = r;
        try { var a = window.V101C && V101C.audio && V101C.audio(); if (a) a.playbackRate = r; } catch (e) { }
    }
    /* ---------- بحث القارئ + إضافة قرّاء قالون ---------- */
    var all = null;
    function fillQal() {
        var sel = $('repeatReciter'); if (!sel || sel.querySelector('optgroup[data-q]')) return;
        var g = document.createElement('optgroup'); g.label = 'قالون عن نافع (بتوقيت الآيات)'; g.setAttribute('data-q', '1');
        QAL.forEach(function (r) { var o = document.createElement('option'); o.value = 'q:' + r.id; o.textContent = r.name; g.appendChild(o); });
        sel.insertBefore(g, sel.firstChild);
    }
    function snapAll() { var sel = $('repeatReciter'); all = [].slice.call(sel.querySelectorAll('option')).map(function (o) { return { v: o.value, t: o.textContent }; }); }
    function filt() {
        var sel = $('repeatReciter'), q = (window.v120F ? v120F.norm(val('rpSearch')) : val('rpSearch').toLowerCase()).trim(); if (!sel || !all) return;
        var keep = sel.value, qs = q ? q.split(/\s+/) : [];
        var hit = all.filter(function (o) { var t = window.v120F ? v120F.norm(o.t) : o.t.toLowerCase(); return qs.every(function (w) { return t.indexOf(w) >= 0; }); });
        if (!hit.length && q && window.v120F) hit = all.filter(function (o) { return v120F.score(v120F.toks(q), [o.t]) > 0; });
        sel.innerHTML = hit.map(function (o) { return '<option value="' + o.v + '">' + o.t.replace(/</g, '&lt;') + '</option>'; }).join('') || '<option value="">لا نتائج</option>';
        if (hit.some(function (o) { return o.v === keep; })) sel.value = keep;
        var n = $('rpFound'); if (n) n.textContent = q ? hit.length + ' نتيجة' : '';
    }
    /* ---------- بناء الواجهة ---------- */
    function mount() {
        var sel = $('repeatReciter'), page = $('repeatAyah'); if (!sel || !page) return false;
        if (page.dataset.rp) return true;
        page.dataset.rp = '1';
        fillQal(); snapAll();
        var lab = sel.previousElementSibling;
        var sb = document.createElement('div'); sb.className = 'rpSearch';
        sb.innerHTML = '<input id="rpSearch" class="field" type="search" placeholder="🔍 ابحث عن قارئ…" autocomplete="off"><span class="mini" id="rpFound"></span>';
        sel.parentNode.insertBefore(sb, lab || sel);
        $('rpSearch').addEventListener('input', filt);
        var rc = document.createElement('div'); rc.className = 'rpBox';
        rc.innerHTML = '<div class="mini">⏱️ آخر ما كررتَه (اضغط للعودة إليه بسرعة)</div><div id="rpRecent"></div>';
        var pre = $('repeatPresets'); pre.parentNode.insertBefore(rc, pre.nextSibling);
        var ex = document.createElement('div'); ex.className = 'rpBox';
        ex.innerHTML = '<label class="mini">إيقاف تلقائي بعد</label><select id="rpTimer" class="field"><option value="0">بلا مؤقت</option><option value="5">5 دقائق</option><option value="10">10 دقائق</option><option value="15">15 دقيقة</option><option value="30">30 دقيقة</option><option value="60">ساعة</option></select>' +
            '<label class="mini">سرعة التلاوة (للحفظ)</label><select id="rpRate" class="field"><option value="0.75">أبطأ (0.75×)</option><option value="0.9">هادئة (0.9×)</option><option value="1">عادية</option><option value="1.15">أسرع (1.15×)</option></select>';
        var ctr = page.querySelector('.controls'); ctr.parentNode.insertBefore(ex, ctr);
        $('rpTimer').value = String(ld('muslim-rp-timer', 0)); $('rpRate').value = String(ld('muslim-rp-rate', 1));
        $('rpTimer').onchange = function () { sv('muslim-rp-timer', +this.value); };
        $('rpRate').onchange = applyRate;
        var L = ld(LK, null);
        if (L && L.r != null && [].some.call(sel.options, function (o) { return o.value === L.r; })) sel.value = L.r;
        paintRecent();
        new MutationObserver(function () { if (!sel.querySelector('optgroup[data-q]') && !$('rpSearch').value) { fillQal(); snapAll(); } }).observe(sel, { childList: true });
        return true;
    }
    /* ---------- التفاف على البدء والإيقاف ---------- */
    var _start = window.startAyahRepeat, _stop = window.stopAyahRepeat;
    window.startAyahRepeat = async function () {
        var v = val('repeatReciter');
        if (_stop) _stop(true); stopQ(true); clearTimeout(tmr);
        if (/^q:\d+$/.test(v)) { var rd = QAL.filter(function (r) { return 'q:' + r.id === v; })[0]; if (rd) return startQ(rd); }
        remember();
        var r = _start ? await _start.apply(this, arguments) : null;
        applyRate(); armTimer();
        setTimeout(applyRate, 2500); setTimeout(applyRate, 6000);
        return r;
    };
    window.stopAyahRepeat = function (silent) { clearTimeout(tmr); stopQ(true); if (_stop) _stop.apply(this, arguments); else if (!silent) status('⏹ تم إيقاف التكرار.'); if (!silent && !Q) status('⏹ تم إيقاف التكرار.'); };
    window.v122QalunReciters = QAL;
    var n = 0, iv = setInterval(function () { if (mount() || ++n > 80) clearInterval(iv); }, 500);
    var _show = window.show;
    if (typeof _show === 'function') window.show = function (id) { var r = _show.apply(this, arguments); if (id === 'repeatAyah') setTimeout(function () { mount(); paintRecent(); }, 80); return r; };
})();
