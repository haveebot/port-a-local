import csv, collections, statistics
rows=list(csv.DictReader(open('cris_sh361_nueces_2016_2026.csv')))
def f(x):
    try: return float(x)
    except: return None
DFO_A=19.50; DFO_B=35.22   # Access Rd 1A -> PR 22
S=[]
for r in rows:
    dfo=f(r['DFO']); la=f(r['Latitude'])
    if dfo is not None: inwin = DFO_A-0.05 <= dfo <= DFO_B+0.05
    elif la is not None: inwin = 27.617 <= la <= 27.8066
    else: inwin=False
    if inwin: S.append(r)
print("STRETCH crashes (Access Rd 1A -> PR 22), 2016-2026 YTD:",len(S))
yr=collections.Counter(r['Year'] for r in S); print("by year:",dict(sorted(yr.items())))
sev=collections.Counter(r['Crash Severity'] for r in S); print("severity:",dict(sev))
fatal=[r for r in S if r['Fatal Crash Flag']=='1' or r['Crash Severity'].startswith('K')]
print("fatal crashes:",len(fatal),"deaths:",sum(int(r['Death Count'] or 0) for r in S))
print("serious-injury (A) crashes:",sum(1 for r in S if r['Crash Severity'].startswith('A')),"susp serious injuries:",sum(int(r['Susp Serious Inj'] or 0) for r in S))
print("total injuries:",sum(int(r['Total Inj'] or 0) for r in S))
print()
print("FATAL LIST (date, time, dfo, lat, lon, deaths, manner, FHE, factors, intersect, light):")
for r in sorted(fatal,key=lambda r:r['Crash Date']):
    print(f"  {r['Crash Date']} {r['Crash Time']} DFO={r['DFO']} ({r['Latitude']},{r['Longitude']}) deaths={r['Death Count']} | {r['Manner of Collision']} | {r['First Harmful Event']} | CF={r['Contributing Factors']} | OF={r['Other Factor']} | IR={r['Intersection Related']} | XSt={r['Intersecting Street Name']} | {r['Light Condition']} | SL={r['Speed Limit']} | drive={r['Private Drive Flag']}")
print()
# spatial bins by DFO mile
bins=collections.Counter(); fb=collections.Counter(); ab=collections.Counter()
for r in S:
    dfo=f(r['DFO'])
    if dfo is None: continue
    b=int(dfo)
    bins[b]+=1
    if r['Crash Severity'].startswith('K'): fb[b]+=1
    if r['Crash Severity'].startswith('A'): ab[b]+=1
print("Crashes per DFO mile bin (mile: all / fatal / serious):")
for b in sorted(bins): print(f"  DFO {b}-{b+1}: {bins[b]:3d} / {fb[b]} / {ab[b]}")
print()
print("Manner of collision:",collections.Counter(r['Manner of Collision'] for r in S).most_common(12))
print()
print("Intersection Related:",collections.Counter(r['Intersection Related'] for r in S))
print("Private Drive Flag:",collections.Counter(r['Private Drive Flag'] for r in S))
print("Roadway Relation:",collections.Counter(r['Roadway Relation'] for r in S))
print("Traffic Control:",collections.Counter(r['Traffic Control Type'] for r in S).most_common(8))
print("Light:",collections.Counter(r['Light Condition'] for r in S).most_common(6))
print("Speed limit:",collections.Counter(r['Speed Limit'] for r in S).most_common(6))
print("Median type:",collections.Counter(r['Median Type'] for r in S).most_common(4))
print("Lanes:",collections.Counter(r['Number of Lanes'] for r in S).most_common(4))
print("Hwy lane design:",collections.Counter(r['Hwy Lane Design'] for r in S).most_common(4))
print("Roadway function:",collections.Counter(r['Roadway Function'] for r in S).most_common(4))
print("Rural flag:",collections.Counter(r['Rural Flag'] for r in S))
print("ADT values (year):",collections.Counter((r['ADT'],r['ADT Year']) for r in S).most_common(12))
print()
# contributing factors: split lists
cf=collections.Counter()
for r in S:
    for part in (r['Contributing Factors'] or '').replace('; ',';').split(';'):
        p=part.strip()
        if p and p!='NONE': cf[p]+=1
print("Top contributing factors (crash-level list, split):")
for k,v in cf.most_common(20): print(f"  {v:4d} {k}")
print()
print("Month:",dict(sorted(collections.Counter(int(r['Month']) for r in S).items())))
print("Day of week:",collections.Counter(r['Day of Week'] for r in S))
# write stretch csv
with open('cris_sh361_stretch.csv','w',newline='') as fo:
    w=csv.DictWriter(fo,fieldnames=list(S[0].keys())); w.writeheader(); w.writerows(S)
