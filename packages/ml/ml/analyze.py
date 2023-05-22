import pandas as pd
import nltk
import re
import json
from sklearn.feature_extraction.text import TfidfTransformer, TfidfVectorizer

# nltk.download('wordnet')

df = pd.read_json('../shared/src/raw.json')

stopwords = ["ponyo", "sosuke", "ashitaka", "ichihiro", "spirited", "chihiro", "turnip", "calcifer", "sophie", "ve", "hayao", "haku", "crayon"]
# stopwords = ["kiki", "ghibli", "miyazaki", "howl", "ponyo", "mononoke", "arrietty", "castle", "ashitaka", "totoro"]
movieIdToName = {
    163027: 'Spirited Away',
    159561: 'Mononoke',
    327529: 'Ponyo',
    335800: 'Arriety',
    240799: 'Howl\'s Moving Castle'
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
        {'ngram': ' '.join(ngram), 'occurence': occurence}
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

movieReviews = []
data = []
movieIds = []
for movieId in df["movieId"].unique():
    movieIds.append(str(movieId))
    subset = df[df["movieId"].eq(movieId)]
    negative = subset[subset["rating"].le(2)]
    positive = subset[subset["rating"].ge(4)]
    mixed = subset[subset['rating'].eq(3)]
   
    p3 = make_ngram(positive, 3, 30)
    p2 = make_ngram(positive, 2, 30)
    p1 = make_ngram(positive, 1, 30)

    n3 = make_ngram(negative, 3, 30)
    n2 = make_ngram(negative, 2, 30)
    n1 = make_ngram(negative, 1, 30)

    pos,neg,reviews = zip(*[
         [
             f"m{movieId}[{i}]" if v["rating"] > 3 else None,
             f"m{movieId}[{i}]" if v["rating"] < 3 else None,
             f"m{movieId}[{i}]"
        ] 
        for [i,v] in enumerate(subset.to_dict(orient='records'))
    ])
    pos = [x for x in list(pos) if x is not None]
    neg = [x for x in list(neg) if x is not None]
    movieReviews.append(f"const m{movieId}: Review[] = {subset.to_dict(orient='records')}")

    d = {
        'movieId': str(movieId),
        'reviews': CustomList(reviews),
        'positive': CustomList(pos),
        'negative': CustomList(neg),
        'stats': {
            'avg': round(subset['rating'].mean(), 2),
            'avgStrong': round(subset[subset['rating'].ne(3)]['rating'].mean(), 2),
            'n': subset['rating'].count(),
            'nPositive': positive['rating'].count(),
            'nNegative': negative['rating'].count(),
            'nStrong': positive['rating'].count() + negative['rating'].count(),
            'nMixed': mixed['rating'].count()
        },
        'positiveNGrams': {
            '1': p1,
            '2': p2,
            '3': p3
        },
        'negativeNGrams': {           
            '1': n1,
            '2': n2,
            '3': n3,           
        }
    }
    data.append(d)

content = f"""
/* eslint-disable quotes */
/* eslint-disable max-len */
import {{ Data, Review }} from './types';

{";".join(movieReviews)}
export type MovieId = {' | '.join(movieIds)};
export const movieIdToName: {{[key in MovieId]: string}} = {{
    163027: 'Spirited Away',
    159561: 'Princess Mononoke',
    327529: 'Ponyo',
    335800: 'Secret World of Arriety',
    240799: "Howl's Moving Castle"
}};
export const data: {{[key in MovieId]: Data}} = {CustomListDict([f"'{d['movieId']}': {d}" for d in data])}
"""

with open('../shared/src/data.ts', 'w') as writer:
    writer.write(content)