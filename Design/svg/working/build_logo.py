from pathlib import Path
import json
import numpy as np
from PIL import Image
import math

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT.parent / 'ChatGPT Image Sep 19, 2026, 12_35_10 PM.png'
im = np.asarray(Image.open(SOURCE).convert('RGB'), dtype=float)

def contours(field, level):
    # Subpixel marching squares, with shared edge identifiers for exact joining.
    links, points = {}, {}
    h,w = field.shape
    for y in range(h-1):
        for x in range(w-1):
            v = [field[y,x],field[y,x+1],field[y+1,x+1],field[y+1,x]]
            xy = [(x,y),(x+1,y),(x+1,y+1),(x,y+1)]
            ids = [('h',x,y),('v',x+1,y),('h',x,y+1),('v',x,y)]
            cross=[]
            for k in range(4):
                j=(k+1)%4
                if (v[k]>=level)!=(v[j]>=level):
                    t=(level-v[k])/(v[j]-v[k])
                    points[ids[k]]=np.array(xy[k])*(1-t)+np.array(xy[j])*t
                    cross.append(ids[k])
            for a,b in zip(cross[::2],cross[1::2]):
                links.setdefault(a,[]).append(b)
                links.setdefault(b,[]).append(a)
    used=set(); out=[]
    for start in links:
        if start in used: continue
        cur=start; prev=None; loop=[]
        while cur not in used:
            used.add(cur); loop.append(points[cur])
            nex=[n for n in links[cur] if n!=prev]
            if not nex: break
            prev,cur=cur,nex[0]
        p=np.array(loop)
        if len(p)>4 and abs(np.sum(p[:,0]*np.roll(p[:,1],-1)-p[:,1]*np.roll(p[:,0],-1)))/2 > 1.2:
            out.append(p)
    return out

def unit(v):
    return v/max(np.linalg.norm(v),1e-10)

def fit_curve(p, tan1, tan2, tol):
    if len(p)==2:
        d=np.linalg.norm(p[1]-p[0])/3
        return [(p[0],p[0]+tan1*d,p[1]+tan2*d,p[1])]
    u=np.concatenate(([0],np.cumsum(np.linalg.norm(np.diff(p,axis=0),axis=1))))
    u=u/u[-1]; v=1-u
    b0=v**3; b1=3*u*v*v; b2=3*u*u*v; b3=u**3
    a1=b1[:,None]*tan1; a2=b2[:,None]*tan2
    resid=p-(b0+b1)[:,None]*p[0]-(b2+b3)[:,None]*p[-1]
    mat=np.array([[np.sum(a1*a1),np.sum(a1*a2)],[np.sum(a1*a2),np.sum(a2*a2)]])
    rhs=np.array([np.sum(a1*resid),np.sum(a2*resid)])
    try: alpha=np.linalg.solve(mat,rhs)
    except np.linalg.LinAlgError: alpha=np.array([-1,-1])
    length=np.linalg.norm(p[-1]-p[0])
    if np.min(alpha)<1e-5 or np.max(alpha)>length*2:
        alpha=np.array([length/3,length/3])
    c1=p[0]+tan1*alpha[0]; c2=p[-1]+tan2*alpha[1]
    pred=b0[:,None]*p[0]+b1[:,None]*c1+b2[:,None]*c2+b3[:,None]*p[-1]
    err=np.sum((pred-p)**2,axis=1); split=int(np.argmax(err))
    if err[split] <= tol*tol:
        return [(p[0],c1,c2,p[-1])]
    split=max(1,min(len(p)-2,split))
    mid=unit(p[split-1]-p[split+1])
    return fit_curve(p[:split+1],tan1,mid,tol)+fit_curve(p[split:],-mid,tan2,tol)

def fmt(p): return f'{p[0]:.2f} {p[1]:.2f}'

