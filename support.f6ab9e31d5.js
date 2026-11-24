/* مركز الدعم الفني: بلاغات واقتراحات مجهولة تصل إلى المدير مباشرة (بلا حسابات) + روابط التواصل الرسمية.
   لا يرسل اسمًا ولا موقعًا. يُستخدم معرّف عشوائي محلي فقط لمنع التكرار والإساءة. أي فشل لا يمسّ باقي الموقع. */
(function () {
    'use strict';
    var $ = function (id) { return document.getElementById(id); };
    var ctl = function () { return window.MuslimCtl && window.MuslimCtl.rpc ? window.MuslimCtl : null; };
    function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
    var CATS = [['mushaf', 'خطأ في المصحف'], ['audio', 'مشكلة في الصوت'], ['reciter', 'قارئ لا يعمل'], ['prayer', 'خطأ في مواقيت الصلاة'], ['design', 'مشكلة في التصميم'], ['slow', 'بطء'], ['other', 'ميزة لا تعمل / أخرى']];
    var SECS = [['', 'غير محدد'], ['home', 'الرئيسية'], ['mushaf', 'المصحف'], ['readers', 'القرّاء والتلاوات'], ['prayer', 'مواقيت الصلاة'], ['adhkar', 'الأذكار'], ['hadith', 'الأحاديث'], ['qibla', 'القبلة'], ['settings', 'الإعدادات']];
    var SCATS = [['feature', 'ميزة جديدة'], ['design', 'تصميم'], ['content', 'محتوى'], ['audio', 'صوت وقرّاء'], ['other', 'أخرى']];
    var ST = { new: 'جديد', study: 'قيد الدراسة', accepted: 'مقبول', done: 'نُفّذ' };
    var LINKS = [['✉️ البريد', 'mailto:al.mislim.malek@gmail.com', 'al.mislim.malek@gmail.com'], ['✈️ تيليجرام', 'https://t.me/Almuslim09', 't.me/Almuslim09'], ['📷 إنستغرام', 'https://www.instagram.com/al_muslim0001', '@al_muslim0001'], ['🎵 تيك توك', 'https://www.tiktok.com/@al_muslim.0001', '@al_muslim.0001']];

    function select(opts) { var s = el('select', 'supIn'); opts.forEach(function (o) { var p = el('option', '', o[1]); p.value = o[0]; s.appendChild(p); }); return s; }
    function msg(box, t, ok) { box.textContent = t; box.className = 'supMsg ' + (ok ? 'ok' : 'bad'); }
    function offline(box) { msg(box, 'تعذّر الإرسال الآن (تحقق من الإنترنت). يمكنك مراسلتنا مباشرة عبر الروابط أدناه.', false); }
    function mapErr(box, e) { if (e && e.err === 'rate') msg(box, 'أرسلت عددًا كبيرًا مؤخرًا، حاول لاحقًا.', false); else if (e && e.err === 'invalid') msg(box, 'تأكد من كتابة نص كافٍ (٥ أحرف على الأقل).', false); else offline(box); }

    function build(body) {
        body.textContent = '';
        var intro = el('div', 'supIntro', 'أرسل بلاغًا أو اقتراحًا للإدارة مباشرةً بدون أي حساب. الرسالة تصلنا باسم «مجهول»، ولا يُرسل اسمك أو موقعك.');
        body.appendChild(intro);

        /* --- بلاغ --- */
        var r = el('div', 'supBox'); r.appendChild(el('h4', '', 'الإبلاغ عن مشكلة'));
        var cs = select(CATS), ss = select(SECS), tx = el('textarea', 'supIn'), sb = el('button', 'stgBtn', 'إرسال البلاغ'), rm = el('div', 'supMsg');
        tx.rows = 4; tx.maxLength = 600; tx.placeholder = 'اشرح المشكلة باختصار (مثال: الآية ٥ في الصفحة ٢٠ بها خلل)';
        sb.type = 'button';
        sb.onclick = function () {
            var c = ctl(); if (!c) return offline(rm);
            if (tx.value.trim().length < 5) return mapErr(rm, { err: 'invalid' });
            sb.disabled = true;
            c.rpc('submit_report', { p_vid: c.vid(), p_cat: cs.value, p_section: ss.value, p_msg: tx.value.trim() }).then(function (j) {
                sb.disabled = false; if (j && j.ok) { tx.value = ''; msg(rm, 'وصل بلاغك للإدارة، شكرًا لك.', true); } else mapErr(rm, j);
            }).catch(function () { sb.disabled = false; offline(rm); });
        };
        [lab('نوع المشكلة', cs), lab('القسم', ss), lab('التفاصيل', tx), sb, rm].forEach(function (x) { r.appendChild(x); }); body.appendChild(r);

        /* --- اقتراح --- */
        var g = el('div', 'supBox'); g.appendChild(el('h4', '', 'اقتراح تحسين'));
        var ti = el('input', 'supIn'), td = el('textarea', 'supIn'), sc = select(SCATS), sg = el('button', 'stgBtn', 'إرسال الاقتراح'), gm = el('div', 'supMsg'), list = el('div', 'supList');
        ti.maxLength = 120; ti.placeholder = 'عنوان الاقتراح'; td.rows = 3; td.maxLength = 600; td.placeholder = 'تفاصيل (اختياري)'; sg.type = 'button';
        sg.onclick = function () {
            var c = ctl(); if (!c) return offline(gm);
            if (ti.value.trim().length < 4) return mapErr(gm, { err: 'invalid' });
            sg.disabled = true;
            c.rpc('submit_suggestion', { p_vid: c.vid(), p_title: ti.value.trim(), p_body: td.value.trim(), p_cat: sc.value }).then(function (j) {
                sg.disabled = false; if (j && j.ok) { ti.value = ''; td.value = ''; msg(gm, j.merged ? 'اقتراح مشابه موجود، أضفنا صوتك إليه.' : 'وصل اقتراحك، شكرًا لك.', true); refresh(); } else mapErr(gm, j);
            }).catch(function () { sg.disabled = false; offline(gm); });
        };
        [lab('العنوان', ti), lab('التصنيف', sc), lab('التفاصيل', td), sg, gm, el('h5', '', 'اقتراحات الزوار — صوّت لما يعجبك'), list].forEach(function (x) { g.appendChild(x); }); body.appendChild(g);
        function refresh() {
            var c = ctl(); if (!c) return;
            c.rpc('list_suggestions', { p_vid: c.vid() }).then(function (a) {
                list.textContent = ''; if (!a || !a.length) { list.appendChild(el('small', '', 'لا اقتراحات بعد — كن أول من يقترح.')); return; }
                a.slice(0, 15).forEach(function (s) {
                    var row = el('div', 'supRow'), t = el('div', 'supT'); t.appendChild(el('b', '', s.t)); if (s.s && s.s !== 'new') t.appendChild(el('small', 'supSt', ST[s.s] || ''));
                    var v = el('button', 'supVote' + (s.m ? ' on' : ''), '▲ ' + s.v); v.type = 'button'; v.disabled = !!s.m; v.setAttribute('aria-label', 'تصويت');
                    v.onclick = function () { v.disabled = true; c.rpc('vote_suggestion', { p_vid: c.vid(), p_id: s.id }).then(function () { refresh(); }).catch(function () { v.disabled = false; }); };
                    row.appendChild(t); row.appendChild(v); list.appendChild(row);
                });
            }).catch(function () { list.textContent = ''; list.appendChild(el('small', '', 'تعذّر تحميل الاقتراحات الآن.')); });
        }
        body.__refresh = refresh; refresh();

        /* --- تواصل --- */
        var k = el('div', 'supBox'); k.appendChild(el('h4', '', 'تواصل معنا'));
        LINKS.forEach(function (l) { var a = el('a', 'stgBtn supLink', l[0] + '  ' + l[2]); a.href = l[1]; if (l[1].indexOf('http') === 0) { a.target = '_blank'; a.rel = 'noopener noreferrer'; } k.appendChild(a); });
        body.appendChild(k);
        body.appendChild(el('small', 'supPriv', 'الخصوصية: يُحفظ معرّف عشوائي في متصفحك فقط لمنع التكرار وتصويت الشخص مرة واحدة. لا اسم ولا حساب ولا موقع دقيق. يُفقد المعرّف إن مسحت بيانات المتصفح أو غيّرت الجهاز.'));
    }
    function lab(t, x) { var d = el('label', 'supLab'); d.appendChild(el('span', '', t)); d.appendChild(x); return d; }

    function mount() {
        var s = $('settings'); if (!s) return;
        var d = $('stgcat-support');
        if (!d) {
            d = document.createElement('details'); d.className = 'stgCat'; d.id = 'stgcat-support';
            var sm = el('summary'); sm.appendChild(el('span', 'ci', '🛟')); sm.appendChild(document.createTextNode('مركز الدعم الفني')); sm.appendChild(el('span', 'cs', '▾'));
            var b = el('div', 'stgCatBody'), gr = el('div', 'stgGroup open'); b.appendChild(gr); d.appendChild(sm); d.appendChild(b);
            var anchor = $('v44SettingsCard'); if (anchor && anchor.parentNode === s) s.insertBefore(d, anchor); else s.appendChild(d);
            d.addEventListener('toggle', function () { if (d.open && !gr.__built) { gr.__built = 1; build(gr); } else if (d.open && gr.__refresh) gr.__refresh(); });
        }
        var grid = s.querySelector('.nvSetGrid:not(.nvSecGrid)');
        if (grid && !$('nvSupTile') && s.dataset.nv) {
            var t = el('button'); t.type = 'button'; t.id = 'nvSupTile';
            var si = el('span', 'si', '🛟'), bb = el('b', '', 'مركز الدعم الفني'), sgo = el('span', 'sg', '‹');
            t.appendChild(si); t.appendChild(bb); t.appendChild(sgo);
            t.onclick = function () { if (window.v123Settings) window.v123Settings('support'); };
            var hub = $('nvSecHub'); if (hub && hub.nextSibling) grid.insertBefore(t, hub.nextSibling); else grid.appendChild(t);
        }
    }
    var tm = 0;
    function sched() { clearTimeout(tm); tm = setTimeout(mount, 200); }
    function boot() { mount(); var s = $('settings'); if (s) { try { new MutationObserver(sched).observe(s, { childList: true }); } catch (e) { } } setInterval(mount, 3000); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
    window.MuslimSupport = { open: function () { if (window.v123Settings) window.v123Settings('support'); } };
})();
