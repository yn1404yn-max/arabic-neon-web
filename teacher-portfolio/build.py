# -*- coding: utf-8 -*-
standards = [
 ("أداء الواجبات الوظيفية", ["يطبق الأنظمة وقواعد السلوك الوظيفي وأخلاقيات المهنة","يعزز الانتماء والولاء للوطن والقيم الوطنية","يحافظ على خصوصية المعلومات المهنية وحماية البيانات والمعلومات","يلتزم بالقوانين والأنظمة وسياسات وإجراءات العمل"]),
 ("التفاعل مع المجتمع المهني", ["يشارك في مجتمعات التعلم المهنية","يتبادل الخبرات والممارسات مع الزملاء","يشارك في الأنشطة المهنية والتطويرية"]),
 ("التفاعل مع أولياء الأمور", ["يفعّل قنوات التواصل الفعالة مع أولياء الأمور لمناقشة تقدم الطلبة","يشجع أولياء الأمور على المشاركة في العملية التعليمية","يتواصل باستمرار مع أولياء الأمور لمناقشة التقدم العلمي والاجتماعي للمتعلمين","يستجيب لمقترحات أولياء الأمور ويتعاون معهم بشكل إيجابي"]),
 ("التنويع في استراتيجيات التدريس", ["ينوّع في استراتيجيات التدريس بما يناسب المحتوى","يراعي الفروق الفردية بين المتعلمين","يوظف التعلم النشط في الموقف التعليمي"]),
 ("تحسين نتائج المتعلمين", ["يضع خططًا علاجية وإثرائية","يتابع تقدم المتعلمين ويقيس أثر التدخلات","يحقق تحسنًا ملموسًا في نتائج المتعلمين"]),
 ("إعداد وتنفيذ خطة التعلم", ["يعد خطة التعلم وفق المنهج والأهداف","ينفذ الدروس وفق الخطة المعدة","يراجع الخطة ويطورها في ضوء النتائج"]),
 ("توظيف تقنيات ووسائل التعلم", ["يوظف التقنية في التعليم والتعلم","يستخدم منصات التعلم الرقمية","يوظف الوسائل التعليمية المناسبة للمحتوى"]),
 ("تهيئة البيئة التعليمية", ["يهيئ بيئة صفية آمنة وجاذبة","ينظم الفضاء الصفي بما يخدم التعلم","يعزز ثقافة الاحترام والتعاون في البيئة التعليمية"]),
 ("الإدارة الصفية", ["يضع قواعد وإجراءات واضحة لإدارة الصف","يوجه سلوك المتعلمين ويعززه إيجابيًا","ينظم وقت الحصة والأنشطة بفاعلية"]),
 ("تحليل نتائج المتعلمين وتشخيص مستواهم", ["يحلل نتائج المتعلمين ويشخص مستوياتهم","يحدد نقاط القوة وفرص التحسين","يوظف نتائج التحليل في تخطيط التعلم"]),
 ("تنوع أساليب التقويم", ["ينوع أدوات التقويم ويربطها بالأهداف","يقدم تغذية راجعة فعالة للمتعلمين","يوظف التقويم المستمر لدعم التعلم"]),
]
goals = ["تقديم المفاهيم بصورة مبسطة وواضحة للطلاب","ربط المفاهيم بالحياة الواقعية","تصحيح الفكرة النمطية السائدة عن المادة","تنمية قدرات الطلاب على التفكير والإبداع","توجيه وإرشاد الطلاب وتوعيتهم بالأنشطة والأنظمة","إكساب الطلاب مهارات القرن 21","تدريب الطلاب على استخدام التقنية في التعليم"]

def header():
    return '''<div class="hdr"><div class="hdr-in">
<div class="gov"><b>الإدارة العامة للتعليم</b><b>اسم المنطقة هنا</b><span>اسم مكتب التعليم هنا</span></div>
<div class="logo-ph">شعار<br>الوزارة</div></div>
<div class="school">اســـم المـــدرســـة هنــــا</div></div>'''
foot = '<div class="foot"><span>ملف إنجاز المعلم وفق معايير الأداء الوظيفي الجديد</span></div>'
def page(body, cls=""):
    return f'<section class="page {cls}">{header()}<div class="body">{body}</div>{foot}</section>'

pages=[]
pages.append(page('<div class="cover"><div class="pill big">ملف إنجاز المعلم</div><div class="name">اسم المعلم: ................................</div><div class="year">العام الدراسي: ١٤٤٧ هـ</div></div>'))
pages.append(page('<div class="pill">أهداف المعلم</div><ul class="goals">'+''.join(f'<li><span>{g}</span></li>' for g in goals)+'</ul>'))
pages.append(page('<div class="pill">البيانات الشخصية</div><table class="t form"><tr><th>الاسم</th><td></td><th>التخصص</th><td></td></tr><tr><th>رقم السجل المدني</th><td></td><th>المرحلة</th><td></td></tr><tr><th>المؤهل</th><td></td><th>سنوات الخبرة</th><td></td></tr><tr><th>المواد</th><td></td><th>الصفوف</th><td></td></tr></table>'))
for i,(t,items) in enumerate(standards,1):
    rows=''.join(f'<div class="chk"><i></i>{x}</div>' for x in items)
    tbl=f'<table class="t"><tr><th>عنصر التقييم</th><th class="w">الوزن النسبي</th><th>معايير التحقق</th></tr><tr><td class="c">{t}</td><td class="c">10%</td><td class="chks">{rows}</td></tr></table>'
    pages.append(page(f'<div class="num">{i}</div><div class="pill">{t}</div>{tbl}'))
    pages.append(page(f'<div class="bar">شواهد مصورة — {t}</div><div class="evid"></div>'))