def make_path(p,tol):
    # Preserve corners explicitly; fit smooth cubic segments elsewhere.
    n=len(p); span=3 if tol>.2 else 2
    score=[]
    for i in range(n):
        a=unit(p[i]-p[(i-span)%n]);b=unit(p[(i+span)%n]-p[i])
        score.append(np.dot(a,b))
    candidates=sorted([i for i,s in enumerate(score) if s<.6],key=lambda i:score[i])
    corners=[]
    for i in candidates:
        if all(min((i-j)%n,(j-i)%n)>span for j in corners): corners.append(i)
    if len(corners)<2: corners=[0,n//2]
    corners.sort(); curves=[]
    for i,a in enumerate(corners):
        b=corners[(i+1)%len(corners)]
        indices=list(range(a,b+1)) if b>a else list(range(a,n))+list(range(b+1))
        q=p[indices]
        curves.extend(fit_curve(q,unit(q[1]-q[0]),unit(q[-2]-q[-1]),tol))
    d='M '+fmt(curves[0][0])
    for a,b,c,e in curves:
        # Straight segments are easier to edit as lines.
        chord=e-a
        cross=lambda q:abs(chord[0]*(q-a)[1]-chord[1]*(q-a)[0])/max(np.linalg.norm(chord),1e-9)
        if cross(b)<.08 and cross(c)<.08: d+=' L '+fmt(e)
        else: d+=' C '+fmt(b)+' '+fmt(c)+' '+fmt(e)
    return d+' Z'

def trace(box, color, tol, level, name):
    x0,y0,x1,y1=box
    pix=im[y0:y1,x0:x1]
    bg=np.array([251,252,252]); fg=np.array(color)
    field=np.clip(np.sum((bg-pix)*(bg-fg),axis=2)/np.sum((bg-fg)**2),0,1)
    loops=contours(field,level)
    if name=='wordmark': loops=[p for p in loops if np.min(p[:,0])+x0<1270]
    paths=' '.join(make_path(p+np.array([x0+.5,y0+.5]),tol) for p in loops)
    return f'<path id="{name}" fill="#{color[0]:02x}{color[1]:02x}{color[2]:02x}" fill-rule="evenodd" d="{paths}"/>'

top='M 281.4 422.1 C 249.0 423.2 222.6 398.2 222.7 365.0 C 222.5 339.9 234.5 319.7 257.0 307.5 C 282.3 294.2 292.8 288.6 309.3 254.8 C 326.9 222.7 342.1 204.3 370.3 198.6 C 396.7 192.7 422.0 200.7 438.1 215.8 C 459.8 235.9 459.3 263.2 446.7 285.6 C 439.6 299.1 433.8 303.1 419.4 306.8 C 386.0 316.0 357.6 340.6 344.1 371.3 C 332.7 402.6 315.0 421.1 281.4 422.1 Z'
bottom='M 275 385 C 276 400 281 414 292.7 419.4 C 307.3 451.0 335.6 469.0 370.5 468.4 C 415.6 468.5 454.1 441.1 472.0 399.9 C 483.6 373.4 482.2 349.4 469.6 330.1 C 459.2 314.3 444.1 306.6 427.0 306.1 C 382 305 347 334 329 369 C 313 398 293 411 275 385 Z'

def gradient(id,cx,cy,rx,ry,color,opacity):
    stops=[]
    # Gaussian opacity profile encoded with standard SVG radial-gradient stops.
    for r in np.linspace(0,1,21):
        a=opacity*math.exp(-4.5*r*r)
        if r==1:a=0
        stops.append(f'<stop offset="{r:.2f}" stop-color="{color}" stop-opacity="{a:.4f}"/>')
    return f'<radialGradient id="{id}" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" gradientTransform="translate({cx} {cy}) scale({rx} {ry})">'+''.join(stops)+'</radialGradient>'

params={'upper-blue':[339,328,157,238,'#0054ff',.92],'upper-light':[245,388,160,140,'#c2e9ff',.55],'upper-core':[348,345,70,95,'#0054ff',.1],'lower-blue':[316,401,198,170,'#095bff',.84],'lower-light':[410,320,110,100,'#eaf8ff',.2]}
if (ROOT/'working/gradients.json').exists(): params=json.loads((ROOT/'working/gradients.json').read_text())
defs=[gradient(k,*v) for k,v in params.items()]
word=trace((500,240,1325,380),(5,16,54),.36,.5,'wordmark')
tag=trace((533,400,700,490),(70,98,173),.16,.47,'tagline')
svg='''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1160" height="355" viewBox="190 165 1160 355" role="img" aria-labelledby="logo-title logo-desc">
<title id="logo-title">Vibecheck — primary logo</title>
<desc id="logo-desc">Blue flowing two-part symbol beside the navy vibecheck wordmark and blue full stop. Tagline: LOOK GOOD, FEEL RIGHT, BE YOU. Reconstructed as vector paths and gradients from the supplied reference.</desc>
<defs>'''+''.join(defs)+f'<path id="upper-shape" d="{top}"/><path id="lower-shape" d="{bottom}"/>'+'''</defs>
<g id="brand-symbol">
<use href="#lower-shape" fill="#def1ff"/>
<use href="#lower-shape" fill="url(#lower-blue)"/>
<use href="#lower-shape" fill="url(#lower-light)"/>
<use href="#upper-shape" fill="#bdddff"/>
<use href="#upper-shape" fill="url(#upper-blue)"/>
<use href="#upper-shape" fill="url(#upper-light)"/>
<use href="#upper-shape" fill="url(#upper-core)"/>
</g>
'''+word+'''
<circle id="full-stop" cx="1294.2" cy="352.7" r="19.35" fill="#246bff"/>
'''+tag+'\n</svg>\n'
(ROOT/'vibecheck-main.svg').write_text(svg,encoding='utf-8')
print('Created',ROOT/'vibecheck-main.svg','bytes',len(svg))
