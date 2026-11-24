# -*- coding: utf-8 -*-
import re, importlib.util
from pptx import Presentation
from pptx.util import Cm, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn

# reuse content from build.py without regenerating html
src=open('build.py',encoding='utf-8').read().split("def header")[0]
ns={}; exec(src,ns); standards=ns['standards']; goals=ns['goals']

DK=RGBColor(0x0f,0x3d,0x4c); GR=RGBColor(0xb7,0xd9,0x9a); GD=RGBColor(0x6f,0xae,0x4a)
LG=RGBColor(0xe8,0xf2,0xdc); WH=RGBColor(255,255,255); BK=RGBColor(0x22,0x22,0x22); TEAL=RGBColor(0x2b,0x9a,0xa8)
FONT='Tajawal'
prs=Presentation(); prs.slide_width=Cm(21); prs.slide_height=Cm(29.7)
blank=prs.slide_layouts[6]

def rtl(p,align=PP_ALIGN.CENTER):
    p._p.get_or_add_pPr().set('rtl','1'); p.alignment=align

def text(sl,x,y,w,h,s,size=14,bold=False,color=BK,align=PP_ALIGN.CENTER,fill=None,shape=MSO_SHAPE.RECTANGLE,anchor=MSO_ANCHOR.MIDDLE,name=None):
    sh=sl.shapes.add_shape(shape,Cm(x),Cm(y),Cm(w),Cm(h))
    if name: sh.name=name
    if fill is None: sh.fill.background()
    else: sh.fill.solid(); sh.fill.fore_color.rgb=fill
    sh.line.fill.background()
    tf=sh.text_frame; tf.word_wrap=True; tf.vertical_anchor=anchor
    for i,line in enumerate(s.split('\n')):
        p=tf.paragraphs[0] if i==0 else tf.add_paragraph()
        rtl(p,align); r=p.add_run(); r.text=line
        f=r.font; f.size=Pt(size); f.bold=bold; f.color.rgb=color; f.name=FONT
        r._r.get_or_add_rPr().append(r._r.makeelement(qn('a:cs'),{'typeface':FONT}))
    return sh

def base(title_pill=None):
    sl=prs.slides.add_slide(blank)
    h=text(sl,0.6,0,19.8,5.2,'',fill=DK,shape=MSO_SHAPE.ROUND_2_SAME_RECTANGLE,name='ترويسة')
    h.rotation=180   # rounded corners at bottom
    text(sl,9.0,0.9,10.8,2.6,'الإدارة العامة للتعليم\nاسم المنطقة هنا\nاسم مكتب التعليم هنا',size=11,bold=True,color=WH,align=PP_ALIGN.RIGHT,name='الإدارة')
    lg=text(sl,1.6,1.1,3,1.9,'شعار\nالوزارة',size=9,color=WH,name='مكان الشعار'); lg.line.color.rgb=RGBColor(0x99,0xcc,0xcc); lg.line.dash_style=4
    text(sl,5.5,4.7,10,1.1,'اســـم المـــدرســـة هنــــا',size=12,bold=True,color=WH,fill=DK,shape=MSO_SHAPE.ROUNDED_RECTANGLE,name='اسم المدرسة').line.color.rgb=WH
    ft=text(sl,0,28.6,21,1.1,'ملف إنجاز المعلم وفق معايير الأداء الوظيفي الجديد',size=8,bold=True,color=DK,fill=GR,name='تذييل')
    return sl

def pill(sl,s,y=7.2,size=19,w=12):
    return text(sl,(21-w)/2,y,w,1.7,s,size=size,bold=True,color=WH,fill=DK,shape=MSO_SHAPE.ROUNDED_RECTANGLE,name='عنوان')

def style_cell(c,s,size=10.5,bold=False,fill=None,align=PP_ALIGN.CENTER):
    c.fill.solid(); c.fill.fore_color.rgb=fill or WH
    c.vertical_anchor=MSO_ANCHOR.MIDDLE
    tf=c.text_frame; tf.word_wrap=True
    for i,line in enumerate(s.split('\n')):
        p=tf.paragraphs[0] if i==0 else tf.add_paragraph()
        rtl(p,align); p.space_after=Pt(5); r=p.add_run(); r.text=line
        r.font.size=Pt(size); r.font.bold=bold; r.font.name=FONT; r.font.color.rgb=BK
        r._r.get_or_add_rPr().append(r._r.makeelement(qn('a:cs'),{'typeface':FONT}))