pages.append(page('<div class="bar">الدورات التدريبية وورش العمل</div><table class="t grid"><tr><th>م</th><th>اسم الدورة</th><th>الجهة المنفذة</th><th>التاريخ</th><th>عدد الساعات</th></tr>'+'<tr><td></td><td></td><td></td><td></td><td></td></tr>'*14+'</table>'))
pages.append(page('<div class="bar">تصنيف المتعلمين وفق أنماط التعلم (VARK)</div><table class="t grid"><tr><th>م</th><th>اسم الطالب</th><th>بصري</th><th>سمعي</th><th>قرائي/كتابي</th><th>حركي</th></tr>'+'<tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>'*16+'</table>'))

css='''
@font-face{font-family:T;src:url(fonts/Tajawal-Regular.ttf);font-weight:400}
@font-face{font-family:T;src:url(fonts/Tajawal-Medium.ttf);font-weight:500}
@font-face{font-family:T;src:url(fonts/Tajawal-Bold.ttf);font-weight:700}
@font-face{font-family:T;src:url(fonts/Tajawal-ExtraBold.ttf);font-weight:800}
:root{--dk:#0f3d4c;--gr:#b7d99a;--gd:#6fae4a;--bd:#8aa}
@page{size:A4;margin:0}
*{box-sizing:border-box}body{margin:0;font-family:T,sans-serif;background:#ddd}
.page{width:210mm;height:297mm;background:#fff;position:relative;overflow:hidden;page-break-after:always;margin:0 auto 8mm}
@media print{body{background:#fff}.page{margin:0}}
.hdr{background:var(--dk);height:52mm;border-radius:0 0 12mm 12mm;margin:0 6mm;position:relative;color:#fff}
.hdr-in{display:flex;justify-content:space-between;align-items:center;padding:10mm 14mm 0}
.gov{display:flex;flex-direction:column;gap:1mm;font-size:11pt;text-align:right}.gov span{color:var(--gr);font-size:9.5pt}
.logo-ph{width:28mm;height:18mm;border:1px dashed #9cc;border-radius:2mm;text-align:center;font-size:9pt;line-height:1.3;padding-top:3mm;opacity:.8}
.school{position:absolute;bottom:-5mm;left:50%;transform:translateX(-50%);background:var(--dk);border:1.5px solid #fff;outline:2px solid var(--dk);color:#fff;border-radius:3mm;padding:2mm 14mm;font-weight:700;font-size:12pt;white-space:nowrap}
.body{padding:16mm 14mm 0;text-align:center}
.pill{display:inline-block;background:var(--dk);color:#fff;border-top:2px solid var(--gd);border-radius:3mm;padding:3mm 14mm;font-weight:800;font-size:19pt;margin-top:6mm}
.pill.big{font-size:32pt;padding:6mm 22mm;margin-top:40mm}
.cover .name{font-size:22pt;font-weight:800;margin-top:40mm}.cover .year{font-size:15pt;font-weight:700;margin-top:28mm}
.goals{list-style:none;padding:0;margin:12mm 8mm 0}.goals li{margin:0 0 5mm;border-top:1.5px solid #999;border-bottom:1.5px solid #999;padding:1.2mm 0}
.goals li span{display:block;background:var(--dk);color:#fff;font-size:12pt;font-weight:700;padding:2.4mm;margin:0 6mm;border-radius:1mm}
.num{width:22mm;height:22mm;margin:8mm auto 0;border:3px solid #2b9aa8;border-radius:50%;color:#2b9aa8;font-size:26pt;font-weight:800;line-height:19mm}
.t{width:100%;border-collapse:collapse;font-size:10.5pt;margin-top:14mm;border:1px solid var(--bd)}
.t th{background:var(--gr);font-weight:700;padding:2.5mm;border:1px solid var(--bd)}
.t td{border:1px solid var(--bd);padding:2.5mm;vertical-align:middle}.t .w{width:24mm}
.t td.c{text-align:center;background:#e8f2dc;font-weight:700;width:30mm}
.t td.chks{text-align:right}.chk{display:flex;align-items:flex-start;gap:2mm;margin:1.5mm 0;font-size:10pt}
.chk i{flex:0 0 3.5mm;height:3.5mm;border:1px solid #555;margin-top:1.2mm}
.bar{background:var(--gr);font-weight:700;padding:2.5mm;margin-top:6mm;border:1px solid var(--bd);font-size:12pt}
.evid{border:1.5px dashed #bbb;height:175mm;margin-top:6mm;border-radius:2mm}
.grid td{height:10mm}.grid th:first-child,.grid td:first-child{width:10mm}
.form th{width:30mm}.form td{height:11mm}
.foot{position:absolute;bottom:0;left:0;right:0;height:11mm;background:linear-gradient(90deg,var(--gd),var(--gr) 60%,#fff);display:flex;align-items:center;justify-content:center;font-size:8pt;color:var(--dk);font-weight:700}
'''
open('index.html','w',encoding='utf-8').write(f'<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><title>ملف إنجاز المعلم</title><style>{css}</style><body>{"".join(pages)}</body></html>')
