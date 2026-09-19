import build_logo as b
import numpy as np
from PIL import Image,ImageFilter
import json

allparams={}
for part,names,base in [('upper',['upper-blue','upper-light','upper-core'],[189,221,255]),('lower',['lower-blue','lower-light'],[222,241,255])]:
    mask=np.asarray(Image.open(b.ROOT/f'working/{part}-mask.png').convert('L').filter(ImageFilter.MinFilter(9)))>250
    y,x=np.where(mask)
    x=x[::7]; y=y[::7]
    target=b.im[y,x,:2]
    params=[]; colors=[]
    for name in names:
        cx,cy,rx,ry,color,opacity=b.params[name]
        params.extend([cx,cy,rx,ry,opacity])
        colors.append([int(color[1:3],16),int(color[3:5],16)])
    params=np.array(params,dtype=float)
    def error(p):
        pred=np.tile(np.array(base[:2]),(len(x),1)).astype(float)
        for i,c in enumerate(colors):
            cx,cy,rx,ry,a=p[i*5:i*5+5]
            opacity=a*np.exp(-4.5*(((x-cx)/rx)**2+((y-cy)/ry)**2))
            pred=pred*(1-opacity[:,None])+np.array(c)*opacity[:,None]
        return np.mean((pred-target)**2)
    steps=np.tile([8,8,12,12,.045],len(names)); best=error(params)
    for iteration in range(130):
        improved=False
        for j in range(len(params)):
            for direction in [1,-1]:
                test=params.copy();test[j]+=steps[j]*direction
                if j%5==4 and not 0<=test[j]<=1:continue
                if j%5 in [2,3] and not 25<=test[j]<=550:continue
                value=error(test)
                if value<best:
                    params=test; best=value; improved=True
        if not improved:steps*=.72
        if max(steps)<.04:break
    for i,name in enumerate(names):
        p=params[i*5:i*5+5]
        allparams[name]=[round(float(v),3) for v in p[:4]]+[b.params[name][4],round(float(p[4]),4)]
    print(part,'color RMSE',round(best**.5,2))
(b.ROOT/'working/gradients.json').write_text(json.dumps(allparams,indent=2))
