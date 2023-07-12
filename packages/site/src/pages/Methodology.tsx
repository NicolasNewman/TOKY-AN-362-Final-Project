import React from 'react';
import { CodeBlock, dracula } from 'react-code-blocks';
import { Collapse } from 'antd';
const Methodology: React.FC = () => {
	return (
		<div className="text-left mx-[20%]">
			<div className="text-3xl mb-2 text-center">Goal</div>
			<div>
				The aim of this analysis is to understand what Japanese viewers of Studio Ghibli movies look for, and
				what influences how well received a movie is. To ascertain this, reviews from Yahoo Movies Japan were
				gathered and analyzed.
			</div>
			<div className="text-3xl mt-4 mb-2 text-center">Data Collection</div>
			<div className="flex flex-col gap-y-4">
				<div>
					To obtain the data, Apify was used to scrape reviews from Yahoo Movies Japan. Each review contained
					the following fields:
				</div>
				<CodeBlock
					text={`type Review = {
	title: string;      		 // title of the review
	reviewer: string;    	 // name of the reviewer
	rating: number;      	 // rating on a scale of 1-5
	review: string;      	 // original body of the review
	publishDate: string;  // date the review was posted
	helpful: number;      // the number of people who found the review helpful
}`}
					language="ts"
					showLineNumbers={true}
					theme={dracula}
				/>
			</div>
			<div className="text-3xl mt-4 mb-2 text-center">Preprocessing</div>
			<div>To process the data, the following steps were taken:</div>
			<div className="text-2xl mb-2 text-center">1) Translation</div>
			<div>
				Since NLP support of Japanese is lacking for Open Source tools, the reviews were translated into English
				before processing. Google's Cloud Translation v3 model was used. While modern translation models are
				much better then in the past, there are two issues to take into consideration:
				<br />
				<br />
				1. Since the subject is often ommited in Japanese, attempting to identify what "it" refers to in English
				can become increasingly difficult.
				<br />
				2. Due to there potentially being multiple synonyms when translating a word from one language to
				another, the polarity (a number in the range [-1,1] indicating how strong a word is) of the original
				word and the choosen English word can differ.
			</div>
			<div className="text-2xl mt-3 mb-2 text-center">2) Preprocessing</div>
			<div className="flex flex-col gap-y-4">
				<div>
					Following translation into English, the following standard preprocessor pipeline was utilized for
					NGRAM analysis:
				</div>
				<CodeBlock
					text={`preprocessorEN = Preprocessor()
# convert all characters to lowercase
preprocessorEN.pipe(lower_text)
# remove punctuation
preprocessorEN.pipe(remove_punct)
# remove EOL characters (line breaks, indents)
preprocessorEN.pipe(remove_eol_characters)
# remove stopwords ("the", "is", "and", etc)
preprocessorEN.pipe(remove_stopwords, args={'lang': 'en'})
# remove consecutive spaces (i.e.: "    " -> " ")
preprocessorEN.pipe(normalize_whitespace)
# lemmatize the sentences ("walking" -> "walk", "finished" -> "finish")
preprocessorEN.pipe(lambda x: ' '.join([wnl.lemmatize(word) for word in x.split()]))
# remove 3 or more consecutive words ("really really really really" -> "really", "suki suki suki suki suki" -> "suki", etc)
preprocessorEN.pipe(lambda x: re.sub(r'(?:\\s|^)((\\w+)(?:\\s+\\2){2,})(?:\\s|$)', r'\\2', x))`}
					language="python"
					showLineNumbers={true}
					theme={dracula}
				/>
			</div>
			<div className="text-2xl mt-3 mb-2 text-center">3) Sample data point</div>
			<CodeBlock
				text={`{
	'title': '思い出の一本', 
	'review': 'いつ見ても感慨深く、心に染みる', 
	'rating': 5, 
	'reviewer': 'dru********', 
	'helpful': '1', 
	'publishDate': '2022-07-04T14:40:08.000Z', 
	'movieId': 163027, // Spirited Away
	'reviewEN': 'No matter when you look at it, it is deeply emotional and touches your heart', 
	'reviewENClean': 'matter deeply emotional touch heart'
}`}
				language="json"
				showLineNumbers={true}
				theme={dracula}
			/>
			<div className="text-3xl mt-4 mb-2 text-center">Analysis Techniques</div>
			<div className="flex flex-col gap-y-4">
				<div>
					To answer the question proposed earlier, a subjective way is needed to identify similar points
					between positive and negative reviews. Two techniques to achieve this are NGRAM Analysis and Word
					Networks. While both techniques aim to solve the problem of identifying common phrases between
					groups of text, they achieve this using different techniques.
				</div>
				<div>
					Before either of these techniques can be used, the reviews first need to be sorted by sentiment.
					Luckily, that field is already provided since the source data is reviews with an associated rating
					on a scale of [1,5]. Since a rating of "3" doesn't clearly indicate a strong or negative perception
					of a movie, these reviews were not included in the analysis.
				</div>
				<CodeBlock
					text={`df = pd.read_json('../shared/src/raw.json')
# filter the data by movie
subset = df[df["movieId"].eq(movieId)]]
# extract all reviews with a rating less then or equal to 2
negative = subset[subset["rating"].le(2)]
# extract all reviews with a rating greater then or equal to 4
positive = subset[subset["rating"].ge(4)]`}
					language="python"
					showLineNumbers={true}
					theme={dracula}
				/>
			</div>
			<div className="text-2xl mt-3 mb-2 text-center">N-GRAM Analysis</div>
			<div className="flex flex-col gap-y-4">
				<div>
					An N-GRAM is a consecutive sequence of words where N indicates the number of words used. To achieve
					the best results, stopwords are removed and words should be in their lemmatized form (as explained
					in the preprocessing section). An example of a 3-Gram is for positive reviews of{' '}
					<em>Spirited Away</em>, 9 reviews mention "unique world view" while for{' '}
					<em>Howl's Moving Castle</em>, 11 negative reviews mention "professional voice actors"
				</div>
				<div>
					The main drawback of using N-GRAM Analysis for finding key points in reviews is that similar points
					can be made by different phrasing. For example, the 3-Grams of negative reviews for{' '}
					<em>Howl's Moving Castle</em>
					includes "professional voice actors", "amateur voice actors". If a particular phrasing is only used
					once or twice, it won't be counted in the final results. Due to this drawback, N-GRAM Analysis was
					only used for an initial high-level overview as it's computationally inexpensive to compute.
				</div>
			</div>
			<div className="text-2xl mt-3 mb-2 text-center">Wordnet</div>
			<div className="flex flex-col gap-y-4">
				<div>
					A Word Network (WordNet henceforth) can be thought of as a graph where each Node is a word and each
					Edge is a relation between two words. Each node additionally contained the polarity associated with
					that word.
				</div>
				<div>
					To generate a WordNet, each review was processed to identify to identify the structure. This
					included the{' '}
					<a className="text-blue-500" href="https://universaldependencies.org/u/pos/">
						Part of Speach
					</a>{' '}
					(Adjective, Noun, Verb, Adverb, etc) and the{' '}
					<a className="text-blue-500" href="https://universaldependencies.org/u/dep/">
						Syntactic Dependency
					</a>{' '}
					(adjectival modifier, clausal complement, etc). In addition, dependent words were included.
				</div>
				<div className="flex flex-col items-center w-full">
					<img
						className="max-w-[612px]"
						src="https://spacy.io/images/displacy.svg"
						alt={`Dependency graph of "This is a sentence"`}
					/>
					<div className="text-gray-400 mt-1 max-w-[612px]">
						Example of a dependency graph of the sentence "This is a sentence". Arrows indicate dependencies
						of a word and the text under an arrow is the type of dependency.
					</div>
				</div>
				<div>
					As words were identified, the following process was used to determine if the word should be added as
					a Node:
					<br />
					<br />
					1) Is the word NOT a stopword AND is either an ly adverb (i.e. Quickly) OR a PROPN, ADJ, NOUN, or
					VERB
					<br />
					2) If we are looking at positive reviews, is the word polarity greater than or equal to 0.0? Vice
					versa for negative reviews.
					<br />
					<br />
					If both conditions were met, the word as added. In addition, the child dependencies of the added
					word were gathered and if condition (1) was met, the dependent word gets added as a Node (if not
					already existing) and an edge between them is added.
				</div>
				<div>The algorithm and data structures described are implemented as follows:</div>
				<Collapse
					items={[
						{
							key: '1',
							label: 'Algorithm implementation',
							children: (
								<CodeBlock
									text={`def get_hotwords(series: pd.Series, movieId: int):
			series = series.str.lower()
			reviews = series.to_list()
			pos_tag = ['PROPN', 'ADJ', 'NOUN', 'VERB']
			pos_network = WordNet()
			neg_network = WordNet()
		
			for i,review in enumerate(reviews):
				doc = nlp(review)
				for token in doc:
					if(token.text in nlp.Defaults.stop_words or (token.pos_ not in pos_tag and not is_ly_adv(token))):
						continue
					polarity = token._.blob.polarity
					if (polarity >= 0.0):
						token_node = pos_network.add(token.lemma_, polarity)
						for child in list(token.children):
							if (child.text not in nlp.Defaults.stop_words and child.pos_ in pos_tag ):
								child_node = pos_network.add(child.lemma_, child._.blob.polarity)
								pos_network.add(token_node, child_node)
					if (polarity <= 0.0):
						token_node = neg_network.add(token.lemma_, polarity)
						for child in list(token.children):
							if (child.text not in nlp.Defaults.stop_words and child.pos_ in pos_tag ):
								child_node = neg_network.add(child.lemma_, child._.blob.polarity)
								neg_network.add(token_node, child_node)
			return [pos_network, neg_network]`}
									language="python"
									showLineNumbers={true}
									theme={dracula}
								/>
							),
						},
						{
							key: '2',
							label: 'Node implementation',
							children: (
								<CodeBlock
									text={`class Node:
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
				return int(self) < int(b)`}
									language="python"
									showLineNumbers={true}
									theme={dracula}
								/>
							),
						},
						{
							key: '3',
							label: 'Edge implementation',
							children: (
								<CodeBlock
									text={`class Edge:
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
				return self.weight < b.weight`}
									language="python"
									showLineNumbers={true}
									theme={dracula}
								/>
							),
						},
						{
							key: '4',
							label: 'WordNet implementation',
							children: (
								<CodeBlock
									text={`class WordNet:   
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
		
			def __repr__(self):
				nodes = ','.join([f"""{{"id": "{key}","weight": {node.weight},"polarity": {round(node.polarity, 2)}}}""" for [key, node] in self.nodes.items()])
				edges = ','.join([f"""{{ "source": "{edge.a.value}","target": "{edge.b.value}","weight": "{edge.weight}"}}""" for edge in self.edges.values()])
				return f"""{{"nodes": [{nodes}],"links": [{edges}]}}"""
							
							`}
									language="python"
									showLineNumbers={true}
									theme={dracula}
								/>
							),
						},
					]}
				/>
			</div>
			<div className="text-3xl mt-4 mb-2 text-center">Resources</div>
			<table className="table-auto m-4">
				<thead className="uppercase bg-gray-700 text-gray-400">
					<tr>
						<th className="px-6 py-3">Source</th>
						<th className="px-6 py-3">Purpose</th>
					</tr>
				</thead>
				<tbody>
					<tr className="border-b bg-gray-800 border-gray-700">
						<td className="px-6 py-3">Yahoo Movies Japan</td>
						<td className="px-6 py-3">Review data source</td>
					</tr>
					<tr className="border-b bg-gray-800 border-gray-700">
						<td className="px-6 py-3">Apify</td>
						<td className="px-6 py-3">Web scraping toolkit</td>
					</tr>
					<tr className="border-b bg-gray-800 border-gray-700">
						<td className="px-6 py-3">Spacy</td>
						<td className="px-6 py-3">Natural Language Processing toolkit for creating the WordNet</td>
					</tr>
					<tr className="border-b bg-gray-800 border-gray-700">
						<td className="px-6 py-3">Nivo</td>
						<td className="px-6 py-3">Data visualization library</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
};

export default Methodology;
