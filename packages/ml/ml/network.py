from typing import List, Dict, overload, Any


class Node:
    def __init__(self, value: str, polarity: float = 0):
        self.value = value
        self.polarity = polarity
        self.edges: List[Edge] = []
    
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

def get_key(a: Node, b: Node):
    return '-'.join(sorted([a.value, b.value]))

class Edge:
    def __init__(self, a: Node, b: Node):
        self.a = a
        self.b = b
        self.key = get_key(a, b)
        self.weight = 1
    
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
            return node
    
    def to_dict(self):
        return {
            "nodes": [
                {
                    "id": key,
                    "weight": int(node),
                    "polarity": node.polarity
                } for [key, node] in self.nodes.items()
            ],
            "links": [
                {
                    "source": edge.a.value,
                    "target": edge.b.value,
                    "weight": edge.weight
                } for edge in self.edges.values()
            ]
        }
                    
    # def __str__(self):
    #     nodes = ','.join([f"""{{"id": "{key}","weight": {node.weight},"polarity": {round(node.polarity, 2)}}}""" for [key, node] in self.nodes.items()])
    #     edges = ','.join([f"""{{ "source": "{edge.a.value}","target": "{edge.b.value}","weight": "{edge.weight}"}}""" for edge in self.edges.values()])
    #     return f"""{{"nodes": [{nodes}],"links": [{edges}]}}"""
    
    def __repr__(self):
        nodes = ','.join([f"""{{"id": "{key}","weight": {node.weight},"polarity": {round(node.polarity, 2)}}}""" for [key, node] in self.nodes.items()])
        edges = ','.join([f"""{{ "source": "{edge.a.value}","target": "{edge.b.value}","weight": "{edge.weight}"}}""" for edge in self.edges.values()])
        return f"""{{"nodes": [{nodes}],"links": [{edges}]}}"""
    