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



data = []
for movieId in df["movieId"].unique():
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

    d = {
        'movieId': str(movieId),
        'reviews': subset.to_dict(orient='records'),
        'stats': {
            'avg': round(subset['rating'].mean(), 2),
            'avgStrong': round(subset[subset['rating'].ne(3)]['rating'].mean(), 2),
            'n': subset['rating'].count(),
            'nPositive': positive['rating'].count(),
            'nNegative': negative['rating'].count(),
            'nStrong': positive['rating'].count() + negative['rating'].count(),
            'nMixed': mixed['rating'].count()
        },
        'positiveNGrams': [
            {
                'n': 1,
                'data': p1
            },
            {
                'n': 2,
                'data': p2
            },
            {
                'n': 3,
                'data': p3
            },
        ],
        'negativeNGrams': [
            {
                'n': 1,
                'data': n1
            },
            {
                'n': 2,
                'data': n2
            },
            {
                'n': 3,
                'data': n3
            },
        ]
    }
    data.append(d)
    break

content = f"""
/* eslint-disable quotes */
/* eslint-disable max-len */
import {{ Data }} from './types';

export const data: Data[] = {data}
"""

with open('../shared/src/data.ts', 'w') as writer:
    writer.write(content)