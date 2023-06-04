import pandas as pd
import nltk
import re
import json
from sklearn.feature_extraction.text import TfidfTransformer, TfidfVectorizer
import spacy
from spacy.matcher import Matcher
from spacy.tokens import Span, Token, Doc
from spacy.language import Language
from spacytextblob.spacytextblob import SpacyTextBlob
from collections import Counter
from string import punctuation
# from typing import List, Dict, overload, Any
from spacy import displacy
from ml.network import WordNet
# https://www.analyticsvidhya.com/blog/2022/03/keyword-extraction-methods-from-documents-in-nlp/
# print(spacy.prefer_gpu())

PROPN = ['hayao', 'miyazaki', 'mononoke']
@Language.component("custom_pos")
def custom_pos(doc: Doc):
    for token in doc:
        if token.text in PROPN:
            token.pos_ = 'PROPN'
    return doc


nlp = spacy.load("en_core_web_sm")
nlp_coref = spacy.load("en_coreference_web_trf")

nlp_coref.replace_listeners("transformer", "coref", ["model.tok2vec"])
nlp_coref.replace_listeners("transformer", "span_resolver", ["model.tok2vec"])

# we won't copy over the span cleaner
nlp.add_pipe("coref", source=nlp_coref)
nlp.add_pipe("span_resolver", source=nlp_coref)
nlp.add_pipe('spacytextblob')

matcher = Matcher(nlp.vocab)
patterns = [
    [{"POS": "ADJ"}, {"POS": "NOUN"}],
    [{"POS": "ADJ"}, {"POS": "VERB"}],
    [{"POS": "VERB"}, {"POS": "NOUN"}],
    [{"POS": "VERB"}, {"POS": "ADJ"}],
    [{"POS": "NOUN"}, {"POS": "ADJ"}],
    [{"POS": "NOUN"}, {"POS": "NOUN"}],
]
matcher.add('keywords', patterns)

def is_stop(token: Token):
    return token.text in nlp.Defaults.stop_words or token.text in punctuation
 
def is_ly_adv(token: Token):
    return token.pos_ == 'ADV' and token.text.endswith('ly')

def get_hotwords(series: pd.Series):
    series = series.str.lower()
    reviews = series.to_list()
    pos_tag = ['PROPN', 'ADJ', 'NOUN', 'VERB']
    pos_network = WordNet()
    neg_network = WordNet()

    for review in reviews:
        doc = nlp(review)
        for token in doc:
            if(token.text in nlp.Defaults.stop_words or (token.pos_ not in pos_tag and not is_ly_adv(token))):
                continue
            polarity = token._.blob.polarity
            if (polarity >= 0.0):
                token_node = pos_network.add(token.text, token._.blob.polarity)
                for child in list(token.children):
                    if (child.text not in nlp.Defaults.stop_words and child.pos_ in pos_tag ):
                        child_node = pos_network.add(child.text, child._.blob.polarity)
                        pos_network.add(token_node, child_node)
            if (polarity <= 0.0):
                token_node = neg_network.add(token.text, token._.blob.polarity)
                for child in list(token.children):
                    if (child.text not in nlp.Defaults.stop_words and child.pos_ in pos_tag ):
                        child_node = neg_network.add(child.text, child._.blob.polarity)
                        neg_network.add(token_node, child_node)
    return [pos_network, neg_network]


# nltk.download('wordnet')

df = pd.read_json('../shared/src/raw.json')
df = df[df.columns.drop('review')]
df = df[df.columns.drop('title')]


stopwords = []
# stopwords = ["sosuke", "ashitaka", "ichihiro", "spirited", "chihiro", "turnip", "calcifer", "sophie", "ve", "hayao", "haku", "crayon"]
# stopwords = ["kiki", "ghibli", "miyazaki", "howl", "ponyo", "mononoke", "arrietty", "castle", "ashitaka", "totoro"]
movieIdToName = {
    163027: 'Spirited Away',
    159561: 'Mononoke',
    327529: 'Ponyo',
    335800: 'Arrietty',
    240799: 'Howl\'s Moving Castle',
    150435: 'My Neighbor Totoro',
    89972: 'Kiki\'s Deliver Service',
    149868: 'Laputa: Castle in the Sky',
    89778: 'Whisper of the Heart',
    148901: 'Nausicaa of the Valley of the Wind',
    150436: 'Grave of the Fireflies',
    152271: 'Pom Poko',
    344584: 'The Wind Rises',
    151441: 'Only Yesterday',
    161722: 'My Neighbors the Yamadas',

}
movieIdToDOR = {
  89778: 1995,
  89972: 1989,
  148901: 1984,
  149868: 1986,
  150435: 1988,
  150436: 1988,
  151441: 1991,
  152271: 1994,
  159561: 1997,
  161722: 1999,
  163027: 2001,
  240799: 2004,
  327529: 2008,
  335800: 2010,
  344584: 2013
}

