import json, csv
d=json.load(open('cris_result_raw.json'))
cl=d['queryResult']['crashList']
names=["Crash ID","Adj ADT","At Intersection Flag","ADT","ADT Year","City","Contributing Factors","Control Section","CS Milepoint","Crash Date","Death Count","Month","NonSusp Serious Inj","Possible Inj","Crash Severity","Susp Serious Inj","Crash Time","Total Inj","Year","Day of Week","DFO","Fatal Crash Flag","First Harmful Event","Hwy Lane Design","Hour","Intersecting Hwy Number","Intersecting Street Name","Intersection Related","Latitude","Light Condition","Located Flag","Longitude","Manner of Collision","Median Type","Entering Roads","Number of Lanes","Object Struck","On System Flag","Other Factor","Population Group","Private Drive Flag","Ref Marker","RM Offset","Road Class","Roadway Alignment","Roadway Function","Roadway Relation","Roadway Type","Rural Flag","Speed Limit","Street Name","Surface Condition","Traffic Control Type","Weather Condition"]
assert len(names)==len(cl['crashLevelFieldIds'])==54, (len(names), len(cl['crashLevelFieldIds']))
tables={t['tableName']:{ci['id']:ci['desc'] for ci in t['codeItems']} for t in cl['codeTables']}
tmap={"City":"CITY","Contributing Factors":"CONTRIB_FACTR_LIST_LKP","Crash Severity":"CR3_INJURY_SEVERITY_CD","Day of Week":"DAY_CD","First Harmful Event":"HARM_EVNT_CD","Hwy Lane Design":"HWY_DSGN_LANE_CD","Hour":"HOUR_LKP","Intersection Related":"INTRSCT_RELAT_CD","Light Condition":"LIGHT_COND_CD","Located Flag":"YES_NO_CHOICE_CD","Manner of Collision":"COLLSN_CD","Median Type":"MEDIAN_TYPE_CD","Entering Roads":"ENTR_ROAD_CD","Object Struck":"OBJ_STRUCK_CD","Other Factor":"OTHR_FACTR_CD","Population Group":"POP_GROUP_CD","Private Drive Flag":"YES_NO_CHOICE_CD","Road Class":"ROAD_CLS_CD","Roadway Alignment":"ROAD_ALGN_CD","Roadway Function":"FUNC_SYS_CD","Roadway Relation":"ROAD_RELAT_CD","Roadway Type":"ROAD_TYPE_CD","Surface Condition":"SURF_COND_CD","Traffic Control Type":"TRAFFIC_CNTL_CD","Weather Condition":"WTHR_COND_CD"}
rows=[]
for r in cl['dataList']:
    v=r['fieldValues']; row={}
    for n,x in zip(names,v):
        if n in tmap and x is not None:
            row[n]=tables[tmap[n]].get(x, f"?{x}")
        else: row[n]=x
    rows.append(row)
with open('cris_sh361_nueces_2016_2026.csv','w',newline='') as f:
    w=csv.DictWriter(f,fieldnames=names); w.writeheader(); w.writerows(rows)
print("wrote",len(rows),"rows")
# quick looks
import collections
print("YES_NO table:",tables['YES_NO_CHOICE_CD'])
print("Severity values:",collections.Counter(r['Crash Severity'] for r in rows))
print("City values:",collections.Counter(r['City'] for r in rows).most_common(8))
print("Located:",collections.Counter(r['Located Flag'] for r in rows))
print("Lat range:",min(r['Latitude'] for r in rows if r['Latitude']),max(r['Latitude'] for r in rows if r['Latitude']))
print("Lon range:",min(r['Longitude'] for r in rows if r['Longitude']),max(r['Longitude'] for r in rows if r['Longitude']))
print("DFO range:",min(r['DFO'] for r in rows if r['DFO'] is not None),max(r['DFO'] for r in rows if r['DFO'] is not None))
print("Sample intersecting streets:",collections.Counter(r['Intersecting Street Name'] for r in rows).most_common(40))
