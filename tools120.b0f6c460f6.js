(function () {
    'use strict';
    // أدوات المسلم: مسبحة، متابعة الصلوات، دفتر أدعيتي. كل شيء محفوظ على الجهاز فقط.
    var KEY = 'muslim-tools120';
    function $(i) { return document.getElementById(i); }
    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    function dkey(d) { d = d || new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
    function load() {
        var o = {};
        try { o = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { }
        o.tasbih = o.tasbih || { cur: 0, goal: 33, idx: 0, custom: '', days: {} };
        o.salah = o.salah || {};
        o.duas = Array.isArray(o.duas) ? o.duas : [];
        return o;
    }
    function save(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { } }
    var ZK = ['سبحان الله', 'الحمد لله', 'الله أكبر', 'لا إله إلا الله', 'أستغفر الله', 'اللهم صلِّ وسلِّم على نبينا محمد', 'سبحان الله وبحمده', 'لا حول ولا قوة إلا بالله'];
    var PR = [['fajr', 'الفجر'], ['dhuhr', 'الظهر'], ['asr', 'العصر'], ['maghrib', 'المغرب'], ['isha', 'العشاء']];
    var AR = '٠١٢٣٤٥٦٧٨٩';
    function ar(n) { return String(n).replace(/\d/g, function (d) { return AR[d]; }); }

    function render() {
        var host = $('tools120Body'); if (!host) return;
        var o = load(), t = o.tasbih, today = dkey();
        var name = t.idx >= ZK.length ? (t.custom || 'ذكر خاص') : ZK[t.idx];
        var tot = t.days[today] || 0;
        var h = '';
        // ---- المسبحة
        h += '<div class="card"><h3>📿 المسبحة الإلكترونية</h3><label class="mini" for="t120Z">اختر الذكر</label><select id="t120Z" class="field">' +
            ZK.map(function (z, i) { return '<option value="' + i + '"' + (i === t.idx ? ' selected' : '') + '>' + esc(z) + '</option>'; }).join('') +
            '<option value="' + ZK.length + '"' + (t.idx >= ZK.length ? ' selected' : '') + '>ذكر أكتبه بنفسي…</option></select>' +
            (t.idx >= ZK.length ? '<input id="t120C" class="field" maxlength="60" placeholder="اكتب الذكر" value="' + esc(t.custom) + '">' : '') +
            '<div class="t120Goal"><span class="mini">الهدف:</span>' + [33, 100, 500, 1000].map(function (g) { return '<button type="button" class="stgBtn' + (t.goal === g ? ' on' : '') + '" data-goal="' + g + '">' + ar(g) + '</button>'; }).join('') + '</div>' +
            '<div class="t120Name">' + esc(name) + '</div>' +
            '<button type="button" id="t120Tap" class="t120Tap" aria-label="سبّح"><b>' + ar(t.cur) + '</b><small>من ' + ar(t.goal) + '</small></button>' +
            '<div class="t120Bar"><i style="width:' + Math.min(100, Math.round(t.cur / t.goal * 100)) + '%"></i></div>' +
            '<div class="controls"><button type="button" id="t120Undo" class="stgBtn">↩ تراجع</button><button type="button" id="t120Reset" class="stgBtn">⟲ من جديد</button></div>' +
            '<p class="mini">مجموع تسبيحك اليوم: <b>' + ar(tot) + '</b> — مرّت بك ' + ar(Object.keys(t.days).length) + ' أيام فيها تسبيح. محفوظ على جهازك فقط.</p></div>';
        // ---- متابعة الصلوات
        var td = o.salah[today] || {};
        var done = PR.filter(function (p) { return td[p[0]]; }).length;
        h += '<div class="card"><h3>🕌 متابعة صلواتي</h3><p class="mini">علّم ما صليته اليوم لتبقى متابعًا لنفسك. للتذكير الشخصي فقط، لا حساب ولا أحكام.</p><div class="t120Prayers">' +
            PR.map(function (p) { return '<button type="button" class="t120P' + (td[p[0]] ? ' on' : '') + '" data-p="' + p[0] + '" aria-pressed="' + (td[p[0]] ? 'true' : 'false') + '"><span>' + (td[p[0]] ? '✓' : '○') + '</span>' + p[1] + '</button>'; }).join('') + '</div>' +
            '<p class="mini">اليوم: <b>' + ar(done) + ' من ٥</b></p><div class="t120Week">';
        for (var i = 6; i >= 0; i--) {
            var d = new Date(); d.setDate(d.getDate() - i);
            var k = dkey(d), x = o.salah[k] || {}, c = PR.filter(function (p) { return x[p[0]]; }).length;
            h += '<div class="t120Day" title="' + k + '"><i style="height:' + (c * 20) + '%"></i><small>' + ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'][d.getDay()] + '</small></div>';
        }
        h += '</div><p class="mini">آخر ٧ أيام (الارتفاع = عدد الصلوات المعلّمة).</p></div>';
        // ---- أدعيتي
        h += '<div class="card"><h3>🤲 دفتر أدعيتي</h3><p class="mini">اكتب أدعية تحب أن ترجع إليها. تبقى على جهازك فقط.</p>' +
            '<form id="t120DuaForm" class="v103Form"><input id="t120DuaIn" class="field" maxlength="400" placeholder="اكتب دعاءً…"><button class="primary" type="submit">حفظ</button></form><div id="t120Duas">' +
            (o.duas.length ? o.duas.map(function (d, i) { return '<div class="t120Dua"><span>' + esc(d) + '</span><span class="t120Act"><button type="button" data-copy="' + i + '" aria-label="نسخ">نسخ</button><button type="button" data-del="' + i + '" aria-label="حذف">حذف</button></span></div>'; }).join('') : '<div class="mini">لا أدعية محفوظة بعد.</div>') + '</div></div>';
        host.innerHTML = h;
        wire();
    }
    function wire() {
        var host = $('tools120Body');
        $('t120Z').onchange = function () { var o = load(); o.tasbih.idx = +this.value; o.tasbih.cur = 0; save(o); render(); };
        var c = $('t120C'); if (c) c.oninput = function () { var o = load(); o.tasbih.custom = this.value; save(o); var n = host.querySelector('.t120Name'); if (n) n.textContent = this.value || 'ذكر خاص'; };
        host.querySelectorAll('[data-goal]').forEach(function (b) { b.onclick = function () { var o = load(); o.tasbih.goal = +b.getAttribute('data-goal'); save(o); render(); }; });
        $('t120Tap').onclick = function () {
            var o = load(), t = o.tasbih, k = dkey();
            t.cur++; t.days[k] = (t.days[k] || 0) + 1;
            var hit = t.cur >= t.goal;
            if (hit) { t.cur = 0; }
            save(o);
            try { if (navigator.vibrate) navigator.vibrate(hit ? [40, 40, 80] : 10); } catch (e) { }
            render();
            if (hit) { var n = host.querySelector('.t120Name'); if (n) n.textContent += ' — أتممت ' + ar(t.goal) + ' ✅'; }
        };
        $('t120Undo').onclick = function () { var o = load(), t = o.tasbih, k = dkey(); if (t.cur > 0) { t.cur--; if (t.days[k] > 0) t.days[k]--; save(o); render(); } };
        $('t120Reset').onclick = function () { var o = load(); o.tasbih.cur = 0; save(o); render(); };
        host.querySelectorAll('[data-p]').forEach(function (b) { b.onclick = function () { var o = load(), k = dkey(); o.salah[k] = o.salah[k] || {}; o.salah[k][b.getAttribute('data-p')] = !o.salah[k][b.getAttribute('data-p')]; // احتفظ بآخر 60 يومًا فقط
            var keys = Object.keys(o.salah); if (keys.length > 60) { keys.sort(function (a, b2) { return new Date(a.split('-')[0], a.split('-')[1] - 1, a.split('-')[2]) - new Date(b2.split('-')[0], b2.split('-')[1] - 1, b2.split('-')[2]); }); keys.slice(0, keys.length - 60).forEach(function (x) { delete o.salah[x]; }); }
            save(o); render(); }; });
        $('t120DuaForm').onsubmit = function (e) { e.preventDefault(); var v = $('t120DuaIn').value.trim(); if (!v) return; var o = load(); o.duas.unshift(v); o.duas = o.duas.slice(0, 100); save(o); render(); };
        host.querySelectorAll('[data-del]').forEach(function (b) { b.onclick = function () { var o = load(); o.duas.splice(+b.getAttribute('data-del'), 1); save(o); render(); }; });
        host.querySelectorAll('[data-copy]').forEach(function (b) { b.onclick = function () { var o = load(), v = o.duas[+b.getAttribute('data-copy')] || ''; try { navigator.clipboard.writeText(v); b.textContent = 'تم ✓'; } catch (e) { b.textContent = 'تعذّر'; } }; });
    }
    function build() {
        if ($('tools120')) return;
        var s = document.createElement('section'); s.id = 'tools120'; s.className = 'page';
        s.innerHTML = '<div class="section"><button class="back" onclick="show(\'home\')">←</button><div><h2>🧰 أدوات المسلم</h2><p>مسبحة، متابعة الصلوات، ودفتر أدعيتي.</p></div></div><div id="tools120Body"></div>';
        var anchor = document.querySelector('main') || document.body; anchor.appendChild(s);
        var menu = document.querySelector('#home .menu');
        if (menu && !$('t120Tile')) {
            var t = document.createElement('div'); t.id = 't120Tile'; t.className = 'tile'; t.setAttribute('onclick', "show('tools120')");
            t.innerHTML = '<span class="ico">📿</span><b>أدوات المسلم</b><small>مسبحة • متابعة الصلوات • أدعيتي</small>';
            menu.insertBefore(t, menu.children[2] || null);
        }
        var os = window.show;
        window.show = function (id) { var r = os.apply(this, arguments); if (id === 'tools120') render(); return r; };
    }
    window.v120Tools = { render: render };
    if (document.readyState === 'complete') build(); else window.addEventListener('load', function () { setTimeout(build, 500); });
})();