movieIdToIdentifier = {
    163027: 'spirited away',
    159561: 'mononoke',
    327529: 'ponyo',
    335800: 'arrietty',
    240799: 'howl',
    150435: 'totoro',
    89972: 'kiki',
    149868: 'laputa',
    89778: 'whisper',
    148901: 'nausicaa',
    150436: 'grave of the fireflies',
    152271: 'pom poko',
    344584: 'wind rises',
    151441: 'only yesterday',
    161722: 'yamadas',
}

def make_ngram(df: pd.DataFrame, pairsize = 3, cnt = 10):
    n = df["reviewENClean"].count()
    words = ''.join(str(df["reviewENClean"].to_list()))
    words = re.sub(r'[^\w\s]', '', words)
    # Replace 3 or more consecutive words 
    words = re.sub(r'(?:\s|^)((\w+)(?:\s+\2){2,})(?:\s|$)', r'\2', words).split()
    wnl = nltk.stem.WordNetLemmatizer()
    words = [wnl.lemmatize(word) for word in words if word not in stopwords]
    ngrams = (pd.Series(nltk.ngrams(words, pairsize)).value_counts())[:cnt]
    return  [
        # {'ngram': ' '.join(ngram), 'occurence': occurence}
        {'ngram': ' '.join(ngram), 'occurence': df['reviewENClean'].str.contains(' '.join(ngram)).sum()}
        for ngram,occurence in list(ngrams.items())
    ]


def tfid(df: pd.DataFrame):
    reviews = df['reviewENClean'].to_list()
    vectorizer = TfidfVectorizer(use_idf=True, ngram_range=(1, 3), stop_words=stopwords)
    fit = vectorizer.fit_transform(reviews)
    df2 = pd.DataFrame(
        fit[0].T.todense(),
        index=vectorizer.get_feature_names_out(),
        columns=["TF-IDF"]
    )
    df2 = df2.sort_values('TF-IDF', ascending=False)
    print(df2.head(25))

# Custom repr that doesn't add quotes around string values
class CustomList(list):
    def __repr__(self):
        return '[' + ', '.join([v for v in self]) + ']'
    
class CustomListDict(list):
    def __repr__(self):
        return '{' + ', '.join([v for v in self]) + '}'

class CustomDictList(dict[any, list]):
    def __repr__(self):
        return f"""
        {{
            {','.join([f'{k}: {CustomList(v)}' for k,v in self.items()])}
        }}
        """

