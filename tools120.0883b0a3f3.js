(function () {
    'use strict';
    // أدوات المسلم: متابعة الصلوات، عاداتي، جدول مراجعة الحفظ، دفتر الشكر، دفتر أدعيتي. كلها على الجهاز فقط.
    var KEY = 'muslim-tools120';
    function $(i) { return document.getElementById(i); }
    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    function dkey(d) { d = d || new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
    function dnum(d) { d = d || new Date(); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); }
    function load() {
        var o = {};
        try { o = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { }
        delete o.tasbih;
        o.salah = o.salah || {};
        o.duas = Array.isArray(o.duas) ? o.duas : [];
        o.habits = Array.isArray(o.habits) ? o.habits : [{ id: 'h1', n: 'ورد القرآن' }, { id: 'h2', n: 'أذكار الصباح' }, { id: 'h3', n: 'أذكار المساء' }, { id: 'h4', n: 'أذكار النوم' }, { id: 'h5', n: 'صدقة اليوم' }];
        o.hlog = o.hlog || {};
        o.hifz = Array.isArray(o.hifz) ? o.hifz : [];
        o.thanks = Array.isArray(o.thanks) ? o.thanks : [];
        return o;
    }
    function save(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { } }
    var PR = [['fajr', 'الفجر'], ['dhuhr', 'الظهر'], ['asr', 'العصر'], ['maghrib', 'المغرب'], ['isha', 'العشاء']];
    var AR = '٠١٢٣٤٥٦٧٨٩';
    function ar(n) { return String(n).replace(/\d/g, function (d) { return AR[d]; }); }
    var GAPS = [1, 3, 7, 14, 30, 60];

    function streak(isDone) {
        var n = 0, d = new Date();
        if (!isDone(dkey(d))) d.setDate(d.getDate() - 1);
        while (isDone(dkey(d))) { n++; d.setDate(d.getDate() - 1); if (n > 3650) break; }
        return n;
    }
    function surahName(i) { try { return S[i]; } catch (e) { return 'سورة ' + (i + 1); } }
    function dueIn(h) { var next = GAPS[Math.min(h.step || 0, GAPS.length - 1)]; return (h.last || 0) + next - dnum(); }

    function render() {
        var host = $('tools120Body'); if (!host) return;
        var o = load(), today = dkey(), h = '';
        // ---- متابعة الصلوات
        var td = o.salah[today] || {};
        var done = PR.filter(function (p) { return td[p[0]]; }).length;
        var allDone = function (k) { var x = o.salah[k] || {}; return PR.every(function (p) { return x[p[0]]; }); };
        h += '<div class="card"><h3>🕌 متابعة صلواتي</h3><p class="mini">علّم ما صليته اليوم لتبقى متابعًا لنفسك. للتذكير الشخصي فقط، لا حساب ولا أحكام.</p><div class="t120Prayers">' +
            PR.map(function (p) { return '<button type="button" class="t120P' + (td[p[0]] ? ' on' : '') + '" data-p="' + p[0] + '" aria-pressed="' + (td[p[0]] ? 'true' : 'false') + '"><span>' + (td[p[0]] ? '✓' : '○') + '</span>' + p[1] + '</button>'; }).join('') + '</div>' +
            '<p class="mini">اليوم: <b>' + ar(done) + ' من ٥</b> — أيام متتالية أتممتَ فيها الخمس: <b>' + ar(streak(allDone)) + '</b></p><div class="t120Week">';
        for (var i = 6; i >= 0; i--) {
            var d = new Date(); d.setDate(d.getDate() - i);
            var k = dkey(d), x = o.salah[k] || {}, c = PR.filter(function (p) { return x[p[0]]; }).length;
            h += '<div class="t120Day" title="' + k + '"><i style="height:' + (c * 20) + '%"></i><small>' + ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'][d.getDay()] + '</small></div>';
        }
        h += '</div><p class="mini">آخر ٧ أيام (الارتفاع = عدد الصلوات المعلّمة).</p></div>';
        // ---- عاداتي
        var hl = o.hlog[today] || {};
        h += '<div class="card"><h3>✅ عاداتي اليومية</h3><p class="mini">اختر ما تريد المداومة عليه، وعلّمه كل يوم لتتابع سلسلة أيامك. أضف عاداتك أو احذف ما لا يناسبك.</p><div id="t120H">' +
            o.habits.map(function (x) {
                var st = streak(function (k) { return o.hlog[k] && o.hlog[k][x.id]; });
                return '<div class="t120Hr"><button type="button" class="t120P' + (hl[x.id] ? ' on' : '') + '" data-h="' + x.id + '" aria-pressed="' + (hl[x.id] ? 'true' : 'false') + '"><span>' + (hl[x.id] ? '✓' : '○') + '</span>' + esc(x.n) + '</button><small class="mini">🔥 ' + ar(st) + '</small><button type="button" class="t120X" data-hdel="' + x.id + '" aria-label="حذف العادة">✕</button></div>';
            }).join('') + '</div><form id="t120HForm" class="v103Form"><input id="t120HIn" class="field" maxlength="40" placeholder="عادة جديدة، مثل: صلاة الضحى"><button class="primary" type="submit">إضافة</button></form></div>';
        // ---- مراجعة الحفظ
        var due = o.hifz.filter(function (x) { return dueIn(x) <= 0; });
        var opts = '';
        for (var s = 0; s < 114; s++) opts += '<option value="' + s + '">' + (s + 1) + ' - ' + esc(surahName(s)) + '</option>';
        h += '<div class="card"><h3>🧠 جدول مراجعة الحفظ</h3><p class="mini">أضف السور التي تحفظها، ويذكّرك التطبيق متى تراجعها بالمراجعة المتباعدة (بعد ١ ثم ٣ ثم ٧ ثم ١٤ ثم ٣٠ يومًا). إن نسيتَ، اضغط «لم أتقنها» لتعود المراجعة قريبة.</p>' +
            '<form id="t120HfForm" class="v103Form"><select id="t120HfS" class="field">' + opts + '</select><button class="primary" type="submit">إضافة</button></form>' +
            (due.length ? '<div class="notice">📌 اليوم تراجع: <b>' + due.map(function (x) { return esc(surahName(x.s)); }).join('، ') + '</b></div>' : (o.hifz.length ? '<div class="mini">لا مراجعات مستحقة اليوم، بارك الله فيك.</div>' : '')) +
            o.hifz.map(function (x, i) {
                var di = dueIn(x);
                return '<div class="t120Dua"><span><b>' + esc(surahName(x.s)) + '</b><br><small class="mini">' + (di <= 0 ? 'المراجعة مستحقة الآن' : 'المراجعة القادمة بعد ' + ar(di) + ' يوم') + ' • مرّات المراجعة: ' + ar(x.n || 0) + '</small></span><span class="t120Act">' +
                    (di <= 0 ? '<button type="button" data-hok="' + i + '">راجعتُها ✓</button><button type="button" data-hno="' + i + '">لم أتقنها</button>' : '') + '<button type="button" data-hdel2="' + i + '" aria-label="حذف">حذف</button></span></div>';
            }).join('') + '</div>';
        // ---- دفتر الشكر
        h += '<div class="card"><h3>🌿 دفتر الشكر</h3><p class="mini">اكتب نعمة واحدة تشكر الله عليها اليوم. تعود إليها حين تحتاج تذكّر فضل الله عليك.</p><form id="t120TForm" class="v103Form"><input id="t120TIn" class="field" maxlength="200" placeholder="الحمد لله على…"><button class="primary" type="submit">حفظ</button></form>' +
            (o.thanks.length ? o.thanks.slice(0, 30).map(function (t, i) { return '<div class="t120Dua"><span>' + esc(t.t) + '<br><small class="mini">' + esc(t.d) + '</small></span><span class="t120Act"><button type="button" data-tdel="' + i + '">حذف</button></span></div>'; }).join('') : '<div class="mini">لا شيء مكتوب بعد.</div>') + '</div>';
        // ---- أدعيتي
        h += '<div class="card"><h3>🤲 دفتر أدعيتي</h3><p class="mini">اكتب أدعية تحب أن ترجع إليها. تبقى على جهازك فقط.</p>' +
            '<form id="t120DuaForm" class="v103Form"><input id="t120DuaIn" class="field" maxlength="400" placeholder="اكتب دعاءً…"><button class="primary" type="submit">حفظ</button></form><div id="t120Duas">' +
            (o.duas.length ? o.duas.map(function (d, i) { return '<div class="t120Dua"><span>' + esc(d) + '</span><span class="t120Act"><button type="button" data-copy="' + i + '" aria-label="نسخ">نسخ</button><button type="button" data-del="' + i + '" aria-label="حذف">حذف</button></span></div>'; }).join('') : '<div class="mini">لا أدعية محفوظة بعد.</div>') + '</div></div>';
        host.innerHTML = h;
        wire();
    }
    function mut(fn) { var o = load(); fn(o); save(o); render(); }
    function wire() {
        var host = $('tools120Body');
        host.querySelectorAll('[data-p]').forEach(function (b) { b.onclick = function () { mut(function (o) { var k = dkey(), p = b.getAttribute('data-p'); o.salah[k] = o.salah[k] || {}; o.salah[k][p] = !o.salah[k][p]; var keys = Object.keys(o.salah); if (keys.length > 400) { delete o.salah[keys[0]]; } }); }; });
        host.querySelectorAll('[data-h]').forEach(function (b) { b.onclick = function () { mut(function (o) { var k = dkey(), id = b.getAttribute('data-h'); o.hlog[k] = o.hlog[k] || {}; o.hlog[k][id] = !o.hlog[k][id]; var keys = Object.keys(o.hlog); if (keys.length > 800) delete o.hlog[keys[0]]; }); }; });
        host.querySelectorAll('[data-hdel]').forEach(function (b) { b.onclick = function () { mut(function (o) { o.habits = o.habits.filter(function (x) { return x.id !== b.getAttribute('data-hdel'); }); }); }; });
        $('t120HForm').onsubmit = function (e) { e.preventDefault(); var v = $('t120HIn').value.trim(); if (!v) return; mut(function (o) { if (o.habits.length < 30) o.habits.push({ id: 'h' + Date.now().toString(36), n: v }); }); };
        $('t120HfForm').onsubmit = function (e) { e.preventDefault(); var s = +$('t120HfS').value; mut(function (o) { if (!o.hifz.some(function (x) { return x.s === s; })) o.hifz.push({ s: s, step: 0, n: 0, last: dnum() - 1 }); }); };
        host.querySelectorAll('[data-hok]').forEach(function (b) { b.onclick = function () { mut(function (o) { var x = o.hifz[+b.getAttribute('data-hok')]; if (x) { x.step = Math.min((x.step || 0) + 1, GAPS.length - 1); x.n = (x.n || 0) + 1; x.last = dnum(); } }); }; });
        host.querySelectorAll('[data-hno]').forEach(function (b) { b.onclick = function () { mut(function (o) { var x = o.hifz[+b.getAttribute('data-hno')]; if (x) { x.step = 0; x.last = dnum(); } }); }; });
        host.querySelectorAll('[data-hdel2]').forEach(function (b) { b.onclick = function () { mut(function (o) { o.hifz.splice(+b.getAttribute('data-hdel2'), 1); }); }; });
        $('t120TForm').onsubmit = function (e) { e.preventDefault(); var v = $('t120TIn').value.trim(); if (!v) return; mut(function (o) { o.thanks.unshift({ t: v, d: new Date().toLocaleDateString('ar') }); o.thanks = o.thanks.slice(0, 200); }); };
        host.querySelectorAll('[data-tdel]').forEach(function (b) { b.onclick = function () { mut(function (o) { o.thanks.splice(+b.getAttribute('data-tdel'), 1); }); }; });
        $('t120DuaForm').onsubmit = function (e) { e.preventDefault(); var v = $('t120DuaIn').value.trim(); if (!v) return; mut(function (o) { o.duas.unshift(v); o.duas = o.duas.slice(0, 100); }); };
        host.querySelectorAll('[data-del]').forEach(function (b) { b.onclick = function () { mut(function (o) { o.duas.splice(+b.getAttribute('data-del'), 1); }); }; });
        host.querySelectorAll('[data-copy]').forEach(function (b) { b.onclick = function () { var o = load(), v = o.duas[+b.getAttribute('data-copy')] || ''; try { navigator.clipboard.writeText(v); b.textContent = 'تم ✓'; } catch (e) { b.textContent = 'تعذّر'; } }; });
    }
    function build() {
        if ($('tools120')) return;
        var s = document.createElement('section'); s.id = 'tools120'; s.className = 'page';
        s.innerHTML = '<div class="section"><button class="back" onclick="show(\'home\')">←</button><div><h2>🧰 أدوات المسلم</h2><p>متابعة الصلوات، عاداتي، مراجعة الحفظ، الشكر، وأدعيتي.</p></div></div><div id="tools120Body"></div>';
        (document.querySelector('main') || document.body).appendChild(s);
        var menu = document.querySelector('#home .menu');
        if (menu && !$('t120Tile')) {
            var t = document.createElement('div'); t.id = 't120Tile'; t.className = 'tile'; t.setAttribute('onclick', "show('tools120')");
            t.innerHTML = '<span class="ico">🧰</span><b>أدوات المسلم</b><small>صلواتي • عاداتي • مراجعة الحفظ</small>';
            menu.insertBefore(t, menu.children[2] || null);
        }
        var os = window.show;
        window.show = function (id) { var r = os.apply(this, arguments); if (id === 'tools120') render(); return r; };
    }
    window.v120Tools = { render: render };
    if (document.readyState === 'complete') build(); else window.addEventListener('load', function () { setTimeout(build, 500); });
})();
