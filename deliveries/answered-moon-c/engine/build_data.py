import json,subprocess,sys
S=json.load(open('shared/script.json')); W=json.load(open('voice/words.json'))
out={}
for k,v in S.items():
    d=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f'voice/{k}.wav']))
    dur=round(d+0.3,3)
    if 'tailTo' in v: dur=max(dur,v['tailTo'])
    ws=W[k]; toks=[w for l in v['lines'] for w in l[0].split()]
    assert len(toks)==len(ws),(k,len(toks),len(ws),toks,[w['w'] for w in ws])
    i=0; lines=[]
    for text,key in v['lines']:
        keys=[x.lower() for k2 in key.split('|') for x in k2.split()]
        words=[]
        for tok in text.split():
            words.append({'w':tok,'t0':ws[i]['t0'],'t1':ws[i]['t1'],'key':tok.lower() in keys}); i+=1
        lines.append({'words':words})
    for l in lines: l['t0']=l['words'][0]['t0']
    for j,l in enumerate(lines): l['t1']=lines[j+1]['t0'] if j+1<len(lines) else dur+1
    out[k]={'name':v['name'],'dur':dur,'voiceDur':round(d,3),'pos':v['pos'],'lines':lines,'words':ws}
    print(k,v['name'],dur)
open('shared/data.js','w').write('window.DATA='+json.dumps(out)+';\n')