movieReviews = []
data = []
movieIds = []
unique = df["movieId"].unique()
for i,movieId in enumerate(unique):
    print(f'Processing [{movieId}] ({i + 1}/{len(unique)})')
    movieIds.append(str(movieId))
    subset = df[df["movieId"].eq(movieId)]
    negative = subset[subset["rating"].le(2)]
    positive = subset[subset["rating"].ge(4)]
    mixed = subset[subset['rating'].eq(3)]
    strong = subset[subset['rating'].ne(3)]
    p3 = make_ngram(positive, 3, 30)
    p2 = make_ngram(positive, 2, 30)
    p1 = make_ngram(positive, 1, 30)

    n3 = make_ngram(negative, 3, 30)
    n2 = make_ngram(negative, 2, 30)
    n1 = make_ngram(negative, 1, 30)

    [pos_hw, neg_hw] = get_hotwords(positive['reviewEN'])

    years = {k: [] for k in dict.fromkeys(pd.to_datetime(subset['publishDate']).dt.year.unique())}
    strong['reviewEN'] = strong['reviewEN'].str.lower()
    d = {
        "movieId": movieId,
        "dor": movieIdToDOR[movieId],
        "reviews": subset.to_dict(orient="records"),
        "stats": {
            "avg": round(subset["rating"].mean(), 2),
            "avgStrong": round(subset[subset["rating"].ne(3)]["rating"].mean(), 2),
            "n": subset["rating"].count(),
            "nPositive": positive["rating"].count(),
            "nNegative": negative["rating"].count(),
            "nStrong": positive["rating"].count() + negative["rating"].count(),
            "nMixed": mixed["rating"].count(),
            "references": {
                "163027": strong["reviewEN"].str.contains(movieIdToIdentifier[163027]).sum(),
                "159561": strong["reviewEN"].str.contains(movieIdToIdentifier[159561]).sum(),
                "327529": strong["reviewEN"].str.contains(movieIdToIdentifier[327529]).sum(),
                "335800": strong["reviewEN"].str.contains(movieIdToIdentifier[335800]).sum(),
                "240799": strong["reviewEN"].str.contains(movieIdToIdentifier[240799]).sum(),
                "150435": strong["reviewEN"].str.contains(movieIdToIdentifier[150435]).sum(),
                "89972": strong["reviewEN"].str.contains(movieIdToIdentifier[89972]).sum(),
                "149868": strong["reviewEN"].str.contains(movieIdToIdentifier[149868]).sum(),
                "89778": strong["reviewEN"].str.contains(movieIdToIdentifier[89778]).sum(),
                "148901": strong["reviewEN"].str.contains(movieIdToIdentifier[148901]).sum(),
                "150436": strong["reviewEN"].str.contains(movieIdToIdentifier[150436]).sum(),
                "152271": strong["reviewEN"].str.contains(movieIdToIdentifier[152271]).sum(),
                "344584": strong["reviewEN"].str.contains(movieIdToIdentifier[344584]).sum(),
                "151441": strong["reviewEN"].str.contains(movieIdToIdentifier[151441]).sum(),
                "161722": strong["reviewEN"].str.contains(movieIdToIdentifier[161722]).sum()
            },
        },
        "positiveNGrams": {
            "1": p1,
            "2": p2,
            "3": p3
        },
        "positiveHotwords": pos_hw.to_dict(),
        "negativeNGrams": {           
            "1": n1,
            "2": n2,
            "3": n3,           
        },
        "negativeHotwords": neg_hw.to_dict()
    }
    d['stats']['references'][f'{movieId}'] = 0
    data.append(d)

contentJSON = str(CustomListDict([f""""{d['movieId']}": {json.dumps(d, default=str, ensure_ascii=False)}""" for d in data]))

content = f"""
/* eslint-disable quotes */
/* eslint-disable max-len */
import {{ Data, Review }} from './types';

export type MovieId = {' | '.join(movieIds)};
export const movieIdToName: {{[key in MovieId]: string}} = {{
    163027: 'Spirited Away',
    159561: 'Princess Mononoke',
    327529: 'Ponyo',
    335800: 'Secret World of Arrietty',
    240799: "Howl's Moving Castle",
    150435: 'My Neighbor Totoro',
    89972: "Kiki's Deliver Service",
    149868: 'Laputa: Castle in the Sky',
    89778: 'Whisper of the Heart',
    148901: 'Nausicaa of the Valley of the Wind',
    150436: 'Grave of the Fireflies',
    152271: 'Pom Poko',
    344584: 'The Wind Rises',
    151441: 'Only Yesterday',
    161722: 'My Neighbors the Yamadas'
}};
export const movieIdToIdentifier: {{[key in MovieId]: string}} = {{
    163027: 'spirited away',
    159561: 'mononoke',
    327529: 'ponyo',
    335800: 'arrietty',
    240799: "howl",
    150435: 'totoro',
    89972: 'kiki',
    149868: 'laputa',
    89778: 'whisper',
    148901: 'nausicaa',
    150436: 'grave of the fireflies',
    152271: 'pom poko',
    344584: 'wind rises',
    151441: 'only yesterday',
    161722: 'yamadas'
}};
"""

with open('../shared/src/data.json', 'w') as writer:
    writer.write(contentJSON)
with open('../shared/src/data.ts', 'w') as writer:
    writer.write(content)