def table(sl,x,y,w,rows,cols,widths,row_h=0.9,header=True):
    gs=sl.shapes.add_table(rows,cols,Cm(x),Cm(y),Cm(w),Cm(row_h*rows))
    t=gs.table
    tblPr=t._tbl.tblPr; tblPr.set('rtl','1')
    for a in ('bandRow','firstRow'): tblPr.set(a,'0')
    sid=tblPr.find(qn('a:tableStyleId'))
    if sid is not None: sid.text='{5940675A-B579-460E-94D1-54222C63F5DA}'  # no style, table grid
    for i,wd in enumerate(widths): t.columns[i].width=Cm(wd)
    for r in t.rows: r.height=Cm(row_h)
    return t

def grid_slide(title,heads,widths,n):
    sl=base()
    text(sl,1.4,6.8,18.2,1.1,title,size=12,bold=True,fill=GR,name='عنوان الجدول')
    t=table(sl,1.4,8.2,18.2,n+1,len(heads),widths,row_h=1.05)
    for j,h in enumerate(heads): style_cell(t.cell(0,j),h,bold=True,fill=GR)
    for i in range(1,n+1):
        for j in range(len(heads)): style_cell(t.cell(i,j),'')
    return sl

# 1 cover
sl=base()
text(sl,3,12,15,3.2,'ملف إنجاز المعلم',size=34,bold=True,color=WH,fill=DK,shape=MSO_SHAPE.ROUNDED_RECTANGLE,name='العنوان الرئيسي')
text(sl,3,18.5,15,1.6,'اسم المعلم: ................................',size=22,bold=True,name='اسم المعلم')
text(sl,3,23,15,1.2,'العام الدراسي: ١٤٤٧ هـ',size=15,bold=True,name='العام الدراسي')
# 2 goals
sl=base(); pill(sl,'أهداف المعلم')
for i,g in enumerate(goals):
    text(sl,2.6,10.2+i*2.2,15.8,1.5,g,size=12,bold=True,color=WH,fill=DK,name=f'هدف {i+1}')
# 3 personal
sl=base(); pill(sl,'البيانات الشخصية')
t=table(sl,1.4,10.5,18.2,4,4,[3.2,5.9,3.2,5.9],row_h=1.4)
labels=[('الاسم','التخصص'),('رقم السجل المدني','المرحلة'),('المؤهل','سنوات الخبرة'),('المواد','الصفوف')]
for i,(a,b) in enumerate(labels):
    style_cell(t.cell(i,0),a,bold=True,fill=GR); style_cell(t.cell(i,1),'')
    style_cell(t.cell(i,2),b,bold=True,fill=GR); style_cell(t.cell(i,3),'')
# standards
for n,(title,items) in enumerate(standards,1):
    sl=base()
    text(sl,9.2,6.5,2.6,2.6,str(n),size=26,bold=True,color=TEAL,shape=MSO_SHAPE.OVAL,name='رقم المعيار').line.color.rgb=TEAL
    pill(sl,title,y=9.6,w=14)
    t=table(sl,1.4,12.8,18.2,2,3,[5.0,3.2,10.0],row_h=1.0)
    t.rows[1].height=Cm(0.9*len(items)+1.2)
    for j,h in enumerate(['عنصر التقييم','الوزن النسبي','معايير التحقق']): style_cell(t.cell(0,j),h,bold=True,fill=GR)
    style_cell(t.cell(1,0),title,bold=True,fill=LG); style_cell(t.cell(1,1),'10%',bold=True,fill=LG)
    style_cell(t.cell(1,2),'\n'.join('☐  '+x for x in items),size=10,align=PP_ALIGN.RIGHT)
    sl=base()
    text(sl,1.4,6.8,18.2,1.1,f'شواهد مصورة — {title}',size=12,bold=True,fill=GR,name='عنوان الشواهد')
    fr=text(sl,1.4,8.4,18.2,18.8,'أضف الصور والمستندات هنا',size=12,color=RGBColor(0xaa,0xaa,0xaa),name='إطار الشواهد'); fr.line.color.rgb=RGBColor(0xbb,0xbb,0xbb); fr.line.dash_style=4
grid_slide('الدورات التدريبية وورش العمل',['م','اسم الدورة','الجهة المنفذة','التاريخ','عدد الساعات'],[1.2,7.0,4.4,3.0,2.6],17)
grid_slide('تصنيف المتعلمين وفق أنماط التعلم (VARK)',['م','اسم الطالب','بصري','سمعي','قرائي/كتابي','حركي'],[1.2,7.0,2.5,2.5,2.9,2.1],17)
prs.save('ملف-إنجاز-المعلم.pptx'); print(len(prs.slides._sldIdLst))
