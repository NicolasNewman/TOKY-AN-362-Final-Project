from typing import List, Dict, overload, Any, TypedDict
import json

class WordNetNodeDict(TypedDict):
    id: str
    weight: int
    polarity: float
    synonyms: List[str]

class WordNetLinksDict(TypedDict):
    source: str
    target: str
    weight: int
    polarity: float

class WordNetDict(TypedDict):
    nodes: List[WordNetNodeDict]
    links: List[WordNetLinksDict]

class Node:
    def __init__(self, value: str, polarity: float = 0):
        self.value = value
        self.polarity = polarity
        self.__polarity: List[int] = []
        self.edges: List[Edge] = []
        self.synonyms: List[str] = []

    def add_polarity(self, polarity: float):
        self.__polarity.append(polarity)
        self.polarity = round(sum(self.__polarity) / len(self.__polarity), 2)
    
    def add_edge(self, edge):
        self.edges.append(edge)
    
    def __int__(self):
        return sum(e.weight for e in self.edges)
    
    def __str__(self):
        return f'{self.value} ({round(self.polarity, 2)}, {int(self)})'
    
    def __eq__(self, b):
        return int(self) == int(b)

    def __lt__(self, b):
        return int(self) < int(b)

def get_key(a: Node | str, b: Node | str):
    if type(a) == str:
        return '-'.join(sorted([a, b]))
    return '-'.join(sorted([a.value, b.value]))

class Edge:
    def __init__(self, a: Node, b: Node):
        self.a = a
        self.b = b
        self.key = get_key(a, b)
        self.weight = 1
        self.polarity = lambda: round((a.polarity + b.polarity) / 2, 2)

    def has(self, word: str):
        return self.a == word or self.b == word
    
    def inc(self):
        self.weight += 1
        return self.weight
    
    def __int__(self):
        return self.weight
    
    def __str__(self):
        return f'{self.key}({self.weight})'
    
    def __eq__(self, b):
        return self.weight == b.weight
    
    def __lt__(self, b):
        return self.weight < b.weight


        
class WordNet:   
    def __init__(self):
        self.nodes: Dict[str, Node] = {}
        self.edges: Dict[str, Edge] = {}
    
    def __contains__(self, key: str):
        return next((key == node for node in self.nodes if key == node is True), False)
    
    def get(self, key: str):
        return self.nodes.get(key)

    @overload
    def add(self, a: Node, b: Node) -> Edge:
        ...

    @overload
    def add(self, key: str, polarity: float | Any = 0) -> Node:
        ...

    def add(self, a: Node | str, b: Node | float):
        if (isinstance(a, Node)):
            key = get_key(a, b)
            edge = self.edges.get(key)
            if (edge is None):
                edge = Edge(a, b)
                a.add_edge(edge)
                b.add_edge(edge)
                self.edges[key] = edge
            else:
                edge.inc()
            return edge
        else:
            node = self.get(a)
            if (node is None):
                node = Node(a, b)
                self.nodes[node.value] = node
                return node
            node.add_polarity(b)
            return node
    
    # TODO reverse?
    def to_dict(self):
        return {
            "nodes": sorted([
                {
                    "id": key,
                    "weight": int(node),
                    "polarity": node.polarity,
                    "synonyms": node.synonyms
                } for [key, node] in self.nodes.items()
            ], key=lambda n: n['weight'], reverse=True),
            "links": sorted([
                {
                    "source": edge.a.value,
                    "target": edge.b.value,
                    "weight": edge.weight,
                    "polarity": edge.polarity()
                } for edge in self.edges.values()
            ], key=lambda l: l['weight'], reverse=True)
        }
                        
    # def __str__(self):
    #     nodes = ','.join([f"""{{"id": "{key}","weight": {node.weight},"polarity": {round(node.polarity, 2)}}}""" for [key, node] in self.nodes.items()])
    #     edges = ','.join([f"""{{ "source": "{edge.a.value}","target": "{edge.b.value}","weight": "{edge.weight}"}}""" for edge in self.edges.values()])
    #     return f"""{{"nodes": [{nodes}],"links": [{edges}]}}"""
    
    def __repr__(self):
        nodes = ','.join([f"""{{"id": "{key}","weight": {node.weight},"polarity": {round(node.polarity, 2)}}}""" for [key, node] in self.nodes.items()])
        edges = ','.join([f"""{{ "source": "{edge.a.value}","target": "{edge.b.value}","weight": "{edge.weight}"}}""" for edge in self.edges.values()])
        return f"""{{"nodes": [{nodes}],"links": [{edges}]}}"""
    