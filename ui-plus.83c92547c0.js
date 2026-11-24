/* واجهة إضافية: طيّ الشريط الجانبي، توفير البيانات، اختصارات سريعة، ولوحة المفاتيح */
(function () {
    'use strict';
    var LSG = function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } };
    var LSS = function (k, v) { try { localStorage.setItem(k, v); } catch (e) { } };
    var $ = function (id) { return document.getElementById(id); };
    var go = function (id, fn) { try { if (typeof window.show === 'function') window.show(id); if (fn && typeof window[fn] === 'function') window[fn](); } catch (e) { } };

    /* ---- الشريط الجانبي (الشاشات العريضة) ---- */
    function applySb(c) { document.body.classList.toggle('sbCollapsed', !!c); var b = document.querySelector('nav.nav .sbToggle'); if (b) { b.setAttribute('aria-expanded', c ? 'false' : 'true'); b.setAttribute('aria-label', c ? 'فتح الشريط الجانبي' : 'طيّ الشريط الجانبي'); var t = b.querySelector('b'); if (t) t.textContent = c ? 'فتح' : 'طيّ القائمة'; var i = b.querySelector('.sbI'); if (i) i.textContent = c ? '«' : '»'; } }
    function mountSb() {
        var nav = document.querySelector('nav.nav'); if (!nav) return false;
        if (nav.querySelector('.sbToggle')) return true;
        var b = document.createElement('button'); b.type = 'button'; b.className = 'sbToggle'; b.innerHTML = '<span class="sbI" aria-hidden="true">»</span><b>طيّ القائمة</b>';
        b.onclick = function () { var c = !document.body.classList.contains('sbCollapsed'); LSS('muslim-sb', c ? '1' : '0'); applySb(c); };
        nav.appendChild(b); applySb(LSG('muslim-sb') === '1'); return true;
    }

    /* ---- توفير البيانات ---- */
    function dsOn() { var v = LSG('muslim-datasaver'); if (v === null) { try { return !!(navigator.connection && navigator.connection.saveData); } catch (e) { return false; } } return v === '1'; }
    function applyDs() { document.body.classList.toggle('dataSaver', dsOn()); }
    function mountDs() {
        var g = document.querySelector('#stgcat-look .stgGroup'); if (!g) return false;
        if ($('plusDsRow')) return true;
        var l = document.createElement('label'); l.className = 'stgRow stgSw'; l.id = 'plusDsRow';
        l.innerHTML = '<div><b>توفير البيانات</b><small>يُخفي الصور والخلفيات ولا يحمّلها لتوفير الإنترنت وتسريع الموقع</small></div>';
        var i = document.createElement('input'); i.type = 'checkbox'; i.checked = dsOn(); i.onchange = function () { LSS('muslim-datasaver', i.checked ? '1' : '0'); applyDs(); };
        l.appendChild(i); g.appendChild(l); return true;
    }

    /* ---- الخصوصية: إحصاءات مجهولة + رسائل الإدارة (بموافقتك فقط) ---- */
    function mountPrivacy() {
        var g = document.querySelector('#stgcat-about .stgGroup'); if (!g) return false;
        if ($('plusPrivRow')) return true;
        function row(id, t, sub, on, fn) { var l = document.createElement('label'); l.className = 'stgRow stgSw'; l.id = id; l.innerHTML = '<div><b>' + t + '</b><small>' + sub + '</small></div>'; var i = document.createElement('input'); i.type = 'checkbox'; i.checked = on; i.onchange = function () { fn(i.checked); }; l.appendChild(i); g.appendChild(l); }
        row('plusPrivRow', 'إحصاءات مجهولة', 'أعداد عامة بلا اسم ولا حساب ولا بصمة جهاز، لتحسين الموقع. يمكنك إيقافها في أي وقت.', LSG('muslim-stats-off') !== '1', function (v) { LSS('muslim-stats-off', v ? '0' : '1'); });
        row('plusInboxRow', 'استقبال رسائل من إدارة المسلم', 'اختياري ومعطّل افتراضيًا. عند تفعيله يُنشأ معرّف عشوائي على جهازك فقط ليتمكن المدير من إرسال رسالة لك. لا يكشف هويتك.', LSG('muslim-inbox') === '1', function (v) { LSS('muslim-inbox', v ? '1' : '0'); if (!v) { try { localStorage.removeItem('muslim-vk'); } catch (e) { } } });
        return true;
    }

    /* ---- الاختصارات السريعة في الرئيسية ---- */
    function mountQuick() {
        var home = $('home'); if (!home || $('plusQuick')) return !!$('plusQuick');
        var menu = home.querySelector('.menu'); if (!menu) return false;
        var q = document.createElement('div'); q.id = 'plusQuick'; q.setAttribute('role', 'group'); q.setAttribute('aria-label', 'اختصارات سريعة');
        [['📖', 'تابع المصحف', function () { go('mushaf107'); try { window.v107Mushaf.open(); } catch (e) { } }], ['🎧', 'القراء', function () { go('readers'); }], ['🤲', 'الأذكار', function () { go('adhkar', 'initAdhkarV27'); }], ['🧭', 'القبلة', function () { go('qibla'); }]].forEach(function (x) {
            var b = document.createElement('button'); b.type = 'button'; b.innerHTML = '<span aria-hidden="true">' + x[0] + '</span>' + x[1]; b.onclick = x[2]; q.appendChild(b);
        }); menu.parentNode.insertBefore(q, menu); return true;
    }

    /* ---- لوحة المفاتيح ---- */
    function kbd() {
        document.querySelectorAll('.tile:not([tabindex])').forEach(function (t) { t.setAttribute('tabindex', '0'); t.setAttribute('role', 'button'); });
    }
    function help() {
        var o = $('plusKbd'); if (o) { o.remove(); return; }
        o = document.createElement('div'); o.id = 'plusKbd'; o.className = 'plusOv show'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', 'اختصارات لوحة المفاتيح');
        var rows = [['M', 'المصحف'], ['R', 'القراء'], ['A', 'الأذكار'], ['H', 'الرئيسية'], ['S', 'الإعدادات'], ['Q', 'القبلة'], ['← →', 'تقليب صفحات المصحف'], ['Tab / Enter', 'التنقل وفتح العناصر'], ['Esc', 'إغلاق النوافذ'], ['?', 'هذه القائمة']];
        var b = document.createElement('div'); b.className = 'plusBox'; b.innerHTML = '<div class="plusHd"><b>اختصارات لوحة المفاتيح</b><button type="button" aria-label="إغلاق">✕</button></div>' + rows.map(function (r) { return '<div class="rpRow"><kbd>' + r[0] + '</kbd><span>' + r[1] + '</span></div>'; }).join('');
        b.querySelector('button').onclick = function () { o.remove(); }; o.onclick = function (e) { if (e.target === o) o.remove(); };
        o.appendChild(b); document.body.appendChild(o); b.querySelector('button').focus();
    }
    document.addEventListener('keydown', function (e) {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        var t = e.target, tag = (t && t.tagName) || '';
        if (e.key === 'Escape') { var k = $('plusKbd'); if (k) k.remove(); return; }
        if ((e.key === 'Enter' || e.key === ' ') && t && t.classList && t.classList.contains('tile')) { e.preventDefault(); t.click(); return; }
        if (/INPUT|TEXTAREA|SELECT/.test(tag) || (t && t.isContentEditable)) return;
        var k = (e.key || '').toLowerCase();
        var map = { m: ['mushaf107'], r: ['readers'], a: ['adhkar', 'initAdhkarV27'], h: ['home'], s: ['settings'], q: ['qibla'] };
        if (e.key === '?' || e.key === '؟') { e.preventDefault(); help(); return; }
        if (map[k]) { e.preventDefault(); go(map[k][0], map[k][1]); }
    });

    function boot() {
        applyDs(); var n = 0;
        var iv = setInterval(function () { kbd(); var a = mountSb(), b = mountDs(), c = mountQuick(); mountPrivacy(); if ((a && b && c) || ++n > 80) clearInterval(iv); }, 500);
        var deb = 0; try { new MutationObserver(function () { clearTimeout(deb); deb = setTimeout(function () { kbd(); mountSb(); mountDs(); mountQuick(); mountPrivacy(); }, 200); }).observe(document.body, { childList: true, subtree: true }); } catch (e) { }
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
    window.MuslimUI = { toggleSidebar: function () { var b = document.querySelector('nav.nav .sbToggle'); if (b) b.click(); }, help: help };
})();
