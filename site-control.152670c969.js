/* ربط الموقع بلوحة التحكم (Supabase المجاني): أعلام الميزات، الصيانة، الإعلانات، وإحصاءات مجهولة خفيفة.
   - لا حسابات للزوار. لا بصمة جهاز. المفتاح العام (publishable) آمن بطبيعته؛ لا يوجد هنا أي سر.
   - يعمل دون اتصال: يُستخدم آخر إعداد محفوظ، وأي فشل لا يعطّل الموقع. */
(function () {
    'use strict';
    var URL_ = 'https://oqwbatlwkybwunrqypml.supabase.co';
    var KEY = 'sb_publishable_wvNmDjpKyxF-uGeH2WRIQg_5ICZtDOX';
    var LSG = function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } };
    var LSS = function (k, v) { try { localStorage.setItem(k, v); } catch (e) { } };
    var CK = 'muslim-ctl-cache', DK = 'muslim-ann-dismissed';
    var cfg = null, low = false, interval = 120, sid = uuid();
    var ack = [], secs = {}, uses = {}, errs = [], cur = 'home', t0 = Date.now(), lastTick = Date.now(), started = false;

    function uuid() { try { if (crypto.randomUUID) return crypto.randomUUID(); } catch (e) { } var h = '0123456789abcdef', o = ''; for (var i = 0; i < 36; i++) o += (i === 8 || i === 13 || i === 18 || i === 23) ? '-' : h[Math.floor(Math.random() * 16)]; return o; }
    function hdr() { return { 'apikey': KEY, 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json' }; }
    function timeout(ms) { var c = new AbortController(); setTimeout(function () { try { c.abort(); } catch (e) { } }, ms); return c.signal; }

    /* ---------- الإعدادات ---------- */
    function load() {
        try { cfg = JSON.parse(LSG(CK) || 'null'); } catch (e) { cfg = null; }
        if (cfg) apply();
        if (navigator.onLine === false) return;
        fetch(URL_ + '/rest/v1/rpc/public_config', { method: 'POST', headers: hdr(), body: '{}', signal: timeout(8000), cache: 'no-store' })
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (j) { if (j && j.features) { cfg = j; LSS(CK, JSON.stringify(j)); apply(); } })
            .catch(function () { });
    }
    function setting(k, d) { return cfg && cfg.settings && cfg.settings[k] != null ? cfg.settings[k] : d; }

    function apply() {
        if (!cfg) return;
        low = setting('low_resource_mode', false) === true; interval = Math.max(60, +setting('telemetry_interval_s', 120) || 120);
        /* الميزات المعطّلة: تُخفى بطاقاتها من الرئيسية */
        var f = cfg.features || {};
        document.querySelectorAll('.tile[onclick], .nvDx[onclick]').forEach(function (t) {
            var m = (t.getAttribute('onclick') || '').match(/show\('([A-Za-z0-9_]+)'\)/); if (!m) return;
            var s = f[m[1]]; if (!s) return;
            if (s.on === false || s.home === false) { t.style.setProperty('display', 'none', 'important'); t.setAttribute('data-ctl-hid', '1'); } else if (t.hasAttribute('data-ctl-hid')) { t.style.removeProperty('display'); t.removeAttribute('data-ctl-hid'); }
        });
        maintenance(); announce();
    }
    function bar(id, cls) {
        var e = document.getElementById(id);
        if (!e) { e = document.createElement('div'); e.id = id; e.className = 'ctlBar ' + (cls || ''); e.setAttribute('role', 'status'); document.body.insertBefore(e, document.body.firstChild); }
        return e;
    }
    function maintenance() {
        var m = setting('maintenance', {}), e = document.getElementById('ctlMaint');
        if (m && m.on) { e = bar('ctlMaint', 'ctlWarn'); e.textContent = String(m.message || 'الموقع تحت صيانة قصيرة.').slice(0, 300); }
        else if (e) e.remove();
    }
    function dismissed() { try { return JSON.parse(LSG(DK) || '[]'); } catch (e) { return []; } }
    function announce() {
        var old = document.getElementById('ctlAnn'); if (old) old.remove();
        var d = dismissed(), list = (cfg.ann || []).filter(function (a) { return d.indexOf(a.id) < 0; });
        if (!list.length) return;
        var a = list[0], e = bar('ctlAnn', 'ctlInfo');
        var b = document.createElement('b'); b.textContent = String(a.t || '').slice(0, 120);
        var s = document.createElement('span'); s.textContent = ' ' + String(a.b || '').slice(0, 400);
        var x = document.createElement('button'); x.type = 'button'; x.setAttribute('aria-label', 'إغلاق'); x.textContent = '✕';
        x.onclick = function () { d.push(a.id); LSS(DK, JSON.stringify(d.slice(-50))); e.remove(); announce(); };
        e.appendChild(b); e.appendChild(s); e.appendChild(x);
    }

    /* ---------- الإحصاءات المجهولة (حدّ أدنى من الكتابة) ---------- */
    function tick() { var n = Date.now(); if (document.visibilityState === 'visible') secs[cur] = (secs[cur] || 0) + Math.round((n - lastTick) / 1000); lastTick = n; }
    function device() {
        var u = navigator.userAgent || '', w = innerWidth;
        return {
            dev: w < 700 ? 'mobile' : w < 1100 ? 'tablet' : 'desktop',
            os: /Android/i.test(u) ? 'Android' : /iPhone|iPad|iPod/i.test(u) ? 'iOS' : /Windows/i.test(u) ? 'Windows' : /Mac/i.test(u) ? 'macOS' : /Linux/i.test(u) ? 'Linux' : 'other',
            br: /Edg\//.test(u) ? 'Edge' : /OPR\//.test(u) ? 'Opera' : /Chrome\//.test(u) ? 'Chrome' : /Firefox\//.test(u) ? 'Firefox' : /Safari\//.test(u) ? 'Safari' : 'other',
            scr: w < 480 ? 'xs' : w < 768 ? 'sm' : w < 1024 ? 'md' : w < 1440 ? 'lg' : 'xl'
        };
    }
    function send(ev, beacon) {
        if (LSG('muslim-stats-off') === '1' || navigator.onLine === false) return;
        tick();
        var p = Object.assign({ sid: sid, ev: ev, ret: LSG('muslim-ctl-seen') ? 1 : 0, sec: String(cur).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 32) || 'home', secs: secs, uses: uses, dur: Math.round((Date.now() - t0) / 1000), errs: errs.splice(0, 5) }, device());
        if (LSG('muslim-inbox') === '1') { p.vk = LSG('muslim-vk') || (function () { var v = uuid(); LSS('muslim-vk', v); return v; })(); p.inbox = 1; if (ack.length) { p.ack = ack.splice(0, 20); } }
        secs = {}; uses = {};
        var body = JSON.stringify(p);
        try {
            if (beacon && navigator.sendBeacon) { navigator.sendBeacon(URL_ + '/functions/v1/collect?apikey=' + KEY, new Blob([body], { type: 'text/plain' })); return; }
            fetch(URL_ + '/functions/v1/collect', { method: 'POST', headers: hdr(), body: body, signal: timeout(8000), keepalive: true })
                .then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { if (j) { if (typeof j.low === 'boolean') low = j.low; if (j.next) interval = Math.max(60, +j.next); if (j.msgs && j.msgs.length) inbox(j.msgs); } }).catch(function () { });
        } catch (e) { }
        LSS('muslim-ctl-seen', '1');
    }
    function inbox(ms) { /* رسائل فردية بموافقة الزائر فقط */
        var ids = []; ms.filter(function (m) { return !m.read; }).slice(0, 3).forEach(function (m) { var e = bar('ctlMsg' + m.id, 'ctlInfo'); e.textContent = String(m.body || m.title || '').slice(0, 400); var x = document.createElement('button'); x.textContent = '✕'; x.type = 'button'; x.onclick = function () { e.remove(); }; e.appendChild(x); ids.push(m.id); });
        if (ids.length) ack = ack.concat(ids);
    }
    function loop() {
        if (started) return; started = true; send('start');
        (function again() { setTimeout(function () { if (document.visibilityState === 'visible') send('hb'); again(); }, (low ? interval * 4 : interval) * 1000); })();
    }
    /* تتبّع القسم الحالي واستخدام الميزات بلا مسّ بباقي الشيفرة */
    function hook() {
        var s = window.show; if (typeof s !== 'function' || s.__ctl) return;
        var w = function (id) { try { var fs = cfg && cfg.features && cfg.features[id]; if (fs && fs.on === false) { if (window.toast) window.toast('هذه الميزة متوقفة مؤقتًا من الإدارة'); return; } } catch (e) { } try { tick(); cur = String(id); uses[cur] = (uses[cur] || 0) + 1; } catch (e) { } return s.apply(this, arguments); };
        w.__ctl = 1; window.show = w;
    }
    window.addEventListener('error', function (e) { errs.push({ s: cur, k: 'js', m: String(e.message || '').slice(0, 160) }); });
    window.addEventListener('unhandledrejection', function (e) { errs.push({ s: cur, k: 'promise', m: String((e.reason && e.reason.message) || e.reason || '').slice(0, 160) }); });
    window.addEventListener('pagehide', function () { send('end', true); });
    document.addEventListener('visibilitychange', function () { lastTick = Date.now(); });
    window.addEventListener('online', load);

    var css = document.createElement('style');
    css.textContent = '.ctlBar{position:sticky;top:0;z-index:99000;padding:8px 14px;font-size:.92em;display:flex;gap:8px;align-items:center;justify-content:center;text-align:center}.ctlWarn{background:#b45309;color:#fff}.ctlInfo{background:var(--green,#1d624f);color:#fff}.ctlBar button{background:rgba(255,255,255,.18);color:inherit;border:0;border-radius:50%;width:28px;height:28px;cursor:pointer}';
    document.head.appendChild(css);
    window.MuslimCtl = { reload: load, stats: function (on) { LSS('muslim-stats-off', on ? '0' : '1'); }, inbox: function (on) { LSS('muslim-inbox', on ? '1' : '0'); } };
    var deb = 0;
    function watch() { try { new MutationObserver(function () { clearTimeout(deb); deb = setTimeout(function () { if (cfg) apply(); }, 250); }).observe(document.body, { childList: true, subtree: true }); } catch (e) { } }
    function boot() { hook(); watch(); load(); setTimeout(loop, 4000); setTimeout(hook, 2500); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
