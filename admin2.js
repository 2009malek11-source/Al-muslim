/* مراكز الإدارة المتقدمة: الزوار، رحلة الزائر، المهام، المصادر، المطوّر، التنبيهات، الصيانة، البلاغات، الاقتراحات.
   لا أسرار هنا. كل بناء الواجهة بـ textContent. يُحمَّل قبل admin.js ويسجّل تبويباته فقط. */
(function () {
    'use strict';
    var SECN = { home: 'الرئيسية', mushaf107: 'المصحف', quran: 'القرآن', readers: 'القراء', adhkar: 'الأذكار', khatmah: 'الختمة', ruqyah: 'الرقية', hadith107: 'الأحاديث', children: 'الأطفال', qibla: 'القبلة', mosques: 'المساجد', settings: 'الإعدادات', repeatAyah: 'تكرار الآيات', prayer: 'مواقيت الصلاة', exit: 'خروج من الموقع' };
    var DEVN = { mobile: 'جوال', tablet: 'لوحي', desktop: 'حاسوب', tv: 'تلفاز', other: 'أخرى' };
    var sn = function (k) { return SECN[k] || k || '—'; };
    function iso(d) { return d ? new Date(d).toISOString() : null; }
    function cname(cc) { if (!cc || cc === 'ZZ') return 'غير معروف'; try { return new Intl.DisplayNames(['ar'], { type: 'region' }).of(cc) || cc; } catch (e) { return cc; } }
    function dt(t) { return t ? new Date(t).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' }) : '—'; }
    function tbl(h, heads, rows) { var t = h('table'); t.appendChild(h('tr', null, heads.map(function (x) { return h('th', { text: x }); }))); rows.forEach(function (r) { t.appendChild(h('tr', null, r.map(function (c) { return h('td', null, [c == null ? '' : (typeof c === 'object' ? c : String(c))]); }))); }); var w = h('div', { cls: 'ovx' }); w.appendChild(t); return w; }
    function sel(h, opts, val, fn) { var s = h('select', null, opts.map(function (o) { var p = h('option', { value: o[0], text: o[1] }); if (String(o[0]) === String(val)) p.selected = true; return p; })); if (fn) s.addEventListener('change', function () { fn(s.value); }); return s; }
    var tag = function (h, t, c) { return h('span', { cls: 'tag ' + (c || ''), text: t }); };

    /* ============ خريطة العالم ============ */
    var topo = null;
    function loadTopo() { if (topo) return Promise.resolve(topo); return fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json', { cache: 'force-cache', credentials: 'omit' }).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) { topo = j; return j; }); }
    function decode(t, objName) {
        var tr = t.transform || { scale: [1, 1], translate: [0, 0] }, arcs = t.arcs.map(function (a) { var x = 0, y = 0; return a.map(function (p) { x += p[0]; y += p[1]; return [x * tr.scale[0] + tr.translate[0], y * tr.scale[1] + tr.translate[1]]; }); });
        function ring(ix) { var pts = []; ix.forEach(function (i) { var a = i < 0 ? arcs[~i].slice().reverse() : arcs[i]; a.forEach(function (p, k) { if (k || !pts.length) pts.push(p); }); }); return pts; }
        return t.objects[objName].geometries.map(function (g) { var polys = g.type === 'Polygon' ? [g.arcs] : g.type === 'MultiPolygon' ? g.arcs : []; return { name: (g.properties || {}).name, rings: [].concat.apply([], polys.map(function (p) { return p.map(ring); })) }; });
    }
    var ALIAS = { 'United States of America': 'US', 'Russia': 'RU', 'Czechia': 'CZ', 'Dem. Rep. Congo': 'CD', 'Congo': 'CG', 'Dominican Rep.': 'DO', 'Bosnia and Herz.': 'BA', 'Central African Rep.': 'CF', 'Eq. Guinea': 'GQ', 'eSwatini': 'SZ', 'S. Sudan': 'SS', 'W. Sahara': 'EH', "Côte d'Ivoire": 'CI', 'Solomon Is.': 'SB', 'Falkland Is.': 'FK', 'North Macedonia': 'MK', 'Palestine': 'PS', 'Myanmar': 'MM', 'Fr. S. Antarctic Lands': 'TF', 'Timor-Leste': 'TL', 'Turkey': 'TR', 'Syria': 'SY', 'Iran': 'IR', 'South Korea': 'KR', 'North Korea': 'KP', 'Laos': 'LA', 'Vietnam': 'VN', 'Tanzania': 'TZ', 'Moldova': 'MD', 'Bolivia': 'BO', 'Venezuela': 'VE', 'Brunei': 'BN', 'Kosovo': 'XK', 'Somaliland': 'SO', 'N. Cyprus': 'CY' };
    var nameMap = null;
    function names() { if (nameMap) return nameMap; nameMap = {}; try { var dn = new Intl.DisplayNames(['en'], { type: 'region' }), A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; for (var i = 0; i < 26; i++) for (var j = 0; j < 26; j++) { var c = A[i] + A[j], n = dn.of(c); if (n && n !== c) nameMap[n] = c; } } catch (e) { } Object.keys(ALIAS).forEach(function (k) { nameMap[k] = ALIAS[k]; }); return nameMap; }
    function mapView(h, counts, onPick) {
        var wrap = h('div', { cls: 'mapw' }), tip = h('div', { cls: 'mut', text: 'جارٍ تحميل الخريطة…' });
        wrap.appendChild(tip);
        loadTopo().then(function (t) {
            var key = Object.keys(t.objects).indexOf('countries') > -1 ? 'countries' : Object.keys(t.objects)[0], geo = decode(t, key), NS = 'http://www.w3.org/2000/svg', nm = names();
            var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 360 180'); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'خريطة توزّع الزوار'); svg.setAttribute('class', 'map');
            var mx = Math.max.apply(null, Object.keys(counts).map(function (k) { return counts[k]; }).concat(1));
            geo.forEach(function (g) {
                var cc = nm[g.name] || '', n = counts[cc] || 0, p = document.createElementNS(NS, 'path');
                p.setAttribute('d', g.rings.map(function (r) { return 'M' + r.map(function (q) { return (q[0] + 180).toFixed(1) + ',' + (90 - q[1]).toFixed(1); }).join('L') + 'Z'; }).join(''));
                p.setAttribute('class', 'ctry' + (n ? ' has' : '')); if (n) p.style.fillOpacity = String(0.35 + 0.65 * n / mx);
                var ti = document.createElementNS(NS, 'title'); ti.textContent = cname(cc) + (n ? ' — ' + n + ' زائر' : ''); p.appendChild(ti);
                if (n) p.addEventListener('click', function () { onPick(cc); });
                svg.appendChild(p);
            });
            var vb = [0, 0, 360, 180];
            function setvb() { svg.setAttribute('viewBox', vb.join(' ')); }
            function zoom(f) { var cx = vb[0] + vb[2] / 2, cy = vb[1] + vb[3] / 2; vb[2] = Math.min(360, Math.max(30, vb[2] * f)); vb[3] = vb[2] / 2; vb[0] = Math.max(0, Math.min(360 - vb[2], cx - vb[2] / 2)); vb[1] = Math.max(0, Math.min(180 - vb[3], cy - vb[3] / 2)); setvb(); }
            var drag = null; svg.addEventListener('pointerdown', function (e) { drag = [e.clientX, e.clientY, vb[0], vb[1]]; }); window.addEventListener('pointerup', function () { drag = null; });
            svg.addEventListener('pointermove', function (e) { if (!drag || vb[2] >= 360) return; var r = svg.getBoundingClientRect(), k = vb[2] / r.width; vb[0] = Math.max(0, Math.min(360 - vb[2], drag[2] - (e.clientX - drag[0]) * k)); vb[1] = Math.max(0, Math.min(180 - vb[3], drag[3] - (e.clientY - drag[1]) * k)); setvb(); });
            var ctl = h('div', { cls: 'row' }, [h('button', { cls: 'btn alt sm', type: 'button', text: '＋ تكبير', onclick: function () { zoom(0.6); } }), h('button', { cls: 'btn alt sm', type: 'button', text: '－ تصغير', onclick: function () { zoom(1.6); } }), h('button', { cls: 'btn alt sm', type: 'button', text: 'إعادة', onclick: function () { vb = [0, 0, 360, 180]; setvb(); } })]);
            wrap.textContent = ''; wrap.appendChild(svg); wrap.appendChild(ctl); wrap.appendChild(h('div', { cls: 'mut', text: 'اضغط على دولة ملوّنة لتصفية الجدول. الموقع تقريبي من عنوان الاتصال (دولة ومدينة فقط).' }));
        }).catch(function () { wrap.textContent = ''; wrap.appendChild(h('div', { cls: 'mut', text: 'تعذّر تحميل الخريطة (تحتاج اتصالًا بـ cdn.jsdelivr.net). القائمة أدناه تعمل بدونها.' })); });
        return wrap;
    }

    /* ============ الزوار ============ */
    function visitors(A) {
        var h = A.h, F = { cc: '', dev: '', st: '', q: '' };
        var out = h('div'), body = h('div');
        function load() {
            var q = 'visitors?select=*&order=last_seen.desc&limit=200';
            if (F.cc) q += '&country=eq.' + encodeURIComponent(F.cc); if (F.dev) q += '&device=eq.' + encodeURIComponent(F.dev);
            if (F.st === 'on') q += '&last_seen=gte.' + iso(Date.now() - 180000); if (F.st === 'off') q += '&last_seen=lt.' + iso(Date.now() - 180000);
            return A.rest(q);
        }
        return Promise.all([A.rpc('admin_visitor_summary'), load()]).then(function (r) {
            var S = r[0], rows = r[1] || [], counts = {}; (S.countries || []).forEach(function (c) { counts[c.c] = c.n; });
            var cs = sel(h, [['', 'كل الدول']].concat((S.countries || []).map(function (c) { return [c.c, cname(c.c) + ' (' + c.n + ')']; })), F.cc, function (v) { F.cc = v; shellReload(); });
            var ds = sel(h, [['', 'كل الأجهزة']].concat(Object.keys(DEVN).map(function (k) { return [k, DEVN[k]]; })), F.dev, function (v) { F.dev = v; shellReload(); });
            var st = sel(h, [['', 'كل الحالات'], ['on', 'متصل الآن'], ['off', 'غير متصل']], F.st, function (v) { F.st = v; shellReload(); });
            function shellReload() { load().then(function (rs) { draw(rs); }); }
            var tblBox = h('div');
            function draw(rs) {
                tblBox.textContent = '';
                var qv = (F.q || '').toLowerCase(); if (qv) rs = rs.filter(function (v) { return (v.vid + ' ' + (v.city || '') + ' ' + cname(v.country) + ' ' + (v.last_section || '')).toLowerCase().indexOf(qv) > -1; });
                tblBox.appendChild(tbl(h, ['المعرّف', 'الحالة', 'آخر ظهور', 'أول زيارة', 'زيارات', 'جلسات', 'الدولة', 'المدينة', 'الجهاز', 'القسم الحالي', 'مدة الجلسة', 'آخر الأقسام'], rs.map(function (v) {
                    var on = Date.now() - new Date(v.last_seen) < 180000, dur = v.cur_started ? Math.max(0, Math.round((new Date(v.last_seen) - new Date(v.cur_started)) / 60000)) : 0;
                    return [v.vid.slice(0, 8), tag(h, on ? 'متصل' : 'غير متصل', on ? 'ok' : ''), A.ago(v.last_seen), dt(v.first_seen), A.ar(v.visits), A.ar(v.sessions), cname(v.country), v.city || '—', (DEVN[v.device] || '') + ' · ' + (v.os || '') + ' · ' + (v.browser || ''), sn(v.last_section), '≈ ' + A.ar(dur) + ' د', (v.recent || []).map(sn).join(' ‹ ')];
                })));
                if (!rs.length) tblBox.appendChild(h('div', { cls: 'mut', text: 'لا زوار مطابقون.' }));
            }
            var qi = h('input', { placeholder: 'بحث: معرّف / مدينة / قسم' }); qi.addEventListener('input', function () { F.q = qi.value; draw(rows); });
            body.appendChild(h('div', { cls: 'grid' }, [A.stat(A.ar(S.online), 'متصل الآن'), A.stat(A.ar(S.total), 'إجمالي الزوار (معرّفات)'), A.stat(A.ar(S.new24), 'جدد آخر ٢٤ ساعة'), A.stat(A.ar(S.ret24), 'عائدون آخر ٢٤ ساعة')]));
            body.appendChild(A.card('خريطة الزوار حسب الدولة', [mapView(h, counts, function (cc) { F.cc = cc; cs.value = cc; shellReload(); })]));
            var bs = {}; (S.bySection || []).forEach(function (x) { bs[x.s] = x.n; });
            body.appendChild(A.card('الزوار المتصلون الآن حسب القسم', [A.list(bs, SECN)]));
            body.appendChild(A.card('الزوار', [h('div', { cls: 'filters' }, [cs, ds, st, qi]), tblBox]));
            body.appendChild(A.card('ملاحظات مهمة', [h('div', { text: '• «آخر ظهور» تقريبي: عند انقطاع مفاجئ (إغلاق المتصفح أو انقطاع الشبكة) يُحتسب الزائر متصلًا حتى ٣ دقائق بعد آخر نبضة.\n• المعرّف عشوائي مجهول يُحفظ في متصفح الزائر فقط؛ يضيع بمسح بيانات المتصفح أو بتغيير الجهاز فيُحتسب زائرًا جديدًا.\n• الدولة والمدينة تقريبيتان من عنوان الاتصال وقت بدء الجلسة، ولا يُخزَّن العنوان نفسه. الزائر الذي أوقف الإحصاءات لا يظهر هنا.', cls: 'pre mut' })]));
            draw(rows); out.appendChild(h('h3', { text: 'مركز ذكاء الزوار' })); out.appendChild(body); return out;
        });
    }

    /* ============ رحلة الزائر ============ */
    function journey(A) {
        var h = A.h, days = 14, out = h('div'), box = h('div');
        function run() {
            return A.rpc('admin_flow_stats', { p_days: days }).then(function (d) {
                box.textContent = '';
                var P = d.paths || [], find = function (a, b) { var r = 0; P.forEach(function (x) { if (x.s === a && x.d === b) r += x.n; }); return r; };
                var pm = {}; P.filter(function (x) { return x.d !== 'exit'; }).slice(0, 12).forEach(function (x) { pm[sn(x.s) + ' ← ' + sn(x.d)] = x.n; });
                var fixed = [['home', 'mushaf107'], ['mushaf107', 'readers'], ['home', 'prayer']];
                box.appendChild(h('div', { cls: 'grid' }, fixed.map(function (f) { return A.stat(A.ar(find(f[0], f[1])), sn(f[0]) + ' ← ' + sn(f[1])); })));
                var ex = {}; (d.exits || []).forEach(function (x) { ex[x.s] = x.n; }); var ct = {}; (d.cont || []).forEach(function (x) { ct[x.s] = x.n; });
                box.appendChild(A.card('أكثر المسارات شيوعًا (من ← إلى)', [A.list(pm)]));
                box.appendChild(A.card('الأقسام التي يخرج منها الزوار سريعًا (آخر قسم قبل المغادرة)', [A.list(ex, SECN)]));
                box.appendChild(A.card('الأقسام التي تقود إلى متابعة التصفح', [A.list(ct, SECN)]));
                box.appendChild(h('div', { cls: 'mut', text: 'إحصاءات تجميعية فقط: أزواج (قسم ← قسم) بلا ربط بشخص ولا سجل تفصيلي لأي زائر. تُحذف بعد ٤٥ يومًا.' }));
            });
        }
        out.appendChild(h('h3', { text: 'مركز رحلة الزائر' }));
        out.appendChild(h('div', { cls: 'row' }, [h('span', { text: 'الفترة' }), sel(h, [[7, 'آخر ٧ أيام'], [14, 'آخر ١٤ يومًا'], [30, 'آخر ٣٠ يومًا']], days, function (v) { days = +v; run(); })]));
        out.appendChild(box); return run().then(function () { return out; });
    }

    /* ============ المهام التلقائية ============ */
    var KINDS = [['announce_publish', 'نشر إعلان'], ['announce_stop', 'إيقاف إعلان'], ['maint_on', 'تفعيل الصيانة'], ['maint_off', 'إيقاف الصيانة'], ['welcome_on', 'تفعيل رسالة الترحيب'], ['welcome_off', 'إيقاف رسالة الترحيب']];
    function tasks(A) {
        var h = A.h;
        return Promise.all([A.rest('scheduled_tasks?select=*&order=run_at.asc&limit=100'), A.rest('task_runs?select=*&order=at.desc&limit=40'), A.rest('announcements?select=id,title&order=created_at.desc&limit=50')]).then(function (r) {
            var T = r[0] || [], R = r[1] || [], An = r[2] || [], kl = {}; KINDS.forEach(function (k) { kl[k[0]] = k[1]; });
            var title = h('input', { maxlength: 120, placeholder: 'عنوان المهمة' }), kind = sel(h, KINDS, 'announce_publish'), ann = sel(h, An.map(function (a) { return [a.id, a.title]; }), ''), when = h('input', { type: 'datetime-local' }), rep = h('input', { type: 'number', min: 1, max: 8760, placeholder: 'تكرار كل كم ساعة (اختياري)' }), mm = h('input', { maxlength: 300, placeholder: 'رسالة الصيانة (لمهمة التفعيل)' }), er = h('div', { cls: 'err' });
            var add = h('button', { cls: 'btn', type: 'button', text: 'إضافة المهمة', onclick: function () {
                er.textContent = ''; if (!title.value.trim() || !when.value) { er.textContent = 'اكتب العنوان وحدد الوقت'; return; }
                var pl = {}; if (/^announce/.test(kind.value)) { if (!ann.value) { er.textContent = 'اختر إعلانًا'; return; } pl.ann_id = ann.value; } if (kind.value === 'maint_on') pl.message = mm.value.trim();
                A.rest('scheduled_tasks', { method: 'POST', body: { title: title.value.trim(), kind: kind.value, payload: pl, run_at: iso(when.value), repeat_hours: rep.value ? +rep.value : null }, prefer: 'return=minimal' }).then(function () { A.toast('أُضيفت المهمة'); A.reload(); }).catch(function (e) { er.textContent = e.message; });
            } });
            var rows = T.map(function (t) {
                return h('div', { cls: 'row' }, [h('div', null, [h('b', { text: t.title }), h('div', { cls: 'mut', text: kl[t.kind] + ' · الموعد: ' + dt(t.run_at) + (t.repeat_hours ? ' · تتكرر كل ' + t.repeat_hours + ' ساعة' : '') }), t.last_result ? h('div', { cls: 'mut', text: 'آخر نتيجة: ' + t.last_result + ' (' + A.ago(t.last_run) + ')' }) : null]),
                    h('div', { cls: 'row' }, [tag(h, t.active ? 'نشطة' : 'متوقفة', t.active ? 'ok' : ''),
                        h('button', { cls: 'btn alt sm', type: 'button', text: t.active ? 'إيقاف مؤقت' : 'استئناف', onclick: function () { A.rest('scheduled_tasks?id=eq.' + t.id, { method: 'PATCH', body: { active: !t.active }, prefer: 'return=minimal' }).then(function () { A.reload(); }); } }),
                        h('button', { cls: 'btn alt sm', type: 'button', text: 'تنفيذ الآن', onclick: function () { A.confirmBox('تنفيذ المهمة الآن؟').then(function (ok) { if (ok) A.rpc('admin_run_task', { p_id: t.id }).then(function () { A.toast('نُفّذت'); A.reload(); }).catch(function (e) { A.toast(e.message); }); }); } }),
                        h('button', { cls: 'btn alt sm', type: 'button', text: 'تعديل الموعد', onclick: function () { var v = prompt('الموعد الجديد (YYYY-MM-DD HH:MM) بتوقيتك المحلي', ''); if (!v) return; var d = new Date(v.replace(' ', 'T')); if (isNaN(d)) { A.toast('صيغة غير صحيحة'); return; } A.rest('scheduled_tasks?id=eq.' + t.id, { method: 'PATCH', body: { run_at: d.toISOString(), active: true }, prefer: 'return=minimal' }).then(function () { A.reload(); }); } }),
                        h('button', { cls: 'btn bad sm', type: 'button', text: 'حذف', onclick: function () { A.confirmBox('حذف المهمة نهائيًا؟', true).then(function (ok) { if (ok) A.rest('scheduled_tasks?id=eq.' + t.id, { method: 'DELETE', prefer: 'return=minimal' }).then(function () { A.reload(); }); }); } })])]);
            });
            return h('div', null, [h('h3', { text: 'مركز المهام التلقائية' }),
                A.card('مهمة جديدة', [h('label', null, ['العنوان', title]), h('label', null, ['النوع', kind]), h('label', null, ['الإعلان (للنشر/الإيقاف)', ann]), h('label', null, ['رسالة الصيانة', mm]), h('label', null, ['وقت التنفيذ', when]), h('label', null, ['التكرار', rep]), er, add, h('div', { cls: 'mut', text: 'تُنفَّذ تلقائيًا كل ٥ دقائق تقريبًا (مجدول Supabase المجاني). الأنواع المسموحة آمنة فقط: نشر/إيقاف إعلان، تفعيل/إيقاف الصيانة ورسالة الترحيب. لا حذف بيانات ولا عمليات خطرة.' })]),
                A.card('المهام', rows.length ? rows : [h('div', { cls: 'mut', text: 'لا مهام.' })]),
                A.card('سجل التنفيذ', R.length ? [tbl(h, ['الوقت', 'المهمة', 'النتيجة', 'التفاصيل'], R.map(function (x) { return [dt(x.at), x.title, tag(h, x.ok ? 'نجحت' : 'فشلت', x.ok ? 'ok' : 'bad'), x.result]; }))] : [h('div', { cls: 'mut', text: 'لم تُنفَّذ مهام بعد.' })])]);
        });
    }

    /* ============ مصادر المحتوى ============ */
    function health(A, body) { return fetch(A.U + '/functions/v1/health', { method: 'POST', headers: { apikey: A.K, Authorization: 'Bearer ' + A.token(), 'Content-Type': 'application/json' }, body: JSON.stringify(body), cache: 'no-store', credentials: 'omit' }).then(function (r) { return r.json(); }); }
    var STN = { ok: ['سليم', 'ok'], slow: ['بطيء', 'warn'], degraded: ['متذبذب', 'warn'], down: ['متوقف', 'bad'], unknown: ['لم يُفحص', ''], local: ['محلي', 'ok'] };
    function sources(A) {
        var h = A.h;
        return A.rest('content_sources?select=*&order=critical.desc,key').then(function (S) {
            var rows = S.map(function (s) {
                var st = STN[s.local ? 'local' : s.status] || STN.unknown, fb = h('input', { value: s.fallback_url || '', placeholder: 'رابط بديل موثوق (اختياري)', dir: 'ltr' }), res = h('div', { cls: 'mut' });
                return h('div', { cls: 'card' }, [h('div', { cls: 'row' }, [h('div', null, [h('b', { text: s.label }), h('div', { cls: 'mut', text: s.note || '' })]), tag(h, st[0], st[1])]),
                    s.local ? h('div', { cls: 'mut', text: 'تُحسب داخل التطبيق ولا تعتمد على خدمة خارجية، فلا تتأثر بانقطاع الإنترنت عن مصدر.' }) : h('div', null, [
                        h('div', { cls: 'mut', text: 'زمن الاستجابة: ' + (s.last_ms != null ? s.last_ms + ' ms' : '—') + ' · آخر نجاح: ' + (s.last_ok ? dt(s.last_ok) : '—') + ' · آخر فحص: ' + (s.last_check ? A.ago(s.last_check) : '—') + ' · إخفاقات متتالية: ' + s.fails }),
                        s.last_err ? h('div', { cls: 'err', text: 'آخر خطأ: ' + s.last_err }) : null,
                        h('label', null, ['المصدر البديل', fb]), res,
                        h('div', { cls: 'row' }, [
                            h('button', { cls: 'btn alt sm', type: 'button', text: 'اختبر الآن', onclick: function () { res.textContent = 'جارٍ الاختبار…'; health(A, { force: true, key: s.key }).then(function () { A.reload(); }).catch(function () { res.textContent = 'تعذّر الاختبار'; }); } }),
                            h('button', { cls: 'btn alt sm', type: 'button', text: 'اختبر البديل', onclick: function () { if (!fb.value.trim()) { res.textContent = 'أدخل رابطًا'; return; } res.textContent = 'جارٍ الاختبار…'; health(A, { url: fb.value.trim() }).then(function (j) { res.textContent = j.ok ? 'البديل يعمل (' + j.ms + ' ms) — لن يُستبدل المصدر تلقائيًا؛ تحقق من محتواه يدويًا قبل اعتماده.' : 'البديل لا يعمل: ' + (j.err || ''); }).catch(function () { res.textContent = 'تعذّر الاختبار'; }); } }),
                            h('button', { cls: 'btn alt sm', type: 'button', text: 'حفظ البديل', onclick: function () { var v = fb.value.trim(); if (v && !/^https:\/\//.test(v)) { A.toast('يجب أن يبدأ بـ https://'); return; } A.rest('content_sources?key=eq.' + s.key, { method: 'PATCH', body: { fallback_url: v || null }, prefer: 'return=minimal' }).then(function () { A.toast('حُفظ'); }); } }),
                            h('div', { cls: 'row' }, [h('span', { text: 'حرج' }), A.sw(s.critical, function (v) { A.rest('content_sources?key=eq.' + s.key, { method: 'PATCH', body: { critical: v }, prefer: 'return=minimal' }); })]),
                            h('div', { cls: 'row' }, [h('span', { text: 'مفعّل' }), A.sw(s.enabled, function (v) { A.rest('content_sources?key=eq.' + s.key, { method: 'PATCH', body: { enabled: v }, prefer: 'return=minimal' }); })])])])]);
            });
            return h('div', null, [h('h3', { text: 'مركز مصادر المحتوى' }), h('div', { cls: 'row' }, [h('div', { cls: 'mut', text: 'يُفحص تلقائيًا كل ١٥ دقيقة. يُعدّ المصدر «متوقفًا» بعد فحصين فاشلين متتاليين ويصدر تنبيه. لا يُستبدل أي مصدر قرآن/رواية تلقائيًا أبدًا.' }), h('button', { cls: 'btn', type: 'button', text: 'اختبار كل المصادر الآن', onclick: function () { health(A, { force: true }).then(function () { A.reload(); }).catch(function () { A.toast('تعذّر الاختبار'); }); } })])].concat(rows));
        });
    }

    /* ============ وضع المطوّر ============ */
    function dev(A) {
        var h = A.h, t0 = performance.now();
        return Promise.all([A.rpc('admin_dev_snapshot'), A.raw('/auth/v1/health').then(function (r) { return r.status; }).catch(function () { return 0; }), A.raw('/functions/v1/collect', { method: 'OPTIONS' }).then(function (r) { return r.status; }).catch(function () { return 0; }), fetch('version.json', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; })]).then(function (r) {
            var D = r[0], ms = Math.round(performance.now() - t0), nav = (performance.getEntriesByType('navigation')[0] || {}), E = D.errors || [], v = r[3];
            var byKind = {}; E.forEach(function (e) { byKind[e.k] = (byKind[e.k] || 0) + e.n; });
            var ok = function (c) { return tag(h, c ? 'يعمل' : 'لا يعمل', c ? 'ok' : 'bad'); };
            return h('div', null, [h('h3', { text: 'وضع المطوّر' }),
                h('div', { cls: 'grid' }, [A.stat(D.db_ms + ' ms', 'استعلام قاعدة البيانات'), A.stat(ms + ' ms', 'زمن الرحلة الكاملة'), A.stat(A.ar(D.db_mb) + ' MB', 'حجم قاعدة البيانات (الحد المجاني 500)'), A.stat(A.ar(D.conns), 'اتصالات DB'), A.stat(A.ar(D.err_today), 'أخطاء اليوم')]),
                A.card('حالة الخدمات', [h('div', { cls: 'row' }, [h('span', { text: 'قاعدة البيانات / PostgREST' }), ok(true)]), h('div', { cls: 'row' }, [h('span', { text: 'المصادقة Auth' }), ok(r[1] === 200)]), h('div', { cls: 'row' }, [h('span', { text: 'دوال الحافة (collect)' }), ok(r[2] > 0 && r[2] < 500)]),
                    h('div', { cls: 'row' }, [h('span', { text: 'المجدول pg_cron' }), ok((D.cron || []).some(function (c) { return c.active; }))])]),
                A.card('المهام الدورية', (D.cron_last || []).length ? [tbl(h, ['المهمة', 'الحالة', 'الوقت'], D.cron_last.map(function (c) { return [c.job, c.status, dt(c.at)]; }))] : [h('div', { cls: 'mut', text: 'لا سجل بعد.' })]),
                A.card('الإصدار والأداء', [h('div', { cls: 'row' }, [h('span', { text: 'إصدار الموقع' }), h('b', { text: String(v.version || v.v || v.build || 'غير متاح') })]), h('div', { cls: 'row' }, [h('span', { text: 'معرّف البناء' }), h('b', { text: String(v.build || v.bid || '—') })]), h('div', { cls: 'row' }, [h('span', { text: 'تحميل هذه الصفحة' }), h('b', { text: nav.duration ? Math.round(nav.duration) + ' ms' : '—' })]), h('div', { cls: 'row' }, [h('span', { text: 'ذاكرة JS' }), h('b', { text: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) + ' MB' : 'غير متاح في هذا المتصفح' })])]),
                A.card('الأخطاء حسب النوع', [A.list(byKind, { js: 'JavaScript', promise: 'وعود مرفوضة', load: 'فشل تحميل ملفات', network: 'شبكة' })]),
                A.card('سجل الأخطاء (آخر ٤٠)', E.length ? [tbl(h, ['الوقت', 'القسم', 'النوع', 'الرسالة', 'العدد'], E.map(function (e) { return [dt(e.at), sn(e.s), e.k, e.m, e.n]; }))] : [h('div', { cls: 'mut', text: 'لا أخطاء 🎉' })]),
                h('div', { cls: 'mut', text: 'لا تُعرض هنا كلمات مرور ولا مفاتيح سرية ولا رموز جلسات. الأخطاء مجمّعة ومقتطعة بلا بيانات شخصية.' })]);
        });
    }

    /* ============ التنبيهات ============ */
    var ALK = { quran_down: 'مصدر القرآن', audio_down: 'مصدر الصوت', source_down: 'مصدر', error_rate: 'معدل الأخطاء', slow: 'بطء', db: 'قاعدة البيانات', quota: 'حدود الخطة', report: 'بلاغ جديد', suggestion: 'اقتراح جديد', task_failed: 'مهمة فاشلة' };
    function alerts(A) {
        var h = A.h, F = (window.__alF = window.__alF || { view: 'open', sort: 'imp' });
        var q = 'admin_alerts?select=*&limit=150&archived=eq.' + (F.view === 'arch') + (F.view === 'unread' ? '&read=eq.false' : '') + '&order=' + (F.sort === 'imp' ? 'severity.desc,at.desc' : 'at.desc');
        return A.rest(q).then(function (L) {
            var sev = { 3: ['حرج', 'bad'], 2: ['متوسط', 'warn'], 1: ['معلومة', ''] };
            return h('div', null, [h('h3', { text: 'مركز التنبيهات' }),
                h('div', { cls: 'filters' }, [sel(h, [['open', 'الكل'], ['unread', 'غير المقروء'], ['arch', 'المؤرشف']], F.view, function (v) { F.view = v; A.reload(); }), sel(h, [['imp', 'الأهمية أولًا'], ['time', 'الأحدث أولًا']], F.sort, function (v) { F.sort = v; A.reload(); }),
                    h('button', { cls: 'btn alt sm', type: 'button', text: 'تعليم الكل كمقروء', onclick: function () { A.rest('admin_alerts?read=eq.false', { method: 'PATCH', body: { read: true }, prefer: 'return=minimal' }).then(function () { A.reload(); }); } })]),
                A.card(null, L.length ? L.map(function (a) {
                    return h('div', { cls: 'row' }, [h('div', null, [h('div', null, [tag(h, sev[a.severity][0], sev[a.severity][1]), ' ', tag(h, ALK[a.kind] || a.kind), a.read ? null : tag(h, 'جديد', 'warn')]), h('b', { text: a.title }), a.detail ? h('div', { cls: 'mut', text: a.detail }) : null, h('div', { cls: 'mut', text: dt(a.at) })]),
                        h('div', { cls: 'row' }, [a.read ? null : h('button', { cls: 'btn alt sm', type: 'button', text: 'مقروء', onclick: function () { A.rest('admin_alerts?id=eq.' + a.id, { method: 'PATCH', body: { read: true }, prefer: 'return=minimal' }).then(function () { A.reload(); }); } }), h('button', { cls: 'btn alt sm', type: 'button', text: a.archived ? 'إلغاء الأرشفة' : 'أرشفة', onclick: function () { A.rest('admin_alerts?id=eq.' + a.id, { method: 'PATCH', body: { archived: !a.archived, read: true }, prefer: 'return=minimal' }).then(function () { A.reload(); }); } })])]);
                }) : [h('div', { cls: 'mut', text: 'لا تنبيهات.' })])]);
        });
    }

    /* ============ الصيانة المتقدمة ============ */
    function maint(A) {
        var h = A.h;
        return A.rest('site_settings?select=value&key=eq.maint_plan').then(function (r) {
            var plan = r[0] && Array.isArray(r[0].value) ? r[0].value : [];
            function put(p) { return A.rest('site_settings?key=eq.maint_plan', { method: 'PATCH', body: { value: p, updated_at: new Date().toISOString() }, prefer: 'return=minimal' }).then(function () { A.toast('حُفظ'); A.reload(); }); }
            var scope = sel(h, [['all', 'الموقع كله']].concat(Object.keys(SECN).filter(function (k) { return k !== 'exit' && k !== 'prayer'; }).map(function (k) { return [k, 'قسم: ' + SECN[k]]; })), 'all'), msg = h('textarea', { maxlength: 300, placeholder: 'رسالة تظهر للزوار' }), mode = sel(h, [['manual', 'يدوي (أفعّله وأوقفه بنفسي)'], ['auto', 'تلقائي (بداية ونهاية)']], 'manual'), st = h('input', { type: 'datetime-local' }), en = h('input', { type: 'datetime-local' }), er = h('div', { cls: 'err' }), prev = h('div');
            function preview() { prev.textContent = ''; var all = scope.value === 'all'; prev.appendChild(h('div', { cls: 'pv' }, [h('b', { text: 'معاينة ما سيراه الزائر' }), h('div', { cls: 'pvbar', text: msg.value.trim() || 'الموقع تحت صيانة قصيرة.' }), h('div', { cls: 'mut', text: all ? 'شريط أعلى كل الصفحات؛ القرآن والصوت ومواقيت الصلاة تبقى تعمل.' : 'بطاقة قسم «' + sn(scope.value) + '» تُعتَّم وتظهر الرسالة عند فتحه؛ بقية الموقع يعمل كالمعتاد.' })])); }
            var add = h('button', { cls: 'btn', type: 'button', text: 'حفظ نافذة الصيانة', onclick: function () {
                er.textContent = ''; if (mode.value === 'auto' && !st.value) { er.textContent = 'حدد وقت البداية'; return; } if (st.value && en.value && new Date(en.value) <= new Date(st.value)) { er.textContent = 'النهاية قبل البداية'; return; }
                put(plan.concat([{ id: String(Date.now()), scope: scope.value, message: msg.value.trim() || 'قيد الصيانة وسيعود قريبًا', mode: mode.value, on: false, start: st.value ? iso(st.value) : '', end: en.value ? iso(en.value) : '' }]).slice(-30)); } });
            var rows = plan.map(function (m) {
                var live = (m.mode === 'manual' && m.on) || (m.mode === 'auto' && m.start && new Date(m.start) <= new Date() && (!m.end || new Date(m.end) > new Date()));
                return h('div', { cls: 'row' }, [h('div', null, [h('b', { text: (m.scope === 'all' ? 'الموقع كله' : 'قسم: ' + sn(m.scope)) + ' — ' + (m.mode === 'auto' ? 'تلقائي' : 'يدوي') }), h('div', { cls: 'mut', text: m.message }), m.mode === 'auto' ? h('div', { cls: 'mut', text: 'من ' + dt(m.start) + ' إلى ' + (m.end ? dt(m.end) : 'غير محدد') }) : null]),
                    h('div', { cls: 'row' }, [tag(h, live ? 'مفعّلة الآن' : 'غير مفعّلة', live ? 'warn' : ''), m.mode === 'manual' ? A.sw(m.on, function (v) { put(plan.map(function (x) { return x.id === m.id ? Object.assign({}, x, { on: v }) : x; })); }) : null,
                        h('button', { cls: 'btn bad sm', type: 'button', text: 'حذف', onclick: function () { put(plan.filter(function (x) { return x.id !== m.id; })); } })])]);
            });
            return h('div', null, [h('h3', { text: 'الصيانة المتقدمة' }),
                A.card('نافذة صيانة جديدة', [h('label', null, ['النطاق', scope]), h('label', null, ['الرسالة', msg]), h('label', null, ['النوع', mode]), h('label', null, ['البداية (للتلقائي)', st]), h('label', null, ['النهاية (اختياري)', en]), er, h('div', { cls: 'row' }, [h('button', { cls: 'btn alt', type: 'button', text: 'معاينة قبل النشر', onclick: preview }), add]), prev]),
                A.card('النوافذ الحالية', rows.length ? rows : [h('div', { cls: 'mut', text: 'لا نوافذ.' })]),
                A.card('إعادة التشغيل بعد الصيانة', [h('div', { cls: 'mut', text: 'النوافذ التلقائية تنتهي وحدها في موعدها. هذا الزر يوقف كل النوافذ اليدوية وشريط الصيانة العام فورًا ليعود الموقع طبيعيًا؛ يلتقط الزوار ذلك عند فتح الموقع أو عودتهم للاتصال.' }), h('button', { cls: 'btn', type: 'button', text: 'إنهاء كل الصيانة وإعادة تفعيل الموقع', onclick: function () { A.confirmBox('إنهاء كل الصيانة الآن؟').then(function (ok) { if (!ok) return; var now = new Date().toISOString(); A.rest('site_settings?key=eq.maint_plan', { method: 'PATCH', body: { value: plan.map(function (x) { return x.mode === 'manual' ? Object.assign({}, x, { on: false }) : Object.assign({}, x, { end: now }); }), updated_at: now }, prefer: 'return=minimal' }).then(function () { return A.rest('site_settings?key=eq.maintenance', { method: 'PATCH', body: { value: { on: false, message: '' }, updated_at: now }, prefer: 'return=minimal' }); }).then(function () { A.toast('عاد الموقع طبيعيًا'); A.reload(); }); }); } })])]);
        });
    }

    /* ============ البلاغات ============ */
    var RC = { mushaf: 'المصحف', audio: 'الصوت', reciter: 'قارئ لا يعمل', prayer: 'مواقيت الصلاة', design: 'التصميم', slow: 'بطء', other: 'أخرى' }, RS = { new: 'جديد', reviewing: 'قيد المراجعة', fixing: 'قيد الإصلاح', fixed: 'تم الحل', rejected: 'مرفوض' };
    function reports(A) {
        var h = A.h, F = (window.__rpF = window.__rpF || { st: '', cat: '', arch: 'false' });
        var q = 'reports?select=*&order=priority.desc,at.desc&limit=150&archived=eq.' + F.arch + (F.st ? '&status=eq.' + F.st : '') + (F.cat ? '&category=eq.' + F.cat : '');
        return A.rest(q).then(function (L) {
            function up(id, p) { return A.rest('reports?id=eq.' + id, { method: 'PATCH', body: Object.assign({ updated_at: new Date().toISOString() }, p), prefer: 'return=minimal' }); }
            var cards = L.map(function (r) {
                var sol = h('textarea', { maxlength: 500, placeholder: 'الحل المطبّق' }); sol.value = r.solution || '';
                return h('div', { cls: 'card' }, [h('div', { cls: 'row' }, [h('div', null, [tag(h, RC[r.category] || r.category), ' ', tag(h, 'القسم: ' + sn(r.section)), ' ', tag(h, RS[r.status], r.status === 'fixed' ? 'ok' : r.status === 'new' ? 'warn' : '')]), h('span', { cls: 'mut', text: dt(r.at) + ' · مجهول' })]),
                    h('div', { text: r.message, cls: 'pre' }),
                    h('div', { cls: 'filters' }, [sel(h, Object.keys(RC).map(function (k) { return [k, RC[k]]; }), r.category, function (v) { up(r.id, { category: v }); }), sel(h, [[3, 'أولوية عالية'], [2, 'متوسطة'], [1, 'منخفضة']], r.priority, function (v) { up(r.id, { priority: +v }); }), sel(h, Object.keys(RS).map(function (k) { return [k, RS[k]]; }), r.status, function (v) { up(r.id, { status: v }).then(function () { A.toast('حُدّثت الحالة'); }); })]),
                    h('label', null, ['الحل المطبّق', sol]), h('div', { cls: 'row' }, [h('button', { cls: 'btn alt sm', type: 'button', text: 'حفظ الحل', onclick: function () { up(r.id, { solution: sol.value.trim() }).then(function () { A.toast('حُفظ'); }); } }), h('button', { cls: 'btn alt sm', type: 'button', text: r.archived ? 'إلغاء الأرشفة' : 'أرشفة', onclick: function () { up(r.id, { archived: !r.archived }).then(function () { A.reload(); }); } })])]);
            });
            return h('div', null, [h('h3', { text: 'مركز البلاغات' }), h('div', { cls: 'filters' }, [sel(h, [['', 'كل الحالات']].concat(Object.keys(RS).map(function (k) { return [k, RS[k]]; })), F.st, function (v) { F.st = v; A.reload(); }), sel(h, [['', 'كل الأنواع']].concat(Object.keys(RC).map(function (k) { return [k, RC[k]]; })), F.cat, function (v) { F.cat = v; A.reload(); }), sel(h, [['false', 'النشطة'], ['true', 'المؤرشفة']], F.arch, function (v) { F.arch = v; A.reload(); })])].concat(cards.length ? cards : [h('div', { cls: 'mut', text: 'لا بلاغات.' })]));
        });
    }

    /* ============ الاقتراحات ============ */
    var SS = { new: 'جديد', study: 'قيد الدراسة', accepted: 'مقبول', rejected: 'مرفوض', done: 'تم التنفيذ' }, SC = { feature: 'ميزة', design: 'تصميم', content: 'محتوى', audio: 'صوت', other: 'أخرى' };
    function suggestions(A) {
        var h = A.h, F = (window.__sgF = window.__sgF || { st: '', arch: 'false' });
        return A.rest('suggestions?select=*&dup_of=is.null&order=votes.desc,at.desc&limit=150&archived=eq.' + F.arch + (F.st ? '&status=eq.' + F.st : '')).then(function (L) {
            function up(id, p) { return A.rest('suggestions?id=eq.' + id, { method: 'PATCH', body: p, prefer: 'return=minimal' }); }
            var cards = L.map(function (s) {
                return h('div', { cls: 'card' }, [h('div', { cls: 'row' }, [h('div', null, [h('b', { text: s.title }), h('div', { cls: 'mut', text: (SC[s.category] || s.category) + ' · ' + dt(s.at) })]), h('div', null, [tag(h, '▲ ' + A.ar(s.votes) + ' صوت', 'ok'), ' ', tag(h, SS[s.status], s.status === 'new' ? 'warn' : '')])]),
                    s.body ? h('div', { text: s.body, cls: 'pre' }) : null,
                    h('div', { cls: 'filters' }, [sel(h, Object.keys(SS).map(function (k) { return [k, SS[k]]; }), s.status, function (v) { up(s.id, { status: v }).then(function () { A.toast('حُدّثت'); }); }), sel(h, Object.keys(SC).map(function (k) { return [k, SC[k]]; }), s.category, function (v) { up(s.id, { category: v }); }),
                        h('button', { cls: 'btn alt sm', type: 'button', text: 'دمج في اقتراح آخر', onclick: function () { var v = prompt('رقم الاقتراح الأساسي'); if (!v || isNaN(+v) || +v === s.id) return; A.rest('suggestions?id=eq.' + s.id, { method: 'PATCH', body: { dup_of: +v, archived: true }, prefer: 'return=minimal' }).then(function () { A.toast('دُمج (رقم هذا الاقتراح ' + s.id + ')'); A.reload(); }); } }),
                        h('span', { cls: 'mut', text: '#' + s.id }), h('button', { cls: 'btn alt sm', type: 'button', text: s.archived ? 'إلغاء الأرشفة' : 'أرشفة', onclick: function () { up(s.id, { archived: !s.archived }).then(function () { A.reload(); }); } })])]);
            });
            return h('div', null, [h('h3', { text: 'مركز اقتراحات الزوار' }), h('div', { cls: 'mut', text: 'تُكشف الاقتراحات المتشابهة تلقائيًا (نفس العنوان بعد التنظيف) وتُدمج أصواتها. الأصوات مجهولة، صوت واحد لكل معرّف.' }), h('div', { cls: 'filters' }, [sel(h, [['', 'كل الحالات']].concat(Object.keys(SS).map(function (k) { return [k, SS[k]]; })), F.st, function (v) { F.st = v; A.reload(); }), sel(h, [['false', 'النشطة'], ['true', 'المؤرشفة']], F.arch, function (v) { F.arch = v; A.reload(); })])].concat(cards.length ? cards : [h('div', { cls: 'mut', text: 'لا اقتراحات.' })]));
        });
    }

    window.__admX = {
        tabs: [['vis', 'مركز الزوار', visitors], ['jour', 'رحلة الزائر', journey], ['tasks', 'المهام التلقائية', tasks], ['src', 'مصادر المحتوى', sources], ['alerts', 'التنبيهات', alerts], ['maint', 'الصيانة المتقدمة', maint], ['rep', 'البلاغات', reports], ['sug', 'الاقتراحات', suggestions], ['dev', 'وضع المطوّر', dev]],
        after: function (A, nav) {
            A.rest('admin_alerts?select=id&read=eq.false&archived=eq.false&limit=100').then(function (r) { if (!r || !r.length) return; var b = [].slice.call(nav.querySelectorAll('button')).filter(function (x) { return x.textContent.indexOf('التنبيهات') === 0; })[0]; if (b) b.appendChild(A.h('span', { cls: 'badge', text: String(r.length) })); }).catch(function () { });
        }
    };
})();
