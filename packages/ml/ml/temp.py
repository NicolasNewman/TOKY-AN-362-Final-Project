import json
  
# Opening JSON file
fr = open('../shared/src/data.json', 'r')
data = json.load(fr)

for id in data:
    movie = data[id]
    movie["positiveHotwords"]["nodes"] = sorted(movie["positiveHotwords"]["nodes"], key=lambda x: x['weight'], reverse=True)
    movie["negativeHotwords"]["nodes"] = sorted(movie["negativeHotwords"]["nodes"], key=lambda x: x['weight'], reverse=True)

fr.close()

with open('../shared/src/data.json', 'w') as writer:
    writer.write(json.dumps(data, default=str, ensure_ascii=False))