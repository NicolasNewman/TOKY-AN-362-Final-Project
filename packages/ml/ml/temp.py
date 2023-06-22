import json
from ml.network import WordNetDict, get_key, WordNetNodeDict, WordNet
from ml.dicts import movieIdToName
from ml.repr import CustomListDict
from typing import Any, Dict, List, TypedDict
from PyMultiDictionary import MultiDictionary

dictionary = MultiDictionary()

# Opening JSON file
fr = open('../shared/src/data_full.json', 'r')
data: dict[str, Any] = json.load(fr)

class SynDict(TypedDict):
    id: str
    node: WordNetNodeDict | None
    nodes: List[WordNetNodeDict]
    syns: Dict[str, int]


def filter_nodes(node, dict: dict[str, str]):
    cond = node['weight'] > 10
    if (not cond):
        dict[node['id']] = 1
    return cond

def filter_links(link, dict: dict[str, str]):
    cond = (dict.get(link['target']) or dict.get(link['source'])) or link['weight'] <= 2
    return not cond

def merge(wnd: WordNetDict) -> WordNetDict:
    nodes = wnd['nodes']
    links = wnd['links']

    syn_dict: Dict[str, SynDict] = {}

    for node in nodes:
        word = node['id']
        di = syn_dict.get(word)
        if di is None:
            nl = [node]
            sl = dictionary.synonym('en', word)
            sl.append(word)
            syns = {w: 1 for w in sl}
            nd = {
                id: word,
                node: node,
                nodes: nl,
                syns: syns
            }
            syn_dict[word] = nd
            if (len(syns) > 0):
                for syn in syns:
                    if not syn_dict.get(syn):
                        syn_dict[syn] = {
                            id: syn,
                            node: None,
                            nodes: nl,
                            syns: syns
                        }
        elif (di['node'] is None):
            di['node'] = node
            di['nodes'].append(node)
        else:
            print("SOMETHING WRONG")

    syn_dict = {a: b for a,b in syn_dict.items() if b['node'] is not None}

    wn = WordNet()
    syn_map = {}
    for word,sd in syn_dict.items():
        nodes = sorted(sd['nodes'], key=lambda x: x['weight'])
        n_max = nodes.pop()
        syns = []
        new_node = wn.add(n_max['id'], n_max['polarity'])

        for n in nodes:
            word = n['id']
            syn_map[n_max['id']] = [word, new_node]
            syns.append(word)

        new_node.synonyms = syns
        # syns = sorted([d for d in syn_dict.values() if sd['syns'].get(d['id'])], key=lambda x: x['node']['weight'], reverse=True)
        # mx = syns.pop(0)
        # node = wn.add(mx['node']['id'], mx['node']['polarity'])
        # node.synonyms = mx['syns']
        

def reduce(wnd: WordNetDict, isPos: bool) -> WordNetDict:
    nodes = wnd['nodes']
    links = wnd['links']

    print(f"Before: ({len(nodes)}, {len(links)})")
    nodeDict = {n['id']: n for n in nodes}

    usedNodes = {}
    usedLinks = []

    maxNodeWeight = 0
    maxLinkWeight = 0

    for link in links:
        weight = link['weight']
        polarity = link['polarity']
        source = link['source']
        target = link['target']
        if (link['source'] == link['target'] or weight < 1):
            continue
        elif ((isPos and polarity > 0.05) or (not isPos and polarity < -0.05)):
            if (not usedNodes.get(source)):
                maxNodeWeight = max(maxNodeWeight, nodeDict[source]['weight'])
                usedNodes[source] = nodeDict[source]
            if (not usedNodes.get(target)):
                maxNodeWeight = max(maxNodeWeight, nodeDict[source]['weight'])
                usedNodes[target] = nodeDict[target]
            maxLinkWeight = max(maxLinkWeight, link['weight'])
            usedLinks.append(link)

    usedNodes = list(usedNodes.values())
    print(f"After: ({len(usedNodes)}, {len(usedLinks)})")
    return {
        'nodes': sorted(usedNodes, key=lambda n: n['weight'], reverse=True),
        'maxNodeWeight': maxNodeWeight,
        'links': sorted(usedLinks, key=lambda l: l['weight'], reverse=True),
        'maxLinkWeight': maxLinkWeight,
    }

i = 0
for id in data:
    movie = data[id]
    print(f'========== {movieIdToName[int(id)]} ==========')
    posHW: WordNetDict = movie['positiveHotwords']
    newPosHW = reduce(posHW, True)
    movie['positiveHotwords'] = newPosHW

    
    print('-'*10)

    negHW: WordNetDict = movie['negativeHotwords']
    newNegHW = reduce(negHW, False)
    movie['negativeHotwords'] = newNegHW
    i += 1

fr.close()

with open('../shared/src/data.json', 'w') as writer:
    contentJSON = str(CustomListDict([f""""{movieId}": {json.dumps(d, default=str, ensure_ascii=False)}""" for [movieId, d] in data.items()]))
    writer.write(contentJSON)